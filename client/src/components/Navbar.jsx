// ============================================================
// src/components/Navbar.jsx
// FIX:
//   1. Username klik → /pelanggan/profil (bukan getDashboardLink)
//   2. Sudah login: tampilkan dropdown user (nama+peran+profil+logout)
//   3. Responsivitas mobile diperbaiki
//   4. Cart badge benar dari store
// ============================================================
import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import useCartStore from "../store/cartStore";

function Navbar({ transparent, theme }) {
  transparent = transparent !== undefined ? transparent : false;
  theme = theme || "light";

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false); // dropdown user
  const userRef = useRef(null);

  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);
  const items = useCartStore((s) => s.items);
  const navigate = useNavigate();

  const isLoggedIn = !!(token && user);
  const cartCount = items.length;

  // Scroll
  useEffect(() => {
    if (!transparent) return;
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, [transparent]);

  // Tutup dropdown user saat klik di luar
  useEffect(() => {
    const fn = (e) => {
      if (userRef.current && !userRef.current.contains(e.target))
        setUserOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const isDark = transparent && !scrolled && theme === "dark";

  function getDashboardLink() {
    if (!user) return "/masuk";
    if (user.role === "admin") return "/admin/dashboard";
    if (user.role === "vendor") return "/vendor-panel/dashboard";
    return "/pelanggan/pemesanan";
  }

  function getProfileLink() {
    if (!user) return "/masuk";
    if (user.role === "admin" || user.role === "vendor")
      return getDashboardLink();
    return "/pelanggan/profil";
  }

  function handleLogout() {
    logout();
    setUserOpen(false);
    setMenuOpen(false);
    navigate("/");
  }

  const ROLE_LABEL = {
    admin: "Administrator",
    vendor: "Vendor",
    customer: "Pelanggan",
  };

  const NAV_LINKS = [
    { label: "Beranda", to: "/" },
    { label: "Paket", to: "/paket" },
    { label: "Galeri", to: "/galeri" },
    { label: "Tentang", to: "/tentang" },
  ];

  const textBase = isDark ? "text-white/80" : "text-[var(--color-dark-muted)]";
  const textHover = isDark
    ? "hover:text-white"
    : "hover:text-[var(--color-dark)]";
  const textActive = "text-[var(--color-gold)]";

  return (
    <>
      <header
        className={[
          "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
          transparent && !scrolled
            ? "bg-transparent"
            : "bg-white/97 backdrop-blur-md shadow-[var(--shadow-card)]",
        ].join(" ")}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between gap-4">
          {/* ── Logo ────────────────────────────────────── */}
          <Link
            to="/"
            className={[
              "font-[var(--font-display)] text-xl tracking-[0.2em] transition-colors flex-shrink-0",
              isDark ? "text-white" : "text-[var(--color-dark)]",
            ].join(" ")}
          >
            AMARANTA
          </Link>

          {/* ── Nav tengah (desktop) ─────────────────── */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 flex-1 justify-center">
            {NAV_LINKS.map(({ label, to }) => (
              <NavLink
                key={label}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  [
                    "text-xs uppercase tracking-widest font-[var(--font-sans)] transition-colors relative group whitespace-nowrap",
                    isActive ? textActive : `${textBase} ${textHover}`,
                  ].join(" ")
                }
              >
                {label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-[var(--color-gold)] transition-all duration-300 group-hover:w-full" />
              </NavLink>
            ))}
          </nav>

          {/* ── Kanan: Cart + Auth ───────────────────── */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Cart icon */}
            <Link
              to="/keranjang"
              aria-label="Keranjang"
              className={[
                "relative flex items-center justify-center w-9 h-9 transition-colors",
                isDark
                  ? "text-white/80 hover:text-[var(--color-gold)]"
                  : "text-[var(--color-dark-muted)] hover:text-[var(--color-gold)]",
              ].join(" ")}
            >
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
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[var(--color-gold)] rounded-full flex items-center justify-center text-[9px] font-bold text-[var(--color-dark)] font-[var(--font-sans)]">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>

            {/* Auth */}
            {isLoggedIn ? (
              /* ── User dropdown ─────────────────────── */
              <div className="hidden md:block relative" ref={userRef}>
                <button
                  onClick={() => setUserOpen((v) => !v)}
                  className={[
                    "flex items-center gap-2 px-3 py-1.5 transition-all rounded-sm",
                    isDark
                      ? "text-white/80 hover:text-white hover:bg-white/10"
                      : "text-[var(--color-dark-muted)] hover:text-[var(--color-dark)] hover:bg-[var(--color-parchment)]",
                  ].join(" ")}
                >
                  {/* Avatar inisial */}
                  <div className="w-7 h-7 rounded-full bg-[var(--color-gold)] flex items-center justify-center flex-shrink-0">
                    <span className="text-[11px] font-bold text-[var(--color-dark)] font-[var(--font-sans)]">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs font-[var(--font-sans)] max-w-[80px] truncate">
                    {user.name.split(" ")[0]}
                  </span>
                  <svg
                    className={[
                      "w-3 h-3 transition-transform",
                      userOpen ? "rotate-180" : "",
                    ].join(" ")}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown panel */}
                {userOpen && (
                  <div className="absolute right-0 top-full mt-1 w-52 bg-white shadow-[var(--shadow-luxury)] border border-[var(--color-cream-border)] z-50">
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-[var(--color-cream-border)]">
                      <p className="text-sm font-medium text-[var(--color-dark)] font-[var(--font-sans)] truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-[var(--color-slate)] font-[var(--font-sans)] truncate">
                        {user.email}
                      </p>
                      <span className="inline-block mt-1 text-[9px] uppercase tracking-widest px-2 py-0.5 bg-[var(--color-gold-pale)] text-[var(--color-gold)] font-[var(--font-sans)]">
                        {ROLE_LABEL[user.role] || user.role}
                      </span>
                    </div>
                    {/* Menu items */}
                    <div className="py-1">
                      {user.role === "customer" && (
                        <>
                          <Link
                            to="/pelanggan/profil"
                            onClick={() => setUserOpen(false)}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--color-dark-muted)] hover:bg-[var(--color-cream)] hover:text-[var(--color-dark)] font-[var(--font-sans)] transition-colors"
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
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                            Profil Saya
                          </Link>
                          <Link
                            to="/pelanggan/pemesanan"
                            onClick={() => setUserOpen(false)}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--color-dark-muted)] hover:bg-[var(--color-cream)] hover:text-[var(--color-dark)] font-[var(--font-sans)] transition-colors"
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
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                              />
                            </svg>
                            Pemesanan Saya
                          </Link>
                        </>
                      )}
                      {/* Admin: tombol ke dashboard admin */}
                      {user.role === "admin" && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setUserOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--color-dark-muted)] hover:bg-[var(--color-cream)] hover:text-[var(--color-dark)] font-[var(--font-sans)] transition-colors"
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
                              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                            />
                          </svg>
                          Panel Admin
                        </Link>
                      )}
                      {/* Vendor: tombol ke dashboard vendor */}
                      {user.role === "vendor" && (
                        <Link
                          to="/vendor-panel/dashboard"
                          onClick={() => setUserOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--color-dark-muted)] hover:bg-[var(--color-cream)] hover:text-[var(--color-dark)] font-[var(--font-sans)] transition-colors"
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
                              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                            />
                          </svg>
                          Panel Vendor
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-[var(--color-cream-border)] py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 font-[var(--font-sans)] transition-colors"
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
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        Keluar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ── Tombol Masuk ──────────────────────── */
              <Link
                to="/masuk"
                className={[
                  "hidden md:inline-flex px-4 py-2 text-xs uppercase tracking-widest font-[var(--font-sans)] transition-all border",
                  isDark
                    ? "border-white/30 text-white hover:bg-white hover:text-[var(--color-dark)]"
                    : "border-[var(--color-dark)] text-[var(--color-dark)] hover:bg-[var(--color-dark)] hover:text-[var(--color-cream)]",
                ].join(" ")}
              >
                Masuk
              </Link>
            )}

            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className={[
                "lg:hidden p-2 transition-colors rounded",
                isDark
                  ? "text-white/80 hover:text-white"
                  : "text-[var(--color-dark-muted)] hover:text-[var(--color-dark)]",
              ].join(" ")}
              aria-label="Menu"
            >
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
                  d={
                    menuOpen
                      ? "M6 18L18 6M6 6l12 12"
                      : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Mobile menu ─────────────────────────────── */}
        {menuOpen && (
          <div className="lg:hidden bg-white border-t border-[var(--color-cream-border)] max-h-[calc(100vh-4rem)] overflow-y-auto">
            {/* Nav links */}
            <div className="py-2">
              {NAV_LINKS.map(({ label, to }) => (
                <Link
                  key={label}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center px-5 py-3 text-sm text-[var(--color-dark-muted)] hover:text-[var(--color-gold)] hover:bg-[var(--color-cream)] font-[var(--font-sans)] uppercase tracking-widest transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
            {/* Cart */}
            <div className="border-t border-[var(--color-cream-border)] px-5 py-3">
              <Link
                to="/keranjang"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 text-sm text-[var(--color-dark-muted)] font-[var(--font-sans)]"
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
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Keranjang
                {cartCount > 0 && (
                  <span className="w-5 h-5 bg-[var(--color-gold)] rounded-full text-[10px] font-bold text-[var(--color-dark)] flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
            {/* Auth mobile */}
            <div className="border-t border-[var(--color-cream-border)] py-2">
              {isLoggedIn ? (
                <>
                  <div className="px-5 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--color-gold)] flex items-center justify-center">
                      <span className="text-xs font-bold text-[var(--color-dark)]">
                        {user.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--color-dark)] font-[var(--font-sans)]">
                        {user.name}
                      </p>
                      <p className="text-xs text-[var(--color-slate)] font-[var(--font-sans)]">
                        {ROLE_LABEL[user.role]}
                      </p>
                    </div>
                  </div>
                  {/* Badge role di mobile */}
                  <div className="px-4 py-2 mb-1 border-b border-[var(--color-cream-border)]">
                    <p className="text-xs font-medium text-[var(--color-dark)] font-[var(--font-sans)]">
                      {user?.name}
                    </p>
                    <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 bg-[var(--color-gold-pale)] text-[var(--color-gold)] font-[var(--font-sans)]">
                      {user.role === "admin"
                        ? "Administrator"
                        : user.role === "vendor"
                          ? "Vendor"
                          : "Customer"}
                    </span>
                  </div>
                  {user.role === "admin" && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm text-[var(--color-dark-muted)] hover:bg-[var(--color-cream)] font-[var(--font-sans)]"
                    >
                      Panel Admin
                    </Link>
                  )}
                  {user.role === "vendor" && (
                    <Link
                      to="/vendor-panel/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm text-[var(--color-dark-muted)] hover:bg-[var(--color-cream)] font-[var(--font-sans)]"
                    >
                      Panel Vendor
                    </Link>
                  )}
                  {user.role === "customer" && (
                    <Link
                      to="/pelanggan/profil"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center px-5 py-2.5 text-sm text-[var(--color-dark-muted)] hover:bg-[var(--color-cream)] font-[var(--font-sans)]"
                    >
                      Profil Saya
                    </Link>
                  )}
                  <Link
                    to={getDashboardLink()}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center px-5 py-2.5 text-sm text-[var(--color-dark-muted)] hover:bg-[var(--color-cream)] font-[var(--font-sans)]"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-5 py-2.5 text-sm text-red-500 hover:bg-red-50 font-[var(--font-sans)]"
                  >
                    Keluar
                  </button>
                </>
              ) : (
                <Link
                  to="/masuk"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center px-5 py-3 text-sm font-medium text-[var(--color-dark)] font-[var(--font-sans)]"
                >
                  Masuk / Daftar
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {!transparent && <div className="h-16" />}
    </>
  );
}

export default Navbar;
