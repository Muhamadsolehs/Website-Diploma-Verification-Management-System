# 🗄️ Database Setup Checklist - DVMS Registration Feature

**Status**: Follow this checklist to ensure database is ready for registration feature

---

## Step 1: Verify institutions Table

### Check if table exists
```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name = 'institutions'
);
```

### Check columns
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'institutions'
ORDER BY ordinal_position;
```

### Expected structure
```
Column          | Type      | Nullable
institution_name | TEXT      | NO       ← CRITICAL: Must be 'institution_name', not 'name'
npsn            | TEXT      | NO
address         | TEXT      | NO
phone           | TEXT      | YES
status          | TEXT      | YES
created_at      | TIMESTAMP | YES
updated_at      | TIMESTAMP | YES
```

### Create table if missing
```sql
CREATE TABLE IF NOT EXISTS public.institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_name TEXT NOT NULL,
  npsn TEXT NOT NULL UNIQUE,
  address TEXT NOT NULL,
  phone TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

---

## Step 2: Verify institution_registrations Table

### Check if table exists
```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name = 'institution_registrations'
);
```

### Check current columns
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'institution_registrations'
ORDER BY ordinal_position;
```

### Check if new columns exist
```sql
SELECT 
  EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='institution_registrations' AND column_name='admin_position') as has_admin_position,
  EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='institution_registrations' AND column_name='admin_phone') as has_admin_phone,
  EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='institution_registrations' AND column_name='documents') as has_documents;
```

### Add missing columns
```sql
-- Add new columns if they don't exist
ALTER TABLE institution_registrations
ADD COLUMN admin_position TEXT;

ALTER TABLE institution_registrations
ADD COLUMN admin_phone TEXT;

ALTER TABLE institution_registrations
ADD COLUMN documents JSONB;
```

### Expected structure (full)
```
Column                  | Type      | Nullable
id                      | UUID      | NO
institution_name        | TEXT      | NO
institution_npsn        | TEXT      | NO
institution_address     | TEXT      | NO
institution_email       | TEXT      | NO
admin_full_name         | TEXT      | NO
admin_nip               | TEXT      | NO
admin_position          | TEXT      | YES      ← NEW
admin_phone             | TEXT      | YES      ← NEW
admin_email             | TEXT      | NO
auth_user_id            | UUID      | NO
documents               | JSONB     | YES      ← NEW
status                  | TEXT      | YES
created_at              | TIMESTAMP | YES
updated_at              | TIMESTAMP | YES
```

### Create table if missing
```sql
CREATE TABLE IF NOT EXISTS public.institution_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_name TEXT NOT NULL,
  institution_npsn TEXT NOT NULL,
  institution_address TEXT NOT NULL,
  institution_email TEXT NOT NULL,
  admin_full_name TEXT NOT NULL,
  admin_nip TEXT NOT NULL,
  admin_position TEXT,
  admin_phone TEXT,
  admin_email TEXT NOT NULL,
  auth_user_id UUID NOT NULL,
  documents JSONB,
  status TEXT DEFAULT 'manual_verification',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

---

## Step 3: Setup Supabase Storage

### Check if bucket exists
Go to Supabase Dashboard → Storage

### Create bucket if missing
1. Click "New Bucket"
2. Name: `institution_documents`
3. Access level: **Private** (important!)
4. Click "Create Bucket"

### Verify bucket settings
- Name: `institution_documents` ✓
- Access: Private ✓
- Size limit: Set appropriate limit

---

## Step 4: Setup Row Level Security (RLS)

### Enable RLS on tables

```sql
-- Enable RLS on institutions table
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on institution_registrations table
ALTER TABLE institution_registrations ENABLE ROW LEVEL SECURITY;
```

### Create RLS Policies for institutions

```sql
-- Allow authenticated users to insert
CREATE POLICY "Allow insert institutions for auth users"
  ON institutions
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Allow select only for superadmin
CREATE POLICY "Allow superadmin select institutions"
  ON institutions
  FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin'
  );
```

