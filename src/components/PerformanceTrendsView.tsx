import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { SEVEN_DAY_TELEMETRY_TRENDS, HUB_TREND_CONFIGS, HubTrendConfig } from '../data/telemetryTrendsData';
import { DailyHubTelemetryPoint } from '../types';
import { TrendingUp, Download, FileText, UserPlus, BarChart3, Clock, CheckCircle2, X, Search } from 'lucide-react';

interface PerformanceTrendsViewProps {
  onOpenShiftCompliance?: () => void;
  onOpenNewVSR?: () => void;
}

type MetricDisplayMode = 'absolute' | 'capacity_pct';
type KpiModalType = 'today_active' | 'peak_activity' | 'daily_avg' | 'uptime_rate' | null;

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
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(6);
  const [hoveredSeries, setHoveredSeries] = useState<string | null>(null);
  const [kpiModalType, setKpiModalType] = useState<KpiModalType>(null);
  const [kpiModalSearch, setKpiModalSearch] = useState<string>('');

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
    link.href = url;
    link.setAttribute('download', `KEA_Performance_Trends_7Days_${new Date().toISOString().slice(0, 10)}.csv`);
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
    const height = 440;
    const margin = { top: 30, right: 35, bottom: 45, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const data = SEVEN_DAY_TELEMETRY_TRENDS;

    const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);
    const defs = svg.append('defs');

    // Linear gradients for area fills
    const hubColors: Record<string, string> = {
      Lagos: '#10b981',
      Ibadan: '#0284c7',
      Ogun: '#f59e0b',
      Benin: '#8b5cf6',
      Total: '#64748b'
    };

    Object.entries(hubColors).forEach(([key, color]) => {
      const grad = defs.append('linearGradient')
        .attr('id', `area-grad-${key}`)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%');
      grad.append('stop').attr('offset', '0%').attr('stop-color', color).attr('stop-opacity', '0.20');
      grad.append('stop').attr('offset', '100%').attr('stop-color', color).attr('stop-opacity', '0.01');
    });

    // SCALES
    const xScale = d3.scalePoint()
      .domain(data.map((d) => d.displayDate))
      .range([0, innerWidth])
      .padding(0.08);

    let minY = 0;
    let maxY = 750;

    if (displayMode === 'capacity_pct') {
      minY = 80;
      maxY = 105;
    } else {
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

    // GRIDLINES
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

    // AXES
    const xAxis = d3.axisBottom(xScale);
    const xAxisGroup = g.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(xAxis);

    xAxisGroup.select('.domain')
      .attr('stroke', '#cbd5e1')
      .attr('stroke-width', 1.5);

    xAxisGroup.selectAll('text')
      .attr('fill', '#64748b')
      .attr('font-size', '11px')
      .attr('font-family', 'monospace')
      .attr('dy', '14px');

    xAxisGroup.selectAll('line').attr('stroke', '#cbd5e1');

    const yAxis = d3.axisLeft(yScale)
      .ticks(6)
      .tickFormat((d) => (displayMode === 'capacity_pct' ? `${d}%` : `${d}`));

    const yAxisGroup = g.append('g').call(yAxis);
    yAxisGroup.select('.domain').remove();
    yAxisGroup.selectAll('text')
      .attr('fill', '#64748b')
      .attr('font-size', '11px')
      .attr('font-family', 'monospace')
      .attr('dx', '-6px');

    yAxisGroup.selectAll('line').remove();

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -45)
      .attr('x', -innerHeight / 2)
      .attr('text-anchor', 'middle')
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace')
      .attr('letter-spacing', '0.08em')
      .text(displayMode === 'capacity_pct' ? 'CAPACITY ADHERENCE (%)' : 'ACTIVE MACHINES COUNT');

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

      g.append('path')
        .datum(data)
        .attr('fill', `url(#area-grad-${key})`)
        .attr('d', areaGenerator)
        .attr('opacity', isHovered ? 0.9 : 0.6);

      g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', key === 'Total' ? 3 : isHovered ? 3.5 : 2.5)
        .attr('stroke-dasharray', key === 'Total' ? '6,3' : 'none')
        .attr('d', lineGenerator)
        .style('cursor', 'pointer')
        .on('mouseenter', () => setHoveredSeries(key))
        .on('mouseleave', () => setHoveredSeries(null))
        .on('click', () => setKpiModalType('today_active'));

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
          })
          .on('click', () => {
            setKpiModalType('today_active');
          });

        if (isDaySelected || isHovered) {
          dotG.append('circle')
            .attr('r', 8)
            .attr('fill', color)
            .attr('fill-opacity', 0.25)
            .attr('stroke', color)
            .attr('stroke-width', 1);
        }

        dotG.append('circle')
          .attr('r', isDaySelected ? 5 : 3.5)
          .attr('fill', color)
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 2);

        if (isDaySelected) {
          dotG.append('text')
            .attr('y', -11)
            .attr('text-anchor', 'middle')
            .attr('fill', '#0f172a')
            .attr('font-size', '10px')
            .attr('font-weight', 'bold')
            .attr('font-family', 'monospace')
            .text(`${getVal(d, key)}${displayMode === 'capacity_pct' ? '%' : ''}`);
        }
      });
    });

    if (hoveredDayIndex !== null && data[hoveredDayIndex]) {
      const activeX = xScale(data[hoveredDayIndex].displayDate) || 0;

      const crosshair = g.append('g').attr('class', 'crosshair-pointer');

      crosshair.append('line')
        .attr('x1', activeX)
        .attr('y1', 0)
        .attr('x2', activeX)
        .attr('y2', innerHeight)
        .attr('stroke', '#10b981')
        .attr('stroke-width', 1.5)
        .attr('stroke-opacity', 0.6)
        .attr('stroke-dasharray', '4,4');

      crosshair.append('circle')
        .attr('cx', activeX)
        .attr('cy', 0)
        .attr('r', 3)
        .attr('fill', '#10b981');
    }

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
      setKpiModalType('today_active');
    });

  }, [activeHubs, displayMode, hoveredDayIndex, hoveredSeries]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. TOP HEADER & TELEMETRY CONTROLS */}
      <div className="bg-white rounded-[12px] border border-slate-200/80 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Performance Trends &amp; Activity
              </h1>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                7-DAY AUDIT
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                07:00–21:00 WAT
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              7-day activity chart tracking daily active card machines, sales volumes, and staff concurrency across all store branches.
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
            <span>Export CSV</span>
          </button>

          {onOpenShiftCompliance && (
            <button
              onClick={onOpenShiftCompliance}
              className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
              title="Generate comprehensive Shift Compliance PDF Report"
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

      {/* 2. EXECUTIVE 7-DAY KPI CARDS (Click to open live tabular telemetry records) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Active Telemetry */}
        <div 
          onClick={() => setKpiModalType('today_active')}
          className="bg-white rounded-[12px] border border-slate-200/80 p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group"
          title="Click to view full tabular list of today's active terminals across all hubs"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>TODAY'S ACTIVE MACHINES</span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded text-[10px]">● LIVE</span>
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-slate-900 font-mono group-hover:text-emerald-600 transition-colors">
              {summaryStats.currentTotal.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-0.5 flex items-center justify-between">
              <span className="text-emerald-700 font-bold">+{summaryStats.growthPercent}% vs Launch</span>
              <span className="text-emerald-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Ledger ↗</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: '100%' }} />
          </div>
        </div>

        {/* Card 2: 7-Day Peak */}
        <div 
          onClick={() => setKpiModalType('peak_activity')}
          className="bg-white rounded-[12px] border border-slate-200/80 p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:border-sky-400 hover:shadow-md transition-all cursor-pointer group"
          title="Click to view tabular peak activity report per hub"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>7-DAY PEAK ACTIVITY</span>
            <span className="text-slate-400 font-bold">{summaryStats.peakDayDisplay}</span>
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-slate-900 font-mono group-hover:text-sky-600 transition-colors">
              {summaryStats.peakTotal.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-0.5 flex items-center justify-between">
              <span>Peak weekend surge</span>
              <span className="text-sky-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Ledger ↗</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="h-1.5 rounded-full bg-sky-500" style={{ width: '96%' }} />
          </div>
        </div>

        {/* Card 3: 7-Day Average Active Devices */}
        <div 
          onClick={() => setKpiModalType('daily_avg')}
          className="bg-white rounded-[12px] border border-slate-200/80 p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group"
          title="Click to view daily average throughput table"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>7-DAY DAILY AVERAGE</span>
            <span className="text-slate-400 font-semibold">4 BRANCHES</span>
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-slate-900 font-mono group-hover:text-amber-600 transition-colors">
              {summaryStats.avgTotal.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-0.5 flex items-center justify-between">
              <span>Net: <strong className="text-emerald-700">+{summaryStats.growthCount} nodes</strong></span>
              <span className="text-amber-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Ledger ↗</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="h-1.5 rounded-full bg-amber-500" style={{ width: '92%' }} />
          </div>
        </div>

        {/* Card 4: Telemetry Uptime & Reliability */}
        <div 
          onClick={() => setKpiModalType('uptime_rate')}
          className="bg-white rounded-[12px] border border-slate-200/80 p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:border-purple-400 hover:shadow-md transition-all cursor-pointer group"
          title="Click to view 7-day uptime & network reliability incident log"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>SYSTEM UPTIME RATE</span>
            <span className="text-emerald-700 font-semibold">WAT WINDOW</span>
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-slate-900 font-mono group-hover:text-purple-600 transition-colors">
              {summaryStats.uptimeRate}%
            </div>
            <div className="text-xs text-slate-500 mt-0.5 flex items-center justify-between">
              <span>07:00–21:00 WAT standard</span>
              <span className="text-purple-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Logs ↗</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="h-1.5 rounded-full bg-purple-500" style={{ width: '99%' }} />
          </div>
        </div>
      </div>

      {/* 3. D3 LINE CHART & INTERACTIVE INSPECTOR PANEL */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* CHART CONTAINER (8 cols on XL) */}
        <div className="xl:col-span-8 bg-white rounded-[12px] border border-slate-200/80 overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
          {/* Chart Controls Bar */}
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            {/* Hub Series Toggles */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono text-slate-500 uppercase mr-1 font-bold">BRANCHES:</span>
              
              {/* Lagos Toggle */}
              <button
                onClick={() => toggleHub('Lagos')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all border ${
                  activeHubs.Lagos
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Lagos</span>
              </button>

              {/* Ibadan Toggle */}
              <button
                onClick={() => toggleHub('Ibadan')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all border ${
                  activeHubs.Ibadan
                    ? 'bg-sky-50 text-sky-700 border-sky-300 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                <span>Ibadan</span>
              </button>

              {/* Ogun Toggle */}
              <button
                onClick={() => toggleHub('Ogun')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all border ${
                  activeHubs.Ogun
                    ? 'bg-amber-50 text-amber-700 border-amber-300 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>Ogun</span>
              </button>

              {/* Benin Toggle */}
              <button
                onClick={() => toggleHub('Benin')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all border ${
                  activeHubs.Benin
                    ? 'bg-purple-50 text-purple-700 border-purple-300 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                <span>Benin</span>
              </button>

              {/* Total Aggregate Line Toggle */}
              <button
                onClick={() => toggleHub('Total')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all border ${
                  activeHubs.Total
                    ? 'bg-slate-200 text-slate-900 border-slate-400 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                <span>Combined Total</span>
              </button>
            </div>

            {/* Metric Mode Switcher */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono text-slate-500 uppercase mr-1 font-bold">SCALE:</span>
              <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
                <button
                  onClick={() => setDisplayMode('absolute')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                    displayMode === 'absolute'
                      ? 'bg-white text-slate-900 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Raw Counts
                </button>
                <button
                  onClick={() => setDisplayMode('capacity_pct')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                    displayMode === 'capacity_pct'
                      ? 'bg-white text-slate-900 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  % Capacity
                </button>
              </div>

              {/* View Table Button */}
              <button
                onClick={() => setKpiModalType('today_active')}
                className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
                title="Click to view full tabular data of 7-day telemetry trends"
              >
                <span>View 7-Day Table ↗</span>
              </button>
            </div>
          </div>

          {/* D3 SVG Line Chart Stage */}
          <div ref={containerRef} className="relative w-full aspect-[16/8.5] min-h-[380px] p-2 bg-white select-none">
            <svg
              ref={svgRef}
              viewBox="0 0 940 440"
              preserveAspectRatio="xMidYMid meet"
              className="w-full h-full block"
            />
          </div>

          {/* Chart Bottom Context Strip */}
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-600">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-1 bg-emerald-500 rounded inline-block"></span> Lagos (680 POS)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-1 bg-sky-500 rounded inline-block"></span> Ibadan (340 POS)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-1 bg-amber-500 rounded inline-block"></span> Ogun (220 POS)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-1 bg-purple-500 rounded inline-block"></span> Benin (180 POS)
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Hover across data points to inspect daily numbers
            </div>
          </div>
        </div>

        {/* DAILY TELEMETRY AUDIT INSPECTOR (4 cols on XL) */}
        <div className="xl:col-span-4 space-y-4">
          {/* Active Day Detail Card */}
          <div className="bg-white rounded-[12px] border border-slate-200/80 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-emerald-700 tracking-wider font-bold">
                  DAILY ACTIVITY POINT
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {activeDayPoint.displayDate} ({activeDayPoint.dayLabel})
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {activeDayPoint.total.toLocaleString()} Active
              </span>
            </div>

            {/* Regional Hub Values on this Day */}
            <div className="space-y-2.5 text-xs font-mono">
              {/* Lagos */}
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <div>
                    <div className="font-bold text-slate-900">Lagos Hub</div>
                    <div className="text-[10px] text-slate-400">Cap: 680 • 07:00 WAT</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-emerald-700">{activeDayPoint.Lagos}</div>
                  <div className="text-[10px] text-slate-500">
                    {Math.round((activeDayPoint.Lagos / 680) * 100)}% Capacity
                  </div>
                </div>
              </div>

              {/* Ibadan */}
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                  <div>
                    <div className="font-bold text-slate-900">Ibadan Cluster</div>
                    <div className="text-[10px] text-slate-400">Cap: 340 • 07:30 WAT</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-sky-700">{activeDayPoint.Ibadan}</div>
                  <div className="text-[10px] text-slate-500">
                    {Math.round((activeDayPoint.Ibadan / 340) * 100)}% Capacity
                  </div>
                </div>
              </div>

              {/* Ogun */}
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <div>
                    <div className="font-bold text-slate-900">Ogun Hub</div>
                    <div className="text-[10px] text-slate-400">Cap: 220 • 08:00 WAT</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-amber-700">{activeDayPoint.Ogun}</div>
                  <div className="text-[10px] text-slate-500">
                    {Math.round((activeDayPoint.Ogun / 220) * 100)}% Capacity
                  </div>
                </div>
              </div>

              {/* Benin */}
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <div>
                    <div className="font-bold text-slate-900">Benin Sector</div>
                    <div className="text-[10px] text-slate-400">Cap: 180 • 08:00 WAT</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-purple-700">{activeDayPoint.Benin}</div>
                  <div className="text-[10px] text-slate-500">
                    {Math.round((activeDayPoint.Benin / 180) * 100)}% Capacity
                  </div>
                </div>
              </div>
            </div>

            {/* Operational Shift Log for this Day */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs">
              <div className="font-mono text-[10px] text-slate-500 uppercase font-semibold mb-1">
                OBSERVATIONS:
              </div>
              <p className="text-slate-700 leading-relaxed italic">
                "{activeDayPoint.notes}"
              </p>
            </div>

            {/* Quick Day Selector Buttons */}
            <div className="pt-1">
              <div className="text-[10px] font-mono text-slate-500 mb-1.5 uppercase font-bold">
                JUMP TO SPECIFIC DAY:
              </div>
              <div className="grid grid-cols-7 gap-1">
                {SEVEN_DAY_TELEMETRY_TRENDS.map((pt, idx) => (
                  <button
                    key={pt.date}
                    onClick={() => setHoveredDayIndex(idx)}
                    className={`py-1.5 px-1 rounded-lg text-center font-mono text-[10px] transition-all ${
                      hoveredDayIndex === idx
                        ? 'bg-[#10b981] text-white font-bold shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {pt.dayLabel.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Regional Capacity Architecture Card */}
          <div className="bg-white rounded-[12px] border border-slate-200/80 p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
              Branch Baseline Setup
            </h4>
            <div className="space-y-2 text-xs">
              {Object.values(HUB_TREND_CONFIGS).map((hub) => (
                <div
                  key={hub.key}
                  className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: hub.color }} />
                    <span className="font-semibold text-slate-800">{hub.name}</span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-500">
                    <strong className="text-slate-900">{hub.nominalCapacity}</strong> POS ({hub.telemetryWindow})
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. 7-DAY TELEMETRY DATA AUDIT TABLE */}
      <div className="bg-white rounded-[12px] border border-slate-200/80 overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-bold text-slate-900 uppercase tracking-wider">
              7-Day Shift Attendance &amp; Machine Activity Table
            </span>
          </div>
          <span className="text-[11px] font-mono text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            VERIFIED AUDIT LOG
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 font-mono text-[10px] uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Audit Date</th>
                <th className="px-5 py-3">Lagos (LOS)</th>
                <th className="px-5 py-3">Ibadan (IBD)</th>
                <th className="px-5 py-3">Ogun (OGN)</th>
                <th className="px-5 py-3">Benin (BEN)</th>
                <th className="px-5 py-3">Combined POS</th>
                <th className="px-5 py-3">24h Change</th>
                <th className="px-5 py-3">Shift Notes &amp; Events</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
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
                        ? 'bg-slate-50 text-slate-900 font-bold'
                        : 'hover:bg-slate-50/80 text-slate-700'
                    }`}
                  >
                    <td className="px-5 py-3.5 font-bold flex items-center gap-2 text-slate-900">
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      <span>{pt.displayDate}</span>
                    </td>
                    <td className="px-5 py-3.5 text-emerald-700 font-semibold">
                      {pt.Lagos} <span className="text-[10px] text-slate-400">({Math.round((pt.Lagos / 680) * 100)}%)</span>
                    </td>
                    <td className="px-5 py-3.5 text-sky-700 font-semibold">
                      {pt.Ibadan} <span className="text-[10px] text-slate-400">({Math.round((pt.Ibadan / 340) * 100)}%)</span>
                    </td>
                    <td className="px-5 py-3.5 text-amber-700 font-semibold">
                      {pt.Ogun} <span className="text-[10px] text-slate-400">({Math.round((pt.Ogun / 220) * 100)}%)</span>
                    </td>
                    <td className="px-5 py-3.5 text-purple-700 font-semibold">
                      {pt.Benin} <span className="text-[10px] text-slate-400">({Math.round((pt.Benin / 180) * 100)}%)</span>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-900 text-sm">
                      {pt.total.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5">
                      {idx === 0 ? (
                        <span className="text-slate-400 font-normal">Base</span>
                      ) : (
                        <span className={delta >= 0 ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                          {delta >= 0 ? `+${delta}` : delta}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 font-sans text-xs">
                      {pt.notes}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. INTERACTIVE KPI METRICS DRILL-DOWN MODAL */}
      {kpiModalType && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-[16px] border border-slate-200/80 shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Live Telemetry Audit
                    </span>
                    <span className="text-xs text-slate-500 font-mono">07:00–21:00 WAT</span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 mt-0.5">
                    {kpiModalType === 'today_active' && "Today's Active POS Terminals & Field Units"}
                    {kpiModalType === 'peak_activity' && "7-Day Peak Concurrency Breakdown (Per Hub)"}
                    {kpiModalType === 'daily_avg' && "7-Day Daily Rolling Averages vs Hub Baseline"}
                    {kpiModalType === 'uptime_rate' && "System Network Uptime & Telemetry Reliability Log"}
                  </h3>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>CSV</span>
                </button>
                <button
                  onClick={() => {
                    setKpiModalType(null);
                    setKpiModalSearch('');
                  }}
                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Search & Filter */}
            <div className="px-6 py-3 border-b border-slate-200 bg-white flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter hub, date, or metric notes..."
                  value={kpiModalSearch}
                  onChange={(e) => setKpiModalSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500 focus:bg-white transition-all text-slate-800 font-mono"
                />
              </div>
              <div className="text-xs text-slate-500 font-mono">
                Showing <strong>{SEVEN_DAY_TELEMETRY_TRENDS.length}</strong> audited records
              </div>
            </div>

            {/* Modal Body - Tabular List */}
            <div className="overflow-y-auto flex-1 p-6">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 font-mono text-[10px] uppercase tracking-wider border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="px-4 py-3">Day / Date</th>
                    <th className="px-4 py-3 text-emerald-700">Lagos (680 Cap)</th>
                    <th className="px-4 py-3 text-sky-700">Ibadan (340 Cap)</th>
                    <th className="px-4 py-3 text-amber-700">Ogun (220 Cap)</th>
                    <th className="px-4 py-3 text-purple-700">Benin (180 Cap)</th>
                    <th className="px-4 py-3 text-right">Combined Active</th>
                    <th className="px-4 py-3">Operational Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {SEVEN_DAY_TELEMETRY_TRENDS
                    .filter((row) => {
                      if (!kpiModalSearch) return true;
                      const q = kpiModalSearch.toLowerCase();
                      return (
                        row.displayDate.toLowerCase().includes(q) ||
                        row.dayLabel.toLowerCase().includes(q) ||
                        (row.notes && row.notes.toLowerCase().includes(q))
                      );
                    })
                    .map((row) => (
                      <tr key={row.date} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-bold text-slate-900">
                          {row.displayDate} <span className="text-[10px] font-normal text-slate-400">({row.dayLabel})</span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-emerald-700">
                          {row.Lagos} <span className="text-[10px] text-slate-400">({Math.round((row.Lagos / 680) * 100)}%)</span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-sky-700">
                          {row.Ibadan} <span className="text-[10px] text-slate-400">({Math.round((row.Ibadan / 340) * 100)}%)</span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-amber-700">
                          {row.Ogun} <span className="text-[10px] text-slate-400">({Math.round((row.Ogun / 220) * 100)}%)</span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-purple-700">
                          {row.Benin} <span className="text-[10px] text-slate-400">({Math.round((row.Benin / 180) * 100)}%)</span>
                        </td>
                        <td className="px-4 py-3 text-right font-black text-slate-900 text-sm">
                          {row.total.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            {row.notes ? row.notes.slice(0, 32) + '...' : 'Verified Normal'}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
              <div className="text-slate-500 font-mono">
                System Timezone: <strong>WAT (UTC+1)</strong> • Baseline Concurrency: <strong>1,420 POS</strong>
              </div>
              <button
                onClick={() => {
                  setKpiModalType(null);
                  setKpiModalSearch('');
                }}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors"
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
