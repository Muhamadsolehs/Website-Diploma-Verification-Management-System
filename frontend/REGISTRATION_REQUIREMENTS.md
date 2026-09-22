# Requirements untuk Fitur Registrasi - DVMS Frontend

## Database Structure Requirements

### 1. Tabel: `institutions`
**Deskripsi**: Menyimpan data institusi pendidikan

```sql
CREATE TABLE institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_name TEXT NOT NULL,  -- CRITICAL: Bukan 'name'
  npsn TEXT NOT NULL UNIQUE,
  address TEXT NOT NULL,
  phone TEXT,
  status TEXT DEFAULT 'pending',   -- 'pending', 'active', 'frozen'
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

**Catatan Penting**: Kolom harus bernama `institution_name`, bukan `name`

---

### 2. Tabel: `institution_registrations`
**Deskripsi**: Menyimpan data registrasi pengajuan institusi

```sql
CREATE TABLE institution_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_name TEXT NOT NULL,
  institution_npsn TEXT NOT NULL,
  institution_address TEXT NOT NULL,
  institution_email TEXT NOT NULL,
  
  admin_full_name TEXT NOT NULL,
  admin_nip TEXT NOT NULL,
  admin_position TEXT,              -- NEW: Posisi admin (e.g., Kepala TU)
  admin_phone TEXT,                  -- NEW: No telepon/WA admin
  admin_email TEXT NOT NULL,
  
  auth_user_id UUID NOT NULL,
  
  documents JSONB,                   -- NEW: Referensi dokumen yang diupload
  status TEXT DEFAULT 'manual_verification',
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

**Kolom Baru**:
- `admin_position`: Untuk menyimpan jabatan admin
- `admin_phone`: Untuk menyimpan nomor telepon admin
- `documents`: JSON array berisi referensi file dokumen yang diupload

**Contoh data `documents` column**:
```json
[
  {
    "documentType": "operational_license",
    "fileUrl": "institution_documents/uuid-123/operational_license/1234567890_filename.pdf",
    "fileName": "SK Izin Operasional"
  },
  {
    "documentType": "establishment_document",
    "fileUrl": "institution_documents/uuid-123/establishment_document/1234567891_filename.pdf",
    "fileName": "SK Pendirian"
  }
]
```

---

### 3. Supabase Storage

**Bucket Name**: `institution_documents`
**Access Level**: Private (dokumen hanya bisa diakses via authenticated requests)

**Path Structure**:
```
institution_documents/
└── {user_id}/
    ├── operational_license/
    │   └── {timestamp}_{original_filename}
    ├── establishment_document/
    │   └── {timestamp}_{original_filename}
    ├── accreditation_document/
    │   └── {timestamp}_{original_filename}
    └── additional_document/
        └── {timestamp}_{original_filename}
```

---

### 4. Row Level Security (RLS) Policies

**Untuk tabel `institutions`**:
```sql
-- Allow insert untuk authenticated users (registrasi)
CREATE POLICY "Allow insert on institutions for auth users"
  ON institutions
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Allow select hanya untuk superadmin
CREATE POLICY "Allow select institutions for superadmin"
  ON institutions
  FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin'
  );
```

**Untuk tabel `institution_registrations`**:
```sql
-- Allow insert untuk authenticated users
CREATE POLICY "Allow insert registration for auth users"
  ON institution_registrations
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Allow select untuk superadmin dan creator
CREATE POLICY "Allow select registration"
  ON institution_registrations
  FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin'
    OR auth_user_id = auth.uid()
  );
```

**Untuk Supabase Storage `institution_documents` bucket**:
```sql
-- Allow upload untuk authenticated users
CREATE POLICY "Allow upload for authenticated users"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'institution_documents'
    AND auth.role() = 'authenticated'
  );

-- Allow read untuk superadmin dan creator
CREATE POLICY "Allow read for creator and superadmin"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'institution_documents'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin'
    )
  );
```

