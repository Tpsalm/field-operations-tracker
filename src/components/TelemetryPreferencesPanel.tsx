import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Bell,
  BellOff,
  Clock,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  X,
  Check,
  ShieldAlert,
  Info,
  SlidersVertical
} from 'lucide-react';
import { TelemetryPreferencesConfig, Region } from '../types';
import { DEFAULT_TELEMETRY_PREFERENCES, saveTelemetryPreferences } from '../data/telemetryPreferencesData';

interface TelemetryPreferencesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: TelemetryPreferencesConfig;
  onUpdatePreferences: (newPrefs: TelemetryPreferencesConfig) => void;
  regionalTelemetry: Record<string, { lastPingTime: number; terminalCount: number }>;
}

const HUB_METADATA: Record<
  'Lagos' | 'Ibadan' | 'Ogun' | 'Benin',
  { opening: string; closing: string; color: string; sector: string; terminals: number }
> = {
  Lagos: {
    opening: '07:00 WAT',
    closing: '21:00 WAT',
    color: '#10b981',
    sector: 'Ikeja, Marina & Victoria Island',
    terminals: 38
  },
  Ibadan: {
    opening: '07:30 WAT',
    closing: '21:00 WAT',
    color: '#f59e0b',
    sector: 'Dugbe, Bodija & Iwo Road',
    terminals: 18
  },
  Ogun: {
    opening: '08:00 WAT',
    closing: '21:00 WAT',
    color: '#3b82f6',
    sector: 'Abeokuta, Sagamu & Ota',
    terminals: 12
  },
  Benin: {
    opening: '08:00 WAT',
    closing: '21:00 WAT',
    color: '#8b5cf6',
    sector: 'Ring Road, Uselu & Ikpoba',
    terminals: 10
  }
};

const PRESET_THRESHOLDS = [15, 20, 30, 45, 60, 90];

