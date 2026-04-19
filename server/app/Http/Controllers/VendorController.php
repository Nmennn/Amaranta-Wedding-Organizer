<?php

namespace App\Http\Controllers;

use App\Models\Vendor;
use App\Models\Package;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class VendorController extends Controller
{
    // GET /api/vendors — daftar semua vendor yang approved
    public function index(Request $request): JsonResponse
    {
        $query = Vendor::with('packages')
            ->where('status', 'approved');

        // Filter kategori
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        // Search nama/lokasi
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }

        // Sorting
        $sort = $request->get('sort', 'rating');
        match ($sort) {
            'price_asc'  => $query->orderByRaw('(SELECT MIN(price) FROM packages WHERE vendor_id = vendors.id) ASC'),
            'price_desc' => $query->orderByRaw('(SELECT MIN(price) FROM packages WHERE vendor_id = vendors.id) DESC'),
            'name'       => $query->orderBy('name'),
            default      => $query->orderByDesc('rating'),
        };

        $vendors = $query->paginate($request->get('per_page', 12));

        return response()->json($vendors);
    }

    // GET /api/vendors/{id} atau GET /api/vendors/slug/{slug}
    public function show(Vendor $vendor): JsonResponse
    {
        if ($vendor->status !== 'approved') {
            return response()->json(['message' => 'Vendor tidak ditemukan.'], 404);
        }

        return response()->json([
            'data' => $vendor->load('packages', 'user'),
        ]);
    }

    public function showBySlug(string $slug): JsonResponse
    {
        $vendor = Vendor::with('packages')
            ->where('slug', $slug)
            ->where('status', 'approved')
            ->firstOrFail();

        return response()->json(['data' => $vendor]);
    }

    // GET /api/vendors/my — vendor milik user yang login
    public function my(Request $request): JsonResponse
    {
        $vendor = $request->user()->vendor()->with('packages', 'bookings')->first();

        if (!$vendor) {
            return response()->json(['message' => 'Anda belum punya profil vendor.'], 404);
        }

        return response()->json(['data' => $vendor]);
    }

    // PUT /api/vendors/{id} — update vendor (oleh vendor pemilik atau admin)
    public function update(Request $request, Vendor $vendor): JsonResponse
    {
        $user = $request->user();

        // Hanya pemilik vendor atau admin yang bisa update
        if (!$user->isAdmin() && $vendor->user_id !== $user->id) {
            return response()->json(['message' => 'Tidak diizinkan.'], 403);
        }

        $request->validate([
            'name'        => 'sometimes|string|max:255',
            'category'    => 'sometimes|string',
            'location'    => 'sometimes|string',
            'description' => 'sometimes|string',
            'since'       => 'sometimes|integer|min:1900|max:' . date('Y'),
        ]);

        $data = $request->only(['name', 'category', 'location', 'description', 'since']);

        // Update slug jika nama berubah
        if (isset($data['name'])) {
            $data['slug'] = Str::slug($data['name'] . '-' . $vendor->id);
        }

        $vendor->update($data);

        return response()->json([
            'message' => 'Vendor berhasil diperbarui.',
            'data'    => $vendor->fresh(),
        ]);
    }

    // PUT /api/vendors/{id}/packages/{tierId} — update harga paket
    public function updatePackagePrice(Request $request, Vendor $vendor, string $tierId): JsonResponse
    {
        $user = $request->user();

        if (!$user->isAdmin() && $vendor->user_id !== $user->id) {
            return response()->json(['message' => 'Tidak diizinkan.'], 403);
        }

        $request->validate([
            'price'     => 'required|integer|min:1000000',
            'is_active' => 'sometimes|boolean',
        ]);

        $package = Package::where('vendor_id', $vendor->id)
            ->where('tier_id', $tierId)
            ->firstOrFail();

        $package->update($request->only(['price', 'is_active']));

        return response()->json([
            'message' => 'Harga paket berhasil diperbarui.',
            'data'    => $package,
        ]);
    }
}