<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Vendor;
use App\Models\VendorRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

// ============================================================
// AdminBookingWorkflowController
//
// Mengelola alur kerja admin sebagai Wedding Organizer:
//   1. assignVendor       — pilih vendor untuk booking
//   2. setTechMeeting     — jadwalkan tech meeting
//   3. confirmTechMeeting — tandai tech meeting sudah terlaksana
//   4. updatePreparation  — update progress persiapan (0-100%)
//   5. markEventExecuted  — tandai acara sudah berjalan
//              (hanya bisa jika full payment lunas)
// ============================================================
class BookingWorkflowController extends Controller
{
    // ── PATCH /api/admin/bookings/{id}/assign-vendor ─────────
    // Admin memilih vendor untuk menangani booking ini
    //
    // Business rules:
    //   - Booking harus sudah bayar DP (admin_status = waiting_vendor)
    //   - Tidak bisa assign jika sudah ada request yang confirmed
    //   - Jika vendor sebelumnya rejected → boleh assign vendor baru
    public function assignVendor(Request $request, Booking $booking): JsonResponse
    {
        if (!$booking->canAdminProcess()) {
            return response()->json([
                'message' => 'Booking belum bisa diproses. DP harus dibayar terlebih dahulu.',
                'admin_status' => $booking->admin_status,
            ], 422);
        }

        // Cek apakah sudah ada vendor yang confirmed
        if ($booking->vendorRequests()->where('status', 'confirmed')->exists()) {
            return response()->json([
                'message' => 'Vendor sudah dikonfirmasi untuk booking ini.',
            ], 422);
        }

        $request->validate([
            'vendor_id'  => 'required|exists:vendors,id',
            'admin_notes' => 'sometimes|string',
        ]);

        $vendor = Vendor::findOrFail($request->vendor_id);

        if (!$vendor->isApproved()) {
            return response()->json(['message' => 'Vendor belum disetujui platform.'], 422);
        }

        // Batalkan request pending sebelumnya (jika ada)
        $booking->vendorRequests()->where('status', 'pending')->update(['status' => 'rejected', 'rejection_reason' => 'Diganti oleh admin']);

        // Buat vendor request baru
        $vendorRequest = VendorRequest::create([
            'booking_id'  => $booking->id,
            'vendor_id'   => $request->vendor_id,
            'assigned_by' => $request->user()->id,
            'status'      => 'pending',
        ]);

        // Update booking
        $booking->update([
            'admin_status'      => 'vendor_assigned',
            'vendor_assigned_at' => now(),
            'admin_notes'       => $request->admin_notes ?? $booking->admin_notes,
        ]);

        return response()->json([
            'message' => 'Vendor berhasil di-assign. Menunggu konfirmasi vendor.',
            'data'    => $vendorRequest->load('vendor'),
        ]);
    }

    // ── PATCH /api/admin/bookings/{id}/reassign-vendor ───────
    // Admin memilih vendor lain setelah vendor sebelumnya menolak
    public function reassignVendor(Request $request, Booking $booking): JsonResponse
    {
        // Pastikan ada request yang rejected (vendor menolak)
        $lastRequest = $booking->vendorRequests()->latest()->first();
        if (!$lastRequest || $lastRequest->status !== 'rejected') {
            return response()->json([
                'message' => 'Tidak ada penolakan vendor. Gunakan assign-vendor untuk assignment pertama.',
            ], 422);
        }

        $request->validate([
            'vendor_id'   => 'required|exists:vendors,id',
            'admin_notes' => 'sometimes|string',
        ]);

        $vendor = Vendor::findOrFail($request->vendor_id);
        if (!$vendor->isApproved()) {
            return response()->json(['message' => 'Vendor belum disetujui platform.'], 422);
        }

        // Buat request baru ke vendor lain
        $newRequest = VendorRequest::create([
            'booking_id'  => $booking->id,
            'vendor_id'   => $request->vendor_id,
            'assigned_by' => $request->user()->id,
            'status'      => 'pending',
        ]);

        $booking->update([
            'admin_status' => 'vendor_assigned',
            'admin_notes'  => $request->admin_notes ?? $booking->admin_notes,
        ]);

        return response()->json([
            'message' => 'Vendor baru berhasil di-assign. Menunggu konfirmasi.',
            'data'    => $newRequest->load('vendor'),
        ]);
    }

