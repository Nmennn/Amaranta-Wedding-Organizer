# GRAY-BOX TESTING
## Aplikasi AMARANTA — Wedding Organizer Web Application
### Mata Kuliah: Software Quality | Dosen: Deni Suprihadi, S.T, M.KOM., MCE.

---

## Definisi Gray-Box Testing
Gray-Box Testing adalah metode yang menggabungkan teknik Black-Box dan White-Box Testing. Tester **tidak menguji baris kode satu per satu** (seperti White Box murni), tetapi juga **tidak buta total** terhadap sistem (seperti Black Box murni). Tester memanfaatkan pengetahuan terbatas tentang struktur internal — misalnya skema database, isi fungsi validasi, atau alur logika controller — untuk merancang kasus uji input-output yang lebih terarah.

---

## Deskripsi Aplikasi yang Diuji
**AMARANTA** adalah aplikasi web Wedding Organizer berbasis:
- **Frontend:** React + Vite (Node.js)
- **Backend:** Laravel 11, PHP 8.2, MySQL
- **Payment Gateway:** Midtrans Snap (mode Sandbox)

---

## Mengapa Disebut Gray-Box (Bukan Black-Box)?

| Bab / Metode | Pengetahuan Internal (sisi White Box) | Cara Diuji dari Luar (sisi Black Box) |
|-------------|--------------------------------------|--------------------------------------|
| OAT | Tester membaca kode `TAMU_CONFIG` di frontend dan tahu `BookingController::store()` tidak memvalidasi `jumlah_tamu` | Tester mengirim kombinasi input lewat form (dan langsung ke API) untuk membuktikan bypass |
| Matrix | Tester membaca isi `match($sort)` pada `VendorController::index()` dan tahu persis nilai apa yang dikenali | Tester mengirim kombinasi parameter `category/search/sort` lewat HTTP dan mengamati JSON |
| Regression | Tester membandingkan kode sebelum & sesudah perubahan `$dateExists` — info hanya ada di tim pengembang | Tester mengeksekusi skenario booking dari sisi pengguna |
| Pattern | Tester tahu ada dua jalur konfirmasi berbeda (`confirmPayment()` vs `midtransNotify()` webhook) | Tester mengeksplorasi alur pembayaran dari sisi pengguna |

---

## Ruang Lingkup Pengujian

| Komponen | File / Endpoint |
|----------|----------------|
| Frontend — Form Booking | `client/src/pages/public/BookingForm.jsx` |
| Frontend — Pencarian Vendor | `client/src/pages/public/Search.jsx`, `VendorList.jsx` |
| Backend — Booking Controller | `server/app/Http/Controllers/BookingController.php` |
| Backend — Vendor Controller | `server/app/Http/Controllers/VendorController.php` |
| Backend — Payment (Midtrans) | `pay()`, `payRemaining()`, `confirmPayment()`, `midtransNotify()` |

---

## BAB II — ORTHOGONAL ARRAY TESTING (OAT)

### 2.1 Objek Uji: Form Pemesanan Paket (BookingForm.jsx → BookingController::store())

OAT dipilih karena form pemesanan AMARANTA memiliki **4 variabel independen** yang saling memengaruhi validitas pemesanan. Menguji semua kombinasi penuh = 81 kombinasi (3⁴), OAT memungkinkan cakupan representatif dengan jauh lebih sedikit kasus uji.

**Pengetahuan Internal Gray-Box:** Kode `TAMU_CONFIG` pada `BookingForm.jsx` memvalidasi batas tamu di frontend saja. Saat dibaca, `BookingController::store()` di backend **tidak memiliki rule validasi untuk `jumlah_tamu`** — field itu hanya digabung ke `notes`. Inilah yang mendasari OAT-06 dan OAT-09.

### 2.2 Identifikasi Faktor dan Level

| Faktor | Level 1 | Level 2 | Level 3 |
|--------|---------|---------|---------|
| A. Tier Paket | Silver | Gold | Platinum |
| B. Jumlah Tamu | Di bawah minimum tier | Dalam rentang valid tier | Di atas maksimum tier |
| C. Tanggal Pernikahan | Tanggal valid (masa depan, belum terpakai) | Tanggal sudah dipesan ($dateExists = true) | Tanggal tidak valid (hari ini / masa lalu) |
| D. Kelengkapan Data | Semua field lengkap dan valid | Salah satu field kosong | Format salah (email tanpa "@", phone tidak diawali "08") |

