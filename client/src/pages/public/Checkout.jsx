// ============================================================
// src/pages/public/Checkout.jsx
// Alur baru: Customer memilih paket → isi detail → bayar DP
// TIDAK ada pemilihan vendor — admin yang menentukan vendor
//
// Field baru ke API:
//   package_id     ← diambil dari item cart
//   location       ← lokasi/kota acara (WAJIB, bukan bagian dari notes)
//   konsep         ← tema pernikahan  (WAJIB, bukan bagian dari notes)
// ============================================================
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import useCartStore from "../../store/cartStore";
import useAuthStore from "../../store/authStore";
import { PACKAGES, formatRupiah } from "../../data/packages";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const PAYMENT_GROUPS = [
  {
    label: "Transfer Virtual Account",
    methods: [
      { id: "bca", name: "BCA Virtual Account", icon: "🏦" },
      { id: "mandiri", name: "Mandiri Virtual Account", icon: "🏦" },
      { id: "bni", name: "BNI Virtual Account", icon: "🏦" },
      { id: "bri", name: "BRI Virtual Account", icon: "🏦" },
    ],
  },
  {
    label: "Dompet Digital",
    methods: [
      { id: "gopay", name: "GoPay", icon: "💚" },
      { id: "ovo", name: "OVO", icon: "💜" },
      { id: "dana", name: "DANA", icon: "💙" },
      { id: "shopeepay", name: "ShopeePay", icon: "🟠" },
    ],
  },
  {
    label: "Lainnya",
    methods: [
      { id: "qris", name: "QRIS", icon: "📱" },
      { id: "cc", name: "Kartu Kredit / Debit", icon: "💳" },
    ],
  },
];

const snapReady = () =>
  typeof window !== "undefined" && typeof window.snap !== "undefined";

