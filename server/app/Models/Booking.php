<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

// ============================================================
// app/Models/Booking.php — Full Fix
// BUG FIX:
//   1. isDpPaid()   — memeriksa payment type 'dp' DAN 'dp30'
//   2. isFullPaid() — memeriksa payment type 'full' yang success
//                     (tidak lagi berdasarkan full_paid_at saja)
//   3. getSisaAttribute() — hitung sisa dari dp yang BENAR-BENAR dibayar
//   4. canAdminProcess() — cek isDpPaid() ATAU isFullPaid()
// ============================================================

class Booking extends Model
{
    protected $fillable = [
        'order_id', 'customer_id', 'vendor_id', 'package_id',
        'pemesan_name', 'pemesan_email', 'pemesan_phone',
        'wedding_date', 'notes',
        'total_price', 'dp_amount', 'dp_paid_at', 'full_paid_at',
        'status', 'phase',
        'payment_method', 'midtrans_order_id',
        'rating', 'review', 'rated_at',
        'location', 'konsep',
        'admin_status', 'admin_notes', 'vendor_assigned_at',
        'tech_meeting_at', 'tech_meeting_location',
        'tech_meeting_notes', 'tech_meeting_confirmed',
        'preparation_progress',
    ];

    protected function casts(): array
    {
        return [
            'wedding_date'           => 'date',
            'dp_paid_at'             => 'datetime',
            'full_paid_at'           => 'datetime',
            'rated_at'               => 'datetime',
            'vendor_assigned_at'     => 'datetime',
            'tech_meeting_at'        => 'datetime',
            'tech_meeting_confirmed' => 'boolean',
            'total_price'            => 'integer',
            'dp_amount'              => 'integer',
            'preparation_progress'   => 'integer',
            'customer_id'            => 'integer',
            'vendor_id'              => 'integer',
            'package_id'             => 'integer',
        ];
    }

    // ── Relasi ────────────────────────────────────────────────
    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    public function package()
    {
        return $this->belongsTo(Package::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function vendorRequests()
    {
        return $this->hasMany(VendorRequest::class);
    }

    public function activeVendorRequest()
    {
        return $this->hasOne(VendorRequest::class)
                    ->whereIn('status', ['pending', 'confirmed'])
                    ->latest();
    }

    // ── Accessor: sisa pembayaran ──────────────────────────────
    // BUG FIX: hitung dari DP yang benar-benar dibayar, bukan dp_amount
    // (karena ada kasus dp_amount di DB beda dengan yang dibayar karena pembulatan)
    public function getSisaAttribute(): int
    {
        $dpPaid = $this->payments()
            ->whereIn('type', ['dp', 'dp30'])
            ->where('status', 'success')
            ->sum('amount');

        // Jika belum ada DP sukses, pakai dp_amount dari kolom
        if ($dpPaid === 0) {
            return $this->total_price - $this->dp_amount;
        }

        return $this->total_price - $dpPaid;
    }

    // ── Helper: cek status bayar ───────────────────────────────

    // BUG FIX: isDpPaid() memeriksa KEDUANYA 'dp' dan 'dp30'
    // Sistem legacy pakai 'dp', sistem baru pakai 'dp30'
    public function isDpPaid(): bool
    {
        return $this->payments()
            ->whereIn('type', ['dp', 'dp30'])
            ->where('status', 'success')
            ->exists();
    }

    // BUG FIX: isFullPaid() memeriksa payment type 'full' yang success
    // Sebelumnya hanya cek full_paid_at yang bisa null walau pembayaran sudah sukses
    // (jika webhook Midtrans lambat)
    public function isFullPaid(): bool
    {
        return $this->payments()
            ->where('type', 'full')
            ->where('status', 'success')
            ->exists();
    }

    public function canExecuteEvent(): bool
    {
        return $this->isFullPaid()
            && $this->vendor_id !== null
            && $this->vendorRequests()->where('status', 'confirmed')->exists();
    }

    // BUG FIX: admin bisa proses booking jika DP ATAU full sudah dibayar
    public function canAdminProcess(): bool
    {
        return $this->isDpPaid() || $this->isFullPaid();
    }

    // ── Static: generate order ID unik ────────────────────────
    public static function generateOrderId(): string
    {
        do {
            $id = 'AMRT-' . strtoupper(substr(uniqid(), -8));
        } while (static::where('order_id', $id)->exists());

        return $id;
    }
}