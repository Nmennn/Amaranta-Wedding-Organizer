// ============================================================
// src/hooks/useAuth.js — Custom hook pembungkus authStore
// ============================================================
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { toastSuccess, toastError } from "./useToast";

function useAuth() {
  const navigate = useNavigate();

  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const storeLogin = useAuthStore((s) => s.login);
  const storeRegister = useAuthStore((s) => s.register);
  const storeLogout = useAuthStore((s) => s.logout);
  const storeUpdate = useAuthStore((s) => s.updateProfile);
  const clearError = useAuthStore((s) => s.clearError);

  const isAuthenticated = !!(token && user);

  // Login → navigasi ke dashboard sesuai role
  async function login(credentials) {
    const data = await storeLogin(credentials);
    toastSuccess("Selamat datang, " + data.user.name.split(" ")[0] + "!");
    const role = data.user.role;
    if (role === "admin") navigate("/admin/dashboard");
    else if (role === "vendor") navigate("/vendor-panel/dashboard");
    else navigate("/pelanggan/pemesanan");
    return data;
  }

  // Register → navigasi setelah OTP
  async function register(formData) {
    const data = await storeRegister(formData);
    const role = data.user.role;
    if (role === "vendor") navigate("/vendor-panel/dashboard");
    else navigate("/pelanggan/pemesanan");
    return data;
  }

  // Logout → kembali ke beranda
  function logout() {
    storeLogout();
    toastSuccess("Anda berhasil keluar.");
    navigate("/");
  }

  // Update profil (nama, hp, username)
  async function updateProfile(profileData) {
    return storeUpdate(profileData);
  }

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    isAdmin: user?.role === "admin",
    isVendor: user?.role === "vendor",
    isCustomer: user?.role === "customer",
    login,
    register,
    logout,
    updateProfile,
    clearError,
  };
}

export default useAuth;
