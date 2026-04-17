<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $code,       // 6 digit OTP
        public string $userName,   // nama penerima
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Kode Verifikasi AMARANTA — ' . $this->code,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.otp',   // resources/views/emails/otp.blade.php
        );
    }
}