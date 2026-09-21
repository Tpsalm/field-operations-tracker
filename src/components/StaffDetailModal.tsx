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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-slate-200 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#1e2d4d] pb-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-14 h-14 rounded-xl bg-[#151f38] border border-[#1e2d4d] flex items-center justify-center font-extrabold text-lg ${
                isUnfunded ? 'text-[#F17F31]' : isFunded ? 'text-slate-200' : 'text-blue-400'
              }`}
            >
              {staff.initials}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-white">{staff.name}</h3>
                <span className="px-2 py-0.5 rounded text-xs font-mono bg-[#151f38] text-slate-300 border border-[#1e2d4d]">
                  {staff.code}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide border flex items-center gap-1 ${
                    isFunded
                      ? 'bg-[#92C842]/15 text-[#92C842] border-[#92C842]/30'
                      : isUnfunded
                      ? 'bg-[#F17F31]/15 text-[#F17F31] border-[#F17F31]/30'
                      : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isFunded ? 'bg-[#92C842]' : isUnfunded ? 'bg-[#F17F31]' : 'bg-blue-400'
                    }`}
                  ></span>
                  {staff.statusLabel}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {staff.location} • {staff.tenureDisplay} • {staff.phone}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#151f38] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Quick KPI Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-[#151f38] p-3 rounded-lg border border-[#1e2d4d]">
            <div className="text-slate-400 text-[10px] uppercase font-semibold">Monthly Allocation</div>
            <div className="text-white font-mono font-bold text-sm mt-1">
              ₦{(staff.allocationAmount || 185000).toLocaleString()}
            </div>
          </div>
          <div className="bg-[#151f38] p-3 rounded-lg border border-[#1e2d4d]">
            <div className="text-slate-400 text-[10px] uppercase font-semibold">Loan Liability</div>
            <div className={`font-mono font-bold text-sm mt-1 ${staff.hasLoan ? 'text-[#F17F31]' : 'text-[#92C842]'}`}>
              {staff.hasLoan ? `₦${(staff.loanAmount || 85000).toLocaleString()}` : '₦0 (Clear)'}
            </div>
          </div>
          <div className="bg-[#151f38] p-3 rounded-lg border border-[#1e2d4d]">
            <div className="text-slate-400 text-[10px] uppercase font-semibold">Assigned POS Kiosks</div>
            <div className="text-white font-mono font-bold text-sm mt-1">{staff.posCount || 24} Units</div>
          </div>
          <div className="bg-[#151f38] p-3 rounded-lg border border-[#1e2d4d]">
            <div className="text-slate-400 text-[10px] uppercase font-semibold">NIBSS Clearance</div>
            <div className="text-[#92C842] font-semibold text-xs mt-1 truncate">
              {staff.verificationStatus || 'Verified'}
            </div>
          </div>
        </div>

        {/* Banking & Guarantor Details */}
        <div className="p-4 bg-[#090e1c] border border-[#1e2d4d] rounded-xl space-y-3 text-xs">
          <h4 className="font-bold text-slate-300 text-xs tracking-wide uppercase">Banking &amp; Institutional Guaranty</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-slate-500 block text-[11px]">Primary Disbursement Bank</span>
              <span className="text-slate-200 font-semibold">{staff.bankName || 'Access Bank PLC'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">NUBAN Account Number</span>
              <span className="text-slate-200 font-mono font-semibold">{staff.accountNumber || '0039481920'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Institutional Guarantor</span>
              <span className="text-slate-200">{staff.guarantorName || 'Registered Trade Executive'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Telemetry Surveillance Node</span>
              <span className="text-slate-200 font-mono">NODE-{staff.region.toUpperCase()}-08</span>
            </div>
          </div>
        </div>

        {/* Directive Thread */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase">
            <span>Executive Audit &amp; Directives History</span>
            <span className="text-[#92C842] font-mono text-[11px]">{staff.thread.length} Log Entries</span>
          </div>

          <div className="bg-[#090e1c] border border-[#1e2d4d] rounded-xl p-4 max-h-48 overflow-y-auto space-y-2.5 text-xs">
            {staff.thread.length === 0 ? (
              <p className="text-slate-500 italic text-center py-3">No executive directives logged yet for this rep.</p>
            ) : (
              staff.thread.map((msg) => (
                <div key={msg.id} className="flex items-start gap-2">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      msg.role === 'TOPE (OPS)'
                        ? 'bg-[#92C842]/20 text-[#92C842] border border-[#92C842]/30'
                        : msg.role === 'CEO'
                        ? 'bg-[#151f38] text-slate-300 border border-[#1e2d4d]'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}
                  >
                    {msg.role}
                  </span>
                  <p className="text-slate-300 flex-1 leading-relaxed">{msg.text}</p>
                  <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">{msg.time}</span>
                </div>
              ))
            )}
          </div>

          {/* New message input in modal */}
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <input
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              placeholder="Post CEO clearance or field ops instruction..."
              className="flex-1 bg-[#151f38] border border-[#1e2d4d] focus:border-[#92C842] text-xs rounded-lg px-3 py-2 text-slate-200 placeholder-slate-500"
            />
            <button
              type="submit"
              disabled={!newMsg.trim()}
              className="px-4 py-2 bg-[#92C842] hover:bg-[#7bb32e] text-[#090e1c] font-bold text-xs rounded-lg disabled:opacity-40"
            >
              Post Directive
            </button>
          </form>
        </div>

        {/* Executive Actions */}
        <div className="pt-4 border-t border-[#1e2d4d] flex flex-wrap items-center justify-between gap-3 text-xs">
          <button
            onClick={() => onToggleStatus(staff.id)}
            className={`px-4 py-2 rounded-lg font-bold border transition-colors ${
              isFunded
                ? 'bg-[#F17F31]/10 text-[#F17F31] border-[#F17F31]/30 hover:bg-[#F17F31]/20'
                : 'bg-[#92C842]/10 text-[#92C842] border-[#92C842]/30 hover:bg-[#92C842]/20'
            }`}
          >
            {isFunded ? 'Mark as Disbursement Hold' : 'Approve & Release Batch Funding'}
          </button>

          <button
            onClick={() => onDisburseFunding(staff.id, staff.allocationAmount || 185000)}
            className="px-4 py-2 rounded-lg bg-[#92C842] hover:bg-[#7bb32e] text-[#090e1c] font-bold shadow-md shadow-[#92C842]/20"
          >
            Execute Direct Paystack Transfer
          </button>
        </div>
      </div>
    </div>
  );
};
