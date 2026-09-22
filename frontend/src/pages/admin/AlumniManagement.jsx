import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Pencil,
    Trash2,
    Plus,
    Search,
    RefreshCw,
    X,
    UserRound,
} from "lucide-react";

import { PageTitle, StatusPill } from "../../components/admin/SidebarPage";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

const emptyForm = {
    nisn: "",
    full_name: "",
    major: "",
    graduation_year: "",
    birth_place: "",
    birth_date: "",
    mobile_status: "inactive",
};

export default function AlumniManagement() {
    const { profile } = useAuth();

    const [alumni, setAlumni] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [search, setSearch] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [editingAlumni, setEditingAlumni] = useState(null);

    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    const [deletingId, setDeletingId] = useState(null);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    /*
     * =========================================================
     * LOAD ALUMNI
     * =========================================================
     */
    const loadAlumni = useCallback(
        async ({ refresh = false } = {}) => {
            if (!profile?.institution_id) {
                setAlumni([]);
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
                    .from("alumni")
                    .select(`
            id,
            institution_id,
            nisn,
            full_name,
            major,
            graduation_year,
            birth_place,
            birth_date,
            mobile_status,
            created_at,
            updated_at
          `)
                    .eq("institution_id", profile.institution_id)
                    .order("created_at", { ascending: false });

                if (fetchError) {
                    throw fetchError;
                }

                setAlumni(data || []);
            } catch (err) {
                console.error("Load alumni error:", err);

                setError(
                    err?.message ||
                    "Gagal mengambil data alumni."
                );
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [profile?.institution_id]
    );

    useEffect(() => {
        loadAlumni();
    }, [loadAlumni]);

    /*
     * =========================================================
     * SEARCH
     * =========================================================
     */
    const filteredAlumni = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) {
            return alumni;
        }

        return alumni.filter((item) => {
            return (
                item.nisn?.toLowerCase().includes(keyword) ||
                item.full_name?.toLowerCase().includes(keyword) ||
                item.major?.toLowerCase().includes(keyword) ||
                String(item.graduation_year || "")
                    .toLowerCase()
                    .includes(keyword) ||
                item.birth_place?.toLowerCase().includes(keyword)
            );
        });
    }, [alumni, search]);

    /*
     * =========================================================
     * FORM
     * =========================================================
     */
    const openAddModal = () => {
        setEditingAlumni(null);
        setForm(emptyForm);
        setError("");
        setSuccess("");
        setModalOpen(true);
    };

    const openEditModal = (item) => {
        setEditingAlumni(item);

        setForm({
            nisn: item.nisn || "",
            full_name: item.full_name || "",
            major: item.major || "",
            graduation_year:
                item.graduation_year !== null &&
                    item.graduation_year !== undefined
                    ? String(item.graduation_year)
                    : "",
            birth_place: item.birth_place || "",
            birth_date: item.birth_date || "",
            mobile_status: item.mobile_status || "inactive",
        });

        setError("");
        setSuccess("");
        setModalOpen(true);
    };

    const closeModal = () => {
        if (saving) return;

        setModalOpen(false);
        setEditingAlumni(null);
        setForm(emptyForm);
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    /*
     * =========================================================
     * CREATE / UPDATE
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

        if (!form.full_name.trim()) {
            setError("Nama alumni wajib diisi.");
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const payload = {
                nisn: form.nisn.trim() || null,
                full_name: form.full_name.trim(),
                major: form.major.trim() || null,
                graduation_year:
                    form.graduation_year.trim() === ""
                        ? null
                        : Number(form.graduation_year),
                birth_place: form.birth_place.trim() || null,
                birth_date: form.birth_date || null,
                mobile_status: form.mobile_status,
            };

            /*
             * UPDATE
             */
            if (editingAlumni) {
                const { error: updateError } = await supabase
                    .from("alumni")
                    .update(payload)
                    .eq("id", editingAlumni.id)
                    .eq("institution_id", profile.institution_id);

                if (updateError) {
                    throw updateError;
                }

                setSuccess("Data alumni berhasil diperbarui.");
            }

            /*
             * CREATE
             */
            else {
                const { error: insertError } = await supabase
                    .from("alumni")
                    .insert({
                        institution_id: profile.institution_id,
                        ...payload,
                    });

                if (insertError) {
                    throw insertError;
                }

                setSuccess("Alumni berhasil ditambahkan.");
            }

            await loadAlumni({ refresh: true });

            setModalOpen(false);
            setEditingAlumni(null);
            setForm(emptyForm);
        } catch (err) {
            console.error("Save alumni error:", err);

            setError(
                err?.message ||
                "Gagal menyimpan data alumni."
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
            `Hapus alumni "${item.full_name}"?\n\nData yang sudah dihapus tidak dapat dikembalikan.`
        );

        if (!confirmed) return;

        try {
            setDeletingId(item.id);
            setError("");
            setSuccess("");

            const { error: deleteError } = await supabase
                .from("alumni")
                .delete()
                .eq("id", item.id)
                .eq("institution_id", profile.institution_id);

            if (deleteError) {
                throw deleteError;
            }

            setAlumni((prev) =>
                prev.filter((alumniItem) => alumniItem.id !== item.id)
            );

            setSuccess("Data alumni berhasil dihapus.");
        } catch (err) {
            console.error("Delete alumni error:", err);

            setError(
                err?.message ||
                "Gagal menghapus data alumni."
            );
        } finally {
            setDeletingId(null);
        }
    };

    /*
     * =========================================================
     * FORMAT
     * =========================================================
     */
    const formatBirthInfo = (item) => {
        const place = item.birth_place?.trim() || "-";

        if (!item.birth_date) {
            return place;
        }

        const date = new Date(`${item.birth_date}T00:00:00`);

        if (Number.isNaN(date.getTime())) {
            return place;
        }

        const formattedDate = date.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });

        return `${place}, ${formattedDate}`;
    };

    /*
     * =========================================================
     * RENDER
     * =========================================================
     */
    return (
        <div className="space-y-4">
            <PageTitle
                title="Alumni Management"
                action={
                    <button
                        type="button"
                        className="btn-lime"
                        onClick={openAddModal}
                    >
                        <Plus size={13} />
                        Tambah
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
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Cari NISN, nama, jurusan..."
                        className="dvms-input w-full pl-9"
                    />
                </div>

                <button
                    type="button"
                    onClick={() => loadAlumni({ refresh: true })}
                    disabled={refreshing}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[#3a3942] px-3 text-[10px] text-[#d7d3dc] transition hover:bg-[#29282f] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <RefreshCw
                        size={13}
                        className={refreshing ? "animate-spin" : ""}
                    />
                    Refresh
                </button>
            </div>

            {/* TABLE */}
            <div className="dvms-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-left text-[10px]">
                        <thead>
                            <tr className="border-b border-[#3a3942] text-[#c0bcc8]">
                                <th className="p-3">NISN</th>
                                <th className="p-3">Nama</th>
                                <th className="p-3">Jurusan / Keahlian</th>
                                <th className="p-3">Tahun Lulus</th>
                                <th className="p-3">Tempat, Tgl Lahir</th>
                                <th className="p-3">Status Akun Mobile</th>
                                <th className="p-3">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="p-8 text-center text-[#8e8995]"
                                    >
                                        Memuat data alumni...
                                    </td>
                                </tr>
                            ) : filteredAlumni.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="p-10 text-center"
                                    >
                                        <div className="flex flex-col items-center gap-2 text-[#77727e]">
                                            <UserRound size={28} />
                                            <span>
                                                {search
                                                    ? "Alumni tidak ditemukan."
                                                    : "Belum ada data alumni."}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredAlumni.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="border-b border-[#29282e] last:border-0 hover:bg-[#242329]"
                                    >
                                        <td className="p-3 text-[#e7e3eb]">
                                            {item.nisn || "-"}
                                        </td>

                                        <td className="p-3 font-medium text-[#f1edf4]">
                                            {item.full_name}
                                        </td>

                                        <td className="p-3 text-[#c0bcc8]">
                                            {item.major || "-"}
                                        </td>

                                        <td className="p-3 text-[#c0bcc8]">
                                            {item.graduation_year || "-"}
                                        </td>

                                        <td className="p-3 text-[#c0bcc8]">
                                            {formatBirthInfo(item)}
                                        </td>

                                        <td className="p-3">
                                            <StatusPill
                                                type={
                                                    item.mobile_status === "active"
                                                        ? "lime"
                                                        : "gray"
                                                }
                                            >
                                                {item.mobile_status === "active"
                                                    ? "Active"
                                                    : "Inactive"}
                                            </StatusPill>
                                        </td>

                                        <td className="p-3">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(item)}
                                                    className="text-cyan-300 transition hover:text-cyan-200"
                                                    title="Edit alumni"
                                                >
                                                    <Pencil size={13} />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(item)}
                                                    disabled={deletingId === item.id}
                                                    className="text-red-300 transition hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-40"
                                                    title="Hapus alumni"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && filteredAlumni.length > 0 && (
                    <div className="border-t border-[#29282e] px-4 py-3 text-[10px] text-[#85818d]">
                        Menampilkan {filteredAlumni.length} dari {alumni.length} alumni
                    </div>
                )}
            </div>

            {/* =====================================================
          ADD / EDIT MODAL
          ===================================================== */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-[#3a3942] bg-[#1d1c21] shadow-2xl">
                        {/* HEADER */}
                        <div className="flex items-center justify-between border-b border-[#35343b] px-5 py-4">
                            <div>
                                <h2 className="text-sm font-semibold text-white">
                                    {editingAlumni
                                        ? "Edit Alumni"
                                        : "Tambah Alumni"}
                                </h2>

                                <p className="mt-1 text-[10px] text-[#85818d]">
                                    {editingAlumni
                                        ? "Perbarui informasi alumni."
                                        : "Masukkan informasi alumni baru."}
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
                        <form onSubmit={handleSubmit}>
                            <div className="max-h-[70vh] overflow-y-auto px-5 py-5">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {/* NISN */}
                                    <div>
                                        <label className="dvms-label">
                                            NISN
                                        </label>

                                        <input
                                            type="text"
                                            name="nisn"
                                            value={form.nisn}
                                            onChange={handleChange}
                                            placeholder="Masukkan NISN"
                                            className="dvms-input w-full"
                                        />
                                    </div>

                                    {/* NAMA */}
                                    <div>
                                        <label className="dvms-label">
                                            Nama Lengkap
                                            <span className="text-red-300">
                                                {" "}
                                                *
                                            </span>
                                        </label>

                                        <input
                                            type="text"
                                            name="full_name"
                                            value={form.full_name}
                                            onChange={handleChange}
                                            placeholder="Masukkan nama lengkap"
                                            required
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
                                            value={form.major}
                                            onChange={handleChange}
                                            placeholder="Contoh: Teknik Komputer dan Jaringan"
                                            className="dvms-input w-full"
                                        />
                                    </div>

                                    {/* TAHUN LULUS */}
                                    <div>
                                        <label className="dvms-label">
                                            Tahun Lulus
                                        </label>

                                        <input
                                            type="number"
                                            name="graduation_year"
                                            value={form.graduation_year}
                                            onChange={handleChange}
                                            placeholder="Contoh: 2023"
                                            min="1900"
                                            max="2100"
                                            className="dvms-input w-full"
                                        />
                                    </div>

                                    {/* TEMPAT LAHIR */}
                                    <div>
                                        <label className="dvms-label">
                                            Tempat Lahir
                                        </label>

                                        <input
                                            type="text"
                                            name="birth_place"
                                            value={form.birth_place}
                                            onChange={handleChange}
                                            placeholder="Contoh: Subang"
                                            className="dvms-input w-full"
                                        />
                                    </div>

                                    {/* TANGGAL LAHIR */}
                                    <div>
                                        <label className="dvms-label">
                                            Tanggal Lahir
                                        </label>

                                        <input
                                            type="date"
                                            name="birth_date"
                                            value={form.birth_date}
                                            onChange={handleChange}
                                            className="dvms-input w-full"
                                        />
                                    </div>

                                    {/* MOBILE STATUS */}
                                    <div className="sm:col-span-2">
                                        <label className="dvms-label">
                                            Status Akun Mobile
                                        </label>

                                        <select
                                            name="mobile_status"
                                            value={form.mobile_status}
                                            onChange={handleChange}
                                            className="dvms-input w-full"
                                        >
                                            <option value="inactive">
                                                Inactive
                                            </option>
                                            <option value="active">
                                                Active
                                            </option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* FOOTER */}
                            <div className="flex justify-end gap-2 border-t border-[#35343b] px-5 py-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
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
                                        : editingAlumni
                                            ? "Simpan Perubahan"
                                            : "Tambah Alumni"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}