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
    <section className="space-y-5 rounded-2xl border border-[#1e2d4d] bg-[#0e1628] p-5 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1e2d4d] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[#92C842]">⚿</span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">Credential Administration</h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">Super Admin access keys and temporary field-audit credentials.</p>
        </div>
        <span className="rounded border border-[#92C842]/30 bg-[#92C842]/10 px-2 py-1 text-[10px] font-mono font-bold text-[#92C842]">SUPER ADMIN ONLY</span>
      </div>

      <div className="grid grid-cols-1 gap-3.5 xl:grid-cols-2">
        {PRESET_CREDENTIALS.map((credential) => (
          <div key={credential.user.id} className="rounded-xl border border-[#1e2d4d] bg-[#0b1222] p-3.5">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-[#090e1c]" style={{ backgroundColor: credential.user.avatarColor }}>
                {credential.user.initials}
              </div>
              <div>
                <div className="text-xs font-bold text-white">{credential.user.name}</div>
                <div className="text-[10px] font-mono text-slate-400">{credential.badge}</div>
              </div>
              <span className="ml-auto text-[10px] font-mono font-semibold text-[#92C842]">{credential.user.role}</span>
            </div>
            <div className="mt-3 space-y-1 rounded bg-[#070b14] p-2 text-[11px] font-mono">
              <div className="flex items-center justify-between gap-2 text-slate-300">
                <span className="truncate">{credential.user.email}</span>
                <button type="button" onClick={() => handleCopy(credential.user.email, `${credential.user.id}-email`)} className="shrink-0 text-slate-400 hover:text-white" title="Copy email">
                  {copiedKey === `${credential.user.id}-email` ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="flex items-center justify-between gap-2 border-t border-[#1e2d4d]/40 pt-1 text-[#92C842]">
                <span>{credential.passwordText}</span>
                <button type="button" onClick={() => handleCopy(credential.passwordText, `${credential.user.id}-password`)} className="shrink-0 text-slate-400 hover:text-white" title="Copy password">
                  {copiedKey === `${credential.user.id}-password` ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-[#1e2d4d] bg-[#0b1222] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Dynamic Auditor Credential Generator</h3>
            <p className="mt-1 text-[11px] text-slate-400">Create a temporary inspection key scoped to a regional hub.</p>
          </div>
          <div className="flex items-center gap-2">
            <select value={genHub} onChange={(event) => setGenHub(event.target.value as typeof genHub)} className="rounded-lg border border-[#1e2d4d] bg-[#151f38] px-2.5 py-1.5 text-xs font-mono text-slate-300 outline-none">
              <option value="All">All 4 Hubs</option>
              <option value="Lagos">Lagos Sector</option>
              <option value="Ibadan">Ibadan Sector</option>
              <option value="Ogun">Ogun Corridor</option>
              <option value="Benin">Benin Sector</option>
            </select>
            <button type="button" onClick={handleGenerate} className="rounded-lg border border-[#92C842]/40 bg-[#92C842]/15 px-3.5 py-1.5 text-xs font-bold text-[#92C842] hover:bg-[#92C842]/25">+ Generate Key</button>
          </div>
        </div>
        {generatedList.length > 0 && (
          <div className="mt-4 space-y-2 border-t border-[#1e2d4d]/60 pt-3">
            <div className="text-[10px] font-mono uppercase text-slate-400">Recently generated active keys ({generatedList.length})</div>
            {generatedList.map((credential) => (
              <div key={credential.user.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#1e2d4d] bg-[#090e1c] p-2.5 text-xs font-mono">
                <span className="text-white"><span className="mr-2 text-amber-400">●</span>{credential.user.name} <span className="text-[10px] text-slate-400">({credential.user.email})</span></span>
                <span className="font-semibold text-amber-300">{credential.passwordText}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
