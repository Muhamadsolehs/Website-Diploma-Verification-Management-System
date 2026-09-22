import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    /**
     * Mengambil profile user dari tabel public.profiles
     */
    const fetchProfile = async (userId) => {
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .maybeSingle();

        if (error) {
            console.error("Gagal mengambil profile:", error);
            setProfile(null);
            return null;
        }

        setProfile(data);
        return data;
    };

    /**
     * Mengecek session saat aplikasi pertama kali dibuka
     */
    useEffect(() => {
        let mounted = true;

        const initializeAuth = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (!mounted) return;

            if (session?.user) {
                setUser(session.user);
                await fetchProfile(session.user.id);
            } else {
                setUser(null);
                setProfile(null);
            }

            setLoading(false);
        };

        initializeAuth();

        /**
         * Mendengarkan perubahan login/logout
         */
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;

            if (session?.user) {
                setUser(session.user);

                await fetchProfile(session.user.id);
            } else {
                setUser(null);
                setProfile(null);
            }

            setLoading(false);
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    /**
     * Login dengan email + password
     */
    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return {
                success: false,
                error: "Email atau password salah.",
            };
        }

        if (!data.user) {
            return {
                success: false,
                error: "User tidak ditemukan.",
            };
        }

        const currentProfile = await fetchProfile(data.user.id);

        if (!currentProfile) {
            await supabase.auth.signOut();

            return {
                success: false,
                error: "Profil akun tidak ditemukan.",
            };
        }

        // Superadmin boleh langsung masuk.
        if (currentProfile.role === "superadmin") {
            setUser(data.user);

            return {
                success: true,
                user: data.user,
            };
        }

        // Admin/verifier hanya boleh masuk jika akun sudah aktif.
        if (currentProfile.account_status !== "active") {
            await supabase.auth.signOut();

            setUser(null);
            setProfile(null);

            if (currentProfile.account_status === "pending") {
                return {
                    success: false,
                    error:
                        "Akun Anda masih dalam tahap verifikasi. Silakan tunggu persetujuan Superadmin.",
                };
            }

            if (currentProfile.account_status === "rejected") {
                return {
                    success: false,
                    error:
                        "Pendaftaran akun Anda ditolak. Silakan hubungi Superadmin untuk informasi lebih lanjut.",
                };
            }

            return {
                success: false,
                error:
                    "Akun Anda belum aktif. Silakan tunggu proses verifikasi.",
            };
        }

        setUser(data.user);
        setProfile(currentProfile);

        return {
            success: true,
            user: data.user,
        };
    };

    /**
     * Registrasi user
     */
    const signUp = async ({ email, password, fullName, nip }) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    nip: nip,
                },
            },
        });

        if (error) {
            return {
                success: false,
                error: error.message,
            };
        }

        return {
            success: true,
            user: data.user,
        };
    };

    /**
     * Logout
     */
    const signOut = async () => {
        const { error } = await supabase.auth.signOut();

        if (error) {
            return {
                success: false,
                error: error.message,
            };
        }

        setUser(null);
        setProfile(null);

        return {
            success: true,
        };
    };

    /**
     * Role user
     *
     * Contoh:
     * profile.role = "admin"
     * profile.role = "superadmin"
     */
    const role = profile?.role || null;

    const value = {
        user,
        profile,
        role,
        loading,
        signIn,
        signUp,
        signOut,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Hook untuk menggunakan AuthContext
 */
export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth harus digunakan di dalam AuthProvider");
    }

    return context;
}