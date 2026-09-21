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
      <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#92C842]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
            <h4 className="font-bold text-sm text-white">Head Office &amp; Recruitment</h4>
          </div>
          <span className="text-[11px] font-bold text-[#F17F31] bg-[#F17F31]/15 px-2 py-0.5 rounded border border-[#F17F31]/30">
            34 Staff + 5 Req
          </span>
        </div>

        {/* Dept Counts Grid */}
        <div className="grid grid-cols-3 gap-2 text-center pt-1">
          <div
            onClick={() => onSelectScreen && onSelectScreen('head_office')}
            className="bg-[#151f38] p-2.5 rounded-lg border border-[#1e2d4d] hover:border-[#92C842]/40 cursor-pointer transition-colors"
          >
            <div className="text-base font-extrabold text-white font-mono">4</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400 mt-0.5">Executive</div>
          </div>
          <div
            onClick={() => onSelectScreen && onSelectScreen('head_office')}
            className="bg-[#151f38] p-2.5 rounded-lg border border-[#1e2d4d] hover:border-[#92C842]/40 cursor-pointer transition-colors"
          >
            <div className="text-base font-extrabold text-white font-mono">12</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400 mt-0.5">Finance &amp; Ops</div>
          </div>
          <div
            onClick={() => onSelectScreen && onSelectScreen('head_office')}
            className="bg-[#151f38] p-2.5 rounded-lg border border-[#1e2d4d] hover:border-[#92C842]/40 cursor-pointer transition-colors"
          >
            <div className="text-base font-extrabold text-white font-mono">18</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400 mt-0.5">Tech &amp; Log.</div>
          </div>
        </div>

        {/* Active Requisitions List */}
        <div className="space-y-2 pt-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            ACTIVE REQUISITIONS (5 OPEN ROLES)
          </div>
          {requisitions.slice(0, 3).map((req) => (
            <div
              key={req.id}
              onClick={() => onSelectRequisition && onSelectRequisition(req)}
              className="flex items-center justify-between p-2.5 rounded-lg bg-[#090e1c] border border-[#1e2d4d] hover:border-[#92C842]/40 text-xs cursor-pointer transition-all"
            >
              <div>
                <div className="font-semibold text-slate-200 hover:text-[#92C842]">{req.title}</div>
                <div className="text-[10px] text-slate-500">{req.location}</div>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#151f38] border border-[#1e2d4d] font-mono text-slate-300 text-[11px]">
                {req.applicantCount} Apps
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* WIDGET 2: Merchandiser Regional Tally */}
      <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#92C842]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
            <h4 className="font-bold text-sm text-white">Merchandiser Regional Tally</h4>
          </div>
          <span className="text-[11px] font-bold text-slate-300 bg-[#151f38] px-2 py-0.5 rounded border border-[#1e2d4d]">
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
                <div className="flex items-center justify-between text-slate-300 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span>{hub.hubDisplayName}</span>
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
                            ? 'bg-[#E05252]/20 text-[#E05252] border border-[#E05252]/30'
                            : isIdleBreached
                            ? 'bg-[#F17F31]/20 text-[#F17F31] border border-[#F17F31]/30'
                            : 'text-slate-400'
                        }`}
                      >
                        {hub.isShiftOverrun
                          ? '⚠️ Overrun (>21:00)'
                          : isIdleBreached
                          ? `⚠️ ${hub.telemetryIdleMinutes}m Idle (>${threshold}m)`
                          : `${hub.telemetryIdleMinutes}m ping`}
                      </span>
                    )}
                    <span className="font-bold text-white font-mono">{hub.merchandiserCount}</span>
                  </div>
                </div>
                <div className="w-full bg-[#151f38] h-2 rounded-full overflow-hidden">
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

        {/* Links to Performance Trends & Compliance */}
        {onSelectScreen && (
          <div className="pt-2 border-t border-[#1e2d4d] space-y-1.5">
            <button
              onClick={() => onSelectScreen('compliance')}
              className="w-full flex items-center justify-between text-xs font-semibold text-[#92C842] hover:text-white transition-colors group"
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
                30-Day Compliance Dashboard (D3)
              </span>
              <span className="font-mono text-slate-400 group-hover:translate-x-0.5 transition-transform">→</span>
            </button>

            <button
              onClick={() => onSelectScreen('trends')}
              className="w-full flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white transition-colors group"
            >
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#92C842]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
                7-Day Performance Trends (D3)
              </span>
              <span className="font-mono text-slate-400 group-hover:translate-x-0.5 transition-transform">→</span>
            </button>
          </div>
        )}
      </div>

      {/* WIDGET 3: Recent Funding Actions Log */}
      <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#92C842]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
            <h4 className="font-bold text-sm text-white">Recent Funding Actions Log</h4>
          </div>
          <span className="text-[10px] font-bold text-[#92C842] bg-[#92C842]/10 border border-[#92C842]/30 px-1.5 py-0.5 rounded font-mono flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#92C842] animate-pulse"></span>
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
                className={`flex items-start gap-3 p-2.5 rounded-lg bg-[#090e1c] border ${
                  isHold ? 'border-[#F17F31]/30 hover:border-[#F17F31]/50' : 'border-[#1e2d4d] hover:border-[#92C842]/30'
                } transition-colors`}
              >
                <span
                  className={`p-1 rounded mt-0.5 ${
                    isHold ? 'bg-[#F17F31]/15 text-[#F17F31]' : 'bg-[#92C842]/15 text-[#92C842]'
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
                    <span className={`font-bold font-mono truncate ${isHold ? 'text-[#F17F31]' : 'text-white'}`}>
                      {log.amountText}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">{log.time}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 leading-tight">{log.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
