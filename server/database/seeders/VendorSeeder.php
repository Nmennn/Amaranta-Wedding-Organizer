<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Vendor;
use Illuminate\Database\Seeder;

class VendorSeeder extends Seeder
{
    public function run(): void
    {
        // Ambil user vendor yang sudah dibuat UserSeeder
        $vendorUser = User::where('email', 'vendor@amaranta.id')->firstOrFail();

        Vendor::updateOrCreate(
            ['slug' => 'amaranta'],
            [
                'user_id'      => $vendorUser->id,
                'name'         => 'AMARANTA Wedding Organizer',
                'slug'         => 'amaranta',
                'category'     => 'Full Service Wedding Organizer',
                'location'     => 'Jakarta & Seluruh Indonesia',
                'description'  => 'AMARANTA adalah wedding organizer premium yang telah membantu lebih dari 500 pasangan sejak 2015. Kami menggabungkan sentuhan artistik, pelayanan prima, dan koordinasi tanpa cela.',
                'since'        => 2015,
                'status'       => 'approved',
                'rating'       => 4.90,
                'review_count' => 500,
                'img'          => 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80',
                'tags'         => ['FULL SERVICE', 'TERPERCAYA', 'PREMIUM'],
                'gallery'      => [
                    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80',
                    'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80',
                    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80',
                    'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800&q=80',
                    'https://images.unsplash.com/photo-1487530811015-780780169993?w=800&q=80',
                    'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&q=80',
                ],
                'team'         => [
                    ['name' => 'Anisa Dewi',     'role' => 'Founder & Lead Coordinator',   'img' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80'],
                    ['name' => 'Reza Pratama',   'role' => 'Head of Decoration',            'img' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80'],
                    ['name' => 'Maya Florencia', 'role' => 'Florist & Stylist',              'img' => 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&q=80'],
                    ['name' => 'Julian Ahmad',   'role' => 'Head Photographer',             'img' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80'],
                ],
            ]
        );

        $this->command->info('  ✓ Vendor seeded: AMARANTA Wedding Organizer');
    }
}