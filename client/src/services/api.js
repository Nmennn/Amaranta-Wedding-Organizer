import axios from "axios";
import { BASE_URL } from "../constants/apiRoutes";

// ── 1. Buat instance Axios ───────────────────────────────────
// axios.create() → membuat "kopi" axios dengan config default
const api = axios.create({
  baseURL: BASE_URL, // semua request prefix dengan ini
  timeout: 15000, // batas waktu 15 detik
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ── 2. Request Interceptor ───────────────────────────────────
// Dijalankan SEBELUM setiap request dikirim ke server
// Tugasnya: sisipkan token JWT ke header Authorization
api.interceptors.request.use(
  (config) => {
    // Ambil token dari localStorage
    // localStorage: storage browser yg persisten (tidak hilang refresh)
    const token = localStorage.getItem("amaranta_token");

    if (token) {
      // Bearer: skema autentikasi HTTP standar untuk JWT
      // Format: "Authorization: Bearer <token>"
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config; // wajib return config agar request dilanjutkan
  },
  (error) => {
    // Jika ada error saat membuat request (mis: network down)
    return Promise.reject(error);
  },
);

// ── 3. Response Interceptor ──────────────────────────────────
// Dijalankan SETELAH response diterima dari server
// Tugasnya: handle error global (terutama 401 Unauthorized)
api.interceptors.response.use(
  (response) => {
    // Respons sukses (2xx): langsung teruskan
    return response;
  },
  (error) => {
    const status = error.response?.status;
    // ?. = optional chaining: tidak error jika response undefined

    if (status === 401) {
      // Token expired atau tidak valid → hapus data auth & redirect
      localStorage.removeItem("amaranta_token");
      localStorage.removeItem("amaranta_user");
      // Redirect ke halaman login
      window.location.href = "/login";
    }

    if (status === 403) {
      // Forbidden: user login tapi tidak punya akses
      console.warn("[API] 403 Forbidden — insufficient permissions");
    }

    // Teruskan error agar bisa di-catch di komponen/service
    return Promise.reject(error);
  },
);

export default api;
