#WHITE-BOX TESTING
## Aplikasi AMARANTA — Wedding Organizer Web Application
### Mata Kuliah: Software Quality | Dosen: Deni Suprihadi, S.T, M.KOM., MCE.

---

## Definisi White-Box Testing
White-Box Testing adalah metode pengujian yang dilakukan dengan memeriksa **struktur internal kode program**. Penguji memiliki akses penuh ke source code dan menguji alur logika, kondisi percabangan, dan jalur eksekusi kode secara langsung.

---

## Deskripsi Aplikasi yang Diuji
**AMARANTA** adalah aplikasi web Wedding Organizer berbasis:
- **Frontend:** React + Vite (Node.js)
- **Backend:** Laravel 11, PHP 8.2, MySQL
- **Payment Gateway:** Midtrans Snap (mode Sandbox)

---

## Ruang Lingkup Pengujian White-Box

### File/Komponen yang Diuji:
| Komponen | File |
|----------|------|
| Frontend — Form Booking | `client/src/pages/public/BookingForm.jsx` |
| Frontend — Status Pemesanan | `client/src/pages/customer/MyBookings.jsx` |
| Backend — Booking Controller | `server/app/Http/Controllers/BookingController.php` |
| Backend — Auth Controller | `server/app/Http/Controllers/Auth/AuthController.php` |
| Backend — Model Booking | `isDpPaid()`, `isFullPaid()`, `canAdminProcess()` |
| Backend — Vendor Controller | `server/app/Http/Controllers/VendorController.php` |

---

## Metode White-Box Testing yang Digunakan

### 1. Desk Checking
### 2. Code Walkthrough
### 3. Control Flow Testing
### 4. Basic Path Testing
### 5. Loop Testing

---

## BAB II — DESK CHECKING

### 2.1 Objek Uji: Fungsi `getSisaAttribute()` pada Model Booking

**Kode yang Dianalisis (Manual Review):**
```php
// Model: Booking.php
public function getSisaAttribute()
{
    $total = $this->total_price;
    $dpPaid = $this->payments()
                   ->where('type', 'dp')
                   ->where('status', 'paid')
                   ->sum('amount');
    
    // Logika fallback untuk kasus dp_paid = 0
    if ($dpPaid === 0) {
        return $total; // Sisa = total penuh jika belum DP
    }
    
    $sisa = $total - $dpPaid;
    return max($sisa, 0); // Pastikan tidak negatif
}
```

**Penelusuran Manual (Manual Trace):**

**Skenario DC-01: Booking baru, belum ada pembayaran DP**
| Langkah | Variabel | Nilai | Catatan |
|---------|----------|-------|---------|
| 1 | `$total` | 25.000.000 | Harga paket Silver |
| 2 | `$dpPaid` | 0 | Belum ada pembayaran |
| 3 | Kondisi `$dpPaid === 0` | TRUE | Masuk branch fallback |
| 4 | Return | 25.000.000 | ✓ Benar: sisa = total |

**Skenario DC-02: DP 30% sudah dibayar**
| Langkah | Variabel | Nilai | Catatan |
|---------|----------|-------|---------|
| 1 | `$total` | 25.000.000 | Harga paket Silver |
| 2 | `$dpPaid` | 7.500.000 | DP 30% |
| 3 | Kondisi `$dpPaid === 0` | FALSE | Lewati fallback |
| 4 | `$sisa` | 17.500.000 | 25jt - 7.5jt |
| 5 | `max($sisa, 0)` | 17.500.000 | ✓ Benar |

**Temuan Desk Checking:**
> ⚠️ **Potensi Issue:** Kondisi `$dpPaid === 0` menggunakan strict comparison. Jika tipe data dari `sum()` mengembalikan `"0"` (string) bukan `0` (integer), maka `=== 0` akan FALSE dan logika fallback tidak jalan. Perlu diuji apakah `DB::sum()` di Laravel selalu mengembalikan integer atau bisa string/float.

**Tabel Kasus Uji Desk Checking:**
| ID | Skenario | Input | Expected Output | Status |
|----|----------|-------|----------------|--------|
| DC-01 | Belum ada DP | dpPaid = 0, total = 25.000.000 | Sisa = 25.000.000 | [ISI] |
| DC-02 | DP 30% sudah dibayar | dpPaid = 7.500.000, total = 25.000.000 | Sisa = 17.500.000 | [ISI] |
| DC-03 | DP melebihi total (edge case) | dpPaid = 26.000.000, total = 25.000.000 | Sisa = 0 (max protection) | [ISI] |

---

## BAB III — CODE WALKTHROUGH

