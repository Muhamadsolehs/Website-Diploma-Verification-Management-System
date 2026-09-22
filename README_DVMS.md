# DVMS — Diploma Verification Management System

Sistem verifikasi ijazah berbasis OCR, SHA-256, IPFS, Supabase PostgreSQL, dan blockchain Polygon Amoy.

---

## 1. Deskripsi Sistem

DVMS (Diploma Verification Management System) merupakan sistem untuk membantu proses verifikasi ijazah secara digital.

Proses utama sistem:

1. Upload dokumen ijazah.
2. Ekstraksi data menggunakan EasyOCR.
3. Review dan koreksi data hasil OCR oleh admin.
4. Perhitungan SHA-256 terhadap file.
5. Upload file ke Pinata/IPFS.
6. Penyimpanan metadata ke Supabase PostgreSQL.
7. Anchoring hash dan data penting ke smart contract.
8. Penyimpanan bukti transaksi blockchain ke database.
9. Verifikasi ijazah melalui nomor ijazah atau dokumen.
10. Pencatatan aktivitas verifikasi.

---

# 2. Arsitektur Sistem

```text
                    DVMS
                     |
        +------------+------------+
        |                         |
 React Web                   Flutter Mobile
 Admin & HRD                 Alumni Wallet
        |                         |
        +----------- REST --------+
                    |
                 FastAPI
                    |
       +------------+------------+
       |            |            |
     OCR          Supabase     Pinata
   EasyOCR       PostgreSQL     IPFS
       |            |            |
       +------------+------------+
                    |
                 SHA-256
                    |
                 Web3.py
                    |
             Polygon Amoy
                    |
          DiplomaVerification
           Smart Contract
```

### Komunikasi

```text
React → FastAPI REST
Flutter → FastAPI REST / JSON-RPC
FastAPI → Supabase
FastAPI → Pinata
FastAPI → Polygon Amoy
Web3.py → Smart Contract
```

---

# 3. Teknologi yang Digunakan

| Komponen | Teknologi |
|---|---|
| Frontend | React + Vite |
| Backend | FastAPI + Python |
| OCR | EasyOCR |
| Database | Supabase PostgreSQL |
| File Storage | Pinata / IPFS |
| Hash | SHA-256 |
| Blockchain Library | Web3.py |
| Smart Contract | Solidity |
| Blockchain | Polygon Amoy Testnet |
| API Testing | FastAPI Swagger UI |

---

# 4. Informasi Project

| Parameter | Nilai |
|---|---|
| Project | DVMS — Diploma Verification Management System |
| Backend | FastAPI |
| Frontend | React + Vite |
| Database | Supabase PostgreSQL |
| OCR | EasyOCR |
| Storage | Pinata / IPFS |
| Blockchain | Polygon Amoy Testnet |
| Chain ID | 80002 |
| Smart Contract | DiplomaVerification |
| Contract Address | `0xBC62Eee229A4c1653dFb0Ed0A82d07825976dE76` |
| RPC | `https://polygon-amoy.drpc.org` |
| Native Token | POL |

> **Penting:** nilai secret seperti private key, Supabase secret key, dan Pinata credential tidak boleh dimasukkan ke README atau repository.

---

# 5. Struktur Project

```text
DVMS/
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── contracts/
│   │   └── DiplomaVerification.sol
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── diplomas.py
│   │   ├── ocr.py
│   │   └── verification.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── blockchain_service.py
│   │   ├── ocr_service.py
│   │   ├── pinata_service.py
│   │   └── supabase_service.py
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── diploma_parser.py
│   │   ├── file_utils.py
│   │   └── hash_utils.py
│   ├── venv/
│   ├── .env
│   ├── main.py
│   ├── deploy_contract.py
│   └── requirements.txt
│
└── README.md
```

`venv/`, `.env`, `__pycache__/`, dan credential tidak boleh di-commit.

---

# 6. Persiapan Environment

Pastikan tersedia:

- Node.js
- npm
- Python
- Git
- VS Code
- Browser
- Akun Supabase
- Akun Pinata
- Wallet blockchain
- POL testnet
- RPC Polygon Amoy

Cek Node.js:

```powershell
node --version
```

Cek npm:

```powershell
npm --version
```

Cek Python:

```powershell
python --version
```

Cek Git:

```powershell
git --version
```

---

# 7. Setup Backend

Masuk ke folder:

```powershell
cd backend
```

## 7.1 Membuat Virtual Environment

```powershell
python -m venv venv
```

Aktifkan:

