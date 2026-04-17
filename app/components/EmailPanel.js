"use client";

import { useState, useEffect } from "react";

export default function EmailPanel() {
  const [stats, setStats] = useState({ sent: 0, opened: 0, replied: 0, bounced: 0, followups: 0 });
  const [sending, setSending] = useState(false);
  const [followingUp, setFollowingUp] = useState(false);

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
    try {
      await fetch("/api/email/send", { method: "POST" });
      await fetchStats();
    } catch {
      /* ignore */
    }
    setSending(false);
  }

  async function sendFollowups() {
    setFollowingUp(true);
    try {
      await fetch("/api/email/followup", { method: "POST" });
      await fetchStats();
    } catch {
      /* ignore */
    }
    setFollowingUp(false);
  }

  const statItems = [
    { label: "Sent", value: stats.sent, color: "text-indigo-400" },
    { label: "Opened", value: stats.opened, color: "text-emerald-400" },
    { label: "Replied", value: stats.replied, color: "text-amber-400" },
    { label: "Bounced", value: stats.bounced, color: "text-rose-400" },
    { label: "Follow-ups", value: stats.followups, color: "text-purple-400" },
  ];

  return (
    <div className="space-y-4 animate-slide-in">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>Email Outreach</h2>
          <p className="text-sm text-slate-400">Maton-powered campaign management</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={sendCampaign}
            disabled={sending}
            className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {sending ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending...</>
            ) : "Send Campaign"}
          </button>
          <button
            onClick={sendFollowups}
            disabled={followingUp}
            className="px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {followingUp ? (
              <><div className="w-4 h-4 border-2 border-purple-300/30 border-t-purple-300 rounded-full animate-spin" />Sending...</>
            ) : "Send Follow-ups"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {statItems.map((item) => (
          <div key={item.label} className="glass rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${item.color}`} style={{ fontFamily: "var(--font-outfit)" }}>{item.value}</p>
            <p className="text-xs text-slate-400 mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-5">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Email Template Preview</h3>
        <div className="bg-white/[0.02] rounded-xl p-4 border border-white/5">
          <p className="text-sm text-slate-300 mb-2"><strong className="text-white">Subject:</strong> Exclusive Invitation - Exhibition Booth Registration</p>
          <div className="text-xs text-slate-400 space-y-2 leading-relaxed">
            <p>Dear {"{{company_name}}"},</p>
            <p>We are pleased to invite you to participate in our upcoming exhibition. As a leader in {"{{industry}}"}, your presence would be invaluable.</p>
            <p>Secure your booth today and gain access to 500+ qualified buyers in the Malaysian market.</p>
            <p>Click below to register and receive your unique QR code for instant check-in.</p>
            <p className="text-indigo-400">[Register Now Button]</p>
          </div>
        </div>
      </div>
    </div>
  );
}
