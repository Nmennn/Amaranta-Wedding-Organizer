// src/pages/customer/MyBookings.jsx
// PERUBAHAN: Phase baru + info admin workflow progress untuk customer
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import useAuthStore from "../../store/authStore";
import { formatRupiah } from "../../data/packages";
import { bookingService } from "../../services";

const PHASES = [
  { id: "pending", label: "Booking Dibuat", step: 1, icon: "📋" },
  { id: "dp_paid", label: "DP Lunas", step: 2, icon: "💳" },
  { id: "vendor_process", label: "Diproses Admin", step: 3, icon: "⚙️" },
  { id: "in_event", label: "Hari H", step: 4, icon: "💒" },
  { id: "pelunasan", label: "Pelunasan", step: 5, icon: "✅" },
  { id: "rated", label: "Selesai", step: 6, icon: "⭐" },
];

const ADMIN_STATUS_MSG = {
  waiting_dp: "⏳ Menunggu pembayaran DP Anda",
  dp_failed: "❌ DP gagal. Silakan bayar DP untuk melanjutkan.",
  waiting_vendor: "⚙️ Admin sedang memilih vendor terbaik untuk Anda",
  vendor_assigned: "📨 Menunggu konfirmasi vendor",
  vendor_confirmed: "✅ Vendor sudah dikonfirmasi! Pelunasan bisa dilakukan.",
  vendor_rejected: "🔄 Admin sedang mencari vendor pengganti",
  tech_meeting_scheduled: "📅 Tech meeting dijadwalkan — cek email Anda",
  preparation: "🎪 Persiapan sedang berlangsung",
  in_event: "💒 Hari ini adalah hari istimewa Anda!",
  completed: "🎉 Acara selesai",
};

// Data booking diambil dari API (/api/bookings/my)

