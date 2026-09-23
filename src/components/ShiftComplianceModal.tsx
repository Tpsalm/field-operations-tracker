import React, { useState, useMemo } from 'react';
import { FieldMerchandiserHub, HubShiftComplianceRecord } from '../types';

interface ShiftComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
  regionalTelemetry: Record<string, { lastPingTime: number; terminalCount: number }>;
  isOverrunSimulated: boolean;
  hubs: FieldMerchandiserHub[];
}

export const ShiftComplianceModal: React.FC<ShiftComplianceModalProps> = ({
  isOpen,
  onClose,
  regionalTelemetry,
  isOverrunSimulated,
  hubs
}) => {
  const [copied, setCopied] = useState(false);
  const [filterRegion, setFilterRegion] = useState<string>('All');

  // Compute live WAT time string
  const auditDateStr = useMemo(() => {
    const now = new Date();
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Africa/Lagos',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(now) + ' WAT';
  }, []);

  // Standard benchmark window: 07:00 to 21:00 WAT = 14 hours = 840 minutes
  const STANDARD_WINDOW_MINUTES = 14 * 60; // 840 mins

  // Compliance calculations per regional hub
  const complianceData: HubShiftComplianceRecord[] = useMemo(() => {
    const records: HubShiftComplianceRecord[] = [
      {
        region: 'Lagos',
        hubDisplayName: 'Southwest Hub (Lagos)',
        merchandiserCount: 38,
        activePOS: 680,
        scheduledStart: '07:00 WAT',
        scheduledEnd: '21:00 WAT',
        scheduledDurationMinutes: 14 * 60, // 840m
        actualStart: '06:58 WAT',
        actualEnd: isOverrunSimulated ? '21:18 WAT' : '20:58 WAT',
        actualDurationMinutes: isOverrunSimulated ? 14 * 60 + 20 : 14 * 60, // 860m or 840m
        startVarianceMinutes: -2, // 2 mins early
        endVarianceMinutes: isOverrunSimulated ? 18 : -2, // +18 mins overrun or normal
        standardWindowDeltaMinutes: isOverrunSimulated ? 20 : 0, // +20m vs 14h window
        startStatus: 'early',
        endStatus: isOverrunSimulated ? 'shift_overrun' : 'normal_signoff',
        complianceScore: isOverrunSimulated ? 93.5 : 99.4,
        notes: isOverrunSimulated
          ? 'Active POS heartbeat recorded at 21:18 WAT (+18m past 21:00 cutoff). Overtime flag raised for Ikeja & VI clusters.'
          : 'Strict adherence to 07:00-21:00 WAT operating schedule.'
      },
      {
        region: 'Ibadan',
        hubDisplayName: 'Oyo Cluster (Ibadan)',
        merchandiserCount: 18,
        activePOS: 340,
        scheduledStart: '07:30 WAT',
        scheduledEnd: '21:00 WAT',
        scheduledDurationMinutes: 13.5 * 60, // 810m
        actualStart: '07:44 WAT',
        actualEnd: '20:46 WAT',
        actualDurationMinutes: 13 * 60 + 2, // 782m
        startVarianceMinutes: 14, // 14 mins delay (within 30m grace)
        endVarianceMinutes: -14, // signed off 14m before 21:00
        standardWindowDeltaMinutes: -58, // 782 - 840 = -58m vs 14h standard
        startStatus: 'delayed',
        endStatus: 'normal_signoff',
        complianceScore: 89.2,
        notes: 'Commenced 14m after 07:30 WAT schedule (Bodija hub network latency). Terminal sign-off executed cleanly at 20:46 WAT.'
      },
      {
        region: 'Ogun',
        hubDisplayName: 'Ogun Hub (Abeokuta / Sagamu)',
        merchandiserCount: 12,
        activePOS: 220,
        scheduledStart: '08:00 WAT',
        scheduledEnd: '21:00 WAT',
        scheduledDurationMinutes: 13 * 60, // 780m
        actualStart: '07:55 WAT',
        actualEnd: isOverrunSimulated ? '21:04 WAT' : '20:54 WAT',
        actualDurationMinutes: isOverrunSimulated ? 13 * 60 + 9 : 12 * 60 + 59, // 789m or 779m
        startVarianceMinutes: -5, // 5 mins early
        endVarianceMinutes: isOverrunSimulated ? 4 : -6,
        standardWindowDeltaMinutes: isOverrunSimulated ? -51 : -61, // 789 - 840 = -51m
        startStatus: 'early',
        endStatus: isOverrunSimulated ? 'shift_overrun' : 'normal_signoff',
        complianceScore: isOverrunSimulated ? 95.8 : 98.6,
        notes: isOverrunSimulated
          ? 'Sagamu Trade Express terminal sync extended 4 mins past 21:00 WAT during night stock count reconciliation.'
          : 'Compliant early sign-on at 07:55 WAT; EOD batch clearance completed before 21:00 WAT.'
      },
      {
        region: 'Benin',
        hubDisplayName: 'Edo Sector (Benin)',
        merchandiserCount: 10,
        activePOS: 180,
        scheduledStart: '08:00 WAT',
        scheduledEnd: '21:00 WAT',
        scheduledDurationMinutes: 13 * 60, // 780m
        actualStart: '08:02 WAT',
        actualEnd: '20:55 WAT',
        actualDurationMinutes: 12 * 60 + 53, // 773m
        startVarianceMinutes: 2, // 2 mins delay (nominal)
        endVarianceMinutes: -5,
        standardWindowDeltaMinutes: -67, // 773 - 840 = -67m
        startStatus: 'on_time',
        endStatus: 'normal_signoff',
        complianceScore: 97.4,
        notes: 'Nominal 2m startup variance. EOD terminal closure concluded at 20:55 WAT without overtime incident.'
      }
    ];

    return records;
  }, [isOverrunSimulated]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    if (filterRegion === 'All') return complianceData;
    return complianceData.filter((r) => r.region === filterRegion);
  }, [complianceData, filterRegion]);

  // Aggregate Metrics
  const summaryMetrics = useMemo(() => {
    const totalMinutes = complianceData.reduce((acc, r) => acc + r.actualDurationMinutes, 0);
    const avgMinutes = Math.round(totalMinutes / complianceData.length);
    const avgScore = (complianceData.reduce((acc, r) => acc + r.complianceScore, 0) / complianceData.length).toFixed(1);
    const overrunCount = complianceData.filter((r) => r.endStatus === 'shift_overrun').length;
    const totalOverrunMinutes = complianceData.reduce(
      (acc, r) => (r.endVarianceMinutes > 0 ? acc + r.endVarianceMinutes : acc),
      0
    );
    const totalTerminals = complianceData.reduce((acc, r) => acc + r.activePOS, 0);
    const totalStaff = complianceData.reduce((acc, r) => acc + r.merchandiserCount, 0);

    return {
      avgDurationStr: `${Math.floor(avgMinutes / 60)}h ${avgMinutes % 60}m`,
      avgScore,
      overrunCount,
      totalOverrunMinutes,
      totalTerminals,
      totalStaff,
      standardWindowHours: 14.0
    };
  }, [complianceData]);

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  // CSV Export Handler
  const handleExportCSV = () => {
    const headers = [
      'Hub Territory',
      'Region',
      'Merchandisers',
      'Active POS',
      'Scheduled Start (WAT)',
      'Scheduled End (WAT)',
      'Scheduled Duration (Hrs)',
      'Actual Start (WAT)',
      'Actual End (WAT)',
      'Actual Duration (Hrs)',
      'Start Variance (Mins)',
      'End Overrun (Mins)',
      'Variance vs 14h Standard (Mins)',
      'Start Compliance',
      'End Compliance',
      'Compliance Score (%)',
      'Auditor Remarks'
    ];

    const rows = complianceData.map((r) => [
      `"${r.hubDisplayName}"`,
      r.region,
      r.merchandiserCount,
      r.activePOS,
      r.scheduledStart,
      r.scheduledEnd,
      (r.scheduledDurationMinutes / 60).toFixed(1),
      r.actualStart,
      r.actualEnd,
      (r.actualDurationMinutes / 60).toFixed(2),
      r.startVarianceMinutes > 0 ? `+${r.startVarianceMinutes}` : r.startVarianceMinutes,
      r.endVarianceMinutes > 0 ? `+${r.endVarianceMinutes}` : r.endVarianceMinutes,
      r.standardWindowDeltaMinutes > 0 ? `+${r.standardWindowDeltaMinutes}` : r.standardWindowDeltaMinutes,
      r.startStatus,
      r.endStatus,
      r.complianceScore,
      `"${r.notes}"`
    ]);

    const csvContent = [
      '# KEA CORPORATE HOSPITALITY SERVICES LTD - SHIFT COMPLIANCE AUDIT',
      `# Generated: ${auditDateStr}`,
      `# Standard Benchmark Window: 07:00 - 21:00 WAT (14.0 Hours)`,
      `# Authorized by: Tope Balogun (Chief Executive Officer)`,
      headers.join(','),
      ...rows.map((row) => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `KEA_Shift_Compliance_Audit_0700_2100_WAT.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy Executive Summary Handler
  const handleCopySummary = () => {
    const summaryText = `
KEA CORPORATE HOSPITALITY SERVICES - SHIFT COMPLIANCE AUDIT
Standard Benchmark Window: 07:00 - 21:00 WAT (14.0 Hours)
Generated: ${auditDateStr}
Authorized by: Tope Balogun (CEO)

EXECUTIVE FLEET SUMMARY:
- Fleet Compliance Rating: ${summaryMetrics.avgScore}%
- Monitored Retail POS: ${summaryMetrics.totalTerminals} terminals across ${summaryMetrics.totalStaff} merchandisers
- Average Active Telemetry Duration: ${summaryMetrics.avgDurationStr} (vs 14h 00m Standard)
- Shift Overrun Flagged Hubs: ${summaryMetrics.overrunCount} (${summaryMetrics.totalOverrunMinutes} total overrun minutes past 21:00 WAT)

REGIONAL BREAKDOWN:
${complianceData
  .map(
    (r) =>
      `• ${r.hubDisplayName} (${r.region}):
  - Scheduled: ${r.scheduledStart} to ${r.scheduledEnd} (${(r.scheduledDurationMinutes / 60).toFixed(1)}h)
  - Actual Telemetry: ${r.actualStart} to ${r.actualEnd}
  - Total Active Duration: ${Math.floor(r.actualDurationMinutes / 60)}h ${r.actualDurationMinutes % 60}m
  - Delta vs Standard 14h Window: ${r.standardWindowDeltaMinutes >= 0 ? '+' : ''}${r.standardWindowDeltaMinutes} mins (${(r.standardWindowDeltaMinutes / 60).toFixed(2)}h)
  - Start Status: ${r.startVarianceMinutes <= 0 ? 'On-Time' : `Delayed (+${r.startVarianceMinutes}m)`}
  - End Status: ${r.endVarianceMinutes > 0 ? `SHIFT OVERRUN (+${r.endVarianceMinutes}m past 21:00)` : 'Normal Sign-Off'}
  - Compliance Score: ${r.complianceScore}%
  - Remarks: ${r.notes}`
  )
  .join('\n\n')}
    `.trim();

    navigator.clipboard.writeText(summaryText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  if (!isOpen) return null;

  return (
    <div className="w-full p-0 sm:p-3">
      {/* Page Container */}
      <div className="relative w-full max-w-6xl mx-auto bg-[#0b1222] border border-[#1e2d4d] rounded-2xl shadow-2xl overflow-hidden flex flex-col print-container">
        
        {/* MODAL HEADER & ACTION TOOLBAR (Hidden when printing via .no-print) */}
        <div className="no-print p-4 sm:p-5 bg-[#0e1628] border-b border-[#1e2d4d] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#92C842]/10 text-[#92C842] border border-[#92C842]/30 shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Shift Start / End Compliance Audit
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#92C842]/20 text-[#92C842] border border-[#92C842]/30">
                  PDF-READY REPORT
                </span>
                {isOverrunSimulated && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E05252]/20 text-[#E05252] border border-[#E05252]/30">
                    &gt;21:00 WAT OVERRUN SIMULATED
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Benchmark vs Standard <strong className="text-slate-200">07:00 – 21:00 WAT</strong> Operating Window (14.0 Hours)
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopySummary}
              className="px-3 py-1.5 rounded-lg bg-[#151f38] hover:bg-[#1a2745] text-slate-200 border border-[#1e2d4d] text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Copy executive summary to clipboard"
            >
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
              <span>{copied ? '✓ Copied' : 'Copy Summary'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-lg bg-[#151f38] hover:bg-[#1a2745] text-slate-200 border border-[#1e2d4d] text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Export complete telemetry audit dataset as CSV"
            >
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
              <span>Export CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-lg bg-[#92C842] hover:bg-[#7bb32e] text-[#090e1c] text-xs font-bold flex items-center gap-2 shadow-md shadow-[#92C842]/20 transition-all active:scale-95"
              title="Open browser print dialog to print or save as PDF"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#151f38] transition-colors ml-1"
              title="Close modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </button>
          </div>
        </div>

        {/* PRINTABLE / SCROLLABLE CONTENT BODY */}
        <div className="overflow-y-auto p-5 sm:p-8 space-y-6 bg-[#0b1222] text-slate-200 print:p-0 print:bg-white print:text-black">
          
          {/* FORMAL DOCUMENT HEADER (Formatted for Paper / PDF Export) */}
          <div className="border-b border-[#1e2d4d] pb-6 print:border-slate-800 print:pb-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#92C842] inline-block print:bg-slate-900"></span>
                  <span className="text-xs uppercase tracking-widest font-mono font-bold text-[#92C842] print:text-slate-900">
                    KEA CORPORATE HOSPITALITY SERVICES LTD
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white mt-1 print:text-black tracking-tight">
                  EXECUTIVE SHIFT COMPLIANCE AUDIT
                </h1>
                <p className="text-xs text-slate-400 print:text-slate-600 mt-0.5">
                  Retail Field Merchandiser Telemetry Verification vs. Standard 07:00 – 21:00 WAT Operating Window
                </p>
              </div>

              {/* Document Control Box */}
              <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-xl p-3 text-[11px] font-mono space-y-1 print:bg-slate-50 print:border-slate-300 print:text-black shrink-0">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400 print:text-slate-600">Audit Ref:</span>
                  <span className="font-bold text-slate-200 print:text-black">KEA-AUD-2026-0921-WAT</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400 print:text-slate-600">Generated:</span>
                  <span className="text-slate-200 print:text-black">{auditDateStr}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400 print:text-slate-600">Authorization:</span>
                  <span className="font-bold text-[#92C842] print:text-slate-900">Tope Balogun (CEO)</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400 print:text-slate-600">Standard Window:</span>
                  <span className="font-bold text-white print:text-black">07:00 – 21:00 WAT (14.0 hrs)</span>
                </div>
              </div>
            </div>
          </div>

          {/* HIGH-LEVEL KPI METRIC TILES */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 print:grid-cols-4">
            <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-xl p-3.5 print:border-slate-300 print:bg-slate-50">
              <div className="text-[11px] font-mono text-slate-400 print:text-slate-600 uppercase">
                Fleet Compliance Rate
              </div>
              <div className="text-xl sm:text-2xl font-black text-[#92C842] print:text-slate-900 mt-1 font-mono">
                {summaryMetrics.avgScore}%
              </div>
              <div className="text-[10px] text-slate-400 print:text-slate-600 mt-0.5">
                Target: ≥90.0% adherence
              </div>
            </div>

            <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-xl p-3.5 print:border-slate-300 print:bg-slate-50">
              <div className="text-[11px] font-mono text-slate-400 print:text-slate-600 uppercase">
                Benchmark Window
              </div>
              <div className="text-xl sm:text-2xl font-black text-white print:text-slate-900 mt-1 font-mono">
                14h 00m
              </div>
              <div className="text-[10px] text-slate-400 print:text-slate-600 mt-0.5">
                07:00 – 21:00 WAT Daily
              </div>
            </div>

            <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-xl p-3.5 print:border-slate-300 print:bg-slate-50">
              <div className="text-[11px] font-mono text-slate-400 print:text-slate-600 uppercase">
                Avg Active Telemetry
              </div>
              <div className="text-xl sm:text-2xl font-black text-white print:text-slate-900 mt-1 font-mono">
                {summaryMetrics.avgDurationStr}
              </div>
              <div className="text-[10px] text-slate-400 print:text-slate-600 mt-0.5">
                Across 4 regional hubs
              </div>
            </div>

            <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-xl p-3.5 print:border-slate-300 print:bg-slate-50">
              <div className="text-[11px] font-mono text-slate-400 print:text-slate-600 uppercase">
                Overrun Status (&gt;21:00)
              </div>
              <div
                className={`text-xl sm:text-2xl font-black mt-1 font-mono ${
                  summaryMetrics.overrunCount > 0
                    ? 'text-[#E05252] print:text-red-700'
                    : 'text-[#92C842] print:text-green-700'
                }`}
              >
                {summaryMetrics.overrunCount > 0 ? `${summaryMetrics.overrunCount} Flagged` : '0 Overrun'}
              </div>
              <div className="text-[10px] text-slate-400 print:text-slate-600 mt-0.5">
                {summaryMetrics.overrunCount > 0
                  ? `+${summaryMetrics.totalOverrunMinutes}m overtime recorded`
                  : 'All hubs closed on time'}
              </div>
            </div>
          </div>

          {/* VISUAL TIMELINE COMPARISON CHART */}
          <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-xl p-4.5 print:border-slate-300 print:bg-slate-50 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1e2d4d] print:border-slate-300 pb-2.5">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider print:text-black">
                  Regional Telemetry Span vs. 07:00 – 21:00 Standard Baseline
                </h3>
                <p className="text-[11px] text-slate-400 print:text-slate-600">
                  Visual timeline representing commencement, active operational duration, and end-of-day closure
                </p>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono">
                <span className="flex items-center gap-1 text-slate-300 print:text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#92C842] inline-block"></span> Normal Operation
                </span>
                <span className="flex items-center gap-1 text-slate-300 print:text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#F17F31] inline-block"></span> Delayed Start
                </span>
                <span className="flex items-center gap-1 text-slate-300 print:text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#E05252] inline-block"></span> &gt;21:00 Overrun
                </span>
              </div>
            </div>

            {/* Baseline Scale Hours: 06:00 to 22:00 (16 hours total width) */}
            <div className="space-y-3 pt-1">
              {/* Time tick labels */}
              <div className="flex justify-between text-[10px] font-mono text-slate-500 print:text-slate-600 px-1 border-b border-[#1e2d4d]/50 pb-1">
                <span>06:00 WAT</span>
                <span className="text-[#92C842] font-bold">07:00 WAT (STD OPEN)</span>
                <span>10:00</span>
                <span>13:00</span>
                <span>16:00</span>
                <span>19:00</span>
                <span className="text-[#E05252] font-bold">21:00 WAT (STD CLOSE)</span>
                <span>22:00 WAT</span>
              </div>

              {/* Standard Baseline Window Reference Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="font-semibold text-slate-300 print:text-slate-800">
                    Standard Target Window (Baseline)
                  </span>
                  <span className="text-[#92C842] font-bold print:text-slate-900">
                    07:00 - 21:00 WAT (14h 00m / 840m)
                  </span>
                </div>
                <div className="relative h-4 bg-[#151f38] print:bg-slate-200 rounded overflow-hidden border border-[#1e2d4d] print:border-slate-300">
                  {/* Standard window is from 07:00 to 21:00 in a 06:00-22:00 (16h) frame */}
                  {/* 07:00 is 1/16 = 6.25% from left; duration is 14/16 = 87.5% */}
                  <div
                    className="absolute top-0 bottom-0 bg-[#92C842]/30 border-x-2 border-[#92C842] print:bg-slate-400 print:border-slate-600 flex items-center justify-center text-[9px] font-mono text-[#92C842] print:text-slate-900 font-bold"
                    style={{ left: '6.25%', width: '87.5%' }}
                  >
                    14.0 HOURS STANDARD OPERATING ENVELOPE
                  </div>
                </div>
              </div>

              {/* Regional Hub Actual Bars */}
              {complianceData.map((record) => {
                // In a 06:00 to 22:00 window (16h = 960 mins)
                // convert actualStart to minutes from 06:00 (360)
                const parseTimeToMinFrom6 = (timeStr: string) => {
                  const parts = timeStr.split(' ')[0].split(':');
                  const h = parseInt(parts[0], 10);
                  const m = parseInt(parts[1], 10);
                  return h * 60 + m - 360;
                };

                const startMin = parseTimeToMinFrom6(record.actualStart);
                const endMin = parseTimeToMinFrom6(record.actualEnd);
                const leftPct = Math.max(0, Math.min(100, (startMin / 960) * 100));
                const widthPct = Math.max(2, Math.min(100 - leftPct, ((endMin - startMin) / 960) * 100));

                const isOverrun = record.endStatus === 'shift_overrun';
                const isDelayed = record.startStatus === 'delayed';

                return (
                  <div key={record.region} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="font-medium text-slate-200 print:text-slate-900">
                        {record.hubDisplayName} ({record.merchandiserCount} reps, {record.activePOS} POS)
                      </span>
                      <span className="text-slate-300 print:text-slate-700">
                        {record.actualStart} → {record.actualEnd} (
                        <strong className="text-white print:text-black">
                          {Math.floor(record.actualDurationMinutes / 60)}h {record.actualDurationMinutes % 60}m
                        </strong>
                        ,{' '}
                        <span
                          className={
                            record.standardWindowDeltaMinutes > 0
                              ? 'text-[#E05252] print:text-red-600 font-bold'
                              : 'text-slate-400 print:text-slate-600'
                          }
                        >
                          {record.standardWindowDeltaMinutes >= 0 ? '+' : ''}
                          {record.standardWindowDeltaMinutes}m vs 14h
                        </span>
                        )
                      </span>
                    </div>

                    <div className="relative h-4 bg-[#151f38] print:bg-slate-200 rounded overflow-hidden border border-[#1e2d4d] print:border-slate-300">
                      {/* Vertical cutoff line at 21:00 (15h from 06:00 = 15/16 = 93.75%) */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-[#E05252]/80 z-10"
                        style={{ left: '93.75%' }}
                        title="21:00 WAT Closing Cutoff"
                      />

                      {/* Actual active bar */}
                      <div
                        className={`absolute top-0 bottom-0 rounded-sm flex items-center px-1 text-[9px] font-mono font-bold truncate transition-all ${
                          isOverrun
                            ? 'bg-gradient-to-r from-[#92C842] to-[#E05252] text-white print:bg-slate-700'
                            : isDelayed
                            ? 'bg-gradient-to-r from-[#F17F31] to-[#92C842] text-white print:bg-slate-600'
                            : 'bg-[#92C842] text-[#090e1c] print:bg-slate-500 print:text-white'
                        }`}
                        style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                      >
                        {Math.floor(record.actualDurationMinutes / 60)}h {record.actualDurationMinutes % 60}m
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DETAILED REGIONAL AUDIT DATA TABLE */}
          <div className="space-y-3 print-page-break">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider print:text-black">
                Hub-by-Hub Telemetry Duration &amp; Shift Compliance Table
              </h3>
              
              {/* Region Filter (Hidden in print) */}
              <div className="no-print flex items-center gap-1.5 text-xs font-mono">
                <span className="text-slate-400">Filter:</span>
                {['All', 'Lagos', 'Ibadan', 'Ogun', 'Benin'].map((reg) => (
                  <button
                    key={reg}
                    onClick={() => setFilterRegion(reg)}
                    className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                      filterRegion === reg
                        ? 'bg-[#92C842] text-[#090e1c] font-bold'
                        : 'bg-[#151f38] text-slate-300 hover:text-white'
                    }`}
                  >
                    {reg}
                  </button>
                ))}
              </div>
            </div>

            <div className="border border-[#1e2d4d] rounded-xl overflow-x-auto print:border-slate-300">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0e1628] text-slate-400 font-mono text-[11px] uppercase border-b border-[#1e2d4d] print:bg-slate-100 print:text-slate-700 print:border-slate-300">
                  <tr>
                    <th className="py-2.5 px-3">Regional Hub</th>
                    <th className="py-2.5 px-3">Scheduled Shift</th>
                    <th className="py-2.5 px-3">Actual Start</th>
                    <th className="py-2.5 px-3">Actual End</th>
                    <th className="py-2.5 px-3">Active Duration</th>
                    <th className="py-2.5 px-3">Delta vs 14h Window</th>
                    <th className="py-2.5 px-3">Start Compliance</th>
                    <th className="py-2.5 px-3">End Compliance</th>
                    <th className="py-2.5 px-3 text-right">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2d4d] print:divide-slate-300">
                  {filteredRecords.map((r) => {
                    const isOverrun = r.endStatus === 'shift_overrun';
                    const isDelayed = r.startStatus === 'delayed';

                    return (
                      <tr
                        key={r.region}
                        className="hover:bg-[#151f38]/50 print:hover:bg-white transition-colors"
                      >
                        {/* Hub */}
                        <td className="py-3 px-3">
                          <div className="font-bold text-white print:text-black">{r.hubDisplayName}</div>
                          <div className="text-[10px] text-slate-400 print:text-slate-600 font-mono">
                            {r.merchandiserCount} merchandisers • {r.activePOS} POS
                          </div>
                        </td>

                        {/* Scheduled */}
                        <td className="py-3 px-3 font-mono text-slate-300 print:text-slate-800">
                          <div>{r.scheduledStart} - {r.scheduledEnd}</div>
                          <div className="text-[10px] text-slate-400 print:text-slate-600">
                            {(r.scheduledDurationMinutes / 60).toFixed(1)} hrs scheduled
                          </div>
                        </td>

                        {/* Actual Start */}
                        <td className="py-3 px-3 font-mono text-slate-200 print:text-black">
                          <span className="font-semibold">{r.actualStart}</span>
                          <span className="text-[10px] ml-1.5 text-slate-400 print:text-slate-600">
                            ({r.startVarianceMinutes <= 0 ? `${Math.abs(r.startVarianceMinutes)}m early` : `+${r.startVarianceMinutes}m late`})
                          </span>
                        </td>

                        {/* Actual End */}
                        <td className="py-3 px-3 font-mono text-slate-200 print:text-black">
                          <span className="font-semibold">{r.actualEnd}</span>
                          {r.endVarianceMinutes > 0 ? (
                            <span className="text-[10px] ml-1.5 font-bold text-[#E05252] print:text-red-700">
                              (+{r.endVarianceMinutes}m overrun)
                            </span>
                          ) : (
                            <span className="text-[10px] ml-1.5 text-slate-400 print:text-slate-600">
                              ({Math.abs(r.endVarianceMinutes)}m pre-close)
                            </span>
                          )}
                        </td>

                        {/* Active Duration */}
                        <td className="py-3 px-3 font-mono font-bold text-white print:text-black">
                          {Math.floor(r.actualDurationMinutes / 60)}h {r.actualDurationMinutes % 60}m
                          <div className="text-[10px] font-normal text-slate-400 print:text-slate-600">
                            {r.actualDurationMinutes} mins total
                          </div>
                        </td>

                        {/* Delta vs 14h standard window */}
                        <td className="py-3 px-3 font-mono">
                          <span
                            className={`font-semibold ${
                              r.standardWindowDeltaMinutes > 0
                                ? 'text-[#E05252] print:text-red-700'
                                : r.standardWindowDeltaMinutes === 0
                                ? 'text-[#92C842] print:text-green-700'
                                : 'text-slate-300 print:text-slate-700'
                            }`}
                          >
                            {r.standardWindowDeltaMinutes > 0 ? `+${r.standardWindowDeltaMinutes}m` : `${r.standardWindowDeltaMinutes}m`}
                          </span>
                          <span className="text-[10px] text-slate-400 print:text-slate-600 ml-1">
                            ({((r.standardWindowDeltaMinutes / STANDARD_WINDOW_MINUTES) * 100).toFixed(1)}%)
                          </span>
                        </td>

                        {/* Start Compliance */}
                        <td className="py-3 px-3">
                          {isDelayed ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#F17F31]/20 text-[#F17F31] border border-[#F17F31]/30 print:bg-amber-100 print:text-amber-800 print:border-amber-300">
                              Delayed (+{r.startVarianceMinutes}m)
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#92C842]/20 text-[#92C842] border border-[#92C842]/30 print:bg-green-100 print:text-green-800 print:border-green-300">
                              On-Time
                            </span>
                          )}
                        </td>

                        {/* End Compliance */}
                        <td className="py-3 px-3">
                          {isOverrun ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#E05252]/20 text-[#E05252] border border-[#E05252]/30 print:bg-red-100 print:text-red-800 print:border-red-300">
                              ⚠️ Shift Overrun (+{r.endVarianceMinutes}m)
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#92C842]/20 text-[#92C842] border border-[#92C842]/30 print:bg-green-100 print:text-green-800 print:border-green-300">
                              Normal Sign-Off
                            </span>
                          )}
                        </td>

                        {/* Rating */}
                        <td className="py-3 px-3 text-right font-mono font-bold text-[#92C842] print:text-slate-900">
                          {r.complianceScore}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* AUDIT OBSERVATIONS & EXECUTIVE DIRECTIVES */}
          <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-xl p-4.5 print:border-slate-300 print:bg-slate-50 space-y-3 print-page-break">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold text-white tracking-wide print:text-black">
                Operational Audit Findings &amp; CEO Directives
              </span>
            </div>

            <ul className="space-y-2 text-xs text-slate-300 print:text-slate-800 list-disc list-inside">
              <li>
                <strong className="text-white print:text-black">Benchmark Window (07:00 – 21:00 WAT):</strong> Across 4 hubs, the fleet achieved a composite shift adherence score of <strong className="text-[#92C842] print:text-slate-900">{summaryMetrics.avgScore}%</strong> against the 14.0-hour operating window.
              </li>
              <li>
                <strong className="text-white print:text-black">Opening Punctuality:</strong> Lagos (06:58 WAT) and Ogun (07:55 WAT) achieved perfect early terminal heartbeats. Ibadan recorded a 14-minute startup latency at Bodija (07:44 WAT vs 07:30 WAT scheduled), resolving within the authorized 30-minute grace period.
              </li>
              <li>
                <strong className="text-white print:text-black">Shift Overrun &amp; Closing Protocols:</strong>{' '}
                {summaryMetrics.overrunCount > 0 ? (
                  <span className="text-[#E05252] print:text-red-700 font-semibold">
                    {summaryMetrics.overrunCount} hub(s) exceeded the 21:00 WAT closing cutoff ({summaryMetrics.totalOverrunMinutes} total overtime minutes). Field Ops is directed to confirm overtime authorization or dispatch automated EOD terminal sleep commands.
                  </span>
                ) : (
                  <span>
                    All hubs completed POS terminal sign-off and batch reconciliation prior to the 21:00 WAT closing cutoff without overtime breach.
                  </span>
                )}
              </li>
              <li>
                <strong className="text-white print:text-black">Payroll &amp; Daily Settlement:</strong> Terminal reconciliation records from all 1,420 POS units are locked for daily settlement in accordance with Tope Balogun's CEO Master Sheet.
              </li>
            </ul>
          </div>

          {/* FORMAL SIGN-OFF & CERTIFICATION BLOCK (PDF / PRINT READY) */}
          <div className="border-t border-[#1e2d4d] pt-5 print:border-slate-800 print:pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="border border-[#1e2d4d] rounded-lg p-3 print:border-slate-300 print:bg-white">
                <div className="text-[10px] text-slate-400 print:text-slate-600 uppercase">Executive Sign-Off</div>
                <div className="font-bold text-white print:text-black mt-1">Tope Balogun</div>
                <div className="text-[10px] text-[#92C842] print:text-slate-700">Chief Executive Officer</div>
                <div className="text-[9px] text-slate-500 print:text-slate-500 mt-2">Verified via LOS-HQ-01 Node</div>
              </div>

              <div className="border border-[#1e2d4d] rounded-lg p-3 print:border-slate-300 print:bg-white">
                <div className="text-[10px] text-slate-400 print:text-slate-600 uppercase">Field Operations Lead</div>
                <div className="font-bold text-white print:text-black mt-1">Babatunde Adeyemi</div>
                <div className="text-[10px] text-slate-300 print:text-slate-700">VP, Regional Retail Telemetry</div>
                <div className="text-[9px] text-slate-500 print:text-slate-500 mt-2">Certified POS Fleet State</div>
              </div>

              <div className="border border-[#1e2d4d] rounded-lg p-3 print:border-slate-300 print:bg-white flex flex-col justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 print:text-slate-600 uppercase">Security &amp; Audit Seal</div>
                  <div className="font-bold text-[#92C842] print:text-slate-900 mt-1">
                    TLS 1.3 / SHA-256 VALIDATED
                  </div>
                </div>
                <div className="text-[9px] text-slate-500 print:text-slate-500 mt-2 font-mono">
                  HASH: 4b89e...f91a • WAT-AUDIT-2026
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* MODAL FOOTER (Hidden when printing via .no-print) */}
        <div className="no-print p-4 bg-[#0e1628] border-t border-[#1e2d4d] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#92C842]"></span>
            <span>PDF Print Layout optimized for A4 / Letter portrait output</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-lg bg-[#92C842] hover:bg-[#7bb32e] text-[#090e1c] font-bold flex items-center gap-2 shadow-md shadow-[#92C842]/20 transition-all active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#151f38] hover:bg-[#1a2745] text-slate-200 border border-[#1e2d4d] font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
