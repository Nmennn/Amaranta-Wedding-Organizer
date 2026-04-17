// ============================================================
// src/pages/public/Register.jsx — Registrasi + OTP Verifikasi
// Flow: Isi Form → Submit → Tampilkan OTP Input → Verifikasi
// ============================================================
import { useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { ROLES } from "../../constants/roles";
import Navbar from "../../components/Navbar";

// Generate OTP 6 digit simulasi
const generateOTP = () => String(Math.floor(100000 + Math.random() * 900000));

const Register = () => {
  const [step, setStep] = useState(1);
  // Step 1: isi form | Step 2: verifikasi OTP

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    username: "",
    password: "",
    confirm: "",
    role: ROLES.CUSTOMER,
  });
  const [errors, setErrors] = useState({});
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(""); // OTP yang "dikirim" (simulasi)
  const [otpError, setOtpError] = useState("");
  const [resendCd, setResendCd] = useState(0); // cooldown resend detik

  const { register, isLoading, error: apiError, clearError } = useAuth();

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name])
      setErrors((p) => ({ ...p, [e.target.name]: "" }));
    if (apiError) clearError();
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Nama lengkap wajib diisi";
    if (!form.email.includes("@")) e.email = "Format email tidak valid";
    if (!form.phone.match(/^08\d{8,11}$/))
      e.phone = "Nomor HP tidak valid (contoh: 081234567890)";
    if (!form.username.match(/^\w{4,}$/))
      e.username = "Username minimal 4 karakter, tanpa spasi";
    if (form.password.length < 8) e.password = "Password minimal 8 karakter";
    if (form.password !== form.confirm)
      e.confirm = "Konfirmasi password tidak cocok";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Step 1: kirim form → generate OTP simulasi
  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const code = generateOTP();
    setOtpSent(code);
    setStep(2);
    setResendCd(60);
    // Simulasi countdown
    let cd = 60;
    const timer = setInterval(() => {
      cd--;
      setResendCd(cd);
      if (cd <= 0) clearInterval(timer);
    }, 1000);
  };

  // Step 2: verifikasi OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp !== otpSent) {
      setOtpError("Kode OTP tidak sesuai. Coba lagi.");
      return;
    }
    setOtpError("");
    const { confirm, ...payload } = form;
    try {
      await register(payload);
    } catch {
      /* handled in store */
    }
  };

  const handleResend = () => {
    if (resendCd > 0) return;
    const code = generateOTP();
    setOtpSent(code);
    setResendCd(60);
    let cd = 60;
    const timer = setInterval(() => {
      cd--;
      setResendCd(cd);
      if (cd <= 0) clearInterval(timer);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      <Navbar />
      <div className="min-h-screen grid md:grid-cols-2">
        {/* Kiri: Dekoratif */}
        <div className="hidden md:flex flex-col relative overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&q=90"
            alt="Bunga pernikahan"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-dark)]/60 to-[var(--color-dark)]/20" />
          <div className="absolute bottom-12 left-8 right-8">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-gold)] font-[var(--font-sans)] mb-2">
              amaranta Wedding Organizer
            </p>
            <p className="font-[var(--font-display)] text-2xl text-white italic leading-relaxed">
              "Setiap pernikahan adalah cerita cinta yang unik."
            </p>
          </div>
        </div>

        {/* Kanan: Form */}
        <div className="flex flex-col px-8 lg:px-14 py-12 bg-[var(--color-ivory)]">
          <div className="flex-1 flex flex-col justify-center">
            <div className="max-w-sm w-full mx-auto">
              {/* Progress steps */}
              <div className="flex items-center gap-3 mb-10">
                {[1, 2].map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <div
                      className={[
                        "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-[var(--font-sans)] transition-all",
                        step >= s
                          ? "bg-[var(--color-gold)] text-[var(--color-dark)]"
                          : "bg-[var(--color-cream-border)] text-[var(--color-slate)]",
                      ].join(" ")}
                    >
                      {s}
                    </div>
                    <span
                      className={[
                        "text-xs font-[var(--font-sans)] uppercase tracking-widest",
                        step >= s
                          ? "text-[var(--color-dark)]"
                          : "text-[var(--color-slate)]",
                      ].join(" ")}
                    >
                      {s === 1 ? "Data Diri" : "Verifikasi OTP"}
                    </span>
                    {s < 2 && (
                      <div
                        className={[
                          "h-px w-8 transition-all",
                          step > s
                            ? "bg-[var(--color-gold)]"
                            : "bg-[var(--color-cream-border)]",
                        ].join(" ")}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* ── STEP 1: Form Pendaftaran ───────────────── */}
              {step === 1 && (
                <>
                  <h1 className="font-[var(--font-display)] text-3xl text-[var(--color-dark)] mb-1">
                    Buat Akun
                  </h1>
                  <p className="text-sm text-[var(--color-slate)] font-[var(--font-sans)] mb-7">
                    Bergabunglah dengan ribuan pasangan di amaranta.
                  </p>

                  {apiError && (
                    <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 text-sm text-red-600 font-[var(--font-sans)]">
                      {apiError}
                    </div>
                  )}

                  <form onSubmit={handleSubmitForm} className="space-y-4">
                    <Input
                      label="Nama Lengkap"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="contoh: Aria Dewi"
                      required
                      error={errors.name}
                    />
                    <Input
                      label="Email"
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="email@domain.com"
                      required
                      error={errors.email}
                    />
                    <Input
                      label="Nomor HP"
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="081234567890"
                      required
                      error={errors.phone}
                      hint="Akan digunakan untuk mengirim kode OTP"
                    />
                    <Input
                      label="Username"
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      placeholder="username_unik"
                      required
                      error={errors.username}
                    />
                    <Input
                      label="Password"
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Minimal 8 karakter"
                      required
                      error={errors.password}
                    />
                    <Input
                      label="Konfirmasi Password"
                      type="password"
                      name="confirm"
                      value={form.confirm}
                      onChange={handleChange}
                      placeholder="Ulangi password"
                      required
                      error={errors.confirm}
                    />

                    {/* Pilihan Peran */}
                    <div>
                      <p className="text-sm font-medium text-[var(--color-dark-muted)] font-[var(--font-sans)] mb-3">
                        Saya bergabung sebagai
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          {
                            value: ROLES.CUSTOMER,
                            label: "Calon Pengantin",
                            sub: "Ingin memesan paket",
                          },
                          {
                            value: ROLES.VENDOR,
                            label: "Vendor / Mitra",
                            sub: "Menawarkan layanan",
                          },
                        ].map(({ value, label, sub }) => (
                          <label
                            key={value}
                            className={[
                              "flex flex-col p-3.5 border cursor-pointer transition-all",
                              form.role === value
                                ? "border-[var(--color-gold)] bg-[var(--color-gold-pale)]"
                                : "border-[var(--color-cream-border)] hover:border-[var(--color-gold)]/50",
                            ].join(" ")}
                          >
                            <input
                              type="radio"
                              name="role"
                              value={value}
                              checked={form.role === value}
                              onChange={handleChange}
                              className="sr-only"
                            />
                            <span className="text-sm font-medium font-[var(--font-sans)] text-[var(--color-dark)]">
                              {label}
                            </span>
                            <span className="text-xs text-[var(--color-slate)] font-[var(--font-sans)] mt-0.5">
                              {sub}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      fullWidth
                      size="lg"
                      isLoading={isLoading}
                    >
                      Lanjutkan & Kirim OTP
                    </Button>
                  </form>
                </>
              )}

              {/* ── STEP 2: Verifikasi OTP ─────────────────── */}
              {step === 2 && (
                <>
                  <div className="w-14 h-14 bg-[var(--color-gold-pale)] flex items-center justify-center mb-6">
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
                        d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h1 className="font-[var(--font-display)] text-3xl text-[var(--color-dark)] mb-2">
                    Verifikasi OTP
                  </h1>
                  <p className="text-sm text-[var(--color-slate)] font-[var(--font-sans)] mb-2">
                    Kode verifikasi 6 digit telah dikirim ke{" "}
                    <strong className="text-[var(--color-dark)]">
                      {form.phone}
                    </strong>
                  </p>

                  {/* DEMO: tampilkan OTP karena tidak ada backend SMS */}
                  <div className="mb-6 px-4 py-3 bg-blue-50 border border-blue-200 rounded-none">
                    <p className="text-xs text-blue-600 font-[var(--font-sans)]">
                      🔧 <strong>Mode Demo:</strong> Kode OTP Anda adalah{" "}
                      <strong className="text-lg tracking-[0.2em]">
                        {otpSent}
                      </strong>
                    </p>
                  </div>

                  {otpError && (
                    <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-sm text-red-600 font-[var(--font-sans)]">
                      {otpError}
                    </div>
                  )}

                  <form onSubmit={handleVerifyOTP} className="space-y-5">
                    {/* Input OTP — 6 kotak */}
                    <div>
                      <label className="text-sm font-medium text-[var(--color-dark-muted)] font-[var(--font-sans)] block mb-2">
                        Masukkan Kode OTP
                      </label>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => {
                          setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                          setOtpError("");
                        }}
                        placeholder="_ _ _ _ _ _"
                        maxLength={6}
                        className="w-full text-center text-2xl tracking-[0.5em] font-[var(--font-display)] border-b-2 border-[var(--color-cream-border)] focus:border-[var(--color-gold)] bg-transparent py-3 outline-none transition-colors text-[var(--color-dark)]"
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
                      Verifikasi & Buat Akun
                    </Button>
                  </form>

                  {/* Resend OTP */}
                  <div className="mt-5 text-center">
                    <p className="text-xs text-[var(--color-slate)] font-[var(--font-sans)] mb-2">
                      Tidak menerima kode?
                    </p>
                    <button
                      onClick={handleResend}
                      disabled={resendCd > 0}
                      className={[
                        "text-xs font-[var(--font-sans)] transition-colors",
                        resendCd > 0
                          ? "text-[var(--color-slate)] cursor-not-allowed"
                          : "text-[var(--color-gold)] hover:underline cursor-pointer",
                      ].join(" ")}
                    >
                      {resendCd > 0
                        ? `Kirim ulang dalam ${resendCd} detik`
                        : "Kirim Ulang OTP"}
                    </button>
                  </div>

                  <button
                    onClick={() => setStep(1)}
                    className="mt-4 w-full text-xs text-[var(--color-slate)] hover:text-[var(--color-dark)] font-[var(--font-sans)] transition-colors text-center"
                  >
                    ← Kembali ke form pendaftaran
                  </button>
                </>
              )}

              {/* Link ke login */}
              <p className="mt-8 text-sm text-[var(--color-dark-muted)] font-[var(--font-sans)] text-center">
                Sudah punya akun?{" "}
                <Link
                  to="/masuk"
                  className="text-[var(--color-gold)] hover:underline"
                >
                  Masuk di sini
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
