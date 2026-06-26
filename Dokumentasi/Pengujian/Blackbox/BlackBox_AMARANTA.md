# BLACK-BOX TESTING
## Aplikasi AMARANTA — Wedding Organizer Web Application
### Mata Kuliah: Software Quality | Dosen: Deni Suprihadi, S.T, M.KOM., MCE.

---

## Definisi Black-Box Testing
Black-Box Testing adalah metode pengujian yang dilakukan **tanpa melihat kode internal**. Penguji hanya berfokus pada **input dan output** sistem, memeriksa apakah sistem bekerja sesuai spesifikasi. Seluruh kasus uji dirancang HANYA berdasarkan dokumentasi fitur, form yang terlihat di UI, dan perilaku API yang teramati — bukan dari membaca source code PHP/JS secara langsung.

---

## Deskripsi Aplikasi yang Diuji
**AMARANTA** adalah aplikasi web Wedding Organizer berbasis:
- **Frontend:** React + Vite (Node.js)
- **Backend:** Laravel 11, PHP 8.2, MySQL
- **Payment Gateway:** Midtrans Snap (mode Sandbox)

---

## Ruang Lingkup Pengujian Black-Box

| Komponen | File / Endpoint |
|----------|----------------|
| Frontend — Form Booking | `client/src/pages/public/BookingForm.jsx` |
| Frontend — Pemesanan Saya | `client/src/pages/customer/MyBookings.jsx` |
| Backend — Booking Controller | `server/app/Http/Controllers/BookingController.php` |
| Backend — Auth Controller (register) | `server/app/Http/Controllers/Auth/AuthController.php` |
| Backend — Model Booking (helper status) | `isDpPaid()`, `isFullPaid()`, `canAdminProcess()` |

---

## Metode Black-Box Testing yang Digunakan

### 1. Boundary Value Analysis (BVA)
### 2. Equivalence Partitioning (EP)
### 3. Decision Table Testing
### 4. Use Case Testing / State Transition Testing

---

## BAB II — BOUNDARY VALUE ANALYSIS (BVA)

### 2.1 Konsep BVA
BVA (Boundary Value Analysis) digunakan untuk melakukan validasi fungsionalitas sistem berdasarkan **nilai batas (boundary)**. BVA berasumsi bahwa kesalahan program paling sering terjadi tepat di sekitar nilai batas, bukan di tengah-tengah rentang nilai yang valid. BVA merupakan perluasan dari Equivalence Partitioning, dengan memasukkan nilai sedikit dari minimum dan kurang sedikit dari maksimum.

### 2.2 Objek Uji: Field Jumlah Tamu pada BookingForm.jsx

Field `jumlah_tamu` pada form pemesanan AMARANTA memiliki batas minimum dan maksimum berbeda untuk setiap tier paket, ditampilkan sebagai hint di form:
- "Kapasitas paket Silver: 50–100 tamu"
- "Kapasitas paket Gold: 100–200 tamu"
- "Kapasitas paket Platinum: 200–500 tamu"

**Equivalence Class untuk field `jumlah_tamu`:**
| No | Nama Field | Tipe Data | Batasan Data |
|----|-----------|-----------|-------------|
| 1 | jumlah_tamu (Silver) | Integer | 50 ≤ jumlah_tamu ≤ 100 |
| 2 | jumlah_tamu (Gold) | Integer | 100 ≤ jumlah_tamu ≤ 200 |
| 3 | jumlah_tamu (Platinum) | Integer | 200 ≤ jumlah_tamu ≤ 500 |

**Titik Boundary yang Diuji (Tier Silver):**
| No | Field | Boundary | Input Uji |
|----|-------|----------|-----------|
| 1 | jumlah_tamu Silver | Batas Bawah (BB=50) | 49, 50, 51 |
| 2 | jumlah_tamu Silver | Batas Atas (BA=100) | 99, 100, 101 |

### 2.3 Tabel Kasus Uji BVA

