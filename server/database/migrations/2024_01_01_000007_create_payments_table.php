<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Migration 7: Tabel payments — log semua transaksi Midtrans
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')
                  ->constrained()
                  ->cascadeOnDelete();

            $table->enum('type', ['dp', 'dp30', 'full']);      // jenis pembayaran: dp(legacy), dp30, atau full
            $table->unsignedBigInteger('amount');       // nominal yang dibayar
            $table->enum('status', ['pending', 'success', 'failed', 'expired'])
                  ->default('pending');

            $table->string('snap_token', 500)->nullable(); // Midtrans Snap token
            $table->string('payment_type', 50)->nullable(); // 'bank_transfer','gopay',dll
            $table->string('transaction_id', 200)->nullable(); // ID dari Midtrans

            $table->timestamp('paid_at')->nullable();
            $table->json('midtrans_response')->nullable(); // raw JSON dari Midtrans

            $table->timestamps();

            $table->index('booking_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
