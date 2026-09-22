import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import {
  Region,
  TenureFilter,
  TabType,
  NavigationScreen,
  StaffRecord,
  Requisition,
  FundingActionLog,
  FieldMerchandiserHub,
  AuthUser,
  SessionMeta
} from './types';
import {
  INITIAL_STAFF_RECORDS,
  PROSPECTIVE_STAFF_RECORDS,
  ARCHIVE_STAFF_RECORDS,
  INITIAL_REQUISITIONS,
  INITIAL_FUNDING_LOGS,
  MERCHANDISER_HUBS
} from './data/mockData';
import { PRESET_CREDENTIALS } from './data/credentialsData';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { SignInPage } from './components/SignInPage';
import { KPIStats } from './components/KPIStats';
import { StaffCard } from './components/StaffCard';
import { RightSidebarWidgets } from './components/RightSidebarWidgets';
import { TelemetrySparkline } from './components/TelemetrySparkline';
import { VSRDashboard } from './components/VSRDashboard';
import { CredentialAdministrationPanel } from './components/CredentialAdministrationPanel';
import { WorkflowCenter } from './components/WorkflowCenter';
import { TelemetryPreferencesConfig } from './types';
import { loadTelemetryPreferences } from './data/telemetryPreferencesData';

const FieldMerchandisersView = lazy(() =>
  import('./components/FieldMerchandisersView').then((module) => ({ default: module.FieldMerchandisersView }))
);
const PerformanceTrendsView = lazy(() =>
  import('./components/PerformanceTrendsView').then((module) => ({ default: module.PerformanceTrendsView }))
);
const ComplianceDashboardView = lazy(() =>
  import('./components/ComplianceDashboardView').then((module) => ({ default: module.ComplianceDashboardView }))
);
const HeadOfficeView = lazy(() =>
  import('./components/HeadOfficeView').then((module) => ({ default: module.HeadOfficeView }))
);
const ArchiveView = lazy(() =>
  import('./components/ArchiveView').then((module) => ({ default: module.ArchiveView }))
);
const NewVSRModal = lazy(() =>
  import('./components/NewVSRModal').then((module) => ({ default: module.NewVSRModal }))
);
const StaffDetailModal = lazy(() =>
  import('./components/StaffDetailModal').then((module) => ({ default: module.StaffDetailModal }))
);
const NotificationDrawer = lazy(() =>
  import('./components/NotificationDrawer').then((module) => ({ default: module.NotificationDrawer }))
);
const ShiftComplianceModal = lazy(() =>
  import('./components/ShiftComplianceModal').then((module) => ({ default: module.ShiftComplianceModal }))
);
const TelemetryPreferencesPanel = lazy(() =>
  import('./components/TelemetryPreferencesPanel').then((module) => ({ default: module.TelemetryPreferencesPanel }))
);

// Store opening hours per Nigerian regional hub (in West Africa Time / WAT)
interface RegionalStoreShiftSchedule {
  region: 'Lagos' | 'Ibadan' | 'Ogun' | 'Benin';
  hubName: string;
  openingHour: number; // WAT hour (e.g. 7 for 07:00 WAT)
  openingMinute: number;
  closingHour: number; // 21:00 WAT closing cutoff
  closingMinute: number;
}

