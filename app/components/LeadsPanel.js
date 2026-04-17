"use client";

import { useState, useEffect } from "react";

export default function LeadsPanel() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
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

  async function runScraper() {
    setScraping(true);
    try {
      await fetch("/api/scrape", { method: "POST" });
      await fetchLeads();
    } catch {
      /* ignore */
    }
    setScraping(false);
  }

  const filtered = filter
    ? leads.filter((l) => l.industry?.toLowerCase().includes(filter.toLowerCase()))
    : leads;

  const statusColor = {
    new: "text-indigo-400 bg-indigo-400/10",
    contacted: "text-amber-400 bg-amber-400/10",
    registered: "text-emerald-400 bg-emerald-400/10",
  };

  return (
    <div className="space-y-4 animate-slide-in">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>Lead Scraper</h2>
          <p className="text-sm text-slate-400">{leads.length} leads collected</p>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Filter by industry..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
          />
          <button
            onClick={runScraper}
            disabled={scraping}
            className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {scraping ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Scraping...
              </>
            ) : (
              "Run Scraper"
            )}
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
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Industry</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">Loading leads...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">No leads found. Run the scraper to get started.</td></tr>
              ) : (
                filtered.map((lead, i) => (
                  <tr key={lead.id || i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 text-sm text-white font-medium">{lead.company}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">{lead.email}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">{lead.industry}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${statusColor[lead.status] || "text-slate-400 bg-slate-400/10"}`}>
                        {lead.status || "new"}
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
