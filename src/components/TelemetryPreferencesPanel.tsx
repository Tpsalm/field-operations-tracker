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
    color: '#92C842',
    sector: 'Ikeja, Marina & Victoria Island',
    terminals: 38
  },
  Ibadan: {
    opening: '07:30 WAT',
    closing: '21:00 WAT',
    color: '#F17F31',
    sector: 'Dugbe, Bodija & Iwo Road',
    terminals: 18
  },
  Ogun: {
    opening: '08:00 WAT',
    closing: '21:00 WAT',
    color: '#3B82F6',
    sector: 'Abeokuta, Sagamu & Ota',
    terminals: 12
  },
  Benin: {
    opening: '08:00 WAT',
    closing: '21:00 WAT',
    color: '#A855F7',
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
      {/* Dark backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Main Modal Container */}
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-[#0c1427] border border-[#1e2d4d] rounded-2xl shadow-2xl flex flex-col overflow-hidden z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-[#1e2d4d] bg-[#090e1c] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#92C842]/10 text-[#92C842] border border-[#92C842]/30 shadow-inner">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Telemetry Preferences &amp; Alert Rules
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#92C842]/15 text-[#92C842] border border-[#92C842]/30">
                  EXECUTIVE SUITE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Toggle automated alert types per hub and customize idle breach thresholds (default 30m).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {showSavedFeedback && (
              <span className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-[#92C842] bg-[#92C842]/10 border border-[#92C842]/30 px-2.5 py-1 rounded-lg animate-pulse">
                <Check className="w-3.5 h-3.5" />
                <span>Saved to WAT Session</span>
              </span>
            )}

            <button
              onClick={handleResetToDefaults}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#151f38] hover:bg-[#1a2745] text-slate-300 hover:text-white border border-[#1e2d4d] text-xs font-medium transition-all"
              title="Reset idle thresholds to 30m and re-enable all alert types"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Reset Defaults</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#151f38] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-sm">
          {/* 1. Global Baseline & Master Controls */}
          <div className="p-4 rounded-xl bg-[#0e172c] border border-[#1e2d4d] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1e2d4d]/60">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#92C842]" />
                <span className="font-bold text-xs uppercase tracking-wider text-slate-300">
                  Global Baseline Threshold
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  (Currently fixed standard: 30 minutes)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleToggleAllOverrun(true);
                    handleToggleAllIdle(true);
                  }}
                  className="px-2.5 py-1 rounded bg-[#92C842]/10 hover:bg-[#92C842]/20 text-[#92C842] border border-[#92C842]/30 text-xs font-mono font-medium"
                >
                  Enable All Alerts
                </button>
                <button
                  onClick={() => {
                    handleToggleAllOverrun(false);
                    handleToggleAllIdle(false);
                  }}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 text-xs font-mono font-medium"
                >
                  Mute All Alerts
                </button>
              </div>
            </div>

            {/* Global Threshold Selector with Quick Chips */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#F17F31]" />
                  <span>Batch Idle Threshold for All Hubs:</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold font-mono text-[#92C842]">
                    {tempGlobalThreshold} min
                  </span>
                  <button
                    onClick={() => handleApplyThresholdToAll(tempGlobalThreshold)}
                    className="px-3 py-1 rounded-lg bg-[#92C842] hover:bg-[#7bb32e] text-[#090e1c] font-bold text-xs transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply to All 4 Hubs</span>
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
                  className="w-full h-2 bg-[#151f38] rounded-lg appearance-none cursor-pointer accent-[#92C842]"
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
                        ? 'bg-[#92C842] text-[#090e1c] font-bold shadow-sm'
                        : 'bg-[#151f38] text-slate-300 hover:text-white border border-[#1e2d4d]'
                    }`}
                  >
                    {val}m {val === 30 ? '(Standard)' : ''}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Hub Filter Tabs */}
          <div className="flex items-center gap-2 border-b border-[#1e2d4d] pb-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'all'
                  ? 'bg-[#92C842]/15 text-[#92C842] border border-[#92C842]/40 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-[#151f38]'
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
                      ? 'bg-[#151f38] text-white border border-[#92C842]/50 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-[#151f38]/60'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: meta.color }}
                  />
                  <span>{hub} Hub</span>
                  <span className="text-[10px] font-mono text-slate-400 bg-[#090e1c] px-1.5 py-0.2 rounded border border-[#1e2d4d]">
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
                    className="p-4 rounded-xl bg-[#0e172c] border border-[#1e2d4d] flex flex-col justify-between space-y-4 hover:border-slate-600/60 transition-all"
                  >
                    {/* Hub Card Top Row */}
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: meta.color }}
                          />
                          <h3 className="font-bold text-sm text-white">{pref.hubDisplayName}</h3>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">
                          {meta.terminals} Terminals
                        </span>
                      </div>

                      <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Sector: <strong className="text-slate-300">{meta.sector}</strong></span>
                        <span>Hours: <strong className="text-slate-300 font-mono">{meta.opening} - {meta.closing}</strong></span>
                      </div>

                      {/* Live Telemetry Ping Status */}
                      <div className="mt-2 p-2 rounded-lg bg-[#090e1c] border border-[#1e2d4d]/80 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Activity className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-slate-400 text-[11px]">Heartbeat:</span>
                          <span className="font-mono font-bold text-white">
                            {currentIdleMinutes}m ago
                          </span>
                        </div>

                        <div>
                          {isCurrentlyIdleBreached ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F17F31]/20 text-[#F17F31] border border-[#F17F31]/40 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>BREACH (&gt;{pref.idleThresholdMinutes}m)</span>
                            </span>
                          ) : !pref.idleBreachAlert ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700">
                              ALERT MUTED
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#92C842]/15 text-[#92C842] border border-[#92C842]/30 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>OK (&lt;{pref.idleThresholdMinutes}m)</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Alert Types Toggles */}
                    <div className="space-y-3 pt-2 border-t border-[#1e2d4d]/60">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Alert Types Configuration
                      </div>

                      {/* 1. Shift Overrun Toggle */}
                      <div className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-[#090e1c] border border-[#1e2d4d]">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-white">
                              Shift Overrun Alert
                            </span>
                            <span className="text-[10px] font-mono text-[#E05252] bg-[#E05252]/10 px-1.5 py-0.2 rounded border border-[#E05252]/20">
                              &gt;21:00 WAT
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-tight">
                            Alert if POS terminals continue recording active sales telemetry past 21:00 WAT closing cutoff.
                          </p>
                        </div>

                        <button
                          onClick={() => handleToggleOverrun(hubKey)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            pref.shiftOverrunAlert ? 'bg-[#92C842]' : 'bg-slate-700'
                          }`}
                          role="switch"
                          aria-checked={pref.shiftOverrunAlert}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                              pref.shiftOverrunAlert ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {/* 2. Idle Breach Toggle */}
                      <div className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-[#090e1c] border border-[#1e2d4d]">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-white">
                              Idle Breach Alert
                            </span>
                            <span className="text-[10px] font-mono text-[#F17F31] bg-[#F17F31]/10 px-1.5 py-0.2 rounded border border-[#F17F31]/20">
                              Heartbeat Loss
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-tight">
                            Alert if hub reports no merchandiser heartbeat for longer than the custom idle threshold post-opening.
                          </p>
                        </div>

                        <button
                          onClick={() => handleToggleIdle(hubKey)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            pref.idleBreachAlert ? 'bg-[#F17F31]' : 'bg-slate-700'
                          }`}
                          role="switch"
                          aria-checked={pref.idleBreachAlert}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                              pref.idleBreachAlert ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {/* 3. Custom Alert Threshold for Idle Time */}
                      <div className="p-3 rounded-lg bg-[#090e1c] border border-[#1e2d4d] space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#92C842]" />
                            <span>Custom Idle Threshold:</span>
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
                              className="w-14 bg-[#151f38] text-white font-mono font-bold text-xs text-center py-1 rounded border border-[#1e2d4d] focus:border-[#92C842] outline-none"
                            />
                            <span className="text-xs font-mono text-slate-400">mins</span>
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
                          className="w-full h-1.5 bg-[#151f38] rounded-lg appearance-none cursor-pointer accent-[#92C842]"
                        />

                        {/* Preset Buttons */}
                        <div className="flex items-center justify-between gap-1 pt-1">
                          {[15, 20, 30, 45, 60].map((preset) => (
                            <button
                              key={preset}
                              onClick={() => handleUpdateThreshold(hubKey, preset)}
                              className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
                                pref.idleThresholdMinutes === preset
                                  ? 'bg-[#92C842] text-[#090e1c] font-bold'
                                  : 'bg-[#151f38] text-slate-400 hover:text-white border border-[#1e2d4d]'
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
          <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-start gap-2.5">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-400" />
            <div className="space-y-1">
              <span className="font-semibold text-white">Live Execution Architecture:</span>
              <p className="text-slate-300 leading-relaxed">
                Telemetry thresholds are evaluated every 10 seconds against store shift schedules. Modifying idle thresholds will dynamically re-evaluate current hub telemetry heartbeats, immediately clearing false alarms or highlighting actual prolonged silence.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Bar */}
        <div className="px-6 py-3.5 border-t border-[#1e2d4d] bg-[#090e1c] flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400 font-mono">
            {preferences.lastUpdatedWat ? (
              <span>Last saved: <strong className="text-slate-300">{preferences.lastUpdatedWat}</strong></span>
            ) : (
              <span>Standard WAT Corporate Configuration</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#92C842] hover:bg-[#7bb32e] text-[#090e1c] font-bold text-xs shadow-md shadow-[#92C842]/20 transition-all active:scale-95"
            >
              Done &amp; Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
