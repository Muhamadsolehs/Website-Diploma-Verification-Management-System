import { useCallback, useEffect, useMemo, useState } from "react";

import {
    Trash2,
    Pencil,
    Plus,
    Search,
    RefreshCw,
    X,
    Eye,
} from "lucide-react";

import {
    PageTitle,
    StatusPill,
} from "../../components/admin/SidebarPage";

import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const emptyForm = {
    diploma_number: "",
    nisn: "",
    major: "",
    graduation_date: "",
    ocr_status: "pending",
    validity_status: "pending",
};

export default function DiplomaManagement() {
    const navigate = useNavigate();
    const { profile } = useAuth();

    const [diplomas, setDiplomas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [search, setSearch] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [editingDiploma, setEditingDiploma] = useState(null);

    const [form, setForm] = useState(emptyForm);

    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    /*
     * =========================================================
     * LOAD DIPLOMAS
     * =========================================================
     */

    const loadDiplomas = useCallback(
        async ({ refresh = false } = {}) => {
            if (!profile?.institution_id) {
                setDiplomas([]);
                setLoading(false);
                setRefreshing(false);
                return;
            }

            try {
                if (refresh) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                setError("");

                const { data, error: fetchError } = await supabase
                    .from("diplomas")
                    .select(`
                        id,
                        institution_id,
                        alumni_id,
                        diploma_number,
                        nisn,
                        major,
                        graduation_date,
                        document_hash,
                        ipfs_cid,
                        document_path,
                        document_name,
                        document_mime_type,
                        document_size,
                        ocr_status,
                        validity_status,
                        anchored_at,
                        created_at,
                        updated_at
                    `)
                    .eq(
                        "institution_id",
                        profile.institution_id
                    )
                    .order("created_at", {
                        ascending: false,
                    });

                if (fetchError) {
                    throw fetchError;
                }

                /*
                 * Ambil data alumni yang berhubungan dengan diploma.
                 * Data alumni digunakan sebagai fallback apabila
                 * NISN / jurusan pada diploma belum lengkap.
                 */

                const alumniIds = [
                    ...new Set(
                        (data || [])
                            .map(
                                (item) =>
                                    item.alumni_id
                            )
                            .filter(Boolean)
                    ),
                ];

                let alumniMap = {};

                if (alumniIds.length > 0) {
                    const {
                        data: alumniData,
                        error: alumniError,
                    } = await supabase
                        .from("alumni")
                        .select(`
                            id,
                            nisn,
                            full_name,
                            major,
                            graduation_year
                        `)
                        .in("id", alumniIds);

                    if (alumniError) {
                        throw alumniError;
                    }

                    alumniMap = (
                        alumniData || []
                    ).reduce(
                        (acc, item) => {
                            acc[item.id] = item;
                            return acc;
                        },
                        {}
                    );
                }

                const mergedData = (
                    data || []
                ).map((item) => {
                    const alumni = item.alumni_id
                        ? alumniMap[item.alumni_id]
                        : null;

                    return {
                        ...item,
                        alumni,

                        display_nisn:
                            item.nisn ||
                            alumni?.nisn ||
                            "-",

                        display_major:
                            item.major ||
                            alumni?.major ||
                            "-",

                        alumni_name:
                            alumni?.full_name ||
                            "-",
                    };
                });

                setDiplomas(mergedData);
            } catch (err) {
                console.error(
                    "Load diplomas error:",
                    err
                );

                setError(
                    err?.message ||
                    "Gagal mengambil data diploma."
                );
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [profile?.institution_id]
    );

    useEffect(() => {
        loadDiplomas();
    }, [loadDiplomas]);

    /*
     * =========================================================
     * SEARCH
     * =========================================================
     */

    const filteredDiplomas = useMemo(() => {
        const keyword = search
            .trim()
            .toLowerCase();

        if (!keyword) {
            return diplomas;
        }

        return diplomas.filter((item) => {
            return (
                item.diploma_number
                    ?.toLowerCase()
                    .includes(keyword) ||

                item.display_nisn
                    ?.toLowerCase()
                    .includes(keyword) ||

                item.display_major
                    ?.toLowerCase()
                    .includes(keyword) ||

                item.alumni_name
                    ?.toLowerCase()
                    .includes(keyword) ||

                item.ocr_status
                    ?.toLowerCase()
                    .includes(keyword) ||

                item.validity_status
                    ?.toLowerCase()
                    .includes(keyword)
            );
        });
    }, [diplomas, search]);

    /*
     * =========================================================
     * FORM
     * =========================================================
     */

    const openEditModal = (item) => {
        setEditingDiploma(item);

        setForm({
            diploma_number:
                item.diploma_number || "",

            nisn:
                item.nisn || "",

            major:
                item.major || "",

            graduation_date:
                item.graduation_date || "",

            ocr_status:
                item.ocr_status || "pending",

            validity_status:
                item.validity_status ||
                "pending",
        });

        setError("");
        setSuccess("");

        setModalOpen(true);
    };

    const closeModal = () => {
        if (saving) return;

        setModalOpen(false);
        setEditingDiploma(null);
        setForm(emptyForm);
    };

    const handleChange = (event) => {
        const {
            name,
            value,
        } = event.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    /*
     * =========================================================
     * PREVIEW DOCUMENT
     * =========================================================
     */

    const handlePreview = (item) => {
        setError("");
        setSuccess("");

        if (!item?.ipfs_cid) {
            setError(
                "Dokumen belum memiliki IPFS CID sehingga belum dapat dipreview."
            );
            return;
        }

        const previewUrl =
            `https://gateway.pinata.cloud/ipfs/${item.ipfs_cid}`;

        window.open(
            previewUrl,
            "_blank",
            "noopener,noreferrer"
        );
    };

    /*
     * =========================================================
     * UPDATE
     * =========================================================
     */

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!profile?.institution_id) {
            setError(
                "Institusi akun tidak ditemukan. Silakan login ulang."
            );
            return;
        }

        if (!editingDiploma) {
            return;
        }

        if (!form.diploma_number.trim()) {
            setError(
                "Nomor seri ijazah wajib diisi."
            );
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const payload = {
                diploma_number:
                    form.diploma_number.trim(),

                nisn:
                    form.nisn.trim() || null,

                major:
                    form.major.trim() || null,

                graduation_date:
                    form.graduation_date || null,

                ocr_status:
                    form.ocr_status,

                validity_status:
                    form.validity_status,
            };

            const {
                data,
                error: updateError,
            } = await supabase
                .from("diplomas")
                .update(payload)
                .eq(
                    "id",
                    editingDiploma.id
                )
                .eq(
                    "institution_id",
                    profile.institution_id
                )
                .select(`
                    id,
                    institution_id,
                    alumni_id,
                    diploma_number,
                    nisn,
                    major,
                    graduation_date,
                    document_hash,
                    ipfs_cid,
                    document_path,
                    document_name,
                    document_mime_type,
                    document_size,
                    ocr_status,
                    validity_status,
                    anchored_at,
                    created_at,
                    updated_at
                `)
                .single();

            if (updateError) {
                throw updateError;
            }

            setDiplomas((prev) =>
                prev.map((item) =>
                    item.id === data.id
                        ? {
                            ...item,
                            ...data,

                            display_nisn:
                                data.nisn ||
                                item.alumni?.nisn ||
                                "-",

                            display_major:
                                data.major ||
                                item.alumni?.major ||
                                "-",
                        }
                        : item
                )
            );

            setSuccess(
                "Data diploma berhasil diperbarui."
            );

            setModalOpen(false);
            setEditingDiploma(null);
            setForm(emptyForm);
        } catch (err) {
            console.error(
                "Update diploma error:",
                err
            );

            setError(
                err?.message ||
                "Gagal memperbarui data diploma."
            );
        } finally {
            setSaving(false);
        }
    };

    /*
     * =========================================================
     * DELETE
     * =========================================================
     */

    const handleDelete = async (item) => {
        const confirmed = window.confirm(
            `Hapus diploma "${item.diploma_number}"?\n\nData yang sudah dihapus tidak dapat dikembalikan.`
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(item.id);
            setError("");
            setSuccess("");

            const {
                error: deleteError,
            } = await supabase
                .from("diplomas")
                .delete()
                .eq(
                    "id",
                    item.id
                )
                .eq(
                    "institution_id",
                    profile.institution_id
                );

            if (deleteError) {
                throw deleteError;
            }

            /*
             * Hapus diploma dari state menggunakan ID
             * yang langsung berasal dari item.
             */

            setDiplomas((prev) =>
                prev.filter(
                    (diploma) =>
                        diploma.id !== item.id
                )
            );

            setSuccess(
                "Data diploma berhasil dihapus."
            );
        } catch (err) {
            console.error(
                "Delete diploma error:",
                err
            );

            setError(
                err?.message ||
                "Gagal menghapus data diploma."
            );
        } finally {
            setDeletingId(null);
        }
    };

    /*
     * =========================================================
     * FORMAT DATE
     * =========================================================
     */

    const formatDate = (dateValue) => {
        if (!dateValue) {
            return "-";
        }

        const date = new Date(
            `${dateValue}T00:00:00`
        );

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return dateValue;
        }

        return date.toLocaleDateString(
            "id-ID",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    /*
     * =========================================================
     * STATUS LABEL
     * =========================================================
     */

    const getOcrLabel = (status) => {
        switch (status) {
            case "verified":
                return "Terverifikasi";

            case "processing":
                return "Processing";

            case "failed":
                return "Failed";

            default:
                return "Pending";
        }
    };

    const getValidityLabel = (status) => {
        switch (status) {
            case "active":
                return "Active";

            case "revoked":
                return "Revoked";

            default:
                return "Pending";
        }
    };

    const getOcrPill = (status) => {
        return status === "verified"
            ? "lime"
            : "gray";
    };

    const getValidityPill = (status) => {
        return status === "active"
            ? "lime"
            : status === "revoked"
                ? "red"
                : "gray";
    };

    /*
     * =========================================================
     * RENDER
     * =========================================================
     */

    return (
        <div className="space-y-4">

            {/* PAGE TITLE */}

            <PageTitle
                title="Diploma Management"
                action={
                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/dashboardAdmin/diplomas/ocr"
                            )
                        }
                        className="btn-lime"
                    >
                        <Plus size={13} />
                        Unggah
                    </button>
                }
            />

            {/* ERROR */}

            {error && (
                <div className="rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-[11px] text-red-200">
                    {error}
                </div>
            )}

            {/* SUCCESS */}

            {success && (
                <div className="rounded-lg border border-lime-400/30 bg-lime-400/10 px-4 py-3 text-[11px] text-lime-200">
                    {success}
                </div>
            )}

            {/* TOOLBAR */}

            <div className="dvms-card flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">

                <div className="relative w-full sm:max-w-sm">

                    <Search
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#85818d]"
                    />

                    <input
                        type="text"
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                        placeholder="Cari nomor ijazah, NISN, nama..."
                        className="dvms-input w-full pl-9"
                    />

                </div>

                <button
                    type="button"
                    onClick={() =>
                        loadDiplomas({
                            refresh: true,
                        })
                    }
                    disabled={refreshing}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[#3a3942] px-3 text-[10px] text-[#d7d3dc] transition hover:bg-[#29282f] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <RefreshCw
                        size={13}
                        className={
                            refreshing
                                ? "animate-spin"
                                : ""
                        }
                    />

                    Refresh
                </button>

            </div>

            {/* TABLE */}

            <div className="dvms-card overflow-hidden">

                <div className="overflow-x-auto">

                    <table className="w-full min-w-[1050px] text-left text-[10px]">

                        <thead>

                            <tr className="border-b border-[#3a3942] text-[#c0bcc8]">

                                <th className="p-3">
                                    No. Seri Ijazah
                                </th>

                                <th className="p-3">
                                    NISN
                                </th>

                                <th className="p-3">
                                    Jurusan / Keahlian
                                </th>

                                <th className="p-3">
                                    Tanggal Kelulusan
                                </th>

                                <th className="p-3">
                                    Status OCR
                                </th>

                                <th className="p-3">
                                    Status Keabsahan
                                </th>

                                <th className="p-3">
                                    Dokumen
                                </th>

                                <th className="p-3">
                                    Action
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {loading ? (

                                <tr>

                                    <td
                                        colSpan={8}
                                        className="p-8 text-center text-[#8e8995]"
                                    >
                                        Memuat data diploma...
                                    </td>

                                </tr>

                            ) : filteredDiplomas.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan={8}
                                        className="p-10 text-center text-[#77727e]"
                                    >
                                        {search
                                            ? "Diploma tidak ditemukan."
                                            : "Belum ada data diploma."}
                                    </td>

                                </tr>

                            ) : (

                                filteredDiplomas.map(
                                    (item) => (

                                        <tr
                                            key={item.id}
                                            className="border-b border-[#29282e] last:border-0 hover:bg-[#242329]"
                                        >

                                            {/* DIPLOMA NUMBER */}

                                            <td className="p-3 font-medium text-[#f1edf4]">
                                                {item.diploma_number ||
                                                    "-"}
                                            </td>

                                            {/* NISN */}

                                            <td className="p-3 text-[#c0bcc8]">
                                                {item.display_nisn}
                                            </td>

                                            {/* MAJOR */}

                                            <td className="p-3 text-[#c0bcc8]">
                                                {item.display_major}
                                            </td>

                                            {/* GRADUATION DATE */}

                                            <td className="p-3 text-[#c0bcc8]">
                                                {formatDate(
                                                    item.graduation_date
                                                )}
                                            </td>

                                            {/* OCR STATUS */}

                                            <td className="p-3">

                                                <StatusPill
                                                    type={getOcrPill(
                                                        item.ocr_status
                                                    )}
                                                >
                                                    {getOcrLabel(
                                                        item.ocr_status
                                                    )}
                                                </StatusPill>

                                            </td>

                                            {/* VALIDITY STATUS */}

                                            <td className="p-3">

                                                <StatusPill
                                                    type={getValidityPill(
                                                        item.validity_status
                                                    )}
                                                >
                                                    {getValidityLabel(
                                                        item.validity_status
                                                    )}
                                                </StatusPill>

                                            </td>

                                            {/* DOCUMENT PREVIEW */}

                                            <td className="p-3">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handlePreview(
                                                            item
                                                        )
                                                    }
                                                    disabled={
                                                        !item.ipfs_cid
                                                    }
                                                    title={
                                                        item.ipfs_cid
                                                            ? "Preview dokumen diploma"
                                                            : "Dokumen belum memiliki IPFS CID"
                                                    }
                                                    className="rounded bg-dvms-purple px-2 py-1 text-[9px] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                                                >

                                                    <Eye
                                                        size={11}
                                                        className="mr-1 inline"
                                                    />

                                                    Preview

                                                </button>

                                            </td>

                                            {/* ACTION */}

                                            <td className="p-3">

                                                <div className="flex items-center gap-3">

                                                    {/* EDIT */}

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openEditModal(
                                                                item
                                                            )
                                                        }
                                                        className="text-cyan-300 transition hover:text-cyan-200"
                                                        title="Edit diploma"
                                                    >

                                                        <Pencil
                                                            size={13}
                                                        />

                                                    </button>

                                                    {/* DELETE */}

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDelete(
                                                                item
                                                            )
                                                        }
                                                        disabled={
                                                            deletingId ===
                                                            item.id
                                                        }
                                                        className="text-red-300 transition hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-40"
                                                        title="Hapus diploma"
                                                    >

                                                        <Trash2
                                                            size={13}
                                                        />

                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    )
                                )

                            )}

                        </tbody>

                    </table>

                </div>

                {!loading &&
                    filteredDiplomas.length > 0 && (

                        <div className="border-t border-[#29282e] px-4 py-3 text-[10px] text-[#85818d]">

                            Menampilkan{" "}
                            {filteredDiplomas.length} dari{" "}
                            {diplomas.length} diploma

                        </div>

                    )}

            </div>

            {/* =====================================================
                EDIT MODAL
                ===================================================== */}

            {modalOpen && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">

                    <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-[#3a3942] bg-[#1d1c21] shadow-2xl">

                        {/* HEADER */}

                        <div className="flex items-center justify-between border-b border-[#35343b] px-5 py-4">

                            <div>

                                <h2 className="text-sm font-semibold text-white">
                                    Edit Diploma
                                </h2>

                                <p className="mt-1 text-[10px] text-[#85818d]">
                                    Perbarui informasi diploma.
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={saving}
                                className="text-[#85818d] transition hover:text-white disabled:opacity-40"
                            >

                                <X size={18} />

                            </button>

                        </div>

                        {/* FORM */}

                        <form
                            onSubmit={
                                handleSubmit
                            }
                        >

                            <div className="max-h-[70vh] overflow-y-auto px-5 py-5">

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                    {/* NOMOR DIPLOMA */}

                                    <div className="sm:col-span-2">

                                        <label className="dvms-label">

                                            No. Seri Ijazah

                                            <span className="text-red-300">
                                                {" "}
                                                *
                                            </span>

                                        </label>

                                        <input
                                            type="text"
                                            name="diploma_number"
                                            value={
                                                form.diploma_number
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Masukkan nomor seri ijazah"
                                            required
                                            className="dvms-input w-full"
                                        />

                                    </div>

                                    {/* NISN */}

                                    <div>

                                        <label className="dvms-label">
                                            NISN
                                        </label>

                                        <input
                                            type="text"
                                            name="nisn"
                                            value={
                                                form.nisn
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Masukkan NISN"
                                            className="dvms-input w-full"
                                        />

                                    </div>

                                    {/* JURUSAN */}

                                    <div>

                                        <label className="dvms-label">
                                            Jurusan / Keahlian
                                        </label>

                                        <input
                                            type="text"
                                            name="major"
                                            value={
                                                form.major
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Contoh: TKJ"
                                            className="dvms-input w-full"
                                        />

                                    </div>

                                    {/* TANGGAL LULUS */}

                                    <div>

                                        <label className="dvms-label">
                                            Tanggal Kelulusan
                                        </label>

                                        <input
                                            type="date"
                                            name="graduation_date"
                                            value={
                                                form.graduation_date
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            className="dvms-input w-full"
                                        />

                                    </div>

                                    {/* STATUS OCR */}

                                    <div>

                                        <label className="dvms-label">
                                            Status OCR
                                        </label>

                                        <select
                                            name="ocr_status"
                                            value={
                                                form.ocr_status
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            className="dvms-input w-full"
                                        >

                                            <option value="pending">
                                                Pending
                                            </option>

                                            <option value="processing">
                                                Processing
                                            </option>

                                            <option value="verified">
                                                Terverifikasi
                                            </option>

                                            <option value="failed">
                                                Failed
                                            </option>

                                        </select>

                                    </div>

                                    {/* STATUS KEABSAHAN */}

                                    <div className="sm:col-span-2">

                                        <label className="dvms-label">
                                            Status Keabsahan
                                        </label>

                                        <select
                                            name="validity_status"
                                            value={
                                                form.validity_status
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            className="dvms-input w-full"
                                        >

                                            <option value="pending">
                                                Pending
                                            </option>

                                            <option value="active">
                                                Active
                                            </option>

                                            <option value="revoked">
                                                Revoked
                                            </option>

                                        </select>

                                    </div>

                                </div>

                            </div>

                            {/* FOOTER */}

                            <div className="flex justify-end gap-2 border-t border-[#35343b] px-5 py-4">

                                <button
                                    type="button"
                                    onClick={
                                        closeModal
                                    }
                                    disabled={saving}
                                    className="rounded-md border border-[#3a3942] px-4 py-2 text-[10px] text-[#c0bcc8] transition hover:bg-[#29282f] disabled:opacity-40"
                                >
                                    Batal
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="btn-lime min-w-[100px] justify-center disabled:cursor-not-allowed disabled:opacity-50"
                                >

                                    {saving
                                        ? "Menyimpan..."
                                        : "Simpan Perubahan"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}