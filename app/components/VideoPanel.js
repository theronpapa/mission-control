"use client";

import { useState } from "react";

const niches = [
  "Technology & Electronics",
  "Food & Beverage",
  "Automotive",
  "Fashion & Textiles",
  "Health & Wellness",
  "Construction & Building",
];

export default function VideoPanel() {
  const [videos, setVideos] = useState([]);
  const [generating, setGenerating] = useState(null);

  async function generateVideo(niche) {
    setGenerating(niche);
    try {
      const res = await fetch("/api/video/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche }),
      });
      const data = await res.json();
      setVideos((prev) => [...prev.filter((v) => v.niche !== niche), { niche, ...data }]);
    } catch {
      /* ignore */
    }
    setGenerating(null);
  }

  const statusStyles = {
    queued: "text-amber-400 bg-amber-400/10",
    generating: "text-indigo-400 bg-indigo-400/10",
    ready: "text-emerald-400 bg-emerald-400/10",
  };

  return (
    <div className="space-y-4 animate-slide-in">
      <div>
        <h2 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>Video Factory</h2>
        <p className="text-sm text-slate-400">Generate exhibition teaser videos by industry niche</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {niches.map((niche) => {
          const video = videos.find((v) => v.niche === niche);
          const isGenerating = generating === niche;

          return (
            <div key={niche} className="glass rounded-2xl p-5 flex flex-col">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-white mb-1">{niche}</h3>
                {video && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusStyles[video.status] || ""}`}>
                    {video.status}
                  </span>
                )}
              </div>

              <div className="mt-4 aspect-video rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center overflow-hidden">
                {video?.status === "ready" ? (
                  <div className="text-center">
                    <svg className="w-12 h-12 text-emerald-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs text-slate-400">Teaser Ready</p>
                  </div>
                ) : isGenerating ? (
                  <div className="text-center">
                    <div className="w-10 h-10 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-xs text-slate-400">Generating...</p>
                  </div>
                ) : (
                  <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </div>

              <button
                onClick={() => generateVideo(niche)}
                disabled={isGenerating}
                className="mt-3 w-full px-3 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isGenerating ? "Generating..." : video?.status === "ready" ? "Regenerate" : "Generate Teaser"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
