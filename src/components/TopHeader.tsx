import React, { useEffect, useState, useRef } from 'react';
import { Region, AuthUser } from '../types';
import { 
  Bell, 
  Clock, 
  RotateCw, 
  Plus, 
  MapPin, 
  FileText, 
  BarChart3, 
  LogOut, 
  ChevronDown 
} from 'lucide-react';

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
  const [watTime, setWatTime] = useState<string>('07:00:00 WAT');
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
    { id: 'Lagos', label: 'Lagos Hub' },
    { id: 'Ibadan', label: 'Ibadan Hub' },
    { id: 'Ogun', label: 'Ogun Hub' },
    { id: 'Benin', label: 'Benin Hub' }
  ];

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-20 shadow-xs">
      {/* Main Top Bar */}
      <div className="px-4 lg:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        
        {/* Mobile menu trigger & Location Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-0.5">
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-lg bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
            title="Toggle Menu"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </button>

          <span className="text-[11px] font-semibold text-slate-400 mr-1 hidden sm:inline">Filter Area:</span>

          {hubs.map((hub) => {
            const isActive = selectedRegion === hub.id;
            return (
              <button
                key={hub.id}
                onClick={() => onSelectRegion(hub.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                {hub.label}
              </button>
            );
          })}
        </div>

        {/* Top Right User & Utility Controls */}
        <div className="flex items-center gap-3">
          {/* Refresh Action */}
          <button
            onClick={onForceRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold transition-all shadow-xs"
            title="Refresh live data now"
          >
            <RotateCw className={`w-3.5 h-3.5 text-emerald-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isRefreshing ? 'Updating...' : 'Refresh'}</span>
          </button>

          {/* Bell Notification Drawer Trigger */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200/80 bg-slate-50 shadow-xs"
            title="Alerts and Notifications"
          >
            <Bell className="w-4 h-4" />
            {hasUnreadNotifications && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white"></span>
            )}
          </button>

          {/* User Profile & Menu */}
          <div className="relative pl-2 border-l border-slate-200" ref={profileMenuRef}>
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-50 transition-all text-left group"
              title="Click to manage account or switch user"
            >
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-900 flex items-center justify-end gap-1">
                  <span>{currentUser ? currentUser.name : 'Tope Balogun'}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-700 transition-transform" />
                </div>
                <div className="text-[10px] font-semibold text-emerald-700 uppercase tracking-tight truncate max-w-[140px]">
                  {currentUser ? currentUser.roleTitle : 'Super Admin'}
                </div>
              </div>

              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-xs font-mono shrink-0"
                style={{ backgroundColor: currentUser ? currentUser.avatarColor : '#059669' }}
              >
                {currentUser ? currentUser.initials : 'TB'}
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-[12px] shadow-2xl z-50 p-4 space-y-3 animate-fade-in">
                <div className="border-b border-slate-100 pb-3">
                  <div className="text-xs font-bold text-slate-900">
                    {currentUser ? currentUser.name : 'Tope Balogun'}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono truncate mt-0.5">
                    {currentUser ? currentUser.email : 'tope.balogun@keahospitality.ng'}
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {currentUser ? currentUser.securityClearance : 'Level 5 (Unrestricted)'}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Assigned Area:</span>
                    <span className="font-semibold text-slate-800">
                      {currentUser ? currentUser.assignedRegion : 'All Locations'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">System Status:</span>
                    <span className="font-semibold text-emerald-700">Online &amp; Active</span>
                  </div>
                </div>

                {onSignOut && (
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onSignOut();
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out / Switch User</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sub Top Control Bar (Clean Light Styling) */}
      <div className="px-4 lg:px-6 py-2 bg-slate-50/70 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1.5 text-emerald-700 font-bold text-[11px] uppercase tracking-wide">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Live Systems Online
          </span>
          <span className="text-slate-300">•</span>
          <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px] font-mono font-bold text-slate-700 shadow-xs">
            {watTime}
          </span>
          {onToggleOverrunSimulation && (
            <button
              onClick={onToggleOverrunSimulation}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-all ${
                isOverrunSimulated
                  ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
              title="Click to test the alert for staff working past 9:00 PM closing time"
            >
              {isOverrunSimulated ? 'Testing 9:15 PM Late Alert' : 'Test Late Shift Alert'}
            </button>
          )}
        </div>

        {/* Quick Shortcut Buttons */}
        <div className="flex items-center gap-2">
          {onOpenOverallDashboard && (
            <button
              onClick={onOpenOverallDashboard}
              className="px-3 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold flex items-center gap-1.5 transition-all text-xs shadow-xs"
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Dashboard Overview</span>
            </button>
          )}

          {onOpenGpsTracker && (
            <button
              onClick={onOpenGpsTracker}
              className="px-3 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium flex items-center gap-1.5 transition-all text-xs shadow-xs"
              title="Track where store workers sign in from using GPS"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">GPS Map Tracker</span>
            </button>
          )}

          {onOpenShiftCompliance && (
            <button
              onClick={onOpenShiftCompliance}
              className="px-3 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium flex items-center gap-1.5 transition-all text-xs shadow-xs"
              title="Daily work hours and attendance summary (Print or Save as PDF)"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline">Daily Shift Report</span>
            </button>
          )}

          <button
            onClick={onOpenNewVSR}
            className="px-3.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add New Staff</span>
          </button>
        </div>
      </div>
    </header>
  );
};
