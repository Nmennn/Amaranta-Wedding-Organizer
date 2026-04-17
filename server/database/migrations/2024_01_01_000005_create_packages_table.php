<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Migration 5: Tabel packages — paket Silver/Gold/Platinum per vendor
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('packages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')
                  ->constrained()
                  ->cascadeOnDelete();

            $table->enum('tier_id', ['silver', 'gold', 'platinum']);
            $table->unsignedBigInteger('price');    // dalam Rupiah, contoh: 45000000
            $table->boolean('is_active')->default(true);

            $table->timestamps();

            // Satu vendor hanya boleh punya 1 paket per tier
            $table->unique(['vendor_id', 'tier_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('packages');
    }
};
