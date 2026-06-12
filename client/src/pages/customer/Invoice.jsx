// ============================================================
// src/pages/customer/Invoice.jsx
// Halaman invoice yang bisa di-print/download sebagai PDF
//
// CARA KERJA:
//   1. Buka via /pelanggan/invoice/:orderId
//   2. Data diambil dari GET /api/bookings/:id
//   3. Klik "Unduh PDF" → window.print() dengan CSS @media print
//   4. Browser cetak/simpan sebagai PDF
// ============================================================
import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { bookingService, api } from "../../services";
import { PACKAGES, AMARANTA_INFO, formatRupiah } from "../../data/packages";
import { toastSuccess, toastError } from "../../hooks/useToast";

// CSS print disuntikkan ke <head> saat komponen mount
const PRINT_CSS = `
@media print {
  body * { visibility: hidden !important; }
  #invoice-area, #invoice-area * { visibility: visible !important; }
  #invoice-area {
    position: fixed !important;
    inset: 0 !important;
    width: 100% !important;
    padding: 32px 40px !important;
    background: white !important;
  }
  .no-print { display: none !important; }
  @page {
    size: A4 portrait;
    margin: 0;
  }
}
`;

function Badge({ children, color = "#C9A96E" }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 10px",
        background: color + "22",
        color,
        border: `1px solid ${color}55`,
        fontSize: 11,
        fontFamily: "DM Sans, sans-serif",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
      }}
    >
      {children}
    </span>
  );
}

function Row({ label, value, bold = false, large = false }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        padding: "8px 0",
        borderBottom: "1px solid #E5DDD0",
      }}
    >
      <span
        style={{
          fontSize: 13,
          color: "#8A8480",
          fontFamily: "DM Sans, sans-serif",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: large ? 20 : bold ? 14 : 13,
          fontWeight: bold || large ? 600 : 400,
          color: large ? "#C9A96E" : "#1C1A17",
          fontFamily: large
            ? "Playfair Display, Georgia, serif"
            : "DM Sans, sans-serif",
        }}
      >
        {value}
      </span>
    </div>
  );
}