| No | ID | Input jumlah_tamu | Tier | Expected Output | Actual Output | Status |
|----|----|-------------------|------|----------------|---------------|--------|
| 1 | BVA-01 | 49 | Silver | Error: "Jumlah tamu minimal 50 orang untuk paket Silver" | [ISI] | [ISI] |
| 2 | BVA-02 | 50 | Silver | Valid ✓ (tepat di batas bawah) | [ISI] | [ISI] |
| 3 | BVA-03 | 51 | Silver | Valid ✓ (sedikit di atas batas bawah) | [ISI] | [ISI] |
| 4 | BVA-04 | 99 | Silver | Valid ✓ (sedikit di bawah batas atas) | [ISI] | [ISI] |
| 5 | BVA-05 | 100 | Silver | Valid ✓ (tepat di batas atas) | [ISI] | [ISI] |
| 6 | BVA-06 | 101 | Silver | Error: "Jumlah tamu maksimal 100 orang untuk paket Silver" | [ISI] | [ISI] |

### 2.4 Detail Test Case

**Test Case ID: BVA-01**
- **Nama:** Jumlah tamu 1 di bawah batas minimum tier Silver (49)
- **Prioritas:** High
- **Precondition:** User sudah login sebagai customer, berada di halaman `/pesan/silver` (BookingForm)
- **Test Steps:**
  1. Isi seluruh field wajib lain dengan data valid
  2. Isi field Jumlah Tamu dengan nilai **49**
  3. Klik tombol "Konfirmasi & Pesan Sekarang"
  4. Amati pesan validasi yang muncul
- **Test Data:** `jumlah_tamu = 49` (tier Silver, min seharusnya 50)
- **Expected Output:** Form menampilkan pesan error "Jumlah tamu minimal 50 orang untuk paket Silver." Submit gagal, data tidak terkirim
- **Actual Output:** [ISI]
- **Status:** [ISI: Pass/Fail]
- 📷 **SS-03:** Screenshot form dengan jumlah_tamu=49 dan pesan error

---

**Test Case ID: BVA-06**
- **Nama:** Jumlah tamu 1 di atas batas maksimum tier Silver (101)
- **Prioritas:** High
- **Precondition:** User sudah login sebagai customer, berada di halaman `/pesan/silver`
- **Test Steps:**
  1. Isi seluruh field wajib lain dengan data valid
  2. Isi field Jumlah Tamu dengan nilai **101**
  3. Klik tombol "Konfirmasi & Pesan Sekarang"
  4. Amati pesan validasi yang muncul
- **Test Data:** `jumlah_tamu = 101` (tier Silver, max seharusnya 100)
- **Expected Output:** Form menampilkan pesan error "Jumlah tamu maksimal 100 orang untuk paket Silver." Submit gagal
- **Actual Output:** [ISI]
- **Status:** [ISI: Pass/Fail]
- 📷 **SS-04:** Screenshot form dengan jumlah_tamu=101 dan pesan error

### 2.5 Kesimpulan Bab II
[ISI: (1) Dari 6 kasus uji BVA, [ISI] Pass dan [ISI] Fail. (2) Validasi batas jumlah tamu di frontend [ISI: berfungsi dengan baik / memiliki celah]. (3) Rekomendasi.]

---

## BAB III — EQUIVALENCE PARTITIONING (EP)

### 3.1 Konsep EP
Equivalence Partitioning digunakan untuk mencari seluruh kesalahan atau kehilangan dalam fungsi. Jika input merupakan range/kumpulan data, kasus ujinya adalah **satu benar (valid class) dan minimal dua tidak benar (invalid class)**.

### 3.2 Objek Uji: Field Email dan Nomor HP pada Form Register & Booking

**Partisi Kelas untuk Field Email:**
| Kelas | Deskripsi | Contoh Input |
|-------|-----------|-------------|
| Valid | Format email standar (ada @ dan domain) | `budi@gmail.com` |
| Invalid #1 | Tidak ada simbol @ | `budigmail.com` |
| Invalid #2 | Field dikosongkan | (kosong) |
| Invalid #3 | Email tanpa domain setelah @ | `budi@` |

**Partisi Kelas untuk Field Nomor HP:**
| Kelas | Deskripsi | Contoh Input |
|-------|-----------|-------------|
| Valid | Diawali 08, panjang 10-13 digit | `081234567890` |
| Invalid #1 | Tidak diawali 08 | `1234567890` |
| Invalid #2 | Mengandung huruf | `08123abc4567` |
| Invalid #3 | Terlalu pendek (< 10 digit) | `0812345` |
| Invalid #4 | Field dikosongkan | (kosong) |

### 3.3 Tabel Kasus Uji EP

