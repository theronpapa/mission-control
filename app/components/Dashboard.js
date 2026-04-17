'use client';
import { useState, useCallback } from 'react';
import ContactsPanel from './ContactsPanel';
import EmailPanel from './EmailPanel';
import SequencesPanel from './SequencesPanel';
import ABTestPanel from './ABTestPanel';
import WarmupPanel from './WarmupPanel';
import AnalyticsPanel from './AnalyticsPanel';
import SavedSearchesPanel from './SavedSearchesPanel';
import ProspectorPanel from './ProspectorPanel';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1' },
  { id: 'contacts', label: 'Contacts', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { id: 'email', label: 'Send Email', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { id: 'sequences', label: 'Sequences', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
  { id: 'abtest', label: 'A/B Tests', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { id: 'warmup', label: 'Email Warmup', icon: 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z' },
  { id: 'prospector', label: 'Prospector', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
  { id: 'saved', label: 'Smart Lists', icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' },
];

export default function Dashboard() {
  const [activePage, setActivePage] = useState('dashboard');
  const [toast, setToast] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const onDataChange = useCallback(() => setRefreshKey(k => k + 1), []);

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">Mission Control</div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <button key={item.id} className={`sidebar-link ${activePage === item.id ? 'active' : ''}`} onClick={() => { setActivePage(item.id); setRefreshKey(k => k + 1); }}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d={item.icon} /></svg>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="main-content">
        {activePage === 'dashboard' && <AnalyticsPanel key={refreshKey} />}
        {activePage === 'contacts' && <ContactsPanel key={refreshKey} showToast={showToast} onDataChange={onDataChange} />}
        {activePage === 'email' && <EmailPanel key={refreshKey} showToast={showToast} onDataChange={onDataChange} />}
        {activePage === 'sequences' && <SequencesPanel key={refreshKey} showToast={showToast} />}
        {activePage === 'abtest' && <ABTestPanel key={refreshKey} showToast={showToast} />}
        {activePage === 'warmup' && <WarmupPanel key={refreshKey} showToast={showToast} />}
        {activePage === 'prospector' && <ProspectorPanel key={refreshKey} showToast={showToast} onDataChange={onDataChange} />}
        {activePage === 'saved' && <SavedSearchesPanel key={refreshKey} showToast={showToast} />}
      </main>

      {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}
    </div>
  );
}