### 3.1 Objek Uji: Fungsi `store()` pada BookingController.php

**Kode yang Di-walkthrough:**
```php
// BookingController.php
public function store(Request $request)
{
    $request->validate([
        'package_id' => 'required|exists:packages,id',
        'wedding_date' => 'required|date|after:today',
        'groom_name'   => 'required|string|max:100',
        'bride_name'   => 'required|string|max:100',
        'notes'        => 'nullable|string',
        // ⚠️ TEMUAN: Tidak ada validasi jumlah_tamu di sini!
    ]);

    // Cek apakah tanggal sudah dipesan
    $dateExists = Booking::where('wedding_date', $request->wedding_date)
                         ->where('status', '!=', 'cancelled')
                         ->exists();

    if ($dateExists) {
        return response()->json([
            'message' => 'Tanggal tersebut sudah dipesan.'
        ], 422);
    }

    $package = Package::findOrFail($request->package_id);
    $vendor = $package->vendor;

    $booking = Booking::create([
        'customer_id'  => $request->user()->id,
        'package_id'   => $request->package_id,
        'vendor_id'    => $vendor->id,
        'wedding_date' => $request->wedding_date,
        'groom_name'   => $request->groom_name,
        'bride_name'   => $request->bride_name,
        // ⚠️ TEMUAN: jumlah_tamu digabung ke notes, bukan field tersendiri!
        'notes'        => $request->notes,
        'status'       => 'pending',
        'total_price'  => $package->price,
    ]);

    return response()->json([
        'message' => 'Pemesanan berhasil.',
        'data'    => $booking,
    ], 201);
}
```

**Temuan Code Walkthrough (CW):**

| ID | Temuan | Severity | Rekomendasi |
|----|--------|----------|------------|
| CW-01 | Tidak ada validasi `jumlah_tamu` di backend → bisa di-bypass via API | HIGH | Tambahkan rule validasi `jumlah_tamu` per tier di `store()` |
| CW-02 | `$dateExists` tidak menggunakan DB transaction/locking → potensi race condition | MEDIUM | Gunakan `DB::transaction()` + `lockForUpdate()` |
| CW-03 | `jumlah_tamu` digabung ke `notes` sebagai string → tidak tersimpan terstruktur | LOW | Buat kolom `jumlah_tamu` di tabel `bookings` |
| CW-04 | Tidak ada cek apakah vendor/paket masih aktif sebelum booking dibuat | MEDIUM | Tambahkan validasi `status` vendor aktif |
| CW-05 | Tidak ada rate limiting pada endpoint ini | LOW | Tambahkan middleware `throttle` |

**Tabel Kasus Uji Code Walkthrough:**
| ID | Skenario | Cara Uji | Expected | Status |
|----|----------|----------|----------|--------|
| CW-T01 | Bypass validasi tamu via Postman (kirim langsung ke API) | POST /api/bookings dengan tamu=1000 | Seharusnya ditolak, tapi sistem menerima | [ISI] |
| CW-T02 | Dua request booking tanggal sama secara bersamaan | Concurrent request dengan curl | Hanya 1 booking terbentuk | [ISI] |

---

## BAB IV — CONTROL FLOW TESTING

### 4.1 Objek Uji: Fungsi `login()` pada AuthController.php

**Kode:**
```php
public function login(Request $request)
{
    $request->validate([
        'email'    => 'required|email',
        'password' => 'required',
    ]);

    // NODE 1: Cek apakah user ditemukan
    $user = User::where('email', $request->email)->first();
    
    if (!$user) {
        // BRANCH A: User tidak ditemukan
        return response()->json(['message' => 'Akun tidak ditemukan.'], 404);
    }
    
    // NODE 2: Cek password
    if (!Hash::check($request->password, $user->password)) {
        // BRANCH B: Password salah
        return response()->json(['message' => 'Password salah.'], 401);
    }
    
    // NODE 3: Cek status akun
    if ($user->status === 'nonaktif') {
        // BRANCH C: Akun nonaktif
        return response()->json(['message' => 'Akun Anda dinonaktifkan.'], 403);
    }
    
    // BRANCH D: Login berhasil
    $token = $user->createToken('auth_token')->plainTextToken;
    return response()->json([
        'message' => 'Login berhasil.',
        'token'   => $token,
        'user'    => $user,
    ], 200);
}
```

**Flow Graph:**
```
[START]
   ↓
[Node 1: user ada?]──NO──→ [Return 404] → [END]
   ↓ YES
[Node 2: password benar?]──NO──→ [Return 401] → [END]
   ↓ YES
[Node 3: akun aktif?]──NO (nonaktif)──→ [Return 403] → [END]
   ↓ YES (aktif)
[Buat token] → [Return 200] → [END]
```