// ── Ringkasan Pesanan ─────────────────────────────────────────
function OrderSummary({ items, total, dp, payType, setPayType }) {
  const bayar = payType === "dp" ? dp : total;
  return (
    <div className="bg-white border border-[var(--color-cream-border)] p-6">
      <h2 className="font-[var(--font-display)] text-xl text-[var(--color-dark)] mb-4">
        Ringkasan Pesanan
      </h2>

      <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
        {items.map((item) => {
          const pkg = PACKAGES.find((p) => p.id === item.tierId);
          return (
            <div
              key={item.cartId}
              className="flex justify-between text-sm font-[var(--font-sans)] gap-2"
            >
              <span className="text-[var(--color-dark-muted)] truncate">
                AMARANTA
                <span className="ml-1 text-xs" style={{ color: pkg?.color }}>
                  · Paket {item.tierLabel}
                </span>
              </span>
              <span className="flex-shrink-0 font-medium">
                {formatRupiah(item.price)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="gold-rule mb-4" />

      {/* Toggle DP atau Lunas */}
      {setPayType && (
        <div className="mb-4">
          <p className="text-xs text-[var(--color-dark-muted)] font-[var(--font-sans)] mb-2 font-medium">
            Pilih Nominal Pembayaran:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              {
                val: "dp",
                label: "DP 30%",
                sub: formatRupiah(dp),
                note: "Bayar sekarang",
              },
              {
                val: "full",
                label: "Lunas",
                sub: formatRupiah(total),
                note: "Hemat proses",
              },
            ].map(({ val, label, sub, note }) => (
              <button
                key={val}
                onClick={() => setPayType(val)}
                className={[
                  "p-3 border text-left transition-all",
                  payType === val
                    ? "border-[var(--color-gold)] bg-[var(--color-gold-pale)]"
                    : "border-[var(--color-cream-border)] hover:border-[var(--color-gold)]/50",
                ].join(" ")}
              >
                <p className="text-xs font-medium text-[var(--color-dark)] font-[var(--font-sans)]">
                  {label}
                </p>
                <p className="font-[var(--font-display)] text-lg text-[var(--color-gold)]">
                  {sub}
                </p>
                <p className="text-[10px] text-[var(--color-slate)] font-[var(--font-sans)]">
                  {note}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between items-baseline mt-3">
        <span className="text-sm text-[var(--color-dark-muted)] font-[var(--font-sans)]">
          Dibayar sekarang
        </span>
        <span className="font-[var(--font-display)] text-2xl text-[var(--color-gold)]">
          {formatRupiah(bayar)}
        </span>
      </div>
      {payType === "dp" && (
        <p className="text-xs text-[var(--color-slate)] font-[var(--font-sans)] mt-1">
          Sisa {formatRupiah(total - dp)} dibayar setelah vendor dikonfirmasi
        </p>
      )}

      {/* Info alur vendor */}
      <div className="mt-4 p-3 bg-[var(--color-cream)] border border-[var(--color-cream-border)]">
        <p className="text-[10px] uppercase tracking-widest text-[var(--color-slate)] font-[var(--font-sans)] mb-1">
          Alur Selanjutnya
        </p>
        <p className="text-xs text-[var(--color-dark-muted)] font-[var(--font-sans)] leading-relaxed">
          Setelah DP masuk, tim AMARANTA akan memilih vendor terbaik untuk acara
          Anda dan menghubungi Anda untuk tech meeting.
        </p>
      </div>
    </div>
  );
}

// ── Field label reusable ──────────────────────────────────────
function Field({ label, required, hint, error, children }) {
  return (
    <div>
      <label className="text-sm font-medium text-[var(--color-dark-muted)] font-[var(--font-sans)] block mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-500 font-[var(--font-sans)] mt-1">
          {error}
        </p>
      )}
      {!error && hint && (
        <p className="text-xs text-[var(--color-slate)] font-[var(--font-sans)] mt-1">
          {hint}
        </p>
      )}
    </div>
  );
}

const fieldCls = (error) =>
  [
    "w-full border-b-2 bg-transparent py-2 text-sm font-[var(--font-sans)] text-[var(--color-dark)] outline-none transition-colors",
    error
      ? "border-red-400"
      : "border-[var(--color-cream-border)] focus:border-[var(--color-gold)]",
  ].join(" ");

// ── Komponen Utama ────────────────────────────────────────────
function Checkout() {
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [method, setMethod] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [payType, setPayType] = useState("dp");
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");

  const [form, setForm] = useState({
    // Informasi pemesan
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    // Detail acara (field baru — dikirim ke backend sebagai kolom terpisah)
    wedding_date: items[0]?.weddingDate || "",
    location: "", // kota/venue — wajib, dikirim ke kolom `location`
    konsep: "", // tema pernikahan — wajib, dikirim ke kolom `konsep`
    guest_count: "", // perkiraan tamu — masuk notes
    notes: "", // catatan lain
  });

  const total = items.reduce((a, i) => a + i.price, 0);
  const dp = Math.round(total * 0.3);
  const bayar = payType === "dp" ? dp : total;

  const today = new Date().toISOString().split("T")[0];

  function handleChange(e) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name])
      setErrors((p) => ({ ...p, [e.target.name]: "" }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Nama wajib diisi";
    if (!form.email.includes("@")) e.email = "Email tidak valid";
    if (!form.phone.match(/^08/)) e.phone = "Format HP: 08xxxxxxxxxx";
    if (!form.wedding_date) e.wedding_date = "Tanggal pernikahan wajib diisi";
    if (!form.location.trim()) e.location = "Lokasi acara wajib diisi";
    if (!form.konsep.trim()) e.konsep = "Konsep pernikahan wajib diisi";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const API = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
  const authHeader = {
    Authorization:
      "Bearer " + (localStorage.getItem("amaranta_token") || token || ""),
  };

  async function handlePay() {
    if (!method) {
      setApiError("Pilih metode pembayaran.");
      return;
    }
    setLoading(true);
    setApiError("");

    try {
      // ── Buat booking ke backend ──────────────────────────────
      // PERUBAHAN PENTING:
      //   - Kirim package_id (bukan vendor_id)
      //   - location dan konsep sebagai kolom terpisah
      //   - vendor_id = null (diisi admin)
      const packageId = items[0]?.tierId; // tierId = 'silver'|'gold'|'platinum'
      // Cari package dari data lokal
      const pkgData = PACKAGES.find((p) => p.id === packageId);

      // Notes gabungan untuk info tambahan
      const notesArr = [];
      if (form.guest_count)
        notesArr.push(`Perkiraan tamu: ${form.guest_count} orang`);
      if (form.notes) notesArr.push(form.notes);

      const bkRes = await fetch(API + "/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...authHeader,
        },
        body: JSON.stringify({
          // Package dipilih dari cart — backend cari package by tier_id atau id
          package_id: items[0]?.packageId || pkgData?.id || packageId,
          pemesan_name: form.name,
          pemesan_email: form.email,
          pemesan_phone: form.phone,
          wedding_date: form.wedding_date,
          location: form.location, // FIELD BARU — kolom terpisah di DB
          konsep: form.konsep, // FIELD BARU — kolom terpisah di DB
          notes: notesArr.join("\n") || null,
          // vendor_id TIDAK dikirim — null secara default, diisi admin
        }),
      });

      const bkData = await bkRes.json();
      if (!bkRes.ok) {
        // Tampilkan pesan validasi dari Laravel
        if (bkData.errors) {
          const firstErr = Object.values(bkData.errors).flat()[0];
          setApiError(firstErr || "Data tidak valid.");
        } else {
          setApiError(bkData.message || "Gagal membuat booking.");
        }
        setLoading(false);
        return;
      }

      const bookingId = bkData.data?.id;

      // ── Minta Snap token Midtrans ────────────────────────────
      const ep = payType === "dp" ? "pay-dp" : "pay-full";
      const pyRes = await fetch(`${API}/bookings/${bookingId}/${ep}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...authHeader,
        },
      });
      const pyData = await pyRes.json();
      if (!pyRes.ok) {
        setApiError(pyData.message || "Gagal proses bayar.");
        setLoading(false);
        return;
      }

      // ── Buka Midtrans Snap ───────────────────────────────────
      if (snapReady()) {
        window.snap.pay(pyData.snap_token, {
          onSuccess: (r) => {
            clearCart();
            setOrderId(r.order_id || bkData.data?.order_id);
            setLoading(false);
            setStep(3);
          },
          onPending: () => {
            setApiError("Menunggu konfirmasi pembayaran.");
            setLoading(false);
          },
          onError: () => {
            setApiError("Pembayaran gagal. Coba metode lain.");
            setLoading(false);
          },
          onClose: () => setLoading(false),
        });
      } else {
        // Simulasi untuk development (Snap.js belum dimuat)
        setTimeout(() => {
          clearCart();
          setOrderId(
            bkData.data?.order_id ||
              "AMRT-DEMO-" + Date.now().toString().slice(-6),
          );
          setLoading(false);
          setStep(3);
        }, 1500);
      }
    } catch {
      setApiError("Tidak bisa terhubung ke server.");
      setLoading(false);
    }
  }

  // Keranjang kosong
  if (items.length === 0 && step !== 3) {
    return (
      <div className="min-h-screen bg-[var(--color-cream)]">
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 py-24 text-center">
          <h2 className="font-[var(--font-display)] text-3xl text-[var(--color-dark)] mb-4">
            Belum Ada Paket Dipilih
          </h2>
          <Link
            to="/paket"
            className="text-[var(--color-gold)] hover:underline font-[var(--font-sans)]"
          >
            Pilih paket →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-12 py-8">
        {/* Step indicator */}
        {step < 3 && (
          <div className="flex items-center gap-2 mb-10">
            {["Detail Pemesanan", "Metode Bayar", "Konfirmasi"].map(
              (label, i) => (
                <div key={label} className="flex items-center gap-2">
                  <div
                    className={[
                      "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-[var(--font-sans)] transition-all",
                      step > i + 1
                        ? "bg-emerald-500 text-white"
                        : step === i + 1
                          ? "bg-[var(--color-gold)] text-[var(--color-dark)]"
                          : "bg-[var(--color-cream-border)] text-[var(--color-slate)]",
                    ].join(" ")}
                  >
                    {step > i + 1 ? "✓" : i + 1}
                  </div>
                  <span
                    className={[
                      "text-xs font-[var(--font-sans)] uppercase tracking-widest hidden sm:inline",
                      step >= i + 1
                        ? "text-[var(--color-dark)]"
                        : "text-[var(--color-slate)]",
                    ].join(" ")}
                  >
                    {label}
                  </span>
                  {i < 2 && (
                    <div
                      className={[
                        "h-px w-5 sm:w-8 transition-all",
                        step > i + 1
                          ? "bg-emerald-500"
                          : "bg-[var(--color-cream-border)]",
                      ].join(" ")}
                    />
                  )}
                </div>
              ),
            )}
          </div>
        )}

        {/* ── STEP 1: Detail Pemesanan ── */}
        {step === 1 && (
          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-6">
              <h1 className="font-[var(--font-display)] text-3xl text-[var(--color-dark)]">
                Detail Pemesanan
              </h1>

              {/* Blok 1: Info kontak */}
              <div className="bg-white border border-[var(--color-cream-border)] p-6">
                <h2 className="text-xs uppercase tracking-widest text-[var(--color-slate)] font-[var(--font-sans)] mb-5 pb-3 border-b border-[var(--color-cream-border)]">
                  Informasi Kontak
                </h2>
                <div className="space-y-4">
                  <Input
                    label="Nama Lengkap Pemesan"
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
                    hint="Konfirmasi booking & update dari admin dikirim ke sini"
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
                    hint="Tim AMARANTA menghubungi lewat nomor ini"
                  />
                </div>
              </div>

              {/* Blok 2: Detail acara */}
              <div className="bg-white border border-[var(--color-cream-border)] p-6">
                <div className="mb-5 pb-3 border-b border-[var(--color-cream-border)]">
                  <h2 className="text-xs uppercase tracking-widest text-[var(--color-slate)] font-[var(--font-sans)] mb-1">
                    Detail Acara
                  </h2>
                  <p className="text-xs text-[var(--color-slate)] font-[var(--font-sans)]">
                    Digunakan tim AMARANTA untuk memilih vendor dan menyiapkan
                    acara Anda.
                  </p>
                </div>

                <div className="space-y-5">
                  {/* Tanggal */}
                  <Field
                    label="Tanggal Pernikahan"
                    required
                    error={errors.wedding_date}
                  >
                    <input
                      type="date"
                      name="wedding_date"
                      value={form.wedding_date}
                      onChange={handleChange}
                      min={today}
                      className={fieldCls(errors.wedding_date)}
                    />
                  </Field>

                  {/* Lokasi */}
                  <Field
                    label="Lokasi Acara"
                    required
                    error={errors.location}
                    hint="Kota dan nama gedung/venue jika sudah ada"
                  >
                    <input
                      type="text"
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      placeholder="contoh: Jakarta Selatan, Gedung Smesco"
                      className={fieldCls(errors.location)}
                    />
                  </Field>

                  {/* Konsep */}
                  <Field
                    label="Konsep / Tema Pernikahan"
                    required
                    error={errors.konsep}
                    hint="Tema warna, gaya dekorasi, atau suasana yang diinginkan"
                  >
                    <input
                      type="text"
                      name="konsep"
                      value={form.konsep}
                      onChange={handleChange}
                      placeholder="contoh: Garden Romantic, Rustic Outdoor, Modern Minimalist"
                      className={fieldCls(errors.konsep)}
                    />
                  </Field>

                  {/* Jumlah tamu + catatan (tidak wajib) */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Perkiraan Jumlah Tamu">
                      <input
                        type="number"
                        name="guest_count"
                        value={form.guest_count}
                        onChange={handleChange}
                        placeholder="contoh: 150"
                        min="1"
                        className={fieldCls(false)}
                      />
                    </Field>

                    <Field label="Catatan Tambahan">
                      <input
                        type="text"
                        name="notes"
                        value={form.notes}
                        onChange={handleChange}
                        placeholder="Permintaan khusus..."
                        className={fieldCls(false)}
                      />
                    </Field>
                  </div>
                </div>
              </div>

              {apiError && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 text-sm text-red-600 font-[var(--font-sans)]">
                  ⚠️ {apiError}
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  variant="gold"
                  size="lg"
                  onClick={() => {
                    if (validate()) setStep(2);
                  }}
                >
                  Lanjut ke Pembayaran →
                </Button>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="sticky top-20">
                <OrderSummary
                  items={items}
                  total={total}
                  dp={dp}
                  payType={payType}
                  setPayType={setPayType}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Metode Bayar ── */}
        {step === 2 && (
          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <h1 className="font-[var(--font-display)] text-3xl text-[var(--color-dark)] mb-6">
                Metode Pembayaran
              </h1>

              {/* Badge Midtrans */}
              <div className="mb-5 px-4 py-3 bg-blue-50 border border-blue-100 flex items-center gap-3">
                <span className="text-xl flex-shrink-0">🔒</span>
                <div>
                  <p className="text-xs font-medium text-blue-800 font-[var(--font-sans)]">
                    Diamankan oleh Midtrans
                  </p>
                  <p className="text-xs text-blue-500 font-[var(--font-sans)]">
                    {snapReady() ? "✅ Snap siap" : "⚠️ Mode simulasi (dev)"}
                  </p>
                </div>
              </div>

              {/* Ringkasan detail acara */}
              <div className="mb-5 bg-[var(--color-cream)] border border-[var(--color-cream-border)] p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] uppercase tracking-widest text-[var(--color-slate)] font-[var(--font-sans)]">
                    Ringkasan Acara
                  </p>
                  <button
                    onClick={() => setStep(1)}
                    className="text-xs text-[var(--color-gold)] hover:underline font-[var(--font-sans)]"
                  >
                    ✎ Edit
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs font-[var(--font-sans)]">
                  {[
                    { label: "Pemesan", value: form.name },
                    { label: "Tanggal", value: form.wedding_date },
                    { label: "Lokasi", value: form.location },
                    { label: "Konsep", value: form.konsep },
                    form.guest_count && {
                      label: "Tamu",
                      value: form.guest_count + " orang",
                    },
                  ]
                    .filter(Boolean)
                    .map(({ label, value }) => (
                      <div key={label} className="flex gap-1">
                        <span className="text-[var(--color-slate)] flex-shrink-0">
                          {label}:
                        </span>
                        <span className="text-[var(--color-dark)] font-medium truncate">
                          {value}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Pilihan metode bayar */}
              {apiError && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-sm text-red-600 font-[var(--font-sans)]">
                  ⚠️ {apiError}
                </div>
              )}

              <div className="bg-white border border-[var(--color-cream-border)] p-5 space-y-5 mb-5">
                {PAYMENT_GROUPS.map((group) => (
                  <div key={group.label}>
                    <p className="text-[10px] uppercase tracking-widest text-[var(--color-slate)] font-[var(--font-sans)] mb-2">
                      {group.label}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {group.methods.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => {
                            setMethod(m.id);
                            setApiError("");
                          }}
                          className={[
                            "flex items-center gap-2 p-3 border text-left transition-all",
                            method === m.id
                              ? "border-[var(--color-gold)] bg-[var(--color-gold-pale)]"
                              : "border-[var(--color-cream-border)] hover:border-[var(--color-gold)]/50",
                          ].join(" ")}
                        >
                          <span className="text-base flex-shrink-0">
                            {m.icon}
                          </span>
                          <span className="text-xs text-[var(--color-dark)] font-[var(--font-sans)] leading-tight">
                            {m.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-[var(--color-slate)] hover:text-[var(--color-dark)] font-[var(--font-sans)] transition-colors"
                >
                  ← Kembali
                </button>
                <Button
                  variant="gold"
                  size="lg"
                  isLoading={loading}
                  onClick={handlePay}
                  disabled={!method}
                >
                  Bayar {formatRupiah(bayar)}
                </Button>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="sticky top-20">
                <OrderSummary
                  items={items}
                  total={total}
                  dp={dp}
                  payType={payType}
                  setPayType={null}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3: Sukses ── */}
        {step === 3 && (
          <div className="max-w-lg mx-auto text-center py-16">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-emerald-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-gold)] font-[var(--font-sans)] mb-3">
              Pembayaran Berhasil
            </p>
            <h1 className="font-[var(--font-display)] text-4xl text-[var(--color-dark)] mb-3">
              Pesanan Dikonfirmasi!
            </h1>
            <p className="font-[var(--font-display)] text-2xl text-[var(--color-gold)] mb-2 tracking-widest">
              {orderId}
            </p>
            <p className="text-sm text-[var(--color-dark-muted)] font-[var(--font-sans)] mb-8 leading-relaxed">
              Konfirmasi dikirim ke <strong>{form.email}</strong>. Tim AMARANTA
              akan menghubungi Anda di <strong>{form.phone}</strong>
              dalam 1×24 jam untuk koordinasi lebih lanjut.
            </p>

            {/* Ringkasan acara di halaman sukses */}
            <div className="bg-white border border-[var(--color-cream-border)] p-5 mb-8 text-left">
              <p className="text-[10px] uppercase tracking-widest text-[var(--color-slate)] font-[var(--font-sans)] mb-3">
                Detail Acara Anda
              </p>
              <div className="space-y-2 text-sm font-[var(--font-sans)]">
                {[
                  { label: "Tanggal", value: form.wedding_date },
                  { label: "Lokasi", value: form.location },
                  { label: "Konsep", value: form.konsep },
                  form.guest_count && {
                    label: "Tamu",
                    value: form.guest_count + " orang",
                  },
                ]
                  .filter(Boolean)
                  .map(({ label, value }) => (
                    <div key={label} className="flex gap-2">
                      <span className="text-[var(--color-slate)] w-20 flex-shrink-0">
                        {label}
                      </span>
                      <span className="text-[var(--color-dark)] font-medium">
                        {value}
                      </span>
                    </div>
                  ))}
              </div>

              <div className="mt-4 pt-4 border-t border-[var(--color-cream-border)]">
                <p className="text-[10px] uppercase tracking-widest text-[var(--color-slate)] font-[var(--font-sans)] mb-2">
                  Langkah Selanjutnya
                </p>
                <div className="space-y-2">
                  {[
                    "① Tim AMARANTA memilih vendor terbaik untuk acara Anda",
                    "② Anda akan dihubungi untuk tech meeting",
                    "③ Lakukan pelunasan setelah vendor dikonfirmasi",
                    "④ Nikmati hari spesial Anda — kami urus sisanya!",
                  ].map((step) => (
                    <p
                      key={step}
                      className="text-xs text-[var(--color-dark-muted)] font-[var(--font-sans)]"
                    >
                      {step}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/pelanggan/pemesanan"
                className="px-8 py-3.5 bg-[var(--color-dark)] text-[var(--color-cream)] text-xs uppercase tracking-widest font-[var(--font-sans)] hover:bg-[var(--color-charcoal)] transition-colors"
              >
                Lihat Pemesanan Saya
              </Link>
              <Link
                to="/"
                className="px-8 py-3.5 border border-[var(--color-dark-muted)]/30 text-[var(--color-dark-muted)] text-xs uppercase tracking-widest font-[var(--font-sans)] hover:border-[var(--color-dark)] transition-colors"
              >
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Checkout;
