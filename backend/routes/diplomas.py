from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.supabase_service import supabase_service


router = APIRouter(
    prefix="/api/diplomas",
    tags=["Diploma"],
)


class DiplomaSaveRequest(BaseModel):
    institution_id: str

    full_name: str
    nisn: Optional[str] = None

    diploma_number: str
    major: Optional[str] = None
    graduation_date: Optional[str] = None

    # DATA KELAHIRAN ALUMNI
    birth_place: Optional[str] = None
    birth_date: Optional[str] = None

    # DOKUMEN
    document_hash: Optional[str] = None
    ipfs_cid: Optional[str] = None

    document_path: Optional[str] = None
    document_name: Optional[str] = None
    document_mime_type: Optional[str] = None
    document_size: Optional[int] = None


@router.post("/save")
def save_diploma(request: DiplomaSaveRequest):

    try:
        # ---------------------------------------------------------
        # VALIDASI DATA UTAMA
        # ---------------------------------------------------------
        if not request.institution_id:
            raise ValueError(
                "institution_id wajib diisi."
            )

        if not request.full_name.strip():
            raise ValueError(
                "Nama alumni wajib diisi."
            )

        if not request.diploma_number.strip():
            raise ValueError(
                "Nomor ijazah wajib diisi."
            )

        # ---------------------------------------------------------
        # NORMALISASI DATA
        # ---------------------------------------------------------
        full_name = request.full_name.strip()

        nisn = (
            request.nisn.strip()
            if request.nisn
            else None
        )

        diploma_number = request.diploma_number.strip()

        major = (
            request.major.strip()
            if request.major
            else None
        )

        birth_place = (
            request.birth_place.strip()
            if request.birth_place
            else None
        )

        birth_date = (
            request.birth_date.strip()
            if request.birth_date
            else None
        )

        graduation_date = (
            request.graduation_date.strip()
            if request.graduation_date
            else None
        )

        # ---------------------------------------------------------
        # VALIDASI FORMAT TANGGAL LAHIR
        # ---------------------------------------------------------
        if birth_date:
            try:
                datetime.strptime(
                    birth_date,
                    "%Y-%m-%d",
                )
            except ValueError:
                raise ValueError(
                    "Format birth_date harus YYYY-MM-DD."
                )

        # ---------------------------------------------------------
        # VALIDASI FORMAT TANGGAL LULUS
        # ---------------------------------------------------------
        if graduation_date:
            try:
                datetime.strptime(
                    graduation_date,
                    "%Y-%m-%d",
                )
            except ValueError:
                raise ValueError(
                    "Format graduation_date harus YYYY-MM-DD."
                )

        # ---------------------------------------------------------
        # DERIVE GRADUATION YEAR
        # ---------------------------------------------------------
        graduation_year = None

        if graduation_date:
            graduation_year = datetime.strptime(
                graduation_date,
                "%Y-%m-%d",
            ).year

        # ---------------------------------------------------------
        # CEK DUPLIKAT NOMOR IJAZAH
        # ---------------------------------------------------------
        existing_diploma = (
            supabase_service.find_diploma_by_number(
                institution_id=request.institution_id,
                diploma_number=diploma_number,
            )
        )

        if existing_diploma:
            raise ValueError(
                f"Nomor ijazah '{diploma_number}' "
                "sudah terdaftar."
            )

        # ---------------------------------------------------------
        # CARI ALUMNI BERDASARKAN NISN
        # ---------------------------------------------------------
        alumni = None

        if nisn:
            alumni = (
                supabase_service.find_alumni_by_nisn(
                    institution_id=request.institution_id,
                    nisn=nisn,
                )
            )

        # ---------------------------------------------------------
        # JIKA ALUMNI SUDAH ADA
        # UPDATE DATA ALUMNI
        # ---------------------------------------------------------
        if alumni:

            alumni = (
                supabase_service.update_alumni(
                    alumni_id=alumni["id"],
                    full_name=full_name,
                    nisn=nisn,
                    major=major,
                    graduation_year=graduation_year,
                    birth_place=birth_place,
                    birth_date=birth_date,
                )
            )

        # ---------------------------------------------------------
        # JIKA ALUMNI BELUM ADA
        # BUAT ALUMNI BARU
        # ---------------------------------------------------------
        else:

            alumni = (
                supabase_service.create_alumni(
                    institution_id=request.institution_id,
                    full_name=full_name,
                    nisn=nisn,
                    major=major,
                    graduation_year=graduation_year,
                    birth_place=birth_place,
                    birth_date=birth_date,
                )
            )

        # ---------------------------------------------------------
        # SIMPAN DIPLOMA
        # ---------------------------------------------------------
        diploma = (
            supabase_service.create_diploma(
                institution_id=request.institution_id,
                diploma_number=diploma_number,
                alumni_id=alumni["id"],
                nisn=nisn,
                major=major,
                graduation_date=graduation_date,
                document_hash=request.document_hash,
                ipfs_cid=request.ipfs_cid,
                document_path=request.document_path,
                document_name=request.document_name,
                document_mime_type=request.document_mime_type,
                document_size=request.document_size,
            )
        )

        return {
            "success": True,
            "message": "Data diploma berhasil disimpan.",
            "alumni": alumni,
            "diploma": diploma,
        }

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Gagal menyimpan diploma: {error}",
        )


@router.get("/{diploma_id}")
def get_diploma(diploma_id: str):

    diploma = (
        supabase_service.get_diploma(
            diploma_id
        )
    )

    if not diploma:
        raise HTTPException(
            status_code=404,
            detail="Diploma tidak ditemukan.",
        )

    return {
        "success": True,
        "data": diploma,
    }