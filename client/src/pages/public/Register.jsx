import { useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { authService } from "../../services";
import Navbar from "../../components/Navbar";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

function Register() {
  const [step, setStep] = useState(1); // 1=form, 2=otp
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState({});
  const {
    register,
    verifyOtp,
    isLoading,
    error: apiError,
    clearError,
  } = useAuth();

  function handleChange(e) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name])
      setErrors((p) => ({ ...p, [e.target.name]: "" }));
    if (apiError) clearError();
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Nama wajib diisi";
    if (!form.email.includes("@")) e.email = "Email tidak valid";
    if (!form.phone.match(/^08/)) e.phone = "Format: 08xxxxxxxxxx";
    if (form.password.length < 8) e.password = "Minimal 8 karakter";
    if (form.password !== form.confirm) e.confirm = "Password tidak cocok";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleRegister(ev) {
    ev.preventDefault();
    if (!validate()) return;
    try {
      await register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      setStep(2);
    } catch {}
  }

  async function handleVerify(ev) {
    ev.preventDefault();
    if (otp.length !== 6) return;
    try {
      await verifyOtp({ email: form.email, otp });
    } catch {}
  }

  async function handleResend() {
    try {
      await authService.resendOtp({ email: form.email });
    } catch {}
  }

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      <Navbar />
      <div className="min-h-screen flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md bg-white border border-[var(--color-cream-border)] p-8">
          {/* Step 1: Form daftar */}
          {step === 1 && (
            <>
              <h1 className="font-[var(--font-display)] text-3xl text-[var(--color-dark)] mb-2">
                Buat Akun
              </h1>
              <p className="text-sm text-[var(--color-slate)] font-[var(--font-sans)] mb-6">
                Daftar untuk memesan paket pernikahan AMARANTA.
              </p>

              {apiError && (
                <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 text-sm text-red-600 font-[var(--font-sans)]">
                  ⚠️ {apiError}
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                <Input
                  label="Nama Lengkap"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  error={errors.name}
                />
                <Input
                  label="Email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  error={errors.email}
                  hint="Kode OTP akan dikirim ke email ini"
                />
                <Input
                  label="No. HP / WhatsApp"
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  error={errors.phone}
                  placeholder="08xxxxxxxxxx"
                />
                <Input
                  label="Password"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  error={errors.password}
                  hint="Minimal 8 karakter"
                />
                <Input
                  label="Konfirmasi Password"
                  type="password"
                  name="confirm"
                  value={form.confirm}
                  onChange={handleChange}
                  required
                  error={errors.confirm}
                />
                <Button
                  type="submit"
                  variant="gold"
                  fullWidth
                  size="lg"
                  isLoading={isLoading}
                >
                  Daftar Sekarang
                </Button>
              </form>

              <p className="mt-5 text-sm text-center text-[var(--color-dark-muted)] font-[var(--font-sans)]">
                Sudah punya akun?{" "}
                <Link
                  to="/masuk"
                  className="text-[var(--color-gold)] hover:underline font-medium"
                >
                  Masuk
                </Link>
              </p>
            </>
          )}

          {/* Step 2: Verifikasi OTP */}
          {step === 2 && (
            <>
              <div className="w-12 h-12 bg-[var(--color-gold-pale)] rounded-full flex items-center justify-center mb-5">
                <svg
                  className="w-6 h-6 text-[var(--color-gold)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2 className="font-[var(--font-display)] text-2xl text-[var(--color-dark)] mb-2">
                Verifikasi Email
              </h2>
              <p className="text-sm text-[var(--color-slate)] font-[var(--font-sans)] mb-6 leading-relaxed">
                Kode OTP 6 digit dikirim ke <strong>{form.email}</strong>.{" "}
                {import.meta.env.DEV && (
                  <span className="text-amber-600 text-xs block mt-1">
                    Mode dev: cek kode di{" "}
                    <code className="bg-amber-50 px-1">
                      server/storage/logs/laravel.log
                    </code>
                  </span>
                )}
              </p>

              {apiError && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-sm text-red-600 font-[var(--font-sans)]">
                  ⚠️ {apiError}
                </div>
              )}

              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-[var(--color-dark-muted)] font-[var(--font-sans)] block mb-1.5">
                    Kode OTP
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="000000"
                    className="w-full text-center text-3xl tracking-[0.5em] border-b-2 border-[var(--color-cream-border)] focus:border-[var(--color-gold)] bg-transparent outline-none py-3 font-[var(--font-display)] text-[var(--color-dark)] transition-colors"
                  />
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

              <div className="mt-4 text-center">
                <p className="text-xs text-[var(--color-slate)] font-[var(--font-sans)] mb-2">
                  Tidak menerima kode?
                </p>
                <button
                  onClick={handleResend}
                  className="text-xs text-[var(--color-gold)] hover:underline font-[var(--font-sans)]"
                >
                  Kirim ulang OTP
                </button>
                <span className="text-[var(--color-slate)] mx-2">·</span>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-[var(--color-slate)] hover:text-[var(--color-dark)] font-[var(--font-sans)]"
                >
                  Ganti email
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Register;
