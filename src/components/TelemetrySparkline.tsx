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
  const data: PingDataPoint[] = useMemo(() => {
    const points: PingDataPoint[] = [];
    const basePings = Math.max(8, Math.round(terminalCount * 0.8));

    for (let m = 60; m >= 0; m -= 3) {
      let pings = 0;

      if (alertType === 'overrun') {
        const variance = Math.sin(m * 0.45) * 3 + Math.cos(m * 0.2) * 2;
        pings = Math.max(6, Math.round(basePings + variance));
      } else {
        if (m > idleMinutes) {
          const variance = Math.sin((m - idleMinutes) * 0.5) * 3 + Math.cos(m * 0.25) * 2;
          pings = Math.max(8, Math.round(basePings + variance));
        } else if (m === idleMinutes) {
          pings = Math.round(basePings * 0.2);
        } else {
          pings = 0;
        }

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
  const themeColor = alertType === 'overrun' ? '#ef4444' : '#f59e0b';
  const gradientId = `sparkline-grad-${hub}-${alertType}`;

  // D3 Rendering
  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const padding = { top: 3, right: 3, bottom: 3, left: 3 };
    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;

    const xScale = d3
      .scaleLinear()
      .domain([60, 0])
      .range([padding.left, padding.left + innerWidth]);

    const maxVal = d3.max(data, (d) => d.pingsPerMin) || 20;
    const yScale = d3
      .scaleLinear()
      .domain([0, Math.max(15, maxVal * 1.15)])
      .range([padding.top + innerHeight, padding.top]);

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
      .attr('stop-opacity', 0.25);

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
      .attr('stroke', '#e2e8f0')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '2,2');

    const areaGenerator = d3
      .area<PingDataPoint>()
      .x((d) => xScale(d.minuteAgo))
      .y0(padding.top + innerHeight)
      .y1((d) => yScale(d.pingsPerMin))
      .curve(d3.curveMonotoneX);

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

    if (alertType === 'idle' && idleMinutes > 0 && idleMinutes < 60) {
      const breachX = xScale(idleMinutes);
      svg
        .append('line')
        .attr('x1', breachX)
        .attr('x2', breachX)
        .attr('y1', padding.top)
        .attr('y2', padding.top + innerHeight)
        .attr('stroke', '#f59e0b')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '2,1')
        .attr('opacity', 0.7);
    }

    const latestPoint = data[data.length - 1];
    if (latestPoint) {
      const cx = xScale(latestPoint.minuteAgo);
      const cy = yScale(latestPoint.pingsPerMin);

      svg
        .append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', 3)
        .attr('fill', themeColor)
        .attr('opacity', 0.3)
        .attr('class', 'animate-ping');

      svg
        .append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', 2)
        .attr('fill', latestPoint.pingsPerMin === 0 ? '#ffffff' : themeColor)
        .attr('stroke', themeColor)
        .attr('stroke-width', 1.25);
    }

    const hoverGroup = svg.append('g').style('display', 'none');

    const hoverLine = hoverGroup
      .append('line')
      .attr('y1', padding.top)
      .attr('y2', padding.top + innerHeight)
      .attr('stroke', '#0f172a')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '2,2')
      .attr('opacity', 0.6);

    const hoverCircle = hoverGroup
      .append('circle')
      .attr('r', 3)
      .attr('fill', themeColor)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1.5);

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
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 shadow-xs select-none"
      title={`Last 60m signal frequency for ${hub}.`}
    >
      <div className="flex flex-col text-[9px] font-mono leading-tight shrink-0">
        <span className="text-slate-400 uppercase font-sans font-semibold tracking-wider">
          60m Signal
        </span>
        <span
          className="font-bold"
          style={{ color: isBreached ? themeColor : '#10b981' }}
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

      <div className="relative flex items-center shrink-0">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="overflow-visible block"
          role="img"
          aria-label={`60-minute signal frequency sparkline for ${hub}`}
        />

        {hoveredPoint && (
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[9px] font-mono text-slate-800 shadow-md pointer-events-none whitespace-nowrap z-20">
            <span className="text-slate-500">{hoveredPoint.label}:</span>{' '}
            <strong style={{ color: themeColor }}>{hoveredPoint.pingsPerMin} signals/min</strong>
          </div>
        )}
      </div>

      <div className="hidden sm:flex flex-col text-[8px] font-mono text-slate-400 leading-none shrink-0 border-l border-slate-200 pl-1.5">
        <span>-60m</span>
        <span className="mt-auto">Now</span>
      </div>
    </div>
  );
};
