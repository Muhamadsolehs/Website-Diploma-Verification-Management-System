import { useState } from "react";
import {
    ArrowLeft,
    CheckCircle2,
    Circle,
    Clock3,
    Search,
    ShieldCheck,
    XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function CekStatus() {
    const navigate = useNavigate();

    const [registrationId, setRegistrationId] = useState("");
    const [email, setEmail] = useState("");

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [result, setResult] = useState(null);

    const checkStatus = async (event) => {
        event.preventDefault();

        setErrorMessage("");
        setResult(null);

        const cleanRegistrationId = registrationId.trim();
        const cleanEmail = email.trim().toLowerCase();

        if (!cleanRegistrationId) {
            setErrorMessage("Registration ID wajib diisi.");
            return;
        }

        if (!cleanEmail) {
            setErrorMessage("Email institusi wajib diisi.");
            return;
        }

        setLoading(true);

        try {
            const { data, error } = await supabase.rpc(
                "check_registration_status",
                {
                    p_registration_id: cleanRegistrationId,
                    p_email: cleanEmail,
                }
            );

            if (error) {
                console.error("Cek status error:", error);
                throw new Error(
                    "Terjadi kesalahan saat mengambil status registrasi."
                );
            }

            if (!data || data.length === 0) {
                throw new Error(
                    "Registrasi tidak ditemukan. Periksa kembali Registration ID dan email institusi."
                );
            }

            setResult(data[0]);
        } catch (error) {
            console.error(error);

            setErrorMessage(
                error?.message ||
                "Terjadi kesalahan saat mengecek status registrasi."
            );
        } finally {
            setLoading(false);
        }
    };

    const getOverallStatus = () => {
        if (!result) return "pending";

        if (
            result.registration_status === "rejected" ||
            result.institution_status === "rejected" ||
            result.verification_status === "rejected" ||
            result.account_status === "rejected"
        ) {
            return "rejected";
        }

        if (
            result.registration_status === "activated" &&
            result.institution_status === "active" &&
            result.verification_status === "verified" &&
            result.account_status === "active"
        ) {
            return "approved";
        }

        return "pending";
    };

    const overallStatus = getOverallStatus();

    return (
        <div className="min-h-screen bg-[#111111] px-4 py-8 text-white">
            <div className="mx-auto max-w-[560px]">

                {/* HEADER */}
                <div className="mb-5">
                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="mb-5 inline-flex items-center gap-2 text-xs text-[#aaa6b4] transition hover:text-white"
                    >
                        <ArrowLeft size={15} />
                        Kembali ke Login
                    </button>

                    <div className="rounded-lg border border-[#41404a] bg-gradient-to-br from-[#24242a] to-[#291355] px-5 py-6">
                        <div className="mb-3 grid h-11 w-11 place-items-center rounded-full bg-[#b6ff00]/10 text-[#b6ff00]">
                            <ShieldCheck size={23} />
                        </div>

                        <h1 className="text-xl font-semibold">
                            Cek Status Registrasi
                        </h1>

                        <p className="mt-1 text-[11px] leading-relaxed text-[#aaa6b4]">
                            Pantau proses verifikasi institusi Anda menggunakan
                            Registration ID dan email institusi.
                        </p>
                    </div>
                </div>

                {/* FORM */}
                <div className="rounded-lg border border-[#41404a] bg-[#1c1c1f] p-5">
                    <form onSubmit={checkStatus}>

                        <div className="space-y-4">

                            <div>
                                <label className="mb-1.5 block text-[10px] font-medium text-[#d7d3dc]">
                                    Registration ID
                                </label>

                                <input
                                    type="text"
                                    value={registrationId}
                                    onChange={(event) =>
                                        setRegistrationId(event.target.value)
                                    }
                                    placeholder="Contoh: TENANT-2026-66192"
                                    className="w-full rounded-md border border-[#41404a] bg-[#151519] px-3 py-2.5 text-xs text-white outline-none transition placeholder:text-[#66636d] focus:border-[#777481]"
                                />

                                <p className="mt-1.5 text-[9px] text-[#777481]">
                                    Gunakan Registration ID yang diberikan
                                    setelah registrasi berhasil.
                                </p>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-[10px] font-medium text-[#d7d3dc]">
                                    Email Institusi
                                </label>

                                <input
                                    type="email"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(event.target.value)
                                    }
                                    placeholder="email@institusi.sch.id"
                                    className="w-full rounded-md border border-[#41404a] bg-[#151519] px-3 py-2.5 text-xs text-white outline-none transition placeholder:text-[#66636d] focus:border-[#777481]"
                                />
                            </div>

                        </div>

                        {errorMessage && (
                            <div className="mt-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-[10px] leading-relaxed text-red-300">
                                {errorMessage}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-[#5b20ff] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#692fff] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Search size={15} />

                            {loading
                                ? "Memeriksa Status..."
                                : "Cek Status Registrasi"}
                        </button>
                    </form>
                </div>

                {/* RESULT */}
                {result && (
                    <div className="mt-5 overflow-hidden rounded-lg border border-[#41404a] bg-[#1c1c1f]">

                        {/* RESULT HEADER */}
                        <div
                            className={`border-b px-5 py-5 ${overallStatus === "approved"
                                ? "border-emerald-500/20 bg-emerald-500/5"
                                : overallStatus === "rejected"
                                    ? "border-red-500/20 bg-red-500/5"
                                    : "border-blue-500/20 bg-blue-500/5"
                                }`}
                        >
                            <div className="flex items-start gap-3">

                                <div
                                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${overallStatus === "approved"
                                        ? "bg-emerald-500/10 text-emerald-400"
                                        : overallStatus === "rejected"
                                            ? "bg-red-500/10 text-red-400"
                                            : "bg-blue-500/10 text-blue-400"
                                        }`}
                                >
                                    {overallStatus === "approved" ? (
                                        <CheckCircle2 size={21} />
                                    ) : overallStatus === "rejected" ? (
                                        <XCircle size={21} />
                                    ) : (
                                        <Clock3 size={21} />
                                    )}
                                </div>

                                <div>
                                    <div className="text-[10px] text-[#8f8b98]">
                                        STATUS REGISTRASI
                                    </div>

                                    <h2 className="mt-0.5 text-lg font-semibold">
                                        {overallStatus === "approved"
                                            ? "Registrasi Disetujui"
                                            : overallStatus === "rejected"
                                                ? "Registrasi Ditolak"
                                                : "Sedang Dalam Verifikasi"}
                                    </h2>

                                    <p className="mt-1 text-[10px] leading-relaxed text-[#aaa6b4]">
                                        {overallStatus === "approved"
                                            ? "Institusi Anda telah diverifikasi dan akun admin telah diaktifkan."
                                            : overallStatus === "rejected"
                                                ? "Registrasi institusi Anda tidak disetujui oleh Superadmin."
                                                : "Registrasi Anda masih menunggu pemeriksaan dan persetujuan Superadmin."}
                                    </p>
                                </div>

                            </div>
                        </div>

                        {/* INSTITUTION DETAIL */}
                        <div className="grid gap-3 border-b border-[#39383f] p-5 sm:grid-cols-2">

                            <InfoItem
                                label="Institusi"
                                value={result.institution_name}
                            />

                            <InfoItem
                                label="Registration ID"
                                value={result.registration_id}
                            />

                            <InfoItem
                                label="Status Pengajuan"
                                value={formatStatus(
                                    result.registration_status
                                )}
                            />

                            <InfoItem
                                label="Status Akun"
                                value={formatStatus(
                                    result.account_status
                                )}
                            />

                        </div>

                        {/* TIMELINE */}
                        <div className="p-5">
                            <h3 className="text-sm font-semibold">
                                Proses Verifikasi
                            </h3>

                            <div className="mt-4 space-y-4">

                                <StatusStep
                                    active={true}
                                    completed={true}
                                    title="Data Terkirim"
                                    description="Formulir registrasi berhasil direkam."
                                />

                                <StatusStep
                                    active={
                                        overallStatus === "pending"
                                    }
                                    completed={
                                        overallStatus === "approved"
                                    }
                                    rejected={
                                        overallStatus === "rejected"
                                    }
                                    title="Verifikasi Manual"
                                    description={
                                        overallStatus === "approved"
                                            ? "Registrasi telah disetujui oleh Superadmin."
                                            : overallStatus === "rejected"
                                                ? "Registrasi tidak disetujui oleh Superadmin."
                                                : "Menunggu pemeriksaan dan persetujuan Superadmin."
                                    }
                                />

                                <StatusStep
                                    active={
                                        overallStatus === "pending"
                                    }
                                    completed={
                                        overallStatus === "approved"
                                    }
                                    title="Aktivasi Akun"
                                    description={
                                        overallStatus === "approved"
                                            ? "Akun admin institusi telah aktif dan dapat digunakan untuk login."
                                            : "Akun akan aktif setelah registrasi disetujui."
                                    }
                                />

                            </div>

                            {/* REJECTION REASON */}
                            {overallStatus === "rejected" &&
                                result.rejection_reason && (
                                    <div className="mt-5 rounded-md border border-red-500/20 bg-red-500/5 p-3">
                                        <div className="text-[9px] font-semibold uppercase tracking-wide text-red-300">
                                            Alasan Penolakan
                                        </div>

                                        <p className="mt-1.5 text-[10px] leading-relaxed text-[#c9c5ce]">
                                            {result.rejection_reason}
                                        </p>
                                    </div>
                                )}

                            {/* APPROVED ACTION */}
                            {overallStatus === "approved" && (
                                <button
                                    type="button"
                                    onClick={() => navigate("/login")}
                                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-[#5b20ff] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#692fff]"
                                >
                                    Login ke Dashboard
                                </button>
                            )}

                        </div>
                    </div>
                )}

                {/* FOOTER */}
                <div className="mt-5 text-center text-[9px] text-[#5f5c66]">
                    DVMS · Diploma Verification Management System
                </div>

            </div>
        </div>
    );
}


/* ================================================= */
/* INFO ITEM */
/* ================================================= */

function InfoItem({ label, value }) {
    return (
        <div className="rounded-md border border-[#35353c] bg-[#17171a] p-3">
            <div className="text-[8px] uppercase tracking-wide text-[#777481]">
                {label}
            </div>

            <div className="mt-1 break-words text-[10px] font-medium text-[#e4e1e8]">
                {value || "-"}
            </div>
        </div>
    );
}


/* ================================================= */
/* STATUS STEP */
/* ================================================= */

function StatusStep({
    title,
    description,
    active = false,
    completed = false,
    rejected = false,
}) {
    let icon;
    let iconClass = "text-[#66636d]";

    if (rejected) {
        icon = <XCircle size={18} />;
        iconClass = "text-red-400";
    } else if (completed) {
        icon = <CheckCircle2 size={18} />;
        iconClass = "text-emerald-400";
    } else if (active) {
        icon = <Circle size={18} />;
        iconClass = "text-blue-400";
    } else {
        icon = <Circle size={18} />;
    }

    return (
        <div className="flex gap-3">
            <div className={`mt-0.5 shrink-0 ${iconClass}`}>
                {icon}
            </div>

            <div>
                <div
                    className={`text-[11px] font-semibold ${rejected
                        ? "text-red-300"
                        : completed
                            ? "text-[#e7e4eb]"
                            : active
                                ? "text-blue-300"
                                : "text-[#777481]"
                        }`}
                >
                    {title}
                </div>

                <p className="mt-0.5 text-[9px] leading-relaxed text-[#888590]">
                    {description}
                </p>
            </div>
        </div>
    );
}


/* ================================================= */
/* FORMAT STATUS */
/* ================================================= */

function formatStatus(status) {
    const map = {
        data_submitted: "Data Terkirim",
        manual_verification: "Verifikasi Manual",
        pending: "Menunggu Verifikasi",
        verified: "Terverifikasi",
        activated: "Aktif",
        active: "Aktif",
        rejected: "Ditolak",
    };

    return map[status] || status || "-";
}