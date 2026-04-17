// ============================================================
// src/layouts/VendorLayout.jsx
// Layout untuk halaman-halaman vendor.
// ============================================================

import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

// Vendor hanya butuh 1 halaman — semua konfirmasi ada di Dashboard
const NAV_ITEMS = [
  {
    to: "/vendor-panel/dashboard",
    label: "Dasbor",
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
];

const VendorLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-[var(--color-cream)] overflow-hidden">
      {/* Sidebar */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 w-64 flex flex-col",
          "bg-[var(--color-ivory)] border-r border-[var(--color-cream-border)]",
          "transform transition-transform duration-300",
          "lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="h-16 flex items-center px-6 border-b border-[var(--color-cream-border)]">
          <span className="font-[var(--font-display)] text-xl text-[var(--color-dark)] tracking-widest">
            AMARANTA
          </span>
          <span className="ml-2 text-xs text-[var(--color-gold)] uppercase tracking-widest font-[var(--font-sans)]">
            Vendor
          </span>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 px-4 py-3 text-sm font-[var(--font-sans)] transition-all duration-150",
                  isActive
                    ? "bg-[var(--color-gold-pale)] text-[var(--color-dark)] font-medium border-r-2 border-[var(--color-gold)]"
                    : "text-[var(--color-dark-muted)] hover:bg-[var(--color-cream)] hover:text-[var(--color-dark)]",
                ].join(" ")
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-[var(--color-cream-border)]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-[var(--color-gold-pale)] flex items-center justify-center">
              <span className="text-xs font-bold text-[var(--color-gold)]">
                {user?.name?.[0]?.toUpperCase() ?? "V"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[var(--color-dark)] truncate font-[var(--font-sans)]">
                {user?.name}
              </p>
              <p className="text-xs text-[var(--color-slate)] truncate font-[var(--font-sans)]">
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="text-xs text-[var(--color-slate)] hover:text-[var(--color-dark)] font-[var(--font-sans)] transition-colors"
          >
            Logout →
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-[var(--color-cream-border)] flex items-center px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden mr-4 text-[var(--color-dark-muted)]"
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
            Portal Vendor
          </span>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default VendorLayout;
