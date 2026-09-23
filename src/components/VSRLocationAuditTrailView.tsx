import React, { useEffect, useMemo, useState } from 'react';
import { MapPin, Clock3, ShieldCheck, AlertTriangle } from 'lucide-react';
import { fetchVSRSessionLogs, VSRSessionLog } from '../lib/supabaseData';

const formatSignedIn = (value?: string | null) => {
  if (!value) return 'Not captured';

  try {
    return new Date(value).toLocaleString('en-NG', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  } catch {
    return value;
  }
};

export const VSRLocationAuditTrailView: React.FC = () => {
  const [rows, setRows] = useState<VSRSessionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activePreset, setActivePreset] = useState<'all' | 'today' | '7d' | '30d'>('all');

  useEffect(() => {
    let active = true;

    const loadLogs = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchVSRSessionLogs(100);
        if (active) {
          setRows(data);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load VSR audit trail.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadLogs();

    return () => {
      active = false;
    };
  }, []);

  const applyPresetRange = (preset: 'all' | 'today' | '7d' | '30d') => {
    const now = new Date();
    const start = new Date(now);
    const end = new Date(now);

    if (preset === 'today') {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (preset === '7d') {
      start.setDate(now.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (preset === '30d') {
      start.setDate(now.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else {
      setStartDate('');
      setEndDate('');
      setActivePreset('all');
      return;
    }

    setActivePreset(preset);
    setStartDate(start.toISOString().slice(0, 10));
    setEndDate(end.toISOString().slice(0, 10));
  };

  const filteredRows = useMemo(() => {
    if (!startDate && !endDate) return rows;

    return rows.filter((row) => {
      const signedIn = row.signed_in_at ? new Date(row.signed_in_at) : null;
      if (!signedIn || Number.isNaN(signedIn.getTime())) return false;

      const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
      const end = endDate ? new Date(`${endDate}T23:59:59`) : null;

      if (start && signedIn < start) return false;
      if (end && signedIn > end) return false;
      return true;
    });
  }, [rows, startDate, endDate]);

  const summary = useMemo(() => {
    const total = filteredRows.length;
    const regions = new Set(filteredRows.map((row) => row.region || 'Unspecified')).size;
    const latest = filteredRows[0];

    return {
      total,
      regions,
      latest: latest ? `${latest.name || latest.email} • ${latest.city || latest.region || 'Unknown'} ` : 'No VSR sign-ins yet'
    };
  }, [filteredRows]);

  return (
    <div className="min-h-[70vh] rounded-2xl border border-[#1e2d4d] bg-[#0b1222] p-3 md:p-5">
      <div className="mb-4 flex flex-col gap-3 border-b border-[#1e2d4d] pb-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-[#92C842]">Super Admin</div>
          <h1 className="mt-2 text-2xl font-bold text-white">VSR Location Audit Trail</h1>
          <p className="mt-1 text-sm text-slate-400">
            Live geolocation and sign-in records captured when each VSR accepts their location before entering the VSR platform.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <div className="rounded-xl border border-[#1e2d4d] bg-[#0e1628] px-3 py-2">
            <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Sessions</div>
            <div className="mt-1 text-lg font-bold text-white">{summary.total}</div>
          </div>
          <div className="rounded-xl border border-[#1e2d4d] bg-[#0e1628] px-3 py-2">
            <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Regions</div>
            <div className="mt-1 text-lg font-bold text-white">{summary.regions}</div>
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-[#1e2d4d] bg-[#0e1628] p-3">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: 'all', label: 'All time' },
            { key: 'today', label: 'Today' },
            { key: '7d', label: '7 days' },
            { key: '30d', label: '30 days' }
          ].map((preset) => {
            const isActive = activePreset === preset.key;

            return (
              <button
                key={preset.key}
                type="button"
                onClick={() => {
                  if (preset.key === 'all') {
                    setActivePreset('all');
                    setStartDate('');
                    setEndDate('');
                    return;
                  }
                  applyPresetRange(preset.key as 'today' | '7d' | '30d');
                }}
                className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition ${
                  isActive
                    ? 'border-[#92C842]/60 bg-[#92C842] text-[#090e1c]'
                    : 'border-[#1e2d4d] bg-[#0b1222] text-slate-300 hover:border-[#92C842]/40 hover:text-white'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-slate-400">
              From
              <input
                type="date"
                value={startDate}
                onChange={(event) => {
                  setActivePreset('all');
                  setStartDate(event.target.value);
                }}
                className="rounded-lg border border-[#1e2d4d] bg-[#090e1c] px-2 py-1.5 text-xs text-slate-200 outline-none focus:border-[#92C842]"
              />
            </label>
            <label className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-slate-400">
              To
              <input
                type="date"
                value={endDate}
                onChange={(event) => {
                  setActivePreset('all');
                  setEndDate(event.target.value);
                }}
                className="rounded-lg border border-[#1e2d4d] bg-[#090e1c] px-2 py-1.5 text-xs text-slate-200 outline-none focus:border-[#92C842]"
              />
            </label>
          </div>

          {(startDate || endDate || activePreset !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setActivePreset('all');
              }}
              className="rounded-lg border border-[#1e2d4d] bg-[#101a2a] px-2.5 py-1.5 text-[11px] font-semibold text-slate-300 transition hover:border-[#92C842]/60 hover:text-white"
            >
              Clear filter
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-[#1e2d4d] bg-[#0e1628] p-8 text-center text-sm text-slate-400">
          Loading live VSR access log…
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      ) : (
        <>
          <div className="mb-4 rounded-xl border border-[#1e2d4d] bg-[#0e1628] p-3">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <ShieldCheck className="h-4 w-4 text-[#92C842]" />
              <span>Latest accepted record</span>
            </div>
            <div className="mt-2 text-base font-medium text-white">{summary.latest}</div>
          </div>

          <div className="overflow-hidden rounded-xl border border-[#1e2d4d] bg-[#0e1628]">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm text-slate-300">
                <thead className="bg-[#0d1729] text-[10px] uppercase tracking-[0.18em] text-slate-500">
                  <tr>
                    <th className="px-3 py-2.5">VSR</th>
                    <th className="px-3 py-2.5">Location</th>
                    <th className="px-3 py-2.5">Region / State</th>
                    <th className="px-3 py-2.5">Coordinates</th>
                    <th className="px-3 py-2.5">Signed In</th>
                    <th className="px-3 py-2.5">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-10 text-center text-slate-400">
                        No VSR session logs match the selected date range.
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((log) => (
                      <tr key={log.id} className="border-t border-[#1e2d4d] hover:bg-[#101f32]">
                        <td className="px-3 py-2.5 align-top">
                          <div className="font-semibold text-white">{log.name || 'Unidentified VSR'}</div>
                          <div className="mt-1 text-[11px] text-slate-400">{log.email}</div>
                        </td>
                        <td className="px-3 py-2.5 align-top">
                          <div className="flex items-start gap-2">
                            <MapPin className="mt-0.5 h-4 w-4 text-[#92C842]" />
                            <span>{log.location_label || log.city || 'Location not captured'}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 align-top">
                          <div>{log.region || 'Unspecified'}</div>
                          <div className="mt-1 text-[11px] text-slate-400">{log.state || 'Unknown state'}</div>
                        </td>
                        <td className="px-3 py-2.5 align-top">
                          {log.latitude != null && log.longitude != null ? (
                            <div>
                              <div className="font-mono text-white">
                                {log.latitude.toFixed(4)}, {log.longitude.toFixed(4)}
                              </div>
                              <div className="mt-1 text-[11px] text-slate-400">
                                Accuracy: {log.accuracy ? `${Math.round(log.accuracy)}m` : 'not recorded'}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-500">Unavailable</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 align-top">
                          <div className="flex items-start gap-2">
                            <Clock3 className="mt-0.5 h-4 w-4 text-[#38bdf8]" />
                            <span>{formatSignedIn(log.signed_in_at)}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 align-top">
                          <div className="flex items-center gap-2">
                            {log.source === 'browser' ? (
                              <ShieldCheck className="h-4 w-4 text-[#92C842]" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-amber-400" />
                            )}
                            <span className="capitalize">{log.source || 'fallback'}</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
