import { useEffect, useRef, useState } from "react";

import {
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  Link2,
  Loader2,
  UploadCloud,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

import {
  processDiplomaOCR,
  saveDiploma,
} from "../../services/api";


const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

const INITIAL_FORM = {
  alumniId: "",
  diplomaNumber: "",
  nisn: "",
  birthPlace: "",
  birthDate: "",
  graduationDate: "",
  major: "",
};


export default function DiplomaOCR() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewType, setPreviewType] = useState("");

  const [alumni, setAlumni] = useState([]);
  const [loadingAlumni, setLoadingAlumni] = useState(true);

  const [newAlumniDetected, setNewAlumniDetected] =
    useState(null);

  const [form, setForm] = useState(INITIAL_FORM);

  const [zoom, setZoom] = useState(1);

  const [processingOCR, setProcessingOCR] =
    useState(false);

  const [saving, setSaving] = useState(false);

  const [ocrCompleted, setOcrCompleted] =
    useState(false);

  const [ocrResult, setOcrResult] = useState(null);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [dragActive, setDragActive] =
    useState(false);


  /*
   * ============================================================
   * LOAD ALUMNI
   * ============================================================
   */

  useEffect(() => {
    if (!profile?.institution_id) {
      setLoadingAlumni(false);
      return;
    }

    loadAlumni();
  }, [profile?.institution_id]);


  async function loadAlumni() {
    setLoadingAlumni(true);
    setError("");

    const {
      data,
      error: alumniError,
    } = await supabase
      .from("alumni")
      .select(`
        id,
        nisn,
        full_name,
        major,
        graduation_year,
        birth_place,
        birth_date
      `)
      .eq(
        "institution_id",
        profile.institution_id
      )
      .order("full_name", {
        ascending: true,
      });

    if (alumniError) {
      console.error(alumniError);

      setError(
        `Gagal mengambil data alumni: ${alumniError.message}`
      );

      setAlumni([]);
    } else {
      setAlumni(data || []);
    }

    setLoadingAlumni(false);
  }


  /*
   * ============================================================
   * FILE VALIDATION
   * ============================================================
   */

  function getFileExtension(filename) {
    return (
      filename?.split(".").pop()?.toLowerCase() || ""
    );
  }


  function validateFile(selectedFile) {
    if (!selectedFile) {
      return "File tidak ditemukan.";
    }

    const extension = getFileExtension(
      selectedFile.name
    );

    const allowedExtensions = [
      "pdf",
      "jpg",
      "jpeg",
      "png",
    ];

    const validType =
      ALLOWED_TYPES.includes(selectedFile.type) ||
      allowedExtensions.includes(extension);

    if (!validType) {
      return "Format file harus PDF, JPG, JPEG, atau PNG.";
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      return "Ukuran file maksimal 5 MB.";
    }

    return "";
  }


  /*
   * ============================================================
   * SELECT FILE
   * ============================================================
   */

  function handleFileSelect(selectedFile) {
    setError("");
    setSuccess("");

    setOcrCompleted(false);
    setOcrResult(null);
    setNewAlumniDetected(null);

    setForm(INITIAL_FORM);

    const validationError =
      validateFile(selectedFile);

    if (validationError) {
      setError(validationError);
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const objectUrl =
      URL.createObjectURL(selectedFile);

    const extension =
      getFileExtension(selectedFile.name);

    setFile(selectedFile);

    setPreviewUrl(objectUrl);

    setPreviewType(
      extension === "pdf"
        ? "pdf"
        : "image"
    );

    setZoom(1);
  }


  function handleInputChange(event) {
    const selectedFile =
      event.target.files?.[0];

    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  }


  /*
   * ============================================================
   * DRAG & DROP
   * ============================================================
   */

  function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(true);
  }


  function handleDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(false);
  }


  function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(false);

    const droppedFile =
      event.dataTransfer.files?.[0];

    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }


  /*
   * ============================================================
   * REMOVE FILE
   * ============================================================
   */

  function removeFile() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setFile(null);
    setPreviewUrl("");
    setPreviewType("");

    setZoom(1);

    setForm(INITIAL_FORM);

    setOcrCompleted(false);
    setOcrResult(null);
    setNewAlumniDetected(null);

    setError("");
    setSuccess("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }


  /*
   * ============================================================
   * FORM
   * ============================================================
   */

  function handleFormChange(event) {
    const {
      name,
      value,
    } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  }


  /*
   * ============================================================
   * ALUMNI CHANGE
   * ============================================================
   */

  function handleAlumniChange(event) {
    const alumniId =
      event.target.value;

    /*
     * ALUMNI BARU
     */
    if (alumniId === "__new__") {
      setForm((prev) => ({
        ...prev,
        alumniId: "__new__",
      }));

      setError("");

      setSuccess(
        newAlumniDetected?.full_name
          ? `Alumni baru "${newAlumniDetected.full_name}" akan dibuat otomatis saat disimpan.`
          : "Data alumni baru akan dibuat otomatis saat disimpan."
      );

      return;
    }


    /*
     * CARI ALUMNI
     */
    const selectedAlumni =
      alumni.find(
        (item) =>
          item.id === alumniId
      );


    setNewAlumniDetected(null);


    /*
     * MASUKKAN DATA ALUMNI
     */
    setForm((prev) => ({
      ...prev,

      alumniId,

      nisn:
        selectedAlumni?.nisn ||
        prev.nisn ||
        "",

      major:
        selectedAlumni?.major ||
        prev.major ||
        "",

      birthPlace:
        selectedAlumni?.birth_place ||
        prev.birthPlace ||
        "",

      birthDate:
        selectedAlumni?.birth_date ||
        prev.birthDate ||
        "",
    }));


    setError("");

    setSuccess(
      selectedAlumni
        ? `Alumni "${selectedAlumni.full_name}" dipilih.`
        : ""
    );
  }


  /*
   * ============================================================
   * OCR
   * ============================================================
   */

  async function handleOCR() {
    setError("");
    setSuccess("");

    if (!file) {
      setError(
        "Silakan pilih file ijazah terlebih dahulu."
      );

      return;
    }

    setProcessingOCR(true);

    try {
      const response =
        await processDiplomaOCR(file);


      /*
       * RESPONSE DARI FASTAPI
       *
       * response.data:
       * {
       *   full_name,
       *   nisn,
       *   diploma_number,
       *   major,
       *   graduation_date,
       *   birth_place,
       *   birth_date
       * }
       */

      const data =
        response?.data || {};


      setOcrResult(response);


      /*
       * MASUKKAN HASIL OCR KE FORM
       */
      setForm((prev) => ({
        ...prev,

        diplomaNumber:
          data.diploma_number ||
          data.diplomaNumber ||
          prev.diplomaNumber ||
          "",

        nisn:
          data.nisn ||
          prev.nisn ||
          "",

        birthPlace:
          data.birth_place ||
          data.birthPlace ||
          prev.birthPlace ||
          "",

        birthDate:
          data.birth_date ||
          data.birthDate ||
          prev.birthDate ||
          "",

        graduationDate:
          data.graduation_date ||
          data.graduationDate ||
          prev.graduationDate ||
          "",

        major:
          data.major ||
          prev.major ||
          "",
      }));


      /*
       * ========================================================
       * AUTO MATCH ALUMNI
       * ========================================================
       */

      const detectedNisn =
        data.nisn
          ?.toString()
          .trim();

      const detectedFullName =
        data.full_name
          ?.toString()
          .trim();


      let matchedAlumni = null;


      /*
       * CARI BERDASARKAN NISN
       */
      if (detectedNisn) {
        matchedAlumni =
          alumni.find(
            (item) =>
              item.nisn
                ?.toString()
                .trim() ===
              detectedNisn
          ) || null;
      }


      /*
       * ========================================================
       * ALUMNI DITEMUKAN
       * ========================================================
       */

      if (matchedAlumni) {
        setNewAlumniDetected(null);

        setForm((prev) => ({
          ...prev,

          alumniId:
            matchedAlumni.id,

          nisn:
            matchedAlumni.nisn ||
            detectedNisn ||
            prev.nisn ||
            "",

          major:
            data.major ||
            matchedAlumni.major ||
            prev.major ||
            "",

          /*
           * PRIORITAS:
           * 1. hasil OCR
           * 2. data alumni
           * 3. nilai form sebelumnya
           */

          birthPlace:
            data.birth_place ||
            data.birthPlace ||
            matchedAlumni.birth_place ||
            prev.birthPlace ||
            "",

          birthDate:
            data.birth_date ||
            data.birthDate ||
            matchedAlumni.birth_date ||
            prev.birthDate ||
            "",

          graduationDate:
            data.graduation_date ||
            data.graduationDate ||
            prev.graduationDate ||
            "",
        }));


        setSuccess(
          `OCR berhasil. Alumni "${matchedAlumni.full_name}" ditemukan berdasarkan NISN.`
        );
      }


      /*
       * ========================================================
       * ALUMNI BELUM DITEMUKAN
       * ========================================================
       */

      else if (detectedFullName) {
        const newAlumni = {
          full_name:
            detectedFullName,

          nisn:
            detectedNisn || "",

          birth_place:
            data.birth_place ||
            data.birthPlace ||
            "",

          birth_date:
            data.birth_date ||
            data.birthDate ||
            "",
        };


        setNewAlumniDetected(
          newAlumni
        );


        setForm((prev) => ({
          ...prev,

          alumniId: "__new__",

          nisn:
            detectedNisn ||
            prev.nisn ||
            "",

          major:
            data.major ||
            prev.major ||
            "",

          birthPlace:
            data.birth_place ||
            data.birthPlace ||
            prev.birthPlace ||
            "",

          birthDate:
            data.birth_date ||
            data.birthDate ||
            prev.birthDate ||
            "",

          graduationDate:
            data.graduation_date ||
            data.graduationDate ||
            prev.graduationDate ||
            "",
        }));


        setSuccess(
          detectedNisn
            ? `OCR berhasil. Alumni "${detectedFullName}" belum ditemukan berdasarkan NISN ${detectedNisn}. Data alumni baru akan dibuat otomatis saat disimpan.`
            : `OCR berhasil. Alumni "${detectedFullName}" belum ditemukan. Data alumni baru akan dibuat otomatis saat disimpan.`
        );
      }


      /*
       * ========================================================
       * NAMA ALUMNI TIDAK TERBACA
       * ========================================================
       */

      else {
        setNewAlumniDetected(null);

        setForm((prev) => ({
          ...prev,
          alumniId: "",
        }));

        setSuccess(
          "OCR berhasil. Nama alumni tidak terbaca, silakan pilih alumni yang sudah ada atau lengkapi nama secara manual jika diperlukan."
        );
      }


      setOcrCompleted(true);

    } catch (ocrError) {
      console.error(ocrError);

      setError(
        ocrError?.message ||
        "OCR gagal diproses."
      );

      setOcrCompleted(false);

    } finally {
      setProcessingOCR(false);
    }
  }


  /*
   * ============================================================
   * SAVE DIPLOMA
   * ============================================================
   */

  async function handleSave() {
    setError("");
    setSuccess("");

    /*
     * LOGIN
     */
    if (!user?.id) {
      setError(
        "Sesi login tidak ditemukan. Silakan login kembali."
      );
      return;
    }

    /*
     * INSTITUTION
     */
    if (!profile?.institution_id) {
      setError(
        "Data institusi akun tidak ditemukan."
      );
      return;
    }

    /*
     * FILE
     */
    if (!file) {
      setError(
        "Silakan pilih file ijazah terlebih dahulu."
      );
      return;
    }

    /*
     * OCR
     */
    if (!ocrCompleted || !ocrResult) {
      setError(
        "Silakan jalankan OCR terlebih dahulu."
      );
      return;
    }

    /*
     * NOMOR IJAZAH
     */
    if (!form.diplomaNumber.trim()) {
      setError(
        "Nomor seri ijazah wajib diisi."
      );
      return;
    }

    /*
     * CARI ALUMNI YANG DIPILIH
     */
    const selectedAlumni = alumni.find(
      (item) => item.id === form.alumniId
    );

    /*
     * NAMA DARI OCR
     */
    const ocrFullName =
      ocrResult?.data?.full_name
        ?.toString()
        .trim() || "";

    /*
     * NAMA FINAL
     */
    const fullName =
      selectedAlumni?.full_name
        ?.toString()
        .trim() ||
      (
        form.alumniId === "__new__"
          ? newAlumniDetected
            ?.full_name
            ?.toString()
            .trim() ||
          ocrFullName
          : ocrFullName
      );

    if (!fullName) {
      setError(
        "Nama alumni tidak berhasil dibaca oleh OCR. Silakan periksa dokumen atau pilih alumni yang sudah ada."
      );
      return;
    }

    /*
     * HASH
     */
    const documentHash =
      ocrResult?.document_hash;

    if (!documentHash) {
      setError(
        "Document hash dari backend tidak ditemukan."
      );
      return;
    }

    /*
     * IPFS
     */
    const ipfsCid =
      ocrResult?.ipfs?.cid;

    if (!ipfsCid) {
      setError(
        "IPFS CID dari backend tidak ditemukan."
      );
      return;
    }

    setSaving(true);

    try {
      /*
       * ========================================================
       * SIMPAN MELALUI FASTAPI
       * ========================================================
       */
      const response = await saveDiploma({
        institution_id:
          profile.institution_id,

        full_name:
          fullName,

        nisn:
          form.nisn.trim() || null,

        diploma_number:
          form.diplomaNumber.trim(),

        major:
          form.major.trim() || null,

        /*
         * DATA KELAHIRAN
         */
        birth_place:
          form.birthPlace.trim() || null,

        birth_date:
          form.birthDate || null,

        /*
         * TANGGAL LULUS
         */
        graduation_date:
          form.graduationDate || null,

        /*
         * HASH & IPFS
         */
        document_hash:
          documentHash,

        ipfs_cid:
          ipfsCid,

        /*
         * METADATA FILE
         */
        document_path:
          null,

        document_name:
          file.name,

        document_mime_type:
          file.type || null,

        document_size:
          file.size,
      });

      /*
       * ========================================================
       * AMBIL DATA RESPONSE
       * ========================================================
       *
       * Kita buat fleksibel karena saveDiploma()
       * bisa mengembalikan response dalam beberapa bentuk.
       */
      const responseData =
        response?.data ?? response;

      /*
       * Kemungkinan:
       *
       * 1. response.data.diploma
       * 2. response.diploma
       * 3. response.data.data.diploma
       * 4. response.data langsung berupa object diploma
       */
      const diploma =
        responseData?.diploma ??
        responseData?.data?.diploma ??
        responseData;

      /*
       * ========================================================
       * CEK ID DIPLOMA
       * ========================================================
       */
      if (!diploma?.id) {
        console.error(
          "Response save diploma:",
          response
        );

        throw new Error(
          "Data diploma berhasil diproses tetapi ID diploma tidak ditemukan."
        );
      }

      /*
       * ========================================================
       * SUCCESS
       * ========================================================
       */
      setSuccess(
        "OCR dan data diploma berhasil disimpan. Melanjutkan ke anchoring..."
      );

      /*
       * ========================================================
       * LANJUT KE HALAMAN ANCHORING
       * ========================================================
       */
      setTimeout(() => {
        navigate(
          "/dashboardAdmin/anchoring",
          {
            state: {
              diplomaId:
                diploma.id,

              diploma:
                diploma,
            },
          }
        );
      }, 700);

    } catch (saveError) {
      console.error(
        "Gagal menyimpan diploma:",
        saveError
      );

      setError(
        saveError?.message ||
        "Gagal menyimpan data diploma."
      );

    } finally {
      setSaving(false);
    }
  }

  /*
   * ============================================================
   * CLEANUP OBJECT URL
   * ============================================================
   */

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);


  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_275px]">

      {/* ======================================================
          LEFT - DOCUMENT PREVIEW
      ======================================================= */}

      <div className="dvms-card min-h-[590px] overflow-hidden">

        <div className="flex h-8 items-center justify-between border-b border-[#38373f] px-3 text-[10px]">

          <span className="flex items-center gap-2">
            <FileText size={12} />
            Scanned Document
          </span>


          <div className="flex items-center gap-2">

            <button
              type="button"
              onClick={() =>
                setZoom((prev) =>
                  Math.max(
                    0.5,
                    prev - 0.1
                  )
                )
              }
              disabled={!file}
              className="rounded p-1 transition hover:bg-[#34343c] disabled:opacity-30"
              title="Zoom Out"
            >
              <ZoomOut size={12} />
            </button>


            <span className="min-w-[35px] text-center text-[9px] text-[#a9a6af]">
              {Math.round(
                zoom * 100
              )}
              %
            </span>


            <button
              type="button"
              onClick={() =>
                setZoom((prev) =>
                  Math.min(
                    2,
                    prev + 0.1
                  )
                )
              }
              disabled={!file}
              className="rounded p-1 transition hover:bg-[#34343c] disabled:opacity-30"
              title="Zoom In"
            >
              <ZoomIn size={12} />
            </button>

          </div>

        </div>


        <div className="relative flex h-[calc(100%-32px)] min-h-[558px] items-center justify-center overflow-auto bg-[#0d0d0f] p-5">

          {!file ? (

            <button
              type="button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex w-[70%] min-h-[330px] flex-col items-center justify-center rounded-lg border border-dashed transition ${dragActive
                ? "border-[#c7ff3d] bg-[#c7ff3d]/10"
                : "border-[#4a4852] bg-[#111216] hover:border-[#c7ff3d] hover:bg-[#15161a]"
                }`}
            >

              <div className="mb-4 rounded-full bg-[#202128] p-4">
                <UploadCloud
                  size={30}
                  className="text-[#c7ff3d]"
                />
              </div>


              <p className="text-sm font-medium text-white">
                Upload Dokumen Ijazah
              </p>


              <p className="mt-2 text-center text-[10px] text-[#85818c]">
                Drag & drop file di sini
                <br />
                atau klik untuk memilih file
              </p>


              <div className="mt-4 flex gap-2 text-[8px] text-[#6e6b74]">

                <span className="rounded border border-[#34343c] px-2 py-1">
                  PDF
                </span>

                <span className="rounded border border-[#34343c] px-2 py-1">
                  JPG
                </span>

                <span className="rounded border border-[#34343c] px-2 py-1">
                  PNG
                </span>

                <span className="rounded border border-[#34343c] px-2 py-1">
                  MAX 5MB
                </span>

              </div>

            </button>

          ) : (

            <div className="relative flex h-full w-full items-center justify-center overflow-auto">

              <button
                type="button"
                onClick={removeFile}
                className="absolute right-2 top-2 z-20 rounded bg-[#24252c] p-2 text-[#c5c2ca] shadow-lg transition hover:bg-red-500/20 hover:text-red-300"
                title="Hapus dokumen"
              >
                <X size={14} />
              </button>


              {previewType === "pdf" && (

                <div
                  className="h-full w-full overflow-hidden rounded bg-white shadow-2xl"
                  style={{
                    transform:
                      `scale(${zoom})`,

                    transformOrigin:
                      "center center",
                  }}
                >
                  <iframe
                    src={previewUrl}
                    title="Preview Ijazah"
                    className="h-full w-full border-0"
                  />
                </div>

              )}


              {previewType === "image" && (

                <div
                  className="flex min-h-full min-w-full items-center justify-center"
                  style={{
                    transform:
                      `scale(${zoom})`,

                    transformOrigin:
                      "center center",
                  }}
                >

                  <img
                    src={previewUrl}
                    alt="Preview Ijazah"
                    className="max-h-[500px] max-w-[90%] rounded bg-white object-contain shadow-2xl"
                  />

                </div>

              )}

            </div>

          )}


          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            onChange={handleInputChange}
            className="hidden"
          />

        </div>

      </div>


      {/* ======================================================
          RIGHT - EXTRACTION DATA
      ======================================================= */}

      <div className="dvms-card bg-[#242832] p-3">

        <div className="flex items-center justify-between">

          <h2 className="flex items-center gap-2 text-base font-medium">
            <FileText size={16} />
            Data Hasil Ekstraksi
          </h2>

          <span className="rounded bg-[#2f3542] px-2 py-1 text-[8px]">
            ⚡ EasyOCR
          </span>

        </div>


        {/* ====================================================
            FILE INFO
        ==================================================== */}

        {file && (

          <div className="mt-4 flex items-center gap-2 rounded border border-[#3b3e47] bg-[#1b1c20] p-2">

            {previewType === "pdf" ? (

              <FileText
                size={15}
                className="shrink-0 text-red-300"
              />

            ) : (

              <ImageIcon
                size={15}
                className="shrink-0 text-blue-300"
              />

            )}


            <div className="min-w-0 flex-1">

              <p className="truncate text-[9px] text-white">
                {file.name}
              </p>

              <p className="text-[8px] text-[#85818c]">
                {formatFileSize(
                  file.size
                )}
              </p>

            </div>


            {ocrCompleted ? (

              <CheckCircle2
                size={14}
                className="shrink-0 text-emerald-400"
              />

            ) : null}

          </div>

        )}


        {/* ====================================================
            FORM
        ==================================================== */}

        <div className="mt-5 space-y-3">

          {/* ==================================================
              ALUMNI
          ================================================== */}

          <label className="block">

            <div className="mb-1 flex justify-between text-[9px]">

              <span>
                Alumni
              </span>

              <span
                className={
                  newAlumniDetected
                    ? "text-emerald-400"
                    : "text-[#85818c]"
                }
              >
                {newAlumniDetected
                  ? "Alumni Baru"
                  : "Relasi Database"}
              </span>

            </div>


            <select
              name="alumniId"
              value={form.alumniId}
              onChange={handleAlumniChange}
              disabled={
                loadingAlumni ||
                processingOCR ||
                saving
              }
              className="dvms-input h-8 w-full bg-white text-[10px] text-[#222]"
            >

              <option value="">
                {loadingAlumni
                  ? "Memuat alumni..."
                  : "-- Pilih Alumni --"}
              </option>


              {newAlumniDetected && (

                <option value="__new__">

                  + Alumni Baru —{" "}
                  {newAlumniDetected.full_name}

                  {newAlumniDetected.nisn
                    ? ` — ${newAlumniDetected.nisn}`
                    : ""}

                </option>

              )}


              {alumni.map(
                (item) => (

                  <option
                    key={item.id}
                    value={item.id}
                  >

                    {item.full_name}

                    {item.nisn
                      ? ` — ${item.nisn}`
                      : ""}

                  </option>

                )
              )}

            </select>


            {newAlumniDetected && (

              <div className="mt-1 rounded border border-emerald-400/20 bg-emerald-400/5 px-2 py-1 text-[8px] leading-relaxed text-emerald-300">

                Alumni belum terdaftar.
                Data{" "}

                <strong>
                  {newAlumniDetected.full_name}
                </strong>{" "}

                akan dibuat otomatis oleh backend saat diploma disimpan.

              </div>

            )}

          </label>


          {/* ==================================================
              DIPLOMA NUMBER
          ================================================== */}

          <Extract
            label="No. Seri Ijazah"
            name="diplomaNumber"
            value={
              form.diplomaNumber
            }
            onChange={
              handleFormChange
            }
            confidence={
              ocrCompleted
                ? "EasyOCR"
                : "Manual"
            }
            disabled={
              processingOCR ||
              saving
            }
            required
          />


          {/* ==================================================
              NISN
          ================================================== */}

          <Extract
            label="NISN"
            name="nisn"
            value={form.nisn}
            onChange={
              handleFormChange
            }
            confidence={
              ocrCompleted
                ? "EasyOCR"
                : form.nisn
                  ? "Database"
                  : "-"
            }
            disabled={
              processingOCR ||
              saving
            }
          />


          {/* ==================================================
              TEMPAT LAHIR
          ================================================== */}

          <Extract
            label="Tempat Lahir"
            name="birthPlace"
            value={
              form.birthPlace
            }
            onChange={
              handleFormChange
            }
            confidence={
              ocrCompleted
                ? form.birthPlace
                  ? "EasyOCR"
                  : "Manual"
                : form.birthPlace
                  ? "Database"
                  : "-"
            }
            disabled={
              processingOCR ||
              saving
            }
          />


          {/* ==================================================
              TANGGAL LAHIR
          ================================================== */}

          <label className="block">

            <div className="mb-1 flex justify-between text-[9px]">

              <span>
                Tanggal Lahir
              </span>

              <span
                className={
                  ocrCompleted &&
                    form.birthDate
                    ? "text-emerald-400"
                    : "text-[#85818c]"
                }
              >
                {ocrCompleted &&
                  form.birthDate
                  ? "EasyOCR"
                  : form.birthDate
                    ? "Database"
                    : "Manual"}
              </span>

            </div>


            <input
              type="date"
              name="birthDate"
              value={
                form.birthDate
              }
              onChange={
                handleFormChange
              }
              disabled={
                processingOCR ||
                saving
              }
              className="dvms-input h-7 w-full bg-white text-[9px] text-[#222]"
            />

          </label>


          {/* ==================================================
              TANGGAL KELULUSAN
          ================================================== */}

          <label className="block">

            <div className="mb-1 flex justify-between text-[9px]">

              <span>
                Tanggal Kelulusan
              </span>

              <span
                className={
                  ocrCompleted
                    ? "text-emerald-400"
                    : "text-[#85818c]"
                }
              >
                {ocrCompleted
                  ? "EasyOCR"
                  : "Manual"}
              </span>

            </div>


            <input
              type="date"
              name="graduationDate"
              value={
                form.graduationDate
              }
              onChange={
                handleFormChange
              }
              disabled={
                processingOCR ||
                saving
              }
              className="dvms-input h-7 w-full bg-white text-[9px] text-[#222]"
            />

          </label>


          {/* ==================================================
              MAJOR
          ================================================== */}

          <Extract
            label="Jurusan / Keahlian"
            name="major"
            value={form.major}
            onChange={
              handleFormChange
            }
            confidence={
              ocrCompleted
                ? "EasyOCR"
                : form.major
                  ? "Database"
                  : "-"
            }
            disabled={
              processingOCR ||
              saving
            }
          />

        </div>


        {/* ====================================================
            MESSAGE
        ==================================================== */}

        {(error || success) && (

          <div
            className={`mt-4 rounded border p-2 text-[9px] leading-relaxed ${error
              ? "border-red-400/30 bg-red-400/10 text-red-300"
              : "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
              }`}
          >
            {error || success}
          </div>

        )}


        {/* ====================================================
            OCR RESULT INFO
        ==================================================== */}

        {ocrCompleted &&
          ocrResult && (

            <div className="mt-3 rounded border border-[#41434c] bg-[#1b1c20] p-2 font-mono text-[8px] leading-relaxed text-[#a9a6af]">

              <div>
                ✓ EasyOCR berhasil
              </div>


              <div className="mt-1 break-all">
                SHA-256:{" "}
                {ocrResult.document_hash}
              </div>


              <div className="mt-1 break-all">
                IPFS CID:{" "}
                {ocrResult.ipfs?.cid}
              </div>


              <div className="mt-1">
                Tempat Lahir:{" "}
                {form.birthPlace ||
                  "-"}
              </div>


              <div className="mt-1">
                Tanggal Lahir:{" "}
                {form.birthDate ||
                  "-"}
              </div>

            </div>

          )}


        {/* ====================================================
            ACTIONS
        ==================================================== */}

        <div className="mt-6 border-t border-[#3b3e47] pt-3">

          {!ocrCompleted ? (

            <button
              type="button"
              onClick={handleOCR}
              disabled={
                processingOCR ||
                saving ||
                !file
              }
              className="btn-lime flex h-9 w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-40"
            >

              {processingOCR ? (

                <>

                  <Loader2
                    size={13}
                    className="animate-spin"
                  />

                  Memproses EasyOCR...

                </>

              ) : (

                <>

                  <UploadCloud
                    size={13}
                  />

                  Jalankan OCR

                </>

              )}

            </button>

          ) : (

            <button
              type="button"
              onClick={handleSave}
              disabled={
                saving ||
                processingOCR ||
                !file
              }
              className="btn-lime flex h-9 w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-40"
            >

              {saving ? (

                <>

                  <Loader2
                    size={13}
                    className="animate-spin"
                  />

                  Menyimpan Diploma...

                </>

              ) : (

                <>

                  <Link2
                    size={13}
                  />

                  Simpan & Lanjut ke Anchoring

                </>

              )}

            </button>

          )}

        </div>

      </div>

    </div>
  );
}


/*
 * ============================================================
 * FILE SIZE
 * ============================================================
 */

function formatFileSize(bytes) {
  if (!bytes) {
    return "0 KB";
  }

  if (bytes < 1024 * 1024) {
    return `${Math.ceil(
      bytes / 1024
    )} KB`;
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(2)} MB`;
}


/*
 * ============================================================
 * EXTRACT FIELD
 * ============================================================
 */

function Extract({
  label,
  name,
  value,
  onChange,
  confidence,
  disabled,
  required = false,
}) {
  return (
    <label className="block">

      <div className="mb-1 flex justify-between text-[9px]">

        <span>
          {label}

          {required && (
            <span className="ml-1 text-red-300">
              *
            </span>
          )}

        </span>


        <span
          className={
            confidence === "Manual"
              ? "text-yellow-300"
              : confidence === "EasyOCR"
                ? "text-emerald-400"
                : confidence === "Database"
                  ? "text-emerald-400"
                  : "text-[#85818c]"
          }
        >
          ◉ {confidence}
        </span>

      </div>


      <input
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className="dvms-input h-7 w-full bg-white text-[9px] text-[#222] disabled:cursor-not-allowed disabled:opacity-60"
      />

    </label>
  );
}