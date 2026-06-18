// ============================================================
// src/pages/customer/Invoice.jsx
// FIX & FITUR:
//   1. Mode DP:        Invoice untuk pembayaran DP 30%
//   2. Mode Pelunasan: Invoice untuk pelunasan 70% — format SAMA
//      dengan invoice DP (header, kolom, footer identik)
//   3. BUG FIX: payment type 'dp30' & 'full' (remaining) ditangani
//   4. Total otomatis dihitung dari booking.total_price
//   5. Tombol bayar pelunasan memanggil endpoint yang benar
//   6. Print / Download PDF support
// ============================================================

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import { bookingService } from "../../services";
import { api } from "../../services";
import { PACKAGES, formatRupiah } from "../../data/packages";
import { toastSuccess, toastError } from "../../hooks/useToast";
import useAuthStore from "../../store/authStore";

// ── Konstanta tipe invoice ─────────────────────────────────────
const INVOICE_TYPE = {
  DP: "dp", // Sudah bayar DP
  PELUNASAN: "pelunasan", // Sudah lunas / mau bayar pelunasan
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

function fmtDateShort(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ── Ambil data paket lokal berdasarkan tier_id ────────────────
function getLocalPackage(tierId) {
  return PACKAGES.find((p) => p.id === tierId?.toLowerCase()) || null;
}

// ── Status badge helper ───────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    pending: {
      label: "Menunggu Pembayaran",
      cls: "bg-amber-50 text-amber-700 border-amber-200",
    },
    success: {
      label: "Lunas",
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    failed: { label: "Gagal", cls: "bg-red-50 text-red-700 border-red-200" },
    cancelled: {
      label: "Dibatalkan",
      cls: "bg-gray-50 text-gray-600 border-gray-200",
    },
  };
  const cfg = map[status] || map.pending;
  return (
    <span
      className={`inline-block px-3 py-1 text-xs font-medium border rounded-full font-[var(--font-sans)] ${cfg.cls}`}
    >
      {cfg.label}
    </span>
  );
}

