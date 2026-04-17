// src/pages/admin/Bookings.jsx
// PERUBAHAN UTAMA:
//   + Panel workflow WO: assign vendor, tech meeting, monitor persiapan
//   + Filter berdasarkan admin_status
//   + Indikator status per tahap alur
import { useState } from "react";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Pagination from "../../components/ui/Pagination";
import Input from "../../components/ui/Input";
import { formatRupiah } from "../../data/packages";

const ADMIN_STATUS_LABELS = {
  waiting_dp: "Menunggu DP",
  dp_failed: "DP Gagal",
  waiting_vendor: "Pilih Vendor",
  vendor_assigned: "Menunggu Vendor",
  vendor_confirmed: "Vendor Konfirm",
  vendor_rejected: "Vendor Tolak",
  tech_meeting_scheduled: "Tech Meeting",
  preparation: "Persiapan",
  in_event: "Hari H",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

const ADMIN_STATUS_COLOR = {
  waiting_dp: "bg-gray-100 text-gray-600",
  dp_failed: "bg-red-100 text-red-600",
  waiting_vendor: "bg-amber-100 text-amber-700",
  vendor_assigned: "bg-blue-100 text-blue-700",
  vendor_confirmed: "bg-teal-100 text-teal-700",
  vendor_rejected: "bg-red-100 text-red-600",
  tech_meeting_scheduled: "bg-purple-100 text-purple-700",
  preparation: "bg-indigo-100 text-indigo-700",
  in_event: "bg-green-100 text-green-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-gray-100 text-gray-500",
};

// Mock vendors untuk assign
const MOCK_VENDORS = [
  { id: 1, name: "Chateau de Lumiere", category: "Venue & Full Service" },
  { id: 2, name: "Petals & Porcelain", category: "Dekorasi & Florist" },
  { id: 3, name: "Julian Vesper Films", category: "Foto & Video" },
];

const MOCK_BOOKINGS = [
  {
    id: 1,
    order_id: "AMRT-10012345",
    customer: { name: "Rina & Budi" },
    vendor: { name: "Chateau de Lumiere" },
    package: { tier_id: "gold" },
    wedding_date: "2025-09-15",
    location: "Jakarta Selatan",
    konsep: "Garden Romantic",
    total_price: 45000000,
    dp_amount: 13500000,
    status: "confirmed",
    admin_status: "waiting_vendor",
    preparation_progress: 0,
    vendor_requests: [],
    tech_meeting_at: null,
  },
  {
    id: 2,
    order_id: "AMRT-10012346",
    customer: { name: "Sofia & Doni" },
    vendor: null,
    package: { tier_id: "platinum" },
    wedding_date: "2025-10-20",
    location: "Bandung",
    konsep: "Modern Minimalist",
    total_price: 85000000,
    dp_amount: 25500000,
    status: "pending",
    admin_status: "waiting_dp",
    preparation_progress: 0,
    vendor_requests: [],
    tech_meeting_at: null,
  },
  {
    id: 3,
    order_id: "AMRT-10012347",
    customer: { name: "Maya & Reza" },
    vendor: { name: "Petals & Porcelain" },
    package: { tier_id: "silver" },
    wedding_date: "2025-08-05",
    location: "Surabaya",
    konsep: "Rustic Outdoor",
    total_price: 25000000,
    dp_amount: 7500000,
    status: "confirmed",
    admin_status: "preparation",
    preparation_progress: 65,
    vendor_requests: [
      { id: 1, vendor: { name: "Petals & Porcelain" }, status: "confirmed" },
    ],
    tech_meeting_at: "2025-07-01T10:00:00",
  },
  {
    id: 4,
    order_id: "AMRT-10012348",
    customer: { name: "Clara & Anton" },
    vendor: null,
    package: { tier_id: "gold" },
    wedding_date: "2025-11-12",
    location: "Yogyakarta",
    konsep: "Javanese Traditional",
    total_price: 45000000,
    dp_amount: 13500000,
    status: "cancelled",
    admin_status: "dp_failed",
    preparation_progress: 0,
    vendor_requests: [],
    tech_meeting_at: null,
  },
];

function WorkflowPanel({ booking, onUpdate }) {
  const [assignModal, setAssignModal] = useState(false);
  const [techModal, setTechModal] = useState(false);
  const [prepModal, setPrepModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState("");
  const [adminNotes, setAdminNotes] = useState(booking.admin_notes || "");
  const [techForm, setTechForm] = useState({
    date: "",
    location: "",
    notes: "",
  });
  const [prepPct, setPrepPct] = useState(booking.preparation_progress || 0);

  const s = booking.admin_status;

  function handleAssign() {
    if (!selectedVendor) return;
    // nanti: adminService.assignVendor(booking.id, { vendor_id: selectedVendor })
    onUpdate(booking.id, {
      admin_status: "vendor_assigned",
      vendor: MOCK_VENDORS.find((v) => v.id === Number(selectedVendor)),
    });
    setAssignModal(false);
  }

  function handleTechMeeting() {
    if (!techForm.date || !techForm.location) return;
    // nanti: adminService.setTechMeeting(booking.id, techForm)
    onUpdate(booking.id, {
      admin_status: "tech_meeting_scheduled",
      tech_meeting_at: techForm.date,
    });
    setTechModal(false);
  }

  function handleUpdatePrep() {
    // nanti: adminService.updatePreparation(booking.id, prepPct)
    onUpdate(booking.id, { preparation_progress: prepPct });
    setPrepModal(false);
  }

  function handleExecute() {
    if (!window.confirm("Tandai acara sebagai sedang berjalan?")) return;
    // nanti: adminService.executeEvent(booking.id)
    onUpdate(booking.id, {
      admin_status: "in_event",
      preparation_progress: 100,
    });
  }

  return (
    <div className="mt-4 border-t border-[var(--color-cream-border)] pt-4 space-y-3">
      <p className="text-[10px] uppercase tracking-widest text-[var(--color-slate)] font-[var(--font-sans)]">
        Aksi Admin — Workflow WO
      </p>

      {/* Step indicator */}
      <div className="flex items-center gap-1 flex-wrap mb-2">
        {["DP", "Pilih Vendor", "Tech Meeting", "Persiapan", "Eksekusi"].map(
          (step, i) => {
            const steps = [
              "waiting_vendor",
              "vendor_assigned",
              "vendor_confirmed",
              "tech_meeting_scheduled",
              "preparation",
              "in_event",
            ];
            const currentIdx = steps.indexOf(s);
            const done = i <= currentIdx;
            return (
              <div key={step} className="flex items-center gap-1">
                <span
                  className={[
                    "text-[10px] px-2 py-0.5 rounded font-[var(--font-sans)]",
                    done
                      ? "bg-[var(--color-gold)] text-[var(--color-dark)]"
                      : "bg-[var(--color-cream-border)] text-[var(--color-slate)]",
                  ].join(" ")}
                >
                  {step}
                </span>
                {i < 4 && (
                  <span className="text-[var(--color-cream-border)]">›</span>
                )}
              </div>
            );
          },
        )}
      </div>

      {/* Aksi berdasarkan status */}
      <div className="flex flex-wrap gap-2">
        {/* Assign vendor — hanya saat waiting_vendor atau vendor_rejected */}
        {(s === "waiting_vendor" || s === "vendor_rejected") && (
          <Button size="xs" variant="gold" onClick={() => setAssignModal(true)}>
            {s === "vendor_rejected"
              ? "🔄 Pilih Vendor Lain"
              : "👤 Assign Vendor"}
          </Button>
        )}

        {/* Tech meeting — setelah vendor confirmed */}
        {s === "vendor_confirmed" && (
          <Button
            size="xs"
            variant="outline"
            onClick={() => setTechModal(true)}
          >
            📅 Jadwalkan Tech Meeting
          </Button>
        )}

        {/* Konfirmasi tech meeting */}
        {s === "tech_meeting_scheduled" && (
          <Button
            size="xs"
            variant="gold"
            onClick={() => {
              // nanti: adminService.confirmTech(booking.id)
              onUpdate(booking.id, { admin_status: "preparation" });
            }}
          >
            ✅ Konfirmasi Tech Meeting
          </Button>
        )}

        {/* Update progress */}
        {s === "preparation" && (
          <Button
            size="xs"
            variant="outline"
            onClick={() => setPrepModal(true)}
          >
            📊 Update Progress ({booking.preparation_progress}%)
          </Button>
        )}

        {/* Eksekusi acara — hanya jika full payment lunas */}
        {s === "preparation" && (
          <Button size="xs" variant="primary" onClick={handleExecute}>
            🚀 Eksekusi Acara
          </Button>
        )}
      </div>

      {/* Info pembayaran */}
      <div className="text-xs text-[var(--color-slate)] font-[var(--font-sans)] space-y-0.5">
        <p>
          DP: {formatRupiah(booking.dp_amount)} · Sisa:{" "}
          {formatRupiah(booking.total_price - booking.dp_amount)}
        </p>
        {booking.location && (
          <p>
            📍 {booking.location} · 🎨 {booking.konsep}
          </p>
        )}
      </div>

      {/* Modal Assign Vendor */}
      <Modal
        isOpen={assignModal}
        onClose={() => setAssignModal(false)}
        title="Pilih Vendor"
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAssignModal(false)}
            >
              Batal
            </Button>
            <Button variant="gold" size="sm" onClick={handleAssign}>
              Assign
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--color-slate)] font-[var(--font-sans)]">
            Pilih vendor yang akan menangani booking{" "}
            <strong>{booking.order_id}</strong>.
          </p>
          <select
            value={selectedVendor}
            onChange={(e) => setSelectedVendor(e.target.value)}
            className="w-full border border-[var(--color-cream-border)] px-3 py-2 text-sm font-[var(--font-sans)] outline-none focus:border-[var(--color-gold)]"
          >
            <option value="">-- Pilih vendor --</option>
            {MOCK_VENDORS.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.category})
              </option>
            ))}
          </select>
          <Input
            label="Catatan untuk Vendor (opsional)"
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
          />
        </div>
      </Modal>

      {/* Modal Tech Meeting */}
      <Modal
        isOpen={techModal}
        onClose={() => setTechModal(false)}
        title="Jadwalkan Tech Meeting"
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTechModal(false)}
            >
              Batal
            </Button>
            <Button variant="gold" size="sm" onClick={handleTechMeeting}>
              Simpan
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Tanggal & Waktu"
            type="datetime-local"
            value={techForm.date}
            onChange={(e) =>
              setTechForm((p) => ({ ...p, date: e.target.value }))
            }
            required
          />
          <Input
            label="Lokasi Meeting"
            value={techForm.location}
            onChange={(e) =>
              setTechForm((p) => ({ ...p, location: e.target.value }))
            }
            placeholder="contoh: Zoom Meeting / Kantor AMARANTA"
            required
          />
          <div>
            <label className="text-sm font-medium text-[var(--color-dark-muted)] font-[var(--font-sans)] block mb-1">
              Catatan
            </label>
            <textarea
              rows={3}
              value={techForm.notes}
              onChange={(e) =>
                setTechForm((p) => ({ ...p, notes: e.target.value }))
              }
              className="w-full border-b border-[var(--color-cream-border)] focus:border-[var(--color-gold)] bg-transparent text-sm font-[var(--font-sans)] outline-none py-1 resize-none"
            />
          </div>
        </div>
      </Modal>

      {/* Modal Progress Persiapan */}
      <Modal
        isOpen={prepModal}
        onClose={() => setPrepModal(false)}
        title="Update Progress Persiapan"
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPrepModal(false)}
            >
              Batal
            </Button>
            <Button variant="gold" size="sm" onClick={handleUpdatePrep}>
              Simpan
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-[var(--font-sans)] text-[var(--color-dark)]">
              Progress: {prepPct}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={prepPct}
            onChange={(e) => setPrepPct(Number(e.target.value))}
            className="w-full"
          />
          <div className="h-3 bg-[var(--color-cream-border)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--color-gold)] transition-all duration-300 rounded-full"
              style={{ width: prepPct + "%" }}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

