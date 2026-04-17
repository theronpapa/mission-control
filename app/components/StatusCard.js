"use client";

export default function StatusCard({ title, value, subtitle, icon, color = "indigo", progress }) {
  const colorMap = {
    indigo: { bg: "bg-indigo-500/10", text: "text-indigo-400", bar: "bg-indigo-500" },
    green: { bg: "bg-emerald-500/10", text: "text-emerald-400", bar: "bg-emerald-500" },
    amber: { bg: "bg-amber-500/10", text: "text-amber-400", bar: "bg-amber-500" },
    rose: { bg: "bg-rose-500/10", text: "text-rose-400", bar: "bg-rose-500" },
  };

  const c = colorMap[color] || colorMap.indigo;

  return (
    <div className="glass rounded-2xl p-5 animate-slide-in hover:animate-pulse-glow transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm text-slate-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-2.5 rounded-xl ${c.bg}`}>
          <svg className={`w-5 h-5 ${c.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
          </svg>
        </div>
      </div>
      {progress !== undefined && (
        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">Progress</span>
            <span className={c.text}>{progress}%</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className={`h-full ${c.bar} rounded-full animate-progress-fill`} style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}