```powershell
.\venv\Scripts\activate
```

Jika aktif, terminal akan menunjukkan:

```text
(venv)
```

## 7.2 Install Dependency

```powershell
pip install -r requirements.txt
```

---

# 8. Konfigurasi Backend `.env`

File:

```text
backend/.env
```

Format:

```env
SUPABASE_URL=https://wrrjjtqqnkqbyxumxqyc.supabase.co
SUPABASE_KEY=<SUPABASE_SECRET_KEY>

PINATA_API_KEY=<PINATA_API_KEY>
PINATA_API_SECRET=<PINATA_API_SECRET>
PINATA_JWT=<PINATA_JWT>

RPC_URL=https://polygon-amoy.drpc.org
PRIVATE_KEY=<WALLET_PRIVATE_KEY>
CONTRACT_ADDRESS=0xBC62Eee229A4c1653dFb0Ed0A82d07825976dE76
```

### Security

Jangan pernah commit:

```text
PRIVATE_KEY
SUPABASE_KEY
PINATA_API_KEY
PINATA_API_SECRET
PINATA_JWT
```

---

# 9. Setup Frontend

Buka terminal baru.

```powershell
cd frontend
```

Install dependency:

```powershell
npm install
```

Buat:

```text
frontend/.env
```

Isi:

```env
VITE_SUPABASE_URL=https://wrrjjtqqnkqbyxumxqyc.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<SUPABASE_PUBLISHABLE_KEY>
VITE_API_BASE_URL=http://127.0.0.1:8000
```

> Frontend menggunakan publishable key. Secret key hanya boleh berada di backend.

---

# 10. Cara Menjalankan Sistem

## Terminal 1 — Backend

```powershell
cd backend
.\venv\Scripts\activate
uvicorn main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

## Terminal 2 — Frontend

```powershell
cd frontend
npm run dev
```

Buka URL yang diberikan Vite, biasanya:

```text
http://localhost:5173
```

---

# 11. Health Check Backend

Buka:

```text
http://127.0.0.1:8000/health
```

Expected:

```json
{
  "success": true,
  "status": "healthy"
}
```

Jika hasil ini muncul, backend berhasil berjalan.

---

# 12. Swagger API

Buka:

```text
http://127.0.0.1:8000/docs
```

Swagger digunakan untuk melakukan testing API.

Endpoint utama:

```text
POST /api/diplomas/ocr
POST /api/diplomas/save
GET  /api/diplomas/{diploma_id}

POST /api/verification/anchor/{diploma_id}
GET  /api/verification/diploma/{diploma_id}
GET  /api/verification/number/{diploma_number}
POST /api/verification/document
GET  /api/verification/logs
```

---

# 13. Alur Utama DVMS

```text
Upload Ijazah
      ↓
Validasi File
      ↓
EasyOCR
      ↓
Parser Data
      ↓
SHA-256
      ↓
Upload Pinata/IPFS
      ↓
Review Admin
      ↓
Simpan ke Supabase
      ↓
Anchoring
      ↓
Polygon Amoy
      ↓
Transaction Hash
      ↓
