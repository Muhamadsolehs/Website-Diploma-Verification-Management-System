import re
from datetime import datetime
from typing import Optional


MONTHS_ID = {
    "januari": 1,
    "februari": 2,
    "maret": 3,
    "april": 4,
    "mei": 5,
    "juni": 6,
    "juli": 7,
    "agustus": 8,
    "september": 9,
    "oktober": 10,
    "november": 11,
    "desember": 12,
}


def clean_text(value: Optional[str]) -> str:
    if not value:
        return ""

    value = value.replace("\r", "\n")
    value = re.sub(r"[ \t]+", " ", value)
    value = re.sub(r"\n{2,}", "\n", value)

    return value.strip()


def normalize_text(value: Optional[str]) -> str:
    if not value:
        return ""

    value = value.replace("\r", "\n")
    value = re.sub(r"[ \t]+", " ", value)
    value = re.sub(r"\n+", "\n", value)

    return value.strip()


def parse_date(value: Optional[str]) -> Optional[str]:
    if not value:
        return None

    value = value.strip()

    # dd-mm-yyyy / dd/mm/yyyy / dd.mm.yyyy
    match = re.search(
        r"\b(\d{1,2})\s*[-/.]\s*(\d{1,2})\s*[-/.]\s*(\d{4})\b",
        value,
        re.IGNORECASE,
    )

    if match:
        day, month, year = map(int, match.groups())

        try:
            return datetime(year, month, day).date().isoformat()
        except ValueError:
            return None

    # dd Month yyyy
    month_pattern = "|".join(MONTHS_ID.keys())

    match = re.search(
        rf"\b(\d{{1,2}})\s+({month_pattern})\s+(\d{{4}})\b",
        value,
        re.IGNORECASE,
    )

    if match:
        day = int(match.group(1))
        month_name = match.group(2).lower()
        year = int(match.group(3))

        month = MONTHS_ID.get(month_name)

        if month:
            try:
                return datetime(year, month, day).date().isoformat()
            except ValueError:
                return None

    return None


def extract_labeled_value(
    text: str,
    labels: list[str],
) -> Optional[str]:
    """
    Mengambil nilai setelah label.

    Contoh:
    Nama Lengkap: Ahmad Fauzan
    NISN : 9999999999
    """

    for label in labels:
        pattern = rf"{re.escape(label)}\s*[:\-]?\s*(.+)"

        match = re.search(
            pattern,
            text,
            re.IGNORECASE,
        )

        if match:
            value = match.group(1).strip()

            # Hentikan jika OCR menangkap label berikutnya
            value = re.split(
                r"\b(?:NISN|Nomor Ijazah|No\.?\s*Ijazah|"
                r"Kompetensi Keahlian|Jurusan|Tanggal Lulus|"
                r"Tempat Lahir|Tanggal Lahir|Tempat,?\s*Tanggal Lahir)\b",
                value,
                maxsplit=1,
                flags=re.IGNORECASE,
            )[0]

            value = value.strip(" :-\n\t")

            if value:
                return value

    return None


