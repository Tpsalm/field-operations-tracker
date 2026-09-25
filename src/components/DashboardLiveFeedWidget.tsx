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
        return <DollarSign className="w-3.5 h-3.5 text-emerald-600" />;
      case 'insurance':
        return <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />;
      case 'gps':
        return <Compass className="w-3.5 h-3.5 text-blue-600" />;
      case 'compliance':
        return <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-emerald-600" />;
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col animate-slide-left">
      {/* HEADER */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping absolute" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Live Operations Feed</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                ACTIVE
              </span>
            </h3>
            <span className="text-[11px] text-slate-500">
              Synced {lastSyncText}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => triggerSync?.()}
            disabled={isSyncing}
            className="p-1.5 rounded-lg bg-white hover:bg-slate-50 text-emerald-700 border border-slate-200 transition-all disabled:opacity-50 shadow-xs"
            title="Sync now"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* POLLING INTERVAL CONTROLS */}
      <div className="px-4 py-2.5 bg-white border-b border-slate-200 flex items-center justify-between text-xs">
        <span className="text-slate-600 text-[11px] font-semibold uppercase flex items-center gap-1.5">
          <Radio className="w-3.5 h-3.5 text-emerald-600" />
          Refresh Rate:
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
                  ? 'bg-emerald-500 text-white font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
            className="p-3 rounded-xl bg-slate-50/80 border border-slate-200 hover:border-emerald-300 transition-colors space-y-1.5 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="p-1 rounded-lg bg-white border border-slate-200 shadow-xs">
                  {getCategoryIcon(evt.category)}
                </span>
                <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {evt.title}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                {evt.timestamp}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed pl-6">
              {evt.description}
            </p>

            <div className="flex items-center gap-2 pl-6 pt-1 text-[10px] text-slate-500 font-mono">
              {evt.location && (
                <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-700">
                  📍 {evt.location}
                </span>
              )}
              {evt.staffName && (
                <span className="bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-emerald-700 font-semibold">
                  👤 {evt.staffName}
                </span>
              )}
            </div>
          </div>
        ))}

        {events.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-xs">
            Connecting to live operational stream...
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="p-3 bg-slate-50/80 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
        <span className="flex items-center gap-1 font-medium">
          <Zap className="w-3 h-3 text-emerald-600" />
          Live Stream Active
        </span>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-slate-800 font-medium"
        >
          Close
        </button>
      </div>
    </div>
  );
};
