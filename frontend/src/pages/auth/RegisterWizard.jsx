import { useEffect, useState } from "react";
import {
  ChevronRight,
  ChevronLeft,
  CloudUpload,
  CheckCircle2,
  Circle,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import Dropzone from "../../components/public/Dropzone";
import { supabase } from "../../lib/supabase";

const steps = ["Identitas", "Profile / Acces", "Legalitas", "Review"];

const provinces = [
  { id: "11", name: "Aceh" },
  { id: "12", name: "Sumatera Utara" },
  { id: "13", name: "Sumatera Barat" },
  { id: "14", name: "Riau" },
  { id: "15", name: "Jambi" },
  { id: "16", name: "Sumatera Selatan" },
  { id: "17", name: "Bengkulu" },
  { id: "18", name: "Lampung" },
  { id: "19", name: "Kepulauan Bangka Belitung" },
  { id: "21", name: "Kepulauan Riau" },
  { id: "31", name: "DKI Jakarta" },
  { id: "32", name: "Jawa Barat" },
  { id: "33", name: "Jawa Tengah" },
  { id: "34", name: "DI Yogyakarta" },
  { id: "35", name: "Jawa Timur" },
  { id: "36", name: "Banten" },
  { id: "51", name: "Bali" },
  { id: "52", name: "Nusa Tenggara Barat" },
  { id: "53", name: "Nusa Tenggara Timur" },
  { id: "61", name: "Kalimantan Barat" },
  { id: "62", name: "Kalimantan Tengah" },
  { id: "63", name: "Kalimantan Selatan" },
  { id: "64", name: "Kalimantan Timur" },
  { id: "65", name: "Kalimantan Utara" },
  { id: "71", name: "Sulawesi Utara" },
  { id: "72", name: "Sulawesi Tengah" },
  { id: "73", name: "Sulawesi Selatan" },
  { id: "74", name: "Sulawesi Tenggara" },
  { id: "75", name: "Gorontalo" },
  { id: "76", name: "Sulawesi Barat" },
  { id: "81", name: "Maluku" },
  { id: "82", name: "Maluku Utara" },
  { id: "91", name: "Papua" },
  { id: "92", name: "Papua Barat" },
  { id: "93", name: "Papua Selatan" },
  { id: "94", name: "Papua Tengah" },
  { id: "95", name: "Papua Pegunungan" },
  { id: "96", name: "Papua Barat Daya" },
];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const numericPattern = /^\d+$/;

export default function RegisterWizard() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successData, setSuccessData] = useState(null);
  const [cities, setCities] = useState([]);
  const [citiesLoading, setCitiesLoading] = useState(false);

  const [form, setForm] = useState({
    // =========================
    // STEP 1 - IDENTITAS
    // =========================
    institutionName: "",
    npsn: "",
    institutionEmail: "",
    address: "",
    province: "",
    city: "",
    postalCode: "",
    officePhone: "",

    // =========================
    // STEP 2 - ADMIN
    // =========================
    adminFullName: "",
    adminNip: "",
    adminPosition: "",
    adminPhone: "",
    adminEmail: "",
    password: "",
    confirmPassword: "",

    // =========================
    // STEP 3 - LEGALITAS
    // Dokumen disimpan sebagai File objects
    // =========================
    operationalLicense: null,
    establishmentDocument: null,
    accreditationDocument: null,
    additionalDocument: null,
  });

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errorMessage) {
      setErrorMessage("");
    }
  };

  useEffect(() => {
    if (!form.province) {
      setCities([]);
      return undefined;
    }

    const controller = new AbortController();
    setCitiesLoading(true);

    fetch(
      `https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${form.province}.json`,
      { signal: controller.signal }
    )
      .then((response) => {
        if (!response.ok) throw new Error("Gagal memuat kabupaten/kota.");
        return response.json();
      })
      .then((data) => setCities(data))
      .catch((error) => {
        if (error.name !== "AbortError") {
          setCities([]);
          setErrorMessage("Daftar kabupaten/kota gagal dimuat. Coba pilih provinsi lagi.");
        }
      })
      .finally(() => setCitiesLoading(false));

    return () => controller.abort();
  }, [form.province]);

  const validateStepOne = () => {
    if (!form.institutionName.trim()) {
      return "Nama resmi instansi wajib diisi.";
    }

    if (!form.npsn.trim()) {
      return "NPSN wajib diisi.";
    }

    if (!form.institutionEmail.trim()) {
      return "Email resmi instansi wajib diisi.";
    }

    if (!emailPattern.test(form.institutionEmail.trim())) {
      return "Email resmi instansi harus menggunakan format email yang valid.";
    }

    if (!form.province) {
      return "Provinsi wajib dipilih.";
    }

    if (!form.city) {
      return "Kabupaten/kota wajib dipilih.";
    }

    if (!numericPattern.test(form.npsn) || form.npsn.length !== 8) {
      return "NPSN harus berupa 8 angka.";
    }

    if (form.postalCode && (!numericPattern.test(form.postalCode) || form.postalCode.length !== 5)) {
      return "Kode pos harus berupa 5 angka.";
    }

    if (form.officePhone && (!numericPattern.test(form.officePhone) || form.officePhone.length < 10 || form.officePhone.length > 15)) {
      return "Nomor telepon kantor harus berupa 10-15 angka.";
    }

    if (!form.address.trim()) {
      return "Alamat lengkap wajib diisi.";
    }

    return null;
  };

  const validateStepTwo = () => {
    if (!form.adminFullName.trim()) {
      return "Nama admin/penanggung jawab wajib diisi.";
    }

    if (!form.adminNip.trim()) {
      return "NIP / NUPTK / NIK wajib diisi.";
    }

    if (!form.adminEmail.trim()) {
      return "Email login admin wajib diisi.";
    }

    if (!emailPattern.test(form.adminEmail.trim())) {
      return "Email login admin harus menggunakan format email yang valid.";
    }

    if (!numericPattern.test(form.adminNip)) {
      return "NIP / NUPTK / NIK hanya boleh berisi angka.";
    }

    if (form.adminPhone && (!numericPattern.test(form.adminPhone) || form.adminPhone.length < 10 || form.adminPhone.length > 15)) {
      return "Nomor telepon admin harus berupa 10-15 angka.";
    }

    if (!form.password) {
      return "Password wajib diisi.";
    }

    if (form.password.length < 6) {
      return "Password minimal 6 karakter.";
    }

    if (form.password !== form.confirmPassword) {
      return "Konfirmasi password tidak sama.";
    }

    return null;
  };

  const validateStepThree = () => {
    // Minimal 3 dari 4 dokumen harus diupload
    const docs = [
      form.operationalLicense,
      form.establishmentDocument,
      form.accreditationDocument,
      form.additionalDocument,
    ];

    const uploadedCount = docs.filter((doc) => doc !== null).length;

    if (uploadedCount < 3) {
      return `Minimal 3 dokumen wajib diupload. Saat ini baru ${uploadedCount} dokumen.`;
    }

    return null;
  };

  const next = () => {
    setErrorMessage("");

    let validationError = null;

    if (step === 1) {
      validationError = validateStepOne();
    }

    if (step === 2) {
      validationError = validateStepTwo();
    }

    if (step === 3) {
      validationError = validateStepThree();
    }

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setStep((current) => Math.min(4, current + 1));
  };

  const back = () => {
    setErrorMessage("");
    setStep((current) => Math.max(1, current - 1));
  };

  /**
   * Generate Registration ID
   *
   * Contoh:
   * TENANT-2026-48129
   */
  const generateRegistrationId = () => {
    const year = new Date().getFullYear();

    const randomNumber = Math.floor(
      10000 + Math.random() * 90000
    );

    return `TENANT-${year}-${randomNumber}`;
  };

  /**
   * Upload dokumen ke Supabase Storage
   * Mengembalikan array berisi {documentType, fileUrl, fileName}
   */
  const uploadDocuments = async (authUserId) => {
    const uploadedDocs = [];

    const docMappings = [
      {
        file: form.operationalLicense,
        type: "operational_license",
        name: "SK Izin Operasional",
      },
      {
        file: form.establishmentDocument,
        type: "establishment_document",
        name: "SK Pendirian",
      },
      {
        file: form.accreditationDocument,
        type: "accreditation_document",
        name: "Dokumen Akreditasi",
      },
      {
        file: form.additionalDocument,
        type: "additional_document",
        name: "Dokumen Tambahan",
      },
    ];

    for (const doc of docMappings) {
      if (!doc.file) continue;

      try {
        const fileName = `${authUserId}/${doc.type}/${Date.now()}_${doc.file.name}`;

        const { data, error } = await supabase.storage
          .from("institution-legal-docs")
          .upload(fileName, doc.file);

        if (error) {
          console.error(`Upload error untuk ${doc.name}:`, error);
          throw new Error(
            `Gagal upload ${doc.name}: ${error.message}`
          );
        }

        uploadedDocs.push({
          documentType: doc.type,
          fileUrl: data.path,
          fileName: doc.name,
        });
      } catch (err) {
        console.error(`Upload error:`, err);
        throw err;
      }
    }

    return uploadedDocs;
  };

  /**
   * Submit registrasi
   */
  const submitRegistration = async () => {
    setErrorMessage("");
    setLoading(true);

    try {
      // ==========================================
      // 1. VALIDASI FINAL
      // ==========================================

      const stepOneError = validateStepOne();

      if (stepOneError) {
        setStep(1);
        throw new Error(stepOneError);
      }

      const stepTwoError = validateStepTwo();

      if (stepTwoError) {
        setStep(2);
        throw new Error(stepTwoError);
      }

      const stepThreeError = validateStepThree();

      if (stepThreeError) {
        setStep(3);
        throw new Error(stepThreeError);
      }

      // ==========================================
      // 2. BUAT AKUN SUPABASE AUTH
      // ==========================================

      const {
        data: authData,
        error: authError,
      } = await supabase.auth.signUp({
        email: form.adminEmail.trim().toLowerCase(),
        password: form.password,

        options: {
          data: {
            full_name: form.adminFullName.trim(),
            nip: form.adminNip.trim(),
          },
        },
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error(
          "Akun berhasil diproses tetapi user Auth tidak ditemukan."
        );
      }

      const authUser = authData.user;

      console.log("Auth user berhasil dibuat:", authUser.id);

      // ==========================================
      // 3. BUAT REGISTRATION ID
      // ==========================================

      const registrationId = generateRegistrationId();

      // ==========================================
      // 4. INSERT INSTITUTION
      // ==========================================

      const {
        data: institution,
        error: institutionError,
      } = await supabase
        .from("institutions")
        .insert({
          official_name: form.institutionName.trim(),
          official_email: form.institutionEmail.trim().toLowerCase(),
          npsn: form.npsn.trim(),
          address: form.address.trim(),
          province: form.province.trim() || null,
          city: form.city.trim() || null,
          postal_code: form.postalCode.trim() || null,
          office_phone: form.officePhone.trim() || null,

          status: "pending",
          verification_status: "pending",
          created_by: authUser.id,
        })
        .select(
          "id, official_name, npsn, status, verification_status"
        )
        .single();

      if (institutionError) {
        console.error("Institution error:", institutionError);

        throw new Error(
          `Gagal membuat data institusi: ${institutionError.message}`
        );
      }

      console.log("Institution berhasil dibuat:", institution);

      // ==========================================
      // 5. UPDATE PROFILE ADMIN
      // ==========================================

      const {
        data: existingProfile,
        error: profileFetchError,
      } = await supabase
        .from("profiles")
        .select(
          "id, role, full_name, nip, institution_id, account_status"
        )
        .eq("id", authUser.id)
        .maybeSingle();

      if (profileFetchError) {
        console.error(
          "Profile fetch error:",
          profileFetchError
        );

        throw new Error(
          `Gagal mengambil profile: ${profileFetchError.message}`
        );
      }

      if (existingProfile) {
        const {
          error: profileUpdateError,
        } = await supabase
          .from("profiles")
          .update({
            institution_id: institution.id,
            role: "admin",
            full_name: form.adminFullName.trim(),
            nip: form.adminNip.trim(),
            phone: form.adminPhone.trim() || null,
            job_title: form.adminPosition.trim() || null,
            account_status: "pending",
          })
          .eq("id", authUser.id);

        if (profileUpdateError) {
          console.error(
            "Profile update error:",
            profileUpdateError
          );

          throw new Error(
            `Gagal memperbarui profile: ${profileUpdateError.message}`
          );
        }
      } else {
        const {
          error: profileInsertError,
        } = await supabase
          .from("profiles")
          .insert({
            id: authUser.id,
            institution_id: institution.id,
            role: "admin",
            full_name: form.adminFullName.trim(),
            nip: form.adminNip.trim(),
            phone: form.adminPhone.trim() || null,
            job_title: form.adminPosition.trim() || null,
            account_status: "pending",
          });

        if (profileInsertError) {
          console.error(
            "Profile insert error:",
            profileInsertError
          );

          throw new Error(
            `Gagal membuat profile admin: ${profileInsertError.message}`
          );
        }
      }

      // ==========================================
      // 6. UPLOAD DOKUMEN KE STORAGE
      // ==========================================

      let uploadedDocuments = [];

      try {
        uploadedDocuments = await uploadDocuments(authUser.id);
        console.log("Dokumen berhasil diupload:", uploadedDocuments);
      } catch (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      // ==========================================
      // 7. INSERT REGISTRATION
      // ==========================================

      const {
        data: registration,
        error: registrationError,
      } = await supabase
        .from("institution_registrations")
        .insert({
          registration_id: registrationId,
          institution_id: institution.id,
          submitted_by: authUser.id,
          documents: uploadedDocuments,
          status: "data_submitted",
        })
        .select("id, registration_id, status")
        .single();

      if (registrationError) {
        console.error("Registration error:", registrationError);
        throw new Error(
          `Gagal membuat registrasi: ${registrationError.message}`
        );
      }

      console.log("Registration berhasil dibuat:", registration);



      // ==========================================
      // 8. LOGOUT SETELAH REGISTRASI
      // ==========================================
      //
      // Penting:
      // akun tidak boleh langsung masuk dashboard.
      // Akun masih menunggu verifikasi Superadmin.
      //

      await supabase.auth.signOut();

      // ==========================================
      // 9. TAMPILKAN HASIL REGISTRASI
      // ==========================================

      setSuccessData({
        registrationId: registration.registration_id,
        institutionName: form.institutionName,
        institutionEmail: form.institutionEmail,
        status: registration.status,
      });

      setStep(4);
    } catch (error) {
      console.error("Registration error:", error);

      setErrorMessage(
        error?.message ||
        "Terjadi kesalahan saat proses registrasi."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] p-4 text-white">
      <div className="mx-auto max-w-[515px] overflow-hidden rounded-lg border border-[#41404a] bg-[#1c1c1f]">

        {/* ========================================= */}
        {/* HEADER */}
        {/* ========================================= */}

        <header className="bg-gradient-to-br from-[#24242a] to-[#291355] px-5 pb-3 pt-5">
          <h1 className="text-xl font-semibold">
            Registrasi Institusi
          </h1>

          <p className="text-[10px] text-[#aaa6b4]">
            Bergabung dengan jaringan verifikasi ijazah
            terdesentralisasi.
          </p>

          <div className="mt-5 h-1 bg-[#333238]">
            <div
              className="h-full bg-dvms-purple transition-all"
              style={{
                width: `${step * 25}%`,
              }}
            />
          </div>

          <div className="mt-2 grid grid-cols-4 text-[9px]">
            {steps.map((item, index) => (
              <span
                key={item}
                className={
                  index + 1 <= step
                    ? "text-dvms-lime"
                    : "text-[#bbb7c3]"
                }
              >
                {item}
              </span>
            ))}
          </div>
        </header>

        {/* ========================================= */}
        {/* ERROR */}
        {/* ========================================= */}

        {errorMessage && (
          <div className="mx-5 mt-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-[10px] text-red-300">
            {errorMessage}
          </div>
        )}

        {/* ========================================= */}
        {/* CONTENT */}
        {/* ========================================= */}

        <main className="min-h-[350px] border-t border-[#39383f] p-5">

          {step === 1 && (
            <StepOne
              form={form}
              updateField={updateField}
              cities={cities}
              citiesLoading={citiesLoading}
            />
          )}

          {step === 2 && (
            <StepTwo
              form={form}
              updateField={updateField}
            />
          )}

          {step === 3 && (
            <StepThree
              form={form}
              updateField={updateField}
            />
          )}

          {step === 4 && (
            <StepFour
              successData={successData}
              navigate={navigate}
            />
          )}

        </main>

        {/* ========================================= */}
        {/* FOOTER */}
        {/* ========================================= */}

        <footer className="flex justify-between border-t border-[#39383f] px-5 py-4">

          <button
            type="button"
            disabled={loading}
            onClick={
              step === 1
                ? () => navigate("/login")
                : back
            }
            className="btn-dark border-0 bg-transparent px-2"
          >
            <ChevronLeft size={13} />
            Kembali
          </button>

          {step < 3 && (
            <button
              type="button"
              onClick={next}
              disabled={loading}
              className="btn-primary"
            >
              Selanjutnya
              <ChevronRight size={13} />
            </button>
          )}

          {step === 3 && (
            <button
              type="button"
              onClick={next}
              disabled={loading}
              className="btn-primary"
            >
              Review
              <ChevronRight size={13} />
            </button>
          )}

          {step === 4 && successData && (
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="btn-primary"
            >
              Ke Halaman Login
              <ChevronRight size={13} />
            </button>
          )}
        </footer>

        {/* ========================================= */}
        {/* SUBMIT BUTTON DI REVIEW */}
        {/* ========================================= */}

        {step === 4 && !successData && (
          <div className="border-t border-[#39383f] px-5 py-4">
            <button
              type="button"
              onClick={submitRegistration}
              disabled={loading}
              className="btn-primary w-full justify-center"
            >
              {loading
                ? "Memproses Registrasi..."
                : "Kirim Registrasi"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

/* ================================================= */
/* STEP 1 */
/* ================================================= */

function StepOne({ form, updateField, cities, citiesLoading }) {
  return (
    <div>
      <SectionTitle>
        Identitas Instansi / Sekolah
      </SectionTitle>

      <p className="mb-4 text-[10px] text-[#9f9ba8]">
        Informasi dasar mengenai institusi pendidikan Anda.
      </p>

      <div className="grid grid-cols-2 gap-3">

        <Field
          wide
          label="Nama Resmi Instansi"
          placeholder="Contoh: Universitas Gadjah Mada"
          value={form.institutionName}
          onChange={(value) =>
            updateField("institutionName", value)
          }
        />

        <Field
          label="NPSN / Kode Institusi"
          placeholder="001001"
          value={form.npsn}
          onChange={(value) =>
            updateField("npsn", value)
          }
        />

        <Field
          label="Email Resmi Instansi"
          placeholder="admin@kampus.ac.id"
          type="email"
          value={form.institutionEmail}
          onChange={(value) =>
            updateField("institutionEmail", value)
          }
        />

        <Field
          wide
          label="Alamat Lengkap"
          placeholder="Masukkan alamat lengkap institusi..."
          value={form.address}
          onChange={(value) =>
            updateField("address", value)
          }
        />

        <SelectField
          label="Provinsi"
          placeholder="Pilih Provinsi"
          value={form.province}
          options={provinces}
          onChange={(value) => {
            updateField("province", value);
            updateField("city", "");
          }}
        />

        <SelectField
          label="Kota / Kabupaten"
          placeholder={
            citiesLoading
              ? "Memuat kabupaten/kota..."
              : "Pilih Kota/Kabupaten"
          }
          value={form.city}
          options={cities}
          disabled={!form.province || citiesLoading}
          onChange={(value) => updateField("city", value)}
        />

        <Field
          label="Kode Pos"
          placeholder="Misal: 55281"
          value={form.postalCode}
          onChange={(value) =>
            updateField("postalCode", value)
          }
        />

        <Field
          label="No. Telepon Kantor"
          placeholder="(0274) XXXXXX"
          value={form.officePhone}
          onChange={(value) =>
            updateField("officePhone", value)
          }
        />

      </div>
    </div>
  );
}

/* ================================================= */
/* STEP 2 */
/* ================================================= */

function StepTwo({ form, updateField }) {
  return (
    <div>
      <SectionTitle>
        Profil & Akses Admin Sekolah
      </SectionTitle>

      <p className="mb-4 text-[10px] text-[#9f9ba8]">
        Masukkan data penanggung jawab beserta email
        dan kata sandi untuk login.
      </p>

      <div className="grid grid-cols-2 gap-3">

        <Field
          wide
          label="Nama Admin / Penanggung Jawab"
          placeholder="Contoh: Muhamad Soleh Sulaeman, S.Tr.Kom."
          value={form.adminFullName}
          onChange={(value) =>
            updateField("adminFullName", value)
          }
        />

        <Field
          label="NIP / NUPTK / NIK"
          placeholder="19820315209021003"
          value={form.adminNip}
          onChange={(value) =>
            updateField("adminNip", value)
          }
        />

        <SelectField
          label="Jabatan"
          placeholder="Pilih Jabatan"
          value={form.adminPosition}
          options={[
            { value: "Kepala Sekolah", label: "Kepala Sekolah" },
            { value: "Wakil Kepala Sekolah", label: "Wakil Kepala Sekolah" },
            { value: "Kepala Tata Usaha", label: "Kepala Tata Usaha" },
            { value: "Operator Sekolah", label: "Operator Sekolah" },
            { value: "Admin Institusi", label: "Admin Institusi" },
            { value: "Rektor", label: "Rektor" },
            { value: "Wakil Rektor", label: "Wakil Rektor" },
            { value: "Direktur", label: "Direktur" },
            { value: "Dekan", label: "Dekan" },
            { value: "Lainnya", label: "Lainnya" },
          ]}
          onChange={(value) => updateField("adminPosition", value)}
        />

        <Field
          label="No. Telepon / WhatsApp"
          placeholder="Masukkan nomor telepon"
          value={form.adminPhone}
          onChange={(value) =>
            updateField("adminPhone", value)
          }
        />

        <Field
          wide
          label="Email Login Admin"
          placeholder="admin@kampus.ac.id"
          type="email"
          value={form.adminEmail}
          onChange={(value) =>
            updateField("adminEmail", value)
          }
        />

        <Field
          label="Kata Sandi"
          placeholder="Minimal 6 karakter"
          type="password"
          value={form.password}
          onChange={(value) =>
            updateField("password", value)
          }
        />

        <Field
          label="Konfirmasi Kata Sandi"
          placeholder="Ulangi kata sandi"
          type="password"
          value={form.confirmPassword}
          onChange={(value) =>
            updateField("confirmPassword", value)
          }
        />

      </div>

      <div className="mt-4 rounded-md border border-yellow-500/20 bg-yellow-500/5 p-3 text-[9px] text-yellow-200">
        <strong>Perhatian:</strong> akun admin belum
        aktif setelah registrasi. Akun harus diverifikasi
        terlebih dahulu oleh Superadmin.
      </div>
    </div>
  );
}

/* ================================================= */
/* STEP 3 */
/* ================================================= */

function StepThree({ form, updateField }) {
  const documents = [
    {
      key: "operationalLicense",
      name: "SK Izin Operasional",
      meta: "Surat Keputusan Izin Operasional",
    },
    {
      key: "establishmentDocument",
      name: "SK Pendirian",
      meta: "Surat Keputusan Pendirian Institusi",
    },
    {
      key: "accreditationDocument",
      name: "Dokumen Akreditasi",
      meta: "Sertifikat Akreditasi dari BAN",
    },
    {
      key: "additionalDocument",
      name: "Dokumen Tambahan",
      meta: "Dokumen pendukung lainnya (opsional)",
    },
  ];

  const uploadedCount = documents.filter(
    (doc) => form[doc.key] !== null
  ).length;

  return (
    <div>
      <SectionTitle>
        Dokumen Legalitas Instansi
      </SectionTitle>

      <p className="mt-2 text-[10px] text-[#9f9ba8]">
        Dokumen legalitas digunakan oleh Superadmin
        untuk proses verifikasi institusi.
        <br />
        <strong>Minimal 3 dari 4 dokumen wajib diupload.</strong>
      </p>

      <div className="mt-4 grid grid-cols-2 gap-4">

        <div>
          <h3 className="mb-2 text-sm font-medium">
            Upload Dokumen ({uploadedCount}/4)
          </h3>

          <div className="mb-3 space-y-2">
            {documents.map((doc) => (
              <div key={doc.key}>
                <Dropzone
                  compact
                  value={form[doc.key]}
                  onChange={(file) => {
                    updateField(doc.key, file);
                  }}
                />
                {form[doc.key] && (
                  <div className="mt-1 text-[8px] text-blue-300">
                    ✓ {form[doc.key].name}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-2 rounded-md border border-[#36353c] p-2 text-[9px] text-[#aaa6b4]">
            <ShieldCheck
              size={12}
              className="mr-1 inline text-dvms-lime"
            />
            Keamanan Dokumen
            <br />
            Dokumen akan dienkripsi dan digunakan
            untuk verifikasi manual oleh Superadmin.
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-medium">
            Daftar Dokumen Wajib
          </h3>

          {documents.map((doc) => (
            <Doc
              key={doc.key}
              name={doc.name}
              meta={doc.meta}
              status={
                form[doc.key]
                  ? "Uploaded"
                  : doc.key === "additionalDocument"
                    ? ""
                    : "Pending"
              }
            />
          ))}
        </div>

      </div>

      <div className="mt-4 rounded-md border border-blue-500/20 bg-blue-500/5 p-3 text-[9px] text-blue-200">
        <strong>Status setelah dikirim:</strong>
        <br />
        Registrasi akan masuk ke tahap{" "}
        <b>manual_verification</b> dan hanya
        Superadmin yang dapat mengaktifkan akun.
      </div>
    </div>
  );
}

/* ================================================= */
/* STEP 4 */
/* ================================================= */

function StepFour({ successData, navigate }) {
  if (!successData) {
    return (
      <div>
        <SectionTitle>
          Review Registrasi
        </SectionTitle>

        <div className="mt-4 rounded-lg bg-[#313b4f] p-5">

          <h2 className="text-lg font-semibold">
            Periksa Data Registrasi
          </h2>

          <p className="mt-1 text-[10px] text-[#aaa6b4]">
            Pastikan seluruh data sudah benar sebelum
            mengirimkan registrasi.
          </p>

          <div className="mt-4 rounded-md bg-[#17171a] p-3 text-[10px]">
            <p>
              Setelah dikirim, registrasi akan menunggu
              verifikasi manual dari Superadmin.
            </p>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-lg bg-[#313b4f] p-5 text-center">
        <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-emerald-500/20 text-emerald-400">
          <CheckCircle2 />
        </div>

        <h2 className="mt-3 text-xl font-semibold">
          Registrasi Berhasil
        </h2>

        <p className="mt-1 text-[10px] text-[#c0bdc8]">
          Pengajuan registrasi instansi Anda telah
          diterima dan masuk ke antrean verifikasi
          Superadmin DVMS.
        </p>

        <div className="mx-auto mt-3 inline-block rounded bg-[#17171a] px-2 py-1 font-mono text-[8px]">
          REGISTRATION ID • {successData.registrationId}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-[140px_1fr] gap-2">
        <div className="rounded-lg bg-[#313b4f] p-3 text-[9px]">
          <div className="mb-2 text-sm font-medium">
            Detail Instansi
          </div>

          <div className="text-[#aaa6b4]">
            Nama Institusi
          </div>

          <div>
            {successData.institutionName}
          </div>

          <div className="mt-2 text-[#aaa6b4]">
            Email
          </div>

          <div className="break-all">
            {successData.institutionEmail}
          </div>
        </div>

        <div className="rounded-lg bg-[#313b4f] p-3">
          <div className="text-lg font-semibold">
            Status Verifikasi
          </div>

          <Timeline />
        </div>
      </div>

      <div className="mt-3">
        <button
          type="button"
          onClick={() => navigate("/cek-status")}
          className="w-full rounded-md border border-[#41404a] px-4 py-2.5 text-xs font-medium text-[#d7d3dc] transition hover:border-[#777481] hover:text-white"
        >
          Cek Status Registrasi
        </button>
      </div>
    </div>
  );
}

/* ================================================= */
/* TIMELINE */
/* ================================================= */

function Timeline() {
  return (
    <div className="mt-3 space-y-3 text-[10px]">

      <div className="flex gap-2">
        <CheckCircle2
          size={17}
          className="text-emerald-400"
        />

        <div>
          <b>Data Terkirim</b>

          <p className="text-[#aaa6b4]">
            Formulir pendaftaran berhasil direkam.
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Circle
          size={17}
          className="text-blue-400"
        />

        <div>
          <b className="text-blue-300">
            Verifikasi Manual
          </b>

          <p className="text-[#aaa6b4]">
            Menunggu pemeriksaan dan persetujuan
            Superadmin.
          </p>
        </div>
      </div>

      <div className="flex gap-2 text-[#777481]">
        <Circle size={17} />

        <div>
          <b>Aktivasi Akun</b>

          <p>
            Akun akan menjadi aktif setelah
            Superadmin menyetujui registrasi.
          </p>
        </div>
      </div>

    </div>
  );
}

/* ================================================= */
/* FIELD */
/* ================================================= */

function SelectField({
  label,
  placeholder,
  value,
  options,
  onChange,
  disabled = false,
}) {
  return (
    <label className="block">
      <span className="dvms-label">
        {label}
      </span>

      <select
        className="dvms-input"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option
            key={option.value || option.id}
            value={option.value || option.id}
          >
            {option.label || option.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  wide = false,
}) {
  return (
    <label
      className={
        wide ? "block col-span-2" : "block"
      }
    >
      <span className="dvms-label">
        {label}
      </span>

      <input
        type={type}
        className="dvms-input"
        placeholder={placeholder}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
      />
    </label>
  );
}

/* ================================================= */
/* DOCUMENT */
/* ================================================= */

function Doc({ name, meta, status }) {
  return (
    <div className="mb-2 rounded-md border border-[#3a3d46] bg-[#313b4f] p-2.5">

      <div className="flex items-center gap-2">

        <div className="grid h-7 w-7 place-items-center rounded-full bg-[#151519]">
          <CloudUpload size={13} />
        </div>

        <div className="min-w-0 flex-1">

          <div className="text-[9px]">
            {name}
          </div>

          <div className="text-[8px] text-[#aaa7b2]">
            {meta}
          </div>

        </div>

        {status && (
          <span
            className={`rounded-full px-2 py-1 text-[7px] ${status === "Uploaded"
              ? "bg-blue-500/15 text-blue-300"
              : "bg-yellow-500/15 text-yellow-300"
              }`}
          >
            {status}
          </span>
        )}

      </div>
    </div>
  );
}

/* ================================================= */
/* SECTION TITLE */
/* ================================================= */

function SectionTitle({ children }) {
  return (
    <h2 className="border-l-2 border-dvms-lime pl-2 text-base font-medium">
      {children}
    </h2>
  );
}