import React, { useState } from 'react';
import { StaffRecord } from '../types';
import { MapPin, Clock, Phone, AlertCircle, CheckCircle, ArrowRight, MessageSquare, Send } from 'lucide-react';

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
      className={`bg-white border rounded-[12px] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-4 transition-all ${
        isUnfunded
          ? 'border-amber-200/90 hover:border-amber-400'
          : 'border-slate-200/80 hover:border-emerald-300'
      }`}
    >
      {/* Top Row Info */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div
            className={`w-12 h-12 rounded-[10px] border flex items-center justify-center font-bold text-sm select-none font-mono ${
              isUnfunded 
                ? 'bg-amber-50 text-amber-800 border-amber-200' 
                : isFunded 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : 'bg-blue-50 text-blue-800 border-blue-200'
            }`}
          >
            {staff.initials}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                onClick={() => onOpenDetails(staff)}
                className="text-base font-bold text-slate-900 hover:text-emerald-700 cursor-pointer transition-colors"
              >
                {staff.name}
              </h3>
              <button
                onClick={() => handleCopy(staff.code, 'code')}
                className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition-colors"
                title="Click to copy staff code"
              >
                {copiedText === 'code' ? 'COPIED!' : staff.code}
              </button>

              {/* Status Badge */}
              {isFunded && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {staff.statusLabel}
                </span>
              )}
              {isUnfunded && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  {staff.statusLabel}
                </span>
              )}
              {isProspective && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  {staff.statusLabel}
                </span>
              )}
              {isArchived && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                  {staff.statusLabel}
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500 mt-1 flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {staff.location}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {staff.tenureDisplay}
              </span>
              <button
                onClick={() => handleCopy(staff.phone, 'phone')}
                className="flex items-center gap-1 text-slate-600 font-mono hover:text-emerald-700 transition-colors"
                title="Click to copy phone number"
              >
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {copiedText === 'phone' ? 'COPIED!' : staff.phone}
              </button>
            </div>
          </div>
        </div>

        {/* Loan Tag & Profile Action */}
        <div className="flex items-center gap-2">
          {staff.hasLoan ? (
            <span className="px-3 py-1 rounded-lg bg-amber-50 text-xs font-bold text-amber-800 border border-amber-200 flex items-center gap-1.5">
              <span>₦</span>
              {staff.loanLabel}
            </span>
          ) : (
            <span className="px-3 py-1 rounded-lg bg-slate-50 text-xs font-semibold text-slate-600 border border-slate-200 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              {staff.loanLabel}
            </span>
          )}

          <button
            onClick={() => onOpenDetails(staff)}
            className="px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            title="View complete staff history"
          >
            Details ↗
          </button>
        </div>
      </div>

      {/* Inline Thread / Audit Box */}
      <div
        className={`bg-slate-50/80 border rounded-[10px] p-3.5 space-y-3 ${
          staff.boxType === 'blocker' ? 'border-amber-200' : 'border-slate-200/80'
        }`}
      >
        {/* Box Header */}
        <div className="flex items-center justify-between text-[11px] pb-2 border-b border-slate-200/60">
          <span
            className={`font-semibold flex items-center gap-1.5 ${
              staff.boxType === 'blocker'
                ? 'text-amber-800 font-bold'
                : 'text-slate-700'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            {staff.boxHeaderTitle}
          </span>

          <span
            className={`font-mono font-bold tracking-tight text-[11px] ${
              staff.boxType === 'blocker'
                ? 'text-amber-700'
                : 'text-emerald-700'
            }`}
          >
            {staff.boxHeaderTag}
          </span>
        </div>

        {/* Milestone or Onboarding text */}
        {staff.boxHighlightText && (
          <p className="text-xs text-slate-600 leading-relaxed">{staff.boxHighlightText}</p>
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
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : isCeo
                        ? 'bg-slate-100 text-slate-700 border border-slate-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}
                  >
                    {msg.role}
                  </span>
                  <p className="text-slate-700 flex-1">{msg.text}</p>
                  <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">{msg.time}</span>
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
            className="flex-1 bg-white border border-slate-200 focus:border-emerald-500 focus:outline-none text-xs rounded-lg px-3 py-1.5 text-slate-800 placeholder-slate-400 transition-colors"
            placeholder="Add note or instruction for area supervisor..."
            type="text"
          />
          <button
            type="submit"
            disabled={!directiveInput.trim()}
            className="px-3.5 py-1.5 font-bold text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-40 flex items-center gap-1"
          >
            <Send className="w-3 h-3" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