Verifikasi
```

---

# 14. OCR

Format yang didukung:

```text
PDF
JPG
JPEG
PNG
```

Ukuran maksimum:

```text
5 MB
```

Data yang diekstrak:

```text
Nama Lengkap
NISN
Nomor Ijazah
Kompetensi Keahlian / Jurusan
Tempat Lahir
Tanggal Lahir
Tanggal Lulus
```

Contoh:

```text
Nama Lengkap: Ahmad Fauzan
NISN: 9999999999
Tempat Lahir: Bogor
Tanggal Lahir: 12 Januari 2005
Nomor Ijazah: DUMMY-2026-001
Kompetensi Keahlian: Teknik Komputer dan Jaringan
Tanggal Lulus: 15 Juni 2026
```

---

# 15. SHA-256

SHA-256 dihitung berdasarkan byte file asli.

Fungsi:

```python
calculate_sha256(file_bytes)
```

Contoh hash:

```text
77a97710ae22ce478f1f9ee2bc2e70528a97f7f63d467b5474bbb3157f97fca5
```

SHA-256 berfungsi sebagai fingerprint/identitas digital dokumen.

### Catatan Testing

File yang byte-nya sama menghasilkan hash yang sama.

Untuk testing diploma berbeda, gunakan file berbeda agar hash juga berbeda.

---

# 16. Pinata / IPFS

File ijazah di-upload ke Pinata dan menghasilkan:

```text
IPFS CID
```

Contoh:

```text
QmdFa9nmS9GZQUyVXp8aWwwygdvpyRxzfy7XvQqHL9sXRt
```

Gateway:

```text
https://gateway.pinata.cloud/ipfs/<CID>
```

CID yang disimpan di database dapat digunakan untuk mencari kembali file pada IPFS.

---

# 17. Supabase Database

Project Supabase:

```text
DVMS - Smart Contract
```

URL:

```text
https://wrrjjtqqnkqbyxumxqyc.supabase.co
```

## Tabel `institutions`

Menyimpan data institusi/sekolah.

## Tabel `alumni`

Field penting:

```text
id
institution_id
nisn
full_name
major
graduation_year
birth_place
birth_date
mobile_status
created_at
updated_at
```

## Tabel `diplomas`

Field penting:

```text
id
institution_id
alumni_id
diploma_number
nisn
major
graduation_date
document_hash
ipfs_cid
ocr_status
validity_status
anchored_at
document_path
document_name
document_mime_type
document_size
uploaded_at
created_at
updated_at
```

## Tabel `diploma_anchors`

Field penting:

```text
id
diploma_id
sha256_hash
ipfs_cid
polygon_tx_hash
network
gas_fee
status
anchored_at
created_at
```

## Tabel `verification_logs`

Field penting:

```text
id
diploma_id
diploma_number
result
verified_by
source
created_at
```

---

# 18. Blockchain Configuration

DVMS menggunakan:

```text
Network:
Polygon Amoy Testnet

Chain ID:
80002

RPC:
https://polygon-amoy.drpc.org

Native Token:
POL
```

Smart contract:

```text
DiplomaVerification
```

Contract address:

```text
0xBC62Eee229A4c1653dFb0Ed0A82d07825976dE76
```

---

# 19. Cara Cek Chain ID dari Terminal

Ini merupakan cara untuk mengecek Chain ID dari koneksi Web3.py backend.

Masuk:

```powershell
cd backend
```

Aktifkan virtual environment:

```powershell
.\venv\Scripts\activate
```

Jalankan:

```powershell
python
```

Import service:

```python
from services.blockchain_service import blockchain_service
```

Cek Chain ID:

```python
blockchain_service.web3.eth.chain_id
```

Expected:

```text
80002
```

### Cek seluruh informasi jaringan

```python
blockchain_service.get_network_info()
```

Expected:

```text
{
    'chain_id': 80002,
    'issuer_address': '0x28523d8d...',
    'balance_pol': '...',
    'contract_address': '0xBC62Eee229A4c1653dFb0Ed0A82d07825976dE76'
}
```

### Bukti

Screenshot terminal yang menunjukkan:

```text
chain_id: 80002
contract_address: 0xBC62...
```

dapat digunakan sebagai bukti bahwa backend mendapatkan Chain ID dari jaringan yang terhubung.

Keluar dari Python:

```python
exit()
```

---

# 20. Cara Cek Smart Contract dari Terminal

Jalankan Python:

```powershell
python
```

Import:

```python
from services.blockchain_service import blockchain_service
```

Cek contract:

```python
blockchain_service.contract_address
```

Expected:

```text
0xBC62Eee229A4c1653dFb0Ed0A82d07825976dE76
```

Cek issuer:

```python
blockchain_service.issuer_address
```

Cek Chain ID:

```python
blockchain_service.web3.eth.chain_id
```

Expected:

```text
80002
```

Cek informasi lengkap:

```python
blockchain_service.get_network_info()
```

---

# 21. Cara Mengecek Data Diploma di Blockchain

Gunakan SHA-256 diploma.

Import:

```python
from services.blockchain_service import blockchain_service
from utils.hash_utils import hash_to_bytes32
```

Masukkan hash:

```python
document_hash = hash_to_bytes32(
    "77a97710ae22ce478f1f9ee2bc2e70528a97f7f63d467b5474bbb3157f97fca5"
)
```

Verifikasi:

```python
blockchain_service.verify_diploma(document_hash)
```

Expected:

```text
{
    'is_registered': True,
    'ipfs_cid': '...',
    'student_name': '...',
    'issue_date': ...,
    'issuer': '0x...'
}
```

Jika:

```text
is_registered = True
```

berarti hash tersebut terdaftar pada smart contract.

---

# 22. Smart Contract

Source code:

```text
backend/contracts/DiplomaVerification.sol
```

Contract:

```text
DiplomaVerification
```

Fungsi anchoring:

```solidity
issueDiploma(
    bytes32 _documentHash,
    string memory _ipfsCID,
    string memory _studentName
)
```

Fungsi verifikasi:

```solidity
verifyDiploma(bytes32 _documentHash)
```

Data disimpan berdasarkan:

```solidity
mapping(bytes32 => Diploma) public diplomas;
```

Hash dokumen menjadi key untuk data diploma pada blockchain.

---

# 23. Alur Anchoring

```text
Diploma tersimpan di Supabase
        ↓
