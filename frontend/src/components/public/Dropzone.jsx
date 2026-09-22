import { useRef, useState } from "react";
import { CloudUpload, FileText, X } from "lucide-react";

export default function Dropzone({
  compact = false,
  value = null,
  onChange,
}) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");

  const MAX_SIZE = 5 * 1024 * 1024;

  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
  ];

  const validateFile = (file) => {
    if (!file) return false;

    setError("");

    if (!allowedTypes.includes(file.type)) {
      setError("Format file harus PDF, JPG, atau PNG.");
      return false;
    }

    if (file.size > MAX_SIZE) {
      setError("Ukuran file maksimal 5MB.");
      return false;
    }

    return true;
  };

  const handleFile = (file) => {
    if (!validateFile(file)) {
      return;
    }

    onChange?.(file);
  };

  const handleInputChange = (event) => {
    const file = event.target.files?.[0];

    if (file) {
      handleFile(file);
    }

    // supaya file yang sama bisa dipilih lagi
    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleRemove = (event) => {
    event.stopPropagation();
    setError("");
    onChange?.(null);
  };

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
        onChange={handleInputChange}
        className="hidden"
      />

      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
                    flex cursor-pointer flex-col items-center justify-center
                    rounded-lg border border-dashed
                    bg-[#17171a] text-center
                    transition
                    ${compact
            ? "min-h-28 px-4 py-4"
            : "min-h-40 px-4 py-6"
          }
                    ${isDragging
            ? "border-[#b6ff00] bg-[#1d1d20]"
            : "border-[#4b4957] hover:border-[#777481]"
          }
                `}
      >
        {value ? (
          <>
            <div className="mb-2 grid h-11 w-11 place-items-center rounded-full bg-[#2c2c31] text-[#b6ff00]">
              <FileText size={22} />
            </div>

            <div className="max-w-full px-3 text-sm font-medium text-[#e7e4eb]">
              {value.name}
            </div>

            <div className="mt-1 text-[10px] text-[#8f8b98]">
              {(value.size / 1024 / 1024).toFixed(2)} MB
            </div>

            <button
              type="button"
              onClick={handleRemove}
              className="mt-2 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] text-[#ff7b7b] transition hover:bg-[#2c2222]"
            >
              <X size={12} />
              Hapus file
            </button>
          </>
        ) : (
          <>
            <div className="mb-2 grid h-11 w-11 place-items-center rounded-full bg-[#2c2c31] text-[#d0ccd9]">
              <CloudUpload size={22} />
            </div>

            <div className="text-sm font-medium text-[#e7e4eb]">
              Tarik & Lepas Dokumen
            </div>

            <div className="mt-1 text-[10px] text-[#a29daa]">
              atau klik untuk memilih file dari perangkat Anda
            </div>

            <div className="mt-2 font-mono text-[8px] text-[#6c6974]">
              Mendukung: PDF, JPG, PNG (Max 5MB)
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="mt-2 text-[10px] text-[#ff7b7b]">
          {error}
        </div>
      )}
    </div>
  );
}