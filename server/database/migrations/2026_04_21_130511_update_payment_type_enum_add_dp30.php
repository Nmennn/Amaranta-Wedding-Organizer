<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Modify enum type column untuk include dp30
        DB::statement("ALTER TABLE payments MODIFY COLUMN type ENUM('dp', 'dp30', 'full')");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert ke enum asli
        DB::statement("ALTER TABLE payments MODIFY COLUMN type ENUM('dp', 'full')");
    }
};
