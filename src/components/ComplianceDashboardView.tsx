import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import {
  THIRTY_DAY_ADHERENCE_DATA,
  REGIONAL_COMPLIANCE_SUMMARIES
} from '../data/complianceTrendsData';
import { DailyAdherenceRecord, RegionComplianceSummary, RegionalShiftDayData } from '../types';

interface ComplianceDashboardViewProps {
  onOpenShiftCompliance?: () => void;
  onOpenNewVSR?: () => void;
}

type SelectedRegion = 'All' | 'Lagos' | 'Ibadan' | 'Ogun' | 'Benin';
type ChartMode = 'dual_hours' | 'variance_bars' | 'adherence_pct';
type TimeRange = '30d' | '14d' | '7d';

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
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(29); // Default to latest day (Sun 21 Sep)
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

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

  // Keep hovered index within bounds when timeframe changes
  useEffect(() => {
    setHoveredDayIndex((prev) => {
      if (prev === null || prev >= filteredDataset.length) {
        return filteredDataset.length - 1;
      }
      return prev;
    });
  }, [filteredDataset.length]);

  // Active Region Summary
  const currentSummary: RegionComplianceSummary = useMemo(() => {
    return REGIONAL_COMPLIANCE_SUMMARIES[selectedRegion];
  }, [selectedRegion]);

  // Active Day Data
  const activeDayRecord: DailyAdherenceRecord = useMemo(() => {
    if (hoveredDayIndex === null) {
      return filteredDataset[filteredDataset.length - 1];
    }
    return filteredDataset[hoveredDayIndex] || filteredDataset[filteredDataset.length - 1];
  }, [hoveredDayIndex, filteredDataset]);

  // Extract region data for a given day
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

  // 30-Day Executive Totals for Active Selection
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

    const netVar = parseFloat((actSum - expSum).toFixed(1));
    const avgAdh = parseFloat(((actSum / expSum) * 100).toFixed(1));
    const onTimeScore = parseFloat((((compliantDays + overrunDays * 0.8) / filteredDataset.length) * 100).toFixed(1));

    return {
      expSum: parseFloat(expSum.toFixed(1)),
      actSum: parseFloat(actSum.toFixed(1)),
      netVar,
      avgAdh,
      compliantDays,
      overrunDays,
      underDays,
      onTimeScore
    };
  }, [filteredDataset, selectedRegion]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Date',
      'Day',
      'Region',
      'Expected_Hours',
      'Actual_Hours',
      'Variance_Hours',
      'Adherence_Pct',
      'Merchandisers_On_Duty',
      'Active_POS',
      'Shift_Status',
      'Operational_Notes'
    ];

    const rows: string[][] = [];
    filteredDataset.forEach((d) => {
      const rd = getDayRegionData(d, selectedRegion);
      rows.push([
        d.date,
        d.dayOfWeek,
        selectedRegion === 'All' ? 'Consolidated All 4 Hubs' : selectedRegion,
        rd.expectedHours.toString(),
        rd.actualHours.toString(),
        rd.varianceHours.toString(),
        `${rd.adherenceRate}%`,
        rd.merchandiserCount.toString(),
        rd.activePOS.toString(),
        rd.status,
        `"${rd.notes || ''}"`
      ]);
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `KEA_Compliance_Adherence_Audit_${selectedRegion}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // D3 Chart Implementation
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    const width = 960;
    const height = 430;
    const margin = { top: 30, right: 35, bottom: 45, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const data = filteredDataset;
    const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Defs & Gradients
    const defs = svg.append('defs');

    // Glow filter
    const glow = defs.append('filter')
      .attr('id', 'adherence-glow')
      .attr('x', '-20%')
      .attr('y', '-20%')
      .attr('width', '140%')
      .attr('height', '140%');
    glow.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'blur');
    glow.append('feMerge')
      .selectAll('feMergeNode')
      .data(['blur', 'SourceGraphic'])
      .enter()
      .append('feMergeNode')
      .attr('in', (d) => d);

    // Region Color
    const regionColor = currentSummary.color || '#92C842';

    // Area Gradient
    const areaGrad = defs.append('linearGradient')
      .attr('id', 'area-fill-grad')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    areaGrad.append('stop').attr('offset', '0%').attr('stop-color', regionColor).attr('stop-opacity', '0.25');
    areaGrad.append('stop').attr('offset', '100%').attr('stop-color', regionColor).attr('stop-opacity', '0.01');

    // X Scale
    const xScale = d3.scalePoint()
      .domain(data.map((d) => d.displayDate))
      .range([0, innerWidth])
      .padding(0.1);

    // Y Scale depending on ChartMode
    let yDomain: [number, number] = [0, 20];
    let yTickFormat: (d: any) => string = (d) => `${d}h`;

    if (chartMode === 'dual_hours') {
      const allVals: number[] = [];
      data.forEach((d) => {
        const rd = getDayRegionData(d, selectedRegion);
        allVals.push(rd.expectedHours, rd.actualHours);
      });
      const minVal = Math.min(...allVals);
      const maxVal = Math.max(...allVals);

      if (selectedRegion === 'All') {
        yDomain = [Math.floor(minVal - 2), Math.ceil(maxVal + 2)];
      } else {
        yDomain = [Math.floor(minVal - 1), Math.ceil(maxVal + 1.2)];
      }
      yTickFormat = (d) => `${d} hrs`;
    } else if (chartMode === 'variance_bars') {
      const allVars: number[] = [];
      data.forEach((d) => {
        const rd = getDayRegionData(d, selectedRegion);
        allVars.push(rd.varianceHours);
      });
      const maxVar = Math.max(0.7, Math.max(...allVars.map(Math.abs)));
      yDomain = [-maxVar, maxVar];
      yTickFormat = (d) => (d > 0 ? `+${d}h` : `${d}h`);
    } else if (chartMode === 'adherence_pct') {
      yDomain = [92, 102];
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
      .attr('stroke', '#1e2d4d')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-dasharray', '3,4');

    g.selectAll('.grid-lines .domain').remove();

    // X Axis
    const xAxis = d3.axisBottom(xScale);
    const xAxisG = g.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(xAxis);

    xAxisG.select('.domain').attr('stroke', '#1e2d4d').attr('stroke-width', 1.5);
    xAxisG.selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', data.length > 20 ? '9px' : '11px')
      .attr('font-family', 'monospace')
      .attr('dy', '14px');
    xAxisG.selectAll('line').attr('stroke', '#1e2d4d');

    // Y Axis
    const yAxis = d3.axisLeft(yScale).ticks(6).tickFormat(yTickFormat);
    const yAxisG = g.append('g').call(yAxis);
    yAxisG.select('.domain').remove();
    yAxisG.selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '11px')
      .attr('font-family', 'monospace')
      .attr('dx', '-6px');
    yAxisG.selectAll('line').remove();

    // Y Axis Label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -45)
      .attr('x', -innerHeight / 2)
      .attr('text-anchor', 'middle')
      .attr('fill', '#64748b')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace')
      .attr('letter-spacing', '0.08em')
      .text(
        chartMode === 'dual_hours'
          ? 'OPERATIONAL SHIFT HOURS (DAILY TOTAL)'
          : chartMode === 'variance_bars'
          ? 'SHIFT VARIANCE DELTA (+ OVERRUN / - UNDER)'
          : 'SHIFT ADHERENCE RATE (%)'
      );

    // MODE 1: DUAL EXPECTED VS ACTUAL HOURS
    if (chartMode === 'dual_hours') {
      // Area between Expected and Actual
      const areaGen = d3.area<DailyAdherenceRecord>()
        .x((d) => xScale(d.displayDate) || 0)
        .y0((d) => yScale(getDayRegionData(d, selectedRegion).expectedHours))
        .y1((d) => yScale(getDayRegionData(d, selectedRegion).actualHours))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(data)
        .attr('fill', 'url(#area-fill-grad)')
        .attr('d', areaGen);

      // 1. EXPECTED HOURS PATH (Dashed blue/slate line)
      const expectedLine = d3.line<DailyAdherenceRecord>()
        .x((d) => xScale(d.displayDate) || 0)
        .y((d) => yScale(getDayRegionData(d, selectedRegion).expectedHours))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#38bdf8')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,4')
        .attr('d', expectedLine)
        .attr('opacity', 0.85);

      // 2. ACTUAL HOURS PATH (Solid high-contrast line)
      const actualLine = d3.line<DailyAdherenceRecord>()
        .x((d) => xScale(d.displayDate) || 0)
        .y((d) => yScale(getDayRegionData(d, selectedRegion).actualHours))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', regionColor)
        .attr('stroke-width', 3)
        .attr('d', actualLine)
        .attr('filter', 'url(#adherence-glow)');

      // Data Points on Actual Line
      const dotsGroup = g.append('g').attr('class', 'actual-dots');
      data.forEach((d, idx) => {
        const cx = xScale(d.displayDate) || 0;
        const rd = getDayRegionData(d, selectedRegion);
        const cy = yScale(rd.actualHours);
        const isHovered = hoveredDayIndex === idx;

        // Expected dot (smaller)
        const cyExp = yScale(rd.expectedHours);
        g.append('circle')
          .attr('cx', cx)
          .attr('cy', cyExp)
          .attr('r', 2.5)
          .attr('fill', '#38bdf8')
          .attr('stroke', '#090e1c')
          .attr('stroke-width', 1);

        // Actual dot
        const dotG = dotsGroup.append('g')
          .attr('transform', `translate(${cx}, ${cy})`)
          .style('cursor', 'pointer')
          .on('mouseenter', () => setHoveredDayIndex(idx));

        if (isHovered) {
          dotG.append('circle')
            .attr('r', 9)
            .attr('fill', regionColor)
            .attr('fill-opacity', 0.25)
            .attr('stroke', regionColor)
            .attr('stroke-width', 1);
        }

        dotG.append('circle')
          .attr('r', isHovered ? 5 : 3.5)
          .attr('fill', rd.varianceHours > 0.3 ? '#F17F31' : regionColor)
          .attr('stroke', '#090e1c')
          .attr('stroke-width', 1.5);
      });
    }

    // MODE 2: VARIANCE BARS (+ Overrun / - Under Hours)
    if (chartMode === 'variance_bars') {
      // Zero axis line
      const zeroY = yScale(0);
      g.append('line')
        .attr('x1', 0)
        .attr('y1', zeroY)
        .attr('x2', innerWidth)
        .attr('y2', zeroY)
        .attr('stroke', '#475569')
        .attr('stroke-width', 1.5);

      const barWidth = Math.max(6, Math.min(22, (innerWidth / data.length) * 0.65));

      data.forEach((d, idx) => {
        const cx = xScale(d.displayDate) || 0;
        const rd = getDayRegionData(d, selectedRegion);
        const yVal = yScale(rd.varianceHours);
        const isSelected = hoveredDayIndex === idx;

        const barY = Math.min(zeroY, yVal);
        const barH = Math.abs(yVal - zeroY);

        let barColor = '#92C842';
        if (rd.varianceHours > 0.35) barColor = '#E05252';
        else if (rd.varianceHours > 0.1) barColor = '#F17F31';
        else if (rd.varianceHours < -0.15) barColor = '#38bdf8';

        g.append('rect')
          .attr('x', cx - barWidth / 2)
          .attr('y', barY)
          .attr('width', barWidth)
          .attr('height', Math.max(2, barH))
          .attr('rx', 2)
          .attr('fill', barColor)
          .attr('opacity', isSelected ? 1 : 0.8)
          .attr('cursor', 'pointer')
          .on('mouseenter', () => setHoveredDayIndex(idx));

        if (isSelected) {
          g.append('text')
            .attr('x', cx)
            .attr('y', rd.varianceHours >= 0 ? barY - 6 : barY + barH + 12)
            .attr('text-anchor', 'middle')
            .attr('fill', '#ffffff')
            .attr('font-size', '10px')
            .attr('font-weight', 'bold')
            .attr('font-family', 'monospace')
            .text(rd.varianceHours >= 0 ? `+${rd.varianceHours}h` : `${rd.varianceHours}h`);
        }
      });
    }

    // MODE 3: ADHERENCE % LINE
    if (chartMode === 'adherence_pct') {
      // 95% SLA Target Line
      const slaY = yScale(95);
      g.append('line')
        .attr('x1', 0)
        .attr('y1', slaY)
        .attr('x2', innerWidth)
        .attr('y2', slaY)
        .attr('stroke', '#E05252')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '4,4');

      g.append('text')
        .attr('x', innerWidth - 8)
        .attr('y', slaY - 6)
        .attr('text-anchor', 'end')
        .attr('fill', '#E05252')
        .attr('font-size', '10px')
        .attr('font-family', 'monospace')
        .text('95% ADHERENCE SLA BENCHMARK');

      const adhLine = d3.line<DailyAdherenceRecord>()
        .x((d) => xScale(d.displayDate) || 0)
        .y((d) => yScale(getDayRegionData(d, selectedRegion).adherenceRate))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', regionColor)
        .attr('stroke-width', 3)
        .attr('d', adhLine)
        .attr('filter', 'url(#adherence-glow)');

      data.forEach((d, idx) => {
        const cx = xScale(d.displayDate) || 0;
        const rd = getDayRegionData(d, selectedRegion);
        const cy = yScale(rd.adherenceRate);
        const isSelected = hoveredDayIndex === idx;

        const dot = g.append('circle')
          .attr('cx', cx)
          .attr('cy', cy)
          .attr('r', isSelected ? 5 : 3.5)
          .attr('fill', rd.adherenceRate < 97 ? '#F17F31' : regionColor)
          .attr('stroke', '#090e1c')
          .attr('stroke-width', 1.5)
          .attr('cursor', 'pointer')
          .on('mouseenter', () => setHoveredDayIndex(idx));

        if (isSelected) {
          g.append('text')
            .attr('x', cx)
            .attr('y', cy - 10)
            .attr('text-anchor', 'middle')
            .attr('fill', '#ffffff')
            .attr('font-size', '10px')
            .attr('font-weight', 'bold')
            .attr('font-family', 'monospace')
            .text(`${rd.adherenceRate}%`);
        }
      });
    }

    // VERTICAL TRACKING CROSSHAIR
    const activeIdx = (hoveredDayIndex !== null && hoveredDayIndex < data.length)
      ? hoveredDayIndex
      : data.length - 1;

    if (data[activeIdx]) {
      const activeX = xScale(data[activeIdx].displayDate) || 0;
      const crosshair = g.append('g').attr('class', 'active-crosshair');

      crosshair.append('line')
        .attr('x1', activeX)
        .attr('y1', 0)
        .attr('x2', activeX)
        .attr('y2', innerHeight)
        .attr('stroke', regionColor)
        .attr('stroke-width', 1.5)
        .attr('stroke-opacity', 0.5)
        .attr('stroke-dasharray', '4,4');

      crosshair.append('circle')
        .attr('cx', activeX)
        .attr('cy', 0)
        .attr('r', 3)
        .attr('fill', regionColor);
    }

    // MOUSE EVENT OVERLAY
    const overlay = g.append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .style('cursor', 'crosshair');

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

  }, [filteredDataset, selectedRegion, chartMode, hoveredDayIndex, currentSummary]);

  // Selected Day's Region Object
  const activeDayRegion = useMemo(() => {
    return getDayRegionData(activeDayRecord, selectedRegion);
  }, [activeDayRecord, selectedRegion]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. EXECUTIVE HEADER & CONTROLS */}
      <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-[#92C842]/10 text-[#92C842] border border-[#92C842]/30">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                Centralized Shift Compliance &amp; Adherence Dashboard
              </h1>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#92C842]/20 text-[#92C842] border border-[#92C842]/30">
                30-DAY LONG-TERM AUDIT
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#151f38] text-slate-300 border border-[#1e2d4d]">
                EXPECTED VS. ACTUAL (WAT)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              D3 comparative shift governance tracking scheduled expected operational duration vs. actual terminal execution across 4 regional territories.
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-lg bg-[#151f38] hover:bg-[#1a2745] text-slate-200 border border-[#1e2d4d] hover:border-[#92C842]/40 text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
            title="Download full 30-day compliance ledger in CSV"
          >
            <svg className="w-4 h-4 text-[#92C842]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
            <span>Export 30-Day CSV</span>
          </button>

          {onOpenShiftCompliance && (
            <button
              onClick={onOpenShiftCompliance}
              className="px-3.5 py-2 rounded-lg bg-[#151f38] hover:bg-[#1a2745] text-slate-200 border border-[#1e2d4d] hover:border-[#92C842]/50 text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
              title="Open Official Shift Compliance PDF Document Generator"
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

          {onOpenNewVSR && (
            <button
              onClick={onOpenNewVSR}
              className="px-4 py-2 rounded-lg bg-[#92C842] hover:bg-[#7bb32e] text-[#090e1c] text-xs font-bold shadow-md shadow-[#92C842]/20 transition-all active:scale-95"
            >
              + Allocate Merchandiser
            </button>
          )}
        </div>
      </div>

      {/* 2. REGIONAL HUB FILTER TABS & TIMEFRAME SELECTOR */}
      <div className="bg-[#0b1222] border border-[#1e2d4d] rounded-xl p-3 shadow-md flex flex-wrap items-center justify-between gap-4">
        {/* Region Selector Pills */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="font-mono text-slate-400 uppercase text-[11px] mr-1">CLUSTER AUDIT:</span>
          {(['All', 'Lagos', 'Ibadan', 'Ogun', 'Benin'] as SelectedRegion[]).map((reg) => {
            const isSelected = selectedRegion === reg;
            const regColor = REGIONAL_COMPLIANCE_SUMMARIES[reg].color;
            return (
              <button
                key={reg}
                onClick={() => setSelectedRegion(reg)}
                className={`px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-2 transition-all border ${
                  isSelected
                    ? 'bg-[#151f38] text-white border-[#92C842] shadow-sm'
                    : 'bg-[#0e1628] text-slate-400 hover:text-slate-200 border-[#1e2d4d]'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: regColor }}
                />
                <span>
                  {reg === 'All'
                    ? 'All 4 Hubs (Consolidated)'
                    : `${reg} Hub`}
                </span>
                {isSelected && (
                  <span className="text-[10px] font-mono text-[#92C842] ml-0.5">● ACTIVE</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Timeframe Scope Selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono text-slate-400 uppercase text-[11px]">TIMEFRAME:</span>
          <div className="inline-flex rounded-lg bg-[#151f38] p-0.5 border border-[#1e2d4d]">
            {(['30d', '14d', '7d'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                  timeRange === range
                    ? 'bg-[#1e2d4d] text-[#92C842] font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {range === '30d' ? '30 Days' : range === '14d' ? '14 Days' : '7 Days'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. EXECUTIVE 30-DAY COMPLIANCE KPIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Cumulative Expected vs Actual */}
        <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>TOTAL SHIFT HOURS (30D)</span>
            <span className="text-slate-400">{selectedRegion.toUpperCase()} CLUSTER</span>
          </div>
          <div className="my-2">
            <div className="text-xl sm:text-2xl font-extrabold text-white font-mono flex items-baseline gap-2">
              <span>{dynamicKpis.actSum.toLocaleString()}h</span>
              <span className="text-xs font-normal text-slate-400">
                / {dynamicKpis.expSum.toLocaleString()}h exp
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <span className={dynamicKpis.netVar >= 0 ? 'text-[#92C842] font-semibold' : 'text-[#38bdf8] font-semibold'}>
                {dynamicKpis.netVar >= 0 ? `+${dynamicKpis.netVar}h overrun` : `${dynamicKpis.netVar}h variance`}
              </span>
              <span>across standard windows</span>
            </div>
          </div>
          <div className="w-full bg-[#151f38] h-1.5 rounded-full overflow-hidden">
            <div
              className="h-1.5 rounded-full bg-[#92C842]"
              style={{ width: `${Math.min(100, (dynamicKpis.actSum / dynamicKpis.expSum) * 100)}%` }}
            />
          </div>
        </div>

        {/* KPI 2: Overall Adherence Rate */}
        <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>SHIFT ADHERENCE RATE</span>
            <span className="text-[#92C842]">TARGET: 95%</span>
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold text-white font-mono">
              {dynamicKpis.avgAdh}%
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-emerald-400 font-bold">+{(dynamicKpis.avgAdh - 95).toFixed(1)}%</span>
              <span>above operational SLA</span>
            </div>
          </div>
          <div className="w-full bg-[#151f38] h-1.5 rounded-full overflow-hidden">
            <div
              className="h-1.5 rounded-full bg-gradient-to-r from-[#22d3ee] to-[#92C842]"
              style={{ width: `${Math.min(100, dynamicKpis.avgAdh)}%` }}
            />
          </div>
        </div>

        {/* KPI 3: Compliance Days Breakdown */}
        <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>BENCHMARK INTEGRITY</span>
            <span className="text-slate-400">{filteredDataset.length} DAYS SCOPE</span>
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold text-white font-mono flex items-baseline gap-2">
              <span className="text-[#92C842]">{dynamicKpis.compliantDays}</span>
              <span className="text-xs text-slate-400 font-normal">
                / {filteredDataset.length} days compliant
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <span className="text-amber-400 font-semibold">{dynamicKpis.overrunDays} overruns</span>
              <span>•</span>
              <span className="text-slate-400">{dynamicKpis.underDays} early signoffs</span>
            </div>
          </div>
          <div className="w-full bg-[#151f38] h-1.5 rounded-full overflow-hidden">
            <div
              className="h-1.5 rounded-full bg-[#38bdf8]"
              style={{ width: `${(dynamicKpis.compliantDays / filteredDataset.length) * 100}%` }}
            />
          </div>
        </div>

        {/* KPI 4: Governance Audit SLA Badge */}
        <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>GOVERNANCE STATUS</span>
            <span className="text-[#92C842]">WAT AUDIT</span>
          </div>
          <div className="my-2">
            <div className="text-lg font-bold text-emerald-400 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>PASS • 99.1% ON-TIME</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Zero unauthorized overruns &gt; 45 mins
            </div>
          </div>
          <div className="w-full bg-[#151f38] h-1.5 rounded-full overflow-hidden">
            <div className="h-1.5 rounded-full bg-emerald-400" style={{ width: '99%' }} />
          </div>
        </div>

      </div>

      {/* 4. D3 VISUALIZATION STAGE & INTERACTIVE DAY INSPECTOR */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        
        {/* CHART CONTAINER (8 cols on XL) */}
        <div className="xl:col-span-8 bg-[#090e1c] border border-[#1e2d4d] rounded-xl overflow-hidden shadow-2xl">
          
          {/* Chart Header Bar with Metric Switchers */}
          <div className="px-5 py-3.5 bg-[#0e1628] border-b border-[#1e2d4d] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                {currentSummary.displayName}
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                ({currentSummary.standardShiftWindow})
              </span>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase">MODE:</span>
              <div className="inline-flex rounded-lg bg-[#151f38] p-0.5 border border-[#1e2d4d]">
                <button
                  onClick={() => setChartMode('dual_hours')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                    chartMode === 'dual_hours'
                      ? 'bg-[#1e2d4d] text-[#92C842] font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Expected vs Actual Hours
                </button>
                <button
                  onClick={() => setChartMode('variance_bars')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                    chartMode === 'variance_bars'
                      ? 'bg-[#1e2d4d] text-[#92C842] font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Variance Deltas
                </button>
                <button
                  onClick={() => setChartMode('adherence_pct')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                    chartMode === 'adherence_pct'
                      ? 'bg-[#1e2d4d] text-[#92C842] font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Adherence %
                </button>
              </div>
            </div>
          </div>

          {/* D3 SVG Canvas */}
          <div ref={containerRef} className="relative w-full aspect-[16/8.5] min-h-[380px] p-2 bg-[#090e1c] select-none">
            <svg
              ref={svgRef}
              viewBox="0 0 960 430"
              preserveAspectRatio="xMidYMid meet"
              className="w-full h-full block"
            />
          </div>

          {/* Chart Context Footer */}
          <div className="px-5 py-3 bg-[#0b1222] border-t border-[#1e2d4d] flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 border-t-2 border-dashed border-[#38bdf8] inline-block"></span>
                <strong className="text-white">Expected Standard Hours</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1 rounded-full" style={{ backgroundColor: currentSummary.color }} />
                <strong className="text-white">Actual Executed Hours</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#F17F31] inline-block" />
                <span>Overrun Threshold (&gt; 0.35h)</span>
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              Hover across data points to trace daily regional variance
            </div>
          </div>

        </div>

        {/* DAY INSPECTOR DRAWER (4 cols on XL) */}
        <div className="xl:col-span-4 space-y-4">
          
          {/* Active Day Detail Card */}
          <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e2d4d] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#92C842] tracking-wider font-bold">
                  DAILY SHIFT AUDIT INSPECTOR
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {activeDayRecord.displayDate} ({activeDayRecord.dayOfWeek})
                </h3>
              </div>
              <span
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold border ${
                  activeDayRegion.status === 'compliant'
                    ? 'bg-[#92C842]/20 text-[#92C842] border-[#92C842]/40'
                    : activeDayRegion.status === 'minor_overrun'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : activeDayRegion.status === 'major_overrun'
                    ? 'bg-red-500/20 text-red-400 border-red-500/40'
                    : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                }`}
              >
                {activeDayRegion.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            {/* Metrics Breakdown for the Active Day */}
            <div className="space-y-2.5 text-xs font-mono">
              
              {/* Expected Hours */}
              <div className="p-2.5 rounded-lg bg-[#151f38]/80 border border-[#1e2d4d] flex items-center justify-between">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#38bdf8]" />
                  Expected Shift Benchmark:
                </span>
                <span className="text-white font-bold">{activeDayRegion.expectedHours} hrs</span>
              </div>

              {/* Actual Hours */}
              <div className="p-2.5 rounded-lg bg-[#151f38]/80 border border-[#1e2d4d] flex items-center justify-between">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentSummary.color }} />
                  Actual Terminal Execution:
                </span>
                <span className="text-white font-bold">{activeDayRegion.actualHours} hrs</span>
              </div>

              {/* Net Variance */}
              <div className="p-2.5 rounded-lg bg-[#151f38]/80 border border-[#1e2d4d] flex items-center justify-between">
                <span className="text-slate-300">Shift Delta / Variance:</span>
                <span
                  className={`font-bold ${
                    activeDayRegion.varianceHours > 0.3
                      ? 'text-[#F17F31]'
                      : activeDayRegion.varianceHours > 0
                      ? 'text-[#92C842]'
                      : 'text-slate-200'
                  }`}
                >
                  {activeDayRegion.varianceHours > 0
                    ? `+${activeDayRegion.varianceHours} hrs (+${Math.round(activeDayRegion.varianceHours * 60)} mins)`
                    : `${activeDayRegion.varianceHours} hrs (${Math.round(activeDayRegion.varianceHours * 60)} mins)`}
                </span>
              </div>

              {/* Adherence Rate */}
              <div className="p-2.5 rounded-lg bg-[#151f38]/80 border border-[#1e2d4d] flex items-center justify-between">
                <span className="text-slate-300">Daily Adherence Rate:</span>
                <span className="text-[#92C842] font-bold text-sm">
                  {activeDayRegion.adherenceRate}%
                </span>
              </div>

              {/* Merchandisers On Duty */}
              <div className="p-2.5 rounded-lg bg-[#151f38]/80 border border-[#1e2d4d] flex items-center justify-between">
                <span className="text-slate-300">Active Reps &amp; POS:</span>
                <span className="text-white">
                  <strong>{activeDayRegion.merchandiserCount}</strong> Reps • <strong>{activeDayRegion.activePOS}</strong> Terminals
                </span>
              </div>

            </div>

            {/* Operational Shift Log */}
            <div className="bg-[#0b1222] border border-[#1e2d4d] rounded-lg p-3 text-xs">
              <div className="font-mono text-[10px] text-slate-400 uppercase font-semibold mb-1">
                OPERATIONAL FIELD RECORD:
              </div>
              <p className="text-slate-300 leading-relaxed italic">
                "{activeDayRegion.notes || activeDayRecord.aggregate.operationalEvent}"
              </p>
            </div>

            {/* Quick 7-Day Jump Strip */}
            <div className="pt-1">
              <div className="text-[10px] font-mono text-slate-400 mb-1.5 uppercase">
                JUMP TO RECENT DATES:
              </div>
              <div className="grid grid-cols-7 gap-1">
                {filteredDataset.slice(-7).map((pt, idx) => {
                  const trueIdx = filteredDataset.length - 7 + idx;
                  return (
                    <button
                      key={pt.date}
                      onClick={() => setHoveredDayIndex(trueIdx)}
                      className={`py-1.5 px-1 rounded text-center font-mono text-[10px] transition-all ${
                        hoveredDayIndex === trueIdx
                          ? 'bg-[#92C842] text-[#090e1c] font-bold shadow-sm'
                          : 'bg-[#151f38] text-slate-300 hover:text-white border border-[#1e2d4d]'
                      }`}
                    >
                      {pt.displayDate.split(' ')[0]}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Regional Standards Matrix Card */}
          <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-xl p-4 shadow-lg space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              30-Day Adherence Summary by Region
            </h4>
            <div className="space-y-2 text-xs">
              {(['Lagos', 'Ibadan', 'Ogun', 'Benin'] as SelectedRegion[]).map((r) => {
                const s = REGIONAL_COMPLIANCE_SUMMARIES[r];
                return (
                  <button
                    key={r}
                    onClick={() => setSelectedRegion(r)}
                    className={`w-full p-2.5 rounded-lg border text-left transition-all flex items-center justify-between ${
                      selectedRegion === r
                        ? 'bg-[#151f38] border-[#92C842] text-white'
                        : 'bg-[#0b1222] border-[#1e2d4d]/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                      <div>
                        <div className="font-semibold text-slate-200">{s.displayName.split('(')[0]}</div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {s.totalActualHours}h act / {s.totalExpectedHours}h exp
                        </div>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="font-bold text-[#92C842]">{s.averageAdherenceRate}%</div>
                      <div className="text-[10px] text-slate-400">+{s.netVarianceHours}h net</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* 5. REGIONAL COMPARATIVE PERFORMANCE MATRIX */}
      <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#1e2d4d] pb-3">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#92C842]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              30-Day Regional Adherence Benchmark Matrix
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Click any regional card to focus the D3 telemetry curves
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(['Lagos', 'Ibadan', 'Ogun', 'Benin'] as const).map((hubKey) => {
            const sum = REGIONAL_COMPLIANCE_SUMMARIES[hubKey];
            const isSelected = selectedRegion === hubKey;

            return (
              <div
                key={hubKey}
                onClick={() => setSelectedRegion(hubKey)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#151f38] border-[#92C842] shadow-lg ring-1 ring-[#92C842]/40'
                    : 'bg-[#0b1222] border-[#1e2d4d] hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sum.color }} />
                    {sum.displayName.split('(')[0]}
                  </span>
                  <span className="text-[#92C842] font-bold">{sum.averageAdherenceRate}%</span>
                </div>

                <div className="my-2 space-y-1 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Expected Benchmark:</span>
                    <strong className="text-white">{sum.totalExpectedHours} hrs</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Actual Recorded:</span>
                    <strong className="text-white">{sum.totalActualHours} hrs</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Net Overrun Variance:</span>
                    <strong className="text-[#92C842]">+{sum.netVarianceHours} hrs</strong>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-[#1e2d4d]/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>{sum.fullComplianceDays} / 30 On-Time Days</span>
                  <span className="text-slate-300 font-semibold">{sum.avgMerchandisersOnDuty} VSR Reps</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. 30-DAY COMPLIANCE AUDIT TABLE */}
      <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-xl overflow-hidden shadow-xl">
        <div className="px-5 py-3.5 border-b border-[#1e2d4d] bg-[#090e1c]/70 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-mono">
            <span className="w-2 h-2 rounded-full bg-[#92C842]" />
            <span className="font-bold text-slate-200 uppercase tracking-wider">
              30-Day Shift Compliance Ledger &amp; Field Execution Log ({selectedRegion})
            </span>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#151f38] text-slate-300 border border-[#1e2d4d] rounded-lg px-2.5 py-1 text-xs font-mono outline-none"
            >
              <option value="all">All Shift Statuses</option>
              <option value="compliant">Compliant Only</option>
              <option value="minor_overrun">Minor Overruns</option>
              <option value="major_overrun">Major Overruns</option>
              <option value="under_hours">Under Hours</option>
            </select>

            <span className="text-[11px] font-mono text-[#92C842]">
              {filteredDataset.length} RECORDS AUDITED
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#151f38] text-slate-400 text-[10px] uppercase tracking-wider border-b border-[#1e2d4d]">
              <tr>
                <th className="px-5 py-3">Audit Date</th>
                <th className="px-5 py-3">Day Type</th>
                <th className="px-5 py-3">Expected Shift</th>
                <th className="px-5 py-3">Actual Shift</th>
                <th className="px-5 py-3">Variance Delta</th>
                <th className="px-5 py-3">Adherence %</th>
                <th className="px-5 py-3">Reps &amp; Nodes</th>
                <th className="px-5 py-3">Audit Status</th>
                <th className="px-5 py-3 font-sans">Shift Notes &amp; Field Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2d4d]/60">
              {filteredDataset
                .filter((d) => {
                  const rd = getDayRegionData(d, selectedRegion);
                  if (statusFilter === 'all') return true;
                  return rd.status === statusFilter;
                })
                .map((pt, idx) => {
                  const rd = getDayRegionData(pt, selectedRegion);
                  const isSelected = hoveredDayIndex === idx;

                  return (
                    <tr
                      key={pt.date}
                      onClick={() => setHoveredDayIndex(idx)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#151f38]/90 text-white'
                          : 'hover:bg-[#151f38]/40 text-slate-300'
                      }`}
                    >
                      <td className="px-5 py-3 font-bold text-white flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#92C842]' : 'bg-slate-600'}`} />
                        <span>{pt.displayDate}</span>
                      </td>
                      <td className="px-5 py-3 text-slate-400">
                        {pt.dayOfWeek} {pt.isWeekend ? '(Weekend)' : ''}
                      </td>
                      <td className="px-5 py-3 text-[#38bdf8] font-semibold">
                        {rd.expectedHours} hrs
                      </td>
                      <td className="px-5 py-3 text-white font-semibold">
                        {rd.actualHours} hrs
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`font-bold ${
                            rd.varianceHours > 0.35
                              ? 'text-red-400'
                              : rd.varianceHours > 0.1
                              ? 'text-amber-400'
                              : rd.varianceHours < -0.15
                              ? 'text-blue-400'
                              : 'text-[#92C842]'
                          }`}
                        >
                          {rd.varianceHours > 0 ? `+${rd.varianceHours}h` : `${rd.varianceHours}h`}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-bold text-[#92C842]">
                        {rd.adherenceRate}%
                      </td>
                      <td className="px-5 py-3 text-slate-400">
                        {rd.merchandiserCount} reps • {rd.activePOS} POS
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            rd.status === 'compliant'
                              ? 'bg-[#92C842]/15 text-[#92C842] border-[#92C842]/30'
                              : rd.status === 'minor_overrun'
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                              : rd.status === 'major_overrun'
                              ? 'bg-red-500/15 text-red-400 border-red-500/30'
                              : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                          }`}
                        >
                          {rd.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-400 font-sans text-xs">
                        {rd.notes || pt.aggregate.operationalEvent}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
