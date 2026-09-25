import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import {
  THIRTY_DAY_ADHERENCE_DATA,
  REGIONAL_COMPLIANCE_SUMMARIES
} from '../data/complianceTrendsData';
import { DailyAdherenceRecord, RegionComplianceSummary, RegionalShiftDayData } from '../types';
import {
  ShieldCheck,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Download,
  Filter,
  Search,
  ArrowRight,
  TrendingUp,
  BarChart3,
  FileText,
  X
} from 'lucide-react';

interface ComplianceDashboardViewProps {
  onOpenShiftCompliance?: () => void;
  onOpenNewVSR?: () => void;
}

type SelectedRegion = 'All' | 'Lagos' | 'Ibadan' | 'Ogun' | 'Benin';
type ChartMode = 'dual_hours' | 'variance_bars' | 'adherence_pct';
type TimeRange = '30d' | '14d' | '7d';
type KpiModalType = 'attendance_rate' | 'on_time_shifts' | 'late_closings' | 'hours_logged' | 'closing_cutoff' | null;

export const ComplianceDashboardView: React.FC<ComplianceDashboardViewProps> = ({
  onOpenShiftCompliance,
  onOpenNewVSR
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // States
  const [selectedRegion, setSelectedRegion] = useState<SelectedRegion>('All');
  const [chartMode, setChartMode] = useState<ChartMode>('dual_hours');
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(29);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [kpiModalType, setKpiModalType] = useState<KpiModalType>(null);
  const [kpiModalSearch, setKpiModalSearch] = useState<string>('');
  const [selectedInspectDay, setSelectedInspectDay] = useState<DailyAdherenceRecord | null>(null);

  // Filter dataset by selected time range
  const filteredDataset: DailyAdherenceRecord[] = useMemo(() => {
    const total = THIRTY_DAY_ADHERENCE_DATA.length;
    if (timeRange === '7d') {
      return THIRTY_DAY_ADHERENCE_DATA.slice(total - 7);
    }
    if (timeRange === '14d') {
      return THIRTY_DAY_ADHERENCE_DATA.slice(total - 14);
    }
    return THIRTY_DAY_ADHERENCE_DATA;
  }, [timeRange]);

  useEffect(() => {
    setHoveredDayIndex((prev) => {
      if (prev === null || prev >= filteredDataset.length) {
        return filteredDataset.length - 1;
      }
      return prev;
    });
  }, [filteredDataset.length]);

  const currentSummary: RegionComplianceSummary = useMemo(() => {
    return REGIONAL_COMPLIANCE_SUMMARIES[selectedRegion];
  }, [selectedRegion]);

  const activeDayRecord: DailyAdherenceRecord = useMemo(() => {
    if (hoveredDayIndex === null) {
      return filteredDataset[filteredDataset.length - 1];
    }
    return filteredDataset[hoveredDayIndex] || filteredDataset[filteredDataset.length - 1];
  }, [hoveredDayIndex, filteredDataset]);

  const getDayRegionData = (record: DailyAdherenceRecord, reg: SelectedRegion): RegionalShiftDayData => {
    if (reg === 'All') {
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
    return record[reg];
  };

  const dynamicKpis = useMemo(() => {
    let expSum = 0;
    let actSum = 0;
    let compliantDays = 0;
    let overrunDays = 0;
    let underDays = 0;

    filteredDataset.forEach((d) => {
      const rd = getDayRegionData(d, selectedRegion);
      expSum += rd.expectedHours;
      actSum += rd.actualHours;
      if (rd.varianceHours > 0.15) {
        overrunDays += 1;
      } else if (rd.varianceHours < -0.15) {
        underDays += 1;
      } else {
        compliantDays += 1;
      }
    });

    const netVariance = actSum - expSum;
    const avgAdherence = (actSum / (expSum || 1)) * 100;

    return {
      totalDays: filteredDataset.length,
      expSum: parseFloat(expSum.toFixed(1)),
      actSum: parseFloat(actSum.toFixed(1)),
      netVariance: parseFloat(netVariance.toFixed(1)),
      avgAdherence: parseFloat(Math.min(100, avgAdherence).toFixed(1)),
      compliantDays,
      overrunDays,
      underDays
    };
  }, [filteredDataset, selectedRegion]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Date',
      'Day_Of_Week',
      'Hub',
      'Expected_Hours',
      'Actual_Hours',
      'Variance_Hours',
      'Adherence_Pct',
      'Active_VSRs',
      'Active_POS',
      'Closing_Status_2100_WAT',
      'Operational_Notes'
    ];

    const rows: string[] = [];
    filteredDataset.forEach((d) => {
      const hubs: SelectedRegion[] = ['Lagos', 'Ibadan', 'Ogun', 'Benin'];
      hubs.forEach((h) => {
        const rd = d[h as keyof DailyAdherenceRecord] as RegionalShiftDayData;
        rows.push(
          [
            d.date,
            d.dayOfWeek,
            h,
            rd.expectedHours,
            rd.actualHours,
            rd.varianceHours,
            `${rd.adherenceRate}%`,
            rd.merchandiserCount,
            rd.activePOS,
            rd.status.toUpperCase(),
            `"${(rd.notes || '').replace(/"/g, '""')}"`
          ].join(',')
        );
      });
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `KEA_Work_Hours_Compliance_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // D3 Chart Rendering
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 940;
    const height = 420;
    const margin = { top: 25, right: 35, bottom: 45, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const data = filteredDataset;
    const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);
    const defs = svg.append('defs');

    // Region Color standard
    const regionColor = '#10b981';

    const areaGrad = defs.append('linearGradient')
      .attr('id', 'area-fill-grad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    areaGrad.append('stop').attr('offset', '0%').attr('stop-color', regionColor).attr('stop-opacity', '0.20');
    areaGrad.append('stop').attr('offset', '100%').attr('stop-color', regionColor).attr('stop-opacity', '0.01');

    // SCALES
    const xScale = d3.scalePoint()
      .domain(data.map((d) => d.displayDate))
      .range([0, innerWidth])
      .padding(0.08);

    let yDomain = [0, 15];
    let yTickFormat = (d: any) => `${d}h`;

    if (chartMode === 'dual_hours') {
      const allVals: number[] = [];
      data.forEach((d) => {
        const rd = getDayRegionData(d, selectedRegion);
        allVals.push(rd.expectedHours, rd.actualHours);
      });
      const maxVal = Math.max(...allVals, 14);
      const minVal = Math.min(...allVals, 8);
      yDomain = [Math.max(0, Math.floor(minVal - 1)), Math.ceil(maxVal + 1.5)];
      yTickFormat = (d) => `${d}h`;
    } else if (chartMode === 'variance_bars') {
      yDomain = [-1.5, 2.0];
      yTickFormat = (d) => (d >= 0 ? `+${d}h` : `${d}h`);
    } else if (chartMode === 'adherence_pct') {
      yDomain = [90, 102];
      yTickFormat = (d) => `${d}%`;
    }

    const yScale = d3.scaleLinear().domain(yDomain).range([innerHeight, 0]).nice();

    // Gridlines
    const yGrid = d3.axisLeft(yScale)
      .ticks(6)
      .tickSize(-innerWidth)
      .tickFormat(() => '');

    g.append('g')
      .attr('class', 'grid-lines')
      .call(yGrid)
      .selectAll('line')
      .attr('stroke', '#e2e8f0')
      .attr('stroke-opacity', 0.8)
      .attr('stroke-dasharray', '3,4');

    g.selectAll('.grid-lines .domain').remove();

    // X Axis
    const xAxis = d3.axisBottom(xScale);
    const xAxisG = g.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(xAxis);

    xAxisG.select('.domain').attr('stroke', '#cbd5e1').attr('stroke-width', 1.5);
    xAxisG.selectAll('text')
      .attr('fill', '#64748b')
      .attr('font-size', data.length > 20 ? '9px' : '11px')
      .attr('font-family', 'monospace')
      .attr('dy', '14px');
    xAxisG.selectAll('line').attr('stroke', '#cbd5e1');

    // Y Axis
    const yAxis = d3.axisLeft(yScale).ticks(6).tickFormat(yTickFormat);
    const yAxisG = g.append('g').call(yAxis);
    yAxisG.select('.domain').remove();
    yAxisG.selectAll('text')
      .attr('fill', '#64748b')
      .attr('font-size', '11px')
      .attr('font-family', 'monospace')
      .attr('dx', '-6px');
    yAxisG.selectAll('line').remove();

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -45)
      .attr('x', -innerHeight / 2)
      .attr('text-anchor', 'middle')
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace')
      .attr('letter-spacing', '0.08em')
      .text(
        chartMode === 'dual_hours'
          ? 'WORK SHIFT HOURS (DAILY TOTAL)'
          : chartMode === 'variance_bars'
          ? 'SHIFT VARIANCE (+ OVERRUN / - UNDER)'
          : 'ATTENDANCE COMPLIANCE RATE (%)'
      );

    // MODE 1: DUAL EXPECTED VS ACTUAL HOURS
    if (chartMode === 'dual_hours') {
      const areaGen = d3.area<DailyAdherenceRecord>()
        .x((d) => xScale(d.displayDate) || 0)
        .y0((d) => yScale(getDayRegionData(d, selectedRegion).expectedHours))
        .y1((d) => yScale(getDayRegionData(d, selectedRegion).actualHours))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(data)
        .attr('fill', 'url(#area-fill-grad)')
        .attr('d', areaGen);

      const expectedLine = d3.line<DailyAdherenceRecord>()
        .x((d) => xScale(d.displayDate) || 0)
        .y((d) => yScale(getDayRegionData(d, selectedRegion).expectedHours))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#0284c7')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,4')
        .attr('d', expectedLine)
        .attr('opacity', 0.85);

      const actualLine = d3.line<DailyAdherenceRecord>()
        .x((d) => xScale(d.displayDate) || 0)
        .y((d) => yScale(getDayRegionData(d, selectedRegion).actualHours))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', regionColor)
        .attr('stroke-width', 3)
        .attr('d', actualLine);

      const dotsGroup = g.append('g').attr('class', 'actual-dots');
      data.forEach((d, idx) => {
        const cx = xScale(d.displayDate) || 0;
        const rd = getDayRegionData(d, selectedRegion);
        const cy = yScale(rd.actualHours);
        const isHovered = hoveredDayIndex === idx;

        const cyExp = yScale(rd.expectedHours);
        g.append('circle')
          .attr('cx', cx)
          .attr('cy', cyExp)
          .attr('r', 2.5)
          .attr('fill', '#0284c7')
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 1);

        const dotG = dotsGroup.append('g')
          .attr('transform', `translate(${cx}, ${cy})`)
          .style('cursor', 'pointer')
          .on('mouseenter', () => setHoveredDayIndex(idx))
          .on('click', () => setKpiModalType('attendance_rate'));

        if (isHovered) {
          dotG.append('circle')
            .attr('r', 8)
            .attr('fill', regionColor)
            .attr('fill-opacity', 0.25)
            .attr('stroke', regionColor)
            .attr('stroke-width', 1);
        }

        dotG.append('circle')
          .attr('r', isHovered ? 5 : 3.5)
          .attr('fill', rd.varianceHours > 0.3 ? '#f59e0b' : regionColor)
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 2);
      });
    }

    // MODE 2: VARIANCE BARS
    if (chartMode === 'variance_bars') {
      const zeroY = yScale(0);
      g.append('line')
        .attr('x1', 0)
        .attr('y1', zeroY)
        .attr('x2', innerWidth)
        .attr('y2', zeroY)
        .attr('stroke', '#94a3b8')
        .attr('stroke-width', 1.5);

      const barWidth = Math.max(6, Math.min(22, (innerWidth / data.length) * 0.65));

      data.forEach((d, idx) => {
        const cx = xScale(d.displayDate) || 0;
        const rd = getDayRegionData(d, selectedRegion);
        const yVal = yScale(rd.varianceHours);
        const isSelected = hoveredDayIndex === idx;

        const barY = Math.min(zeroY, yVal);
        const barH = Math.abs(yVal - zeroY);

        let barColor = '#10b981';
        if (rd.varianceHours > 0.35) barColor = '#ef4444';
        else if (rd.varianceHours > 0.1) barColor = '#f59e0b';
        else if (rd.varianceHours < -0.15) barColor = '#0284c7';

        g.append('rect')
          .attr('x', cx - barWidth / 2)
          .attr('y', barY)
          .attr('width', barWidth)
          .attr('height', Math.max(2, barH))
          .attr('rx', 2)
          .attr('fill', barColor)
          .attr('opacity', isSelected ? 1 : 0.8)
          .attr('cursor', 'pointer')
          .on('mouseenter', () => setHoveredDayIndex(idx))
          .on('click', () => setKpiModalType('hours_logged'));

        if (isSelected) {
          g.append('text')
            .attr('x', cx)
            .attr('y', rd.varianceHours >= 0 ? barY - 6 : barY + barH + 12)
            .attr('text-anchor', 'middle')
            .attr('fill', '#0f172a')
            .attr('font-size', '10px')
            .attr('font-weight', 'bold')
            .attr('font-family', 'monospace')
            .text(rd.varianceHours >= 0 ? `+${rd.varianceHours}h` : `${rd.varianceHours}h`);
        }
      });
    }

    // MODE 3: ADHERENCE PCT
    if (chartMode === 'adherence_pct') {
      const benchmarkY = yScale(98.0);
      g.append('line')
        .attr('x1', 0)
        .attr('y1', benchmarkY)
        .attr('x2', innerWidth)
        .attr('y2', benchmarkY)
        .attr('stroke', '#10b981')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '5,4')
        .attr('opacity', 0.7);

      g.append('text')
        .attr('x', innerWidth - 5)
        .attr('y', benchmarkY - 5)
        .attr('text-anchor', 'end')
        .attr('fill', '#10b981')
        .attr('font-size', '10px')
        .attr('font-family', 'monospace')
        .attr('font-weight', 'bold')
        .text('98% Target Standard');

      const adhLine = d3.line<DailyAdherenceRecord>()
        .x((d) => xScale(d.displayDate) || 0)
        .y((d) => yScale(getDayRegionData(d, selectedRegion).adherenceRate))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#10b981')
        .attr('stroke-width', 3)
        .attr('d', adhLine);

      data.forEach((d, idx) => {
        const cx = xScale(d.displayDate) || 0;
        const rd = getDayRegionData(d, selectedRegion);
        const cy = yScale(rd.adherenceRate);
        const isHovered = hoveredDayIndex === idx;

        g.append('circle')
          .attr('cx', cx)
          .attr('cy', cy)
          .attr('r', isHovered ? 5 : 3.5)
          .attr('fill', rd.adherenceRate >= 98 ? '#10b981' : '#f59e0b')
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 2)
          .style('cursor', 'pointer')
          .on('mouseenter', () => setHoveredDayIndex(idx))
          .on('click', () => setKpiModalType('attendance_rate'));
      });
    }

    // Crosshair Line
    if (hoveredDayIndex !== null && data[hoveredDayIndex]) {
      const activeX = xScale(data[hoveredDayIndex].displayDate) || 0;

      const crosshair = g.append('g').attr('class', 'crosshair');
      crosshair.append('line')
        .attr('x1', activeX)
        .attr('y1', 0)
        .attr('x2', activeX)
        .attr('y2', innerHeight)
        .attr('stroke', '#10b981')
        .attr('stroke-width', 1.5)
        .attr('stroke-opacity', 0.5)
        .attr('stroke-dasharray', '4,4');
    }

    // Overlay capture
    const overlay = g.append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .style('cursor', 'pointer');

    overlay.on('mousemove', (event) => {
      const [mouseX] = d3.pointer(event);
      let closestIdx = 0;
      let minDistance = Infinity;

      data.forEach((d, idx) => {
        const x = xScale(d.displayDate) || 0;
        const dist = Math.abs(mouseX - x);
        if (dist < minDistance) {
          minDistance = dist;
          closestIdx = idx;
        }
      });

      setHoveredDayIndex(closestIdx);
    });

    overlay.on('click', () => {
      setKpiModalType('attendance_rate');
    });

  }, [filteredDataset, selectedRegion, chartMode, hoveredDayIndex]);

  const activeDayHubData = getDayRegionData(activeDayRecord, selectedRegion);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. TOP EXECUTIVE HEADER BANNER */}
      <div className="bg-white rounded-[12px] border border-slate-200/80 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Work Hours &amp; Closing Time
              </h1>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                21:00 WAT BENCHMARK
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                30-DAY AUDIT
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Track work hours across store branches and verify that all retail shifts finish promptly by the mandatory{' '}
              <strong className="text-slate-800 font-semibold">21:00 WAT cutoff</strong>.
            </p>
          </div>
        </div>

        {/* Global Toolbar Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
            title="Download CSV dataset"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Download CSV</span>
          </button>

          {onOpenShiftCompliance && (
            <button
              onClick={onOpenShiftCompliance}
              className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
              title="Generate PDF Report"
            >
              <FileText className="w-4 h-4 text-slate-600" />
              <span>Daily Shift Report (PDF)</span>
            </button>
          )}

          {onOpenNewVSR && (
            <button
              onClick={onOpenNewVSR}
              className="px-4 py-2 rounded-xl bg-[#10b981] hover:bg-emerald-600 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
            >
              + Allocate Staff
            </button>
          )}
        </div>
      </div>

      {/* 2. 5 EXECUTIVE COMPLIANCE KPI STATS (Click to open live tabular records popup) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* KPI 1 */}
        <div 
          onClick={() => setKpiModalType('attendance_rate')}
          className="bg-white rounded-[12px] border border-slate-200/80 p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group"
          title="Click to view full tabular compliance rate for all days"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>ATTENDANCE RATE</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-slate-900 font-mono group-hover:text-emerald-600 transition-colors">{dynamicKpis.avgAdherence}%</div>
            <div className="text-xs text-slate-500 mt-0.5 flex items-center justify-between">
              <span>Target: ≥98.0% standard</span>
              <span className="text-emerald-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Ledger ↗</span>
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div 
          onClick={() => setKpiModalType('on_time_shifts')}
          className="bg-white rounded-[12px] border border-slate-200/80 p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group"
          title="Click to view tabular list of compliant on-time shift days"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>ON-TIME SHIFTS</span>
            <span className="text-emerald-700 font-bold text-[10px] bg-emerald-50 px-1.5 py-0.2 rounded">ON-TARGET</span>
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-slate-900 font-mono group-hover:text-emerald-600 transition-colors">
              {dynamicKpis.compliantDays}{' '}
              <span className="text-xs text-slate-400 font-normal">/ {dynamicKpis.totalDays}d</span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5 flex items-center justify-between">
              <span>Compliant with 21:00 WAT</span>
              <span className="text-emerald-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Ledger ↗</span>
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div 
          onClick={() => setKpiModalType('late_closings')}
          className="bg-white rounded-[12px] border border-amber-200 p-4 shadow-[0_2px_8px_rgba(245,158,11,0.06)] flex flex-col justify-between hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group"
          title="Click to view tabular list of late closing days"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
            <span className="text-amber-700 font-bold">LATE CLOSINGS</span>
            <AlertTriangle className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-amber-600 font-mono">{dynamicKpis.overrunDays} Days</div>
            <div className="text-xs text-slate-500 mt-0.5 flex items-center justify-between">
              <span>Exceeded 21:00 WAT cutoff</span>
              <span className="text-amber-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Audit ↗</span>
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div 
          onClick={() => setKpiModalType('hours_logged')}
          className="bg-white rounded-[12px] border border-slate-200/80 p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:border-sky-400 hover:shadow-md transition-all cursor-pointer group"
          title="Click to view tabular expected vs logged hours reconciliation"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>HOURS LOGGED</span>
            <TrendingUp className="w-4 h-4 text-sky-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-slate-900 font-mono group-hover:text-sky-600 transition-colors">
              {dynamicKpis.actSum}h
            </div>
            <div className="text-xs text-slate-500 mt-0.5 flex items-center justify-between">
              <span>Exp: {dynamicKpis.expSum}h ({dynamicKpis.netVariance >= 0 ? `+${dynamicKpis.netVariance}` : dynamicKpis.netVariance}h)</span>
              <span className="text-sky-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Ledger ↗</span>
            </div>
          </div>
        </div>

        {/* KPI 5 */}
        <div 
          onClick={() => setKpiModalType('closing_cutoff')}
          className="bg-white rounded-[12px] border border-slate-200/80 p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group"
          title="Click to view schedule benchmark per hub"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>CLOSING CUTOFF</span>
            <Clock className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-slate-900 font-mono group-hover:text-indigo-600 transition-colors">21:00 WAT</div>
            <div className="text-xs text-slate-500 mt-0.5 flex items-center justify-between">
              <span>Strict daily cutoff</span>
              <span className="text-indigo-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Schedule ↗</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. D3 CHART AND DAY INSPECTOR */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* CHART CONTAINER */}
        <div className="xl:col-span-8 bg-white rounded-[12px] border border-slate-200/80 overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
          {/* Chart Controls Bar */}
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            {/* Region Selector Tabs */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-mono text-slate-500 uppercase mr-1 font-bold">BRANCH:</span>
              {(['All', 'Lagos', 'Ibadan', 'Ogun', 'Benin'] as SelectedRegion[]).map((reg) => (
                <button
                  key={reg}
                  onClick={() => setSelectedRegion(reg)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedRegion === reg
                      ? 'bg-[#10b981] text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {reg === 'All' ? 'All Branches' : reg}
                </button>
              ))}
            </div>

            {/* Mode & Horizon Selector */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Horizon */}
              <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200 text-xs">
                {(['30d', '14d', '7d'] as TimeRange[]).map((tr) => (
                  <button
                    key={tr}
                    onClick={() => setTimeRange(tr)}
                    className={`px-2 py-0.5 rounded font-semibold transition-all ${
                      timeRange === tr ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tr === '30d' ? '30 Days' : tr === '14d' ? '14 Days' : '7 Days'}
                  </button>
                ))}
              </div>

              {/* Chart Mode */}
              <select
                value={chartMode}
                onChange={(e) => setChartMode(e.target.value as ChartMode)}
                className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-emerald-500"
              >
                <option value="dual_hours">Shift Hours (Expected vs Logged)</option>
                <option value="variance_bars">Variance Delta (+ Over / - Under)</option>
                <option value="adherence_pct">Compliance Rate (%)</option>
              </select>

              {/* View Chart Records Button */}
              <button
                onClick={() => setKpiModalType('attendance_rate')}
                className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
                title="Click to view full tabular data of all chart days"
              >
                <span>View Chart Table ↗</span>
              </button>
            </div>
          </div>

          {/* D3 SVG Chart Stage */}
          <div ref={containerRef} className="relative w-full aspect-[16/8] min-h-[360px] p-2 bg-white select-none">
            <svg ref={svgRef} viewBox="0 0 940 420" preserveAspectRatio="xMidYMid meet" className="w-full h-full block" />
          </div>

          {/* Chart Bottom Context Strip */}
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-600">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-1 bg-emerald-500 rounded inline-block"></span> Actual Hours Logged
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-1 bg-sky-500 rounded inline-block"></span> Expected Schedule Benchmark
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Hover across days to inspect shift records
            </div>
          </div>
        </div>

        {/* DAILY SHIFT DETAIL INSPECTOR */}
        <div className="xl:col-span-4 bg-white rounded-[12px] border border-slate-200/80 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase text-emerald-700 tracking-wider font-bold">
                DAY AUDIT INSPECTOR
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                {activeDayRecord.displayDate} ({activeDayRecord.dayOfWeek})
              </h3>
            </div>
            <span
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                activeDayHubData.status === 'compliant'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {activeDayHubData.status === 'compliant' ? 'COMPLIANT' : 'OVERRUN'}
            </span>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Selected Hub:</span>
                <span className="text-slate-900 font-bold">{selectedRegion === 'All' ? 'All 4 Hubs (Consolidated)' : `${selectedRegion} Hub`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Standard Expected:</span>
                <span className="text-slate-700 font-semibold">{activeDayHubData.expectedHours.toFixed(1)} hrs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Actual Hours Logged:</span>
                <span className="text-slate-900 font-bold">{activeDayHubData.actualHours.toFixed(1)} hrs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Variance:</span>
                <span className={`font-bold ${activeDayHubData.varianceHours >= 0 ? 'text-emerald-700' : 'text-sky-700'}`}>
                  {activeDayHubData.varianceHours >= 0 ? `+${activeDayHubData.varianceHours}` : activeDayHubData.varianceHours} hrs
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Attendance Rate:</span>
                <span className="text-emerald-700 font-bold">{activeDayHubData.adherenceRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Staff / Terminals:</span>
                <span className="text-slate-800 font-semibold">{activeDayHubData.merchandiserCount} Staff • {activeDayHubData.activePOS} Terminals</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs">
              <div className="font-mono text-[10px] text-slate-500 uppercase font-semibold mb-1">
                DISPATCH NOTES:
              </div>
              <p className="text-slate-700 leading-relaxed italic">
                "{activeDayHubData.notes || 'Routine standard shift logged.'}"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI METRIC DRILL-DOWN TABULAR POPUP MODAL */}
      {kpiModalType && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-[16px] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                    LIVE COMPLIANCE AUDIT
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    30-Day Period • {selectedRegion === 'All' ? 'All 4 Regional Hubs' : `${selectedRegion} Hub`}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
                  {kpiModalType === 'attendance_rate' && <span>📈 Shift Attendance Rate Audit ({dynamicKpis.avgAdherence}%)</span>}
                  {kpiModalType === 'on_time_shifts' && <span>✅ On-Time Shift Days ({dynamicKpis.compliantDays} / {dynamicKpis.totalDays} Days)</span>}
                  {kpiModalType === 'late_closings' && <span>⚠️ Late Closings Exceeding 21:00 WAT ({dynamicKpis.overrunDays} Days)</span>}
                  {kpiModalType === 'hours_logged' && <span>⏱️ Expected vs Actual Logged Hours ({dynamicKpis.actSum}h Logged)</span>}
                  {kpiModalType === 'closing_cutoff' && <span>🕒 Mandatory 21:00 WAT Closing Schedule Benchmark</span>}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCSV}
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
                Showing {filteredDataset.length} recorded shift days
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
                    <th className="py-3 px-4">Compliance %</th>
                    <th className="py-3 px-4">Staff / Terminals</th>
                    <th className="py-3 px-4">21:00 WAT Status</th>
                    <th className="py-3 px-4">Daily Dispatch Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {filteredDataset
                    .filter((rec) => {
                      const data = getDayRegionData(rec, selectedRegion);
                      if (kpiModalType === 'on_time_shifts' && data.varianceHours > 0.15) return false;
                      if (kpiModalType === 'late_closings' && data.varianceHours <= 0.15) return false;
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
                      const data = getDayRegionData(rec, selectedRegion);
                      const isOverrun = data.varianceHours > 0.15;
                      const isUnder = data.varianceHours < -0.15;

                      return (
                        <tr
                          key={rec.date}
                          className="hover:bg-emerald-50/50 transition-colors"
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
                          <td className="py-3 px-4 text-slate-800">
                            {data.merchandiserCount} Staff • {data.activePOS} POS
                          </td>
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
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Super Admin Work Hours &amp; Shift Compliance
              </span>
              <button
                onClick={() => {
                  setKpiModalType(null);
                  setKpiModalSearch('');
                }}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition-colors"
              >
                Close Audit Table
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