**Acuan nilai konkret per level (Faktor B - Jumlah Tamu):**

| Tier | Min | Max | Level Bawah (invalid) | Level Dalam Rentang (valid) | Level Atas (invalid) |
|------|-----|-----|----------------------|---------------------------|---------------------|
| Silver | 50 | 100 | 30 | 80 | 150 |
| Gold | 100 | 200 | 50 | 150 | 250 |
| Platinum | 200 | 500 | 100 | 300 | 600 |

### 2.3 Perhitungan Orthogonal Array

- **Jumlah Faktor:** 4 (Tier, Jumlah Tamu, Tanggal, Kelengkapan Data)
- **Jumlah Level per Faktor:** 3
- **Tipe Array:** L₉(3⁴) → **9 Kasus Uji** (dari 81 kombinasi penuh)
- **Penghematan:** 88,9%

### 2.4 Array Ortogonal L₉(3⁴)

| No | A (Tier) | B (Tamu) | C (Tanggal) | D (Data) |
|----|----------|----------|-------------|---------|
| OAT-01 | Silver (1) | Bawah (1) | Valid (1) | Lengkap (1) |
| OAT-02 | Silver (1) | Dalam (2) | Dipesan (2) | Kosong (2) |
| OAT-03 | Silver (1) | Atas (3) | Invalid (3) | Format salah (3) |
| OAT-04 | Gold (2) | Bawah (1) | Dipesan (2) | Format salah (3) |
| OAT-05 | Gold (2) | Dalam (2) | Invalid (3) | Lengkap (1) |
| OAT-06 | Gold (2) | Atas (3) | Valid (1) | Kosong (2) |
| OAT-07 | Platinum (3) | Bawah (1) | Invalid (3) | Kosong (2) |
| OAT-08 | Platinum (3) | Dalam (2) | Valid (1) | Format salah (3) |
| OAT-09 | Platinum (3) | Atas (3) | Dipesan (2) | Lengkap (1) |

### 2.5 Detail Test Case OAT

**Test Case ID: OAT-01**
- **Skenario:** Silver + Tamu di bawah minimum + Tanggal valid + Data lengkap
- **Prioritas:** High
- **Precondition:** Login sebagai customer, buka form paket Silver
- **Test Steps:**
  1. Isi tier: Silver
  2. Isi jumlah_tamu: **30** (di bawah minimum 50)
  3. Isi tanggal: 2026-12-25 (tanggal masa depan, belum terpakai)
  4. Isi semua data pemesan: nama lengkap valid, email valid, HP valid
  5. Klik "Konfirmasi & Pesan Sekarang"
- **Test Data:** `{tier: silver, jumlah_tamu: 30, wedding_date: 2026-12-25, data: lengkap}`
- **Expected Output:** Error "Jumlah tamu minimal 50 orang untuk paket Silver" — form ditolak
- **Actual Output:** [ISI]
- **Status:** [ISI]
- 📷 **SS-04:** Screenshot form Silver dengan jumlah_tamu=30 dan error message

---

**Test Case ID: OAT-06 (Kritis — Bypass via API)**
- **Skenario:** Gold + Tamu di atas maksimum + Tanggal valid + Data ada yang kosong
- **Prioritas:** CRITICAL (Gray-Box: tester tahu backend tidak validasi jumlah_tamu)
- **Precondition:** Punya token autentikasi valid (login sebagai customer)
- **Test Steps:**
  1. Buka Postman, kirim POST `{{BASE_URL}}/api/bookings`
  2. Header: `Authorization: Bearer {{token}}`
  3. Body (bypass frontend, kirim langsung ke API):
     ```json
     {
       "package_id": 2,
       "wedding_date": "2026-11-20",
       "groom_name": "Ahmad",
       "bride_name": "Siti",
       "notes": "250 orang tamu"
     }
     ```
  4. Amati response
  5. Verifikasi data di database (tabel `bookings`)
- **Test Data:** `jumlah_tamu: 250` untuk tier Gold (maksimum 200) — dikirim via API langsung
- **Expected Output (jika backend tervalidasi):** HTTP 422 — jumlah tamu melebihi batas
- **Dugaan Aktual (Gray-Box):** HTTP 201 — booking berhasil dibuat MESKI tamu melebihi batas (backend tidak validasi)
- **Actual Output:** [ISI]
- **Status:** [ISI]
- 📷 **SS-05:** Screenshot Postman request + response (bypass tamu)
- 📷 **SS-06:** Screenshot data booking di database (tamu 250 tersimpan)

