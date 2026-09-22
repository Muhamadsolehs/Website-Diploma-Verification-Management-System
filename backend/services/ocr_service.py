import easyocr

from utils.diploma_parser import extract_diploma_data
from utils.file_utils import file_to_images


class OCRService:
    def __init__(self):
        self.reader = easyocr.Reader(
            ["id", "en"],
            gpu=False,
        )

    def process_document(
        self,
        filename: str,
        file_bytes: bytes,
    ) -> dict:
        """
        Memproses dokumen ijazah menggunakan EasyOCR.

        Alur:
        File
        -> Konversi ke gambar
        -> EasyOCR
        -> Gabungkan hasil OCR
        -> Parser data ijazah
        """

        images = file_to_images(
            filename,
            file_bytes,
        )

        all_ocr_text = []

        for image in images:
            result = self.reader.readtext(
                image,
                detail=0,
                paragraph=False,
            )

            if result:
                all_ocr_text.extend(result)

        # EasyOCR dengan detail=0 menghasilkan list[str].
        # Contoh:
        # [
        #   "Nama Lengkap : Ahmad Fauzan",
        #   "NISN : 9999999999",
        #   "Tempat Lahir : Bogor",
        #   "Tanggal Lahir : 12 Januari 2005"
        # ]
        #
        # Parser membutuhkan string, jadi kita gabungkan
        # setiap hasil OCR menjadi satu teks dengan pemisah newline.

        ocr_text = "\n".join(
            str(text).strip()
            for text in all_ocr_text
            if str(text).strip()
        )

        diploma_data = extract_diploma_data(
            ocr_text
        )

        return {
            "ocr_text": all_ocr_text,
            "data": diploma_data,
        }


ocr_service = OCRService()