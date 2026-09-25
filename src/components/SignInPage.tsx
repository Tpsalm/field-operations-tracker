import React, { useState } from 'react';
import { AuthUser, GeneratedCredential } from '../types';
import { PRESET_CREDENTIALS, verifyCredentials, generateCustomAuditorCredential } from '../data/credentialsData';
import { Lock, Mail, CheckCircle, Shield, ArrowRight, Copy, Key, UserCheck, Eye, EyeOff } from 'lucide-react';

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

  // Dynamic Generator State
  const [generatedList, setGeneratedList] = useState<GeneratedCredential[]>([]);
  const [genHub, setGenHub] = useState<'All' | 'Lagos' | 'Ibadan' | 'Ogun' | 'Benin'>('Lagos');

  // Handle Form Submission
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      let authenticatedUser = verifyCredentials(email, password);

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
        setErrorMessage('Invalid corporate credentials. Please select one of the pre-generated accounts below or generate a temporary audit key.');
      }
    }, 400);
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
    }, 300);
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
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col justify-between font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* TOP COMPLIANCE BAR */}
      <header className="border-b border-slate-200/80 bg-white px-4 lg:px-8 py-3 flex items-center justify-between text-xs text-slate-500 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            SECURE ACCESS GATEWAY
          </span>
          <span className="hidden sm:inline text-slate-300">|</span>
          <span className="hidden sm:inline text-slate-600 font-medium">KEA Corporate Hospitality Services Ltd.</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono">
          <span className="text-slate-400">WAT Time Zone (UTC+1)</span>
          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
            TLS 1.3 Encrypted
          </span>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-6xl w-full mx-auto px-4 py-8 lg:py-12 flex-1 flex flex-col justify-center">
        
        {/* BRAND HERO */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-600 text-white font-black text-xl shadow-md shadow-emerald-600/20 mb-3">
            kea
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            KEA Operations Suite
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-lg mx-auto">
            Executive operations, sales staff allocations, field worker tracking, and shift compliance.
          </p>
        </div>

        {/* 2-COLUMN SIGN IN & GENERATOR GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: AUTHENTICATION FORM */}
          <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-[12px] p-6 sm:p-7 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  Sign In
                </h2>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-bold">
                  SUPER ADMIN
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Enter your work email and password, or click a demo account.
              </p>
            </div>

            {/* Error Notification */}
            {errorMessage && (
              <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5">
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Work Email Address:
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@keahospitality.ng"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all font-mono"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password:
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all font-mono"
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 cursor-pointer hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </span>
                </div>
              </div>

              {/* Remember Session */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-slate-300 text-emerald-600 focus:ring-0" />
                  <span>Stay signed in</span>
                </label>
                <span className="text-[11px] text-emerald-600 font-semibold">
                  Secure Session
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 mt-2 cursor-pointer"
              >
                {isLoading ? (
                  <span>Checking Credentials...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Sign In to Operations Suite</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick 1-Click Access as CEO */}
            <div className="pt-3 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={() => handleQuickSignIn(PRESET_CREDENTIALS[0])}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold transition-colors inline-flex items-center gap-1.5"
              >
                <span>Instant 1-Click Login as Tope Balogun (CEO)</span>
                <span>→</span>
              </button>
            </div>
          </div>

          {/* RIGHT: PRE-GENERATED ROLES & DEMO ACCOUNTS */}
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-white border border-slate-200/80 rounded-[12px] p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Authorized Demo Accounts (4 Roles)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Click any card below to log in immediately with that role.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-bold">
                  1-CLICK LOGIN
                </span>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRESET_CREDENTIALS.map((cred) => {
                  const isCurrent = email.toLowerCase() === cred.user.email.toLowerCase();

                  return (
                    <div
                      key={cred.user.id}
                      onClick={() => handleQuickSignIn(cred)}
                      className={`p-4 rounded-[12px] border transition-all cursor-pointer flex flex-col justify-between group ${
                        isCurrent
                          ? 'bg-emerald-50/50 border-emerald-400 shadow-sm'
                          : 'bg-white border-slate-200/80 hover:border-emerald-300 hover:shadow-xs'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span
                            className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white font-mono shadow-xs"
                            style={{ backgroundColor: cred.user.avatarColor || '#059669' }}
                          >
                            {cred.user.initials}
                          </span>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {cred.badge}
                          </span>
                        </div>
                        <div className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {cred.user.name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                          {cred.user.email}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-2 leading-relaxed line-clamp-2">
                          {cred.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="font-mono text-slate-400">Pass: {cred.passwordText}</span>
                        <span className="text-emerald-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Login →</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200/80 bg-white px-4 py-3.5 text-center text-xs text-slate-400">
        © 2026 KEA Corporate Hospitality Services Ltd. All Operations &amp; Field Telemetry Protected.
      </footer>
    </div>
  );
};
