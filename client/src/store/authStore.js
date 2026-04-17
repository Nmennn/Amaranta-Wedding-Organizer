// ============================================================
// src/store/authStore.js
//
// SEKARANG: Pakai mock (dummy) — bekerja tanpa backend.
//
// CARA GANTI KE API SUNGGUHAN (saat backend sudah jadi):
//   1. Ubah: const USE_MOCK = true  →  const USE_MOCK = false
//   2. Pastikan .env sudah benar:   VITE_API_URL=http://localhost:5000/api
//   3. Selesai. Tidak ada kode lain yang perlu diubah.
// ============================================================

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Import mock — HANYA dari sini, tidak ada Axios saat ini
import { mockLogin, mockRegister } from "../mocks/mockAuth";

// ─── Konfigurasi mode ─────────────────────────────────────────
// true  = pakai data dummy di browser (SEKARANG)
// false = panggil API backend sungguhan
const USE_MOCK = true;

// ─── Fungsi yang dipilih sesuai mode ─────────────────────────
// Saat USE_MOCK = false, dua baris ini yang diganti:
//   import { authService } from '../services'
//   const loginFn    = (c) => authService.login(c)
//   const registerFn = (d) => authService.register(d)
var loginFn = USE_MOCK ? mockLogin : null;
var registerFn = USE_MOCK ? mockRegister : null;

// ─── Store Zustand ────────────────────────────────────────────
var useAuthStore = create(
  persist(
    function (set) {
      return {
        // STATE
        user: null, // data user yang login: { id, name, email, role, ... }
        token: null, // token string
        isLoading: false, // true saat proses login/register berjalan
        error: null, // string pesan error, null jika tidak ada error

        // ACTION: LOGIN
        login: async function (credentials) {
          set({ isLoading: true, error: null });
          try {
            var data = await loginFn(credentials);
            // data = { token: '...', user: { id, name, email, role, ... } }
            set({ token: data.token, user: data.user, isLoading: false });
            localStorage.setItem("aeterna_token", data.token);
            return data;
          } catch (err) {
            var msg = err.message || "Login gagal. Coba lagi.";
            set({ error: msg, isLoading: false });
            throw err;
          }
        },

        // ACTION: REGISTER
        register: async function (formData) {
          set({ isLoading: true, error: null });
          try {
            var data = await registerFn(formData);
            set({ token: data.token, user: data.user, isLoading: false });
            localStorage.setItem("aeterna_token", data.token);
            return data;
          } catch (err) {
            var msg = err.message || "Pendaftaran gagal. Coba lagi.";
            set({ error: msg, isLoading: false });
            throw err;
          }
        },

        // ACTION: LOGOUT
        logout: function () {
          set({ user: null, token: null, error: null, isLoading: false });
          localStorage.removeItem("aeterna_token");
        },

        // Hapus error (dipanggil saat user mulai ketik ulang)
        clearError: function () {
          set({ error: null });
        },

        // Update data user (setelah edit profil)
        setUser: function (user) {
          set({ user: user });
        },
      };
    },
    {
      // Key di localStorage: 'aeterna-auth'
      // Cek di browser: DevTools → Application → Local Storage
      name: "aeterna-auth",
      storage: createJSONStorage(function () {
        return localStorage;
      }),
      // Hanya simpan token & user, bukan isLoading/error
      partialize: function (state) {
        return { token: state.token, user: state.user };
      },
    },
  ),
);

export default useAuthStore;
