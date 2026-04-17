<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Migration 2: Tabel OTP codes — untuk verifikasi email
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('otp_codes', function (Blueprint $table) {
            $table->id();
            $table->string('email');
            $table->string('code', 6);              // 6 digit angka
            $table->enum('purpose', ['register', 'reset_password', 'change_email'])
                  ->default('register');
            $table->timestamp('expires_at');        // berlaku 5 menit
            $table->timestamp('used_at')->nullable(); // null = belum dipakai
            $table->timestamp('created_at')->nullable();

            // Index untuk pencarian cepat saat verifikasi
            $table->index(['email', 'code']);
            $table->index('expires_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('otp_codes');
    }
};