document_hash tersedia
        ↓
ipfs_cid tersedia
        ↓
FastAPI
        ↓
Web3.py
        ↓
issueDiploma()
        ↓
Polygon Amoy
        ↓
Transaction berhasil
        ↓
Transaction Hash
        ↓
diploma_anchors
        ↓
validity_status = active
```

---

# 24. Data Anchoring Test yang Berhasil

Contoh pengujian yang telah berhasil:

```text
Diploma Number:
DUMMY-2026-002
```

Diploma ID:

```text
0e7b7736-afb2-4a55-8ca0-bd197cd90e96
```

SHA-256:

```text
77a97710ae22ce478f1f9ee2bc2e70528a97f7f63d467b5474bbb3157f97fca5
```

IPFS CID:

```text
QmdFa9nmS9GZQUyVXp8aWwwygdvpyRxzfy7XvQqHL9sXRt
```

Transaction Hash:

```text
2d519efdad7eff1054e968d30576e5534beff92f78611cad989751b8eac0efc0
```

Block:

```text
47111288
```

Network:

```text
polygon-amoy
```

Chain ID:

```text
80002
```

Transaction Status:

```text
Success
```

Gas Used:

```text
177283
```

Gas Fee:

```text
0.013402594825706035 POL
```

Contract:

```text
0xBC62Eee229A4c1653dFb0Ed0A82d07825976dE76
```

Issuer:

```text
0x28523d8d6902E1b5a280001bEda8C8783626c207
```

---

# 25. Cara Mencari Data Diploma

Gunakan alur berikut jika ingin mencari bukti sebuah diploma:

```text
Nomor Ijazah
      ↓
Supabase
      ↓
diplomas
      ↓
Diploma ID
      ↓
diploma_anchors
      ↓
SHA-256
      ↓
Transaction Hash
      ↓
PolygonScan
```

Untuk mencari alumni:

```text
NISN
 ↓
alumni
```

Untuk mencari file:

```text
IPFS CID
 ↓
Pinata / IPFS Gateway
```

Untuk mencari aktivitas verifikasi:

```text
Diploma ID / Nomor Ijazah
 ↓
verification_logs
```

---

# 26. Public Verification

Portal:

```text
/verify
```

## Verifikasi berdasarkan Nomor Ijazah

```text
Nomor Ijazah
      ↓
Cari di Supabase
      ↓
Tidak ditemukan?
      ↓
not_registered
```

Jika ditemukan:

```text
Diploma
  ↓
validity_status
  ↓
document_hash
  ↓
Blockchain
  ↓
Hasil verifikasi
```

## Verifikasi berdasarkan Dokumen

```text
Upload Dokumen
      ↓
EasyOCR
      ↓
Nomor Ijazah
      ↓
Cari Supabase
      ↓
Hitung SHA-256
      ↓
Bandingkan hash
      ↓
Blockchain
      ↓
