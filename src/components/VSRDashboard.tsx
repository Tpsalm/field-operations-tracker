import React, { useMemo, useState } from 'react';
import { ChevronDown, Search, Signpost, Truck, Users, X } from 'lucide-react';
import { AuthUser } from '../types';
import { WorkflowCenter } from './WorkflowCenter';
import { VSRPlatformShell } from './VSRPlatformShell';

interface VSRDashboardProps {
  user: AuthUser;
  onSignOut: () => void;
}

type CrewStatus = 'En Route' | 'Delayed' | 'Completed' | 'Idle';
type KpiFilter = 'all' | 'vsr' | 'assistants' | 'routes' | 'fleet';

interface CrewRecord {
  id: string;
  name: string;
  assistant: string;
  assistantId: string;
  region: 'Lagos' | 'Ibadan' | 'Ogun' | 'Benin';
  state: string;
  lga: string;
  territory: string;
  route: string;
  routeCode: string;
  visits: number;
  status: CrewStatus;
  vanStatus: 'On road' | 'Idle';
  color: string;
  points: [number, number][];
  lastPing: string;
}

const CREW: CrewRecord[] = [
  { id: 'VSR-LG-1042', name: 'Ruth Eze', assistant: 'Chinedu Okafor', assistantId: 'AV-LG-218', region: 'Lagos', state: 'Lagos', lga: 'Lagos Island', territory: 'Island Core', route: 'Mile 2 - Eko Atlantic', routeCode: 'LG-IS-04', visits: 14, status: 'En Route', vanStatus: 'On road', color: '#10b981', points: [[18, 74], [31, 64], [43, 57], [55, 43], [67, 38], [81, 24]], lastPing: '2 min ago' },
  { id: 'VSR-LG-1068', name: 'Folashade Alabi', assistant: 'Mariam Bello', assistantId: 'AV-LG-231', region: 'Lagos', state: 'Lagos', lga: 'Ikeja', territory: 'Trade Fair Corridor', route: 'Ikeja - Alaba', routeCode: 'LG-TF-12', visits: 9, status: 'Delayed', vanStatus: 'On road', color: '#f59e0b', points: [[13, 52], [28, 48], [39, 42], [51, 51], [60, 62]], lastPing: '7 min ago' },
  { id: 'VSR-IB-0891', name: 'Akinfolarin Dada', assistant: 'Tosin Adeyemi', assistantId: 'AV-IB-142', region: 'Ibadan', state: 'Oyo', lga: 'Ibadan North', territory: 'Bodija Cluster', route: 'Bodija - Mokola', routeCode: 'IB-BD-07', visits: 18, status: 'Completed', vanStatus: 'Idle', color: '#0284c7', points: [[22, 70], [34, 63], [43, 52], [56, 48], [73, 49], [82, 35]], lastPing: '12 min ago' },
  { id: 'VSR-OG-0714', name: 'Emeka Nwosu', assistant: 'Bisi Adebayo', assistantId: 'AV-OG-104', region: 'Ogun', state: 'Ogun', lga: 'Abeokuta South', territory: 'Abeokuta Trade', route: 'Abeokuta - Sagamu', routeCode: 'OG-AS-03', visits: 11, status: 'En Route', vanStatus: 'On road', color: '#8b5cf6', points: [[14, 65], [27, 59], [38, 61], [48, 45], [62, 38], [75, 28]], lastPing: '4 min ago' },
  { id: 'VSR-BN-0549', name: 'Grace Omoregie', assistant: 'Peter Igbinovia', assistantId: 'AV-BN-077', region: 'Benin', state: 'Edo', lga: 'Oredo', territory: 'Central Benin', route: 'Ring Road - Airport', routeCode: 'BN-OR-02', visits: 7, status: 'Idle', vanStatus: 'Idle', color: '#f43f5e', points: [[20, 54], [35, 44], [49, 38], [65, 43], [79, 31]], lastPing: '26 min ago' },
  { id: 'VSR-LG-1102', name: 'Yusuf Lawal', assistant: 'Ifeoma Obi', assistantId: 'AV-LG-246', region: 'Lagos', state: 'Lagos', lga: 'Surulere', territory: 'Mainland West', route: 'Surulere - Yaba', routeCode: 'LG-SY-08', visits: 16, status: 'Completed', vanStatus: 'Idle', color: '#06b6d4', points: [[16, 32], [29, 38], [41, 29], [54, 34], [68, 22], [83, 27]], lastPing: '18 min ago' }
];

