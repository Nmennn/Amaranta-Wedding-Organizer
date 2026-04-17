// ============================================================
// src/mocks/mockAuth.js
//
// TUJUAN FILE INI:
//   Menyimpan data akun pengguna palsu (dummy) untuk keperluan
//   testing tanpa backend. Login & register bekerja 100% di browser.
//
// EMAIL & PASSWORD DISIMPAN DI SINI (array MOCK_USERS di bawah).
//
// CARA TAMBAH AKUN BARU:
//   Tambahkan object baru ke array MOCK_USERS.
//   Format: { id, name, email, password, phone, username, role }
//
// KETIKA BACKEND SIAP:
//   Hapus file ini. Di authStore.js, ubah USE_MOCK = false.
// ============================================================

// ─────────────────────────────────────────────────────────────
//  DATA AKUN — EMAIL & PASSWORD ADA DI SINI
// ─────────────────────────────────────────────────────────────
export const MOCK_USERS = [
  // ── ADMIN ─────────────────────────────────────────────────
  {
    id: 1,
    name: "Admin AETERNA",
    email: "admin@aeterna.id", // ← email login admin
    password: "admin123", // ← password admin
    phone: "081111111111",
    username: "superadmin",
    role: "admin",
  },

  // ── VENDOR ────────────────────────────────────────────────
  {
    id: 2,
    name: "Anisa Dewi",
    email: "vendor@aeterna.id", // ← email login vendor
    password: "vendor123", // ← password vendor
    phone: "082222222222",
    username: "chateau_vendor",
    role: "vendor",
    vendorId: 1,
  },

  // ── CUSTOMER ──────────────────────────────────────────────
  {
    id: 3,
    name: "Rina Kusuma",
    email: "customer@aeterna.id", // ← email login customer
    password: "customer123", // ← password customer
    phone: "083333333333",
    username: "rina_k",
    role: "customer",
  },

  // Akun customer ke-2 untuk testing tambahan
  {
    id: 4,
    name: "Budi Santoso",
    email: "budi@gmail.com",
    password: "budi1234",
    phone: "084444444444",
    username: "budi_s",
    role: "customer",
  },
];

// ─────────────────────────────────────────────────────────────
//  FUNGSI LOGIN SIMULASI
//  Mengembalikan { token, user } — format SAMA dengan API asli
//  supaya nanti tidak perlu ubah kode saat ganti ke backend.
// ─────────────────────────────────────────────────────────────
export function mockLogin({ email, password }) {
  // Promise dengan setTimeout — simulasi delay jaringan 600ms
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      // Cari user berdasarkan email (tidak case-sensitive)
      var found = MOCK_USERS.find(function (u) {
        return u.email.toLowerCase() === (email || "").toLowerCase();
      });

      // Email tidak ditemukan
      if (!found) {
        reject(new Error("Email tidak terdaftar."));
        return;
      }

      // Password salah
      if (found.password !== password) {
        reject(new Error("Password salah. Coba lagi."));
        return;
      }

      // Berhasil — kirim token + data user (TANPA password)
      var user = {
        id: found.id,
        name: found.name,
        email: found.email,
        username: found.username,
        phone: found.phone,
        role: found.role,
      };
      if (found.vendorId) user.vendorId = found.vendorId;

      resolve({
        token: "mock-token-" + found.id + "-" + Date.now(),
        user: user,
      });
    }, 600);
  });
}

// ─────────────────────────────────────────────────────────────
//  FUNGSI REGISTER SIMULASI
// ─────────────────────────────────────────────────────────────
export function mockRegister(formData) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      // Cek email sudah dipakai
      var emailTaken = MOCK_USERS.some(function (u) {
        return u.email.toLowerCase() === (formData.email || "").toLowerCase();
      });
      if (emailTaken) {
        reject(new Error("Email sudah terdaftar. Gunakan email lain."));
        return;
      }

      // Buat user baru
      var newUser = {
        id: MOCK_USERS.length + 1,
        name: formData.name,
        email: formData.email,
        password: formData.password, // disimpan untuk keperluan login berikutnya
        phone: formData.phone || "",
        username: formData.username || formData.email.split("@")[0],
        role: formData.role || "customer",
      };

      // Tambah ke array (berlaku selama session browser)
      MOCK_USERS.push(newUser);

      var user = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
        phone: newUser.phone,
        role: newUser.role,
      };

      resolve({
        token: "mock-token-" + newUser.id + "-" + Date.now(),
        user: user,
      });
    }, 800);
  });
}