    // ── POST /api/admin/bookings/{id}/tech-meeting ───────────
    // Admin menjadwalkan tech meeting
    // Dihadiri: admin + customer + vendor
    public function setTechMeeting(Request $request, Booking $booking): JsonResponse
    {
        // Vendor harus sudah confirmed dulu
        if (!$booking->vendorRequests()->where('status', 'confirmed')->exists()) {
            return response()->json([
                'message' => 'Tech meeting baru bisa dijadwalkan setelah vendor mengkonfirmasi.',
            ], 422);
        }

        $request->validate([
            'tech_meeting_at'       => 'required|date|after:now',
            'tech_meeting_location' => 'required|string|max:255',
            'tech_meeting_notes'    => 'sometimes|string',
        ]);

        $booking->update([
            'tech_meeting_at'       => $request->tech_meeting_at,
            'tech_meeting_location' => $request->tech_meeting_location,
            'tech_meeting_notes'    => $request->tech_meeting_notes,
            'tech_meeting_confirmed' => false,
            'admin_status'          => 'tech_meeting_scheduled',
        ]);

        return response()->json([
            'message' => 'Tech meeting berhasil dijadwalkan.',
            'data'    => $booking->fresh(),
        ]);
    }

    // ── PATCH /api/admin/bookings/{id}/confirm-tech-meeting ──
    // Admin menandai tech meeting sudah terlaksana
    public function confirmTechMeeting(Request $request, Booking $booking): JsonResponse
    {
        $request->validate([
            'tech_meeting_notes' => 'sometimes|string',
        ]);

        $booking->update([
            'tech_meeting_confirmed' => true,
            'tech_meeting_notes'     => $request->tech_meeting_notes ?? $booking->tech_meeting_notes,
            'admin_status'           => 'preparation',
        ]);

        return response()->json(['message' => 'Tech meeting dikonfirmasi. Persiapan dimulai.']);
    }

    // ── PATCH /api/admin/bookings/{id}/preparation ───────────
    // Admin meng-update progress persiapan (0-100%)
    public function updatePreparation(Request $request, Booking $booking): JsonResponse
    {
        $request->validate([
            'preparation_progress' => 'required|integer|min:0|max:100',
            'admin_notes'          => 'sometimes|string',
        ]);

        $booking->update([
            'preparation_progress' => $request->preparation_progress,
            'admin_notes'          => $request->admin_notes ?? $booking->admin_notes,
        ]);

        return response()->json([
            'message' => 'Progress persiapan diperbarui: ' . $request->preparation_progress . '%',
            'data'    => $booking->only(['preparation_progress', 'admin_notes']),
        ]);
    }

    // ── PATCH /api/admin/bookings/{id}/execute-event ─────────
    // Admin menandai acara siap dieksekusi / sudah berjalan
    //
    // ATURAN KERAS: Full payment harus sudah lunas
    public function markEventExecuted(Request $request, Booking $booking): JsonResponse
    {
        // GUARD: Full payment wajib lunas
        if (!$booking->isFullPaid()) {
            return response()->json([
                'message' => 'Acara tidak bisa dieksekusi. Full payment belum dilunasi customer.',
                'sisa'    => $booking->sisa,
            ], 422);
        }

        // GUARD: Vendor harus confirmed
        if (!$booking->canExecuteEvent()) {
            return response()->json([
                'message' => 'Vendor belum mengkonfirmasi. Acara tidak bisa dieksekusi.',
            ], 422);
        }

        $booking->update([
            'phase'                => 'in_event',
            'admin_status'         => 'in_event',
            'preparation_progress' => 100,
        ]);

        return response()->json(['message' => 'Acara ditandai sebagai sedang berjalan.']);
    }
}