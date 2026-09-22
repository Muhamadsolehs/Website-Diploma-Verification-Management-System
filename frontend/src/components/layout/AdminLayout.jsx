import {
  Outlet,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  Bell,
  CircleHelp,
  LayoutDashboard,
  UsersRound,
  FileText,
  Blocks,
  Settings,
  LogOut,
  Upload,
  Building2,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

const nav = [
  {
    to: "/dashboardAdmin",
    label: "Dashboard",
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: "/dashboardAdmin/alumni",
    label: "Alumni Management",
    icon: UsersRound,
  },
  {
    to: "/dashboardAdmin/diplomas",
    label: "Diploma Management",
    icon: FileText,
  },
  {
    to: "/dashboardAdmin/anchoring",
    label: "Web3 Anchoring",
    icon: Blocks,
  },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const { signOut } = useAuth();

  const handleLogout = async () => {
    const confirmed = window.confirm(
      "Apakah Anda yakin ingin keluar dari akun DVMS?"
    );

    if (!confirmed) {
      return;
    }

    await signOut();

    navigate("/login", {
      replace: true,
    });
  };
  return (
    <div className="min-h-screen bg-[#111111] text-white">

      {/* =========================================================
          SIDEBAR
      ========================================================== */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[195px] border-r border-[#2b2a31] bg-[#151517] md:block">

        {/* LOGO */}
        <div className="flex h-16 items-center gap-3 border-b border-transparent px-5">

          <div className="grid h-8 w-8 place-items-center rounded-md border border-[#44414f] bg-[#19191e] text-dvms-lime">
            <Building2 size={16} />
          </div>

          <div>
            <div className="text-lg font-semibold">
              DVMS
            </div>

            <div className="text-[10px] text-[#aaa6b5]">
              Diploma Verification S
            </div>
          </div>

        </div>

        {/* NAVIGATION */}
        <nav className="mt-2 space-y-1 px-3">

          {nav.map(
            ({
              to,
              label,
              icon: Icon,
              end,
            }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex h-9 items-center gap-3 rounded-md px-3 text-xs ${isActive
                    ? "bg-dvms-purple text-white shadow-glow"
                    : "text-[#c5c1d0] hover:bg-[#202026]"
                  }`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            )
          )}

        </nav>

        {/* BOTTOM MENU */}
        <div className="absolute bottom-5 left-3 right-3 space-y-3">

          {/* SETTINGS */}
          <button
            type="button"
            className="flex w-full items-center gap-3 px-3 text-xs text-[#c5c1d0]"
          >
            <Settings size={16} />
            Settings
          </button>

          {/* UPLOAD DIPLOMA */}
          <NavLink
            to="/dashboardAdmin/diplomas/ocr"
            className="btn-lime h-9 w-full text-[11px]"
          >
            <Upload size={14} />
            Unggah Ijazah Baru
          </NavLink>

          {/* LOGOUT */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 text-xs text-[#ffaaa9]"
          >
            <LogOut size={16} />
            Logout
          </button>

        </div>

      </aside>

      {/* =========================================================
          MAIN AREA
      ========================================================== */}
      <div className="md:pl-[195px]">

        {/* HEADER */}
        <header className="sticky top-0 z-10 flex h-[54px] items-center gap-4 border-b border-[#29282f] bg-[#111111]/95 px-4 backdrop-blur">

          {/* SEARCH */}
          <div className="flex h-8 max-w-[310px] flex-1 items-center rounded-full border border-[#393740] bg-[#151517] px-3 text-xs text-[#777481]">
            Search No. Ijazah or Name...
          </div>

          {/* HEADER RIGHT */}
          <div className="ml-auto flex items-center gap-5 text-[#c5c2ce]">

            <Bell size={16} />

            <CircleHelp size={16} />

            <span className="h-6 w-px bg-[#39373e]" />

            <div className="flex items-center gap-2 text-xs">

              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#2d405d] to-[#151515]" />

              <span>
                Admin⌄
              </span>

            </div>

          </div>

        </header>

        {/* CONTENT */}
        <main className="min-h-[calc(100vh-54px)] p-4 md:p-6">
          <Outlet />
        </main>

      </div>

    </div>
  );
}