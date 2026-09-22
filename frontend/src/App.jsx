import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { checkBackendHealth } from "./services/api";

import PublicLayout from "./components/layout/PublicLayout";
import AdminLayout from "./components/layout/AdminLayout";
import SuperAdminLayout from "./components/layout/SuperAdminLayout";
import ProtectedRoute from "./pages/auth/ProtectedRoute";

import VerificationHome from "./pages/public/VerificationHome";
import VerificationResult from "./pages/public/VerificationResult";

import Login from "./pages/auth/Login";
import RegisterWizard from "./pages/auth/RegisterWizard";

import AdminDashboard from "./pages/admin/Dashboard";
import AlumniManagement from "./pages/admin/AlumniManagement";
import DiplomaManagement from "./pages/admin/DiplomaManagement";
import DiplomaOCR from "./pages/admin/DiplomaOCR";
import Web3Anchoring from "./pages/admin/Web3Anchoring";

import SuperDashboard from "./pages/superadmin/SuperDashboard";
import InstitutionManagement from "./pages/superadmin/InstitutionManagement";

import CekStatus from "./pages/public/CekStatus";

export default function App() {
  useEffect(() => {
    checkBackendHealth()
      .then((data) => {
        console.log("DVMS Backend:", data);
      })
      .catch((error) => {
        console.error("DVMS Backend Error:", error);
      });
  }, []);
  return (
    <Routes>

      {/* =========================================================
          PUBLIC ROUTES
      ========================================================== */}

      <Route path="/cek-status" element={<CekStatus />} />

      <Route element={<PublicLayout />}>
        <Route
          path="/"
          element={<VerificationHome />}
        />

        <Route
          path="/verify"
          element={<VerificationHome />}
        />

        <Route
          path="/verify/result"
          element={<VerificationResult valid />}
        />

        <Route
          path="/verify/not-found"
          element={<VerificationResult valid={false} />}
        />
      </Route>


      {/* =========================================================
          AUTH
      ========================================================== */}
      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<RegisterWizard />}
      />


      {/* =========================================================
          ADMIN ROUTES
          Hanya role: admin
      ========================================================== */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route element={<AdminLayout />}>
          <Route path="/dashboardAdmin" element={<AdminDashboard />} />
          <Route
            path="/dashboardAdmin/alumni"
            element={<AlumniManagement />}
          />
          <Route
            path="/dashboardAdmin/diplomas"
            element={<DiplomaManagement />}
          />
          <Route
            path="/dashboardAdmin/diplomas/ocr"
            element={<DiplomaOCR />}
          />
          <Route
            path="/dashboardAdmin/anchoring"
            element={<Web3Anchoring />}
          />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["superadmin"]} />}>
        <Route element={<SuperAdminLayout />}>
          <Route
            path="/dashboardSuperAdmin"
            element={<SuperDashboard />}
          />
          <Route
            path="/dashboardSuperAdmin/institutions"
            element={<InstitutionManagement />}
          />
        </Route>
      </Route>
      {/* =========================================================
          FALLBACK
      ========================================================== */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>

  );


}