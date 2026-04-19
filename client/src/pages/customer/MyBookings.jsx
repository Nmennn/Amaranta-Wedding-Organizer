import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import useAuthStore from "../../store/authStore";
import { bookingService } from "../../services";
import { toastSuccess, toastError } from "../../hooks/useToast";
import { formatRupiah } from "../../data/packages";

const PHASES = [
  { id: "pending", label: "Dipesan", icon: "📋" },
  { id: "dp_paid", label: "Bayar Lunas", icon: "💳" },
  { id: "vendor_process", label: "Diproses", icon: "⚙️" },
  { id: "in_event", label: "Hari H", icon: "💒" },
  { id: "rated", label: "Selesai", icon: "⭐" },
];

const ADMIN_MSG = {
  waiting_dp: "⏳ Menunggu pembayaran Anda",
  payment_failed: "❌ Pembayaran gagal. Silakan coba lagi.",
  waiting_vendor: "⚙️ Admin sedang memilih vendor terbaik untuk Anda",
  vendor_assigned: "📨 Menunggu konfirmasi vendor",
  vendor_confirmed: "✅ Vendor dikonfirmasi",
  vendor_rejected: "🔄 Admin mencari vendor pengganti",
  tech_meeting_scheduled: "📅 Tech meeting dijadwalkan — cek email Anda",
  preparation: "🎪 Persiapan sedang berlangsung",
  in_event: "💒 Selamat! Hari istimewa Anda",
  completed: "🎉 Acara selesai",
};

