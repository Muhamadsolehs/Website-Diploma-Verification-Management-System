import {
    Building2,
    CheckCircle2,
    FileText,
    Mail,
    MapPin,
    Phone,
    ShieldCheck,
    User,
    X,
    XCircle,
} from "lucide-react";

import {
    canActivate,
    canReject,
    canVerify,
    formatDate,
    getAccountStatusLabel,
    getDocumentExtension,
    getDocumentName,
    getDocumentTypeLabel,
    getStatusConfig,
    normalizeDocuments,
} from "../../utils/institutionHelpers";

export default function InstitutionDetailModal({
    registration,
    loading = false,
    onClose,
    onVerify,
    onReject,
    onActivate,
    onPreview,
}) {
    if (!registration) {
        return null;
    }

    const institution =
        registration.institution || {};

    const profile =
        registration.profile || {};

    const documents =
        normalizeDocuments(
            registration.documents
        );

    const status =
        registration.status;

    const statusConfig =
        getStatusConfig(status);

    return (
        <div className="fixed inset-0 z-[50] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

            <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[#393740] bg-[#18171c] shadow-2xl">

                {/* HEADER */}

                <div className="flex items-start justify-between border-b border-[#302e36] bg-[#211d2d] px-5 py-4">

                    <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-dvms-purple/20">
                            <Building2
                                size={21}
                                className="text-dvms-lime"
                            />
                        </div>

                        <div className="min-w-0">

                            <h2 className="truncate text-base font-semibold text-white">
                                {institution.official_name ||
                                    registration.institutionName ||
                                    "Institusi"}
                            </h2>

                            <p className="mt-0.5 text-[10px] text-[#898591]">
                                Registration ID:{" "}
                                {registration.registration_id ||
                                    "-"}
                            </p>

                        </div>

                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#85818d] hover:bg-[#29272e] hover:text-white"
                    >
                        <X size={17} />
                    </button>

                </div>

                {/* BODY */}

                <div className="flex-1 overflow-y-auto p-5">

                    {/* STATUS */}

                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#302e36] bg-[#121116] p-4">

                        <div>
                            <p className="text-[9px] uppercase tracking-wider text-[#716d79]">
                                Status
                            </p>

                            <div className="mt-1 flex items-center gap-2">

                                <span
                                    className={`h-2 w-2 rounded-full ${statusConfig.dot}`}
                                />

                                <span
                                    className={`rounded-full border px-2.5 py-1 text-[9px] font-medium ${statusConfig.className}`}
                                >
                                    {statusConfig.label}
                                </span>

                            </div>
                        </div>

                        <div className="text-right">
                            <p className="text-[9px] uppercase tracking-wider text-[#716d79]">
                                Diajukan
                            </p>

                            <p className="mt-1 text-xs text-[#c3bfca]">
                                {formatDate(
                                    registration.submitted_at ||
                                    registration.created_at
                                )}
                            </p>
                        </div>

                    </div>

                    {/* INFORMATION */}

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

                        {/* INSTITUTION */}

                        <Section
                            title="Informasi Institusi"
                            icon={Building2}
                        >
                            <InfoRow
                                label="Nama Resmi"
                                value={
                                    institution.official_name ||
                                    registration.institutionName
                                }
                            />

                            <InfoRow
                                label="NPSN"
                                value={
                                    institution.npsn ||
                                    registration.npsn
                                }
                            />

                            <InfoRow
                                label="Email Resmi"
                                value={
                                    institution.official_email ||
                                    registration.institutionEmail
                                }
                                icon={Mail}
                            />

                            <InfoRow
                                label="Telepon"
                                value={
                                    institution.office_phone
                                }
                                icon={Phone}
                            />

                            <InfoRow
                                label="Provinsi"
                                value={
                                    institution.province
                                }
                            />

                            <InfoRow
                                label="Kota / Kabupaten"
                                value={
                                    institution.city
                                }
                            />

                            <InfoRow
                                label="Kode Pos"
                                value={
                                    institution.postal_code
                                }
                            />

                            <InfoRow
                                label="Alamat"
                                value={
                                    institution.address
                                }
                                icon={MapPin}
                            />
                        </Section>

                        {/* ADMIN */}

                        <Section
                            title="Admin / Penanggung Jawab"
                            icon={User}
                        >
                            <InfoRow
                                label="Nama Lengkap"
                                value={
                                    profile.full_name ||
                                    registration.adminName
                                }
                            />

                            <InfoRow
                                label="NIP / NUPTK / NIK"
                                value={
                                    profile.nip ||
                                    registration.adminNip
                                }
                            />

                            <InfoRow
                                label="Jabatan"
                                value={
                                    profile.job_title ||
                                    registration.adminPosition
                                }
                            />

                            <InfoRow
                                label="Telepon"
                                value={
                                    profile.phone ||
                                    registration.adminPhone
                                }
                                icon={Phone}
                            />

                            <InfoRow
                                label="Status Akun"
                                value={getAccountStatusLabel(
                                    profile.account_status
                                )}
                            />

                            <InfoRow
                                label="Role"
                                value={
                                    profile.role ||
                                    "admin"
                                }
                            />
                        </Section>

                    </div>

                    {/* DOCUMENTS */}

                    <div className="mt-4 rounded-xl border border-[#302e36] bg-[#121116]">

                        <div className="flex items-center justify-between border-b border-[#2b2930] px-4 py-3">

                            <div className="flex items-center gap-2">
                                <FileText
                                    size={15}
                                    className="text-dvms-lime"
                                />

                                <div>
                                    <h3 className="text-xs font-semibold text-white">
                                        Dokumen Legalitas
                                    </h3>

                                    <p className="text-[9px] text-[#706c77]">
                                        Dokumen yang dikirim oleh
                                        institusi.
                                    </p>
                                </div>
                            </div>

                            <span className="rounded-md bg-[#25232b] px-2 py-1 text-[9px] text-[#aaa6b2]">
                                {documents.length} dokumen
                            </span>

                        </div>

                        <div className="p-4">

                            {documents.length ===
                                0 ? (
                                <div className="rounded-lg border border-dashed border-[#3a3740] p-8 text-center text-xs text-[#77737e]">
                                    Belum ada dokumen.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">

                                    {documents.map(
                                        (
                                            document,
                                            index
                                        ) => (
                                            <DocumentItem
                                                key={`${index}-${getDocumentName(
                                                    document
                                                )}`}
                                                document={
                                                    document
                                                }
                                                onPreview={
                                                    onPreview
                                                }
                                            />
                                        )
                                    )}

                                </div>
                            )}

                        </div>
                    </div>

                    {/* REJECTION */}

                    {registration.rejection_reason && (
                        <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4">

                            <div className="flex items-center gap-2">
                                <XCircle
                                    size={15}
                                    className="text-red-400"
                                />

                                <h3 className="text-xs font-semibold text-red-300">
                                    Alasan Penolakan
                                </h3>
                            </div>

                            <p className="mt-2 text-xs leading-5 text-red-200/80">
                                {
                                    registration.rejection_reason
                                }
                            </p>

                        </div>
                    )}

                </div>

                {/* FOOTER */}

                <div className="flex flex-col-reverse gap-2 border-t border-[#302e36] bg-[#151419] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-lg border border-[#3b3942] px-4 py-2.5 text-xs text-[#aaa6b2] hover:bg-[#242229] hover:text-white"
                    >
                        Tutup
                    </button>

                    <div className="flex flex-col gap-2 sm:flex-row">

                        {canReject(
                            status
                        ) && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        onReject(
                                            registration
                                        )
                                    }
                                    disabled={loading}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs text-red-300 hover:bg-red-500/20"
                                >
                                    <XCircle size={14} />
                                    Tolak
                                </button>
                            )}

                        {canVerify(
                            status
                        ) && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        onVerify(
                                            registration
                                        )
                                    }
                                    disabled={loading}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-dvms-purple px-4 py-2.5 text-xs font-medium text-white hover:opacity-90"
                                >
                                    <ShieldCheck size={14} />

                                    {loading
                                        ? "Memproses..."
                                        : "Verifikasi"}
                                </button>
                            )}

                        {canActivate(
                            status
                        ) && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        onActivate(
                                            registration
                                        )
                                    }
                                    disabled={loading}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-dvms-lime px-4 py-2.5 text-xs font-semibold text-black hover:brightness-95"
                                >
                                    <CheckCircle2
                                        size={14}
                                    />

                                    {loading
                                        ? "Memproses..."
                                        : "Aktifkan Institusi"}
                                </button>
                            )}

                    </div>

                </div>

            </div>
        </div>
    );
}

