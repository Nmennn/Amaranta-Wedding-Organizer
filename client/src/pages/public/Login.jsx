// ============================================================
// src/pages/public/Login.jsx
// Halaman Masuk dengan panel akun demo
// ============================================================
import { useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Navbar from "../../components/Navbar";

// Daftar akun demo — harus sama dengan MOCK_USERS di mocks/mockAuth.js
var DEMO = [
  {
    badge: "👑",
    role: "Admin",
    email: "admin@aeterna.id",
    password: "admin123",
    tuju: "/admin/dashboard",
    warna: "#1C1A17",
  },
  {
    badge: "🏪",
    role: "Vendor",
    email: "vendor@aeterna.id",
    password: "vendor123",
    tuju: "/vendor-panel/dashboard",
    warna: "#C9A96E",
  },
  {
    badge: "💍",
    role: "Customer",
    email: "customer@aeterna.id",
    password: "customer123",
    tuju: "/pelanggan/pemesanan",
    warna: "#3B6D11",
  },
];

// Panel akun demo — klik kartu → isi form otomatis
function PanelDemo({ onPilih }) {
  var [tampil, setTampil] = useState(true);

  if (!tampil) {
    return (
      <button
        type="button"
        onClick={function () {
          setTampil(true);
        }}
        className="w-full mb-6 py-2.5 border border-dashed border-[var(--color-gold)]/40 text-xs text-[var(--color-slate)] font-[var(--font-sans)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-colors"
      >
        🔧 Tampilkan Akun Demo
      </button>
    );
  }

  return (
    <div className="mb-7 border border-dashed border-[var(--color-gold)]/50 bg-amber-50/40 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p
          className="text-[10px] uppercase tracking-widest font-bold font-[var(--font-sans)]"
          style={{ color: "var(--color-gold)" }}
        >
          🔧 Mode Demo — Klik untuk mengisi form
        </p>
        <button
          type="button"
          onClick={function () {
            setTampil(false);
          }}
          className="text-[10px] text-[var(--color-slate)] hover:text-[var(--color-dark)] font-[var(--font-sans)] transition-colors"
        >
          Sembunyikan ✕
        </button>
      </div>

      {/* Kartu akun */}
      <div className="space-y-2">
        {DEMO.map(function (akun) {
          return (
            <button
              key={akun.role}
              type="button"
              onClick={function () {
                onPilih(akun.email, akun.password);
              }}
              className="w-full flex items-start gap-3 p-3 bg-white border border-[var(--color-cream-border)] hover:border-[var(--color-gold)] hover:shadow-sm transition-all text-left group"
            >
              {/* Ikon */}
              <div
                className="w-8 h-8 flex items-center justify-center flex-shrink-0 text-lg rounded-full"
                style={{ backgroundColor: akun.warna + "18" }}
              >
                {akun.badge}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                {/* Role + tuju */}
                <div className="flex items-baseline gap-2 flex-wrap mb-0.5">
                  <span
                    className="text-xs font-bold font-[var(--font-sans)] uppercase tracking-widest"
                    style={{ color: akun.warna }}
                  >
                    {akun.role}
                  </span>
                  <span className="text-[9px] text-[var(--color-slate)] font-[var(--font-sans)]">
                    → {akun.tuju}
                  </span>
                </div>
                {/* Email */}
                <p className="text-xs text-[var(--color-dark)] font-[var(--font-sans)] font-medium">
                  {akun.email}
                </p>
                {/* Password */}
                <p className="text-[10px] text-[var(--color-slate)] font-[var(--font-sans)]">
                  Password:&nbsp;
                  <code className="font-mono bg-[var(--color-parchment)] px-1 rounded">
                    {akun.password}
                  </code>
                </p>
              </div>

              {/* Hint hover */}
              <span className="text-[10px] text-[var(--color-gold)] opacity-0 group-hover:opacity-100 transition-opacity self-center flex-shrink-0">
                Isi →
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-[10px] text-[var(--color-slate)] font-[var(--font-sans)] mt-3 text-center">
        Klik kartu → form terisi otomatis → tekan Masuk
      </p>
    </div>
  );
}

// Halaman Login utama
function Login() {
  var [form, setForm] = useState({ email: "", password: "" });
  var [showPw, setShowPw] = useState(false);

  var auth = useAuth();

  // Dipanggil PanelDemo saat user klik kartu akun
  function handlePilihDemo(email, password) {
    setForm({ email: email, password: password });
    auth.clearError();
  }

  function handleChange(e) {
    setForm(function (prev) {
      var next = {};
      next.email = prev.email;
      next.password = prev.password;
      next[e.target.name] = e.target.value;
      return next;
    });
    auth.clearError();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.email || !form.password) return;
    try {
      await auth.login(form);
      // useAuth.login akan navigasi otomatis ke dashboard sesuai role
    } catch (err) {
      // Error sudah disimpan di authStore.error, ditampilkan di bawah
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      <Navbar />

      <div className="min-h-screen grid md:grid-cols-2">
        {/* ── Kiri: Form ─────────────────────────── */}
        <div className="flex flex-col px-8 lg:px-14 py-12 bg-[var(--color-ivory)]">
          <div className="flex-1 flex flex-col justify-center">
            <div className="max-w-sm w-full mx-auto">
              <h1 className="font-[var(--font-display)] text-4xl text-[var(--color-dark)] mb-1">
                Selamat Datang
              </h1>
              <p className="text-sm text-[var(--color-slate)] font-[var(--font-sans)] mb-8">
                Masuk untuk melanjutkan perjalanan pernikahan Anda.
              </p>

              {/* Panel demo */}
              <PanelDemo onPilih={handlePilihDemo} />

              {/* Pesan error */}
              {auth.error && (
                <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 text-sm text-red-600 font-[var(--font-sans)]">
                  ⚠️ {auth.error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="email@domain.com"
                  required
                  autoComplete="email"
                />

                <Input
                  label="Password"
                  type={showPw ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  rightIcon={
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={function () {
                        setShowPw(!showPw);
                      }}
                      className="text-[var(--color-slate)] hover:text-[var(--color-dark)] transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        {showPw ? (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l18 18"
                          />
                        ) : (
                          <>
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </>
                        )}
                      </svg>
                    </button>
                  }
                />

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-[var(--color-gold)]"
                    />
                    <span className="text-xs text-[var(--color-slate)] font-[var(--font-sans)]">
                      Ingat saya
                    </span>
                  </label>
                  <Link
                    to="#"
                    className="text-xs text-[var(--color-gold)] hover:underline font-[var(--font-sans)]"
                  >
                    Lupa password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={auth.isLoading}
                  size="lg"
                >
                  {auth.isLoading ? "Sedang masuk..." : "Masuk"}
                </Button>
              </form>

              {/* Divider */}
              <div className="my-7 flex items-center gap-4">
                <div className="flex-1 h-px bg-[var(--color-cream-border)]" />
                <span className="text-xs text-[var(--color-slate)] font-[var(--font-sans)]">
                  atau
                </span>
                <div className="flex-1 h-px bg-[var(--color-cream-border)]" />
              </div>

              <p className="text-sm text-center text-[var(--color-dark-muted)] font-[var(--font-sans)]">
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

        {/* ── Kanan: Gambar ───────────────────────── */}
        <div className="hidden md:block relative overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&q=90"
            alt="Dekorasi pernikahan"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[var(--color-dark)]/30" />
          <div className="absolute bottom-12 left-8 right-8">
            <blockquote className="font-[var(--font-display)] italic text-xl text-white leading-relaxed">
              "Cinta adalah awal dari perjalanan, tujuan, dan perjalanan itu
              sendiri."
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
