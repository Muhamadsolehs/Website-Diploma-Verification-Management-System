import {
    Blocks,
    Database,
    RefreshCw,
    SlidersHorizontal,
    MoreVertical,
    ExternalLink,
} from "lucide-react";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

import {
    PageTitle,
    StatCard,
    StatusPill,
} from "../../components/admin/SidebarPage";

export default function Web3Anchoring() {
    const { profile } = useAuth();

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const loadData = useCallback(async () => {
        if (!profile?.institution_id) {
            setRows([]);
            setLoading(false);
            return;
        }

        try {
            setError("");

            const { data, error: diplomaError } = await supabase
                .from("diplomas")
                .select(`
          id,
          diploma_number,
          nisn,
          major,
          graduation_date,
          document_hash,
          ipfs_cid,
          ocr_status,
          validity_status,
          anchored_at,
          created_at,
          alumni:alumni_id (
            id,
            full_name
          )
        `)
                .eq("institution_id", profile.institution_id)
                .order("created_at", { ascending: false });

            if (diplomaError) {
                throw diplomaError;
            }

            const diplomaIds = (data || []).map((item) => item.id);

            let anchors = [];

            if (diplomaIds.length > 0) {
                const { data: anchorData, error: anchorError } = await supabase
                    .from("diploma_anchors")
                    .select(`
            diploma_id,
            polygon_tx_hash,
            anchored_at
          `)
                    .in("diploma_id", diplomaIds);

                if (anchorError) {
                    console.warn(
                        "Tidak dapat mengambil diploma_anchors:",
                        anchorError.message
                    );
                } else {
                    anchors = anchorData || [];
                }
            }

            const anchorMap = new Map();

            anchors.forEach((anchor) => {
                anchorMap.set(anchor.diploma_id, anchor);
            });

            const mappedRows = (data || []).map((diploma) => {
                const anchor = anchorMap.get(diploma.id);

                let status = "Pending";

                if (anchor?.polygon_tx_hash || diploma.anchored_at) {
                    status = "Anchored";
                } else if (
                    diploma.document_hash ||
                    diploma.ipfs_cid ||
                    diploma.ocr_status === "processing"
                ) {
                    status = "Processing";
                }

                return {
                    id: diploma.id,
                    diplomaNumber: diploma.diploma_number || "-",
                    alumniName: diploma.alumni?.full_name || "Belum terhubung",
                    ipfsCid: diploma.ipfs_cid || "-",
                    hash: diploma.document_hash || "-",
                    txHash: anchor?.polygon_tx_hash || null,
                    status,
                    date: formatDate(
                        anchor?.anchored_at ||
                        diploma.anchored_at ||
                        diploma.created_at
                    ),
                };
            });

            setRows(mappedRows);
        } catch (err) {
            console.error(err);
            setError(
                err.message || "Gagal mengambil data Web3 Anchoring."
            );
            setRows([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [profile?.institution_id]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadData();
    };

    const totalAnchored = rows.filter(
        (row) => row.status === "Anchored"
    ).length;

    const totalProcessing = rows.filter(
        (row) => row.status === "Processing"
    ).length;

    const totalPending = rows.filter(
        (row) => row.status === "Pending"
    ).length;

    const totalWithIpfs = rows.filter(
        (row) => row.ipfsCid && row.ipfsCid !== "-"
    ).length;

    return (
        <div>
            <PageTitle
                title="Web3 Anchoring Ledger"
                subtitle="Monitor and manage diploma credentials anchored to the blockchain."
                action={
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="btn-lime disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <RefreshCw
                            size={12}
                            className={refreshing ? "animate-spin" : ""}
                        />
                        {refreshing ? "Refreshing..." : "Refresh Data"}
                    </button>
                }
            />

            {/* STATISTICS */}
            <div className="grid gap-4 md:grid-cols-4">
                <StatCard
                    label="Total Anchored"
                    value={totalAnchored.toLocaleString("id-ID")}
                    detail={`${rows.length.toLocaleString("id-ID")} total diploma`}
                />

                <StatCard
                    label="IPFS Storage"
                    value={totalWithIpfs.toLocaleString("id-ID")}
                    detail="Diploma dengan IPFS CID"
                />

                <StatCard
                    label="Processing"
                    value={totalProcessing.toLocaleString("id-ID")}
                    detail={`${totalPending.toLocaleString("id-ID")} pending`}
                />

                <StatCard
                    label="Network Status"
                    value="READY"
                    detail="Blockchain integration"
                    accent="green"
                />
            </div>

            {/* ERROR */}
            {error && (
                <div className="mt-4 rounded border border-red-400/30 bg-red-500/10 px-3 py-2 text-[10px] text-red-300">
                    {error}
                </div>
            )}

            {/* LEDGER */}
            <div className="dvms-card mt-5 overflow-hidden">
                <div className="flex items-center justify-between border-b border-[#3a3942] p-3">
                    <div className="flex items-center gap-2 text-[10px] text-[#c4c0ca]">
                        <Blocks size={13} />
                        <span>Diploma Anchoring Ledger</span>
                    </div>

                    <div className="flex items-center gap-3 text-[#a7a3ae]">
                        <SlidersHorizontal
                            size={13}
                            className="cursor-pointer"
                        />

                        <MoreVertical
                            size={13}
                            className="cursor-pointer"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-[9px]">
                        <thead>
                            <tr className="border-b border-[#3a3942] text-[#c4c0ca]">
                                {[
                                    "No. Ijazah",
                                    "Alumni Name",
                                    "IPFS CID",
                                    "SHA-256 Hash",
                                    "Polygon TxHash",
                                    "Status",
                                    "Date",
                                ].map((item) => (
                                    <th
                                        key={item}
                                        className="whitespace-nowrap p-3"
                                    >
                                        {item}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="p-8 text-center text-[#aaa6b0]"
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <RefreshCw
                                                size={12}
                                                className="animate-spin"
                                            />
                                            Memuat data anchoring...
                                        </div>
                                    </td>
                                </tr>
                            ) : rows.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="p-8 text-center text-[#aaa6b0]"
                                    >
                                        <div className="flex flex-col items-center gap-2">
                                            <Database size={20} />

                                            <span>
                                                Belum ada data diploma untuk ditampilkan.
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                rows.map((row) => (
                                    <tr
                                        key={row.id}
                                        className="border-b border-[#2e2d33] transition hover:bg-white/[0.02]"
                                    >
                                        {/* DIPLOMA NUMBER */}
                                        <td className="p-3 font-medium text-white">
                                            {row.diplomaNumber}
                                        </td>

                                        {/* ALUMNI */}
                                        <td className="p-3">
                                            {row.alumniName}
                                        </td>

                                        {/* IPFS */}
                                        <td className="p-3 font-mono">
                                            {row.ipfsCid === "-" ? (
                                                <span className="text-[#77737e]">
                                                    -
                                                </span>
                                            ) : (
                                                <span
                                                    title={row.ipfsCid}
                                                    className="text-[#b8ff32]"
                                                >
                                                    {shortenHash(row.ipfsCid)}
                                                </span>
                                            )}
                                        </td>

                                        {/* SHA256 */}
                                        <td className="p-3 font-mono">
                                            {row.hash === "-" ? (
                                                <span className="text-[#77737e]">
                                                    -
                                                </span>
                                            ) : (
                                                <span
                                                    title={row.hash}
                                                    className="text-[#c4c0ca]"
                                                >
                                                    {shortenHash(row.hash)}
                                                </span>
                                            )}
                                        </td>

                                        {/* POLYGON TX */}
                                        <td className="p-3 font-mono">
                                            {row.txHash ? (
                                                <a
                                                    href={`https://amoy.polygonscan.com/tx/${row.txHash}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1 text-[#b8ff32] hover:underline"
                                                >
                                                    {shortenHash(row.txHash)}
                                                    <ExternalLink size={9} />
                                                </a>
                                            ) : (
                                                <span className="text-[#77737e]">
                                                    Pending...
                                                </span>
                                            )}
                                        </td>

                                        {/* STATUS */}
                                        <td className="p-3">
                                            <StatusPill
                                                type={
                                                    row.status === "Anchored"
                                                        ? "green"
                                                        : row.status === "Processing"
                                                            ? "lime"
                                                            : "lime"
                                                }
                                            >
                                                {row.status}
                                            </StatusPill>
                                        </td>

                                        {/* DATE */}
                                        <td className="whitespace-nowrap p-3">
                                            {row.date}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* FOOTER */}
                <div className="flex flex-col justify-between gap-2 p-3 text-[9px] text-[#a7a3ae] sm:flex-row">
                    <span>
                        Showing{" "}
                        {rows.length === 0 ? 0 : 1} to{" "}
                        {rows.length} of{" "}
                        {rows.length.toLocaleString("id-ID")} entries
                    </span>

                    <span>
                        ‹{" "}
                        <b className="rounded bg-dvms-purple px-2 py-1 text-white">
                            1
                        </b>{" "}
                        ›
                    </span>
                </div>
            </div>
        </div>
    );
}

function shortenHash(value) {
    if (!value || value === "-") {
        return "-";
    }

    if (value.length <= 16) {
        return value;
    }

    return `${value.slice(0, 8)}...${value.slice(-6)}`;
}

function formatDate(value) {
    if (!value) {
        return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}