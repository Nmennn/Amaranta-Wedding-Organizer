<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Gallery extends Model
{
    protected $table = 'gallery';

    public $timestamps = false;

    protected $fillable = [
        'vendor_id',
        'image_url',
        'category',
        'caption',
        'is_featured',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'is_featured' => 'boolean',
            'created_at'  => 'datetime',
        ];
    }

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }
}