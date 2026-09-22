import { Outlet, NavLink } from "react-router-dom";

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-[#111111] px-3 py-5 text-white">
      <header className="mx-auto flex h-11 max-w-[850px] items-center justify-between rounded-full border border-[#222229] bg-[#0d0d0f] px-5 shadow-lg">
        <div className="text-[17px] font-semibold tracking-tight">Portal Verifikasi Publik</div>
        <nav className="flex items-center gap-6 text-[11px] text-[#c9c6d2]">
          <NavLink className={({ isActive }) => isActive ? "border-b border-dvms-lime pb-1 text-dvms-lime" : "hover:text-white"} to="/">Beranda</NavLink>
          <a href="#bantuan" className="hover:text-white">Tentang</a>
          <a href="/Login" className="hover:text-white">Login</a>
        </nav>
      </header>
      <Outlet />
    </div>
  );
}
