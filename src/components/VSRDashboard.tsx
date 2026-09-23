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
  { id: 'VSR-LG-1042', name: 'Ruth Eze', assistant: 'Chinedu Okafor', assistantId: 'AV-LG-218', region: 'Lagos', state: 'Lagos', lga: 'Lagos Island', territory: 'Island Core', route: 'Mile 2 - Eko Atlantic', routeCode: 'LG-IS-04', visits: 14, status: 'En Route', vanStatus: 'On road', color: '#9bd34b', points: [[18, 74], [31, 64], [43, 57], [55, 43], [67, 38], [81, 24]], lastPing: '2 min ago' },
  { id: 'VSR-LG-1068', name: 'Folashade Alabi', assistant: 'Mariam Bello', assistantId: 'AV-LG-231', region: 'Lagos', state: 'Lagos', lga: 'Ikeja', territory: 'Trade Fair Corridor', route: 'Ikeja - Alaba', routeCode: 'LG-TF-12', visits: 9, status: 'Delayed', vanStatus: 'On road', color: '#f59e0b', points: [[13, 52], [28, 48], [39, 42], [51, 51], [60, 62]], lastPing: '7 min ago' },
  { id: 'VSR-IB-0891', name: 'Akinfolarin Dada', assistant: 'Tosin Adeyemi', assistantId: 'AV-IB-142', region: 'Ibadan', state: 'Oyo', lga: 'Ibadan North', territory: 'Bodija Cluster', route: 'Bodija - Mokola', routeCode: 'IB-BD-07', visits: 18, status: 'Completed', vanStatus: 'Idle', color: '#38bdf8', points: [[22, 70], [34, 63], [43, 52], [56, 48], [73, 49], [82, 35]], lastPing: '12 min ago' },
  { id: 'VSR-OG-0714', name: 'Emeka Nwosu', assistant: 'Bisi Adebayo', assistantId: 'AV-OG-104', region: 'Ogun', state: 'Ogun', lga: 'Abeokuta South', territory: 'Abeokuta Trade', route: 'Abeokuta - Sagamu', routeCode: 'OG-AS-03', visits: 11, status: 'En Route', vanStatus: 'On road', color: '#c084fc', points: [[14, 65], [27, 59], [38, 61], [48, 45], [62, 38], [75, 28]], lastPing: '4 min ago' },
  { id: 'VSR-BN-0549', name: 'Grace Omoregie', assistant: 'Peter Igbinovia', assistantId: 'AV-BN-077', region: 'Benin', state: 'Edo', lga: 'Oredo', territory: 'Central Benin', route: 'Ring Road - Airport', routeCode: 'BN-OR-02', visits: 7, status: 'Idle', vanStatus: 'Idle', color: '#fb7185', points: [[20, 54], [35, 44], [49, 38], [65, 43], [79, 31]], lastPing: '26 min ago' },
  { id: 'VSR-LG-1102', name: 'Yusuf Lawal', assistant: 'Ifeoma Obi', assistantId: 'AV-LG-246', region: 'Lagos', state: 'Lagos', lga: 'Surulere', territory: 'Mainland West', route: 'Surulere - Yaba', routeCode: 'LG-SY-08', visits: 16, status: 'Completed', vanStatus: 'Idle', color: '#22d3ee', points: [[16, 32], [29, 38], [41, 29], [54, 34], [68, 22], [83, 27]], lastPing: '18 min ago' }
];

const statusStyles: Record<CrewStatus, string> = {
  'En Route': 'border-[#92C842]/30 bg-[#92C842]/10 text-[#b5e86d]',
  Delayed: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
  Completed: 'border-sky-400/30 bg-sky-400/10 text-sky-300',
  Idle: 'border-slate-500/30 bg-slate-500/10 text-slate-300'
};

