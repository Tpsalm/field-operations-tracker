import React, { useState } from 'react';
import { AuthUser, GeneratedCredential } from '../types';
import {
  PRESET_CREDENTIALS,
  VSR_CREDENTIALS,
  verifyCredentials,
  generateCustomAuditorCredential
} from '../data/credentialsData';

interface SignInPageProps {
  onSignIn: (user: AuthUser) => void;
  defaultEmail?: string;
}

export const SignInPage: React.FC<SignInPageProps> = ({ onSignIn, defaultEmail = '' }) => {
  const [email, setEmail] = useState<string>(defaultEmail || PRESET_CREDENTIALS[0].user.email);
  const [password, setPassword] = useState<string>(PRESET_CREDENTIALS[0].passwordText);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [portal, setPortal] = useState<'admin' | 'vsr'>('admin');
  const [generatedList, setGeneratedList] = useState<GeneratedCredential[]>([]);
  const [genHub, setGenHub] = useState<'All' | 'Lagos' | 'Ibadan' | 'Ogun' | 'Benin'>('Lagos');

  const availableCredentials = portal === 'admin' ? PRESET_CREDENTIALS : VSR_CREDENTIALS;

  // Handle Form Submission
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      // Check preset credentials or dynamically generated credentials
      let authenticatedUser = verifyCredentials(email, password, portal);

      if (!authenticatedUser) {
        const genMatch = generatedList.find(
          (c) => c.user.email.toLowerCase() === email.trim().toLowerCase() && c.passwordText === password.trim()
        );
        if (genMatch) {
          authenticatedUser = genMatch.user;
        }
      }

      if (authenticatedUser) {
        setIsLoading(false);
        onSignIn(authenticatedUser);
      } else {
        setIsLoading(false);
        setErrorMessage('Invalid corporate credentials. Please select one of the pre-generated accounts below or generate a fresh inspection key.');
      }
    }, 450);
  };

  // Quick 1-click sign in as any preset
  const handleQuickSignIn = (cred: GeneratedCredential) => {
    setEmail(cred.user.email);
    setPassword(cred.passwordText);
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      onSignIn(cred.user);
    }, 350);
  };

  // Generate dynamic auditor account
  const handleGenerateNewCredential = () => {
    const newCred = generateCustomAuditorCredential(genHub);
    setGeneratedList((prev) => [newCred, ...prev]);
    setEmail(newCred.user.email);
    setPassword(newCred.passwordText);
    setErrorMessage('');
  };

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col justify-between selection:bg-[#92C842] selection:text-black">
      
      {/* TOP COMPLIANCE BAR */}
      <header className="border-b border-[#1e2d4d]/80 bg-[#090e1c] px-4 lg:px-8 py-3 flex items-center justify-between text-xs font-mono text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[#92C842]">
            <span className="w-2 h-2 rounded-full bg-[#92C842] animate-pulse" />
            SECURE ACCESS GATEWAY
          </span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="hidden sm:inline text-slate-300">KEA Corporate Hospitality Services Ltd.</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="text-slate-400">WAT Time Zone (UTC+1)</span>
          <span className="px-2 py-0.5 rounded bg-[#151f38] text-slate-200 border border-[#1e2d4d]">
            TLS 1.3 Encrypted
          </span>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-6xl w-full mx-auto px-4 py-8 lg:py-12 flex-1 flex flex-col justify-center">
        
        {/* BRAND HERO */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-[#0e1628] border border-[#1e2d4d] shadow-2xl mb-4">
            <img
              alt="KEA Hospitality"
              className="h-12 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCaM-FAr5FKmzgGhQH5eWL6YXxVuMYXgDAKFN_R7hja3iHfyknwvu7yBhjXKUY76ANao3E5ud0dMVdQUxs77cYxyUZEKntxE1DScy8Z93vCQATIEgwPqiO5DlH9-u0drJ3mWKWUtwTECHt1jRISb007pK6PvRhC9pIG5ksxGsFw84QPcvxwqc723WynagMHw61ou_Ly3A8r3i63Tup_-nO-uwIGfhGiR_WhE0xBrmd7illUTzyX9bHWqEMC0UMMWEctYg"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            KEA Operations Suite
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-lg mx-auto">
            Executive control portal for VSR allocations, field merchandiser telemetry, shift compliance, and head office staffing.
          </p>
        </div>

        {/* 2-COLUMN SIGN IN & GENERATOR GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: AUTHENTICATION FORM (5 cols on LG) */}
          <div className="lg:col-span-5 bg-[#0e1628] border border-[#1e2d4d] rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="border-b border-[#1e2d4d] pb-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Sign In to Suite
                </h2>
                <span className="text-[10px] font-mono text-[#92C842] bg-[#92C842]/10 px-2 py-0.5 rounded border border-[#92C842]/30 font-bold">
                  AUTHENTICATED GATEWAY
                </span>
              </div>
              <div className="mt-3 flex gap-2 rounded-xl border border-[#1e2d4d] bg-[#090e1c] p-1">
                {(['admin', 'vsr'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      setPortal(mode);
                      setEmail(mode === 'admin' ? PRESET_CREDENTIALS[0].user.email : VSR_CREDENTIALS[0].user.email);
                      setPassword(mode === 'admin' ? PRESET_CREDENTIALS[0].passwordText : VSR_CREDENTIALS[0].passwordText);
                      setErrorMessage('');
                    }}
                    className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] transition ${
                      portal === mode ? 'bg-[#92C842] text-[#090e1c]' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {mode === 'admin' ? 'Super Admin' : 'VSR'}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {portal === 'admin'
                  ? 'Enter corporate credentials or select a generated role profile.'
                  : 'Sign in as a field VSR to access route tracking and field operations.'}
              </p>
            </div>

            {/* Error Notification */}
            {errorMessage && (
              <div className="p-3.5 rounded-lg bg-red-500/15 border border-red-500/30 text-xs text-red-300 flex items-start gap-2.5">
                <svg className="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-medium text-slate-300">
                  CORPORATE WORK EMAIL:
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. name@keahospitality.ng"
                    className="w-full bg-[#151f38] border border-[#1e2d4d] focus:border-[#92C842] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all font-mono"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </span>
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono font-medium text-slate-300">
                    PASSWORD:
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? 'Hide Password' : 'Show Password'}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter security key"
                    className="w-full bg-[#151f38] border border-[#1e2d4d] focus:border-[#92C842] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all font-mono"
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 cursor-pointer hover:text-slate-200"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                        <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                    )}
                  </span>
                </div>
              </div>

              {/* Remember & Assistance */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded bg-[#151f38] border-[#1e2d4d] text-[#92C842] focus:ring-0" />
                  <span>Persist session (Local WAT)</span>
                </label>
                <span className="text-[11px] text-[#92C842] hover:underline cursor-pointer">
                  Security Protocol 2.4
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-[#92C842] hover:bg-[#7bb32e] text-[#090e1c] font-bold text-xs shadow-lg shadow-[#92C842]/20 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 mt-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-[#090e1c]" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Verifying Clearance...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                    <span>Authenticate &amp; Access Dashboard</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Bypass Action */}
            <div className="pt-3 border-t border-[#1e2d4d] text-center">
              <button
                type="button"
                onClick={() => handleQuickSignIn(PRESET_CREDENTIALS[0])}
                className="text-xs text-slate-400 hover:text-[#92C842] transition-colors inline-flex items-center gap-1.5"
              >
                <span>Instant CEO Access as Tope Balogun</span>
                <span className="font-mono">→</span>
              </button>
            </div>

          </div>

          {/* RIGHT: PRE-GENERATED CREDENTIALS & ON-DEMAND GENERATOR (7 cols on LG) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* PRE-GENERATED CORPORATE ACCOUNTS LEDGER */}
            <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1e2d4d] pb-3.5">
                <div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#92C842]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                      Generated Corporate Credentials (4 Roles)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Select any role below to autofill or log in with one click.
                  </p>
                </div>

                <span className="text-[10px] font-mono text-slate-400 bg-[#151f38] px-2.5 py-1 rounded border border-[#1e2d4d]">
                  {portal === 'admin' ? 'READY FOR DEMO / AUDIT' : 'FIELD OPERATION ROUTE ACCESS'}
                </span>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {availableCredentials.map((cred) => {
                  const isCurrent = email.toLowerCase() === cred.user.email.toLowerCase();

                  return (
                    <div
                      key={cred.user.id}
                      className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                        isCurrent
                          ? 'bg-[#151f38] border-[#92C842] shadow-md ring-1 ring-[#92C842]/40'
                          : 'bg-[#0b1222] border-[#1e2d4d] hover:border-slate-600'
                      }`}
                    >
                      <div className="space-y-2">
                        {/* Top Identity Tag */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-[#090e1c]"
                              style={{ backgroundColor: cred.user.avatarColor }}
                            >
                              {cred.user.initials}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white">{cred.user.name}</div>
                              <div className="text-[10px] font-mono text-slate-400">{cred.badge}</div>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-[#92C842] font-semibold">
                            {cred.user.role}
                          </span>
                        </div>

                        {/* Credentials Copy Strip */}
                        <div className="p-2 rounded bg-[#070b14] border border-[#1e2d4d]/70 text-[11px] font-mono space-y-1">
                          <div className="flex items-center justify-between text-slate-300">
                            <span className="truncate max-w-[170px]">{cred.user.email}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(cred.user.email, `${cred.user.id}_email`)}
                              className="text-slate-400 hover:text-white"
                              title="Copy Email"
                            >
                              {copiedKey === `${cred.user.id}_email` ? (
                                <span className="text-[#92C842] text-[10px]">Copied!</span>
                              ) : (
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                                </svg>
                              )}
                            </button>
                          </div>
                          <div className="flex items-center justify-between text-slate-400 border-t border-[#1e2d4d]/40 pt-1">
                            <span className="text-[#92C842]">{cred.passwordText}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(cred.passwordText, `${cred.user.id}_pwd`)}
                              className="text-slate-400 hover:text-white"
                              title="Copy Password"
                            >
                              {copiedKey === `${cred.user.id}_pwd` ? (
                                <span className="text-[#92C842] text-[10px]">Copied!</span>
                              ) : (
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-400 leading-tight">
                          {cred.description}
                        </p>
                      </div>

                      {/* 1-Click Action */}
                      <button
                        type="button"
                        onClick={() => handleQuickSignIn(cred)}
                        className={`w-full mt-3 py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                          isCurrent
                            ? 'bg-[#92C842] text-[#090e1c] font-bold shadow-sm'
                            : 'bg-[#151f38] hover:bg-[#1a2745] text-slate-200 border border-[#1e2d4d] hover:border-[#92C842]/50'
                        }`}
                      >
                        <span>1-Click Sign In as {cred.user.initials}</span>
                        <span className="font-mono">→</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ON-DEMAND AUDITOR CREDENTIAL GENERATOR */}
            <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      Dynamic Auditor Credential Generator
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Need a new session key? Generate a temporary cryptographic inspection account on the fly.
                    </p>
                  </div>
                </div>

                {/* Scope Selector */}
                <div className="flex items-center gap-2">
                  <select
                    value={genHub}
                    onChange={(e) => setGenHub(e.target.value as any)}
                    className="bg-[#151f38] text-slate-300 border border-[#1e2d4d] rounded-lg px-2.5 py-1 text-xs font-mono outline-none"
                  >
                    <option value="All">All 4 Hubs</option>
                    <option value="Lagos">Lagos Sector</option>
                    <option value="Ibadan">Ibadan Sector</option>
                    <option value="Ogun">Ogun Corridor</option>
                    <option value="Benin">Benin Sector</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleGenerateNewCredential}
                    className="px-3.5 py-1.5 rounded-lg bg-[#92C842]/15 hover:bg-[#92C842]/25 text-[#92C842] border border-[#92C842]/40 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                    <span>Generate Key</span>
                  </button>
                </div>
              </div>

              {/* Generated Dynamic Credential Display */}
              {generatedList.length > 0 && (
                <div className="space-y-2.5 pt-2 border-t border-[#1e2d4d]/60">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">
                    RECENTLY GENERATED ACTIVE KEYS ({generatedList.length}):
                  </div>
                  <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                    {generatedList.map((g) => (
                      <div
                        key={g.user.id}
                        className="p-2.5 rounded-lg bg-[#0b1222] border border-[#1e2d4d] flex items-center justify-between text-xs font-mono"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                          <div>
                            <span className="text-white font-bold">{g.user.name}</span>
                            <span className="text-slate-400 text-[10px] ml-2">({g.user.email})</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-amber-300 font-semibold">{g.passwordText}</span>
                          <button
                            type="button"
                            onClick={() => handleQuickSignIn(g)}
                            className="px-2 py-0.5 rounded bg-[#92C842] text-[#090e1c] text-[10px] font-bold hover:bg-[#7bb32e]"
                          >
                            Use Now
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#1e2d4d]/80 bg-[#090e1c] px-4 lg:px-8 py-3 text-center text-xs text-slate-500 font-mono">
        <div>© 2026 KEA Corporate Hospitality Services Ltd. All Operations &amp; Field Telemetry Protected.</div>
      </footer>

    </div>
  );
};
