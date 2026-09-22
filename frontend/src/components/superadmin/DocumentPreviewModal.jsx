import {
    AlertTriangle,
    FileText,
    X,
} from "lucide-react";

export default function DocumentPreviewModal({
    document,
    loading,
    error,
    onClose,
}) {
    if (
        !loading &&
        !document &&
        !error
    ) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm">

            <div className="flex h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-[#393740] bg-[#18171c] shadow-2xl">

                {/* HEADER */}

                <div className="flex items-center justify-between border-b border-[#302e36] bg-[#1d1b21] px-4 py-3">

                    <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-dvms-purple/15">
                            <FileText
                                size={16}
                                className="text-dvms-lime"
                            />
                        </div>

                        <div className="min-w-0">
                            <p className="truncate text-xs font-medium text-white">
                                {document?.name ||
                                    "Preview Dokumen"}
                            </p>

                            {document?.extension && (
                                <p className="text-[9px] uppercase text-[#77737e]">
                                    {document.extension}
                                </p>
                            )}
                        </div>

                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#85818d] transition hover:bg-[#29272e] hover:text-white"
                    >
                        <X size={17} />
                    </button>

                </div>

                {/* BODY */}

                <div className="min-h-0 flex-1 overflow-hidden bg-[#111014]">

                    {loading && (
                        <div className="flex h-full flex-col items-center justify-center">
                            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#3b3942] border-t-dvms-lime" />

                            <p className="mt-3 text-xs text-[#8a8691]">
                                Memuat dokumen...
                            </p>
                        </div>
                    )}

                    {!loading && error && (
                        <div className="flex h-full items-center justify-center p-5">

                            <div className="max-w-md rounded-xl border border-red-500/20 bg-red-500/5 p-5 text-center">

                                <AlertTriangle
                                    size={30}
                                    className="mx-auto text-red-400"
                                />

                                <h3 className="mt-3 text-sm font-semibold text-red-300">
                                    Dokumen tidak dapat
                                    ditampilkan
                                </h3>

                                <p className="mt-2 text-xs leading-5 text-[#aaa6b2]">
                                    {error}
                                </p>

                            </div>

                        </div>
                    )}

                    {!loading &&
                        !error &&
                        document?.type ===
                        "image" && (
                            <div className="flex h-full items-center justify-center overflow-auto p-5">

                                <img
                                    src={document.url}
                                    alt={
                                        document.name ||
                                        "Dokumen"
                                    }
                                    className="max-h-full max-w-full rounded-lg object-contain shadow-xl"
                                />

                            </div>
                        )}

                    {!loading &&
                        !error &&
                        document?.type ===
                        "pdf" && (
                            <iframe
                                src={document.url}
                                title={
                                    document.name ||
                                    "PDF Preview"
                                }
                                className="h-full w-full border-0"
                            />
                        )}

                    {!loading &&
                        !error &&
                        document?.type ===
                        "text" && (
                            <pre className="h-full overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-xs leading-6 text-[#c9c5d0]">
                                {document.content}
                            </pre>
                        )}

                    {!loading &&
                        !error &&
                        document?.type ===
                        "docx" && (
                            <iframe
                                title={
                                    document.name ||
                                    "DOCX Preview"
                                }
                                sandbox=""
                                srcDoc={`
                  <!DOCTYPE html>
                  <html>
                    <head>
                      <meta charset="UTF-8" />
                      <style>
                        body {
                          margin: 0;
                          padding: 40px;
                          font-family: Arial, sans-serif;
                          line-height: 1.6;
                          color: #222;
                          background: white;
                        }

                        img {
                          max-width: 100%;
                        }

                        table {
                          border-collapse: collapse;
                          width: 100%;
                        }

                        td, th {
                          border: 1px solid #ccc;
                          padding: 6px;
                        }
                      </style>
                    </head>
                    <body>
                      ${document.content || ""}
                    </body>
                  </html>
                `}
                                className="h-full w-full border-0 bg-white"
                            />
                        )}

                    {!loading &&
                        !error &&
                        document?.type ===
                        "spreadsheet" && (
                            <SpreadsheetPreview
                                sheets={
                                    document.sheets
                                }
                            />
                        )}

                    {!loading &&
                        !error &&
                        document?.type ===
                        "unsupported" && (
                            <UnsupportedPreview
                                extension={
                                    document.extension
                                }
                            />
                        )}

                </div>

            </div>
        </div>
    );
}

// =========================================================
// SPREADSHEET
// =========================================================

function SpreadsheetPreview({
    sheets = [],
}) {
    return (
        <div className="h-full overflow-auto p-5">

            {sheets.length === 0 ? (
                <div className="flex h-full items-center justify-center text-xs text-[#77737e]">
                    Spreadsheet kosong.
                </div>
            ) : (
                <div className="space-y-6">

                    {sheets.map(
                        (sheet) => (
                            <div
                                key={
                                    sheet.name
                                }
                                className="overflow-hidden rounded-xl border border-[#38353e] bg-white"
                            >

                                <div className="border-b border-[#ddd] bg-[#f4f4f4] px-4 py-2 text-xs font-semibold text-[#222]">
                                    {sheet.name}
                                </div>

                                <div className="overflow-auto">

                                    <table className="min-w-full border-collapse text-xs text-[#222]">

                                        <tbody>
                                            {sheet.rows.map(
                                                (
                                                    row,
                                                    rowIndex
                                                ) => (
                                                    <tr
                                                        key={
                                                            rowIndex
                                                        }
                                                        className="border-b border-[#ddd]"
                                                    >
                                                        {row.map(
                                                            (
                                                                cell,
                                                                cellIndex
                                                            ) => (
                                                                <td
                                                                    key={
                                                                        cellIndex
                                                                    }
                                                                    className="border-r border-[#ddd] px-3 py-2 align-top whitespace-nowrap"
                                                                >
                                                                    {formatCell(
                                                                        cell
                                                                    )}
                                                                </td>
                                                            )
                                                        )}
                                                    </tr>
                                                )
                                            )}
                                        </tbody>

                                    </table>

                                </div>

                            </div>
                        )
                    )}

                </div>
            )}

        </div>
    );
}

// =========================================================
// UNSUPPORTED
// =========================================================

function UnsupportedPreview({
    extension,
}) {
    return (
        <div className="flex h-full items-center justify-center p-5">

            <div className="max-w-md rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-6 text-center">

                <FileText
                    size={32}
                    className="mx-auto text-yellow-400"
                />

                <h3 className="mt-3 text-sm font-semibold text-yellow-300">
                    Preview belum tersedia
                </h3>

                <p className="mt-2 text-xs leading-5 text-[#aaa6b2]">
                    Format{" "}
                    <strong>
                        {extension?.toUpperCase() ||
                            "file"}
                    </strong>{" "}
                    belum memiliki renderer
                    langsung di browser.
                </p>

                <p className="mt-2 text-[10px] leading-5 text-[#77737e]">
                    Format DOC, PPT, dan PPTX
                    nantinya dapat diproses
                    menggunakan converter
                    server-side.
                </p>

            </div>

        </div>
    );
}

// =========================================================

function formatCell(value) {
    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    if (
        value instanceof Date
    ) {
        return value.toLocaleDateString(
            "id-ID"
        );
    }

    return String(value);
}