import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Download,
  Filter,
  Search,
  ArrowRight,
  TrendingUp,
  Compass,
  Users,
  ShieldCheck,
  ChevronRight,
  Info,
  Layers,
  Sparkles,
  BarChart3,
  X
} from 'lucide-react';
import {
  THIRTY_DAY_ADHERENCE_DATA,
  REGIONAL_COMPLIANCE_SUMMARIES
} from '../data/complianceTrendsData';
import { DailyAdherenceRecord, RegionComplianceSummary, RegionalShiftDayData } from '../types';

interface ShiftAdherence30DayViewProps {
  onBackToDashboard?: () => void;
  onOpenLocationAudit?: () => void;
  onOpenShiftModal?: () => void;
}

type HubKey = 'All' | 'Lagos' | 'Ibadan' | 'Ogun' | 'Benin';
type TimeWindow = '30d' | '14d' | '7d';
type StatusFilter = 'all' | 'compliant' | 'overrun' | 'under_hours';

export const ShiftAdherence30DayView: React.FC<ShiftAdherence30DayViewProps> = ({
  onBackToDashboard,
  onOpenLocationAudit,
  onOpenShiftModal
}) => {
  const [selectedHub, setSelectedHub] = useState<HubKey>('All');
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('30d');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDayRecord, setSelectedDayRecord] = useState<DailyAdherenceRecord | null>(
    THIRTY_DAY_ADHERENCE_DATA[THIRTY_DAY_ADHERENCE_DATA.length - 1]
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Time-window filtered data
  const baseData = useMemo(() => {
    const total = THIRTY_DAY_ADHERENCE_DATA.length;
    if (timeWindow === '7d') return THIRTY_DAY_ADHERENCE_DATA.slice(total - 7);
    if (timeWindow === '14d') return THIRTY_DAY_ADHERENCE_DATA.slice(total - 14);
    return THIRTY_DAY_ADHERENCE_DATA;
  }, [timeWindow]);

  // Extract region-specific data for a record
  const getRecordForHub = (record: DailyAdherenceRecord, hub: HubKey): RegionalShiftDayData => {
    if (hub === 'All') {
      return {
        expectedHours: record.aggregate.expectedHours,
        actualHours: record.aggregate.actualHours,
        varianceHours: record.aggregate.varianceHours,
        adherenceRate: record.aggregate.adherenceRate,
        merchandiserCount: record.aggregate.totalMerchandisers,
        activePOS: record.aggregate.totalActivePOS,
        onTimeStartRate: 99.2,
        status: record.aggregate.overallStatus,
        notes: record.aggregate.operationalEvent
      };
    }
    return record[hub];
  };

  // Filtered dataset
  const filteredRecords = useMemo(() => {
    return baseData.filter((record) => {
      const data = getRecordForHub(record, selectedHub);

      // Status filter
      if (statusFilter === 'compliant' && data.status !== 'compliant') return false;
      if (
        statusFilter === 'overrun' &&
        data.status !== 'minor_overrun' &&
        data.status !== 'major_overrun'
      ) {
        return false;
      }
      if (statusFilter === 'under_hours' && data.status !== 'under_hours') return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesDate = record.date.toLowerCase().includes(query) || record.displayDate.toLowerCase().includes(query);
        const matchesNote = (data.notes || '').toLowerCase().includes(query);
        const matchesDay = record.dayOfWeek.toLowerCase().includes(query);
        if (!matchesDate && !matchesNote && !matchesDay) return false;
      }

      return true;
    });
  }, [baseData, selectedHub, statusFilter, searchQuery]);

  // Aggregate KPI computations
  const kpis = useMemo(() => {
    let expHours = 0;
    let actHours = 0;
    let compliantCount = 0;
    let overrunCount = 0;
    let underCount = 0;
    let totalAdherenceSum = 0;
    let totalMerch = 0;
    let totalPOS = 0;

    baseData.forEach((rec) => {
      const data = getRecordForHub(rec, selectedHub);
      expHours += data.expectedHours;
      actHours += data.actualHours;
      totalAdherenceSum += data.adherenceRate;
      totalMerch += data.merchandiserCount;
      totalPOS += data.activePOS;

      if (data.status === 'compliant') compliantCount++;
      else if (data.status === 'minor_overrun' || data.status === 'major_overrun') overrunCount++;
      else if (data.status === 'under_hours') underCount++;
    });

    const avgAdherence = baseData.length > 0 ? totalAdherenceSum / baseData.length : 0;
    const netVariance = actHours - expHours;

    return {
      totalDays: baseData.length,
      expHours: parseFloat(expHours.toFixed(1)),
      actHours: parseFloat(actHours.toFixed(1)),
      netVariance: parseFloat(netVariance.toFixed(1)),
      avgAdherence: parseFloat(avgAdherence.toFixed(1)),
      compliantCount,
      overrunCount,
      underCount,
      avgMerchPerDay: Math.round(totalMerch / (baseData.length || 1)),
      avgPOSPerDay: Math.round(totalPOS / (baseData.length || 1))
    };
  }, [baseData, selectedHub]);

  // Export CSV Handler
  const handleExportCsv = () => {
    setIsExporting(true);
    try {
      const rows: string[] = [];
      rows.push([
        'Date',
        'Day_Of_Week',
        'Hub_Scope',
        'Expected_Shift_Hours',
        'Actual_Hours_Logged',
        'Variance_Hours',
        'Adherence_Rate_Pct',
        'Active_Merchandisers',
        'Active_POS_Terminals',
        'Closing_Status_2100_WAT',
        'Operational_Notes'
      ].join(','));

      baseData.forEach((record) => {
        const hubs: ('Lagos' | 'Ibadan' | 'Ogun' | 'Benin')[] = ['Lagos', 'Ibadan', 'Ogun', 'Benin'];
        hubs.forEach((h) => {
          const d = record[h];
          rows.push([
            record.date,
            record.dayOfWeek,
            h,
            d.expectedHours,
            d.actualHours,
            d.varianceHours,
            `${d.adherenceRate}%`,
            d.merchandiserCount,
            d.activePOS,
            d.status.toUpperCase(),
            `"${(d.notes || '').replace(/"/g, '""')}"`
          ].join(','));
        });
      });

      const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `KEA_30Day_Shift_Adherence_Audit_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setTimeout(() => setIsExporting(false), 800);
    }
  };

  return (
    <div className="space-y-6">
      {/* TOP HEADER & BREADCRUMBS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#0d1527] via-[#0f1b33] to-[#0d1527] border border-[#1e2d4d] rounded-2xl p-6 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold font-mono tracking-wide bg-[#92C842]/15 text-[#92C842] border border-[#92C842]/30 uppercase">
              <Calendar className="w-3.5 h-3.5" /> 30-Day Shift Adherence Audit
            </span>
            <span className="text-xs text-slate-500 font-mono">• 23 Aug 2026 – 21 Sep 2026</span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-cyan-400 font-mono bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
              <Clock className="w-3 h-3" /> WAT Benchmark (UTC+1)
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            Shift Adherence (30 Days)
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Multi-region shift tracking against regional store opening schedules and the strict{' '}
            <strong className="text-white font-semibold">21:00 WAT closing cutoff</strong>. Evaluates daily work hours, rep attendance, active POS terminals, and operational overrun variance.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onOpenLocationAudit}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#142343] hover:bg-[#1c305c] text-cyan-300 border border-cyan-800/50 hover:border-cyan-500/50 transition-all shadow-sm"
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>VSR Location Audit</span>
            <ArrowRight className="w-3 h-3 text-cyan-400" />
          </button>

          <button
            onClick={handleExportCsv}
            disabled={isExporting}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#92C842] hover:bg-[#a0db4b] text-[#090e1c] transition-all shadow-md shadow-[#92C842]/20 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Exporting...' : 'Export 30-Day CSV'}</span>
          </button>
        </div>
      </div>

      {/* 5 EXECUTIVE KPI STATS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* KPI 1: Overall Adherence Rate */}
        <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-xl p-4 flex flex-col justify-between hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-semibold uppercase text-[10px] tracking-wider">30-Day Adherence</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-400 font-mono">{kpis.avgAdherence}%</div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-emerald-400 font-bold">Target: ≥98.0%</span>
              <span>• On-Target</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Compliant Days */}
        <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-xl p-4 flex flex-col justify-between hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-semibold uppercase text-[10px] tracking-wider">Compliant Days</span>
            <CheckCircle2 className="w-4 h-4 text-[#92C842]" />
          </div>
          <div>
            <div className="text-2xl font-black text-white font-mono">
              {kpis.compliantCount} <span className="text-xs text-slate-500 font-normal">/ {kpis.totalDays}</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {Math.round((kpis.compliantCount / kpis.totalDays) * 100)}% shift precision rate
            </div>
          </div>
        </div>

        {/* KPI 3: Overrun Days (> 21:00 WAT) */}
        <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-xl p-4 flex flex-col justify-between hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-semibold uppercase text-[10px] tracking-wider">Shift Overruns</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-amber-400 font-mono">{kpis.overrunCount} Days</div>
            <div className="text-[11px] text-slate-400 mt-1">
              {kpis.overrunCount > 0 ? 'Past 21:00 WAT closing cutoff' : 'Zero closing breaches'}
            </div>
          </div>
        </div>

        {/* KPI 4: Net Hours Variance */}
        <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-xl p-4 flex flex-col justify-between hover:border-cyan-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-semibold uppercase text-[10px] tracking-wider">Hours Variance</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-cyan-300 font-mono">
              {kpis.netVariance >= 0 ? `+${kpis.netVariance}h` : `${kpis.netVariance}h`}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Logged: <strong className="text-white font-mono">{kpis.actHours}h</strong> / {kpis.expHours}h
            </div>
          </div>
        </div>

        {/* KPI 5: Active Daily Workforce */}
        <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-xl p-4 flex flex-col justify-between hover:border-indigo-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-semibold uppercase text-[10px] tracking-wider">Avg Reps on Duty</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-indigo-300 font-mono">{kpis.avgMerchPerDay} VSRs</div>
            <div className="text-[11px] text-slate-400 mt-1">
              Active across <strong className="text-white font-mono">{kpis.avgPOSPerDay}</strong> POS nodes
            </div>
          </div>
        </div>
      </div>

      {/* REGIONAL STORE SHIFT BENCHMARKS BANNER */}
      <div className="bg-[#0a1122] border border-[#1c2c4d] rounded-xl p-4">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Regional Operating Schedules (WAT Timezone Standard)
            </h3>
          </div>
          <span className="text-[11px] text-rose-400 font-semibold bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800/40">
            Strict 21:00 WAT Daily Closing Cutoff Across All Hubs
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-[#0f1b33] p-3 rounded-lg border border-[#1e2f55]">
            <div className="flex items-center justify-between font-bold text-white mb-1">
              <span>Lagos Southwest</span>
              <span className="text-[#92C842] font-mono">14.0h Standard</span>
            </div>
            <div className="text-slate-400 text-[11px]">
              Shift: <strong className="text-slate-200">07:00 – 21:00 WAT</strong>
            </div>
            <div className="text-slate-500 text-[10px] mt-0.5">38 Avg Field Reps • 680 POS Nodes</div>
          </div>

          <div className="bg-[#0f1b33] p-3 rounded-lg border border-[#1e2f55]">
            <div className="flex items-center justify-between font-bold text-white mb-1">
              <span>Oyo Ibadan Cluster</span>
              <span className="text-cyan-400 font-mono">13.5h Standard</span>
            </div>
            <div className="text-slate-400 text-[11px]">
              Shift: <strong className="text-slate-200">07:30 – 21:00 WAT</strong>
            </div>
            <div className="text-slate-500 text-[10px] mt-0.5">19 Avg Field Reps • 340 POS Nodes</div>
          </div>

          <div className="bg-[#0f1b33] p-3 rounded-lg border border-[#1e2f55]">
            <div className="flex items-center justify-between font-bold text-white mb-1">
              <span>Ogun Hub (Abeokuta)</span>
              <span className="text-amber-400 font-mono">13.0h Standard</span>
            </div>
            <div className="text-slate-400 text-[11px]">
              Shift: <strong className="text-slate-200">08:00 – 21:00 WAT</strong>
            </div>
            <div className="text-slate-500 text-[10px] mt-0.5">12 Avg Field Reps • 220 POS Nodes</div>
          </div>

          <div className="bg-[#0f1b33] p-3 rounded-lg border border-[#1e2f55]">
            <div className="flex items-center justify-between font-bold text-white mb-1">
              <span>Benin Sector (Edo)</span>
              <span className="text-purple-400 font-mono">13.0h Standard</span>
            </div>
            <div className="text-slate-400 text-[11px]">
              Shift: <strong className="text-slate-200">08:00 – 21:00 WAT</strong>
            </div>
            <div className="text-slate-500 text-[10px] mt-0.5">10 Avg Field Reps • 180 POS Nodes</div>
          </div>
        </div>
      </div>

      {/* 30-DAY INTERACTIVE HEATMAP CALENDAR */}
      <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#92C842]" />
              30-Day Shift Heatmap Matrix
            </h2>
            <p className="text-[11px] text-slate-400">
              Click any calendar day to inspect full regional hours, variance, and operational dispatch logs.
            </p>
          </div>

          {/* Color Legend */}
          <div className="flex items-center gap-3 text-[11px] flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500 inline-block" />
              <span className="text-slate-300">Compliant (≥99%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500 inline-block" />
              <span className="text-slate-300">Overrun (&gt;21:00 WAT)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-cyan-500/20 border border-cyan-500 inline-block" />
              <span className="text-slate-300">Minor Variance</span>
            </div>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-10 gap-2">
          {baseData.map((record) => {
            const data = getRecordForHub(record, selectedHub);
            const isSelected = selectedDayRecord?.date === record.date;
            const isOverrun = data.status === 'major_overrun' || data.status === 'minor_overrun';
            const isUnder = data.status === 'under_hours';

            let bgClass = 'bg-[#131d36] border-[#223359] text-slate-300 hover:border-slate-400';
            if (isOverrun) {
              bgClass = 'bg-amber-950/30 border-amber-600/50 text-amber-200 hover:border-amber-400';
            } else if (isUnder) {
              bgClass = 'bg-cyan-950/30 border-cyan-600/50 text-cyan-200 hover:border-cyan-400';
            } else {
              bgClass = 'bg-emerald-950/25 border-emerald-600/40 text-emerald-200 hover:border-emerald-400';
            }

            return (
              <button
                key={record.date}
                onClick={() => {
                  setSelectedDayRecord(record);
                  setIsDetailModalOpen(true);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between min-h-[78px] ${bgClass} ${
                  isSelected ? 'ring-2 ring-[#92C842] shadow-md shadow-[#92C842]/20' : ''
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="font-bold">{record.displayDate}</span>
                  <span className="text-[10px] text-slate-400 uppercase">{record.dayOfWeek}</span>
                </div>

                <div className="my-1">
                  <div className="text-xs font-black font-mono">
                    {data.actualHours}h{' '}
                    <span className="text-[10px] font-normal text-slate-400">
                      ({data.varianceHours >= 0 ? `+${data.varianceHours}` : data.varianceHours}h)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-mono font-semibold">{data.adherenceRate}%</span>
                  {isOverrun && (
                    <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-400 text-[9px] font-bold">
                      OVERRUN
                    </span>
                  )}
                  {!isOverrun && !isUnder && (
                    <span className="px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">
                      OK
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* FILTER BAR & CONTROLS */}
      <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Hub Selector */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Regional Hub:
          </span>
          {(['All', 'Lagos', 'Ibadan', 'Ogun', 'Benin'] as HubKey[]).map((hub) => {
            const isSelected = selectedHub === hub;
            return (
              <button
                key={hub}
                onClick={() => setSelectedHub(hub)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-[#92C842] text-[#090e1c] shadow-sm'
                    : 'bg-[#141f38] hover:bg-[#1a294a] text-slate-300 border border-[#1e2f55]'
                }`}
              >
                {hub === 'All' ? 'All 4 Hubs (Consolidated)' : hub}
              </button>
            );
          })}
        </div>

        {/* Status & Time Horizon Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Time Window */}
          <div className="flex items-center bg-[#141f38] border border-[#1e2f55] rounded-lg p-0.5 text-xs">
            {(['30d', '14d', '7d'] as TimeWindow[]).map((tw) => (
              <button
                key={tw}
                onClick={() => setTimeWindow(tw)}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  timeWindow === tw ? 'bg-[#92C842] text-[#090e1c] font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tw === '30d' ? '30 Days' : tw === '14d' ? '14 Days' : '7 Days'}
              </button>
            ))}
          </div>

          {/* Status Dropdown / Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="bg-[#141f38] border border-[#1e2f55] text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:border-[#92C842] focus:outline-none"
          >
            <option value="all">All Statuses ({baseData.length})</option>
            <option value="compliant">Compliant Shifts Only</option>
            <option value="overrun">Shift Overruns (&gt; 21:00 WAT)</option>
            <option value="under_hours">Undertime (&lt; Expected)</option>
          </select>

          {/* Search Field */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search day or event note..."
              className="bg-[#141f38] border border-[#1e2f55] rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-[#92C842] focus:outline-none w-48 sm:w-56"
            />
          </div>
        </div>
      </div>

      {/* DAILY AUDIT LOG TABLE */}
      <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#1e2d4d] flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              Daily Shift Adherence Log
            </h3>
            <p className="text-[11px] text-slate-400">
              Showing {filteredRecords.length} audited operational days for{' '}
              <strong className="text-white">{selectedHub === 'All' ? 'All Regional Hubs' : `${selectedHub} Hub`}</strong>
            </p>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Standard closing: <strong className="text-amber-400">21:00 WAT</strong>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#090e1c] text-slate-400 uppercase text-[10px] tracking-wider border-b border-[#1e2d4d]">
              <tr>
                <th className="py-3 px-4">Date / Day</th>
                <th className="py-3 px-4">Standard Expected</th>
                <th className="py-3 px-4">Actual Hours Logged</th>
                <th className="py-3 px-4">Variance</th>
                <th className="py-3 px-4">Adherence</th>
                <th className="py-3 px-4">On Duty (VSRs)</th>
                <th className="py-3 px-4">Active POS</th>
                <th className="py-3 px-4">21:00 WAT Closing Status</th>
                <th className="py-3 px-4">Operational Dispatch Notes</th>
                <th className="py-3 px-4 text-right">Audit Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#182540]">
              {filteredRecords.map((record) => {
                const data = getRecordForHub(record, selectedHub);
                const isOverrun = data.status === 'major_overrun' || data.status === 'minor_overrun';
                const isUnder = data.status === 'under_hours';

                return (
                  <tr
                    key={record.date}
                    className="hover:bg-[#131d36] transition-colors group cursor-pointer"
                    onClick={() => {
                      setSelectedDayRecord(record);
                      setIsDetailModalOpen(true);
                    }}
                  >
                    {/* Date / Day */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-white">{record.displayDate} 2026</div>
                      <div className="text-[10px] text-slate-500 uppercase">{record.dayOfWeek} • {record.date}</div>
                    </td>

                    {/* Standard Expected */}
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-300">
                      {data.expectedHours.toFixed(1)} hrs
                    </td>

                    {/* Actual Hours */}
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {data.actualHours.toFixed(1)} hrs
                    </td>

                    {/* Variance */}
                    <td className="py-3.5 px-4 font-mono">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                          isOverrun
                            ? 'bg-amber-950/40 text-amber-300 border border-amber-800/40'
                            : isUnder
                            ? 'bg-cyan-950/40 text-cyan-300 border border-cyan-800/40'
                            : 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40'
                        }`}
                      >
                        {data.varianceHours >= 0 ? `+${data.varianceHours}` : data.varianceHours}h
                      </span>
                    </td>

                    {/* Adherence Rate */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-black ${
                            data.adherenceRate >= 99
                              ? 'text-emerald-400'
                              : data.adherenceRate >= 97
                              ? 'text-cyan-400'
                              : 'text-amber-400'
                          }`}
                        >
                          {data.adherenceRate}%
                        </span>
                      </div>
                    </td>

                    {/* On Duty Reps */}
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      <span className="font-semibold text-white">{data.merchandiserCount}</span> reps
                    </td>

                    {/* Active POS */}
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      <span className="font-semibold text-white">{data.activePOS}</span> nodes
                    </td>

                    {/* 21:00 Closing Status */}
                    <td className="py-3.5 px-4">
                      {isOverrun ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          <AlertTriangle className="w-3 h-3" /> Shift Overrun Past 21:00
                        </span>
                      ) : isUnder ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                          <Clock className="w-3 h-3" /> Early Signoff Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" /> Compliant at 21:00 WAT
                        </span>
                      )}
                    </td>

                    {/* Notes */}
                    <td className="py-3.5 px-4 max-w-xs truncate text-[11px] text-slate-400">
                      {data.notes || 'Routine scheduled shift logged.'}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDayRecord(record);
                          setIsDetailModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-[#141f38] hover:bg-[#1f2f55] text-slate-300 hover:text-white transition-colors"
                        title="View Day Breakdown"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500 text-xs">
                    No shift adherence records found matching your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DAY BREAKDOWN MODAL */}
      {isDetailModalOpen && selectedDayRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0b1222] border border-[#1e2d4d] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#1e2d4d] flex items-center justify-between sticky top-0 bg-[#0b1222] z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-[#92C842]/20 text-[#92C842]">
                    SHIFT AUDIT DRILLDOWN
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {selectedDayRecord.dayOfWeek}, {selectedDayRecord.displayDate} 2026 ({selectedDayRecord.date})
                  </span>
                </div>
                <h3 className="text-xl font-black text-white tracking-tight">
                  Regional Store Shift Analysis
                </h3>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-2 rounded-xl bg-[#141f38] text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Daily Consolidated Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0e1628] border border-[#1e2d4d] rounded-xl p-4">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Total Hours</div>
                  <div className="text-lg font-black text-white font-mono mt-0.5">
                    {selectedDayRecord.aggregate.actualHours} hrs
                  </div>
                  <div className="text-[10px] text-slate-500">Exp: {selectedDayRecord.aggregate.expectedHours}h</div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Variance</div>
                  <div className="text-lg font-black font-mono text-cyan-300 mt-0.5">
                    {selectedDayRecord.aggregate.varianceHours >= 0
                      ? `+${selectedDayRecord.aggregate.varianceHours}`
                      : selectedDayRecord.aggregate.varianceHours}h
                  </div>
                  <div className="text-[10px] text-slate-500">Net regional variance</div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Adherence</div>
                  <div className="text-lg font-black font-mono text-emerald-400 mt-0.5">
                    {selectedDayRecord.aggregate.adherenceRate}%
                  </div>
                  <div className="text-[10px] text-slate-500">Overall score</div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Active Reps / POS</div>
                  <div className="text-lg font-black font-mono text-indigo-300 mt-0.5">
                    {selectedDayRecord.aggregate.totalMerchandisers} / {selectedDayRecord.aggregate.totalActivePOS}
                  </div>
                  <div className="text-[10px] text-slate-500">Deployed workforce</div>
                </div>
              </div>

              {/* 4 Regional Hub Cards for Selected Day */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Regional Breakdown (WAT Standard Schedule)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Lagos */}
                  <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">Lagos Southwest</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                        {selectedDayRecord.Lagos.adherenceRate}% Adherence
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 flex items-center justify-between">
                      <span>Shift: 07:00 – 21:00 WAT</span>
                      <span className="font-mono font-bold">
                        {selectedDayRecord.Lagos.actualHours}h / {selectedDayRecord.Lagos.expectedHours}h
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 bg-[#131d36] p-2.5 rounded-lg border border-[#1c2b4d]">
                      {selectedDayRecord.Lagos.notes || 'Operating within standard parameters.'}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                      <span>Reps: {selectedDayRecord.Lagos.merchandiserCount}</span>
                      <span>POS Nodes: {selectedDayRecord.Lagos.activePOS}</span>
                      <span>Status: {selectedDayRecord.Lagos.status.toUpperCase()}</span>
                    </div>
                  </div>

                  {/* Ibadan */}
                  <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">Oyo Ibadan Cluster</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                        {selectedDayRecord.Ibadan.adherenceRate}% Adherence
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 flex items-center justify-between">
                      <span>Shift: 07:30 – 21:00 WAT</span>
                      <span className="font-mono font-bold">
                        {selectedDayRecord.Ibadan.actualHours}h / {selectedDayRecord.Ibadan.expectedHours}h
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 bg-[#131d36] p-2.5 rounded-lg border border-[#1c2b4d]">
                      {selectedDayRecord.Ibadan.notes || 'Operating within standard parameters.'}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                      <span>Reps: {selectedDayRecord.Ibadan.merchandiserCount}</span>
                      <span>POS Nodes: {selectedDayRecord.Ibadan.activePOS}</span>
                      <span>Status: {selectedDayRecord.Ibadan.status.toUpperCase()}</span>
                    </div>
                  </div>

                  {/* Ogun */}
                  <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">Ogun Industrial Hub</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                        {selectedDayRecord.Ogun.adherenceRate}% Adherence
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 flex items-center justify-between">
                      <span>Shift: 08:00 – 21:00 WAT</span>
                      <span className="font-mono font-bold">
                        {selectedDayRecord.Ogun.actualHours}h / {selectedDayRecord.Ogun.expectedHours}h
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 bg-[#131d36] p-2.5 rounded-lg border border-[#1c2b4d]">
                      {selectedDayRecord.Ogun.notes || 'Operating within standard parameters.'}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                      <span>Reps: {selectedDayRecord.Ogun.merchandiserCount}</span>
                      <span>POS Nodes: {selectedDayRecord.Ogun.activePOS}</span>
                      <span>Status: {selectedDayRecord.Ogun.status.toUpperCase()}</span>
                    </div>
                  </div>

                  {/* Benin */}
                  <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">Benin Edo Sector</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">
                        {selectedDayRecord.Benin.adherenceRate}% Adherence
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 flex items-center justify-between">
                      <span>Shift: 08:00 – 21:00 WAT</span>
                      <span className="font-mono font-bold">
                        {selectedDayRecord.Benin.actualHours}h / {selectedDayRecord.Benin.expectedHours}h
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 bg-[#131d36] p-2.5 rounded-lg border border-[#1c2b4d]">
                      {selectedDayRecord.Benin.notes || 'Operating within standard parameters.'}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                      <span>Reps: {selectedDayRecord.Benin.merchandiserCount}</span>
                      <span>POS Nodes: {selectedDayRecord.Benin.activePOS}</span>
                      <span>Status: {selectedDayRecord.Benin.status.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#1e2d4d] bg-[#090e1c] flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs text-slate-500">
                Official Shift Audit Certificate • KEA Operations Control
              </span>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#141f38] hover:bg-[#1e2d4d] text-white transition-colors"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
