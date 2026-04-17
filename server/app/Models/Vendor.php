<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vendor extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'name', 'slug', 'category', 'location',
        'description', 'since', 'status', 'rating', 'review_count',
        'img', 'tags', 'gallery', 'team',
    ];

    protected function casts(): array
    {
        return [
            'tags'    => 'array',   // JSON → PHP array otomatis
            'gallery' => 'array',
            'team'    => 'array',
            'rating'  => 'decimal:2',
        ];
    }

    // ── Relasi ──────────────────────────────────────────────

    // Vendor dimiliki oleh 1 user
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Vendor punya 3 paket (silver, gold, platinum)
    public function packages()
    {
        return $this->hasMany(Package::class);
    }

    // Vendor punya banyak booking
    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    // ── Helper ──────────────────────────────────────────────

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    // Hitung ulang rating rata-rata dari semua booking yang rated
    public function recalculateRating(): void
    {
        $bookings = $this->bookings()->whereNotNull('rating')->get();
        if ($bookings->isEmpty()) return;

        $avg   = $bookings->avg('rating');
        $count = $bookings->count();

        $this->update([
            'rating'       => round($avg, 2),
            'review_count' => $count,
        ]);
    }
}