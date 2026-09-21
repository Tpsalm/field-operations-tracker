import React, { useState } from 'react';
import { FieldMerchandiserHub } from '../types';
import { TerminalHeatmapView, SPATIAL_TERMINALS } from './TerminalHeatmapView';

interface FieldMerchandisersViewProps {
  hubs: FieldMerchandiserHub[];
  onOpenNewVSR: () => void;
  onOpenShiftCompliance?: () => void;
  onOpenTrends?: () => void;
  onOpenCompliance?: () => void;
}

export const FieldMerchandisersView: React.FC<FieldMerchandisersViewProps> = ({
  hubs,
  onOpenNewVSR,
  onOpenShiftCompliance,
  onOpenTrends,
  onOpenCompliance
}) => {
  const [selectedHub, setSelectedHub] = useState<string>('All');
  const [activeViewMode, setActiveViewMode] = useState<'spatial_map' | 'table'>('spatial_map');
  const [broadcastSent, setBroadcastSent] = useState(false);

  const terminals = SPATIAL_TERMINALS;

  const filteredTerminals =
    selectedHub === 'All' ? terminals : terminals.filter((t) => t.hub === selectedHub);

  const handleBroadcast = () => {
    setBroadcastSent(true);
    setTimeout(() => setBroadcastSent(false), 3000);
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
            <h2 className="text-lg font-bold text-white">Field Merchandisers &amp; POS Telemetry Hub</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Monitoring 78 deployed field merchandisers controlling 1,420 active retail points-of-sale across 4 Nigerian regional territories.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {onOpenTrends && (
            <button
              onClick={onOpenTrends}
              className="px-4 py-2 rounded-lg bg-[#151f38] hover:bg-[#1a2745] text-slate-200 border border-[#1e2d4d] hover:border-[#92C842]/50 text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
              title="Inspect D3 Multi-Series Line Chart of Daily Active POS Telemetry"
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
              title="Inspect 30-Day D3 Shift Adherence & Hours Adherence Dashboard"
            >
              <svg className="w-4 h-4 text-[#92C842]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
              <span>30-Day Compliance</span>
            </button>
          )}

          {onOpenShiftCompliance && (
            <button
              onClick={onOpenShiftCompliance}
              className="px-4 py-2 rounded-lg bg-[#151f38] hover:bg-[#1a2745] text-slate-200 border border-[#1e2d4d] hover:border-[#92C842]/50 text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
              title="Generate PDF-ready Shift Compliance Audit vs Standard 07:00-21:00 WAT Window"
            >
              <svg className="w-4 h-4 text-[#92C842]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
              <span>Shift Compliance (PDF)</span>
            </button>
          )}

          <button
            onClick={handleBroadcast}
            className="px-4 py-2 rounded-lg bg-[#151f38] hover:bg-[#1a2745] text-slate-200 border border-[#1e2d4d] text-xs font-semibold flex items-center gap-2"
          >
            <svg className="w-4 h-4 text-[#92C842]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
            <span>{broadcastSent ? '✓ Ping Dispatched to 78 Units' : 'Broadcast Inventory Restock Ping'}</span>
          </button>

          <button
            onClick={onOpenNewVSR}
            className="px-4 py-2 rounded-lg bg-[#92C842] hover:bg-[#7bb32e] text-[#090e1c] text-xs font-bold shadow-md shadow-[#92C842]/20"
          >
            + Allocate Merchandiser
          </button>
        </div>
      </div>

      {/* Regional Hub KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {hubs.map((hub) => (
          <div
            key={hub.hub}
            onClick={() => setSelectedHub(hub.hub)}
            className={`bg-[#0e1628] border rounded-xl p-4 transition-all cursor-pointer ${
              selectedHub === hub.hub ? 'border-[#92C842] shadow-lg shadow-[#92C842]/10' : 'border-[#1e2d4d] hover:border-[#1e2d4d]/80'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-white">{hub.hubDisplayName}</span>
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: hub.colorHex }}
              ></span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-white font-mono">{hub.merchandiserCount}</span>
              <span className="text-xs text-slate-400">Merchandisers</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-400 flex justify-between">
              <span>Active POS: <strong className="text-slate-200 font-mono">{hub.activePOS}</strong></span>
              <span>Reconciled: <strong className="text-[#92C842] font-mono">{hub.reconciliationRate}%</strong></span>
            </div>
            <div className="mt-1.5 pt-1.5 border-t border-[#1e2d4d]/60 text-[10px] flex items-center justify-between text-slate-400">
              <span>Shift: <strong className="text-slate-300 font-mono">{hub.shiftStart || '08:00 WAT'}</strong></span>
              {hub.telemetryIdleMinutes !== undefined && (
                (() => {
                  const threshold = hub.idleThresholdMinutes || 30;
                  const isBreached =
                    hub.isIdleBreached !== undefined
                      ? hub.isIdleBreached
                      : hub.telemetryIdleMinutes >= threshold;
                  return (
                    <span
                      className={`font-mono font-semibold px-1.5 py-0.2 rounded ${
                        hub.isShiftOverrun
                          ? 'bg-[#E05252]/20 text-[#E05252] border border-[#E05252]/30'
                          : isBreached
                          ? 'bg-[#F17F31]/20 text-[#F17F31] border border-[#F17F31]/30'
                          : 'text-[#92C842]'
                      }`}
                    >
                      {hub.isShiftOverrun
                        ? '⚠️ Overrun (>21:00)'
                        : isBreached
                        ? `⚠️ ${hub.telemetryIdleMinutes}m Idle (>${threshold}m)`
                        : `● ${hub.telemetryIdleMinutes}m ping`}
                    </span>
                  );
                })()
              )}
            </div>
            <div className="w-full bg-[#151f38] h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div
                className="h-1.5 rounded-full"
                style={{ width: `${hub.percentage * 2}%`, backgroundColor: hub.colorHex }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Visual Presentation Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0b1222] border border-[#1e2d4d] rounded-xl px-4 py-2.5 shadow-md">
        <div className="flex items-center gap-2.5">
          <span className="text-slate-400 text-xs font-mono uppercase tracking-wider">VIEW MODE:</span>
          <div className="inline-flex rounded-lg bg-[#151f38] p-0.5 border border-[#1e2d4d]">
            <button
              onClick={() => setActiveViewMode('spatial_map')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeViewMode === 'spatial_map'
                  ? 'bg-[#92C842] text-[#090e1c] shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
              <span>D3 Spatial Density Map</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 animate-ping"></span>
            </button>
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
              <span>Tabular Telemetry Grid</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          <span>Active Hub: <strong className="text-white">{selectedHub === 'All' ? 'All 4 Clusters' : selectedHub}</strong></span>
          <span>•</span>
          <span>Monitored Nodes: <strong className="text-[#92C842]">{filteredTerminals.length}</strong></span>
        </div>
      </div>

      {/* D3 SPATIAL DENSITY HEATMAP VIEW (DEFAULT) */}
      {activeViewMode === 'spatial_map' ? (
        <TerminalHeatmapView
          hubs={hubs}
          selectedHub={selectedHub}
          onSelectHub={setSelectedHub}
          onOpenNewVSR={onOpenNewVSR}
          onOpenShiftCompliance={onOpenShiftCompliance}
        />
      ) : (
        /* TABULAR TELEMETRY VIEW */
        <div className="space-y-4">
          {/* Hub Filter Switcher */}
          <div className="flex items-center justify-between gap-4 border-b border-[#1e2d4d] pb-3">
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
                  {hubName === 'All' ? 'All 4 Hubs (1,420 POS)' : `${hubName} Cluster`}
                </button>
              ))}
            </div>
            <div className="text-xs font-mono text-slate-400">
              Showing <span className="text-white font-bold">{filteredTerminals.length}</span> Active Monitor Nodes
            </div>
          </div>

          {/* POS Device Table */}
          <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-xl overflow-hidden shadow-lg">
            <div className="px-5 py-3 border-b border-[#1e2d4d] bg-[#090e1c]/60 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200 uppercase tracking-wider">
                POS Retail Terminal Telemetry &amp; Spatial Intensity Grid
              </span>
              <span className="text-[11px] font-mono text-[#92C842]">AUTO-STREAMING (4s)</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#151f38] text-slate-400 font-mono text-[10px] uppercase tracking-wider border-b border-[#1e2d4d]">
                  <tr>
                    <th className="px-5 py-3">Terminal ID</th>
                    <th className="px-5 py-3">Store / Kiosk Venue</th>
                    <th className="px-5 py-3">Hub &amp; Territory</th>
                    <th className="px-5 py-3">Assigned VSR Rep</th>
                    <th className="px-5 py-3">Activity Intensity</th>
                    <th className="px-5 py-3">Battery</th>
                    <th className="px-5 py-3">Inventory Stock</th>
                    <th className="px-5 py-3">Last Heartbeat</th>
                    <th className="px-5 py-3 text-right">Audit Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2d4d]/60">
                  {filteredTerminals.map((item) => (
                    <tr key={item.id} className="hover:bg-[#151f38]/50 transition-colors">
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
                          {item.stockLevel}% Capacity
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
                          {item.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
