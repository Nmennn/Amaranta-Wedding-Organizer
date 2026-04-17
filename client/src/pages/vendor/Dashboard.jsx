// ============================================================
// src/pages/vendor/Dashboard.jsx
// Dashboard vendor — SEDERHANA, hanya untuk konfirmasi request
// dari admin. Tidak ada pengelolaan paket atau profil.
// ============================================================
import { useState } from "react";
import { Link } from "react-router-dom";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import useAuthStore from "../../store/authStore";
import { formatRupiah } from "../../data/packages";

const STATUS_V = {
  confirmed: "success",
  pending: "warning",
  rejected: "danger",
};
const STATUS_L = {
  confirmed: "Dikonfirmasi",
  pending: "Menunggu Respons",
  rejected: "Ditolak",
};

// Mock: semua vendor_requests yang masuk
const MOCK_REQUESTS = [
  {
    id: 1,
    status: "pending",
    created_at: "2025-06-01T08:00:00",
    assigned_by: { name: "Admin AMARANTA" },
    booking: {
      order_id: "AMRT-10012345",
      customer: { name: "Rina & Budi", phone: "081234567890" },
      package: { tier_id: "gold" },
      wedding_date: "2025-09-15",
      location: "Jakarta Selatan, Gedung Smesco",
      konsep: "Garden Romantic — dominan hijau dan emas",
      total_price: 45000000,
      notes: "Butuh dekorasi bunga segar, tamu sekitar 150 orang",
    },
  },
  {
    id: 2,
    status: "confirmed",
    created_at: "2025-05-20T10:00:00",
    responded_at: "2025-05-20T11:30:00",
    assigned_by: { name: "Admin AMARANTA" },
    booking: {
      order_id: "AMRT-10012300",
      customer: { name: "Maya & Reza" },
      package: { tier_id: "silver" },
      wedding_date: "2025-08-05",
      location: "Surabaya, Harris Hotel",
      konsep: "Rustic Outdoor",
      total_price: 25000000,
      notes: "",
    },
  },
  {
    id: 3,
    status: "rejected",
    created_at: "2025-05-15T09:00:00",
    responded_at: "2025-05-15T10:00:00",
    rejection_reason: "Tanggal tersebut sudah ada acara lain",
    assigned_by: { name: "Admin AMARANTA" },
    booking: {
      order_id: "AMRT-10012288",
      customer: { name: "Sari & Doni" },
      package: { tier_id: "platinum" },
      wedding_date: "2025-09-15",
      location: "Bali",
      konsep: "Tropical Luxury",
      total_price: 85000000,
      notes: "",
    },
  },
];