function PhaseBar({ phase, adminStatus }) {
  const dpPaid = [
    "dp_paid",
    "vendor_process",
    "in_event",
    "pelunasan",
    "rated",
  ].includes(phase);
  const inProc = [
    "waiting_vendor",
    "vendor_assigned",
    "vendor_confirmed",
    "vendor_rejected",
    "tech_meeting_scheduled",
    "preparation",
  ].includes(adminStatus);
  const inEvent = phase === "in_event" || adminStatus === "in_event";
  const lunas = phase === "pelunasan" || phase === "rated";
  const done = phase === "rated";

  const activeStep = done
    ? 6
    : lunas
      ? 5
      : inEvent
        ? 4
        : inProc
          ? 3
          : dpPaid
            ? 2
            : 1;

  return (
    <div className="flex items-center gap-0 overflow-x-auto pb-1">
      {PHASES.map((p, i) => {
        const isActive = p.step <= activeStep;
        const isCurrent = p.step === activeStep;
        return (
          <div key={p.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1 min-w-[52px]">
              <div
                className={[
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all",
                  isActive
                    ? isCurrent
                      ? "bg-[var(--color-gold)] text-[var(--color-dark)] shadow-[var(--shadow-gold)]"
                      : "bg-[var(--color-dark)] text-[var(--color-cream)]"
                    : "bg-[var(--color-cream-border)] text-[var(--color-slate)]",
                ].join(" ")}
              >
                {isActive && !isCurrent ? "✓" : p.icon}
              </div>
              <span
                className={[
                  "text-[9px] uppercase tracking-widest font-[var(--font-sans)] text-center leading-tight",
                  isCurrent
                    ? "text-[var(--color-gold)] font-bold"
                    : isActive
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
                  "h-0.5 w-5 -mt-5",
                  p.step < activeStep
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
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHovered(star)}
          onMouseLeave={() => onChange && setHovered(0)}
          className={[
            "text-2xl transition-colors",
            star <= (hovered || value)
              ? "text-[var(--color-gold)]"
              : "text-[var(--color-cream-border)]",
            onChange ? "cursor-pointer hover:scale-110" : "cursor-default",
          ].join(" ")}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function CustomerMyBookings() {
  const user = useAuthStore((s) => s.user);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchErr, setFetchErr] = useState("");

  // Fetch booking dari API saat komponen dimuat
  useEffect(() => {
    bookingService
      .getMy()
      .then((data) => setBookings(Array.isArray(data) ? data : []))
      .catch(() =>
        setFetchErr("Gagal memuat data pemesanan. Coba refresh halaman."),
      )
      .finally(() => setLoading(false));
  }, []);
  const [ratingModal, setRatingModal] = useState(null);
  const [lunasiModal, setLunasiModal] = useState(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [reviewText, setReviewText] = useState("");

  function handlePayDP(booking) {
    // nanti: bookingService.payDP(booking.id) → snap token → window.snap.pay(...)
    setBookings((prev) =>
      prev.map((b) =>
        b.id === booking.id
          ? { ...b, phase: "dp_paid", admin_status: "waiting_vendor" }
          : b,
      ),
    );
  }

  function handleLunasi() {
    if (!lunasiModal) return;
    setBookings((prev) =>
      prev.map((b) =>
        b.id === lunasiModal.id
          ? { ...b, phase: "pelunasan", admin_status: "preparation" }
          : b,
      ),
    );
    setLunasiModal(null);
  }

  function handleSubmitRating() {
    if (!ratingModal) return;
    setBookings((prev) =>
      prev.map((b) =>
        b.id === ratingModal.id
          ? {
              ...b,
              phase: "rated",
              status: "completed",
              rating: ratingValue,
              review: reviewText,
            }
          : b,
      ),
    );
    setRatingModal(null);
    setRatingValue(5);
    setReviewText("");
  }

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

      {/* Loading state */}
      {loading && (
        <div className="text-center py-16">
          <div className="inline-block w-8 h-8 border-2 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm text-[var(--color-slate)] font-[var(--font-sans)]">
            Memuat data pemesanan...
          </p>
        </div>
      )}

      {/* Error state */}
      {!loading && fetchErr && (
        <div className="px-5 py-4 bg-red-50 border border-red-200 text-sm text-red-600 font-[var(--font-sans)]">
          ⚠️ {fetchErr}
        </div>
      )}

      {/* Empty state */}
      {!loading && !fetchErr && bookings.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-[var(--font-display)] text-2xl text-[var(--color-dark-subtle)] mb-3">
            Belum ada pemesanan
          </p>
          <Link
            to="/paket"
            className="inline-block px-8 py-3 bg-[var(--color-dark)] text-[var(--color-cream)] text-xs uppercase tracking-widest font-[var(--font-sans)]"
          >
            Pilih Paket
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {bookings.map((booking) => {
            const sisa = booking.total_price - booking.dp_amount;
            return (
              <div
                key={booking.id}
                className="bg-white border border-[var(--color-cream-border)] overflow-hidden"
              >
                <div className="h-1 bg-[var(--color-gold)]" />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
                    <div>
                      <p className="font-[var(--font-display)] text-xl text-[var(--color-dark)]">
                        {booking.vendor?.name || "Vendor Belum Ditentukan"}
                      </p>
                      <p className="text-xs text-[var(--color-slate)] font-[var(--font-sans)]">
                        Paket {booking.package.tier_id} · {booking.wedding_date}
                      </p>
                      <p className="text-xs text-[var(--color-slate)] font-[var(--font-sans)]">
                        📍 {booking.location} · 🎨 {booking.konsep}
                      </p>
                      <p className="text-[10px] font-mono text-[var(--color-gold)] mt-0.5">
                        {booking.order_id}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-[var(--font-display)] text-xl text-[var(--color-dark)]">
                        {formatRupiah(booking.total_price)}
                      </p>
                      <p className="text-xs text-green-600 font-[var(--font-sans)]">
                        DP: {formatRupiah(booking.dp_amount)}
                      </p>
                      {booking.phase !== "rated" && (
                        <p className="text-xs text-orange-500 font-[var(--font-sans)]">
                          Sisa: {formatRupiah(sisa)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Info status dari admin */}
                  {ADMIN_STATUS_MSG[booking.admin_status] && (
                    <div className="mb-4 px-3 py-2 bg-[var(--color-cream)] border border-[var(--color-cream-border)] text-xs font-[var(--font-sans)] text-[var(--color-dark-muted)]">
                      {ADMIN_STATUS_MSG[booking.admin_status]}
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
                      <div className="h-2 bg-[var(--color-cream-border)] rounded-full overflow-hidden">
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

                  {/* Aksi sesuai fase */}
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <span />
                    <div className="flex gap-2 flex-wrap">
                      {/* Bayar DP */}
                      {booking.phase === "pending" &&
                        booking.admin_status !== "dp_failed" && (
                          <Button
                            variant="gold"
                            size="sm"
                            onClick={() => handlePayDP(booking)}
                          >
                            💳 Bayar DP ({formatRupiah(booking.dp_amount)})
                          </Button>
                        )}

                      {/* DP Gagal — coba bayar lagi */}
                      {booking.admin_status === "dp_failed" && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handlePayDP(booking)}
                        >
                          ↩ Coba Bayar DP Lagi
                        </Button>
                      )}

                      {/* Pelunasan — hanya bisa jika vendor sudah confirmed */}
                      {booking.admin_status === "vendor_confirmed" &&
                        booking.phase === "dp_paid" && (
                          <Button
                            variant="gold"
                            size="sm"
                            onClick={() => setLunasiModal(booking)}
                          >
                            ✅ Lunasi ({formatRupiah(sisa)})
                          </Button>
                        )}

                      {/* Beri rating setelah acara & pelunasan */}
                      {booking.phase === "pelunasan" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setRatingModal(booking);
                            setRatingValue(5);
                            setReviewText("");
                          }}
                        >
                          ⭐ Beri Rating
                        </Button>
                      )}

                      {/* Rating sudah diberikan */}
                      {booking.phase === "rated" && booking.rating && (
                        <StarRating value={booking.rating} />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Pelunasan */}
      <Modal
        isOpen={!!lunasiModal}
        onClose={() => setLunasiModal(null)}
        title="Pelunasan Pembayaran"
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLunasiModal(null)}
            >
              Batal
            </Button>
            <Button variant="gold" size="sm" onClick={handleLunasi}>
              Konfirmasi Pelunasan
            </Button>
          </>
        }
      >
        {lunasiModal && (
          <div className="space-y-4">
            <div className="p-4 bg-[var(--color-cream)] border border-[var(--color-cream-border)]">
              <p className="text-sm font-medium text-[var(--color-dark)] font-[var(--font-sans)]">
                {lunasiModal.vendor?.name}
              </p>
              <p className="text-xs text-[var(--color-slate)] font-[var(--font-sans)]">
                Paket {lunasiModal.package.tier_id}
              </p>
            </div>
            <div className="space-y-2 text-sm font-[var(--font-sans)]">
              <div className="flex justify-between">
                <span className="text-[var(--color-slate)]">Total</span>
                <span>{formatRupiah(lunasiModal.total_price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-slate)]">
                  Sudah dibayar (DP)
                </span>
                <span className="text-green-600">
                  - {formatRupiah(lunasiModal.dp_amount)}
                </span>
              </div>
              <div className="flex justify-between font-medium border-t border-[var(--color-cream-border)] pt-2">
                <span>Sisa</span>
                <span className="font-[var(--font-display)] text-xl text-[var(--color-gold)]">
                  {formatRupiah(
                    lunasiModal.total_price - lunasiModal.dp_amount,
                  )}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Rating */}
      <Modal
        isOpen={!!ratingModal}
        onClose={() => setRatingModal(null)}
        title="Beri Rating & Ulasan"
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRatingModal(null)}
            >
              Batal
            </Button>
            <Button variant="gold" size="sm" onClick={handleSubmitRating}>
              Kirim
            </Button>
          </>
        }
      >
        {ratingModal && (
          <div className="space-y-5">
            <StarRating value={ratingValue} onChange={setRatingValue} />
            <p className="text-xs text-[var(--color-slate)] font-[var(--font-sans)]">
              {
                ["", "Buruk", "Kurang", "Cukup", "Bagus", "Luar Biasa!"][
                  ratingValue
                ]
              }
            </p>
            <textarea
              rows={3}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Ceritakan pengalaman Anda..."
              className="w-full border-b-2 border-[var(--color-cream-border)] focus:border-[var(--color-gold)] bg-transparent text-sm font-[var(--font-sans)] resize-none outline-none py-2 transition-colors"
            />
          </div>
        )}
      </Modal>
    </div>
  );
}

export default CustomerMyBookings;
