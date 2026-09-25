import React from 'react';
import { 
  Radio, 
  Activity, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Compass, 
  ShieldCheck, 
  DollarSign, 
  X,
  Zap
} from 'lucide-react';
import { LiveStreamEvent } from '../services/dashboardRealtimeService';
import { PollingInterval } from '../hooks/useRealtimeDashboard';

interface DashboardLiveFeedWidgetProps {
  events: LiveStreamEvent[];
  isSyncing: boolean;
  lastSyncText?: string;
  pollingInterval: PollingInterval;
  onSetPollingInterval: (interval: PollingInterval) => void;
  onManualSync?: () => void;
  onTriggerSync?: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const DashboardLiveFeedWidget: React.FC<DashboardLiveFeedWidgetProps> = ({
  events,
  isSyncing,
  lastSyncText = 'Just now',
  pollingInterval,
  onSetPollingInterval,
  onManualSync,
  onTriggerSync,
  isOpen,
  onClose
}) => {
  const triggerSync = onTriggerSync || onManualSync;
  if (!isOpen) return null;

  const getCategoryIcon = (category: LiveStreamEvent['category']) => {
    switch (category) {
      case 'funding':
        return <DollarSign className="w-3.5 h-3.5 text-emerald-400" />;
      case 'insurance':
        return <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />;
      case 'gps':
        return <Compass className="w-3.5 h-3.5 text-blue-400" />;
      case 'compliance':
        return <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-[#92C842]" />;
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#0b1222] border-l border-[#1e2d4d] shadow-2xl flex flex-col animate-slide-left">
      {/* HEADER */}
      <div className="p-4 border-b border-[#1e2d4d] bg-[#0e1628] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping absolute" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Live Operations Feed</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                ACTIVE
              </span>
            </h3>
            <span className="text-[11px] text-slate-400">
              Synced {lastSyncText} • WAT Network
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => triggerSync?.()}
            disabled={isSyncing}
            className="p-1.5 rounded-lg bg-[#151f38] hover:bg-[#1e2d4d] text-[#92C842] border border-[#1e2d4d] transition-all disabled:opacity-50"
            title="Manual sync now"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#151f38] hover:bg-[#1e2d4d] text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* POLLING INTERVAL CONTROLS */}
      <div className="px-4 py-2.5 bg-[#0e172b] border-b border-[#1e2d4d] flex items-center justify-between text-xs">
        <span className="text-slate-400 text-[11px] font-semibold uppercase flex items-center gap-1.5">
          <Radio className="w-3.5 h-3.5 text-[#92C842]" />
          Stream Polling:
        </span>
        <div className="flex items-center gap-1">
          {([
            { label: '3s', val: 3000 },
            { label: '5s', val: 5000 },
            { label: '10s', val: 10000 },
            { label: 'Pause', val: 0 }
          ] as { label: string; val: PollingInterval }[]).map(btn => (
            <button
              key={btn.label}
              onClick={() => onSetPollingInterval(btn.val)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                pollingInterval === btn.val
                  ? 'bg-[#92C842] text-black font-bold'
                  : 'bg-[#151f38] text-slate-300 hover:text-white'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* EVENT STREAM LIST */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {events.map((evt, idx) => (
          <div 
            key={evt.id || idx}
            className="p-3 rounded-xl bg-[#0e1628] border border-[#1e2d4d] hover:border-[#92C842]/40 transition-colors space-y-1.5 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="p-1 rounded bg-[#151f38] border border-[#1e2d4d]">
                  {getCategoryIcon(evt.category)}
                </span>
                <span className="text-xs font-bold text-white group-hover:text-[#92C842] transition-colors">
                  {evt.title}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                {evt.timestamp}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed pl-6">
              {evt.description}
            </p>

            <div className="flex items-center gap-2 pl-6 pt-1 text-[10px] text-slate-400 font-mono">
              {evt.location && (
                <span className="bg-[#151f38] px-1.5 py-0.5 rounded text-slate-300">
                  📍 {evt.location}
                </span>
              )}
              {evt.staffName && (
                <span className="bg-[#151f38] px-1.5 py-0.5 rounded text-[#92C842]">
                  👤 {evt.staffName}
                </span>
              )}
            </div>
          </div>
        ))}

        {events.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-xs">
            Connecting to live operational telemetry stream...
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="p-3 bg-[#0e1628] border-t border-[#1e2d4d] text-[11px] text-slate-500 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <Zap className="w-3 h-3 text-[#92C842]" />
          WebSocket / Polling Active
        </span>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white"
        >
          Close
        </button>
      </div>
    </div>
  );
};
