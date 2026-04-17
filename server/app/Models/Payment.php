<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'booking_id', 'type', 'amount', 'status',
        'snap_token', 'payment_type', 'transaction_id',
        'paid_at', 'midtrans_response',
    ];

    protected function casts(): array
    {
        return [
            'paid_at'            => 'datetime',
            'amount'             => 'integer',
            'midtrans_response'  => 'array',
        ];
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}