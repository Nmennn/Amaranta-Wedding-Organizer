<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Package;
use App\Models\Payment;
use App\Models\VendorRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Midtrans\Config as MidtransConfig;
use Midtrans\Snap;

class BookingController extends Controller
{
    public function __construct()
    {
        MidtransConfig::$serverKey    = config('services.midtrans.server_key');
        MidtransConfig::$isProduction = config('services.midtrans.is_production');
        MidtransConfig::$isSanitized  = config('services.midtrans.is_sanitized');
        MidtransConfig::$is3ds        = config('services.midtrans.is_3ds');
    }

    // GET /api/bookings/my
    public function my(Request $request): JsonResponse
    {
        $bookings = Booking::with(['package', 'vendor', 'payments', 'vendorRequests.vendor'])
            ->where('customer_id', $request->user()->id)
            ->latest()
            ->get();
        return response()->json(['data' => $bookings]);
    }

    // GET /api/bookings/{id}
    public function show(Request $request, Booking $booking): JsonResponse
    {
        $user = $request->user();
        if (!$user->isAdmin()
            && $booking->customer_id !== $user->id
            && $booking->vendor?->user_id !== $user->id) {
            return response()->json(['message' => 'Tidak diizinkan.'], 403);
        }
        return response()->json([
            'data' => $booking->load(['customer', 'vendor', 'package', 'payments', 'vendorRequests.vendor']),
        ]);
    }

