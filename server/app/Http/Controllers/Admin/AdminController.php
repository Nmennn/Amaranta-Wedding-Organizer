<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\User;
use App\Models\Vendor;
use App\Models\VendorRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AdminController extends Controller
{
    // GET /api/admin/stats
    public function stats(): JsonResponse
    {
        return response()->json([
            'data' => [
                'total_vendors'         => Vendor::where('status', 'approved')->count(),
                'pending_vendors'       => Vendor::where('status', 'pending')->count(),
                'total_users'           => User::count(),
                'total_bookings'        => Booking::count(),
                'active_bookings'       => Booking::whereIn('status', ['pending', 'confirmed'])->count(),
                'total_revenue'         => Booking::where('status', 'completed')->sum('total_price'),
                'total_dp'              => Booking::whereNotNull('dp_paid_at')->sum('dp_amount'),
                // Workflow stats baru
                'need_vendor'           => Booking::where('admin_status', 'waiting_vendor')->count(),
                'vendor_rejected'       => Booking::where('admin_status', 'vendor_rejected')->count(),
                'in_preparation'        => Booking::where('admin_status', 'preparation')->count(),
                'dp_failed'             => Booking::where('admin_status', 'dp_failed')->count(),
                'pending_vendor_requests' => VendorRequest::where('status', 'pending')->count(),
            ],
        ]);
    }

    // GET /api/admin/users
    public function users(Request $request): JsonResponse
    {
        $users = User::query()
            ->when($request->role,   fn($q, $v) => $q->where('role', $v))
            ->when($request->search, fn($q, $s) => $q->where('name', 'like', "%{$s}%")->orWhere('email', 'like', "%{$s}%"))
            ->latest()
            ->paginate(20);
        return response()->json($users);
    }

    // DELETE /api/admin/users/{id}
    public function deleteUser(User $user): JsonResponse
    {
        if ($user->isAdmin()) {
            return response()->json(['message' => 'Tidak bisa hapus akun admin.'], 422);
        }
        $user->delete();
        return response()->json(['message' => 'Pengguna berhasil dihapus.']);
    }

    // GET /api/admin/vendors
    public function vendors(Request $request): JsonResponse
    {
        $vendors = Vendor::with('user', 'packages')
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->when($request->search, fn($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->latest()
            ->paginate(20);
        return response()->json($vendors);
    }

    public function approveVendor(Vendor $vendor): JsonResponse
    {
        $vendor->update(['status' => 'approved']);
        return response()->json(['message' => 'Vendor disetujui.', 'data' => $vendor]);
    }

    public function rejectVendor(Vendor $vendor): JsonResponse
    {
        $vendor->update(['status' => 'rejected']);
        return response()->json(['message' => 'Vendor ditolak.', 'data' => $vendor]);
    }

    public function deleteVendor(Vendor $vendor): JsonResponse
    {
        $vendor->delete();
        return response()->json(['message' => 'Vendor dihapus.']);
    }

    // GET /api/admin/bookings — dengan filter admin_status (baru)
    public function bookings(Request $request): JsonResponse
    {
        $bookings = Booking::with(['customer', 'vendor', 'package',
                                   'vendorRequests.vendor', 'payments'])
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            // Filter baru berdasarkan workflow admin
            ->when($request->admin_status, fn($q, $s) => $q->where('admin_status', $s))
            ->when($request->search, function ($q, $s) {
                $q->where('order_id', 'like', "%{$s}%")
                  ->orWhere('pemesan_name', 'like', "%{$s}%")
                  ->orWhere('pemesan_email', 'like', "%{$s}%");
            })
            ->when($request->date_from, fn($q, $d) => $q->where('wedding_date', '>=', $d))
            ->when($request->date_to,   fn($q, $d) => $q->where('wedding_date', '<=', $d))
            ->latest()
            ->paginate(20);

        return response()->json($bookings);
    }
}