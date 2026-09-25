import React, { useEffect, useState, useRef } from 'react';
import { Region, AuthUser } from '../types';

interface TopHeaderProps {
  selectedRegion: Region;
  onSelectRegion: (region: Region) => void;
  syncTimeSeconds: number;
  onForceRefresh: () => void;
  isRefreshing: boolean;
  onOpenNewVSR: () => void;
  onOpenNotifications: () => void;
  hasUnreadNotifications: boolean;
  onToggleMobileMenu: () => void;
  isOverrunSimulated?: boolean;
  onToggleOverrunSimulation?: () => void;
  onOpenShiftCompliance?: () => void;
  onOpenGpsTracker?: () => void;
  onOpenOverallDashboard?: () => void;
  currentUser?: AuthUser | null;
  onSignOut?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  selectedRegion,
  onSelectRegion,
  syncTimeSeconds,
  onForceRefresh,
  isRefreshing,
  onOpenNewVSR,
  onOpenNotifications,
  hasUnreadNotifications,
  onToggleMobileMenu,
  isOverrunSimulated = false,
  onToggleOverrunSimulation,
  onOpenShiftCompliance,
  onOpenGpsTracker,
  onOpenOverallDashboard,
  currentUser,
  onSignOut
}) => {
  const [watTime, setWatTime] = useState<string>('06:54:05 WAT');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Live ticking West Africa Time (UTC+1)
  useEffect(() => {
    if (isOverrunSimulated) {
      setWatTime('21:15:20 WAT');
      return;
    }

    const updateTime = () => {
      const now = new Date();
      // Format to WAT (UTC+1)
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Africa/Lagos',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      const timeString = new Intl.DateTimeFormat('en-GB', options).format(now);
      setWatTime(`${timeString} WAT`);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [isOverrunSimulated]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hubs: { id: Region; label: string }[] = [
    { id: 'All', label: 'All Locations' },
    { id: 'Lagos', label: 'Lagos' },
    { id: 'Ibadan', label: 'Ibadan' },
    { id: 'Ogun', label: 'Ogun' },
    { id: 'Benin', label: 'Benin' }
  ];

  return (
    <header className="bg-[#0e1628] border-b border-[#1e2d4d] sticky top-0 z-20">
      {/* Main Top Bar */}
      <div className="px-4 lg:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Mobile menu trigger + Hub Switchers */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs py-1">
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-lg bg-[#151f38] text-slate-300 border border-[#1e2d4d] hover:text-white"
            title="Toggle Menu"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </button>

          {hubs.map((hub) => {
            const isActive = selectedRegion === hub.id;
            return (
              <button
                key={hub.id}
                onClick={() => onSelectRegion(hub.id)}
                className={`px-3.5 py-1.5 rounded-md font-semibold transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-[#151f38] text-white border border-[#1e2d4d] hover:border-[#92C842]/50'
                    : 'bg-transparent text-slate-400 hover:text-slate-200 hover:bg-[#151f38]/60 font-medium'
                }`}
              >
                {hub.label}
              </button>
            );
          })}
        </div>

        {/* Top Right Controls */}
        <div className="flex items-center gap-4">
          {/* Sync Indicator */}
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 hidden sm:flex">
            <svg
              className={`w-3.5 h-3.5 text-[#92C842] ${isRefreshing ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
            <span>
              Updated: <span className="text-slate-200">{syncTimeSeconds}s ago</span>
            </span>
          </div>

          {/* Bell Notification */}
          <div
            onClick={onOpenNotifications}
            className="relative cursor-pointer p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-[#151f38] transition-colors"
            title="Alerts and Notifications"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
            {hasUnreadNotifications && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#F17F31] ring-2 ring-[#0e1628]"></span>
            )}
          </div>

          {/* User Profile & Menu */}
          <div className="relative pl-3 border-l border-[#1e2d4d]" ref={profileMenuRef}>
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-[#151f38] transition-all text-left group"
              title="Click to manage account or switch user"
            >
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-100 group-hover:text-white flex items-center justify-end gap-1">
                  <span>{currentUser ? currentUser.name : 'Tope Balogun'}</span>
                  <svg className="w-3 h-3 text-slate-400 group-hover:text-white transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                </div>
                <div className="text-[10px] font-medium tracking-wider text-[#92C842] uppercase truncate max-w-[140px]">
                  {currentUser ? currentUser.roleTitle : 'Super Admin'}
                </div>
              </div>

              <div
                className="w-8 h-8 rounded-full border border-[#92C842]/40 flex items-center justify-center text-xs font-bold text-[#090e1c] shadow-inner font-mono shrink-0"
                style={{ backgroundColor: currentUser ? currentUser.avatarColor : '#92C842' }}
              >
                {currentUser ? currentUser.initials : 'TB'}
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-[#0e1628] border border-[#1e2d4d] rounded-xl shadow-2xl z-50 p-3 space-y-3">
                <div className="border-b border-[#1e2d4d] pb-2.5">
                  <div className="text-xs font-bold text-white">
                    {currentUser ? currentUser.name : 'Tope Balogun'}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono truncate">
                    {currentUser ? currentUser.email : 'tope.balogun@keahospitality.ng'}
                  </div>
                  <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#92C842]/10 text-[#92C842] border border-[#92C842]/30 font-semibold">
                      {currentUser ? currentUser.securityClearance : 'Super Admin'}
                    </span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#151f38] text-slate-300 border border-[#1e2d4d]">
                      {currentUser ? currentUser.department : 'Executive Leadership'}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Locations:</span>
                    <span className="font-mono text-slate-200">
                      {currentUser ? currentUser.assignedRegion : 'All 4 Locations'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="font-mono text-[#92C842]">Online & Secure</span>
                  </div>
                </div>

                {onSignOut && (
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onSignOut();
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                    <span>Sign Out / Switch User</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sub Top Control Bar */}
      <div className="px-4 lg:px-6 py-2.5 bg-[#090e1c]/80 border-t border-[#1e2d4d] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1.5 text-[#92C842] font-semibold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-[#92C842] animate-pulse"></span>
            LIVE MACHINES CONNECTED
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300">Live data connected</span>
          <span className="bg-[#151f38] px-2 py-0.5 rounded border border-[#1e2d4d] text-[11px] font-mono text-slate-300">
            {watTime}
          </span>
          {onToggleOverrunSimulation && (
            <button
              onClick={onToggleOverrunSimulation}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border transition-all ${
                isOverrunSimulated
                  ? 'bg-[#F17F31]/20 text-[#F17F31] border-[#F17F31]/50 shadow-sm'
                  : 'bg-[#151f38] text-slate-400 border-[#1e2d4d] hover:text-slate-200'
              }`}
              title="Click to test the alert for staff working past 9:00 PM closing time"
            >
              {isOverrunSimulated ? '9:15 PM (Testing Late Work)' : 'Test Late Shift Alert'}
            </button>
          )}
          <span className="text-slate-500 hidden lg:inline">•</span>
          <div className="hidden lg:flex items-center gap-1.5 text-slate-400">
            <svg className="w-3.5 h-3.5 text-[#92C842]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
            <span>
              Signed in as: <strong className="text-slate-200 font-medium">Tope Balogun (Super Admin)</strong>
            </span>
          </div>
        </div>

        {/* Actions: Shift Compliance, Refresh and New VSR */}
        <div className="flex items-center gap-2">
          {onOpenOverallDashboard && (
            <button
              onClick={onOpenOverallDashboard}
              className="px-3 py-1.5 rounded-lg bg-[#82c332] hover:bg-[#71ab2a] text-[#090e1c] font-black flex items-center gap-1.5 transition-all text-xs shadow-md shadow-[#82c332]/25"
              title="Open Official KEA Client Master Dashboard"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
              <span className="hidden sm:inline">KEA Master Dashboard</span>
              <span className="sm:hidden">KEA</span>
            </button>
          )}

          {onOpenGpsTracker && (
            <button
              onClick={onOpenGpsTracker}
              className="px-3 py-1.5 rounded-lg bg-[#151f38] hover:bg-[#1a2745] text-slate-200 border border-[#1e2d4d] hover:border-[#92C842]/50 flex items-center gap-1.5 font-medium transition-all text-xs shadow-sm"
              title="Track where store workers sign in from using GPS"
            >
              <svg className="w-3.5 h-3.5 text-[#92C842]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <span className="hidden sm:inline">Worker GPS Tracker</span>
              <span className="sm:hidden">GPS</span>
            </button>
          )}

          {onOpenShiftCompliance && (
            <button
              onClick={onOpenShiftCompliance}
              className="px-3 py-1.5 rounded-lg bg-[#151f38] hover:bg-[#1a2745] text-slate-200 border border-[#1e2d4d] hover:border-[#92C842]/50 flex items-center gap-1.5 font-medium transition-all text-xs shadow-sm"
              title="Daily work hours and attendance summary (Print or Save as PDF)"
            >
              <svg className="w-3.5 h-3.5 text-[#92C842]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
              <span className="hidden md:inline">Daily Shift Report (PDF)</span>
              <span className="md:hidden">Shift Report</span>
            </button>
          )}

          <button
            onClick={onForceRefresh}
            disabled={isRefreshing}
            className="px-3 py-1.5 rounded-lg bg-[#151f38] hover:bg-[#1a2745] text-slate-200 border border-[#1e2d4d] flex items-center gap-2 font-medium transition-colors disabled:opacity-50"
            title="Refresh all data now"
          >
            <svg
              className={`w-3.5 h-3.5 text-slate-400 ${isRefreshing ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
            <span>{isRefreshing ? 'Updating...' : 'Refresh Now'}</span>
          </button>
          <button
            onClick={onOpenNewVSR}
            className="px-4 py-1.5 rounded-lg bg-[#92C842] hover:bg-[#7bb32e] text-[#090e1c] font-bold flex items-center gap-2 shadow-md shadow-[#92C842]/20 transition-all active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>+ Add Store Worker</span>
          </button>
        </div>
      </div>
    </header>
  );
};
