import { supabase } from "../lib/supabase";

export const DOCUMENT_BUCKET =
    "institution-legal-docs";

// =========================================================
// PATH
// =========================================================

export function resolveStoragePath(location) {
    if (!location) {
        return "";
    }

    let path = String(location).trim();

    if (/^https?:\/\//i.test(path)) {
        try {
            const url = new URL(path);

            const marker =
                "/storage/v1/object/";

            const index =
                url.pathname.indexOf(marker);

            if (index !== -1) {
                let storagePath =
                    url.pathname.substring(
                        index + marker.length
                    );

                storagePath =
                    storagePath.replace(
                        /^sign\/[^/]+\//,
                        ""
                    );

                storagePath =
                    storagePath.replace(
                        /^public\//,
                        ""
                    );

                storagePath =
                    storagePath.replace(
                        /^authenticated\//,
                        ""
                    );

                storagePath =
                    storagePath.replace(
                        /^private\//,
                        ""
                    );

                const bucketPrefix =
                    `${DOCUMENT_BUCKET}/`;

                if (
                    storagePath.startsWith(
                        bucketPrefix
                    )
                ) {
                    storagePath =
                        storagePath.substring(
                            bucketPrefix.length
                        );
                }

                return decodeURIComponent(
                    storagePath
                );
            }
        } catch {
            return path;
        }

        return path;
    }

    return path
        .replace(/^\/+/, "")
        .replace(
            `${DOCUMENT_BUCKET}/`,
            ""
        );
}

// =========================================================
// EXTENSION
// =========================================================

export function getExtension(document) {
    const locations = [
        document?.fileUrl,
        document?.path,
        document?.storagePath,
        document?.file_path,
        document?.filePath,
        document?.url,
        document?.publicUrl,
        document?.fileName,
        document?.filename,
        document?.name,
    ];

    for (const location of locations) {
        if (
            typeof location !== "string"
        ) {
            continue;
        }

        const clean =
            location.split("?")[0];

        const match =
            clean.match(
                /\.([a-zA-Z0-9]{1,10})$/
            );

        if (match?.[1]) {
            return match[1].toLowerCase();
        }
    }

    return "";
}

// =========================================================
// MIME
// =========================================================

export function getMimeType(extension) {
    const mimeMap = {
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        gif: "image/gif",
        webp: "image/webp",
        bmp: "image/bmp",
        svg: "image/svg+xml",

        pdf: "application/pdf",

        txt: "text/plain",
        csv: "text/csv",
        json: "application/json",
        xml: "application/xml",
        md: "text/markdown",

        doc:
            "application/msword",

        docx:
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

        xls:
            "application/vnd.ms-excel",

        xlsx:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

        ppt:
            "application/vnd.ms-powerpoint",

        pptx:
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    };

    return (
        mimeMap[extension] ||
        "application/octet-stream"
    );
}

// =========================================================
// PREVIEW TYPE
// =========================================================

export function getPreviewType(extension) {
    const images = [
        "jpg",
        "jpeg",
        "png",
        "gif",
        "webp",
        "bmp",
        "svg",
    ];

    const texts = [
        "txt",
        "csv",
        "json",
        "xml",
        "md",
    ];

    if (images.includes(extension)) {
        return "image";
    }

    if (extension === "pdf") {
        return "pdf";
    }

    if (texts.includes(extension)) {
        return "text";
    }

    if (extension === "docx") {
        return "docx";
    }

    if (
        extension === "xls" ||
        extension === "xlsx"
    ) {
        return "spreadsheet";
    }

    return "unsupported";
}

// =========================================================
// DOCUMENT LOCATION
// =========================================================

function getDocumentLocation(document) {
    return (
        document?.fileUrl ||
        document?.path ||
        document?.storagePath ||
        document?.file_path ||
        document?.filePath ||
        document?.url ||
        document?.publicUrl ||
        ""
    );
}

// =========================================================
// DOWNLOAD FILE
// =========================================================

export async function downloadStorageFile(
    document
) {
    const location =
        getDocumentLocation(document);

    if (!location) {
        throw new Error(
            "Lokasi dokumen tidak ditemukan."
        );
    }

    let blob;

    if (
        /^https?:\/\//i.test(location)
    ) {
        const response =
            await fetch(location);

        if (!response.ok) {
            throw new Error(
                `File gagal diambil. Status ${response.status}`
            );
        }

        blob =
            await response.blob();
    } else {
        const path =
            resolveStoragePath(
                location
            );

        const {
            data,
            error,
        } =
            await supabase.storage
                .from(DOCUMENT_BUCKET)
                .download(path);

        if (error) {
            throw error;
        }

        blob = data;
    }

    const extension =
        getExtension(document);

    /*
     * Supabase terkadang mengembalikan
     * application/octet-stream.
     *
     * Kita paksa MIME berdasarkan extension.
     */

    return new Blob(
        [blob],
        {
            type:
                getMimeType(extension),
        }
    );
}

// =========================================================
// LOAD PREVIEW
// =========================================================

export async function loadDocumentPreview(
    document
) {
    const extension =
        getExtension(document);

    const type =
        getPreviewType(extension);

    const blob =
        await downloadStorageFile(
            document
        );

    // ===============================================
    // IMAGE / PDF
    // ===============================================

    if (
        type === "image" ||
        type === "pdf"
    ) {
        const url =
            URL.createObjectURL(blob);

        return {
            type,
            extension,
            url,
            objectUrl: url,
            mimeType:
                getMimeType(extension),
        };
    }

    // ===============================================
    // TEXT
    // ===============================================

    if (type === "text") {
        const content =
            await blob.text();

        return {
            type,
            extension,
            content,
            mimeType:
                getMimeType(extension),
        };
    }

    // ===============================================
    // DOCX
    // ===============================================

    if (type === "docx") {
        const mammoth =
            await import("mammoth");

        const arrayBuffer =
            await blob.arrayBuffer();

        const result =
            await mammoth.default.convertToHtml(
                {
                    arrayBuffer,
                }
            );

        return {
            type,
            extension,
            content:
                result.value,
            messages:
                result.messages,
            mimeType:
                getMimeType(extension),
        };
    }

    // ===============================================
    // EXCEL
    // ===============================================

    if (type === "spreadsheet") {
        const XLSX =
            await import("xlsx");

        const arrayBuffer =
            await blob.arrayBuffer();

        const workbook =
            XLSX.read(
                arrayBuffer,
                {
                    type: "array",
                    cellDates: true,
                }
            );

        const sheets =
            workbook.SheetNames.map(
                (sheetName) => {
                    const worksheet =
                        workbook.Sheets[
                        sheetName
                        ];

                    const rows =
                        XLSX.utils.sheet_to_json(
                            worksheet,
                            {
                                header: 1,
                                defval: "",
                                blankrows: false,
                            }
                        );

                    return {
                        name: sheetName,
                        rows,
                    };
                }
            );

        return {
            type,
            extension,
            sheets,
            mimeType:
                getMimeType(extension),
        };
    }

    // ===============================================
    // UNSUPPORTED
    // ===============================================

    return {
        type: "unsupported",
        extension,
        mimeType:
            getMimeType(extension),
    };
}

// =========================================================
// CLEANUP
// =========================================================

export function revokePreviewUrl(
    preview
) {
    if (
        preview?.objectUrl
    ) {
        URL.revokeObjectURL(
            preview.objectUrl
        );
    }
}