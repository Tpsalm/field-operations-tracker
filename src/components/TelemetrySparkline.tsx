import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';

interface TelemetrySparklineProps {
  hub: string;
  hubName?: string;
  idleMinutes: number;
  alertType?: 'idle' | 'overrun';
  terminalCount?: number;
  lastPingTime?: number;
  width?: number;
  height?: number;
}

interface PingDataPoint {
  minuteAgo: number;
  pingsPerMin: number;
  label: string;
}

export const TelemetrySparkline: React.FC<TelemetrySparklineProps> = ({
  hub,
  idleMinutes,
  alertType = 'idle',
  terminalCount = 18,
  lastPingTime,
  width = 124,
  height = 24
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<PingDataPoint | null>(null);

  // Generate 60-minute historical telemetry ping frequency data
  // Sampled every 3 minutes from -60 minutes to 0 (Now)
  const data: PingDataPoint[] = useMemo(() => {
    const points: PingDataPoint[] = [];
    const basePings = Math.max(8, Math.round(terminalCount * 0.8));

    for (let m = 60; m >= 0; m -= 3) {
      let pings = 0;

      if (alertType === 'overrun') {
        // Sustained high telemetry frequency past closing cutoff
        const variance = Math.sin(m * 0.45) * 3 + Math.cos(m * 0.2) * 2;
        pings = Math.max(6, Math.round(basePings + variance));
      } else {
        // Idle breach scenario:
        // Before idle duration began (m > idleMinutes), terminals actively transmitted heartbeats
        if (m > idleMinutes) {
          const variance = Math.sin((m - idleMinutes) * 0.5) * 3 + Math.cos(m * 0.25) * 2;
          pings = Math.max(8, Math.round(basePings + variance));
        } else if (m === idleMinutes) {
          // Transition minute where heartbeat dropped off
          pings = Math.round(basePings * 0.2);
        } else {
          // Telemetry heartbeat completely silent during idle period
          pings = 0;
        }

        // If telemetry was recently restored (idleMinutes === 0), latest point spikes
        if (m === 0 && idleMinutes === 0) {
          pings = basePings;
        }
      }

      points.push({
        minuteAgo: m,
        pingsPerMin: pings,
        label: m === 0 ? 'Now' : `-${m}m`
      });
    }

    return points;
  }, [idleMinutes, alertType, terminalCount, lastPingTime]);

  const currentPingRate = data[data.length - 1]?.pingsPerMin || 0;
  const isBreached = alertType === 'overrun' || (alertType === 'idle' && currentPingRate === 0);

  // Accent colors based on alert classification
  const themeColor = alertType === 'overrun' ? '#E05252' : '#F17F31';
  const gradientId = `sparkline-grad-${hub}-${alertType}`;

  // D3 Rendering
  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const padding = { top: 3, right: 3, bottom: 3, left: 3 };
    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;

    // X Scale: minuteAgo (60 -> 0) mapped left to right
    const xScale = d3
      .scaleLinear()
      .domain([60, 0])
      .range([padding.left, padding.left + innerWidth]);

    // Y Scale: pingsPerMin (0 -> max)
    const maxVal = d3.max(data, (d) => d.pingsPerMin) || 20;
    const yScale = d3
      .scaleLinear()
      .domain([0, Math.max(15, maxVal * 1.15)])
      .range([padding.top + innerHeight, padding.top]);

    // Defs for subtle gradient fill
    const defs = svg.append('defs');
    const areaGradient = defs
      .append('linearGradient')
      .attr('id', gradientId)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    areaGradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', themeColor)
      .attr('stop-opacity', 0.35);

    areaGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', themeColor)
      .attr('stop-opacity', 0.0);

    // Baseline reference (at y=0)
    svg
      .append('line')
      .attr('x1', padding.left)
      .attr('x2', padding.left + innerWidth)
      .attr('y1', padding.top + innerHeight)
      .attr('y2', padding.top + innerHeight)
      .attr('stroke', '#1e2d4d')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '2,2');

    // Area generator
    const areaGenerator = d3
      .area<PingDataPoint>()
      .x((d) => xScale(d.minuteAgo))
      .y0(padding.top + innerHeight)
      .y1((d) => yScale(d.pingsPerMin))
      .curve(d3.curveMonotoneX);

    // Line generator
    const lineGenerator = d3
      .line<PingDataPoint>()
      .x((d) => xScale(d.minuteAgo))
      .y((d) => yScale(d.pingsPerMin))
      .curve(d3.curveMonotoneX);

    // Render Area
    svg
      .append('path')
      .datum(data)
      .attr('d', areaGenerator)
      .attr('fill', `url(#${gradientId})`);

    // Render Line
    svg
      .append('path')
      .datum(data)
      .attr('d', lineGenerator)
      .attr('fill', 'none')
      .attr('stroke', themeColor)
      .attr('stroke-width', 1.75)
      .attr('stroke-linecap', 'round');

    // Threshold indicator line if idle breach (where pings drop off)
    if (alertType === 'idle' && idleMinutes > 0 && idleMinutes < 60) {
      const breachX = xScale(idleMinutes);
      svg
        .append('line')
        .attr('x1', breachX)
        .attr('x2', breachX)
        .attr('y1', padding.top)
        .attr('y2', padding.top + innerHeight)
        .attr('stroke', '#F17F31')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '2,1')
        .attr('opacity', 0.7);
    }

    // Latest endpoint marker (t=0)
    const latestPoint = data[data.length - 1];
    if (latestPoint) {
      const cx = xScale(latestPoint.minuteAgo);
      const cy = yScale(latestPoint.pingsPerMin);

      // Outer halo
      svg
        .append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', 3)
        .attr('fill', themeColor)
        .attr('opacity', 0.3)
        .attr('class', 'animate-ping');

      // Center dot
      svg
        .append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', 2)
        .attr('fill', latestPoint.pingsPerMin === 0 ? '#151f38' : themeColor)
        .attr('stroke', themeColor)
        .attr('stroke-width', 1.25);
    }

    // Interactive hover overlay group
    const hoverGroup = svg.append('g').style('display', 'none');

    const hoverLine = hoverGroup
      .append('line')
      .attr('y1', padding.top)
      .attr('y2', padding.top + innerHeight)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '2,2')
      .attr('opacity', 0.6);

    const hoverCircle = hoverGroup
      .append('circle')
      .attr('r', 3)
      .attr('fill', themeColor)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1.5);

    // Transparent overlay for capturing pointer events
    const bisect = d3.bisector<PingDataPoint, number>((d) => d.minuteAgo).center;

    svg
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'transparent')
      .attr('cursor', 'crosshair')
      .on('mousemove', function (event: MouseEvent) {
        const [mx] = d3.pointer(event);
        const minuteVal = xScale.invert(mx);
        const idx = bisect(data, minuteVal);
        const selected = data[idx];

        if (selected) {
          setHoveredPoint(selected);
          hoverGroup.style('display', null);
          const cx = xScale(selected.minuteAgo);
          const cy = yScale(selected.pingsPerMin);

          hoverLine.attr('x1', cx).attr('x2', cx);
          hoverCircle.attr('cx', cx).attr('cy', cy);
        }
      })
      .on('mouseleave', function () {
        setHoveredPoint(null);
        hoverGroup.style('display', 'none');
      });
  }, [data, width, height, themeColor, gradientId, idleMinutes, alertType]);

  return (
    <div
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#090e1c] border border-[#1e2d4d] shadow-sm select-none"
      title={`Last 60m Telemetry Heartbeat Ping Frequency for ${hub}. Hover sparkline to inspect minute-by-minute rate.`}
    >
      {/* Label & Status */}
      <div className="flex flex-col text-[9px] font-mono leading-tight shrink-0">
        <span className="text-slate-400 uppercase font-sans font-semibold tracking-wider">
          60m Pings
        </span>
        <span
          className="font-bold"
          style={{ color: isBreached ? themeColor : '#92C842' }}
        >
          {hoveredPoint ? (
            <span>
              {hoveredPoint.label}: {hoveredPoint.pingsPerMin}/m
            </span>
          ) : (
            <span>
              {currentPingRate} p/min {currentPingRate === 0 ? '(Idle)' : ''}
            </span>
          )}
        </span>
      </div>

      {/* D3 Sparkline SVG Container */}
      <div className="relative flex items-center shrink-0">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="overflow-visible block"
          role="img"
          aria-label={`60-minute telemetry ping frequency sparkline for ${hub}`}
        />

        {/* Hover Floating Tooltip */}
        {hoveredPoint && (
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-[#0c1427] border border-[#1e2d4d] text-[9px] font-mono text-white shadow-lg pointer-events-none whitespace-nowrap z-20">
            <span className="text-slate-400">{hoveredPoint.label}:</span>{' '}
            <strong style={{ color: themeColor }}>{hoveredPoint.pingsPerMin} pings/min</strong>
          </div>
        )}
      </div>

      {/* Sparkline Axis Guide (T-60m to Now) */}
      <div className="hidden sm:flex flex-col text-[8px] font-mono text-slate-500 leading-none shrink-0 border-l border-[#1e2d4d] pl-1.5">
        <span>-60m</span>
        <span className="mt-auto">Now</span>
      </div>
    </div>
  );
};
