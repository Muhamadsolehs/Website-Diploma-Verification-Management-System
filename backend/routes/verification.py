from fastapi import APIRouter, File, HTTPException, UploadFile

from services.blockchain_service import blockchain_service
from services.ocr_service import ocr_service
from services.supabase_service import supabase
from utils.file_utils import get_file_mime_type
from utils.hash_utils import calculate_sha256, hash_to_bytes32


router = APIRouter(
    prefix="/api/verification",
    tags=["Verification"],
)


# =========================================================
# HELPER
# =========================================================

def get_alumni(alumni_id: str | None):
    if not alumni_id:
        return None

    response = (
        supabase.table("alumni")
        .select("*")
        .eq("id", alumni_id)
        .limit(1)
        .execute()
    )

    if not response.data:
        return None

    return response.data[0]


def get_institution(institution_id: str | None):
    if not institution_id:
        return None

    response = (
        supabase.table("institutions")
        .select("*")
        .eq("id", institution_id)
        .limit(1)
        .execute()
    )

    if not response.data:
        return None

    return response.data[0]


def get_anchor(diploma_id: str):
    response = (
        supabase.table("diploma_anchors")
        .select("*")
        .eq("diploma_id", diploma_id)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )

    if not response.data:
        return None

    return response.data[0]


def verify_blockchain(document_hash: str):
    try:
        hash_bytes = hash_to_bytes32(document_hash)

        return blockchain_service.verify_diploma(
            hash_bytes
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Verifikasi blockchain gagal: {error}",
        )


def create_verification_result(
    diploma: dict,
    source: str,
    uploaded_hash: str | None = None,
):
    alumni = get_alumni(
        diploma.get("alumni_id")
    )

    institution = get_institution(
        diploma.get("institution_id")
    )

    anchor = get_anchor(
        diploma["id"]
    )

    document_hash = diploma.get(
        "document_hash"
    )

    blockchain = None

    if document_hash:
        blockchain = verify_blockchain(
            document_hash
        )

    # =====================================================
    # TENTUKAN STATUS
    # =====================================================

    if diploma.get("validity_status") == "revoked":
        result = "revoked"

    elif not blockchain or not blockchain.get(
        "is_registered"
    ):
        result = "not_registered"

    else:
        result = "valid"

    # =====================================================
    # CEK APAKAH FILE YANG DIUPLOAD SAMA DENGAN FILE ASLI
    # =====================================================

    document_hash_match = None

    if uploaded_hash and document_hash:
        document_hash_match = (
            uploaded_hash.lower()
            == document_hash.lower()
        )

    # =====================================================
    # SIMPAN LOG VERIFIKASI
    # =====================================================

    supabase.table(
        "verification_logs"
    ).insert(
        {
            "diploma_id": diploma["id"],
            "diploma_number": diploma["diploma_number"],
            "result": result,
            "verified_by": None,
            "source": source,
        }
    ).execute()

    return {
        "success": True,
        "result": result,

        "diploma": diploma,

        "alumni": alumni,

        "institution": institution,

        "anchor": anchor,

        "blockchain": blockchain,

        "verification": {
            "uploaded_hash": uploaded_hash,
            "registered_hash": document_hash,
            "document_hash_match": document_hash_match,
        },
    }


# =========================================================
# VERIFY BY DIPLOMA ID
# =========================================================

@router.get("/diploma/{diploma_id}")
def verify_diploma(
    diploma_id: str,
    source: str = "public_portal",
):
    response = (
        supabase.table("diplomas")
        .select("*")
        .eq("id", diploma_id)
        .limit(1)
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=404,
            detail="Diploma tidak ditemukan.",
        )

    diploma = response.data[0]

    if not diploma.get("document_hash"):
        raise HTTPException(
            status_code=400,
            detail="Diploma belum memiliki document hash.",
        )

    return create_verification_result(
        diploma=diploma,
        source=source,
    )


# =========================================================
# VERIFY BY DIPLOMA NUMBER
# =========================================================

