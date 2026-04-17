<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Package;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Database\Seeder;

class BookingSeeder extends Seeder
{
    public function run(): void
    {
        $customer = User::where('email', 'customer@amaranta.id')->first();
        $vendor   = Vendor::where('slug', 'amaranta')->first();

        if (! $customer || ! $vendor) {
            $this->command->warn('  ⚠ UserSeeder/VendorSeeder belum dijalankan, skip BookingSeeder.');
            return;
        }

        $pkgGold   = Package::where('vendor_id', $vendor->id)->where('tier_id', 'gold')->first();
        $pkgSilver = Package::where('vendor_id', $vendor->id)->where('tier_id', 'silver')->first();

        if ($pkgGold) {
            Booking::firstOrCreate(['order_id' => 'AMRT-DEMO0001'], [
                'customer_id'   => $customer->id,
                'vendor_id'     => null,          // belum di-assign admin
                'package_id'    => $pkgGold->id,
                'pemesan_name'  => 'Rina & Budi',
                'pemesan_email' => $customer->email,
                'pemesan_phone' => '081234567890',
                'wedding_date'  => '2025-09-15',
                'location'      => 'Jakarta Selatan, Gedung Smesco',
                'konsep'        => 'Garden Romantic — dominan hijau dan emas',
                'notes'         => 'Perkiraan tamu: 150 orang',
                'total_price'   => $pkgGold->price,
                'dp_amount'     => (int) round($pkgGold->price * 0.3),
                'dp_paid_at'    => now()->subDays(3),
                'status'        => 'confirmed',
                'phase'         => 'dp_paid',
                'admin_status'  => 'waiting_vendor',
                'payment_method'=> 'bca',
            ]);
        }

        if ($pkgSilver) {
            Booking::firstOrCreate(['order_id' => 'AMRT-DEMO0002'], [
                'customer_id'   => $customer->id,
                'vendor_id'     => null,
                'package_id'    => $pkgSilver->id,
                'pemesan_name'  => 'Rina & Budi',
                'pemesan_email' => $customer->email,
                'pemesan_phone' => '081234567890',
                'wedding_date'  => '2025-11-20',
                'location'      => 'Bandung, Harris Hotel',
                'konsep'        => 'Rustic Outdoor',
                'notes'         => null,
                'total_price'   => $pkgSilver->price,
                'dp_amount'     => (int) round($pkgSilver->price * 0.3),
                'status'        => 'pending',
                'phase'         => 'pending',
                'admin_status'  => 'waiting_dp',
            ]);
        }

        $this->command->info('  ✓ Booking sample seeded (2 booking demo)');
    }
}