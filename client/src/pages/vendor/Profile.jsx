// ============================================================
// src/pages/vendor/Profile.jsx
// Editor profil AMARANTA: cover foto, about, tim, galeri
// ============================================================
import { useState } from "react";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import { AMARANTA_INFO } from "../../data/packages";

const initProfile = {
  name: AMARANTA_INFO.name,
  tagline: AMARANTA_INFO.tagline,
  description: AMARANTA_INFO.description,
  location: AMARANTA_INFO.location,
  since: AMARANTA_INFO.since,
  phone: AMARANTA_INFO.phone,
  email: AMARANTA_INFO.email,
  instagram: AMARANTA_INFO.instagram,
  cover: AMARANTA_INFO.cover,
  gallery: [...AMARANTA_INFO.gallery],
  team: AMARANTA_INFO.team.map((m) => ({ ...m })),
};

function VendorProfile() {
  const [profile, setProfile] = useState(initProfile);
  const [tab, setTab] = useState("profil");
  const [saved, setSaved] = useState(false);
  const [imgModal, setImgModal] = useState(null); // 'cover' | 'gallery-N'
  const [imgInput, setImgInput] = useState("");
  const [teamModal, setTeamModal] = useState(null); // index anggota | 'new'
  const [teamForm, setTeamForm] = useState({ name: "", role: "", img: "" });

  function updateProfile(key, val) {
    setProfile((p) => ({ ...p, [key]: val }));
    setSaved(false);
  }

  function handleSave() {
    // Nanti: PUT /api/vendors/my
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  // Gambar
  function openImgModal(type) {
    setImgModal(type);
    if (type === "cover") setImgInput(profile.cover);
    else setImgInput("");
  }

  function handleSaveImg() {
    if (!imgInput.trim()) return;
    if (imgModal === "cover") {
      updateProfile("cover", imgInput.trim());
    } else {
      // Tambah ke galeri
      updateProfile("gallery", [...profile.gallery, imgInput.trim()]);
    }
    setImgModal(null);
    setImgInput("");
  }

  function removeGalleryImg(idx) {
    updateProfile(
      "gallery",
      profile.gallery.filter((_, i) => i !== idx),
    );
  }

  // Tim
  function openTeamModal(idx) {
    if (idx === "new") {
      setTeamForm({ name: "", role: "", img: "" });
    } else {
      setTeamForm({ ...profile.team[idx] });
    }
    setTeamModal(idx);
  }

  function handleSaveTeam() {
    if (!teamForm.name.trim()) return;
    if (teamModal === "new") {
      updateProfile("team", [...profile.team, { ...teamForm }]);
    } else {
      updateProfile(
        "team",
        profile.team.map((m, i) => (i === teamModal ? { ...teamForm } : m)),
      );
    }
    setTeamModal(null);
  }

  function removeTeamMember(idx) {
    updateProfile(
      "team",
      profile.team.filter((_, i) => i !== idx),
    );
  }

  const TABS = [
    { id: "profil", label: "Informasi Utama" },
    { id: "galeri", label: "Galeri Foto" },
    { id: "tim", label: "Anggota Tim" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="font-[var(--font-display)] text-3xl text-[var(--color-dark)] mb-1">
            Profil & Galeri
          </h1>
          <p className="text-sm text-[var(--color-slate)] font-[var(--font-sans)]">
            Edit informasi AMARANTA yang tampil di halaman Tentang dan Beranda.
          </p>
        </div>
        <a
          href="/tentang"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 border border-[var(--color-cream-border)] text-[var(--color-dark-muted)] text-xs uppercase tracking-widest font-[var(--font-sans)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all flex-shrink-0"
        >
          Preview Halaman →
        </a>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 mb-8 border-b border-[var(--color-cream-border)]">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={[
              "px-5 py-3 text-xs uppercase tracking-widest font-[var(--font-sans)] transition-all border-b-2 -mb-px",
              tab === t.id
                ? "border-[var(--color-gold)] text-[var(--color-dark)] font-medium"
                : "border-transparent text-[var(--color-slate)] hover:text-[var(--color-dark)]",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB: Informasi Utama ── */}
      {tab === "profil" && (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Foto Cover */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[var(--color-slate)] font-[var(--font-sans)] mb-3">
              Foto Cover Utama
            </p>
            <div className="relative group aspect-video bg-[var(--color-parchment)] overflow-hidden mb-3">
              <img
                src={profile.cover}
                alt="cover"
                className="w-full h-full object-cover"
                onError={(e) => (e.target.style.opacity = "0.3")}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                <button
                  onClick={() => openImgModal("cover")}
                  className="opacity-0 group-hover:opacity-100 transition-opacity px-4 py-2 bg-white text-[var(--color-dark)] text-xs uppercase tracking-widest font-[var(--font-sans)] hover:bg-[var(--color-gold)] hover:text-white transition-colors"
                >
                  Ganti Foto Cover
                </button>
              </div>
            </div>
          </div>

          {/* Form info */}
          <div className="space-y-4">
            <Input
              label="Nama Perusahaan"
              value={profile.name}
              onChange={(e) => updateProfile("name", e.target.value)}
            />
            <Input
              label="Tagline"
              value={profile.tagline}
              onChange={(e) => updateProfile("tagline", e.target.value)}
              hint="Kalimat pembuka di hero section"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Kota / Lokasi"
                value={profile.location}
                onChange={(e) => updateProfile("location", e.target.value)}
              />
              <Input
                label="Tahun Berdiri"
                type="number"
                value={profile.since}
                onChange={(e) => updateProfile("since", e.target.value)}
              />
            </div>
            <Input
              label="No. HP / WhatsApp"
              value={profile.phone}
              onChange={(e) => updateProfile("phone", e.target.value)}
            />
            <Input
              label="Email"
              type="email"
              value={profile.email}
              onChange={(e) => updateProfile("email", e.target.value)}
            />
            <Input
              label="Instagram"
              value={profile.instagram}
              onChange={(e) => updateProfile("instagram", e.target.value)}
              placeholder="@amaranta.id"
            />
          </div>

          {/* Deskripsi */}
          <div className="lg:col-span-2">
            <label className="text-[10px] uppercase tracking-widest text-[var(--color-slate)] font-[var(--font-sans)] block mb-2">
              Deskripsi Tentang AMARANTA
            </label>
            <textarea
              rows={5}
              value={profile.description}
              onChange={(e) => updateProfile("description", e.target.value)}
              className="w-full border-b-2 border-[var(--color-cream-border)] focus:border-[var(--color-gold)] bg-white text-sm font-[var(--font-sans)] text-[var(--color-dark)] p-3 outline-none resize-none transition-colors leading-relaxed"
            />
          </div>

          {/* Simpan */}
          <div className="lg:col-span-2 flex items-center gap-4">
            <Button variant="gold" size="lg" onClick={handleSave}>
              Simpan Perubahan
            </Button>
            {saved && (
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
      )}

      {/* ── TAB: Galeri ── */}
      {tab === "galeri" && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-[var(--color-slate)] font-[var(--font-sans)]">
              {profile.gallery.length} foto · Tampil di halaman Galeri dan
              Beranda
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openImgModal("gallery")}
            >
              + Tambah Foto
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {profile.gallery.map((url, i) => (
              <div
                key={i}
                className="group relative aspect-square overflow-hidden bg-[var(--color-parchment)]"
              >
                <img
                  src={url}
                  alt={"foto " + (i + 1)}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center gap-2">
                  <button
                    onClick={() => removeGalleryImg(i)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-red-500 text-white rounded-sm hover:bg-red-600"
                    title="Hapus foto"
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
                </div>
                <div className="absolute top-1.5 left-1.5 w-5 h-5 bg-black/50 text-white text-[10px] flex items-center justify-center font-[var(--font-sans)]">
                  {i + 1}
                </div>
              </div>
            ))}

            {/* Tombol tambah */}
            <button
              onClick={() => openImgModal("gallery")}
              className="aspect-square border-2 border-dashed border-[var(--color-cream-border)] hover:border-[var(--color-gold)] flex flex-col items-center justify-center gap-2 text-[var(--color-slate)] hover:text-[var(--color-gold)] transition-all group"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="text-xs font-[var(--font-sans)]">
                Tambah Foto
              </span>
            </button>
          </div>

          <div className="mt-6 flex justify-end">
            <Button variant="gold" size="lg" onClick={handleSave}>
              Simpan Urutan & Galeri
            </Button>
          </div>
        </div>
      )}

      {/* ── TAB: Tim ── */}
      {tab === "tim" && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-[var(--color-slate)] font-[var(--font-sans)]">
              {profile.team.length} anggota · Tampil di halaman Tentang
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openTeamModal("new")}
            >
              + Tambah Anggota
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.team.map((member, i) => (
              <div
                key={i}
                className="group bg-white border border-[var(--color-cream-border)] p-4 flex items-center gap-4 hover:border-[var(--color-gold)]/50 transition-all"
              >
                <div className="relative w-14 h-14 flex-shrink-0">
                  <img
                    src={member.img}
                    alt={member.name}
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                  {!member.img && (
                    <div className="w-14 h-14 rounded-full bg-[var(--color-gold-pale)] flex items-center justify-center">
                      <span className="text-xl font-[var(--font-display)] text-[var(--color-gold)]">
                        {member.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-dark)] font-[var(--font-sans)] truncate">
                    {member.name}
                  </p>
                  <p className="text-xs text-[var(--color-gold)] font-[var(--font-sans)] truncate">
                    {member.role}
                  </p>
                </div>
                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openTeamModal(i)}
                    className="p-1.5 text-[var(--color-slate)] hover:text-[var(--color-dark)] transition-colors"
                    title="Edit"
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => removeTeamMember(i)}
                    className="p-1.5 text-[var(--color-slate)] hover:text-red-500 transition-colors"
                    title="Hapus"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <Button variant="gold" size="lg" onClick={handleSave}>
              Simpan Tim
            </Button>
          </div>
        </div>
      )}

      {/* Modal gambar */}
      <Modal
        isOpen={
          imgModal !== null && imgModal !== null && typeof imgModal === "string"
        }
        onClose={() => setImgModal(null)}
        title={imgModal === "cover" ? "Ganti Foto Cover" : "Tambah Foto Galeri"}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setImgModal(null)}>
              Batal
            </Button>
            <Button
              variant="gold"
              size="sm"
              onClick={handleSaveImg}
              disabled={!imgInput.trim()}
            >
              Simpan
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {imgInput && (
            <div className="aspect-video overflow-hidden bg-[var(--color-parchment)]">
              <img
                src={imgInput}
                alt="preview"
                className="w-full h-full object-cover"
                onError={(e) => (e.target.style.opacity = "0.3")}
              />
            </div>
          )}
          <Input
            label="URL Foto"
            type="url"
            value={imgInput}
            onChange={(e) => setImgInput(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            hint="URL dari Unsplash, Google Photos, atau storage Anda"
          />
        </div>
      </Modal>

      {/* Modal edit/tambah anggota tim */}
      <Modal
        isOpen={teamModal !== null}
        onClose={() => setTeamModal(null)}
        title={teamModal === "new" ? "Tambah Anggota Tim" : "Edit Anggota Tim"}
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTeamModal(null)}
            >
              Batal
            </Button>
            <Button
              variant="gold"
              size="sm"
              onClick={handleSaveTeam}
              disabled={!teamForm.name.trim()}
            >
              Simpan
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Preview avatar */}
          {teamForm.img && (
            <div className="flex justify-center">
              <img
                src={teamForm.img}
                alt="preview"
                className="w-20 h-20 rounded-full object-cover border-2 border-[var(--color-gold-pale)]"
                onError={(e) => (e.target.style.opacity = "0.3")}
              />
            </div>
          )}
          <Input
            label="Nama"
            value={teamForm.name}
            onChange={(e) =>
              setTeamForm((p) => ({ ...p, name: e.target.value }))
            }
            required
          />
          <Input
            label="Jabatan / Role"
            value={teamForm.role}
            onChange={(e) =>
              setTeamForm((p) => ({ ...p, role: e.target.value }))
            }
            placeholder="contoh: Lead Wedding Coordinator"
          />
          <Input
            label="URL Foto"
            type="url"
            value={teamForm.img}
            onChange={(e) =>
              setTeamForm((p) => ({ ...p, img: e.target.value }))
            }
            placeholder="https://..."
          />
        </div>
      </Modal>
    </div>
  );
}

export default VendorProfile;