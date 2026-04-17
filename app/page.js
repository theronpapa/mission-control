"use client";

import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import StatusCard from "./components/StatusCard";
import PipelineStrip from "./components/PipelineStrip";
import LeadsPanel from "./components/LeadsPanel";
import EmailPanel from "./components/EmailPanel";
import QRPanel from "./components/QRPanel";
import VideoPanel from "./components/VideoPanel";
import BossReport from "./components/BossReport";

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState({
    leads: 0,
    emailProgress: 0,
    followups: 0,
    registrations: 0,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/report");
        const data = await res.json();
        setStats({
          leads: data.totalLeads || 0,
          emailProgress: data.emailsSent ? Math.round((data.emailsSent / Math.max(data.totalLeads, 1)) * 100) : 0,
          followups: data.followups || 0,
          registrations: data.registrations || 0,
        });
      } catch {
        /* ignore */
      }
    }
    loadStats();
  }, []);

  const tabMap = {
    leads: "leads",
    email: "email",
    followup: "email",
    qr: "qr",
    video: "video",
  };

  function handleStageClick(stageId) {
    setActiveTab(tabMap[stageId] || stageId);
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
        {activeTab === "dashboard" && (
          <div className="space-y-6 animate-slide-in">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>
                Mission Control
              </h1>
              <p className="text-slate-400 mt-1">Exhibition outreach pipeline overview</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatusCard
                title="Lead Scraper"
                value={stats.leads}
                subtitle="Total leads collected"
                icon="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                color="indigo"
                progress={stats.leads > 0 ? 100 : 0}
              />
              <StatusCard
                title="Email Outreach"
                value={`${stats.emailProgress}%`}
                subtitle="Campaign completion"
                icon="M3 8l7.89 5.26a2 2 0 002.22 0L21 8"
                color="green"
                progress={stats.emailProgress}
              />
              <StatusCard
                title="Follow-ups"
                value={stats.followups}
                subtitle="Follow-up emails sent"
                icon="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                color="amber"
              />
              <StatusCard
                title="Registrations"
                value={stats.registrations}
                subtitle="Exhibitors registered"
                icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                color="rose"
              />
            </div>

            <PipelineStrip activeStage="leads" onStageClick={handleStageClick} />

            <div className="glass rounded-2xl p-5">
              <h3 className="text-sm font-medium text-slate-300 mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { label: "Scrape Leads", tab: "leads", color: "from-indigo-500 to-indigo-600" },
                  { label: "Send Emails", tab: "email", color: "from-purple-500 to-purple-600" },
                  { label: "Follow Up", tab: "email", color: "from-amber-500 to-amber-600" },
                  { label: "Register", tab: "qr", color: "from-emerald-500 to-emerald-600" },
                  { label: "Gen Video", tab: "video", color: "from-rose-500 to-rose-600" },
                  { label: "Boss Report", tab: "report", color: "from-cyan-500 to-cyan-600" },
                ].map((action) => (
                  <button
                    key={action.label}
                    onClick={() => setActiveTab(action.tab)}
                    className={`p-3 rounded-xl bg-gradient-to-br ${action.color} text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-lg`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "leads" && <LeadsPanel />}
        {activeTab === "email" && <EmailPanel />}
        {activeTab === "qr" && <QRPanel />}
        {activeTab === "video" && <VideoPanel />}
        {activeTab === "report" && <BossReport />}
      </main>
    </div>
  );
}
