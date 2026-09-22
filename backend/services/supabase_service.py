import os
from typing import Optional

from dotenv import load_dotenv
from supabase import Client, create_client


load_dotenv()


SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")


if not SUPABASE_URL:
    raise RuntimeError(
        "SUPABASE_URL belum dikonfigurasi di file .env"
    )

if not SUPABASE_KEY:
    raise RuntimeError(
        "SUPABASE_KEY belum dikonfigurasi di .env"
    )


supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_KEY,
)


class SupabaseService:

    @staticmethod
    def find_alumni_by_nisn(
        institution_id: str,
        nisn: str,
    ) -> Optional[dict]:

        response = (
            supabase
            .table("alumni")
            .select("*")
            .eq("institution_id", institution_id)
            .eq("nisn", nisn)
            .limit(1)
            .execute()
        )

        if not response.data:
            return None

        return response.data[0]

    @staticmethod
    def create_alumni(
        institution_id: str,
        full_name: str,
        nisn: Optional[str] = None,
        major: Optional[str] = None,
        graduation_year: Optional[int] = None,
        birth_place: Optional[str] = None,
        birth_date: Optional[str] = None,
    ) -> dict:

        payload = {
            "institution_id": institution_id,
            "full_name": full_name,
            "nisn": nisn,
            "major": major,
            "graduation_year": graduation_year,
            "birth_place": birth_place,
            "birth_date": birth_date,
        }

        response = (
            supabase
            .table("alumni")
            .insert(payload)
            .select("*")
            .execute()
        )

        if not response.data:
            raise RuntimeError(
                "Gagal membuat data alumni."
            )

        return response.data[0]

    @staticmethod
    def update_alumni(
        alumni_id: str,
        full_name: str,
        nisn: Optional[str] = None,
        major: Optional[str] = None,
        graduation_year: Optional[int] = None,
        birth_place: Optional[str] = None,
        birth_date: Optional[str] = None,
    ) -> dict:

        payload = {
            "full_name": full_name,
            "nisn": nisn,
            "major": major,
            "graduation_year": graduation_year,
            "birth_place": birth_place,
            "birth_date": birth_date,
        }

        response = (
            supabase
            .table("alumni")
            .update(payload)
            .eq("id", alumni_id)
            .select("*")
            .execute()
        )

        if not response.data:
            raise RuntimeError(
                "Gagal memperbarui data alumni."
            )

        return response.data[0]

    @staticmethod
    def create_diploma(
        institution_id: str,
        diploma_number: str,
        alumni_id: Optional[str] = None,
        nisn: Optional[str] = None,
        major: Optional[str] = None,
        graduation_date: Optional[str] = None,
        document_hash: Optional[str] = None,
        ipfs_cid: Optional[str] = None,
        document_path: Optional[str] = None,
        document_name: Optional[str] = None,
        document_mime_type: Optional[str] = None,
        document_size: Optional[int] = None,
    ) -> dict:

        payload = {
            "institution_id": institution_id,
            "alumni_id": alumni_id,
            "diploma_number": diploma_number,
            "nisn": nisn,
            "major": major,
            "graduation_date": graduation_date,
            "document_hash": document_hash,
            "ipfs_cid": ipfs_cid,
            "document_path": document_path,
            "document_name": document_name,
            "document_mime_type": document_mime_type,
            "document_size": document_size,
            "ocr_status": "verified",
            "validity_status": "pending",
        }

        response = (
            supabase
            .table("diplomas")
            .insert(payload)
            .select("*")
            .execute()
        )

        if not response.data:
            raise RuntimeError(
                "Gagal menyimpan data diploma."
            )

        return response.data[0]

    @staticmethod
    def find_diploma_by_number(
        institution_id: str,
        diploma_number: str,
    ) -> Optional[dict]:

        response = (
            supabase
            .table("diplomas")
            .select("*")
            .eq("institution_id", institution_id)
            .eq("diploma_number", diploma_number)
            .limit(1)
            .execute()
        )

        if not response.data:
            return None

        return response.data[0]

    @staticmethod
    def get_diploma(
        diploma_id: str,
    ) -> Optional[dict]:

        response = (
            supabase
            .table("diplomas")
            .select("*")
            .eq("id", diploma_id)
            .limit(1)
            .execute()
        )

        if not response.data:
            return None

        return response.data[0]


supabase_service = SupabaseService()