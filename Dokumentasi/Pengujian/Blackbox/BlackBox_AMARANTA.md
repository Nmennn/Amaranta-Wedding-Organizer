# BLACK-BOX TESTING
## Aplikasi AMARANTA — Wedding Organizer Web Application

**Mata Kuliah:** Software Quality
**Dosen:** Deni Suprihadi, S.T, M.KOM., MCE.

---

## Daftar Isi

- [Definisi Black-Box Testing](#definisi-black-box-testing)
- [Deskripsi Aplikasi](#deskripsi-aplikasi-yang-diuji)
- [Ruang Lingkup Pengujian](#ruang-lingkup-pengujian-black-box)
- [BAB II — Boundary Value Analysis (BVA)](#bab-ii--boundary-value-analysis-bva)
- [BAB III — Equivalence Partitioning (EP)](#bab-iii--equivalence-partitioning-ep)
- [BAB IV — Decision Table Testing](#bab-iv--decision-table-testing)
- [BAB V — Use Case / State Transition Testing](#bab-v--use-case--state-transition-testing)
- [BAB VI — Rekapitulasi dan Kesimpulan](#bab-vi--rekapitulasi-dan-kesimpulan)
- [Daftar Pustaka](#daftar-pustaka)

---

## Definisi Black-Box Testing

Black-Box Testing adalah metode pengujian yang dilakukan **tanpa melihat kode internal**. Penguji hanya berfokus pada **input dan output** sistem, memeriksa apakah sistem bekerja sesuai spesifikasi. Seluruh kasus uji dirancang hanya berdasarkan dokumentasi fitur, form yang terlihat di UI, dan perilaku API yang teramati — bukan dari membaca source code PHP/JS secara langsung.

---

## Deskripsi Aplikasi yang Diuji

**AMARANTA** adalah aplikasi web Wedding Organizer berbasis:

| Komponen | Teknologi |
|---|---|
| Frontend | React + Vite (Node.js) |
| Backend | Laravel 11, PHP 8.2, MySQL |
| Payment Gateway | Midtrans Snap (mode Sandbox) |

---

## Ruang Lingkup Pengujian Black-Box

| Komponen | File / Endpoint |
|---|---|
| Frontend — Form Booking | `client/src/pages/public/BookingForm.jsx` |
| Frontend — Pemesanan Saya | `client/src/pages/customer/MyBookings.jsx` |
| Backend — Booking Controller | `server/app/Http/Controllers/BookingController.php` |
| Backend — Auth Controller (register) | `server/app/Http/Controllers/Auth/AuthController.php` |
| Backend — Model Booking (helper status) | `isDpPaid()`, `isFullPaid()`, `canAdminProcess()` |

---

## Metode Black-Box Testing yang Digunakan

1. Boundary Value Analysis (BVA)
2. Equivalence Partitioning (EP)
3. Decision Table Testing
4. Use Case Testing / State Transition Testing

---

## BAB II — Boundary Value Analysis (BVA)

### 2.1 Konsep BVA

BVA (Boundary Value Analysis) digunakan untuk melakukan validasi fungsionalitas sistem berdasarkan **nilai batas (boundary)**. BVA berasumsi bahwa kesalahan program paling sering terjadi tepat di sekitar nilai batas, bukan di tengah-tengah rentang nilai yang valid. BVA merupakan perluasan dari Equivalence Partitioning, dengan memasukkan nilai sedikit dari minimum dan kurang sedikit dari maksimum.

### 2.2 Objek Uji: Field Jumlah Tamu pada BookingForm.jsx

Field `jumlah_tamu` pada form pemesanan AMARANTA memiliki batas minimum dan maksimum berbeda untuk setiap tier paket, ditampilkan sebagai hint di form:

- "Kapasitas paket Silver: 50-100 tamu"
- "Kapasitas paket Gold: 100-200 tamu"
- "Kapasitas paket Platinum: 200-500 tamu"

**Equivalence Class untuk field `jumlah_tamu`:**

| No | Nama Field | Tipe Data | Batasan Data |
|---|---|---|---|
| 1 | jumlah_tamu (Silver) | Integer | 50 <= jumlah_tamu <= 100 |
| 2 | jumlah_tamu (Gold) | Integer | 100 <= jumlah_tamu <= 200 |
| 3 | jumlah_tamu (Platinum) | Integer | 200 <= jumlah_tamu <= 500 |

**Titik Boundary yang Diuji (Tier Silver):**

| No | Field | Boundary | Input Uji |
|---|---|---|---|
| 1 | jumlah_tamu Silver | Batas Bawah (BB=50) | 49, 50, 51 |
| 2 | jumlah_tamu Silver | Batas Atas (BA=100) | 99, 100, 101 |

### 2.3 Tabel Kasus Uji BVA

| No | ID | Input jumlah_tamu | Tier | Expected Output | Actual Output | Status |
|---|---|---|---|---|---|---|
| 1 | BVA-01 | 49 | Silver | Error: "Jumlah tamu minimal 50 orang untuk paket Silver" | Frontend menampilkan pesan error validasi. Slider/input dikunci, form tidak bisa di-submit. | Pass |
| 2 | BVA-02 | 50 | Silver | Valid (tepat di batas bawah) | Form menerima input 50. Tidak ada pesan error. Submit dapat dilanjutkan ke step berikutnya. | Pass |
| 3 | BVA-03 | 51 | Silver | Valid (sedikit di atas batas bawah) | Form menerima input 51. Tidak ada pesan error. | Pass |
| 4 | BVA-04 | 99 | Silver | Valid (sedikit di bawah batas atas) | Form menerima input 99. Tidak ada pesan error. | Pass |
| 5 | BVA-05 | 100 | Silver | Valid (tepat di batas atas) | Form menerima input 100. Tidak ada pesan error. Submit dapat dilanjutkan. | Pass |
| 6 | BVA-06 | 101 | Silver | Error: "Jumlah tamu maksimal 100 orang untuk paket Silver" | Frontend menampilkan pesan error validasi batas atas. Form tidak bisa di-submit. | Pass |

### 2.4 Detail Test Case

---

#### BVA-01 — Jumlah Tamu 1 di Bawah Batas Minimum Tier Silver (49)

| Field | Detail |
|---|---|
| **Prioritas** | High |
| **Precondition** | User sudah login sebagai customer, berada di halaman `/pesan/silver` (BookingForm) |
| **Test Steps** | 1. Isi seluruh field wajib lain dengan data valid<br>2. Isi field Jumlah Tamu dengan nilai **49**<br>3. Klik tombol "Konfirmasi & Pesan Sekarang"<br>4. Amati pesan validasi yang muncul |
| **Test Data** | `jumlah_tamu = 49` (tier Silver, min seharusnya 50) |
| **Expected Output** | Form menampilkan pesan error "Jumlah tamu minimal 50 orang untuk paket Silver." Submit gagal, data tidak terkirim |
| **Actual Output** | Frontend menampilkan pesan error validasi tepat di bawah field jumlah tamu: "Jumlah tamu minimal 50 orang untuk paket Silver." Tombol submit tidak merespons klik. Data tidak terkirim ke backend. |
| **Status** | Pass |

---

#### BVA-06 — Jumlah Tamu 1 di Atas Batas Maksimum Tier Silver (101)

| Field | Detail |
|---|---|
| **Prioritas** | High |
| **Precondition** | User sudah login sebagai customer, berada di halaman `/pesan/silver` |
| **Test Steps** | 1. Isi seluruh field wajib lain dengan data valid<br>2. Isi field Jumlah Tamu dengan nilai **101**<br>3. Klik tombol "Konfirmasi & Pesan Sekarang"<br>4. Amati pesan validasi yang muncul |
| **Test Data** | `jumlah_tamu = 101` (tier Silver, max seharusnya 100) |
| **Expected Output** | Form menampilkan pesan error "Jumlah tamu maksimal 100 orang untuk paket Silver." Submit gagal |
| **Actual Output** | Frontend menampilkan pesan error validasi: "Jumlah tamu maksimal 100 orang untuk paket Silver." Form tidak dapat di-submit. Konsisten dengan perilaku BVA-01. |
| **Status** | Pass |

---

### 2.5 Kesimpulan Bab II

Dari 6 kasus uji BVA, **6 Pass** dan **0 Fail**. Validasi batas jumlah tamu di frontend berfungsi dengan baik untuk tier Silver — nilai tepat di batas (50 dan 100) diterima, sedangkan nilai di luar batas (49 dan 101) ditolak dengan pesan error yang sesuai. Catatan: validasi ini hanya ada di frontend; backend tidak memvalidasi `jumlah_tamu`, sehingga bisa di-bypass via API langsung (temuan ini dikonfirmasi di pengujian Gray-Box OAT-06).

---

## BAB III — Equivalence Partitioning (EP)

### 3.1 Konsep EP

Equivalence Partitioning digunakan untuk mencari seluruh kesalahan atau kehilangan dalam fungsi. Jika input merupakan range/kumpulan data, kasus ujinya adalah **satu benar (valid class) dan minimal dua tidak benar (invalid class)**.

### 3.2 Objek Uji: Field Email dan Nomor HP pada Form Register & Booking

**Partisi Kelas untuk Field Email:**

| Kelas | Deskripsi | Contoh Input |
|---|---|---|
| Valid | Format email standar (ada @ dan domain) | `budi@gmail.com` |
| Invalid 1 | Tidak ada simbol @ | `budigmail.com` |
| Invalid 2 | Field dikosongkan | (kosong) |
| Invalid 3 | Email tanpa domain setelah @ | `budi@` |

**Partisi Kelas untuk Field Nomor HP:**

| Kelas | Deskripsi | Contoh Input |
|---|---|---|
| Valid | Diawali 08, panjang 10-13 digit | `081234567890` |
| Invalid 1 | Tidak diawali 08 | `1234567890` |
| Invalid 2 | Mengandung huruf | `08123abc4567` |
| Invalid 3 | Terlalu pendek (< 10 digit) | `0812345` |
| Invalid 4 | Field dikosongkan | (kosong) |

### 3.3 Tabel Kasus Uji EP

| No | ID | Field | Input | Expected Output | Actual Output | Status |
|---|---|---|---|---|---|---|
| 1 | EP-01 | Email | `budi@gmail.com` | Valid, diterima | Form menerima input. Tidak ada pesan error. Proses registrasi dapat dilanjutkan. | Pass |
| 2 | EP-02 | Email | `budigmail.com` | Error: format email salah | Frontend menampilkan pesan "Format email tidak valid" sebelum submit. Backend juga mengembalikan HTTP 422 jika dikirim langsung via API. | Pass |
| 3 | EP-03 | Email | (kosong) | Error: field wajib diisi | Frontend menampilkan "Email wajib diisi." Backend mengembalikan HTTP 422: `"The email field is required."` | Pass |
| 4 | EP-04 | Email | `budi@` | Error: format email salah | Frontend menampilkan pesan format email tidak valid. Backend mengembalikan HTTP 422: `"The email field must be a valid email address."` | Pass |
| 5 | EP-05 | No. HP | `081234567890` | Valid, diterima | Form menerima input. Tidak ada pesan error. | Pass |
| 6 | EP-06 | No. HP | `1234567890` | Error: format HP salah | Frontend menampilkan pesan "Nomor HP harus diawali dengan 08." Backend mengembalikan HTTP 422 dengan pesan format tidak valid. | Pass |
| 7 | EP-07 | No. HP | `08123abc4567` | Error: format HP salah | Frontend memblokir input huruf pada field nomor HP (input type=number atau regex filter). Backend mengembalikan HTTP 422: `"The phone field format is invalid."` | Pass |
| 8 | EP-08 | No. HP | `0812345` | Error: format HP salah | Frontend menampilkan "Nomor HP minimal 10 digit." Backend mengembalikan HTTP 422 karena panjang tidak memenuhi syarat. | Pass |

### 3.4 Detail Test Case

---

#### EP-02 — Input Email Tanpa Simbol @ pada Form Pendaftaran

| Field | Detail |
|---|---|
| **Prioritas** | High |
| **Precondition** | Berada di halaman `/daftar` (Register.jsx), step 1 |
| **Test Steps** | 1. Isi Nama Lengkap dengan data valid<br>2. Isi Email dengan `budigmail.com` (tanpa @)<br>3. Isi No. HP dan Password dengan data valid<br>4. Klik "Daftar Sekarang" |
| **Test Data** | `email = "budigmail.com"` |
| **Expected Output** | Sistem menampilkan pesan "Format email tidak valid" |
| **Actual Output** | Frontend menampilkan pesan validasi "Format email tidak valid" di bawah field email sebelum request dikirim ke server. Jika dikirim langsung via Postman, backend mengembalikan HTTP 422: `"The email field must be a valid email address."` |
| **Status** | Pass |

---

#### EP-07 — Input Nomor HP Mengandung Huruf

| Field | Detail |
|---|---|
| **Prioritas** | High |
| **Precondition** | Berada di halaman form booking atau register |
| **Test Steps** | 1. Isi field No. HP dengan `08123abc4567`<br>2. Klik submit |
| **Test Data** | `phone = "08123abc4567"` |
| **Expected Output** | Sistem menampilkan pesan "Nomor HP tidak valid" |
| **Actual Output** | Frontend memfilter karakter huruf pada field nomor HP sehingga karakter `abc` tidak dapat diketik. Jika dikirim langsung via API, backend mengembalikan HTTP 422: `"The phone field format is invalid."` Validasi berjalan di dua lapis (frontend dan backend). |
| **Status** | Pass |

---

### 3.5 Kesimpulan Bab III

Dari 8 kasus uji EP, **8 Pass** dan **0 Fail**. Validasi email dan nomor HP berfungsi dengan baik di sisi frontend maupun backend. Validasi server-side sudah diimplementasikan sehingga tidak dapat di-bypass via API langsung. Format email menggunakan standar RFC yang divalidasi oleh Laravel, dan format nomor HP divalidasi dengan regex yang memeriksa awalan `08` serta panjang digit.

---

## BAB IV — Decision Table Testing

### 4.1 Objek Uji: Logika Persetujuan Admin pada Booking

Fitur booking AMARANTA memiliki logika alur status: **pending -> confirmed -> in_progress -> completed**. Admin hanya dapat memproses booking jika kondisi tertentu terpenuhi.

**Kondisi:**
- C1: Status booking = `pending` atau `confirmed`
- C2: DP sudah dibayar (`isDpPaid()` = true)
- C3: Admin memiliki role admin
- C4: `canAdminProcess()` = true

**Aksi:**
- A1: Admin bisa ubah status booking
- A2: Admin tidak bisa proses (akses ditolak)

### 4.2 Decision Table

| Rule | C1 (status valid) | C2 (DP paid) | C3 (admin) | C4 (canProcess) | Aksi |
|---|---|---|---|---|---|
| R01 | Ya | Ya | Ya | Ya | A1: Diizinkan |
| R02 | Ya | Tidak | Ya | Tidak | A2: Ditolak — DP belum dibayar |
| R03 | Tidak | Ya | Ya | Tidak | A2: Ditolak — Status tidak valid |
| R04 | Ya | Ya | Tidak | — | A2: Ditolak — Bukan admin |
| R05 | Tidak | Tidak | Ya | Tidak | A2: Ditolak |

### 4.3 Tabel Kasus Uji Decision Table

| ID | C1 | C2 | C3 | C4 | Expected | Actual Output | Status |
|---|---|---|---|---|---|---|---|
| DT-01 | Ya | Ya | Ya | Ya | Diizinkan update status | HTTP 200 — Admin berhasil mengubah status booking. Response mengembalikan data booking dengan status terbaru. | Pass |
| DT-02 | Ya | Tidak | Ya | Tidak | HTTP 422: DP belum lunas | HTTP 422 — "DP belum dibayar. Booking tidak dapat diproses." `isDpPaid()` mengembalikan false, request ditolak sebelum perubahan status dilakukan. | Pass |
| DT-03 | Tidak | Ya | Ya | Tidak | HTTP 422: Status tidak valid | HTTP 422 — "Status booking tidak memungkinkan untuk diproses." `canAdminProcess()` mengembalikan false karena status booking bukan `pending` atau `confirmed`. | Pass |
| DT-04 | Ya | Ya | Tidak | — | HTTP 403: Unauthorized | HTTP 403 — "Unauthorized." Middleware role admin memblokir akses. User dengan role `customer` tidak dapat mengakses endpoint admin. | Pass |
| DT-05 | Tidak | Tidak | Ya | Tidak | HTTP 422: Ditolak | HTTP 422 — `canAdminProcess()` mengembalikan false. Kedua kondisi (status dan DP) tidak terpenuhi. Pesan error menjelaskan status tidak valid. | Pass |

---

## BAB V — Use Case / State Transition Testing

### 5.1 Objek Uji: Alur Status Booking AMARANTA

**State Diagram Booking:**

```
[pending] --(DP dibayar)--> [waiting_dp] --(admin konfirmasi)--> [confirmed]
                                                                       |
[cancelled] <--(dibatalkan)-- [confirmed]     [in_progress] <---------+
                                                    |
                                               [completed] <--(pelunasan dibayar)
```

**Transisi State yang Valid:**

| Dari | Ke | Trigger | Aktor |
|---|---|---|---|
| pending | waiting_dp | Customer bayar DP | Customer + Midtrans |
| waiting_dp | confirmed | Admin konfirmasi DP | Admin |
| confirmed | in_progress | Admin mulai pengerjaan | Admin |
| in_progress | completed | Customer bayar pelunasan | Customer + Midtrans |
| pending/confirmed | cancelled | Customer/Admin membatalkan | Customer atau Admin |

### 5.2 Tabel Kasus Uji State Transition

| ID | State Awal | Trigger | State Akhir | Expected | Actual Output | Status |
|---|---|---|---|---|---|---|
| ST-01 | pending | Bayar DP via Midtrans | waiting_dp | Status berubah ke waiting_dp, notifikasi admin | Status booking berubah menjadi `waiting_dp` setelah pembayaran DP dikonfirmasi Midtrans. Record payment tersimpan di tabel `payments`. Notifikasi muncul di dashboard admin. | Pass |
| ST-02 | waiting_dp | Admin approve DP | confirmed | Status berubah ke confirmed, notifikasi customer | Admin mengklik "Konfirmasi DP" di dashboard. Status booking berubah ke `confirmed`. Customer menerima notifikasi bahwa booking telah dikonfirmasi. | Pass |
| ST-03 | confirmed | Admin mulai | in_progress | Status berubah ke in_progress | Admin mengklik "Mulai Pengerjaan". Status berubah ke `in_progress`. Tombol pelunasan muncul di halaman customer. | Pass |
| ST-04 | in_progress | Bayar pelunasan | completed | Status berubah ke completed | Setelah pelunasan berhasil via Midtrans, status booking berubah ke `completed`. Record payment pelunasan tersimpan. Booking tidak dapat dibatalkan. | Pass |
| ST-05 | confirmed | Customer batalkan | cancelled | Status berubah ke cancelled | Customer mengklik "Batalkan Booking" dari halaman MyBookings. Konfirmasi dialog muncul. Setelah dikonfirmasi, status berubah ke `cancelled`. Tanggal wedding menjadi tersedia kembali untuk booking baru. | Pass |
| ST-06 | completed | Coba batalkan | completed | Error: tidak bisa batalkan setelah selesai | HTTP 422 — "Booking yang sudah selesai tidak dapat dibatalkan." Tombol batalkan tidak tersedia di UI untuk booking berstatus `completed`. Jika dikirim via API langsung, backend mengembalikan HTTP 422. | Pass |

---

## BAB VI — Rekapitulasi dan Kesimpulan

### 6.1 Rekapitulasi Hasil

| Metode | Total TC | Pass | Fail | Belum Diuji |
|---|---|---|---|---|
| BVA (Jumlah Tamu) | 6 | 6 | 0 | 0 |
| Equivalence Partitioning (Email & HP) | 8 | 8 | 0 | 0 |
| Decision Table (Admin Approval) | 5 | 5 | 0 | 0 |
| State Transition (Alur Booking) | 6 | 6 | 0 | 0 |
| **Total** | **25** | **25** | **0** | **0** |

### 6.2 Temuan Utama

1. **(BVA)** Validasi batas `jumlah_tamu` hanya ada di frontend — backend tidak memvalidasi, bisa di-bypass via API. Untuk nilai tepat di batas (50 dan 100), sistem menerimanya dengan benar. Nilai di luar batas (49, 101) ditolak di frontend namun tidak di backend.

2. **(EP)** Format email dan nomor HP divalidasi di dua lapis — frontend memblokir input tidak valid sebelum submit, dan backend mengembalikan HTTP 422 jika request dikirim langsung via API. Validasi server-side sudah ada dan konsisten.

3. **(Decision Table)** Logika `canAdminProcess()` berfungsi dengan benar untuk semua kombinasi kondisi yang diuji. Middleware role admin sudah memblokir akses dari non-admin dengan HTTP 403.

4. **(State Transition)** Semua transisi state yang valid berjalan sesuai ekspektasi. Transisi yang tidak valid (seperti membatalkan booking yang sudah `completed`) juga ditolak dengan benar baik dari UI maupun API.

### 6.3 Rekomendasi

| Prioritas | Temuan | Rekomendasi |
|---|---|---|
| Tinggi | Validasi `jumlah_tamu` hanya di frontend | Tambahkan validasi `jumlah_tamu` sesuai tier di `BookingController::store()` pada sisi backend |
| Sedang | Konsistensi pesan error antara frontend dan backend | Samakan format pesan error agar konsisten antara validasi frontend dan respons HTTP 422 dari backend |
| Rendah | Tidak ada notifikasi eksplisit saat transisi state gagal via API | Tambahkan pesan error yang lebih deskriptif pada setiap penolakan transisi state |

---

## Daftar Pustaka

- Suprihadi, D. (2025). *Black Box Testing — Pertemuan 11, Software Quality*. T. Informatika - UKRI.
- Myers, G.J., Sandler, C., & Badgett, T. (2011). *The Art of Software Testing* (3rd ed.). Wiley.
- IEEE Std 829-2008. *IEEE Standard for Software and System Test Documentation*. IEEE.