**Tabel Kasus Uji Control Flow:**
| ID | Jalur | Kondisi | Input | Expected | Actual | Status |
|----|-------|---------|-------|----------|--------|--------|
| CF-01 | Jalur A (404) | User tidak ditemukan | email="tidakada@test.com" | HTTP 404, "Akun tidak ditemukan" | [ISI] | [ISI] |
| CF-02 | Jalur B (401) | Password salah | email="ada@test.com", pass="salah" | HTTP 401, "Password salah" | [ISI] | [ISI] |
| CF-03 | Jalur C (403) | Akun nonaktif | email="nonaktif@test.com", pass="benar" | HTTP 403, "Akun dinonaktifkan" | [ISI] | [ISI] |
| CF-04 | Jalur D (200) | Login berhasil | email="aktif@test.com", pass="benar" | HTTP 200 + token JWT | [ISI] | [ISI] |

---

## BAB V — BASIC PATH TESTING

### 5.1 Objek Uji: Fungsi `store()` pada BookingController.php

**Analisis Cyclomatic Complexity:**

**Flow Graph:**
```
Node 1 (Start/Validate)
    ↓
Node 2: validate() → Edge 1→2
Node 2 → Node 3: $dateExists? → Edge 2→3
Node 3 → Node 4 (TRUE: return 422) → Edge 3→4
Node 3 → Node 5 (FALSE: lanjut) → Edge 3→5
Node 5 → Node 6: Package::findOrFail() → Edge 5→6
Node 6 → Node 7: Booking::create() → Edge 6→7
Node 7 → Node 8 (Return 201) → Edge 7→8
Node 4 → Node 8 → Edge 4→8
```

**Perhitungan:**
- **Edges (E):** 8
- **Nodes (N):** 8
- **Predicate Nodes (P):** 1 (kondisi $dateExists)
- **Cyclomatic Complexity V(G) = E - N + 2P = 8 - 8 + 2(1) = 2 + 1 = 3**

**Jalur Independen (Minimal 3 jalur):**

| Jalur | Urutan Node | Kondisi | Deskripsi |
|-------|------------|---------|-----------|
| Path 1 | 1→2→3→4→8 | $dateExists = TRUE | Tanggal sudah dipesan → return 422 |
| Path 2 | 1→2→3→5→6→7→8 | $dateExists = FALSE, package valid | Booking berhasil → return 201 |
| Path 3 | 1→2→(exception)→8 | Package tidak ditemukan (404) | findOrFail() throw exception |

**Tabel Kasus Uji Basic Path:**
| ID | Path | Input | Expected | Actual | Status |
|----|------|-------|----------|--------|--------|
| BP-01 | Path 1 | wedding_date yang sudah dibooking | HTTP 422: "Tanggal tersebut sudah dipesan" | [ISI] | [ISI] |
| BP-02 | Path 2 | Data valid, tanggal belum dibooking | HTTP 201: "Pemesanan berhasil" + data booking | [ISI] | [ISI] |
| BP-03 | Path 3 | package_id = 9999 (tidak ada) | HTTP 404 exception | [ISI] | [ISI] |

---

## BAB VI — LOOP TESTING

### 6.1 Objek Uji: Loop Pembuatan Paket di `VendorController.php`

**Kode yang Dianalisis:**
```php
// VendorController.php — fungsi store() admin
public function store(Request $request)
{
    // ... validasi vendor ...
    
    $vendor = Vendor::create([...]);
    
    // Loop: Buat 3 paket (Silver, Gold, Platinum) untuk setiap vendor baru
    $tiers = ['silver', 'gold', 'platinum'];
    
    foreach ($tiers as $tier) {
        $price = match($tier) {
            'silver'   => $request->price_silver   ?? 25000000,
            'gold'     => $request->price_gold     ?? 45000000,
            'platinum' => $request->price_platinum ?? 85000000,
        };
        
        Package::create([
            'vendor_id' => $vendor->id,
            'tier_id'   => Tier::where('name', $tier)->first()->id,
            'price'     => $price,
        ]);
    }
    
    return response()->json(['message' => 'Vendor berhasil dibuat.', 'data' => $vendor], 201);
}
```

**Karakteristik Loop:**
- **Jenis:** Fixed loop (selalu tepat 3 iterasi — Silver, Gold, Platinum)
- **Sumber iterasi:** Array statis `['silver', 'gold', 'platinum']` — tidak dari input dinamis
- **Risiko utama:** Bukan jumlah iterasi, melainkan **konten** tiap iterasi (nilai harga default/custom)

