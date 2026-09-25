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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white border border-slate-200/90 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-slate-800 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Add New Field Staff</h3>
              <p className="text-xs text-slate-500">Register a new representative into field operations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Full Name *</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Babatunde Fashola"
                className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Branch / Hub *</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 outline-none"
              >
                <option value="Lagos">Lagos Hub</option>
                <option value="Ibadan">Ibadan Hub</option>
                <option value="Ogun">Ogun Hub</option>
                <option value="Benin">Benin Hub</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Assigned Route / Market Area</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Victoria Island Market"
                className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Phone Number</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 800 000 0000"
                className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 font-mono outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Monthly Capital Allocation (₦)</label>
              <input
                value={allocation}
                onChange={(e) => setAllocation(e.target.value)}
                placeholder="180,000"
                className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-900 font-mono outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Bank Name</label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-800 outline-none"
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
              <label className="block text-slate-700 font-medium mb-1">Account Number</label>
              <input
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="10-digit NUBAN"
                maxLength={10}
                className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 font-mono outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Guarantor Name</label>
              <input
                value={guarantorName}
                onChange={(e) => setGuarantorName(e.target.value)}
                placeholder="e.g. Chief O. Adebisi"
                className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 outline-none"
              />
            </div>
          </div>

          {/* Loan Option */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasLoan}
                  onChange={(e) => setHasLoan(e.target.checked)}
                  className="rounded border-slate-300 text-amber-600 focus:ring-0"
                />
                <span className="font-semibold text-slate-800">Active Working Capital Loan</span>
              </label>
              {hasLoan && (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Loan Enabled
                </span>
              )}
            </div>
            {hasLoan && (
              <div className="pt-2">
                <label className="block text-slate-600 text-[11px] mb-1">Loan Principal Amount (₦)</label>
                <input
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  placeholder="50,000"
                  className="w-full bg-white border border-slate-300 focus:border-amber-500 rounded-lg px-3 py-1.5 text-slate-900 font-mono text-xs outline-none"
                />
              </div>
            )}
          </div>

          {/* Initial Directive */}
          <div>
            <label className="block text-slate-700 font-medium mb-1">Initial Admin Instruction (Optional)</label>
            <textarea
              rows={2}
              value={directive}
              onChange={(e) => setDirective(e.target.value)}
              placeholder="e.g. Provide card machines before Friday morning dispatch..."
              className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-500 rounded-lg p-3 text-slate-900 placeholder-slate-400 outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-sm transition-transform active:scale-95"
            >
              Confirm &amp; Register Staff
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
