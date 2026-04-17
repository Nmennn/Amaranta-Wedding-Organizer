<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kode Verifikasi AMARANTA</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #FAF7F2; margin: 0; padding: 20px; }
        .container { max-width: 480px; margin: 0 auto; background: #fff; border: 1px solid #E5DDD0; padding: 40px; }
        .brand { font-family: Georgia, serif; font-size: 24px; letter-spacing: 0.2em; color: #1C1A17; margin-bottom: 32px; }
        .heading { font-size: 22px; font-weight: 500; color: #1C1A17; margin-bottom: 12px; }
        .body-text { font-size: 14px; color: #6B6660; line-height: 1.7; margin-bottom: 24px; }
        .otp-box { background: #FAF7F2; border: 1px solid #E5DDD0; padding: 24px; text-align: center; margin: 24px 0; }
        .otp-code { font-family: 'Courier New', monospace; font-size: 36px; font-weight: bold; letter-spacing: 0.4em; color: #C9A96E; }
        .expiry { font-size: 12px; color: #8A8480; margin-top: 8px; }
        .warning { font-size: 12px; color: #8A8480; border-top: 1px solid #E5DDD0; padding-top: 20px; margin-top: 24px; }
        .footer { font-size: 12px; color: #8A8480; margin-top: 16px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="brand">AMARANTA</div>

        <div class="heading">Halo, {{ $userName }}!</div>
        <div class="body-text">
            Kami menerima permintaan pendaftaran akun di AMARANTA Wedding Organizer.
            Masukkan kode verifikasi berikut untuk melanjutkan:
        </div>

        <div class="otp-box">
            <div class="otp-code">{{ $code }}</div>
            <div class="expiry">Berlaku selama 5 menit</div>
        </div>

        <div class="body-text">
            Jika Anda tidak meminta kode ini, abaikan email ini.
            Akun Anda tetap aman.
        </div>

        <div class="warning">
            Jangan bagikan kode ini kepada siapapun. Tim AMARANTA tidak akan
            pernah meminta kode verifikasi Anda.
        </div>

        <div class="footer">
            © {{ date('Y') }} AMARANTA Wedding Organizer.
            Dikirim otomatis — jangan balas email ini.
        </div>
    </div>
</body>
</html>