import { useCallback, useEffect, useState } from "react";

import {
    Activity,
    CheckCircle2,
    Clock3,
    Database,
    FileCheck2,
    Loader2,
    RefreshCw,
    ShieldCheck,
    XCircle,
} from "lucide-react";

import {
    StatCard,
    StatusPill,
} from "../../components/admin/SidebarPage";

import { supabase } from "../../lib/supabase";

export default function SuperDashboard() {
    const [stats, setStats] = useState({
        totalInstitutions: 0,
        pendingRegistrations: 0,
        activeInstitutions: 0,
        totalAnchors: 0,
        successfulAnchors: 0,
        failedAnchors: 0,
        processingAnchors: 0,
    });

    const [recentAnchors, setRecentAnchors] = useState([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [errorMessage, setErrorMessage] = useState("");

    const loadDashboard = useCallback(
        async (showRefresh = false) => {
            if (showRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setErrorMessage("");

            try {
                /*
                 * =====================================================
                 * 1. AMBIL DATA INSTITUSI
                 * =====================================================
                 */

                const {
                    data: institutionData,
                    error: institutionError,
                } = await supabase
                    .from("institutions")
                    .select(
                        "id, official_name, status, verification_status, created_at"
                    )
                    .order("created_at", {
                        ascending: false,
                    });

                if (institutionError) {
                    throw new Error(
                        `Gagal mengambil data institusi: ${institutionError.message}`
                    );
                }

                const institutions =
                    institutionData || [];

                const totalInstitutions =
                    institutions.length;

                const activeInstitutions =
                    institutions.filter(
                        (institution) =>
                            institution.status ===
                            "active"
                    ).length;

                /*
                 * =====================================================
                 * 2. AMBIL DATA REGISTRASI
                 * =====================================================
                 */

                const {
                    data: registrationData,
                    error: registrationError,
                } = await supabase
                    .from(
                        "institution_registrations"
                    )
                    .select(
                        "id, registration_id, status, submitted_at, institution_id"
                    )
                    .order("created_at", {
                        ascending: false,
                    });

                if (registrationError) {
                    throw new Error(
                        `Gagal mengambil data registrasi: ${registrationError.message}`
                    );
                }

                const registrations =
                    registrationData || [];

                const pendingRegistrations =
                    registrations.filter(
                        (registration) =>
                            registration.status ===
                            "data_submitted" ||
                            registration.status ===
                            "documents_received"
                    ).length;

                /*
                 * =====================================================
                 * 3. AMBIL DATA ANCHOR
                 * =====================================================
                 */

                const {
                    data: anchorData,
                    error: anchorError,
                } = await supabase
                    .from("diploma_anchors")
                    .select(
                        `
                        id,
                        diploma_id,
                        sha256_hash,
                        ipfs_cid,
                        polygon_tx_hash,
                        network,
                        gas_fee,
                        status,
                        anchored_at,
                        created_at
                    `
                    )
                    .order("created_at", {
                        ascending: false,
                    })
                    .limit(10);

                if (anchorError) {
                    throw new Error(
                        `Gagal mengambil data anchor: ${anchorError.message}`
                    );
                }

                const anchors =
                    anchorData || [];

                /*
                 * =====================================================
                 * 4. AMBIL DATA DIPLOMA UNTUK MENGETAHUI INSTITUSI
                 * =====================================================
                 */

                const diplomaIds = [
                    ...new Set(
                        anchors
                            .map(
                                (anchor) =>
                                    anchor.diploma_id
                            )
                            .filter(Boolean)
                    ),
                ];

                let diplomaMap = {};

                if (diplomaIds.length > 0) {
                    const {
                        data: diplomaData,
                        error: diplomaError,
                    } = await supabase
                        .from("diplomas")
                        .select(
                            "id, institution_id, diploma_number, document_hash, ipfs_cid"
                        )
                        .in(
                            "id",
                            diplomaIds
                        );

                    if (diplomaError) {
                        throw new Error(
                            `Gagal mengambil data diploma: ${diplomaError.message}`
                        );
                    }

                    diplomaMap =
                        (
                            diplomaData ||
                            []
                        ).reduce(
                            (
                                accumulator,
                                diploma
                            ) => {
                                accumulator[
                                    diploma.id
                                ] = diploma;

                                return accumulator;
                            },
                            {}
                        );
                }

                /*
                 * =====================================================
                 * 5. GABUNGKAN DATA INSTITUSI
                 * =====================================================
                 */

                const institutionMap =
                    institutions.reduce(
                        (
                            accumulator,
                            institution
                        ) => {
                            accumulator[
                                institution.id
                            ] =
                                institution;

                            return accumulator;
                        },
                        {}
                    );

                /*
                 * =====================================================
                 * 6. BENTUK DATA RECENT ANCHORS
                 * =====================================================
                 */

                const formattedAnchors =
                    anchors.map(
                        (anchor) => {
                            const diploma =
                                diplomaMap[
                                anchor.diploma_id
                                ];

                            const institution =
                                institutionMap[
                                diploma?.institution_id
                                ];

                            return {
                                ...anchor,
                                diploma,
                                institution,
                            };
                        }
                    );

                /*
                 * =====================================================
                 * 7. HITUNG STATISTIK ANCHOR
                 * =====================================================
                 */

                const totalAnchors =
                    await getTotalAnchorCount();

                const successfulAnchors =
                    await getAnchorCountByStatus(
                        "anchored"
                    );

                const failedAnchors =
                    await getAnchorCountByStatus(
                        "failed"
                    );

                const processingAnchors =
                    await getAnchorCountByStatus(
                        "processing"
                    );

                /*
                 * =====================================================
                 * 8. UPDATE STATE
                 * =====================================================
                 */

                setStats({
                    totalInstitutions,
                    pendingRegistrations,
                    activeInstitutions,
                    totalAnchors,
                    successfulAnchors,
                    failedAnchors,
                    processingAnchors,
                });

                setRecentAnchors(
                    formattedAnchors
                );
            } catch (error) {
                console.error(
                    "Dashboard error:",
                    error
                );

                setErrorMessage(
                    error?.message ||
                    "Terjadi kesalahan saat mengambil data dashboard."
                );
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        []
    );

    /*
     * =========================================================
     * INITIAL LOAD
     * =========================================================
     */

    useEffect(() => {
        loadDashboard();

        /*
         * Refresh otomatis setiap 15 detik.
         * Ini membuat dashboard terasa real-time
         * tanpa harus reload halaman.
         */

        const interval =
            setInterval(() => {
                loadDashboard(true);
            }, 15000);

        return () => {
            clearInterval(interval);
        };
    }, [loadDashboard]);

    return (
        <div className="space-y-4">
            {/* =====================================================
                HEADER
            ====================================================== */}

            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-[#d6c9ee]">
                        Overview
                    </h1>

                    <p className="text-[10px] text-[#aaa6b4]">
                        Monitoring institusi, registrasi,
                        diploma anchoring, dan status
                        sistem DVMS.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        loadDashboard(true)
                    }
                    disabled={loading || refreshing}
                    className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-[#41404a] bg-[#17171a] px-3 text-[9px] font-medium text-[#d7d3dc] transition hover:border-[#777481] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <RefreshCw
                        size={11}
                        className={
                            refreshing
                                ? "animate-spin"
                                : ""
                        }
                    />

                    {refreshing
                        ? "Memperbarui..."
                        : "Refresh"}
                </button>
            </div>

            {/* =====================================================
                ERROR MESSAGE
            ====================================================== */}

            {errorMessage && (
                <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-[10px] leading-relaxed text-red-300">
                    {errorMessage}
                </div>
            )}

            {/* =====================================================
                LOADING
            ====================================================== */}

            {loading ? (
                <div className="dvms-card flex min-h-[260px] items-center justify-center">
                    <div className="flex flex-col items-center text-center">
                        <Loader2
                            size={24}
                            className="animate-spin text-[#b6ff00]"
                        />

                        <div className="mt-3 text-xs font-medium text-[#ddd9e2]">
                            Memuat dashboard...
                        </div>

                        <div className="mt-1 text-[9px] text-[#777481]">
                            Mengambil data dari
                            database DVMS.
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* =================================================
                        STAT CARDS
                    ================================================== */}

                    <div className="grid gap-3 md:grid-cols-3">
                        <StatCard
                            label="Total Instansi"
                            value={
                                stats.totalInstitutions
                            }
                            detail={`${stats.activeInstitutions} aktif`}
                        />

                        <StatCard
                            label="Registrasi Menunggu"
                            value={
                                stats.pendingRegistrations
                            }
                            detail="Menunggu verifikasi"
                        />

                        <StatCard
                            label="Total Anchors"
                            value={
                                stats.totalAnchors
                            }
                            detail={`${stats.successfulAnchors} berhasil`}
                            accent="red"
                        />
                    </div>

                    {/* =================================================
                        SECONDARY METRICS
                    ================================================== */}

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <MetricCard
                            icon={
                                <ShieldCheck
                                    size={15}
                                />
                            }
                            label="Institusi Aktif"
                            value={
                                stats.activeInstitutions
                            }
                            description="Institusi yang sudah aktif"
                        />

                        <MetricCard
                            icon={
                                <FileCheck2
                                    size={15}
                                />
                            }
                            label="Anchor Berhasil"
                            value={
                                stats.successfulAnchors
                            }
                            description="Status anchored"
                        />

                        <MetricCard
                            icon={
                                <Clock3
                                    size={15}
                                />
                            }
                            label="Anchor Diproses"
                            value={
                                stats.processingAnchors
                            }
                            description="Status processing"
                        />

                        <MetricCard
                            icon={
                                <XCircle
                                    size={15}
                                />
                            }
                            label="Anchor Gagal"
                            value={
                                stats.failedAnchors
                            }
                            description="Status failed"
                        />
                    </div>

                    {/* =================================================
                        SYSTEM INFORMATION
                    ================================================== */}

                    <div className="grid gap-3 md:grid-cols-2">
                        <div className="dvms-card p-4">
                            <div className="flex items-center gap-2">
                                <div className="grid h-8 w-8 place-items-center rounded-md bg-[#2c2c31] text-[#b6ff00]">
                                    <Database
                                        size={15}
                                    />
                                </div>

                                <div>
                                    <div className="text-[8px] uppercase tracking-wider text-[#777481]">
                                        Database
                                    </div>

                                    <div className="mt-0.5 text-xs font-semibold text-white">
                                        Supabase
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3 flex items-center gap-2 text-[9px] text-emerald-300">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                                Connected
                            </div>

                            <p className="mt-2 text-[8px] leading-relaxed text-[#777481]">
                                Dashboard mengambil data
                                langsung dari database
                                DVMS.
                            </p>
                        </div>

                        <div className="dvms-card p-4">
                            <div className="flex items-center gap-2">
                                <div className="grid h-8 w-8 place-items-center rounded-md bg-[#2c2c31] text-[#b6ff00]">
                                    <Activity
                                        size={15}
                                    />
                                </div>

                                <div>
                                    <div className="text-[8px] uppercase tracking-wider text-[#777481]">
                                        Network
                                    </div>

                                    <div className="mt-0.5 text-xs font-semibold text-white">
                                        Polygon Amoy
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3 flex items-center gap-2 text-[9px] text-emerald-300">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                                Configured
                            </div>

                            <p className="mt-2 text-[8px] leading-relaxed text-[#777481]">
                                Network yang digunakan
                                untuk proses anchoring
                                diploma pada sistem DVMS.
                            </p>
                        </div>
                    </div>

                    {/* =================================================
                        RECENT ANCHORS
                    ================================================== */}

                    <div className="dvms-card overflow-hidden">
                        <div className="flex items-center justify-between border-b border-[#393840] px-4 py-3">
                            <div>
                                <h2 className="text-sm font-semibold text-[#e4e1e8]">
                                    Recent Anchoring
                                </h2>

                                <p className="mt-0.5 text-[8px] text-[#777481]">
                                    Aktivitas anchoring diploma
                                    terbaru.
                                </p>
                            </div>

                            <div className="flex items-center gap-1.5 text-[8px] text-[#777481]">
                                <Activity
                                    size={10}
                                />

                                Auto refresh 15s
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px] text-left text-[9px]">
                                <thead className="bg-[#2d3749]">
                                    <tr>
                                        {[
                                            "Waktu",
                                            "Instansi Asal",
                                            "Tx Hash",
                                            "SHA-256 / IPFS CID",
                                            "Network",
                                            "Status",
                                        ].map(
                                            (
                                                label
                                            ) => (
                                                <th
                                                    key={
                                                        label
                                                    }
                                                    className="p-3 font-medium text-[#ddd9e2]"
                                                >
                                                    {
                                                        label
                                                    }
                                                </th>
                                            )
                                        )}
                                    </tr>
                                </thead>

                                <tbody>
                                    {recentAnchors.length ===
                                        0 ? (
                                        <tr>
                                            <td
                                                colSpan={
                                                    6
                                                }
                                                className="p-10 text-center"
                                            >
                                                <div className="flex flex-col items-center">
                                                    <div className="grid h-10 w-10 place-items-center rounded-full bg-[#2c2c31] text-[#777481]">
                                                        <Database
                                                            size={
                                                                17
                                                            }
                                                        />
                                                    </div>

                                                    <div className="mt-3 text-[10px] font-medium text-[#aaa6b4]">
                                                        Belum ada
                                                        data
                                                        anchoring
                                                    </div>

                                                    <div className="mt-1 text-[8px] text-[#66636d]">
                                                        Data akan
                                                        muncul
                                                        setelah
                                                        diploma
                                                        berhasil
                                                        di-anchor.
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        recentAnchors.map(
                                            (
                                                anchor
                                            ) => (
                                                <AnchorRow
                                                    key={
                                                        anchor.id
                                                    }
                                                    anchor={
                                                        anchor
                                                    }
                                                />
                                            )
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="border-t border-[#41404a] px-4 py-2.5 text-[8px] text-[#777481]">
                            Menampilkan{" "}
                            {
                                recentAnchors.length
                            }{" "}
                            aktivitas anchoring
                            terbaru.
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

/*
 * =============================================================
 * STAT CARD TAMBAHAN
 * =============================================================
 */

function MetricCard({
    icon,
    label,
    value,
    description,
}) {
    return (
        <div className="dvms-card p-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="text-[8px] uppercase tracking-wider text-[#777481]">
                        {label}
                    </div>

                    <div className="mt-1 text-xl font-semibold text-white">
                        {value}
                    </div>
                </div>

                <div className="grid h-8 w-8 place-items-center rounded-md bg-[#2c2c31] text-[#b6ff00]">
                    {icon}
                </div>
            </div>

            <div className="mt-2 text-[8px] text-[#777481]">
                {description}
            </div>
        </div>
    );
}

/*
 * =============================================================
 * ANCHOR ROW
 * =============================================================
 */

function AnchorRow({ anchor }) {
    const institutionName =
        anchor?.institution?.official_name ||
        "Institusi tidak ditemukan";

    const txHash =
        anchor?.polygon_tx_hash ||
        "";

    const hash =
        anchor?.sha256_hash ||
        anchor?.diploma?.document_hash ||
        "";

    const ipfsCid =
        anchor?.ipfs_cid ||
        anchor?.diploma?.ipfs_cid ||
        "";

    const network =
        anchor?.network ||
        "polygon-amoy";

    return (
        <tr className="border-t border-[#29282e] bg-[#303a4d] transition hover:bg-[#364157]">
            <td className="p-3 text-[#aaa6b4]">
                {formatRelativeTime(
                    anchor?.created_at
                )}
            </td>

            <td className="p-3">
                <div className="font-medium text-[#e4e1e8]">
                    {institutionName}
                </div>

                {anchor?.diploma
                    ?.diploma_number && (
                        <div className="mt-0.5 text-[7px] text-[#777481]">
                            No. Diploma:{" "}
                            {
                                anchor
                                    .diploma
                                    .diploma_number
                            }
                        </div>
                    )}
            </td>

            <td className="p-3">
                <div className="max-w-[170px] truncate font-mono text-[8px] text-[#d6c9ee]">
                    {txHash
                        ? shortenHash(
                            txHash
                        )
                        : "-"}
                </div>
            </td>

            <td className="p-3">
                <div className="max-w-[230px]">
                    {hash && (
                        <div className="truncate font-mono text-[7px] text-[#aaa6b4]">
                            SHA:{" "}
                            {shortenHash(
                                hash
                            )}
                        </div>
                    )}

                    {ipfsCid && (
                        <div className="mt-1 truncate font-mono text-[7px] text-[#777481]">
                            IPFS:{" "}
                            {shortenHash(
                                ipfsCid
                            )}
                        </div>
                    )}

                    {!hash &&
                        !ipfsCid && (
                            <span className="text-[#66636d]">
                                -
                            </span>
                        )}
                </div>
            </td>

            <td className="p-3">
                <span className="rounded-md border border-[#41404a] bg-[#1c1c20] px-2 py-1 font-mono text-[7px] text-[#aaa6b4]">
                    {network}
                </span>
            </td>

            <td className="p-3">
                <AnchorStatus status={anchor.status} />
            </td>
        </tr>
    );
}

/*
 * =============================================================
 * ANCHOR STATUS
 * =============================================================
 */

function AnchorStatus({ status }) {
    if (status === "anchored") {
        return (
            <StatusPill type="green">
                <span className="inline-flex items-center gap-1">
                    <CheckCircle2 size={9} />
                    Anchored
                </span>
            </StatusPill>
        );
    }

    if (status === "failed") {
        return (
            <StatusPill type="red">
                <span className="inline-flex items-center gap-1">
                    <XCircle size={9} />
                    Failed
                </span>
            </StatusPill>
        );
    }

    if (status === "revoked") {
        return (
            <StatusPill type="red">
                Revoked
            </StatusPill>
        );
    }

    return (
        <StatusPill type="lime">
            <span className="inline-flex items-center gap-1">
                <Clock3 size={9} />
                Processing
            </span>
        </StatusPill>
    );
}

/*
 * =============================================================
 * TOTAL ANCHOR COUNT
 * =============================================================
 */

async function getTotalAnchorCount() {
    const {
        count,
        error,
    } = await supabase
        .from("diploma_anchors")
        .select("id", {
            count: "exact",
            head: true,
        });

    if (error) {
        throw new Error(
            `Gagal menghitung total anchor: ${error.message}`
        );
    }

    return count || 0;
}

/*
 * =============================================================
 * ANCHOR COUNT BY STATUS
 * =============================================================
 */

async function getAnchorCountByStatus(
    status
) {
    const {
        count,
        error,
    } = await supabase
        .from("diploma_anchors")
        .select("id", {
            count: "exact",
            head: true,
        })
        .eq("status", status);

    if (error) {
        throw new Error(
            `Gagal menghitung anchor ${status}: ${error.message}`
        );
    }

    return count || 0;
}

/*
 * =============================================================
 * SHORTEN HASH
 * =============================================================
 */

function shortenHash(value) {
    if (!value) return "-";

    const stringValue = String(value);

    if (stringValue.length <= 22) {
        return stringValue;
    }

    return `${stringValue.slice(
        0,
        10
    )}...${stringValue.slice(-8)}`;
}

/*
 * =============================================================
 * RELATIVE TIME
 * =============================================================
 */

function formatRelativeTime(value) {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    const now = new Date();

    const difference =
        Math.floor(
            (now.getTime() -
                date.getTime()) /
            1000
        );

    if (difference < 0) {
        return formatDateTime(date);
    }

    if (difference < 60) {
        return `${difference} detik lalu`;
    }

    const minutes =
        Math.floor(
            difference / 60
        );

    if (minutes < 60) {
        return `${minutes} menit lalu`;
    }

    const hours =
        Math.floor(
            minutes / 60
        );

    if (hours < 24) {
        return `${hours} jam lalu`;
    }

    const days =
        Math.floor(
            hours / 24
        );

    if (days < 7) {
        return `${days} hari lalu`;
    }

    return formatDateTime(date);
}

/*
 * =============================================================
 * DATE TIME
 * =============================================================
 */

function formatDateTime(value) {
    const date =
        value instanceof Date
            ? value
            : new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "-";
    }

    return date.toLocaleString(
        "id-ID",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }
    );
}