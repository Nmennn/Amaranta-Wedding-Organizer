<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

// BookingSeeder dikosongkan — tidak ada data sample
// MyBookings customer akan kosong saat pertama login
class BookingSeeder extends Seeder
{
    public function run(): void
    {
        // Tidak ada data sample booking
        // Customer harus pesan sendiri melalui aplikasi
        $this->command->info('  ✓ BookingSeeder: tidak ada data sample');
    }
}