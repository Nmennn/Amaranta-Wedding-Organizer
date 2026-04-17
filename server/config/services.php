<?php

return [

    /*
     * Konfigurasi layanan eksternal AMARANTA.
     * Semua value diambil dari .env — jangan hardcode credential di sini.
     */

    // ── EMAIL ────────────────────────────────────────────────
    'mailgun' => [
        'domain'   => env('MAILGUN_DOMAIN'),
        'secret'   => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
        'scheme'   => 'https',
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key'    => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    // ── MIDTRANS (Payment Gateway) ─────────────────────────────
    // Daftar di https://dashboard.midtrans.com (gratis)
    // Gunakan Sandbox keys selama development
    'midtrans' => [
        'server_key'    => env('MIDTRANS_SERVER_KEY', ''),
        'client_key'    => env('MIDTRANS_CLIENT_KEY', ''),
        'is_production' => env('MIDTRANS_IS_PRODUCTION', false),
        'is_sanitized'  => env('MIDTRANS_IS_SANITIZED', true),
        'is_3ds'        => env('MIDTRANS_IS_3DS', true),
        // URL notifikasi (webhook) dari Midtrans ke server Anda
        // Set di dashboard Midtrans: https://dashboard.midtrans.com/settings/vtweb
        'notification_url' => env('APP_URL') . '/api/payment/notify',
    ],

];