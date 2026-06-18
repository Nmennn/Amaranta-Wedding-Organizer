// ============================================================
// src/pages/public/BookingForm.jsx
// FIX:
//   1. MAX tamu disesuaikan dengan placeholder per paket
//      Silver: max 100, Gold: max 200, Platinum: max 500
//   2. Validasi jumlah_tamu dengan batas atas & bawah per tier
//   3. Placeholder jumlah tamu menampilkan range yang sesuai
// ============================================================

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { bookingService, packageService } from "../../services";
import { PACKAGES, formatRupiah } from "../../data/packages";
import Navbar from "../../components/Navbar";
import { toastSuccess, toastError } from "../../hooks/useToast";

// ── Konfigurasi max tamu per tier (sesuai data/packages.js) ──
// Silver:   50–100  tamu
// Gold:     100–200 tamu
// Platinum: 200–500 tamu
const TAMU_CONFIG = {
  silver: {
    min: 50,
    max: 100,
    label: "50–100 tamu",
    placeholder: "Contoh: 80",
  },
  gold: {
    min: 100,
    max: 200,
    label: "100–200 tamu",
    placeholder: "Contoh: 150",
  },
  platinum: {
    min: 200,
    max: 500,
    label: "200–500 tamu",
    placeholder: "Contoh: 300",
  },
};

