import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  FileText,
  LockKeyhole,
  SearchX,
  Link2Off,
  Search,
  ExternalLink,
  ShieldCheck,
  Database,
  Copy,
  Check,
} from "lucide-react";
import { useState } from "react";

export default function VerificationResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [copied, setCopied] = useState("");

  // Data hasil verifikasi dari VerificationHome
  const verification = location.state?.verification;

  const nomorIjazah = searchParams.get("nomor");

  /*
   * Untuk sementara mengambil data dari navigation state.
   *
   * Nanti bentuk data yang diharapkan:
   *
   * {
   *   success: true,
   *   result: "valid",
   *   diploma: {...},
   *   alumni: {...},
   *   institution: {...},
   *   anchor: {...},
   *   blockchain: {...}
   * }
   */

  const result = verification?.result;

  const diploma = verification?.diploma || {};
  const alumni = verification?.alumni || {};
  const institution = verification?.institution || {};
  const anchor = verification?.anchor || {};
  const blockchain = verification?.blockchain || {};

  const copyHash = async (value, type) => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopied(type);

      setTimeout(() => {
        setCopied("");
      }, 1500);
    } catch (error) {
      console.error("Gagal menyalin:", error);
    }
  };

  /*
   * Kalau halaman dibuka langsung tanpa data dari state,
   * kita tampilkan pesan agar user kembali melakukan verifikasi.
   */
  if (!verification) {
    return (
      <div className="mx-auto max-w-[525px] pb-10 pt-14">
        <div className="text-center">
          <h1 className="text-[28px] font-semibold">
            Hasil Verifikasi
          </h1>

          <p className="mt-1 text-[11px] text-[#aaa6b4]">
            Belum ada data verifikasi yang diproses.
          </p>
        </div>

        <section className="mt-6 rounded-lg border border-[#292a34] bg-[#20222b] p-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#292536]">
            <SearchX
              size={25}
              className="text-[#8f8999]"
            />
          </div>

          <h2 className="mt-4 text-[15px] font-medium text-[#e8e5ed]">
            Data Verifikasi Tidak Ditemukan
          </h2>

          <p className="mx-auto mt-2 max-w-[360px] text-[10px] leading-5 text-[#8e8a97]">
            Silakan kembali ke halaman verifikasi dan
            lakukan pemeriksaan dokumen atau nomor ijazah.
          </p>

          <button
            type="button"
            onClick={() => navigate("/verify")}
            className="btn-lime mt-5 inline-flex h-9 items-center gap-2 px-4"
          >
            <Search size={14} />
            Kembali ke Verifikasi
          </button>
        </section>
      </div>
    );
  }

  // =========================
  // STATUS
  // =========================

  const isValid = result === "valid";
  const isRevoked = result === "revoked";
  const isNotRegistered = result === "not_registered";

  // =========================
  // DATA
  // =========================

  const fullName =
    alumni.full_name ||
    diploma.full_name ||
    blockchain.student_name ||
    "-";

  const nisn =
    alumni.nisn ||
    diploma.nisn ||
    "-";

  const major =
    alumni.major ||
    diploma.major ||
    "-";

  const diplomaNumber =
    diploma.diploma_number ||
    nomorIjazah ||
    "-";

  const graduationDate =
    diploma.graduation_date ||
    "-";

  const birthPlace =
    alumni.birth_place ||
    diploma.birth_place ||
    "-";

  const birthDate =
    alumni.birth_date ||
    diploma.birth_date ||
    "-";

  const institutionName =
    institution.name ||
    institution.institution_name ||
    institution.school_name ||
    institution.nama ||
    "-";

  const documentHash =
    diploma.document_hash ||
    anchor.sha256_hash ||
    "-";

  const ipfsCid =
    diploma.ipfs_cid ||
    anchor.ipfs_cid ||
    blockchain.ipfs_cid ||
    "";

  const transactionHash =
    anchor.polygon_tx_hash ||
    blockchain.transaction_hash ||
    "";

  const network =
    anchor.network ||
    "polygon-amoy";

  const contractAddress =
    blockchain.contract_address ||
    anchor.contract_address ||
    "";

  const blockNumber =
    anchor.block_number ||
    blockchain.block_number ||
    null;

  const explorerUrl = transactionHash
    ? `https://amoy.polygonscan.com/tx/${transactionHash.startsWith("0x")
      ? transactionHash
      : `0x${transactionHash}`
    }`
    : "";

  const ipfsUrl = ipfsCid
    ? `https://gateway.pinata.cloud/ipfs/${ipfsCid}`
    : "";

  const displayDate = (date) => {
    if (!date || date === "-") {
      return "-";
    }

    try {
      const parsed = new Date(date);

      if (Number.isNaN(parsed.getTime())) {
        return date;
      }

      return parsed.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch {
      return date;
    }
  };

  return (
    <div className="mx-auto max-w-[525px] pb-10 pt-14">
      {/* ========================= */}
      {/* HEADER */}
      {/* ========================= */}

      <div className="text-center">
        <h1 className="text-[28px] font-semibold">
          Hasil Verifikasi
        </h1>

        <p className="mt-1 text-[11px] text-[#aaa6b4]">
          Dokumen telah diperiksa terhadap database DVMS
          dan jaringan blockchain.
        </p>
      </div>

      {/* ========================= */}
      {/* VALID */}
      {/* ========================= */}

      {isValid && (
        <>
          <div className="mt-5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-5 py-5 text-emerald-400">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={30} />

              <div>
                <div className="text-[19px] font-semibold">
                  IJAZAH VALID & TER VERIFIKASI
                </div>

                <div className="mt-1 text-[10px] text-emerald-400/80">
                  Data ijazah ditemukan dan tercatat pada
                  jaringan verifikasi DVMS.
                </div>
              </div>
            </div>
          </div>

          {/* DATA IJAZAH */}

          <section className="mt-5 rounded-lg border border-[#566176] bg-[#313b4f] p-4">
            <h2 className="flex items-center gap-2 text-[16px] font-medium">
              <FileText size={15} />
              Data Ijazah
            </h2>

            <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-4 text-[11px]">
              <Info
                label="NAMA LENGKAP"
                value={fullName}
              />

              <Info
                label="NISN"
                value={nisn}
              />

              <Info
                label="NOMOR IJAZAH"
                value={diplomaNumber}
              />

              <Info
                label="JURUSAN / KEAHLIAN"
                value={major}
              />

              <Info
                label="INSTANSI PENDIDIKAN"
                value={institutionName}
              />

              <Info
                label="TANGGAL LULUS"
                value={displayDate(graduationDate)}
              />

              {birthPlace !== "-" && (
                <Info
                  label="TEMPAT LAHIR"
                  value={birthPlace}
                />
              )}

              {birthDate !== "-" && (
                <Info
                  label="TANGGAL LAHIR"
                  value={displayDate(birthDate)}
                />
              )}
            </div>
          </section>

          {/* BUKTI BLOCKCHAIN */}

          <section className="mt-5 rounded-lg border border-[#566176] bg-[#313b4f] p-4">
            <h2 className="flex items-center gap-2 text-[16px] font-medium">
              <LockKeyhole
                size={15}
                className="text-dvms-lime"
              />
              Bukti Blockchain
            </h2>

            <HashRow
              label="SHA-256 Document Hash"
              value={documentHash}
              onCopy={() =>
                copyHash(documentHash, "hash")
              }
              copied={copied === "hash"}
            />

            <HashRow
              label="IPFS CID"
              value={ipfsCid || "-"}
              link={ipfsUrl}
              linkText="View on IPFS ↗"
              onCopy={
                ipfsCid
                  ? () => copyHash(ipfsCid, "ipfs")
                  : undefined
              }
              copied={copied === "ipfs"}
            />

            <HashRow
              label="Polygon Transaction Hash"
              value={transactionHash || "-"}
              link={explorerUrl}
              linkText="Cek di Polygonscan ↗"
              onCopy={
                transactionHash
                  ? () =>
                    copyHash(
                      transactionHash,
                      "transaction"
                    )
                  : undefined
              }
              copied={copied === "transaction"}
            />

            <div className="mt-3 grid grid-cols-2 gap-3">
              <Info
                label="NETWORK"
                value={network}
              />

              {blockNumber && (
                <Info
                  label="BLOCK NUMBER"
                  value={String(blockNumber)}
                />
              )}
            </div>

            {contractAddress && (
              <div className="mt-3 rounded-md bg-[#0e0e10] p-3">
                <div className="text-[9px] text-[#ddd9e4]">
                  SMART CONTRACT
                </div>

                <div className="mt-1 break-all text-[10px] text-[#a6a2ad]">
                  {contractAddress}
                </div>
              </div>
            )}
          </section>

          {/* STATUS INFO */}

          <div className="mt-4 rounded-md border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
            <div className="flex items-start gap-2">
              <ShieldCheck
                size={15}
                className="mt-0.5 shrink-0 text-emerald-400"
              />

              <div className="text-[9px] leading-4 text-[#aaa6b4]">
                <span className="font-medium text-emerald-400">
                  Terverifikasi.
                </span>{" "}
                Data ijazah telah ditemukan pada database
                DVMS dan memiliki catatan pada jaringan
                Polygon.
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========================= */}
      {/* REVOKED */}
      {/* ========================= */}

      {isRevoked && (
        <>
          <div className="mt-5 rounded-lg border border-orange-400/30 bg-orange-950/30 px-5 py-5 text-orange-300">
            <div className="flex items-center gap-3">
              <ShieldCheck size={30} />

              <div>
                <div className="text-[19px] font-semibold">
                  IJAZAH DICABUT
                </div>

                <div className="mt-1 text-[10px] text-orange-300/80">
                  Data ijazah ditemukan, tetapi status
                  keabsahannya telah dicabut oleh institusi.
                </div>
              </div>
            </div>
          </div>

          <section className="mt-5 rounded-lg border border-[#566176] bg-[#313b4f] p-4">
            <h2 className="flex items-center gap-2 text-[16px] font-medium">
              <FileText size={15} />
              Data Ijazah
            </h2>

            <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-4 text-[11px]">
              <Info
                label="NAMA LENGKAP"
                value={fullName}
              />

              <Info
                label="NISN"
                value={nisn}
              />

              <Info
                label="NOMOR IJAZAH"
                value={diplomaNumber}
              />

              <Info
                label="JURUSAN / KEAHLIAN"
                value={major}
              />

              <Info
                label="INSTANSI PENDIDIKAN"
                value={institutionName}
              />

              <Info
                label="TANGGAL LULUS"
                value={displayDate(graduationDate)}
              />
            </div>
          </section>

          <section className="mt-5 rounded-lg border border-orange-500/20 bg-[#313b4f] p-4">
            <h2 className="flex items-center gap-2 text-[16px] font-medium">
              <Link2Off
                size={15}
                className="text-orange-300"
              />
              Status Keabsahan
            </h2>

            <div className="mt-3 rounded-md bg-[#202630] p-4 text-[10px] leading-5 text-[#c7c3cf]">
              Ijazah ini tercatat dalam sistem, tetapi
              statusnya telah dicabut atau dinyatakan tidak
              berlaku oleh institusi penerbit.
            </div>
          </section>
        </>
      )}

      {/* ========================= */}
      {/* NOT REGISTERED */}
      {/* ========================= */}

      {isNotRegistered && (
        <>
          <div className="mt-5 rounded-lg border border-red-400/30 bg-red-950/40 px-5 py-5 text-red-300">
            <div className="flex items-center gap-3">
              <SearchX size={30} />

              <div>
                <div className="text-[19px] font-semibold">
                  IJAZAH TIDAK TERDAFTAR
                </div>

                <div className="mt-1 text-[10px] text-red-300/80">
                  Keaslian ijazah tidak dapat dikonfirmasi
                  oleh sistem DVMS.
                </div>
              </div>
            </div>
          </div>

          <section className="mt-5 rounded-lg border border-[#566176] bg-[#313b4f] p-4">
            <h2 className="flex items-center gap-2 text-[16px] font-medium">
              <SearchX
                size={15}
                className="text-red-300"
              />
              Detail Pencarian
            </h2>

            <div className="mt-4 rounded-md bg-[#202630] p-4 text-center text-[11px] leading-5 text-[#c7c3cf]">
              {nomorIjazah ? (
                <>
                  Data ijazah dengan nomor{" "}
                  <span className="font-medium text-white">
                    {nomorIjazah}
                  </span>{" "}
                  tidak ditemukan dalam database
                  institusi DVMS.
                </>
              ) : (
                <>
                  Data ijazah yang diverifikasi tidak
                  ditemukan dalam database institusi DVMS.
                </>
              )}
            </div>
          </section>

          <section className="mt-5 flex h-32 items-center justify-center rounded-lg border border-[#566176] bg-[#313b4f] text-center text-[10px] text-[#aaa7b2]">
            <div>
              <Link2Off
                size={20}
                className="mx-auto mb-2 opacity-40"
              />

              Tidak ada catatan transaksi blockchain
              yang ditemukan untuk referensi ini.
            </div>
          </section>
        </>
      )}

      {/* ========================= */}
      {/* UNKNOWN RESULT */}
      {/* ========================= */}

      {!isValid &&
        !isRevoked &&
        !isNotRegistered && (
          <section className="mt-5 rounded-lg border border-[#566176] bg-[#313b4f] p-5 text-center">
            <SearchX
              size={25}
              className="mx-auto text-[#8e8a97]"
            />

            <h2 className="mt-3 text-[14px] font-medium">
              Status Verifikasi Tidak Dikenali
            </h2>

            <p className="mt-2 text-[10px] leading-5 text-[#8e8a97]">
              Sistem menerima hasil verifikasi, tetapi status
              yang diberikan belum dapat ditampilkan.
            </p>
          </section>
        )}

      {/* ========================= */}
      {/* FOOTER ACTION */}
      {/* ========================= */}

      <div className="mt-5 flex justify-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/verify")}
          className="btn-lime flex h-9 items-center gap-2 px-4"
        >
          {isValid ? (
            <ShieldCheck size={14} />
          ) : (
            <Search size={14} />
          )}

          {isValid
            ? "Verifikasi Dokumen Lain"
            : "Cek Kembali Nomor Ijazah"}
        </button>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="btn-dark h-9 px-4"
        >
          Kembali
        </button>
      </div>

      {/* ========================= */}
      {/* SECURITY FOOTER */}
      {/* ========================= */}

      <div className="mt-5 flex items-center justify-center gap-6 text-[8px] text-[#76727e]">
        <span>
          <Database
            className="mr-1 inline"
            size={11}
          />
          Polygon Network
        </span>

        <span>
          <LockKeyhole
            className="mr-1 inline"
            size={11}
          />
          SHA-256
        </span>

        <span>
          <ShieldCheck
            className="mr-1 inline"
            size={11}
          />
          Immutable
        </span>
      </div>
    </div>
  );
}

