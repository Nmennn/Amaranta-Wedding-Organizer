<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\VendorRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

// ============================================================
// VendorRequestController
//
// Vendor merespons request dari admin:
//   - confirm → booking bisa lanjut ke tech meeting
//   - reject  → admin harus pilih vendor lain
//
// PENTING: Vendor tidak bisa mengakses booking langsung.
//          Mereka hanya merespons VendorRequest yang dikirim admin.
// ============================================================
class VendorRequestController extends Controller
{
    // ── POST /api/vendor-requests/{id}/confirm ───────────────
    // Vendor menyetujui request dari admin
    public function confirm(Request $request, VendorRequest $vendorRequest): JsonResponse
    {
        $vendor = $request->user()->vendor;

        // Pastikan request ini memang untuk vendor yang login
        if (!$vendor || $vendorRequest->vendor_id !== $vendor->id) {
            return response()->json(['message' => 'Tidak diizinkan.'], 403);
        }

        if (!$vendorRequest->isPending()) {
            return response()->json([
                'message' => 'Request sudah direspons sebelumnya.',
                'status'  => $vendorRequest->status,
            ], 422);
        }

        $request->validate([
            'vendor_notes' => 'sometimes|string|max:500',
        ]);

        $vendorRequest->update([
            'status'       => 'confirmed',
            'vendor_notes' => $request->vendor_notes,
            'responded_at' => now(),
        ]);

        // Update booking: vendor_id diisi, admin_status update
        $vendorRequest->booking->update([
            'vendor_id'    => $vendorRequest->vendor_id,
            'admin_status' => 'vendor_confirmed',
            'status'       => 'confirmed',
        ]);

        return response()->json([
            'message' => 'Anda berhasil mengkonfirmasi booking ini.',
            'data'    => $vendorRequest->load('booking.customer', 'booking.package'),
        ]);
    }

    // ── POST /api/vendor-requests/{id}/reject ────────────────
    // Vendor menolak request dari admin
    // Setelah ini, admin HARUS memilih vendor lain (reassign-vendor)
    public function reject(Request $request, VendorRequest $vendorRequest): JsonResponse
    {
        $vendor = $request->user()->vendor;

        if (!$vendor || $vendorRequest->vendor_id !== $vendor->id) {
            return response()->json(['message' => 'Tidak diizinkan.'], 403);
        }

        if (!$vendorRequest->isPending()) {
            return response()->json(['message' => 'Request sudah direspons sebelumnya.'], 422);
        }

        $request->validate([
            'rejection_reason' => 'required|string|max:500',
        ]);

        $vendorRequest->update([
            'status'           => 'rejected',
            'rejection_reason' => $request->rejection_reason,
            'responded_at'     => now(),
        ]);

        // Reset booking ke waiting_vendor — admin perlu assign ulang
        $vendorRequest->booking->update([
            'admin_status' => 'vendor_rejected',
        ]);

        return response()->json([
            'message' => 'Anda menolak booking ini. Admin akan memilih vendor lain.',
        ]);
    }
}