function PhaseBar({ phase, adminStatus }) {
  const stepMap = { pending: 1, dp_paid: 2, in_event: 4, rated: 5 };
  const adminMid = [
    "waiting_vendor",
    "vendor_assigned",
    "vendor_confirmed",
    "vendor_rejected",
    "tech_meeting_scheduled",
    "preparation",
  ].includes(adminStatus);
  const cur = adminMid ? 3 : stepMap[phase] || 1;

  return (
    <div className="flex items-center gap-0 overflow-x-auto pb-1">
      {PHASES.map((p, i) => {
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
                {done ? "✓" : p.icon}
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
            {i < PHASES.length - 1 && (
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

  // Modal states
  const [ratingModal, setRatingModal] = useState(null);
  const [reschedModal, setReschedModal] = useState(null);
  const [cancelModal, setCancelModal] = useState(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [newDate, setNewDate] = useState("");
  const [reschedReason, setReschedReason] = useState("");
  const [acting, setActing] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    bookingService
      .getMy()
      .then((data) => setBookings(Array.isArray(data) ? data : []))
      .catch(() => setFetchErr("Gagal memuat data. Coba refresh halaman."))
      .finally(() => setLoading(false));
  }, []);

  async function handleCancel() {
    if (!cancelModal) return;
    setActing(true);
    try {
      const API = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
      const res = await fetch(`${API}/bookings/${cancelModal.id}/cancel`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization:
            "Bearer " + (localStorage.getItem("amaranta_token") || ""),
        },
      });
      if (res.ok) {
        setBookings((p) =>
          p.map((b) =>
            b.id === cancelModal.id
              ? { ...b, status: "cancelled", admin_status: "cancelled" }
              : b,
          ),
        );
        toastSuccess("Booking berhasil dibatalkan.");
        setCancelModal(null);
      } else {
        const d = await res.json();
        toastError(d.message || "Gagal membatalkan booking.");
      }
    } catch {
      toastError("Tidak bisa terhubung ke server.");
    } finally {
      setActing(false);
    }
  }

  async function handleReschedule() {
    if (!newDate) return;
    setActing(true);
    try {
      await bookingService.reschedule(reschedModal.id, {
        wedding_date: newDate,
        reason: reschedReason,
      });
      setBookings((p) =>
        p.map((b) =>
          b.id === reschedModal.id ? { ...b, wedding_date: newDate } : b,
        ),
      );
      toastSuccess("Tanggal berhasil diubah ke " + newDate);
      setReschedModal(null);
      setNewDate("");
      setReschedReason("");
    } catch (err) {
      toastError(err.userMessage || "Gagal mengubah tanggal.");
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
      setBookings((p) =>
        p.map((b) =>
          b.id === ratingModal.id
            ? { ...b, phase: "rated", rating: ratingValue }
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

  // Apakah booking bisa di-reschedule?
  // Hanya sebelum vendor confirmed
  function canReschedule(b) {
    return [
      "waiting_dp",
      "payment_failed",
      "waiting_vendor",
      "vendor_assigned",
    ].includes(b.admin_status);
  }

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
      <div className="mb-8">
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
                        📅 {booking.wedding_date || "—"}
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
                  <div className="mb-4 px-3 py-2 bg-[var(--color-cream)] border border-[var(--color-cream-border)] text-xs font-[var(--font-sans)] text-[var(--color-dark-muted)]">
                    {ADMIN_MSG[booking.admin_status]}
                    {booking.vendor?.name &&
                      booking.admin_status === "vendor_confirmed" && (
                        <span className="ml-2 font-medium text-[var(--color-dark)]">
                          — {booking.vendor.name}
                        </span>
                      )}
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
                  />
                </div>

                {/* Aksi */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Invoice — setelah bayar */}
                  {["dp_paid", "in_event", "pelunasan", "rated"].includes(
                    booking.phase,
                  ) && (
                    <Link
                      to={"/pelanggan/invoice/" + booking.id}
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
                      Invoice PDF
                    </Link>
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

                  {/* Reschedule — sebelum vendor confirmed */}
                  {canReschedule(booking) && (
                    <button
                      onClick={() => {
                        setReschedModal(booking);
                        setNewDate(booking.wedding_date || "");
                        setReschedReason("");
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 border border-[var(--color-cream-border)] text-xs text-[var(--color-dark-muted)] hover:border-amber-400 hover:text-amber-600 font-[var(--font-sans)] transition-all"
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
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      Ubah Tanggal
                    </button>
                  )}

                  {/* Beri rating */}
                  {booking.phase === "in_event" && !booking.rating && (
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
                </div>
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

      {/* Modal Reschedule */}
      <Modal
        isOpen={!!reschedModal}
        onClose={() => setReschedModal(null)}
        title="Ubah Tanggal Pernikahan"
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReschedModal(null)}
            >
              Batal
            </Button>
            <Button
              variant="gold"
              size="sm"
              isLoading={acting}
              onClick={handleReschedule}
              disabled={!newDate}
            >
              Simpan
            </Button>
          </>
        }
      >
        {reschedModal && (
          <div className="space-y-4">
            <div className="px-3 py-2 bg-amber-50 border border-amber-200">
              <p className="text-xs text-amber-700 font-[var(--font-sans)]">
                ⚠️ Perubahan tanggal hanya bisa dilakukan sebelum vendor
                dikonfirmasi admin.
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--color-dark-muted)] font-[var(--font-sans)] block mb-1.5">
                Tanggal Baru <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                min={today}
                className="w-full border-b-2 border-[var(--color-cream-border)] focus:border-[var(--color-gold)] bg-transparent py-2 text-sm font-[var(--font-sans)] outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--color-dark-muted)] font-[var(--font-sans)] block mb-1.5">
                Alasan Perubahan
              </label>
              <textarea
                rows={2}
                value={reschedReason}
                onChange={(e) => setReschedReason(e.target.value)}
                placeholder="Alasan pengubahan tanggal (opsional)..."
                className="w-full border-b-2 border-[var(--color-cream-border)] focus:border-[var(--color-gold)] bg-transparent text-sm font-[var(--font-sans)] outline-none py-1 resize-none transition-colors"
              />
            </div>
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
    </div>
  );
}
