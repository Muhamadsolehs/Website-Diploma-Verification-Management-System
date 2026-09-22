# 🔍 Troubleshooting: Database Column Name Mismatch

## Error: "Could not find the 'institution_name' column"

**Penyebab**: Nama kolom di tabel `institutions` di database Supabase tidak sesuai dengan kode.

---

## Cara Menemukan Nama Kolom yang Benar

### Step 1: Login ke Supabase Console
1. Buka https://app.supabase.com
2. Login dengan akun Anda
3. Pilih project DVMS
4. Pilih **SQL Editor** (atau **Table Editor**)

### Step 2: Cek Struktur Tabel `institutions`

**Opsi A: Menggunakan Table Editor (Visual)**
1. Sidebar → **Tables**
2. Cari `institutions` table
3. Lihat list kolom di bagian paling atas
4. Catat nama kolom yang menyimpan nama institusi (biasanya: name, institution_name, school_name, atau title)

**Opsi B: Menggunakan SQL Query**
1. Sidebar → **SQL Editor**
2. Jalankan query ini:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'institutions'
ORDER BY ordinal_position;
```
3. Lihat hasil - cari kolom yang tipenya TEXT atau VARCHAR
4. Catat nama kolom tersebut

### Step 3: Identifikasi Kolom yang Benar

Lihat hasil query atau table editor:
- Kolom untuk menyimpan nama institusi biasanya bernama:
  - `name` ← Paling umum
  - `institution_name` ← Sesuai naming convention
  - `school_name` ← Jika fokus ke sekolah
  - `title` ← Alternatif lain
  - `institution_title` ← Panjang penuh

### Step 4: Update Kode RegisterWizard.jsx

Setelah menemukan nama kolom yang benar, edit file:

**File**: `src/pages/auth/RegisterWizard.jsx`

**Lokasi**: Baris ~320 (cari "INSERT INSTITUTION")

**Ubah bagian ini**:
```javascript
.insert({
  name: form.institutionName.trim(),           // ← Ganti 'name' dengan nama kolom yang benar
  npsn: form.npsn.trim(),
  address: form.address.trim(),
  phone: form.officePhone.trim() || null,
  status: "pending",
})
.select("id, name, npsn, status")               // ← Ganti 'name' di select juga
```

**Contoh 1: Jika nama kolom adalah `institution_name`**
```javascript
.insert({
  institution_name: form.institutionName.trim(),
  npsn: form.npsn.trim(),
  address: form.address.trim(),
  phone: form.officePhone.trim() || null,
  status: "pending",
})
.select("id, institution_name, npsn, status")
```

**Contoh 2: Jika nama kolom adalah `school_name`**
```javascript
.insert({
  school_name: form.institutionName.trim(),
  npsn: form.npsn.trim(),
  address: form.address.trim(),
  phone: form.officePhone.trim() || null,
  status: "pending",
})
.select("id, school_name, npsn, status")
```

---

## Daftar Kolom yang Mungkin Digunakan

| Nama Kolom | Tipe | Kemungkinan |
|---|---|---|
| `name` | TEXT | ✅ PALING UMUM |
| `institution_name` | TEXT | ✅ Sesuai naming |
| `school_name` | TEXT | ✅ Jika fokus sekolah |
| `title` | TEXT | ⚠️ Jarang |
| `institution_title` | TEXT | ⚠️ Jarang |

---

## Kolom Lain yang Harus Sesuai

Selain kolom nama, pastikan kolom berikut juga ada:
- `npsn` - TEXT atau VARCHAR
- `address` - TEXT
- `phone` - TEXT (nullable)
- `status` - TEXT
- `id` - UUID (primary key)

Jika ada kolom yang tidak ada, database belum match dengan struktur yang expected.

---

## Quick Fix: Jalankan SQL di Supabase

Jika ingin verifikasi cepat struktur yang ada:

**Buka SQL Editor di Supabase dan jalankan:**
```sql
-- Cek struktur institutions table
\d institutions

-- Atau dengan query info schema
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'institutions'
ORDER BY ordinal_position;
```

---

## Jika Masih Error Setelah Fix

Kemungkinan:

1. **Typo di nama kolom**
   - Double-check nama kolom (case-sensitive di PostgreSQL)
   - Contoh: `name` ≠ `Name` ≠ `NAME`

2. **Kolom tidak ada**
   - Database belum di-migrate dengan kolom yang diperlukan
   - Hubungi database admin untuk add column

3. **Table tidak ada**
   - Tabel `institutions` belum dibuat
   - Buat table dengan SQL:
   ```sql
   CREATE TABLE institutions (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     name TEXT NOT NULL,
     npsn TEXT NOT NULL,
     address TEXT NOT NULL,
     phone TEXT,
     status TEXT DEFAULT 'pending',
     created_at TIMESTAMP DEFAULT now()
   );
   ```

4. **RLS Policy memblokir**
   - Check RLS policies di table
   - Ensure authenticated users punya INSERT permission
   - Sidebar → Tables → institutions → RLS Policies

---

## Kontak Support

Jika sudah coba semua langkah di atas tapi masih error:
1. Screenshot struktur table dari Supabase
2. Copy error message lengkap dari console
3. Hubungi tim database/backend untuk investigasi

---

## Testing Setelah Fix

Setelah update nama kolom:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Refresh halaman
3. Coba submit registration lagi
4. Check browser console untuk error message

Jika berhasil, institution baru akan muncul di table `institutions` dengan status `pending`.