### 2.6 Tabel Ringkas Eksekusi OAT

| ID | A (Tier) | B (Tamu) | C (Tanggal) | D (Data) | Expected | Actual | Status |
|----|----------|----------|-------------|---------|----------|--------|--------|
| OAT-01 | Silver | Bawah (30) | Valid | Lengkap | Error: tamu kurang | [ISI] | [ISI] |
| OAT-02 | Silver | Dalam (80) | Dipesan | Kosong | Error: tgl & data kosong | [ISI] | [ISI] |
| OAT-03 | Silver | Atas (150) | Invalid | Format salah | Multiple error | [ISI] | [ISI] |
| OAT-04 | Gold | Bawah (50) | Dipesan | Format salah | Error: tanggal & tamu | [ISI] | [ISI] |
| OAT-05 | Gold | Dalam (150) | Invalid | Lengkap | Error: tanggal masa lalu | [ISI] | [ISI] |
| OAT-06 | Gold | Atas (250) | Valid | Kosong | Error (atau bypass?) | [ISI] | [ISI] |
| OAT-07 | Platinum | Bawah (100) | Invalid | Kosong | Multiple error | [ISI] | [ISI] |
| OAT-08 | Platinum | Dalam (300) | Valid | Format salah | Error: format data | [ISI] | [ISI] |
| OAT-09 | Platinum | Atas (600) | Dipesan | Lengkap | Error: tanggal & tamu | [ISI] | [ISI] |

---

## BAB III — MATRIX TESTING

### 3.1 Objek Uji: Filter Pencarian Vendor (VendorController::index())

**Pengetahuan Internal Gray-Box:** Tester membaca isi `match($sort)` pada `VendorController::index()` dan tahu persis nilai apa saja yang dikenali sistem (misalnya: `price_asc`, `price_desc`, `newest`) serta apa yang terjadi bila nilai lain dikirim (default: tanpa sort spesifik).

**Kode yang diketahui (sebagian):**
```php
// VendorController::index()
$sort = $request->input('sort', null);
$query = match($sort) {
    'price_asc'  => $query->orderBy('price', 'asc'),
    'price_desc' => $query->orderBy('price', 'desc'),
    'newest'     => $query->orderBy('created_at', 'desc'),
    default      => $query, // Tidak ada sort
};
```

### 3.2 Identifikasi Variabel

**Variabel 1 — Category (3 nilai):** `wedding`, `photography`, `catering`
**Variabel 2 — Sort (3 nilai):** `price_asc`, `price_desc`, `newest`
**Variabel 3 — Search Keyword (3 nilai):** Ada keyword valid, Keyword tidak ada hasilnya, Kosong

**Kombinasi Penuh:** 3 × 3 × 3 = 27 kombinasi
**Kombinasi Matrix (9 uji):** Penghematan 66,7%

### 3.3 Tabel Matrix Testing

| ID | Category | Sort | Search | Expected | Actual | Status |
|----|----------|------|--------|----------|--------|--------|
| MTX-01 | wedding | price_asc | (kosong) | Vendor wedding, urut harga naik | [ISI] | [ISI] |
| MTX-02 | wedding | price_desc | "Elegan" | Vendor wedding keyword Elegan, urut harga turun | [ISI] | [ISI] |
| MTX-03 | wedding | newest | "xyz999" | Vendor wedding keyword xyz999 → 0 hasil | [ISI] | [ISI] |
| MTX-04 | photography | price_asc | "Elegan" | Vendor photography keyword Elegan, harga naik | [ISI] | [ISI] |
| MTX-05 | **tidakada** | price_desc | (kosong) | Error atau 0 hasil (kategori tidak ada) | [ISI] | [ISI] |
| MTX-06 | photography | newest | (kosong) | Vendor photography, urut terbaru | [ISI] | [ISI] |
| MTX-07 | catering | price_asc | "xyz999" | Vendor catering keyword xyz999 → 0 hasil | [ISI] | [ISI] |
| MTX-08 | catering | **xyz** (sort invalid) | "Elegan" | Default sort (tanpa urutan spesifik) | [ISI] | [ISI] |
| MTX-09 | catering | newest | (kosong) | Vendor catering, urut terbaru | [ISI] | [ISI] |

