<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Cek apakah user yang login punya role yang dibutuhkan.
     *
     * Cara pakai di routes/api.php:
     *   Route::middleware('role:admin')
     *   Route::middleware('role:admin,vendor')   <- boleh salah satu
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Tidak terautentikasi.'], 401);
        }

        if (! in_array($user->role, $roles)) {
            return response()->json([
                'message' => 'Akses ditolak. Role "' . $user->role . '" tidak diizinkan untuk endpoint ini.',
            ], 403);
        }

        return $next($request);
    }
}