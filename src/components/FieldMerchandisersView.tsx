import React, { useState, useMemo } from 'react';
import { FieldMerchandiserHub } from '../types';
import { STORE_POS_TERMINALS, POSTerminalRecord } from '../data/terminalData';
import {
  Users,
  Download,
  MapPin,
  TrendingUp,
  ShieldCheck,
  FileText,
  Radio,
  Search,
  Table as TableIcon,
  LayoutGrid,
  CheckCircle2,
  X
} from 'lucide-react';

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

  // Export Full Telemetry Log (24 hours of raw activity timestamps)
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
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-[12px] border border-slate-200/80 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
              <Users className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Store Workers &amp; Card Machines</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            See where field workers are stationed, monitor active card machines, battery levels, and live sales activity across all branch stores in Nigeria.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Export Full Activity Log Button */}
          <button
            onClick={handleExportFullTelemetryLog}
            disabled={isExportingLog}
            className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-2 transition-all shadow-xs disabled:opacity-50"
            title="Download activity log as CSV"
          >
            <Download className={`w-3.5 h-3.5 text-slate-600 ${isExportingLog ? 'animate-bounce' : ''}`} />
            <span>{isExportingLog ? 'Creating CSV...' : 'Download Activity Log (CSV)'}</span>
          </button>

          {onOpenGpsTracker && (
            <button
              onClick={onOpenGpsTracker}
              className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
              title="Track where workers sign in from using real-time GPS"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>GPS Map Tracker</span>
            </button>
          )}

          {onOpenTrends && (
            <button
              onClick={onOpenTrends}
              className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
              title="View 7-day performance charts"
            >
              <TrendingUp className="w-3.5 h-3.5 text-sky-600" />
              <span>Performance Trends</span>
            </button>
          )}

          {onOpenCompliance && (
            <button
              onClick={onOpenCompliance}
              className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
              title="View 30-day attendance"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>30-Day Attendance</span>
            </button>
          )}

          {onOpenShiftCompliance && (
            <button
              onClick={onOpenShiftCompliance}
              className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
              title="View and print daily work hours report"
            >
              <FileText className="w-3.5 h-3.5 text-slate-600" />
              <span>Daily Shift Report</span>
            </button>
          )}

          <button
            onClick={handleBroadcast}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
              broadcastSent
                ? 'bg-emerald-600 text-white'
                : 'bg-[#10b981] hover:bg-emerald-600 text-white'
            }`}
          >
            {broadcastSent ? '✓ Signal Sent to 1,420 POS!' : 'Broadcast Signal to All Terminals'}
          </button>
        </div>
      </div>

      {/* Hub Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {hubs.map((hub) => (
          <div
            key={hub.hub}
            onClick={() => setSelectedHub(selectedHub === hub.hub ? 'All' : hub.hub)}
            className={`p-4 rounded-[12px] border transition-all cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.03)] group ${
              selectedHub === hub.hub
                ? 'bg-emerald-50/20 border-emerald-500 ring-2 ring-emerald-500/20'
                : 'bg-white border-slate-200/80 hover:border-emerald-300 hover:shadow-md'
            }`}
            title={`Click to filter list for ${hub.hubDisplayName} (or click again to show all)`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">{hub.hubDisplayName}</span>
              <div className="flex items-center gap-1.5">
                {selectedHub === hub.hub && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">Active</span>
                )}
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: hub.colorHex }}
                ></span>
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900 font-mono group-hover:text-emerald-600 transition-colors">
                {hub.merchandiserCount}
              </span>
              <span className="text-xs text-slate-500">Staff Assigned</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
              <span>{hub.activePOS} Active Terminals</span>
              <span className="font-mono text-slate-700 font-semibold">
                {hub.reconciliationRate}% Reconciled
              </span>
            </div>
            <div className="mt-3 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-1.5 rounded-full"
                style={{ width: `${hub.percentage * 2}%`, backgroundColor: hub.colorHex }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Presentation Mode Switcher & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-[12px] p-3 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-2.5">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">View:</span>
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
            <button
              onClick={() => setActiveViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeViewMode === 'table'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5 text-slate-600" />
              <span>Table View</span>
            </button>
            <button
              onClick={() => setActiveViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeViewMode === 'grid'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-slate-600" />
              <span>Cards Grid</span>
            </button>
          </div>
        </div>

        {/* Hub filter tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {['All', 'Lagos', 'Ibadan', 'Ogun', 'Benin'].map((hubName) => (
            <button
              key={hubName}
              onClick={() => setSelectedHub(hubName)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                selectedHub === hubName
                  ? 'bg-[#10b981] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {hubName === 'All' ? 'All Branches' : hubName}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search machine, store, staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* VIEW MODE 1: DETAILED TABULAR VIEW */}
      {activeViewMode === 'table' && (
        <div className="bg-white rounded-[12px] border border-slate-200/80 overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
          <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-900 uppercase tracking-wider">
              Card Machines &amp; Store Activity List ({filteredTerminals.length} Machines)
            </span>
            <span className="text-[11px] font-mono text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              LIVE REFRESH (4s)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 font-mono text-[10px] uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Machine ID</th>
                  <th className="px-5 py-3">Store Location</th>
                  <th className="px-5 py-3">Branch Hub</th>
                  <th className="px-5 py-3">Staff in Charge</th>
                  <th className="px-5 py-3">Sales Activity</th>
                  <th className="px-5 py-3">Battery</th>
                  <th className="px-5 py-3">Stock Level</th>
                  <th className="px-5 py-3">Last Signal</th>
                  <th className="px-5 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTerminals.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedTerminal(item)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3.5 font-mono font-semibold text-emerald-700">{item.terminalCode}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-900">
                      <div>{item.storeName}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{item.zone}</div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{item.hub}</td>
                    <td className="px-5 py-3.5 text-slate-800 font-medium">{item.assignedRep}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-xs font-bold text-slate-900">{item.intensity}%</span>
                        <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-1.5 rounded-full bg-emerald-500"
                            style={{ width: `${item.intensity}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className={`w-2 h-2 rounded-full ${item.battery < 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                        <span>{item.battery}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono">
                      <span className={item.stockLevel < 40 ? 'text-amber-700 font-bold' : 'text-slate-700'}>
                        {item.stockLevel}% Full
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-500">{item.lastPing}</td>
                    <td className="px-5 py-3.5 text-right">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide border ${
                          item.status === 'reconciled'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : item.status === 'warning'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-sky-50 text-sky-700 border-sky-200'
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
              className="bg-white rounded-[12px] border border-slate-200/80 hover:border-emerald-400 p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)] cursor-pointer transition-all hover:translate-y-[-2px] space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-emerald-700">{item.terminalCode}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide border ${
                    item.status === 'reconciled'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : item.status === 'warning'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-sky-50 text-sky-700 border-sky-200'
                  }`}
                >
                  {item.status === 'reconciled' ? 'BALANCED' : item.status === 'warning' ? 'NEEDS CHECK' : 'ACTIVE'}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 truncate">{item.storeName}</h4>
                <div className="text-[11px] text-slate-500 truncate">{item.zone} • {item.hub}</div>
              </div>

              <div className="text-xs text-slate-600">
                <span className="text-slate-400">Staff:</span> <strong className="text-slate-900">{item.assignedRep}</strong>
              </div>

              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px] font-mono text-slate-500">
                  <span>Sales Activity</span>
                  <span className="text-emerald-700 font-bold">{item.intensity}% ({item.hourlyTransactions} tx/hr)</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-1.5 rounded-full bg-emerald-500"
                    style={{ width: `${item.intensity}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px] font-mono">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className={`w-2 h-2 rounded-full ${item.battery < 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                  <span>Battery {item.battery}%</span>
                </div>
                <div className="text-right text-slate-600">
                  Stock: <strong className="text-slate-900">{item.stockLevel}%</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected Terminal Quick Detail Modal */}
      {selectedTerminal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-[16px] max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-mono text-emerald-700 uppercase tracking-wider font-bold">
                  Card Machine Details
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedTerminal.storeName}</h3>
                <p className="text-xs text-slate-500">{selectedTerminal.zone} • {selectedTerminal.hub} Hub</p>
              </div>
              <button
                onClick={() => setSelectedTerminal(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Terminal Code:</span>
                <span className="text-emerald-700 font-bold">{selectedTerminal.terminalCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Staff in Charge:</span>
                <span className="text-slate-900 font-semibold">{selectedTerminal.assignedRep}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="text-slate-900 uppercase font-bold">{selectedTerminal.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Hourly Transactions:</span>
                <span className="text-slate-900 font-bold">{selectedTerminal.hourlyTransactions} tx/hr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Battery Level:</span>
                <span className={selectedTerminal.battery < 50 ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'}>
                  {selectedTerminal.battery}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Stock Capacity:</span>
                <span className="text-slate-800">{selectedTerminal.stockLevel}% Full</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Last Signal:</span>
                <span className="text-slate-700">{selectedTerminal.lastPing}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedTerminal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition-colors"
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
