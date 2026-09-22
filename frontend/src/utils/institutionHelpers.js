// =========================================================
// INSTITUTION HELPERS
// =========================================================

export function getStatusConfig(status) {
    switch (status) {
        case "data_submitted":
            return {
                label: "Menunggu Verifikasi",
                className:
                    "bg-yellow-500/10 text-yellow-300 border-yellow-500/20",
                dot: "bg-yellow-400",
            };

        case "manual_verification":
            return {
                label: "Terverifikasi",
                className:
                    "bg-blue-500/10 text-blue-300 border-blue-500/20",
                dot: "bg-blue-400",
            };

        case "activated":
            return {
                label: "Aktif",
                className:
                    "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
                dot: "bg-emerald-400",
            };

        case "rejected":
            return {
                label: "Ditolak",
                className:
                    "bg-red-500/10 text-red-300 border-red-500/20",
                dot: "bg-red-400",
            };

        default:
            return {
                label: status || "Tidak diketahui",
                className:
                    "bg-gray-500/10 text-gray-300 border-gray-500/20",
                dot: "bg-gray-400",
            };
    }
}

// =========================================================

export function getAccountStatusLabel(status) {
    switch (status) {
        case "active":
            return "Aktif";

        case "pending":
            return "Menunggu Aktivasi";

        case "rejected":
            return "Ditolak";

        default:
            return status || "-";
    }
}

// =========================================================

export function formatDate(value) {
    if (!value) {
        return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

// =========================================================

export function formatDateShort(value) {
    if (!value) {
        return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

// =========================================================

export function getDocumentName(document) {
    if (!document) {
        return "Dokumen";
    }

    const candidates = [
        document.fileName,
        document.filename,
        document.name,
    ];

    for (const value of candidates) {
        if (
            typeof value === "string" &&
            /\.[a-z0-9]{1,10}$/i.test(value)
        ) {
            return value;
        }
    }

    const location =
        document.fileUrl ||
        document.path ||
        document.storagePath ||
        document.file_path ||
        document.filePath ||
        document.url;

    if (location) {
        const clean = String(location).split("?")[0];
        const parts = clean.split("/");
        const filename = parts[parts.length - 1];

        if (filename) {
            try {
                return decodeURIComponent(filename);
            } catch {
                return filename;
            }
        }
    }

    return (
        document.fileName ||
        document.name ||
        document.filename ||
        "Dokumen"
    );
}

// =========================================================

export function getDocumentExtension(document) {
    if (!document) {
        return "";
    }

    const locations = [
        document.fileUrl,
        document.path,
        document.storagePath,
        document.file_path,
        document.filePath,
        document.url,
        document.publicUrl,
        document.fileName,
        document.filename,
        document.name,
    ];

    for (const location of locations) {
        if (typeof location !== "string") {
            continue;
        }

        const clean = location.split("?")[0];

        const match = clean.match(
            /\.([a-zA-Z0-9]{1,10})$/
        );

        if (match?.[1]) {
            return match[1].toLowerCase();
        }
    }

    return "";
}

// =========================================================

export function getDocumentTypeLabel(extension) {
    const map = {
        pdf: "PDF",
        png: "PNG",
        jpg: "JPG",
        jpeg: "JPEG",
        webp: "WEBP",
        gif: "GIF",
        bmp: "BMP",
        svg: "SVG",
        doc: "DOC",
        docx: "DOCX",
        xls: "XLS",
        xlsx: "XLSX",
        ppt: "PPT",
        pptx: "PPTX",
        txt: "TXT",
        csv: "CSV",
        json: "JSON",
        xml: "XML",
    };

    return (
        map[extension?.toLowerCase()] ||
        extension?.toUpperCase() ||
        "FILE"
    );
}

// =========================================================

export function normalizeDocuments(documents) {
    if (!Array.isArray(documents)) {
        return [];
    }

    return documents.filter(
        (document) =>
            document &&
            typeof document === "object"
    );
}

// =========================================================

export function canVerify(status) {
    return status === "data_submitted";
}

// =========================================================

export function canReject(status) {
    return (
        status === "data_submitted" ||
        status === "manual_verification"
    );
}

// =========================================================

export function canActivate(status) {
    return status === "manual_verification";
}