**Detail Test Case Kritis:**

**Test Case ID: MTX-05**
- **Skenario:** Kategori yang tidak ada di sistem
- **Endpoint:** `GET {{BASE_URL}}/api/vendors?category=tidakada&sort=price_desc`
- **Expected:** HTTP 200 dengan data kosong `[]` atau HTTP 404
- **Actual:** [ISI]
- 📷 **SS-14:** Screenshot Postman MTX-05

**Test Case ID: MTX-08**
- **Skenario:** Nilai sort tidak valid (`xyz`)
- **Endpoint:** `GET {{BASE_URL}}/api/vendors?category=catering&sort=xyz&search=Elegan`
- **Expected (Gray-Box):** HTTP 200, hasil sorted dengan default (tidak ada sort spesifik)
- **Actual:** [ISI]
- 📷 **SS-15:** Screenshot Postman MTX-08 dengan sort=xyz
- 📷 **SS-16:** Screenshot Postman response tanpa sort (pembanding)

---

## BAB IV — REGRESSION TESTING

### 4.1 Latar Belakang

**Perubahan yang Diuji:** Tim pengembang mengubah logika pengecekan tanggal bentrok di `BookingController::store()`. Sebelumnya menggunakan kondisi sederhana, kini ditambahkan pengecekan `$dateExists` yang lebih komprehensif.

**Pengetahuan Internal Gray-Box:** Tester membandingkan kode sebelum dan sesudah perubahan — informasi yang hanya dimiliki tim pengembang/tester, bukan pengguna akhir.

**Perubahan Kode:**
```php
// SEBELUM (kondisi lama):
$dateExists = Booking::where('wedding_date', $request->wedding_date)->exists();

// SESUDAH (kondisi baru — memperbaiki bug: booking cancelled tidak lagi memblokir tanggal):
$dateExists = Booking::where('wedding_date', $request->wedding_date)
                     ->where('status', '!=', 'cancelled')
                     ->exists();
```

### 4.2 Tujuan Regression Testing
1. Memastikan perbaikan bug berjalan benar (tanggal yang di-cancel tidak lagi memblokir booking baru)
2. Memastikan tidak ada fungsi lama yang rusak akibat perubahan ini

### 4.3 Tabel Kasus Uji Regression Testing

| ID | Skenario | Tipe | Pre-condition | Expected | Actual | Status |
|----|----------|------|---------------|----------|--------|--------|
| REG-01 | Booking tanggal baru yang belum pernah dibooking | Fungsional dasar | DB bersih dari tanggal uji | HTTP 201: Booking berhasil | [ISI] | [ISI] |
| REG-02 | Booking tanggal yang sudah aktif (status: pending) | Regression — tetap harus gagal | Ada booking aktif di tanggal yang sama | HTTP 422: Tanggal sudah dipesan | [ISI] | [ISI] |
| REG-03 | Booking tanggal yang sudah aktif (status: confirmed) | Regression | Ada booking confirmed di tanggal tersebut | HTTP 422: Tanggal sudah dipesan | [ISI] | [ISI] |
| REG-04 | Booking tanggal yang sudah aktif (status: in_progress) | Regression | Ada booking in_progress | HTTP 422: Tanggal sudah dipesan | [ISI] | [ISI] |
| REG-05 | Booking tanggal yang sudah aktif (status: completed) | Regression | Ada booking completed | HTTP 422: Tanggal sudah dipesan | [ISI] | [ISI] |
| REG-06 | Booking form dengan data valid semua field | Fungsional dasar | Tanggal belum terpakai | HTTP 201: Booking berhasil | [ISI] | [ISI] |
| REG-07 | Booking dengan field nama kosong | Validasi dasar | - | HTTP 422: Nama wajib diisi | [ISI] | [ISI] |
| REG-08 | Booking dengan tanggal masa lalu | Validasi dasar | - | HTTP 422: Tanggal harus masa depan | [ISI] | [ISI] |
| **REG-09** | **Booking tanggal yang booking-nya sudah CANCELLED** | **BUG FIX — Seharusnya BOLEH** | Ada booking cancelled di tanggal tersebut | **HTTP 201: Booking berhasil** | [ISI] | [ISI] |
| REG-10 | Dua request booking tanggal sama secara bersamaan (race condition) | Edge case / Concurrent | - | Hanya 1 booking terbentuk | [ISI] | [ISI] |
| REG-11 | Cek endpoint lain yang tidak terdampak perubahan | Scope regression | - | Semua endpoint terkait masih normal | [ISI] | [ISI] |

