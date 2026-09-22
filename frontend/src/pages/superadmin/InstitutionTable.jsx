import {
    CheckCircle2,
    Eye,
    FileText,
    XCircle,
} from "lucide-react";

import {
    formatDateShort,
    getStatusConfig,
} from "../../utils/institutionHelpers";

export default function InstitutionTable({
    registrations = [],
    loading,
    actionLoading,
    onView,
    onVerify,
    onReject,
    onActivate,
}) {
    if (loading) {
        return (
            <div className="rounded-xl border border-[#302e36] bg-[#19181d] p-10 text-center">

                <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-[#3b3942] border-t-dvms-lime" />

                <p className="mt-3 text-xs text-[#77737e]">
                    Memuat data institusi...
                </p>

            </div>
        );
    }

    if (
        registrations.length === 0
    ) {
        return (
            <div className="rounded-xl border border-[#302e36] bg-[#19181d] p-10 text-center">

                <FileText
                    size={30}
                    className="mx-auto text-[#55515c]"
                />

                <p className="mt-3 text-xs text-[#77737e]">
                    Tidak ada data registrasi.
                </p>

            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-[#302e36] bg-[#19181d]">

            <div className="overflow-x-auto">

                <table className="w-full min-w-[950px] text-left">

                    <thead className="border-b border-[#302e36] bg-[#151419]">

                        <tr className="text-[9px] uppercase tracking-wider text-[#716d79]">

                            <th className="px-4 py-3">
                                Institusi
                            </th>

                            <th className="px-4 py-3">
                                NPSN
                            </th>

                            <th className="px-4 py-3">
                                Admin
                            </th>

                            <th className="px-4 py-3">
                                Pengajuan
                            </th>

                            <th className="px-4 py-3">
                                Status
                            </th>

                            <th className="px-4 py-3 text-right">
                                Aksi
                            </th>

                        </tr>

                    </thead>

                    <tbody className="divide-y divide-[#29272e]">

                        {registrations.map(
                            (item) => (
                                <InstitutionRow
                                    key={
                                        item.id
                                    }
                                    item={item}
                                    actionLoading={
                                        actionLoading
                                    }
                                    onView={
                                        onView
                                    }
                                    onVerify={
                                        onVerify
                                    }
                                    onReject={
                                        onReject
                                    }
                                    onActivate={
                                        onActivate
                                    }
                                />
                            )
                        )}

                    </tbody>

                </table>

            </div>

        </div>
    );
}

// =========================================================

function InstitutionRow({
    item,
    actionLoading,
    onView,
    onVerify,
    onReject,
    onActivate,
}) {
    const statusConfig =
        getStatusConfig(
            item.status
        );

    return (
        <tr className="transition hover:bg-[#201e24]">

            {/* INSTITUTION */}

            <td className="px-4 py-4">

                <div className="max-w-[280px]">

                    <p className="truncate text-xs font-medium text-white">
                        {item.institutionName}
                    </p>

                    <p className="mt-1 truncate text-[9px] text-[#77737e]">
                        {item.institutionEmail}
                    </p>

                    <p className="mt-1 font-mono text-[8px] text-[#5f5b66]">
                        {item.registration_id}
                    </p>

                </div>

            </td>

            {/* NPSN */}

            <td className="px-4 py-4">

                <span className="font-mono text-[10px] text-[#bbb7c1]">
                    {item.npsn || "-"}
                </span>

            </td>

            {/* ADMIN */}

            <td className="px-4 py-4">

                <div className="max-w-[180px]">

                    <p className="truncate text-xs text-[#c7c3cc]">
                        {item.adminName}
                    </p>

                    <p className="mt-1 truncate text-[9px] text-[#77737e]">
                        {item.adminPosition}
                    </p>

                </div>

            </td>

            {/* DATE */}

            <td className="px-4 py-4 text-[10px] text-[#aaa6b2]">
                {formatDateShort(
                    item.submitted_at
                )}
            </td>

            {/* STATUS */}

            <td className="px-4 py-4">

                <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[8px] font-medium ${statusConfig.className}`}
                >
                    <span
                        className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`}
                    />

                    {statusConfig.label}
                </span>

            </td>

            {/* ACTION */}

            <td className="px-4 py-4">

                <div className="flex justify-end gap-1.5">

                    <button
                        type="button"
                        onClick={() =>
                            onView?.(item)
                        }
                        title="Lihat Detail"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#393740] bg-[#222027] text-[#aaa6b2] hover:border-dvms-purple hover:text-white"
                    >
                        <Eye size={13} />
                    </button>

                    {item.status ===
                        "data_submitted" && (
                            <>
                                <button
                                    type="button"
                                    onClick={() =>
                                        onReject?.(
                                            item
                                        )
                                    }
                                    disabled={
                                        actionLoading
                                    }
                                    title="Tolak"
                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 disabled:opacity-40"
                                >
                                    <XCircle
                                        size={13}
                                    />
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        onVerify?.(
                                            item
                                        )
                                    }
                                    disabled={
                                        actionLoading
                                    }
                                    title="Verifikasi"
                                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-dvms-purple text-white hover:opacity-90 disabled:opacity-40"
                                >
                                    <CheckCircle2
                                        size={13}
                                    />
                                </button>
                            </>
                        )}

                    {item.status ===
                        "manual_verification" && (
                            <>
                                <button
                                    type="button"
                                    onClick={() =>
                                        onReject?.(
                                            item
                                        )
                                    }
                                    disabled={
                                        actionLoading
                                    }
                                    title="Tolak"
                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 disabled:opacity-40"
                                >
                                    <XCircle
                                        size={13}
                                    />
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        onActivate?.(
                                            item
                                        )
                                    }
                                    disabled={
                                        actionLoading
                                    }
                                    title="Aktifkan"
                                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-dvms-lime text-black hover:brightness-95 disabled:opacity-40"
                                >
                                    <CheckCircle2
                                        size={13}
                                    />
                                </button>
                            </>
                        )}

                </div>

            </td>

        </tr>
    );
}