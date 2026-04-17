// src/pages/vendor/Bookings.jsx
// PERUBAHAN UTAMA:
//   Vendor tidak lagi melihat daftar booking langsung.
//   Vendor melihat vendor_requests yang dikirim admin ke mereka.
//   Aksi: confirm (setuju) atau reject (tolak dengan alasan).
import { useState } from "react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
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

// Mock: vendor_requests yang masuk ke vendor ini
const MOCK_REQUESTS = [
  {
    id: 1,
    status: "pending",
    responded_at: null,
    assigned_by: { name: "Admin AMARANTA" },
    booking: {
      order_id: "AMRT-10012345",
      customer: { name: "Rina & Budi", phone: "081234567890" },
      package: { tier_id: "gold" },
      wedding_date: "2025-09-15",
      location: "Jakarta Selatan, Gedung Smesco",
      konsep: "Garden Romantic — dominan hijau dan emas",
      total_price: 45000000,
      dp_amount: 13500000,
      notes: "Butuh dekorasi bunga segar, tamu sekitar 150 orang",
    },
  },
  {
    id: 2,
    status: "confirmed",
    responded_at: "2025-05-10T09:00:00",
    assigned_by: { name: "Admin AMARANTA" },
    booking: {
      order_id: "AMRT-10012300",
      customer: { name: "Maya & Reza" },
      package: { tier_id: "silver" },
      wedding_date: "2025-08-05",
      location: "Surabaya, Ballroom Harris Hotel",
      konsep: "Rustic Outdoor",
      total_price: 25000000,
      dp_amount: 7500000,
      notes: "",
    },
  },
];

function VendorBookings() {
  const [requests, setRequests] = useState(MOCK_REQUESTS);
  const [detail, setDetail] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [vendorNotes, setVendorNotes] = useState("");

  const pendingCount = requests.filter((r) => r.status === "pending").length;

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
      <div className="mb-8">
        <h1 className="font-[var(--font-display)] text-3xl text-[var(--color-dark)] mb-1">
          Request dari Admin
        </h1>
        <p className="text-sm text-[var(--color-slate)] font-[var(--font-sans)]">
          Admin AMARANTA akan mengirimkan request booking untuk Anda konfirmasi.
        </p>
      </div>

      {pendingCount > 0 && (
        <div className="mb-6 px-5 py-4 bg-amber-50 border border-amber-200 flex items-center gap-3">
          <span className="w-7 h-7 bg-amber-200 rounded-full flex items-center justify-center text-amber-700 font-bold text-sm">
            {pendingCount}
          </span>
          <p className="text-sm text-amber-800 font-[var(--font-sans)] font-medium">
            {pendingCount} request baru menunggu respons Anda
          </p>
        </div>
      )}

      <div className="space-y-4">
        {requests.map((req) => (
          <div
            key={req.id}
            className={[
              "bg-white border-2 p-5 transition-all",
              req.status === "pending"
                ? "border-amber-300"
                : "border-[var(--color-cream-border)]",
            ].join(" ")}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={STATUS_V[req.status]} dot>
                    {STATUS_L[req.status]}
                  </Badge>
                  <span className="text-xs font-mono text-[var(--color-gold)] font-[var(--font-sans)]">
                    {req.booking.order_id}
                  </span>
                </div>
                <p className="text-sm text-[var(--color-slate)] font-[var(--font-sans)]">
                  Di-assign oleh: {req.assigned_by.name}
                  {req.responded_at &&
                    ` · Direspons: ${new Date(req.responded_at).toLocaleDateString("id-ID")}`}
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

            {/* Info singkat booking */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-[var(--font-sans)]">
              <div>
                <p className="text-[var(--color-slate)]">Pasangan</p>
                <p className="font-medium text-[var(--color-dark)]">
                  {req.booking.customer.name}
                </p>
              </div>
              <div>
                <p className="text-[var(--color-slate)]">Tanggal</p>
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

            {/* Aksi untuk request pending */}
            {req.status === "pending" && (
              <div className="flex gap-3 mt-4 pt-4 border-t border-[var(--color-cream-border)]">
                <Button variant="gold" size="sm" onClick={() => setDetail(req)}>
                  ✅ Konfirmasi Kesanggupan
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setRejectModal(req)}
                >
                  ❌ Tolak Request
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

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
                <label className="text-sm font-medium text-[var(--color-dark-muted)] font-[var(--font-sans)] block mb-1">
                  Catatan Konfirmasi (opsional)
                </label>
                <textarea
                  rows={2}
                  value={vendorNotes}
                  onChange={(e) => setVendorNotes(e.target.value)}
                  placeholder="Catatan tambahan untuk admin..."
                  className="w-full border-b border-[var(--color-cream-border)] focus:border-[var(--color-gold)] bg-transparent text-sm font-[var(--font-sans)] outline-none py-1 resize-none"
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
            <Button variant="danger" size="sm" onClick={handleReject}>
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
              memilih vendor lain.
            </p>
            <div>
              <label className="text-sm font-medium text-[var(--color-dark-muted)] font-[var(--font-sans)] block mb-1">
                Alasan Penolakan <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Contoh: Tanggal sudah terisi, lokasi terlalu jauh, dll."
                className="w-full border-b-2 border-[var(--color-cream-border)] focus:border-red-400 bg-transparent text-sm font-[var(--font-sans)] outline-none py-2 resize-none transition-colors"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default VendorBookings;
