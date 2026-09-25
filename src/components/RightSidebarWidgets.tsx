import React from 'react';
import { Requisition, FundingActionLog, FieldMerchandiserHub, NavigationScreen } from '../types';

interface RightSidebarWidgetsProps {
  requisitions: Requisition[];
  fundingLogs: FundingActionLog[];
  merchandiserHubs: FieldMerchandiserHub[];
  onSelectRequisition?: (req: Requisition) => void;
  onSelectScreen?: (screen: NavigationScreen) => void;
}

export const RightSidebarWidgets: React.FC<RightSidebarWidgetsProps> = ({
  requisitions,
  fundingLogs,
  merchandiserHubs,
  onSelectRequisition,
  onSelectScreen
}) => {
  return (
    <div className="space-y-5">
      {/* WIDGET 1: Head Office & Recruitment */}
      <div className="bg-white border border-slate-200/80 rounded-[12px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#6ea823]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
            <h4 className="font-bold text-sm text-slate-900">Head Office &amp; Recruitment</h4>
          </div>
          <span className="text-[11px] font-bold text-[#c95d00] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            34 Staff + 5 Req
          </span>
        </div>

        {/* Dept Counts Grid */}
        <div className="grid grid-cols-3 gap-2 text-center pt-1">
          <div
            onClick={() => onSelectScreen && onSelectScreen('head_office')}
            className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 hover:border-[#82c332] cursor-pointer transition-colors"
          >
            <div className="text-base font-extrabold text-slate-900 font-mono">4</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 mt-0.5">Executive</div>
          </div>
          <div
            onClick={() => onSelectScreen && onSelectScreen('head_office')}
            className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 hover:border-[#82c332] cursor-pointer transition-colors"
          >
            <div className="text-base font-extrabold text-slate-900 font-mono">12</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 mt-0.5">Finance &amp; Ops</div>
          </div>
          <div
            onClick={() => onSelectScreen && onSelectScreen('head_office')}
            className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 hover:border-[#82c332] cursor-pointer transition-colors"
          >
            <div className="text-base font-extrabold text-slate-900 font-mono">18</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 mt-0.5">Tech &amp; Log.</div>
          </div>
        </div>

        {/* Active Requisitions List */}
        <div className="space-y-2 pt-2">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            ACTIVE REQUISITIONS (5 OPEN ROLES)
          </div>
          {requisitions.slice(0, 3).map((req) => (
            <div
              key={req.id}
              onClick={() => onSelectRequisition && onSelectRequisition(req)}
              className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 hover:border-[#82c332] text-xs cursor-pointer transition-all"
            >
              <div>
                <div className="font-semibold text-slate-800 hover:text-[#6ea823]">{req.title}</div>
                <div className="text-[10px] text-slate-500">{req.location}</div>
              </div>
              <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-mono text-slate-700 text-[11px] shadow-sm">
                {req.applicantCount} Apps
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* WIDGET 2: Merchandiser Regional Tally */}
      <div className="bg-white border border-slate-200/80 rounded-[12px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#6ea823]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
            <h4 className="font-bold text-sm text-slate-900">Store Workers by Location</h4>
          </div>
          <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            78 Active
          </span>
        </div>

        {/* Bars List */}
        <div className="space-y-3 pt-1 text-xs">
          {merchandiserHubs.map((hub) => {
            const threshold = hub.idleThresholdMinutes || 30;
            const isIdleBreached =
              hub.isIdleBreached !== undefined
                ? hub.isIdleBreached
                : (hub.telemetryIdleMinutes || 0) >= threshold;

            return (
              <div key={hub.hub} className="space-y-1">
                <div className="flex items-center justify-between text-slate-700 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-slate-800">{hub.hubDisplayName}</span>
                    {hub.shiftStart && (
                      <span className="text-[10px] text-slate-500 font-mono">
                        ({hub.shiftStart})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {hub.telemetryIdleMinutes !== undefined && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                          hub.isShiftOverrun
                            ? 'bg-rose-50 text-rose-600 border border-rose-200'
                            : isIdleBreached
                            ? 'bg-amber-50 text-amber-600 border border-amber-200'
                            : 'text-slate-500'
                        }`}
                      >
                        {hub.isShiftOverrun
                          ? '⚠️ Late (>9:00 PM)'
                          : isIdleBreached
                          ? `⚠️ ${hub.telemetryIdleMinutes}m Quiet (>${threshold}m)`
                          : `${hub.telemetryIdleMinutes}m active`}
                      </span>
                    )}
                    <span className="font-bold text-slate-900 font-mono">{hub.merchandiserCount}</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-2 rounded-full transition-all duration-700"
                    style={{
                      width: `${hub.percentage}%`,
                      backgroundColor: hub.colorHex
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Links to Master Dashboard, GPS Tracker, Performance Trends & Compliance */}
        {onSelectScreen && (
          <div className="pt-2 border-t border-slate-200 space-y-2">
            <button
              onClick={() => onSelectScreen('overall_dashboard')}
              className="w-full flex items-center justify-between text-xs font-bold text-slate-950 hover:bg-[#74b32b] transition-colors group p-2.5 rounded-lg bg-[#82c332] shadow-sm"
            >
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
                KEA Master Dashboard (Client)
              </span>
              <span className="font-mono text-slate-950 group-hover:translate-x-0.5 transition-transform">→</span>
            </button>

            <button
              onClick={() => onSelectScreen('gps_tracker')}
              className="w-full flex items-center justify-between text-xs font-bold text-[#5f931d] hover:bg-[#82c332]/20 transition-colors group p-2 rounded-lg bg-[#82c332]/10 border border-[#82c332]/30"
            >
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-[#6ea823]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                  <path
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
                Worker GPS Sign-In Tracker
              </span>
              <span className="font-mono text-[#5f931d] group-hover:translate-x-0.5 transition-transform">→</span>
            </button>

            <button
              onClick={() => onSelectScreen('compliance')}
              className="w-full flex items-center justify-between text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors group p-1.5 rounded-lg"
            >
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
                30-Day Attendance Dashboard
              </span>
              <span className="font-mono text-slate-400 group-hover:translate-x-0.5 transition-transform">→</span>
            </button>

            <button
              onClick={() => onSelectScreen('trends')}
              className="w-full flex items-center justify-between text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors group p-1.5 rounded-lg"
            >
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#6ea823]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
                7-Day Activity Trends
              </span>
              <span className="font-mono text-slate-400 group-hover:translate-x-0.5 transition-transform">→</span>
            </button>
          </div>
        )}
      </div>

      {/* WIDGET 3: Recent Funding Actions Log */}
      <div className="bg-white border border-slate-200/80 rounded-[12px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#6ea823]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
            <h4 className="font-bold text-sm text-slate-900">Recent Staff Payments &amp; Top-Ups</h4>
          </div>
          <span className="text-[10px] font-bold text-[#5f931d] bg-[#82c332]/15 border border-[#82c332]/30 px-1.5 py-0.5 rounded font-mono flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#82c332] animate-pulse"></span>
            LIVE DB
          </span>
        </div>

        {/* Log Entries */}
        <div className="space-y-3 pt-1 text-xs">
          {fundingLogs.map((log) => {
            const isHold = log.type === 'hold';
            return (
              <div
                key={log.id}
                className={`flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 border ${
                  isHold ? 'border-amber-200 hover:border-amber-400' : 'border-slate-200 hover:border-[#82c332]'
                } transition-colors`}
              >
                <span
                  className={`p-1 rounded mt-0.5 ${
                    isHold ? 'bg-amber-100 text-[#c95d00]' : 'bg-[#82c332]/15 text-[#5f931d]'
                  }`}
                >
                  {isHold ? (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`font-bold font-mono truncate ${isHold ? 'text-[#c95d00]' : 'text-slate-900'}`}>
                      {log.amountText}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">{log.time}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5 leading-tight">{log.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
