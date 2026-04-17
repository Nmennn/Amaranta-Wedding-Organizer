// ============================================================
// src/pages/customer/Profile.jsx
// Halaman profil & pengaturan akun pelanggan
// ============================================================
import { useState } from "react";
import useAuthStore from "../../store/authStore";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

function Profile() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [tab, setTab] = useState("profil");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    username: user?.username || "",
  });

  const [pwForm, setPwForm] = useState({
    current: "",
    newPw: "",
    confirm: "",
  });
  const [pwError, setPwError] = useState("");
  const [pwSaved, setPwSaved] = useState(false);

  function handleChange(e) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setSaved(false);
  }

  function handleSaveProfile(e) {
    e.preventDefault();
    setLoading(true);
    // Simulasi save — nanti ganti dengan API call
    setTimeout(() => {
      setUser({ ...user, ...form });
      setLoading(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 700);
  }

  function handleChangePassword(e) {
    e.preventDefault();
    setPwError("");
    if (pwForm.newPw.length < 8) {
      setPwError("Password baru minimal 8 karakter");
      return;
    }
    if (pwForm.newPw !== pwForm.confirm) {
      setPwError("Konfirmasi password tidak cocok");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setPwSaved(true);
      setPwForm({ current: "", newPw: "", confirm: "" });
      setTimeout(() => setPwSaved(false), 3000);
    }, 700);
  }

  const TABS = [
    { id: "profil", label: "Data Diri" },
    { id: "password", label: "Ubah Password" },
    { id: "akun", label: "Info Akun" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-gold)] font-[var(--font-sans)] mb-2">
          Akun Saya
        </p>
        <h1 className="font-[var(--font-display)] text-4xl text-[var(--color-dark)] mb-1">
          Profil Saya
        </h1>
        <p className="text-sm text-[var(--color-slate)] font-[var(--font-sans)]">
          Kelola informasi pribadi dan keamanan akun Anda.
        </p>
      </div>

      {/* Avatar + info singkat */}
      <div className="flex items-center gap-5 mb-8 p-5 bg-white border border-[var(--color-cream-border)]">
        <div className="w-16 h-16 rounded-full bg-[var(--color-gold)] flex items-center justify-center flex-shrink-0">
          <span className="text-2xl font-bold text-[var(--color-dark)] font-[var(--font-display)]">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </span>
        </div>
        <div>
          <p className="font-[var(--font-display)] text-2xl text-[var(--color-dark)]">
            {user?.name}
          </p>
          <p className="text-sm text-[var(--color-slate)] font-[var(--font-sans)]">
            {user?.email}
          </p>
          <span className="inline-block mt-1 text-[9px] uppercase tracking-widest px-2 py-0.5 bg-[var(--color-gold-pale)] text-[var(--color-gold)] font-[var(--font-sans)]">
            Pelanggan
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 mb-6 border-b border-[var(--color-cream-border)]">
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

      {/* Tab: Data Diri */}
      {tab === "profil" && (
        <div className="max-w-lg">
          {saved && (
            <div className="mb-5 px-4 py-3 bg-emerald-50 border border-emerald-200 text-sm text-emerald-700 font-[var(--font-sans)]">
              ✓ Profil berhasil disimpan
            </div>
          )}
          <form onSubmit={handleSaveProfile} className="space-y-5">
            <Input
              label="Nama Lengkap"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
            <Input
              label="Email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              hint="Perubahan email membutuhkan verifikasi OTP"
            />
            <Input
              label="Nomor HP"
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="081234567890"
            />
            <Input
              label="Username"
              name="username"
              value={form.username}
              onChange={handleChange}
            />
            <Button type="submit" variant="gold" size="lg" isLoading={loading}>
              Simpan Perubahan
            </Button>
          </form>
        </div>
      )}

      {/* Tab: Ubah Password */}
      {tab === "password" && (
        <div className="max-w-lg">
          {pwSaved && (
            <div className="mb-5 px-4 py-3 bg-emerald-50 border border-emerald-200 text-sm text-emerald-700 font-[var(--font-sans)]">
              ✓ Password berhasil diubah
            </div>
          )}
          {pwError && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 text-sm text-red-600 font-[var(--font-sans)]">
              ⚠️ {pwError}
            </div>
          )}
          <form onSubmit={handleChangePassword} className="space-y-5">
            <Input
              label="Password Saat Ini"
              type="password"
              value={pwForm.current}
              onChange={(e) =>
                setPwForm((p) => ({ ...p, current: e.target.value }))
              }
              required
            />
            <Input
              label="Password Baru"
              type="password"
              value={pwForm.newPw}
              onChange={(e) => {
                setPwForm((p) => ({ ...p, newPw: e.target.value }));
                setPwError("");
              }}
              hint="Minimal 8 karakter"
              required
            />
            <Input
              label="Konfirmasi Password Baru"
              type="password"
              value={pwForm.confirm}
              onChange={(e) => {
                setPwForm((p) => ({ ...p, confirm: e.target.value }));
                setPwError("");
              }}
              required
            />
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
            >
              Ubah Password
            </Button>
          </form>
        </div>
      )}

      {/* Tab: Info Akun */}
      {tab === "akun" && (
        <div className="max-w-lg space-y-4">
          <div className="bg-white border border-[var(--color-cream-border)] p-5">
            <h3 className="font-[var(--font-display)] text-lg text-[var(--color-dark)] mb-4">
              Detail Akun
            </h3>
            <div className="space-y-3">
              {[
                {
                  label: "ID Pengguna",
                  value: "USR-" + String(user?.id || "").padStart(6, "0"),
                },
                { label: "Peran", value: "Pelanggan (Customer)" },
                { label: "Email", value: user?.email },
                { label: "Username", value: "@" + (user?.username || "-") },
                { label: "No. HP", value: user?.phone || "Belum diisi" },
                { label: "Status Akun", value: "Aktif & Terverifikasi" },
                { label: "Mode", value: "Demo (tanpa backend)" },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-center gap-4 py-2 border-b border-[var(--color-cream-border)] last:border-0"
                >
                  <span className="text-xs text-[var(--color-slate)] font-[var(--font-sans)] uppercase tracking-widest w-36 flex-shrink-0">
                    {label}
                  </span>
                  <span className="text-sm text-[var(--color-dark)] font-[var(--font-sans)]">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Zona bahaya */}
          <div className="bg-white border border-red-200 p-5">
            <h3 className="font-[var(--font-display)] text-lg text-red-600 mb-2">
              Zona Berbahaya
            </h3>
            <p className="text-sm text-[var(--color-slate)] font-[var(--font-sans)] mb-4">
              Tindakan berikut bersifat permanen dan tidak dapat dibatalkan.
            </p>
            <Button
              variant="danger"
              size="sm"
              onClick={() =>
                alert("Fitur hapus akun akan tersedia setelah koneksi backend.")
              }
            >
              Hapus Akun Saya
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