---

## Backend/API Requirements

### Endpoint untuk Superadmin Verification
Setelah registrasi, Superadmin perlu endpoint untuk:

```
POST /api/registrations/{registrationId}/approve
- Validate all documents
- Activate institution & admin account
- Update status dari 'manual_verification' → 'active'

POST /api/registrations/{registrationId}/reject
- Update status ke 'rejected'
- Send notification ke admin
```

---

## File Upload Constraints

- **Max file size**: 5 MB per dokumen
- **Allowed formats**: PDF, JPG, PNG
- **Minimum documents**: 3 dari 4 dokumen wajib diupload
  - SK Izin Operasional (WAJIB)
  - SK Pendirian (WAJIB)
  - Dokumen Akreditasi (WAJIB)
  - Dokumen Tambahan (OPSIONAL)

---

## Testing Checklist

### Frontend
- [ ] Step 1 (Identitas): Semua field tervalidasi dengan benar
- [ ] Step 2 (Admin): Password validation, email validation
- [ ] Step 3 (Legalitas): Upload 3+ dokumen, validasi ukuran file
- [ ] Step 4 (Review): Tampilkan summary data dengan benar
- [ ] Submit: Dokumen terupload, data tersimpan di database
- [ ] Success page: Tampilkan registration ID dan status

### Database
- [ ] Insert ke `institutions` berhasil (kolom: institution_name, npsn, address, phone, status)
- [ ] Insert ke `institution_registrations` berhasil (include admin_position, admin_phone, documents)
- [ ] Update `profiles` dengan institution_id berhasil
- [ ] Documents JSON tersimpan dengan benar

### Supabase Storage
- [ ] Bucket `institution_documents` exist dan accessible
- [ ] Files terupload ke path yang benar
- [ ] RLS policies memblokir akses unauthorized

### Error Handling
- [ ] Network error: Show retry button
- [ ] File size > 5MB: Show error message
- [ ] Invalid file type: Show error message
- [ ] Database error: Show friendly error message
- [ ] Storage error: Show friendly error message

---

## Troubleshooting

### Error: "Could not find the 'institution_name' column"

**Penyebab**: Nama kolom di tabel institutions berbeda

**Solusi**:
1. Cek struktur tabel di Supabase:
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'institutions';
   ```
2. Jika nama kolom berbeda, update di `src/pages/auth/RegisterWizard.jsx` baris 253
   - Ganti `institution_name` dengan nama kolom yang benar
   - Juga update `.select()` statement

### Error: "Column 'admin_position' does not exist"

**Penyebab**: Tabel `institution_registrations` belum di-migrate dengan kolom baru

**Solusi**: 
```sql
ALTER TABLE institution_registrations
ADD COLUMN admin_position TEXT,
ADD COLUMN admin_phone TEXT,
ADD COLUMN documents JSONB;
```

### Error: "Bucket 'institution_documents' does not exist"

**Penyebab**: Storage bucket belum dibuat

**Solusi**: Buat bucket di Supabase > Storage:
- Name: `institution_documents`
- Access Level: Private
- Files can be downloaded with or without a token: ✓

### Upload fails silently

**Penyebab**: RLS policy tidak allow upload, atau bucket tidak accessible

**Solusi**:
1. Enable RLS policies di Storage
2. Ensure authenticated user has upload permission
3. Check browser console untuk error details

---

## Notes untuk Developer

1. **Environment Variables**: Pastikan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_PUBLISHABLE_KEY` sudah configured
2. **Auth State**: System sudah handle logout setelah registrasi berhasil
3. **Verification Flow**: Admin account tidak akan bisa login sampai Superadmin approve
4. **Email Verification**: Supabase auth akan send confirmation email, perlu di-configure

---

## References

- Supabase Documentation: https://supabase.com/docs
- Storage Documentation: https://supabase.com/docs/guides/storage
- RLS Documentation: https://supabase.com/docs/guides/auth/row-level-security
