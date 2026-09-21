import React, { useState } from 'react';
import { StaffRecord } from '../types';

interface ArchiveViewProps {
  archivedStaff: StaffRecord[];
  onRestoreStaff: (staffId: string) => void;
}

export const ArchiveView: React.FC<ArchiveViewProps> = ({ archivedStaff, onRestoreStaff }) => {
  const [search, setSearch] = useState('');

  const filtered = archivedStaff.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      s.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-xl p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-slate-700/50 text-slate-300 border border-slate-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </span>
            <h2 className="text-lg font-bold text-white">Soft-Deleted &amp; Disengaged History Registry</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Historical registry of 42 offboarded VSR representatives, equipment recovery clearances, and final audit settlements.
          </p>
        </div>

        <div className="relative sm:w-72">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search archived files, code..."
            className="w-full bg-[#151f38] border border-[#1e2d4d] focus:border-[#92C842] rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500"
          />
        </div>
      </div>

      {/* Archived Cards */}
      <div className="space-y-4">
        {filtered.map((staff) => (
          <div
            key={staff.id}
            className="bg-[#0e1628] border border-[#1e2d4d] rounded-xl p-5 shadow-lg space-y-4 opacity-90 hover:opacity-100 transition-opacity"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-[#151f38] border border-[#1e2d4d] flex items-center justify-center font-bold text-slate-400 text-sm">
                  {staff.initials}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-slate-200">{staff.name}</h3>
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#151f38] text-slate-400 border border-[#1e2d4d]">
                      {staff.code}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide bg-slate-700/50 text-slate-300 border border-slate-600">
                      {staff.statusLabel}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400 mt-1 flex-wrap">
                    <span>{staff.location}</span>
                    <span>{staff.tenureDisplay}</span>
                    <span className="font-mono">{staff.phone}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-lg bg-[#151f38] text-xs font-semibold text-slate-400 border border-[#1e2d4d]">
                  {staff.loanLabel}
                </span>
                <button
                  onClick={() => onRestoreStaff(staff.id)}
                  className="px-3 py-1 bg-[#151f38] hover:bg-[#92C842]/20 hover:text-[#92C842] text-slate-300 border border-[#1e2d4d] rounded-lg text-xs font-semibold transition-colors"
                >
                  Restore to Active
                </button>
              </div>
            </div>

            {/* Audit & Offboarding note */}
            <div className="bg-[#090e1c]/90 border border-[#1e2d4d] rounded-lg p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between text-[11px] pb-1 border-b border-[#1e2d4d]">
                <span className="text-slate-300 font-semibold">{staff.boxHeaderTitle}</span>
                <span className="text-[#92C842] font-mono font-bold">{staff.boxHeaderTag}</span>
              </div>
              <p className="text-slate-300 leading-relaxed">{staff.boxHighlightText}</p>
              {staff.archivedReason && (
                <div className="text-[11px] text-slate-400 pt-1 flex items-center gap-2">
                  <span>Exit Reason: <strong className="text-slate-200">{staff.archivedReason}</strong></span>
                  <span>•</span>
                  <span>Effective Date: <strong className="text-slate-200">{staff.archivedDate}</strong></span>
                </div>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 bg-[#0e1628] border border-[#1e2d4d] rounded-xl text-slate-400 text-xs">
            No archived records found matching "{search}".
          </div>
        )}
      </div>
    </div>
  );
};