function AdminBookings() {
  const [bookings, setBookings] = useState(MOCK_BOOKINGS);
  const [filter, setFilter] = useState("all");
  const [detail, setDetail] = useState(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 5;

  function handleUpdate(id, changes) {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...changes } : b)),
    );
    // Tutup detail modal jika ada perubahan
    if (detail?.id === id) setDetail((prev) => ({ ...prev, ...changes }));
  }

  const filtered = bookings.filter(
    (b) => filter === "all" || b.admin_status === filter,
  );
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const needActionCount = bookings.filter((b) =>
    ["waiting_vendor", "vendor_rejected", "vendor_confirmed"].includes(
      b.admin_status,
    ),
  ).length;

  const COLUMNS = [
    {
      key: "order_id",
      label: "Pesanan",
      render: (row) => (
        <div>
          <p className="text-xs font-mono text-[var(--color-gold)]">
            {row.order_id}
          </p>
          <p className="text-sm font-medium text-[var(--color-dark)] font-[var(--font-sans)]">
            {row.customer?.name}
          </p>
        </div>
      ),
    },
    {
      key: "detail",
      label: "Detail Acara",
      render: (row) => (
        <div className="text-xs font-[var(--font-sans)]">
          <p className="text-[var(--color-dark)]">{row.wedding_date}</p>
          <p className="text-[var(--color-slate)]">📍 {row.location}</p>
          <p className="text-[var(--color-slate)]">🎨 {row.konsep}</p>
        </div>
      ),
    },
    {
      key: "vendor",
      label: "Vendor",
      render: (row) => (
        <span className="text-xs font-[var(--font-sans)]">
          {row.vendor ? (
            row.vendor.name
          ) : (
            <span className="text-[var(--color-slate)] italic">
              Belum dipilih
            </span>
          )}
        </span>
      ),
    },
    {
      key: "admin_status",
      label: "Status Admin",
      render: (row) => (
        <span
          className={[
            "text-xs px-2 py-1 font-[var(--font-sans)] rounded",
            ADMIN_STATUS_COLOR[row.admin_status] || "bg-gray-100 text-gray-600",
          ].join(" ")}
        >
          {ADMIN_STATUS_LABELS[row.admin_status] || row.admin_status}
        </span>
      ),
    },
    {
      key: "prep",
      label: "Persiapan",
      render: (row) => (
        <div className="w-24">
          <div className="flex justify-between text-[10px] font-[var(--font-sans)] mb-1">
            <span className="text-[var(--color-slate)]">Progress</span>
            <span className="text-[var(--color-gold)]">
              {row.preparation_progress}%
            </span>
          </div>
          <div className="h-1.5 bg-[var(--color-cream-border)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--color-gold)] rounded-full transition-all"
              style={{ width: row.preparation_progress + "%" }}
            />
          </div>
        </div>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (row) => (
        <Button size="xs" variant="outline" onClick={() => setDetail(row)}>
          Detail
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-[var(--font-display)] text-3xl text-[var(--color-dark)] mb-1">
          Manajemen Booking
        </h1>
        <p className="text-sm text-[var(--color-slate)] font-[var(--font-sans)]">
          Kelola booking sebagai Wedding Organizer — assign vendor, tech
          meeting, persiapan.
        </p>
      </div>

      {/* Alert: butuh tindakan */}
      {needActionCount > 0 && (
        <div className="mb-6 px-5 py-4 bg-amber-50 border border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 bg-amber-200 rounded-full flex items-center justify-center text-amber-700 font-bold text-sm">
              {needActionCount}
            </span>
            <p className="text-sm text-amber-800 font-[var(--font-sans)] font-medium">
              Booking membutuhkan tindakan Anda (assign vendor / konfirmasi
              vendor)
            </p>
          </div>
          <button
            onClick={() => setFilter("waiting_vendor")}
            className="text-xs text-amber-700 hover:underline font-[var(--font-sans)]"
          >
            Lihat →
          </button>
        </div>
      )}

      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { val: "all", label: "Semua" },
          { val: "waiting_dp", label: "Menunggu DP" },
          { val: "waiting_vendor", label: "Perlu Vendor" },
          { val: "vendor_assigned", label: "Menunggu Vendor" },
          { val: "vendor_confirmed", label: "Vendor Konfirm" },
          { val: "preparation", label: "Persiapan" },
          { val: "in_event", label: "Hari H" },
        ].map((f) => (
          <button
            key={f.val}
            onClick={() => {
              setFilter(f.val);
              setPage(1);
            }}
            className={[
              "px-3 py-1.5 text-xs uppercase tracking-widest font-[var(--font-sans)] border transition-all",
              filter === f.val
                ? "bg-[var(--color-dark)] text-[var(--color-cream)] border-[var(--color-dark)]"
                : "border-[var(--color-cream-border)] text-[var(--color-dark-muted)] hover:border-[var(--color-dark)]",
            ].join(" ")}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-[var(--color-cream-border)] mb-6">
        <Table columns={COLUMNS} data={paginated} rowKey="id" />
      </div>
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {/* Modal detail + workflow */}
      <Modal
        isOpen={!!detail}
        onClose={() => setDetail(null)}
        title={detail ? detail.order_id + " — " + detail.customer?.name : ""}
        size="xl"
      >
        {detail && (
          <div className="space-y-4">
            {/* Info booking */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Tanggal", value: detail.wedding_date },
                { label: "Lokasi", value: detail.location },
                { label: "Konsep", value: detail.konsep },
                { label: "Paket", value: detail.package?.tier_id },
                { label: "Total", value: formatRupiah(detail.total_price) },
                { label: "DP", value: formatRupiah(detail.dp_amount) },
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

            {/* Riwayat vendor request */}
            {detail.vendor_requests?.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[var(--color-slate)] font-[var(--font-sans)] mb-2">
                  Riwayat Vendor
                </p>
                {detail.vendor_requests.map((vr, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 py-2 border-b border-[var(--color-cream-border)] last:border-0"
                  >
                    <span
                      className={[
                        "text-xs px-2 py-0.5 rounded font-[var(--font-sans)]",
                        vr.status === "confirmed"
                          ? "bg-green-100 text-green-700"
                          : vr.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700",
                      ].join(" ")}
                    >
                      {vr.status}
                    </span>
                    <span className="text-sm text-[var(--color-dark)] font-[var(--font-sans)]">
                      {vr.vendor?.name}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Panel workflow */}
            <WorkflowPanel
              booking={detail}
              onUpdate={(id, changes) => {
                handleUpdate(id, changes);
                setDetail((prev) => ({ ...prev, ...changes }));
              }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}

export default AdminBookings;
