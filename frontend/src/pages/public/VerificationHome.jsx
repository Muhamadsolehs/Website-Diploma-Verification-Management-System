import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileUp,
  FileDigit,
  ShieldCheck,
  LockKeyhole,
  Database,
  Search,
  X,
} from "lucide-react";
import {
  verifyDiplomaByNumber,
  verifyDiplomaDocument,
} from "../../services/api";

export default function VerificationHome() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("ocr");
  const [nomorIjazah, setNomorIjazah] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validateFile = (file) => {
    if (!file) {
      return "File tidak ditemukan.";
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    const allowedExtensions = [
      ".pdf",
      ".jpg",
      ".jpeg",
      ".png",
    ];

    const filename = file.name.toLowerCase();

    const validType =
      allowedTypes.includes(file.type) ||
      allowedExtensions.some((extension) =>
        filename.endsWith(extension)
      );

    if (!validType) {
      return "Format file harus PDF, JPG, JPEG, atau PNG.";
    }

    if (file.size > 5 * 1024 * 1024) {
      return "Ukuran file maksimal 5 MB.";
    }

    return "";
  };

  const handleFileChange = (file) => {
    setError("");

    const validationError = validateFile(file);

    if (validationError) {
      setSelectedFile(null);
      setError(validationError);
      return;
    }

    setSelectedFile(file);
  };

  const handleVerification = async () => {
    setError("");

    try {
      setLoading(true);

      // =========================
      // VERIFIKASI BERDASARKAN NOMOR
      // =========================
      if (mode === "nomor") {
        if (!nomorIjazah.trim()) {
          setError("Silakan masukkan nomor ijazah terlebih dahulu.");
          return;
        }

        const result = await verifyDiplomaByNumber(
          nomorIjazah.trim()
        );

        navigate(
          `/verify/result?nomor=${encodeURIComponent(
            nomorIjazah.trim()
          )}`,
          {
            state: {
              verification: result,
              mode: "nomor",
            },
          }
        );

        return;
      }

      // =========================
      // VERIFIKASI DOKUMEN OCR
      // =========================
      if (!selectedFile) {
        setError("Silakan pilih dokumen ijazah terlebih dahulu.");
        return;
      }

      const result = await verifyDiplomaDocument(
        selectedFile
      );

      navigate("/verify/result", {
        state: {
          verification: result,
          mode: "document",
        },
      });
    } catch (err) {
      console.error("Verifikasi gagal:", err);

      setError(
        err?.message ||
        "Verifikasi gagal diproses. Silakan coba kembali."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();

    const file = event.dataTransfer.files?.[0];

    if (file) {
      handleFileChange(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const removeFile = () => {
    setSelectedFile(null);
    setError("");
  };

  return (
    <div className="mx-auto max-w-[600px] pb-12 pt-24">
      {/* HEADER */}
      <div className="text-center">
        <h1 className="text-[28px] font-semibold tracking-tight">
          Verifikasi Keaslian Ijazah
        </h1>

        <p className="mx-auto mt-1 max-w-[480px] text-[13px] leading-5 text-[#aaa6b4]">
          Validasi dokumen akademik secara real-time dengan
          teknologi Web3 yang
          <br />
          aman dan terdesentralisasi.
        </p>
      </div>

      {/* MAIN CARD */}
      <section className="mt-6 rounded-lg border border-[#292a34] bg-[#20222b] p-5 shadow-2xl">
        {/* TAB */}
        <div className="grid grid-cols-2 gap-2 border-b border-[#3b3943] pb-1">
          <button
            type="button"
            onClick={() => {
              setMode("ocr");
              setError("");
            }}
            className={`flex h-9 items-center justify-center gap-2 rounded-md text-xs transition ${mode === "ocr"
              ? "bg-[#5b20ff] text-white"
              : "text-[#d4d0dc] hover:bg-[#292b35]"
              }`}
          >
            <FileUp size={14} />
            Upload Dokumen OCR
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("nomor");
              setError("");
            }}
            className={`flex h-9 items-center justify-center gap-2 rounded-md text-xs transition ${mode === "nomor"
              ? "bg-[#5b20ff] text-white"
              : "text-[#d4d0dc] hover:bg-[#292b35]"
              }`}
          >
            <FileDigit size={14} />
            Ketik Nomor Ijazah
          </button>
        </div>

        {/* ========================= */}
        {/* MODE OCR */}
        {/* ========================= */}
        {mode === "ocr" && (
          <div className="mt-4">
            <input
              id="public-diploma-upload"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];

                if (file) {
                  handleFileChange(file);
                }

                event.target.value = "";
              }}
            />

            {!selectedFile ? (
              <label
                htmlFor="public-diploma-upload"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-[#484751] bg-[#17181d] px-5 text-center transition hover:border-[#6a36ff] hover:bg-[#1b1c22]"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#292536]">
                  <FileUp
                    size={22}
                    className="text-[#9b7aff]"
                  />
                </div>

                <div className="text-[13px] font-medium text-[#e7e4ec]">
                  Upload dokumen ijazah
                </div>

                <div className="mt-1 text-[10px] text-[#817d89]">
                  Tarik dan letakkan file di sini atau klik
                  untuk memilih
                </div>

                <div className="mt-3 text-[9px] text-[#65616d]">
                  PDF, JPG, JPEG, PNG • Maksimal 5 MB
                </div>
              </label>
            ) : (
              <div className="rounded-md border border-[#3b3943] bg-[#17181d] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#292536]">
                      <FileUp
                        size={18}
                        className="text-[#9b7aff]"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="truncate text-[12px] font-medium text-[#e7e4ec]">
                        {selectedFile.name}
                      </div>

                      <div className="mt-1 text-[9px] text-[#77727f]">
                        {(
                          selectedFile.size /
                          1024 /
                          1024
                        ).toFixed(2)}{" "}
                        MB
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={removeFile}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#8d8995] transition hover:bg-[#292b35] hover:text-white"
                    title="Hapus file"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="mt-4 rounded-md bg-[#202127] px-3 py-2 text-[9px] text-[#8e8a97]">
                  Dokumen siap diverifikasi menggunakan OCR,
                  database DVMS, dan jaringan blockchain.
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================= */}
        {/* MODE NOMOR */}
        {/* ========================= */}
        {mode === "nomor" && (
          <div className="mt-4">
            <div className="rounded-md border border-[#3b3943] bg-[#17181d] p-5">
              <div className="mb-4">
                <h3 className="text-sm font-medium text-[#e8e5ed]">
                  Masukkan Nomor Ijazah
                </h3>

                <p className="mt-1 text-[11px] leading-4 text-[#8e8a97]">
                  Masukkan nomor ijazah untuk memeriksa
                  keasliannya pada jaringan verifikasi DVMS.
                </p>
              </div>

              <label className="mb-2 block text-[11px] text-[#b9b5c1]">
                Nomor Ijazah
              </label>

              <div className="relative">
                <FileDigit
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#77727f]"
                />

                <input
                  type="text"
                  value={nomorIjazah}
                  onChange={(event) => {
                    setNomorIjazah(event.target.value);
                    setError("");
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleVerification();
                    }
                  }}
                  placeholder="Contoh: DN-06/SMK-BGR/23/001"
                  className="h-10 w-full rounded-md border border-[#3b3943] bg-[#111216] pl-9 pr-3 text-xs text-white outline-none transition placeholder:text-[#5f5b66] focus:border-[#6325ff] focus:ring-1 focus:ring-[#6325ff]"
                />
              </div>

              <p className="mt-2 text-[9px] text-[#6f6b76]">
                Contoh nomor: DN-06/SMK-BGR/23/001
              </p>
            </div>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="mt-4 rounded-md border border-red-500/30 bg-red-950/30 px-3 py-2 text-[10px] leading-4 text-red-300">
            {error}
          </div>
        )}

        {/* BUTTON */}
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={handleVerification}
            disabled={loading}
            className={`btn-lime flex h-9 w-[158px] items-center justify-center gap-2 ${loading
              ? "cursor-not-allowed opacity-60"
              : ""
              }`}
          >
            {loading ? (
              <>
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Memproses...
              </>
            ) : mode === "nomor" ? (
              <>
                <Search size={15} />
                Cari Ijazah
              </>
            ) : (
              <>
                <ShieldCheck size={15} />
                Verifikasi Keaslian
              </>
            )}
          </button>
        </div>
      </section>

      {/* SECURITY INFO */}
      <div className="mt-5 flex items-center justify-center gap-8 text-[8px] text-[#76727e]">
        <span>
          <Database
            className="mr-1 inline"
            size={12}
          />
          Secured on Polygon Network
        </span>

        <span>
          <LockKeyhole
            className="mr-1 inline"
            size={12}
          />
          SHA-256 Cryptography
        </span>

        <span>
          <ShieldCheck
            className="mr-1 inline"
            size={12}
          />
          Immutable Records
        </span>
      </div>
    </div>
  );
}