export const TelemetryPreferencesPanel: React.FC<TelemetryPreferencesPanelProps> = ({
  isOpen,
  onClose,
  preferences,
  onUpdatePreferences,
  regionalTelemetry
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'Lagos' | 'Ibadan' | 'Ogun' | 'Benin'>('all');
  const [tempGlobalThreshold, setTempGlobalThreshold] = useState<number>(
    preferences.globalIdleThresholdMinutes || 30
  );
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);

  if (!isOpen) return null;

  const handleToggleOverrun = (hubKey: 'Lagos' | 'Ibadan' | 'Ogun' | 'Benin') => {
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
    triggerSaveFeedback();
  };

  const handleToggleIdle = (hubKey: 'Lagos' | 'Ibadan' | 'Ogun' | 'Benin') => {
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
    triggerSaveFeedback();
  };

  const handleUpdateThreshold = (hubKey: 'Lagos' | 'Ibadan' | 'Ogun' | 'Benin', minutes: number) => {
    const clamped = Math.max(5, Math.min(180, minutes));
    const updated: TelemetryPreferencesConfig = {
      ...preferences,
      hubs: {
        ...preferences.hubs,
        [hubKey]: {
          ...preferences.hubs[hubKey],
          idleThresholdMinutes: clamped
        }
      }
    };
    onUpdatePreferences(updated);
    saveTelemetryPreferences(updated);
    triggerSaveFeedback();
  };

  const handleApplyThresholdToAll = (minutes: number) => {
    const clamped = Math.max(5, Math.min(180, minutes));
    const updated: TelemetryPreferencesConfig = {
      ...preferences,
      globalIdleThresholdMinutes: clamped,
      hubs: {
        Lagos: { ...preferences.hubs.Lagos, idleThresholdMinutes: clamped },
        Ibadan: { ...preferences.hubs.Ibadan, idleThresholdMinutes: clamped },
        Ogun: { ...preferences.hubs.Ogun, idleThresholdMinutes: clamped },
        Benin: { ...preferences.hubs.Benin, idleThresholdMinutes: clamped }
      }
    };
    onUpdatePreferences(updated);
    saveTelemetryPreferences(updated);
    triggerSaveFeedback();
  };

  const handleToggleAllOverrun = (enable: boolean) => {
    const updated: TelemetryPreferencesConfig = {
      ...preferences,
      hubs: {
        Lagos: { ...preferences.hubs.Lagos, shiftOverrunAlert: enable },
        Ibadan: { ...preferences.hubs.Ibadan, shiftOverrunAlert: enable },
        Ogun: { ...preferences.hubs.Ogun, shiftOverrunAlert: enable },
        Benin: { ...preferences.hubs.Benin, shiftOverrunAlert: enable }
      }
    };
    onUpdatePreferences(updated);
    saveTelemetryPreferences(updated);
    triggerSaveFeedback();
  };

  const handleToggleAllIdle = (enable: boolean) => {
    const updated: TelemetryPreferencesConfig = {
      ...preferences,
      hubs: {
        Lagos: { ...preferences.hubs.Lagos, idleBreachAlert: enable },
        Ibadan: { ...preferences.hubs.Ibadan, idleBreachAlert: enable },
        Ogun: { ...preferences.hubs.Ogun, idleBreachAlert: enable },
        Benin: { ...preferences.hubs.Benin, idleBreachAlert: enable }
      }
    };
    onUpdatePreferences(updated);
    saveTelemetryPreferences(updated);
    triggerSaveFeedback();
  };

  const handleResetToDefaults = () => {
    onUpdatePreferences(DEFAULT_TELEMETRY_PREFERENCES);
    saveTelemetryPreferences(DEFAULT_TELEMETRY_PREFERENCES);
    setTempGlobalThreshold(30);
    triggerSaveFeedback();
  };

  const triggerSaveFeedback = () => {
    setShowSavedFeedback(true);
    setTimeout(() => setShowSavedFeedback(false), 2200);
  };

  const hubKeys: Array<'Lagos' | 'Ibadan' | 'Ogun' | 'Benin'> = ['Lagos', 'Ibadan', 'Ogun', 'Benin'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
      {/* Light backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Main Modal Container */}
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-white border border-slate-200/90 rounded-[16px] shadow-2xl flex flex-col overflow-hidden z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Alert Settings & Notification Rules
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  SUPER ADMIN
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Turn alerts on or off for each store and choose how many minutes of inactivity trigger a warning (default 30 mins).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {showSavedFeedback && (
              <span className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg animate-pulse">
                <Check className="w-3.5 h-3.5" />
                <span>Settings Saved</span>
              </span>
            )}

            <button
              onClick={handleResetToDefaults}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium transition-all shadow-sm"
              title="Reset limits to 30 mins and turn on all alert types"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Reset Defaults</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-sm bg-white">
          {/* 1. Global Baseline & Master Controls */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/70">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-xs uppercase tracking-wider text-slate-700">
                  Default Inactivity Limit
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  (Standard: 30 minutes)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleToggleAllOverrun(true);
                    handleToggleAllIdle(true);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-medium transition-colors"
                >
                  Turn On All Alerts
                </button>
                <button
                  onClick={() => {
                    handleToggleAllOverrun(false);
                    handleToggleAllIdle(false);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-medium transition-colors"
                >
                  Silence All Alerts
                </button>
              </div>
            </div>

            {/* Global Threshold Selector with Quick Chips */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs text-slate-700 font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Set Inactivity Limit for All Stores:</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold font-mono text-emerald-600">
                    {tempGlobalThreshold} min
                  </span>
                  <button
                    onClick={() => handleApplyThresholdToAll(tempGlobalThreshold)}
                    className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply to All 4 Stores</span>
                  </button>
                </div>
              </div>

              {/* Slider */}
              <div className="flex items-center gap-4">
                <span className="text-[11px] font-mono text-slate-400">5m</span>
                <input
                  type="range"
                  min="5"
                  max="120"
                  step="5"
                  value={tempGlobalThreshold}
                  onChange={(e) => setTempGlobalThreshold(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <span className="text-[11px] font-mono text-slate-400">120m</span>
              </div>

              {/* Preset Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] text-slate-400">Presets:</span>
                {PRESET_THRESHOLDS.map((val) => (
                  <button
                    key={val}
                    onClick={() => {
                      setTempGlobalThreshold(val);
                      handleApplyThresholdToAll(val);
                    }}
                    className={`px-2.5 py-0.5 rounded text-xs font-mono transition-all ${
                      tempGlobalThreshold === val
                        ? 'bg-emerald-500 text-white font-bold shadow-sm'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {val}m {val === 30 ? '(Standard)' : ''}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Hub Filter Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'all'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Hubs Matrix (4)
            </button>
            {hubKeys.map((hub) => {
              const meta = HUB_METADATA[hub];
              const pref = preferences.hubs[hub];
              return (
                <button
                  key={hub}
                  onClick={() => setActiveTab(hub)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${
                    activeTab === hub
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: meta.color }}
                  />
                  <span>{hub} Hub</span>
                  <span className="text-[10px] font-mono text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    {pref.idleThresholdMinutes}m
                  </span>
                </button>
              );
            })}
          </div>

          {/* 3. Hub Cards Grid / Filtered Hub Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hubKeys
              .filter((h) => activeTab === 'all' || activeTab === h)
              .map((hubKey) => {
                const meta = HUB_METADATA[hubKey];
                const pref = preferences.hubs[hubKey];
                const telemetry = regionalTelemetry[hubKey];
                const currentIdleMinutes = telemetry
                  ? Math.floor((Date.now() - telemetry.lastPingTime) / 60000)
                  : 0;
                const isCurrentlyIdleBreached =
                  pref.idleBreachAlert && currentIdleMinutes >= pref.idleThresholdMinutes;

                return (
                  <div
                    key={hubKey}
                    className="p-4 rounded-[12px] bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
                  >
                    {/* Hub Card Top Row */}
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: meta.color }}
                          />
                          <h3 className="font-bold text-sm text-slate-900">{pref.hubDisplayName}</h3>
                        </div>
                        <span className="text-[11px] font-mono text-slate-500">
                          {meta.terminals} Terminals
                        </span>
                      </div>

                      <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Area: <strong className="text-slate-700">{meta.sector}</strong></span>
                        <span>Shift: <strong className="text-slate-700 font-mono">{meta.opening} - {meta.closing}</strong></span>
                      </div>

                      {/* Live Ping Status */}
                      <div className="mt-2 p-2 rounded-lg bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Activity className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-slate-500 text-[11px]">Last Signal:</span>
                          <span className="font-mono font-bold text-slate-800">
                            {currentIdleMinutes}m ago
                          </span>
                        </div>

                        <div>
                          {isCurrentlyIdleBreached ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              <span>INACTIVE (&gt;{pref.idleThresholdMinutes}m)</span>
                            </span>
                          ) : !pref.idleBreachAlert ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-500 bg-slate-100 border border-slate-200">
                              ALERT MUTED
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>ACTIVE (&lt;{pref.idleThresholdMinutes}m)</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Alert Types Toggles */}
                    <div className="space-y-3 pt-2 border-t border-slate-100">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Alert Settings for this Location
                      </div>

                      {/* 1. Shift Overrun Toggle */}
                      <div className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-slate-50/70 border border-slate-200/60">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-800">
                              Late Shift Alert
                            </span>
                            <span className="text-[10px] font-mono text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                              Past 9:00 PM
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-tight">
                            Notify me if card machines are still active past the 9:00 PM closing time.
                          </p>
                        </div>

                        <button
                          onClick={() => handleToggleOverrun(hubKey)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            pref.shiftOverrunAlert ? 'bg-emerald-500' : 'bg-slate-300'
                          }`}
                          role="switch"
                          aria-checked={pref.shiftOverrunAlert}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                              pref.shiftOverrunAlert ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {/* 2. Idle Breach Toggle */}
                      <div className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-slate-50/70 border border-slate-200/60">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-800">
                              Machine Inactive Alert
                            </span>
                            <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                              No Signal
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-tight">
                            Notify me if card machines have not sent any signal for longer than the allowed time limit.
                          </p>
                        </div>

                        <button
                          onClick={() => handleToggleIdle(hubKey)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            pref.idleBreachAlert ? 'bg-amber-500' : 'bg-slate-300'
                          }`}
                          role="switch"
                          aria-checked={pref.idleBreachAlert}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                              pref.idleBreachAlert ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {/* 3. Custom Alert Threshold for Idle Time */}
                      <div className="p-3 rounded-lg bg-slate-50/70 border border-slate-200/60 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Max Allowed Inactive Time:</span>
                          </label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="5"
                              max="180"
                              value={pref.idleThresholdMinutes}
                              onChange={(e) =>
                                handleUpdateThreshold(hubKey, parseInt(e.target.value, 10) || 5)
                              }
                              className="w-14 bg-white text-slate-900 font-mono font-bold text-xs text-center py-1 rounded border border-slate-300 focus:border-emerald-500 outline-none"
                            />
                            <span className="text-xs font-mono text-slate-500">mins</span>
                          </div>
                        </div>

                        {/* Slider */}
                        <input
                          type="range"
                          min="5"
                          max="90"
                          step="5"
                          value={pref.idleThresholdMinutes}
                          onChange={(e) => handleUpdateThreshold(hubKey, Number(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />

                        {/* Preset Buttons */}
                        <div className="flex items-center justify-between gap-1 pt-1">
                          {[15, 20, 30, 45, 60].map((preset) => (
                            <button
                              key={preset}
                              onClick={() => handleUpdateThreshold(hubKey, preset)}
                              className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
                                pref.idleThresholdMinutes === preset
                                  ? 'bg-emerald-500 text-white font-bold'
                                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                              }`}
                            >
                              {preset}m
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* 4. Information Box */}
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
            <div className="space-y-1">
              <span className="font-semibold text-blue-950">Live Monitor Rule:</span>
              <p className="text-blue-800 leading-relaxed">
                Store check-ins are verified automatically against business schedules. Changing these minutes will immediately update the live alert triggers across the dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Bar */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 font-mono">
            {preferences.lastUpdatedWat ? (
              <span>Last saved: <strong className="text-slate-700">{preferences.lastUpdatedWat}</strong></span>
            ) : (
              <span>Standard Settings Active</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs shadow-sm transition-all active:scale-95"
            >
              Done &amp; Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
