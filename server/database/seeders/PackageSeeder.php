<?php

namespace Database\Seeders;

use App\Models\Package;
use App\Models\Vendor;
use Illuminate\Database\Seeder;

// PackageSeeder — 3 paket AMARANTA (Silver / Gold / Platinum)
// Harga sesuai dengan data/packages.js di frontend:
//   Silver   = 25.000.000
//   Gold     = 45.000.000
//   Platinum = 85.000.000
class PackageSeeder extends Seeder
{
    public function run(): void
    {
        // Ambil vendor AMARANTA (slug: amaranta)
        $vendor = Vendor::where('slug', 'amaranta')->firstOrFail();

        $packages = [
            [
                'tier_id'   => 'silver',
                'price'     => 25_000_000,
                'is_active' => true,
            ],
            [
                'tier_id'   => 'gold',
                'price'     => 45_000_000,
                'is_active' => true,
            ],
            [
                'tier_id'   => 'platinum',
                'price'     => 85_000_000,
                'is_active' => true,
            ],
        ];

        foreach ($packages as $pkg) {
            Package::updateOrCreate(
                ['vendor_id' => $vendor->id, 'tier_id' => $pkg['tier_id']],
                ['price' => $pkg['price'], 'is_active' => $pkg['is_active']]
            );
        }

        $this->command->info('  ✓ Package seeded: Silver Rp25jt · Gold Rp45jt · Platinum Rp85jt');
    }
}