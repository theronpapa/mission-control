"use client";

const stages = [
  { id: "leads", label: "Contacts", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857" },
  { id: "email", label: "Email", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8" },
  { id: "pipeline", label: "Pipeline", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" },
  { id: "qr", label: "Register", icon: "M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01" },
  { id: "video", label: "Video", icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14" },
];

export default function PipelineStrip({ activeStage, onStageClick }) {
  const activeIdx = stages.findIndex((s) => s.id === activeStage);

  return (
    <div className="glass rounded-2xl p-4 flex items-center justify-between gap-2 overflow-x-auto">
      {stages.map((stage, i) => (
        <div key={stage.id} className="flex items-center gap-2 flex-1 min-w-0">
          <button
            onClick={() => onStageClick(stage.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 whitespace-nowrap ${
              i <= activeIdx
                ? "bg-indigo-500/15 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
                : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
            }`}
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={stage.icon} />
            </svg>
            <span className="text-sm font-medium">{stage.label}</span>
          </button>
          {i < stages.length - 1 && (
            <svg className={`w-4 h-4 shrink-0 ${i < activeIdx ? "text-indigo-500" : "text-slate-700"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}