function VendorDashboard() {
  const user = useAuthStore((s) => s.user);
  const [requests, setRequests] = useState(MOCK_REQUESTS);
  const [detail, setDetail] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [vendorNotes, setVendorNotes] = useState("");

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const confirmedCount = requests.filter(
    (r) => r.status === "confirmed",
  ).length;

  function handleConfirm(req) {
    // nanti: vendorRequestService.confirm(req.id, { vendor_notes: vendorNotes })
    setRequests((prev) =>
      prev.map((r) =>
        r.id === req.id
          ? {
              ...r,
              status: "confirmed",
              responded_at: new Date().toISOString(),
            }
          : r,
      ),
    );
    setDetail(null);
    setVendorNotes("");
  }

  function handleReject() {
    if (!rejectReason.trim()) return;
    // nanti: vendorRequestService.reject(rejectModal.id, { rejection_reason: rejectReason })
    setRequests((prev) =>
      prev.map((r) =>
        r.id === rejectModal.id
          ? { ...r, status: "rejected", responded_at: new Date().toISOString() }
          : r,
      ),
    );
    setRejectModal(null);
    setRejectReason("");
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-gold)] font-[var(--font-sans)] mb-1">
          Panel Vendor
        </p>
        <h1 className="font-[var(--font-display)] text-3xl text-[var(--color-dark)] mb-1">
          Halo, {user?.name?.split(" ")[0]}
        </h1>
        <p className="text-sm text-[var(--color-slate)] font-[var(--font-sans)]">
          Konfirmasi atau tolak request booking yang dikirim admin AMARANTA.
        </p>
      </div>

      {/* Ringkasan singkat */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {[
          {
            label: "Menunggu Respons",
            value: pendingCount,
            color:
              pendingCount > 0 ? "text-amber-600" : "text-[var(--color-dark)]",
            bg:
              pendingCount > 0
                ? "bg-amber-50 border-amber-200"
                : "bg-white border-[var(--color-cream-border)]",
          },
          {
            label: "Dikonfirmasi",
            value: confirmedCount,
            color: "text-emerald-600",
            bg: "bg-white border-[var(--color-cream-border)]",
          },
          {
            label: "Total Request",
            value: requests.length,
            color: "text-[var(--color-dark)]",
            bg: "bg-white border-[var(--color-cream-border)]",
          },
        ].map((item) => (
          <div
            key={item.label}
            className={["border p-4 text-center", item.bg].join(" ")}
          >
            <p
              className={[
                "font-[var(--font-display)] text-3xl mb-1",
                item.color,
              ].join(" ")}
            >
              {item.value}
            </p>
            <p className="text-xs text-[var(--color-slate)] font-[var(--font-sans)] uppercase tracking-widest">
              {item.label}
            </p>
          </div>
        ))}
      </div>

      {/* Alert: ada request pending */}
      {pendingCount > 0 && (
        <div className="mb-6 px-5 py-4 bg-amber-50 border border-amber-200 flex items-center gap-3">
          <span className="w-8 h-8 bg-amber-200 rounded-full flex items-center justify-center text-amber-700 font-bold flex-shrink-0">
            {pendingCount}
          </span>
          <div>
            <p className="text-sm font-medium text-amber-800 font-[var(--font-sans)]">
              Ada {pendingCount} request baru yang menunggu respons Anda
            </p>
            <p className="text-xs text-amber-600 font-[var(--font-sans)]">
              Harap merespons sesegera mungkin agar proses persiapan tidak
              tertunda
            </p>
          </div>
        </div>
      )}

      {/* Daftar request */}
      <div className="space-y-4">
        {requests.map((req) => (
          <div
            key={req.id}
            className={[
              "bg-white border-2 p-5 transition-all",
              req.status === "pending"
                ? "border-amber-300 shadow-sm"
                : "border-[var(--color-cream-border)]",
            ].join(" ")}
          >
            {/* Header row */}
            <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge variant={STATUS_V[req.status]} dot>
                    {STATUS_L[req.status]}
                  </Badge>
                  <span className="text-xs font-mono text-[var(--color-gold)] font-[var(--font-sans)]">
                    {req.booking.order_id}
                  </span>
                  <span
                    className={[
                      "text-xs px-2 py-0.5 font-[var(--font-sans)]",
                      {
                        silver: "bg-gray-100 text-gray-600",
                        gold: "bg-amber-50 text-amber-700",
                        platinum: "bg-purple-50 text-purple-700",
                      }[req.booking.package.tier_id] || "",
                    ].join(" ")}
                  >
                    Paket{" "}
                    {req.booking.package.tier_id.charAt(0).toUpperCase() +
                      req.booking.package.tier_id.slice(1)}
                  </span>
                </div>
                <p className="text-xs text-[var(--color-slate)] font-[var(--font-sans)]">
                  Dari: {req.assigned_by.name} ·{" "}
                  {new Date(req.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <Button
                size="xs"
                variant="outline"
                onClick={() => setDetail(req)}
              >
                Lihat Detail
              </Button>
            </div>

            {/* Info acara */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-[var(--font-sans)] mb-4">
              <div>
                <p className="text-[var(--color-slate)]">Pasangan</p>
                <p className="font-medium text-[var(--color-dark)]">
                  {req.booking.customer.name}
                </p>
              </div>
              <div>
                <p className="text-[var(--color-slate)]">Tgl. Nikah</p>
                <p className="font-medium text-[var(--color-dark)]">
                  {req.booking.wedding_date}
                </p>
              </div>
              <div>
                <p className="text-[var(--color-slate)]">Lokasi</p>
                <p className="font-medium text-[var(--color-dark)] truncate">
                  {req.booking.location}
                </p>
              </div>
              <div>
                <p className="text-[var(--color-slate)]">Nilai</p>
                <p className="font-medium text-[var(--color-gold)]">
                  {formatRupiah(req.booking.total_price)}
                </p>
              </div>
            </div>

            {/* Konsep */}
            <div className="px-3 py-2 bg-[var(--color-cream)] border border-[var(--color-cream-border)] text-xs font-[var(--font-sans)] text-[var(--color-dark-muted)] mb-4">
              🎨 {req.booking.konsep}
              {req.booking.notes && <> · {req.booking.notes}</>}
            </div>

            {/* Tombol aksi — hanya untuk pending */}
            {req.status === "pending" && (
              <div className="flex gap-3 pt-3 border-t border-[var(--color-cream-border)]">
                <Button variant="gold" size="sm" onClick={() => setDetail(req)}>
                  ✅ Konfirmasi Kesanggupan
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    setRejectModal(req);
                    setRejectReason("");
                  }}
                >
                  ❌ Tolak
                </Button>
              </div>
            )}

            {/* Info jika sudah ditolak */}
            {req.status === "rejected" && req.rejection_reason && (
              <div className="mt-3 px-3 py-2 bg-red-50 border border-red-100 text-xs text-red-600 font-[var(--font-sans)]">
                Alasan penolakan: {req.rejection_reason}
              </div>
            )}
          </div>
        ))}
      </div>

      {requests.length === 0 && (
        <div className="text-center py-16">
          <p className="font-[var(--font-display)] text-2xl text-[var(--color-dark-subtle)] mb-2">
            Belum ada request masuk
          </p>
          <p className="text-sm text-[var(--color-slate)] font-[var(--font-sans)]">
            Admin akan mengirimkan request booking saat ada pesanan baru.
          </p>
        </div>
      )}

      {/* Modal detail + konfirmasi */}
      <Modal
        isOpen={!!detail}
        onClose={() => setDetail(null)}
        title={detail ? "Detail Request — " + detail.booking.order_id : ""}
        size="lg"
        footer={
          detail?.status === "pending" ? (
            <>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  setRejectModal(detail);
                  setDetail(null);
                }}
              >
                Tolak
              </Button>
              <Button
                variant="gold"
                size="sm"
                onClick={() => handleConfirm(detail)}
              >
                Konfirmasi Kesanggupan
              </Button>
            </>
          ) : undefined
        }
      >
        {detail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Pasangan", value: detail.booking.customer.name },
                { label: "Tgl. Nikah", value: detail.booking.wedding_date },
                { label: "Lokasi", value: detail.booking.location },
                { label: "Konsep", value: detail.booking.konsep },
                {
                  label: "Paket",
                  value: "Paket " + detail.booking.package.tier_id,
                },
                {
                  label: "Nilai",
                  value: formatRupiah(detail.booking.total_price),
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="border border-[var(--color-cream-border)] p-3"
                >
                  <p className="text-[10px] uppercase tracking-widest text-[var(--color-slate)] font-[var(--font-sans)]">
                    {item.label}
                  </p>
                  <p className="text-sm font-medium text-[var(--color-dark)] font-[var(--font-sans)]">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {detail.booking.notes && (
              <div className="bg-[var(--color-cream)] p-3 border border-[var(--color-cream-border)]">
                <p className="text-[10px] uppercase tracking-widest text-[var(--color-slate)] font-[var(--font-sans)] mb-1">
                  Catatan Customer
                </p>
                <p className="text-sm text-[var(--color-dark-muted)] font-[var(--font-sans)]">
                  {detail.booking.notes}
                </p>
              </div>
            )}

            {detail.status === "pending" && (
              <div>
                <label className="text-sm font-medium text-[var(--color-dark-muted)] font-[var(--font-sans)] block mb-1.5">
                  Catatan Konfirmasi{" "}
                  <span className="text-[var(--color-slate)] font-normal">
                    (opsional)
                  </span>
                </label>
                <textarea
                  rows={2}
                  value={vendorNotes}
                  onChange={(e) => setVendorNotes(e.target.value)}
                  placeholder="Catatan untuk admin, misal kesiapan tim, kondisi khusus..."
                  className="w-full border-b-2 border-[var(--color-cream-border)] focus:border-[var(--color-gold)] bg-transparent text-sm font-[var(--font-sans)] outline-none py-1 resize-none transition-colors"
                />
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal tolak */}
      <Modal
        isOpen={!!rejectModal}
        onClose={() => setRejectModal(null)}
        title="Tolak Request"
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRejectModal(null)}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleReject}
              disabled={!rejectReason.trim()}
            >
              Kirim Penolakan
            </Button>
          </>
        }
      >
        {rejectModal && (
          <div className="space-y-4">
            <p className="text-sm text-[var(--color-dark-muted)] font-[var(--font-sans)]">
              Anda menolak request untuk{" "}
              <strong>{rejectModal.booking.customer.name}</strong>. Admin akan
              memilih vendor lain untuk booking ini.
            </p>
            <div>
              <label className="text-sm font-medium text-[var(--color-dark-muted)] font-[var(--font-sans)] block mb-1.5">
                Alasan Penolakan <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Contoh: Tanggal sudah terisi, lokasi terlalu jauh, kapasitas tidak memadai..."
                className="w-full border-b-2 border-[var(--color-cream-border)] focus:border-red-400 bg-transparent text-sm font-[var(--font-sans)] outline-none py-2 resize-none transition-colors"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default VendorDashboard;