| No | ID | Field | Input | Expected Output | Actual Output | Status |
|----|----|-------|-------|----------------|---------------|--------|
| 1 | EP-01 | Email | `budi@gmail.com` | Valid, diterima | [ISI] | [ISI] |
| 2 | EP-02 | Email | `budigmail.com` | Error: format email salah | [ISI] | [ISI] |
| 3 | EP-03 | Email | (kosong) | Error: field wajib diisi | [ISI] | [ISI] |
| 4 | EP-04 | Email | `budi@` | Error: format email salah | [ISI] | [ISI] |
| 5 | EP-05 | No. HP | `081234567890` | Valid, diterima | [ISI] | [ISI] |
| 6 | EP-06 | No. HP | `1234567890` | Error: format HP salah | [ISI] | [ISI] |
| 7 | EP-07 | No. HP | `08123abc4567` | Error: format HP salah | [ISI] | [ISI] |
| 8 | EP-08 | No. HP | `0812345` | Error: format HP salah | [ISI] | [ISI] |

### 3.4 Detail Test Case

**Test Case ID: EP-02**
- **Nama:** Input email tanpa simbol @ pada form pendaftaran
- **Prioritas:** High
- **Precondition:** Berada di halaman `/daftar` (Register.jsx), step 1
- **Test Steps:**
  1. Isi Nama Lengkap dengan data valid
  2. Isi Email dengan `budigmail.com` (tanpa @)
  3. Isi No. HP dan Password dengan data valid
  4. Klik "Daftar Sekarang"
- **Test Data:** `email = "budigmail.com"`
- **Expected Output:** Sistem menampilkan pesan "Format email tidak valid"
- **Actual Output:** [ISI]
- **Status:** [ISI]
- 📷 **SS-05:** Screenshot pesan error email tanpa @

**Test Case ID: EP-07**
- **Nama:** Input nomor HP mengandung huruf
- **Prioritas:** High
- **Precondition:** Berada di halaman form booking atau register
- **Test Steps:**
  1. Isi field No. HP dengan `08123abc4567`
  2. Klik submit
- **Test Data:** `phone = "08123abc4567"`
- **Expected Output:** Sistem menampilkan pesan "Nomor HP tidak valid"
- **Actual Output:** [ISI]
- **Status:** [ISI]
- 📷 **SS-06:** Screenshot pesan error nomor HP dengan huruf

### 3.5 Kesimpulan Bab III
[ISI: (1) Dari 8 kasus uji EP, [ISI] Pass dan [ISI] Fail. (2) Validasi email dan nomor HP [ISI]. (3) Rekomendasi.]

---

## BAB IV — DECISION TABLE TESTING

### 4.1 Objek Uji: Logika Persetujuan Admin pada Booking

Fitur booking AMARANTA memiliki logika alur status: **pending → confirmed → in_progress → completed**. Admin hanya dapat memproses booking jika kondisi tertentu terpenuhi.

**Kondisi:**
- C1: Status booking = `pending` atau `confirmed`
- C2: DP sudah dibayar (`isDpPaid()` = true)
- C3: Admin memiliki role admin
- C4: `canAdminProcess()` = true

**Aksi:**
- A1: Admin bisa ubah status booking
- A2: Admin tidak bisa proses (akses ditolak)

**Decision Table:**

| Rule | C1 (status valid) | C2 (DP paid) | C3 (admin) | C4 (canProcess) | Aksi |
|------|-------------------|-------------|-----------|----------------|------|
| R01 | ✓ | ✓ | ✓ | ✓ | A1: Diizinkan |
| R02 | ✓ | ✗ | ✓ | ✗ | A2: Ditolak — DP belum dibayar |
| R03 | ✗ | ✓ | ✓ | ✗ | A2: Ditolak — Status tidak valid |
| R04 | ✓ | ✓ | ✗ | — | A2: Ditolak — Bukan admin |
| R05 | ✗ | ✗ | ✓ | ✗ | A2: Ditolak |

**Tabel Kasus Uji Decision Table:**
| ID | C1 | C2 | C3 | C4 | Expected | Actual | Status |
|----|----|----|----|----|-|--------|--------|
| DT-01 | ✓ | ✓ | ✓ | ✓ | Diizinkan update status | [ISI] | [ISI] |
| DT-02 | ✓ | ✗ | ✓ | ✗ | HTTP 422: DP belum lunas | [ISI] | [ISI] |
| DT-03 | ✗ | ✓ | ✓ | ✗ | HTTP 422: Status tidak valid | [ISI] | [ISI] |
| DT-04 | ✓ | ✓ | ✗ | — | HTTP 403: Unauthorized | [ISI] | [ISI] |
| DT-05 | ✗ | ✗ | ✓ | ✗ | HTTP 422: Ditolak | [ISI] | [ISI] |

