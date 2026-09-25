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
type KpiModalType = 'adherence_rate' | 'on_time_days' | 'late_closing_days' | 'hours_logged' | 'staff_on_duty' | null;

export const ShiftAdherence30DayView: React.FC<ShiftAdherence30DayViewProps> = ({
  onBackToDashboard,
  onOpenLocationAudit,
  onOpenShiftModal
}) => {
  const [selectedHub, setSelectedHub] = useState<HubKey>('All');
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('30d');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [kpiModalType, setKpiModalType] = useState<KpiModalType>(null);
  const [kpiModalSearch, setKpiModalSearch] = useState<string>('');
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
      link.setAttribute('download', `KEA_30Day_Shift_Attendance_Audit_${new Date().toISOString().slice(0, 10)}.csv`);
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
      {/* TOP HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-[12px] border border-slate-200/80 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold font-mono tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" /> 30-Day Attendance Record
            </span>
            <span className="text-xs text-slate-500 font-mono">• 23 Aug 2026 – 21 Sep 2026</span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-600 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              <Clock className="w-3 h-3 text-slate-500" /> West Africa Time (WAT)
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            30-Day Shift Attendance
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Monitor daily work shifts across all store branches against the mandatory{' '}
            <strong className="text-slate-800 font-semibold">21:00 WAT closing cutoff</strong>. Track logged hours, staff attendance, active terminals, and overtime variances.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onOpenLocationAudit}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all shadow-sm"
          >
            <Compass className="w-3.5 h-3.5 text-slate-600" />
            <span>Store Location Check-Ins</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
          </button>

          <button
            onClick={handleExportCsv}
            disabled={isExporting}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#10b981] hover:bg-emerald-600 text-white transition-all shadow-sm disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Exporting...' : 'Download Attendance (CSV)'}</span>
          </button>
        </div>
      </div>

      {/* 5 EXECUTIVE KPI STATS (Click to open full tabular live data popup) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* KPI 1: Overall Adherence Rate */}
        <div
          onClick={() => setKpiModalType('adherence_rate')}
          className="bg-white rounded-[12px] border border-slate-200/80 p-4 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group"
          title="Click to view full tabular adherence list for all 30 days"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-semibold uppercase text-[10px] tracking-wider">Attendance Rate</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-mono group-hover:text-emerald-600 transition-colors">{kpis.avgAdherence}%</div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
              <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded text-[10px]">Target ≥ 98%</span>
              <span className="text-emerald-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">View List ↗</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Compliant Days */}
        <div
          onClick={() => setKpiModalType('on_time_days')}
          className="bg-white rounded-[12px] border border-slate-200/80 p-4 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group"
          title="Click to view tabular list of all on-time shift days"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-semibold uppercase text-[10px] tracking-wider">On-Time Days</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-mono group-hover:text-emerald-600 transition-colors">
              {kpis.compliantCount} <span className="text-xs text-slate-400 font-normal">/ {kpis.totalDays}</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
              <span>{Math.round((kpis.compliantCount / kpis.totalDays) * 100)}% on-time closing</span>
              <span className="text-emerald-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">View List ↗</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Overrun Days (> 21:00 WAT) */}
        <div
          onClick={() => setKpiModalType('late_closing_days')}
          className="bg-white rounded-[12px] border border-amber-200 p-4 flex flex-col justify-between shadow-[0_2px_8px_rgba(245,158,11,0.06)] hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group"
          title="Click to view tabular list of late closing overrun days"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-semibold uppercase text-[10px] tracking-wider text-amber-700">Late Closing Days</span>
            <AlertTriangle className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="text-2xl font-black text-amber-600 font-mono">{kpis.overrunCount} Days</div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
              <span>{kpis.overrunCount > 0 ? 'Closed past 21:00 WAT' : 'Zero breaches'}</span>
              <span className="text-amber-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Audit List ↗</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Net Hours Variance */}
        <div
          onClick={() => setKpiModalType('hours_logged')}
          className="bg-white rounded-[12px] border border-slate-200/80 p-4 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:border-sky-400 hover:shadow-md transition-all cursor-pointer group"
          title="Click to view tabular breakdown of expected vs actual hours logged"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-semibold uppercase text-[10px] tracking-wider">Hours Logged</span>
            <TrendingUp className="w-4 h-4 text-sky-500 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-mono group-hover:text-sky-600 transition-colors">
              {kpis.actHours}h
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
              <span>Exp: <strong className="text-slate-700 font-mono">{kpis.expHours}h</strong> ({kpis.netVariance >= 0 ? `+${kpis.netVariance}` : kpis.netVariance}h)</span>
              <span className="text-sky-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Ledger ↗</span>
            </div>
          </div>
        </div>

        {/* KPI 5: Active Daily Workforce */}
        <div
          onClick={() => setKpiModalType('staff_on_duty')}
          className="bg-white rounded-[12px] border border-slate-200/80 p-4 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group"
          title="Click to view tabular roster of daily staff and active POS terminals"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span className="font-semibold uppercase text-[10px] tracking-wider">Avg Staff On Duty</span>
            <Users className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-mono group-hover:text-indigo-600 transition-colors">{kpis.avgMerchPerDay} Staff</div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
              <span><strong className="text-slate-700 font-mono">{kpis.avgPOSPerDay}</strong> active POS</span>
              <span className="text-indigo-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Roster ↗</span>
            </div>
          </div>
        </div>
      </div>

      {/* REGIONAL STORE SHIFT BENCHMARKS BANNER (Click card to filter by Hub) */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-[12px] p-4">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Branch Working Hours Schedule
            </h3>
          </div>
          <span className="text-[11px] text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
            Mandatory 21:00 WAT Closing Across All Branches
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div 
            onClick={() => setSelectedHub('Lagos')}
            className={`p-3 rounded-lg border shadow-xs cursor-pointer transition-all hover:scale-[1.02] ${
              selectedHub === 'Lagos' ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20' : 'bg-white border-slate-200 hover:border-emerald-300'
            }`}
          >
            <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
              <span>Lagos Southwest</span>
              <span className="text-emerald-700 font-mono bg-emerald-50 px-1.5 py-0.2 rounded text-[11px]">14.0h Shift</span>
            </div>
            <div className="text-slate-500 text-[11px]">
              Hours: <strong className="text-slate-800">07:00 – 21:00 WAT</strong>
            </div>
            <div className="text-slate-400 text-[10px] mt-0.5">38 Avg Field Reps • 680 POS Nodes</div>
          </div>

          <div 
            onClick={() => setSelectedHub('Ibadan')}
            className={`p-3 rounded-lg border shadow-xs cursor-pointer transition-all hover:scale-[1.02] ${
              selectedHub === 'Ibadan' ? 'bg-sky-50/70 border-sky-500 ring-2 ring-sky-500/20' : 'bg-white border-slate-200 hover:border-sky-300'
            }`}
          >
            <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
              <span>Oyo Ibadan Cluster</span>
              <span className="text-sky-700 font-mono bg-sky-50 px-1.5 py-0.2 rounded text-[11px]">13.5h Shift</span>
            </div>
            <div className="text-slate-500 text-[11px]">
              Hours: <strong className="text-slate-800">07:30 – 21:00 WAT</strong>
            </div>
            <div className="text-slate-400 text-[10px] mt-0.5">19 Avg Field Reps • 340 POS Nodes</div>
          </div>

          <div 
            onClick={() => setSelectedHub('Ogun')}
            className={`p-3 rounded-lg border shadow-xs cursor-pointer transition-all hover:scale-[1.02] ${
              selectedHub === 'Ogun' ? 'bg-amber-50/70 border-amber-500 ring-2 ring-amber-500/20' : 'bg-white border-slate-200 hover:border-amber-300'
            }`}
          >
            <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
              <span>Ogun Hub (Abeokuta)</span>
              <span className="text-amber-700 font-mono bg-amber-50 px-1.5 py-0.2 rounded text-[11px]">13.0h Shift</span>
            </div>
            <div className="text-slate-500 text-[11px]">
              Hours: <strong className="text-slate-800">08:00 – 21:00 WAT</strong>
            </div>
            <div className="text-slate-400 text-[10px] mt-0.5">12 Avg Field Reps • 220 POS Nodes</div>
          </div>

          <div 
            onClick={() => setSelectedHub('Benin')}
            className={`p-3 rounded-lg border shadow-xs cursor-pointer transition-all hover:scale-[1.02] ${
              selectedHub === 'Benin' ? 'bg-purple-50/70 border-purple-500 ring-2 ring-purple-500/20' : 'bg-white border-slate-200 hover:border-purple-300'
            }`}
          >
            <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
              <span>Benin Sector (Edo)</span>
              <span className="text-purple-700 font-mono bg-purple-50 px-1.5 py-0.2 rounded text-[11px]">13.0h Shift</span>
            </div>
            <div className="text-slate-500 text-[11px]">
              Hours: <strong className="text-slate-800">08:00 – 21:00 WAT</strong>
            </div>
            <div className="text-slate-400 text-[10px] mt-0.5">10 Avg Field Reps • 180 POS Nodes</div>
          </div>
        </div>
      </div>

      {/* 30-DAY INTERACTIVE HEATMAP CALENDAR */}
      <div className="bg-white rounded-[12px] border border-slate-200/80 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              30-Day Shift Attendance Calendar
            </h2>
            <p className="text-[11px] text-slate-500">
              Click any calendar day below to view full details for that date.
            </p>
          </div>

          {/* Color Legend */}
          <div className="flex items-center gap-3 text-[11px] flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-400 inline-block" />
              <span className="text-slate-600">On-Time (≥99%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-100 border border-amber-400 inline-block" />
              <span className="text-slate-600">Late Closing (&gt;21:00 WAT)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-sky-100 border border-sky-400 inline-block" />
              <span className="text-slate-600">Early Signoff</span>
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

            let bgClass = 'bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-400';
            if (isOverrun) {
              bgClass = 'bg-amber-50/70 border-amber-300 text-amber-900 hover:border-amber-400';
            } else if (isUnder) {
              bgClass = 'bg-sky-50/70 border-sky-300 text-sky-900 hover:border-sky-400';
            } else {
              bgClass = 'bg-emerald-50/70 border-emerald-300 text-emerald-950 hover:border-emerald-400';
            }

            return (
              <button
                key={record.date}
                onClick={() => {
                  setSelectedDayRecord(record);
                  setIsDetailModalOpen(true);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between min-h-[78px] ${bgClass} ${
                  isSelected ? 'ring-2 ring-emerald-500 shadow-sm' : ''
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="font-bold">{record.displayDate}</span>
                  <span className="text-[10px] text-slate-500 uppercase">{record.dayOfWeek}</span>
                </div>

                <div className="my-1">
                  <div className="text-xs font-black font-mono">
                    {data.actualHours}h{' '}
                    <span className="text-[10px] font-normal text-slate-500">
                      ({data.varianceHours >= 0 ? `+${data.varianceHours}` : data.varianceHours}h)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-mono font-semibold">{data.adherenceRate}%</span>
                  {isOverrun && (
                    <span className="px-1 py-0.2 rounded bg-amber-200 text-amber-800 text-[9px] font-bold">
                      LATE
                    </span>
                  )}
                  {!isOverrun && !isUnder && (
                    <span className="px-1 py-0.2 rounded bg-emerald-200 text-emerald-800 text-[9px] font-bold">
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
      <div className="bg-white rounded-[12px] border border-slate-200/80 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
        {/* Hub Selector */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter by Hub:
          </span>
          {(['All', 'Lagos', 'Ibadan', 'Ogun', 'Benin'] as HubKey[]).map((hub) => {
            const isSelected = selectedHub === hub;
            return (
              <button
                key={hub}
                onClick={() => setSelectedHub(hub)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-[#10b981] text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                {hub === 'All' ? 'All 4 Hubs' : hub}
              </button>
            );
          })}
        </div>

        {/* Status & Time Horizon Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Time Window */}
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5 text-xs">
            {(['30d', '14d', '7d'] as TimeWindow[]).map((tw) => (
              <button
                key={tw}
                onClick={() => setTimeWindow(tw)}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  timeWindow === tw ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
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
            className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:border-emerald-500 focus:outline-none"
          >
            <option value="all">All Statuses ({baseData.length})</option>
            <option value="compliant">On-Time Shifts Only</option>
            <option value="overrun">Late Closing (&gt; 21:00 WAT)</option>
            <option value="under_hours">Early Signoff (&lt; Expected)</option>
          </select>

          {/* Search Field */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search date or notes..."
              className="bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none w-48 sm:w-56"
            />
          </div>
        </div>
      </div>

      {/* DAILY AUDIT LOG TABLE */}
      <div className="bg-white rounded-[12px] border border-slate-200/80 overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              Daily Shift Attendance Table
            </h3>
            <p className="text-[11px] text-slate-500">
              Showing {filteredRecords.length} recorded operational days for{' '}
              <strong className="text-slate-800">{selectedHub === 'All' ? 'All Regional Hubs' : `${selectedHub} Hub`}</strong>
            </p>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Closing cutoff: <strong className="text-rose-600">21:00 WAT</strong>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Date / Day</th>
                <th className="py-3 px-4">Expected Hours</th>
                <th className="py-3 px-4">Logged Hours</th>
                <th className="py-3 px-4">Variance</th>
                <th className="py-3 px-4">Attendance Rate</th>
                <th className="py-3 px-4">Staff on Duty</th>
                <th className="py-3 px-4">Active Terminals</th>
                <th className="py-3 px-4">21:00 WAT Closing Status</th>
                <th className="py-3 px-4">Daily Notes</th>
                <th className="py-3 px-4 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((record) => {
                const data = getRecordForHub(record, selectedHub);
                const isOverrun = data.status === 'major_overrun' || data.status === 'minor_overrun';
                const isUnder = data.status === 'under_hours';

                return (
                  <tr
                    key={record.date}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => {
                      setSelectedDayRecord(record);
                      setIsDetailModalOpen(true);
                    }}
                  >
                    {/* Date / Day */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-slate-900">{record.displayDate} 2026</div>
                      <div className="text-[10px] text-slate-400 uppercase">{record.dayOfWeek} • {record.date}</div>
                    </td>

                    {/* Standard Expected */}
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-600">
                      {data.expectedHours.toFixed(1)} hrs
                    </td>

                    {/* Actual Hours */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {data.actualHours.toFixed(1)} hrs
                    </td>

                    {/* Variance */}
                    <td className="py-3.5 px-4 font-mono">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                          isOverrun
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : isUnder
                            ? 'bg-sky-50 text-sky-700 border border-sky-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
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
                              ? 'text-emerald-600'
                              : data.adherenceRate >= 97
                              ? 'text-sky-600'
                              : 'text-amber-600'
                          }`}
                        >
                          {data.adherenceRate}%
                        </span>
                      </div>
                    </td>

                    {/* On Duty Reps */}
                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      <span className="font-semibold text-slate-900">{data.merchandiserCount}</span> staff
                    </td>

                    {/* Active POS */}
                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      <span className="font-semibold text-slate-900">{data.activePOS}</span> machines
                    </td>

                    {/* 21:00 Closing Status */}
                    <td className="py-3.5 px-4">
                      {isOverrun ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <AlertTriangle className="w-3 h-3 text-amber-600" /> Late Closing Past 21:00
                        </span>
                      ) : isUnder ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                          <Clock className="w-3 h-3 text-sky-600" /> Early Signoff Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> On-Time (21:00 WAT)
                        </span>
                      )}
                    </td>

                    {/* Notes */}
                    <td className="py-3.5 px-4 max-w-xs truncate text-[11px] text-slate-500">
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
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                        title="View Details"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 text-xs">
                    No shift records found matching your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DAY BREAKDOWN MODAL */}
      {isDetailModalOpen && selectedDayRecord && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-[16px] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                    SHIFT DETAILS
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {selectedDayRecord.dayOfWeek}, {selectedDayRecord.displayDate} 2026 ({selectedDayRecord.date})
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  Daily Branch Shift Breakdown
                </h3>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Daily Consolidated Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">Total Hours</div>
                  <div className="text-lg font-black text-slate-900 font-mono mt-0.5">
                    {selectedDayRecord.aggregate.actualHours} hrs
                  </div>
                  <div className="text-[10px] text-slate-400">Expected: {selectedDayRecord.aggregate.expectedHours}h</div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">Variance</div>
                  <div className="text-lg font-black font-mono text-sky-700 mt-0.5">
                    {selectedDayRecord.aggregate.varianceHours >= 0
                      ? `+${selectedDayRecord.aggregate.varianceHours}`
                      : selectedDayRecord.aggregate.varianceHours}h
                  </div>
                  <div className="text-[10px] text-slate-400">Net branch variance</div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">Attendance Rate</div>
                  <div className="text-lg font-black font-mono text-emerald-600 mt-0.5">
                    {selectedDayRecord.aggregate.adherenceRate}%
                  </div>
                  <div className="text-[10px] text-slate-400">Overall score</div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">Active Staff / Machines</div>
                  <div className="text-lg font-black font-mono text-indigo-700 mt-0.5">
                    {selectedDayRecord.aggregate.totalMerchandisers} / {selectedDayRecord.aggregate.totalActivePOS}
                  </div>
                  <div className="text-[10px] text-slate-400">Deployed workforce</div>
                </div>
              </div>

              {/* 4 Regional Hub Cards for Selected Day */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Regional Breakdown (WAT Timezone)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Lagos */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">Lagos Southwest</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                        {selectedDayRecord.Lagos.adherenceRate}% On-Time
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 flex items-center justify-between">
                      <span>Shift: 07:00 – 21:00 WAT</span>
                      <span className="font-mono font-bold text-slate-800">
                        {selectedDayRecord.Lagos.actualHours}h / {selectedDayRecord.Lagos.expectedHours}h
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      {selectedDayRecord.Lagos.notes || 'Operating within standard parameters.'}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                      <span>Staff: {selectedDayRecord.Lagos.merchandiserCount}</span>
                      <span>Machines: {selectedDayRecord.Lagos.activePOS}</span>
                      <span>Status: {selectedDayRecord.Lagos.status.toUpperCase()}</span>
                    </div>
                  </div>

                  {/* Ibadan */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">Oyo Ibadan Cluster</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 font-bold">
                        {selectedDayRecord.Ibadan.adherenceRate}% On-Time
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 flex items-center justify-between">
                      <span>Shift: 07:30 – 21:00 WAT</span>
                      <span className="font-mono font-bold text-slate-800">
                        {selectedDayRecord.Ibadan.actualHours}h / {selectedDayRecord.Ibadan.expectedHours}h
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      {selectedDayRecord.Ibadan.notes || 'Operating within standard parameters.'}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                      <span>Staff: {selectedDayRecord.Ibadan.merchandiserCount}</span>
                      <span>Machines: {selectedDayRecord.Ibadan.activePOS}</span>
                      <span>Status: {selectedDayRecord.Ibadan.status.toUpperCase()}</span>
                    </div>
                  </div>

                  {/* Ogun */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">Ogun Industrial Hub</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-bold">
                        {selectedDayRecord.Ogun.adherenceRate}% On-Time
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 flex items-center justify-between">
                      <span>Shift: 08:00 – 21:00 WAT</span>
                      <span className="font-mono font-bold text-slate-800">
                        {selectedDayRecord.Ogun.actualHours}h / {selectedDayRecord.Ogun.expectedHours}h
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      {selectedDayRecord.Ogun.notes || 'Operating within standard parameters.'}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                      <span>Staff: {selectedDayRecord.Ogun.merchandiserCount}</span>
                      <span>Machines: {selectedDayRecord.Ogun.activePOS}</span>
                      <span>Status: {selectedDayRecord.Ogun.status.toUpperCase()}</span>
                    </div>
                  </div>

                  {/* Benin */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">Benin Edo Sector</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-bold">
                        {selectedDayRecord.Benin.adherenceRate}% On-Time
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 flex items-center justify-between">
                      <span>Shift: 08:00 – 21:00 WAT</span>
                      <span className="font-mono font-bold text-slate-800">
                        {selectedDayRecord.Benin.actualHours}h / {selectedDayRecord.Benin.expectedHours}h
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      {selectedDayRecord.Benin.notes || 'Operating within standard parameters.'}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                      <span>Staff: {selectedDayRecord.Benin.merchandiserCount}</span>
                      <span>Machines: {selectedDayRecord.Benin.activePOS}</span>
                      <span>Status: {selectedDayRecord.Benin.status.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs text-slate-500">
                Official Shift Attendance Certificate • KEA Operations Control
              </span>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPI METRICS DRILL-DOWN TABULAR MODAL */}
      {kpiModalType && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-[16px] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                    LIVE KPI BREAKDOWN
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    30-Day Period • {selectedHub === 'All' ? 'All 4 Regional Hubs' : `${selectedHub} Hub`}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
                  {kpiModalType === 'adherence_rate' && <span>📈 Daily Attendance Rate Breakdown ({kpis.avgAdherence}%)</span>}
                  {kpiModalType === 'on_time_days' && <span>✅ On-Time Shift Days ({kpis.compliantCount} / {kpis.totalDays} Days)</span>}
                  {kpiModalType === 'late_closing_days' && <span>⚠️ Late Closing &amp; Overrun Audit ({kpis.overrunCount} Days)</span>}
                  {kpiModalType === 'hours_logged' && <span>⏱️ Hours Logged vs Expected Schedule ({kpis.actHours}h Total)</span>}
                  {kpiModalType === 'staff_on_duty' && <span>👥 Daily Active Staff &amp; POS Deployment ({kpis.avgMerchPerDay} Avg Staff)</span>}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCsv}
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={() => {
                    setKpiModalType(null);
                    setKpiModalSearch('');
                  }}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filter / Search Bar */}
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter by date, day, or operational notes..."
                  value={kpiModalSearch}
                  onChange={(e) => setKpiModalSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="text-slate-500 text-[11px] font-mono">
                Click any record to open full day details
              </div>
            </div>

            {/* Table Area */}
            <div className="overflow-y-auto max-h-[550px] flex-1">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 font-mono text-[10px] uppercase tracking-wider sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Date / Day</th>
                    <th className="py-3 px-4">Expected Hours</th>
                    <th className="py-3 px-4">Logged Hours</th>
                    <th className="py-3 px-4">Variance</th>
                    <th className="py-3 px-4">Attendance Rate</th>
                    <th className="py-3 px-4">Staff on Duty</th>
                    <th className="py-3 px-4">Active Terminals</th>
                    <th className="py-3 px-4">21:00 Closing Status</th>
                    <th className="py-3 px-4">Daily Notes</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {baseData
                    .filter((rec) => {
                      const data = getRecordForHub(rec, selectedHub);
                      if (kpiModalType === 'on_time_days' && data.status !== 'compliant') return false;
                      if (kpiModalType === 'late_closing_days' && data.status !== 'minor_overrun' && data.status !== 'major_overrun') return false;
                      if (kpiModalSearch.trim()) {
                        const q = kpiModalSearch.toLowerCase();
                        const matchDate = rec.date.toLowerCase().includes(q) || rec.displayDate.toLowerCase().includes(q);
                        const matchDay = rec.dayOfWeek.toLowerCase().includes(q);
                        const matchNotes = (data.notes || '').toLowerCase().includes(q);
                        return matchDate || matchDay || matchNotes;
                      }
                      return true;
                    })
                    .map((rec) => {
                      const data = getRecordForHub(rec, selectedHub);
                      const isOverrun = data.status === 'major_overrun' || data.status === 'minor_overrun';
                      const isUnder = data.status === 'under_hours';

                      return (
                        <tr
                          key={rec.date}
                          onClick={() => {
                            setSelectedDayRecord(rec);
                            setIsDetailModalOpen(true);
                          }}
                          className="hover:bg-emerald-50/50 cursor-pointer transition-colors"
                        >
                          <td className="py-3 px-4 font-bold text-slate-900">
                            {rec.displayDate} ({rec.dayOfWeek})
                          </td>
                          <td className="py-3 px-4 text-slate-600">{data.expectedHours.toFixed(1)}h</td>
                          <td className="py-3 px-4 font-bold text-slate-900">{data.actualHours.toFixed(1)}h</td>
                          <td className="py-3 px-4">
                            <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                              isOverrun ? 'bg-amber-50 text-amber-700 border border-amber-200' : isUnder ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}>
                              {data.varianceHours >= 0 ? `+${data.varianceHours}` : data.varianceHours}h
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`font-black ${data.adherenceRate >= 99 ? 'text-emerald-600' : data.adherenceRate >= 97 ? 'text-sky-600' : 'text-amber-600'}`}>
                              {data.adherenceRate}%
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-800">{data.merchandiserCount} staff</td>
                          <td className="py-3 px-4 text-slate-700">{data.activePOS} nodes</td>
                          <td className="py-3 px-4 font-sans">
                            {isOverrun ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1">
                                ⚠️ Late Closing
                              </span>
                            ) : isUnder ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200 inline-flex items-center gap-1">
                                ⏱️ Early Signoff
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                                ✓ On-Time (21:00)
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 max-w-xs truncate text-[11px] text-slate-500 font-sans">
                            {data.notes || 'Routine standard shift logged.'}
                          </td>
                          <td className="py-3 px-4 text-right font-sans">
                            <button className="px-2 py-1 rounded bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 text-[11px] font-bold transition-colors">
                              Inspect ↗
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Super Admin Operations Live Telemetry Ledger
              </span>
              <button
                onClick={() => {
                  setKpiModalType(null);
                  setKpiModalSearch('');
                }}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition-colors"
              >
                Close Ledger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
