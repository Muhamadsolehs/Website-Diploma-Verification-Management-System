# 🎓 DVMS — Diploma Verification Management System

<p align="center">
  <strong>Sistem Verifikasi Keaslian Ijazah Terdesentralisasi Berbasis AI-OCR, Kriptografi SHA-256, IPFS, dan Blockchain Polygon Amoy</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Python_3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/Solidity-363636?style=for-the-badge&logo=solidity&logoColor=white" alt="Solidity" />
  <img src="https://img.shields.io/badge/Polygon_Amoy-8247E5?style=for-the-badge&logo=polygon&logoColor=white" alt="Polygon" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/IPFS_Pinata-65C2CB?style=for-the-badge&logo=ipfs&logoColor=white" alt="IPFS" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" alt="License" />
</p>

---

## 📌 Daftar Isi

- [Tentang Proyek](#-tentang-proyek)
- [Fitur Utama](#-fitur-utama)
- [Arsitektur Sistem](#-arsitektur-sistem)
- [Alur Kerja (Workflow)](#-alur-kerja-workflow)
- [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
- [Informasi Smart Contract](#-informasi-smart-contract)
- [Struktur Direktori](#-struktur-direktori)
- [Persiapan & Instalasi](#-persiapan--instalasi)
  - [Prasyarat](#prasyarat)
  - [1. Setup Backend](#1-setup-backend-fastapi)
  - [2. Setup Frontend](#2-setup-frontend-react--vite)
- [Konfigurasi Environment (.env)](#-konfigurasi-environment-env)
- [Daftar Endpoint API Backend](#-daftar-endpoint-api-backend)
- [Skenario Pengujian Verifikasi](#-skenario-pengujian-verifikasi)
- [Keamanan & Best Practices](#-keamanan--best-practices)
- [Lisensi](#-lisensi)

---

## 📖 Tentang Proyek

**DVMS (Diploma Verification Management System)** adalah platform terintegrasi yang dirancang untuk mengatasi permasalahan pemalsuan ijazah dan birokrasi verifikasi dokumen kelulusan yang memakan waktu. 

Dengan menggabungkan kecerdasan buatan (**EasyOCR**), algoritma hashing (**SHA-256**), penyimpanan desentralisasi (**IPFS Pinata**), database relasional modern (**Supabase PostgreSQL**), dan **Smart Contract pada Blockchain Polygon Amoy**, DVMS memberikan jaminan keaslian data yang **immutable (tidak dapat diubah)**, **transparan**, dan dapat **diverifikasi secara instan** oleh institusi pendidikan, alumni, maupun pihak perusahaan/HRD.

---

## ✨ Fitur Utama

- 🔍 **Ekstraksi Dokumen Otomatis (AI-OCR)**: Mengekstrak teks dari ijazah (PDF/JPG/PNG) secara otomatis seperti Nama Siswa, NISN, Nomor Ijazah, Jurusan, dan Tanggal Kelulusan menggunakan EasyOCR dengan parser cerdas.
- 🔒 **Sidik Jari Digital Dokumen (SHA-256)**: Menghitung nilai hash unik dari file ijazah asli untuk mendeteksi perubahan sekecil apapun pada dokumen (*tamper-proof*).
- 🌐 **Penyimpanan Dokumen Terdesentralisasi (IPFS)**: Mengunggah berkas ijazah ke InterPlanetary File System (IPFS) via Pinata Cloud, menghasilkan alamat konten unik (CID).
- ⛓️ **Anchoring ke Blockchain (Polygon Amoy Testnet)**: Menanamkan hash dokumen, IPFS CID, dan metadata kelulusan ke Smart Contract Solidity pada jaringan Polygon Amoy.
- ⚡ **Verifikasi Publik Multi-Kanal**:
  - **Verifikasi Nomor Ijazah**: Verifikasi cepat berdasarkan nomor ijazah resmi.
  - **Verifikasi Unggah Dokumen**: Pengecekan keaslian dengan menghitung ulang hash file yang diunggah dan mencocokkannya ke blockchain dan database secara realtime.
- 🏢 **Multi-Role Portal**:
  - **Publik**: Portal pencarian dan verifikasi instan tanpa perlu login.
  - **Admin Institusi**: Manajemen data alumni, penerbitan ijazah, review hasil OCR, proses anchoring blockchain, dan audit log.
  - **Superadmin**: Pengawasan dan manajemen institusi pendidikan yang terdaftar.
- 📊 **Audit & Verification Logging**: Pencatatan riwayat setiap aktivitas verifikasi ke database untuk keperluan analitik dan pemantauan keamanan.

---

## 🏛️ Arsitektur Sistem

```text
┌─────────────────────────────────────────────────────────────┐
│                       DVMS PLATFORM                         │
└────────────────────────────────┬────────────────────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 │                               │
        ┌────────▼────────┐             ┌────────▼────────┐
        │  React + Vite   │             │  Mobile App     │
        │  (Admin & HRD)  │             │ (Alumni Wallet) │
        └────────┬────────┘             └────────┬────────┘
                 │                               │
                 └──────────────┬────────────────┘
                                │ REST API (HTTP/JSON)
                        ┌───────▼───────┐
                        │    FastAPI    │
                        │ (Backend Core)│
                        └───┬───┬───┬───┘
            ┌───────────────┘   │   └───────────────┐
            │                   │                   │
    ┌───────▼───────┐   ┌───────▼───────┐   ┌───────▼───────┐
    │    EasyOCR    │   │   Supabase    │   │    Pinata     │
    │  (AI Engine)  │   │  PostgreSQL   │   │     IPFS      │
    └───────┬───────┘   └───────────────┘   └───────────────┘
            │
    ┌───────▼───────┐
    │ SHA-256 Hash  │
    └───────┬───────┘
            │ Web3.py
    ┌───────▼──────────────────────────┐
    │       Polygon Amoy Testnet       │
    │   DiplomaVerification Contract   │
    └──────────────────────────────────┘
```

---

## 🔄 Alur Kerja (Workflow)

```text
1. Unggah Ijazah ──► 2. EasyOCR ──► 3. Data Parser ──► 4. Hitung SHA-256
                                                              │
7. Polygon Amoy ◄── 6. Simpan Metadata ◄── 5. Upload File ◄───┘
   (Anchoring TX)     ke Supabase           ke Pinata IPFS
         │
         ▼
8. Ijazah Terverifikasi di Blockchain ──► 9. Publik/HRD Melakukan Verifikasi
```

1. **Upload Ijazah**: Institusi mengunggah berkas ijazah siswa (PDF / JPG / PNG).
2. **Ekstraksi OCR**: Sistem mengekstrak teks dokumen menggunakan model EasyOCR.
3. **Data Parsing & Review**: Parser mengidentifikasi data kunci (Nama, NISN, No Ijazah, Jurusan), lalu admin dapat mereview dan mengoreksi jika diperlukan.
4. **Kalkulasi SHA-256**: Dokumen diproses untuk menghasilkan hash 256-bit sebagai identitas unik berkas.
5. **Upload IPFS**: Dokumen diunggah ke jaringan IPFS melalui Pinata Gateway untuk mendapatkan IPFS Content Identifier (CID).
6. **Penyimpanan Database**: Metadata lengkap ijazah disimpan ke database Supabase PostgreSQL.
7. **Blockchain Anchoring**: Hash dokumen, CID, dan nama siswa dicatatkan ke Smart Contract di jaringan Polygon Amoy menggunakan Web3.py.
8. **Verifikasi Publik**: Pihak ketiga dapat memverifikasi keaslian dokumen kapan saja dengan mencocokkan hash dokumen langsung ke smart contract.

---

## 💻 Teknologi yang Digunakan

| Kategori | Teknologi | Deskripsi |
|---|---|---|
| **Frontend** | React 18, Vite | Framework UI modern berkemampuan tinggi |
| **Styling** | Tailwind CSS, Lucide React | Desain antarmuka responsif dan modern |
| **Backend** | FastAPI, Uvicorn | RESTful API berbasis Python performa tinggi |
| **AI / OCR** | EasyOCR, PyMuPDF, OpenCV | Ekstraksi teks otomatis dari gambar dan PDF |
| **Kriptografi** | Python `hashlib` (SHA-256) | Pembuatan digital signature/fingerprint |
| **Database** | Supabase (PostgreSQL) | Manajemen data institusi, alumni, ijazah, dan log |
| **Decentralized Storage** | Pinata Cloud / IPFS | Penyimpanan file permanen berbasis CID |
| **Smart Contract** | Solidity (`^0.8.20`) | Kontrak cerdas pencatatan status ijazah |
| **Web3 Client** | Web3.py | Interaksi antara FastAPI dan Polygon Blockchain |
| **Blockchain Network** | Polygon Amoy Testnet | Jaringan Ethereum L2 EVM-compatible yang efisien |

---

## ⛓️ Informasi Smart Contract

Smart Contract `DiplomaVerification` dideploy pada testnet **Polygon Amoy**:

| Parameter | Keterangan |
|---|---|
| **Nama Kontrak** | `DiplomaVerification.sol` |
| **Network** | Polygon Amoy Testnet |
| **Chain ID** | `80002` |
| **Alamat Kontrak** | [`0xBC62Eee229A4c1653dFb0Ed0A82d07825976dE76`](https://amoy.polygonscan.com/address/0xBC62Eee229A4c1653dFb0Ed0A82d07825976dE76) |
| **RPC URL** | `https://polygon-amoy.drpc.org` |
| **Native Token** | POL |

### Fungsi Kontrak Utama:
- `issueDiploma(bytes32 _documentHash, string _ipfsCID, string _studentName)`: Mencatat ijazah ke blockchain (hanya dapat dilakukan sekali per hash dokumen).
- `verifyDiploma(bytes32 _documentHash)`: Memeriksa apakah hash terdaftar, mengembalikan CID, nama siswa, timestamp, dan address penerbit.

---

## 📁 Struktur Direktori

```text
DVMS/
├── backend/
│   ├── contracts/
│   │   └── DiplomaVerification.sol      # Smart contract Solidity
│   ├── routes/
│   │   ├── ocr.py                       # Endpoint OCR extraction
│   │   ├── diplomas.py                  # Endpoint manajemen ijazah
│   │   └── verification.py              # Endpoint anchoring & verifikasi
│   ├── services/
│   │   ├── blockchain_service.py        # Logika Web3.py & interaksi kontrak
│   │   ├── ocr_service.py               # Engine EasyOCR
│   │   ├── pinata_service.py            # Integrasi upload IPFS Pinata
│   │   └── supabase_service.py          # Operasi database Supabase
│   ├── utils/
│   │   ├── diploma_parser.py            # Regex & logic parser data ijazah
│   │   ├── file_utils.py                # Konversi file & handling PDF/gambar
│   │   └── hash_utils.py                # Perhitungan hash SHA-256 & bytes32
│   ├── deploy_contract.py               # Script deployment smart contract
│   ├── main.py                          # Entry point aplikasi FastAPI
│   └── requirements.txt                 # Dependensi Python
│
├── frontend/
│   ├── public/                          # Asset publik
│   ├── src/
│   │   ├── components/                  # Komponen UI (Admin, Public, Layout)
│   │   ├── pages/
│   │   │   ├── admin/                   # Dashboard, Alumni, Diplomas, Anchoring
│   │   │   ├── auth/                    # Login & Registrasi Institusi
│   │   │   ├── public/                  # Halaman Verifikasi Publik & Hasil
│   │   │   └── superadmin/              # Manajemen Instansi Global
│   │   ├── App.jsx                      # Router & konfigurasi rute aplikasi
│   │   └── main.jsx                     # Entry point React
│   ├── .env.example                     # Contoh template env frontend
│   ├── package.json                     # Dependensi Node.js
│   ├── tailwind.config.js               # Konfigurasi Tailwind CSS
│   └── vite.config.js                   # Konfigurasi Vite
│
├── README_DVMS.md                       # Dokumentasi teknis & referensi lengkap
└── README.md                            # Dokumentasi utama repositori
```

---

## 🚀 Persiapan & Instalasi

### Prasyarat
Pastikan perangkat Anda telah terpasang:
- **Node.js** (v18.0.0 atau lebih baru) & **npm**
- **Python** (v3.10 atau v3.11 disarankan)
- **Git**
- Akun layanan eksternal: **Supabase**, **Pinata Cloud**, dan **MetaMask/Web3 Wallet** dengan saldo POL di Amoy Testnet.

---

### 1. Setup Backend (FastAPI)

1. Masuk ke direktori backend:
   ```bash
   cd backend
   ```

2. Buat virtual environment Python:
   ```bash
   python -m venv venv
   ```

3. Aktifkan virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     .\venv\Scripts\activate
     ```
   - **Linux / macOS**:
     ```bash
     source venv/bin/activate
     ```

4. Install semua dependensi Python:
   ```bash
   pip install -r requirements.txt
   ```

5. Buat dan lengkapi file `.env` di folder `backend/` (lihat bagian [Konfigurasi Environment](#-konfigurasi-environment-env)).

6. Jalankan server FastAPI:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   Server backend akan aktif di: `http://127.0.0.1:8000`  
   Dokumentasi interaktif Swagger UI: `http://127.0.0.1:8000/docs`

---

### 2. Setup Frontend (React + Vite)

1. Buka terminal baru dan masuk ke direktori frontend:
   ```bash
   cd frontend
   ```

2. Pasang dependensi JavaScript:
   ```bash
   npm install
   ```

3. Salin file template environment:
   ```bash
   cp .env.example .env
   ```
   Atau di Windows PowerShell:
   ```powershell
   Copy-Item .env.example .env
   ```

4. Jalankan development server:
   ```bash
   npm run dev
   ```
   Frontend akan dapat diakses melalui browser pada: `http://localhost:5173`

---

## 🔐 Konfigurasi Environment (.env)

> ⚠️ **PENTING: JANGAN PERNAH MENGUNGGAH FILE `.env` ASLI ATAU PRIVATE KEY KE GITHUB / REPOSITORI PUBLIK!**

### Backend (`backend/.env`)
```env
# Supabase Configuration
SUPABASE_URL=https://<YOUR_PROJECT_ID>.supabase.co
SUPABASE_KEY=<YOUR_SUPABASE_SERVICE_ROLE_KEY>

# Pinata IPFS Configuration
PINATA_API_KEY=<YOUR_PINATA_API_KEY>
PINATA_API_SECRET=<YOUR_PINATA_API_SECRET>
PINATA_JWT=<YOUR_PINATA_JWT>

# Blockchain Polygon Amoy Configuration
RPC_URL=https://polygon-amoy.drpc.org
PRIVATE_KEY=<YOUR_DEPLOYER_WALLET_PRIVATE_KEY>
CONTRACT_ADDRESS=0xBC62Eee229A4c1653dFb0Ed0A82d07825976dE76
```

### Frontend (`frontend/.env`)
```env
# Supabase Configuration (Gunakan Publishable/Anon Key)
VITE_SUPABASE_URL=https://<YOUR_PROJECT_ID>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<YOUR_SUPABASE_ANON_KEY>

# Backend API URL
VITE_API_BASE_URL=http://127.0.0.1:8000
```

---

## 📡 Daftar Endpoint API Backend

| Kategori | Method | Endpoint | Deskripsi |
|---|---|---|---|
| **System** | `GET` | `/` | Pengecekan status layanan root |
| **System** | `GET` | `/health` | Health check endpoint |
| **OCR** | `POST` | `/api/ocr/extract` | Unggah file & jalankan ekstraksi EasyOCR |
| **Diplomas** | `POST` | `/api/diplomas/save` | Simpan data ijazah & unggah ke IPFS |
| **Diplomas** | `GET` | `/api/diplomas/{diploma_id}` | Ambil detail ijazah berdasarkan ID |
| **Anchoring** | `POST` | `/api/verification/anchor/{diploma_id}` | Catat hash ijazah ke Smart Contract Polygon |
| **Verifikasi** | `GET` | `/api/verification/diploma/{diploma_id}` | Verifikasi status ijazah via ID |
| **Verifikasi** | `GET` | `/api/verification/number/{diploma_number}` | Verifikasi publik via Nomor Ijazah |
| **Verifikasi** | `POST` | `/api/verification/document` | Verifikasi publik via unggah file dokumen |
| **Logs** | `GET` | `/api/verification/logs` | Riwayat aktivitas log verifikasi |

---

## 🧪 Skenario Pengujian Verifikasi

| Skenario | Input | Output / Status | Keterangan |
|---|---|---|---|
| **1. Dokumen Sah** | File ijazah asli atau nomor ijazah yang sudah di-anchor | `VALID` / `Registered` | Hash dokumen cocok 100% dengan data yang tersimpan di Blockchain & Supabase. |
| **2. Tidak Ditemukan** | Nomor ijazah acak atau file belum pernah didaftarkan | `NOT_FOUND` / `Not Registered` | Dokumen tidak ditemukan di ledger blockchain maupun database. |
| **3. Dokumen Palsu / Modifikasi** | File ijazah asli yang telah diedit 1 karakter teks / gambar | `TAMPERED` / `Hash Mismatch` | Nilai hash SHA-256 berubah total; sistem menolak keabsahan dokumen. |

---

## 🛡️ Keamanan & Best Practices

1. **Prinsip Least Privilege**: Frontend hanya mengonsumsi `anon/publishable key`, sedangkan akses penuh database dan private key blockchain hanya berada pada layer Backend FastAPI.
2. **Immutability Assurance**: Sekali transaksi berhasil ditambang di jaringan Polygon Amoy, rekaman hash tidak dapat dihapus, diganti, atau dipalsukan oleh siapapun.
3. **Data Integrity**: Memverifikasi kesesuaian antara file fisik, metadata database, dan ledger smart contract secara paralel.

---

## 📄 Lisensi

Didistribusikan di bawah lisensi **MIT License**. Lihat file `LICENSE` untuk informasi lebih lanjut.

---

<p align="center">
  Dibuat dengan ❤️ untuk sistem pendidikan yang transparan, aman, dan berintegritas.
</p>