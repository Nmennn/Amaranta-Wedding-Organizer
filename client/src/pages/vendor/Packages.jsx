// ============================================================
// src/pages/vendor/Packages.jsx
// CMS EDITOR untuk 3 paket AMARANTA:
//   - Edit gambar cover paket (URL atau upload nanti via API)
//   - Edit tagline & harga
//   - Edit daftar "Sudah Termasuk" (tambah/hapus/ubah item)
//   - Edit daftar "Tidak Termasuk"
//   - Toggle aktif/nonaktif paket
// ============================================================
import { useState } from "react";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import { PACKAGES, formatRupiah } from "../../data/packages";

// Deep clone agar bisa diedit tanpa mengubah data asli
const initPackages = PACKAGES.map((p) => ({
  ...p,
  includes: p.includes.map((inc) => ({ ...inc })),
  notIncluded: [...(p.notIncluded || [])],
}));

// Komponen satu row item layanan
function IncludeRow({ item, index, onChange, onDelete }) {
  return (
    <div className="flex items-start gap-2 group">
      <div className="flex-1 space-y-1">
        <input
          type="text"
          value={item.label}
          onChange={(e) => onChange(index, "label", e.target.value)}
          placeholder="Nama layanan (contoh: Katering 200 Porsi)"
          className="w-full text-sm border-b border-[var(--color-cream-border)] focus:border-[var(--color-gold)] bg-transparent outline-none py-1 font-[var(--font-sans)] text-[var(--color-dark)] transition-colors"
        />
        <input
          type="text"
          value={item.detail}
          onChange={(e) => onChange(index, "detail", e.target.value)}
          placeholder="Detail singkat (contoh: 5 lauk, 3 sayur, dessert)"
          className="w-full text-xs border-b border-[var(--color-cream-border)]/60 focus:border-[var(--color-gold)]/60 bg-transparent outline-none py-1 font-[var(--font-sans)] text-[var(--color-slate)] transition-colors"
        />
      </div>
      <button
        onClick={() => onDelete(index)}
        className="mt-1 p-1 text-[var(--color-slate)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
        title="Hapus item"
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
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}

function VendorPackages() {
  const [packages, setPackages] = useState(initPackages);
  const [activeId, setActiveId] = useState("silver"); // tab aktif
  const [saved, setSaved] = useState(null); // feedback '✓ Tersimpan'
  const [imgModal, setImgModal] = useState(null); // modal ganti gambar
  const [imgInput, setImgInput] = useState("");

  const pkg = packages.find((p) => p.id === activeId);

  // ── Helpers update ──────────────────────────────────────
  function updatePkg(id, key, value) {
    setPackages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [key]: value } : p)),
    );
  }

  function updateInclude(pkgId, index, key, value) {
    setPackages((prev) =>
      prev.map((p) => {
        if (p.id !== pkgId) return p;
        const includes = p.includes.map((inc, i) =>
          i === index ? { ...inc, [key]: value } : inc,
        );
        return { ...p, includes };
      }),
    );
  }

  function addInclude(pkgId) {
    setPackages((prev) =>
      prev.map((p) =>
        p.id === pkgId
          ? { ...p, includes: [...p.includes, { label: "", detail: "" }] }
          : p,
      ),
    );
  }

  function deleteInclude(pkgId, index) {
    setPackages((prev) =>
      prev.map((p) =>
        p.id === pkgId
          ? { ...p, includes: p.includes.filter((_, i) => i !== index) }
          : p,
      ),
    );
  }

  function addNotIncluded(pkgId) {
    setPackages((prev) =>
      prev.map((p) =>
        p.id === pkgId ? { ...p, notIncluded: [...p.notIncluded, ""] } : p,
      ),
    );
  }

  function updateNotIncluded(pkgId, index, value) {
    setPackages((prev) =>
      prev.map((p) => {
        if (p.id !== pkgId) return p;
        const ni = p.notIncluded.map((v, i) => (i === index ? value : v));
        return { ...p, notIncluded: ni };
      }),
    );
  }

  function deleteNotIncluded(pkgId, index) {
    setPackages((prev) =>
      prev.map((p) =>
        p.id !== pkgId
          ? p
          : { ...p, notIncluded: p.notIncluded.filter((_, i) => i !== index) },
      ),
    );
  }

  function handleSave() {
    // Nanti: PUT /api/vendors/my/packages/{tierId}
    setSaved(activeId);
    setTimeout(() => setSaved(null), 2500);
  }

  function handleSaveImage() {
    if (!imgInput.trim()) return;
    updatePkg(activeId, "img", imgInput.trim());
    setImgModal(null);
    setImgInput("");
  }

  // ── Render ──────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="font-[var(--font-display)] text-3xl text-[var(--color-dark)] mb-1">
            Kelola Paket
          </h1>
          <p className="text-sm text-[var(--color-slate)] font-[var(--font-sans)]">
            Edit isi layanan, harga, gambar, dan tagline setiap paket AMARANTA.
          </p>
        </div>
        <a
          href="/paket"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 border border-[var(--color-cream-border)] text-[var(--color-dark-muted)] text-xs uppercase tracking-widest font-[var(--font-sans)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all flex-shrink-0"
        >
          Preview Customer →
        </a>
      </div>

      {/* Tab pilih paket */}
      <div className="flex gap-0 mb-6 border-b border-[var(--color-cream-border)]">
        {packages.map((p) => (
          <button
            key={p.id}
            onClick={() => setActiveId(p.id)}
            className={[
              "flex items-center gap-2 px-6 py-3 text-sm font-[var(--font-sans)] transition-all border-b-2 -mb-px",
              activeId === p.id
                ? "border-b-2 font-medium text-[var(--color-dark)]"
                : "border-transparent text-[var(--color-slate)] hover:text-[var(--color-dark)]",
            ].join(" ")}
            style={{
              borderBottomColor: activeId === p.id ? p.color : undefined,
            }}
          >
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: p.color }}
            />
            Paket {p.tier}
            {!p.active && (
              <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 font-[var(--font-sans)]">
                OFF
              </span>
            )}
          </button>
        ))}
      </div>

      {pkg && (
        <div className="grid lg:grid-cols-5 gap-8">
          {/* ── Kolom kiri: gambar + info dasar ── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Gambar cover */}
            <div className="relative group bg-[var(--color-parchment)] overflow-hidden aspect-[4/3]">
              {pkg.img ? (
                <img
                  src={pkg.img}
                  alt={"Paket " + pkg.tier}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--color-slate)]">
                  <svg
                    className="w-10 h-10"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
              {/* Overlay tombol ganti gambar */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                <button
                  onClick={() => {
                    setImgModal(pkg.id);
                    setImgInput(pkg.img || "");
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity px-4 py-2 bg-white text-[var(--color-dark)] text-xs uppercase tracking-widest font-[var(--font-sans)] hover:bg-[var(--color-gold)] hover:text-white transition-colors"
                >
                  Ganti Foto
                </button>
              </div>
            </div>

            {/* Harga */}
            <div className="bg-white border border-[var(--color-cream-border)] p-4">
              <label className="text-[10px] uppercase tracking-widest text-[var(--color-slate)] font-[var(--font-sans)] block mb-2">
                Harga Paket (Rupiah)
              </label>
              <input
                type="number"
                value={pkg.price}
                onChange={(e) =>
                  updatePkg(pkg.id, "price", Number(e.target.value))
                }
                className="w-full text-2xl font-[var(--font-display)] text-[var(--color-dark)] border-b-2 border-[var(--color-cream-border)] focus:border-[var(--color-gold)] bg-transparent outline-none pb-1 transition-colors"
              />
              <p className="text-sm text-[var(--color-gold)] font-[var(--font-sans)] mt-1">
                = {formatRupiah(pkg.price)}
              </p>
            </div>

            {/* Tagline */}
            <div className="bg-white border border-[var(--color-cream-border)] p-4">
              <label className="text-[10px] uppercase tracking-widest text-[var(--color-slate)] font-[var(--font-sans)] block mb-2">
                Tagline
              </label>
              <input
                type="text"
                value={pkg.tagline}
                onChange={(e) => updatePkg(pkg.id, "tagline", e.target.value)}
                placeholder="Kalimat singkat yang menarik..."
                className="w-full text-sm text-[var(--color-dark)] font-[var(--font-sans)] border-b border-[var(--color-cream-border)] focus:border-[var(--color-gold)] bg-transparent outline-none py-1 transition-colors"
              />
            </div>

            {/* Info kapasitas */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-[var(--color-cream-border)] p-3">
                <label className="text-[10px] uppercase tracking-widest text-[var(--color-slate)] font-[var(--font-sans)] block mb-1">
                  Tamu
                </label>
                <input
                  type="text"
                  value={pkg.guests}
                  onChange={(e) => updatePkg(pkg.id, "guests", e.target.value)}
                  className="w-full text-sm text-[var(--color-dark)] font-[var(--font-sans)] border-b border-[var(--color-cream-border)] focus:border-[var(--color-gold)] bg-transparent outline-none py-1 transition-colors"
                />
              </div>
              <div className="bg-white border border-[var(--color-cream-border)] p-3">
                <label className="text-[10px] uppercase tracking-widest text-[var(--color-slate)] font-[var(--font-sans)] block mb-1">
                  Durasi
                </label>
                <input
                  type="text"
                  value={pkg.duration}
                  onChange={(e) =>
                    updatePkg(pkg.id, "duration", e.target.value)
                  }
                  className="w-full text-sm text-[var(--color-dark)] font-[var(--font-sans)] border-b border-[var(--color-cream-border)] focus:border-[var(--color-gold)] bg-transparent outline-none py-1 transition-colors"
                />
              </div>
            </div>

            {/* Aktif / Nonaktif */}
            <div className="flex items-center justify-between p-4 bg-white border border-[var(--color-cream-border)]">
              <div>
                <p className="text-sm font-medium text-[var(--color-dark)] font-[var(--font-sans)]">
                  Status Paket
                </p>
                <p className="text-xs text-[var(--color-slate)] font-[var(--font-sans)]">
                  {pkg.active
                    ? "Tampil di halaman customer"
                    : "Tersembunyi dari customer"}
                </p>
              </div>
              <button
                onClick={() => updatePkg(pkg.id, "active", !pkg.active)}
                className={[
                  "relative w-11 h-6 rounded-full transition-all flex-shrink-0",
                  pkg.active
                    ? "bg-[var(--color-gold)]"
                    : "bg-[var(--color-cream-border)]",
                ].join(" ")}
              >
                <span
                  className={[
                    "absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all",
                    pkg.active ? "left-6" : "left-1",
                  ].join(" ")}
                />
              </button>
            </div>

            {/* Popular badge */}
            <div className="flex items-center justify-between p-4 bg-white border border-[var(--color-cream-border)]">
              <div>
                <p className="text-sm font-medium text-[var(--color-dark)] font-[var(--font-sans)]">
                  Badge "Paling Populer"
                </p>
                <p className="text-xs text-[var(--color-slate)] font-[var(--font-sans)]">
                  Tampilkan badge menonjol di card
                </p>
              </div>
              <button
                onClick={() => updatePkg(pkg.id, "popular", !pkg.popular)}
                className={[
                  "relative w-11 h-6 rounded-full transition-all flex-shrink-0",
                  pkg.popular
                    ? "bg-[var(--color-gold)]"
                    : "bg-[var(--color-cream-border)]",
                ].join(" ")}
              >
                <span
                  className={[
                    "absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all",
                    pkg.popular ? "left-6" : "left-1",
                  ].join(" ")}
                />
              </button>
            </div>
          </div>

          {/* ── Kolom kanan: daftar isi layanan ── */}
          <div className="lg:col-span-3 space-y-6">
            {/* Sudah Termasuk */}
            <div className="bg-white border border-[var(--color-cream-border)] p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-[var(--font-display)] text-lg text-[var(--color-dark)]">
                    Sudah Termasuk
                  </h3>
                  <p className="text-xs text-[var(--color-slate)] font-[var(--font-sans)]">
                    {pkg.includes.length} item layanan
                  </p>
                </div>
                <button
                  onClick={() => addInclude(pkg.id)}
                  className="flex items-center gap-1.5 text-xs text-[var(--color-gold)] hover:underline font-[var(--font-sans)] transition-colors"
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Tambah item
                </button>
              </div>
              <div className="space-y-3">
                {pkg.includes.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span
                      className="w-4 h-4 flex-shrink-0 mt-1.5"
                      style={{ color: pkg.color }}
                    >
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                    <IncludeRow
                      item={item}
                      index={i}
                      onChange={(idx, key, val) =>
                        updateInclude(pkg.id, idx, key, val)
                      }
                      onDelete={(idx) => deleteInclude(pkg.id, idx)}
                    />
                  </div>
                ))}
                {pkg.includes.length === 0 && (
                  <p className="text-sm text-[var(--color-slate)] font-[var(--font-sans)] py-4 text-center">
                    Belum ada item. Klik "Tambah item" untuk mulai.
                  </p>
                )}
              </div>
            </div>

            {/* Tidak Termasuk */}
            <div className="bg-white border border-[var(--color-cream-border)] p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-[var(--font-display)] text-lg text-[var(--color-dark)]">
                    Tidak Termasuk
                  </h3>
                  <p className="text-xs text-[var(--color-slate)] font-[var(--font-sans)]">
                    Ditampilkan sebagai info transparan ke customer
                  </p>
                </div>
                <button
                  onClick={() => addNotIncluded(pkg.id)}
                  className="flex items-center gap-1.5 text-xs text-[var(--color-slate)] hover:text-[var(--color-dark)] font-[var(--font-sans)] transition-colors"
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Tambah
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {pkg.notIncluded.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[var(--color-cream)] border border-[var(--color-cream-border)] group"
                  >
                    <input
                      type="text"
                      value={item}
                      onChange={(e) =>
                        updateNotIncluded(pkg.id, i, e.target.value)
                      }
                      className="text-xs text-[var(--color-slate)] font-[var(--font-sans)] bg-transparent outline-none min-w-[60px] max-w-[140px]"
                    />
                    <button
                      onClick={() => deleteNotIncluded(pkg.id, i)}
                      className="text-[var(--color-slate)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <svg
                        className="w-3 h-3"
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
                    </button>
                  </div>
                ))}
                {pkg.notIncluded.length === 0 && (
                  <p className="text-sm text-[var(--color-slate)] font-[var(--font-sans)]">
                    Semua sudah termasuk!
                  </p>
                )}
              </div>
            </div>

            {/* Tombol simpan */}
            <div className="flex items-center gap-4">
              <Button variant="gold" size="lg" onClick={handleSave}>
                Simpan Perubahan Paket {pkg.tier}
              </Button>
              {saved === pkg.id && (
                <span className="text-sm text-emerald-600 font-[var(--font-sans)] flex items-center gap-1.5 animate-fade-in">
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Perubahan tersimpan
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal ganti gambar */}
      <Modal
        isOpen={!!imgModal}
        onClose={() => setImgModal(null)}
        title={
          "Ganti Foto Paket " +
          (packages.find((p) => p.id === imgModal)?.tier || "")
        }
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setImgModal(null)}>
              Batal
            </Button>
            <Button
              variant="gold"
              size="sm"
              onClick={handleSaveImage}
              disabled={!imgInput.trim()}
            >
              Simpan
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          {/* Preview */}
          {imgInput && (
            <div className="aspect-video overflow-hidden bg-[var(--color-parchment)]">
              <img
                src={imgInput}
                alt="preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
          )}
          <Input
            label="URL Foto"
            type="url"
            value={imgInput}
            onChange={(e) => setImgInput(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            hint="Gunakan URL dari Unsplash, Google Photos, atau hosting gambar Anda"
          />
          <div className="px-4 py-3 bg-[var(--color-cream)] border border-[var(--color-cream-border)]">
            <p className="text-xs text-[var(--color-slate)] font-[var(--font-sans)]">
              💡 <strong>Tips:</strong> Ukuran ideal 800×600px atau 4:3 ratio.
              Setelah backend aktif, Anda bisa upload file langsung dari
              komputer.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default VendorPackages;
