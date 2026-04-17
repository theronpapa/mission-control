"use client";

import { useState, useEffect } from "react";

export default function LeadsPanel() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetchLeads();
  }, []);

  async function fetchLeads() {
    setLoading(true);
    try {
      const res = await fetch("/api/leads");
      const data = await res.json();
      setLeads(data.leads || []);
    } catch {
      /* ignore */
    }
    setLoading(false);
  }

  const filtered = filter
    ? leads.filter(
        (l) =>
          l.Category?.toLowerCase().includes(filter.toLowerCase()) ||
          l.Company?.toLowerCase().includes(filter.toLowerCase()) ||
          l.Location?.toLowerCase().includes(filter.toLowerCase())
      )
    : leads;

  const stageColor = {
    NEW: "text-slate-400 bg-slate-400/10",
    CONTACTED: "text-indigo-400 bg-indigo-400/10",
    REPLIED: "text-emerald-400 bg-emerald-400/10",
    REGISTERED: "text-amber-400 bg-amber-400/10",
    BOOTH_CONFIRMED: "text-green-400 bg-green-400/10",
    NO_REPLY: "text-rose-400 bg-rose-400/10",
    NOT_INTERESTED: "text-slate-500 bg-slate-500/10",
  };

  return (
    <div className="space-y-4 animate-slide-in">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>Contacts</h2>
          <p className="text-sm text-slate-400">{leads.length} verified contacts from Google Sheet</p>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Filter by company, category, location..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 w-72"
          />
          <button
            onClick={fetchLeads}
            className="px-4 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-sm font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Company</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Loading contacts...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No contacts found.</td></tr>
              ) : (
                filtered.map((lead, i) => (
                  <tr key={lead.ID || i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 text-sm text-white font-medium">{lead.Company}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">{lead.Email}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">{lead.Category}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">{lead.Location}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${stageColor[lead["Pipeline Stage"]] || stageColor.NEW}`}>
                        {lead["Pipeline Stage"] || "NEW"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
