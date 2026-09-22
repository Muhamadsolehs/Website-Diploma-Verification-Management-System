import os
from io import BytesIO

import fitz
import numpy as np
from PIL import Image


# ============================================================
# KONFIGURASI FILE
# ============================================================

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

ALLOWED_EXTENSIONS = {
    ".pdf",
    ".jpg",
    ".jpeg",
    ".png",
}


# ============================================================
# VALIDASI FILE
# ============================================================

def validate_file(
    filename: str,
    file_bytes: bytes,
) -> None:
    """
    Memvalidasi nama, ekstensi, dan ukuran file.
    """

    if not filename:
        raise ValueError("Nama file tidak ditemukan.")

    extension = os.path.splitext(filename)[1].lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise ValueError(
            "Format file tidak didukung. "
            "Gunakan PDF, JPG, JPEG, atau PNG."
        )

    if not file_bytes:
        raise ValueError("File kosong.")

    if len(file_bytes) > MAX_FILE_SIZE:
        raise ValueError(
            "Ukuran file terlalu besar. Maksimal 5 MB."
        )


# ============================================================
# IMAGE FILE → NUMPY ARRAY
# ============================================================

def image_bytes_to_array(
    file_bytes: bytes,
) -> np.ndarray:
    """
    Mengubah JPG/PNG menjadi NumPy array
    yang dapat diproses oleh EasyOCR.
    """

    try:
        image = Image.open(
            BytesIO(file_bytes)
        ).convert("RGB")

        return np.array(image)

    except Exception as error:
        raise ValueError(
            f"Gambar tidak dapat dibaca: {error}"
        )


# ============================================================
# PDF → NUMPY ARRAY
# ============================================================

def pdf_bytes_to_images(
    file_bytes: bytes,
) -> list[np.ndarray]:
    """
    Mengubah setiap halaman PDF menjadi gambar.

    PDF
      ↓
    PyMuPDF
      ↓
    PNG/RGB image
      ↓
    NumPy array
    """

    images = []

    try:
        pdf = fitz.open(
            stream=file_bytes,
            filetype="pdf",
        )

        if pdf.page_count == 0:
            pdf.close()

            raise ValueError(
                "PDF tidak memiliki halaman."
            )

        for page in pdf:
            # Resolusi 2x agar teks lebih mudah dibaca OCR.
            matrix = fitz.Matrix(2, 2)

            pixmap = page.get_pixmap(
                matrix=matrix,
                alpha=False,
            )

            image = Image.frombytes(
                "RGB",
                (
                    pixmap.width,
                    pixmap.height,
                ),
                pixmap.samples,
            )

            images.append(
                np.array(image)
            )

        pdf.close()

        return images

    except ValueError:
        raise

    except Exception as error:
        raise ValueError(
            f"PDF tidak dapat diproses: {error}"
        )


# ============================================================
# FILE → IMAGES
# ============================================================

def file_to_images(
    filename: str,
    file_bytes: bytes,
) -> list[np.ndarray]:
    """
    Mengubah file PDF/JPG/JPEG/PNG
    menjadi satu atau beberapa gambar.

    JPG/PNG:
        1 file → 1 gambar

    PDF:
        1 file → beberapa gambar
        (satu gambar untuk setiap halaman)
    """

    extension = os.path.splitext(
        filename
    )[1].lower()

    validate_file(
        filename,
        file_bytes,
    )

    if extension == ".pdf":
        return pdf_bytes_to_images(
            file_bytes
        )

    return [
        image_bytes_to_array(
            file_bytes
        )
    ]


# ============================================================
# FILE INFORMATION
# ============================================================

def get_file_extension(
    filename: str,
) -> str:
    """
    Mengambil ekstensi file dalam
    format lowercase.
    """

    return os.path.splitext(
        filename
    )[1].lower()


def get_file_mime_type(
    filename: str,
) -> str:
    """
    Menentukan MIME type berdasarkan
    ekstensi file.
    """

    extension = get_file_extension(
        filename
    )

    mime_types = {
        ".pdf": "application/pdf",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
    }

    return mime_types.get(
        extension,
        "application/octet-stream",
    )