const STORE_OPENING_HOURS: RegionalStoreShiftSchedule[] = [
  { region: 'Lagos', hubName: 'Southwest Hub (Lagos)', openingHour: 7, openingMinute: 0, closingHour: 21, closingMinute: 0 },
  { region: 'Ibadan', hubName: 'Oyo Cluster (Ibadan)', openingHour: 7, openingMinute: 30, closingHour: 21, closingMinute: 0 },
  { region: 'Ogun', hubName: 'Ogun Hub (Abeokuta / Sagamu)', openingHour: 8, openingMinute: 0, closingHour: 21, closingMinute: 0 },
  { region: 'Benin', hubName: 'Edo Sector (Benin)', openingHour: 8, openingMinute: 0, closingHour: 21, closingMinute: 0 }
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem('kea_current_user');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  const captureSessionMeta = (user: AuthUser): AuthUser => {
    const now = new Date();
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

    const fallbackLocation = {
      label: 'Unknown location',
      city: 'Unlocated',
      country: 'Nigeria',
      countryCode: 'NG',
      source: 'fallback' as const
    };

    const sessionMeta: SessionMeta = {
      signedInAt: now.toISOString(),
      timezone: tz,
      location: fallbackLocation
    };

    if (!navigator.geolocation) {
      return {
        ...user,
        lastLogin: now.toLocaleString('en-NG', { timeZone: tz, dateStyle: 'medium', timeStyle: 'short' }),
        sessionMeta
      };
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const cityGuess = latitude > 6.4 && latitude < 7.1 ? 'Lagos' : latitude > 7.2 && latitude < 8.0 ? 'Ibadan' : 'Regional Hub';
        const nextSessionMeta: SessionMeta = {
          signedInAt: now.toISOString(),
          timezone: tz,
          location: {
            latitude,
            longitude,
            label: `${cityGuess} • ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            city: cityGuess,
            country: 'Nigeria',
            countryCode: 'NG',
            accuracy,
            source: 'browser'
          }
        };

        const authenticatedUser = {
          ...user,
          lastLogin: now.toLocaleString('en-NG', { timeZone: tz, dateStyle: 'medium', timeStyle: 'short' }),
          sessionMeta: nextSessionMeta
        };

        setCurrentUser(authenticatedUser);
        localStorage.setItem('kea_current_user', JSON.stringify(authenticatedUser));
      },
      () => {
        const authenticatedUser = {
          ...user,
          lastLogin: now.toLocaleString('en-NG', { timeZone: tz, dateStyle: 'medium', timeStyle: 'short' }),
          sessionMeta
        };
        setCurrentUser(authenticatedUser);
        localStorage.setItem('kea_current_user', JSON.stringify(authenticatedUser));
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );

    return {
      ...user,
      lastLogin: now.toLocaleString('en-NG', { timeZone: tz, dateStyle: 'medium', timeStyle: 'short' }),
      sessionMeta
    };
  };

  const handleSignIn = (user: AuthUser) => {
    const authenticatedUser = captureSessionMeta(user);
    setCurrentUser(authenticatedUser);
    try {
      localStorage.setItem('kea_current_user', JSON.stringify(authenticatedUser));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('kea_current_user');
    } catch (e) {
      console.error(e);
    }
  };

  // Navigation & Filter States
  const [currentScreen, setCurrentScreen] = useState<NavigationScreen>('operations');
  const [selectedRegion, setSelectedRegion] = useState<Region>('All');
  const [tenureFilter, setTenureFilter] = useState<TenureFilter>('All');
  const [currentTab, setCurrentTab] = useState<TabType>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [kpiStatusFilter, setKpiStatusFilter] = useState<'all' | 'funded' | 'unfunded'>('all');

  // Modals & Drawers
  const [isNewVSRModalOpen, setIsNewVSRModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffRecord | null>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isShiftComplianceOpen, setIsShiftComplianceOpen] = useState(false);
  const [isTelemetryPreferencesOpen, setIsTelemetryPreferencesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Executive Telemetry Preferences State (stored in localStorage)
  const [telemetryPreferences, setTelemetryPreferences] = useState<TelemetryPreferencesConfig>(() =>
    loadTelemetryPreferences()
  );

  // Sync Timer & Refresh
  const [syncSeconds, setSyncSeconds] = useState(8);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOverrunSimulated, setIsOverrunSimulated] = useState(false);

  // Regional merchandiser telemetry heartbeats (timestamp in ms)
  // Ibadan is initialized with a >30-minute idle duration (34 mins ago)
  // to evaluate the store opening shift telemetry monitor
  const [regionalTelemetry, setRegionalTelemetry] = useState<
    Record<string, { lastPingTime: number; terminalCount: number }>
  >({
    Lagos: { lastPingTime: Date.now() - 4 * 60 * 1000, terminalCount: 38 },
    Ogun: { lastPingTime: Date.now() - 11 * 60 * 1000, terminalCount: 12 },
    Benin: { lastPingTime: Date.now() - 17 * 60 * 1000, terminalCount: 10 },
    Ibadan: { lastPingTime: Date.now() - 34 * 60 * 1000, terminalCount: 18 }
  });

  // Track triggered breach notifications to prevent duplicate spamming
  const notifiedBreachesRef = React.useRef<Set<string>>(new Set());

  // Interactive telemetry breach alert banner
  const [telemetryAlertBanner, setTelemetryAlertBanner] = useState<{
    type?: 'idle' | 'overrun';
    region?: 'Lagos' | 'Ibadan' | 'Ogun' | 'Benin';
    hubName: string;
    idleMinutes: number;
    shiftTimeStr: string;
    flaggedHubs?: string[];
    thresholdMinutes?: number;
  } | null>(null);

  // Dataset States
  const [activeStaff, setActiveStaff] = useState<StaffRecord[]>(INITIAL_STAFF_RECORDS);
  const [prospectiveStaff, setProspectiveStaff] = useState<StaffRecord[]>(PROSPECTIVE_STAFF_RECORDS);
  const [archiveStaff, setArchiveStaff] = useState<StaffRecord[]>(ARCHIVE_STAFF_RECORDS);
  const [requisitions, setRequisitions] = useState<Requisition[]>(INITIAL_REQUISITIONS);
  const [fundingLogs, setFundingLogs] = useState<FundingActionLog[]>(INITIAL_FUNDING_LOGS);
  const [merchandiserHubs] = useState<FieldMerchandiserHub[]>(MERCHANDISER_HUBS);

  // Notifications State
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'Zenith Bank NIBSS Verification Delay',
      detail: 'Adewale Adeleke (VSR-IB-0891) disbursement placed on hold pending name mismatch clearance.',
      time: '08:30 WAT',
      type: 'alert' as const,
      unread: true
    },
    {
      id: 'notif-2',
      title: 'Batch 29 Capital Disbursed',
      detail: '₦185,000 transferred to Oluwaseun Babatunde; 100% CMS POS stock confirmed.',
      time: '11:15 WAT',
      type: 'success' as const,
      unread: true
    },
    {
      id: 'notif-3',
      title: 'New Candidate Offer Dispatched',
      detail: 'Kehinde Alabi cleared stage 3 interview for Lekki & Ikoyi trade corridor.',
      time: '12:00 WAT',
      type: 'info' as const,
      unread: false
    }
  ]);

  // Live Sync ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setSyncSeconds((prev) => (prev >= 60 ? 1 : prev + 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Periodic check effect: monitors current time against store opening & closing hours
  // 1. Triggers 'Shift Overrun' notification if current time exceeds 21:00 WAT and any hub is still recording active telemetry
  // 2. Triggers 'TELEMETRY IDLE' notification if any region's merchandiser telemetry remains idle for > 30 minutes after shift commencement
  useEffect(() => {
    const checkTelemetryAgainstStoreHours = () => {
      const now = new Date();

      // Extract current time in West Africa Time (WAT: Africa/Lagos - UTC+1)
      const watParts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Africa/Lagos',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).formatToParts(now);

      const realHour = parseInt(watParts.find((p) => p.type === 'hour')?.value || '0', 10);
      const realMinute = parseInt(watParts.find((p) => p.type === 'minute')?.value || '0', 10);

      // Support simulation if enabled (simulates 21:15 WAT to test shift overrun past 21:00 closing)
      const currentHour = isOverrunSimulated ? 21 : realHour;
      const currentMinute = isOverrunSimulated ? 15 : realMinute;
      const currentTotalMinutes = currentHour * 60 + currentMinute;
      const currentWatTimeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')} WAT`;

      // 1. Shift Overrun Check: Triggers if current time exceeds 21:00 WAT,
      // flagging any hubs still recording active telemetry past closing hours.
      const isPastClosingTime = currentTotalMinutes >= 21 * 60 || currentHour >= 21 || (currentHour >= 0 && currentHour < 7);

      if (isPastClosingTime) {
        const activeOverrunHubs = STORE_OPENING_HOURS.filter((schedule) => {
          const hubPref = telemetryPreferences.hubs[schedule.region];
          // Respect executive alert toggle: if shiftOverrunAlert is disabled for this hub, skip
          if (hubPref && !hubPref.shiftOverrunAlert) return false;

          const telemetry = regionalTelemetry[schedule.region];
          if (!telemetry) return false;
          const idleMinutes = Math.floor((Date.now() - telemetry.lastPingTime) / (1000 * 60));
          const hubThreshold = hubPref ? hubPref.idleThresholdMinutes : 30;
          // Active telemetry heartbeats: receiving pings within hub's active threshold
          return idleMinutes < hubThreshold;
        });

        if (activeOverrunHubs.length > 0) {
          const overrunKey = `overrun-${currentHour}-${Math.floor(currentMinute / 15)}`;

          if (!notifiedBreachesRef.current.has(overrunKey)) {
            notifiedBreachesRef.current.add(overrunKey);

            const hubSummary = activeOverrunHubs.map((h) => `${h.hubName} (${h.region})`).join(', ');

            const overrunNotification = {
              id: `notif-shift-overrun-${Date.now()}`,
              title: 'Shift Overrun',
              detail: `Current time (${currentWatTimeStr}) exceeds 21:00 WAT closing hours. Flagged hubs still recording active merchandiser telemetry: ${hubSummary}. Dispatch end-of-day terminal sign-off or confirm overtime authorization.`,
              time: currentWatTimeStr,
              type: 'alert' as const,
              unread: true
            };

            setNotifications((prev) => [overrunNotification, ...prev]);

            setTelemetryAlertBanner({
              type: 'overrun',
              region: activeOverrunHubs[0].region,
              hubName: activeOverrunHubs.map((h) => h.region).join(', '),
              idleMinutes: 0,
              shiftTimeStr: '21:00 WAT',
              flaggedHubs: activeOverrunHubs.map((h) => h.hubName)
            });
          }
        }
      } else {
        // 2. Shift Opening Idle Check: monitors store opening shift commencement with custom idle thresholds
        STORE_OPENING_HOURS.forEach((schedule) => {
          const hubPref = telemetryPreferences.hubs[schedule.region];
          // Respect executive alert toggle: if idleBreachAlert is disabled for this hub, skip
          if (hubPref && !hubPref.idleBreachAlert) return;

          const hubThreshold = hubPref ? hubPref.idleThresholdMinutes : 30;
          const shiftStartMinutes = schedule.openingHour * 60 + schedule.openingMinute;
          const shiftGraceMinutes = shiftStartMinutes + hubThreshold;

          // Telemetry idle time in minutes
          const lastPing = regionalTelemetry[schedule.region]?.lastPingTime || (Date.now() - 35 * 60 * 1000);
          const idleMinutes = Math.floor((Date.now() - lastPing) / (1000 * 60));

          // Shift condition check:
          // If current WAT time is >= threshold minutes after shift start (active trading hours up to 21:00 WAT)
          // or during operating hours, and telemetry is idle for >= custom threshold minutes
          const isPastShiftGrace = currentTotalMinutes >= shiftGraceMinutes && currentTotalMinutes <= 21 * 60;
          const isBreached = (isPastShiftGrace || currentTotalMinutes >= shiftStartMinutes) && idleMinutes >= hubThreshold;

          if (isBreached) {
            const shiftFormatted = `${String(schedule.openingHour).padStart(2, '0')}:${String(schedule.openingMinute).padStart(2, '0')} WAT`;
            // Deduplicate notifications per 15-minute window
            const breachKey = `${schedule.region}-${Math.floor(Date.now() / (1000 * 60 * 15))}`;

            if (!notifiedBreachesRef.current.has(breachKey)) {
              notifiedBreachesRef.current.add(breachKey);

              const breachNotification = {
                id: `notif-telemetry-idle-${schedule.region}-${Date.now()}`,
                title: `⚠️ TELEMETRY IDLE: ${schedule.hubName}`,
                detail: `Store shift commenced at ${shiftFormatted}. Merchandiser telemetry has remained idle for ${idleMinutes} minutes (>${hubThreshold}m threshold) without retail POS heartbeat. Field ops escalation advised.`,
                time: currentWatTimeStr,
                type: 'alert' as const,
                unread: true
              };

              setNotifications((prev) => [breachNotification, ...prev]);

              setTelemetryAlertBanner({
                type: 'idle',
                region: schedule.region,
                hubName: schedule.hubName,
                idleMinutes,
                shiftTimeStr: shiftFormatted,
                thresholdMinutes: hubThreshold
              });
            }
          }
        });
      }
    };

    // Run check immediately on mount
    checkTelemetryAgainstStoreHours();

    // Periodic check interval every 10 seconds
    const intervalTimer = setInterval(checkTelemetryAgainstStoreHours, 10000);
    return () => clearInterval(intervalTimer);
  }, [regionalTelemetry, isOverrunSimulated, telemetryPreferences]);

  // Active synchronization: when telemetry preferences change, re-evaluate active banner
  useEffect(() => {
    if (telemetryAlertBanner?.type === 'idle' && telemetryAlertBanner.region) {
      const hubPref = telemetryPreferences.hubs[telemetryAlertBanner.region];
      if (!hubPref.idleBreachAlert) {
        setTelemetryAlertBanner(null);
      } else {
        const ping = regionalTelemetry[telemetryAlertBanner.region];
        const idleMin = ping ? Math.floor((Date.now() - ping.lastPingTime) / 60000) : 0;
        if (idleMin < hubPref.idleThresholdMinutes) {
          setTelemetryAlertBanner(null);
        }
      }
    } else if (telemetryAlertBanner?.type === 'overrun' && telemetryAlertBanner.region) {
      const hubPref = telemetryPreferences.hubs[telemetryAlertBanner.region];
      if (!hubPref.shiftOverrunAlert) {
        setTelemetryAlertBanner(null);
      }
    }
  }, [telemetryPreferences, regionalTelemetry, telemetryAlertBanner]);

  // Ping and restore telemetry for a specific region
  const handlePingRegionTelemetry = (region: string) => {
    setRegionalTelemetry((prev) => ({
      ...prev,
      [region]: {
        ...prev[region],
        lastPingTime: Date.now()
      }
    }));
    setTelemetryAlertBanner((curr) => (curr?.region === region ? null : curr));

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' WAT';

    setNotifications((prev) => [
      {
        id: `notif-ping-${Date.now()}`,
        title: `Telemetry Heartbeat Restored: ${region}`,
        detail: `Manual telemetry heartbeat signal dispatched to ${region} hub merchandiser POS network. All terminals responding online.`,
        time: timeStr,
        type: 'success',
        unread: true
      },
      ...prev
    ]);
  };

  // Broadcast End-of-Day Shutdown to put active merchandiser hubs to offline/sleep mode
  const handleBroadcastEODShutdown = () => {
    setRegionalTelemetry((prev) => {
      const updated: Record<string, { lastPingTime: number; terminalCount: number }> = {};
      Object.keys(prev).forEach((reg) => {
        updated[reg] = {
          ...prev[reg],
          lastPingTime: Date.now() - 45 * 60 * 1000 // Inactive / powered down
        };
      });
      return updated;
    });

    setTelemetryAlertBanner(null);

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' WAT';

    setNotifications((prev) => [
      {
        id: `notif-eod-shutdown-${Date.now()}`,
        title: 'EOD Terminal Sign-Off Broadcast',
        detail: 'End-of-day shutdown command transmitted to all field merchandiser POS terminals. Retail terminals safely transitioned to sleep mode across all hubs.',
        time: timeStr,
        type: 'success',
        unread: true
      },
      ...prev
    ]);
  };

  // Force Refresh Handler
  const handleForceRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setSyncSeconds(0);
      setRegionalTelemetry({
        Lagos: { lastPingTime: Date.now(), terminalCount: 38 },
        Ibadan: { lastPingTime: Date.now(), terminalCount: 18 },
        Ogun: { lastPingTime: Date.now(), terminalCount: 12 },
        Benin: { lastPingTime: Date.now(), terminalCount: 10 }
      });
      setTelemetryAlertBanner(null);
      setIsRefreshing(false);
    }, 800);
  };

  // Add Directive to Staff Thread
  const handleSendDirective = (staffId: string, text: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updateStaffList = (list: StaffRecord[]) =>
      list.map((item) => {
        if (item.id === staffId) {
          const newMsg = {
            id: `msg-${Date.now()}`,
            sender: 'CEO',
            role: 'CEO' as const,
            text,
            time: timeStr
          };
          return {
            ...item,
            thread: [...item.thread, newMsg]
          };
        }
        return item;
      });

    setActiveStaff(updateStaffList);
    setProspectiveStaff(updateStaffList);

    if (selectedStaff && selectedStaff.id === staffId) {
      setSelectedStaff((prev) =>
        prev
          ? {
              ...prev,
              thread: [
                ...prev.thread,
                {
                  id: `msg-${Date.now()}`,
                  sender: 'CEO',
                  role: 'CEO' as const,
                  text,
                  time: timeStr
                }
              ]
            }
          : null
      );
    }
  };

  // Create New VSR
  const handleAddVSR = (newRep: StaffRecord) => {
    setActiveStaff((prev) => [newRep, ...prev]);
    // Also record in notifications
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: `New VSR Enrolled: ${newRep.name}`,
        detail: `${newRep.code} assigned to ${newRep.location} (${newRep.region}).`,
        time: 'Just now',
        type: 'info',
        unread: true
      },
      ...prev
    ]);
  };

  // Toggle Staff Funding Status
  const handleToggleStatus = (staffId: string) => {
    setActiveStaff((prev) =>
      prev.map((s) => {
        if (s.id === staffId) {
          const wasFunded = s.status === 'funded';
          const newStatus = wasFunded ? 'unfunded' : 'funded';
          const newLabel = wasFunded ? 'UNFUNDED / PENDING VERIFICATION' : 'FUNDED ON 29TH';
          return {
            ...s,
            status: newStatus,
            statusLabel: newLabel,
            boxType: wasFunded ? 'blocker' : 'audit'
          };
        }
        return s;
      })
    );
    if (selectedStaff && selectedStaff.id === staffId) {
      setSelectedStaff((prev) =>
        prev
          ? {
              ...prev,
              status: prev.status === 'funded' ? 'unfunded' : 'funded',
              statusLabel: prev.status === 'funded' ? 'UNFUNDED / PENDING VERIFICATION' : 'FUNDED ON 29TH'
            }
          : null
      );
    }
  };

  // Disburse Funding Action
  const handleDisburseFunding = (staffId: string, amount: number) => {
    const staff = activeStaff.find((s) => s.id === staffId);
    if (!staff) return;

    handleToggleStatus(staffId);

    const newLog: FundingActionLog = {
      id: `log-${Date.now()}`,
      amountText: `₦${amount.toLocaleString()} Disbursed`,
      time: 'Just now',
      description: `${staff.name} (${staff.code}) via Instant Paystack Transfer`,
      type: 'disbursed'
    };

    setFundingLogs((prev) => [newLog, ...prev]);
  };

  // Restore staff from archive
  const handleRestoreStaff = (staffId: string) => {
    const staffToRestore = archiveStaff.find((s) => s.id === staffId);
    if (!staffToRestore) return;

    setArchiveStaff((prev) => prev.filter((s) => s.id !== staffId));
    setActiveStaff((prev) => [
      {
        ...staffToRestore,
        status: 'unfunded',
        statusLabel: 'UNFUNDED / PENDING VERIFICATION',
        boxType: 'onboarding',
        boxHeaderTitle: 'RE-INDUCTION TELEMETRY ENROLLMENT',
        boxHeaderTag: 'STEP 1: REACTIVATED'
      },
      ...prev
    ]);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['ID,Name,Code,Region,Location,Tenure,Phone,Status,Loan_Status,Allocation'];
    const rows = activeStaff.map((s) =>
      `"${s.id}","${s.name}","${s.code}","${s.region}","${s.location}","${s.tenureDisplay}","${s.phone}","${s.statusLabel}","${s.loanLabel}","₦${(s.allocationAmount || 0).toLocaleString()}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kea-vsr-operations-${selectedRegion.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter Active Staff Records
  const filteredStaffList = useMemo(() => {
    let list: StaffRecord[] = [];
    if (currentTab === 'active') {
      list = activeStaff;
    } else if (currentTab === 'prospective') {
      list = prospectiveStaff;
    } else {
      list = archiveStaff;
    }

    // Filter by Region
    if (selectedRegion !== 'All') {
      list = list.filter((s) => s.region === selectedRegion);
    }

    // Filter by KPI status (funded vs unfunded)
    if (kpiStatusFilter !== 'all' && currentTab === 'active') {
      list = list.filter((s) => s.status === kpiStatusFilter);
    }

    // Filter by Tenure
    if (tenureFilter === '0–3 Mo (New)') {
      list = list.filter((s) => s.tenureMonths <= 3);
    } else if (tenureFilter === '3–6 Mo (Mid)') {
      list = list.filter((s) => s.tenureMonths > 3 && s.tenureMonths <= 6);
    } else if (tenureFilter === '6+ Mo') {
      list = list.filter((s) => s.tenureMonths > 6);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.code.toLowerCase().includes(q) ||
          s.phone.toLowerCase().includes(q) ||
          s.location.toLowerCase().includes(q)
      );
    }

    return list;
  }, [currentTab, activeStaff, prospectiveStaff, archiveStaff, selectedRegion, kpiStatusFilter, tenureFilter, searchQuery]);

  // Pagination calculation
  const itemsPerPage = 4;
  const totalPages = Math.max(1, Math.ceil(filteredStaffList.length / itemsPerPage));
  const paginatedStaff = filteredStaffList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const enrichedMerchandiserHubs = useMemo(() => {
    const now = new Date();
    const watParts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Africa/Lagos',
      hour: '2-digit',
      hour12: false
    }).formatToParts(now);
    const realHour = parseInt(watParts.find((p) => p.type === 'hour')?.value || '0', 10);
    const currentHour = isOverrunSimulated ? 21 : realHour;
    const isPastClosing = currentHour >= 21 || (currentHour >= 0 && currentHour < 7);

    return merchandiserHubs.map((hub) => {
      const schedule = STORE_OPENING_HOURS.find((s) => s.region === hub.hub);
      const ping = regionalTelemetry[hub.hub];
      const idleMin = ping ? Math.floor((Date.now() - ping.lastPingTime) / 60000) : 0;
      const shiftStr = schedule
        ? `${String(schedule.openingHour).padStart(2, '0')}:${String(schedule.openingMinute).padStart(2, '0')} WAT`
        : '08:00 WAT';

      const hubPref = telemetryPreferences.hubs[hub.hub];
      const hubThreshold = hubPref ? hubPref.idleThresholdMinutes : 30;
      const overrunEnabled = hubPref ? hubPref.shiftOverrunAlert : true;
      const idleEnabled = hubPref ? hubPref.idleBreachAlert : true;

      const isOverrun = overrunEnabled && isPastClosing && idleMin < hubThreshold;
      const isIdleBreached = idleEnabled && idleMin >= hubThreshold;

      return {
        ...hub,
        shiftStart: shiftStr,
        telemetryIdleMinutes: idleMin,
        isShiftOverrun: isOverrun,
        isIdleBreached,
        idleThresholdMinutes: hubThreshold,
        idleAlertEnabled: idleEnabled,
        overrunAlertEnabled: overrunEnabled
      };
    });
  }, [merchandiserHubs, regionalTelemetry, isOverrunSimulated, telemetryPreferences]);

  // Counts for filters
  const regionCounts = useMemo(() => {
    return {
      All: 184,
      Lagos: 92,
      Ibadan: 41,
      Ogun: 29,
      Benin: 22
    };
  }, []);

  const hasUnreadAlerts = notifications.some((n) => n.unread);

  if (!currentUser) {
    return (
      <SignInPage
        onSignIn={handleSignIn}
        defaultEmail="tope.balogun@keahospitality.ng"
      />
    );
  }

  if (currentUser.platform === 'vsr') {
    return <VSRDashboard user={currentUser} onSignOut={handleSignOut} />;
  }

  return (
    <div className="flex min-h-screen w-full bg-[#090e1c] text-slate-200">
      {/* LEFT SIDEBAR */}
      <Sidebar
        currentScreen={currentScreen}
        onSelectScreen={(screen) => {
          setCurrentScreen(screen);
          if (screen === 'archive') {
            setCurrentTab('archive');
          } else if (screen === 'operations') {
            setCurrentTab('active');
          }
        }}
        syncTimeSeconds={syncSeconds}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        onOpenShiftCompliance={() => setIsShiftComplianceOpen(true)}
        currentUser={currentUser}
        onSignOut={handleSignOut}
        preferences={telemetryPreferences}
        onUpdatePreferences={setTelemetryPreferences}
        onOpenTelemetryPreferences={() => setIsTelemetryPreferencesOpen(true)}
      />

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* TOP HEADER */}
        <TopHeader
          selectedRegion={selectedRegion}
          onSelectRegion={(region) => {
            setSelectedRegion(region);
            setCurrentPage(1);
          }}
          syncTimeSeconds={syncSeconds}
          onForceRefresh={handleForceRefresh}
          isRefreshing={isRefreshing}
          onOpenNewVSR={() => setIsNewVSRModalOpen(true)}
          onOpenNotifications={() => setIsNotificationOpen(true)}
          hasUnreadNotifications={hasUnreadAlerts}
          onToggleMobileMenu={() => setMobileMenuOpen(true)}
          isOverrunSimulated={isOverrunSimulated}
          onToggleOverrunSimulation={() => setIsOverrunSimulated((prev) => !prev)}
          onOpenShiftCompliance={() => setIsShiftComplianceOpen(true)}
          currentUser={currentUser}
          onSignOut={handleSignOut}
        />

        {/* MAIN BODY AREA */}
        <main className="flex-1 p-4 lg:p-6 space-y-6">
          {currentUser.role === 'SUPER_ADMIN' && <CredentialAdministrationPanel />}
          {currentUser.role === 'SUPER_ADMIN' && <WorkflowCenter user={currentUser} />}

          {/* CRITICAL TELEMETRY ALERT BANNER */}
          {telemetryAlertBanner && (
            <div
              className={`bg-[#151f38] border rounded-xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4 animate-in fade-in ${
                telemetryAlertBanner.type === 'overrun' ? 'border-[#E05252]/70' : 'border-[#F17F31]/70'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`p-2.5 rounded-xl shrink-0 border ${
                    telemetryAlertBanner.type === 'overrun'
                      ? 'bg-[#E05252]/20 text-[#E05252] border-[#E05252]/40'
                      : 'bg-[#F17F31]/20 text-[#F17F31] border-[#F17F31]/40'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-bold text-white text-sm uppercase tracking-wide">
                      {telemetryAlertBanner.type === 'overrun'
                        ? `Shift Overrun Alert: ${telemetryAlertBanner.hubName}`
                        : `Store Shift Telemetry Alert: ${telemetryAlertBanner.hubName}`}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                        telemetryAlertBanner.type === 'overrun'
                          ? 'bg-[#E05252]/20 text-[#E05252] border-[#E05252]/30'
                          : 'bg-[#F17F31]/20 text-[#F17F31] border-[#F17F31]/30'
                      }`}
                    >
                      {telemetryAlertBanner.type === 'overrun'
                        ? '>21:00 WAT Active Telemetry Flagged'
                        : `${telemetryAlertBanner.idleMinutes}m Idle (>${telemetryAlertBanner.thresholdMinutes || 30}m Post-Shift Breach)`}
                    </span>

                    {/* D3-rendered sparkline visualizing last 60 minutes of telemetry ping frequency for flagged hub */}
                    <TelemetrySparkline
                      hub={telemetryAlertBanner.region || 'Ibadan'}
                      hubName={telemetryAlertBanner.hubName}
                      idleMinutes={telemetryAlertBanner.idleMinutes}
                      alertType={telemetryAlertBanner.type}
                      terminalCount={
                        telemetryAlertBanner.region && regionalTelemetry[telemetryAlertBanner.region]
                          ? regionalTelemetry[telemetryAlertBanner.region].terminalCount
                          : 18
                      }
                      lastPingTime={
                        telemetryAlertBanner.region && regionalTelemetry[telemetryAlertBanner.region]
                          ? regionalTelemetry[telemetryAlertBanner.region].lastPingTime
                          : Date.now()
                      }
                    />
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    {telemetryAlertBanner.type === 'overrun' ? (
                      <>
                        Official store closing hours concluded at{' '}
                        <strong className="text-white font-mono">21:00 WAT</strong>. Active merchandiser POS heartbeats are still being received from{' '}
                        <strong className="text-white">{telemetryAlertBanner.hubName}</strong>. End-of-day terminal sign-off or overtime clearance required.
                      </>
                    ) : (
                      <>
                        Store shift commenced at{' '}
                        <strong className="text-white font-mono">{telemetryAlertBanner.shiftTimeStr}</strong>. Merchandiser POS telemetry has remained idle for more than{' '}
                        <strong className="text-white font-mono">{telemetryAlertBanner.thresholdMinutes || 30} minutes</strong> without active heartbeat.
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {telemetryAlertBanner.type === 'overrun' ? (
                  <button
                    onClick={handleBroadcastEODShutdown}
                    className="px-3.5 py-2 rounded-lg bg-[#E05252] hover:bg-[#c94343] text-white font-bold text-xs shadow-md shadow-[#E05252]/20 transition-transform active:scale-95"
                  >
                    Broadcast EOD Terminal Sign-Off
                  </button>
                ) : (
                  telemetryAlertBanner.region && (
                    <button
                      onClick={() => handlePingRegionTelemetry(telemetryAlertBanner.region!)}
                      className="px-3.5 py-2 rounded-lg bg-[#92C842] hover:bg-[#7bb32e] text-[#090e1c] font-bold text-xs shadow-md shadow-[#92C842]/20 transition-transform active:scale-95"
                    >
                      Dispatch Ping &amp; Restore
                    </button>
                  )
                )}
                <button
                  onClick={() => setIsTelemetryPreferencesOpen(true)}
                  className="px-3 py-2 rounded-lg bg-[#151f38] hover:bg-[#1a2745] text-slate-200 border border-[#1e2d4d] hover:border-[#92C842]/50 text-xs font-semibold transition-colors"
                  title="Configure custom alert thresholds or toggle alerts"
                >
                  Preferences ({telemetryPreferences.globalIdleThresholdMinutes}m)
                </button>
                <button
                  onClick={() => setIsShiftComplianceOpen(true)}
                  className="px-3 py-2 rounded-lg bg-[#151f38] hover:bg-[#1a2745] text-slate-200 border border-[#1e2d4d] hover:border-[#92C842]/50 text-xs font-semibold transition-colors"
                  title="View PDF-ready Shift Compliance Audit Report"
                >
                  Audit Report (PDF)
                </button>
                <button
                  onClick={() => {
                    setCurrentScreen('merchandisers');
                    setTelemetryAlertBanner(null);
                  }}
                  className="px-3 py-2 rounded-lg bg-[#0e1628] hover:bg-[#1a2745] text-slate-200 border border-[#1e2d4d] text-xs font-semibold transition-colors"
                >
                  Inspect Field Hub
                </button>
                <button
                  onClick={() => setTelemetryAlertBanner(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#0e1628] transition-colors"
                  title="Dismiss banner"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 1: Operations & VSR */}
          {currentScreen === 'operations' && (
            <div className="space-y-6">
              {/* Executive KPI Stats (5 cards) */}
              <KPIStats
                fundedCount={128}
                unfundedCount={36}
                prospectiveCount={16}
                merchandiserCount={78}
                hqPersonnelCount={34}
                onFilterStatus={(status) => {
                  setKpiStatusFilter(status);
                  setCurrentPage(1);
                }}
                onSelectTab={(tab) => {
                  setCurrentTab(tab);
                  setCurrentPage(1);
                }}
                onSelectScreen={(screen) => setCurrentScreen(screen)}
              />

              {/* Regional Filter & Pipeline Category Subheaders */}
              <div className="space-y-4">
                {/* Region and Tenure Filter Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-4 py-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {(['All', 'Lagos', 'Ibadan', 'Ogun', 'Benin'] as Region[]).map((regionKey) => {
                      const isSelected = selectedRegion === regionKey;
                      const label =
                        regionKey === 'All'
                          ? 'All Regions'
                          : regionKey === 'Ogun'
                          ? 'Ogun / Abeokuta'
                          : regionKey;
                      const count = regionCounts[regionKey];

                      return (
                        <button
                          key={regionKey}
                          onClick={() => {
                            setSelectedRegion(regionKey);
                            setCurrentPage(1);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                            isSelected
                              ? 'bg-[#92C842] text-[#090e1c] font-bold shadow-sm'
                              : 'bg-[#0e1628] hover:bg-[#151f38] text-slate-300 border border-[#1e2d4d]'
                          }`}
                        >
                          <span>{label}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                              isSelected ? 'bg-[#090e1c]/20 text-[#090e1c]' : 'text-slate-500'
                            }`}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Tenure Selector */}
                  <div className="flex items-center gap-1.5 text-xs bg-[#0e1628] border border-[#1e2d4d] px-3 py-1.5 rounded-lg">
                    <span className="text-slate-400 font-semibold uppercase text-[10px] mr-1">TENURE:</span>
                    {(['All', '0–3 Mo (New)', '3–6 Mo (Mid)', '6+ Mo'] as TenureFilter[]).map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          setTenureFilter(t);
                          setCurrentPage(1);
                        }}
                        className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                          tenureFilter === t
                            ? 'text-white font-bold bg-[#151f38]'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab Bar & Live Search Field */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1e2d4d] pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => {
                        setCurrentTab('active');
                        setKpiStatusFilter('all');
                        setCurrentPage(1);
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-all ${
                        currentTab === 'active'
                          ? 'bg-[#92C842] text-[#090e1c] shadow-md shadow-[#92C842]/20'
                          : 'bg-[#0e1628] hover:bg-[#151f38] text-slate-400 hover:text-slate-200 border border-[#1e2d4d]'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                        />
                      </svg>
                      <span>Active VSRs</span>
                      <span className="bg-[#090e1c]/20 px-1.5 py-0.5 rounded text-[11px]">164</span>
                    </button>

                    <button
                      onClick={() => {
                        setCurrentTab('prospective');
                        setCurrentPage(1);
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-xs transition-all ${
                        currentTab === 'prospective'
                          ? 'bg-[#92C842] text-[#090e1c] font-bold shadow-md shadow-[#92C842]/20'
                          : 'bg-[#0e1628] hover:bg-[#151f38] text-slate-400 hover:text-slate-200 border border-[#1e2d4d]'
                      }`}
                    >
                      <span>Prospective Employees</span>
                      <span className="bg-[#151f38] px-1.5 py-0.5 rounded text-slate-400 text-[10px]">16</span>
                    </button>

                    <button
                      onClick={() => {
                        setCurrentTab('archive');
                        setCurrentPage(1);
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-xs transition-all ${
                        currentTab === 'archive'
                          ? 'bg-[#92C842] text-[#090e1c] font-bold shadow-md shadow-[#92C842]/20'
                          : 'bg-[#0e1628] hover:bg-[#151f38] text-slate-400 hover:text-slate-200 border border-[#1e2d4d]'
                      }`}
                    >
                      <span>Soft-Deleted / Archive History</span>
                      <span className="bg-[#151f38] px-1.5 py-0.5 rounded text-slate-400 text-[10px]">42</span>
                    </button>
                  </div>

                  {/* Search & Export Action */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-72">
                      <svg
                        className="w-4 h-4 text-slate-400 absolute left-3 top-2.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                        />
                      </svg>
                      <input
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full bg-[#0e1628] border border-[#1e2d4d] focus:border-[#92C842] focus:ring-1 focus:ring-[#92C842] rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 transition-all"
                        placeholder="Search staff, code, phone..."
                        type="text"
                      />
                    </div>
                    <button
                      onClick={handleExportCSV}
                      className="p-2 bg-[#0e1628] hover:bg-[#151f38] border border-[#1e2d4d] rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                      title="Export CSV / Sheet"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Main Content Two-Column Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* LEFT COLUMN: Staff Cards List (~70% / 8 Cols) */}
                <div className="lg:col-span-8 space-y-4">
                  {kpiStatusFilter !== 'all' && (
                    <div className="flex items-center justify-between p-2.5 bg-[#151f38] border border-[#1e2d4d] rounded-lg text-xs">
                      <span className="text-slate-300">
                        Filtering by status: <strong className="text-white uppercase">{kpiStatusFilter}</strong>
                      </span>
                      <button
                        onClick={() => setKpiStatusFilter('all')}
                        className="text-[#92C842] hover:underline text-[11px] font-semibold"
                      >
                        Reset Filter
                      </button>
                    </div>
                  )}

                  {paginatedStaff.map((staff) => (
                    <StaffCard
                      key={staff.id}
                      staff={staff}
                      onSendDirective={handleSendDirective}
                      onOpenDetails={(s) => setSelectedStaff(s)}
                    />
                  ))}

                  {paginatedStaff.length === 0 && (
                    <div className="text-center py-16 bg-[#0e1628] border border-[#1e2d4d] rounded-xl text-slate-400 text-xs">
                      No staff records found matching your filters.
                    </div>
                  )}

                  {/* Pagination Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-3 text-xs text-slate-400">
                    <div>
                      Showing <span className="text-white font-semibold">{paginatedStaff.length}</span> of{' '}
                      <span className="text-white font-semibold">{filteredStaffList.length}</span>{' '}
                      {currentTab === 'active'
                        ? 'Active Staff Records'
                        : currentTab === 'prospective'
                        ? 'Prospective Candidates'
                        : 'Archived Files'}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        className="px-3 py-1.5 rounded-lg bg-[#0e1628] border border-[#1e2d4d] text-slate-400 hover:text-white transition-colors disabled:opacity-40"
                      >
                        Previous
                      </button>
                      {Array.from({ length: totalPages }).map((_, idx) => {
                        const pageNum = idx + 1;
                        const isActive = currentPage === pageNum;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-1.5 rounded-lg transition-colors font-bold ${
                              isActive
                                ? 'bg-[#92C842] text-[#090e1c]'
                                : 'bg-[#0e1628] border border-[#1e2d4d] text-slate-300 hover:text-white'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        className="px-3 py-1.5 rounded-lg bg-[#0e1628] border border-[#1e2d4d] text-slate-400 hover:text-white transition-colors disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: Sidebar Widgets (~30% / 4 Cols) */}
                <div className="lg:col-span-4">
                  <RightSidebarWidgets
                    requisitions={requisitions}
                    fundingLogs={fundingLogs}
                    merchandiserHubs={enrichedMerchandiserHubs}
                    onSelectScreen={(screen) => setCurrentScreen(screen)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 2: Field Merchandisers */}
          {currentScreen === 'merchandisers' && (
            <Suspense fallback={<div className="rounded-xl border border-[#1e2d4d] bg-[#0e1628] p-8 text-center text-sm text-slate-400">Loading merchandiser dashboard...</div>}>
              <FieldMerchandisersView
                hubs={enrichedMerchandiserHubs}
                onOpenNewVSR={() => setIsNewVSRModalOpen(true)}
                onOpenShiftCompliance={() => setIsShiftComplianceOpen(true)}
                onOpenTrends={() => setCurrentScreen('trends')}
                onOpenCompliance={() => setCurrentScreen('compliance')}
              />
            </Suspense>
          )}

          {/* SCREEN 3: Regional Performance Trends (D3 Line Chart) */}
          {currentScreen === 'trends' && (
            <Suspense fallback={<div className="rounded-xl border border-[#1e2d4d] bg-[#0e1628] p-8 text-center text-sm text-slate-400">Loading trends dashboard...</div>}>
              <PerformanceTrendsView
                onOpenShiftCompliance={() => setIsShiftComplianceOpen(true)}
                onOpenNewVSR={() => setIsNewVSRModalOpen(true)}
              />
            </Suspense>
          )}

          {/* SCREEN 4: Centralized Shift Compliance Dashboard (30-Day D3 Adherence) */}
          {currentScreen === 'compliance' && (
            <Suspense fallback={<div className="rounded-xl border border-[#1e2d4d] bg-[#0e1628] p-8 text-center text-sm text-slate-400">Loading compliance dashboard...</div>}>
              <ComplianceDashboardView
                onOpenShiftCompliance={() => setIsShiftComplianceOpen(true)}
                onOpenNewVSR={() => setIsNewVSRModalOpen(true)}
              />
            </Suspense>
          )}

          {/* SCREEN 5: Head Office & Hiring */}
          {currentScreen === 'head_office' && (
            <Suspense fallback={<div className="rounded-xl border border-[#1e2d4d] bg-[#0e1628] p-8 text-center text-sm text-slate-400">Loading head office hub...</div>}>
              <HeadOfficeView
                requisitions={requisitions}
                onAddRequisition={(newReq) => setRequisitions((prev) => [newReq, ...prev])}
              />
            </Suspense>
          )}

          {/* SCREEN 5: Archive & Disengaged */}
          {currentScreen === 'archive' && (
            <Suspense fallback={<div className="rounded-xl border border-[#1e2d4d] bg-[#0e1628] p-8 text-center text-sm text-slate-400">Loading archive...</div>}>
              <ArchiveView
                archivedStaff={archiveStaff}
                onRestoreStaff={handleRestoreStaff}
              />
            </Suspense>
          )}
        </main>

        {/* FOOTER BAR */}
        <footer className="px-6 py-4 bg-[#0b1222] border-t border-[#1e2d4d] text-xs text-slate-500 flex flex-wrap items-center justify-between gap-4">
          <div>© 2025 KEA Corporate Hospitality Services Ltd. All Operations &amp; Field Telemetry Protected.</div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span className="text-slate-400">Node: LOS-HQ-01</span>
            <span className="text-[#92C842]">SSL Encrypted (TLS 1.3)</span>
          </div>
        </footer>
      </div>

      {/* MODALS */}
      <Suspense fallback={null}>
        <NewVSRModal
          isOpen={isNewVSRModalOpen}
          onClose={() => setIsNewVSRModalOpen(false)}
          onSubmit={handleAddVSR}
          defaultRegion={selectedRegion}
        />
      </Suspense>

      <Suspense fallback={null}>
        <StaffDetailModal
          staff={selectedStaff}
          onClose={() => setSelectedStaff(null)}
          onToggleStatus={handleToggleStatus}
          onDisburseFunding={handleDisburseFunding}
          onAddDirective={handleSendDirective}
        />
      </Suspense>

      <Suspense fallback={null}>
        <NotificationDrawer
          isOpen={isNotificationOpen}
          onClose={() => setIsNotificationOpen(false)}
          notifications={notifications}
          onMarkAllRead={() =>
            setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
          }
        />
      </Suspense>

      <Suspense fallback={null}>
        <ShiftComplianceModal
          isOpen={isShiftComplianceOpen}
          onClose={() => setIsShiftComplianceOpen(false)}
          regionalTelemetry={regionalTelemetry}
          isOverrunSimulated={isOverrunSimulated}
          hubs={enrichedMerchandiserHubs}
        />
      </Suspense>

      {/* EXECUTIVE TELEMETRY PREFERENCES MODAL */}
      <Suspense fallback={null}>
        <TelemetryPreferencesPanel
          isOpen={isTelemetryPreferencesOpen}
          onClose={() => setIsTelemetryPreferencesOpen(false)}
          preferences={telemetryPreferences}
          onUpdatePreferences={setTelemetryPreferences}
          regionalTelemetry={regionalTelemetry}
        />
      </Suspense>
    </div>
  );
}
