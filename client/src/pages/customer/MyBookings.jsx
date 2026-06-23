import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import useAuthStore from "../../store/authStore";
import { bookingService } from "../../services";
import { toastSuccess, toastError } from "../../hooks/useToast";
import { formatRupiah } from "../../data/packages";

// Helper: ambil hanya YYYY-MM-DD agar tidak ada timezone shift
function formatDate(str) {
  if (!str) return "—";
  const d = str.slice(0, 10); // "2026-07-30"
  const [y, m, day] = d.split("-");
  const months = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Ags","Sep","Okt","Nov","Des"];
  return `${parseInt(day)} ${months[parseInt(m)-1]} ${y}`;
}

// Alur: Dipesan → Dibayar → Admin Proses → Hari H → Selesai
const PHASES = [
  {
    id: "pending",
    label: "Dipesan",
    icon: (
      <svg
        className="w-3.5 h-3.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
    ),
  },
  {
    id: "paid",
    label: "Lunas",
    icon: (
      <svg
        className="w-3.5 h-3.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
        />
      </svg>
    ),
  },
  {
    id: "vendor_process",
    label: "Diproses",
    icon: (
      <svg
        className="w-3.5 h-3.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
  {
    id: "in_event",
    label: "Hari H",
    icon: (
      <svg
        className="w-3.5 h-3.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    ),
  },
  {
    id: "pelunasan",
    label: "Pelunasan",
    icon: (
      <svg
        className="w-3.5 h-3.5"
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
    ),
  },
  {
    id: "rated",
    label: "Selesai",
    icon: (
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
];

const ADMIN_MSG = {
  waiting_dp: {
    text: "⏳ Pembayaran belum diterima. Silakan selesaikan pembayaran.",
    color: "bg-amber-50 border-amber-200 text-amber-700",
  },
  payment_failed: {
    text: "❌ Pembayaran gagal. Silakan coba lagi.",
    color: "bg-red-50 border-red-200 text-red-600",
  },
  waiting_vendor: {
    text: "✅ Pembayaran diterima! Admin sedang memilih vendor terbaik untuk Anda.",
    color: "bg-blue-50 border-blue-200 text-blue-700",
  },
  vendor_assigned: {
    text: "📨 Vendor sudah dipilih, menunggu konfirmasi vendor.",
    color: "bg-blue-50 border-blue-200 text-blue-700",
  },
  vendor_confirmed: {
    text: "✅ Vendor dikonfirmasi! Admin akan menjadwalkan tech meeting.",
    color: "bg-teal-50 border-teal-200 text-teal-700",
  },
  vendor_rejected: {
    text: "🔄 Admin sedang mencari vendor pengganti untuk Anda.",
    color: "bg-amber-50 border-amber-200 text-amber-700",
  },
  tech_meeting_scheduled: {
    text: "📅 Tech meeting dijadwalkan — tim AMARANTA akan menghubungi Anda.",
    color: "bg-purple-50 border-purple-200 text-purple-700",
  },
  preparation: {
    text: "🎪 Persiapan acara sedang berjalan. Tunggu hingga acara selesai untuk melakukan pelunasan.",
    color: "bg-indigo-50 border-indigo-200 text-indigo-700",
  },
  in_event: {
    text: "💒 Selamat menjalani hari istimewa Anda! Pelunasan dapat dilakukan setelah acara selesai.",
    color: "bg-green-50 border-green-200 text-green-700",
  },
  completed: {
    text: "🎉 Acara selesai! Silakan lakukan pelunasan 70% dan beri penilaian untuk vendor Anda.",
    color: "bg-emerald-50 border-emerald-200 text-emerald-700",
  },
};

function PhaseBar({ phase, adminStatus, hasDp, hasFull }) {
  // Mapping phase + admin_status ke step 1-6
  // Alur: Dipesan(1) → DP(2) → Diproses(3) → Hari H(4) → Pelunasan(5) → Selesai(6)
  function getStep() {
    // ── Step 6: Sudah dinilai (rated) ──────────────────────────────
    if (phase === "rated") return 6;

    // ── Step 6: Lunas + acara selesai → siap beri rating ───────────
    if (hasFull && adminStatus === "completed") return 6;

    // ── Step 5: Pelunasan — acara selesai, belum lunas ─────────────
    // FIX #3: completed tanpa full payment → step 5, bukan langsung 6
    if (adminStatus === "completed") return 5;

    // ── Step 4: Hari H — acara berlangsung ─────────────────────────
    if (phase === "in_event" || adminStatus === "in_event") return 4;

    // ── Step 3: Diproses — vendor diproses s/d persiapan ───────────
    // FIX #2: 'preparation' masuk step 3 (Diproses), bukan step 4 (Hari H)
    if (
      [
        "vendor_assigned",
        "vendor_confirmed",
        "vendor_rejected",
        "tech_meeting_scheduled",
        "preparation",
      ].includes(adminStatus)
    )
      return 3;

    // ── Step 2: DP dibayar — menunggu vendor ────────────────────────
    // FIX #1: gunakan hasDp sebagai primary check, bukan hanya adminStatus
    // Sehingga jika admin sudah assign vendor tapi phase/adminStatus
    // belum terupdate di frontend, DP tidak terlewat/skip
    if (hasDp || adminStatus === "waiting_vendor") return 2;

    // ── Step 1: Belum bayar ─────────────────────────────────────────
    return 1;
  }
  const cur = getStep();

  // Dynamic Phase Labels based on payment status
  const dynamicPhases = PHASES.map((p) => {
    if (p.id === "paid") {
      return {
        ...p,
        label: hasFull ? "Lunas" : hasDp ? "DP 30%" : "Pembayaran",
      };
    }
    return p;
  });

  return (
    <div className="flex items-center gap-0 overflow-x-auto pb-1">
      {dynamicPhases.map((p, i) => {
        const done = i + 1 < cur;
        const current = i + 1 === cur;
        return (
          <div key={p.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1 min-w-[48px]">
              <div
                className={[
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all",
                  done
                    ? "bg-[var(--color-dark)] text-[var(--color-cream)]"
                    : current
                      ? "bg-[var(--color-gold)] text-[var(--color-dark)] shadow-[var(--shadow-gold)]"
                      : "bg-[var(--color-cream-border)] text-[var(--color-slate)]",
                ].join(" ")}
              >
                {done ? (
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : typeof p.icon === "string" ? (
                  p.icon
                ) : (
                  p.icon
                )}
              </div>
              <span
                className={[
                  "text-[9px] uppercase tracking-widest text-center leading-tight font-[var(--font-sans)]",
                  current
                    ? "text-[var(--color-gold)] font-bold"
                    : done
                      ? "text-[var(--color-dark-muted)]"
                      : "text-[var(--color-slate)]",
                ].join(" ")}
              >
                {p.label}
              </span>
            </div>
            {i < dynamicPhases.length - 1 && (
              <div
                className={[
                  "h-0.5 w-4 -mt-5",
                  i + 1 < cur
                    ? "bg-[var(--color-dark)]"
                    : "bg-[var(--color-cream-border)]",
                ].join(" ")}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function StarRating({ value, onChange }) {
  const [hov, setHov] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange?.(s)}
          onMouseEnter={() => onChange && setHov(s)}
          onMouseLeave={() => onChange && setHov(0)}
          className={[
            "text-2xl transition-colors",
            s <= (hov || value)
              ? "text-[var(--color-gold)]"
              : "text-[var(--color-cream-border)]",
            onChange ? "cursor-pointer" : "cursor-default",
          ].join(" ")}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function CustomerMyBookings() {
  const user = useAuthStore((s) => s.user);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchErr, setFetchErr] = useState("");
  const [expandedBookingId, setExpandedBookingId] = useState(null);

  // Modal states
  const [ratingModal, setRatingModal] = useState(null);
  const [cancelModal, setCancelModal] = useState(null);
  const [dpPaymentModal, setDpPaymentModal] = useState(null);
  const [paymentModal, setPaymentModal] = useState(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [acting, setActing] = useState(false);
  const [payLoading, setPayLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  function loadBookings() {
    setLoading(true);
    bookingService
      .getMy()
      .then((data) => setBookings(Array.isArray(data) ? data : []))
      .catch(() => setFetchErr("Gagal memuat data. Coba refresh halaman."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadBookings();
    // Auto refresh saat tab kembali difokus (misal setelah bayar di Midtrans)
    function onFocus() {
      loadBookings();
    }
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  async function handleCancel() {
    if (!cancelModal) return;
    setActing(true);
    try {
      await bookingService.cancel(cancelModal.id);
      setBookings((p) =>
        p.map((b) =>
          b.id === cancelModal.id
            ? { ...b, status: "cancelled", admin_status: "cancelled" }
            : b,
        ),
      );
      toastSuccess("Booking berhasil dibatalkan.");
      setCancelModal(null);
    } catch (err) {
      toastError(err.userMessage || "Gagal membatalkan booking.");
    } finally {
      setActing(false);
    }
  }

  async function handleRating() {
    if (!ratingModal) return;
    setActing(true);
    try {
      await bookingService.rate(ratingModal.id, {
        rating: ratingValue,
        review: reviewText,
      });
      // Update status, phase, rating di state lokal
      // status: 'completed' agar tombol "Hapus dari Riwayat" muncul
      setBookings((p) =>
        p.map((b) =>
          b.id === ratingModal.id
            ? { ...b, phase: "rated", status: "completed", rating: ratingValue, review: reviewText }
            : b,
        ),
      );
      toastSuccess("Terima kasih atas penilaian Anda!");
      setRatingModal(null);
      setRatingValue(5);
      setReviewText("");
    } catch {
      toastError("Gagal menyimpan penilaian.");
    } finally {
      setActing(false);
    }
  }

  async function handleDeleteBooking(b) {
    if (
      !window.confirm(
        `Yakin ingin menghapus booking ${b.order_id} dari riwayat Anda?`,
      )
    )
      return;
    try {
      await bookingService.delete(b.id);
      toastSuccess("Pemesanan berhasil dihapus dari riwayat.");
      loadBookings();
    } catch (err) {
      toastError(err.userMessage || "Gagal menghapus pemesanan.");
    }
  }

  async function handleDeleteAllBookings() {
    if (
      !window.confirm(
        "Yakin ingin membersihkan semua riwayat pemesanan yang selesai atau dibatalkan?",
      )
    )
      return;
    try {
      await bookingService.deleteAll();
      toastSuccess("Semua riwayat pemesanan berhasil dibersihkan.");
      loadBookings();
    } catch (err) {
      toastError(err.userMessage || "Gagal membersihkan riwayat.");
    }
  }

  // BUG FIX: Helper functions untuk cek status pembayaran
  function isDpPaid(b) {
    return (
      b.payments?.some(
        (p) => ["dp", "dp30"].includes(p.type) && p.status === "success",
      ) || false
    );
  }

  function isFullPaid(b) {
    return (
      b.payments?.some((p) => p.type === "full" && p.status === "success") ||
      false
    );
  }

  // Pelunasan HANYA bisa dilakukan setelah acara selesai (admin_status === 'completed')
  function canPayRemaining(b) {
    if (isFullPaid(b)) return false; // Sudah lunas
    if (!isDpPaid(b)) return false;  // Harus bayar DP dulu
    return b.admin_status === "completed"; // Hanya setelah acara selesai
  }

  // BUG FIX: Handle pembayaran pelunasan
  async function handlePayRemaining() {
    if (!paymentModal) return;
    setPayLoading(true);
    try {
      const data = await bookingService.payRemaining(paymentModal.id);
      const snapToken = data.snap_token;

      if (!snapToken) {
        toastError("Snap token tidak ditemukan.");
        return;
      }

      if (typeof window.snap === "undefined") {
        toastError("Midtrans Snap belum dimuat. Coba refresh halaman.");
        return;
      }

      window.snap.pay(snapToken, {
        onSuccess: async () => {
          try {
            await bookingService.confirmPayment(paymentModal.id, "full");
            toastSuccess("Pembayaran pelunasan berhasil! Terima kasih.");
            setPaymentModal(null);
            loadBookings();
          } catch (err) {
            console.error("Confirm error:", err);
            // Tetap reload data meskipun confirm gagal
            toastSuccess("Pembayaran berhasil. Memuat ulang data...");
            setPaymentModal(null);
            loadBookings();
          }
        },
        onPending: () => {
          toastSuccess(
            "Pembayaran pending. Segera selesaikan pembayaran Anda.",
          );
          setPaymentModal(null);
          loadBookings();
        },
        onError: (err) => {
          console.error("Snap error:", err);
          toastError(
            "Pembayaran gagal atau ditolak. Silakan coba lagi.",
          );
          loadBookings();
        },
        onClose: () => {
          setPayLoading(false);
          loadBookings();
        },
      });
    } catch (err) {
      toastError(err.userMessage || "Gagal memulai pembayaran.");
    } finally {
      setPayLoading(false);
    }
  }

  // PERBAIKAN: Handle pembayaran DP 30%
  async function handlePayDp() {
    if (!dpPaymentModal) return;
    setPayLoading(true);
    try {
      const data = await bookingService.pay(dpPaymentModal.id, "dp30");
      const snapToken = data.snap_token;

      if (!snapToken) {
        toastError("Snap token tidak ditemukan.");
        return;
      }

      if (typeof window.snap === "undefined") {
        toastError("Midtrans Snap belum dimuat. Coba refresh halaman.");
        return;
      }

      window.snap.pay(snapToken, {
        onSuccess: async () => {
          try {
            await bookingService.confirmPayment(dpPaymentModal.id, "dp30");
            toastSuccess("Pembayaran DP berhasil!");
            setDpPaymentModal(null);
            loadBookings();
          } catch (err) {
            console.error("Confirm error:", err);
            // Tetap reload data meskipun confirm gagal (webhook mungkin sudah jalan)
            toastSuccess("Pembayaran berhasil. Memuat ulang data...");
            setDpPaymentModal(null);
            loadBookings();
          }
        },
        onPending: () => {
          toastSuccess(
            "Pembayaran pending. Segera selesaikan pembayaran Anda.",
          );
          setDpPaymentModal(null);
          loadBookings();
        },
        onError: (err) => {
          // onError dari Midtrans Snap (bukan gagal jaringan)
          // Jangan call confirmPayment — cukup refresh data
          console.error("Snap error:", err);
          toastError(
            "Pembayaran gagal atau ditolak. Silakan coba lagi.",
          );
          loadBookings();
        },
        onClose: () => {
          // User menutup popup tanpa bayar — jangan error
          setPayLoading(false);
          loadBookings();
        },
      });
    } catch (err) {
      toastError(err.userMessage || "Gagal memulai pembayaran.");
    } finally {
      setPayLoading(false);
    }
  }

  // Apakah booking bisa di-reschedule?
  // Hanya sebelum vendor confirmed

  // Bisa batalkan hanya jika belum bayar
  function canCancel(b) {
    return (
      ["waiting_dp", "payment_failed"].includes(b.admin_status) &&
      b.status !== "cancelled"
    );
  }

  if (loading)
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-[var(--color-slate)] font-[var(--font-sans)]">
          Memuat pemesanan...
        </p>
      </div>
    );

  if (fetchErr)
    return (
      <div className="px-5 py-4 bg-red-50 border border-red-200 text-sm text-red-600 font-[var(--font-sans)]">
        ⚠️ {fetchErr}
      </div>
    );

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-gold)] font-[var(--font-sans)] mb-2">
            Akun Saya
          </p>
          <h1 className="font-[var(--font-display)] text-4xl text-[var(--color-dark)] mb-1">
            Pemesanan Saya
          </h1>
          <p className="text-sm text-[var(--color-slate)] font-[var(--font-sans)]">
            Halo, {user?.name?.split(" ")[0]} — pantau semua status pemesanan
            Anda.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {bookings.some((b) =>
            ["completed", "cancelled"].includes(b.status),
          ) && (
            <button
              onClick={handleDeleteAllBookings}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 border border-red-200 text-xs text-red-500 hover:bg-red-50 font-[var(--font-sans)] transition-all mt-2"
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
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Bersihkan Riwayat
            </button>
          )}
          <button
            onClick={loadBookings}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 border border-[var(--color-cream-border)] text-xs text-[var(--color-dark-muted)] hover:border-[var(--color-gold)] font-[var(--font-sans)] transition-all mt-2"
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
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-[var(--font-display)] text-3xl text-[var(--color-dark-subtle)] mb-3">
            Belum ada pemesanan
          </p>
          <p className="text-sm text-[var(--color-slate)] font-[var(--font-sans)] mb-6">
            Pilih paket pernikahan impian Anda dan mulai pesan sekarang.
          </p>
          <Link
            to="/paket"
            className="inline-block px-8 py-3 bg-[var(--color-gold)] text-[var(--color-dark)] text-xs uppercase tracking-widest font-[var(--font-sans)] hover:bg-[var(--color-gold-light)] transition-colors"
          >
            Pilih Paket
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white border border-[var(--color-cream-border)] overflow-hidden"
            >
              <div className="h-1 bg-[var(--color-gold)]" />
              <div className="p-5">
                {/* Header booking */}
                <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
                  <div>
                    <p className="font-[var(--font-display)] text-xl text-[var(--color-dark)] mb-0.5">
                      Paket {booking.package?.tier_id || "—"}
                      <span className="ml-2 text-sm text-[var(--color-slate)] font-[var(--font-sans)] normal-case">
                        AMARANTA Wedding Organizer
                      </span>
                    </p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="text-xs text-[var(--color-slate)] font-[var(--font-sans)]">
                        📅 {formatDate(booking.wedding_date)}
                      </p>
                      <p className="text-xs text-[var(--color-slate)] font-[var(--font-sans)]">
                        📍 {booking.location || "—"}
                      </p>
                      <p className="text-xs text-[var(--color-slate)] font-[var(--font-sans)]">
                        🎨 {booking.konsep || "—"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-[10px] font-mono text-[var(--color-gold)]">
                        {booking.order_id}
                      </p>
                      {booking.status === "cancelled" && (
                        <span className="text-[9px] px-1.5 py-0.5 bg-red-100 text-red-600 font-[var(--font-sans)] uppercase tracking-widest">
                          Dibatalkan
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="font-[var(--font-display)] text-xl text-[var(--color-dark)] flex-shrink-0">
                    {formatRupiah(booking.total_price)}
                  </p>
                </div>

                {/* Info status dari admin */}
                {ADMIN_MSG[booking.admin_status] && (
                  <div
                    className={[
                      "mb-4 px-3 py-2 border text-xs font-[var(--font-sans)]",
                      ADMIN_MSG[booking.admin_status].color,
                    ].join(" ")}
                  >
                    {booking.admin_status === "waiting_vendor"
                      ? isFullPaid(booking)
                        ? "✅ Pembayaran lunas diterima! Admin sedang memilih vendor terbaik untuk Anda."
                        : "✅ Pembayaran DP 30% diterima! Admin sedang memilih vendor terbaik untuk Anda."
                      : ADMIN_MSG[booking.admin_status].text}
                    {booking.vendor?.name &&
                      booking.admin_status === "vendor_confirmed" && (
                        <span className="ml-2 font-medium">
                          {" "}
                          {booking.vendor.name}
                        </span>
                      )}
                  </div>
                )}

                {/* Detail Pertemuan/Jadwal Koordinasi dari Vendor (Instant Feedback) */}
                {booking.admin_status === "vendor_confirmed" &&
                  booking.vendor_requests?.find(
                    (vr) => vr.status === "confirmed",
                  )?.vendor_notes && (
                    <div className="mb-4 p-3 bg-teal-50 border border-teal-200 text-xs font-[var(--font-sans)] rounded">
                      <p className="text-[10px] uppercase tracking-widest text-teal-800 font-bold mb-1">
                        💬 Catatan Dari Vendor
                      </p>
                      <p className="text-teal-900 font-medium leading-relaxed">
                        {
                          booking.vendor_requests.find(
                            (vr) => vr.status === "confirmed",
                          ).vendor_notes
                        }
                      </p>
                    </div>
                  )}

                {/* Jadwal Tech Meeting dari Admin (Instant Feedback) */}
                {booking.tech_meeting_at && (
                  <div className="mb-4 p-3 bg-purple-50 border border-purple-200 text-xs font-[var(--font-sans)] rounded">
                    <p className="text-[10px] uppercase tracking-widest text-purple-800 font-bold mb-1">
                      📅 Jadwal Technical Meeting (Koordinasi):
                    </p>
                    <p className="text-purple-950 leading-relaxed">
                      <strong>Waktu:</strong>{" "}
                      {new Date(booking.tech_meeting_at).toLocaleString(
                        "id-ID",
                        { dateStyle: "long", timeStyle: "short" },
                      )}
                      <br />
                      <strong>Lokasi:</strong> {booking.tech_meeting_location}
                      <br />
                      {booking.tech_meeting_notes && (
                        <>
                          <strong>Catatan:</strong> {booking.tech_meeting_notes}
                        </>
                      )}
                    </p>
                  </div>
                )}

                {/* Progress persiapan */}
                {booking.preparation_progress > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs font-[var(--font-sans)] mb-1">
                      <span className="text-[var(--color-slate)]">
                        Progress Persiapan
                      </span>
                      <span className="text-[var(--color-gold)]">
                        {booking.preparation_progress}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-[var(--color-cream-border)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--color-gold)] rounded-full transition-all"
                        style={{ width: booking.preparation_progress + "%" }}
                      />
                    </div>
                  </div>
                )}

                {/* Phase bar */}
                <div className="mb-4 pb-4 border-b border-[var(--color-cream-border)]">
                  <PhaseBar
                    phase={booking.phase}
                    adminStatus={booking.admin_status}
                    hasDp={isDpPaid(booking)}
                    hasFull={isFullPaid(booking)}
                  />
                </div>

                {/* Aksi */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* PERBAIKAN: Bayar DP 30% — awal pemesanan */}
                  {booking.admin_status === "waiting_dp" && (
                    <button
                      onClick={() => setDpPaymentModal(booking)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-[var(--color-gold)] text-[var(--color-dark)] text-xs font-[var(--font-sans)] hover:bg-[var(--color-gold-light)] transition-all"
                    >
                      💳 Bayar DP 30%{" "}
                      {formatRupiah(
                        booking.dp_amount ||
                          Math.round(booking.total_price * 0.3),
                      )}
                    </button>
                  )}

                  {/* BUG FIX: Bayar Pelunasan — setelah bayar DP */}
                  {canPayRemaining(booking) && (
                    <button
                      onClick={() => setPaymentModal(booking)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-[var(--color-gold)] text-[var(--color-dark)] text-xs font-[var(--font-sans)] hover:bg-[var(--color-gold-light)] transition-all"
                    >
                      💳 Bayar Sisa{" "}
                      {formatRupiah(
                        booking.total_price -
                          (booking.dp_amount ||
                            Math.round(booking.total_price * 0.3)),
                      )}
                    </button>
                  )}

                  {/* Invoice DP 30% — tampil setelah DP dibayar */}
                  {isDpPaid(booking) && (
                    <Link
                      to={`/pelanggan/invoice/${booking.id}?type=dp`}
                      target="_blank"
                      className="flex items-center gap-1.5 px-3 py-2 border border-[var(--color-cream-border)] text-xs text-[var(--color-dark-muted)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] font-[var(--font-sans)] transition-all"
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
                          strokeWidth={2}
                          d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                        />
                      </svg>
                      Invoice DP 30%
                    </Link>
                  )}

                  {/* Invoice Pelunasan 70% atau Lunas */}
                  {isFullPaid(booking) && (
                    <Link
                      to={`/pelanggan/invoice/${booking.id}?type=pelunasan`}
                      target="_blank"
                      className="flex items-center gap-1.5 px-3 py-2 border border-[var(--color-cream-border)] text-xs text-[var(--color-dark-muted)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] font-[var(--font-sans)] transition-all"
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
                          strokeWidth={2}
                          d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                        />
                      </svg>
                      {isDpPaid(booking)
                        ? "Invoice Pelunasan 70%"
                        : "Invoice Lunas"}
                    </Link>
                  )}

                  {/* Detail Pemesanan button */}
                  <button
                    onClick={() =>
                      setExpandedBookingId(
                        expandedBookingId === booking.id ? null : booking.id,
                      )
                    }
                    className="flex items-center gap-1.5 px-3 py-2 border border-[var(--color-cream-border)] text-xs text-[var(--color-dark-muted)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] font-[var(--font-sans)] transition-all"
                  >
                    {expandedBookingId === booking.id
                      ? "Sembunyikan Detail"
                      : "🔎 Detail Pemesanan"}
                  </button>

                  {/* Bayar ulang jika payment gagal */}
                  {booking.admin_status === "payment_failed" && (
                    <button
                      onClick={() => setDpPaymentModal(booking)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-[var(--color-gold)] text-[var(--color-dark)] text-xs font-[var(--font-sans)] hover:bg-[var(--color-gold-light)] transition-all"
                    >
                      💳 Bayar Ulang (DP 30%)
                    </button>
                  )}

                  {/* Batalkan — hanya sebelum bayar */}
                  {canCancel(booking) && (
                    <button
                      onClick={() => setCancelModal(booking)}
                      className="flex items-center gap-1.5 px-3 py-2 border border-red-200 text-xs text-red-500 hover:bg-red-50 font-[var(--font-sans)] transition-all"
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
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      Batalkan
                    </button>
                  )}

                  {/* Beri rating — muncul jika lunas, acara selesai (completed), dan belum rating */}
                  {(booking.admin_status === "completed" || booking.phase === "paid") &&
                    isFullPaid(booking) &&
                    !booking.rating &&
                    booking.phase !== "rated" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setRatingModal(booking);
                          setRatingValue(5);
                          setReviewText("");
                        }}
                      >
                        ⭐ Beri Penilaian
                      </Button>
                    )}

                  {/* Rating sudah ada */}
                  {booking.rating && <StarRating value={booking.rating} />}

                  {/* Hapus dari riwayat (hanya untuk completed/cancelled) */}
                  {["completed", "cancelled"].includes(booking.status) && (
                    <button
                      onClick={() => handleDeleteBooking(booking)}
                      className="flex items-center gap-1.5 px-3 py-2 border border-red-200 text-xs text-red-500 hover:bg-red-50 font-[var(--font-sans)] transition-all"
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
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Hapus dari Riwayat
                    </button>
                  )}
                </div>

                {/* Expandable Booking Details */}
                {expandedBookingId === booking.id && (
                  <div className="mt-5 p-4 bg-[var(--color-cream)] border border-[var(--color-cream-border)] text-xs space-y-3 font-[var(--font-sans)] animate-fadeIn">
                    <h4 className="font-semibold text-[10px] uppercase tracking-widest text-[var(--color-gold)] mb-2">
                      Informasi Pemesanan Lengkap
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p>
                          <span className="text-[var(--color-slate)] font-medium">
                            Nama Pemesan:
                          </span>{" "}
                          <span className="text-[var(--color-dark)] font-semibold">
                            {booking.pemesan_name}
                          </span>
                        </p>
                        <p>
                          <span className="text-[var(--color-slate)] font-medium">
                            Email Pemesan:
                          </span>{" "}
                          <span className="text-[var(--color-dark)]">
                            {booking.pemesan_email}
                          </span>
                        </p>
                        <p>
                          <span className="text-[var(--color-slate)] font-medium">
                            No. Handphone:
                          </span>{" "}
                          <span className="text-[var(--color-dark)] font-mono">
                            {booking.pemesan_phone}
                          </span>
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p>
                          <span className="text-[var(--color-slate)] font-medium">
                            Tanggal Pernikahan:
                          </span>{" "}
                          <span className="text-[var(--color-dark)] font-semibold">
                            {formatDate(booking.wedding_date)}
                          </span>
                        </p>
                        <p>
                          <span className="text-[var(--color-slate)] font-medium">
                            Lokasi Pernikahan:
                          </span>{" "}
                          <span className="text-[var(--color-dark)]">
                            {booking.location}
                          </span>
                        </p>
                        <p>
                          <span className="text-[var(--color-slate)] font-medium">
                            Konsep Dekorasi:
                          </span>{" "}
                          <span className="text-[var(--color-dark)]">
                            {booking.konsep}
                          </span>
                        </p>
                      </div>
                    </div>
                    {booking.notes && (
                      <div className="pt-2 border-t border-[var(--color-cream-border)]">
                        <p className="text-[var(--color-slate)] font-medium mb-1">
                          Catatan Tambahan:
                        </p>
                        <p className="text-[var(--color-dark-muted)] italic">
                          "{booking.notes}"
                        </p>
                      </div>
                    )}
                    {booking.vendor_requests?.find(
                      (vr) => vr.status === "confirmed",
                    )?.vendor_notes && (
                      <div className="pt-2 border-t border-[var(--color-cream-border)] bg-teal-50/50 p-2.5 rounded border border-teal-100">
                        <p className="text-[10px] uppercase tracking-widest text-teal-800 font-bold mb-1">
                          💬 Detail Pertemuan / Koordinasi dari Vendor:
                        </p>
                        <p className="text-xs font-semibold text-teal-900 leading-relaxed">
                          {
                            booking.vendor_requests.find(
                              (vr) => vr.status === "confirmed",
                            ).vendor_notes
                          }
                        </p>
                      </div>
                    )}
                    {booking.tech_meeting_at && (
                      <div className="pt-2 border-t border-[var(--color-cream-border)] bg-purple-50/50 p-2.5 rounded border border-purple-100">
                        <p className="text-[10px] uppercase tracking-widest text-purple-800 font-bold mb-1">
                          📅 Jadwal Technical Meeting (Koordinasi):
                        </p>
                        <p className="text-xs text-purple-900 leading-relaxed">
                          <strong>Waktu:</strong>{" "}
                          {new Date(booking.tech_meeting_at).toLocaleString(
                            "id-ID",
                            { dateStyle: "long", timeStyle: "short" },
                          )}
                          <br />
                          <strong>Lokasi:</strong>{" "}
                          {booking.tech_meeting_location}
                          <br />
                          {booking.tech_meeting_notes && (
                            <>
                              <strong>Catatan:</strong>{" "}
                              {booking.tech_meeting_notes}
                            </>
                          )}
                        </p>
                      </div>
                    )}
                    <div className="pt-2 border-t border-[var(--color-cream-border)] grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px]">
                      <div className="p-2 bg-white border border-[var(--color-cream-border)]">
                        <p className="text-[var(--color-slate)] font-medium">
                          Total Paket
                        </p>
                        <p className="font-bold text-[var(--color-dark)]">
                          {formatRupiah(booking.total_price)}
                        </p>
                      </div>
                      <div className="p-2 bg-white border border-[var(--color-cream-border)]">
                        <p className="text-[var(--color-slate)] font-medium">
                          DP 30%
                        </p>
                        <p className="font-bold text-[var(--color-gold)]">
                          {formatRupiah(
                            booking.dp_amount ||
                              Math.round(booking.total_price * 0.3),
                          )}
                        </p>
                      </div>
                      <div className="p-2 bg-white border border-[var(--color-cream-border)]">
                        <p className="text-[var(--color-slate)] font-medium">
                          Sisa Pelunasan (70%)
                        </p>
                        <p className="font-bold text-[var(--color-slate)]">
                          {formatRupiah(
                            booking.total_price -
                              (booking.dp_amount ||
                                Math.round(booking.total_price * 0.3)),
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Batalkan */}
      <Modal
        isOpen={!!cancelModal}
        onClose={() => setCancelModal(null)}
        title="Batalkan Booking"
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCancelModal(null)}
            >
              Kembali
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={acting}
              onClick={handleCancel}
            >
              Ya, Batalkan
            </Button>
          </>
        }
      >
        {cancelModal && (
          <div className="space-y-3">
            <div className="px-3 py-2 bg-red-50 border border-red-200">
              <p className="text-xs text-red-700 font-[var(--font-sans)]">
                ⚠️ Pembatalan booking tidak dapat dikembalikan.
              </p>
            </div>
            <p className="text-sm text-[var(--color-dark-muted)] font-[var(--font-sans)]">
              Yakin membatalkan booking <strong>{cancelModal.order_id}</strong>?
            </p>
          </div>
        )}
      </Modal>

      {/* Modal Rating */}
      <Modal
        isOpen={!!ratingModal}
        onClose={() => setRatingModal(null)}
        title="Beri Penilaian"
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRatingModal(null)}
            >
              Batal
            </Button>
            <Button
              variant="gold"
              size="sm"
              isLoading={acting}
              onClick={handleRating}
            >
              Kirim
            </Button>
          </>
        }
      >
        {ratingModal && (
          <div className="space-y-5">
            <div>
              <p className="text-sm text-[var(--color-dark-muted)] font-[var(--font-sans)] mb-3">
                Bagaimana pengalaman pernikahan Anda bersama AMARANTA?
              </p>
              <StarRating value={ratingValue} onChange={setRatingValue} />
              <p className="text-xs text-[var(--color-slate)] font-[var(--font-sans)] mt-1">
                {
                  ["", "Buruk", "Kurang", "Cukup", "Bagus", "Luar Biasa!"][
                    ratingValue
                  ]
                }
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--color-dark-muted)] font-[var(--font-sans)] block mb-1.5">
                Ulasan
              </label>
              <textarea
                rows={3}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Ceritakan pengalaman Anda..."
                className="w-full border-b-2 border-[var(--color-cream-border)] focus:border-[var(--color-gold)] bg-transparent text-sm font-[var(--font-sans)] outline-none py-2 resize-none transition-colors"
              />
            </div>
          </div>
        )}
      </Modal>

      {/* PERBAIKAN: Modal Pembayaran DP 30% */}
      <Modal
        isOpen={!!dpPaymentModal}
        onClose={() => {
          if (!payLoading) setDpPaymentModal(null);
        }}
        title="Bayar DP 30%"
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDpPaymentModal(null)}
              disabled={payLoading}
            >
              Batal
            </Button>
            <Button
              variant="gold"
              size="sm"
              isLoading={payLoading}
              onClick={handlePayDp}
            >
              Lanjut ke Pembayaran
            </Button>
          </>
        }
      >
        {dpPaymentModal && (
          <div className="space-y-4">
            <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded">
              <p className="text-xs text-blue-700 font-[var(--font-sans)]">
                ℹ️ Pembayaran DP 30% untuk mengamankan booking Anda. Sisa 70%
                dapat dibayar kemudian.
              </p>
            </div>

            {/* Detail Pemesanan */}
            <div className="px-3 py-3 bg-gray-50 rounded border border-gray-200">
              <p className="text-xs font-semibold text-[var(--color-dark)] mb-2 uppercase tracking-widest">
                Detail Pemesanan
              </p>
              <div className="space-y-1.5 text-xs font-[var(--font-sans)]">
                <div className="flex justify-between">
                  <span className="text-[var(--color-slate)]">Paket:</span>
                  <span className="text-[var(--color-dark)] font-medium">
                    {dpPaymentModal.package?.tier_name ||
                      dpPaymentModal.package?.tier_id?.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-slate)]">Tanggal:</span>
                  <span className="text-[var(--color-dark)] font-medium">
                    {new Date(dpPaymentModal.wedding_date).toLocaleDateString(
                      "id-ID",
                      { day: "2-digit", month: "short", year: "numeric" },
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-slate)]">Lokasi:</span>
                  <span className="text-[var(--color-dark)] font-medium text-right">
                    {dpPaymentModal.location}
                  </span>
                </div>
                {dpPaymentModal.notes && (
                  <div className="flex justify-between">
                    <span className="text-[var(--color-slate)]">Tamu:</span>
                    <span className="text-[var(--color-dark)] font-medium">
                      {dpPaymentModal.notes.match(/Jumlah Tamu: (\d+)/)?.[1] ||
                        "-"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Breakdown Pembayaran */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-[var(--font-sans)]">
                <span className="text-[var(--color-slate)]">Total Harga</span>
                <span className="text-[var(--color-dark)]">
                  {formatRupiah(dpPaymentModal.total_price)}
                </span>
              </div>
              <div className="border-t border-[var(--color-cream-border)] pt-2 flex justify-between text-sm font-medium font-[var(--font-sans)]">
                <span className="text-[var(--color-dark)]">DP 30%</span>
                <span className="text-[var(--color-gold)]">
                  {formatRupiah(
                    dpPaymentModal.dp_amount ||
                      Math.round(dpPaymentModal.total_price * 0.3),
                  )}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* BUG FIX: Modal Pembayaran Pelunasan */}
      <Modal
        isOpen={!!paymentModal}
        onClose={() => {
          if (!payLoading) setPaymentModal(null);
        }}
        title="Bayar Pelunasan"
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPaymentModal(null)}
              disabled={payLoading}
            >
              Batal
            </Button>
            <Button
              variant="gold"
              size="sm"
              isLoading={payLoading}
              onClick={handlePayRemaining}
            >
              Lanjut ke Pembayaran
            </Button>
          </>
        }
      >
        {paymentModal && (
          <div className="space-y-4">
            <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded">
              <p className="text-xs text-amber-700 font-[var(--font-sans)]">
                ℹ️ Anda telah membayar DP 30%, sekarang selesaikan pembayaran
                sisanya sebesar{" "}
                {formatRupiah(
                  paymentModal.total_price -
                    (paymentModal.dp_amount ||
                      Math.round(paymentModal.total_price * 0.3)),
                )}
              </p>
            </div>

            {/* Detail Pemesanan */}
            <div className="px-3 py-3 bg-gray-50 rounded border border-gray-200">
              <p className="text-xs font-semibold text-[var(--color-dark)] mb-2 uppercase tracking-widest">
                Detail Pemesanan
              </p>
              <div className="space-y-1.5 text-xs font-[var(--font-sans)]">
                <div className="flex justify-between">
                  <span className="text-[var(--color-slate)]">Paket:</span>
                  <span className="text-[var(--color-dark)] font-medium">
                    {paymentModal.package?.tier_name ||
                      paymentModal.package?.tier_id?.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-slate)]">Tanggal:</span>
                  <span className="text-[var(--color-dark)] font-medium">
                    {new Date(paymentModal.wedding_date).toLocaleDateString(
                      "id-ID",
                      { day: "2-digit", month: "short", year: "numeric" },
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-slate)]">Lokasi:</span>
                  <span className="text-[var(--color-dark)] font-medium text-right">
                    {paymentModal.location}
                  </span>
                </div>
                {paymentModal.notes && (
                  <div className="flex justify-between">
                    <span className="text-[var(--color-slate)]">Tamu:</span>
                    <span className="text-[var(--color-dark)] font-medium">
                      {paymentModal.notes.match(/Jumlah Tamu: (\d+)/)?.[1] ||
                        "-"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Breakdown Pembayaran */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-[var(--font-sans)]">
                <span className="text-[var(--color-slate)]">Total Harga</span>
                <span className="text-[var(--color-dark)]">
                  {formatRupiah(paymentModal.total_price)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-[var(--font-sans)]">
                <span className="text-[var(--color-slate)]">
                  DP 30% (Sudah Bayar)
                </span>
                <span className="text-green-600">
                  -
                  {formatRupiah(
                    paymentModal.dp_amount ||
                      Math.round(paymentModal.total_price * 0.3),
                  )}
                </span>
              </div>
              <div className="border-t border-[var(--color-cream-border)] pt-2 flex justify-between text-sm font-medium font-[var(--font-sans)]">
                <span className="text-[var(--color-dark)]">
                  Sisa Pembayaran 70%
                </span>
                <span className="text-[var(--color-gold)]">
                  {formatRupiah(
                    paymentModal.total_price -
                      (paymentModal.dp_amount ||
                        Math.round(paymentModal.total_price * 0.3)),
                  )}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