Hasil verifikasi
```

---

# 27. Status Verifikasi

### `valid`

Diploma ditemukan, aktif, hash sesuai, dan bukti blockchain tersedia.

### `revoked`

Diploma ditemukan tetapi statusnya dicabut.

### `not_registered`

Diploma tidak ditemukan atau tidak memenuhi kondisi verifikasi.

### `error`

Terjadi kesalahan saat proses verifikasi.

---

# 28. Database vs Blockchain

Supabase:

```text
Database aplikasi
Data alumni
Data institusi
Metadata diploma
Status diploma
Log verifikasi
```

Blockchain:

```text
Bukti anchoring
Document hash
IPFS CID
Issuer
Timestamp transaksi
```

Blockchain bersifat immutable.

Karena itu, menghapus data diploma dari Supabase tidak menghapus data yang sudah masuk blockchain.

Untuk verifikasi nomor ijazah, DVMS menggunakan data diploma di Supabase sebagai sumber utama untuk menentukan apakah nomor ijazah terdaftar. Blockchain digunakan sebagai lapisan pembuktian.

---

# 29. Testing End-to-End

Checklist:

```text
[ ] Backend berjalan
[ ] Frontend berjalan
[ ] Health check berhasil
[ ] Swagger dapat dibuka
[ ] Upload file berhasil
[ ] OCR berhasil
[ ] Data OCR benar
[ ] SHA-256 terbentuk
[ ] IPFS CID terbentuk
[ ] Diploma tersimpan di Supabase
[ ] Alumni terhubung
[ ] Anchoring berhasil
[ ] Transaction hash tersedia
[ ] Block number tersedia
[ ] Chain ID = 80002
[ ] Contract address benar
[ ] Transaction status success
[ ] Verification valid berhasil
[ ] Verification not_registered berhasil
[ ] Verification revoked berhasil
[ ] Document mismatch berhasil diuji
[ ] Verification log tercatat
```

---

# 30. Data yang Harus Dicatat Saat Testing

Untuk setiap pengujian blockchain, catat:

| Data | Nilai |
|---|---|
| Test ID | |
| Tanggal | |
| File | |
| Nomor Ijazah | |
| Diploma ID | |
| Alumni ID | |
| NISN | |
| SHA-256 | |
| IPFS CID | |
| Contract Address | |
| Network | Polygon Amoy |
| Chain ID | 80002 |
| Transaction Hash | |
| Block Number | |
| Gas Used | |
| Gas Fee | |
| Issuer Address | |
| Transaction Status | |
| Verification Result | |

---

# 31. Folder Dokumentasi

Disarankan membuat:

```text
documentation/
├── 01-setup/
├── 02-backend/
├── 03-frontend/
├── 04-ocr/
├── 05-supabase/
├── 06-ipfs/
├── 07-blockchain/
├── 08-testing/
└── 09-sidang/
```

## `01-setup`

```text
python-version.png
node-version.png
npm-version.png
```

## `02-backend`

```text
backend-running.png
health-check.png
swagger.png
```

## `04-ocr`

```text
upload.png
ocr-result.png
sha256.png
ipfs-cid.png
```

## `05-supabase`

```text
alumni-data.png
diploma-data.png
diploma-anchor-data.png
verification-logs.png
```

## `07-blockchain`

```text
chain-id-terminal.png
network-info-terminal.png
contract-address.png
transaction.png
block-number.png
blockchain-verification.png
```

## `08-testing`

```text
e2e-upload.png
e2e-save.png
e2e-anchor.png
e2e-verification.png
```

## `09-sidang`

```text
architecture.png
contract-proof.png
transaction-proof.png
verification-proof.png
```

---

# 32. Bukti Blockchain untuk Sidang

Bukti blockchain yang sebaiknya ditampilkan:

### 1. Chain ID

Terminal:

```text
chain_id = 80002
```

### 2. Contract

```text
DiplomaVerification
```

Address:

```text
0xBC62Eee229A4c1653dFb0Ed0A82d07825976dE76
```

### 3. Transaction

```text
2d519efdad7eff1054e968d30576e5534beff92f78611cad989751b8eac0efc0
```

### 4. Block

```text
47111288
```

### 5. Document Hash

```text
77a97710ae22ce478f1f9ee2bc2e70528a97f7f63d467b5474bbb3157f97fca5
```

### 6. IPFS CID

```text
QmdFa9nmS9GZQUyVXp8aWwwygdvpyRxzfy7XvQqHL9sXRt
```

### 7. Status

```text
Success
```

---

# 33. Troubleshooting

## Backend tidak berjalan

```powershell
cd backend
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

## Frontend tidak terhubung

Periksa:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Restart Vite:

```powershell
npm run dev
```

## Chain ID bukan 80002

Jalankan:

```python
from services.blockchain_service import blockchain_service
blockchain_service.web3.eth.chain_id
```

Jika bukan:

```text
80002
```

periksa:

```env
RPC_URL=https://polygon-amoy.drpc.org
```

Kemudian restart backend.

## Contract tidak ditemukan

Periksa:

```env
CONTRACT_ADDRESS=0xBC62Eee229A4c1653dFb0Ed0A82d07825976dE76
```

Jangan deploy ulang hanya karena frontend belum menemukan contract.

## Transaction gagal

Jalankan:

```python
blockchain_service.get_network_info()
```

Pastikan:

```text
Chain ID = 80002
Balance POL cukup
Contract address benar
RPC terhubung
```

## OCR gagal

Periksa:

```text
Format file
Ukuran <= 5 MB
Kualitas scan
Teks cukup jelas
EasyOCR berhasil diinisialisasi
```

