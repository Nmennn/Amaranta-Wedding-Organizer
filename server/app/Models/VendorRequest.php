<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

// ============================================================
// BUG FIX: File asli server\app\Models\VendorRequest.php
// menggunakan "class Vendor" bukan "class VendorRequest"
// — ini akan menyebabkan class conflict dengan Vendor.php
//   dan semua operasi VendorRequest (confirm/reject/assign)
//   akan crash dengan PHP fatal error.
// ============================================================

class VendorRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'vendor_id',
        'assigned_by',
        'status',
        'rejection_reason',
        'vendor_notes',
        'responded_at',
    ];
    protected function casts(): array
    {
        return [
            'responded_at' => 'datetime',
            'booking_id'   => 'integer',
            'vendor_id'    => 'integer',
            'assigned_by'  => 'integer',
        ];
    }

    // ── Relasi ──────────────────────────────────────────────
    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    public function assignedBy()
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    // ── Helper ──────────────────────────────────────────────
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isConfirmed(): bool
    {
        return $this->status === 'confirmed';
    }

    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }
}