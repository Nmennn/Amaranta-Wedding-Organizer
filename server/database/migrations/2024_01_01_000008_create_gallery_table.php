<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Migration 8: Tabel gallery — foto-foto pernikahan AMARANTA
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gallery', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')
                  ->nullable()
                  ->constrained()
                  ->nullOnDelete();        // null = foto milik AMARANTA sendiri

            $table->string('image_url', 500);
            $table->string('category', 100)->default('Umum');
            $table->string('caption', 255)->nullable();
            $table->boolean('is_featured')->default(false);
            $table->timestamp('created_at')->nullable();

            $table->index('category');
            $table->index('is_featured');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gallery');
    }
};
