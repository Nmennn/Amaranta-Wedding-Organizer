<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

// ============================================================
// Model: VendorRequest
// Merepresentasikan satu permintaan dari admin ke vendor
// untuk menangani sebuah booking.
// ============================================================
class VendorRequest extends Model
{
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