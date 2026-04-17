<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Migration 1: Tabel users
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('username', 100)->unique()->nullable();
            $table->string('email')->unique();
            $table->string('phone', 20)->nullable();
            $table->string('password');               // disimpan bcrypt hash
            $table->enum('role', ['admin', 'vendor', 'customer'])->default('customer');
            $table->timestamp('email_verified_at')->nullable();  // null = belum verifikasi
            $table->boolean('is_active')->default(true);
            $table->rememberToken();
            $table->timestamps();

            $table->index('role');
            $table->index('email_verified_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};