---

## BAB V — USE CASE / STATE TRANSITION TESTING

### 5.1 Objek Uji: Alur Status Booking AMARANTA

**State Diagram Booking:**
```
[pending] ──(DP dibayar)──→ [waiting_dp] ──(admin konfirmasi)──→ [confirmed]
                                                                       ↓
[cancelled] ←──(dibatalkan)── [confirmed] ──(in_progress)──→ [in_progress]
                                                                       ↓
                                                              [completed] ←──(pelunasan dibayar)
```

**Transisi State yang Valid:**

| Dari | Ke | Trigger | Aktor |
|------|----|---------|-------|
| pending | waiting_dp | Customer bayar DP | Customer + Midtrans |
| waiting_dp | confirmed | Admin konfirmasi DP | Admin |
| confirmed | in_progress | Admin mulai pengerjaan | Admin |
| in_progress | completed | Customer bayar pelunasan | Customer + Midtrans |
| pending/confirmed | cancelled | Customer/Admin membatalkan | Customer atau Admin |

**Tabel Kasus Uji State Transition:**
| ID | State Awal | Trigger | State Akhir | Expected | Actual | Status |
|----|-----------|---------|------------|----------|--------|--------|
| ST-01 | pending | Bayar DP via Midtrans | waiting_dp | Status berubah ke waiting_dp, notifikasi admin | [ISI] | [ISI] |
| ST-02 | waiting_dp | Admin approve DP | confirmed | Status berubah ke confirmed, notifikasi customer | [ISI] | [ISI] |
| ST-03 | confirmed | Admin mulai | in_progress | Status berubah ke in_progress | [ISI] | [ISI] |
| ST-04 | in_progress | Bayar pelunasan | completed | Status berubah ke completed | [ISI] | [ISI] |
| ST-05 | confirmed | Customer batalkan | cancelled | Status berubah ke cancelled | [ISI] | [ISI] |
| ST-06 | completed | Coba batalkan | completed | Error: tidak bisa batalkan setelah selesai | [ISI] | [ISI] |

---

## BAB VI — REKAPITULASI DAN KESIMPULAN

### 6.1 Rekapitulasi Hasil

| Metode | Total TC | Pass | Fail | Belum Diuji |
|--------|----------|------|------|-------------|
| BVA (Jumlah Tamu) | 6 | [ISI] | [ISI] | [ISI] |
| Equivalence Partitioning (Email & HP) | 8 | [ISI] | [ISI] | [ISI] |
| Decision Table (Admin Approval) | 5 | [ISI] | [ISI] | [ISI] |
| State Transition (Alur Booking) | 6 | [ISI] | [ISI] | [ISI] |
| **Total** | **25** | [ISI] | [ISI] | [ISI] |

### 6.2 Temuan Utama
1. **(BVA)** Validasi batas `jumlah_tamu` hanya ada di frontend — backend tidak memvalidasi, bisa di-bypass via API
2. **(EP)** Format email dan nomor HP divalidasi di frontend, namun perlu diverifikasi apakah validasi juga ada di backend
3. **(Decision Table)** Logika `canAdminProcess()` perlu diuji secara menyeluruh untuk semua kombinasi kondisi
4. **(State Transition)** Tidak ada mekanisme pencegahan jika user mencoba melakukan transisi state yang tidak valid

### 6.3 Rekomendasi
- Tambahkan validasi `jumlah_tamu` di backend sesuai tier
- Implementasikan validasi server-side untuk format email dan HP
- Tambahkan middleware/guard yang memverifikasi state booking sebelum setiap transisi

---

## Daftar Pustaka
- Suprihadi, D. (2025). Black Box Testing — Pertemuan 11, Software Quality. T. Informatika - UKRI.
- Myers, G.J., Sandler, C., & Badgett, T. (2011). *The Art of Software Testing* (3rd ed.). Wiley.
- IEEE Std 829-2008. *IEEE Standard for Software and System Test Documentation*. IEEE.

