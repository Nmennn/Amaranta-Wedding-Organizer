// ============================================================
// src/layouts/CustomerLayout.jsx
// Layout area customer — sidebar kiri + konten kanan
// Berbeda dari admin/vendor: customer pakai layout publik
// dengan area privat di sisi kiri
// ============================================================
import { NavLink, Outlet, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import useAuthStore from "../store/authStore";

const NAV_ITEMS = [
  {
    to: "/pelanggan/pemesanan",
    label: "Pemesanan Saya",
    desc: "Status & riwayat booking",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
    ),
  },
  {
    to: "/pelanggan/profil",
    label: "Profil Saya",
    desc: "Data diri & password",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
  },
];

const CustomerLayout = () => {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6 lg:gap-8">
          {/* ── Sidebar kiri ── */}
          <aside className="w-56 flex-shrink-0 hidden md:block">
            {/* Kartu identitas customer */}
            <div className="bg-white border border-[var(--color-cream-border)] p-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-gold)] flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-[var(--color-dark)] font-[var(--font-display)]">
                    {user?.name?.charAt(0)?.toUpperCase() || "C"}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--color-dark)] font-[var(--font-sans)] truncate">
                    {user?.name}
                  </p>
                  <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 bg-[var(--color-gold-pale)] text-[var(--color-gold)] font-[var(--font-sans)]">
                    Customer
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-[var(--color-slate)] font-[var(--font-sans)] truncate">
                {user?.email}
              </p>
            </div>

            {/* Nav links */}
            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-3 px-3 py-3 transition-all group",
                      isActive
                        ? "bg-[var(--color-dark)] text-[var(--color-cream)]"
                        : "bg-white border border-[var(--color-cream-border)] text-[var(--color-dark-muted)] hover:border-[var(--color-gold)]/50 hover:text-[var(--color-dark)]",
                    ].join(" ")
                  }
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  <div>
                    <p className="text-xs font-medium font-[var(--font-sans)] leading-tight">
                      {item.label}
                    </p>
                    <p
                      className={[
                        "text-[10px] font-[var(--font-sans)] leading-tight mt-0.5",
                        "opacity-60",
                      ].join(" ")}
                    >
                      {item.desc}
                    </p>
                  </div>
                </NavLink>
              ))}
            </nav>

            {/* Shortcut: Pilih Paket */}
            <div className="mt-4 p-3 bg-[var(--color-gold-pale)] border border-[var(--color-gold)]/30">
              <p className="text-xs font-medium text-[var(--color-dark)] font-[var(--font-sans)] mb-1">
                Pesan Pernikahan
              </p>
              <p className="text-[10px] text-[var(--color-dark-muted)] font-[var(--font-sans)] mb-2 leading-relaxed">
                Pilih paket Silver, Gold, atau Platinum
              </p>
              <Link
                to="/paket"
                className="block text-center py-1.5 bg-[var(--color-gold)] text-[var(--color-dark)] text-[10px] uppercase tracking-widest font-[var(--font-sans)] hover:bg-[var(--color-gold-light)] transition-colors"
              >
                Pilih Paket →
              </Link>
            </div>
          </aside>

          {/* ── Konten utama ── */}
          <main className="flex-1 min-w-0">
            {/* Mobile nav tabs */}
            <div className="flex gap-2 mb-6 md:hidden">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      "flex-1 flex items-center justify-center gap-2 py-2.5 text-xs uppercase tracking-widest font-[var(--font-sans)] border transition-all",
                      isActive
                        ? "bg-[var(--color-dark)] text-[var(--color-cream)] border-[var(--color-dark)]"
                        : "bg-white border-[var(--color-cream-border)] text-[var(--color-dark-muted)]",
                    ].join(" ")
                  }
                >
                  <span className="[&>svg]:w-4 [&>svg]:h-4">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>

            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default CustomerLayout;