/* ========================= */
/* COMPONENT INFO */
/* ========================= */

function Info({ label, value }) {
  return (
    <div className="min-w-0">
      <div className="text-[9px] text-[#c5c1ce]">
        {label}
      </div>

      <div className="mt-1 break-words text-[12px] text-[#e5e2e8]">
        {value || "-"}
      </div>
    </div>
  );
}

/* ========================= */
/* COMPONENT HASH ROW */
/* ========================= */

function HashRow({
  label,
  value,
  link,
  linkText,
  onCopy,
  copied,
}) {
  return (
    <div className="mt-2 rounded-md bg-[#0e0e10] p-3">
      <div className="text-[9px] text-[#ddd9e4]">
        {label}
      </div>

      <div className="mt-1 flex items-start justify-between gap-2">
        <span className="mono min-w-0 break-all text-[9px] leading-4 text-[#a6a2ad]">
          {value || "-"}
        </span>

        <div className="flex shrink-0 items-center gap-2">
          {onCopy && value && value !== "-" && (
            <button
              type="button"
              onClick={onCopy}
              className="flex h-6 w-6 items-center justify-center rounded text-[#77727f] transition hover:bg-[#202127] hover:text-white"
              title="Salin"
            >
              {copied ? (
                <Check
                  size={11}
                  className="text-emerald-400"
                />
              ) : (
                <Copy size={11} />
              )}
            </button>
          )}

          {link && (
            <a
              href={link}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 whitespace-nowrap text-[9px] text-dvms-lime hover:underline"
            >
              {linkText || "Buka ↗"}
              <ExternalLink size={9} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}