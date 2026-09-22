import {
    AlertTriangle,
    X,
    XCircle,
} from "lucide-react";
import {
    useEffect,
    useState,
} from "react";

export default function RejectModal({
    registration,
    loading = false,
    onClose,
    onSubmit,
}) {
    const [reason, setReason] =
        useState("");

    const [error, setError] =
        useState("");

    useEffect(() => {
        setReason("");
        setError("");
    }, [registration?.id]);

    if (!registration) {
        return null;
    }

    const handleSubmit = async (
        event
    ) => {
        event.preventDefault();

        const cleanReason =
            reason.trim();

        if (!cleanReason) {
            setError(
                "Alasan penolakan wajib diisi."
            );
            return;
        }

        if (cleanReason.length < 5) {
            setError(
                "Alasan penolakan terlalu singkat."
            );
            return;
        }

        setError("");

        await onSubmit(
            cleanReason
        );
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[#393740] bg-[#18171c] shadow-2xl">

                {/* HEADER */}

                <div className="flex items-center justify-between border-b border-[#302e36] bg-[#21181c] px-5 py-4">

                    <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
                            <XCircle
                                size={19}
                                className="text-red-400"
                            />
                        </div>

                        <div>
                            <h2 className="text-sm font-semibold text-white">
                                Tolak Registrasi
                            </h2>

                            <p className="text-[10px] text-[#85818c]">
                                Berikan alasan penolakan
                            </p>
                        </div>

                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#85818d] hover:bg-[#29272e] hover:text-white"
                    >
                        <X size={16} />
                    </button>

                </div>

                <form
                    onSubmit={
                        handleSubmit
                    }
                >

                    <div className="p-5">

                        {/* INSTITUTION */}

                        <div className="mb-4 rounded-lg border border-[#302e36] bg-[#121116] p-3">

                            <p className="text-[9px] uppercase tracking-wider text-[#6f6b76]">
                                Institusi
                            </p>

                            <p className="mt-1 text-xs font-medium text-[#d0ccd6]">
                                {registration
                                    ?.institution
                                    ?.official_name ||
                                    registration?.institutionName ||
                                    "-"}
                            </p>

                            <p className="mt-1 text-[9px] text-[#77737e]">
                                Registration ID:{" "}
                                {registration
                                    ?.registration_id ||
                                    "-"}
                            </p>

                        </div>

                        {/* WARNING */}

                        <div className="mb-4 flex gap-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3">

                            <AlertTriangle
                                size={16}
                                className="mt-0.5 shrink-0 text-yellow-400"
                            />

                            <p className="text-[10px] leading-5 text-yellow-200/80">
                                Registrasi akan
                                ditandai sebagai{" "}
                                <strong>
                                    Ditolak
                                </strong>{" "}
                                dan akun admin tidak
                                dapat digunakan untuk
                                masuk ke sistem.
                            </p>

                        </div>

                        {/* REASON */}

                        <label
                            htmlFor="reject-reason"
                            className="mb-2 block text-xs font-medium text-[#c9c5d0]"
                        >
                            Alasan Penolakan
                            <span className="ml-1 text-red-400">
                                *
                            </span>
                        </label>

                        <textarea
                            id="reject-reason"
                            value={reason}
                            onChange={(event) => {
                                setReason(
                                    event.target.value
                                );

                                if (error) {
                                    setError("");
                                }
                            }}
                            disabled={loading}
                            rows={5}
                            maxLength={1000}
                            placeholder="Masukkan alasan penolakan..."
                            className="w-full resize-none rounded-lg border border-[#393740] bg-[#111014] px-3 py-3 text-xs leading-5 text-white outline-none placeholder:text-[#5e5a65] focus:border-red-500/50"
                        />

                        <div className="mt-1 flex justify-between">

                            {error ? (
                                <p className="text-[9px] text-red-400">
                                    {error}
                                </p>
                            ) : (
                                <span />
                            )}

                            <p className="text-[9px] text-[#625f69]">
                                {reason.length}/1000
                            </p>

                        </div>

                    </div>

                    {/* FOOTER */}

                    <div className="flex flex-col-reverse gap-2 border-t border-[#302e36] bg-[#151419] px-5 py-4 sm:flex-row sm:justify-end">

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="rounded-lg border border-[#3b3942] px-4 py-2.5 text-xs font-medium text-[#aaa6b2] hover:bg-[#242229] hover:text-white"
                        >
                            Batal
                        </button>

                        <button
                            type="submit"
                            disabled={
                                loading ||
                                !reason.trim()
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-500/90 px-4 py-2.5 text-xs font-semibold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <XCircle
                                size={14}
                            />

                            {loading
                                ? "Memproses..."
                                : "Tolak Registrasi"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}