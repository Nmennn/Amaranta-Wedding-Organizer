<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            VendorSeeder::class,
            PackageSeeder::class,
            BookingSeeder::class,
        ]);

        $this->command->info(PHP_EOL . '✅  Database AMARANTA berhasil diisi.');
        $this->command->info('    admin@amaranta.id  / admin123');
        $this->command->info('    vendor@amaranta.id / vendor123');
        $this->command->info('    customer@amaranta.id / customer123');
    }
}