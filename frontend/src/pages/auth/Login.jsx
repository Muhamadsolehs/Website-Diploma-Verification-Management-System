import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  BadgeCheck,
} from "lucide-react";
import { useState } from "react";

import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const [show, setShow] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!identifier.trim() || !password) {
      setError("NIP/Email dan password wajib diisi.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let email = identifier.trim();

      /*
       * =========================================================
       * 1. LOGIN MENGGUNAKAN NIP
       * =========================================================
       *
       * Jika input tidak mengandung "@", berarti dianggap sebagai NIP.
       * Kita mencari email user melalui RPC Supabase.
       */

      if (!email.includes("@")) {
        const { data, error: nipError } = await supabase.rpc(
          "get_login_email_by_nip",
          {
            p_nip: email,
          }
        );

        if (nipError) {
          console.error("NIP lookup error:", nipError);

          setError("Gagal mencari akun berdasarkan NIP.");
          setLoading(false);
          return;
        }

        if (!data) {
          setError("NIP tidak ditemukan.");
          setLoading(false);
          return;
        }

        email = data;
      }

      /*
       * =========================================================
       * 2. LOGIN SUPABASE AUTH
       * =========================================================
       */

      const { data: authData, error: loginError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (loginError) {
        console.error("Login error:", loginError);

        setError("Email/NIP atau password salah.");
        setLoading(false);
        return;
      }

      const loggedInUser = authData?.user;

      if (!loggedInUser) {
        setError("Login gagal. User tidak ditemukan.");
        setLoading(false);
        return;
      }

      /*
       * =========================================================
       * 3. AMBIL PROFILE USER
       * =========================================================
       *
       * Jangan langsung menggunakan `role` dari AuthContext di sini.
       * Setelah login, state React belum tentu sudah selesai diperbarui.
       *
       * Karena itu kita mengambil profile langsung dari database.
       */

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, role, full_name, nip")
        .eq("id", loggedInUser.id)
        .maybeSingle();

      if (profileError) {
        console.error("Profile error:", profileError);

        await signOut();

        setError("Gagal mengambil data profil akun.");
        setLoading(false);
        return;
      }

      /*
       * =========================================================
       * 4. PROFILE HARUS ADA
       * =========================================================
       */

      if (!profile) {
        console.error("Profile tidak ditemukan untuk user:", loggedInUser.id);

        await signOut();

        setError(
          "Profil akun belum terdaftar. Hubungi administrator."
        );

        setLoading(false);
        return;
      }

      /*
       * =========================================================
       * 5. CEK ROLE DAN REDIRECT
       * =========================================================
       */

      const role = profile.role?.toLowerCase();

      console.log("Login berhasil");
      console.log("User:", loggedInUser.email);
      console.log("Role:", profile?.role);

      if (role === "admin") {
        navigate("/dashboardAdmin", { replace: true });
        return;
      }

      if (role === "superadmin") {
        navigate("/dashboardSuperAdmin", { replace: true });
        return;
      }

      /*
       * =========================================================
       * ROLE TIDAK DIKENAL
       * =========================================================
       */

      console.error("Role tidak memiliki akses:", role);

      await signOut();

      setError(
        "Akun berhasil login, tetapi role akun tidak memiliki akses ke portal."
      );

      setLoading(false);
    } catch (err) {
      console.error("Unexpected login error:", err);

      setError("Terjadi kesalahan saat proses login.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white md:grid md:grid-cols-2">
      {/* =========================================================
          LEFT SIDE
      ========================================================= */}

      <section className="relative hidden overflow-hidden bg-gradient-to-br from-[#28115c] via-[#25105a] to-[#1a1036] md:block">
        <div className="absolute bottom-12 left-8 max-w-[340px]">
          <div className="mb-4 grid h-9 w-9 place-items-center rounded-lg border border-[#8c72d8]/30 bg-[#7a55d8]/10 text-[#b6a4f5]">
            <BadgeCheck size={18} />
          </div>

          <h1 className="text-3xl font-semibold leading-tight text-[#b3a4e4]">
            Secure. Verified.
            <br />
            Immutable.
          </h1>

          <p className="mt-3 text-xs leading-5 text-[#9789bb]">
            The next generation of academic credential management.
            <br />
            Empowering institutions with cryptographically secure,
            <br />
            instantly verifiable digital diplomas.
          </p>
        </div>
      </section>

      {/* =========================================================
          RIGHT SIDE
      ========================================================= */}

      <section className="flex min-h-screen items-center justify-center px-5">
        <div className="w-full max-w-[255px] rounded-lg border border-[#3a3941] bg-[#202020] p-5 shadow-2xl">

          {/* =====================================================
              LOGO / TITLE
          ===================================================== */}

          <div className="text-center">
            <div className="text-xl font-semibold text-[#dddbe2]">
              ◈DVMS
            </div>

            <div className="text-[18px] font-semibold text-[#dddbe2]">
              Admin Portal
            </div>

            <p className="text-[10px] text-[#a39faa]">
              Sign in to manage academic records
            </p>
          </div>

          {/* =====================================================
              LOGIN FORM
          ===================================================== */}

          <form
            className="mt-5 space-y-4"
            onSubmit={handleLogin}
          >

            {/* ===================================================
                NIP / EMAIL
            =================================================== */}

            <label className="block">
              <span className="dvms-label">
                NIP / Email Address
              </span>

              <div className="relative">
                <input
                  type="text"
                  className="dvms-input pl-8"
                  placeholder="e.g. 19800101200501001"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  autoComplete="username"
                  disabled={loading}
                />

                <span className="absolute left-2.5 top-2.5 text-[#777481]">
                  ▣
                </span>
              </div>
            </label>

            {/* ===================================================
                PASSWORD
            =================================================== */}

            <label className="block">
              <span className="dvms-label">
                Password
              </span>

              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  className="dvms-input pl-8 pr-8"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={loading}
                />

                <KeyRound
                  size={13}
                  className="absolute left-2.5 top-3 text-[#777481]"
                />

                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-2.5 top-2.5 text-[#777481]"
                  disabled={loading}
                >
                  {show ? (
                    <EyeOff size={13} />
                  ) : (
                    <Eye size={13} />
                  )}
                </button>
              </div>
            </label>

            {/* ===================================================
                REMEMBER / FORGOT PASSWORD
            =================================================== */}

            <div className="flex items-center justify-between text-[9px] text-[#bdb9c6]">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="accent-lime-400"
                  disabled={loading}
                />

                Remember Me
              </label>

              <button
                type="button"
                className="text-[#b7a4f4]"
                onClick={() => {
                  setError(
                    "Fitur reset password akan segera tersedia."
                  );
                }}
                disabled={loading}
              >
                Forgot Password?
              </button>
            </div>

            {/* ===================================================
                ERROR MESSAGE
            =================================================== */}

            {error && (
              <div className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-center text-[9px] leading-4 text-red-400">
                {error}
              </div>
            )}

            {/* ===================================================
                LOGIN BUTTON
            =================================================== */}

            <button
              type="submit"
              disabled={loading}
              className="btn-lime h-8 w-full text-[10px] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "MEMPROSES..." : "LOGIN ↪"}
            </button>

            {/* =====================================================
    CEK STATUS REGISTRASI
===================================================== */}

            <button
              type="button"
              onClick={() => navigate("/cek-status")}
              className="mt-3 w-full text-center text-[9px] text-[#aaa6b4] transition hover:text-[#b6ff00]"
              disabled={loading}
            >
              Belum bisa login? Cek status registrasi →
            </button>
          </form>

          {/* =====================================================
    SECURITY INFO
===================================================== */}

          <div className="my-4 border-t border-[#343238] pt-3 text-center font-mono text-[8px] text-[#6e6b75]">
            🔒 End-to-End Encrypted Connection
          </div>

          {/* =====================================================
              REGISTER
          ===================================================== */}

          <button
            type="button"
            onClick={() => navigate("/register")}
            className="w-full text-[9px] text-[#d2cde0]"
            disabled={loading}
          >
            Do you not have an account?
          </button>
        </div>

        {/* =======================================================
            AUTHORIZED NODE
        ======================================================= */}

        <div className="fixed bottom-4 right-5 rounded-full border border-[#26252b] bg-[#18181b] px-3 py-2 font-mono text-[7px] text-[#817d88]">
          AUTHORIZED NODE
          <br />
          <span className="text-[#aaa6b3]">
            Universitas Global
          </span>
        </div>
      </section>
    </div>
  );
}