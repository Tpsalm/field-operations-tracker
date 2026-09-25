import React, { useState } from 'react';
import { StaffRecord } from '../types';
import { Archive, Search, RotateCcw } from 'lucide-react';

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
      <div className="bg-white rounded-[12px] border border-slate-200/80 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
              <Archive className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Past Staff Records</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Historical records of offboarded field staff, exit dates, equipment return clearances, and final loan settlement records.
          </p>
        </div>

        <div className="relative sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search past staff, ID, location..."
            className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Archived Cards */}
      <div className="space-y-4">
        {filtered.map((staff) => (
          <div
            key={staff.id}
            className="bg-white rounded-[12px] border border-slate-200/80 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-4 hover:border-slate-300 transition-all"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm">
                  {staff.initials}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-slate-900">{staff.name}</h3>
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-600 border border-slate-200">
                      {staff.code}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide bg-slate-100 text-slate-600 border border-slate-200">
                      {staff.statusLabel}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-1 flex-wrap">
                    <span>{staff.location}</span>
                    <span>{staff.tenureDisplay}</span>
                    <span className="font-mono">{staff.phone}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-lg bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-200">
                  {staff.loanLabel}
                </span>
                <button
                  onClick={() => onRestoreStaff(staff.id)}
                  className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restore to Active</span>
                </button>
              </div>
            </div>

            {/* Audit & Offboarding note */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between text-[11px] pb-1 border-b border-slate-200">
                <span className="text-slate-800 font-semibold">{staff.boxHeaderTitle}</span>
                <span className="text-emerald-700 font-mono font-bold">{staff.boxHeaderTag}</span>
              </div>
              <p className="text-slate-700 leading-relaxed">{staff.boxHighlightText}</p>
              {staff.archivedReason && (
                <div className="text-[11px] text-slate-500 pt-1 flex items-center gap-2">
                  <span>Exit Reason: <strong className="text-slate-800">{staff.archivedReason}</strong></span>
                  <span>•</span>
                  <span>Effective Date: <strong className="text-slate-800">{staff.archivedDate}</strong></span>
                </div>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 bg-white rounded-[12px] border border-slate-200/80 text-slate-400 text-xs shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
            No archived records found matching "{search}".
          </div>
        )}
      </div>
    </div>
  );
};
