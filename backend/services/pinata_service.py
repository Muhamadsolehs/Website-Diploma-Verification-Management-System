import os
from typing import Optional

import requests
from dotenv import load_dotenv


load_dotenv()


PINATA_API_KEY = os.getenv("PINATA_API_KEY")
PINATA_SECRET_KEY = os.getenv("PINATA_SECRET_KEY")

PINATA_UPLOAD_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS"


class PinataService:
    @staticmethod
    def _validate_credentials() -> None:
        if not PINATA_API_KEY:
            raise RuntimeError(
                "PINATA_API_KEY belum dikonfigurasi di file .env"
            )

        if not PINATA_SECRET_KEY:
            raise RuntimeError(
                "PINATA_SECRET_KEY belum dikonfigurasi di file .env"
            )

    @classmethod
    def upload_file(
        cls,
        filename: str,
        file_bytes: bytes,
        mime_type: Optional[str] = None,
    ) -> dict:
        cls._validate_credentials()

        if not filename:
            raise ValueError("Nama file wajib diisi.")

        if not file_bytes:
            raise ValueError("File kosong.")

        headers = {
            "pinata_api_key": PINATA_API_KEY,
            "pinata_secret_api_key": PINATA_SECRET_KEY,
        }

        files = {
            "file": (
                filename,
                file_bytes,
                mime_type or "application/octet-stream",
            )
        }

        response = requests.post(
            PINATA_UPLOAD_URL,
            headers=headers,
            files=files,
            timeout=60,
        )

        if not response.ok:
            raise RuntimeError(
                f"Upload ke Pinata gagal "
                f"(HTTP {response.status_code}): "
                f"{response.text}"
            )

        result = response.json()

        ipfs_cid = result.get("IpfsHash")

        if not ipfs_cid:
            raise RuntimeError(
                "Pinata tidak mengembalikan CID."
            )

        return {
            "success": True,
            "cid": ipfs_cid,
            "pin_size": result.get("PinSize"),
            "timestamp": result.get("Timestamp"),
        }


pinata_service = PinataService()