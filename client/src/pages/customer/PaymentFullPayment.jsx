// ============================================================
// src/pages/customer/PaymentFullPayment.jsx
// Halaman pembayaran pelunasan (70% sisa setelah DP 30%)
// ============================================================
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import useAuthStore from "../../store/authStore";
import { api } from "../../services";
import { formatRupiah } from "../../data/packages";
import Button from "../../components/ui/Button";

const snapReady = () =>
  typeof window !== "undefined" && typeof window.snap !== "undefined";

const PAYMENT_METHODS = [
  { id: "bca", name: "BCA Virtual Account", icon: "🏦", group: "Transfer" },
  {
    id: "mandiri",
    name: "Mandiri Virtual Account",
    icon: "🏦",
    group: "Transfer",
  },
  { id: "bni", name: "BNI Virtual Account", icon: "🏦", group: "Transfer" },
  { id: "bri", name: "BRI Virtual Account", icon: "🏦", group: "Transfer" },
  { id: "gopay", name: "GoPay", icon: "💚", group: "E-Wallet" },
  { id: "ovo", name: "OVO", icon: "💜", group: "E-Wallet" },
  { id: "dana", name: "DANA", icon: "💙", group: "E-Wallet" },
  { id: "shopeepay", name: "ShopeePay", icon: "🟠", group: "E-Wallet" },
  { id: "qris", name: "QRIS", icon: "📱", group: "Lainnya" },
  { id: "cc", name: "Kartu Kredit / Debit", icon: "💳", group: "Lainnya" },
];
const GROUPS = ["Transfer", "E-Wallet", "Lainnya"];

