"use client";

import { useState, useEffect } from "react";

const STAGE_CONFIG = {
  NEW: { label: "New", color: "text-slate-400", bg: "bg-slate-400/10", border: "border-slate-400/20" },
  CONTACTED: { label: "Contacted", color: "text-indigo-400", bg: "bg-indigo-400/10", border: "border-indigo-400/20" },
  REPLIED: { label: "Replied", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
  REGISTERED: { label: "Registered", color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
  BOOTH_CONFIRMED: { label: "Booth Confirmed", color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/20" },
  NO_REPLY: { label: "No Reply", color: "text-rose-400", bg: "bg-rose-400/10", border: "border-rose-400/20" },
  NOT_INTERESTED: { label: "Not Interested", color: "text-slate-500", bg: "bg-slate-500/10", border: "border-slate-500/20" },
};

export default function PipelinePanel() {
  const [data, setData] = useState({ stages: {}, summary: {}, total: 0 });
  const [loading, setLoading] = useState(true);
  const [activeStage, setActiveStage] = useState(null);
  const [checkingReplies, setCheckingReplies] = useState(false);
  const [sendingFollowups, setSendingFollowups] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchPipeline();
  }, []);

  async function fetchPipeline() {
    setLoading(true);
    try {
      const res = await fetch("/api/pipeline");
      const d = await res.json();
      setData(d);
    } catch {
      /* ignore */
    }
    setLoading(false);
  }

  async function checkReplies() {
    setCheckingReplies(true);
    setResult(null);
    try {
      const res = await fetch("/api/email/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "check" }),
      });
      const d = await res.json();
      setResult({ type: "check", ...d });
      await fetchPipeline();
    } catch (err) {
      setResult({ type: "error", message: err.message });
    }
    setCheckingReplies(false);
  }

  async function sendFollowups() {
    setSendingFollowups(true);
    setResult(null);
    try {
      const res = await fetch("/api/email/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send" }),
      });
      const d = await res.json();
      setResult({ type: "followup", ...d });
      await fetchPipeline();
    } catch (err) {
      setResult({ type: "error", message: err.message });
    }
    setSendingFollowups(false);
  }

  async function moveContact(contactId, newStage) {
    try {
      await fetch("/api/pipeline", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId, stage: newStage }),
      });
      await fetchPipeline();
    } catch {
      /* ignore */
    }
  }

  const visibleStages = activeStage ? [activeStage] : Object.keys(STAGE_CONFIG);
  const stageContacts = activeStage && data.stages[activeStage] ? data.stages[activeStage] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-slide-in">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>
            Contact Pipeline
          </h2>
          <p className="text-sm text-slate-400">{data.total} total contacts across all stages</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={checkReplies}
            disabled={checkingReplies}
            className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {checkingReplies ? (
              <><div className="w-4 h-4 border-2 border-emerald-300/30 border-t-emerald-300 rounded-full animate-spin" />Checking...</>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Check Replies
              </>
            )}
          </button>
          <button
            onClick={sendFollowups}
            disabled={sendingFollowups}
            className="px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {sendingFollowups ? (
              <><div className="w-4 h-4 border-2 border-purple-300/30 border-t-purple-300 rounded-full animate-spin" />Sending...</>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                Send Follow-ups
              </>
            )}
          </button>
        </div>
      </div>

      {result && (
        <div className={`glass rounded-xl p-4 border ${result.type === "error" ? "border-rose-500/30" : "border-emerald-500/30"}`}>
          {result.type === "check" && (
            <p className="text-sm text-slate-300">
              Checked <span className="text-white font-medium">{result.contacted}</span> contacted companies.{" "}
              <span className="text-emerald-400 font-medium">{result.repliedCount}</span> replied.
            </p>
          )}
          {result.type === "followup" && (
            <p className="text-sm text-slate-300">
              <span className="text-emerald-400 font-medium">{result.repliedCount}</span> replies found.{" "}
              <span className="text-purple-400 font-medium">{result.followupsSent}</span> follow-ups sent.
              {result.errors && <span className="text-rose-400"> {result.errors.length} errors.</span>}
            </p>
          )}
          {result.type === "error" && <p className="text-sm text-rose-400">{result.message}</p>}
        </div>
      )}

      {/* Stage summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {Object.entries(STAGE_CONFIG).map(([key, cfg]) => {
          const count = data.summary[key] || 0;
          const isActive = activeStage === key;
          return (
            <button
              key={key}
              onClick={() => setActiveStage(isActive ? null : key)}
              className={`glass rounded-xl p-3 text-center transition-all ${isActive ? `ring-1 ${cfg.border}` : ""} hover:bg-white/[0.03]`}
            >
              <p className={`text-2xl font-bold ${cfg.color}`} style={{ fontFamily: "var(--font-outfit)" }}>
                {count}
              </p>
              <p className="text-xs text-slate-400 mt-1">{cfg.label}</p>
            </button>
          );
        })}
      </div>

      {/* Follow-up schedule info */}
      <div className="glass rounded-2xl p-4">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Follow-up Schedule</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { round: 1, day: 5, label: "Value Add", desc: "Gentle follow-up with exhibition highlights" },
            { round: 2, day: 12, label: "Urgency", desc: "Booth spaces filling fast, early-bird ending" },
            { round: 3, day: 20, label: "Final", desc: "Last message, won't follow up further" },
          ].map((f) => (
            <div key={f.round} className="bg-white/[0.02] rounded-xl p-3 border border-white/5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-purple-400">Round {f.round}</span>
                <span className="text-xs text-slate-500">Day {f.day}</span>
              </div>
              <p className="text-sm text-white font-medium">{f.label}</p>
              <p className="text-xs text-slate-400 mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact table for selected stage */}
      {activeStage && (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-sm font-medium text-white">
              {STAGE_CONFIG[activeStage]?.label} — {stageContacts.length} contacts
            </h3>
            <button onClick={() => setActiveStage(null)} className="text-xs text-slate-400 hover:text-white">
              Show all stages
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Company</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Email Sent</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stageContacts.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No contacts in this stage</td></tr>
                ) : (
                  stageContacts.map((c, i) => (
                    <tr key={c.ID || i} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 text-sm text-white font-medium">{c.Company}</td>
                      <td className="px-4 py-3 text-sm text-slate-300">{c.Email}</td>
                      <td className="px-4 py-3 text-sm text-slate-300">{c.Category}</td>
                      <td className="px-4 py-3 text-sm text-slate-300">{c.Location}</td>
                      <td className="px-4 py-3 text-sm text-slate-400">
                        {c["Email Sent Date"] ? new Date(c["Email Sent Date"]).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={activeStage}
                          onChange={(e) => moveContact(c.ID, e.target.value)}
                          className="text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-slate-300 focus:outline-none focus:border-indigo-500/50"
                        >
                          {Object.entries(STAGE_CONFIG).map(([key, cfg]) => (
                            <option key={key} value={key}>{cfg.label}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
