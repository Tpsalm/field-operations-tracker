import React, { useState } from 'react';
import { GeneratedCredential } from '../types';
import { PRESET_CREDENTIALS, generateCustomAuditorCredential } from '../data/credentialsData';

export const CredentialAdministrationPanel: React.FC = () => {
  const [generatedList, setGeneratedList] = useState<GeneratedCredential[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('kea_generated_credentials') || '[]');
    } catch {
      return [];
    }
  });
  const [genHub, setGenHub] = useState<'All' | 'Lagos' | 'Ibadan' | 'Ogun' | 'Benin'>('Lagos');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleGenerate = () => {
    const credential = generateCustomAuditorCredential(genHub);
    const nextList = [credential, ...generatedList];
    setGeneratedList(nextList);
    localStorage.setItem('kea_generated_credentials', JSON.stringify(nextList));
  };

  return (
    <section className="space-y-5 rounded-[12px] border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-700">⚿</span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">Login Accounts &amp; Access Keys</h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">Super Admin and regional auditor demo login credentials.</p>
        </div>
        <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-mono font-bold text-emerald-700">SUPER ADMIN ONLY</span>
      </div>

      <div className="grid grid-cols-1 gap-3.5 xl:grid-cols-2">
        {PRESET_CREDENTIALS.map((credential) => (
          <div key={credential.user.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white shadow-xs" style={{ backgroundColor: credential.user.avatarColor || '#10b981' }}>
                {credential.user.initials}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">{credential.user.name}</div>
                <div className="text-[10px] font-mono text-slate-500">{credential.badge}</div>
              </div>
              <span className="ml-auto text-[10px] font-mono font-semibold text-emerald-700">{credential.user.role}</span>
            </div>
            <div className="mt-3 space-y-1 rounded-lg bg-white border border-slate-200 p-2.5 text-[11px] font-mono">
              <div className="flex items-center justify-between gap-2 text-slate-700">
                <span className="truncate">{credential.user.email}</span>
                <button type="button" onClick={() => handleCopy(credential.user.email, `${credential.user.id}-email`)} className="shrink-0 text-slate-400 hover:text-slate-800" title="Copy email">
                  {copiedKey === `${credential.user.id}-email` ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-1 text-emerald-700 font-semibold">
                <span>{credential.passwordText}</span>
                <button type="button" onClick={() => handleCopy(credential.passwordText, `${credential.user.id}-password`)} className="shrink-0 text-slate-400 hover:text-slate-800" title="Copy password">
                  {copiedKey === `${credential.user.id}-password` ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Auditor Login Generator</h3>
            <p className="mt-1 text-[11px] text-slate-500">Create a temporary auditor login key scoped to a branch.</p>
          </div>
          <div className="flex items-center gap-2">
            <select value={genHub} onChange={(event) => setGenHub(event.target.value as typeof genHub)} className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none">
              <option value="All">All 4 Branches</option>
              <option value="Lagos">Lagos Branch</option>
              <option value="Ibadan">Ibadan Branch</option>
              <option value="Ogun">Ogun Branch</option>
              <option value="Benin">Benin Branch</option>
            </select>
            <button type="button" onClick={handleGenerate} className="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-colors shadow-xs">+ Generate Key</button>
          </div>
        </div>
        {generatedList.length > 0 && (
          <div className="mt-4 space-y-2 border-t border-slate-200 pt-3">
            <div className="text-[10px] font-mono uppercase text-slate-500">Recently Generated Keys ({generatedList.length})</div>
            {generatedList.map((credential) => (
              <div key={credential.user.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white p-2.5 text-xs font-mono">
                <span className="text-slate-800"><span className="mr-2 text-emerald-600">●</span>{credential.user.name} <span className="text-[10px] text-slate-500">({credential.user.email})</span></span>
                <span className="font-semibold text-emerald-700">{credential.passwordText}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