**Detail Test Case Kritis:**

**Test Case ID: REG-09 (Bug Fix Verification)**
- **Skenario:** Booking tanggal yang sebelumnya dibooking tapi kemudian di-cancel
- **Prioritas:** Critical
- **Test Steps:**
  1. Booking A dibuat untuk tanggal 2026-12-25 (status: pending)
  2. Booking A dibatalkan → status berubah ke `cancelled`
  3. Customer B mencoba booking tanggal yang sama: 2026-12-25
  4. Amati response
- **Expected (setelah perbaikan):** HTTP 201 — Booking B berhasil dibuat
- **Expected (sebelum perbaikan):** HTTP 422 — Tanggal sudah dipesan (bug)
- **Actual Output:** [ISI]
- **Status:** [ISI]
- 📷 **SS-22:** Data Booking A (cancelled) di database
- 📷 **SS-23:** Response sukses Booking B untuk tanggal yang sama

**Test Case ID: REG-10 (Race Condition)**
- **Skenario:** Dua user booking tanggal sama secara bersamaan
- **Test Steps:**
  1. Siapkan dua token customer berbeda
  2. Kirim dua request secara bersamaan menggunakan curl/Apache Bench:
     ```bash
     curl -X POST .../api/bookings -d '{"wedding_date":"2026-12-25",...}' &
     curl -X POST .../api/bookings -d '{"wedding_date":"2026-12-25",...}' &
     ```
  3. Cek berapa booking terbentuk di database
- **Expected:** Hanya 1 booking yang berhasil, 1 mendapat error 422
- **Actual:** [ISI]
- **Status:** [ISI]
- 📷 **SS-24:** Dua response curl bersamaan
- 📷 **SS-25:** Query COUNT booking tanggal sama di database

---

## BAB V — PATTERN (EXPLORATORY) TESTING

### 5.1 Objek Uji: Alur Pembayaran AMARANTA (Midtrans Snap)

**Pengetahuan Internal Gray-Box:** Tester tahu bahwa ada **dua jalur konfirmasi pembayaran berbeda**:
1. `confirmPayment()` — konfirmasi manual oleh customer (klik tombol di UI)
2. `midtransNotify()` — webhook otomatis dari server Midtrans

Detail arsitektur ini tidak terlihat di UI sama sekali — inilah esensi Gray-Box pada Pattern Testing.

### 5.2 Skenario Fungsional Dasar (PAT-01 s.d. PAT-04)

| ID | Skenario | Steps | Expected | Actual | Status |
|----|----------|-------|----------|--------|--------|
| PAT-01 | Alur DP normal — buka Snap, bayar, konfirmasi | Login → Klik bayar DP → Snap popup → Bayar → Konfirmasi | Status: waiting_dp, DP recorded | [ISI] | [ISI] |
| PAT-02 | Alur pelunasan normal | Status confirmed → Klik bayar sisa → Snap → Bayar → Konfirmasi | Status: completed, full payment | [ISI] | [ISI] |
| PAT-03 | Batal di tengah Snap popup | Buka Snap → Klik "Kembali/Batal" di popup | Status tetap pending/waiting_dp | [ISI] | [ISI] |
| PAT-04 | Bayar ulang setelah gagal | Buka Snap → Tutup → Buka lagi → Bayar | Snap token baru di-generate, pembayaran berhasil | [ISI] | [ISI] |

### 5.3 Skenario Eksplorasi (PAT-05 s.d. PAT-15)