// ── Helper format ─────────────────────────────────────────────
function fmtDate(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ── Komponen utama ────────────────────────────────────────────
export default function BookingForm() {
  const { tierId } = useParams(); // 'silver' | 'gold' | 'platinum'
  const navigate = useNavigate();

  // ── State form ────────────────────────────────────────────
  const [form, setForm] = useState({
    pemesan_name: "",
    pemesan_email: "",
    pemesan_phone: "",
    wedding_date: "",
    location: "",
    konsep: "",
    notes: "",
    jumlah_tamu: "", // BARU: jumlah tamu (disimpan ke notes atau field khusus)
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [bookedDates, setBookedDates] = useState([]);

  // ── Cari data paket dari local data ──────────────────────
  // BUG FIX: tierId dari URL bisa 'silver','gold','platinum' — pastikan lowercase
  const tierKey = tierId?.toLowerCase();
  const pkg = PACKAGES.find((p) => p.id === tierKey);
  const tamuCfg = TAMU_CONFIG[tierKey] || TAMU_CONFIG.silver;

  // ── Redirect jika tier tidak valid ───────────────────────
  useEffect(() => {
    if (!pkg) {
      toastError("Paket tidak ditemukan.");
      navigate("/paket");
    }
  }, [pkg, navigate]);

  // ── Ambil tanggal yang sudah dibooking ───────────────────
  // Untuk disable tanggal yang tidak tersedia di date picker
  useEffect(() => {
    bookingService
      .getBookedDates?.()
      .then((dates) => setBookedDates(dates || []))
      .catch(() => {}); // silent fail — tidak blokir user
  }, []);

  // ── Handler input generic ─────────────────────────────────
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Hapus error field ini saat user mulai mengetik
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }

  // ── Validasi form ─────────────────────────────────────────
  function validate() {
    const errs = {};

    if (!form.pemesan_name.trim())
      errs.pemesan_name = "Nama pemesan wajib diisi.";

    if (!form.pemesan_email.trim()) errs.pemesan_email = "Email wajib diisi.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.pemesan_email))
      errs.pemesan_email = "Format email tidak valid.";

    if (!form.pemesan_phone.trim())
      errs.pemesan_phone = "Nomor HP wajib diisi.";
    else if (!/^08\d{8,11}$/.test(form.pemesan_phone))
      errs.pemesan_phone = "Format HP tidak valid (contoh: 081234567890).";

    if (!form.wedding_date)
      errs.wedding_date = "Tanggal pernikahan wajib dipilih.";
    else if (new Date(form.wedding_date) <= new Date())
      errs.wedding_date = "Tanggal pernikahan harus di masa depan.";
    else if (bookedDates.includes(form.wedding_date))
      errs.wedding_date = "Tanggal ini sudah dipesan. Silakan pilih tanggal lain.";

    if (!form.location.trim()) errs.location = "Lokasi pernikahan wajib diisi.";

    if (!form.konsep.trim()) errs.konsep = "Konsep pernikahan wajib diisi.";

    // ── VALIDASI JUMLAH TAMU (sesuai range per paket) ──────
    if (!form.jumlah_tamu) {
      errs.jumlah_tamu = "Jumlah tamu wajib diisi.";
    } else {
      const jumlah = parseInt(form.jumlah_tamu, 10);
      if (isNaN(jumlah) || jumlah < 1)
        errs.jumlah_tamu = "Jumlah tamu harus berupa angka positif.";
      else if (jumlah < tamuCfg.min)
        errs.jumlah_tamu = `Jumlah tamu minimal ${tamuCfg.min} orang untuk paket ${pkg?.tier}.`;
      else if (jumlah > tamuCfg.max)
        errs.jumlah_tamu = `Jumlah tamu maksimal ${tamuCfg.max} orang untuk paket ${pkg?.tier}.`;
    }

    return errs;
  }

  // ── Submit ────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      // Scroll ke field pertama yang error
      const firstErrKey = Object.keys(errs)[0];
      document
        .getElementById(firstErrKey)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setLoading(true);
    try {
      // BUG FIX: gabungkan jumlah_tamu ke dalam notes karena
      // backend tidak punya kolom jumlah_tamu di tabel bookings.
      // Jika backend nanti ditambah kolom jumlah_tamu, cukup kirim langsung.
      const notesWithTamu = `Jumlah Tamu: ${form.jumlah_tamu} orang${
        form.notes ? `\n${form.notes}` : ""
      }`;

      const payload = {
        tier_id: tierKey,
        pemesan_name: form.pemesan_name,
        pemesan_email: form.pemesan_email,
        pemesan_phone: form.pemesan_phone,
        wedding_date: form.wedding_date,
        location: form.location,
        konsep: form.konsep,
        notes: notesWithTamu,
      };

      const booking = await bookingService.create(payload);
      toastSuccess("Booking berhasil dibuat! Silakan lanjutkan pembayaran DP.");
      // Redirect ke halaman pemesanan saya
      navigate("/pelanggan/pemesanan");
    } catch (err) {
      const msg = err.userMessage || err.message || "Booking gagal. Coba lagi.";
      toastError(msg);
    } finally {
      setLoading(false);
    }
  }

  if (!pkg) return null;

  const dp = Math.round(pkg.price * 0.3);

  // ── Tanggal minimum: besok ────────────────────────────────
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24">
        {/* ── Breadcrumb ── */}
        <div className="flex items-center gap-2 text-xs text-[var(--color-slate)] font-[var(--font-sans)] mb-8 uppercase tracking-widest">
          <Link
            to="/"
            className="hover:text-[var(--color-gold)] transition-colors"
          >
            Beranda
          </Link>
          <span>/</span>
          <Link
            to="/paket"
            className="hover:text-[var(--color-gold)] transition-colors"
          >
            Paket
          </Link>
          <span>/</span>
          <span className="text-[var(--color-dark)]">
            Pesan Paket {pkg.tier}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Form utama ── */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-[var(--color-cream-border)] p-6 sm:p-8">
              {/* Header */}
              <div className="mb-8">
                <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-gold)] font-[var(--font-sans)] mb-1">
                  Formulir Pemesanan
                </p>
                <h1 className="font-[var(--font-display)] text-3xl text-[var(--color-dark)]">
                  Paket {pkg.tier}
                </h1>
                <p className="text-sm text-[var(--color-slate)] font-[var(--font-sans)] mt-1">
                  {pkg.tagline}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                {/* ── SEKSI: Data Pemesan ── */}
                <fieldset>
                  <legend className="text-xs uppercase tracking-widest text-[var(--color-gold)] font-[var(--font-sans)] mb-4 pb-2 border-b border-[var(--color-cream-border)] w-full">
                    Data Pemesan
                  </legend>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <FormField
                      id="pemesan_name"
                      label="Nama Lengkap"
                      required
                      error={errors.pemesan_name}
                    >
                      <input
                        id="pemesan_name"
                        name="pemesan_name"
                        type="text"
                        value={form.pemesan_name}
                        onChange={handleChange}
                        placeholder="Nama lengkap pemesan"
                        className={inputClass(errors.pemesan_name)}
                      />
                    </FormField>

                    <FormField
                      id="pemesan_email"
                      label="Alamat Email"
                      required
                      error={errors.pemesan_email}
                    >
                      <input
                        id="pemesan_email"
                        name="pemesan_email"
                        type="email"
                        value={form.pemesan_email}
                        onChange={handleChange}
                        placeholder="email@contoh.com"
                        className={inputClass(errors.pemesan_email)}
                      />
                    </FormField>

                    <FormField
                      id="pemesan_phone"
                      label="Nomor HP"
                      required
                      error={errors.pemesan_phone}
                    >
                      <input
                        id="pemesan_phone"
                        name="pemesan_phone"
                        type="tel"
                        value={form.pemesan_phone}
                        onChange={handleChange}
                        placeholder="081234567890"
                        className={inputClass(errors.pemesan_phone)}
                      />
                    </FormField>
                  </div>
                </fieldset>

                {/* ── SEKSI: Detail Pernikahan ── */}
                <fieldset>
                  <legend className="text-xs uppercase tracking-widest text-[var(--color-gold)] font-[var(--font-sans)] mb-4 pb-2 border-b border-[var(--color-cream-border)] w-full">
                    Detail Pernikahan
                  </legend>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <FormField
                      id="wedding_date"
                      label="Tanggal Pernikahan"
                      required
                      error={errors.wedding_date}
                    >
                      <input
                        id="wedding_date"
                        name="wedding_date"
                        type="date"
                        value={form.wedding_date}
                        onChange={handleChange}
                        min={minDate}
                        className={inputClass(errors.wedding_date)}
                      />
                      {form.wedding_date && (
                        <p className="text-xs text-[var(--color-slate)] font-[var(--font-sans)] mt-1">
                          {fmtDate(form.wedding_date)}
                        </p>
                      )}
                      {bookedDates.length > 0 && (
                        <div className="mt-2 text-[10px] text-red-600 font-[var(--font-sans)] bg-red-50/50 p-2.5 border border-red-200">
                          <span className="font-semibold block mb-1 uppercase tracking-wider text-[9px] text-red-700">⚠️ Tanggal Sudah Dipesan (Tidak Tersedia):</span>
                          <div className="flex flex-wrap gap-1">
                            {bookedDates.map(d => (
                              <span key={d} className="px-2 py-0.5 bg-white border border-red-100 font-mono font-medium text-red-700">
                                {new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </FormField>

                    {/* ── JUMLAH TAMU (dengan MAX sesuai paket) ── */}
                    <FormField
                      id="jumlah_tamu"
                      label="Jumlah Tamu"
                      required
                      error={errors.jumlah_tamu}
                      hint={`Kapasitas paket ${pkg.tier}: ${tamuCfg.label}`}
                    >
                      <input
                        id="jumlah_tamu"
                        name="jumlah_tamu"
                        type="number"
                        value={form.jumlah_tamu}
                        onChange={handleChange}
                        placeholder={tamuCfg.placeholder}
                        // BUG FIX: min & max sesuai paket yang dipilih
                        min={tamuCfg.min}
                        max={tamuCfg.max}
                        step="1"
                        className={inputClass(errors.jumlah_tamu)}
                      />
                    </FormField>

                    <FormField
                      id="location"
                      label="Lokasi Pernikahan"
                      required
                      error={errors.location}
                      className="sm:col-span-2"
                    >
                      <input
                        id="location"
                        name="location"
                        type="text"
                        value={form.location}
                        onChange={handleChange}
                        placeholder="Nama gedung / venue / alamat lengkap"
                        className={inputClass(errors.location)}
                      />
                    </FormField>

                    <FormField
                      id="konsep"
                      label="Konsep / Tema Pernikahan"
                      required
                      error={errors.konsep}
                      className="sm:col-span-2"
                    >
                      <input
                        id="konsep"
                        name="konsep"
                        type="text"
                        value={form.konsep}
                        onChange={handleChange}
                        placeholder="Contoh: Garden Romantic, Modern Minimalist, Javanese Traditional"
                        className={inputClass(errors.konsep)}
                      />
                    </FormField>

                    <FormField
                      id="notes"
                      label="Catatan Tambahan"
                      error={errors.notes}
                      className="sm:col-span-2"
                    >
                      <textarea
                        id="notes"
                        name="notes"
                        value={form.notes}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Permintaan khusus, alergi makanan, kebutuhan aksesibilitas, dll."
                        className={`${inputClass(errors.notes)} resize-none`}
                      />
                    </FormField>
                  </div>
                </fieldset>

                {/* ── SUBMIT ── */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className={[
                      "w-full py-4 text-sm uppercase tracking-widest font-medium font-[var(--font-sans)] transition-all",
                      loading
                        ? "bg-[var(--color-dark)]/50 text-white cursor-not-allowed"
                        : "bg-[var(--color-dark)] text-[var(--color-cream)] hover:bg-[var(--color-charcoal)]",
                    ].join(" ")}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        Memproses...
                      </span>
                    ) : (
                      "Konfirmasi & Pesan Sekarang"
                    )}
                  </button>
                  <p className="text-xs text-center text-[var(--color-slate)] font-[var(--font-sans)] mt-3">
                    Dengan memesan, Anda menyetujui{" "}
                    <span className="text-[var(--color-gold)]">
                      syarat & ketentuan
                    </span>{" "}
                    AMARANTA.
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* ── Sidebar ringkasan paket ── */}
          <div className="space-y-4">
            {/* Ringkasan Paket */}
            <div className="bg-white border border-[var(--color-cream-border)] p-6 sticky top-24">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-gold)] font-[var(--font-sans)] mb-3">
                Ringkasan Pesanan
              </p>

              {/* Badge tier */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-8 h-8 rounded-full flex-shrink-0"
                  style={{ background: pkg.color }}
                />
                <div>
                  <h3 className="font-[var(--font-display)] text-xl text-[var(--color-dark)]">
                    Paket {pkg.tier}
                  </h3>
                  <p className="text-xs text-[var(--color-slate)] font-[var(--font-sans)]">
                    {pkg.duration} · {tamuCfg.label}
                  </p>
                </div>
              </div>

              {/* Layanan termasuk */}
              <ul className="space-y-2 mb-5 border-t border-[var(--color-cream-border)] pt-4">
                {pkg.includes.slice(0, 5).map((item) => (
                  <li
                    key={item.label}
                    className="flex items-start gap-2 text-xs text-[var(--color-dark-muted)] font-[var(--font-sans)]"
                  >
                    <svg
                      className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
                      style={{ color: pkg.color }}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {item.label}
                  </li>
                ))}
                {pkg.includes.length > 5 && (
                  <li className="text-xs text-[var(--color-gold)] font-[var(--font-sans)] pl-5">
                    +{pkg.includes.length - 5} layanan lainnya
                  </li>
                )}
              </ul>

              {/* Harga */}
              <div className="border-t border-[var(--color-cream-border)] pt-4 space-y-2">
                <div className="flex justify-between text-sm font-[var(--font-sans)]">
                  <span className="text-[var(--color-dark-muted)]">
                    Total Paket
                  </span>
                  <span className="font-medium text-[var(--color-dark)]">
                    {formatRupiah(pkg.price)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-[var(--font-sans)]">
                  <span className="text-[var(--color-dark-muted)]">
                    DP 30% (sekarang)
                  </span>
                  <span className="font-semibold text-[var(--color-gold)]">
                    {formatRupiah(dp)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-[var(--font-sans)]">
                  <span className="text-[var(--color-dark-muted)]">
                    Pelunasan 70%
                  </span>
                  <span className="text-[var(--color-dark-muted)]">
                    {formatRupiah(pkg.price - dp)}
                  </span>
                </div>
              </div>

              {/* Kapasitas tamu info box */}
              <div className="mt-4 p-3 bg-[var(--color-gold-pale)] border border-[var(--color-gold)]/30">
                <p className="text-[10px] uppercase tracking-widest text-[var(--color-gold)] font-[var(--font-sans)] mb-1">
                  Kapasitas Tamu
                </p>
                <p className="text-sm font-medium text-[var(--color-dark)] font-[var(--font-sans)]">
                  {tamuCfg.label}
                </p>
                <p className="text-xs text-[var(--color-dark-muted)] font-[var(--font-sans)] mt-0.5">
                  Maks. {tamuCfg.max} orang untuk paket ini
                </p>
              </div>
            </div>

            {/* Info DP */}
            <div className="bg-[var(--color-dark)] text-[var(--color-cream)] p-5">
              <p className="text-[10px] uppercase tracking-widest text-[var(--color-gold)] font-[var(--font-sans)] mb-2">
                Info Pembayaran
              </p>
              <p className="text-xs font-[var(--font-sans)] text-white/70 leading-relaxed">
                Setelah booking dikonfirmasi, Anda akan diarahkan untuk membayar
                <strong className="text-[var(--color-gold)]">
                  {" "}
                  DP 30%
                </strong>{" "}
                sebesar <strong>{formatRupiah(dp)}</strong> untuk mengamankan
                tanggal pernikahan Anda.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-komponen helper ───────────────────────────────────────
function FormField({
  id,
  label,
  required,
  error,
  hint,
  children,
  className = "",
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-medium text-[var(--color-dark-muted)] font-[var(--font-sans)] uppercase tracking-wide"
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      {children}
      {error && (
        <p
          className="text-xs text-red-500 font-[var(--font-sans)]"
          role="alert"
        >
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs text-[var(--color-slate)] font-[var(--font-sans)]">
          {hint}
        </p>
      )}
    </div>
  );
}

function inputClass(hasError) {
  return [
    "w-full bg-transparent border-b-2 px-0 py-2.5",
    "text-sm text-[var(--color-dark)] font-[var(--font-sans)]",
    "placeholder:text-[var(--color-slate)]",
    "outline-none transition-colors duration-200",
    hasError
      ? "border-red-400 focus:border-red-500"
      : "border-[var(--color-cream-border)] focus:border-[var(--color-gold)]",
  ].join(" ");
}
