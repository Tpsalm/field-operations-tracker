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
          setError(err instanceof Error ? err.message : 'Unable to load staff audit log.');
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
      latest: latest ? `${latest.name || latest.email} • ${latest.city || latest.region || 'Unknown'} ` : 'No sign-in records yet'
    };
  }, [filteredRows]);

  return (
    <div className="min-h-[70vh] rounded-[12px] border border-slate-200/80 bg-white p-4 md:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-5">
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">Audit Registry</div>
          <h1 className="mt-1 text-xl sm:text-2xl font-bold text-slate-900">Staff Login &amp; Location History</h1>
          <p className="mt-1 text-xs text-slate-500">
            Records of verified GPS locations and login times captured when staff sign in on mobile.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2">
            <div className="text-[10px] uppercase font-semibold text-slate-400">Total Logins</div>
            <div className="mt-0.5 text-lg font-bold text-slate-900">{summary.total}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2">
            <div className="text-[10px] uppercase font-semibold text-slate-400">Branches</div>
            <div className="mt-0.5 text-lg font-bold text-slate-900">{summary.regions}</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: 'all', label: 'All Time' },
            { key: 'today', label: 'Today' },
            { key: '7d', label: 'Past 7 Days' },
            { key: '30d', label: 'Past 30 Days' }
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
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                  isActive
                    ? 'border-emerald-500 bg-emerald-500 text-white shadow-xs'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
              From:
              <input
                type="date"
                value={startDate}
                onChange={(event) => {
                  setActivePreset('all');
                  setStartDate(event.target.value);
                }}
                className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800 outline-none focus:border-emerald-500"
              />
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
              To:
              <input
                type="date"
                value={endDate}
                onChange={(event) => {
                  setActivePreset('all');
                  setEndDate(event.target.value);
                }}
                className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800 outline-none focus:border-emerald-500"
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
              className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
          Loading live staff access log…
        </div>
      ) : error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {error}
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Latest Verified Check-in</span>
            </div>
            <div className="mt-1.5 text-sm font-bold text-slate-900">{summary.latest}</div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="px-4 py-3">Staff Member</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Branch / State</th>
                    <th className="px-4 py-3">Coordinates</th>
                    <th className="px-4 py-3">Check-in Time</th>
                    <th className="px-4 py-3">Device Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                        No login session records match the selected date range.
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 align-top">
                          <div className="font-semibold text-slate-900">{log.name || 'Staff Member'}</div>
                          <div className="mt-0.5 text-[11px] text-slate-500">{log.email}</div>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="flex items-start gap-1.5 font-medium text-slate-800">
                            <MapPin className="mt-0.5 h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            <span>{log.location_label || log.city || 'Store Location'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="font-semibold text-slate-800">{log.region || 'Unspecified'}</div>
                          <div className="mt-0.5 text-[11px] text-slate-500">{log.state || 'State'}</div>
                        </td>
                        <td className="px-4 py-3 align-top">
                          {log.latitude != null && log.longitude != null ? (
                            <div>
                              <div className="font-mono text-slate-800 font-medium">
                                {log.latitude.toFixed(4)}, {log.longitude.toFixed(4)}
                              </div>
                              <div className="mt-0.5 text-[10px] text-slate-400">
                                Accuracy: {log.accuracy ? `±${Math.round(log.accuracy)}m` : 'verified'}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400">Unavailable</span>
                          )}
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="flex items-start gap-1.5">
                            <Clock3 className="mt-0.5 h-3.5 w-3.5 text-blue-500 shrink-0" />
                            <span className="font-mono">{formatSignedIn(log.signed_in_at)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="flex items-center gap-1.5">
                            {log.source === 'browser' ? (
                              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                            ) : (
                              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                            )}
                            <span className="capitalize font-medium">{log.source || 'Mobile GPS'}</span>
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
