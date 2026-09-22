import {
    Building2,
    CheckCircle2,
    Clock3,
    RefreshCw,
    Search,
    ShieldCheck,
    XCircle,
} from "lucide-react";

import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import { supabase } from "../../lib/supabase";

import InstitutionTable from "../../pages/superadmin/InstitutionTable";
import InstitutionDetailModal from "../../components/superadmin/InstitutionDetailModal";
import RejectModal from "../../components/superadmin/RejectModal";
import DocumentPreviewModal from "../../components/superadmin/DocumentPreviewModal";

import {
    loadDocumentPreview,
    revokePreviewUrl,
} from "../../utils/documentPreview";

/* =========================================================
   PAGE
========================================================= */

export default function InstitutionManagement() {
    const [
        registrations,
        setRegistrations,
    ] = useState([]);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        refreshing,
        setRefreshing,
    ] = useState(false);

    const [
        actionLoading,
        setActionLoading,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState("");

    // =======================================================
    // FILTER
    // =======================================================

    const [
        search,
        setSearch,
    ] = useState("");

    const [
        statusFilter,
        setStatusFilter,
    ] = useState("all");

    // =======================================================
    // MODAL
    // =======================================================

    const [
        selectedRegistration,
        setSelectedRegistration,
    ] = useState(null);

    const [
        rejectRegistration,
        setRejectRegistration,
    ] = useState(null);

    // =======================================================
    // PREVIEW
    // =======================================================

    const [
        previewDocument,
        setPreviewDocument,
    ] = useState(null);

    const [
        previewLoading,
        setPreviewLoading,
    ] = useState(false);

    const [
        previewError,
        setPreviewError,
    ] = useState("");

    const previewRef =
        useRef(null);

    const requestIdRef =
        useRef(0);

    // =======================================================
    // LOAD DATA
    // =======================================================

    const loadRegistrations =
        useCallback(
            async () => {
                try {
                    setLoading(true);
                    setError("");

                    const {
                        data,
                        error:
                        registrationError,
                    } = await supabase
                        .from(
                            "institution_registrations"
                        )
                        .select(`
              id,
              registration_id,
              institution_id,
              submitted_by,
              status,
              verification_hash,
              submitted_at,
              created_at,
              updated_at,
              rejection_reason,
              reviewed_by,
              reviewed_at,
              documents
            `)
                        .order(
                            "created_at",
                            {
                                ascending: false,
                            }
                        );

                    if (
                        registrationError
                    ) {
                        throw registrationError;
                    }

                    const rows =
                        data || [];

                    if (
                        rows.length === 0
                    ) {
                        setRegistrations(
                            []
                        );

                        return;
                    }

                    // =============================================
                    // INSTITUTIONS
                    // =============================================

                    const institutionIds =
                        [
                            ...new Set(
                                rows
                                    .map(
                                        (row) =>
                                            row.institution_id
                                    )
                                    .filter(Boolean)
                            ),
                        ];

                    let institutions =
                        [];

                    if (
                        institutionIds.length
                    ) {
                        const {
                            data,
                            error,
                        } = await supabase
                            .from("institutions")
                            .select(`
        id,
        official_name,
        official_email,
        npsn,
        address,
        province,
        city,
        postal_code,
        office_phone,
        status,
        verification_status,
        created_by
    `)
                            .in(
                                "id",
                                institutionIds
                            );

                        if (error) {
                            throw error;
                        }

                        institutions =
                            data || [];
                    }

                    // =============================================
                    // PROFILES
                    // =============================================

                    const profileIds =
                        [
                            ...new Set(
                                rows
                                    .map(
                                        (row) =>
                                            row.submitted_by
                                    )
                                    .filter(Boolean)
                            ),
                        ];

                    let profiles =
                        [];

                    if (
                        profileIds.length
                    ) {
                        const {
                            data,
                            error,
                        } = await supabase
                            .from("profiles")
                            .select(`
                id,
                full_name,
                nip,
                role,
                institution_id,
                account_status,
                phone,
                job_title
              `)
                            .in(
                                "id",
                                profileIds
                            );

                        if (error) {
                            throw error;
                        }

                        profiles =
                            data || [];
                    }

                    // =============================================
                    // MAP
                    // =============================================

                    const institutionMap =
                        new Map(
                            institutions.map(
                                (item) => [
                                    item.id,
                                    item,
                                ]
                            )
                        );

                    const profileMap =
                        new Map(
                            profiles.map(
                                (item) => [
                                    item.id,
                                    item,
                                ]
                            )
                        );

                    const merged =
                        rows.map(
                            (registration) => {
                                const institution =
                                    institutionMap.get(
                                        registration.institution_id
                                    ) || null;

                                const profile =
                                    profileMap.get(
                                        registration.submitted_by
                                    ) || null;

                                return {
                                    ...registration,

                                    institution,
                                    profile,

                                    institutionName:
                                        institution?.official_name ||
                                        "-",

                                    institutionEmail:
                                        institution?.official_email ||
                                        "-",

                                    npsn:
                                        institution?.npsn ||
                                        "-",

                                    adminName:
                                        profile?.full_name ||
                                        "-",

                                    adminNip:
                                        profile?.nip ||
                                        "-",

                                    adminPhone:
                                        profile?.phone ||
                                        "-",

                                    adminPosition:
                                        profile?.job_title ||
                                        "-",
                                };
                            }
                        );

                    setRegistrations(
                        merged
                    );
                } catch (err) {
                    console.error(
                        "Load registrations error:",
                        err
                    );

                    setError(
                        err?.message ||
                        "Gagal mengambil data registrasi."
                    );
                } finally {
                    setLoading(false);
                    setRefreshing(false);
                }
            },
            []
        );

    // =======================================================
    // INITIAL LOAD
    // =======================================================

    useEffect(() => {
        loadRegistrations();
    }, [
        loadRegistrations,
    ]);

    // =======================================================
    // REFRESH
    // =======================================================

    const handleRefresh =
        async () => {
            if (refreshing) {
                return;
            }

            setRefreshing(true);

            await loadRegistrations();
        };

    // =======================================================
    // FILTER
    // =======================================================

    const filteredRegistrations =
        useMemo(() => {
            const keyword =
                search
                    .trim()
                    .toLowerCase();

            return registrations.filter(
                (item) => {
                    const matchesSearch =
                        !keyword ||
                        item.registration_id
                            ?.toLowerCase()
                            .includes(keyword) ||
                        item.institutionName
                            ?.toLowerCase()
                            .includes(keyword) ||
                        item.institutionEmail
                            ?.toLowerCase()
                            .includes(keyword) ||
                        item.npsn
                            ?.toLowerCase()
                            .includes(keyword) ||
                        item.adminName
                            ?.toLowerCase()
                            .includes(keyword);

                    const matchesStatus =
                        statusFilter ===
                        "all" ||
                        item.status ===
                        statusFilter;

                    return (
                        matchesSearch &&
                        matchesStatus
                    );
                }
            );
        }, [
            registrations,
            search,
            statusFilter,
        ]);

    // =======================================================
    // STATISTICS
    // =======================================================

    const statistics =
        useMemo(
            () => ({
                total:
                    registrations.length,

                submitted:
                    registrations.filter(
                        (item) =>
                            item.status ===
                            "data_submitted"
                    ).length,

                verified:
                    registrations.filter(
                        (item) =>
                            item.status ===
                            "manual_verification"
                    ).length,

                active:
                    registrations.filter(
                        (item) =>
                            item.status ===
                            "activated"
                    ).length,

                rejected:
                    registrations.filter(
                        (item) =>
                            item.status ===
                            "rejected"
                    ).length,
            }),
            [registrations]
        );

    // =======================================================
    // VERIFY
    // =======================================================

    const handleVerify =
        async (
            registration
        ) => {
            if (
                !registration?.id
            ) {
                return;
            }

            const confirmed =
                window.confirm(
                    `Verifikasi institusi "${registration.institutionName}"?`
                );

            if (!confirmed) {
                return;
            }

            try {
                setActionLoading(
                    true
                );
                setError("");

                const {
                    error,
                } = await supabase.rpc(
                    "superadmin_verify_institution",
                    {
                        p_registration_id:
                            registration.id,
                    }
                );

                if (error) {
                    throw error;
                }

                await loadRegistrations();

                setSelectedRegistration(
                    null
                );
            } catch (err) {
                console.error(
                    "Verify error:",
                    err
                );

                setError(
                    err?.message ||
                    "Gagal melakukan verifikasi."
                );
            } finally {
                setActionLoading(
                    false
                );
            }
        };

    // =======================================================
    // OPEN REJECT
    // =======================================================

    const handleOpenReject =
        (registration) => {
            setError("");

            setRejectRegistration(
                registration
            );
        };

    // =======================================================
    // REJECT
    // =======================================================

    const handleReject =
        async (reason) => {
            if (
                !rejectRegistration?.id
            ) {
                return;
            }

            try {
                setActionLoading(
                    true
                );
                setError("");

                const {
                    error,
                } = await supabase.rpc(
                    "superadmin_reject_institution",
                    {
                        p_registration_id:
                            rejectRegistration.id,

                        p_reason:
                            reason.trim(),
                    }
                );

                if (error) {
                    throw error;
                }

                setRejectRegistration(
                    null
                );

                await loadRegistrations();
            } catch (err) {
                console.error(
                    "Reject error:",
                    err
                );

                setError(
                    err?.message ||
                    "Gagal menolak registrasi."
                );
            } finally {
                setActionLoading(
                    false
                );
            }
        };

    // =======================================================
    // ACTIVATE
    // =======================================================

    const handleActivate =
        async (
            registration
        ) => {
            if (
                !registration?.id
            ) {
                return;
            }

            const confirmed =
                window.confirm(
                    `Aktifkan institusi "${registration.institutionName}"?\n\nAkun admin akan dapat digunakan untuk login setelah aktivasi.`
                );

            if (!confirmed) {
                return;
            }

            try {
                setActionLoading(
                    true
                );
                setError("");

                const {
                    error,
                } = await supabase.rpc(
                    "superadmin_activate_institution",
                    {
                        p_registration_id:
                            registration.id,
                    }
                );

                if (error) {
                    throw error;
                }

                await loadRegistrations();

                setSelectedRegistration(
                    null
                );
            } catch (err) {
                console.error(
                    "Activate error:",
                    err
                );

                setError(
                    err?.message ||
                    "Gagal mengaktifkan institusi."
                );
            } finally {
                setActionLoading(
                    false
                );
            }
        };

    // =======================================================
    // PREVIEW
    // =======================================================

    const handlePreview =
        async (document) => {
            const requestId =
                ++requestIdRef.current;

            try {
                setPreviewLoading(
                    true
                );

                setPreviewError(
                    ""
                );

                if (
                    previewRef.current
                ) {
                    revokePreviewUrl(
                        previewRef.current
                    );

                    previewRef.current =
                        null;
                }

                setPreviewDocument(
                    null
                );

                const preview =
                    await loadDocumentPreview(
                        document
                    );

                if (
                    requestId !==
                    requestIdRef.current
                ) {
                    if (preview) {
                        revokePreviewUrl(
                            preview
                        );
                    }

                    return;
                }

                preview.name =
                    getDocumentNameForPreview(
                        document
                    );

                previewRef.current =
                    preview;

                setPreviewDocument(
                    preview
                );
            } catch (err) {
                console.error(
                    "Preview error:",
                    err
                );

                if (
                    requestId !==
                    requestIdRef.current
                ) {
                    return;
                }

                setPreviewError(
                    err?.message ||
                    "Dokumen tidak dapat ditampilkan."
                );
            } finally {
                if (
                    requestId ===
                    requestIdRef.current
                ) {
                    setPreviewLoading(
                        false
                    );
                }
            }
        };

    // =======================================================
    // CLOSE PREVIEW
    // =======================================================

    const handleClosePreview =
        () => {
            ++requestIdRef.current;

            if (
                previewRef.current
            ) {
                revokePreviewUrl(
                    previewRef.current
                );

                previewRef.current =
                    null;
            }

            setPreviewDocument(
                null
            );

            setPreviewError(
                ""
            );

            setPreviewLoading(
                false
            );
        };

    // =======================================================
    // CLEANUP
    // =======================================================

    useEffect(() => {
        return () => {
            if (
                previewRef.current
            ) {
                revokePreviewUrl(
                    previewRef.current
                );
            }
        };
    }, []);

    // =======================================================
    // RENDER
    // =======================================================

    return (
        <div className="min-h-screen bg-[#111111] text-white">

            <div className="mx-auto max-w-[1500px] p-5 lg:p-7">

                {/* HEADER */}

                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                    <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-dvms-purple/20">
                            <Building2
                                size={20}
                                className="text-dvms-lime"
                            />
                        </div>

                        <div>
                            <h1 className="text-xl font-semibold">
                                Manajemen Institusi
                            </h1>

                            <p className="text-xs text-[#9995a4]">
                                Kelola verifikasi dan
                                aktivasi institusi.
                            </p>
                        </div>

                    </div>

                    <button
                        type="button"
                        onClick={
                            handleRefresh
                        }
                        disabled={
                            refreshing
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#3b3942] bg-[#1c1b20] px-4 py-2 text-xs hover:bg-[#26242b] disabled:opacity-50"
                    >
                        <RefreshCw
                            size={14}
                            className={
                                refreshing
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                        {refreshing
                            ? "Memuat..."
                            : "Refresh"}
                    </button>

                </div>

                {/* ERROR */}

                {error && (
                    <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-300">
                        {error}
                    </div>
                )}

                {/* STATISTICS */}

                <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">

                    <StatCard
                        icon={Building2}
                        label="Total"
                        value={
                            statistics.total
                        }
                    />

                    <StatCard
                        icon={Clock3}
                        label="Menunggu"
                        value={
                            statistics.submitted
                        }
                    />

                    <StatCard
                        icon={ShieldCheck}
                        label="Terverifikasi"
                        value={
                            statistics.verified
                        }
                    />

                    <StatCard
                        icon={CheckCircle2}
                        label="Aktif"
                        value={
                            statistics.active
                        }
                    />

                    <StatCard
                        icon={XCircle}
                        label="Ditolak"
                        value={
                            statistics.rejected
                        }
                    />

                </div>

                {/* FILTER */}

                <div className="mb-5 rounded-xl border border-[#302e36] bg-[#19181d] p-4">

                    <div className="flex flex-col gap-3 lg:flex-row">

                        <div className="relative flex-1">

                            <Search
                                size={15}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#77737f]"
                            />

                            <input
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                                placeholder="Cari institusi, NPSN, registration ID, atau admin..."
                                className="w-full rounded-lg border border-[#393740] bg-[#111014] py-2.5 pl-9 pr-3 text-xs text-white outline-none placeholder:text-[#66636d] focus:border-dvms-purple"
                            />

                        </div>

                        <select
                            value={
                                statusFilter
                            }
                            onChange={(event) =>
                                setStatusFilter(
                                    event.target.value
                                )
                            }
                            className="rounded-lg border border-[#393740] bg-[#111014] px-3 py-2.5 text-xs text-white outline-none"
                        >
                            <option value="all">
                                Semua Status
                            </option>

                            <option value="data_submitted">
                                Menunggu Verifikasi
                            </option>

                            <option value="manual_verification">
                                Terverifikasi
                            </option>

                            <option value="activated">
                                Aktif
                            </option>

                            <option value="rejected">
                                Ditolak
                            </option>
                        </select>

                    </div>

                </div>

                {/* TABLE */}

                <InstitutionTable
                    registrations={
                        filteredRegistrations
                    }
                    loading={loading}
                    actionLoading={
                        actionLoading
                    }
                    onView={
                        setSelectedRegistration
                    }
                    onVerify={
                        handleVerify
                    }
                    onReject={
                        handleOpenReject
                    }
                    onActivate={
                        handleActivate
                    }
                    onPreview={
                        handlePreview
                    }
                />

            </div>

            {/* DETAIL */}

            {selectedRegistration && (
                <InstitutionDetailModal
                    registration={
                        selectedRegistration
                    }
                    loading={
                        actionLoading
                    }
                    onClose={() =>
                        setSelectedRegistration(
                            null
                        )
                    }
                    onVerify={
                        handleVerify
                    }
                    onReject={
                        handleOpenReject
                    }
                    onActivate={
                        handleActivate
                    }
                    onPreview={
                        handlePreview
                    }
                />
            )}

            {/* REJECT */}

            {rejectRegistration && (
                <RejectModal
                    registration={
                        rejectRegistration
                    }
                    loading={
                        actionLoading
                    }
                    onClose={() => {
                        if (
                            !actionLoading
                        ) {
                            setRejectRegistration(
                                null
                            );
                        }
                    }}
                    onSubmit={
                        handleReject
                    }
                />
            )}

            {/* PREVIEW */}

            {(previewLoading ||
                previewDocument ||
                previewError) && (
                    <DocumentPreviewModal
                        document={
                            previewDocument
                        }
                        loading={
                            previewLoading
                        }
                        error={
                            previewError
                        }
                        onClose={
                            handleClosePreview
                        }
                    />
                )}

        </div>
    );
}

// =========================================================
// STAT CARD
// =========================================================

function StatCard({
    icon: Icon,
    label,
    value,
}) {
    return (
        <div className="rounded-xl border border-[#302e36] bg-[#19181d] p-4">

            <div className="flex items-center justify-between">

                <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#77737f]">
                        {label}
                    </p>

                    <p className="mt-1 text-xl font-semibold">
                        {value}
                    </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#24222a]">
                    <Icon
                        size={16}
                        className="text-dvms-lime"
                    />
                </div>

            </div>

        </div>
    );
}

// =========================================================
// PREVIEW NAME
// =========================================================

function getDocumentNameForPreview(
    document
) {
    if (
        document?.fileName &&
        /\.[a-z0-9]{1,10}$/i.test(
            document.fileName
        )
    ) {
        return document.fileName;
    }

    if (
        document?.name &&
        /\.[a-z0-9]{1,10}$/i.test(
            document.name
        )
    ) {
        return document.name;
    }

    const location =
        document?.fileUrl ||
        document?.path ||
        document?.storagePath ||
        document?.file_path ||
        document?.filePath;

    if (location) {
        const parts =
            String(location)
                .split("?")[0]
                .split("/");

        const filename =
            parts[parts.length - 1];

        if (filename) {
            try {
                return decodeURIComponent(
                    filename
                );
            } catch {
                return filename;
            }
        }
    }

    return (
        document?.fileName ||
        document?.name ||
        "Dokumen"
    );
}