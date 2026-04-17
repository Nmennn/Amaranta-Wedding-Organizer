<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Tabel vendor_requests — tracking assignment vendor oleh admin
// 1 booking → N vendor_requests (riwayat assign, termasuk yang ditolak)
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vendor_requests', function (Blueprint $table) {
            $table->id();

            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->foreignId('vendor_id')->constrained()->cascadeOnDelete();
            $table->foreignId('assigned_by')->constrained('users'); // admin yg assign

            $table->enum('status', ['pending', 'confirmed', 'rejected'])->default('pending');
            $table->text('rejection_reason')->nullable();
            $table->text('vendor_notes')->nullable();
            $table->timestamp('responded_at')->nullable();

            $table->timestamps();

            $table->index('booking_id');
            $table->index('vendor_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vendor_requests');
    }
};