| ID | Skenario | Insight Gray-Box | Expected | Actual | Status |
|----|----------|-----------------|----------|--------|--------|
| PAT-05 | Coba bayar DP dua kali (double payment) | confirmPayment() tidak cek duplikasi? | Pembayaran kedua ditolak / tidak mengubah data | [ISI] | [ISI] |
| **PAT-06** | **Koneksi terputus setelah bayar di Snap, sebelum klik konfirmasi** | **Ada dua jalur: manual vs webhook. Jika webhook tidak aktif, status macet** | Status di-update via webhook Midtrans | [ISI] | [ISI] |
| PAT-07 | Bayar pelunasan saat status masih waiting_dp (belum confirmed) | payRemaining() cek status dulu? | Error: status harus confirmed dulu | [ISI] | [ISI] |
| PAT-08 | Bayar DP untuk booking yang sudah cancelled | pay() cek status booking dulu? | Error: booking sudah dibatalkan | [ISI] | [ISI] |
| PAT-09 | Bayar dengan nominal berbeda dari yang seharusnya | Apakah nominal diambil dari DB atau dikirim client? | Nominal dari DB (tidak bisa manipulasi) | [ISI] | [ISI] |
| PAT-10 | Webhook Midtrans diterima setelah status booking berubah | midtransNotify() idempotent? | Tidak ada double update/error | [ISI] | [ISI] |
| **PAT-11** | **Akses endpoint pembayaran milik customer lain** | `pay()` ada cek customer_id vs user id | HTTP 403: Tidak diizinkan | [ISI] | [ISI] |
| PAT-12 | Simulasi webhook palsu (tanpa signature Midtrans) | midtransNotify() verifikasi signature? | HTTP 400/403: Signature tidak valid | [ISI] | [ISI] |
| PAT-13 | Bayar DP saat vendor sudah tidak aktif | Tidak ada cek status vendor di pay()? | Seharusnya ditolak atau ada warning | [ISI] | [ISI] |
| PAT-14 | Coba akses halaman pembayaran tanpa login | Middleware auth? | Redirect ke login / HTTP 401 | [ISI] | [ISI] |
| PAT-15 | Multiple tab — bayar dari dua tab berbeda bersamaan | Race condition pada payments table? | Hanya 1 payment tercatat | [ISI] | [ISI] |

### 5.4 Detail Test Case Kritis

**Test Case ID: PAT-06 (Koneksi Terputus)**
- **Skenario:** Koneksi internet terputus setelah transaksi berhasil di Midtrans, sebelum customer klik tombol konfirmasi
- **Prioritas:** High
- **Pengetahuan Internal (Gray-Box):** Ada dua jalur: `confirmPayment()` manual dan `midtransNotify()` webhook. Jika koneksi terputus, `confirmPayment()` tidak bisa dipanggil. Status bergantung pada webhook Midtrans.
- **Test Steps:**
  1. Login sebagai customer, buka halaman bayar DP
  2. Klik "Bayar DP" → Snap popup muncul
  3. Lakukan pembayaran di Snap (gunakan kartu test Midtrans sandbox)
  4. Setelah Snap menunjukkan "Pembayaran Berhasil", **putuskan koneksi internet** (DevTools → Network → Offline)
  5. Amati status booking di halaman "Pemesanan Saya"
  6. Pulihkan koneksi, simulasi webhook manual via Postman:
     ```json
     POST {{BASE_URL}}/api/payments/midtrans/notify
     Body: {Midtrans webhook payload dengan status "settlement"}
     ```
  7. Cek status booking di database
- **Expected:** Webhook Midtrans mengupdate status menjadi `waiting_dp`
- **Actual:** [ISI]
- **Status:** [ISI]
- 📷 **SS-37:** DevTools Network mode Offline
- 📷 **SS-38:** Status booking di DB sebelum webhook manual
- 📷 **SS-39:** Postman simulasi webhook Midtrans
- 📷 **SS-40:** Status booking di DB sesudah webhook manual

---

**Test Case ID: PAT-11 (Akses Ilegal Data Customer Lain)**
- **Skenario:** Customer A mencoba membayar booking milik Customer B
- **Prioritas:** Critical (Security)
- **Pengetahuan Internal (Gray-Box):** `BookingController::pay()` memiliki pengecekan:
  ```php
  if ((int) $booking->customer_id !== (int) $request->user()->id) {
      return response()->json(['message' => 'Tidak diizinkan.'], 403);
  }
  ```
- **Test Steps:**
  1. Login sebagai Customer A, dapatkan token → `token_A`
  2. Temukan id booking milik Customer B (contoh: id=5)
  3. Kirim via Postman:
     ```
     POST {{BASE_URL}}/api/bookings/5/pay
     Authorization: Bearer {{token_A}}
     Body: {"payment_type": "dp30"}
     ```
  4. Amati response
- **Expected:** HTTP 403, pesan "Tidak diizinkan." — tidak ada Snap Token ter-generate
- **Actual:** [ISI]
- **Status:** [ISI]
- 📷 **SS-41:** Postman — token_A mencoba akses booking milik Customer B → response 403
- 📷 **SS-42:** Tabel payments di database (tidak ada record baru)

