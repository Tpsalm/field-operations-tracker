import React, { useState, useMemo } from 'react';
import { TabType, NavigationScreen } from '../types';
import { INITIAL_STAFF_RECORDS, PROSPECTIVE_STAFF_RECORDS } from '../data/mockData';
import { CheckCircle2, Clock, Users, Building2, Download, Search, X, ShieldCheck } from 'lucide-react';

interface KPIStatsProps {
  fundedCount: number;
  unfundedCount: number;
  prospectiveCount: number;
  merchandiserCount: number;
  hqPersonnelCount: number;
  onFilterStatus?: (status: 'all' | 'funded' | 'unfunded') => void;
  onSelectTab?: (tab: TabType) => void;
  onSelectScreen?: (screen: NavigationScreen) => void;
}

type KpiModalCategory = 'funded' | 'unfunded' | 'prospective' | 'merchandisers' | 'hq' | null;

export const KPIStats: React.FC<KPIStatsProps> = ({
  fundedCount,
  unfundedCount,
  prospectiveCount,
  merchandiserCount,
  hqPersonnelCount,
  onFilterStatus,
  onSelectTab,
  onSelectScreen
}) => {
  const [modalCategory, setModalCategory] = useState<KpiModalCategory>(null);
  const [modalSearch, setModalSearch] = useState<string>('');

  const totalActive = fundedCount + unfundedCount;
  const fundedPercent = totalActive > 0 ? ((fundedCount / totalActive) * 100).toFixed(1) : '69.5';
  const unfundedPercent = totalActive > 0 ? ((unfundedCount / totalActive) * 100).toFixed(1) : '30.5';

  // Modal dataset calculation
  const modalRecords = useMemo(() => {
    if (!modalCategory) return [];
    if (modalCategory === 'funded') {
      return INITIAL_STAFF_RECORDS.filter(s => s.status === 'funded');
    }
    if (modalCategory === 'unfunded') {
      return INITIAL_STAFF_RECORDS.filter(s => s.status === 'unfunded');
    }
    if (modalCategory === 'prospective') {
      return PROSPECTIVE_STAFF_RECORDS;
    }
    if (modalCategory === 'merchandisers') {
      return INITIAL_STAFF_RECORDS.filter(s => s.role.includes('Merchandiser') || s.role.includes('VSR'));
    }
    if (modalCategory === 'hq') {
      return [
        { id: 'hq-1', name: 'Tope Balogun', role: 'Chief Executive Officer', location: 'Lagos HQ', status: 'funded', phone: '+234 802 111 0001', code: 'KEA-HQ-01' },
        { id: 'hq-2', name: 'Ayomide Alabi', role: 'Head of Field Operations', location: 'Lagos HQ', status: 'funded', phone: '+234 803 222 0002', code: 'KEA-HQ-02' },
        { id: 'hq-3', name: 'Chukwuma Obi', role: 'Regional Telemetry Lead', location: 'Ibadan Branch', status: 'funded', phone: '+234 805 333 0003', code: 'KEA-HQ-03' },
        { id: 'hq-4', name: 'Babatunde Fash', role: 'Senior Audit Supervisor', location: 'Ogun Branch', status: 'funded', phone: '+234 807 444 0004', code: 'KEA-HQ-04' },
        { id: 'hq-5', name: 'Osasere Idehen', role: 'Edo Operations Coordinator', location: 'Benin Hub', status: 'funded', phone: '+234 809 555 0005', code: 'KEA-HQ-05' }
      ];
    }
    return INITIAL_STAFF_RECORDS;
  }, [modalCategory]);

  const filteredModalRecords = useMemo(() => {
    if (!modalSearch.trim()) return modalRecords;
    const q = modalSearch.toLowerCase();
    return modalRecords.filter((r: any) =>
      (r.name && r.name.toLowerCase().includes(q)) ||
      (r.code && r.code.toLowerCase().includes(q)) ||
      (r.location && r.location.toLowerCase().includes(q)) ||
      (r.phone && r.phone.includes(q))
    );
  }, [modalRecords, modalSearch]);

  const handleExportModalCSV = () => {
    if (!modalCategory) return;
    const headers = ['Staff Code', 'Full Name', 'Role', 'Location', 'Status', 'Phone'];
    const rows = filteredModalRecords.map((r: any) => [
      `"${r.code || 'N/A'}"`,
      `"${r.name || 'N/A'}"`,
      `"${r.role || 'VSR'}"`,
      `"${r.location || 'N/A'}"`,
      `"${r.status || 'N/A'}"`,
      `"${r.phone || 'N/A'}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `KEA_${modalCategory}_Staff_List_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <>
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4" data-purpose="kpi-metric-cards">
        {/* Card 1: Total Funded VSRs */}
        <div
          onClick={() => {
            setModalCategory('funded');
            if (onFilterStatus) onFilterStatus('funded');
            if (onSelectTab) onSelectTab('active');
          }}
          className="bg-white border border-slate-200/80 hover:border-[#82c332] rounded-[12px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all relative overflow-hidden group cursor-pointer"
          title="Click to view full tabular ledger of Paid Staff Members"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span className="tracking-wider uppercase text-[11px]">Paid Staff Members</span>
            <span className="text-[#6ea823] p-1.5 rounded-lg bg-[#82c332]/10 group-hover:scale-110 transition-transform">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono group-hover:text-emerald-600 transition-colors">{fundedCount}</span>
            <span className="text-xs font-bold text-[#5f931d] bg-[#82c332]/15 px-1.5 py-0.5 rounded border border-[#82c332]/30">
              {fundedPercent}%
            </span>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-[#82c332] h-1.5 rounded-full transition-all duration-500" style={{ width: `${fundedPercent}%` }}></div>
          </div>
          <div className="mt-2.5 text-[11px] text-slate-500 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#82c332]"></span>
              <span>14 staff paid this week</span>
            </div>
            <span className="text-emerald-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Table ↗</span>
          </div>
        </div>

        {/* Card 2: Unfunded Active VSRs */}
        <div
          onClick={() => {
            setModalCategory('unfunded');
            if (onFilterStatus) onFilterStatus('unfunded');
            if (onSelectTab) onSelectTab('active');
          }}
          className="bg-white border border-slate-200/80 hover:border-[#f27405] rounded-[12px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all relative overflow-hidden group cursor-pointer"
          title="Click to view full tabular ledger of staff Waiting for Payment"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span className="tracking-wider uppercase text-[11px]">Waiting for Payment</span>
            <span className="text-[#f27405] p-1.5 rounded-lg bg-[#f27405]/10 group-hover:scale-110 transition-transform">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono group-hover:text-amber-600 transition-colors">{unfundedCount}</span>
            <span className="text-xs font-bold text-[#c95d00] bg-[#f27405]/15 px-1.5 py-0.5 rounded border border-[#f27405]/30">
              Needs Action
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-[#f27405] h-1.5 rounded-full transition-all duration-500" style={{ width: `${unfundedPercent}%` }}></div>
          </div>
          <div className="mt-2.5 text-[11px] text-[#c95d00] font-medium flex items-center justify-between">
            <span>⚠️ Waiting for approval or on hold</span>
            <span className="text-amber-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Table ↗</span>
          </div>
        </div>

        {/* Card 3: Prospective Hires */}
        <div
          onClick={() => {
            setModalCategory('prospective');
          }}
          className="bg-white border border-slate-200/80 hover:border-blue-500 rounded-[12px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all group cursor-pointer"
          title="Click to view full tabular list of Job Candidates"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span className="tracking-wider uppercase text-[11px]">Job Candidates</span>
            <span className="text-blue-600 p-1.5 rounded-lg bg-blue-50 group-hover:scale-110 transition-transform">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono group-hover:text-blue-600 transition-colors">{prospectiveCount}</span>
            <span className="text-xs text-slate-500 font-medium">Ready</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '45%' }}></div>
          </div>
          <div className="mt-2.5 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Passed interview; ready to start</span>
            <span className="text-blue-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Table ↗</span>
          </div>
        </div>

        {/* Card 4: Field Merchandisers */}
        <div
          onClick={() => {
            setModalCategory('merchandisers');
          }}
          className="bg-white border border-slate-200/80 hover:border-indigo-500 rounded-[12px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all group cursor-pointer"
          title="Click to view full tabular list of Store Workers"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span className="tracking-wider uppercase text-[11px]">Store Workers</span>
            <span className="text-indigo-600 p-1.5 rounded-lg bg-indigo-50 group-hover:scale-110 transition-transform">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono group-hover:text-indigo-600 transition-colors">{merchandiserCount}</span>
            <span className="text-xs text-slate-500 font-medium">4 Locations</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '82%' }}></div>
          </div>
          <div className="mt-2.5 text-[11px] text-slate-500 flex items-center justify-between">
            <span>1,420 card machines active</span>
            <span className="text-indigo-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Table ↗</span>
          </div>
        </div>

        {/* Card 5: HQ Personnel */}
        <div
          onClick={() => {
            setModalCategory('hq');
          }}
          className="bg-white border border-slate-200/80 hover:border-amber-500 rounded-[12px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all group cursor-pointer"
          title="Click to view full tabular list of Office Team"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span className="tracking-wider uppercase text-[11px]">Office Team</span>
            <span className="text-amber-600 p-1.5 rounded-lg bg-amber-50 group-hover:scale-110 transition-transform">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono group-hover:text-amber-600 transition-colors">{hqPersonnelCount}</span>
            <span className="text-xs font-bold text-[#c95d00] bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
              +5 Open Jobs
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '60%' }}></div>
          </div>
          <div className="mt-2.5 text-[11px] text-slate-500 flex items-center justify-between">
            <span>5 open jobs being hired</span>
            <span className="text-amber-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Table ↗</span>
          </div>
        </div>
      </section>

      {/* KPI STATS TABULAR POPUP MODAL */}
      {modalCategory && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-[16px] border border-slate-200/90 shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Live Operations Roster
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 mt-0.5">
                    {modalCategory === 'funded' && 'Paid Staff Members (Funded VSR Cohort)'}
                    {modalCategory === 'unfunded' && 'Staff Waiting for Payment (Unfunded VSR Cohort)'}
                    {modalCategory === 'prospective' && 'Job Candidates (Prospective Applicants Pipeline)'}
                    {modalCategory === 'merchandisers' && 'Store Workers & Retail Merchandisers'}
                    {modalCategory === 'hq' && 'Office Team & Operations Supervisors'}
                  </h3>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportModalCSV}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>CSV</span>
                </button>
                <button
                  onClick={() => {
                    setModalCategory(null);
                    setModalSearch('');
                  }}
                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="px-6 py-3 border-b border-slate-200 bg-white flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search staff code, name, location, phone..."
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500 focus:bg-white transition-all text-slate-800 font-mono"
                />
              </div>
              <div className="text-xs text-slate-500 font-mono">
                Showing <strong>{filteredModalRecords.length}</strong> personnel
              </div>
            </div>

            {/* Tabular Body */}
            <div className="overflow-y-auto flex-1 p-6">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 font-mono text-[10px] uppercase tracking-wider border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="px-4 py-3">Staff Code</th>
                    <th className="px-4 py-3">Full Name</th>
                    <th className="px-4 py-3">Location / Branch</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Phone</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {filteredModalRecords.map((r: any, idx: number) => (
                    <tr key={r.id || idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-900">{r.code || 'KEA-STAFF'}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{r.name}</td>
                      <td className="px-4 py-3 text-slate-600">{r.location}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === 'funded' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {r.status === 'funded' ? '✓ Paid / Active' : '⏱️ Pending Review'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{r.phone}</td>
                    </tr>
                  ))}
                  {filteredModalRecords.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-slate-400 text-xs">
                        No records matching filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-mono">Live Operations Database • Clean Light Design</span>
              <button
                onClick={() => {
                  setModalCategory(null);
                  setModalSearch('');
                }}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors"
              >
                Close Table
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
