<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
        ];
    }

    public function customer()   { return $this->belongsTo(User::class, 'customer_id'); }
    public function vendor()     { return $this->belongsTo(Vendor::class); }
    public function package()    { return $this->belongsTo(Package::class); }
    public function payments()   { return $this->hasMany(Payment::class); }

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

    public function getSisaAttribute(): int
    {
        return $this->total_price - $this->dp_amount;
    }

    public function isDpPaid(): bool
    {
        return $this->payments()->whereIn('type', ['dp', 'dp30'])->where('status', 'success')->exists();
    }

    public function isFullPaid(): bool
    {
        return $this->payments()->where('type', 'full')->where('status', 'success')->exists();
    }

    public function canExecuteEvent(): bool
    {
        return $this->isFullPaid()
            && $this->vendor_id !== null
            && $this->vendorRequests()->where('status', 'confirmed')->exists();
    }

    public function canAdminProcess(): bool
    {
        return $this->isDpPaid();
    }

    public static function generateOrderId(): string
    {
        do {
            $id = 'AMRT-' . strtoupper(substr(uniqid(), -8));
        } while (static::where('order_id', $id)->exists());
        return $id;
    }
}