### 5.5 Catatan Eksplorasi Bebas (Exploratory Notes)

| Tanggal/Waktu | Langkah yang Dilakukan | Hasil Tak Terduga | Severity |
|--------------|----------------------|------------------|----------|
| [ISI] | [ISI, contoh: "Mencoba membayar DP, lalu refresh halaman tepat saat popup Snap terbuka"] | [ISI, contoh: "Popup tertutup paksa, tidak ada error message; booking tetap waiting_dp"] | [ISI] |
| [ISI] | [ISI] | [ISI] | [ISI] |
| [ISI] | [ISI] | [ISI] | [ISI] |

📷 **SS-51:** Screenshot setiap temuan eksplorasi bebas (minimal 2-3 screenshot)

---

## BAB VI — REKAPITULASI DAN KESIMPULAN

### 6.1 Rekapitulasi Hasil Pengujian per Metode

| Metode | Jumlah TC | Pass | Fail | Belum Diuji |
|--------|-----------|------|------|-------------|
| Orthogonal Array Testing (OAT) | 9 | [ISI] | [ISI] | [ISI] |
| Matrix Testing | 9 | [ISI] | [ISI] | [ISI] |
| Regression Testing | 11 | [ISI] | [ISI] | [ISI] |
| Pattern (Exploratory) Testing | 15 + eksplorasi bebas | [ISI] | [ISI] | [ISI] |
| **Total** | **44** | [ISI] | [ISI] | [ISI] |

### 6.2 Perbandingan Efisiensi Antar Metode

| Metode | Kombinasi Full (tanpa teknik) | TC Dipakai | Penghematan |
|--------|------------------------------|-----------|-------------|
| OAT | 81 (3⁴) | 9 | **88,9%** |
| Matrix | 27 (3×3×3) | 9 | **66,7%** |
| Regression | — (berbasis cakupan fungsi) | 11 | — |
| Pattern | — (eksploratif) | 15+ | — |

### 6.3 Temuan Utama

1. **(OAT)** Validasi `jumlah_tamu` tidak konsisten antara frontend dan backend — `BookingController::store()` tidak memvalidasi batas tamu per tier, sehingga bisa di-bypass lewat API langsung
2. **(Matrix)** Kategori vendor yang tidak terdaftar mengembalikan [ISI berdasarkan hasil aktual MTX-05]
3. **(Regression)** Perbaikan bug `$dateExists` berhasil membuat tanggal yang booking-nya di-cancel bisa dibooking ulang — fungsi lain tidak terdampak
4. **(Pattern)** Ketergantungan pada dua jalur konfirmasi pembayaran (`confirmPayment()` dan webhook `midtransNotify()`) yang tidak saling berkoordinasi — berisiko booking macet bila koneksi customer terputus dan webhook tidak terkonfigurasi
5. **(Pattern - Security)** Proteksi `customer_id` pada endpoint payment sudah ada, perlu diverifikasi apakah konsisten di semua endpoint terkait

### 6.4 Rekomendasi Perbaikan

| Prioritas | Temuan | Rekomendasi |
|-----------|--------|------------|
| Tinggi | Bypass validasi `jumlah_tamu` via API | Tambahkan validasi `jumlah_tamu` sesuai tier di `BookingController::store()` |
| Sedang | Race condition booking tanggal sama | Gunakan `DB::transaction()` + `lockForUpdate()` pada pengecekan `$dateExists` |
| Sedang | Ketergantungan webhook pembayaran | Tambahkan scheduled job untuk reconciliation status payment secara berkala |
| Rendah | Webhook Midtrans perlu verifikasi signature | Pastikan `midtransNotify()` memverifikasi Midtrans signature sebelum update status |

---

## Daftar Pustaka
- Priyaungga, A., dkk. (2020). *[Judul Asli Buku]*. [Penerbit].
- Destiningrum, M., & Adrian, Q. J. (2017). *[Judul Asli Buku]*. [Penerbit].
- Suprihadi, D. (2025). Gray Box Testing — Pertemuan 12, Software Quality. T. Informatika - UKRI.
- Dokumentasi Resmi Laravel 11: https://laravel.com/docs/11.x
- Dokumentasi Midtrans Snap API: https://docs.midtrans.com
