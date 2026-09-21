import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { SEVEN_DAY_TELEMETRY_TRENDS, HUB_TREND_CONFIGS, HubTrendConfig } from '../data/telemetryTrendsData';
import { DailyHubTelemetryPoint } from '../types';

interface PerformanceTrendsViewProps {
  onOpenShiftCompliance?: () => void;
  onOpenNewVSR?: () => void;
}

type MetricDisplayMode = 'absolute' | 'capacity_pct';

export const PerformanceTrendsView: React.FC<PerformanceTrendsViewProps> = ({
  onOpenShiftCompliance,
  onOpenNewVSR
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Active Hubs Toggles
  const [activeHubs, setActiveHubs] = useState<Record<string, boolean>>({
    Lagos: true,
    Ibadan: true,
    Ogun: true,
    Benin: true,
    Total: false
  });

  // Display Mode
  const [displayMode, setDisplayMode] = useState<MetricDisplayMode>('absolute');

  // Selected or Hovered Day Index (0 to 6)
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(6); // Default to latest day (Sun 21 Sep)
  const [hoveredSeries, setHoveredSeries] = useState<string | null>(null);

  // Summary Metrics Calculation
  const summaryStats = useMemo(() => {
    const data = SEVEN_DAY_TELEMETRY_TRENDS;
    const totals = data.map((d) => d.total);
    const peakTotal = Math.max(...totals);
    const peakDay = data.find((d) => d.total === peakTotal);
    const avgTotal = Math.round(totals.reduce((a, b) => a + b, 0) / totals.length);
    const startTotal = data[0].total;
    const endTotal = data[data.length - 1].total;
    const growthCount = endTotal - startTotal;
    const growthPercent = ((growthCount / startTotal) * 100).toFixed(1);

    return {
      peakTotal,
      peakDayDisplay: peakDay?.displayDate || '19 Sep',
      avgTotal,
      currentTotal: endTotal,
      growthCount,
      growthPercent,
      uptimeRate: 99.3
    };
  }, []);

  const activeDayPoint: DailyHubTelemetryPoint = useMemo(() => {
    const idx = hoveredDayIndex !== null ? hoveredDayIndex : 6;
    return SEVEN_DAY_TELEMETRY_TRENDS[idx] || SEVEN_DAY_TELEMETRY_TRENDS[6];
  }, [hoveredDayIndex]);

  // Toggle hub visibility
  const toggleHub = (hubKey: string) => {
    setActiveHubs((prev) => {
      const next = { ...prev, [hubKey]: !prev[hubKey] };
      // Ensure at least one hub remains active
      if (!Object.values(next).some(Boolean)) {
        return prev;
      }
      return next;
    });
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Date', 'Day', 'Lagos', 'Ibadan', 'Ogun', 'Benin', 'Total Active POS', 'Operational Notes'];
    const rows = SEVEN_DAY_TELEMETRY_TRENDS.map((row) => [
      row.date,
      row.dayLabel,
      row.Lagos,
      row.Ibadan,
      row.Ogun,
      row.Benin,
      row.total,
      `"${row.notes || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `KEA_Telemetry_Trends_7Days_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // D3 Chart Rendering
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    const width = 940;
    const height = 440;
    const margin = { top: 30, right: 35, bottom: 45, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const data = SEVEN_DAY_TELEMETRY_TRENDS;

    // 1. Root group
    const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

    // 2. Gradients & Defs
    const defs = svg.append('defs');

    // Glow filter for interactive highlight
    const glowFilter = defs.append('filter')
      .attr('id', 'trends-glow')
      .attr('x', '-30%')
      .attr('y', '-30%')
      .attr('width', '160%')
      .attr('height', '160%');
    glowFilter.append('feGaussianBlur')
      .attr('stdDeviation', '4')
      .attr('result', 'blur');
    glowFilter.append('feMerge')
      .selectAll('feMergeNode')
      .data(['blur', 'SourceGraphic'])
      .enter()
      .append('feMergeNode')
      .attr('in', (d) => d);

    // Linear gradients for area fills
    const hubColors: Record<string, string> = {
      Lagos: '#92C842',
      Ibadan: '#22d3ee',
      Ogun: '#F17F31',
      Benin: '#c084fc',
      Total: '#38bdf8'
    };

    Object.entries(hubColors).forEach(([key, color]) => {
      const grad = defs.append('linearGradient')
        .attr('id', `area-grad-${key}`)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%');
      grad.append('stop').attr('offset', '0%').attr('stop-color', color).attr('stop-opacity', '0.22');
      grad.append('stop').attr('offset', '80%').attr('stop-color', color).attr('stop-opacity', '0.03');
      grad.append('stop').attr('offset', '100%').attr('stop-color', color).attr('stop-opacity', '0');
    });

    // 3. SCALES
    const xScale = d3.scalePoint()
      .domain(data.map((d) => d.displayDate))
      .range([0, innerWidth])
      .padding(0.08);

    // Y Scale domain calculation
    let minY = 0;
    let maxY = 750;

    if (displayMode === 'capacity_pct') {
      minY = 80;
      maxY = 105;
    } else {
      // Determine max based on active series
      const values: number[] = [];
      data.forEach((d) => {
        if (activeHubs.Lagos) values.push(d.Lagos);
        if (activeHubs.Ibadan) values.push(d.Ibadan);
        if (activeHubs.Ogun) values.push(d.Ogun);
        if (activeHubs.Benin) values.push(d.Benin);
        if (activeHubs.Total) values.push(d.total);
      });

      const maxVal = values.length ? Math.max(...values) : 700;
      const minVal = values.length ? Math.min(...values) : 150;

      if (activeHubs.Total) {
        minY = Math.max(0, Math.floor((minVal - 100) / 100) * 100);
        maxY = Math.ceil((maxVal + 80) / 100) * 100;
      } else {
        minY = 100;
        maxY = 720;
      }
    }

    const yScale = d3.scaleLinear()
      .domain([minY, maxY])
      .range([innerHeight, 0])
      .nice();

    // 4. GRIDLINES
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

    // 5. AXES
    // X Axis
    const xAxis = d3.axisBottom(xScale);
    const xAxisGroup = g.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(xAxis);

    xAxisGroup.select('.domain')
      .attr('stroke', '#1e2d4d')
      .attr('stroke-width', 1.5);

    xAxisGroup.selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '11px')
      .attr('font-family', 'monospace')
      .attr('dy', '14px');

    xAxisGroup.selectAll('line').attr('stroke', '#1e2d4d');

    // Y Axis
    const yAxis = d3.axisLeft(yScale)
      .ticks(6)
      .tickFormat((d) => (displayMode === 'capacity_pct' ? `${d}%` : `${d}`));

    const yAxisGroup = g.append('g').call(yAxis);

    yAxisGroup.select('.domain').remove();
    yAxisGroup.selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '11px')
      .attr('font-family', 'monospace')
      .attr('dx', '-6px');

    yAxisGroup.selectAll('line').remove();

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
      .text(displayMode === 'capacity_pct' ? 'CAPACITY ADHERENCE (%)' : 'ACTIVE POS HEARTBEATS (COUNT)');

    // 6. VALUE EXTRACTOR HELPER
    const getVal = (d: DailyHubTelemetryPoint, key: string): number => {
      if (displayMode === 'capacity_pct') {
        const caps: Record<string, number> = {
          Lagos: 680,
          Ibadan: 340,
          Ogun: 220,
          Benin: 180,
          Total: 1420
        };
        const cap = caps[key] || 1;
        const count = key === 'Total' ? d.total : (d as any)[key];
        return Math.round((count / cap) * 100);
      }
      return key === 'Total' ? d.total : (d as any)[key];
    };

    // 7. LINE & AREA GENERATORS
    const seriesKeys: Array<'Lagos' | 'Ibadan' | 'Ogun' | 'Benin' | 'Total'> = [
      'Lagos',
      'Ibadan',
      'Ogun',
      'Benin',
      'Total'
    ];

    seriesKeys.forEach((key) => {
      if (!activeHubs[key]) return;

      const color = hubColors[key];
      const isHovered = hoveredSeries === key;

      const lineGenerator = d3.line<DailyHubTelemetryPoint>()
        .x((d) => xScale(d.displayDate) || 0)
        .y((d) => yScale(getVal(d, key)))
        .curve(d3.curveMonotoneX);

      const areaGenerator = d3.area<DailyHubTelemetryPoint>()
        .x((d) => xScale(d.displayDate) || 0)
        .y0(innerHeight)
        .y1((d) => yScale(getVal(d, key)))
        .curve(d3.curveMonotoneX);

      // Area fill
      g.append('path')
        .datum(data)
        .attr('fill', `url(#area-grad-${key})`)
        .attr('d', areaGenerator)
        .attr('opacity', isHovered ? 0.9 : 0.6);

      // Line path
      const path = g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', key === 'Total' ? 3 : isHovered ? 3.5 : 2.5)
        .attr('stroke-dasharray', key === 'Total' ? '6,3' : 'none')
        .attr('d', lineGenerator)
        .attr('class', `series-line-${key}`)
        .style('cursor', 'pointer')
        .on('mouseenter', () => setHoveredSeries(key))
        .on('mouseleave', () => setHoveredSeries(null));

      if (isHovered) {
        path.attr('filter', 'url(#trends-glow)');
      }

      // Interactive Data Points / Nodes
      const dotsGroup = g.append('g').attr('class', `dots-${key}`);

      data.forEach((d, idx) => {
        const cx = xScale(d.displayDate) || 0;
        const cy = yScale(getVal(d, key));
        const isDaySelected = hoveredDayIndex === idx;

        const dotG = dotsGroup.append('g')
          .attr('transform', `translate(${cx}, ${cy})`)
          .attr('cursor', 'pointer')
          .on('mouseenter', () => {
            setHoveredDayIndex(idx);
            setHoveredSeries(key);
          })
          .on('mouseleave', () => {
            setHoveredSeries(null);
          });

        // Halo ring on selected or hovered
        if (isDaySelected || isHovered) {
          dotG.append('circle')
            .attr('r', 9)
            .attr('fill', color)
            .attr('fill-opacity', 0.25)
            .attr('stroke', color)
            .attr('stroke-width', 1)
            .attr('filter', 'url(#trends-glow)');
        }

        // Center dot
        dotG.append('circle')
          .attr('r', isDaySelected ? 5 : 3.5)
          .attr('fill', color)
          .attr('stroke', '#090e1c')
          .attr('stroke-width', 1.8);

        // Point text label on selected
        if (isDaySelected) {
          dotG.append('text')
            .attr('y', -11)
            .attr('text-anchor', 'middle')
            .attr('fill', '#ffffff')
            .attr('font-size', '10px')
            .attr('font-weight', 'bold')
            .attr('font-family', 'monospace')
            .text(`${getVal(d, key)}${displayMode === 'capacity_pct' ? '%' : ''}`);
        }
      });
    });

    // 8. VERTICAL CROSSHAIR TRACKING LINE
    if (hoveredDayIndex !== null && data[hoveredDayIndex]) {
      const activeX = xScale(data[hoveredDayIndex].displayDate) || 0;

      const crosshair = g.append('g').attr('class', 'crosshair-pointer');

      crosshair.append('line')
        .attr('x1', activeX)
        .attr('y1', 0)
        .attr('x2', activeX)
        .attr('y2', innerHeight)
        .attr('stroke', '#92C842')
        .attr('stroke-width', 1.5)
        .attr('stroke-opacity', 0.5)
        .attr('stroke-dasharray', '4,4');

      // Top indicator pill
      crosshair.append('circle')
        .attr('cx', activeX)
        .attr('cy', 0)
        .attr('r', 3)
        .attr('fill', '#92C842');
    }

    // 9. OVERLAY EVENT CAPTURE FOR MOUSE TRACKING ACROSS BARS
    const stepWidth = innerWidth / (data.length - 1);
    const overlay = g.append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .style('cursor', 'crosshair');

    overlay.on('mousemove', (event) => {
      const [mouseX] = d3.pointer(event);
      // Find closest day index
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

  }, [activeHubs, displayMode, hoveredDayIndex, hoveredSeries]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. TOP HEADER & TELEMETRY CONTROLS */}
      <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-[#92C842]/10 text-[#92C842] border border-[#92C842]/30">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                Regional Telemetry Performance Trends
              </h1>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#92C842]/20 text-[#92C842] border border-[#92C842]/30">
                7-DAY AUDIT
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#151f38] text-slate-300 border border-[#1e2d4d]">
                WAT ZONE (07:00–21:00)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Multi-series D3 operational trajectory monitoring daily active retail POS heartbeat density across Southwest &amp; Edo hubs.
            </p>
          </div>
        </div>

        {/* Global Toolbar Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-lg bg-[#151f38] hover:bg-[#1a2745] text-slate-200 border border-[#1e2d4d] hover:border-[#92C842]/40 text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
            title="Download CSV dataset"
          >
            <svg className="w-4 h-4 text-[#92C842]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
            <span>Export CSV</span>
          </button>

          {onOpenShiftCompliance && (
            <button
              onClick={onOpenShiftCompliance}
              className="px-3.5 py-2 rounded-lg bg-[#151f38] hover:bg-[#1a2745] text-slate-200 border border-[#1e2d4d] hover:border-[#92C842]/50 text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
              title="Generate comprehensive Shift Compliance PDF Report"
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

      {/* 2. EXECUTIVE 7-DAY KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Active Telemetry */}
        <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>TODAY'S ACTIVE POS</span>
            <span className="text-[#92C842] flex items-center gap-1">● LIVE STREAM</span>
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold text-white font-mono">
              {summaryStats.currentTotal.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
              <span className="text-[#92C842] font-semibold">+{summaryStats.growthPercent}%</span>
              <span>vs 7-Day Launch Base</span>
            </div>
          </div>
          <div className="w-full bg-[#151f38] h-1.5 rounded-full overflow-hidden">
            <div className="h-1.5 rounded-full bg-[#92C842]" style={{ width: '100%' }} />
          </div>
        </div>

        {/* Card 2: 7-Day Peak */}
        <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>7-DAY PEAK CONCURRENCY</span>
            <span className="text-slate-400">{summaryStats.peakDayDisplay}</span>
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold text-white font-mono">
              {summaryStats.peakTotal.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Peak weekend stocking surge in Lagos
            </div>
          </div>
          <div className="w-full bg-[#151f38] h-1.5 rounded-full overflow-hidden">
            <div className="h-1.5 rounded-full bg-[#38bdf8]" style={{ width: '96%' }} />
          </div>
        </div>

        {/* Card 3: 7-Day Average Active Devices */}
        <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>7-DAY DAILY AVERAGE</span>
            <span className="text-slate-400">4 REGIONS</span>
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold text-white font-mono">
              {summaryStats.avgTotal.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Net growth: <strong className="text-emerald-400">+{summaryStats.growthCount} nodes</strong>
            </div>
          </div>
          <div className="w-full bg-[#151f38] h-1.5 rounded-full overflow-hidden">
            <div className="h-1.5 rounded-full bg-[#22d3ee]" style={{ width: '92%' }} />
          </div>
        </div>

        {/* Card 4: Telemetry Uptime & Reliability */}
        <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>TELEMETRY RELIABILITY</span>
            <span className="text-[#92C842]">WAT WINDOW</span>
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold text-white font-mono">
              {summaryStats.uptimeRate}%
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              07:00–21:00 WAT standard adherence
            </div>
          </div>
          <div className="w-full bg-[#151f38] h-1.5 rounded-full overflow-hidden">
            <div className="h-1.5 rounded-full bg-[#c084fc]" style={{ width: '99%' }} />
          </div>
        </div>
      </div>

      {/* 3. D3 LINE CHART & INTERACTIVE INSPECTOR PANEL */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        
        {/* CHART CONTAINER (8 cols on XL) */}
        <div className="xl:col-span-8 bg-[#090e1c] border border-[#1e2d4d] rounded-xl overflow-hidden shadow-2xl">
          
          {/* Chart Controls Bar */}
          <div className="px-5 py-3.5 bg-[#0e1628] border-b border-[#1e2d4d] flex flex-wrap items-center justify-between gap-3">
            
            {/* Hub Series Toggles */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono text-slate-400 uppercase mr-1">HUBS:</span>
              
              {/* Lagos Toggle */}
              <button
                onClick={() => toggleHub('Lagos')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                  activeHubs.Lagos
                    ? 'bg-[#92C842]/15 text-[#92C842] border-[#92C842]/40 shadow-sm'
                    : 'bg-[#151f38] text-slate-400 border-transparent hover:text-slate-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#92C842]"></span>
                <span>Lagos</span>
              </button>

              {/* Ibadan Toggle */}
              <button
                onClick={() => toggleHub('Ibadan')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                  activeHubs.Ibadan
                    ? 'bg-[#22d3ee]/15 text-[#22d3ee] border-[#22d3ee]/40 shadow-sm'
                    : 'bg-[#151f38] text-slate-400 border-transparent hover:text-slate-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#22d3ee]"></span>
                <span>Ibadan</span>
              </button>

              {/* Ogun Toggle */}
              <button
                onClick={() => toggleHub('Ogun')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                  activeHubs.Ogun
                    ? 'bg-[#F17F31]/15 text-[#F17F31] border-[#F17F31]/40 shadow-sm'
                    : 'bg-[#151f38] text-slate-400 border-transparent hover:text-slate-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#F17F31]"></span>
                <span>Ogun</span>
              </button>

              {/* Benin Toggle */}
              <button
                onClick={() => toggleHub('Benin')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                  activeHubs.Benin
                    ? 'bg-[#c084fc]/15 text-[#c084fc] border-[#c084fc]/40 shadow-sm'
                    : 'bg-[#151f38] text-slate-400 border-transparent hover:text-slate-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#c084fc]"></span>
                <span>Benin</span>
              </button>

              {/* Total Aggregate Line Toggle */}
              <button
                onClick={() => toggleHub('Total')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                  activeHubs.Total
                    ? 'bg-[#38bdf8]/15 text-[#38bdf8] border-[#38bdf8]/40 shadow-sm'
                    : 'bg-[#151f38] text-slate-400 border-transparent hover:text-slate-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#38bdf8]"></span>
                <span>Combined Total</span>
              </button>
            </div>

            {/* Metric Mode Switcher */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono text-slate-400 uppercase mr-1">SCALE:</span>
              <div className="inline-flex rounded-lg bg-[#151f38] p-0.5 border border-[#1e2d4d]">
                <button
                  onClick={() => setDisplayMode('absolute')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                    displayMode === 'absolute'
                      ? 'bg-[#1e2d4d] text-[#92C842] font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Raw Counts
                </button>
                <button
                  onClick={() => setDisplayMode('capacity_pct')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                    displayMode === 'capacity_pct'
                      ? 'bg-[#1e2d4d] text-[#92C842] font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  % Capacity
                </button>
              </div>
            </div>

          </div>

          {/* D3 SVG Line Chart Stage */}
          <div ref={containerRef} className="relative w-full aspect-[16/8.5] min-h-[380px] p-2 bg-[#090e1c] select-none">
            <svg
              ref={svgRef}
              viewBox="0 0 940 440"
              preserveAspectRatio="xMidYMid meet"
              className="w-full h-full block"
            />
          </div>

          {/* Chart Bottom Context Strip */}
          <div className="px-5 py-3 bg-[#0b1222] border-t border-[#1e2d4d] flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-[#92C842] inline-block"></span> Lagos Hub (680 POS)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-[#22d3ee] inline-block"></span> Ibadan Cluster (340 POS)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-[#F17F31] inline-block"></span> Ogun Corridor (220 POS)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-[#c084fc] inline-block"></span> Benin Sector (180 POS)
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              Hover across data points to inspect regional crosshair readings
            </div>
          </div>

        </div>

        {/* DAILY TELEMETRY AUDIT INSPECTOR (4 cols on XL) */}
        <div className="xl:col-span-4 space-y-4">
          
          {/* Active Day Detail Card */}
          <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e2d4d] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#92C842] tracking-wider font-bold">
                  DAILY TELEMETRY POINT AUDIT
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {activeDayPoint.displayDate} ({activeDayPoint.dayLabel})
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-[#92C842]/20 text-[#92C842] border border-[#92C842]/30">
                {activeDayPoint.total.toLocaleString()} Active
              </span>
            </div>

            {/* Regional Hub Values on this Day */}
            <div className="space-y-2.5 text-xs font-mono">
              
              {/* Lagos */}
              <div className="p-2.5 rounded-lg bg-[#151f38]/70 border border-[#1e2d4d] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#92C842]" />
                  <div>
                    <div className="font-bold text-white">Lagos Hub</div>
                    <div className="text-[10px] text-slate-400">Cap: 680 • 07:00 WAT</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-[#92C842]">{activeDayPoint.Lagos}</div>
                  <div className="text-[10px] text-slate-400">
                    {Math.round((activeDayPoint.Lagos / 680) * 100)}% Capacity
                  </div>
                </div>
              </div>

              {/* Ibadan */}
              <div className="p-2.5 rounded-lg bg-[#151f38]/70 border border-[#1e2d4d] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#22d3ee]" />
                  <div>
                    <div className="font-bold text-white">Ibadan Cluster</div>
                    <div className="text-[10px] text-slate-400">Cap: 340 • 07:30 WAT</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-[#22d3ee]">{activeDayPoint.Ibadan}</div>
                  <div className="text-[10px] text-slate-400">
                    {Math.round((activeDayPoint.Ibadan / 340) * 100)}% Capacity
                  </div>
                </div>
              </div>

              {/* Ogun */}
              <div className="p-2.5 rounded-lg bg-[#151f38]/70 border border-[#1e2d4d] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F17F31]" />
                  <div>
                    <div className="font-bold text-white">Ogun Hub</div>
                    <div className="text-[10px] text-slate-400">Cap: 220 • 08:00 WAT</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-[#F17F31]">{activeDayPoint.Ogun}</div>
                  <div className="text-[10px] text-slate-400">
                    {Math.round((activeDayPoint.Ogun / 220) * 100)}% Capacity
                  </div>
                </div>
              </div>

              {/* Benin */}
              <div className="p-2.5 rounded-lg bg-[#151f38]/70 border border-[#1e2d4d] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#c084fc]" />
                  <div>
                    <div className="font-bold text-white">Benin Sector</div>
                    <div className="text-[10px] text-slate-400">Cap: 180 • 08:00 WAT</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-[#c084fc]">{activeDayPoint.Benin}</div>
                  <div className="text-[10px] text-slate-400">
                    {Math.round((activeDayPoint.Benin / 180) * 100)}% Capacity
                  </div>
                </div>
              </div>

            </div>

            {/* Operational Shift Log for this Day */}
            <div className="bg-[#0b1222] border border-[#1e2d4d] rounded-lg p-3 text-xs">
              <div className="font-mono text-[10px] text-slate-400 uppercase font-semibold mb-1">
                OPERATIONAL OBSERVATIONS:
              </div>
              <p className="text-slate-300 leading-relaxed italic">
                "{activeDayPoint.notes}"
              </p>
            </div>

            {/* Quick Day Selector Buttons */}
            <div className="pt-1">
              <div className="text-[10px] font-mono text-slate-400 mb-1.5 uppercase">
                JUMP TO SPECIFIC DAY:
              </div>
              <div className="grid grid-cols-7 gap-1">
                {SEVEN_DAY_TELEMETRY_TRENDS.map((pt, idx) => (
                  <button
                    key={pt.date}
                    onClick={() => setHoveredDayIndex(idx)}
                    className={`py-1.5 px-1 rounded text-center font-mono text-[10px] transition-all ${
                      hoveredDayIndex === idx
                        ? 'bg-[#92C842] text-[#090e1c] font-bold shadow-sm'
                        : 'bg-[#151f38] text-slate-300 hover:text-white border border-[#1e2d4d]'
                    }`}
                  >
                    {pt.dayLabel.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Regional Capacity Architecture Card */}
          <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-xl p-4 shadow-lg space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Regional Baseline Architecture
            </h4>
            <div className="space-y-2 text-xs">
              {Object.values(HUB_TREND_CONFIGS).map((hub) => (
                <div
                  key={hub.key}
                  className="p-2 rounded-lg bg-[#0b1222] border border-[#1e2d4d]/60 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: hub.color }} />
                    <span className="font-semibold text-slate-200">{hub.name}</span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-400">
                    <strong className="text-white">{hub.nominalCapacity}</strong> POS ({hub.telemetryWindow})
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* 4. 7-DAY TELEMETRY DATA AUDIT TABLE */}
      <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-xl overflow-hidden shadow-xl">
        <div className="px-5 py-3.5 border-b border-[#1e2d4d] bg-[#090e1c]/70 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-mono">
            <span className="w-2 h-2 rounded-full bg-[#92C842]" />
            <span className="font-bold text-slate-200 uppercase tracking-wider">
              7-Day Shift Telemetry Audit Ledger &amp; Hub Concurrency
            </span>
          </div>
          <span className="text-[11px] font-mono text-[#92C842]">
            VERIFIED AUDIT RECORD • KEA REGIONAL INFRASTRUCTURE
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#151f38] text-slate-400 font-mono text-[10px] uppercase tracking-wider border-b border-[#1e2d4d]">
              <tr>
                <th className="px-5 py-3">Audit Date</th>
                <th className="px-5 py-3">Lagos (LOS)</th>
                <th className="px-5 py-3">Ibadan (IBD)</th>
                <th className="px-5 py-3">Ogun (OGN)</th>
                <th className="px-5 py-3">Benin (BEN)</th>
                <th className="px-5 py-3">Combined Active POS</th>
                <th className="px-5 py-3">24h Delta</th>
                <th className="px-5 py-3">Shift Compliance &amp; Operational Events</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2d4d]/60 font-mono">
              {SEVEN_DAY_TELEMETRY_TRENDS.map((pt, idx) => {
                const prevTotal = idx > 0 ? SEVEN_DAY_TELEMETRY_TRENDS[idx - 1].total : pt.total;
                const delta = pt.total - prevTotal;
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
                    <td className="px-5 py-3.5 font-bold flex items-center gap-2 text-white">
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#92C842]' : 'bg-slate-600'}`} />
                      <span>{pt.displayDate}</span>
                    </td>
                    <td className="px-5 py-3.5 text-[#92C842] font-semibold">
                      {pt.Lagos} <span className="text-[10px] text-slate-500">({Math.round((pt.Lagos / 680) * 100)}%)</span>
                    </td>
                    <td className="px-5 py-3.5 text-[#22d3ee] font-semibold">
                      {pt.Ibadan} <span className="text-[10px] text-slate-500">({Math.round((pt.Ibadan / 340) * 100)}%)</span>
                    </td>
                    <td className="px-5 py-3.5 text-[#F17F31] font-semibold">
                      {pt.Ogun} <span className="text-[10px] text-slate-500">({Math.round((pt.Ogun / 220) * 100)}%)</span>
                    </td>
                    <td className="px-5 py-3.5 text-[#c084fc] font-semibold">
                      {pt.Benin} <span className="text-[10px] text-slate-500">({Math.round((pt.Benin / 180) * 100)}%)</span>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-white text-sm">
                      {pt.total.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5">
                      {idx === 0 ? (
                        <span className="text-slate-500 font-normal">Base</span>
                      ) : (
                        <span className={delta >= 0 ? 'text-[#92C842] font-bold' : 'text-[#F17F31] font-bold'}>
                          {delta >= 0 ? `+${delta}` : delta}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 font-sans text-xs">
                      {pt.notes}
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