export default function PaymentFullPayment() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [booking, setBooking] = useState(null);
  const [method, setMethod] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [step, setStep] = useState(1); // 1=review, 2=success

  // Fetch booking data
  useEffect(() => {
    if (!bookingId) return;
    api
      .get(`/bookings/${bookingId}`)
      .then((res) => setBooking(res.data.data))
      .catch((e) => {
        setApiError(e.userMessage || "Gagal memuat data pemesanan.");
      });
  }, [bookingId]);

  // Jika booking sudah full paid, redirect
  useEffect(() => {
    if (booking && (booking.phase === "pelunasan" || booking.phase === "paid")) {
      navigate("/pelanggan/pemesanan", { replace: true });
    }
  }, [booking, navigate]);

  // Hitung jumlah pelunasan (70% dari total)
  function calculateRemainingAmount() {
    if (!booking) return 0;
    return Math.round(booking.total_price * 0.7);
  }

  // Handle pembayaran
  async function handlePay() {
    if (!method) {
      setApiError("Pilih metode pembayaran.");
      return;
    }
    setLoading(true);
    setApiError("");
    try {
      const res = await api.post(`/bookings/${bookingId}/pay-remaining`, {
        payment_method: method,
      });

      const snapToken = res.data.snap_token || res.data.data?.snap_token;
      if (snapReady() && snapToken) {
        window.snap.pay(snapToken, {
          onSuccess: () => {
            setLoading(false);
            setStep(2);
          },
          onPending: () => {
            setApiError("Pembayaran pending. Cek email untuk instruksi.");
            setLoading(false);
          },
          onError: () => {
            setApiError("Pembayaran gagal. Coba metode lain.");
            setLoading(false);
          },
          onClose: () => setLoading(false),
        });
      } else {
        // Dev mode — simulasi tanpa Snap.js
        setTimeout(() => {
          setLoading(false);
          setStep(2);
        }, 1000);
      }
    } catch (e) {
      console.error(e);
      const msg =
        e.response?.data?.message ||
        e.userMessage ||
        "Tidak bisa terhubung ke server.";
      setApiError(msg);
      setLoading(false);
    }
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-[var(--color-cream)] flex items-center justify-center">
        <Navbar />
        <p className="text-[var(--color-slate)]">Memuat data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* ── STEP 1: Pilih Metode Bayar ── */}
        {step === 1 && (
          <div className="space-y-5">
            {/* Header */}
            <div className="text-center mb-8">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-gold)] font-[var(--font-sans)] mb-2">
                Pelunasan Pembayaran
              </p>
              <h1 className="font-[var(--font-display)] text-3xl text-[var(--color-dark)] mb-2">
                Bayar Sisa Tagihan
              </h1>
              <p className="text-sm text-[var(--color-slate)] font-[var(--font-sans)]">
                Selesaikan pembayaran untuk booking Anda
              </p>
            </div>

            {/* Ringkasan */}
            <div className="bg-[var(--color-gold-pale)] border border-[var(--color-gold)]/30 p-5 space-y-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs font-[var(--font-sans)]">
                <div>
                  <span className="text-[var(--color-slate)]">Paket: </span>
                  <span className="font-medium text-[var(--color-dark)]">
                    {booking.package?.tier_id?.charAt(0).toUpperCase() +
                      booking.package?.tier_id?.slice(1)}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--color-slate)]">Order: </span>
                  <span className="font-medium text-[var(--color-dark)]">
                    {booking.order_id}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--color-slate)]">Pemesan: </span>
                  <span className="font-medium text-[var(--color-dark)]">
                    {booking.pemesan_name}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--color-slate)]">Tgl Nikah: </span>
                  <span className="font-medium text-[var(--color-dark)]">
                    {new Date(booking.wedding_date).toLocaleDateString("id-ID")}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--color-gold)]/20 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--color-slate)]">Harga Paket</span>
                  <span className="text-[var(--color-dark)] font-medium">
                    {formatRupiah(booking.total_price)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--color-slate)]">
                    DP 30% (sudah bayar)
                  </span>
                  <span className="text-[var(--color-dark)] font-medium line-through">
                    {formatRupiah(Math.round(booking.total_price * 0.3))}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[var(--color-gold)]/20">
                  <span className="text-sm font-medium text-[var(--color-dark-muted)]">
                    Sisa Pembayaran (70%)
                  </span>
                  <span className="font-[var(--font-display)] text-lg text-[var(--color-gold)]">
                    {formatRupiah(calculateRemainingAmount())}
                  </span>
                </div>
              </div>
            </div>

            {/* Security badge */}
            <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-100">
              <span className="text-xl">🔒</span>
              <div>
                <p className="text-xs font-medium text-blue-800 font-[var(--font-sans)]">
                  Pembayaran aman via Midtrans
                </p>
                <p className="text-xs text-blue-500 font-[var(--font-sans)]">
                  SSL Encrypted · {snapReady() ? "✅ Snap siap" : "⚠️ Mode dev"}
                </p>
              </div>
            </div>

            {apiError && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 text-sm text-red-600 font-[var(--font-sans)]">
                ⚠️ {apiError}
              </div>
            )}

            {/* Pilih metode */}
            <div className="bg-white border border-[var(--color-cream-border)] p-5 space-y-4">
              <p className="text-[10px] uppercase tracking-widest text-[var(--color-slate)] font-[var(--font-sans)] pb-3 border-b border-[var(--color-cream-border)]">
                Metode Pembayaran
              </p>
              {GROUPS.map((group) => (
                <div key={group}>
                  <p className="text-[10px] uppercase tracking-widest text-[var(--color-slate)] font-[var(--font-sans)] mb-2">
                    {group}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {PAYMENT_METHODS.filter((m) => m.group === group).map(
                      (m) => (
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
                          <span className="text-xs text-[var(--color-dark)] font-[var(--font-sans)]">
                            {m.name}
                          </span>
                        </button>
                      ),
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate("/pelanggan/pemesanan")}
                className="text-xs text-[var(--color-slate)] hover:text-[var(--color-dark)] font-[var(--font-sans)]"
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
                Bayar {formatRupiah(calculateRemainingAmount())}
              </Button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Sukses ── */}
        {step === 2 && (
          <div className="text-center py-12">
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
            <h1 className="font-[var(--font-display)] text-4xl text-[var(--color-dark)] mb-2">
              Pelunasan Selesai!
            </h1>
            <p className="text-sm text-[var(--color-dark-muted)] font-[var(--font-sans)] mb-8 leading-relaxed max-w-sm mx-auto">
              Pembayaran Anda telah dikonfirmasi.
              <br />
              Kami akan segera memproses order Anda.
            </p>

            {/* Detail ringkas */}
            <div className="bg-white border border-[var(--color-cream-border)] p-5 mb-8 text-left max-w-sm mx-auto space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-slate)]">Order ID</span>
                <span className="font-medium text-[var(--color-dark)]">
                  {booking.order_id}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-slate)]">Paket</span>
                <span className="font-medium text-[var(--color-dark)]">
                  {booking.package?.tier_id?.charAt(0).toUpperCase() +
                    booking.package?.tier_id?.slice(1)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-medium pt-3 border-t">
                <span className="text-[var(--color-dark-muted)]">
                  Total Terbayar
                </span>
                <span className="text-[var(--color-gold)]">
                  {formatRupiah(booking.total_price)}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate("/pelanggan/pemesanan")}
                className="px-8 py-3 bg-[var(--color-dark)] text-[var(--color-cream)] text-xs uppercase tracking-widest font-[var(--font-sans)] hover:bg-[var(--color-charcoal)] transition-colors"
              >
                Lihat Pemesanan Saya
              </button>
              <button
                onClick={() =>
                  window.open(`/pelanggan/invoice/${bookingId}?type=pelunasan`, "_blank")
                }
                className="flex items-center justify-center gap-2 px-8 py-3 border border-[var(--color-gold)] text-[var(--color-gold)] text-xs uppercase tracking-widest font-[var(--font-sans)] hover:bg-[var(--color-gold-pale)] transition-all"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
                Cetak Invoice
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