export default function Invoice() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const styleRef = useRef(null);

  // Inject print CSS
  useEffect(() => {
    const el = document.createElement("style");
    el.id = "invoice-print-css";
    el.textContent = PRINT_CSS;
    document.head.appendChild(el);
    styleRef.current = el;
    return () => {
      el.remove();
    };
  }, []);

  useEffect(() => {
    if (!id) return;
    bookingService
      .getById(id)
      .then((data) => setBooking(data))
      .catch(() => setError("Booking tidak ditemukan."))
      .finally(() => setLoading(false));
  }, [id]);

  // Refresh data ketika window fokus kembali (user kembali ke tab)
  useEffect(() => {
    const handleFocus = () => {
      if (id && booking) {
        bookingService
          .getById(id)
          .then((data) => setBooking(data))
          .catch((err) => console.error("Failed to refresh on focus:", err));
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [id, booking]);

  function handlePrint() {
    window.print();
  }

  async function handlePayDP() {
    if (!booking) return;
    setPaymentLoading(true);
    try {
      const res = await api.post(`/bookings/${booking.id}/pay`, {
        payment_type: "dp30",
      });
      const snapToken = res.data?.snap_token || res.data?.data?.snap_token;
      if (
        typeof window !== "undefined" &&
        typeof window.snap !== "undefined" &&
        snapToken
      ) {
        window.snap.pay(snapToken, {
          onSuccess: async () => {
            toastSuccess("Pembayaran berhasil! Memproses...");
            try {
              // Step 1: Confirm payment ke backend
              await api.post(`/bookings/${booking.id}/confirm-payment`, {
                payment_type: "dp30",
              });
              
              // Step 2: Wait sebentar untuk processing
              await new Promise(resolve => setTimeout(resolve, 1500));
              
              // Step 3: Fetch booking data terbaru
              const updatedBooking = await bookingService.getById(booking.id);
              setBooking(updatedBooking);
              toastSuccess("Invoice siap ditampilkan!");
              
              // Step 4: Scroll ke atas
              setTimeout(() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }, 300);
            } catch (err) {
              console.error("Failed to confirm payment:", err);
              toastError(err.response?.data?.message || "Gagal mengonfirmasi pembayaran");
              
              // Fallback: tunggu lebih lama dan coba refresh data
              setTimeout(async () => {
                try {
                  const freshBooking = await bookingService.getById(booking.id);
                  setBooking(freshBooking);
                } catch (e) {
                  console.error("Fallback refresh failed:", e);
                }
              }, 3000);
            }
            setPaymentLoading(false);
          },
          onPending: () => {
            toastError("Pembayaran pending. Cek email untuk instruksi.");
            setPaymentLoading(false);
          },
          onError: () => {
            toastError("Pembayaran gagal. Coba lagi.");
            setPaymentLoading(false);
          },
          onClose: () => setPaymentLoading(false),
        });
      } else {
        toastError("Midtrans tidak siap. Coba beberapa saat lagi.");
        setPaymentLoading(false);
      }
    } catch (err) {
      toastError(err.userMessage || "Gagal memproses pembayaran");
      setPaymentLoading(false);
    }
  }

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FAF7F2",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 32,
              height: 32,
              border: "2px solid #C9A96E",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 12px",
            }}
          />
          <p
            style={{
              fontSize: 13,
              color: "#8A8480",
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            Memuat invoice...
          </p>
        </div>
      </div>
    );

  if (error || !booking)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#FAF7F2",
          gap: 16,
        }}
      >
        <p
          style={{
            fontSize: 14,
            color: "#8A8480",
            fontFamily: "DM Sans, sans-serif",
          }}
        >
          {error || "Invoice tidak tersedia."}
        </p>
        <Link
          to="/pelanggan/pemesanan"
          style={{
            color: "#C9A96E",
            fontSize: 13,
            fontFamily: "DM Sans, sans-serif",
          }}
        >
          ← Kembali ke Pemesanan
        </Link>
      </div>
    );

  // ── Kalkulasi ────────────────────────────────────────────────
  const pkg = PACKAGES.find((p) => p.id === booking.package?.tier_id) || {};
  const tierColor = pkg.color || "#C9A96E";
  const tierLabel = booking.package?.tier_id
    ? booking.package.tier_id.charAt(0).toUpperCase() +
      booking.package.tier_id.slice(1)
    : "—";
  const paidAt =
    booking.full_paid_at || booking.dp_paid_at || booking.created_at;
  const invoiceNo = "INV-" + booking.order_id?.replace("AMRT-", "");
  const invoiceType = booking.full_paid_at ? "LUNAS" : booking.dp_paid_at ? "DP 30%" : "PENDING";
  const statusColor =
    booking.full_paid_at
      ? "#10b981"
      : booking.dp_paid_at
        ? "#F59E0B"
        : booking.status === "confirmed"
          ? "#C9A96E"
          : "#8A8480";

  // ── Jika belum ada pembayaran, tampilkan halaman pembayaran DP ──
  if (!booking.dp_paid_at && !booking.full_paid_at) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#FAF7F2",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          padding: "24px",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 450 }}>
          <h1
            style={{
              fontFamily: "Playfair Display, Georgia, serif",
              fontSize: 32,
              color: "#1C1A17",
              margin: "0 0 8px",
            }}
          >
            Lanjutkan Pembayaran DP
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "#8A8480",
              margin: "0 0 24px",
              lineHeight: 1.6,
            }}
          >
            Invoice Anda akan muncul setelah menyelesaikan pembayaran DP 30%. Klik tombol di bawah untuk memulai pembayaran.
          </p>

          {/* Package Summary */}
          <div
            style={{
              background: "white",
              border: "1px solid #E5DDD0",
              borderRadius: 8,
              padding: 20,
              marginBottom: 24,
              textAlign: "left",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
                paddingBottom: 12,
                borderBottom: "1px solid #E5DDD0",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: 13,
                    color: "#8A8480",
                    margin: 0,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Paket Dipilih
                </p>
                <p
                  style={{
                    fontSize: 16,
                    color: "#1C1A17",
                    fontWeight: 600,
                    margin: "4px 0 0",
                  }}
                >
                  {pkg.tier}
                </p>
              </div>
              <p
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: tierColor,
                  margin: 0,
                }}
              >
                {formatRupiah(booking.total_price)}
              </p>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                background: "#FEF3C7",
                padding: "12px",
                marginTop: 12,
                borderRadius: 6,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: "#92400E" }}>
                DP 30% yang harus dibayar
              </span>
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#D97706",
                }}
              >
                {formatRupiah(booking.dp_amount)}
              </span>
            </div>
          </div>

          {/* Payment Button */}
          <button
            onClick={handlePayDP}
            disabled={paymentLoading}
            style={{
              width: "100%",
              padding: "14px 24px",
              background: paymentLoading ? "#A8A29E" : "#C9A96E",
              border: "none",
              color: "#1C1A17",
              fontSize: 14,
              fontFamily: "DM Sans, sans-serif",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              cursor: paymentLoading ? "not-allowed" : "pointer",
              opacity: paymentLoading ? 0.6 : 1,
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {paymentLoading ? (
              <>
                <span
                  style={{
                    width: 14,
                    height: 14,
                    border: "2px solid #1C1A17",
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                Memproses...
              </>
            ) : (
              <>💳 Bayar DP Sekarang</>
            )}
          </button>

          <Link
            to="/pelanggan/pemesanan"
            style={{
              fontSize: 13,
              color: "#C9A96E",
              textDecoration: "none",
              marginTop: 16,
              display: "block",
            }}
          >
            ← Kembali
          </Link>

          <button
            onClick={async () => {
              try {
                setLoading(true);
                const updatedBooking = await bookingService.getById(booking.id);
                setBooking(updatedBooking);
              } catch (err) {
                toastError("Gagal refresh data: " + err.message);
              } finally {
                setLoading(false);
              }
            }}
            style={{
              marginTop: 12,
              padding: "8px 16px",
              background: "#E5DDD0",
              border: "none",
              color: "#8A8480",
              fontSize: 12,
              fontFamily: "DM Sans, sans-serif",
              cursor: "pointer",
              borderRadius: 4,
              display: "block",
              margin: "16px auto 0",
            }}
          >
            🔄 Refresh Pembayaran
          </button>
        </div>
      </div>
    );
  }

  // ── Jika sudah ada pembayaran, tampilkan invoice lengkap ──

  return (
    <div
      style={{ minHeight: "100vh", background: "#FAF7F2", paddingBottom: 60 }}
    >
      {/* ── Toolbar (no-print) ── */}
      <div
        className="no-print"
        style={{
          background: "#1C1A17",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <Link
          to="/pelanggan/pemesanan"
          style={{
            color: "#ffffff88",
            fontSize: 12,
            fontFamily: "DM Sans, sans-serif",
            textDecoration: "none",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          ← Pemesanan Saya
        </Link>
        <div style={{ display: "flex", gap: 10 }}>
          {!booking?.dp_paid_at && (
            <button
              onClick={handlePayDP}
              disabled={paymentLoading}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 20px",
                background: paymentLoading ? "#A8A29E" : "#C9A96E",
                border: "none",
                color: "#1C1A17",
                fontSize: 12,
                fontFamily: "DM Sans, sans-serif",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                cursor: paymentLoading ? "not-allowed" : "pointer",
                opacity: paymentLoading ? 0.6 : 1,
              }}
            >
              {paymentLoading ? (
                <>
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      border: "2px solid #1C1A17",
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                  Memproses...
                </>
              ) : (
                <>
                  💳 Bayar DP ({formatRupiah(booking?.dp_amount || 0)})
                </>
              )}
            </button>
          )}
          <button
            onClick={handlePrint}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              background: "#C9A96E",
              border: "none",
              color: "#1C1A17",
              fontSize: 12,
              fontFamily: "DM Sans, sans-serif",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              cursor: "pointer",
            }}
          >
            <svg
              width="15"
              height="15"
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
            Unduh / Cetak PDF
          </button>
        </div>
      </div>

      {/* ── Area Invoice ── */}
      <div style={{ maxWidth: 720, margin: "32px auto", padding: "0 16px" }}>
        <div
          id="invoice-area"
          style={{
            background: "white",
            border: "1px solid #E5DDD0",
            padding: "48px 52px",
            fontFamily: "DM Sans, sans-serif",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 40,
            }}
          >
            {/* Brand */}
            <div>
              <p
                style={{
                  fontFamily: "Playfair Display, Georgia, serif",
                  fontSize: 28,
                  letterSpacing: "0.2em",
                  color: "#1C1A17",
                  margin: 0,
                  marginBottom: 4,
                }}
              >
                AMARANTA
              </p>
              <p
                style={{
                  fontSize: 11,
                  color: "#8A8480",
                  margin: 0,
                  letterSpacing: "0.05em",
                }}
              >
                Wedding Organizer
              </p>
              <p
                style={{
                  fontSize: 11,
                  color: "#8A8480",
                  margin: "2px 0 0",
                  letterSpacing: "0.05em",
                }}
              >
                {AMARANTA_INFO.location}
              </p>
              <p style={{ fontSize: 11, color: "#8A8480", margin: "1px 0 0" }}>
                {AMARANTA_INFO.email}
              </p>
            </div>

            {/* Invoice Info */}
            <div style={{ textAlign: "right" }}>
              <p
                style={{
                  fontSize: 11,
                  color: "#8A8480",
                  margin: 0,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Invoice
              </p>
              <p
                style={{
                  fontFamily: "Playfair Display, Georgia, serif",
                  fontSize: 20,
                  color: "#C9A96E",
                  margin: "4px 0 8px",
                  letterSpacing: "0.05em",
                }}
              >
                {invoiceNo}
              </p>
              <Badge color={statusColor}>
                {booking.full_paid_at
                  ? "✓ LUNAS"
                  : booking.dp_paid_at
                    ? "✓ DP DIBAYAR"
                    : "⏳ MENUNGGU PEMBAYARAN"}
              </Badge>
            </div>
          </div>

          {/* Garis emas */}
          <div
            style={{
              height: 1,
              background:
                "linear-gradient(90deg, transparent, #C9A96E, transparent)",
              marginBottom: 36,
            }}
          />

          {/* 2 kolom: Ditagihkan ke + Detail Pembayaran */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 32,
              marginBottom: 36,
            }}
          >
            {/* Ditagihkan ke */}
            <div>
              <p
                style={{
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  color: "#8A8480",
                  marginBottom: 10,
                }}
              >
                Ditagihkan Kepada
              </p>
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#1C1A17",
                  margin: "0 0 2px",
                }}
              >
                {booking.pemesan_name}
              </p>
              <p style={{ fontSize: 13, color: "#6B6660", margin: "2px 0" }}>
                {booking.pemesan_email}
              </p>
              <p style={{ fontSize: 13, color: "#6B6660", margin: "2px 0" }}>
                {booking.pemesan_phone}
              </p>
            </div>

            {/* Info invoice */}
            <div>
              <p
                style={{
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  color: "#8A8480",
                  marginBottom: 10,
                }}
              >
                Detail Invoice
              </p>
              {[
                { l: "No. Order", v: booking.order_id },
                {
                  l: "Tgl. Invoice",
                  v: paidAt
                    ? new Date(paidAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "—",
                },
                {
                  l: "Metode Bayar",
                  v: booking.payment_method?.toUpperCase() || "—",
                },
              ].map(({ l, v }) => (
                <div
                  key={l}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <span style={{ fontSize: 12, color: "#8A8480" }}>{l}</span>
                  <span
                    style={{ fontSize: 12, color: "#1C1A17", fontWeight: 500 }}
                  >
                    {v}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tabel layanan */}
          <div style={{ marginBottom: 32 }}>
            <p
              style={{
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: "#8A8480",
                marginBottom: 12,
              }}
            >
              Rincian Layanan
            </p>

            {/* Header tabel */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto auto",
                padding: "10px 14px",
                background: "#FAF7F2",
                borderBottom: "2px solid #E5DDD0",
              }}
            >
              {["Layanan", "Qty", "Harga"].map((h, i) => (
                <p
                  key={h}
                  style={{
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "#8A8480",
                    margin: 0,
                    textAlign: i === 2 ? "right" : "left",
                  }}
                >
                  {h}
                </p>
              ))}
            </div>

            {/* Baris paket */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto auto",
                padding: "16px 14px",
                borderBottom: "1px solid #E5DDD0",
                alignItems: "start",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#1C1A17",
                    margin: "0 0 3px",
                  }}
                >
                  Paket {tierLabel} — AMARANTA Wedding Organizer
                </p>
                <p style={{ fontSize: 12, color: "#8A8480", margin: 0 }}>
                  {booking.konsep && `Konsep: ${booking.konsep} · `}
                  {booking.wedding_date} · {booking.location}
                </p>
                {/* Item layanan dari PACKAGES */}
                {pkg.includes?.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    {pkg.includes.map((item, i) => (
                      <p
                        key={i}
                        style={{
                          fontSize: 11,
                          color: "#6B6660",
                          margin: "2px 0",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <span style={{ color: tierColor, fontSize: 9 }}>✓</span>
                        {item.label}
                        {item.detail && (
                          <span style={{ color: "#A8A29E" }}>
                            — {item.detail}
                          </span>
                        )}
                      </p>
                    ))}
                  </div>
                )}
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: "#1C1A17",
                  margin: 0,
                  paddingLeft: 24,
                  textAlign: "center",
                }}
              >
                1
              </p>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#1C1A17",
                  margin: 0,
                  textAlign: "right",
                }}
              >
                {formatRupiah(booking.total_price)}
              </p>
            </div>

            {/* Total */}
            <div
              style={{
                padding: "12px 14px 0",
                display: "flex",
                flexDirection: "column",
                gap: 0,
              }}
            >
              <Row label="Subtotal" value={formatRupiah(booking.total_price)} />
              <Row label="PPN (0%)" value="Rp 0" />
              
              {/* JIKA BELUM ADA PEMBAYARAN */}
              {!booking.dp_paid_at && !booking.full_paid_at && (
                <>
                  <div style={{ paddingTop: 12, borderTop: "2px solid #E5DDD0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "8px 0", marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: "#8A8480" }}>DP 30%</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#1C1A17" }}>{formatRupiah(booking.dp_amount)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "8px 0 12px" }}>
                      <span style={{ fontSize: 12, color: "#8A8480" }}>Sisa 70%</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#1C1A17" }}>{formatRupiah(Math.round(booking.total_price * 0.7))}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "12px 0 4px", borderTop: "2px solid #E5DDD0" }}>
                    <span style={{ fontSize: 13, color: "#6B6660", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Total Keseluruhan
                    </span>
                    <span style={{ fontFamily: "Playfair Display, Georgia, serif", fontSize: 24, color: "#C9A96E", fontWeight: 600 }}>
                      {formatRupiah(booking.total_price)}
                    </span>
                  </div>
                </>
              )}

              {/* JIKA DP SUDAH DIBAYAR */}
              {booking.dp_paid_at && !booking.full_paid_at && (
                <>
                  <div style={{ paddingTop: 12, borderTop: "2px solid #E5DDD0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "8px 0" }}>
                      <span style={{ fontSize: 12, color: "#8A8480" }}>DP 30% (sudah dibayar)</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#10b981" }}>✓ {formatRupiah(booking.dp_amount)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", background: "#FEF3C7", padding: "10px 12px", marginTop: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#92400E" }}>Sisa Pembayaran 70%</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#D97706" }}>{formatRupiah(Math.round(booking.total_price * 0.7))}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "12px 0 4px", borderTop: "2px solid #E5DDD0" }}>
                    <span style={{ fontSize: 13, color: "#6B6660", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Total Keseluruhan
                    </span>
                    <span style={{ fontFamily: "Playfair Display, Georgia, serif", fontSize: 24, color: "#C9A96E", fontWeight: 600 }}>
                      {formatRupiah(booking.total_price)}
                    </span>
                  </div>
                </>
              )}

              {/* JIKA SUDAH LUNAS */}
              {booking.full_paid_at && (
                <>
                  <div style={{ paddingTop: 12, borderTop: "2px solid #E5DDD0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "8px 0" }}>
                      <span style={{ fontSize: 12, color: "#8A8480" }}>DP 30%</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#10b981" }}>✓ {formatRupiah(booking.dp_amount)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "8px 0 12px" }}>
                      <span style={{ fontSize: 12, color: "#8A8480" }}>Pelunasan 70%</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#10b981" }}>✓ {formatRupiah(Math.round(booking.total_price * 0.7))}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "12px 0 4px", borderTop: "2px solid #E5DDD0" }}>
                    <span style={{ fontSize: 13, color: "#6B6660", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Total Terbayar
                    </span>
                    <span style={{ fontFamily: "Playfair Display, Georgia, serif", fontSize: 24, color: "#10b981", fontWeight: 600 }}>
                      {formatRupiah(booking.total_price)}
                    </span>
                  </div>
                  <p style={{ fontSize: 11, color: "#10b981", margin: "4px 0 0", textAlign: "right", fontWeight: 600 }}>
                    ✓ LUNAS
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Detail Acara */}
          <div
            style={{
              borderTop: "1px solid #E5DDD0",
              paddingTop: 28,
              marginBottom: 28,
            }}
          >
            <p
              style={{
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: "#8A8480",
                marginBottom: 14,
              }}
            >
              Detail Acara
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "6px 32px",
              }}
            >
              {[
                {
                  l: "Tanggal Pernikahan",
                  v: booking.wedding_date
                    ? new Date(booking.wedding_date).toLocaleDateString(
                        "id-ID",
                        {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        },
                      )
                    : "—",
                },
                { l: "Lokasi", v: booking.location || "—" },
                { l: "Konsep", v: booking.konsep || "—" },
                { l: "Vendor", v: booking.vendor?.name || "Akan ditentukan" },
              ].map(({ l, v }) => (
                <div
                  key={l}
                  style={{
                    paddingBottom: 8,
                    borderBottom: "1px dashed #E5DDD0",
                  }}
                >
                  <p
                    style={{
                      fontSize: 10,
                      color: "#8A8480",
                      margin: "0 0 2px",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {l}
                  </p>
                  <p
                    style={{
                      fontSize: 13,
                      color: "#1C1A17",
                      margin: 0,
                      fontWeight: 500,
                    }}
                  >
                    {v}
                  </p>
                </div>
              ))}
            </div>
            {booking.notes && (
              <div
                style={{
                  marginTop: 12,
                  padding: "10px 14px",
                  background: "#FAF7F2",
                  border: "1px solid #E5DDD0",
                }}
              >
                <p
                  style={{
                    fontSize: 10,
                    color: "#8A8480",
                    margin: "0 0 4px",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Catatan
                </p>
                <p
                  style={{
                    fontSize: 12,
                    color: "#6B6660",
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  {booking.notes}
                </p>
              </div>
            )}
          </div>

          {/* Footer invoice */}
          <div
            style={{
              borderTop: "1px solid #E5DDD0",
              paddingTop: 24,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: 11,
                  color: "#8A8480",
                  margin: "0 0 4px",
                  lineHeight: 1.6,
                }}
              >
                Terima kasih telah mempercayakan hari istimewa Anda kepada
                AMARANTA.
              </p>
              <p style={{ fontSize: 11, color: "#8A8480", margin: 0 }}>
                Pertanyaan? Hubungi kami di {AMARANTA_INFO.email}
              </p>
            </div>
            {/* Cap lunas */}
            {booking.full_paid_at && (
              <div
                style={{
                  border: "2px solid #10b981",
                  padding: "6px 16px",
                  transform: "rotate(-8deg)",
                  opacity: 0.8,
                }}
              >
                <p
                  style={{
                    fontSize: 13,
                    color: "#10b981",
                    fontWeight: 700,
                    margin: 0,
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                  }}
                >
                  LUNAS
                </p>
              </div>
            )}
          </div>

          {/* Watermark nomor */}
          <p
            style={{
              textAlign: "center",
              fontSize: 10,
              color: "#E5DDD0",
              marginTop: 24,
              letterSpacing: "0.2em",
              fontFamily: "Playfair Display, Georgia, serif",
            }}
          >
            {booking.order_id} · AMARANTA Wedding Organizer
          </p>
        </div>
      </div>

      {/* Style inject untuk animasi spinner */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
