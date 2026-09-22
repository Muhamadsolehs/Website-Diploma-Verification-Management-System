from fastapi import APIRouter, File, HTTPException, UploadFile

from services.ocr_service import ocr_service
from services.pinata_service import pinata_service
from utils.file_utils import get_file_mime_type
from utils.hash_utils import calculate_sha256


router = APIRouter(
    prefix="/api/diplomas",
    tags=["Diploma OCR"],
)


@router.post("/ocr")
async def process_diploma_ocr(
    file: UploadFile = File(...),
):
    """
    Memproses ijazah menggunakan OCR dan meng-upload
    dokumen ke Pinata IPFS.

    Tahapan:
    1. Membaca file
    2. Menghitung SHA-256
    3. Menjalankan EasyOCR
    4. Mengekstrak data ijazah
    5. Meng-upload file ke Pinata
    6. Mengembalikan CID IPFS
    """

    try:
        file_bytes = await file.read()

        if not file.filename:
            raise ValueError(
                "Nama file tidak ditemukan."
            )

        mime_type = get_file_mime_type(
            file.filename
        )

        # Hitung SHA-256 file asli
        document_hash = calculate_sha256(
            file_bytes
        )

        # Proses OCR
        result = ocr_service.process_document(
            filename=file.filename,
            file_bytes=file_bytes,
        )

        # Upload file ke Pinata
        pinata_result = pinata_service.upload_file(
            filename=file.filename,
            file_bytes=file_bytes,
            mime_type=mime_type,
        )

        return {
            "success": True,
            "filename": file.filename,
            "mime_type": mime_type,
            "file_size": len(file_bytes),

            "document_hash": document_hash,

            "ipfs": {
                "cid": pinata_result["cid"],
                "pin_size": pinata_result.get(
                    "pin_size"
                ),
                "timestamp": pinata_result.get(
                    "timestamp"
                ),
            },

            "ocr_text": result["ocr_text"],
            "data": result["data"],
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"OCR gagal diproses: {error}",
        )