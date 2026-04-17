// ============================================================
// src/constants/roles.js
// Mendefinisikan role/peran pengguna dalam sistem.
// Dijadikan konstanta agar tidak ada typo saat digunakan di
// seluruh codebase (routes, guards, UI conditional rendering).
// ============================================================

/** @type {Object.<string, string>} */
export const ROLES = {
  ADMIN:    'admin',    // Superuser — kelola semua data
  VENDOR:   'vendor',  // Pemilik jasa wedding
  CUSTOMER: 'customer', // Pengguna yang memesan
}

/** Array semua role yang valid (berguna untuk validasi) */
export const ALL_ROLES = Object.values(ROLES)
