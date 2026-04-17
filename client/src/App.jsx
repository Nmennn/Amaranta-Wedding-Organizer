// ============================================================
// src/App.jsx — Router AMARANTA (versi final fix)
// FIX:
//   1. Route /pelanggan/profil ditambahkan
//   2. Vendor route: public /vendor & /vendor/:slug TERPISAH dari /vendor-panel
//   3. Semua route protected sudah benar
// ============================================================
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import useAuthStore from "./store/authStore";

// ── Public ──────────────────────────────────────────────────
import Landing from "./pages/public/Landing";
import Packages from "./pages/public/Packages";
// VendorList & VendorDetail dihapus — AMARANTA adalah 1 vendor
import Gallery from "./pages/public/Gallery";
import About from "./pages/public/About";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";
import Cart from "./pages/public/Cart";
import Checkout from "./pages/public/Checkout";


// ── Admin ────────────────────────────────────────────────────
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminVendors from "./pages/admin/Vendors";
import AdminUsers from "./pages/admin/Users";
import AdminBookings from "./pages/admin/Bookings";

// ── Vendor Panel ─────────────────────────────────────────────
import VendorLayout from "./layouts/VendorLayout";
import VendorDashboard from "./pages/vendor/Dashboard";
import VendorPackages from "./pages/vendor/Packages";
import VendorBookings from "./pages/vendor/Bookings";
import VendorProfile from "./pages/vendor/Profile";

// ── Customer ─────────────────────────────────────────────────
import CustomerLayout from "./layouts/CustomerLayout";
import CustomerMyBookings from "./pages/customer/MyBookings";
import CustomerProfile from "./pages/customer/Profile";

// ── Route Guards ─────────────────────────────────────────────

// Harus login
function PrivateRoute() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  return token && user ? <Outlet /> : <Navigate to="/masuk" replace />;
}

// Cek role spesifik
function RoleRoute({ allowedRoles }) {
  const user = useAuthStore((s) => s.user);
  return user && allowedRoles.includes(user.role) ? (
    <Outlet />
  ) : (
    <Navigate to="/" replace />
  );
}

// Hanya untuk tamu — redirect jika sudah login
function GuestRoute() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  if (!(token && user)) return <Outlet />;
  if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
  if (user.role === "vendor")
    return <Navigate to="/vendor-panel/dashboard" replace />;
  return <Navigate to="/pelanggan/pemesanan" replace />;
}

// ─────────────────────────────────────────────────────────────

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── PUBLIK (semua bisa akses) ── */}
        <Route path="/" element={<Landing />} />
        <Route path="/paket" element={<Packages />} />
        {/* /vendor & /vendor/:slug dihapus — AMARANTA 1 vendor */}
        <Route path="/galeri" element={<Gallery />} />
        <Route path="/tentang" element={<About />} />
        <Route path="/keranjang" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />

        {/* ── GUEST ONLY (redirect jika sudah login) ── */}
        <Route element={<GuestRoute />}>
          <Route path="/masuk" element={<Login />} />
          <Route path="/daftar" element={<Register />} />
        </Route>

        {/* ── PROTECTED (harus login) ── */}
        <Route element={<PrivateRoute />}>
          {/* Admin */}
          <Route element={<RoleRoute allowedRoles={["admin"]} />}>
            <Route element={<AdminLayout />}>
              <Route
                path="/admin"
                element={<Navigate to="/admin/dashboard" replace />}
              />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/vendors" element={<AdminVendors />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/bookings" element={<AdminBookings />} />
            </Route>
          </Route>

          {/* Vendor Panel — TERPISAH dari /vendor (public) */}
          <Route element={<RoleRoute allowedRoles={["vendor"]} />}>
            <Route element={<VendorLayout />}>
              <Route
                path="/vendor-panel"
                element={<Navigate to="/vendor-panel/dashboard" replace />}
              />
              <Route
                path="/vendor-panel/dashboard"
                element={<VendorDashboard />}
              />
              <Route
                path="/vendor-panel/packages"
                element={<VendorPackages />}
              />
              <Route
                path="/vendor-panel/bookings"
                element={<VendorBookings />}
              />
              <Route path="/vendor-panel/profile" element={<VendorProfile />} />
            </Route>
          </Route>

          {/* Customer */}
          <Route element={<RoleRoute allowedRoles={["customer"]} />}>
            <Route element={<CustomerLayout />}>
              <Route
                path="/pelanggan/pemesanan"
                element={<CustomerMyBookings />}
              />
              <Route path="/pelanggan/profil" element={<CustomerProfile />} />
            </Route>
          </Route>
        </Route>

        {/* ── 404 ── */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-cream)] gap-4">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-gold)] font-[var(--font-sans)]">
                404
              </p>
              <h1 className="font-[var(--font-display)] text-5xl text-[var(--color-dark)]">
                Halaman tidak ditemukan
              </h1>
              <a
                href="/"
                className="text-sm text-[var(--color-gold)] hover:underline font-[var(--font-sans)]"
              >
                ← Kembali ke Beranda
              </a>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
