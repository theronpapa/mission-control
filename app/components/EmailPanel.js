"use client";

import { useState, useEffect } from "react";

export default function EmailPanel() {
  const [stats, setStats] = useState({ total: 0, stages: {}, sent: 0, followups: 0, replied: 0 });
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const res = await fetch("/api/email/status");
      const data = await res.json();
      setStats(data);
    } catch {
      /* ignore */
    }
  }

  async function sendCampaign() {
    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit }),
      });
      const data = await res.json();
      setSendResult(data);
      await fetchStats();
    } catch (err) {
      setSendResult({ error: err.message });
    }
    setSending(false);
  }

  const statItems = [
    { label: "Total Contacts", value: stats.total, color: "text-slate-300" },
    { label: "Emails Sent", value: stats.sent, color: "text-indigo-400" },
    { label: "Follow-ups Sent", value: stats.followups, color: "text-purple-400" },
    { label: "Replied", value: stats.replied, color: "text-emerald-400" },
    { label: "No Reply", value: stats.noReply || 0, color: "text-rose-400" },
  ];

  return (
    <div className="space-y-4 animate-slide-in">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>Email Outreach</h2>
          <p className="text-sm text-slate-400">Send initial invitations via Gmail</p>
        </div>
        <div className="flex gap-3 items-center">
          <label className="text-xs text-slate-400">Batch size:</label>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-indigo-500/50"
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <button
            onClick={sendCampaign}
            disabled={sending}
            className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {sending ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending...</>
            ) : "Send Campaign"}
          </button>
        </div>
      </div>

      {sendResult && (
        <div className={`glass rounded-xl p-4 border ${sendResult.error ? "border-rose-500/30" : "border-emerald-500/30"}`}>
          {sendResult.error ? (
            <p className="text-sm text-rose-400">{sendResult.error}</p>
          ) : (
            <div className="text-sm text-slate-300">
              <p><span className="text-emerald-400 font-medium">{sendResult.sent}</span> emails sent via Gmail.</p>
              {sendResult.errors && (
                <p className="text-rose-400 mt-1">{sendResult.errors.length} failed: {sendResult.errors.map((e) => e.email).join(", ")}</p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {statItems.map((item) => (
          <div key={item.label} className="glass rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${item.color}`} style={{ fontFamily: "var(--font-outfit)" }}>{item.value}</p>
            <p className="text-xs text-slate-400 mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-5">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Email Sequence Preview</h3>
        <div className="space-y-3">
          {[
            { round: "Initial", subject: "Invitation to Exhibit at AgriMalaysia 2026", day: "Day 0", color: "border-indigo-500/30" },
            { round: "Follow-up 1", subject: "Following up — AgriMalaysia 2026 Exhibition Booth", day: "Day 5", color: "border-purple-500/30" },
            { round: "Follow-up 2", subject: "Last chance — AgriMalaysia 2026 booth spaces filling fast", day: "Day 12", color: "border-amber-500/30" },
            { round: "Follow-up 3", subject: "Final update — AgriMalaysia 2026", day: "Day 20", color: "border-rose-500/30" },
          ].map((e) => (
            <div key={e.round} className={`bg-white/[0.02] rounded-xl p-4 border ${e.color}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white">{e.round}</span>
                <span className="text-xs text-slate-500">{e.day}</span>
              </div>
              <p className="text-sm text-slate-300"><strong className="text-white">Subject:</strong> {e.subject}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
