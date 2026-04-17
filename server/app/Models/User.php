<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    // Kolom yang boleh diisi (mass assignment)
    protected $fillable = [
        'name',
        'username',
        'email',
        'phone',
        'password',
        'role',
        'email_verified_at',
        'is_active',
    ];

    // Kolom yang disembunyikan dari JSON response
    protected $hidden = [
        'password',
        'remember_token',
    ];

    // Cast tipe data otomatis
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',   // otomatis bcrypt saat set
            'is_active'         => 'boolean',
        ];
    }

    // ── Relasi ────────────────────────────────────────────

    // User bisa punya 1 vendor (jika role = vendor)
    public function vendor()
    {
        return $this->hasOne(Vendor::class);
    }

    // User bisa punya banyak booking (jika role = customer)
    public function bookings()
    {
        return $this->hasMany(Booking::class, 'customer_id');
    }

    // ── Helper ────────────────────────────────────────────

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isVendor(): bool
    {
        return $this->role === 'vendor';
    }

    public function isCustomer(): bool
    {
        return $this->role === 'customer';
    }

    public function isVerified(): bool
    {
        return !is_null($this->email_verified_at);
    }
}