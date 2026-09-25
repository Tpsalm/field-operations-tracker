import React, { useState, useMemo } from 'react';
import { FieldMerchandiserHub, HubShiftComplianceRecord } from '../types';
import { FileText, Download, Printer, Copy, Check, X, ShieldCheck, AlertTriangle } from 'lucide-react';

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
        scheduledDurationMinutes: 14 * 60,
        actualStart: '06:58 WAT',
        actualEnd: isOverrunSimulated ? '21:18 WAT' : '20:58 WAT',
        actualDurationMinutes: isOverrunSimulated ? 14 * 60 + 20 : 14 * 60,
        startVarianceMinutes: -2,
        endVarianceMinutes: isOverrunSimulated ? 18 : -2,
        standardWindowDeltaMinutes: isOverrunSimulated ? 20 : 0,
        startStatus: 'early',
        endStatus: isOverrunSimulated ? 'shift_overrun' : 'normal_signoff',
        complianceScore: isOverrunSimulated ? 93.5 : 99.4,
        notes: isOverrunSimulated
          ? 'Card machine recorded activity at 21:18 WAT (+18m past 21:00 cutoff). Overtime flag raised for Ikeja & VI stores.'
          : 'Strict adherence to 07:00-21:00 WAT operating schedule.'
      },
      {
        region: 'Ibadan',
        hubDisplayName: 'Oyo Cluster (Ibadan)',
        merchandiserCount: 18,
        activePOS: 340,
        scheduledStart: '07:30 WAT',
        scheduledEnd: '21:00 WAT',
        scheduledDurationMinutes: 13.5 * 60,
        actualStart: '07:44 WAT',
        actualEnd: '20:46 WAT',
        actualDurationMinutes: 13 * 60 + 2,
        startVarianceMinutes: 14,
        endVarianceMinutes: -14,
        standardWindowDeltaMinutes: -58,
        startStatus: 'delayed',
        endStatus: 'normal_signoff',
        complianceScore: 89.2,
        notes: 'Commenced 14m after 07:30 WAT schedule. Machine sign-off executed cleanly at 20:46 WAT.'
      },
      {
        region: 'Ogun',
        hubDisplayName: 'Ogun Hub (Abeokuta / Sagamu)',
        merchandiserCount: 12,
        activePOS: 220,
        scheduledStart: '08:00 WAT',
        scheduledEnd: '21:00 WAT',
        scheduledDurationMinutes: 13 * 60,
        actualStart: '07:55 WAT',
        actualEnd: isOverrunSimulated ? '21:04 WAT' : '20:54 WAT',
        actualDurationMinutes: isOverrunSimulated ? 13 * 60 + 9 : 12 * 60 + 59,
        startVarianceMinutes: -5,
        endVarianceMinutes: isOverrunSimulated ? 4 : -6,
        standardWindowDeltaMinutes: isOverrunSimulated ? -51 : -61,
        startStatus: 'early',
        endStatus: isOverrunSimulated ? 'shift_overrun' : 'normal_signoff',
        complianceScore: isOverrunSimulated ? 95.8 : 98.6,
        notes: isOverrunSimulated
          ? 'Late machine signal at 21:04 WAT (+4m). Sagamu corridor flagged.'
          : 'Normal sign-off logged at 20:54 WAT.'
      },
      {
        region: 'Benin',
        hubDisplayName: 'Edo Sector (Benin City)',
        merchandiserCount: 10,
        activePOS: 180,
        scheduledStart: '08:00 WAT',
        scheduledEnd: '21:00 WAT',
        scheduledDurationMinutes: 13 * 60,
        actualStart: '07:57 WAT',
        actualEnd: '20:51 WAT',
        actualDurationMinutes: 12 * 60 + 54,
        startVarianceMinutes: -3,
        endVarianceMinutes: -9,
        standardWindowDeltaMinutes: -66,
        startStatus: 'early',
        endStatus: 'normal_signoff',
        complianceScore: 97.9,
        notes: 'Sapele Road retail stores compliant. Sign-off recorded at 20:51 WAT.'
      }
    ];

    return records;
  }, [isOverrunSimulated]);

  const filteredRecords = useMemo(() => {
    if (filterRegion === 'All') return complianceData;
    return complianceData.filter((r) => r.region === filterRegion);
  }, [complianceData, filterRegion]);

  const summaryMetrics = useMemo(() => {
    const totalDuration = complianceData.reduce((acc, r) => acc + r.actualDurationMinutes, 0);
    const avgDuration = Math.round(totalDuration / complianceData.length);
    const avgScore = (
      complianceData.reduce((acc, r) => acc + r.complianceScore, 0) / complianceData.length
    ).toFixed(1);
    const overrunCount = complianceData.filter((r) => r.endStatus === 'shift_overrun').length;
    const totalOverrunMinutes = complianceData
      .filter((r) => r.endVarianceMinutes > 0)
      .reduce((acc, r) => acc + r.endVarianceMinutes, 0);

    return {
      avgDurationStr: `${Math.floor(avgDuration / 60)}h ${avgDuration % 60}m`,
      avgScore,
      overrunCount,
      totalOverrunMinutes
    };
  }, [complianceData]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = [
      'Hub',
      'Display Name',
      'Merchandisers',
      'Active POS',
      'Scheduled Shift',
      'Actual Start',
      'Actual End',
      'Actual Duration (Mins)',
      'Start Variance (Mins)',
      'End Variance (Mins)',
      '14h Window Delta (Mins)',
      'Start Status',
      'End Status',
      'Compliance Score (%)',
      'Auditor Remarks'
    ];

    const rows = complianceData.map((r) => [
      r.region,
      `"${r.hubDisplayName}"`,
      r.merchandiserCount,
      r.activePOS,
      `"${r.scheduledStart} - ${r.scheduledEnd}"`,
      r.actualStart,
      r.actualEnd,
      r.actualDurationMinutes,
      r.startVarianceMinutes,
      r.endVarianceMinutes,
      r.standardWindowDeltaMinutes,
      r.startStatus,
      r.endStatus,
      r.complianceScore,
      `"${r.notes.replace(/"/g, '""')}"`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `KEA_Shift_Compliance_Report_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopySummary = () => {
    const summaryText = `
=== KEA SHIFT COMPLIANCE REPORT ===
Audit Timestamp: ${auditDateStr}
Standard Window: 07:00 - 21:00 WAT (14.0 Hours)
Fleet Compliance: ${summaryMetrics.avgScore}%
Overruns (>21:00 WAT): ${summaryMetrics.overrunCount} hub(s) (+${summaryMetrics.totalOverrunMinutes} mins)

${complianceData
  .map(
    (r) =>
      `• ${r.hubDisplayName}:
  - Logged Shift: ${r.actualStart} to ${r.actualEnd} (${Math.floor(r.actualDurationMinutes / 60)}h ${r.actualDurationMinutes % 60}m)
  - Status: ${r.endStatus.toUpperCase()} (${r.complianceScore}%)
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      {/* Modal Container */}
      <div className="relative w-full max-w-5xl bg-white border border-slate-200 rounded-[16px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] print-container">
        {/* MODAL HEADER & ACTION TOOLBAR */}
        <div className="no-print p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-wide">
                  Daily Shift Attendance &amp; Closing Report
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  PRINT-READY REPORT
                </span>
                {isOverrunSimulated && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    &gt;21:00 WAT OVERRUN REPORTED
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Standard Working Schedule: <strong className="text-slate-800">07:00 – 21:00 WAT</strong> (14.0 Hours Max)
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopySummary}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Copy summary text"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'Copied' : 'Copy Summary'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Export CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-xl bg-[#10b981] hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95"
              title="Print or save as PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-1"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE CONTENT BODY */}
        <div className="overflow-y-auto p-5 sm:p-8 space-y-6 bg-white text-slate-800 print:p-0 print:bg-white print:text-black">
          {/* DOCUMENT HEADER */}
          <div className="border-b border-slate-200 pb-6 print:pb-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block"></span>
                  <span className="text-xs uppercase tracking-widest font-mono font-bold text-emerald-700">
                    KEA GROUP RETAIL OPERATIONS
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
                  DAILY SHIFT ATTENDANCE AUDIT
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Retail Field Staff &amp; Machine Telemetry Verification vs. Standard 07:00 – 21:00 WAT Operating Window
                </p>
              </div>

              {/* Document Control Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] font-mono space-y-1 shrink-0">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Audit Ref:</span>
                  <span className="font-bold text-slate-800">KEA-AUD-2026-WAT</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Generated:</span>
                  <span className="text-slate-800">{auditDateStr}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Standard Window:</span>
                  <span className="font-bold text-slate-900">07:00 – 21:00 WAT</span>
                </div>
              </div>
            </div>
          </div>

          {/* HIGH-LEVEL KPI METRIC TILES */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <div className="text-[11px] font-mono text-slate-500 uppercase">
                Compliance Rate
              </div>
              <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-1 font-mono">
                {summaryMetrics.avgScore}%
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Target: ≥90.0% adherence
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <div className="text-[11px] font-mono text-slate-500 uppercase">
                Target Schedule
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1 font-mono">
                14h 00m
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                07:00 – 21:00 WAT Daily
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <div className="text-[11px] font-mono text-slate-500 uppercase">
                Avg Logged Hours
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1 font-mono">
                {summaryMetrics.avgDurationStr}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Across 4 branch hubs
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <div className="text-[11px] font-mono text-slate-500 uppercase">
                Late Closing (&gt;21:00)
              </div>
              <div
                className={`text-xl sm:text-2xl font-black mt-1 font-mono ${
                  summaryMetrics.overrunCount > 0 ? 'text-rose-600' : 'text-emerald-600'
                }`}
              >
                {summaryMetrics.overrunCount > 0 ? `${summaryMetrics.overrunCount} Hubs` : '0 Overrun'}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {summaryMetrics.overrunCount > 0
                  ? `+${summaryMetrics.totalOverrunMinutes}m overtime logged`
                  : 'All branches closed on time'}
              </div>
            </div>
          </div>

          {/* DETAILED REGIONAL AUDIT DATA TABLE */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Branch-by-Branch Shift Compliance Table
              </h3>

              <div className="no-print flex items-center gap-1.5 text-xs font-mono">
                <span className="text-slate-500 font-bold">Filter:</span>
                {['All', 'Lagos', 'Ibadan', 'Ogun', 'Benin'].map((reg) => (
                  <button
                    key={reg}
                    onClick={() => setFilterRegion(reg)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                      filterRegion === reg
                        ? 'bg-[#10b981] text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {reg}
                  </button>
                ))}
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 font-mono text-[11px] uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Branch Hub</th>
                    <th className="py-2.5 px-3">Scheduled Shift</th>
                    <th className="py-2.5 px-3">Actual Start</th>
                    <th className="py-2.5 px-3">Actual End</th>
                    <th className="py-2.5 px-3">Hours Logged</th>
                    <th className="py-2.5 px-3">Delta vs 14h</th>
                    <th className="py-2.5 px-3">Start Status</th>
                    <th className="py-2.5 px-3">Closing Status</th>
                    <th className="py-2.5 px-3 text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.map((r) => {
                    const isOverrun = r.endStatus === 'shift_overrun';
                    const isDelayed = r.startStatus === 'delayed';

                    return (
                      <tr key={r.region} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{r.hubDisplayName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {r.merchandiserCount} staff • {r.activePOS} machines
                          </div>
                        </td>

                        <td className="py-3 px-3 font-mono text-slate-700">
                          <div>{r.scheduledStart} - {r.scheduledEnd}</div>
                          <div className="text-[10px] text-slate-400">
                            {(r.scheduledDurationMinutes / 60).toFixed(1)} hrs scheduled
                          </div>
                        </td>

                        <td className="py-3 px-3 font-mono text-slate-900">
                          <span className="font-semibold">{r.actualStart}</span>
                          <span className="text-[10px] ml-1.5 text-slate-500">
                            ({r.startVarianceMinutes <= 0 ? `${Math.abs(r.startVarianceMinutes)}m early` : `+${r.startVarianceMinutes}m late`})
                          </span>
                        </td>

                        <td className="py-3 px-3 font-mono text-slate-900">
                          <span className="font-semibold">{r.actualEnd}</span>
                          {r.endVarianceMinutes > 0 ? (
                            <span className="text-[10px] ml-1.5 font-bold text-rose-600">
                              (+{r.endVarianceMinutes}m overrun)
                            </span>
                          ) : (
                            <span className="text-[10px] ml-1.5 text-slate-500">
                              ({Math.abs(r.endVarianceMinutes)}m pre-close)
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 font-mono font-bold text-slate-900">
                          {Math.floor(r.actualDurationMinutes / 60)}h {r.actualDurationMinutes % 60}m
                        </td>

                        <td className="py-3 px-3 font-mono">
                          <span
                            className={`font-semibold ${
                              r.standardWindowDeltaMinutes > 0
                                ? 'text-rose-600'
                                : r.standardWindowDeltaMinutes === 0
                                ? 'text-emerald-600'
                                : 'text-slate-600'
                            }`}
                          >
                            {r.standardWindowDeltaMinutes > 0 ? `+${r.standardWindowDeltaMinutes}m` : `${r.standardWindowDeltaMinutes}m`}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          {isDelayed ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              Delayed (+{r.startVarianceMinutes}m)
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              On-Time
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          {isOverrun ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              Overrun (+{r.endVarianceMinutes}m)
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Normal Sign-Off
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                          {r.complianceScore}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="no-print p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>PDF Print Layout optimized for A4 portrait printing</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-[#10b981] hover:bg-emerald-600 text-white font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
