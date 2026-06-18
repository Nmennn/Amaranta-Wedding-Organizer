// src/pages/vendor/Bookings.jsx
// UTAMA:
//   Vendor tidak lagi melihat daftar booking langsung.
//   Vendor melihat vendor_requests yang dikirim admin ke mereka.
//   Aksi: confirm (setuju dengan detail meeting) atau reject (tolak dengan alasan).
//   Pembersihan Riwayat: vendor dapat menghapus request yang direspons satu persatu atau semuanya.
import { useState, useEffect } from "react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { formatRupiah } from "../../data/packages";
import { vendorRequestService } from "../../services";
import { toastSuccess, toastError } from "../../hooks/useToast";

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

function VendorBookings() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [vendorNotes, setVendorNotes] = useState("");
  const [acting, setActing] = useState(false);

  const loadRequests = () => {
    setLoading(true);
    vendorRequestService
      .getInbox()
      .then((data) => {
        setRequests(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        setError(err.userMessage || "Gagal memuat request vendor.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  async function handleConfirm(req) {
    setActing(true);
    try {
      await vendorRequestService.confirm(req.id, { vendor_notes: vendorNotes });
      toastSuccess("Berhasil mengonfirmasi kesanggupan booking ini.");
      setDetail(null);
      setVendorNotes("");
      loadRequests();
    } catch (err) {
      toastError(err.userMessage || "Gagal mengonfirmasi request.");
    } finally {
      setActing(false);
    }
  }

  async function handleReject() {
    if (!rejectReason.trim()) return;
    setActing(true);
    try {
      await vendorRequestService.reject(rejectModal.id, {
        rejection_reason: rejectReason,
      });
      toastSuccess("Berhasil menolak request booking ini.");
      setRejectModal(null);
      setRejectReason("");
      loadRequests();
    } catch (err) {
      toastError(err.userMessage || "Gagal menolak request.");
    } finally {
      setActing(false);
    }
  }

  async function handleDeleteRequest(req) {
    if (!window.confirm("Yakin ingin menghapus request ini dari riwayat?"))
      return;
    try {
      await vendorRequestService.delete(req.id);
      toastSuccess("Berhasil menghapus request dari riwayat.");
      loadRequests();
    } catch (err) {
      toastError(err.userMessage || "Gagal menghapus request.");
    }
  }

  async function handleDeleteAllRequests() {
    if (
      !window.confirm(
        "Yakin ingin membersihkan semua riwayat request yang telah direspons?",
      )
    )
      return;
    try {
      await vendorRequestService.deleteAll();
      toastSuccess("Semua riwayat request berhasil dibersihkan.");
      loadRequests();
    } catch (err) {
      toastError(err.userMessage || "Gagal membersihkan riwayat request.");
    }
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-start gap-4 flex-wrap">
        <div>
          <h1 className="font-[var(--font-display)] text-3xl text-[var(--color-dark)] mb-1">
            Request dari Admin
          </h1>
          <p className="text-sm text-[var(--color-slate)] font-[var(--font-sans)]">
            Admin AMARANTA akan mengirimkan request booking untuk Anda
            konfirmasi.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap mt-2">
          {requests.some((r) => r.status !== "pending") && (
            <button
              onClick={handleDeleteAllRequests}
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
              Bersihkan Riwayat
            </button>
          )}
          <button
            onClick={loadRequests}
            className="flex items-center gap-1.5 px-3 py-2 border border-[var(--color-cream-border)] text-xs text-[var(--color-dark-muted)] hover:border-[var(--color-gold)] font-[var(--font-sans)] transition-all"
          >
            Refresh
          </button>
        </div>
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

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-2 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="px-5 py-4 bg-red-50 border border-red-200 text-sm text-red-600 font-[var(--font-sans)]">
          ⚠️ {error}
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-20 bg-white border border-[var(--color-cream-border)] p-10">
          <p className="font-[var(--font-display)] text-2xl text-[var(--color-dark-subtle)] mb-2">
            Belum ada request
          </p>
          <p className="text-sm text-[var(--color-slate)] font-[var(--font-sans)]">
            Belum ada kiriman request booking dari admin saat ini.
          </p>
        </div>
      ) : (
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
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge variant={STATUS_V[req.status]} dot>
                      {STATUS_L[req.status]}
                    </Badge>
                    <span className="text-xs font-mono text-[var(--color-gold)] font-[var(--font-sans)]">
                      {req.booking?.order_id}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--color-slate)] font-[var(--font-sans)]">
                    Di-assign oleh: {req.assigned_by?.name || "Admin"}
                    {req.responded_at &&
                      ` · Direspons: ${new Date(req.responded_at).toLocaleDateString("id-ID")}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => {
                      setDetail(req);
                      setVendorNotes(req.vendor_notes || "");
                    }}
                  >
                    Lihat Detail
                  </Button>
                  {req.status !== "pending" && (
                    <button
                      onClick={() => handleDeleteRequest(req)}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded transition-colors"
                      title="Hapus dari riwayat"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Info singkat booking */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-[var(--font-sans)]">
                <div>
                  <p className="text-[var(--color-slate)]">Pasangan</p>
                  <p className="font-medium text-[var(--color-dark)]">
                    {req.booking?.pemesan_name || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[var(--color-slate)]">Tanggal</p>
                  <p className="font-medium text-[var(--color-dark)] font-mono">
                    {req.booking?.wedding_date || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[var(--color-slate)]">Lokasi</p>
                  <p
                    className="font-medium text-[var(--color-dark)] truncate"
                    title={req.booking?.location}
                  >
                    {req.booking?.location || "—"}
                  </p>
                </div>
              </div>

              {/* Jadwal Tech Meeting dari Admin */}
              {req.booking?.tech_meeting_at && (
                <div className="mt-3 p-3 bg-purple-50 border border-purple-100 text-xs rounded text-purple-800 font-[var(--font-sans)]">
                  <p className="font-semibold uppercase tracking-wider mb-1">
                    📅 Jadwal Technical Meeting (Koordinasi):
                  </p>
                  <p className="leading-relaxed">
                    <strong>Waktu:</strong>{" "}
                    {new Date(req.booking.tech_meeting_at).toLocaleString(
                      "id-ID",
                      { dateStyle: "long", timeStyle: "short" },
                    )}
                    <br />
                    <strong>Lokasi:</strong> {req.booking.tech_meeting_location}
                    <br />
                    {req.booking.tech_meeting_notes && (
                      <>
                        <strong>Catatan:</strong>{" "}
                        {req.booking.tech_meeting_notes}
                      </>
                    )}
                  </p>
                </div>
              )}

              {/* Status Event (Hari H) — Info untuk Vendor */}
              {req.booking?.admin_status === "in_event" && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 text-xs rounded text-green-800 font-[var(--font-sans)]">
                  <p className="font-semibold uppercase tracking-wider mb-1">
                    💒 Hari H — Acara Sedang Berlangsung
                  </p>
                  <p className="text-green-700">
                    Acara pernikahan sedang berlangsung pada tanggal{" "}
                    <strong>{req.booking.wedding_date}</strong>. Pastikan semua
                    vendor sudah siap.
                  </p>
                </div>
              )}

              {/* Status Event Selesai */}
              {req.booking?.admin_status === "completed" && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 text-xs rounded text-blue-800 font-[var(--font-sans)]">
                  <p className="font-semibold uppercase tracking-wider mb-1">
                    🎉 Acara Selesai
                  </p>
                  <p className="text-blue-700">
                    Acara pernikahan telah selesai. Terima kasih atas kontribusi
                    Anda dalam membuat acara ini sukses!
                  </p>
                </div>
              )}

              {/* Aksi untuk request pending */}
              {req.status === "pending" && (
                <div className="flex gap-3 mt-4 pt-4 border-t border-[var(--color-cream-border)]">
                  <Button
                    variant="gold"
                    size="sm"
                    onClick={() => {
                      setDetail(req);
                      setVendorNotes("");
                    }}
                  >
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
      )}

      {/* Modal detail + konfirmasi */}
      <Modal
        isOpen={!!detail}
        onClose={() => setDetail(null)}
        title={detail ? "Detail Request — " + detail.booking?.order_id : ""}
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
                disabled={acting}
              >
                Tolak
              </Button>
              <Button
                variant="gold"
                size="sm"
                onClick={() => handleConfirm(detail)}
                isLoading={acting}
              >
                Konfirmasi Kesanggupan
              </Button>
            </>
          ) : undefined
        }
      >
        {detail && (
          <div className="space-y-4 font-[var(--font-sans)]">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Pasangan", value: detail.booking?.pemesan_name },
                { label: "Tgl. Nikah", value: detail.booking?.wedding_date },
                { label: "Lokasi", value: detail.booking?.location },
                { label: "Konsep", value: detail.booking?.konsep },
                {
                  label: "Paket",
                  value:
                    "Paket " + detail.booking?.package?.tier_id?.toUpperCase(),
                },
                {
                  label: "Nilai Kontrak",
                  value: detail.booking
                    ? formatRupiah(detail.booking.total_price)
                    : "—",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="border border-[var(--color-cream-border)] p-3"
                >
                  <p className="text-[10px] uppercase tracking-widest text-[var(--color-slate)]">
                    {item.label}
                  </p>
                  <p className="text-sm font-semibold text-[var(--color-dark)]">
                    {item.value || "—"}
                  </p>
                </div>
              ))}
            </div>

            {detail.booking?.notes && (
              <div className="bg-[var(--color-cream)] p-3 border border-[var(--color-cream-border)]">
                <p className="text-[10px] uppercase tracking-widest text-[var(--color-slate)] mb-1">
                  Catatan dari Klien
                </p>
                <p className="text-sm text-[var(--color-dark-muted)] italic">
                  "{detail.booking.notes}"
                </p>
              </div>
            )}

            {detail.booking?.tech_meeting_at && (
              <div className="bg-purple-50 border border-purple-200 p-3 rounded text-purple-800">
                <p className="text-[10px] uppercase tracking-widest font-bold mb-1">
                  📅 Jadwal Technical Meeting (Koordinasi):
                </p>
                <p className="text-xs leading-relaxed">
                  <strong>Waktu:</strong>{" "}
                  {new Date(detail.booking.tech_meeting_at).toLocaleString(
                    "id-ID",
                    { dateStyle: "long", timeStyle: "short" },
                  )}
                  <br />
                  <strong>Lokasi:</strong>{" "}
                  {detail.booking.tech_meeting_location}
                  <br />
                  {detail.booking.tech_meeting_notes && (
                    <>
                      <strong>Catatan:</strong>{" "}
                      {detail.booking.tech_meeting_notes}
                    </>
                  )}
                </p>
              </div>
            )}

            {detail.status === "pending" ? (
              <div className="pt-2 border-t border-[var(--color-cream-border)]">
                <label className="text-sm font-semibold text-[var(--color-gold)] block mb-1">
                  Detail Pertemuan / Koordinasi (Meet Online / Offline)
                </label>
                <textarea
                  rows={3}
                  value={vendorNotes}
                  onChange={(e) => setVendorNotes(e.target.value)}
                  placeholder="Contoh: Meet offline di Kantor AMARANTA pada Sabtu jam 10:00, atau Online via Zoom..."
                  className="w-full border-b-2 border-[var(--color-cream-border)] focus:border-[var(--color-gold)] bg-transparent text-sm outline-none py-2 resize-none transition-colors"
                />
                <p className="text-[10px] text-[var(--color-slate)] mt-1">
                  Opsional — Catatan koordinasi ini akan ditampilkan langsung di
                  dashboard pemesanan klien.
                </p>
              </div>
            ) : (
              detail.vendor_notes && (
                <div className="bg-teal-50 border border-teal-200 p-3 rounded">
                  <p className="text-[10px] uppercase tracking-widest text-teal-800 font-bold mb-1">
                    💬 Detail Pertemuan / Koordinasi (Meet):
                  </p>
                  <p className="text-sm font-medium text-teal-900 leading-relaxed">
                    {detail.vendor_notes}
                  </p>
                </div>
              )
            )}

            {detail.status === "rejected" && detail.rejection_reason && (
              <div className="bg-red-50 border border-red-200 p-3 rounded text-red-700">
                <p className="text-[10px] uppercase tracking-widest font-bold mb-1">
                  Alasan Penolakan:
                </p>
                <p className="text-sm font-medium text-red-900">
                  {detail.rejection_reason}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal tolak */}
      <Modal
        isOpen={!!rejectModal}
        onClose={() => setRejectModal(null)}
        title="Tolk Request"
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRejectModal(null)}
              disabled={acting}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleReject}
              isLoading={acting}
            >
              Kirim Penolakan
            </Button>
          </>
        }
      >
        {rejectModal && (
          <div className="space-y-4 font-[var(--font-sans)]">
            <p className="text-sm text-[var(--color-dark-muted)]">
              Anda menolak request untuk{" "}
              <strong>{rejectModal.booking?.pemesan_name}</strong>. Admin akan
              memilih vendor lain.
            </p>
            <div>
              <label className="text-sm font-medium text-[var(--color-dark-muted)] block mb-1">
                Alasan Penolakan <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Contoh: Tanggal sudah terisi, lokasi terlalu jauh, dll."
                className="w-full border-b-2 border-[var(--color-cream-border)] focus:border-red-400 bg-transparent text-sm outline-none py-2 resize-none transition-colors"
                required
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default VendorBookings;
