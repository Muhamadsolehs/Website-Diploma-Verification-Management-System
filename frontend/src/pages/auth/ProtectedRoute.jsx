import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ allowedRoles }) {
    const { user, profile, role, loading } = useAuth();
    const location = useLocation();

    // Tunggu AuthContext selesai membaca session
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#111111] text-white">
                <div className="text-center">
                    <div className="text-sm font-semibold text-[#dddbe2]">
                        DVMS
                    </div>

                    <div className="mt-1 text-[10px] text-[#777481]">
                        Checking authentication...
                    </div>
                </div>
            </div>
        );
    }

    // Belum login
    if (
        role !== "superadmin" &&
        profile &&
        profile.account_status !== "active"
    ) {
        return (
            <Navigate
                to="/login"
                replace
                state={{
                    message:
                        profile.account_status === "pending"
                            ? "Akun Anda masih dalam tahap verifikasi."
                            : profile.account_status === "rejected"
                                ? "Pendaftaran akun Anda ditolak."
                                : "Akun Anda belum aktif.",
                }}
            />
        );
    }

    // Role tidak diizinkan
    if (allowedRoles && !allowedRoles.includes(role)) {
        // Superadmin diarahkan ke dashboard superadmin
        if (role === "superadmin") {
            return <Navigate to="/superadmin" replace />;
        }

        // Admin diarahkan ke dashboard admin
        if (role === "admin") {
            return <Navigate to="/dashboardAdmin" replace />;
        }

        // Role tidak dikenal
        return <Navigate to="/login" replace />;
    }

    // User memiliki akses
    return <Outlet />;
}