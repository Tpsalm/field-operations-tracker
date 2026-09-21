import React, { useState } from 'react';
import { StaffRecord } from '../types';

interface StaffCardProps {
  staff: StaffRecord;
  onSendDirective: (staffId: string, text: string) => void;
  onOpenDetails: (staff: StaffRecord) => void;
}

export const StaffCard: React.FC<StaffCardProps> = ({ staff, onSendDirective, onOpenDetails }) => {
  const [directiveInput, setDirectiveInput] = useState('');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const isUnfunded = staff.status === 'unfunded';
  const isFunded = staff.status === 'funded';
  const isProspective = staff.status === 'prospective';
  const isArchived = staff.status === 'archived';

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directiveInput.trim()) return;
    onSendDirective(staff.id, directiveInput.trim());
    setDirectiveInput('');
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 1800);
  };

  return (
    <div
      className={`bg-[#0e1628] border rounded-xl p-5 shadow-lg space-y-4 transition-all ${
        isUnfunded
          ? 'border-[#1e2d4d] hover:border-[#F17F31]/50'
          : 'border-[#1e2d4d] hover:border-[#92C842]/40'
      }`}
    >
      {/* Top Row Info */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div
            className={`w-12 h-12 rounded-xl bg-[#151f38] border border-[#1e2d4d] flex items-center justify-center font-bold text-sm select-none ${
              isUnfunded ? 'text-[#F17F31]' : isFunded ? 'text-slate-200' : 'text-blue-400'
            }`}
          >
            {staff.initials}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                onClick={() => onOpenDetails(staff)}
                className="text-base font-bold text-white hover:text-[#92C842] cursor-pointer transition-colors"
              >
                {staff.name}
              </h3>
              <button
                onClick={() => handleCopy(staff.code, 'code')}
                className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#151f38] text-slate-300 border border-[#1e2d4d] hover:bg-[#1a2745] transition-colors"
                title="Click to copy code"
              >
                {copiedText === 'code' ? 'COPIED!' : staff.code}
              </button>

              {/* Status Badge */}
              {isFunded && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide bg-[#92C842]/15 text-[#92C842] border border-[#92C842]/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#92C842]"></span>
                  {staff.statusLabel}
                </span>
              )}
              {isUnfunded && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide bg-[#F17F31]/15 text-[#F17F31] border border-[#F17F31]/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F17F31]"></span>
                  {staff.statusLabel}
                </span>
              )}
              {isProspective && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  {staff.statusLabel}
                </span>
              )}
              {isArchived && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide bg-slate-500/15 text-slate-400 border border-slate-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                  {staff.statusLabel}
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-400 mt-1 flex-wrap">
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
                {staff.location}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
                {staff.tenureDisplay}
              </span>
              <button
                onClick={() => handleCopy(staff.phone, 'phone')}
                className="flex items-center gap-1 text-slate-400 font-mono hover:text-slate-200 transition-colors"
                title="Click to copy phone"
              >
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
                {copiedText === 'phone' ? 'COPIED!' : staff.phone}
              </button>
            </div>
          </div>
        </div>

        {/* Loan Tag & Action Button */}
        <div className="flex items-center gap-2">
          {staff.hasLoan ? (
            <span className="px-3 py-1 rounded-lg bg-[#F17F31]/15 text-xs font-bold text-[#F17F31] border border-[#F17F31]/40 flex items-center gap-1.5 shadow-sm">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
              {staff.loanLabel}
            </span>
          ) : (
            <span className="px-3 py-1 rounded-lg bg-[#151f38] text-xs font-semibold text-slate-300 border border-[#1e2d4d] flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-[#92C842]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              {staff.loanLabel}
            </span>
          )}

          <button
            onClick={() => onOpenDetails(staff)}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-[#151f38] rounded-md transition-colors"
            title="View full audit profile"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Inline Thread / Audit Box */}
      <div
        className={`bg-[#090e1c]/90 border rounded-lg p-3.5 space-y-3 ${
          staff.boxType === 'blocker' ? 'border-[#F17F31]/30' : 'border-[#1e2d4d]'
        }`}
      >
        {/* Box Header */}
        <div className="flex items-center justify-between text-[11px] pb-2 border-b border-[#1e2d4d]">
          <span
            className={`font-semibold flex items-center gap-1.5 ${
              staff.boxType === 'blocker'
                ? 'text-[#F17F31] font-bold'
                : staff.boxType === 'milestone'
                ? 'text-slate-300'
                : staff.boxType === 'onboarding'
                ? 'text-slate-300'
                : 'text-slate-400'
            }`}
          >
            {staff.boxType === 'audit' && (
              <svg className="w-3.5 h-3.5 text-[#92C842]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            )}
            {staff.boxType === 'blocker' && (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            )}
            {staff.boxType === 'milestone' && (
              <svg className="w-3.5 h-3.5 text-[#92C842]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            )}
            {staff.boxType === 'onboarding' && (
              <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            )}
            {staff.boxHeaderTitle}
          </span>

          <span
            className={`font-mono font-bold tracking-tight ${
              staff.boxType === 'blocker'
                ? 'text-[#F17F31]'
                : staff.boxType === 'onboarding'
                ? 'text-slate-400 text-[10px] tracking-wider uppercase'
                : 'text-[#92C842]'
            }`}
          >
            {staff.boxHeaderTag}
          </span>
        </div>

        {/* Milestone or Onboarding text paragraph if present */}
        {staff.boxHighlightText && (
          <p className="text-xs text-slate-300 leading-relaxed">{staff.boxHighlightText}</p>
        )}

        {/* Messages in thread */}
        {staff.thread && staff.thread.length > 0 && (
          <div className="space-y-2 text-xs">
            {staff.thread.map((msg) => {
              const isOps = msg.role === 'TOPE (OPS)';
              const isCeo = msg.role === 'CEO';
              return (
                <div key={msg.id} className="flex items-start gap-2">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      isOps
                        ? 'bg-[#92C842]/20 text-[#92C842] border border-[#92C842]/30'
                        : isCeo
                        ? 'bg-[#151f38] text-slate-300 border border-[#1e2d4d]'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}
                  >
                    {msg.role}
                  </span>
                  <p className="text-slate-300 flex-1">{msg.text}</p>
                  <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">{msg.time}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Inline Directive Input Form */}
        <form onSubmit={handleSend} className="pt-1 flex items-center gap-2">
          <input
            value={directiveInput}
            onChange={(e) => setDirectiveInput(e.target.value)}
            className="flex-1 bg-[#151f38] border border-[#1e2d4d] focus:border-[#92C842] focus:ring-0 text-xs rounded-lg px-3 py-1.5 text-slate-200 placeholder-slate-500 transition-colors"
            placeholder="Leave inline directive for Tope regarding this rep..."
            type="text"
          />
          <button
            type="submit"
            disabled={!directiveInput.trim()}
            className={`px-3.5 py-1.5 font-bold text-xs rounded-lg transition-colors disabled:opacity-40 ${
              staff.boxType === 'blocker'
                ? 'bg-[#F17F31] hover:bg-[#d96a20] text-white'
                : 'bg-[#92C842] hover:bg-[#7bb32e] text-[#090e1c]'
            }`}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};