def extract_birth_place_and_date(text: str) -> tuple[Optional[str], Optional[str]]:
    """
    Mendukung format:

    Tempat, Tanggal Lahir: Bogor, 12 Januari 2005
    Tempat/Tanggal Lahir: Bogor, 12 Januari 2005
    Tempat Tanggal Lahir: Bogor, 12 Januari 2005
    Tempat Lahir: Bogor
    Tanggal Lahir: 12 Januari 2005

    Juga mendukung OCR yang memisahkan menjadi beberapa baris.
    """

    birth_place = None
    birth_date = None

    # ---------------------------------------------------------
    # FORMAT 1
    # Tempat, Tanggal Lahir: Bogor, 12 Januari 2005
    # ---------------------------------------------------------
    combined_patterns = [
        r"Tempat\s*,?\s*Tanggal\s*Lahir\s*[:\-]?\s*(.+)",
        r"Tempat\s*/\s*Tanggal\s*Lahir\s*[:\-]?\s*(.+)",
        r"Tempat\s+Tanggal\s*Lahir\s*[:\-]?\s*(.+)",
        r"TTL\s*[:\-]?\s*(.+)",
    ]

    month_pattern = "|".join(MONTHS_ID.keys())

    for pattern in combined_patterns:
        match = re.search(
            pattern,
            text,
            re.IGNORECASE,
        )

        if not match:
            continue

        value = match.group(1).strip()

        # Cari tanggal dengan nama bulan
        date_match = re.search(
            rf"\b\d{{1,2}}\s+({month_pattern})\s+\d{{4}}\b",
            value,
            re.IGNORECASE,
        )

        if date_match:
            date_text = date_match.group(0)
            birth_date = parse_date(date_text)

            place = value[: date_match.start()]
            place = place.strip(" ,:-")

            if place:
                birth_place = place

        else:
            # Cari tanggal numerik
            date_match = re.search(
                r"\b\d{1,2}\s*[-/.]\s*\d{1,2}\s*[-/.]\s*\d{4}\b",
                value,
                re.IGNORECASE,
            )

            if date_match:
                date_text = date_match.group(0)
                birth_date = parse_date(date_text)

                place = value[: date_match.start()]
                place = place.strip(" ,:-")

                if place:
                    birth_place = place

        if birth_place or birth_date:
            break

    # ---------------------------------------------------------
    # FORMAT 2
    # Tempat Lahir: Bogor
    # ---------------------------------------------------------
    if not birth_place:
        birth_place = extract_labeled_value(
            text,
            [
                "Tempat Lahir",
                "Tempat lahir",
            ],
        )

    # ---------------------------------------------------------
    # FORMAT 3
    # Tanggal Lahir: 12 Januari 2005
    # ---------------------------------------------------------
    if not birth_date:
        birth_date_value = extract_labeled_value(
            text,
            [
                "Tanggal Lahir",
                "Tanggal lahir",
                "Tgl Lahir",
                "Tgl. Lahir",
            ],
        )

        if birth_date_value:
            birth_date = parse_date(birth_date_value)

    # ---------------------------------------------------------
    # FORMAT 4
    # OCR memisahkan:
    #
    # Tempat, Tanggal Lahir:
    # Bogor, 12 Januari 2005
    # ---------------------------------------------------------
    if not birth_place or not birth_date:
        lines = [
            line.strip()
            for line in text.splitlines()
            if line.strip()
        ]

        for index, line in enumerate(lines):
            if re.search(
                r"Tempat\s*,?\s*Tanggal\s*Lahir|"
                r"Tempat\s*/\s*Tanggal\s*Lahir|"
                r"TTL",
                line,
                re.IGNORECASE,
            ):
                candidate = line

                # Jika nilai berada di baris berikutnya
                if index + 1 < len(lines):
                    candidate += " " + lines[index + 1]

                candidate = re.sub(
                    r"^.*?(?:Tempat\s*,?\s*Tanggal\s*Lahir|"
                    r"Tempat\s*/\s*Tanggal\s*Lahir|TTL)"
                    r"\s*[:\-]?\s*",
                    "",
                    candidate,
                    flags=re.IGNORECASE,
                )

                date_match = re.search(
                    rf"\b\d{{1,2}}\s+({month_pattern})\s+\d{{4}}\b",
                    candidate,
                    re.IGNORECASE,
                )

                if date_match:
                    birth_date = birth_date or parse_date(
                        date_match.group(0)
                    )

                    place = candidate[: date_match.start()]
                    place = place.strip(" ,:-")

                    if place:
                        birth_place = birth_place or place

                break

    if birth_place:
        birth_place = birth_place.strip(" ,:-")

    return birth_place, birth_date


