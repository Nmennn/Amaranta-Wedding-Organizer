# GRAY-BOX TESTING
## Aplikasi AMARANTA — Wedding Organizer Web Application

> **Mata Kuliah:** Software Quality  
> **Dosen:** Deni Suprihadi, S.T, M.KOM., MCE.

---

## Daftar Isi

- [Definisi Gray-Box Testing](#definisi-gray-box-testing)
- [Deskripsi Aplikasi](#deskripsi-aplikasi-yang-diuji)
- [Mengapa Disebut Gray-Box?](#mengapa-disebut-gray-box)
- [Ruang Lingkup Pengujian](#ruang-lingkup-pengujian)
- [BAB II — Orthogonal Array Testing (OAT)](#bab-ii--orthogonal-array-testing-oat)
- [BAB III — Matrix Testing](#bab-iii--matrix-testing)
- [BAB IV — Regression Testing](#bab-iv--regression-testing)
- [BAB V — Pattern (Exploratory) Testing](#bab-v--pattern-exploratory-testing)
- [BAB VI — Rekapitulasi dan Kesimpulan](#bab-vi--rekapitulasi-dan-kesimpulan)
- [Daftar Pustaka](#daftar-pustaka)

---

## Definisi Gray-Box Testing

**Gray-Box Testing** adalah metode yang menggabungkan teknik Black-Box dan White-Box Testing. Tester tidak menguji baris kode satu per satu (seperti White Box murni), tetapi juga tidak buta total terhadap sistem (seperti Black Box murni). Tester memanfaatkan **pengetahuan terbatas tentang struktur internal** — misalnya skema database, isi fungsi validasi, atau alur logika controller — untuk merancang kasus uji input-output yang lebih terarah.

---

## Deskripsi Aplikasi yang Diuji

**AMARANTA** adalah aplikasi web Wedding Organizer berbasis:

| Komponen | Teknologi |
|---|---|
| Frontend | React + Vite (Node.js) |
| Backend | Laravel 11, PHP 8.2, MySQL |
| Payment Gateway | Midtrans Snap (mode Sandbox) |

---

## Mengapa Disebut Gray-Box?

| Bab / Metode | Pengetahuan Internal (sisi White Box) | Cara Diuji dari Luar (sisi Black Box) |
|---|---|---|
| OAT | Tester membaca kode `TAMU_CONFIG` di frontend dan tahu `BookingController::store()` tidak memvalidasi `jumlah_tamu` | Tester mengirim kombinasi input lewat form (dan langsung ke API) untuk membuktikan bypass |
| Matrix | Tester membaca isi `match($sort)` pada `VendorController::index()` dan tahu persis nilai apa yang dikenali | Tester mengirim kombinasi parameter `category/search/sort` lewat HTTP dan mengamati JSON |
| Regression | Tester membandingkan kode sebelum & sesudah perubahan `$dateExists` — info hanya ada di tim pengembang | Tester mengeksekusi skenario booking dari sisi pengguna |
| Pattern | Tester tahu ada dua jalur konfirmasi berbeda (`confirmPayment()` vs `midtransNotify()` webhook) | Tester mengeksplorasi alur pembayaran dari sisi pengguna |

---

## Ruang Lingkup Pengujian

| Komponen | File / Endpoint |
|---|---|
| Frontend — Form Booking | `client/src/pages/public/BookingForm.jsx` |
| Frontend — Pencarian Vendor | `client/src/pages/public/Search.jsx`, `VendorList.jsx` |
| Backend — Booking Controller | `server/app/Http/Controllers/BookingController.php` |
| Backend — Vendor Controller | `server/app/Http/Controllers/VendorController.php` |
| Backend — Payment (Midtrans) | `pay()`, `payRemaining()`, `confirmPayment()`, `midtransNotify()` |

---

## BAB II — Orthogonal Array Testing (OAT)

### 2.1 Objek Uji

Form Pemesanan Paket (`BookingForm.jsx` → `BookingController::store()`).

OAT dipilih karena form pemesanan AMARANTA memiliki **4 variabel independen** yang saling memengaruhi validitas pemesanan. Menguji semua kombinasi penuh = **81 kombinasi (3⁴)**. OAT memungkinkan cakupan representatif dengan hanya **9 kasus uji** (penghematan **88,9%**).

> **Pengetahuan Internal Gray-Box:** Kode `TAMU_CONFIG` pada `BookingForm.jsx` memvalidasi batas tamu di frontend saja. `BookingController::store()` di backend **tidak memiliki rule validasi untuk `jumlah_tamu`** — field itu hanya digabung ke `notes`. Inilah yang mendasari OAT-06 dan OAT-09.

### 2.2 Identifikasi Faktor dan Level

| Faktor | Level 1 | Level 2 | Level 3 |
|---|---|---|---|
| A. Tier Paket | Silver | Gold | Platinum |
| B. Jumlah Tamu | Di bawah minimum tier | Dalam rentang valid tier | Di atas maksimum tier |
| C. Tanggal Pernikahan | Tanggal valid (masa depan, belum terpakai) | Tanggal sudah dipesan (`$dateExists = true`) | Tanggal tidak valid (hari ini / masa lalu) |
| D. Kelengkapan Data | Semua field lengkap dan valid | Salah satu field kosong | Format salah (email tanpa `@`, phone tidak diawali `08`) |

**Acuan nilai konkret per level (Faktor B — Jumlah Tamu):**

| Tier | Min | Max | Level Bawah (invalid) | Level Dalam Rentang (valid) | Level Atas (invalid) |
|---|---|---|---|---|---|
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
|---|---|---|---|---|
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

---

#### OAT-01 — Silver + Tamu Bawah Minimum + Tanggal Valid + Data Lengkap

| Field | Detail |
|---|---|
| **Prioritas** | High |
| **Skenario** | Silver + Tamu di bawah minimum + Tanggal valid + Data lengkap |
| **Precondition** | Login sebagai customer, buka form paket Silver |
| **Test Steps** | 1. Isi tier: Silver<br>2. Isi `jumlah_tamu`: 30 (di bawah minimum 50)<br>3. Isi tanggal: `2026-12-25`<br>4. Isi semua data pemesan: nama, email, HP valid<br>5. Klik "Konfirmasi & Pesan Sekarang" |
| **Test Data** | `{tier: silver, jumlah_tamu: 30, wedding_date: 2026-12-25, data: lengkap}` |
| **Expected Output** | Error: "Jumlah tamu minimal 50 orang untuk paket Silver" — form ditolak |
| **Actual Output** | Frontend menampilkan pesan error validasi tamu minimal 50. Form tidak dapat di-submit. Validasi frontend berjalan sesuai `TAMU_CONFIG`. |
| **Status** | Pass |

---

#### OAT-02 — Silver + Tamu Dalam Rentang + Tanggal Dipesan + Data Kosong

| Field | Detail |
|---|---|
| **Prioritas** | High |
| **Skenario** | Silver + Tamu dalam rentang + Tanggal sudah dipesan + Salah satu field kosong |
| **Test Data** | `{tier: silver, jumlah_tamu: 80, wedding_date: [tanggal sudah booking], bride_name: ''}` |
| **Expected Output** | HTTP 422: Error tanggal sudah dipesan DAN field wajib kosong |
| **Actual Output** | HTTP 422 — Response mengembalikan dua pesan validasi: `"Tanggal pernikahan sudah dipesan"` dan `"Nama pengantin wajib diisi"`. |
| **Status** | Pass |

---

#### OAT-03 — Silver + Tamu Atas Maksimum + Tanggal Invalid + Format Salah

| Field | Detail |
|---|---|
| **Prioritas** | Medium |
| **Skenario** | Silver + Tamu di atas maksimum + Tanggal masa lalu + Format data salah |
| **Test Data** | `{tier: silver, jumlah_tamu: 150, wedding_date: 2024-01-01, email: 'usertest', phone: '123'}` |
| **Expected Output** | Multiple error: format email, format phone, tanggal harus masa depan |
| **Actual Output** | HTTP 422 — Backend mengembalikan multiple validation errors: email tidak valid, nomor HP tidak valid, tanggal harus di masa depan. Frontend juga memblokir submit karena format email. |
| **Status** | Pass |

---

#### OAT-04 — Gold + Tamu Bawah Minimum + Tanggal Dipesan + Format Salah

| Field | Detail |
|---|---|
| **Prioritas** | High |
| **Skenario** | Gold + Tamu di bawah minimum + Tanggal sudah dipesan + Format data salah |
| **Test Data** | `{tier: gold, jumlah_tamu: 50, wedding_date: [tanggal aktif], email: 'invalid', phone: '0812345'}` |
| **Expected Output** | Error: tanggal sudah dipesan + format data tidak valid |
| **Actual Output** | HTTP 422 — Response: `"Tanggal pernikahan sudah dipesan"`, `"Format email tidak valid"`. Jumlah tamu 50 (di bawah min Gold 100) **tidak tervalidasi backend** — hanya frontend yang memblokir. |
| **Status** | Fail (Partial) — Validasi tamu tidak ada di backend |

---

#### OAT-05 — Gold + Tamu Dalam Rentang + Tanggal Invalid + Data Lengkap

| Field | Detail |
|---|---|
| **Prioritas** | Medium |
| **Skenario** | Gold + Tamu dalam rentang + Tanggal masa lalu + Data lengkap |
| **Test Data** | `{tier: gold, jumlah_tamu: 150, wedding_date: 2023-06-15, data: lengkap}` |
| **Expected Output** | HTTP 422: Tanggal harus di masa depan |
| **Actual Output** | HTTP 422 — `"The wedding date must be a date after today."` Semua field lain valid, hanya tanggal yang ditolak. |
| **Status** | Pass |

---

#### OAT-06 — Gold + Tamu Atas Maksimum + Tanggal Valid + Data Kosong KRITIS

| Field | Detail |
|---|---|
| **Prioritas** | CRITICAL |
| **Skenario** | Gold + Tamu di atas maksimum + Tanggal valid + Data ada yang kosong **(bypass via API)** |
| **Precondition** | Punya token autentikasi valid (login sebagai customer) |
| **Test Steps** | 1. Buka Postman, kirim `POST /api/bookings`<br>2. Header: `Authorization: Bearer {{token}}`<br>3. Body: `{"package_id": 2, "wedding_date": "2026-11-20", "groom_name": "Ahmad", "bride_name": "Siti", "notes": "250 orang tamu"}`<br>4. Amati response<br>5. Verifikasi data di database (tabel `bookings`) |
| **Test Data** | `jumlah_tamu: 250` untuk tier Gold (maksimum 200) — dikirim via API langsung |
| **Expected Output** | HTTP 422 — jumlah tamu melebihi batas maksimum tier Gold (200 orang) |
| **Actual Output** | **HTTP 201** — Booking berhasil dibuat. Data tersimpan di tabel `bookings` dengan `notes: "250 orang tamu"`. Backend **TIDAK** memvalidasi batas tamu per tier. Bypass frontend berhasil dilakukan via Postman. |
| **Status** | Fail — **Bug Teridentifikasi:** Tidak ada validasi `jumlah_tamu` di `BookingController::store()` |

---

#### OAT-07 — Platinum + Tamu Bawah Minimum + Tanggal Invalid + Data Kosong

| Field | Detail |
|---|---|
| **Prioritas** | Medium |
| **Skenario** | Platinum + Tamu bawah minimum + Tanggal masa lalu + Data kosong |
| **Test Data** | `{tier: platinum, jumlah_tamu: 100, wedding_date: 2024-03-10, groom_name: '', bride_name: ''}` |
| **Expected Output** | Multiple error: tanggal tidak valid, field wajib kosong |
| **Actual Output** | HTTP 422 — Backend mengembalikan: `"wedding date must be after today"`, `"groom name is required"`, `"bride name is required"`. Multiple error terdeteksi dengan benar. |
| **Status** | Pass |

---

#### OAT-08 — Platinum + Tamu Dalam Rentang + Tanggal Valid + Format Salah

| Field | Detail |
|---|---|
| **Prioritas** | Medium |
| **Skenario** | Platinum + Tamu dalam rentang + Tanggal valid + Format data salah |
| **Test Data** | `{tier: platinum, jumlah_tamu: 300, wedding_date: 2026-12-25, email: 'testtestcom', phone: '812345678'}` |
| **Expected Output** | HTTP 422: Format email tidak valid, format nomor HP tidak valid |
| **Actual Output** | HTTP 422 — `"The email field must be a valid email address."` dan `"The phone field format is invalid."` Validasi format berjalan dengan baik di backend. |
| **Status** | Pass |

---

#### OAT-09 — Platinum + Tamu Atas Maksimum + Tanggal Dipesan + Data Lengkap

| Field | Detail |
|---|---|
| **Prioritas** | High |
| **Skenario** | Platinum + Tamu di atas maksimum + Tanggal sudah dipesan + Data lengkap |
| **Test Data** | `{tier: platinum, jumlah_tamu: 600, wedding_date: [tanggal aktif], data: lengkap}` |
| **Expected Output** | Error: tanggal sudah dipesan (validasi tamu tidak ada di backend) |
| **Actual Output** | HTTP 422 — `"Tanggal pernikahan sudah dipesan."` Booking ditolak karena konflik tanggal. Namun jumlah tamu 600 (di atas max 500) tidak menghasilkan error dari backend — konsisten dengan temuan OAT-06. |
| **Status** | Fail (Partial) — Validasi tanggal Pass, validasi tamu backend Fail |

---

### 2.6 Tabel Ringkas Eksekusi OAT

| ID | A (Tier) | B (Tamu) | C (Tanggal) | D (Data) | Expected | Actual | Status |
|---|---|---|---|---|---|---|---|
| OAT-01 | Silver | Bawah (30) | Valid | Lengkap | Error: tamu kurang | Frontend error, form ditolak | Pass |
| OAT-02 | Silver | Dalam (80) | Dipesan | Kosong | Error: tgl & data kosong | HTTP 422: dua pesan validasi | Pass |
| OAT-03 | Silver | Atas (150) | Invalid | Format salah | Multiple error | HTTP 422: multiple error | Pass |
| OAT-04 | Gold | Bawah (50) | Dipesan | Format salah | Error: tanggal & tamu | HTTP 422: tanggal & format, tamu tidak divalidasi backend | Fail (Partial) |
| OAT-05 | Gold | Dalam (150) | Invalid | Lengkap | Error: tanggal masa lalu | HTTP 422: tanggal masa lalu | Pass |
| OAT-06 | Gold | Atas (250) | Valid | Kosong | Error: tamu melebihi batas | HTTP 201: booking berhasil dibuat (bypass) | Fail |
| OAT-07 | Platinum | Bawah (100) | Invalid | Kosong | Multiple error | HTTP 422: multiple error | Pass |
| OAT-08 | Platinum | Dalam (300) | Valid | Format salah | Error: format data | HTTP 422: format email & HP | Pass |
| OAT-09 | Platinum | Atas (600) | Dipesan | Lengkap | Error: tanggal & tamu | HTTP 422: tanggal, tamu tidak divalidasi backend | Fail (Partial) |

---

## BAB III — Matrix Testing

### 3.1 Objek Uji: Filter Pencarian Vendor (`VendorController::index()`)

> **Pengetahuan Internal Gray-Box:** Tester membaca isi `match($sort)` pada `VendorController::index()` dan tahu persis nilai apa saja yang dikenali sistem (`price_asc`, `price_desc`, `newest`) serta apa yang terjadi bila nilai lain dikirim (default: tanpa sort spesifik).

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

**Identifikasi Variabel:**
- **Variabel 1 — Category (3 nilai):** `wedding`, `photography`, `catering`
- **Variabel 2 — Sort (3 nilai):** `price_asc`, `price_desc`, `newest`
- **Variabel 3 — Search Keyword (3 nilai):** Ada keyword valid, Keyword tidak ada hasilnya, Kosong

| | |
|---|---|
| **Kombinasi Penuh** | 3 × 3 × 3 = **27 kombinasi** |
| **Kombinasi Matrix** | **9 uji** |
| **Penghematan** | **66,7%** |

### 3.2 Tabel Matrix Testing

| ID | Category | Sort | Search | Expected | Actual Output | Status |
|---|---|---|---|---|---|---|
| MTX-01 | `wedding` | `price_asc` | (kosong) | Vendor wedding, urut harga naik | HTTP 200 — Array vendor kategori wedding terurut ascending berdasarkan kolom `price`. | Pass |
| MTX-02 | `wedding` | `price_desc` | `"Elegan"` | Vendor wedding keyword Elegan, urut harga turun | HTTP 200 — 2 vendor wedding mengandung kata "Elegan", terurut harga tertinggi ke terendah. | Pass |
| MTX-03 | `wedding` | `newest` | `"xyz999"` | Vendor wedding keyword xyz999 → 0 hasil | HTTP 200 — `{data: [], total: 0}`. Keyword tidak cocok dengan vendor manapun. | Pass |
| MTX-04 | `photography` | `price_asc` | `"Elegan"` | Vendor photography keyword Elegan, harga naik | HTTP 200 — 1 vendor photography ditemukan, terurut harga naik. | Pass |
| MTX-05 | `tidakada` | `price_desc` | (kosong) | Error atau 0 hasil (kategori tidak ada) | HTTP 200 — `{data: [], total: 0}`. Backend tidak melempar error, array kosong dikembalikan. | Pass |
| MTX-06 | `photography` | `newest` | (kosong) | Vendor photography, urut terbaru | HTTP 200 — Seluruh vendor photography diurutkan `created_at` descending. | Pass |
| MTX-07 | `catering` | `price_asc` | `"xyz999"` | Vendor catering keyword xyz999 → 0 hasil | HTTP 200 — `{data: [], total: 0}`. Tidak ada vendor catering dengan nama "xyz999". | Pass |
| MTX-08 | `catering` | `xyz` (invalid) | `"Elegan"` | Default sort (tanpa urutan spesifik) | HTTP 200 — `match()` block default dieksekusi. Hasil tanpa `orderBy`, urutan natural database. | Pass |
| MTX-09 | `catering` | `newest` | (kosong) | Vendor catering, urut terbaru | HTTP 200 — Seluruh vendor catering diurutkan `created_at` descending. | Pass |

### 3.3 Detail Test Case Kritis

---

#### MTX-05 — Kategori yang Tidak Ada di Sistem

| Field | Detail |
|---|---|
| **Endpoint** | `GET /api/vendors?category=tidakada&sort=price_desc` |
| **Expected** | HTTP 200 dengan data kosong `[]` atau HTTP 404 |
| **Actual Output** | HTTP 200 — Response body: `{"data": [], "total": 0, "per_page": 10}`. Backend mengembalikan koleksi kosong tanpa error. Perilaku aman dan konsisten. |
| **Status** | Pass |

---

#### MTX-08 — Nilai Sort Tidak Valid (`xyz`)

| Field | Detail |
|---|---|
| **Endpoint** | `GET /api/vendors?category=catering&sort=xyz&search=Elegan` |
| **Expected** | HTTP 200, hasil sorted dengan default (tidak ada sort spesifik) |
| **Actual Output** | HTTP 200 — `match($sort)` mengevaluasi nilai `"xyz"` ke blok `default`, query dieksekusi tanpa klausa `orderBy`. Hasil muncul dalam urutan natural database. Sesuai ekspektasi Gray-Box. |
| **Status** | Pass |

---

## BAB IV — Regression Testing

### 4.1 Latar Belakang

**Perubahan yang Diuji:** Tim pengembang mengubah logika pengecekan tanggal bentrok di `BookingController::store()`.

```php
// SEBELUM (kondisi lama):
$dateExists = Booking::where('wedding_date', $request->wedding_date)->exists();

// SESUDAH (kondisi baru — memperbaiki bug: booking cancelled tidak lagi memblokir tanggal):
$dateExists = Booking::where('wedding_date', $request->wedding_date)
                     ->where('status', '!=', 'cancelled')
                     ->exists();
```

**Tujuan Regression Testing:**
1. Memastikan perbaikan bug berjalan benar (tanggal yang di-cancel tidak lagi memblokir booking baru)
2. Memastikan tidak ada fungsi lama yang rusak akibat perubahan ini

### 4.2 Tabel Kasus Uji Regression Testing

| ID | Skenario | Tipe | Pre-condition | Expected | Actual Output | Status |
|---|---|---|---|---|---|---|
| REG-01 | Booking tanggal baru yang belum pernah dibooking | Fungsional dasar | DB bersih dari tanggal uji | HTTP 201: Booking berhasil | HTTP 201 — Booking berhasil dibuat. ID booking baru muncul di database dengan status `pending`. | Pass |
| REG-02 | Booking tanggal yang sudah aktif (status: `pending`) | Regression — tetap harus gagal | Ada booking aktif di tanggal yang sama | HTTP 422: Tanggal sudah dipesan | HTTP 422 — `"Tanggal pernikahan sudah dipesan."` `$dateExists = true` karena ada booking pending. | Pass |
| REG-03 | Booking tanggal yang sudah aktif (status: `confirmed`) | Regression | Ada booking confirmed di tanggal tersebut | HTTP 422: Tanggal sudah dipesan | HTTP 422 — Booking `confirmed` terdeteksi oleh kondisi baru, tanggal tetap diblokir. | Pass |
| REG-04 | Booking tanggal yang sudah aktif (status: `in_progress`) | Regression | Ada booking `in_progress` | HTTP 422: Tanggal sudah dipesan | HTTP 422 — Status `in_progress` diblokir oleh kondisi `$dateExists`. | Pass |
| REG-05 | Booking tanggal yang sudah aktif (status: `completed`) | Regression | Ada booking `completed` | HTTP 422: Tanggal sudah dipesan | HTTP 422 — Booking `completed` juga memblokir tanggal. Sesuai ekspektasi. | Pass |
| REG-06 | Booking form dengan data valid semua field | Fungsional dasar | Tanggal belum terpakai | HTTP 201: Booking berhasil | HTTP 201 — Semua validasi lolos. Booking berhasil dibuat dengan semua field lengkap dan benar. | Pass |
| REG-07 | Booking dengan field nama kosong | Validasi dasar | — | HTTP 422: Nama wajib diisi | HTTP 422 — `"The groom name field is required."` Validasi `required` berjalan normal. | Pass |
| REG-08 | Booking dengan tanggal masa lalu | Validasi dasar | — | HTTP 422: Tanggal harus masa depan | HTTP 422 — `"The wedding date must be a date after today."` Validasi tanggal berjalan normal. | Pass |
| REG-09 | Booking tanggal yang booking-nya sudah `CANCELLED` | **BUG FIX — Seharusnya BOLEH** | Ada booking `cancelled` di tanggal tersebut | HTTP 201: Booking berhasil | HTTP 201 — Booking berhasil! Kondisi baru `->where('status','!=','cancelled')` mengecualikan booking cancelled dari `$dateExists`. Bug fix terverifikasi. | Pass |
| REG-10 | Dua request booking tanggal sama secara bersamaan (race condition) | Edge case / Concurrent | — | Hanya 1 booking terbentuk | Dua booking terbentuk di database untuk tanggal yang sama. Race condition belum ditangani — tidak ada `DB::transaction() + lockForUpdate()`. | Fail |
| REG-11 | Cek endpoint lain yang tidak terdampak perubahan | Scope regression | — | Semua endpoint terkait masih normal | `GET /api/bookings`, `GET /api/bookings/{id}`, `PATCH /api/bookings/{id}/cancel` semua mengembalikan response normal. Tidak ada regresi pada endpoint lain. | Pass |

### 4.3 Detail Test Case Kritis

---

#### REG-09 — Bug Fix Verification 

| Field | Detail |
|---|---|
| **Prioritas** | Critical |
| **Skenario** | Booking tanggal yang sebelumnya dibooking tapi kemudian di-cancel |
| **Test Steps** | 1. Booking A dibuat untuk tanggal `2026-12-25` (status: `pending`)<br>2. Booking A dibatalkan → status berubah ke `cancelled`<br>3. Customer B mencoba booking tanggal yang sama: `2026-12-25`<br>4. Amati response |
| **Expected (setelah perbaikan)** | HTTP 201 — Booking B berhasil dibuat |
| **Expected (sebelum perbaikan)** | HTTP 422 — Tanggal sudah dipesan (bug lama) |
| **Actual Output** | HTTP 201 — `{"message": "Booking berhasil dibuat", "data": {"id": 47, "wedding_date": "2026-12-25", "status": "pending"}}`. Perbaikan bug `$dateExists` berfungsi dengan benar. |
| **Status** | Pass — Bug Fix Terverifikasi |

---

#### REG-10 — Race Condition 

| Field | Detail |
|---|---|
| **Prioritas** | High |
| **Skenario** | Dua user booking tanggal sama secara bersamaan |
| **Test Steps** | 1. Siapkan dua token customer berbeda<br>2. Kirim dua request secara bersamaan via `curl` parallel:<br>`curl -X POST .../api/bookings -d '{"wedding_date":"2026-12-25",...}' &`<br>`curl -X POST .../api/bookings -d '{"wedding_date":"2026-12-25",...}' &`<br>3. Cek jumlah booking di database |
| **Expected** | Hanya 1 booking berhasil, 1 mendapat HTTP 422 |
| **Actual Output** | Dua booking berhasil terbentuk (HTTP 201 keduanya). `SELECT COUNT(*)` mengembalikan 2 baris untuk `wedding_date` yang sama. Race condition terkonfirmasi — tidak ada mekanisme locking pada pengecekan `$dateExists`. |
| **Status** | Fail — Race Condition Belum Ditangani |

---

## BAB V — Pattern (Exploratory) Testing

### 5.1 Objek Uji: Alur Pembayaran AMARANTA (Midtrans Snap)

> **Pengetahuan Internal Gray-Box:** Tester tahu bahwa ada dua jalur konfirmasi pembayaran berbeda:
> 1. `confirmPayment()` — konfirmasi manual oleh customer (klik tombol di UI)
> 2. `midtransNotify()` — webhook otomatis dari server Midtrans
>
> Detail arsitektur ini tidak terlihat di UI sama sekali — inilah esensi Gray-Box pada Pattern Testing.

### 5.2 Skenario Fungsional Dasar (PAT-01 s.d. PAT-04)

| ID | Skenario | Steps | Expected | Actual Output | Status |
|---|---|---|---|---|---|
| PAT-01 | Alur DP normal — buka Snap, bayar, konfirmasi | Login → Klik bayar DP → Snap popup → Bayar → Konfirmasi | Status: `waiting_dp`, DP recorded | Snap popup berhasil muncul. Setelah pembayaran dengan kartu test Midtrans sandbox, status booking berubah menjadi `waiting_dp` dan record payment DP tersimpan di tabel `payments`. | Pass |
| PAT-02 | Alur pelunasan normal | Status `confirmed` → Klik bayar sisa → Snap → Bayar → Konfirmasi | Status: `completed`, full payment | Dari status `confirmed`, endpoint `payRemaining()` membuka Snap baru. Setelah pelunasan, status booking berubah menjadi `completed` dan payment pelunasan tercatat. | Pass |
| PAT-03 | Batal di tengah Snap popup | Buka Snap → Klik "Kembali/Batal" di popup | Status tetap `pending`/`waiting_dp` | Klik tombol "Kembali" di Snap popup menutup modal. Status booking tidak berubah — tetap di status sebelumnya. Tidak ada payment record yang terbentuk. | Pass |
| PAT-04 | Bayar ulang setelah gagal | Buka Snap → Tutup → Buka lagi → Bayar | Snap token baru di-generate, pembayaran berhasil | Request ulang ke endpoint `pay()` menghasilkan Snap token baru dari Midtrans. Pembayaran kedua berhasil diproses dan status booking terupdate. | Pass |

### 5.3 Skenario Eksplorasi (PAT-05 s.d. PAT-15)

| ID | Skenario | Insight Gray-Box | Expected | Actual Output | Status |
|---|---|---|---|---|---|
| PAT-05 | Coba bayar DP dua kali (double payment) | `confirmPayment()` tidak cek duplikasi? | Pembayaran kedua ditolak | Request kedua ke `pay()` menghasilkan Snap token baru. Setelah pembayaran kedua berhasil, sistem menyimpan dua record payment dengan `type='dp30'`. Tidak ada pengecekan duplikasi. | Fail |
| PAT-06 | Koneksi terputus setelah bayar di Snap, sebelum klik konfirmasi | Ada dua jalur: manual vs webhook. Jika webhook tidak aktif, status macet | Status di-update via webhook Midtrans | Saat offline: status tetap `pending`. Setelah webhook manual dikirim via Postman: status berubah ke `waiting_dp`. Bergantung pada konfigurasi webhook Midtrans. | Pass (bergantung webhook aktif) |
| PAT-07 | Bayar pelunasan saat status masih `waiting_dp` | `payRemaining()` cek status dulu? | Error: status harus `confirmed` dulu | HTTP 422 — `"Pembayaran sisa hanya dapat dilakukan setelah booking dikonfirmasi."` `payRemaining()` mengecek status booking sebelum memproses. | Pass |
| PAT-08 | Bayar DP untuk booking yang sudah `cancelled` | `pay()` cek status booking dulu? | Error: booking sudah dibatalkan | HTTP 422 — `"Booking sudah dibatalkan."` `pay()` mengecek `status != 'cancelled'` sebelum generate Snap token. | Pass |
| PAT-09 | Bayar dengan nominal berbeda dari yang seharusnya | Apakah nominal diambil dari DB atau dikirim client? | Nominal dari DB (tidak bisa manipulasi) | Nominal pembayaran diambil dari kolom `price` di tabel `packages`, bukan dari request body client. Manipulasi nominal via Postman diabaikan — amount selalu dari server. | Pass |
| PAT-10 | Webhook Midtrans diterima setelah status booking berubah | `midtransNotify()` idempotent? | Tidak ada double update/error | Webhook dikirim dua kali (simulasi retry Midtrans). Status tidak berubah ganda — `midtransNotify()` mengecek status sebelum update. Idempotent. | Pass |
| PAT-11 | Akses endpoint pembayaran milik customer lain | `pay()` ada cek `customer_id` vs `user id` | HTTP 403: Tidak diizinkan | HTTP 403 — `{"message": "Tidak diizinkan."}`. Pengecekan `customer_id === user->id` berfungsi. Tidak ada Snap token ter-generate untuk booking milik customer lain. | Pass |
| PAT-12 | Simulasi webhook palsu (tanpa signature Midtrans) | `midtransNotify()` verifikasi signature? | HTTP 400/403: Signature tidak valid | HTTP 400 — `"Invalid notification signature."` `midtransNotify()` memverifikasi hash SHA-512 sebelum memproses update. Webhook palsu ditolak. | Pass |
| PAT-13 | Bayar DP saat vendor sudah tidak aktif | Tidak ada cek status vendor di `pay()`? | Seharusnya ditolak atau ada warning | HTTP 201 — Snap token berhasil dibuat meski status vendor di tabel `vendors = 'inactive'`. Tidak ada pengecekan status vendor di `pay()`. Potensi pemesanan vendor tidak aktif. | Fail |
| PAT-14 | Coba akses halaman pembayaran tanpa login | Middleware `auth`? | Redirect ke login / HTTP 401 | HTTP 401 — `{"message": "Unauthenticated."}`. Middleware `auth:sanctum` memblokir akses tanpa Bearer token. | Pass |
| PAT-15 | Multiple tab — bayar dari dua tab berbeda bersamaan | Race condition pada `payments` table? | Hanya 1 payment tercatat | Dua Snap token berhasil dibuat dari dua tab berbeda. Keduanya dapat dibayar dan menghasilkan dua record payment di tabel `payments`. Race condition pada `payments` table terkonfirmasi. | Fail |

### 5.4 Detail Test Case Kritis

---

#### PAT-06 — Koneksi Terputus

| Field | Detail |
|---|---|
| **Prioritas** | High |
| **Pengetahuan Internal (Gray-Box)** | Ada dua jalur: `confirmPayment()` manual dan `midtransNotify()` webhook. Jika koneksi terputus, `confirmPayment()` tidak bisa dipanggil. Status bergantung pada webhook Midtrans. |
| **Test Steps** | 1. Login sebagai customer, buka halaman bayar DP<br>2. Klik "Bayar DP" → Snap popup muncul<br>3. Lakukan pembayaran di Snap (gunakan kartu test Midtrans sandbox)<br>4. Setelah Snap menunjukkan "Pembayaran Berhasil", putuskan koneksi internet (DevTools → Network → Offline)<br>5. Amati status booking<br>6. Pulihkan koneksi, simulasi webhook manual via Postman:<br>`POST /api/payments/midtrans/notify` — Body: `{Midtrans webhook payload dengan status "settlement"}`<br>7. Cek status booking di database |
| **Expected** | Webhook Midtrans mengupdate status menjadi `waiting_dp` |
| **Actual Output** | Saat offline: status tetap `pending` (`confirmPayment()` tidak terpanggil). Setelah webhook manual dikirim: status berubah menjadi `waiting_dp` dan payment record terbentuk. Sistem bergantung penuh pada webhook Midtrans untuk skenario ini. |
| **Status** | Pass (dengan catatan: bergantung konfigurasi webhook Midtrans di dashboard) |

---

#### PAT-11 — Akses Ilegal Data Customer Lain 

| Field | Detail |
|---|---|
| **Prioritas** | Critical (Security) |
| **Pengetahuan Internal (Gray-Box)** | `BookingController::pay()` memiliki pengecekan: `if ((int) $booking->customer_id !== (int) $request->user()->id) { return response()->json(['message' => 'Tidak diizinkan.'], 403); }` |
| **Test Steps** | 1. Login sebagai Customer A → dapatkan `token_A`<br>2. Temukan `id` booking milik Customer B (contoh: `id=5`)<br>3. Kirim via Postman: `POST /api/bookings/5/pay` dengan `Authorization: Bearer {{token_A}}`<br>4. Amati response |
| **Expected** | HTTP 403 — pesan `"Tidak diizinkan."` — tidak ada Snap Token ter-generate |
| **Actual Output** | HTTP 403 — `{"message": "Tidak diizinkan."}`. Tidak ada record baru di tabel `payments`. Pengecekan `customer_id` berjalan dengan benar. |
| **Status** | Pass — Proteksi Security Berfungsi |

---

### 5.5 Catatan Eksplorasi Bebas

| Tanggal/Waktu | Langkah yang Dilakukan | Hasil Tak Terduga | Severity |
|---|---|---|---|
| 2026-06-20 10:15 | Membayar DP, lalu refresh halaman tepat saat popup Snap terbuka | Popup Snap tertutup paksa. Tidak ada error message di UI. Booking status tetap `pending` — tidak ada payment record terbentuk. Tombol "Bayar DP" dapat diklik lagi untuk membuka Snap baru. | Low |
| 2026-06-20 11:30 | Membatalkan booking yang sudah `confirmed` dari sisi admin, lalu customer mencoba melunasi | HTTP 422 — `"Booking tidak ditemukan atau sudah dibatalkan."` `payRemaining()` mendeteksi status `cancelled`. Konsisten. | Info |
| 2026-06-20 13:45 | Mencoba mengakses `/api/bookings/{id}` dengan id yang sangat besar (`id=99999`) | HTTP 404 — `"Booking tidak ditemukan."` Laravel model binding mengembalikan 404 secara otomatis. Tidak ada stack trace yang terekspos. | Info |

---

## BAB VI — Rekapitulasi dan Kesimpulan

### 6.1 Rekapitulasi Hasil Pengujian per Metode

| Metode | Jumlah TC | Pass | Fail | Belum Diuji |
|---|---|---|---|---|
| Orthogonal Array Testing (OAT) | 9 | 6 | 3 | 0 |
| Matrix Testing | 9 | 9 | 0 | 0 |
| Regression Testing | 11 | 9 | 2 | 0 |
| Pattern (Exploratory) Testing | 15 + eksplorasi bebas | 11 | 3 | 0 |
| **Total** | **44** | **35** | **8** | **0** |

### 6.2 Perbandingan Efisiensi Antar Metode

| Metode | Kombinasi Full (tanpa teknik) | TC Dipakai | Penghematan |
|---|---|---|---|
| OAT | 81 (3⁴) | 9 | **88,9%** |
| Matrix | 27 (3×3×3) | 9 | **66,7%** |
| Regression | — (berbasis cakupan fungsi) | 11 | — |
| Pattern | — (eksploratif) | 15+ | — |

### 6.3 Temuan Utama

1. **(OAT — KRITIS)** Validasi `jumlah_tamu` tidak konsisten antara frontend dan backend — `BookingController::store()` tidak memvalidasi batas tamu per tier, sehingga bisa di-bypass lewat API langsung (terkonfirmasi OAT-06 dan OAT-09).

2. **(Matrix)** Kategori vendor yang tidak terdaftar mengembalikan HTTP 200 dengan array kosong `[]` — perilaku aman dan konsisten, tidak ada unhandled exception.

3. **(Regression)** Perbaikan bug `$dateExists` berhasil: tanggal booking yang di-cancel dapat dibooking ulang (REG-09 Pass). Tidak ada regresi pada fungsi lain.

4. **(Regression — KRITIS)** Race condition pada pengecekan tanggal belum ditangani — dua request bersamaan dapat menghasilkan dua booking di tanggal yang sama (REG-10 Fail).

5. **(Pattern — KRITIS)** Double payment (PAT-05) dan race condition multiple tab (PAT-15) menghasilkan duplikasi record payment — `confirmPayment()` tidak memiliki pengecekan idempotency.

6. **(Pattern)** Tidak ada pengecekan status vendor di `pay()` — customer dapat membayar DP untuk vendor tidak aktif (PAT-13 Fail).

7. **(Pattern — Security )** Proteksi `customer_id` pada endpoint payment sudah berfungsi (PAT-11 Pass). Signature webhook Midtrans terverifikasi (PAT-12 Pass).

### 6.4 Rekomendasi Perbaikan

| Prioritas | Temuan | Rekomendasi |
|---|---|---|
| Tinggi | Bypass validasi `jumlah_tamu` via API (OAT-06) | Tambahkan validasi `jumlah_tamu` sesuai tier di `BookingController::store()` menggunakan custom validation rule |
| Tinggi | Race condition booking tanggal sama (REG-10) | Gunakan `DB::transaction()` + `lockForUpdate()` pada pengecekan `$dateExists` |
| Tinggi | Double payment / race condition pembayaran (PAT-05, PAT-15) | Tambahkan `unique constraint` pada `(booking_id, payment_type)` di tabel `payments`, gunakan `DB::transaction()` di `confirmPayment()` |
| Sedang | Vendor tidak aktif dapat dibooking (PAT-13) | Tambahkan pengecekan `status vendor` di `BookingController::store()` dan `pay()` |
| Sedang | Ketergantungan webhook pembayaran (PAT-06) | Tambahkan scheduled job untuk reconciliation status payment secara berkala dengan Midtrans API |
| Rendah | Verifikasi signature webhook (PAT-12) | Sudah diimplementasikan — pastikan tetap ada saat deploy ke production dan lakukan test reguler |

---

## Daftar Pustaka

- Priyaungga, A., dkk. (2020). *Pengujian Perangkat Lunak: Metode dan Implementasi*. Informatika Bandung.
- Destiningrum, M., & Adrian, Q. J. (2017). *Sistem Informasi Penjadwalan Dokter*. Jurnal Teknoinfo, 11(2), 30–37.
- Suprihadi, D. (2025). *Gray Box Testing — Pertemuan 12, Software Quality*. T. Informatika - UKRI.
- Dokumentasi Resmi Laravel 11: https://laravel.com/docs/11.x
- Dokumentasi Midtrans Snap API: https://docs.midtrans.com
