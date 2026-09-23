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
  { id: 'crew-directory', label: 'Crew Directory', icon: Users },
  { id: 'reports-requests-support', label: 'Message', icon: FileText },
  { id: 'fleet-operations', label: 'Fleet Operations', icon: Truck },
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
    <div className="flex h-full flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-[#1e2d4d] p-5">
          <div className="flex items-center gap-3">
            <img alt="KEA Corporate Hospitality Services" className="h-10 w-auto object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCaM-FAr5FKmzgGhQH5eWL6YXxVuMYXgDAKFN_R7hja3iHfyknwvu7yBhjXKUY76ANao3E5ud0dMVdQUxs77cYxyUZEKntxE1DScy8Z93vCQATIEgwPqiO5DlH9-u0drJ3mWKWUtwTECHt1jRISb007pK6PvRhC9pIG5ksxGsFw84QPcvxwqc723WynagMHw61ou_Ly3A8r3i63Tup_-nO-uwIGfhGiR_WhE0xBrmd7illUTzyX9bHWqEMC0UMMWEctYg" />
            <div><div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Operations Suite</div><div className="text-[10px] font-medium tracking-tight text-[#92C842]">KEA Hospitality</div></div>
          </div>
          <button onClick={() => setMobileOpen(false)} className="rounded p-1 text-slate-400 hover:text-white md:hidden" title="Close menu"><X size={16} /></button>
        </div>
        <div className="flex items-center justify-between border-b border-[#1e2d4d]/60 bg-[#090e1c]/40 px-5 py-3 text-xs"><div className="flex items-center gap-2"><span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#92C842] opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-[#92C842]" /></span><span className="text-[11px] font-bold tracking-wider text-white">LIVE OPERATIONS</span></div><span className="font-mono text-xs font-medium text-slate-400">98.6%</span></div>
        <nav className="space-y-1 p-3">
          {navigation.map(({ id, label, icon: Icon }) => <button key={label} onClick={() => { onNavigate(id); setMobileOpen(false); }} className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-sm font-medium transition ${activeSection === id ? 'border-[#92C842]/30 bg-[#92C842]/10 text-[#92C842] shadow-[0_0_12px_rgba(146,200,66,0.08)]' : 'border-transparent text-slate-400 hover:bg-[#151f38] hover:text-slate-100'}`}><Icon size={16} /><span>{label}</span></button>)}
        </nav>
      </div>
      <div><div className="mx-3 mb-2 flex items-center justify-between gap-2 rounded-xl border border-[#1e2d4d] bg-[#090e1c] p-3.5"><div className="flex min-w-0 items-center gap-2.5"><div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold text-[#090e1c]" style={{ backgroundColor: user.avatarColor }}>{user.initials}</div><div className="min-w-0"><div className="truncate text-xs font-bold text-white">{user.name}</div><div className="truncate font-mono text-[10px] text-[#92C842]">VSR PLATFORM</div></div></div><button onClick={onSignOut} className="shrink-0 rounded-lg border border-[#1e2d4d] bg-[#151f38] p-1.5 text-slate-400 hover:border-red-500/30 hover:bg-red-500/20 hover:text-red-300" title="Sign out"><span className="text-xs">↪</span></button></div><div className="border-t border-[#1e2d4d] bg-[#090e1c]/80 p-4 text-xs"><div className="mb-1 flex items-center justify-between text-[11px] font-semibold text-slate-400"><span>SYNC ENGINE</span><span className="text-[#92C842]">ONLINE</span></div><div className="flex items-center gap-2 text-[11px] text-slate-400"><span className="text-[#92C842]">↻</span><span className="truncate">Synced {syncSeconds}s ago</span></div></div></div>
    </div>
  );

  return <div className="flex min-h-screen w-full bg-[#090e1c] text-slate-200"><aside className="hidden w-64 shrink-0 border-r border-[#1e2d4d] bg-[#0b1222] md:flex md:flex-col">{sidebar}</aside>{mobileOpen && <div className="fixed inset-0 z-50 flex md:hidden"><div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} /><aside className="relative z-50 flex h-full w-64 max-w-[80vw] flex-col border-r border-[#1e2d4d] bg-[#0b1222]">{sidebar}</aside></div>}<div className="flex min-w-0 flex-1 flex-col"><header className="sticky top-0 z-20 border-b border-[#1e2d4d] bg-[#0e1628]"><div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3.5 lg:px-6"><div className="flex items-center gap-2 overflow-x-auto py-1 text-xs"><button onClick={() => setMobileOpen(true)} className="rounded-lg border border-[#1e2d4d] bg-[#151f38] p-2 text-slate-300 md:hidden" title="Open menu"><Menu size={16} /></button>{['All Hubs', 'Lagos', 'Ibadan', 'Ogun / Abeokuta', 'Benin'].map((hub) => <button key={hub} onClick={() => { setSelectedHub(hub); onHubChange(hub); }} className={`whitespace-nowrap rounded-md px-3.5 py-1.5 font-semibold ${selectedHub === hub ? 'border border-[#1e2d4d] bg-[#151f38] text-white' : 'text-slate-400 hover:bg-[#151f38]/60 hover:text-slate-200'}`}>{hub}</button>)}</div><div className="flex items-center gap-4"><div className="hidden items-center gap-2 text-xs font-mono text-slate-400 sm:flex"><span className="text-[#92C842]">↻</span><span>Live Log Sync: <span className="text-slate-200">{syncSeconds}s ago</span></span></div><div className="relative flex items-center gap-2 border-l border-[#1e2d4d] pl-3"><div className="hidden text-right sm:block"><div className="text-xs font-bold text-slate-100">{user.name}</div><div className="max-w-[150px] truncate text-[10px] font-medium uppercase tracking-wider text-[#92C842]">{user.roleTitle}</div></div><div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#92C842]/40 font-mono text-xs font-bold text-[#090e1c]" style={{ backgroundColor: user.avatarColor }}>{user.initials}</div></div></div></div><div className="flex flex-wrap items-center gap-3 border-t border-[#1e2d4d]/60 px-4 py-2.5 text-xs lg:px-6"><span className="flex items-center gap-2 text-[#92C842]"><span className="h-2 w-2 rounded-full bg-[#92C842]" />ROUTE TRACKING ACTIVE</span><span className="text-slate-600">•</span><span className="text-slate-300">Auto-syncing VSR fleet route data</span><span className="rounded border border-[#1e2d4d] bg-[#151f38] px-2 py-1 font-mono text-[10px] text-slate-300">{selectedHub}</span><span className="ml-auto hidden text-slate-400 sm:block">{user.assignedRegion} scope · internal field operations</span></div></header><main className="min-w-0 flex-1">{children}</main></div></div>;
};
