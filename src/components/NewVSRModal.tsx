import React, { useState } from 'react';
import { StaffRecord, Region } from '../types';

interface NewVSRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newStaff: StaffRecord) => void;
  defaultRegion?: Region;
}

export const NewVSRModal: React.FC<NewVSRModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  defaultRegion = 'Lagos'
}) => {
  const [name, setName] = useState('');
  const [region, setRegion] = useState<'Lagos' | 'Ibadan' | 'Ogun' | 'Benin'>(
    defaultRegion === 'All' ? 'Lagos' : defaultRegion
  );
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('+234 ');
  const [allocation, setAllocation] = useState('180000');
  const [hasLoan, setHasLoan] = useState(false);
  const [loanAmount, setLoanAmount] = useState('50000');
  const [bankName, setBankName] = useState('Access Bank');
  const [accountNumber, setAccountNumber] = useState('');
  const [guarantorName, setGuarantorName] = useState('');
  const [directive, setDirective] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Generate initials
    const parts = name.trim().split(' ');
    const initials = parts.length > 1 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : name.slice(0, 2).toUpperCase();

    // Generate code
    const regionPrefix =
      region === 'Lagos' ? 'LG' : region === 'Ibadan' ? 'IB' : region === 'Ogun' ? 'OG' : 'BN';
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const code = `VSR-${regionPrefix}-${randNum}`;

    const numAlloc = parseInt(allocation.replace(/\D/g, ''), 10) || 180000;
    const numLoan = hasLoan ? parseInt(loanAmount.replace(/\D/g, ''), 10) || 50000 : 0;

    const newStaff: StaffRecord = {
      id: `staff-${Date.now()}`,
      name: name.trim(),
      initials,
      code,
      status: 'unfunded',
      statusLabel: 'UNFUNDED / PENDING VERIFICATION',
      region,
      location: location.trim() || `${region} Central Territory`,
      tenureMonths: 0.1,
      tenureDisplay: '0.1 Months Tenure (New)',
      phone: phone.trim() || '+234 800 000 0000',
      hasLoan,
      loanAmount: numLoan,
      loanLabel: hasLoan ? `On Loan (₦${numLoan.toLocaleString()})` : 'No Active Loan',
      boxType: 'audit',
      boxHeaderTitle: 'EXECUTIVE AUDIT & DIRECTIVE THREAD',
      boxHeaderTag: `ALLOCATION: ₦${numAlloc.toLocaleString()} QUEUED`,
      allocationAmount: numAlloc,
      bankName,
      accountNumber: accountNumber.trim() || 'Pending BVN verify',
      verificationStatus: 'NIBSS BVN Validation Queued',
      guarantorName: guarantorName.trim() || 'Pending Physical Confirmation',
      posCount: 10,
      thread: directive.trim()
        ? [
            {
              id: `msg-${Date.now()}`,
              sender: 'CEO',
              role: 'CEO',
              text: directive.trim(),
              time: 'Just now'
            }
          ]
        : [
            {
              id: `msg-${Date.now()}`,
              sender: 'TOPE (OPS)',
              role: 'TOPE (OPS)',
              text: `Representative enrolled into ${region} cluster. Pre-allocation verification checklist started.`,
              time: 'Just now',
              isOps: true
            }
          ]
    };

    onSubmit(newStaff);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-slate-200 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1e2d4d] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#92C842]/10 text-[#92C842] border border-[#92C842]/30">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-white">New VSR Field Allocation</h3>
              <p className="text-xs text-slate-400">Enroll new representative into the telemetry tracking registry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#151f38] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Representative Full Name *</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Babatunde Fashola"
                className="w-full bg-[#151f38] border border-[#1e2d4d] focus:border-[#92C842] rounded-lg px-3 py-2 text-white placeholder-slate-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Operational Hub *</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value as any)}
                className="w-full bg-[#151f38] border border-[#1e2d4d] focus:border-[#92C842] rounded-lg px-3 py-2 text-white"
              >
                <option value="Lagos">Lagos (Southwest Hub)</option>
                <option value="Ibadan">Ibadan (Oyo Cluster)</option>
                <option value="Ogun">Ogun (Abeokuta / Sagamu)</option>
                <option value="Benin">Benin (Edo Sector)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Route / Market Cluster</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Victoria Island (Adetokunbo Ademola)"
                className="w-full bg-[#151f38] border border-[#1e2d4d] focus:border-[#92C842] rounded-lg px-3 py-2 text-white placeholder-slate-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Phone Number</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 800 000 0000"
                className="w-full bg-[#151f38] border border-[#1e2d4d] focus:border-[#92C842] rounded-lg px-3 py-2 text-white placeholder-slate-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Monthly Capital Allocation (₦)</label>
              <input
                value={allocation}
                onChange={(e) => setAllocation(e.target.value)}
                placeholder="180,000"
                className="w-full bg-[#151f38] border border-[#1e2d4d] focus:border-[#92C842] rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Bank Name</label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full bg-[#151f38] border border-[#1e2d4d] focus:border-[#92C842] rounded-lg px-3 py-2 text-white"
              >
                <option value="Access Bank">Access Bank</option>
                <option value="Zenith Bank">Zenith Bank</option>
                <option value="GTBank">Guaranty Trust Bank (GTB)</option>
                <option value="First Bank Nigeria">First Bank of Nigeria</option>
                <option value="United Bank for Africa">United Bank for Africa (UBA)</option>
                <option value="Stanbic IBTC">Stanbic IBTC</option>
                <option value="Kuda Microfinance">Kuda Microfinance</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Account Number</label>
              <input
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="10-digit NUBAN"
                maxLength={10}
                className="w-full bg-[#151f38] border border-[#1e2d4d] focus:border-[#92C842] rounded-lg px-3 py-2 text-white placeholder-slate-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Guarantor Name &amp; Affiliation</label>
              <input
                value={guarantorName}
                onChange={(e) => setGuarantorName(e.target.value)}
                placeholder="e.g. Chief O. Adebisi (Market Leader)"
                className="w-full bg-[#151f38] border border-[#1e2d4d] focus:border-[#92C842] rounded-lg px-3 py-2 text-white placeholder-slate-500"
              />
            </div>
          </div>

          {/* Loan Option */}
          <div className="p-3 bg-[#151f38]/60 border border-[#1e2d4d] rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasLoan}
                  onChange={(e) => setHasLoan(e.target.checked)}
                  className="rounded border-[#1e2d4d] text-[#F17F31] focus:ring-0"
                />
                <span className="font-semibold text-slate-200">Active Working Capital Loan Facility</span>
              </label>
              {hasLoan && (
                <span className="text-[10px] font-bold text-[#F17F31] bg-[#F17F31]/10 px-2 py-0.5 rounded">
                  Facility Enabled
                </span>
              )}
            </div>
            {hasLoan && (
              <div className="pt-2">
                <label className="block text-slate-400 text-[11px] mb-1">Loan Principal Amount (₦)</label>
                <input
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  placeholder="50,000"
                  className="w-full bg-[#0e1628] border border-[#1e2d4d] focus:border-[#F17F31] rounded-lg px-3 py-1.5 text-white font-mono text-xs"
                />
              </div>
            )}
          </div>

          {/* Initial Directive */}
          <div>
            <label className="block text-slate-400 font-medium mb-1">Initial CEO Directive / Instruction (Optional)</label>
            <textarea
              rows={2}
              value={directive}
              onChange={(e) => setDirective(e.target.value)}
              placeholder="e.g. Fast-track Bodija retail POS terminals before Friday morning dispatch..."
              className="w-full bg-[#151f38] border border-[#1e2d4d] focus:border-[#92C842] rounded-lg p-3 text-white placeholder-slate-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1e2d4d]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#151f38] hover:bg-[#1a2745] text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#92C842] hover:bg-[#7bb32e] text-[#090e1c] font-bold shadow-md shadow-[#92C842]/20 transition-transform active:scale-95"
            >
              Confirm &amp; Allocate VSR
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