### Create RLS Policies for institution_registrations

```sql
-- Allow authenticated users to insert
CREATE POLICY "Allow insert registration for auth users"
  ON institution_registrations
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Allow select for superadmin and creator
CREATE POLICY "Allow select registration"
  ON institution_registrations
  FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin'
    OR auth_user_id = auth.uid()
  );
```

### Create RLS Policies for Storage

```sql
-- Allow authenticated users to upload
CREATE POLICY "Allow upload for authenticated users"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'institution_documents'
  );

-- Allow read for creator and superadmin
CREATE POLICY "Allow read for authorized users"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'institution_documents'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'superadmin'
    )
  );
```

---

## Step 5: Verify profiles Table

### Check if profiles table exists and has institution_id
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
```

### Ensure institution_id column exists
```sql
ALTER TABLE profiles
ADD COLUMN institution_id UUID REFERENCES institutions(id);
```

### Verify columns
```
Column              | Type
id                  | UUID
institution_id      | UUID      ← Must exist
role                | TEXT
full_name           | TEXT
nip                 | TEXT
account_status      | TEXT
```

---

## Step 6: Test Setup

### Test 1: Insert into institutions
```sql
INSERT INTO institutions (institution_name, npsn, address, status)
VALUES ('Test School', '001001', 'Test Address', 'pending')
RETURNING id, institution_name;
```

### Test 2: Check Storage Access
- Try uploading a test file via Supabase dashboard
- Verify file appears in `institution_documents` bucket
- Try accessing file URL

### Test 3: Verify Foreign Keys
```sql
-- Check relationships
SELECT CONSTRAINT_NAME 
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'institution_registrations';
```

---

## Step 7: Final Verification

### Checklist
- [ ] `institutions` table exists with `institution_name` column
- [ ] `institution_registrations` table exists
- [ ] Columns `admin_position`, `admin_phone`, `documents` added
- [ ] `institution_documents` storage bucket created
- [ ] Storage bucket is set to **Private**
- [ ] RLS enabled on both tables
- [ ] RLS policies created
- [ ] `profiles` table has `institution_id` column
- [ ] Foreign key relationships verified
- [ ] Test insert successful
- [ ] Storage access verified

---

## Troubleshooting

### Error: "Could not find the 'institution_name' column"
**Solution**: Ensure column is named exactly `institution_name`, not `name`

### Error: "Column 'admin_position' does not exist"
**Solution**: Run the ALTER TABLE command to add missing columns

### Error: "Bucket 'institution_documents' not found"
**Solution**: Create the bucket in Supabase Storage dashboard

### Error: "You do not have permission to perform this operation"
**Solution**: Check RLS policies, ensure authenticated user has INSERT permission

### Upload fails with 413 error
**Solution**: Check bucket size limit, might need to increase

---

## Database Maintenance

### After first registration
```sql
-- Check data
SELECT id, institution_name, npsn, status FROM institutions LIMIT 5;
SELECT id, institution_name, admin_full_name, status FROM institution_registrations LIMIT 5;
SELECT auth_user_id, role, institution_id FROM profiles LIMIT 5;
```

### Monitor storage usage
```
Supabase Dashboard → Storage → institution_documents
```

---

## Useful Queries

### List all registrations with status
```sql
SELECT id, institution_name, admin_full_name, status, created_at
FROM institution_registrations
ORDER BY created_at DESC;
```

### Count by status
```sql
SELECT status, COUNT(*) 
FROM institution_registrations
GROUP BY status;
```

### Get registration with documents
```sql
SELECT id, institution_name, documents
FROM institution_registrations
WHERE documents IS NOT NULL
LIMIT 10;
```

### Check pending verifications
```sql
SELECT id, institution_name, admin_email, created_at
FROM institution_registrations
WHERE status = 'manual_verification'
ORDER BY created_at ASC;
```

---

**Last Updated**: 2026-09-02
**Status**: Ready for Setup