const statusStyles: Record<CrewStatus, string> = {
  'En Route': 'border-emerald-200 bg-emerald-50 text-emerald-700',
  Delayed: 'border-amber-200 bg-amber-50 text-amber-700',
  Completed: 'border-sky-200 bg-sky-50 text-sky-700',
  Idle: 'border-slate-200 bg-slate-100 text-slate-700'
};

const selectClass = 'w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none transition focus:border-emerald-500 shadow-xs';

export const VSRDashboard: React.FC<VSRDashboardProps> = ({ user, onSignOut }) => {
  const loginMeta = user.sessionMeta;
  const validSections = ['route-command', 'crew-directory', 'reports-requests-support', 'fleet-operations', 'performance-trends'] as const;

  const getInitialSection = () => {
    if (typeof window === 'undefined') return 'route-command';
    const hash = window.location.hash.replace('#', '');
    return validSections.includes(hash as (typeof validSections)[number]) ? hash : 'route-command';
  };

  const [activeSection, setActiveSection] = useState<string>(getInitialSection());
  const [activeKpi, setActiveKpi] = useState<KpiFilter>('all');
  const [selectedId, setSelectedId] = useState(CREW[0].id);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ region: 'All', state: 'All', lga: 'All', territory: 'All', route: 'All', crew: 'All' });

  const selectedCrew = CREW.find((crew) => crew.id === selectedId) || CREW[0];
  const formatSignedIn = loginMeta ? new Date(loginMeta.signedInAt).toLocaleString('en-NG', { timeZone: loginMeta.timezone, dateStyle: 'medium', timeStyle: 'short' }) : 'Active';

  const available = useMemo(() => {
    let result = CREW.filter((crew) => {
      const query = search.toLowerCase();
      const matchesText = !query || [crew.name, crew.id, crew.assistant, crew.routeCode].some((value) => value.toLowerCase().includes(query));
      const matchesFilters = (filters.region === 'All' || crew.region === filters.region)
        && (filters.state === 'All' || crew.state === filters.state)
        && (filters.lga === 'All' || crew.lga === filters.lga)
        && (filters.territory === 'All' || crew.territory === filters.territory)
        && (filters.route === 'All' || crew.routeCode === filters.route)
        && (filters.crew === 'All' || crew.id === filters.crew);
      return matchesText && matchesFilters;
    });

    if (activeKpi === 'assistants') result = result.filter((crew) => crew.assistant);
    if (activeKpi === 'routes') result = result.filter((crew) => crew.routeCode);
    if (activeKpi === 'fleet') result = result.filter((crew) => crew.vanStatus === 'On road');
    if (activeKpi === 'vsr') result = result.filter((crew) => crew.status !== 'Idle');
    return result;
  }, [activeKpi, filters, search]);

  const updateFilter = (key: keyof typeof filters, value: string) => setFilters((current) => ({ ...current, [key]: value }));
  const resetFilters = () => {
    setSearch('');
    setFilters({ region: 'All', state: 'All', lga: 'All', territory: 'All', route: 'All', crew: 'All' });
    setActiveKpi('all');
  };

  const navigateToSection = (section: string) => {
    if (!validSections.includes(section as (typeof validSections)[number])) return;
    setActiveSection(section);
    const nextHash = `#${section}`;
    if (window.history.pushState) {
      window.history.pushState(null, '', nextHash);
    } else {
      window.location.hash = section;
    }
  };

  React.useEffect(() => {
    const handleHash = () => {
      const nextSection = getInitialSection();
      setActiveSection(nextSection);
    };

    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const trendBars = [
    { label: 'Visits completed', value: 78, color: '#10b981' },
    { label: 'Route adherence', value: 91, color: '#0284c7' },
    { label: 'Fleet availability', value: 67, color: '#f59e0b' }
  ];

  const kpis = [
    { id: 'vsr' as const, label: 'Field Staff (VSRs)', value: '6', note: 'Primary field officers', icon: Users, color: '#10b981' },
    { id: 'assistants' as const, label: 'Assistant Staff', value: '6', note: 'Active in stores', icon: Users, color: '#0284c7' },
    { id: 'routes' as const, label: 'Assigned Routes', value: '12', note: '6 active corridors', icon: Signpost, color: '#8b5cf6' },
    { id: 'fleet' as const, label: 'Active Field Vans', value: '4 / 6', note: 'Vans on route / total', icon: Truck, color: '#f59e0b' }
  ];

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'crew-directory':
        return (
          <section className="grid min-h-[535px] gap-5 lg:grid-cols-[minmax(320px,0.4fr)_minmax(0,0.6fr)]">
            <article id="crew-directory" className="scroll-mt-28 overflow-hidden rounded-[12px] border border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
              <div className="border-b border-slate-100 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Staff directory</div>
                    <h2 className="mt-1 text-base font-bold text-slate-900">Field Staff &amp; Assistants</h2>
                  </div>
                  <span className="text-xs font-mono text-slate-500">{available.length} staff</span>
                </div>
                <div className="relative mt-4">
                  <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search name, code, route..."
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 outline-none focus:border-emerald-500 placeholder-slate-400"
                  />
                </div>
              </div>
              <div className="max-h-[445px] divide-y divide-slate-100 overflow-y-auto">
                {available.map((crew) => (
                  <button
                    key={crew.id}
                    onClick={() => setSelectedId(crew.id)}
                    className={`w-full p-4 text-left transition ${selectedId === crew.id ? 'bg-emerald-50/50' : 'hover:bg-slate-50'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold text-white shadow-xs" style={{ backgroundColor: crew.color }}>
                          {crew.name.split(' ').map((part) => part[0]).join('')}
                        </span>
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{crew.name}</div>
                          <div className="text-[10px] font-mono text-slate-500">{crew.id} · {crew.routeCode}</div>
                        </div>
                      </div>
                      <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${statusStyles[crew.status]}`}>{crew.status}</span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-[11px]">
                      <div>
                        <span className="text-slate-400">Assistant</span>
                        <div className="text-slate-700 font-medium">{crew.assistant}</div>
                      </div>
                      <div>
                        <span className="text-slate-400">Branch</span>
                        <div className="text-slate-700 font-medium">{crew.region}</div>
                      </div>
                      <div>
                        <span className="text-slate-400">Visits</span>
                        <div className="text-slate-700 font-medium">{crew.visits}</div>
                      </div>
                      <div>
                        <span className="text-slate-400">Last Active</span>
                        <div className="text-slate-700 font-medium">{crew.lastPing}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </article>

            <article className="overflow-hidden rounded-[12px] border border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
              <div className="border-b border-slate-100 p-4">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Selected Staff Profile</div>
                <h2 className="mt-1 text-base font-bold text-slate-900">{selectedCrew.name}</h2>
              </div>
              <div className="space-y-4 p-4 text-sm text-slate-700">
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5">
                  <span className="text-slate-500 text-xs">Route</span>
                  <span className="font-semibold text-slate-900 text-xs">{selectedCrew.route}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Status</div>
                    <div className="mt-1 font-semibold text-slate-900">{selectedCrew.status}</div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Field Van</div>
                    <div className="mt-1 font-semibold text-slate-900">{selectedCrew.vanStatus}</div>
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Assistant Staff</div>
                  <div className="mt-1 font-semibold text-slate-900">{selectedCrew.assistant}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Coverage Summary</div>
                  <div className="mt-1 text-slate-800 font-medium">{selectedCrew.visits} store visits completed</div>
                </div>
              </div>
            </article>
          </section>
        );

      case 'reports-requests-support':
        return (
          <section className="scroll-mt-28 rounded-[12px] border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Operations Desk</div>
                <h2 className="mt-1 text-base font-bold text-slate-900">Messages &amp; Directives</h2>
              </div>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">Live Inbox</span>
            </div>
            <p className="mt-4 text-xs text-slate-500">All live messages from store field teams and supervisors will display here.</p>
          </section>
        );

      case 'fleet-operations':
        return (
          <section id="fleet-operations" className="scroll-mt-28 rounded-[12px] border border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
            <div className="border-b border-slate-100 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Field operations ledger</div>
                  <h2 className="mt-1 text-base font-bold text-slate-900">Staff &amp; Route Activity</h2>
                </div>
                <button onClick={resetFilters} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800"><X size={14} /> Clear filters</button>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {(['region', 'state', 'lga', 'territory', 'route', 'crew'] as const).map((key) => {
                  const options = Array.from(new Set(CREW.map((crew) => key === 'crew' ? crew.id : key === 'route' ? crew.routeCode : crew[key])));
                  return (
                    <label key={key} className="relative">
                      <span className="mb-1 block text-[9px] font-semibold uppercase tracking-wider text-slate-500">{key === 'crew' ? 'Staff Code' : key}</span>
                      <select className={selectClass} value={filters[key]} onChange={(event) => updateFilter(key, event.target.value)}>
                        <option>All</option>
                        {options.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-7 text-slate-400" />
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Staff ID</th>
                    <th className="px-4 py-3">Staff Name</th>
                    <th className="px-4 py-3">Assistant</th>
                    <th className="px-4 py-3">Territory</th>
                    <th className="px-4 py-3">Route Code</th>
                    <th className="px-4 py-3">Visits Done</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {available.map((crew) => (
                    <tr key={crew.id} className="cursor-pointer hover:bg-slate-50" onClick={() => setSelectedId(crew.id)}>
                      <td className="px-4 py-3 text-xs font-mono text-slate-600">{crew.id}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg text-[9px] font-bold text-white shadow-xs" style={{ backgroundColor: crew.color }}>
                            {crew.name.split(' ').map((part) => part[0]).join('')}
                          </span>
                          <span className="text-xs font-semibold text-slate-900">{crew.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">{crew.assistant}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{crew.territory}</td>
                      <td className="px-4 py-3 text-xs font-mono text-slate-600">{crew.routeCode}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{crew.visits}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${statusStyles[crew.status]}`}>{crew.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );

      case 'performance-trends':
        return (
          <section id="performance-trends" className="scroll-mt-28 rounded-[12px] border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Performance trends</div>
                <h2 className="mt-1 text-base font-bold text-slate-900">Field Network Health</h2>
              </div>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">Live Snapshot</span>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {trendBars.map((trend) => (
                <div key={trend.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                    <span>{trend.label}</span>
                    <span className="font-mono text-slate-900 font-bold">{trend.value}%</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-2 rounded-full" style={{ width: `${trend.value}%`, backgroundColor: trend.color }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        );

      case 'route-command':
      default:
        return (
          <section id="route-command">
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Today's Summary</div>
                <h2 className="mt-1 text-lg font-bold text-slate-900">Field Coverage at a Glance</h2>
              </div>
              <div className="text-xs text-slate-500">Last updated {selectedCrew.lastPing}</div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {kpis.map((kpi) => {
                const Icon = kpi.icon;
                const active = activeKpi === kpi.id;
                return (
                  <button
                    key={kpi.id}
                    onClick={() => setActiveKpi(active ? 'all' : kpi.id)}
                    className={`group rounded-[12px] border p-4 text-left transition ${
                      active
                        ? 'border-emerald-500 bg-emerald-50/40 shadow-[0_2px_8px_rgba(16,185,129,0.12)]'
                        : 'border-slate-200/80 bg-white hover:border-slate-300 shadow-[0_2px_8px_rgba(0,0,0,0.03)]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{kpi.label}</div>
                        <div className="mt-2 text-2xl font-bold text-slate-900">{kpi.value}</div>
                        <div className="mt-1 text-xs text-slate-500">{kpi.note}</div>
                      </div>
                      <span className="rounded-xl p-2.5" style={{ color: kpi.color, backgroundColor: `${kpi.color}15` }}>
                        <Icon size={18} />
                      </span>
                    </div>
                    <div className="mt-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: active ? '#059669' : '#94a3b8' }}>
                      {active ? 'Filtering active' : 'Click to filter'}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        );
    }
  };

  return (
    <VSRPlatformShell user={user} onSignOut={onSignOut} activeSection={activeSection} onNavigate={navigateToSection} onHubChange={(hub) => updateFilter('region', hub === 'All Hubs' ? 'All' : hub === 'Ogun / Abeokuta' ? 'Ogun' : hub)}>
      <div className="min-h-screen bg-[#f8fafc] text-slate-800">
        <main className="mx-auto max-w-[1500px] space-y-6 px-5 py-6">{renderActiveSection()}</main>
      </div>
    </VSRPlatformShell>
  );
};