// ============================================================
// KOMPONEN UTAMA
// ============================================================
export default function Invoice() {
  const { id } = useParams(); // booking ID
  const navigate = useNavigate();
  const invoiceRef = useRef(null);
  const user = useAuthStore((s) => s.user);

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payLoading, setPayLoading] = useState(false);

  // BUG FIX: query param ?type=dp | ?type=pelunasan menggunakan useSearchParams agar reactive
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get("type"); // 'dp' | 'pelunasan' | null

  // ── Fetch booking ─────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    bookingService
      .getById(id)
      .then((data) => setBooking(data))
      .catch((err) => {
        toastError(err.userMessage || "Booking tidak ditemukan.");
        navigate("/pelanggan/pemesanan");
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <LoadingScreen />;
  if (!booking) return null;

  // ── Kalkulasi nilai ───────────────────────────────────────
  const totalPrice = booking.total_price || 0;
  const dpAmount = booking.dp_amount || Math.round(totalPrice * 0.3);
  const sisaAmount = totalPrice - dpAmount; // 70% pelunasan

  // BUG FIX: cek apakah DP sudah dibayar
  const dpPaid = booking.payments?.some(
    (p) => ["dp", "dp30"].includes(p.type) && p.status === "success",
  );
  // BUG FIX: cek apakah sudah lunas
  const fullPaid = booking.payments?.some(
    (p) => p.type === "full" && p.status === "success",
  );

  // Tentukan tipe invoice yang ditampilkan
  let invoiceType;
  if (typeParam === "pelunasan") {
    invoiceType = INVOICE_TYPE.PELUNASAN;
  } else if (typeParam === "dp") {
    invoiceType = INVOICE_TYPE.DP;
  } else {
    // Auto-detect: jika sudah lunas → tampilkan invoice pelunasan
    //             jika baru DP      → tampilkan invoice DP
    invoiceType = fullPaid ? INVOICE_TYPE.PELUNASAN : INVOICE_TYPE.DP;
  }

  const isDP = invoiceType === INVOICE_TYPE.DP;
  const invoiceAmount = isDP ? dpAmount : sisaAmount;

  // Ambil data payment yang relevan untuk invoice ini
  const relevantPayment = isDP
    ? (booking.payments?.find((p) => ["dp", "dp30"].includes(p.type) && p.status === "success") ||
       booking.payments?.find((p) => ["dp", "dp30"].includes(p.type) && p.status === "pending") ||
       booking.payments?.find((p) => ["dp", "dp30"].includes(p.type)))
    : (booking.payments?.find((p) => p.type === "full" && p.status === "success") ||
       booking.payments?.find((p) => p.type === "full" && p.status === "pending") ||
       booking.payments?.find((p) => p.type === "full"));

  const localPkg = getLocalPackage(booking.package?.tier_id);

  // Nomor invoice: AMRT-{order_id}-{DP|PLN}
  const invoiceNo = `${booking.order_id}-${isDP ? "DP" : "PLN"}`;

  // Tanggal invoice: tanggal payment atau booking created_at atau sekarang
  const invoiceDate = relevantPayment?.paid_at
    ? fmtDateShort(relevantPayment.paid_at)
    : booking.created_at
      ? fmtDateShort(booking.created_at)
      : fmtDateShort(new Date().toISOString());

  // ── Handler: bayar pelunasan ──────────────────────────────
  async function handlePayPelunasan() {
    setPayLoading(true);
    try {
      // BUG FIX: panggil endpoint pay dengan payment_type yang benar
      // Server mendukung: 'full' untuk pelunasan sisa
      const res = await api.post(`/bookings/${booking.id}/pay`, {
        payment_type: "full",
      });
      const { snap_token, client_key } = res.data;

      if (!snap_token) throw new Error("Snap token tidak ditemukan.");

      // BUG FIX: cek apakah Midtrans Snap sudah di-load
      if (typeof window.snap === "undefined") {
        toastError("Midtrans Snap belum dimuat. Coba refresh halaman.");
        return;
      }

      window.snap.pay(snap_token, {
        onSuccess: async (result) => {
          try {
            await bookingService.confirmPayment(booking.id, "full");
            toastSuccess("Pembayaran pelunasan berhasil!");
            // Refresh data booking
            const updated = await bookingService.getById(booking.id);
            setBooking(updated);
          } catch (err) {
            console.error("Confirm error:", err);
            toastError("Gagal mengonfirmasi pembayaran.");
          }
        },
        onPending: () => {
          toastSuccess(
            "Pembayaran pending. Segera selesaikan pembayaran Anda.",
          );
        },
        onError: (err) => {
          toastError(
            "Pembayaran gagal: " + (err?.message || "Terjadi kesalahan."),
          );
        },
        onClose: () => {
          // User tutup popup — jangan lakukan apa-apa
        },
      });
    } catch (err) {
      toastError(err.userMessage || "Gagal memulai pembayaran. Coba lagi.");
    } finally {
      setPayLoading(false);
    }
  }

  // ── Handler: print ────────────────────────────────────────
  function handlePrint() {
    window.print();
  }

  return (
    <div className="min-h-screen bg-[var(--color-cream)] print:bg-white">
      {/* ── Toolbar (disembunyikan saat print) ── */}
      <div className="print:hidden bg-white border-b border-[var(--color-cream-border)] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Link
            to="/pelanggan/pemesanan"
            className="flex items-center gap-2 text-sm text-[var(--color-dark-muted)] hover:text-[var(--color-dark)] font-[var(--font-sans)] transition-colors"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Kembali ke Pemesanan
          </Link>

          <div className="flex items-center gap-2">
            {/* Tombol switch DP ↔ Pelunasan */}
            {dpPaid && !fullPaid && (
              <Link
                to={`/pelanggan/invoice/${booking.id}?type=${isDP ? "pelunasan" : "dp"}`}
                className="px-3 py-1.5 text-xs border border-[var(--color-cream-border)] text-[var(--color-dark-muted)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] font-[var(--font-sans)] transition-colors"
              >
                Lihat Invoice {isDP ? "Pelunasan" : "DP"}
              </Link>
            )}
            {dpPaid && fullPaid && (
              <Link
                to={`/pelanggan/invoice/${booking.id}?type=${isDP ? "pelunasan" : "dp"}`}
                className="px-3 py-1.5 text-xs border border-[var(--color-cream-border)] text-[var(--color-dark-muted)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] font-[var(--font-sans)] transition-colors"
              >
                Lihat Invoice {isDP ? "Pelunasan" : "DP"}
              </Link>
            )}

            {/* Bayar pelunasan jika DP sudah bayar tapi belum lunas dan sedang di halaman pelunasan */}
            {!isDP && dpPaid && !fullPaid && booking.admin_status === "preparation" && (
              <button
                onClick={handlePayPelunasan}
                disabled={payLoading}
                className="px-4 py-1.5 bg-[var(--color-gold)] text-[var(--color-dark)] text-xs uppercase tracking-widest font-[var(--font-sans)] hover:bg-[var(--color-gold-light)] transition-colors disabled:opacity-50"
              >
                {payLoading
                  ? "Memproses..."
                  : `Bayar ${formatRupiah(sisaAmount)}`}
              </button>
            )}

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 py-1.5 text-xs border border-[var(--color-cream-border)] text-[var(--color-dark-muted)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] font-[var(--font-sans)] transition-colors"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              Cetak / PDF
            </button>
          </div>
        </div>
      </div>

      {/* ── DOKUMEN INVOICE ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 print:py-0 print:px-0 print:max-w-full">
        <div
          ref={invoiceRef}
          className="bg-white shadow-[var(--shadow-luxury)] print:shadow-none"
        >
          {/* ══════════════════════════════════════════════
              HEADER INVOICE (SAMA untuk DP dan Pelunasan)
          ══════════════════════════════════════════════ */}
          <div className="px-8 pt-8 pb-6 border-b border-[var(--color-cream-border)]">
            <div className="flex items-start justify-between gap-4">
              {/* Brand */}
              <div>
                <h1 className="font-[var(--font-display)] text-3xl text-[var(--color-dark)] tracking-widest">
                  AMARANTA
                </h1>
                <p className="text-xs text-[var(--color-slate)] font-[var(--font-sans)] mt-0.5">
                  Wedding Organizer
                </p>
                <div className="text-xs text-[var(--color-dark-muted)] font-[var(--font-sans)] mt-3 space-y-0.5">
                  <p>Jakarta & Seluruh Indonesia</p>
                  <p>halo@amaranta.id</p>
                  <p>+62 811-0000-1234</p>
                </div>
              </div>

              {/* Tipe & Nomor Invoice */}
              <div className="text-right">
                <div
                  className={[
                    "inline-block px-4 py-1.5 text-sm font-semibold font-[var(--font-sans)] uppercase tracking-widest mb-3",
                    isDP
                      ? "bg-[var(--color-gold-pale)] text-[var(--color-gold)]"
                      : "bg-[var(--color-dark)] text-[var(--color-cream)]",
                  ].join(" ")}
                >
                  {isDP ? "Invoice DP 30%" : "Invoice Pelunasan 70%"}
                </div>
                <div className="text-xs text-[var(--color-dark-muted)] font-[var(--font-sans)] space-y-1">
                  <p>
                    <span className="text-[var(--color-slate)]">
                      No. Invoice:
                    </span>{" "}
                    <strong className="text-[var(--color-dark)]">
                      {invoiceNo}
                    </strong>
                  </p>
                  <p>
                    <span className="text-[var(--color-slate)]">
                      No. Booking:
                    </span>{" "}
                    <strong className="text-[var(--color-dark)]">
                      {booking.order_id}
                    </strong>
                  </p>
                  <p>
                    <span className="text-[var(--color-slate)]">
                      Tanggal Invoice:
                    </span>{" "}
                    {invoiceDate}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════
              INFO KLIEN & ACARA (SAMA untuk DP dan Pelunasan)
          ══════════════════════════════════════════════ */}
          <div className="px-8 py-6 grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-[var(--color-cream-border)]">
            {/* Data Pemesan */}
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-gold)] font-[var(--font-sans)] mb-3">
                Ditagihkan Kepada
              </p>
              <p className="text-sm font-semibold text-[var(--color-dark)] font-[var(--font-sans)]">
                {booking.pemesan_name}
              </p>
              <p className="text-xs text-[var(--color-dark-muted)] font-[var(--font-sans)] mt-0.5">
                {booking.pemesan_email}
              </p>
              <p className="text-xs text-[var(--color-dark-muted)] font-[var(--font-sans)]">
                {booking.pemesan_phone}
              </p>
            </div>

            {/* Detail Acara */}
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-gold)] font-[var(--font-sans)] mb-3">
                Detail Acara
              </p>
              <div className="text-xs text-[var(--color-dark-muted)] font-[var(--font-sans)] space-y-1">
                <p>
                  <span className="text-[var(--color-slate)]">
                    Tanggal Pernikahan:
                  </span>{" "}
                  <strong className="text-[var(--color-dark)]">
                    {fmtDate(booking.wedding_date)}
                  </strong>
                </p>
                <p>
                  <span className="text-[var(--color-slate)]">Lokasi:</span>{" "}
                  {booking.location || "-"}
                </p>
                <p>
                  <span className="text-[var(--color-slate)]">Konsep:</span>{" "}
                  {booking.konsep || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════
              TABEL ITEM (FORMAT SAMA untuk DP dan Pelunasan)
          ══════════════════════════════════════════════ */}
          <div className="px-8 py-6">
            <table className="w-full text-sm font-[var(--font-sans)]">
              <thead>
                <tr className="border-b-2 border-[var(--color-dark)]">
                  <th className="text-left py-2 text-xs uppercase tracking-widest text-[var(--color-slate)]">
                    Deskripsi
                  </th>
                  <th className="text-center py-2 text-xs uppercase tracking-widest text-[var(--color-slate)] w-20">
                    Qty
                  </th>
                  <th className="text-right py-2 text-xs uppercase tracking-widest text-[var(--color-slate)] w-36">
                    Harga
                  </th>
                  <th className="text-right py-2 text-xs uppercase tracking-widest text-[var(--color-slate)] w-36">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* ── Baris 1: Paket ── */}
                <tr className="border-b border-[var(--color-cream-border)]">
                  <td className="py-4">
                    <p className="font-medium text-[var(--color-dark)]">
                      Paket{" "}
                      {booking.package?.tier_id
                        ? booking.package.tier_id.charAt(0).toUpperCase() +
                          booking.package.tier_id.slice(1)
                        : ""}{" "}
                      — AMARANTA Wedding Organizer
                    </p>
                    {localPkg && (
                      <p className="text-xs text-[var(--color-slate)] mt-0.5">
                        {localPkg.tagline} · {localPkg.guests} ·{" "}
                        {localPkg.duration}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(localPkg?.includes || []).slice(0, 4).map((inc) => (
                        <span
                          key={inc.label}
                          className="text-[10px] px-1.5 py-0.5 bg-[var(--color-gold-pale)] text-[var(--color-gold)] font-[var(--font-sans)]"
                        >
                          {inc.label}
                        </span>
                      ))}
                      {(localPkg?.includes?.length || 0) > 4 && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-[var(--color-parchment)] text-[var(--color-dark-muted)] font-[var(--font-sans)]">
                          +{localPkg.includes.length - 4} lainnya
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 text-center text-[var(--color-dark-muted)]">
                    1
                  </td>
                  <td className="py-4 text-right text-[var(--color-dark-muted)]">
                    {formatRupiah(totalPrice)}
                  </td>
                  <td className="py-4 text-right font-medium text-[var(--color-dark)]">
                    {formatRupiah(totalPrice)}
                  </td>
                </tr>

                {/* ── Baris 2: Potongan DP (hanya di invoice pelunasan) ── */}
                {!isDP && (
                  <tr className="border-b border-[var(--color-cream-border)]">
                    <td className="py-3">
                      <p className="text-[var(--color-dark-muted)]">
                        Dikurangi: DP yang Telah Dibayar (30%)
                      </p>
                      {booking.dp_paid_at && (
                        <p className="text-xs text-[var(--color-slate)] mt-0.5">
                          Dibayar pada: {fmtDateShort(booking.dp_paid_at)}
                        </p>
                      )}
                    </td>
                    <td className="py-3 text-center text-[var(--color-dark-muted)]">
                      1
                    </td>
                    <td className="py-3 text-right text-emerald-600">
                      −{formatRupiah(dpAmount)}
                    </td>
                    <td className="py-3 text-right font-medium text-emerald-600">
                      −{formatRupiah(dpAmount)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ══════════════════════════════════════════════
              RINGKASAN TOTAL (FORMAT SAMA untuk DP dan Pelunasan)
          ══════════════════════════════════════════════ */}
          <div className="px-8 pb-8">
            <div className="ml-auto max-w-sm">
              {/* Subtotal */}
              <div className="flex justify-between text-sm font-[var(--font-sans)] py-2 border-b border-[var(--color-cream-border)]">
                <span className="text-[var(--color-dark-muted)]">
                  Total Paket
                </span>
                <span className="text-[var(--color-dark)]">
                  {formatRupiah(totalPrice)}
                </span>
              </div>

              {/* Jika invoice pelunasan: tampilkan DP yang sudah dibayar */}
              {!isDP && (
                <div className="flex justify-between text-sm font-[var(--font-sans)] py-2 border-b border-[var(--color-cream-border)]">
                  <span className="text-[var(--color-dark-muted)]">
                    DP Dibayar (30%)
                  </span>
                  <span className="text-emerald-600">
                    −{formatRupiah(dpAmount)}
                  </span>
                </div>
              )}

              {/* Jika invoice DP: tampilkan sisa yang harus dibayar nanti */}
              {isDP && (
                <div className="flex justify-between text-sm font-[var(--font-sans)] py-2 border-b border-[var(--color-cream-border)]">
                  <span className="text-[var(--color-dark-muted)]">
                    Sisa Pelunasan (70%)
                  </span>
                  <span className="text-[var(--color-dark-muted)]">
                    {formatRupiah(sisaAmount)}
                  </span>
                </div>
              )}

              {/* TOTAL TAGIHAN INVOICE INI */}
              <div
                className={[
                  "flex justify-between font-[var(--font-sans)] py-3 border-b-2",
                  isDP
                    ? "border-[var(--color-gold)]"
                    : "border-[var(--color-dark)]",
                ].join(" ")}
              >
                <span className="font-semibold text-[var(--color-dark)]">
                  {isDP ? "Jumlah DP (30%)" : "Jumlah Pelunasan (70%)"}
                </span>
                <span
                  className={[
                    "text-xl font-bold",
                    isDP
                      ? "text-[var(--color-gold)]"
                      : "text-[var(--color-dark)]",
                  ].join(" ")}
                >
                  {formatRupiah(invoiceAmount)}
                </span>
              </div>

              {/* Status pembayaran */}
              <div className="flex justify-between items-center py-3 text-sm font-[var(--font-sans)]">
                <span className="text-[var(--color-dark-muted)]">Status</span>
                {relevantPayment ? (
                  <StatusBadge status={relevantPayment.status} />
                ) : (
                  <StatusBadge status="pending" />
                )}
              </div>

              {/* Metode pembayaran (jika sudah bayar) */}
              {relevantPayment?.payment_type && (
                <div className="flex justify-between items-center py-2 text-xs font-[var(--font-sans)]">
                  <span className="text-[var(--color-slate)]">Metode</span>
                  <span className="text-[var(--color-dark-muted)] capitalize">
                    {relevantPayment.payment_type.replace(/_/g, " ")}
                  </span>
                </div>
              )}

              {/* Tanggal bayar (jika sudah bayar) */}
              {relevantPayment?.paid_at && (
                <div className="flex justify-between items-center py-2 text-xs font-[var(--font-sans)]">
                  <span className="text-[var(--color-slate)]">
                    Tanggal Bayar
                  </span>
                  <span className="text-[var(--color-dark-muted)]">
                    {fmtDateShort(relevantPayment.paid_at)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ══════════════════════════════════════════════
              RINGKASAN PEMBAYARAN KESELURUHAN
              (Menampilkan progres DP + Pelunasan sekaligus)
          ══════════════════════════════════════════════ */}
          <div className="mx-8 mb-8 p-5 bg-[var(--color-cream)] border border-[var(--color-cream-border)]">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-gold)] font-[var(--font-sans)] mb-3">
              Ringkasan Pembayaran Keseluruhan
            </p>
            <div className="grid grid-cols-3 gap-4 text-center">
              {/* Total Paket */}
              <div>
                <p className="text-xs text-[var(--color-slate)] font-[var(--font-sans)] mb-1">
                  Total Paket
                </p>
                <p className="text-sm font-semibold text-[var(--color-dark)] font-[var(--font-sans)]">
                  {formatRupiah(totalPrice)}
                </p>
              </div>
              {/* DP 30% */}
              <div className={dpPaid ? "opacity-100" : "opacity-50"}>
                <p className="text-xs text-[var(--color-slate)] font-[var(--font-sans)] mb-1">
                  DP 30%
                </p>
                <p
                  className={[
                    "text-sm font-semibold font-[var(--font-sans)]",
                    dpPaid ? "text-emerald-600" : "text-[var(--color-slate)]",
                  ].join(" ")}
                >
                  {dpPaid ? "✓ " : ""}
                  {formatRupiah(dpAmount)}
                </p>
              </div>
              {/* Pelunasan 70% */}
              <div className={fullPaid ? "opacity-100" : "opacity-50"}>
                <p className="text-xs text-[var(--color-slate)] font-[var(--font-sans)] mb-1">
                  Pelunasan 70%
                </p>
                <p
                  className={[
                    "text-sm font-semibold font-[var(--font-sans)]",
                    fullPaid ? "text-emerald-600" : "text-[var(--color-slate)]",
                  ].join(" ")}
                >
                  {fullPaid ? "✓ " : ""}
                  {formatRupiah(sisaAmount)}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="h-1.5 bg-[var(--color-cream-border)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--color-gold)] rounded-full transition-all duration-500"
                  style={{
                    width: fullPaid ? "100%" : dpPaid ? "30%" : "0%",
                  }}
                />
              </div>
              <p className="text-[10px] text-[var(--color-slate)] font-[var(--font-sans)] mt-1 text-right">
                {fullPaid
                  ? "Lunas 100%"
                  : dpPaid
                    ? "30% Terbayar"
                    : "Belum ada pembayaran"}
              </p>
            </div>
          </div>

          {/* ══════════════════════════════════════════════
              FOOTER INVOICE (SAMA untuk DP dan Pelunasan)
          ══════════════════════════════════════════════ */}
          <div className="px-8 py-6 border-t border-[var(--color-cream-border)] bg-[var(--color-dark)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[var(--color-gold)] font-[var(--font-sans)] mb-2">
                  Catatan
                </p>
                <p className="text-xs text-white/60 font-[var(--font-sans)] leading-relaxed">
                  {isDP
                    ? `Invoice ini adalah bukti pembayaran DP 30% senilai ${formatRupiah(dpAmount)}. Sisa pembayaran (pelunasan 70%) sebesar ${formatRupiah(sisaAmount)} akan ditagihkan sebelum hari H.`
                    : `Invoice ini adalah bukti pelunasan 70% senilai ${formatRupiah(sisaAmount)}. Total pembayaran Anda ${formatRupiah(totalPrice)} telah lunas.`}
                </p>
              </div>
              <div className="sm:text-right">
                <p className="text-[10px] uppercase tracking-widest text-[var(--color-gold)] font-[var(--font-sans)] mb-2">
                  Pertanyaan?
                </p>
                <p className="text-xs text-white/60 font-[var(--font-sans)]">
                  halo@amaranta.id
                </p>
                <p className="text-xs text-white/60 font-[var(--font-sans)]">
                  +62 811-0000-1234
                </p>
                <p className="text-[10px] text-white/30 font-[var(--font-sans)] mt-3">
                  Terima kasih telah mempercayai AMARANTA
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Aksi bawah (disembunyikan saat print) ── */}
        <div className="print:hidden mt-6 flex flex-wrap gap-3 justify-center">
          <Link
            to="/pelanggan/pemesanan"
            className="px-6 py-2.5 border border-[var(--color-cream-border)] text-sm text-[var(--color-dark-muted)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] font-[var(--font-sans)] transition-colors"
          >
            ← Kembali ke Pemesanan
          </Link>

          {/* Tombol bayar pelunasan (hanya jika DP sudah bayar & belum lunas & di halaman pelunasan) */}
          {!isDP && dpPaid && !fullPaid && booking.admin_status === "preparation" && (
            <button
              onClick={handlePayPelunasan}
              disabled={payLoading}
              className="px-6 py-2.5 bg-[var(--color-dark)] text-[var(--color-cream)] text-sm font-[var(--font-sans)] hover:bg-[var(--color-charcoal)] transition-colors disabled:opacity-50"
            >
              {payLoading
                ? "Memproses..."
                : `Bayar Pelunasan ${formatRupiah(sisaAmount)}`}
            </button>
          )}

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2.5 border border-[var(--color-cream-border)] text-sm text-[var(--color-dark-muted)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] font-[var(--font-sans)] transition-colors"
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
                strokeWidth={1.5}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            Cetak / PDF
          </button>
        </div>
      </div>

      {/* ── Print styles ── */}
      <style>{`
        @media print {
          body { background: white !important; }
          @page { margin: 1cm; }
        }
      `}</style>
    </div>
  );
}

// ── Loading screen ────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[var(--color-cream)] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-[var(--color-slate)] font-[var(--font-sans)]">
          Memuat invoice...
        </p>
      </div>
    </div>
  );
}