const selectClass = 'w-full appearance-none rounded-lg border border-[#263653] bg-[#0d1729] px-3 py-2 text-xs text-slate-200 outline-none transition focus:border-[#92C842]';

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
  const formatSignedIn = loginMeta ? new Date(loginMeta.signedInAt).toLocaleString('en-NG', { timeZone: loginMeta.timezone, dateStyle: 'medium', timeStyle: 'short' }) : 'Not captured';

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
    { label: 'Visits completed', value: 78, color: '#92C842' },
    { label: 'Route adherence', value: 91, color: '#38bdf8' },
    { label: 'Fleet availability', value: 67, color: '#f59e0b' }
  ];

  const kpis = [
    { id: 'vsr' as const, label: 'Total VSRs', value: '6', note: 'Primary drivers', icon: Users, color: '#92C842' },
    { id: 'assistants' as const, label: 'Assistant VSRs', value: '6', note: 'Active in field', icon: Users, color: '#38bdf8' },
    { id: 'routes' as const, label: 'Total Routes', value: '12', note: '6 active corridors', icon: Signpost, color: '#c084fc' },
    { id: 'fleet' as const, label: 'Active Fleet Status', value: '4 / 6', note: 'Vans on road / total', icon: Truck, color: '#f59e0b' }
  ];

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'crew-directory':
        return (
          <>
            <section className="grid min-h-[535px] gap-5 lg:grid-cols-[minmax(320px,0.4fr)_minmax(0,0.6fr)]">
              <article id="crew-directory" className="scroll-mt-28 overflow-hidden rounded-xl border border-[#20314d] bg-[#0b1627]">
                <div className="border-b border-[#20314d] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">Crew directory</div>
                      <h2 className="mt-1 text-base font-bold text-white">VSR &amp; assistant detail</h2>
                    </div>
                    <span className="text-xs font-mono text-slate-500">{available.length} crews</span>
                  </div>
                  <div className="relative mt-4">
                    <Search size={15} className="absolute left-3 top-2.5 text-slate-500" />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search name, ID, route..."
                      className="w-full rounded-lg border border-[#263653] bg-[#0d1729] py-2 pl-9 pr-3 text-xs text-white outline-none focus:border-[#92C842]"
                    />
                  </div>
                </div>
                <div className="max-h-[445px] divide-y divide-[#20314d] overflow-y-auto">
                  {available.map((crew) => (
                    <button
                      key={crew.id}
                      onClick={() => setSelectedId(crew.id)}
                      className={`w-full p-4 text-left transition ${selectedId === crew.id ? 'bg-[#14283a]' : 'hover:bg-[#101f32]'}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold text-[#07101d]" style={{ backgroundColor: crew.color }}>
                            {crew.name.split(' ').map((part) => part[0]).join('')}
                          </span>
                          <div>
                            <div className="text-sm font-semibold text-white">{crew.name}</div>
                            <div className="text-[10px] font-mono text-slate-500">{crew.id} · {crew.routeCode}</div>
                          </div>
                        </div>
                        <span className={`rounded-full border px-2 py-1 text-[9px] font-bold uppercase ${statusStyles[crew.status]}`}>{crew.status}</span>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-[11px]">
                        <div>
                          <span className="text-slate-500">Assistant</span>
                          <div className="text-slate-200">{crew.assistant}</div>
                        </div>
                        <div>
                          <span className="text-slate-500">Region</span>
                          <div className="text-slate-200">{crew.region}</div>
                        </div>
                        <div>
                          <span className="text-slate-500">Visits</span>
                          <div className="text-slate-200">{crew.visits}</div>
                        </div>
                        <div>
                          <span className="text-slate-500">Last ping</span>
                          <div className="text-slate-200">{crew.lastPing}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </article>

              <article className="overflow-hidden rounded-xl border border-[#20314d] bg-[#0b1627]">
                <div className="border-b border-[#20314d] p-4">
                  <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">Selected VSR</div>
                  <h2 className="mt-1 text-base font-bold text-white">{selectedCrew.name}</h2>
                </div>
                <div className="space-y-4 p-4 text-sm text-slate-300">
                  <div className="flex items-center justify-between rounded-lg border border-[#20314d] bg-[#0d1729] px-3 py-2">
                    <span className="text-slate-400">Route</span>
                    <span className="font-semibold text-white">{selectedCrew.route}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-[#20314d] bg-[#0d1729] p-3">
                      <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">Status</div>
                      <div className="mt-1 font-semibold text-white">{selectedCrew.status}</div>
                    </div>
                    <div className="rounded-lg border border-[#20314d] bg-[#0d1729] p-3">
                      <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">Van</div>
                      <div className="mt-1 font-semibold text-white">{selectedCrew.vanStatus}</div>
                    </div>
                  </div>
                  <div className="rounded-lg border border-[#20314d] bg-[#0d1729] p-3">
                    <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">Assistant</div>
                    <div className="mt-1 font-semibold text-white">{selectedCrew.assistant}</div>
                  </div>
                  <div className="rounded-lg border border-[#20314d] bg-[#0d1729] p-3">
                    <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">Coverage</div>
                    <div className="mt-1 text-white">{selectedCrew.visits} visits completed</div>
                  </div>
                </div>
              </article>
            </section>
            <WorkflowCenter user={user} />
          </>
        );

      case 'reports-requests-support':
        return (
          <>
            <section className="scroll-mt-28 rounded-xl border border-[#20314d] bg-[#0b1627] p-4">
              <div className="flex items-center justify-between gap-3 border-b border-[#20314d] pb-4">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">VSR support desk</div>
                  <h2 className="mt-1 text-base font-bold text-white">Message</h2>
                </div>
                <span className="rounded-full border border-[#92C842]/30 bg-[#92C842]/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#b5e86d]">Live inbox</span>
              </div>
            </section>
            <WorkflowCenter user={user} />
          </>
        );

      case 'fleet-operations':
        return (
          <>
            <section id="fleet-operations" className="scroll-mt-28 rounded-xl border border-[#20314d] bg-[#0b1627]">
              <div className="border-b border-[#20314d] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">Fleet operations ledger</div>
                    <h2 className="mt-1 text-base font-bold text-white">VSR roster &amp; route activity</h2>
                  </div>
                  <button onClick={resetFilters} className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"><X size={14} /> Clear filters</button>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                  {(['region', 'state', 'lga', 'territory', 'route', 'crew'] as const).map((key) => {
                    const options = Array.from(new Set(CREW.map((crew) => key === 'crew' ? crew.id : key === 'route' ? crew.routeCode : crew[key])));
                    return (
                      <label key={key} className="relative">
                        <span className="mb-1 block text-[9px] font-mono uppercase tracking-wider text-slate-500">{key === 'crew' ? 'VSR name / ID' : key}</span>
                        <select className={selectClass} value={filters[key]} onChange={(event) => updateFilter(key, event.target.value)}>
                          <option>All</option>
                          {options.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="pointer-events-none absolute right-2 top-7 text-slate-500" />
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left">
                  <thead className="bg-[#0d1729] text-[10px] uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Staff ID</th>
                      <th className="px-4 py-3">VSR name</th>
                      <th className="px-4 py-3">Assigned crew</th>
                      <th className="px-4 py-3">Current territory</th>
                      <th className="px-4 py-3">Active route code</th>
                      <th className="px-4 py-3">Visits completed</th>
                      <th className="px-4 py-3">Activity status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#20314d]">
                    {available.map((crew) => (
                      <tr key={crew.id} className="cursor-pointer hover:bg-[#101f32]" onClick={() => setSelectedId(crew.id)}>
                        <td className="px-4 py-3 text-xs font-mono text-slate-300">{crew.id}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-md text-[9px] font-bold text-[#07101d]" style={{ backgroundColor: crew.color }}>
                              {crew.name.split(' ').map((part) => part[0]).join('')}
                            </span>
                            <span className="text-xs font-semibold text-white">{crew.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-300">{crew.assistant}</td>
                        <td className="px-4 py-3 text-xs text-slate-300">{crew.territory}</td>
                        <td className="px-4 py-3 text-xs font-mono text-slate-300">{crew.routeCode}</td>
                        <td className="px-4 py-3 text-xs text-slate-300">{crew.visits}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full border px-2 py-1 text-[9px] font-bold uppercase ${statusStyles[crew.status]}`}>{crew.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
            <WorkflowCenter user={user} />
          </>
        );

      case 'performance-trends':
        return (
          <>
            <section id="performance-trends" className="scroll-mt-28 rounded-xl border border-[#20314d] bg-[#0b1627] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">Performance trends</div>
                  <h2 className="mt-1 text-base font-bold text-white">Field network health</h2>
                </div>
                <span className="rounded-full border border-[#92C842]/30 bg-[#92C842]/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#b5e86d]">Live snapshot</span>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {trendBars.map((trend) => (
                  <div key={trend.label} className="rounded-lg border border-[#20314d] bg-[#0d1729] p-4">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{trend.label}</span>
                      <span className="font-mono text-white">{trend.value}%</span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-[#1a2940]">
                      <div className="h-2 rounded-full" style={{ width: `${trend.value}%`, backgroundColor: trend.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
            <WorkflowCenter user={user} />
          </>
        );

      case 'route-command':
      default:
        return (
          <>
            <section id="route-command">
              <div className="mb-3 flex items-end justify-between gap-3">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-500">Fleet overview / today</div>
                  <h2 className="mt-1 text-lg font-bold text-white">Field coverage at a glance</h2>
                </div>
                <div className="text-xs text-slate-500">Last network sync {selectedCrew.lastPing}</div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {kpis.map((kpi) => {
                  const Icon = kpi.icon;
                  const active = activeKpi === kpi.id;
                  return (
                    <button
                      key={kpi.id}
                      onClick={() => setActiveKpi(active ? 'all' : kpi.id)}
                      className={`group rounded-xl border p-4 text-left transition ${active ? 'border-[#92C842] bg-[#12231d] shadow-[0_0_0_1px_rgba(146,200,66,0.25)]' : 'border-[#20314d] bg-[#0d1729] hover:border-[#46627c]'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">{kpi.label}</div>
                          <div className="mt-2 text-2xl font-bold text-white">{kpi.value}</div>
                          <div className="mt-1 text-xs text-slate-500">{kpi.note}</div>
                        </div>
                        <span className="rounded-lg p-2" style={{ color: kpi.color, backgroundColor: `${kpi.color}18` }}>
                          <Icon size={18} />
                        </span>
                      </div>
                      <div className="mt-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: active ? kpi.color : '#64748b' }}>
                        {active ? 'Filtering view' : 'Click to filter'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
            <WorkflowCenter user={user} />
          </>
        );
    }
  };

  return (
    <VSRPlatformShell user={user} onSignOut={onSignOut} activeSection={activeSection} onNavigate={navigateToSection} onHubChange={(hub) => updateFilter('region', hub === 'All Hubs' ? 'All' : hub === 'Ogun / Abeokuta' ? 'Ogun' : hub)}>
      <div className="min-h-screen bg-[#07101d] text-slate-100">
        <header className="hidden border-b border-[#20314d] bg-[#091625] px-5 py-4">
          <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#92C842]/30 bg-[#92C842]/10 text-[#b5e86d]">
                <Signpost size={20} />
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.28em] text-[#92C842]">KEA Field Operations</div>
                <h1 className="text-xl font-bold text-white">VSR Route Command</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden rounded-lg border border-[#20314d] bg-[#0d1729] px-3 py-2 text-right sm:block">
                <div className="text-[9px] uppercase tracking-[0.2em] text-slate-500">Session</div>
                <div className="text-xs font-mono text-slate-300">{formatSignedIn}</div>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-[#20314d] bg-[#0d1729] px-3 py-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#92C842]" />
                <span className="text-xs font-semibold text-slate-300">Live operations</span>
              </div>
              <button onClick={onSignOut} className="rounded-lg border border-[#2d405e] bg-[#15243a] px-3 py-2 text-xs font-bold text-slate-200 hover:border-[#92C842]/50">Sign out</button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1500px] space-y-6 px-5 py-6">{renderActiveSection()}</main>
      </div>
    </VSRPlatformShell>
  );
};
