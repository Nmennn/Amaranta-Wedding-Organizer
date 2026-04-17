<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Migration 4: Tabel vendors
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vendors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                  ->constrained()
                  ->cascadeOnDelete();               // hapus user → hapus vendor

            $table->string('name');
            $table->string('slug')->unique();        // URL-friendly: chateau-de-lumiere
            $table->string('category');              // 'Venue & Full Service'
            $table->string('location')->nullable();
            $table->text('description')->nullable();
            $table->year('since')->nullable();

            $table->enum('status', ['pending', 'approved', 'rejected'])
                  ->default('pending');              // admin harus setujui dulu

            $table->decimal('rating', 3, 2)->default(0.00); // 0.00 - 5.00
            $table->unsignedInteger('review_count')->default(0);

            $table->string('img', 500)->nullable();  // URL foto utama
            $table->json('tags')->nullable();        // ["TERPOPULER", "FULL SERVICE"]
            $table->json('gallery')->nullable();     // array URL foto galeri
            $table->json('team')->nullable();        // [{name, role, img}]

            $table->timestamps();

            $table->index('status');
            $table->index('category');
            $table->index('rating');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vendors');
    }
};
