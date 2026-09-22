import { useEffect, useRef, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Settings,
  Bell,
  CircleHelp,
  LogOut,
  ChevronDown,
} from "lucide-react";

import { supabase } from "../../lib/supabase";

export default function SuperAdminLayout() {
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Menutup dropdown ketika klik di luar area profile
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Logout
  const handleLogout = async () => {
    const confirmed = window.confirm(
      "Apakah Anda yakin ingin keluar dari akun Super Admin?"
    );

    if (!confirmed) {
      return;
    }

    setProfileOpen(false);

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout gagal:", error);

      window.alert(
        "Logout gagal. Silakan coba lagi."
      );

      return;
    }

    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      {/* SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[130px] border-r border-[#29282f] bg-[#151517] sm:block">
        {/* LOGO / BRAND */}
        <div className="px-4 py-3">
          <div className="text-sm font-semibold">
            DVMS Admin
          </div>

          <div className="text-[9px] text-[#a7a3b0]">
            Global Dashboard
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="mt-5 space-y-1 px-3">
          {/* DASHBOARD */}
          <NavLink
            end
            to="/dashboardSuperAdmin"
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-md px-2 py-2 text-[10px] ${isActive
                ? "bg-dvms-purple text-white"
                : "text-[#c4c0cc] hover:bg-[#202024] hover:text-white"
              }`
            }
          >
            <LayoutDashboard size={13} />
            Dashboard
          </NavLink>

          {/* MANAJEMEN INSTANSI */}
          <NavLink
            to="/dashboardSuperAdmin/institutions"
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-md px-2 py-2 text-[10px] ${isActive
                ? "bg-dvms-purple text-white"
                : "text-[#c4c0cc] hover:bg-[#202024] hover:text-white"
              }`
            }
          >
            <Building2 size={13} />
            Manajemen Instansi
          </NavLink>

          {/* SETTINGS */}
          {/* <button
            type="button"
            className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-[10px] text-[#c4c0cc] hover:bg-[#202024] hover:text-white"
          >
            <Settings size={13} />
            Settings
          </button> */}
        </nav>

        {/* ADD NEW INSTANCE */}
        {/* <button
          type="button"
          className="absolute bottom-4 left-4 right-4 rounded-md bg-dvms-purple py-2 text-[9px] font-medium text-white transition hover:opacity-90"
        >
          Add New Instance
        </button> */}
      </aside>

      {/* MAIN CONTENT */}
      <div className="sm:pl-[130px]">
        {/* HEADER */}
        <header className="flex h-[45px] items-center gap-4 border-b border-[#29282f] px-4">
          {/* SEARCH */}
          <div className="flex h-7 w-[260px] items-center rounded-full border border-[#3a3842] bg-[#151517] px-3 text-[10px] text-[#7f7b87]">
            ⌕ Search No. Ijazah or Name...
          </div>

          {/* HEADER RIGHT */}
          <div className="ml-auto flex items-center gap-5 text-[#c5c2ce]">
            {/* NOTIFICATION */}
            <button
              type="button"
              className="transition hover:text-white"
              title="Notifikasi"
            >
              <Bell size={13} />
            </button>

            {/* HELP */}
            <button
              type="button"
              className="transition hover:text-white"
              title="Bantuan"
            >
              <CircleHelp size={13} />
            </button>

            {/* PROFILE */}
            <div
              ref={profileRef}
              className="relative"
            >
              <button
                type="button"
                onClick={() =>
                  setProfileOpen((prev) => !prev)
                }
                className="flex items-center gap-1.5 text-[10px] text-[#c5c2ce] transition hover:text-white"
              >
                <span>◉</span>

                <span>Super Admin</span>

                <ChevronDown
                  size={11}
                  className={`transition-transform duration-200 ${profileOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              {/* PROFILE DROPDOWN */}
              {profileOpen && (
                <div className="absolute right-0 top-7 z-50 w-[150px] overflow-hidden rounded-lg border border-[#302e37] bg-[#19191c] shadow-xl">
                  {/* USER INFO */}
                  <div className="border-b border-[#302e37] px-3 py-2.5">
                    <div className="text-[10px] font-medium text-white">
                      Super Admin
                    </div>

                    <div className="mt-0.5 text-[8px] text-[#85818e]">
                      Administrator Sistem
                    </div>
                  </div>

                  {/* LOGOUT */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[10px] text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
                  >
                    <LogOut size={13} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="min-h-[calc(100vh-45px)] p-4 md:p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}