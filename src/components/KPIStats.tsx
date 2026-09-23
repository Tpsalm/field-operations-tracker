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
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3" data-purpose="kpi-metric-cards">
      {/* Card 1: Total Funded VSRs */}
      <div
        onClick={() => {
          if (onFilterStatus) onFilterStatus('funded');
          if (onSelectTab) onSelectTab('active');
        }}
        className="bg-[#0e1628] border border-[#1e2d4d] hover:border-[#92C842]/40 rounded-lg p-3 transition-all relative overflow-hidden group cursor-pointer"
      >
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1.5">
          <span className="tracking-wider uppercase text-[10px]">Total Funded VSRs</span>
          <span className="text-[#92C842] p-1 rounded bg-[#92C842]/10 group-hover:scale-110 transition-transform">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-white font-mono">{fundedCount}</span>
          <span className="text-[10px] font-bold text-[#92C842] bg-[#92C842]/10 px-1.5 py-0.5 rounded border border-[#92C842]/20">
            {fundedPercent}%
          </span>
        </div>
        {/* Progress Bar */}
        <div className="w-full bg-[#151f38] h-1.5 rounded-full mt-2 overflow-hidden">
          <div className="bg-[#92C842] h-1.5 rounded-full transition-all duration-500" style={{ width: `${fundedPercent}%` }}></div>
        </div>
        <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#92C842]"></span>
          <span>14 funded this week</span>
        </div>
      </div>

      {/* Card 2: Unfunded Active VSRs */}
      <div
        onClick={() => {
          if (onFilterStatus) onFilterStatus('unfunded');
          if (onSelectTab) onSelectTab('active');
        }}
        className="bg-[#0e1628] border border-[#1e2d4d] hover:border-[#F17F31]/40 rounded-lg p-3 transition-all relative overflow-hidden group cursor-pointer"
      >
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1.5">
          <span className="tracking-wider uppercase text-[10px]">Unfunded Active VSRs</span>
          <span className="text-[#F17F31] p-1 rounded bg-[#F17F31]/10 group-hover:scale-110 transition-transform">
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
          <span className="text-2xl font-extrabold text-white font-mono">{unfundedCount}</span>
          <span className="text-[10px] font-bold text-[#F17F31] bg-[#F17F31]/15 px-1.5 py-0.5 rounded border border-[#F17F31]/30">
            Action Req.
          </span>
        </div>
        <div className="w-full bg-[#151f38] h-1.5 rounded-full mt-2 overflow-hidden">
          <div className="bg-[#F17F31] h-1.5 rounded-full transition-all duration-500" style={{ width: `${unfundedPercent}%` }}></div>
        </div>
        <div className="mt-2 text-[10px] text-[#F17F31] font-medium flex items-center gap-1.5">
          <span>Pending approval</span>
        </div>
      </div>

      {/* Card 3: Prospective Hires */}
      <div
        onClick={() => {
          if (onSelectTab) onSelectTab('prospective');
        }}
        className="bg-[#0e1628] border border-[#1e2d4d] hover:border-blue-400/40 rounded-lg p-3 transition-all group cursor-pointer"
      >
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1.5">
          <span className="tracking-wider uppercase text-[10px]">Prospective Hires</span>
          <span className="text-slate-400 p-1 rounded bg-[#151f38] group-hover:text-blue-400 transition-colors">
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
          <span className="text-2xl font-extrabold text-white font-mono">{prospectiveCount}</span>
          <span className="text-[10px] text-slate-400 font-medium">Offers Out</span>
        </div>
        <div className="w-full bg-[#151f38] h-1.5 rounded-full mt-2 overflow-hidden">
          <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: '45%' }}></div>
        </div>
        <div className="mt-2 text-[10px] text-slate-400">Pre-induction</div>
      </div>

      {/* Card 4: Field Merchandisers */}
      <div
        onClick={() => {
          if (onSelectScreen) onSelectScreen('merchandisers');
        }}
        className="bg-[#0e1628] border border-[#1e2d4d] hover:border-indigo-400/40 rounded-lg p-3 transition-all group cursor-pointer"
      >
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1.5">
          <span className="tracking-wider uppercase text-[10px]">Field Merchandisers</span>
          <span className="text-slate-400 p-1 rounded bg-[#151f38] group-hover:text-indigo-400 transition-colors">
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
          <span className="text-2xl font-extrabold text-white font-mono">{merchandiserCount}</span>
          <span className="text-[10px] text-slate-400 font-medium">4 Hubs</span>
        </div>
        <div className="w-full bg-[#151f38] h-1.5 rounded-full mt-2 overflow-hidden">
          <div className="bg-indigo-400 h-1.5 rounded-full" style={{ width: '82%' }}></div>
        </div>
        <div className="mt-2 text-[10px] text-slate-400">1,420 POS active</div>
      </div>

      {/* Card 5: HQ Personnel */}
      <div
        onClick={() => {
          if (onSelectScreen) onSelectScreen('head_office');
        }}
        className="bg-[#0e1628] border border-[#1e2d4d] hover:border-amber-400/40 rounded-lg p-3 transition-all group cursor-pointer"
      >
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1.5">
          <span className="tracking-wider uppercase text-[10px]">HQ Personnel</span>
          <span className="text-slate-400 p-1 rounded bg-[#151f38] group-hover:text-amber-400 transition-colors">
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
          <span className="text-2xl font-extrabold text-white font-mono">{hqPersonnelCount}</span>
          <span className="text-[10px] font-bold text-[#F17F31] bg-[#F17F31]/10 px-1.5 py-0.5 rounded border border-[#F17F31]/20">
            +5 Req
          </span>
        </div>
        <div className="w-full bg-[#151f38] h-1.5 rounded-full mt-2 overflow-hidden">
          <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: '60%' }}></div>
        </div>
        <div className="mt-2 text-[10px] text-slate-400">5 active searches</div>
      </div>
    </section>
  );
};