def extract_major(text: str) -> Optional[str]:
    """
    Mendukung:
    Kompetensi Keahlian: Teknik Komputer dan Jaringan
    Jurusan: Rekayasa Perangkat Lunak
    """

    patterns = [
        r"Kompetensi\s+Keahlian\s*[:\-]?\s*(.+)",
        r"Kompetensi\s*Keahlian\s*[:\-]?\s*(.+)",
        r"Program\s+Keahlian\s*[:\-]?\s*(.+)",
        r"Jurusan\s*[:\-]?\s*(.+)",
    ]

    for pattern in patterns:
        match = re.search(
            pattern,
            text,
            re.IGNORECASE,
        )

        if match:
            value = match.group(1).strip()

            # Hentikan jika masuk label berikutnya
            value = re.split(
                r"\b(?:Tanggal Lulus|Tanggal Ijazah|"
                r"Nomor Ijazah|No\.?\s*Ijazah|NISN|"
                r"Tempat Lahir|Tanggal Lahir)\b",
                value,
                maxsplit=1,
                flags=re.IGNORECASE,
            )[0]

            value = value.strip(" :-")

            if value:
                return value

    return None


def extract_data(text: str) -> dict:
    text = normalize_text(text)

    # ---------------------------------------------------------
    # NAMA
    # ---------------------------------------------------------
    full_name = extract_labeled_value(
        text,
        [
            "Nama Lengkap",
            "Nama",
            "Nama Siswa",
            "Nama Peserta Didik",
        ],
    )

    # ---------------------------------------------------------
    # NISN
    # ---------------------------------------------------------
    nisn = None

    nisn_match = re.search(
        r"\bNISN\s*[:\-]?\s*([0-9]{8,15})\b",
        text,
        re.IGNORECASE,
    )

    if nisn_match:
        nisn = nisn_match.group(1)

    # ---------------------------------------------------------
    # NOMOR IJAZAH
    # ---------------------------------------------------------
    diploma_number = extract_labeled_value(
        text,
        [
            "Nomor Ijazah",
            "No. Ijazah",
            "No Ijazah",
            "Nomor Seri Ijazah",
            "Nomor Seri",
        ],
    )

    # ---------------------------------------------------------
    # JURUSAN
    # ---------------------------------------------------------
    major = extract_major(text)

    # ---------------------------------------------------------
    # TANGGAL LULUS
    # ---------------------------------------------------------
    graduation_date = None

    graduation_value = extract_labeled_value(
        text,
        [
            "Tanggal Lulus",
            "Tanggal Kelulusan",
            "Tanggal Lulus Satuan Pendidikan",
        ],
    )

    if graduation_value:
        graduation_date = parse_date(graduation_value)

    # Fallback jika format label agak berbeda
    if not graduation_date:
        graduation_match = re.search(
            rf"Tanggal\s+Lulus\s*[:\-]?\s*(.+)",
            text,
            re.IGNORECASE,
        )

        if graduation_match:
            graduation_date = parse_date(
                graduation_match.group(1)
            )

    # ---------------------------------------------------------
    # TEMPAT & TANGGAL LAHIR
    # ---------------------------------------------------------
    birth_place, birth_date = extract_birth_place_and_date(text)

    return {
        "full_name": full_name,
        "nisn": nisn,
        "diploma_number": diploma_number,
        "major": major,
        "graduation_date": graduation_date,
        "birth_place": birth_place,
        "birth_date": birth_date,
    }


def parse_diploma_text(text: str) -> dict:
    """
    Public function yang digunakan OCR service.
    """
    return extract_data(text)


def extract_diploma_data(text) -> dict:
    """
    Compatibility function untuk OCR service.

    Bisa menerima:
    - string hasil OCR
    - list hasil EasyOCR
    """

    if isinstance(text, list):
        ocr_lines = []

        for item in text:
            if isinstance(item, (list, tuple)) and len(item) >= 2:
                detected_text = item[1]

                if isinstance(detected_text, str):
                    ocr_lines.append(detected_text)

        text = "\n".join(ocr_lines)

    if not isinstance(text, str):
        text = str(text)

    return extract_data(text)