**Analisis Kasus Loop (Mengacu Materi Perkuliahan):**
| No | Kasus Loop | Relevansi | Keterangan |
|----|-----------|-----------|-----------|
| 1 | Loop 0 iterasi | Tidak mungkin | Array selalu 3 elemen |
| 2 | Loop 1 iterasi | Tidak mungkin | Selalu 3 elemen |
| 3 | Loop normal (3 iterasi) | **RELEVAN** → LOOP-01 | Kasus umum |
| 4 | Loop dengan nilai duplikat | **RELEVAN** → LOOP-02 | price_silver = price_gold |
| 5 | Loop dengan nilai default (fallback) | **RELEVAN** → LOOP-03 | Tanpa input price |

**Tabel Kasus Uji Loop Testing:**
| ID | Skenario | Input | Expected | Actual | Status |
|----|----------|-------|----------|--------|--------|
| LOOP-01 | Loop normal 3 iterasi, harga custom | price_silver=20jt, gold=40jt, platinum=80jt | 3 Package terbentuk dengan harga sesuai | [ISI] | [ISI] |
| LOOP-02 | Nilai duplikat (silver=gold) | price_silver=40jt, price_gold=40jt, platinum=80jt | 3 Package terbentuk (duplikat harga valid) | [ISI] | [ISI] |
| LOOP-03 | Semua nilai default (tanpa input price) | Tanpa price_silver/gold/platinum | silver=25jt, gold=45jt, platinum=85jt (default) | [ISI] | [ISI] |

---

## BAB VII — REKAPITULASI DAN KESIMPULAN

### 7.1 Rekapitulasi Hasil Pengujian per Metode

| Metode | Jumlah TC | Pass | Fail | Belum Diuji |
|--------|-----------|------|------|-------------|
| Desk Checking | 3 | [ISI] | [ISI] | [ISI] |
| Code Walkthrough | 2 | [ISI] | [ISI] | [ISI] |
| Control Flow Testing | 4 | [ISI] | [ISI] | [ISI] |
| Basic Path Testing | 3 | [ISI] | [ISI] | [ISI] |
| Loop Testing | 3 | [ISI] | [ISI] | [ISI] |
| **Total** | **15** | [ISI] | [ISI] | [ISI] |

### 7.2 Ringkasan Cyclomatic Complexity

| Metrik | Nilai |
|--------|-------|
| Jumlah Node (N) | 8 |
| Jumlah Edge (E) | 8 |
| Jumlah Predicate Node (P) | 1 |
| Cyclomatic Complexity V(G) | 3 |
| Jumlah Jalur Independen Minimum | 3 |

### 7.3 Temuan Utama
1. **(Desk Checking)** Logika fallback `if ($dpPaid === 0)` pada `getSisaAttribute()` berpotensi bermasalah jika tipe data `sum()` mengembalikan string bukan integer
2. **(Code Walkthrough)** Fungsi `store()` tidak memvalidasi `jumlah_tamu` di backend — bisa di-bypass via API langsung
3. **(Control Flow)** Seluruh 4 jalur kondisional pada `login()` dapat dicapai dan diuji
4. **(Basic Path)** Cyclomatic Complexity fungsi `store()` = 3, tergolong rendah namun tidak mendeteksi bug validasi level bisnis
5. **(Loop)** Perulangan pembuatan 3 paket vendor bersifat statis, risiko bug ada pada konten harga default/custom

### 7.4 Rekomendasi Perbaikan
| Prioritas | Temuan | Rekomendasi |
|-----------|--------|------------|
| Tinggi | Tidak ada validasi `jumlah_tamu` di backend | Tambahkan validasi `jumlah_tamu` sesuai tier di `BookingController::store()` |
| Sedang | Potensi race condition pada pengecekan tanggal | Gunakan `DB::transaction()` + `lockForUpdate()` |
| Rendah | `jumlah_tamu` tidak tersimpan sebagai field terstruktur | Tambahkan kolom `jumlah_tamu` di tabel `bookings` |

---

## Daftar Pustaka
- Ndaumanu, R. I. (2023). Pengujian Sistem Informasi Perpustakaan Berbasis Website dengan Basis Path Testing. *Justek*.
- Andriyadi, A., dkk. (2022). Evaluasi Sistem Informasi Perpustakaan dengan WhiteBox Testing. *Journal of Innovation Research and Knowledge*.
- Suprihadi, D. (2025). White Box Testing — Pertemuan 10, Software Quality. T. Informatika - UKRI.
- McCabe, T. J. (1976). A complexity measure. *IEEE Transactions on Software Engineering*.