    // POST /api/bookings
    // PERUBAHAN: vendor_id = null (dipilih admin), tambah location & konsep
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            // Terima package_id (ID numerik) ATAU tier_id (silver/gold/platinum)
            'package_id'    => 'required_without:tier_id|nullable|exists:packages,id',
            'tier_id'       => 'required_without:package_id|nullable|in:silver,gold,platinum',
            'pemesan_name'  => 'required|string|max:255',
            'pemesan_email' => 'required|email',
            'pemesan_phone' => 'required|string|regex:/^08\d{8,11}$/',
            'wedding_date'  => 'required|date|after:today',
            'location'      => 'required|string|max:255',
            'konsep'        => 'required|string|max:255',
            'notes'         => 'sometimes|nullable|string',
        ]);

        // Cari package by ID atau by tier_id
        if ($request->package_id) {
            $package = Package::findOrFail($request->package_id);
        } else {
            $package = Package::where('tier_id', $request->tier_id)
                              ->where('is_active', true)
                              ->firstOrFail();
        }
        $dp      = (int) round($package->price * 0.3);

        $booking = Booking::create([
            'order_id'      => Booking::generateOrderId(),
            'customer_id'   => $request->user()->id,
            'vendor_id'     => null,
            'package_id'    => $package->id,
            'pemesan_name'  => $request->pemesan_name,
            'pemesan_email' => $request->pemesan_email,
            'pemesan_phone' => $request->pemesan_phone,
            'wedding_date'  => $request->wedding_date,
            'location'      => $request->location,
            'konsep'        => $request->konsep,
            'notes'         => $request->notes,
            'total_price'   => $package->price,
            'dp_amount'     => $dp,
            'status'        => 'pending',
            'phase'         => 'pending',
            'admin_status'  => 'waiting_dp',
        ]);

        return response()->json([
            'message' => 'Booking berhasil dibuat. Lanjutkan pembayaran DP.',
            'data'    => $booking->load('package'),
        ], 201);
    }

    // POST /api/bookings/{id}/pay-dp
    // ATURAN: Jika DP gagal → admin_status = dp_failed, tidak diproses
    public function payDP(Request $request, Booking $booking): JsonResponse
    {
        if ($booking->customer_id !== $request->user()->id) {
            return response()->json(['message' => 'Tidak diizinkan.'], 403);
        }
        if ($booking->isDpPaid()) {
            return response()->json(['message' => 'DP sudah dibayar.'], 422);
        }

        $booking->payments()->where('type', 'dp')->where('status', 'pending')->update(['status' => 'expired']);

        $snapToken = Snap::getSnapToken([
            'transaction_details' => [
                'order_id'     => $booking->order_id . '-DP-' . time(),
                'gross_amount' => $booking->dp_amount,
            ],
            'customer_details' => [
                'first_name' => $booking->pemesan_name,
                'email'      => $booking->pemesan_email,
                'phone'      => $booking->pemesan_phone,
            ],
            'item_details' => [[
                'id' => 'dp-' . $booking->id, 'price' => $booking->dp_amount,
                'quantity' => 1, 'name' => 'DP Booking ' . $booking->order_id,
            ]],
        ]);

        Payment::create([
            'booking_id' => $booking->id, 'type' => 'dp',
            'amount' => $booking->dp_amount, 'status' => 'pending',
            'snap_token' => $snapToken,
        ]);

        return response()->json([
            'snap_token' => $snapToken,
            'client_key' => config('services.midtrans.client_key'),
            'amount'     => $booking->dp_amount,
        ]);
    }

    // POST /api/bookings/{id}/pay-full
    // ATURAN: Wajib lunas sebelum acara dieksekusi + vendor harus confirmed
    public function payFull(Request $request, Booking $booking): JsonResponse
    {
        if ($booking->customer_id !== $request->user()->id) {
            return response()->json(['message' => 'Tidak diizinkan.'], 403);
        }
        if (!$booking->isDpPaid()) {
            return response()->json(['message' => 'DP belum dibayar.'], 422);
        }
        if ($booking->isFullPaid()) {
            return response()->json(['message' => 'Pembayaran sudah lunas.'], 422);
        }
        if (!$booking->vendorRequests()->where('status', 'confirmed')->exists()) {
            return response()->json([
                'message' => 'Pelunasan belum bisa dilakukan. Tunggu konfirmasi vendor dari admin.',
            ], 422);
        }

        $sisa      = $booking->total_price - $booking->dp_amount;
        $snapToken = Snap::getSnapToken([
            'transaction_details' => [
                'order_id' => $booking->order_id . '-FULL-' . time(),
                'gross_amount' => $sisa,
            ],
            'customer_details' => [
                'first_name' => $booking->pemesan_name,
                'email'      => $booking->pemesan_email,
                'phone'      => $booking->pemesan_phone,
            ],
            'item_details' => [[
                'id' => 'full-' . $booking->id, 'price' => $sisa,
                'quantity' => 1, 'name' => 'Pelunasan ' . $booking->order_id,
            ]],
        ]);

        Payment::create([
            'booking_id' => $booking->id, 'type' => 'full',
            'amount' => $sisa, 'status' => 'pending',
            'snap_token' => $snapToken,
        ]);

        return response()->json([
            'snap_token' => $snapToken,
            'client_key' => config('services.midtrans.client_key'),
            'amount'     => $sisa,
        ]);
    }

    // POST /api/bookings/{id}/rate
    public function rate(Request $request, Booking $booking): JsonResponse
    {
        if ($booking->customer_id !== $request->user()->id) {
            return response()->json(['message' => 'Tidak diizinkan.'], 403);
        }
        if (!$booking->isFullPaid()) {
            return response()->json(['message' => 'Belum bisa memberi rating sebelum lunas.'], 422);
        }
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'review' => 'sometimes|string|max:1000',
        ]);
        $booking->update([
            'rating' => $request->rating, 'review' => $request->review,
            'rated_at' => now(), 'phase' => 'rated', 'status' => 'completed',
        ]);
        $booking->vendor?->recalculateRating();
        return response()->json(['message' => 'Rating berhasil dikirim.']);
    }

    // GET /api/bookings/vendor
    // Vendor melihat vendor_requests yang masuk ke mereka (bukan seluruh bookings)
    public function vendorInbox(Request $request): JsonResponse
    {
        $vendor = $request->user()->vendor;
        if (!$vendor) {
            return response()->json(['message' => 'Profil vendor tidak ditemukan.'], 404);
        }
        $requests = VendorRequest::with(['booking.customer', 'booking.package', 'assignedBy'])
            ->where('vendor_id', $vendor->id)
            ->latest()
            ->get();
        return response()->json(['data' => $requests]);
    }

    // POST /api/payment/notify — Webhook Midtrans
    public function midtransNotify(Request $request): JsonResponse
    {
        $notif   = new \Midtrans\Notification();
        $orderId = $notif->order_id;
        $status  = $notif->transaction_status;
        $type    = $notif->payment_type;

        preg_match('/^(AMRT-[A-Z0-9]+)-(DP|FULL)-/', $orderId, $m);
        if (empty($m)) return response()->json(['ok' => false]);

        $booking = Booking::where('order_id', $m[1])->first();
        if (!$booking) return response()->json(['ok' => false]);

        $paymentType = strtolower($m[2]);
        $payment = Payment::where('booking_id', $booking->id)
                          ->where('type', $paymentType)
                          ->where('status', 'pending')
                          ->latest()->first();

        if (in_array($status, ['settlement', 'capture'])) {
            $payment?->update([
                'status' => 'success', 'payment_type' => $type,
                'transaction_id' => $notif->transaction_id,
                'paid_at' => now(), 'midtrans_response' => (array) $notif,
            ]);

            if ($paymentType === 'dp') {
                $booking->update([
                    'phase' => 'dp_paid', 'dp_paid_at' => now(),
                    'payment_method' => $type, 'status' => 'confirmed',
                    'admin_status' => 'waiting_vendor',
                ]);
            } else {
                $booking->update([
                    'phase' => 'pelunasan', 'full_paid_at' => now(),
                    'admin_status' => 'preparation',
                ]);
            }
        } elseif (in_array($status, ['cancel', 'deny', 'expire'])) {
            $payment?->update(['status' => 'failed']);
            if ($paymentType === 'dp') {
                $booking->update(['admin_status' => 'dp_failed', 'phase' => 'pending']);
            }
        }

        return response()->json(['ok' => true]);
    }
}