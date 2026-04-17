// ============================================================
// src/layouts/AdminLayout.jsx
// Layout wrapper untuk semua halaman admin.
// Berisi: sidebar navigasi + header + main content area.
// Outlet dari React Router akan dirender di area konten utama.
// ============================================================

import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

// ── Nav items untuk sidebar admin ────────────────────────────
const NAV_ITEMS = [
  {
    to: "/admin/dashboard",
    label: "Dashboard",
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
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    to: "/admin/vendors",
    label: "Vendors",
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
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
  },
  {
    to: "/admin/users",
    label: "Users",
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
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
  {
    to: "/admin/bookings",
    label: "Bookings",
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
];

const AdminLayout = () => {
  // sidebarOpen: state untuk toggle sidebar di mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    // flex h-screen: layout 2 kolom penuh layar
    <div className="flex h-screen bg-[var(--color-cream)] overflow-hidden">
      {/* ── SIDEBAR ─────────────────────────────────────────── */}
      {/* fixed di mobile, static di desktop */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 w-64 bg-[var(--color-dark)] flex flex-col",
          "transform transition-transform duration-300 ease-in-out",
          "lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <span className="font-[var(--font-display)] text-xl text-[var(--color-cream)] tracking-widest">
            amaranta
          </span>
          <span className="ml-2 text-xs text-[var(--color-gold)] uppercase tracking-widest font-[var(--font-sans)]">
            Admin
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            // NavLink: seperti Link tapi otomatis tambahkan class 'active'
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 px-4 py-3 text-sm font-[var(--font-sans)]",
                  "transition-all duration-150 group",
                  isActive
                    ? // isActive: true jika URL sekarang cocok dengan `to`
                      "bg-[var(--color-gold)] text-[var(--color-dark)] font-medium"
                    : "text-white/60 hover:text-white hover:bg-white/5",
                ].join(" ")
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[var(--color-gold)] flex items-center justify-center">
              <span className="text-xs font-bold text-[var(--color-dark)]">
                {user?.name?.[0]?.toUpperCase() ?? "A"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate font-[var(--font-sans)]">
                {user?.name}
              </p>
              <p className="text-xs text-white/40 truncate font-[var(--font-sans)]">
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left text-xs text-white/40 hover:text-white/80 font-[var(--font-sans)] transition-colors px-1"
          >
            Logout →
          </button>
        </div>
      </aside>

      {/* Backdrop sidebar mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── MAIN AREA ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-[var(--color-cream-border)] flex items-center px-6 gap-4 flex-shrink-0">
          {/* Hamburger button (mobile) */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-[var(--color-dark-muted)]"
            aria-label="Buka menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <div className="flex-1" />
          <span className="text-xs text-[var(--color-slate)] font-[var(--font-sans)]">
            Admin Panel
          </span>
        </header>

        {/* Content: Outlet merender halaman anak (child route) */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