@router.get("/number/{diploma_number}")
def verify_diploma_by_number(
    diploma_number: str,
):
    diploma_number = diploma_number.strip()

    if not diploma_number:
        raise HTTPException(
            status_code=400,
            detail="Nomor ijazah wajib diisi.",
        )

    response = (
        supabase.table("diplomas")
        .select("*")
        .eq(
            "diploma_number",
            diploma_number,
        )
        .limit(1)
        .execute()
    )

    if not response.data:
        # Tetap catat percobaan verifikasi
        # meskipun diploma tidak ditemukan.
        return {
            "success": True,
            "result": "not_registered",
            "diploma": None,
            "alumni": None,
            "institution": None,
            "anchor": None,
            "blockchain": None,
            "verification": {
                "uploaded_hash": None,
                "registered_hash": None,
                "document_hash_match": None,
            },
        }

    diploma = response.data[0]

    if not diploma.get("document_hash"):
        return {
            "success": True,
            "result": "not_registered",
            "diploma": diploma,
            "alumni": get_alumni(
                diploma.get("alumni_id")
            ),
            "institution": get_institution(
                diploma.get("institution_id")
            ),
            "anchor": get_anchor(
                diploma["id"]
            ),
            "blockchain": None,
            "verification": {
                "uploaded_hash": None,
                "registered_hash": None,
                "document_hash_match": None,
            },
        }

    return create_verification_result(
        diploma=diploma,
        source="public_portal",
    )


# =========================================================
# VERIFY BY UPLOADED DOCUMENT
# =========================================================

@router.post("/document")
async def verify_diploma_document(
    file: UploadFile = File(...),
):
    try:
        # =================================================
        # BACA FILE
        # =================================================

        file_bytes = await file.read()

        if not file.filename:
            raise ValueError(
                "Nama file tidak ditemukan."
            )

        # =================================================
        # VALIDASI MIME / FORMAT
        # =================================================

        mime_type = get_file_mime_type(
            file.filename
        )

        # =================================================
        # HITUNG HASH FILE YANG DIUPLOAD
        # =================================================

        uploaded_hash = calculate_sha256(
            file_bytes
        )

        # =================================================
        # OCR
        # =================================================

        ocr_result = ocr_service.process_document(
            filename=file.filename,
            file_bytes=file_bytes,
        )

        ocr_text = ocr_result.get(
            "ocr_text",
            []
        )

        extracted_data = ocr_result.get(
            "data",
            {}
        )

        diploma_number = (
            extracted_data.get(
                "diploma_number"
            )
        )

        # =================================================
        # VALIDASI HASIL OCR
        # =================================================

        if not diploma_number:
            return {
                "success": True,
                "result": "not_registered",

                "diploma": None,
                "alumni": None,
                "institution": None,
                "anchor": None,
                "blockchain": None,

                "ocr": {
                    "filename": file.filename,
                    "mime_type": mime_type,
                    "file_size": len(file_bytes),
                    "text": ocr_text,
                    "data": extracted_data,
                },

                "verification": {
                    "uploaded_hash": uploaded_hash,
                    "registered_hash": None,
                    "document_hash_match": False,
                },
            }

        # =================================================
        # CARI DIPLOMA BERDASARKAN NOMOR HASIL OCR
        # =================================================

        response = (
            supabase.table("diplomas")
            .select("*")
            .eq(
                "diploma_number",
                diploma_number.strip(),
            )
            .limit(1)
            .execute()
        )

        if not response.data:
            return {
                "success": True,
                "result": "not_registered",

                "diploma": None,
                "alumni": None,
                "institution": None,
                "anchor": None,
                "blockchain": None,

                "ocr": {
                    "filename": file.filename,
                    "mime_type": mime_type,
                    "file_size": len(file_bytes),
                    "text": ocr_text,
                    "data": extracted_data,
                },

                "verification": {
                    "uploaded_hash": uploaded_hash,
                    "registered_hash": None,
                    "document_hash_match": False,
                },
            }

        diploma = response.data[0]

        # =================================================
        # VERIFIKASI DATA + BLOCKCHAIN
        # =================================================

        result = create_verification_result(
            diploma=diploma,
            source="public_portal",
            uploaded_hash=uploaded_hash,
        )

        # =================================================
        # TAMBAHKAN DATA OCR
        # =================================================

        result["ocr"] = {
            "filename": file.filename,
            "mime_type": mime_type,
            "file_size": len(file_bytes),
            "text": ocr_text,
            "data": extracted_data,
        }

        return result

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=(
                "Verifikasi dokumen gagal: "
                f"{error}"
            ),
        )


# =========================================================
# VERIFICATION LOGS
# =========================================================

@router.get("/logs")
def get_verification_logs(
    limit: int = 50,
):
    response = (
        supabase.table("verification_logs")
        .select("*")
        .order(
            "created_at",
            desc=True,
        )
        .limit(limit)
        .execute()
    )

    return {
        "success": True,
        "data": response.data,
    }