import React, { useState } from 'react';
import { StaffRecord } from '../types';

interface StaffDetailModalProps {
  staff: StaffRecord | null;
  onClose: () => void;
  onToggleStatus: (staffId: string) => void;
  onDisburseFunding: (staffId: string, amount: number) => void;
  onAddDirective: (staffId: string, text: string) => void;
}

export const StaffDetailModal: React.FC<StaffDetailModalProps> = ({
  staff,
  onClose,
  onToggleStatus,
  onDisburseFunding,
  onAddDirective
}) => {
  const [newMsg, setNewMsg] = useState('');

  if (!staff) return null;

  const isFunded = staff.status === 'funded';
  const isUnfunded = staff.status === 'unfunded';

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    onAddDirective(staff.id, newMsg.trim());
    setNewMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white border border-slate-200/90 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-slate-800 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-extrabold text-lg ${
                isUnfunded ? 'text-amber-600' : isFunded ? 'text-emerald-600' : 'text-blue-600'
              }`}
            >
              {staff.initials}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-slate-900">{staff.name}</h3>
                <span className="px-2 py-0.5 rounded text-xs font-mono bg-slate-100 text-slate-700 border border-slate-200">
                  {staff.code}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide border flex items-center gap-1 ${
                    isFunded
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : isUnfunded
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isFunded ? 'bg-emerald-500' : isUnfunded ? 'bg-amber-500' : 'bg-blue-500'
                    }`}
                  ></span>
                  {staff.statusLabel}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {staff.location} • {staff.tenureDisplay} • {staff.phone}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Quick KPI Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <div className="text-slate-500 text-[10px] uppercase font-semibold">Monthly Allocation</div>
            <div className="text-slate-900 font-mono font-bold text-sm mt-1">
              ₦{(staff.allocationAmount || 185000).toLocaleString()}
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <div className="text-slate-500 text-[10px] uppercase font-semibold">Loan Balance</div>
            <div className={`font-mono font-bold text-sm mt-1 ${staff.hasLoan ? 'text-amber-600' : 'text-emerald-600'}`}>
              {staff.hasLoan ? `₦${(staff.loanAmount || 85000).toLocaleString()}` : '₦0 (Clear)'}
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <div className="text-slate-500 text-[10px] uppercase font-semibold">Assigned POS Machines</div>
            <div className="text-slate-900 font-mono font-bold text-sm mt-1">{staff.posCount || 24} Units</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <div className="text-slate-500 text-[10px] uppercase font-semibold">Verification Check</div>
            <div className="text-emerald-700 font-semibold text-xs mt-1 truncate">
              {staff.verificationStatus || 'Verified'}
            </div>
          </div>
        </div>

        {/* Banking & Guarantor Details */}
        <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3 text-xs">
          <h4 className="font-bold text-slate-800 text-xs tracking-wide uppercase">Bank &amp; Guarantor Details</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-slate-500 block text-[11px]">Primary Bank</span>
              <span className="text-slate-800 font-semibold">{staff.bankName || 'Access Bank PLC'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Account Number</span>
              <span className="text-slate-800 font-mono font-semibold">{staff.accountNumber || '0039481920'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Guarantor</span>
              <span className="text-slate-800">{staff.guarantorName || 'Registered Trade Executive'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Monitoring Node</span>
              <span className="text-slate-800 font-mono">NODE-{staff.region.toUpperCase()}-08</span>
            </div>
          </div>
        </div>

        {/* Directive Thread */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800 uppercase">
            <span>Admin Notes &amp; Activity Log</span>
            <span className="text-emerald-700 font-mono text-[11px]">{staff.thread.length} Log Entries</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-h-48 overflow-y-auto space-y-2.5 text-xs">
            {staff.thread.length === 0 ? (
              <p className="text-slate-500 italic text-center py-3">No admin notes logged yet for this staff member.</p>
            ) : (
              staff.thread.map((msg) => (
                <div key={msg.id} className="flex items-start gap-2">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      msg.role === 'TOPE (OPS)'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : msg.role === 'CEO'
                        ? 'bg-slate-200 text-slate-800 border border-slate-300'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}
                  >
                    {msg.role}
                  </span>
                  <p className="text-slate-700 flex-1 leading-relaxed">{msg.text}</p>
                  <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">{msg.time}</span>
                </div>
              ))
            )}
          </div>

          {/* New message input in modal */}
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <input
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              placeholder="Add admin note or field instruction..."
              className="flex-1 bg-white border border-slate-300 focus:border-emerald-500 text-xs rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 outline-none shadow-sm"
            />
            <button
              type="submit"
              disabled={!newMsg.trim()}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs rounded-lg disabled:opacity-40 transition-colors shadow-sm"
            >
              Post Note
            </button>
          </form>
        </div>

        {/* Executive Actions */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <button
            onClick={() => onToggleStatus(staff.id)}
            className={`px-4 py-2 rounded-lg font-semibold border transition-colors ${
              isFunded
                ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            {isFunded ? 'Put Funding on Hold' : 'Approve & Release Funding'}
          </button>

          <button
            onClick={() => onDisburseFunding(staff.id, staff.allocationAmount || 185000)}
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-sm transition-colors"
          >
            Send Bank Transfer
          </button>
        </div>
      </div>
    </div>
  );
};
