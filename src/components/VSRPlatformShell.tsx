import React, { ReactNode, useState } from 'react';
import { BarChart3, FileText, LayoutGrid, Menu, Truck, Users, X } from 'lucide-react';
import { AuthUser } from '../types';

interface VSRPlatformShellProps {
  user: AuthUser;
  onSignOut: () => void;
  activeSection: string;
  onNavigate: (section: string) => void;
  onHubChange: (hub: string) => void;
  children: ReactNode;
}

const navigation = [
  { id: 'route-command', label: 'Route Command', icon: LayoutGrid },
  { id: 'crew-directory', label: 'Staff Directory', icon: Users },
  { id: 'reports-requests-support', label: 'Messages & Alerts', icon: FileText },
  { id: 'fleet-operations', label: 'Field Operations', icon: Truck },
  { id: 'performance-trends', label: 'Performance Trends', icon: BarChart3 }
];

export const VSRPlatformShell: React.FC<VSRPlatformShellProps> = ({ user, onSignOut, activeSection, onNavigate, onHubChange, children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedHub, setSelectedHub] = useState('All Hubs');
  const [syncSeconds, setSyncSeconds] = useState(11);

  React.useEffect(() => {
    const timer = window.setInterval(() => setSyncSeconds((seconds) => (seconds >= 60 ? 1 : seconds + 1)), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const sidebar = (
    <div className="flex h-full flex-col justify-between bg-white">
      <div>
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div className="flex items-center gap-3">
            <img alt="KEA Corporate Hospitality Services" className="h-9 w-auto object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCaM-FAr5FKmzgGhQH5eWL6YXxVuMYXgDAKFN_R7hja3iHfyknwvu7yBhjXKUY76ANao3E5ud0dMVdQUxs77cYxyUZEKntxE1DScy8Z93vCQATIEgwPqiO5DlH9-u0drJ3mWKWUtwTECHt1jRISb007pK6PvRhC9pIG5ksxGsFw84QPcvxwqc723WynagMHw61ou_Ly3A8r3i63Tup_-nO-uwIGfhGiR_WhE0xBrmd7illUTzyX9bHWqEMC0UMMWEctYg" />
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-800">KEA Operations</div>
              <div className="text-[10px] font-semibold tracking-tight text-emerald-700">Field Command</div>
            </div>
          </div>
          <button onClick={() => setMobileOpen(false)} className="rounded p-1 text-slate-400 hover:text-slate-700 md:hidden" title="Close menu"><X size={16} /></button>
        </div>
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[11px] font-bold tracking-wider text-slate-800">LIVE SYNC</span>
          </div>
          <span className="font-mono text-xs font-semibold text-emerald-700">98.6%</span>
        </div>
        <nav className="space-y-1 p-3">
          {navigation.map(({ id, label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => { onNavigate(id); setMobileOpen(false); }}
              className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                activeSection === id
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800 font-semibold shadow-xs'
                  : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon size={16} className={activeSection === id ? 'text-emerald-700' : 'text-slate-400'} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>
      <div>
        <div className="mx-3 mb-2 flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold text-white shadow-xs" style={{ backgroundColor: user.avatarColor || '#10b981' }}>{user.initials}</div>
            <div className="min-w-0">
              <div className="truncate text-xs font-bold text-slate-900">{user.name}</div>
              <div className="truncate font-mono text-[10px] text-emerald-700">SUPER ADMIN</div>
            </div>
          </div>
          <button onClick={onSignOut} className="shrink-0 rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 shadow-xs" title="Sign out">
            <span className="text-xs">↪</span>
          </button>
        </div>
        <div className="border-t border-slate-100 bg-slate-50/70 p-4 text-xs">
          <div className="mb-1 flex items-center justify-between text-[11px] font-semibold text-slate-600">
            <span>DATABASE SYNC</span>
            <span className="text-emerald-700">ONLINE</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span className="text-emerald-600">↻</span>
            <span className="truncate">Synced {syncSeconds}s ago</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full bg-[#f8fafc] text-slate-800">
      <aside className="hidden w-64 shrink-0 border-r border-slate-200/90 bg-white md:flex md:flex-col shadow-[0_2px_8px_rgba(0,0,0,0.03)]">{sidebar}</aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setMobileOpen(false)} />
          <aside className="relative z-50 flex h-full w-64 max-w-[80vw] flex-col border-r border-slate-200 bg-white">{sidebar}</aside>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-slate-200/90 bg-white shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 lg:px-6">
            <div className="flex items-center gap-2 overflow-x-auto py-1 text-xs">
              <button onClick={() => setMobileOpen(true)} className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-700 md:hidden" title="Open menu">
                <Menu size={16} />
              </button>
              {['All Hubs', 'Lagos', 'Ibadan', 'Ogun', 'Benin'].map((hub) => (
                <button
                  key={hub}
                  onClick={() => { setSelectedHub(hub); onHubChange(hub); }}
                  className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    selectedHub === hub
                      ? 'border border-emerald-200 bg-emerald-50 text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {hub === 'All Hubs' ? 'All Hubs' : `${hub} Hub`}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden items-center gap-2 text-xs font-mono text-slate-500 sm:flex">
                <span className="text-emerald-600">↻</span>
                <span>Live Sync: <span className="text-slate-800 font-semibold">{syncSeconds}s ago</span></span>
              </div>
              <div className="relative flex items-center gap-2 border-l border-slate-200 pl-3">
                <div className="hidden text-right sm:block">
                  <div className="text-xs font-bold text-slate-900">{user.name}</div>
                  <div className="max-w-[150px] truncate text-[10px] font-medium uppercase tracking-wider text-emerald-700">{user.roleTitle}</div>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 font-mono text-xs font-bold text-white shadow-xs" style={{ backgroundColor: user.avatarColor || '#10b981' }}>{user.initials}</div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 bg-slate-50/70 px-4 py-2 text-xs lg:px-6">
            <span className="flex items-center gap-2 text-emerald-700 font-semibold text-[11px]">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              ROUTE TRACKER ACTIVE
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600">Auto-syncing field staff live data</span>
            <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 font-mono text-[10px] text-slate-700 shadow-xs">{selectedHub}</span>
            <span className="ml-auto hidden text-slate-500 sm:block">{user.assignedRegion} scope • Super Admin Access</span>
          </div>
        </header>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
};
