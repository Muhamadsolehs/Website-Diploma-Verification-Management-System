# DVMS Frontend

Frontend React + Vite + Tailwind CSS yang direkonstruksi dari referensi UI DVMS.

## Struktur

```text
src/
├─ assets/
├─ components/
│  ├─ admin/
│  ├─ layout/
│  └─ public/
├─ pages/
│  ├─ auth/
│  ├─ admin/
│  ├─ public/
│  └─ superadmin/
├─ App.jsx
├─ index.css
└─ main.jsx
```

## Route

- `/` — Portal verifikasi publik
- `/verify/result` — hasil verifikasi valid
- `/verify/not-found` — hasil verifikasi tidak terdaftar
- `/login` — Admin Portal
- `/register` — Registrasi Institusi 4 langkah
- `/admin` — Dashboard institusi
- `/admin/alumni` — Alumni Management
- `/admin/diplomas` — Diploma Management
- `/admin/diplomas/ocr` — OCR / ekstraksi dokumen
- `/admin/anchoring` — Web3 Anchoring Ledger
- `/superadmin` — Global Dashboard
- `/superadmin/institutions` — Manajemen Instansi

## Jalankan

```bash
npm install
npm run dev
```

> Data pada implementasi ini masih mock/static. Integrasi Supabase/PostgreSQL, Pinata/IPFS, autentikasi, OCR, dan Polygon/Web3 dapat dipasang di layer `src/lib` dan `src/services` pada tahap berikutnya.