// =========================================================

function Section({
    title,
    icon: Icon,
    children,
}) {
    return (
        <div className="rounded-xl border border-[#302e36] bg-[#121116]">

            <div className="flex items-center gap-2 border-b border-[#2b2930] px-4 py-3">

                <Icon
                    size={15}
                    className="text-dvms-lime"
                />

                <h3 className="text-xs font-semibold text-white">
                    {title}
                </h3>

            </div>

            <div className="space-y-3 p-4">
                {children}
            </div>

        </div>
    );
}

// =========================================================

function InfoRow({
    label,
    value,
    icon: Icon,
}) {
    return (
        <div className="flex gap-3">

            {Icon && (
                <Icon
                    size={13}
                    className="mt-0.5 shrink-0 text-[#716d79]"
                />
            )}

            <div className="min-w-0 flex-1">

                <p className="text-[9px] text-[#716d79]">
                    {label}
                </p>

                <p className="mt-0.5 break-words text-xs leading-5 text-[#c6c2cd]">
                    {value || "-"}
                </p>

            </div>

        </div>
    );
}

// =========================================================

function DocumentItem({
    document,
    onPreview,
}) {
    const name =
        getDocumentName(document);

    const extension =
        getDocumentExtension(
            document
        );

    return (
        <div className="flex items-center gap-3 rounded-lg border border-[#302e36] bg-[#19181e] p-3">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-dvms-purple/15">
                <FileText
                    size={16}
                    className="text-dvms-lime"
                />
            </div>

            <div className="min-w-0 flex-1">

                <p className="truncate text-xs font-medium text-[#d4d1d9]">
                    {name}
                </p>

                <p className="mt-1 text-[8px] uppercase text-[#77737e]">
                    {getDocumentTypeLabel(
                        extension
                    )}
                </p>

            </div>

            <button
                type="button"
                onClick={() =>
                    onPreview?.(
                        document
                    )
                }
                className="shrink-0 rounded-md border border-[#403d47] bg-[#222027] px-3 py-2 text-[9px] text-[#c0bcc7] hover:border-dvms-purple hover:text-white"
            >
                Preview
            </button>

        </div>
    );
}