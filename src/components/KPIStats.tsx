import React from 'react';
import { TabType, NavigationScreen } from '../types';

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
  const totalActive = fundedCount + unfundedCount;
  const fundedPercent = totalActive > 0 ? ((fundedCount / totalActive) * 100).toFixed(1) : '69.5';
  const unfundedPercent = totalActive > 0 ? ((unfundedCount / totalActive) * 100).toFixed(1) : '30.5';

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4" data-purpose="kpi-metric-cards">
      {/* Card 1: Total Funded VSRs */}
      <div
        onClick={() => {
          if (onFilterStatus) onFilterStatus('funded');
          if (onSelectTab) onSelectTab('active');
        }}
        className="bg-white border border-slate-200/80 hover:border-[#82c332] rounded-[12px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all relative overflow-hidden group cursor-pointer"
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
          <span className="text-3xl font-extrabold text-slate-900 font-mono">{fundedCount}</span>
          <span className="text-xs font-bold text-[#5f931d] bg-[#82c332]/15 px-1.5 py-0.5 rounded border border-[#82c332]/30">
            {fundedPercent}%
          </span>
        </div>
        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
          <div className="bg-[#82c332] h-1.5 rounded-full transition-all duration-500" style={{ width: `${fundedPercent}%` }}></div>
        </div>
        <div className="mt-2.5 text-[11px] text-slate-500 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#82c332]"></span>
          <span>14 staff paid this week</span>
        </div>
      </div>

      {/* Card 2: Unfunded Active VSRs */}
      <div
        onClick={() => {
          if (onFilterStatus) onFilterStatus('unfunded');
          if (onSelectTab) onSelectTab('active');
        }}
        className="bg-white border border-slate-200/80 hover:border-[#f27405] rounded-[12px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all relative overflow-hidden group cursor-pointer"
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
          <span className="text-3xl font-extrabold text-slate-900 font-mono">{unfundedCount}</span>
          <span className="text-xs font-bold text-[#c95d00] bg-[#f27405]/15 px-1.5 py-0.5 rounded border border-[#f27405]/30">
            Needs Action
          </span>
        </div>
        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
          <div className="bg-[#f27405] h-1.5 rounded-full transition-all duration-500" style={{ width: `${unfundedPercent}%` }}></div>
        </div>
        <div className="mt-2.5 text-[11px] text-[#c95d00] font-medium flex items-center gap-1.5">
          <span>⚠️ Waiting for approval or on hold</span>
        </div>
      </div>

      {/* Card 3: Prospective Hires */}
      <div
        onClick={() => {
          if (onSelectScreen) {
            onSelectScreen('vsr_recruitment');
          } else if (onSelectTab) {
            onSelectTab('prospective');
          }
        }}
        className="bg-white border border-slate-200/80 hover:border-blue-500 rounded-[12px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all group cursor-pointer"
        title="Open VSR Recruitment"
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
          <span className="text-3xl font-extrabold text-slate-900 font-mono">{prospectiveCount}</span>
          <span className="text-xs text-slate-500 font-medium">Ready</span>
        </div>
        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
          <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '45%' }}></div>
        </div>
        <div className="mt-2.5 text-[11px] text-slate-500">Passed interview; ready to start</div>
      </div>

      {/* Card 4: Field Merchandisers */}
      <div
        onClick={() => {
          if (onSelectScreen) onSelectScreen('merchandisers');
        }}
        className="bg-white border border-slate-200/80 hover:border-indigo-500 rounded-[12px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all group cursor-pointer"
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
          <span className="text-3xl font-extrabold text-slate-900 font-mono">{merchandiserCount}</span>
          <span className="text-xs text-slate-500 font-medium">4 Locations</span>
        </div>
        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
          <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '82%' }}></div>
        </div>
        <div className="mt-2.5 text-[11px] text-slate-500">1,420 card machines active</div>
      </div>

      {/* Card 5: HQ Personnel */}
      <div
        onClick={() => {
          if (onSelectScreen) onSelectScreen('head_office');
        }}
        className="bg-white border border-slate-200/80 hover:border-amber-500 rounded-[12px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all group cursor-pointer"
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
          <span className="text-3xl font-extrabold text-slate-900 font-mono">{hqPersonnelCount}</span>
          <span className="text-xs font-bold text-[#c95d00] bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
            +5 Open Jobs
          </span>
        </div>
        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
          <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '60%' }}></div>
        </div>
        <div className="mt-2.5 text-[11px] text-slate-500">5 open jobs being hired</div>
      </div>
    </section>
  );
};
