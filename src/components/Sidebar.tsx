import React, { useState } from 'react';
import {
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Clock,
  Settings,
  Bell,
  FileText,
  LogOut
} from 'lucide-react';
import { NavigationScreen, AuthUser, TelemetryPreferencesConfig } from '../types';
import { saveTelemetryPreferences } from '../data/telemetryPreferencesData';

interface SidebarProps {
  currentScreen: NavigationScreen;
  onSelectScreen: (screen: NavigationScreen) => void;
  syncTimeSeconds: number;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  onOpenShiftCompliance?: () => void;
  currentUser?: AuthUser | null;
  onSignOut?: () => void;
  preferences?: TelemetryPreferencesConfig;
  onUpdatePreferences?: (prefs: TelemetryPreferencesConfig) => void;
  onOpenTelemetryPreferences?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  onSelectScreen,
  syncTimeSeconds,
  mobileOpen,
  onCloseMobile,
  onOpenShiftCompliance,
  currentUser,
  onSignOut,
  preferences,
  onUpdatePreferences,
  onOpenTelemetryPreferences
}) => {
  const [isInlinePreferencesExpanded, setIsInlinePreferencesExpanded] = useState(false);

  const handleQuickApplyThreshold = (mins: number) => {
    if (!preferences || !onUpdatePreferences) return;
    const updated: TelemetryPreferencesConfig = {
      ...preferences,
      globalIdleThresholdMinutes: mins,
      hubs: {
        Lagos: { ...preferences.hubs.Lagos, idleThresholdMinutes: mins },
        Ibadan: { ...preferences.hubs.Ibadan, idleThresholdMinutes: mins },
        Ogun: { ...preferences.hubs.Ogun, idleThresholdMinutes: mins },
        Benin: { ...preferences.hubs.Benin, idleThresholdMinutes: mins }
      }
    };
    onUpdatePreferences(updated);
    saveTelemetryPreferences(updated);
  };

  const handleQuickToggleOverrun = (hubKey: 'Lagos' | 'Ibadan' | 'Ogun' | 'Benin') => {
    if (!preferences || !onUpdatePreferences) return;
    const current = preferences.hubs[hubKey].shiftOverrunAlert;
    const updated: TelemetryPreferencesConfig = {
      ...preferences,
      hubs: {
        ...preferences.hubs,
        [hubKey]: {
          ...preferences.hubs[hubKey],
          shiftOverrunAlert: !current
        }
      }
    };
    onUpdatePreferences(updated);
    saveTelemetryPreferences(updated);
  };

  const handleQuickToggleIdle = (hubKey: 'Lagos' | 'Ibadan' | 'Ogun' | 'Benin') => {
    if (!preferences || !onUpdatePreferences) return;
    const current = preferences.hubs[hubKey].idleBreachAlert;
    const updated: TelemetryPreferencesConfig = {
      ...preferences,
      hubs: {
        ...preferences.hubs,
        [hubKey]: {
          ...preferences.hubs[hubKey],
          idleBreachAlert: !current
        }
      }
    };
    onUpdatePreferences(updated);
    saveTelemetryPreferences(updated);
  };

  // Plain English navigation items with clear, descriptive titles
  const navItems = [
    {
      id: 'overall_dashboard' as NavigationScreen,
      label: 'KEA Master Dashboard',
      description: 'Main business overview & key metrics',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      )
    },
    {
      id: 'shift_adherence_30d' as NavigationScreen,
      label: '30-Day Shift Attendance',
      description: 'Daily attendance & shift completion tracking',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      )
    },
    {
      id: 'vsr_location_audit' as NavigationScreen,
      label: 'Store Location Check-Ins',
      description: 'Audit if workers sign in inside stores',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" strokeWidth="2" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" strokeWidth="2" />
        </svg>
      )
    },
    {
      id: 'operations' as NavigationScreen,
      label: 'Field Staff & Loans',
      description: 'Sales staff directory, loans & payment status',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      )
    },
    {
      id: 'vsr_recruitment' as NavigationScreen,
      label: 'Hiring & Applicants',
      description: 'Review applicants & approve new staff',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      )
    },
    {
      id: 'merchandisers' as NavigationScreen,
      label: 'Store Workers & Machines',
      description: 'Assigned store staff and card machines',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      )
    },
    {
      id: 'gps_tracker' as NavigationScreen,
      label: 'Live GPS Map Tracker',
      description: 'See live map locations of field sales staff',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      )
    },
    {
      id: 'trends' as NavigationScreen,
      label: 'Performance Trends',
      description: 'Monthly charts & growth comparisons',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      )
    },
    {
      id: 'compliance' as NavigationScreen,
      label: 'Work Hours & Closing Time',
      description: 'Daily shift lengths and 9:00 PM cutoff',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      )
    },
    {
      id: 'archive' as NavigationScreen,
      label: 'Past Staff Records',
      description: 'Archived and previous staff history',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      )
    }
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between bg-white text-slate-700">
      <div>
        {/* Brand Logo Area */}
        <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center font-black text-white text-sm shadow-sm shadow-emerald-600/20">
              kea
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 tracking-tight uppercase">KEA Operations</div>
              <div className="text-[11px] text-emerald-600 font-semibold">Hospitality Suite</div>
            </div>
          </div>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
            >
              ✕
            </button>
          )}
        </div>

        {/* Telemetry Live Signal */}
        <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-[11px] tracking-wider text-slate-700 uppercase">Live Systems</span>
          </div>
          <span className="text-[11px] font-mono font-bold text-emerald-700">99.8% Online</span>
        </div>

        {/* Primary Navigation Links */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-280px)]">
          {navItems.map((item) => {
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectScreen(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-xs font-semibold transition-all text-left ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <span className={isActive ? 'text-emerald-700' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <div className="flex-1 overflow-hidden">
                  <div className="truncate font-bold">{item.label}</div>
                  <div className="text-[10px] text-slate-400 font-normal truncate">{item.description}</div>
                </div>
              </button>
            );
          })}

          {/* Alert Settings in Sidebar */}
          <div className="pt-2 mt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  if (onOpenTelemetryPreferences) onOpenTelemetryPreferences();
                  if (onCloseMobile) onCloseMobile();
                }}
                className="flex-1 flex items-center justify-between px-3 py-2 rounded-[10px] text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 transition-all text-left shadow-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">Alert Settings</span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0 ml-1">
                  {preferences?.globalIdleThresholdMinutes || 30}m
                </span>
              </button>

              <button
                onClick={() => setIsInlinePreferencesExpanded((prev) => !prev)}
                className={`p-2 rounded-[10px] border transition-all ${
                  isInlinePreferencesExpanded
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border-slate-200/80'
                }`}
                title="Quick alert settings"
              >
                {isInlinePreferencesExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Inline Quick Alert Settings */}
            {isInlinePreferencesExpanded && (
              <div className="mt-2 p-3 rounded-[12px] bg-slate-50 border border-slate-200/80 space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-amber-600" />
                    <span>Inactivity Limit</span>
                  </span>
                  <span className="font-mono text-emerald-700 font-bold">
                    {preferences?.globalIdleThresholdMinutes || 30} min
                  </span>
                </div>

                {/* Preset Chips */}
                <div className="grid grid-cols-4 gap-1">
                  {[15, 30, 45, 60].map((mins) => {
                    const isSelected = (preferences?.globalIdleThresholdMinutes || 30) === mins;
                    return (
                      <button
                        key={mins}
                        onClick={() => handleQuickApplyThreshold(mins)}
                        className={`py-1 rounded text-[10px] font-mono font-semibold transition-all text-center ${
                          isSelected
                            ? 'bg-emerald-600 text-white font-bold shadow-xs'
                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        {mins}m
                      </button>
                    );
                  })}
                </div>

                {/* Location Quick Alert Toggles */}
                <div className="space-y-1 pt-2 border-t border-slate-200/60">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex justify-between">
                    <span>Location Alerts</span>
                    <span>Late • Quiet</span>
                  </div>
                  {(['Lagos', 'Ibadan', 'Ogun', 'Benin'] as const).map((hub) => {
                    const pref = preferences?.hubs?.[hub];
                    const overrunOn = pref ? pref.shiftOverrunAlert : true;
                    const idleOn = pref ? pref.idleBreachAlert : true;
                    return (
                      <div key={hub} className="flex items-center justify-between text-[11px] text-slate-700">
                        <span className="font-medium">{hub} ({pref?.idleThresholdMinutes || 30}m)</span>
                        <div className="flex items-center gap-1 font-mono text-[10px]">
                          <button
                            onClick={() => handleQuickToggleOverrun(hub)}
                            className={`px-1.5 py-0.5 rounded font-bold transition-all ${
                              overrunOn
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-slate-200 text-slate-400 border border-transparent'
                            }`}
                            title={`${hub}: Alert if staff works past 9:00 PM`}
                          >
                            LATE
                          </button>
                          <button
                            onClick={() => handleQuickToggleIdle(hub)}
                            className={`px-1.5 py-0.5 rounded font-bold transition-all ${
                              idleOn
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-200 text-slate-400 border border-transparent'
                            }`}
                            title={`${hub}: Alert if machines are inactive`}
                          >
                            QUIET
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => {
                    if (onOpenTelemetryPreferences) onOpenTelemetryPreferences();
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className="w-full mt-1.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-bold text-center transition-all"
                >
                  Configure All Alerts →
                </button>
              </div>
            )}
          </div>

          {onOpenShiftCompliance && (
            <div className="pt-2 mt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  onOpenShiftCompliance();
                  if (onCloseMobile) onCloseMobile();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 transition-all text-left shadow-xs"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                <span>Daily Shift Report (PDF)</span>
              </button>
            </div>
          )}
        </nav>
      </div>

      <div className="border-t border-slate-200/80 bg-slate-50/50 p-3">
        {/* User Session */}
        {currentUser && (
          <div className="p-2.5 rounded-[12px] bg-white border border-slate-200/80 shadow-xs flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0 font-mono shadow-xs"
                style={{ backgroundColor: currentUser.avatarColor || '#059669' }}
              >
                {currentUser.initials}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</div>
                <div className="text-[10px] font-mono font-semibold text-emerald-700 truncate">{currentUser.role}</div>
              </div>
            </div>

            {onSignOut && (
              <button
                onClick={onSignOut}
                className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition-all shrink-0"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Sync Status */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium px-1">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Live Auto-Sync</span>
          </span>
          <span className="font-mono text-slate-400">{syncTimeSeconds}s ago</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-200/80 flex flex-col justify-between hidden md:flex z-30 shadow-xs">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <aside className="relative w-64 max-w-[80vw] bg-white border-r border-slate-200/80 flex flex-col justify-between h-full z-50 shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
