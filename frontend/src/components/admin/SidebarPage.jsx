export function PageTitle({title, subtitle, action}) {
  return (
    <div className="mb-5 flex items-end justify-between">
      <div><h1 className="text-2xl font-semibold tracking-tight">{title}</h1>{subtitle && <p className="mt-1 text-xs text-[#aaa6b4]">{subtitle}</p>}</div>
      {action}
    </div>
  );
}
export function StatCard({label,value,detail,accent="lime"}) {
  return (
    <div className="dvms-card relative overflow-hidden p-3.5">
      <div className="text-[10px] uppercase tracking-wide text-[#aaa6b4]">{label}</div>
      <div className="mt-2 flex items-end gap-2"><span className="text-3xl font-semibold">{value}</span>{detail && <span className={`mb-1 text-[9px] ${accent==="red" ? "text-[#ff9999]" : "text-dvms-lime"}`}>{detail}</span>}</div>
    </div>
  );
}
export function StatusPill({children,type="lime"}) {
  const c = {lime:"bg-dvms-lime/15 text-dvms-lime", blue:"bg-blue-500/15 text-blue-300", red:"bg-red-500/15 text-red-300", gray:"bg-slate-500/20 text-slate-300", green:"bg-emerald-500/15 text-emerald-300"}[type] || "";
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-medium ${c}`}>{children}</span>;
}
