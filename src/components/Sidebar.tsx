import React, { useState } from 'react';
import {
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Clock,
  Settings,
  Bell,
  FileText
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
  const navItems = [
    {
      id: 'operations' as NavigationScreen,
      label: 'Operations & VSR',
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
      id: 'credential_admin' as NavigationScreen,
      label: 'Credential Administration',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M12 4v16m8-8h-16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </svg>
      )
    },
    {
      id: 'workflow_center' as NavigationScreen,
      label: 'Workflow Center',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M4 6h16v12H4zM8 10h8M8 14h5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </svg>
      )
    },
    {
      id: 'merchandisers' as NavigationScreen,
      label: 'Field Merchandisers',
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
      id: 'trends' as NavigationScreen,
      label: 'Performance Trends',
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
      label: 'Compliance Dashboard',
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
      id: 'head_office' as NavigationScreen,
      label: 'Head Office & Hiring',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      )
    },
    {
      id: 'archive' as NavigationScreen,
      label: 'Archive & Disengaged',
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
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* Brand Logo Area */}
        <div className="p-5 border-b border-[#1e2d4d] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              alt="KEA Corporate Hospitality Services"
              className="h-10 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCaM-FAr5FKmzgGhQH5eWL6YXxVuMYXgDAKFN_R7hja3iHfyknwvu7yBhjXKUY76ANao3E5ud0dMVdQUxs77cYxyUZEKntxE1DScy8Z93vCQATIEgwPqiO5DlH9-u0drJ3mWKWUtwTECHt1jRISb007pK6PvRhC9pIG5ksxGsFw84QPcvxwqc723WynagMHw61ou_Ly3A8r3i63Tup_-nO-uwIGfhGiR_WhE0xBrmd7illUTzyX9bHWqEMC0UMMWEctYg"
            />
            <div>
              <div className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Operations Suite</div>
              <div className="text-[10px] text-[#92C842] font-medium tracking-tight">KEA Hospitality</div>
            </div>
          </div>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#151f38]"
            >
              ✕
            </button>
          )}
        </div>

        {/* Telemetry Live Signal */}
        <div className="px-5 py-3 border-b border-[#1e2d4d]/60 bg-[#090e1c]/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#92C842] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#92C842]"></span>
            </span>
            <span className="font-bold text-[11px] tracking-wider text-white">LIVE TELEMETRY</span>
          </div>
          <span className="text-xs font-mono font-medium text-slate-400">99.8%</span>
        </div>

        {/* Primary Navigation Links */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectScreen(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#92C842]/10 text-[#92C842] border border-[#92C842]/30 shadow-[0_0_12px_rgba(146,200,66,0.08)]'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-[#151f38] border border-transparent'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Telemetry Preferences Section in Sidebar */}
          <div className="pt-2 mt-2 border-t border-[#1e2d4d]/60">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  if (onOpenTelemetryPreferences) onOpenTelemetryPreferences();
                  if (onCloseMobile) onCloseMobile();
                }}
                className="flex-1 flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold bg-[#151f38] hover:bg-[#1a2745] text-slate-300 hover:text-white border border-[#1e2d4d] hover:border-[#92C842]/40 transition-all text-left shadow-sm"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <SlidersHorizontal className="w-4 h-4 text-[#92C842] shrink-0" />
                  <span className="truncate">Telemetry Preferences</span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-[#92C842]/15 text-[#92C842] px-1.5 py-0.2 rounded border border-[#92C842]/30 shrink-0 ml-1">
                  {preferences?.globalIdleThresholdMinutes || 30}m
                </span>
              </button>

              <button
                onClick={() => setIsInlinePreferencesExpanded((prev) => !prev)}
                className={`p-2 rounded-lg border transition-all ${
                  isInlinePreferencesExpanded
                    ? 'bg-[#92C842]/15 text-[#92C842] border-[#92C842]/30'
                    : 'bg-[#151f38] hover:bg-[#1a2745] text-slate-400 hover:text-white border-[#1e2d4d]'
                }`}
                title="Expand/Collapse Quick Telemetry Preferences Panel in Sidebar"
              >
                {isInlinePreferencesExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Inline Quick Settings Drawer */}
            {isInlinePreferencesExpanded && (
              <div className="mt-2 p-2.5 rounded-xl bg-[#090e1c] border border-[#1e2d4d] space-y-2 text-xs">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-[#F17F31]" />
                    <span>Idle Threshold</span>
                  </span>
                  <span className="font-mono text-[#92C842] font-bold">
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
                        className={`py-1 rounded text-[10px] font-mono transition-all text-center ${
                          isSelected
                            ? 'bg-[#92C842] text-[#090e1c] font-bold shadow-sm'
                            : 'bg-[#151f38] text-slate-400 hover:text-white border border-[#1e2d4d]'
                        }`}
                      >
                        {mins}m
                      </button>
                    );
                  })}
                </div>

                {/* Hubs Alert Summary / Quick Toggles */}
                <div className="space-y-1 pt-1.5 border-t border-[#1e2d4d]/60">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex justify-between">
                    <span>Hub Alerts</span>
                    <span className="text-slate-400 font-normal">Overrun • Idle</span>
                  </div>
                  {(['Lagos', 'Ibadan', 'Ogun', 'Benin'] as const).map((hub) => {
                    const pref = preferences?.hubs?.[hub];
                    const overrunOn = pref ? pref.shiftOverrunAlert : true;
                    const idleOn = pref ? pref.idleBreachAlert : true;
                    return (
                      <div key={hub} className="flex items-center justify-between text-[11px] text-slate-300">
                        <span className="font-medium">{hub} ({pref?.idleThresholdMinutes || 30}m)</span>
                        <div className="flex items-center gap-1 font-mono text-[10px]">
                          <button
                            onClick={() => handleQuickToggleOverrun(hub)}
                            className={`px-1.5 py-0.2 rounded font-semibold transition-all ${
                              overrunOn
                                ? 'bg-[#E05252]/20 text-[#E05252] border border-[#E05252]/30'
                                : 'bg-[#151f38] text-slate-600 border border-transparent'
                            }`}
                            title={`${hub}: Toggle Shift Overrun Alert`}
                          >
                            OVR
                          </button>
                          <button
                            onClick={() => handleQuickToggleIdle(hub)}
                            className={`px-1.5 py-0.2 rounded font-semibold transition-all ${
                              idleOn
                                ? 'bg-[#F17F31]/20 text-[#F17F31] border border-[#F17F31]/30'
                                : 'bg-[#151f38] text-slate-600 border border-transparent'
                            }`}
                            title={`${hub}: Toggle Idle Breach Alert`}
                          >
                            IDLE
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
                  className="w-full mt-1.5 py-1.5 rounded-lg bg-[#92C842]/10 hover:bg-[#92C842]/20 text-[#92C842] border border-[#92C842]/30 text-[11px] font-bold text-center transition-all"
                >
                  Configure All Hubs →
                </button>
              </div>
            )}
          </div>

          {onOpenShiftCompliance && (
            <div className="pt-2 mt-2 border-t border-[#1e2d4d]/60">
              <button
                onClick={() => {
                  onOpenShiftCompliance();
                  if (onCloseMobile) onCloseMobile();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold bg-[#151f38] hover:bg-[#1a2745] text-slate-300 hover:text-white border border-[#1e2d4d] hover:border-[#92C842]/40 transition-all text-left shadow-sm"
              >
                <svg className="w-4 h-4 text-[#92C842]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
                <span>Shift Compliance (PDF)</span>
              </button>
            </div>
          )}
        </nav>
      </div>

      <div>
        {/* Active Session & Switch Role */}
        {currentUser && (
          <div className="p-3.5 mx-3 mb-2 rounded-xl bg-[#090e1c] border border-[#1e2d4d] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-[#090e1c] shrink-0 font-mono"
                style={{ backgroundColor: currentUser.avatarColor }}
              >
                {currentUser.initials}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-white truncate">{currentUser.name}</div>
                <div className="text-[10px] font-mono text-[#92C842] truncate">{currentUser.role}</div>
              </div>
            </div>

            {onSignOut && (
              <button
                onClick={onSignOut}
                className="p-1.5 rounded-lg bg-[#151f38] hover:bg-red-500/20 text-slate-400 hover:text-red-300 border border-[#1e2d4d] hover:border-red-500/30 transition-all shrink-0"
                title="Switch Corporate Role / Sign Out"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Left Sidebar Engine Sync Bottom Status */}
        <div className="p-4 border-t border-[#1e2d4d] bg-[#090e1c]/80 text-xs">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1">
          <span>SYNC ENGINE</span>
          <span className="text-[#92C842] flex items-center gap-1 font-mono">ONLINE</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-[11px]">
          <svg className="w-3.5 h-3.5 text-[#92C842] animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
          <span className="truncate">Synced {syncTimeSeconds}s ago with Tope's Master Log</span>
        </div>
      </div>
    </div>
  </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-[#0b1222] border-r border-[#1e2d4d] flex flex-col justify-between hidden md:flex z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <aside className="relative w-64 max-w-[80vw] bg-[#0b1222] border-r border-[#1e2d4d] flex flex-col justify-between h-full z-50">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
