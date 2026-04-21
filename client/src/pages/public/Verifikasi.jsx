import { useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { authService } from "../../services";
import Navbar from "../../components/Navbar";
import Button from "../../components/ui/Button";

export default function Verifikasi() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1=isi email, 2=isi OTP
  const [sending, setSending] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [otpErr, setOtpErr] = useState("");
  const { verifyOtp, isLoading } = useAuth();

  async function handleSendOtp(ev) {
    ev.preventDefault();
    if (!email.includes("@")) {
      setErrMsg("Masukkan email yang valid.");
      return;
    }
    setSending(true);
    setErrMsg("");
    try {
      await authService.resendOtp({ email });
      setStep(2);
    } catch (err) {
      setErrMsg(
        err.userMessage || "Email tidak ditemukan atau sudah terverifikasi.",
      );
    } finally {
      setSending(false);
    }
  }

  async function handleVerify(ev) {
    ev.preventDefault();
    if (otp.length !== 6) return;
    setOtpErr("");
    try {
      await verifyOtp({ email, otp });
      // useAuth.verifyOtp → navigate ke /pelanggan/pemesanan
    } catch (err) {
      setOtpErr(err.userMessage || "Kode OTP salah atau kadaluarsa.");
      setOtp("");
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      <Navbar />
      <div className="min-h-screen flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm bg-white border border-[var(--color-cream-border)] p-8">
          {step === 1 && (
            <>
              <div className="w-14 h-14 bg-[var(--color-gold-pale)] rounded-full flex items-center justify-center mx-auto mb-5">
                <svg
                  className="w-7 h-7 text-[var(--color-gold)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h1 className="font-[var(--font-display)] text-2xl text-[var(--color-dark)] text-center mb-2">
                Verifikasi Email
              </h1>
              <p className="text-sm text-[var(--color-slate)] font-[var(--font-sans)] text-center mb-6">
                Masukkan email yang terdaftar. Kami akan kirim kode OTP baru.
              </p>

              {errMsg && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-sm text-red-600 font-[var(--font-sans)] text-center">
                  ⚠️ {errMsg}
                </div>
              )}

              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-[var(--color-dark-muted)] font-[var(--font-sans)] block mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrMsg("");
                    }}
                    placeholder="email@domain.com"
                    autoFocus
                    className="w-full border-b-2 border-[var(--color-cream-border)] focus:border-[var(--color-gold)] bg-transparent py-2 text-sm font-[var(--font-sans)] outline-none transition-colors"
                  />
                </div>
                <Button
                  type="submit"
                  variant="gold"
                  fullWidth
                  size="lg"
                  isLoading={sending}
                >
                  Kirim Kode OTP
                </Button>
              </form>

              <p className="mt-5 text-sm text-center text-[var(--color-dark-muted)] font-[var(--font-sans)]">
                <Link
                  to="/masuk"
                  className="text-[var(--color-gold)] hover:underline"
                >
                  ← Kembali ke Login
                </Link>
              </p>
            </>
          )}

          {step === 2 && (
            <>
              <div className="w-14 h-14 bg-[var(--color-gold-pale)] rounded-full flex items-center justify-center mx-auto mb-5">
                <svg
                  className="w-7 h-7 text-[var(--color-gold)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2 className="font-[var(--font-display)] text-2xl text-[var(--color-dark)] text-center mb-2">
                Masukkan Kode OTP
              </h2>
              <p className="text-sm text-[var(--color-slate)] font-[var(--font-sans)] text-center mb-1">
                Kode dikirim ke
              </p>
              <p className="text-sm font-medium text-[var(--color-dark)] font-[var(--font-sans)] text-center mb-6">
                {email}
              </p>

              {otpErr && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-sm text-red-600 font-[var(--font-sans)] text-center">
                  ⚠️ {otpErr}
                </div>
              )}

              <form onSubmit={handleVerify} className="space-y-5">
                <div className="text-center">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={otp}
                    autoFocus
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                      setOtpErr("");
                    }}
                    placeholder="000000"
                    className="w-full text-center text-4xl tracking-[0.6em] border-b-2 border-[var(--color-cream-border)] focus:border-[var(--color-gold)] bg-transparent outline-none py-3 font-[var(--font-display)] text-[var(--color-dark)] transition-colors"
                  />
                  <p className="text-xs text-[var(--color-slate)] font-[var(--font-sans)] mt-2">
                    Berlaku 5 menit
                  </p>
                </div>
                <Button
                  type="submit"
                  variant="gold"
                  fullWidth
                  size="lg"
                  isLoading={isLoading}
                  disabled={otp.length !== 6}
                >
                  Verifikasi & Masuk
                </Button>
              </form>

              <div className="mt-5 flex items-center justify-center gap-3 text-xs font-[var(--font-sans)]">
                <button
                  onClick={handleSendOtp}
                  className="text-[var(--color-gold)] hover:underline"
                >
                  Kirim ulang OTP
                </button>
                <span className="text-[var(--color-cream-border)]">·</span>
                <button
                  onClick={() => {
                    setStep(1);
                    setOtp("");
                    setOtpErr("");
                  }}
                  className="text-[var(--color-slate)] hover:text-[var(--color-dark)] transition-colors"
                >
                  Ganti email
                </button>
              </div>

              {import.meta.env.DEV && (
                <div className="mt-5 p-3 bg-amber-50 border border-amber-200 text-center">
                  <p className="text-xs text-amber-700 font-[var(--font-sans)]">
                    Cek kode di Mailtrap atau
                    <br />
                    <code className="bg-amber-100 px-1">
                      server/storage/logs/laravel.log
                    </code>
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
