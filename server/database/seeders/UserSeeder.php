<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // ── Admin ─────────────────────────────────────────────
        User::firstOrCreate(
            ['email' => 'admin@amaranta.id'],
            [
                'name'              => 'Admin AMARANTA',
                'username'          => 'superadmin',
                'phone'             => '081111111111',
                'password'          => Hash::make('admin123'),
                'role'              => 'admin',
                'email_verified_at' => now(),
                'is_active'         => true,
            ]
        );

        // ── Vendor users (akan dipakai VendorSeeder) ──────────
        $vendorUsers = [
            ['name' => 'Anisa Dewi',       'email' => 'vendor@amaranta.id',   'username' => 'chateau_vendor',   'phone' => '082222222222', 'password' => 'vendor123'],
            ['name' => 'Maya Florencia',   'email' => 'petals@amaranta.id',   'username' => 'petals_vendor',    'phone' => '082333333333', 'password' => 'vendor123'],
            ['name' => 'Julian Ahmad',     'email' => 'julian@amaranta.id',   'username' => 'julian_vendor',    'phone' => '082444444444', 'password' => 'vendor123'],
            ['name' => 'Budi Santoso',     'email' => 'ivory@amaranta.id',    'username' => 'ivory_vendor',     'phone' => '082555555555', 'password' => 'vendor123'],
            ['name' => 'Hendra Wijaya',    'email' => 'melody@amaranta.id',   'username' => 'melody_vendor',    'phone' => '082666666666', 'password' => 'vendor123'],
            ['name' => 'Chef Rina Susanti','email' => 'blossom@amaranta.id',  'username' => 'blossom_vendor',   'phone' => '082777777777', 'password' => 'vendor123'],
        ];

        foreach ($vendorUsers as $data) {
            User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name'              => $data['name'],
                    'username'          => $data['username'],
                    'phone'             => $data['phone'],
                    'password'          => Hash::make($data['password']),
                    'role'              => 'vendor',
                    'email_verified_at' => now(),
                    'is_active'         => true,
                ]
            );
        }

        // ── Customer users ─────────────────────────────────────
        $customers = [
            ['name' => 'Rina Kusuma',    'email' => 'customer@amaranta.id',  'username' => 'rina_k',     'phone' => '083111111111', 'password' => 'customer123'],
            ['name' => 'Budi Santoso',   'email' => 'budi@gmail.com',        'username' => 'budi_s',     'phone' => '083222222222', 'password' => 'budi1234'],
            ['name' => 'Sofia Wahyuni',  'email' => 'sofia@gmail.com',       'username' => 'sofia_w',    'phone' => '083333333333', 'password' => 'sofia1234'],
            ['name' => 'Maya Putri',     'email' => 'maya@gmail.com',        'username' => 'maya_p',     'phone' => '083444444444', 'password' => 'maya1234'],
        ];

        foreach ($customers as $data) {
            User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name'              => $data['name'],
                    'username'          => $data['username'],
                    'phone'             => $data['phone'],
                    'password'          => Hash::make($data['password']),
                    'role'              => 'customer',
                    'email_verified_at' => now(),
                    'is_active'         => true,
                ]
            );
        }

        $this->command->info('  ✓ Users seeded (1 admin, 6 vendor, 4 customer)');
    }
}