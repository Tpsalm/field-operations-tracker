import React, { useState, useMemo } from 'react';
import { FieldMerchandiserHub } from '../types';
import { STORE_POS_TERMINALS, POSTerminalRecord } from '../data/terminalData';

interface FieldMerchandisersViewProps {
  hubs: FieldMerchandiserHub[];
  onOpenNewVSR: () => void;
  onOpenShiftCompliance?: () => void;
  onOpenTrends?: () => void;
  onOpenCompliance?: () => void;
  onOpenGpsTracker?: () => void;
}

export const FieldMerchandisersView: React.FC<FieldMerchandisersViewProps> = ({
  hubs,
  onOpenNewVSR,
  onOpenShiftCompliance,
  onOpenTrends,
  onOpenCompliance,
  onOpenGpsTracker
}) => {
  const [selectedHub, setSelectedHub] = useState<string>('All');
  const [activeViewMode, setActiveViewMode] = useState<'table' | 'grid'>('table');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [isExportingLog, setIsExportingLog] = useState(false);
  const [selectedTerminal, setSelectedTerminal] = useState<POSTerminalRecord | null>(null);

  const terminals = STORE_POS_TERMINALS;

  const filteredTerminals = useMemo(() => {
    return terminals.filter((t) => {
      const matchesHub = selectedHub === 'All' || t.hub === selectedHub;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.terminalCode.toLowerCase().includes(q) ||
        t.storeName.toLowerCase().includes(q) ||
        t.zone.toLowerCase().includes(q) ||
        t.assignedRep.toLowerCase().includes(q);
      return matchesHub && matchesSearch;
    });
  }, [terminals, selectedHub, searchQuery]);

  const handleBroadcast = () => {
    setBroadcastSent(true);
    setTimeout(() => setBroadcastSent(false), 3000);
  };

  // Export Full Telemetry Log (24 hours of raw heartbeat timestamps for all regional hubs)
  const handleExportFullTelemetryLog = () => {
    setIsExportingLog(true);
    try {
      const now = new Date();
      const rows: string[] = [];

      // CSV Header
      rows.push([
        'Timestamp_UTC',
        'Timestamp_WAT',
        'Hours_Ago',
        'Regional_Hub',
        'Terminal_Code',
        'Store_Location',
        'Zone',
        'Assigned_Worker',
        'Heartbeat_Status',
        'Ping_Interval_Sec',
        'Latency_ms',
        'Battery_Pct',
        'Signal_Strength_dBm',
        'Operating_Window_Status',
        'Daily_Sales_Balanced'
      ].join(','));

      const sampleMachines = [
        { code: 'POS-LOS-001', store: 'Shoprite Ikeja City Mall', zone: 'Ikeja Central', hub: 'Lagos', worker: 'Adeyemi Okafor' },
        { code: 'POS-LOS-042', store: 'Spar Victoria Island', zone: 'VI Waterfront', hub: 'Lagos', worker: 'Babatunde Fash' },
        { code: 'POS-LOS-108', store: 'Mega Plaza Victoria Island', zone: 'Victoria Island', hub: 'Lagos', worker: 'Olumide Bakare' },
        { code: 'POS-IBD-014', store: 'Ventura Mall Samonda', zone: 'Samonda Commercial', hub: 'Ibadan', worker: 'Folake Adebayo' },
        { code: 'POS-IBD-088', store: 'Foodco Bodija Market', zone: 'Bodija High St', hub: 'Ibadan', worker: 'Tunde Olatunji' },
        { code: 'POS-OGN-009', store: 'MKO Abiola Stadium Kiosk', zone: 'Kuto Corridor', hub: 'Ogun', worker: 'Chinedu Eze' },
        { code: 'POS-OGN-031', store: 'Park Inn Radisson Resort', zone: 'Ibarapa Ave', hub: 'Ogun', worker: 'Kemi Adeleke' },
        { code: 'POS-BEN-005', store: 'Kada Plaza Sapele Road', zone: 'Sapele Rd Strip', hub: 'Benin', worker: 'Osasere Idehen' },
        { code: 'POS-BEN-022', store: 'Edo City Mall Ring Road', zone: 'Kings Square Central', hub: 'Benin', worker: 'Precious Igbinovia' }
      ];

      for (let h = 24; h >= 0; h--) {
        const pointTime = new Date(now.getTime() - h * 3600 * 1000);
        const isoUTC = pointTime.toISOString();
        const watDate = new Date(pointTime.getTime() + 1 * 3600 * 1000);
        const watFormatted = watDate.toISOString().replace('T', ' ').substring(0, 19) + ' WAT';
        const watHour = watDate.getUTCHours();
        const isInWindow = watHour >= 7 && watHour < 21;
        const windowStatus = isInWindow ? 'Standard Operating Window (07:00-21:00 WAT)' : 'After Hours';

        sampleMachines.forEach((machine) => {
          const latency = Math.floor(45 + Math.random() * 85);
          const battery = Math.max(18, Math.min(100, Math.floor(95 - (h * 2.8) + (Math.random() * 8))));
          const signal = Math.floor(-68 - Math.random() * 24);
          const isBalanced = h < 6 ? 'YES' : 'PENDING';
          const heartbeatStatus = !isInWindow ? 'STANDBY' : latency > 110 ? 'SLOW' : 'ACTIVE_OK';

          rows.push([
            `"${isoUTC}"`,
            `"${watFormatted}"`,
            h,
            `"${machine.hub}"`,
            `"${machine.code}"`,
            `"${machine.store}"`,
            `"${machine.zone}"`,
            `"${machine.worker}"`,
            `"${heartbeatStatus}"`,
            4,
            latency,
            battery,
            signal,
            `"${windowStatus}"`,
            `"${isBalanced}"`
          ].join(','));
        });
      }

      const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(rows.join('\n'));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', csvContent);
      downloadAnchor.setAttribute('download', `KEA_Full_Activity_Log_24Hours_${now.toISOString().substring(0, 10)}.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);
    } catch (e) {
      console.error('Failed to export log', e);
    } finally {
      setTimeout(() => setIsExportingLog(false), 1200);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0e1628] border border-[#1e2d4d] rounded-xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#92C842]/10 text-[#92C842] border border-[#92C842]/30">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </span>
            <h2 className="text-lg font-bold text-white">Store Workers &amp; Card Machines</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            See where your 78 field workers are stationed, which card machines are active, and monitor store activity across all 4 locations in Nigeria.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Export Full Telemetry Log Button */}
          <button
            onClick={handleExportFullTelemetryLog}
            disabled={isExportingLog}
            className="px-4 py-2 rounded-lg bg-[#151f38] hover:bg-[#1a2745] text-slate-200 border border-[#1e2d4d] hover:border-[#92C842]/50 text-xs font-semibold flex items-center gap-2 transition-all shadow-sm disabled:opacity-50"
            title="Download 24 hours of raw heartbeat timestamps for all 4 regional hubs as CSV"
          >
            <svg className={`w-4 h-4 text-[#92C842] ${isExportingLog ? 'animate-bounce' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
            <span>{isExportingLog ? 'Creating CSV...' : 'Download 24h Activity Log (CSV)'}</span>
          </button>

          {onOpenGpsTracker && (
            <button
              onClick={onOpenGpsTracker}
              className="px-4 py-2 rounded-lg bg-[#151f38] hover:bg-[#1a2745] text-slate-200 border border-[#1e2d4d] hover:border-[#92C842]/50 text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
              title="Track where workers sign in from using real-time GPS"
            >
              <svg className="w-4 h-4 text-[#92C842]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
                <path
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
              <span>Worker GPS Sign-Ins</span>
            </button>
          )}

          {onOpenTrends && (
            <button
              onClick={onOpenTrends}
              className="px-4 py-2 rounded-lg bg-[#151f38] hover:bg-[#1a2745] text-slate-200 border border-[#1e2d4d] hover:border-[#92C842]/50 text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
              title="View 7-day machine and staff activity chart"
            >
              <svg className="w-4 h-4 text-[#92C842]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
              <span>7-Day Trends</span>
            </button>
          )}

          {onOpenCompliance && (
            <button
              onClick={onOpenCompliance}
              className="px-4 py-2 rounded-lg bg-[#151f38] hover:bg-[#1a2745] text-slate-200 border border-[#1e2d4d] hover:border-[#92C842]/50 text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
              title="View 30-day shift hours and attendance report"
            >
              <svg className="w-4 h-4 text-[#92C842]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
              <span>30-Day Attendance</span>
            </button>
          )}

          {onOpenShiftCompliance && (
            <button
              onClick={onOpenShiftCompliance}
              className="px-4 py-2 rounded-lg bg-[#151f38] hover:bg-[#1a2745] text-slate-200 border border-[#1e2d4d] hover:border-[#92C842]/50 text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
              title="View and print daily work hours report (07:00-21:00 WAT standard)"
            >
              <svg className="w-4 h-4 text-[#92C842]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
              <span>Daily Shift Report (PDF)</span>
            </button>
          )}

          <button
            onClick={handleBroadcast}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-md ${
              broadcastSent
                ? 'bg-emerald-600 text-white'
                : 'bg-[#92C842] hover:bg-[#7bb32e] text-[#090e1c] shadow-[#92C842]/20'
            }`}
          >
            {broadcastSent ? '✓ Ping Sent to 1,420 POS!' : 'Broadcast Ping to All Terminals'}
          </button>
        </div>
      </div>

      {/* Hub Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {hubs.map((hub) => (
          <div
            key={hub.hub}
            onClick={() => setSelectedHub(hub.hub)}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              selectedHub === hub.hub
                ? 'bg-[#151f38] border-[#92C842] shadow-md shadow-[#92C842]/10 ring-1 ring-[#92C842]'
                : 'bg-[#0e1628] border-[#1e2d4d] hover:border-[#92C842]/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">{hub.hubDisplayName}</span>
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: hub.colorHex }}
              ></span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-white font-mono">{hub.merchandiserCount}</span>
              <span className="text-xs text-slate-400">Workers Assigned</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
              <span>{hub.activePOS} Active Terminals</span>
              <span className="font-mono text-slate-300">
                {hub.reconciliationRate}% Reconciled
              </span>
            </div>
            <div className="mt-3 w-full bg-[#151f38] h-1.5 rounded-full overflow-hidden">
              <div
                className="h-1.5 rounded-full"
                style={{ width: `${hub.percentage * 2}%`, backgroundColor: hub.colorHex }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Presentation Mode Switcher & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0b1222] border border-[#1e2d4d] rounded-xl px-4 py-2.5 shadow-md">
        <div className="flex items-center gap-2.5">
          <span className="text-slate-400 text-xs font-mono uppercase tracking-wider">VIEW AS:</span>
          <div className="inline-flex rounded-lg bg-[#151f38] p-0.5 border border-[#1e2d4d]">
            <button
              onClick={() => setActiveViewMode('table')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeViewMode === 'table'
                  ? 'bg-[#92C842] text-[#090e1c] shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M3 10h18M3 14h18m-9-4v8m-7 4h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
              <span>Table Directory</span>
            </button>
            <button
              onClick={() => setActiveViewMode('grid')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeViewMode === 'grid'
                  ? 'bg-[#92C842] text-[#090e1c] shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
              <span>Activity Grid</span>
            </button>
          </div>
        </div>

        {/* Hub filter tabs */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs">
          {['All', 'Lagos', 'Ibadan', 'Ogun', 'Benin'].map((hubName) => (
            <button
              key={hubName}
              onClick={() => setSelectedHub(hubName)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedHub === hubName
                  ? 'bg-[#92C842] text-[#090e1c]'
                  : 'bg-[#0e1628] text-slate-400 hover:text-white border border-[#1e2d4d]'
              }`}
            >
              {hubName === 'All' ? 'All Locations' : hubName}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search terminal, store, worker..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0e1628] border border-[#1e2d4d] focus:border-[#92C842] rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500"
          />
        </div>
      </div>

      {/* VIEW MODE 1: DETAILED TABULAR VIEW */}
      {activeViewMode === 'table' && (
        <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-xl overflow-hidden shadow-lg">
          <div className="px-5 py-3 border-b border-[#1e2d4d] bg-[#090e1c]/60 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-200 uppercase tracking-wider">
              Card Machines &amp; Store Activity List ({filteredTerminals.length} Terminals)
            </span>
            <span className="text-[11px] font-mono text-[#92C842]">LIVE UPDATES (EVERY 4s)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#151f38] text-slate-400 font-mono text-[10px] uppercase tracking-wider border-b border-[#1e2d4d]">
                <tr>
                  <th className="px-5 py-3">Machine ID</th>
                  <th className="px-5 py-3">Store &amp; Location</th>
                  <th className="px-5 py-3">Branch</th>
                  <th className="px-5 py-3">Worker in Charge</th>
                  <th className="px-5 py-3">Sales Activity</th>
                  <th className="px-5 py-3">Battery</th>
                  <th className="px-5 py-3">Stock Level</th>
                  <th className="px-5 py-3">Last Signal</th>
                  <th className="px-5 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2d4d]/60">
                {filteredTerminals.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedTerminal(item)}
                    className="hover:bg-[#151f38]/50 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3.5 font-mono font-semibold text-[#92C842]">{item.terminalCode}</td>
                    <td className="px-5 py-3.5 font-semibold text-white">
                      <div>{item.storeName}</div>
                      <div className="text-[10px] text-slate-400">{item.zone}</div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">{item.hub}</td>
                    <td className="px-5 py-3.5 text-slate-200">{item.assignedRep}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-xs font-bold text-[#92C842]">{item.intensity}%</span>
                        <div className="w-16 bg-[#151f38] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-1.5 rounded-full bg-gradient-to-r from-[#22d3ee] to-[#92C842]"
                            style={{ width: `${item.intensity}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className={`w-2 h-2 rounded-full ${item.battery < 50 ? 'bg-[#F17F31]' : 'bg-[#92C842]'}`}></span>
                        <span>{item.battery}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono">
                      <span className={item.stockLevel < 40 ? 'text-[#F17F31] font-bold' : 'text-slate-200'}>
                        {item.stockLevel}% Full
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-500">{item.lastPing}</td>
                    <td className="px-5 py-3.5 text-right">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide border ${
                          item.status === 'reconciled'
                            ? 'bg-[#92C842]/15 text-[#92C842] border-[#92C842]/30'
                            : item.status === 'warning'
                            ? 'bg-[#F17F31]/15 text-[#F17F31] border-[#F17F31]/30'
                            : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                        }`}
                      >
                        {item.status === 'reconciled' ? 'BALANCED' : item.status === 'warning' ? 'NEEDS CHECK' : 'ACTIVE'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: ACTIVITY GRID CARDS */}
      {activeViewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTerminals.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedTerminal(item)}
              className="bg-[#0e1628] border border-[#1e2d4d] hover:border-[#92C842]/40 rounded-xl p-4 shadow-lg cursor-pointer transition-all hover:translate-y-[-2px] space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#92C842]">{item.terminalCode}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide border ${
                    item.status === 'reconciled'
                      ? 'bg-[#92C842]/15 text-[#92C842] border-[#92C842]/30'
                      : item.status === 'warning'
                      ? 'bg-[#F17F31]/15 text-[#F17F31] border-[#F17F31]/30'
                      : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                  }`}
                >
                  {item.status === 'reconciled' ? 'BALANCED' : item.status === 'warning' ? 'NEEDS CHECK' : 'ACTIVE'}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white truncate">{item.storeName}</h4>
                <div className="text-[11px] text-slate-400 truncate">{item.zone} • {item.hub}</div>
              </div>

              <div className="text-xs text-slate-300">
                <span className="text-slate-500">Worker:</span> <strong className="text-white">{item.assignedRep}</strong>
              </div>

              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>Sales Activity</span>
                  <span className="text-[#92C842] font-bold">{item.intensity}% ({item.hourlyTransactions} tx/hr)</span>
                </div>
                <div className="w-full bg-[#151f38] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-1.5 rounded-full bg-gradient-to-r from-[#22d3ee] to-[#92C842]"
                    style={{ width: `${item.intensity}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1e2d4d]/60 text-[11px] font-mono">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <span className={`w-2 h-2 rounded-full ${item.battery < 50 ? 'bg-[#F17F31]' : 'bg-[#92C842]'}`} />
                  <span>Battery {item.battery}%</span>
                </div>
                <div className="text-right text-slate-400">
                  Stock: <strong className="text-slate-200">{item.stockLevel}%</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected Terminal Quick Detail Modal */}
      {selectedTerminal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-mono text-[#92C842] uppercase tracking-wider font-bold">
                  Card Machine Telemetry
                </div>
                <h3 className="text-lg font-bold text-white mt-1">{selectedTerminal.storeName}</h3>
                <p className="text-xs text-slate-400">{selectedTerminal.zone} • {selectedTerminal.hub} Hub</p>
              </div>
              <button
                onClick={() => setSelectedTerminal(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#151f38]/60 border border-[#1e2d4d] rounded-xl p-4 space-y-2.5 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Terminal Code:</span>
                <span className="text-[#92C842] font-bold">{selectedTerminal.terminalCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Assigned Worker:</span>
                <span className="text-white font-semibold">{selectedTerminal.assignedRep}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="text-white uppercase font-bold">{selectedTerminal.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Hourly Transactions:</span>
                <span className="text-white font-bold">{selectedTerminal.hourlyTransactions} tx/hr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Battery Level:</span>
                <span className={selectedTerminal.battery < 50 ? 'text-[#F17F31] font-bold' : 'text-[#92C842] font-bold'}>
                  {selectedTerminal.battery}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Stock Capacity:</span>
                <span className="text-slate-200">{selectedTerminal.stockLevel}% Full</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Last Telemetry Ping:</span>
                <span className="text-slate-300">{selectedTerminal.lastPing}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedTerminal(null)}
                className="px-4 py-2 rounded-lg bg-[#151f38] hover:bg-[#1f2d52] text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
