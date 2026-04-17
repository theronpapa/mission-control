"use client";

import { useState, useEffect } from "react";

export default function BossReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, []);

  async function fetchReport() {
    setLoading(true);
    try {
      const res = await fetch("/api/report");
      const data = await res.json();
      setReport(data);
    } catch {
      /* ignore */
    }
    setLoading(false);
  }

  function exportCSV() {
    if (!report) return;
    const rows = [
      ["Metric", "Value"],
      ["Total Leads", report.totalLeads],
      ["Emails Sent", report.emailsSent],
      ["Response Rate", `${report.responseRate}%`],
      ["Registrations", report.registrations],
      ["Cost Per Lead (RM)", report.costPerLead],
      ["Campaign Cost (RM)", report.campaignCost],
      ["Registration Revenue (RM)", report.registrationRevenue],
      ["Net ROI (RM)", report.netROI],
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "boss-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!report) return <p className="text-slate-500 text-center py-20">Failed to load report.</p>;

  const funnelStages = [
    { label: "Leads", value: report.totalLeads, width: "100%" },
    { label: "Emailed", value: report.emailsSent, width: `${(report.emailsSent / Math.max(report.totalLeads, 1)) * 100}%` },
    { label: "Responded", value: Math.round(report.emailsSent * report.responseRate / 100), width: `${report.responseRate}%` },
    { label: "Registered", value: report.registrations, width: `${(report.registrations / Math.max(report.totalLeads, 1)) * 100}%` },
  ];

  return (
    <div className="space-y-4 animate-slide-in">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>Boss Report</h2>
          <p className="text-sm text-slate-400">Executive summary - all figures in RM (Malaysian Ringgit)</p>
        </div>
        <button
          onClick={exportCSV}
          className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-sm font-medium transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Leads", value: report.totalLeads, color: "text-indigo-400" },
          { label: "Emails Sent", value: report.emailsSent, color: "text-purple-400" },
          { label: "Response Rate", value: `${report.responseRate}%`, color: "text-amber-400" },
          { label: "Registrations", value: report.registrations, color: "text-emerald-400" },
        ].map((item) => (
          <div key={item.label} className="glass rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${item.color}`} style={{ fontFamily: "var(--font-outfit)" }}>{item.value}</p>
            <p className="text-xs text-slate-400 mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-medium text-slate-300 mb-4">Conversion Funnel</h3>
          <div className="space-y-3">
            {funnelStages.map((stage) => (
              <div key={stage.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">{stage.label}</span>
                  <span className="text-white font-medium">{stage.value}</span>
                </div>
                <div className="h-6 bg-white/5 rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg animate-progress-fill flex items-center justify-end px-2"
                    style={{ width: stage.width }}
                  >
                    <span className="text-[10px] text-white/80 font-medium">{stage.width}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-medium text-slate-300 mb-4">Cost Breakdown (RM)</h3>
          <div className="space-y-3">
            {[
              { label: "Cost Per Lead", value: `RM ${report.costPerLead}`, color: "text-indigo-400" },
              { label: "Campaign Cost", value: `RM ${report.campaignCost}`, color: "text-amber-400" },
              { label: "Registration Revenue", value: `RM ${report.registrationRevenue}`, color: "text-emerald-400" },
              { label: "Net ROI", value: `RM ${report.netROI}`, color: report.netROI >= 0 ? "text-emerald-400" : "text-rose-400" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-sm text-slate-400">{item.label}</span>
                <span className={`text-sm font-bold ${item.color}`} style={{ fontFamily: "var(--font-outfit)" }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
