"use client";

import { useState, useEffect } from "react";

export default function QRPanel() {
  const [registrations, setRegistrations] = useState([]);
  const [form, setForm] = useState({ company: "", email: "", phone: "", booth: "" });
  const [registering, setRegistering] = useState(false);
  const [lastQR, setLastQR] = useState(null);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  async function fetchRegistrations() {
    try {
      const res = await fetch("/api/register");
      const data = await res.json();
      setRegistrations(data.registrations || []);
    } catch {
      /* ignore */
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setRegistering(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setLastQR(data.qrCode);
      setForm({ company: "", email: "", phone: "", booth: "" });
      await fetchRegistrations();
    } catch {
      /* ignore */
    }
    setRegistering(false);
  }

  return (
    <div className="space-y-4 animate-slide-in">
      <h2 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>QR Registration System</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-medium text-slate-300 mb-4">Register Exhibitor</h3>
          <form onSubmit={handleRegister} className="space-y-3">
            {[
              { key: "company", label: "Company Name", type: "text" },
              { key: "email", label: "Email", type: "email" },
              { key: "phone", label: "Phone", type: "tel" },
              { key: "booth", label: "Booth Number", type: "text" },
            ].map((field) => (
              <div key={field.key}>
                <label className="text-xs text-slate-400 mb-1 block">{field.label}</label>
                <input
                  type={field.type}
                  value={form[field.key]}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                />
              </div>
            ))}
            <button
              type="submit"
              disabled={registering}
              className="w-full px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              {registering ? "Registering..." : "Register & Generate QR"}
            </button>
          </form>

          {lastQR && (
            <div className="mt-4 p-4 bg-white rounded-xl flex flex-col items-center">
              <img src={lastQR} alt="QR Code" className="w-48 h-48" />
              <a href={lastQR} download="qr-code.png" className="mt-2 text-xs text-indigo-600 hover:underline">Download QR</a>
            </div>
          )}
        </div>

        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-medium text-slate-300 mb-4">Registered Exhibitors ({registrations.length})</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {registrations.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No registrations yet.</p>
            ) : (
              registrations.map((reg, i) => (
                <div key={reg.id || i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  {reg.qrCode && <img src={reg.qrCode} alt="QR" className="w-10 h-10 rounded bg-white p-0.5" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{reg.company}</p>
                    <p className="text-xs text-slate-400">{reg.email} | Booth {reg.booth}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
