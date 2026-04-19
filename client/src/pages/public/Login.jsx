import { useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { authService } from "../../services";
import Navbar from "../../components/Navbar";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [mode, setMode] = useState("login"); // 'login' | 'forgot'
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [fpLoading, setFpLoading] = useState(false);
  const { login, isLoading, error: apiError, clearError } = useAuth();

  function handleChange(e) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name])
      setErrors((p) => ({ ...p, [e.target.name]: "" }));
    if (apiError) clearError();
  }

  function validate() {
    const e = {};
    if (!form.email.includes("@")) e.email = "Format email tidak valid";
    if (!form.password) e.password = "Password wajib diisi";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    if (!validate()) return;
    try {
      await login({ email: form.email, password: form.password });
    } catch {}
  }

  async function handleForgot(ev) {
    ev.preventDefault();
    if (!forgotEmail.includes("@")) return;
    setFpLoading(true);
    try {
      await authService.forgotPassword(forgotEmail);
      setForgotSent(true);
    } catch {
    } finally {
      setFpLoading(false);
    }
  }

  if (mode === "forgot") {
    return (
      <div className="min-h-screen bg-[var(--color-cream)]">
        <Navbar />
        <div className="min-h-screen flex items-center justify-center px-4 py-20">
          <div className="w-full max-w-sm bg-white border border-[var(--color-cream-border)] p-8">
            <button
              onClick={() => {
                setMode("login");
                setForgotSent(false);
              }}
              className="text-xs text-[var(--color-slate)] hover:text-[var(--color-dark)] font-[var(--font-sans)] mb-6 transition-colors"
            >
              ← Kembali ke Login
            </button>
            {forgotSent ? (
              <>
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-emerald-500"
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
                <h2 className="font-[var(--font-display)] text-2xl text-[var(--color-dark)] mb-3">
                  Email Dikirim
                </h2>
                <p className="text-sm text-[var(--color-slate)] font-[var(--font-sans)] mb-6 leading-relaxed">
                  Jika <strong>{forgotEmail}</strong> terdaftar, kode reset
                  password akan dikirim dalam beberapa menit.
                </p>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => setMode("login")}
                >
                  Kembali ke Login
                </Button>
              </>
            ) : (
              <>
                <h2 className="font-[var(--font-display)] text-2xl text-[var(--color-dark)] mb-2">
                  Lupa Password?
                </h2>
                <p className="text-sm text-[var(--color-slate)] font-[var(--font-sans)] mb-6">
                  Masukkan email Anda. Kami kirim kode OTP untuk reset password.
                </p>
                <form onSubmit={handleForgot} className="space-y-4">
                  <Input
                    label="Email"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="email@domain.com"
                    required
                  />
                  <Button
                    type="submit"
                    variant="gold"
                    fullWidth
                    isLoading={fpLoading}
                  >
                    Kirim Kode Reset
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      <Navbar />
      <div className="min-h-screen grid md:grid-cols-2">
        {/* Form */}
        <div className="flex flex-col px-6 sm:px-10 lg:px-14 py-8 bg-[var(--color-ivory)] overflow-y-auto">
          <div className="flex-1 flex flex-col justify-center">
            <div className="max-w-sm w-full mx-auto">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-gold)] font-[var(--font-sans)] mb-3">
                Selamat datang kembali
              </p>
              <h1 className="font-[var(--font-display)] text-4xl text-[var(--color-dark)] mb-8">
                Masuk ke AMARANTA
              </h1>

              {apiError && (
                <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 text-sm text-red-600 font-[var(--font-sans)]">
                  ⚠️ {apiError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
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
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-medium text-[var(--color-dark-muted)] font-[var(--font-sans)]">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode("forgot");
                        setForgotEmail(form.email);
                        setForgotSent(false);
                      }}
                      className="text-xs text-[var(--color-gold)] hover:underline font-[var(--font-sans)]"
                    >
                      Lupa password?
                    </button>
                  </div>
                  <Input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Masukkan password"
                    required
                    error={errors.password}
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  size="lg"
                  isLoading={isLoading}
                >
                  Masuk
                </Button>
              </form>

              <p className="mt-6 text-sm text-center text-[var(--color-dark-muted)] font-[var(--font-sans)]">
                Belum punya akun?{" "}
                <Link
                  to="/daftar"
                  className="text-[var(--color-gold)] hover:underline font-medium"
                >
                  Daftar sekarang
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Visual */}
        <div className="hidden md:block relative overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&q=90"
            alt="Dekorasi pernikahan"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[var(--color-dark)]/40" />
          <div className="absolute inset-0 flex flex-col justify-end p-10">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-gold)] font-[var(--font-sans)] mb-3">
              AMARANTA
            </p>
            <blockquote className="font-[var(--font-display)] italic text-2xl text-white leading-relaxed mb-4">
              "Cinta adalah awal dari perjalanan, tujuan, dan perjalanan itu
              sendiri."
            </blockquote>
            <p className="text-sm text-white/50 font-[var(--font-sans)]">
              Dipercaya oleh 500+ pasangan di seluruh Indonesia
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
