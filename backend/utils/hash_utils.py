import hashlib


# ============================================================
# SHA-256 HASH
# ============================================================

def calculate_sha256(
    file_bytes: bytes,
) -> str:
    """
    Menghasilkan SHA-256 hash dari isi file.

    Contoh hasil:
    a3f5c8...
    """

    return hashlib.sha256(
        file_bytes
    ).hexdigest()


def calculate_sha256_bytes32(
    file_bytes: bytes,
) -> bytes:
    """
    Menghasilkan SHA-256 dalam format bytes32
    yang dapat digunakan oleh smart contract Solidity.
    """

    hash_hex = calculate_sha256(
        file_bytes
    )

    return bytes.fromhex(
        hash_hex
    )


def hash_to_bytes32(
    hash_value: str,
) -> bytes:
    """
    Mengubah hash SHA-256 hexadecimal menjadi bytes32.

    Menerima:
        aabbcc...
    atau:
        0xaabbcc...
    """

    value = hash_value.strip()

    if value.startswith("0x"):
        value = value[2:]

    value = value.lower()

    if len(value) != 64:
        raise ValueError(
            "SHA-256 hash harus terdiri dari 64 karakter hexadecimal."
        )

    try:
        return bytes.fromhex(
            value
        )

    except ValueError:
        raise ValueError(
            "SHA-256 hash mengandung karakter hexadecimal yang tidak valid."
        )


def hash_to_hex(
    hash_bytes: bytes,
) -> str:
    """
    Mengubah bytes hash menjadi hexadecimal
    dengan prefix 0x.
    """

    if len(hash_bytes) != 32:
        raise ValueError(
            "Hash harus memiliki panjang 32 bytes."
        )

    return "0x" + hash_bytes.hex()


def normalize_hash(
    hash_value: str,
) -> str:
    """
    Membersihkan hash dan mengembalikannya
    dalam format hexadecimal tanpa prefix 0x.
    """

    value = hash_value.strip()

    if value.startswith("0x"):
        value = value[2:]

    value = value.lower()

    if len(value) != 64:
        raise ValueError(
            "SHA-256 hash harus terdiri dari 64 karakter hexadecimal."
        )

    try:
        bytes.fromhex(value)

    except ValueError:
        raise ValueError(
            "Hash bukan hexadecimal yang valid."
        )

    return value