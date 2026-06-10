<?php

return [

    /*
     * Izinkan semua route API diakses dari domain frontend.
     * Laravel membaca file ini lewat fruitcake/laravel-cors (sudah built-in Laravel 11).
     *
     * PENTING: Sesuaikan 'allowed_origins' dengan URL deployment Anda.
     * Dev:        http://localhost:5173
     * Production: https://amaranta.id
     */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],  // GET, POST, PUT, PATCH, DELETE, OPTIONS

    'allowed_origins' => [
        env('FRONTEND_URL', 'http://localhost:5173'),
        'http://localhost:3000',   // jika pakai port lain
        'http://127.0.0.1:5173',
        'http://localhost:5174',   // Vite port ketika 5173 sudah dipakai
        'http://127.0.0.1:5174',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],  // Authorization, Content-Type, Accept, dll

    'exposed_headers' => [],

    'max_age' => 0,

    // false = pakai Bearer token (bukan cookie session)
    // true  = jika pakai Sanctum cookie-based (SPA)
    'supports_credentials' => false,

];