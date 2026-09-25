import React, { useState, useEffect, useMemo } from 'react';
import {
  Region,
  TenureFilter,
  TabType,
  NavigationScreen,
  StaffRecord,
  Requisition,
  FundingActionLog,
  FieldMerchandiserHub,
  AuthUser
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
import { OverallDashboardView } from './components/OverallDashboardView';
import { KPIStats } from './components/KPIStats';
import { StaffCard } from './components/StaffCard';
import { RightSidebarWidgets } from './components/RightSidebarWidgets';
import { NewVSRModal } from './components/NewVSRModal';
import { StaffDetailModal } from './components/StaffDetailModal';
import { FieldMerchandisersView } from './components/FieldMerchandisersView';
import { GpsTrackerView } from './components/GpsTrackerView';
import { PerformanceTrendsView } from './components/PerformanceTrendsView';
import { ComplianceDashboardView } from './components/ComplianceDashboardView';
import { ShiftAdherence30DayView } from './components/ShiftAdherence30DayView';
import { VsrLocationAuditView } from './components/VsrLocationAuditView';
import { VsrRecruitmentView } from './components/VsrRecruitmentView';
import { ArchiveView } from './components/ArchiveView';
import { NotificationDrawer } from './components/NotificationDrawer';
import { ShiftComplianceModal } from './components/ShiftComplianceModal';
import { TelemetryPreferencesPanel } from './components/TelemetryPreferencesPanel';
import { TelemetrySparkline } from './components/TelemetrySparkline';
import { TelemetryPreferencesConfig } from './types';
import { loadTelemetryPreferences } from './data/telemetryPreferencesData';
import { Users, Search, Download, Plus, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface RegionalStoreShiftSchedule {
  region: 'Lagos' | 'Ibadan' | 'Ogun' | 'Benin';
  hubName: string;
  openingHour: number;
  openingMinute: number;
  closingHour: number;
  closingMinute: number;
}

const STORE_OPENING_HOURS: RegionalStoreShiftSchedule[] = [
  { region: 'Lagos', hubName: 'Southwest Hub (Lagos)', openingHour: 7, openingMinute: 0, closingHour: 21, closingMinute: 0 },
  { region: 'Ibadan', hubName: 'Oyo Cluster (Ibadan)', openingHour: 7, openingMinute: 30, closingHour: 21, closingMinute: 0 },
  { region: 'Ogun', hubName: 'Ogun Hub (Abeokuta / Sagamu)', openingHour: 8, openingMinute: 0, closingHour: 21, closingMinute: 0 },
  { region: 'Benin', hubName: 'Edo Sector (Benin)', openingHour: 8, openingMinute: 0, closingHour: 21, closingMinute: 0 }
];

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem('kea_current_user');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return PRESET_CREDENTIALS[0].user; // Default: Tope Balogun (CEO)
  });

  const handleSignIn = (user: AuthUser) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('kea_current_user', JSON.stringify(user));
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
  const [currentScreen, setCurrentScreen] = useState<NavigationScreen>('overall_dashboard');
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

  // Telemetry Preferences
  const [telemetryPreferences, setTelemetryPreferences] = useState<TelemetryPreferencesConfig>(() =>
    loadTelemetryPreferences()
  );

  // Sync Timer & Refresh
  const [syncSeconds, setSyncSeconds] = useState(8);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOverrunSimulated, setIsOverrunSimulated] = useState(false);

  const [regionalTelemetry, setRegionalTelemetry] = useState<
    Record<string, { lastPingTime: number; terminalCount: number }>
  >({
    Lagos: { lastPingTime: Date.now() - 4 * 60 * 1000, terminalCount: 38 },
    Ogun: { lastPingTime: Date.now() - 11 * 60 * 1000, terminalCount: 12 },
    Benin: { lastPingTime: Date.now() - 17 * 60 * 1000, terminalCount: 10 },
    Ibadan: { lastPingTime: Date.now() - 34 * 60 * 1000, terminalCount: 18 }
  });

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
      title: 'Zenith Bank Verification',
      message: 'Account validation batch processed for Lagos VSRs.',
      time: '12m ago',
      unread: true
    },
    {
      id: 'notif-2',
      title: 'Shift Audit Passed',
      message: 'Trade Fair cluster confirmed 100% on-time opening.',
      time: '34m ago',
      unread: true
    }
  ]);

  const hasUnreadAlerts = notifications.some((n) => n.unread);

  // Heartbeat counter
  useEffect(() => {
    const timer = setInterval(() => {
      setSyncSeconds((prev) => (prev <= 1 ? 10 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter staff list
  const filteredStaffList = useMemo(() => {
    let list = currentTab === 'active' ? activeStaff : currentTab === 'prospective' ? prospectiveStaff : archiveStaff;

    if (selectedRegion !== 'All') {
      list = list.filter((s) => s.location.toLowerCase().includes(selectedRegion.toLowerCase()));
    }

    if (tenureFilter !== 'All') {
      if (tenureFilter === '0–3 Mo (New)') list = list.filter((s) => s.tenureMonths <= 3);
      else if (tenureFilter === '3–6 Mo (Mid)') list = list.filter((s) => s.tenureMonths > 3 && s.tenureMonths <= 6);
      else if (tenureFilter === '6+ Mo') list = list.filter((s) => s.tenureMonths > 6);
    }

    if (kpiStatusFilter !== 'all') {
      list = list.filter((s) => s.status === kpiStatusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.code.toLowerCase().includes(q) ||
          s.phone.includes(q) ||
          s.location.toLowerCase().includes(q)
      );
    }

    return list;
  }, [currentTab, activeStaff, prospectiveStaff, archiveStaff, selectedRegion, tenureFilter, kpiStatusFilter, searchQuery]);

  const ITEMS_PER_PAGE = 8;
  const totalPages = Math.ceil(filteredStaffList.length / ITEMS_PER_PAGE) || 1;
  const paginatedStaff = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredStaffList.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredStaffList, currentPage]);

  const handleForceRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setSyncSeconds(10);
    }, 600);
  };

  const handleAddVSR = (newStaff: StaffRecord) => {
    setActiveStaff((prev) => [newStaff, ...prev]);
    setIsNewVSRModalOpen(false);
  };

  const handleToggleStatus = (staffId: string) => {
    setActiveStaff((prev) =>
      prev.map((s) => (s.id === staffId ? { ...s, status: s.status === 'funded' ? 'unfunded' : 'funded' } : s))
    );
  };

  const handleDisburseFunding = (staffId: string, amount: string) => {
    setActiveStaff((prev) =>
      prev.map((s) => (s.id === staffId ? { ...s, status: 'funded', hasLoan: true, loanLabel: `Loan: ${amount}` } : s))
    );
  };

  const handleSendDirective = (staffId: string, text: string) => {
    setActiveStaff((prev) =>
      prev.map((s) =>
        s.id === staffId
          ? {
              ...s,
              thread: [
                ...(s.thread || []),
                { id: `msg-${Date.now()}`, role: currentUser?.role || 'Super Admin', text, time: 'Just now' }
              ]
            }
          : s
      )
    );
  };

  const handleRestoreStaff = (staffId: string) => {
    const item = archiveStaff.find((s) => s.id === staffId);
    if (item) {
      setArchiveStaff((prev) => prev.filter((s) => s.id !== staffId));
      setActiveStaff((prev) => [{ ...item, status: 'unfunded' }, ...prev]);
    }
  };

  const handleExportCSV = () => {
    const rows = [
      'KEA GROUP - STAFF LIST',
      `Exported: ${new Date().toLocaleString()}`,
      '',
      'Staff Code,Name,Location,Status,Tenure,Phone,Loan',
      ...filteredStaffList.map((s) => `"${s.code}","${s.name}","${s.location}","${s.status}","${s.tenureDisplay}","${s.phone}","${s.loanLabel}"`)
    ];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `KEA_Staff_Export_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  // If user is not logged in, render Clean Light SignInPage
  if (!currentUser) {
    return <SignInPage onSignIn={handleSignIn} />;
  }

  return (
    <div className="flex min-h-screen w-full bg-[#f8fafc] text-slate-800 font-sans">
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
          onOpenGpsTracker={() => setCurrentScreen('gps_tracker')}
          onOpenOverallDashboard={() => setCurrentScreen('overall_dashboard')}
          currentUser={currentUser}
          onSignOut={handleSignOut}
        />

        {/* MAIN BODY AREA */}
        <main className="flex-1 p-4 lg:p-6 space-y-6 bg-[#f8fafc]">
          
          {/* SCREEN: KEA Master Dashboard */}
          {currentScreen === 'overall_dashboard' && (
            <OverallDashboardView
              onNavigate={(screen) => setCurrentScreen(screen)}
              onOpenNewVSR={() => setIsNewVSRModalOpen(true)}
            />
          )}

          {/* SCREEN: Shift Adherence (30 Days) */}
          {currentScreen === 'shift_adherence_30d' && (
            <ShiftAdherence30DayView
              onBackToDashboard={() => setCurrentScreen('overall_dashboard')}
              onOpenLocationAudit={() => setCurrentScreen('vsr_location_audit')}
              onOpenShiftModal={() => setIsShiftComplianceOpen(true)}
            />
          )}

          {/* SCREEN: Store Location Check-Ins */}
          {currentScreen === 'vsr_location_audit' && (
            <VsrLocationAuditView
              onBackToDashboard={() => setCurrentScreen('overall_dashboard')}
              onOpenShiftAdherence={() => setCurrentScreen('shift_adherence_30d')}
            />
          )}

          {/* SCREEN: Hiring & Applicants */}
          {currentScreen === 'vsr_recruitment' && (
            <VsrRecruitmentView
              onNavigateBack={() => setCurrentScreen('overall_dashboard')}
            />
          )}

          {/* SCREEN: Field Staff & Loans Directory */}
          {currentScreen === 'operations' && (
            <div className="space-y-6">
              {/* Top KPI Metric Cards */}
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

              {/* Filtering Toolbar */}
              <div className="bg-white border border-slate-200/80 rounded-[12px] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {/* Region Filter Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-semibold text-slate-400 mr-1">Area:</span>
                    {(['All', 'Lagos', 'Ibadan', 'Ogun', 'Benin'] as Region[]).map((regionKey) => {
                      const isSelected = selectedRegion === regionKey;
                      return (
                        <button
                          key={regionKey}
                          onClick={() => {
                            setSelectedRegion(regionKey);
                            setCurrentPage(1);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            isSelected
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                          }`}
                        >
                          {regionKey === 'All' ? 'All Locations' : regionKey}
                        </button>
                      );
                    })}
                  </div>

                  {/* Tenure Filter */}
                  <div className="flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-lg">
                    <span className="text-slate-400 font-semibold text-[11px] mr-1">Tenure:</span>
                    {(['All', '0–3 Mo (New)', '3–6 Mo (Mid)', '6+ Mo'] as TenureFilter[]).map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          setTenureFilter(t);
                          setCurrentPage(1);
                        }}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                          tenureFilter === t
                            ? 'bg-white text-emerald-800 font-bold border border-slate-200 shadow-xs'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab Strip & Search */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => {
                        setCurrentTab('active');
                        setKpiStatusFilter('all');
                        setCurrentPage(1);
                      }}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all ${
                        currentTab === 'active'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                      }`}
                    >
                      <span>Active Field Reps</span>
                      <span className="bg-white px-1.5 py-0.2 rounded font-mono text-[10px] text-slate-700 shadow-xs">164</span>
                    </button>

                    <button
                      onClick={() => {
                        setCurrentTab('prospective');
                        setCurrentPage(1);
                      }}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                        currentTab === 'prospective'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                      }`}
                    >
                      <span>Job Candidates</span>
                      <span className="bg-white px-1.5 py-0.2 rounded font-mono text-[10px] text-slate-700 shadow-xs">16</span>
                    </button>

                    <button
                      onClick={() => {
                        setCurrentTab('archive');
                        setCurrentPage(1);
                      }}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                        currentTab === 'archive'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                      }`}
                    >
                      <span>Archived Staff</span>
                      <span className="bg-white px-1.5 py-0.2 rounded font-mono text-[10px] text-slate-700 shadow-xs">42</span>
                    </button>
                  </div>

                  {/* Search Bar & Export CSV */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-72">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 transition-all outline-none"
                        placeholder="Search by name, code, phone..."
                        type="text"
                      />
                    </div>
                    <button
                      onClick={handleExportCSV}
                      className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 transition-colors"
                      title="Export Staff CSV"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Two Column Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Staff Cards */}
                <div className="lg:col-span-8 space-y-4">
                  {kpiStatusFilter !== 'all' && (
                    <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-[10px] text-xs">
                      <span className="text-emerald-900">
                        Filtering by status: <strong className="uppercase">{kpiStatusFilter}</strong>
                      </span>
                      <button
                        onClick={() => setKpiStatusFilter('all')}
                        className="text-emerald-700 hover:underline font-bold text-[11px]"
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
                    <div className="text-center py-16 bg-white border border-slate-200/80 rounded-[12px] text-slate-400 text-xs shadow-xs">
                      No staff records found matching your filters.
                    </div>
                  )}

                  {/* Pagination Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-3 text-xs text-slate-500 bg-white border border-slate-200/80 rounded-[12px] p-3 shadow-xs">
                    <div>
                      Showing <strong className="text-slate-900">{paginatedStaff.length}</strong> of{' '}
                      <strong className="text-slate-900">{filteredStaffList.length}</strong> records
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-40"
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
                            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                              isActive
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Widgets */}
                <div className="lg:col-span-4">
                  <RightSidebarWidgets
                    requisitions={requisitions}
                    fundingLogs={fundingLogs}
                    merchandiserHubs={merchandiserHubs}
                    onSelectScreen={(screen) => setCurrentScreen(screen)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* SCREEN: Store Workers & Terminals */}
          {currentScreen === 'merchandisers' && (
            <FieldMerchandisersView
              hubs={merchandiserHubs}
              onOpenNewVSR={() => setIsNewVSRModalOpen(true)}
              onOpenShiftCompliance={() => setIsShiftComplianceOpen(true)}
              onOpenTrends={() => setCurrentScreen('trends')}
              onOpenCompliance={() => setCurrentScreen('compliance')}
              onOpenGpsTracker={() => setCurrentScreen('gps_tracker')}
            />
          )}

          {/* SCREEN: Live GPS Map Tracker */}
          {currentScreen === 'gps_tracker' && (
            <GpsTrackerView
              onBackToDashboard={() => setCurrentScreen('operations')}
            />
          )}

          {/* SCREEN: Activity Trends */}
          {currentScreen === 'trends' && (
            <PerformanceTrendsView
              onOpenShiftCompliance={() => setIsShiftComplianceOpen(true)}
              onOpenNewVSR={() => setIsNewVSRModalOpen(true)}
            />
          )}

          {/* SCREEN: Staff Work Hours & Compliance */}
          {currentScreen === 'compliance' && (
            <ComplianceDashboardView
              onOpenShiftCompliance={() => setIsShiftComplianceOpen(true)}
              onOpenNewVSR={() => setIsNewVSRModalOpen(true)}
            />
          )}

          {/* SCREEN: Past Staff Records */}
          {currentScreen === 'archive' && (
            <ArchiveView
              archivedStaff={archiveStaff}
              onRestoreStaff={handleRestoreStaff}
            />
          )}
        </main>

        {/* FOOTER BAR */}
        <footer className="px-6 py-4 bg-white border-t border-slate-200/80 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-4">
          <div>© 2026 KEA Corporate Hospitality Services Ltd. All Operations &amp; Field Telemetry Protected.</div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span className="text-slate-400">Node: LOS-HQ-01</span>
            <span className="text-emerald-700 font-bold">SSL Encrypted (TLS 1.3)</span>
          </div>
        </footer>
      </div>

      {/* MODALS */}
      <NewVSRModal
        isOpen={isNewVSRModalOpen}
        onClose={() => setIsNewVSRModalOpen(false)}
        onSubmit={handleAddVSR}
        defaultRegion={selectedRegion}
      />

      <StaffDetailModal
        staff={selectedStaff}
        onClose={() => setSelectedStaff(null)}
        onToggleStatus={handleToggleStatus}
        onDisburseFunding={handleDisburseFunding}
        onAddDirective={handleSendDirective}
      />

      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
        onMarkAllRead={() =>
          setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
        }
      />

      <ShiftComplianceModal
        isOpen={isShiftComplianceOpen}
        onClose={() => setIsShiftComplianceOpen(false)}
        regionalTelemetry={regionalTelemetry}
        isOverrunSimulated={isOverrunSimulated}
        hubs={merchandiserHubs}
      />

      <TelemetryPreferencesPanel
        isOpen={isTelemetryPreferencesOpen}
        onClose={() => setIsTelemetryPreferencesOpen(false)}
        preferences={telemetryPreferences}
        onUpdatePreferences={setTelemetryPreferences}
        regionalTelemetry={regionalTelemetry}
      />
    </div>
  );
}