## Diploma sudah terdaftar

Smart contract memiliki proteksi:

```solidity
require(
    !diplomas[_documentHash].isRegistered,
    "Diploma already registered"
);
```

Artinya hash yang sama tidak dapat di-anchor dua kali pada contract tersebut.

Gunakan file berbeda untuk pengujian baru.

---

# 34. Security Checklist

```text
[ ] .env tidak di-commit
[ ] Private key tidak ada di source code
[ ] Supabase secret key hanya di backend
[ ] Pinata credential hanya di backend
[ ] Frontend hanya menggunakan publishable key
[ ] node_modules tidak di-commit
[ ] venv tidak di-commit
[ ] __pycache__ tidak di-commit
```

`.gitignore` minimal:

```gitignore
.env
venv/
__pycache__/
*.pyc
node_modules/
dist/
```

---

# 35. Quick Command Reference

## Backend

```powershell
cd backend
.\venv\Scripts\activate
uvicorn main:app --reload
```

## Frontend

```powershell
cd frontend
npm run dev
```

## Install backend dependency

```powershell
cd backend
.\venv\Scripts\activate
pip install -r requirements.txt
```

## Install frontend dependency

```powershell
cd frontend
npm install
```

## Health

```text
http://127.0.0.1:8000/health
```

## Swagger

```text
http://127.0.0.1:8000/docs
```

## Check Chain ID

```powershell
cd backend
.\venv\Scripts\activate
python
```

```python
from services.blockchain_service import blockchain_service
blockchain_service.web3.eth.chain_id
```

Expected:

```text
80002
```

## Check Network

```python
blockchain_service.get_network_info()
```

## Check Contract

```python
blockchain_service.contract_address
```

## Check Issuer

```python
blockchain_service.issuer_address
```

## Verify Blockchain Diploma

```python
from utils.hash_utils import hash_to_bytes32

document_hash = hash_to_bytes32(
    "<SHA256_HASH>"
)

blockchain_service.verify_diploma(document_hash)
```

---

# 36. Reference Data Test

### Blockchain

```text
Network:
Polygon Amoy Testnet

Chain ID:
80002

Contract:
DiplomaVerification

Contract Address:
0xBC62Eee229A4c1653dFb0Ed0A82d07825976dE76
```

### Transaction

```text
Transaction Hash:
2d519efdad7eff1054e968d30576e5534beff92f78611cad989751b8eac0efc0

Block:
47111288

Gas Used:
177283

Gas Fee:
0.013402594825706035 POL

Status:
Success
```

### Document

```text
SHA-256:
77a97710ae22ce478f1f9ee2bc2e70528a97f7f63d467b5474bbb3157f97fca5

IPFS CID:
QmdFa9nmS9GZQUyVXp8aWwwygdvpyRxzfy7XvQqHL9sXRt
```

---

# 37. Status Dokumentasi

```text
[ ] Setup project
[ ] Setup backend
[ ] Setup frontend
[ ] Setup Supabase
[ ] Setup Pinata
[ ] Setup Polygon Amoy
[ ] Setup wallet
[ ] Contract address
[ ] Chain ID
[ ] RPC
[ ] OCR
[ ] SHA-256
[ ] IPFS
[ ] Save diploma
[ ] Anchor diploma
[ ] Transaction hash
[ ] Block number
[ ] Gas fee
[ ] Blockchain verification
[ ] Public verification
[ ] Verification logs
[ ] Screenshot bukti
[ ] Testing valid
[ ] Testing not registered
[ ] Testing revoked
[ ] Testing document mismatch
```

---

# 38. Ringkasan Sistem

```text
UPLOAD
  ↓
EASYOCR
  ↓
PARSER
  ↓
SHA-256
  ↓
PINATA / IPFS
  ↓
SUPABASE
  ↓
WEB3.PY
  ↓
POLYGON AMOY
  ↓
SMART CONTRACT
  ↓
TRANSACTION HASH
  ↓
VERIFICATION
```

Pembagian fungsi:

```text
React
→ Tampilan dan interaksi pengguna

FastAPI
→ Backend dan orchestrator

EasyOCR
→ Ekstraksi data dokumen

SHA-256
→ Fingerprint dokumen

Pinata/IPFS
→ Penyimpanan file

Supabase
→ Database aplikasi

Web3.py
→ Koneksi backend ke blockchain

Polygon Amoy
→ Jaringan blockchain testnet

DiplomaVerification
→ Smart contract

Blockchain
→ Bukti anchoring immutable
```

---

## End of README
