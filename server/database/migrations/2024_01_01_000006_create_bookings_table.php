<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('order_id', 50)->unique();

            $table->foreignId('customer_id')->constrained('users');
            $table->foreignId('vendor_id')->nullable()->constrained('vendors')->nullOnDelete();
            $table->foreignId('package_id')->constrained('packages');

            $table->string('pemesan_name');
            $table->string('pemesan_email');
            $table->string('pemesan_phone', 20);
            $table->date('wedding_date');
            $table->string('location', 255)->nullable();
            $table->string('konsep', 255)->nullable();
            $table->text('notes')->nullable();

            $table->unsignedBigInteger('total_price');
            $table->unsignedBigInteger('dp_amount');
            $table->timestamp('dp_paid_at')->nullable();
            $table->timestamp('full_paid_at')->nullable();

            $table->enum('status', ['pending', 'confirmed', 'cancelled', 'completed'])->default('pending');
            $table->string('admin_status', 50)->default('waiting_dp');
            $table->enum('phase', ['pending', 'dp_paid', 'in_event', 'pelunasan', 'rated'])->default('pending');

            $table->string('payment_method', 50)->nullable();
            $table->string('midtrans_order_id', 100)->nullable();

            $table->timestamp('vendor_assigned_at')->nullable();
            $table->text('admin_notes')->nullable();
            $table->timestamp('tech_meeting_at')->nullable();
            $table->string('tech_meeting_location', 255)->nullable();
            $table->text('tech_meeting_notes')->nullable();
            $table->boolean('tech_meeting_confirmed')->default(false);
            $table->tinyInteger('preparation_progress')->unsigned()->default(0);

            $table->tinyInteger('rating')->unsigned()->nullable();
            $table->text('review')->nullable();
            $table->timestamp('rated_at')->nullable();

            $table->timestamps();

            $table->index('customer_id');
            $table->index('vendor_id');
            $table->index('status');
            $table->index('admin_status');
            $table->index('phase');
            $table->index('wedding_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};