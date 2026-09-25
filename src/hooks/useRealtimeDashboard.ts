import { useState, useEffect, useCallback } from 'react';
import { 
  dashboardRealtimeService, 
  LiveDashboardMetrics, 
  LiveStreamEvent 
} from '../services/dashboardRealtimeService';
import { UnifiedRecord } from '../data/liveVsrTrackerData';

export type PollingInterval = 0 | 3000 | 5000 | 10000 | 30000;

export interface DrillDownState {
  isOpen: boolean;
  filterKey: string;
  extraParam?: string;
  title: string;
  description: string;
  records: UnifiedRecord[];
  badgeColor: string;
}

export function useRealtimeDashboard(initialInterval: PollingInterval = 10000) {
  const [metrics, setMetrics] = useState<LiveDashboardMetrics>(() => 
    dashboardRealtimeService.computeMetricsFromSource()
  );
  const [events, setEvents] = useState<LiveStreamEvent[]>([]);
  const [pollingInterval, setPollingInterval] = useState<PollingInterval>(initialInterval);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncText, setLastSyncText] = useState<string>('Just now');
  const [isFeedDrawerOpen, setIsFeedDrawerOpen] = useState<boolean>(false);
  
  // Drill-down modal state
  const [drillDown, setDrillDown] = useState<DrillDownState>({
    isOpen: false,
    filterKey: '',
    title: '',
    description: '',
    records: [],
    badgeColor: '#82c332'
  });

  // Subscribe to service updates
  useEffect(() => {
    const unsubscribe = dashboardRealtimeService.subscribe((newMetrics, newEvents) => {
      setMetrics(newMetrics);
      setEvents(newEvents);
    });
    return () => unsubscribe();
  }, []);

  // Polling interval timer
  useEffect(() => {
    if (pollingInterval === 0) return;

    const intervalId = setInterval(async () => {
      try {
        setIsSyncing(true);
        await dashboardRealtimeService.syncTelemetry();
      } catch (err) {
        console.error('Telemetry polling error:', err);
      } finally {
        setIsSyncing(false);
      }
    }, pollingInterval);

    return () => clearInterval(intervalId);
  }, [pollingInterval]);

  // Relative time tracker for "last updated"
  useEffect(() => {
    const timer = setInterval(() => {
      if (!metrics.lastUpdated) return;
      const secondsAgo = Math.floor((Date.now() - new Date(metrics.lastUpdated).getTime()) / 1000);
      if (secondsAgo < 5) {
        setLastSyncText('Just now');
      } else if (secondsAgo < 60) {
        setLastSyncText(`${secondsAgo}s ago`);
      } else {
        const minsAgo = Math.floor(secondsAgo / 60);
        setLastSyncText(`${minsAgo}m ago`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [metrics.lastUpdated]);

  // Trigger manual refresh
  const triggerManualSync = useCallback(async () => {
    setIsSyncing(true);
    try {
      await dashboardRealtimeService.syncTelemetry();
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Open drill-down modal for any KPI, chart segment, bar, or breakdown row
  const openDrillDown = useCallback((filterKey: string, extraParam?: string) => {
    const drillInfo = dashboardRealtimeService.getDrillDownRecords(filterKey, extraParam);
    setDrillDown({
      isOpen: true,
      filterKey,
      extraParam,
      title: drillInfo.title,
      description: drillInfo.description,
      records: drillInfo.records,
      badgeColor: drillInfo.badgeColor
    });
  }, []);

  const closeDrillDown = useCallback(() => {
    setDrillDown(prev => ({ ...prev, isOpen: false }));
  }, []);

  return {
    metrics,
    events,
    isSyncing,
    lastSyncText,
    pollingInterval,
    setPollingInterval,
    triggerManualSync,
    drillDown,
    openDrillDown,
    closeDrillDown,
    isFeedDrawerOpen,
    setIsFeedDrawerOpen
  };
}
