import React, { useState, useMemo } from 'react';
import { 
  Download, 
  Printer, 
  Search, 
  Filter, 
  AlertTriangle, 
  ChevronRight, 
  Calendar,
  X,
  Phone,
  Mail,
  Compass,
  CheckCircle,
  FileSpreadsheet,
  BarChart3,
  Layers,
  Plus,
  Users,
  ShieldCheck,
  Activity,
  Radio,
  RefreshCw,
  Zap,
  TrendingUp,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { NavigationScreen } from '../types';
import { 
  LIVE_VSR_DATA, 
  LiveVsrRecord, 
  LIVE_ASST_VSR_DATA, 
  AssistantVsrRecord,
  LIVE_NO_LOAN_DATA,
  NoLoanVsrRecord
} from '../data/liveVsrTrackerData';
import { useRealtimeDashboard } from '../hooks/useRealtimeDashboard';
import { DashboardDrillDownModal } from './DashboardDrillDownModal';
import { DashboardLiveFeedWidget } from './DashboardLiveFeedWidget';

type UnifiedRecord =
  | ({ recordCategory: 'vsr' } & LiveVsrRecord)
  | ({ recordCategory: 'asst_vsr' } & AssistantVsrRecord)
  | ({ recordCategory: 'no_loan' } & NoLoanVsrRecord);

interface OverallDashboardViewProps {
  onNavigate?: (screen: NavigationScreen) => void;
  onOpenNewVSR?: () => void;
}

interface RedFlagRecord {
  name: string;
  code: string;
  reason: string;
  severity: 'high' | 'medium';
  location: string;
  dateFlagged: string;
}

const RED_FLAGGED_STAFF: RedFlagRecord[] = [
  {
    name: 'Shittu Akinsanya',
    code: '10008979',
    reason: 'DANGER – Fund Accountability (Unaccounted POS float discrepancy of ₦145,000)',
    severity: 'high',
    location: 'Lagos',
    dateFlagged: '18-Jun-2026'
  },
  {
    name: 'Olanipekun Micheal',
    code: '10008984',
    reason: 'No additional note on file (Repeated device inactivity and missing daily sales logs)',
    severity: 'medium',
    location: 'Lagos',
    dateFlagged: '22-Jun-2026'
  },
  {
    name: 'Jacob Izobo',
    code: '10008999',
    reason: 'Under investigation – Card machine serial number mismatch during audit',
    severity: 'high',
    location: 'Lagos',
    dateFlagged: '01-Jul-2026'
  }
];

export const OverallDashboardView: React.FC<OverallDashboardViewProps> = ({
  onNavigate,
  onOpenNewVSR
}) => {
  // Top view tab: 'overview' | 'tracker' | 'combined'
  const [activeTab, setActiveTab] = useState<'overview' | 'tracker' | 'combined'>('combined');
  
  // Sheet sub-tab for tracker: 'vsr' | 'asst_vsr' | 'no_loan'
  const [trackerSubTab, setTrackerSubTab] = useState<'vsr' | 'asst_vsr' | 'no_loan'>('vsr');

  const [reportingPeriod, setReportingPeriod] = useState<string>('September 2026');
  const [selectedDrillDown, setSelectedDrillDown] = useState<string | null>(null);
  const [selectedRedFlag, setSelectedRedFlag] = useState<RedFlagRecord | null>(null);
  const [selectedRowDetail, setSelectedRowDetail] = useState<UnifiedRecord | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Live Real-Time Polling & Drill-Down State
  const {
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
  } = useRealtimeDashboard(10000);

  // Live Tracker search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [workforceStatusFilter, setWorkforceStatusFilter] = useState('All');

  // Filtered live Assistant VSR records
  const filteredAsstVsrData = useMemo(() => {
    return LIVE_ASST_VSR_DATA.filter((record) => {
      const query = searchQuery.toLowerCase().trim();
      if (query) {
        const matchesName = record.fullName.toLowerCase().includes(query);
        const matchesCode = record.employeeCode.toLowerCase().includes(query);
        const matchesLocation = record.location.toLowerCase().includes(query);
        const matchesEmail = record.email.toLowerCase().includes(query);
        const matchesPhone = record.phone.includes(query);
        if (!matchesName && !matchesCode && !matchesLocation && !matchesEmail && !matchesPhone) {
          return false;
        }
      }

      if (locationFilter !== 'All' && !record.location.toLowerCase().includes(locationFilter.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [searchQuery, locationFilter]);

  // Filtered live No Loan Required / Insured records
  const filteredNoLoanData = useMemo(() => {
    return LIVE_NO_LOAN_DATA.filter((record) => {
      const query = searchQuery.toLowerCase().trim();
      if (query) {
        const matchesName = record.fullName.toLowerCase().includes(query);
        const matchesLocation = record.location.toLowerCase().includes(query);
        const matchesEmail = record.email.toLowerCase().includes(query);
        const matchesPhone = record.phone.includes(query);
        const matchesNotes = record.reasonNotes.toLowerCase().includes(query);
        if (!matchesName && !matchesLocation && !matchesEmail && !matchesPhone && !matchesNotes) {
          return false;
        }
      }

      if (locationFilter !== 'All' && !record.location.toLowerCase().includes(locationFilter.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [searchQuery, locationFilter]);

  // Filtered live records
  const filteredVsrData = useMemo(() => {
    return LIVE_VSR_DATA.filter((record) => {
      const query = searchQuery.toLowerCase().trim();
      if (query) {
        const matchesName = record.fullName.toLowerCase().includes(query);
        const matchesCode = record.employeeCode.toLowerCase().includes(query);
        const matchesLocation = record.location.toLowerCase().includes(query);
        const matchesEmail = record.email.toLowerCase().includes(query);
        const matchesPhone = record.phone.includes(query);
        if (!matchesName && !matchesCode && !matchesLocation && !matchesEmail && !matchesPhone) {
          return false;
        }
      }

      if (locationFilter !== 'All' && record.location !== locationFilter) {
        return false;
      }

      if (statusFilter !== 'All') {
        if (statusFilter === 'Funded' && record.status !== 'Funded') return false;
        if (statusFilter === 'Insured' && !record.status.includes('Insured')) return false;
        if (statusFilter === 'Under Review' && !record.status.includes('Under Review')) return false;
        if (statusFilter === 'Cleared' && !record.status.includes('Cleared')) return false;
        if (statusFilter === 'Missing Code' && record.employeeCode !== 'TO BE ADDED') return false;
      }

      if (workforceStatusFilter !== 'All' && record.workforceStatus !== workforceStatusFilter) {
        return false;
      }

      return true;
    });
  }, [searchQuery, locationFilter, statusFilter, workforceStatusFilter, trackerSubTab]);

  // Handle CSV Export
  const handleExportCSV = () => {
    setIsExporting(true);
    setTimeout(() => {
      if (trackerSubTab === 'asst_vsr') {
        const csvRows = [
          'KEA GROUP - ASSISTANT VSR ACTIVE WORKFORCE & ONBOARDING TRACKER',
          `Reporting Period: ${reportingPeriod}`,
          'Generated: ' + new Date().toLocaleString(),
          '',
          'S/N,Employee Code,Full Name,VSR Type,Onboarded,Workforce Status,Location,Email,Phone,Risk Alert,Notes',
          ...LIVE_ASST_VSR_DATA.map(r => 
            `"${r.sn}","${r.employeeCode}","${r.fullName}","${r.vsrType}","${r.onboardedDate}","${r.workforceStatus}","${r.location}","${r.email}","${r.phone}","${r.riskAlert || ''}","${r.notes || ''}"`
          )
        ];

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `KEA_Group_Assistant_VSR_Tracker_${reportingPeriod.replace(/\s+/g, '_')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsExporting(false);
        return;
      }

      if (trackerSubTab === 'no_loan') {
        const csvRows = [
          'KEA GROUP - NO LOAN REQUIRED / INSURED BUT NO LOAN',
          `Reporting Period: ${reportingPeriod}`,
          'Generated: ' + new Date().toLocaleString(),
          '',
          'S/N,Full Name,Location,Reason / Notes,Email,Phone',
          ...LIVE_NO_LOAN_DATA.map(r => 
            `"${r.sn}","${r.fullName}","${r.location}","${r.reasonNotes}","${r.email}","${r.phone}"`
          )
        ];

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `KEA_Group_No_Loan_Insured_${reportingPeriod.replace(/\s+/g, '_')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsExporting(false);
        return;
      }

      const csvRows = [
        'KEA GROUP - VSR WORKFORCE & RECRUITMENT DASHBOARD',
        `Reporting Period: ${reportingPeriod}`,
        'Generated: ' + new Date().toLocaleString(),
        '',
        '--- TOP METRICS ---',
        'Metric,Count,Notes',
        'Active VSR,45,Onboarded & currently on payroll',
        'Active ASST. VSR,6,Onboarded & currently on payroll',
        'Total Active Staff,51,Active VSR + Active ASST. VSR',
        'Prospective Staff,5,No Onboarded date yet',
        'Funded VSR,32,Loan disbursed to date',
        'Total Insured,39,Funded or Insured VSR = Insurance YES',
        'Employee Codes Issued,42,Valid codes on file',
        '',
        '--- LIVE VSR ONBOARDING & FUNDING TRACKER ---',
        'S/N,Employee Code,Full Name,Onboarded,Workforce Status,Status,Date Funded,Fidelity Insurance,Location,Email,Phone,Priority,Risk Alert,Risk Status',
        ...LIVE_VSR_DATA.map(r => 
          `"${r.sn}","${r.employeeCode}","${r.fullName}","${r.onboardedDate}","${r.workforceStatus}","${r.status}","${r.dateFunded || ''}","${r.fidelityInsurance}","${r.location}","${r.email}","${r.phone}","${r.priority}","${r.riskAlert || ''}","${r.riskStatus || ''}"`
        ),
        '',
        '--- ASSISTANT VSR ACTIVE WORKFORCE & ONBOARDING TRACKER ---',
        'S/N,Employee Code,Full Name,VSR Type,Onboarded,Workforce Status,Location,Email,Phone,Risk Alert,Notes',
        ...LIVE_ASST_VSR_DATA.map(r => 
          `"${r.sn}","${r.employeeCode}","${r.fullName}","${r.vsrType}","${r.onboardedDate}","${r.workforceStatus}","${r.location}","${r.email}","${r.phone}","${r.riskAlert || ''}","${r.notes || ''}"`
        ),
        '',
        '--- NO LOAN REQUIRED / INSURED BUT NO LOAN ---',
        'S/N,Full Name,Location,Reason / Notes,Email,Phone',
        ...LIVE_NO_LOAN_DATA.map(r => 
          `"${r.sn}","${r.fullName}","${r.location}","${r.reasonNotes}","${r.email}","${r.phone}"`
        )
      ];

      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `KEA_Group_Live_VSR_Tracker_${reportingPeriod.replace(/\s+/g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsExporting(false);
    }, 400);
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper to render SVG Donut Arc
  const renderDonutSlice = (
    startAngle: number,
    endAngle: number,
    innerRadius: number,
    outerRadius: number
  ) => {
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);

    const x1 = outerRadius * Math.cos(startRad);
    const y1 = outerRadius * Math.sin(startRad);
    const x2 = outerRadius * Math.cos(endRad);
    const y2 = outerRadius * Math.sin(endRad);

    const ix1 = innerRadius * Math.cos(endRad);
    const iy1 = innerRadius * Math.sin(endRad);
    const ix2 = innerRadius * Math.cos(startRad);
    const iy2 = innerRadius * Math.sin(startRad);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return [
      `M ${x1} ${y1}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${ix1} ${iy1}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix2} ${iy2}`,
      'Z'
    ].join(' ');
  };

  // 1. Active Workforce Donut Data (45 VSR, 6 ASST VSR)
  const totalWorkforce = 51;
  const vsrAngle = (45 / totalWorkforce) * 360;

  // 2. VSR Funding Status Donut Data
  const totalFundingCategorized = 42;

  // 3. Fidelity Insurance Donut Data (39 Insured, 6 Pending)
  const totalInsuredExamined = 45;
  const insuredAngle = (39 / totalInsuredExamined) * 360;

  // Monthly Onboarding Chart Data
  const monthlyOnboardingData = [
    { month: 'Jan', vsr: 0, asst: 0 },
    { month: 'Feb', vsr: 0, asst: 0 },
    { month: 'Mar', vsr: 0, asst: 0 },
    { month: 'Apr', vsr: 0, asst: 0 },
    { month: 'May', vsr: 0, asst: 0 },
    { month: 'Jun', vsr: 16, asst: 0 },
    { month: 'Jul', vsr: 19, asst: 0 },
    { month: 'Aug', vsr: 1, asst: 2 },
    { month: 'Sep', vsr: 11, asst: 4 },
    { month: 'Oct', vsr: 0, asst: 0 },
    { month: 'Nov', vsr: 0, asst: 0 },
    { month: 'Dec', vsr: 0, asst: 0 }
  ];

  // Monthly Funding Chart Data
  const monthlyFundingData = [
    { month: 'Jan', count: 0 },
    { month: 'Feb', count: 0 },
    { month: 'Mar', count: 0 },
    { month: 'Apr', count: 0 },
    { month: 'May', count: 0 },
    { month: 'Jun', count: 17 },
    { month: 'Jul', count: 12 },
    { month: 'Aug', count: 0 },
    { month: 'Sep', count: 3 },
    { month: 'Oct', count: 0 },
    { month: 'Nov', count: 0 },
    { month: 'Dec', count: 0 }
  ];

  // Tables Data
  const statusBreakdownData = [
    { status: 'Funded', count: 32 },
    { status: 'Awaiting Funding', count: 0 },
    { status: 'No Loan Required', count: 1 },
    { status: 'Awaiting Fidelity Insurance', count: 2 },
    { status: 'Under Review – Risk & Compliance', count: 3 },
    { status: 'Cleared by Risk & Compliance', count: 4 },
    { status: 'Cleared by Risk – Sent for Code Approval', count: 0 },
    { status: 'Documents Incomplete / Missing', count: 0 },
    { status: 'Status Not Provided – Needs Follow-up', count: 0 },
    { status: 'Resigned', count: 0 },
    { status: '(Blank / No Status Yet)', count: 4 },
    { status: 'Insured', count: 3 },
    { status: 'Insured but No Loan', count: 4 }
  ];

  const locationData = [
    { location: 'Abeokuta', count: 3 },
    { location: 'Asaba', count: 0 },
    { location: 'Benin', count: 1 },
    { location: 'Enugu', count: 4 },
    { location: 'Ibadan', count: 11 },
    { location: 'Lagos', count: 27 },
    { location: 'Ogun', count: 1 },
    { location: 'Ogun (ABK)', count: 1 },
    { location: 'Ogun (Ijebu)', count: 2 },
    { location: 'Osogbo', count: 1 }
  ];

  const actionRequiredData = [
    { issue: 'Missing Employee Code', count: 17, isRedFlag: false },
    { issue: 'Missing Onboarded Date (Funded)', count: 1, isRedFlag: false },
    { issue: 'Risk / Compliance Review', count: 0, isRedFlag: false },
    { issue: 'Missing Email or Phone (Active)', count: 0, isRedFlag: false },
    { issue: 'Awaiting Fidelity Insurance', count: 2, isRedFlag: false },
    { issue: 'Red Flagged – Removed from Active', count: 3, isRedFlag: true }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans space-y-5 print:space-y-2 pb-16">
      {/* SVG GLOBAL DEFINITIONS FOR MINT GRADIENTS */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <linearGradient id="mintBarGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#34d399" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#a7f3d0" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="mintDonutGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>
      </svg>

      {/* TOP CONTROL BAR (Clean Light Card) */}
      <div className="bg-white rounded-[12px] border border-slate-200/80 p-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200/80 text-xs">
            <div className="relative flex items-center justify-center w-2.5 h-2.5">
              <span className={`w-2 h-2 rounded-full ${pollingInterval > 0 ? 'bg-emerald-500 animate-ping' : 'bg-amber-400'} absolute`} />
              <span className={`w-2 h-2 rounded-full ${pollingInterval > 0 ? 'bg-emerald-600' : 'bg-amber-500'}`} />
            </div>
            <span className="font-mono font-bold text-emerald-900">
              {pollingInterval > 0 ? 'LIVE TELEMETRY' : 'PAUSED'}
            </span>
            <span className="text-[10px] text-emerald-700/80 font-mono hidden xl:inline">
              ({lastSyncText})
            </span>
            <button
              onClick={triggerManualSync}
              disabled={isSyncing}
              className="ml-1 p-1 rounded hover:bg-emerald-100 text-emerald-700 transition-colors"
              title="Force sync telemetry now"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <span className="text-slate-300 hidden md:inline">|</span>
          <span className="text-xs font-semibold text-slate-600 hidden md:inline">
            Official Client Master Dashboard &amp; Live Tracker
          </span>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('combined')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'combined'
                ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Show both executive charts and the full live spreadsheet ledger"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Combined Suite</span>
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'overview'
                ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Display the 7 KPI blocks, Donut charts, and Bar charts"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Charts &amp; KPIs</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('tracker');
              setTrackerSubTab('vsr');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'tracker' && trackerSubTab === 'vsr'
                ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Display the exact Active VSR Onboarding & Funding spreadsheet table"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Active VSR ({LIVE_VSR_DATA.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('tracker');
              setTrackerSubTab('asst_vsr');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'tracker' && trackerSubTab === 'asst_vsr'
                ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Display the Assistant VSR Active Workforce & Onboarding Tracker"
          >
            <Users className="w-3.5 h-3.5" />
            <span>ASST. VSR ({LIVE_ASST_VSR_DATA.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('tracker');
              setTrackerSubTab('no_loan');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'tracker' && trackerSubTab === 'no_loan'
                ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Display the No Loan Required / Insured But No Loan Ledger"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>No Loan ({LIVE_NO_LOAN_DATA.length})</span>
          </button>
        </div>

        {/* Toolbar Right Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Live Operations Feed Trigger */}
          <button
            onClick={() => setIsFeedDrawerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition-all shadow-sm"
            title="Open Live Operations Feed"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Feed</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              {events.length}
            </span>
          </button>

          {/* Reporting Period Selector */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <select
              aria-label="Reporting Period"
              value={reportingPeriod}
              onChange={(e) => setReportingPeriod(e.target.value)}
              className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer text-xs"
            >
              <option value="September 2026">September 2026 (Active)</option>
              <option value="August 2026">August 2026</option>
              <option value="July 2026">July 2026</option>
              <option value="Year to Date 2026">Year to Date 2026</option>
            </select>
          </div>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 text-xs font-semibold transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>

          {/* Print / Save PDF */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 text-xs font-semibold transition-all shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print / PDF</span>
          </button>

          {/* New VSR Quick Action */}
          {onOpenNewVSR && (
            <button
              onClick={onOpenNewVSR}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-600/20 transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New VSR</span>
            </button>
          )}
        </div>
      </div>

      {/* MASTER DASHBOARD CONTAINER (White Rectangle, 12px Radius, Modern Soft Shadow) */}
      <div className="bg-white rounded-[12px] border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05),0_2px_6px_-1px_rgba(0,0,0,0.03)] overflow-hidden">
        
        {/* HEADER SECTION (Clean Light Header) */}
        <div className="bg-white px-6 py-5 border-b border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left Brand & Title */}
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center font-black text-white text-sm shadow-md shadow-emerald-600/20">
                kea
              </div>

              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 uppercase font-sans">
                  KEA GROUP OPERATIONS
                </h1>
                <h2 className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">
                  VSR Workforce &amp; Recruitment Master Dashboard
                </h2>
              </div>
            </div>

            {/* Right Period & Subtitle */}
            <div className="text-left md:text-right">
              <div className="text-xs md:text-sm font-bold text-slate-700">
                Reporting Period: <span className="text-emerald-600 font-mono">{reportingPeriod}</span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                Workforce • Recruitment • Funding • Insurance • Compliance
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 1: TOP METRICS & CHARTS OVERVIEW */}
        {(activeTab === 'overview' || activeTab === 'combined') && (
          <>
            {/* TOP 7 INDIVIDUAL WHITE KPI METRIC CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3.5 p-5 bg-slate-50/50 border-b border-slate-100">
              
              {/* Card 1: ACTIVE VSR */}
              <div 
                onClick={() => openDrillDown('active_vsr')}
                className="bg-white rounded-[12px] p-4 border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer flex flex-col justify-between group"
                title="Click to drill down into 45 Active VSR Personnel"
              >
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Active VSR
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Live
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono group-hover:text-emerald-600 transition-colors">
                    {metrics.activeVsrCount}
                  </span>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Onboarded payroll</span>
                  <span className="text-emerald-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Drill ↗</span>
                </div>
              </div>

              {/* Card 2: ACTIVE ASST. VSR */}
              <div 
                onClick={() => openDrillDown('asst_vsr')}
                className="bg-white rounded-[12px] p-4 border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between group"
                title="Click to drill down into 6 Assistant VSR Personnel"
              >
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Active Asst. VSR
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    Field
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                    {metrics.activeAsstVsrCount}
                  </span>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Assistant staff</span>
                  <span className="text-slate-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Drill ↗</span>
                </div>
              </div>

              {/* Card 3: TOTAL ACTIVE STAFF */}
              <div 
                onClick={() => openDrillDown('total_active')}
                className="bg-white rounded-[12px] p-4 border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between group"
                title="Click to drill down into all 51 Active Staff (VSR + Asst VSR)"
              >
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Total Active
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    Combined
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                    {metrics.totalActiveStaffCount}
                  </span>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>VSR + Asst. VSR</span>
                  <span className="text-slate-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Drill ↗</span>
                </div>
              </div>

              {/* Card 4: PROSPECTIVE STAFF */}
              <div 
                onClick={() => openDrillDown('prospective')}
                className="bg-white rounded-[12px] p-4 border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between group"
                title="Click to drill down into 5 Prospective Candidates"
              >
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Prospective
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    Pipeline
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono group-hover:text-blue-600 transition-colors">
                    {metrics.prospectiveStaffCount}
                  </span>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Pending onboarding</span>
                  <span className="text-blue-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Drill ↗</span>
                </div>
              </div>

              {/* Card 5: FUNDED VSR */}
              <div 
                onClick={() => openDrillDown('funded_vsr')}
                className="bg-white rounded-[12px] p-4 border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer flex flex-col justify-between group"
                title="Click to drill down into 32 Funded VSRs"
              >
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Funded VSR
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Disbursed
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono group-hover:text-emerald-600 transition-colors">
                    {metrics.fundedVsrCount}
                  </span>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Loans issued</span>
                  <span className="text-emerald-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Drill ↗</span>
                </div>
              </div>

              {/* Card 6: TOTAL INSURED */}
              <div 
                onClick={() => openDrillDown('total_insured')}
                className="bg-white rounded-[12px] p-4 border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between group"
                title="Click to drill down into 39 Insured Personnel"
              >
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Total Insured
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    Fidelity
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                    {metrics.totalInsuredCount}
                  </span>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Covered personnel</span>
                  <span className="text-slate-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Drill ↗</span>
                </div>
              </div>

              {/* Card 7: RED FLAGS / AUDIT ACTIONS */}
              <div 
                onClick={() => openDrillDown('red_flags')}
                className="bg-white rounded-[12px] p-4 border border-rose-200 shadow-[0_2px_8px_rgba(244,63,94,0.06)] hover:shadow-md hover:border-rose-300 transition-all cursor-pointer flex flex-col justify-between group"
                title="Click to drill down into 3 Red Flagged Personnel"
              >
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">
                    Audit Flags
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                    Action Req.
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-rose-600 tracking-tight font-mono">
                    3
                  </span>
                </div>
                <div className="mt-3 pt-2.5 border-t border-rose-100 text-[11px] text-rose-500 flex items-center justify-between">
                  <span>Requires review</span>
                  <span className="text-rose-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Audit ↗</span>
                </div>
              </div>
            </div>

            {/* SUMMARY STRIP */}
            <div className="px-6 py-3 border-b border-slate-100 bg-white text-xs flex flex-wrap items-center justify-between gap-3 text-slate-600">
              <div className="font-medium">
                This Month: <strong className="font-bold text-slate-900">11 new VSR</strong> | <strong className="font-bold text-slate-900">4 new ASST. VSR</strong> onboarded
              </div>

              <div className="font-medium">
                Year to Date: <strong className="font-bold text-slate-900">47 VSR</strong> onboarded | <strong className="font-bold text-slate-900">6 ASST. VSR</strong> onboarded
              </div>

              <div className="flex items-center gap-2 font-semibold">
                <span>Records requiring review: <strong className="font-bold font-mono text-slate-900">18</strong></span>
                <span className="text-slate-300">|</span>
                <button 
                  onClick={() => openDrillDown('red_flags')}
                  className="text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 font-bold"
                >
                  <span>🚩 Red Flagged: 3</span>
                </button>
              </div>
            </div>

            {/* SECTION DIVIDER BAR (Subtle Light Background) */}
            <div className="bg-slate-50/80 text-slate-700 px-6 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-between border-b border-slate-200/80">
              <div>ACTIVE WORKFORCE &amp; FUNDING STATUS</div>
              <div>FIDELITY INSURANCE COVERAGE</div>
            </div>

            {/* THREE DONUT CHARTS (Clean White Cards + Mint Accents) */}
            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5 border-b border-slate-100 bg-white">
              
              {/* Donut Chart 1: Active Workforce */}
              <div className="bg-white rounded-[12px] p-4 border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col items-center justify-between transition-all hover:border-emerald-300">
                <div className="flex items-center justify-between w-full mb-2">
                  <h3 className="text-sm font-bold text-slate-800">
                    Active Workforce
                  </h3>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    45 VSR / 6 Asst
                  </span>
                </div>

                <div className="relative w-44 h-44 flex items-center justify-center my-2">
                  <svg viewBox="-100 -100 200 200" className="w-full h-full transform -rotate-90">
                    <path
                      d={renderDonutSlice(0, vsrAngle, 50, 85)}
                      fill="url(#mintDonutGrad)"
                      stroke="#ffffff"
                      strokeWidth="3"
                      className="cursor-pointer hover:opacity-90 transition-all hover:scale-105 origin-center"
                      onClick={() => openDrillDown('active_vsr')}
                    >
                      <title>Active VSR (45) - Click to drill down</title>
                    </path>
                    <path
                      d={renderDonutSlice(vsrAngle, 360, 50, 85)}
                      fill="#cbd5e1"
                      stroke="#ffffff"
                      strokeWidth="3"
                      className="cursor-pointer hover:opacity-90 transition-all hover:scale-105 origin-center"
                      onClick={() => openDrillDown('asst_vsr')}
                    >
                      <title>Active ASST. VSR (6) - Click to drill down</title>
                    </path>
                  </svg>

                  <div 
                    onClick={() => openDrillDown('total_active')}
                    className="absolute inset-0 flex items-center justify-center cursor-pointer group"
                    title="Click to drill down into Total Active Workforce"
                  >
                    <div className="text-center group-hover:scale-110 transition-transform">
                      <div className="text-2xl font-black text-slate-900 tracking-tight">
                        {metrics.totalActiveStaffCount}
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold uppercase group-hover:text-emerald-600">Total ↗</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4 text-xs font-medium pt-2 text-slate-600">
                  <button 
                    onClick={() => openDrillDown('active_vsr')}
                    className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span>Active VSR (45)</span>
                  </button>
                  <button 
                    onClick={() => openDrillDown('asst_vsr')}
                    className="flex items-center gap-1.5 hover:text-slate-800 transition-colors"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                    <span>Active ASST (6)</span>
                  </button>
                </div>
              </div>

              {/* Donut Chart 2: VSR Funding Status */}
              <div className="bg-white rounded-[12px] p-4 border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col items-center justify-between transition-all hover:border-emerald-300">
                <div className="flex items-center justify-between w-full mb-2">
                  <h3 className="text-sm font-bold text-slate-800">
                    VSR Funding Status
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    32 Funded
                  </span>
                </div>

                <div className="relative w-44 h-44 flex items-center justify-center my-2">
                  <svg viewBox="-100 -100 200 200" className="w-full h-full transform -rotate-90">
                    <path
                      d={renderDonutSlice(0, (32 / totalFundingCategorized) * 360, 50, 85)}
                      fill="#10b981"
                      stroke="#ffffff"
                      strokeWidth="3"
                      className="cursor-pointer hover:opacity-90 transition-all hover:scale-105 origin-center"
                      onClick={() => openDrillDown('funded_vsr')}
                    >
                      <title>Funded (32) - Click to drill down</title>
                    </path>
                    <path
                      d={renderDonutSlice(
                        (32 / totalFundingCategorized) * 360,
                        360,
                        50,
                        85
                      )}
                      fill="#e2e8f0"
                      stroke="#ffffff"
                      strokeWidth="3"
                      className="cursor-pointer hover:opacity-90 transition-all hover:scale-105 origin-center"
                      onClick={() => openDrillDown('status', 'Insured, awaiting funding')}
                    >
                      <title>Other Statuses (10) - Click to drill down</title>
                    </path>
                  </svg>

                  <div 
                    onClick={() => openDrillDown('funded_vsr')}
                    className="absolute inset-0 flex items-center justify-center cursor-pointer group"
                    title="Click to drill down into 32 Funded VSRs"
                  >
                    <div className="text-center group-hover:scale-110 transition-transform">
                      <div className="text-2xl font-black text-slate-900 tracking-tight">
                        {metrics.fundedVsrCount}
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold uppercase group-hover:text-emerald-600">Funded ↗</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] font-medium pt-2 w-full px-2 text-slate-600">
                  <button 
                    onClick={() => openDrillDown('funded_vsr')}
                    className="flex items-center gap-1.5 hover:text-emerald-600 text-left transition-colors"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0"></span>
                    <span className="truncate">Funded (32)</span>
                  </button>
                  <button 
                    onClick={() => openDrillDown('status', 'Awaiting Funding')}
                    className="flex items-center gap-1.5 hover:text-amber-600 text-left transition-colors"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 flex-shrink-0"></span>
                    <span className="truncate">Awaiting (0)</span>
                  </button>
                  <button 
                    onClick={() => openDrillDown('no_loan')}
                    className="flex items-center gap-1.5 hover:text-blue-600 text-left transition-colors"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400 flex-shrink-0"></span>
                    <span className="truncate">No Loan (1)</span>
                  </button>
                  <button 
                    onClick={() => openDrillDown('status', 'Insured, not to be funded')}
                    className="flex items-center gap-1.5 hover:text-slate-800 text-left transition-colors"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300 flex-shrink-0"></span>
                    <span className="truncate">Other (9)</span>
                  </button>
                </div>
              </div>

              {/* Donut Chart 3: Fidelity Insurance Coverage */}
              <div className="bg-white rounded-[12px] p-4 border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col items-center justify-between transition-all hover:border-emerald-300">
                <div className="flex items-center justify-between w-full mb-2">
                  <h3 className="text-sm font-bold text-slate-800">
                    Fidelity Insurance Coverage
                  </h3>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    39 Covered
                  </span>
                </div>

                <div className="relative w-44 h-44 flex items-center justify-center my-2">
                  <svg viewBox="-100 -100 200 200" className="w-full h-full transform -rotate-90">
                    <path
                      d={renderDonutSlice(0, insuredAngle, 50, 85)}
                      fill="#10b981"
                      stroke="#ffffff"
                      strokeWidth="3"
                      className="cursor-pointer hover:opacity-90 transition-all hover:scale-105 origin-center"
                      onClick={() => openDrillDown('total_insured')}
                    >
                      <title>Insured / Covered (39) - Click to drill down</title>
                    </path>
                    <path
                      d={renderDonutSlice(insuredAngle, 360, 50, 85)}
                      fill="#e2e8f0"
                      stroke="#ffffff"
                      strokeWidth="3"
                      className="cursor-pointer hover:opacity-90 transition-all hover:scale-105 origin-center"
                      onClick={() => openDrillDown('prospective')}
                    >
                      <title>Pending / Not Covered (6) - Click to drill down</title>
                    </path>
                  </svg>

                  <div 
                    onClick={() => openDrillDown('total_insured')}
                    className="absolute inset-0 flex items-center justify-center cursor-pointer group"
                    title="Click to drill down into 39 Insured Personnel"
                  >
                    <div className="text-center group-hover:scale-110 transition-transform">
                      <div className="text-2xl font-black text-slate-900 tracking-tight">
                        {metrics.totalInsuredCount}
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold uppercase group-hover:text-emerald-600">Covered ↗</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-5 text-xs font-medium pt-2 text-slate-600">
                  <button 
                    onClick={() => openDrillDown('total_insured')}
                    className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors"
                    title="Drill down into Covered Personnel"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span>Insured (39)</span>
                  </button>
                  <button 
                    onClick={() => openDrillDown('prospective')}
                    className="flex items-center gap-1.5 hover:text-slate-800 transition-colors"
                    title="Drill down into Pending Personnel"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                    <span>Pending (6)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* MONTHLY STAFF ONBOARDING (Light Theme + Mint Gradient Fills + Subtle Dashed Gridlines) */}
            <div className="p-5 border-b border-slate-100 bg-white">
              <div className="border border-slate-200/80 rounded-[12px] p-5 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Monthly Staff Onboarding
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Cohort onboarding trajectory across fiscal 2026</p>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Click bars to drill down cohort
                  </span>
                </div>

                {/* Plot Area */}
                <div className="relative h-64 w-full flex items-end pt-6 pb-6 px-10">
                  {/* Subtle Gridlines (Aggressive lines removed) */}
                  <div className="absolute inset-x-10 inset-y-6 flex flex-col justify-between pointer-events-none">
                    {[20, 16, 12, 8, 4, 0].map((val) => (
                      <div key={val} className="relative w-full flex items-center">
                        <span className="absolute -left-8 text-[11px] font-mono text-slate-400 text-right w-6">
                          {val}
                        </span>
                        <div className="w-full border-b border-dashed border-slate-100"></div>
                      </div>
                    ))}
                  </div>

                  <div className="absolute left-1 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                    Staff Onboarded
                  </div>

                  {/* Mint Gradient Bar Columns */}
                  <div className="relative z-10 w-full h-full flex items-end justify-between px-2">
                    {monthlyOnboardingData.map((d) => {
                      const maxVal = 20;
                      const vsrHeightPct = (d.vsr / maxVal) * 100;
                      const asstHeightPct = (d.asst / maxVal) * 100;

                      return (
                        <div 
                          key={d.month} 
                          onClick={() => openDrillDown('month_onboarding', d.month)}
                          className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer hover:bg-slate-50/80 rounded-lg p-1 transition-all"
                          title={`Click to drill down into ${d.month} cohort (${d.vsr + d.asst} staff)`}
                        >
                          <div className="flex items-end gap-1.5 w-full justify-center h-full pb-1">
                            {/* VSR Bar with Semi-Transparent Mint Green Gradient */}
                            <div className="flex flex-col items-center">
                              {d.vsr > 0 && (
                                <span className="text-[10px] font-bold text-slate-500 mb-1 font-mono">
                                  {d.vsr}
                                </span>
                              )}
                              <div
                                style={{ height: `${Math.max(vsrHeightPct, 0)}%` }}
                                className={`w-3.5 sm:w-5 bg-gradient-to-t from-emerald-500/30 via-emerald-400/70 to-emerald-500 rounded-t-[4px] border-t-2 border-emerald-400 transition-all duration-300 group-hover:from-emerald-500/50 group-hover:to-emerald-400 ${
                                  d.vsr === 0 ? 'h-0' : 'min-h-[2px]'
                                }`}
                              />
                            </div>

                            {/* Assistant VSR Bar */}
                            <div className="flex flex-col items-center">
                              {d.asst > 0 && (
                                <span className="text-[10px] font-bold text-slate-400 mb-1 font-mono">
                                  {d.asst}
                                </span>
                              )}
                              <div
                                style={{ height: `${Math.max(asstHeightPct, 0)}%` }}
                                className={`w-3.5 sm:w-5 bg-gradient-to-t from-slate-300/40 to-slate-400/80 rounded-t-[4px] border-t-2 border-slate-400 transition-all duration-300 ${
                                  d.asst === 0 ? 'h-0' : 'min-h-[2px]'
                                }`}
                              />
                            </div>

                            {d.vsr === 0 && d.asst === 0 && (
                              <span className="text-[10px] text-slate-300 font-mono">0</span>
                            )}
                          </div>

                          {/* X-Axis Month in Muted Grey Font */}
                          <span className="text-[11px] font-medium text-slate-400 mt-2 group-hover:text-emerald-600 transition-colors">
                            {d.month}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-6 text-xs font-semibold pt-3 border-t border-slate-100 text-slate-500">
                  <button 
                    onClick={() => openDrillDown('active_vsr')}
                    className="flex items-center gap-2 hover:text-emerald-600 transition-colors"
                  >
                    <span className="w-3 h-3 rounded-[3px] bg-emerald-500/80"></span>
                    <span>VSR Cohort (Mint Fill)</span>
                  </button>
                  <button 
                    onClick={() => openDrillDown('asst_vsr')}
                    className="flex items-center gap-2 hover:text-slate-800 transition-colors"
                  >
                    <span className="w-3 h-3 rounded-[3px] bg-slate-400/80"></span>
                    <span>ASST VSR Onboarded</span>
                  </button>
                </div>
              </div>
            </div>

            {/* MONTHLY VSR FUNDING SECTION */}
            <div className="bg-slate-50/80 text-slate-700 px-6 py-2.5 text-xs font-bold uppercase tracking-wider border-b border-slate-200/80">
              MONTHLY VSR FUNDING
            </div>

            <div className="p-5 border-b border-slate-100 bg-white">
              <div className="border border-slate-200/80 rounded-[12px] p-5 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Monthly VSR Funding
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Loan disbursement pacing per monthly cycle</p>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Click bars to drill down cohort
                  </span>
                </div>

                <div className="relative h-60 w-full flex items-end pt-6 pb-6 px-10">
                  {/* Subtle Gridlines */}
                  <div className="absolute inset-x-10 inset-y-6 flex flex-col justify-between pointer-events-none">
                    {[18, 12, 6, 0].map((val) => (
                      <div key={val} className="relative w-full flex items-center">
                        <span className="absolute -left-8 text-[11px] font-mono text-slate-400 text-right w-6">
                          {val}
                        </span>
                        <div className="w-full border-b border-dashed border-slate-100"></div>
                      </div>
                    ))}
                  </div>

                  <div className="relative z-10 w-full h-full flex items-end justify-between px-2">
                    {monthlyFundingData.map((d) => {
                      const maxVal = 18;
                      const heightPct = (d.count / maxVal) * 100;

                      return (
                        <div 
                          key={d.month} 
                          onClick={() => openDrillDown('month_funding', d.month)}
                          className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer hover:bg-slate-50/80 rounded-lg p-1 transition-all"
                          title={`Click to drill down into ${d.month} funded cohort (${d.count} VSRs)`}
                        >
                          <div className="flex flex-col items-center w-full justify-end h-full pb-1">
                            {d.count > 0 ? (
                              <>
                                <span className="text-[10px] font-bold text-slate-500 mb-1 font-mono">
                                  {d.count}
                                </span>
                                <div
                                  style={{ height: `${Math.max(heightPct, 0)}%` }}
                                  className="w-5 sm:w-7 bg-gradient-to-t from-emerald-500/30 via-emerald-400/70 to-emerald-500 rounded-t-[4px] border-t-2 border-emerald-400 transition-all duration-300 group-hover:from-emerald-500/50 group-hover:to-emerald-400"
                                />
                              </>
                            ) : (
                              <span className="text-[10px] text-slate-300 font-mono">0</span>
                            )}
                          </div>

                          <span className="text-[11px] font-medium text-slate-400 mt-2 group-hover:text-emerald-600 transition-colors">
                            {d.month}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] font-medium pt-3 border-t border-slate-100 text-slate-500">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => (
                    <button 
                      key={m} 
                      onClick={() => openDrillDown('month_funding', m)}
                      className="flex items-center gap-1 hover:text-emerald-600 transition-colors"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>{m}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* THREE DETAILED TABLES (Clean Light Cards) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 border-b border-slate-100 bg-white">
              
              {/* Column 1: VSR STATUS BREAKDOWN */}
              <div className="flex flex-col p-4">
                <div className="bg-slate-50 text-slate-700 px-3.5 py-2.5 rounded-t-lg text-xs font-bold uppercase tracking-tight flex items-center justify-between border border-slate-200/80">
                  <span>VSR Status Breakdown</span>
                  <span className="text-[10px] text-emerald-600 font-mono">Drill down ↗</span>
                </div>

                <div className="overflow-x-auto divide-y divide-slate-100 text-xs border-x border-b border-slate-200/80 rounded-b-lg">
                  <table className="w-full text-left">
                    <tbody>
                      {statusBreakdownData.map((row, idx) => (
                        <tr 
                          key={idx} 
                          onClick={() => openDrillDown('status', row.status)}
                          className="hover:bg-emerald-50/50 cursor-pointer transition-colors group"
                          title={`Click to drill down into records with status: "${row.status}"`}
                        >
                          <td className="px-3.5 py-2 font-medium text-slate-700 group-hover:text-emerald-700 transition-colors">
                            {row.status}
                          </td>
                          <td className="px-3.5 py-2 text-right font-mono font-bold w-14 text-slate-900">
                            {row.count}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Column 2: ACTIVE VSRs BY LOCATION */}
              <div className="flex flex-col p-4">
                <div className="bg-slate-50 text-slate-700 px-3.5 py-2.5 rounded-t-lg text-xs font-bold uppercase tracking-tight flex items-center justify-between border border-slate-200/80">
                  <span>Active VSRs By Location</span>
                  <span className="text-[10px] text-emerald-600 font-mono">Drill down ↗</span>
                </div>

                <div className="overflow-x-auto divide-y divide-slate-100 text-xs border-x border-b border-slate-200/80 rounded-b-lg flex-1">
                  <table className="w-full text-left">
                    <tbody>
                      {locationData.map((row, idx) => (
                        <tr 
                          key={idx} 
                          onClick={() => openDrillDown('location', row.location)}
                          className="hover:bg-emerald-50/50 cursor-pointer transition-colors group"
                          title={`Click to drill down into active VSRs in ${row.location}`}
                        >
                          <td className="px-3.5 py-2 font-medium text-slate-700 group-hover:text-emerald-700 transition-colors">
                            {row.location}
                          </td>
                          <td className="px-3.5 py-2 text-right font-mono font-bold w-14 text-slate-900">
                            {row.count}
                          </td>
                        </tr>
                      ))}
                      <tr 
                        onClick={() => openDrillDown('total_active')}
                        className="bg-emerald-50/40 font-bold border-t-2 border-slate-200 hover:bg-emerald-100/50 cursor-pointer transition-colors"
                        title="Click to drill down all 51 active personnel"
                      >
                        <td className="px-3.5 py-2.5 text-slate-900 uppercase flex items-center justify-between">
                          <span>Total Active VSRs</span>
                          <span className="text-[10px] text-emerald-700 font-mono">View All ↗</span>
                        </td>
                        <td className="px-3.5 py-2.5 text-right font-mono text-emerald-700 text-sm font-black">
                          51
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Column 3: ACTION REQUIRED & RED FLAG LIST */}
              <div className="flex flex-col p-4">
                <div className="bg-slate-50 text-slate-700 px-3.5 py-2.5 rounded-t-lg text-xs font-bold uppercase tracking-tight flex items-center gap-1.5 border border-slate-200/80">
                  <span className="text-amber-500">⚠️</span>
                  <span>Action Required</span>
                </div>

                <div className="overflow-x-auto divide-y divide-slate-100 text-xs border-x border-b border-slate-200/80 rounded-b-lg">
                  <table className="w-full text-left">
                    <tbody>
                      {actionRequiredData.map((row, idx) => (
                        <tr 
                          key={idx}
                          onClick={() => {
                            if (row.issue.includes('Missing Employee Code')) {
                              setStatusFilter('Missing Code');
                              setActiveTab('combined');
                            } else {
                              setSelectedDrillDown(row.issue);
                            }
                          }}
                          className="hover:bg-rose-50/40 cursor-pointer transition-colors"
                        >
                          <td className={`px-3.5 py-2 font-medium flex items-center gap-1.5 ${
                            row.isRedFlag ? 'text-rose-600 font-bold' : 'text-slate-700'
                          }`}>
                            {row.isRedFlag && <span>🚩</span>}
                            <span>{row.issue}</span>
                          </td>
                          <td className={`px-3.5 py-2 text-right font-mono font-bold w-14 ${
                            row.isRedFlag ? 'text-rose-600' : 'text-slate-900'
                          }`}>
                            {row.count}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* RED FLAG LIST */}
                <div className="bg-rose-50 text-rose-800 px-3.5 py-2 text-[11px] font-bold uppercase tracking-tight border border-rose-200 rounded-t-lg mt-3 flex items-center justify-between">
                  <span>Red Flag Audit List</span>
                  <span className="text-rose-600 font-mono">3 flagged</span>
                </div>

                <div className="p-2 space-y-1.5 text-xs flex-1 border-x border-b border-rose-200 rounded-b-lg bg-rose-50/20">
                  {RED_FLAGGED_STAFF.map((staff, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setSelectedRedFlag(staff)}
                      className="p-2.5 rounded-lg border border-rose-200 bg-white hover:bg-rose-50 cursor-pointer transition-all flex flex-col gap-0.5 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 font-bold text-rose-700">
                          <span>🚩</span>
                          <span>{staff.name}</span>
                          <span className="text-[10px] font-mono text-slate-400 font-normal">({staff.code})</span>
                        </div>
                        <span className="text-[10px] font-mono font-semibold text-slate-500">{staff.location}</span>
                      </div>

                      <div className="text-[11px] text-slate-600 italic pl-5 flex items-center gap-1 mt-0.5">
                        {staff.reason.includes('DANGER') ? (
                          <span className="text-rose-700 font-bold uppercase tracking-tight">⚠️ {staff.reason}</span>
                        ) : (
                          <span>{staff.reason}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* SECTION 2: LIVE VSR ONBOARDING & FUNDING TRACKER */}
        {(activeTab === 'tracker' || activeTab === 'combined') && (
          <div className="border-t border-slate-200 bg-white">
            {/* SPREADSHEET TAB STRIP */}
            <div className="bg-slate-50/80 px-4 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  onClick={() => {
                    setActiveTab('overview');
                  }}
                  className="px-3 py-1.5 rounded-lg font-semibold transition-all bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-xs"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    setTrackerSubTab('vsr');
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all border ${
                    trackerSubTab === 'vsr'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200'
                  }`}
                >
                  Active VSR Tracker ({LIVE_VSR_DATA.length})
                </button>
                <button
                  onClick={() => {
                    setTrackerSubTab('asst_vsr');
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all border ${
                    trackerSubTab === 'asst_vsr'
                      ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                      : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200'
                  }`}
                >
                  ASST. VSR ({LIVE_ASST_VSR_DATA.length})
                </button>
                <button
                  onClick={() => {
                    setTrackerSubTab('no_loan');
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all border ${
                    trackerSubTab === 'no_loan'
                      ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                      : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200'
                  }`}
                >
                  NO LOAN / INSURED ({LIVE_NO_LOAN_DATA.length})
                </button>
                <button
                  onClick={() => {
                    if (onNavigate) {
                      onNavigate('vsr_recruitment');
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg font-semibold transition-all bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 flex items-center gap-1.5"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>VSR Recruitment</span>
                </button>
              </div>

              {/* SPREADSHEET HEADER TITLE */}
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                {trackerSubTab === 'asst_vsr' ? (
                  <>
                    <span>Assistant VSR Tracker</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-[10px] font-bold border border-slate-200">
                      6 ASST. VSR
                    </span>
                  </>
                ) : trackerSubTab === 'no_loan' ? (
                  <>
                    <span>No Loan Required / Insured</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-[10px] font-bold border border-slate-200">
                      5 RECORDS
                    </span>
                  </>
                ) : (
                  <>
                    <span>Active VSR Onboarding &amp; Funding Tracker</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold border border-emerald-200">
                      57 LIVE RECORDS
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* SPREADSHEET FILTER & SEARCH TOOLBAR */}
            <div className="p-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs bg-white">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[220px] max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by staff name, code, location, phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filter Selectors */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-500">Location:</span>
                  <select
                    aria-label="Location"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium cursor-pointer shadow-xs focus:outline-none"
                  >
                    <option value="All">All Locations</option>
                    <option value="Lagos">Lagos</option>
                    <option value="Abeokuta">Abeokuta</option>
                    <option value="Ibadan">Ibadan</option>
                    <option value="Enugu">Enugu</option>
                    <option value="Ogun">Ogun</option>
                    <option value="Osogbo">Osogbo</option>
                    <option value="Benin">Benin</option>
                  </select>
                </div>

                {trackerSubTab === 'vsr' && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-slate-500">Status:</span>
                    <select
                      aria-label="Status"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium cursor-pointer shadow-xs focus:outline-none"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Funded">Funded (32)</option>
                      <option value="Insured">Insured (39)</option>
                      <option value="Under Review">Under Review (3)</option>
                      <option value="Cleared">Cleared by Risk (4)</option>
                      <option value="Missing Code">Missing Code (17)</option>
                    </select>
                  </div>
                )}

                {(searchQuery || locationFilter !== 'All' || statusFilter !== 'All') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setLocationFilter('All');
                      setStatusFilter('All');
                      setWorkforceStatusFilter('All');
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-semibold transition-colors"
                  >
                    Reset
                  </button>
                )}

                <span className="text-xs font-mono text-slate-400 pl-2">
                  Showing <strong>{trackerSubTab === 'asst_vsr' ? filteredAsstVsrData.length : trackerSubTab === 'no_loan' ? filteredNoLoanData.length : filteredVsrData.length}</strong> rows
                </span>
              </div>
            </div>

            {/* SPREADSHEET TABLE CONTAINER */}
            {trackerSubTab === 'no_loan' ? (
              <div className="overflow-x-auto max-h-[700px]">
                <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
                  <thead className="sticky top-0 z-20 bg-slate-50 text-slate-700 border-b border-slate-200 font-sans shadow-xs">
                    <tr>
                      <th className="px-3.5 py-3 font-bold border-r border-slate-200 text-center w-14">S/N</th>
                      <th className="px-4 py-3 font-bold border-r border-slate-200">Full Name</th>
                      <th className="px-4 py-3 font-bold border-r border-slate-200">Location</th>
                      <th className="px-5 py-3 font-bold border-r border-slate-200">Reason / Notes</th>
                      <th className="px-4 py-3 font-bold border-r border-slate-200">Email</th>
                      <th className="px-4 py-3 font-bold">Phone</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredNoLoanData.map((record) => {
                      const hasSpecialReason = record.reasonNotes && record.reasonNotes !== '0';
                      return (
                        <tr
                          key={record.sn}
                          onClick={() => setSelectedRowDetail({ ...record, recordCategory: 'no_loan' })}
                          className={`transition-colors cursor-pointer hover:bg-emerald-50/50 ${
                            record.sn % 2 === 0 ? 'bg-slate-50/30' : 'bg-white'
                          }`}
                        >
                          <td className="px-3.5 py-2.5 text-center font-mono font-bold text-slate-600 border-r border-slate-100">
                            {record.sn}
                          </td>
                          <td className="px-4 py-2.5 font-bold text-slate-900 border-r border-slate-100">
                            {record.fullName}
                          </td>
                          <td className="px-4 py-2.5 font-semibold text-slate-700 border-r border-slate-100">
                            {record.location}
                          </td>
                          <td className="px-5 py-2.5 border-r border-slate-100">
                            {hasSpecialReason ? (
                              <span className="px-2.5 py-1 rounded font-bold text-[11px] bg-amber-50 text-amber-800 border border-amber-200 shadow-xs inline-flex items-center gap-1.5">
                                <span>⚠️</span>
                                <span>{record.reasonNotes}</span>
                              </span>
                            ) : (
                              <span className="font-mono text-slate-400 font-medium text-xs">
                                0
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 font-mono text-[11px] border-r border-slate-100 max-w-[220px] truncate" title={record.email}>
                            {record.email === '0' ? (
                              <span className="font-mono text-slate-300">0</span>
                            ) : (
                              <span className="text-slate-600">{record.email}</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 font-mono text-[11px] font-semibold text-slate-700">
                            {record.phone === '0' ? (
                              <span className="font-mono text-slate-300">0</span>
                            ) : (
                              record.phone
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : trackerSubTab === 'asst_vsr' ? (
              <div className="overflow-x-auto max-h-[700px]">
                <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
                  <thead className="sticky top-0 z-20 bg-slate-50 text-slate-700 border-b border-slate-200 font-sans shadow-xs">
                    <tr>
                      <th className="px-3 py-3 font-bold border-r border-slate-200 text-center w-12">S/N</th>
                      <th className="px-3.5 py-3 font-bold border-r border-slate-200">Employee Code</th>
                      <th className="px-4 py-3 font-bold border-r border-slate-200">Full Name</th>
                      <th className="px-3 py-3 font-bold border-r border-slate-200 text-center">VSR Type</th>
                      <th className="px-3 py-3 font-bold border-r border-slate-200 text-center">Onboarded</th>
                      <th className="px-3.5 py-3 font-bold border-r border-slate-200">Workforce Status</th>
                      <th className="px-3.5 py-3 font-bold border-r border-slate-200">Location</th>
                      <th className="px-3.5 py-3 font-bold border-r border-slate-200">Email</th>
                      <th className="px-3.5 py-3 font-bold border-r border-slate-200">Phone</th>
                      <th className="px-3 py-3 font-bold border-r border-slate-200">Risk Alert</th>
                      <th className="px-3 py-3 font-bold">Notes</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredAsstVsrData.map((record) => (
                      <tr
                        key={record.sn}
                        onClick={() => setSelectedRowDetail({ ...record, recordCategory: 'asst_vsr' })}
                        className={`transition-colors cursor-pointer hover:bg-emerald-50/50 ${
                          record.sn % 2 === 0 ? 'bg-slate-50/30' : 'bg-white'
                        }`}
                      >
                        <td className="px-3 py-2.5 text-center font-mono font-bold text-slate-600 border-r border-slate-100">
                          {record.sn}
                        </td>
                        <td className="px-3.5 py-2.5 font-mono border-r border-slate-100">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 shadow-xs">
                            {record.employeeCode}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 font-bold text-slate-900 border-r border-slate-100">
                          {record.fullName}
                        </td>
                        <td className="px-3 py-2.5 text-center font-medium border-r border-slate-100">
                          <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-600 font-semibold">
                            {record.vsrType}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-center font-mono text-slate-700 border-r border-slate-100 font-medium">
                          {record.onboardedDate}
                        </td>
                        <td className="px-3.5 py-2.5 border-r border-slate-100">
                          <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-slate-100 text-slate-700 border border-slate-200">
                            {record.workforceStatus}
                          </span>
                        </td>
                        <td className="px-3.5 py-2.5 font-semibold text-slate-700 border-r border-slate-100">
                          {record.location}
                        </td>
                        <td className="px-3.5 py-2.5 font-mono text-[11px] text-slate-600 border-r border-slate-100 max-w-[220px] truncate" title={record.email}>
                          {record.email}
                        </td>
                        <td className="px-3.5 py-2.5 font-mono text-[11px] font-semibold text-slate-700 border-r border-slate-100">
                          {record.phone}
                        </td>
                        <td className="px-3 py-2.5 border-r border-slate-100 text-slate-400">
                          {record.riskAlert || '-'}
                        </td>
                        <td className="px-3 py-2.5 text-slate-400 italic text-[11px]">
                          {record.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[700px]">
                <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
                  <thead className="sticky top-0 z-20 bg-slate-50 text-slate-700 border-b border-slate-200 font-sans shadow-xs">
                    <tr>
                      <th className="px-3 py-3 font-bold border-r border-slate-200 text-center w-10">S/N</th>
                      <th className="px-3.5 py-3 font-bold border-r border-slate-200">Employee Code</th>
                      <th className="px-4 py-3 font-bold border-r border-slate-200">Full Name</th>
                      <th className="px-3 py-3 font-bold border-r border-slate-200 text-center">Onboarded</th>
                      <th className="px-3.5 py-3 font-bold border-r border-slate-200">Workforce Status</th>
                      <th className="px-3.5 py-3 font-bold border-r border-slate-200">Status</th>
                      <th className="px-3 py-3 font-bold border-r border-slate-200 text-center">Date Funded</th>
                      <th className="px-3 py-3 font-bold border-r border-slate-200 text-center">Fidelity Insurance</th>
                      <th className="px-3.5 py-3 font-bold border-r border-slate-200">Location</th>
                      <th className="px-3.5 py-3 font-bold border-r border-slate-200">Email</th>
                      <th className="px-3.5 py-3 font-bold border-r border-slate-200">Phone</th>
                      <th className="px-2.5 py-3 font-bold border-r border-slate-200 text-center">Priority</th>
                      <th className="px-3 py-3 font-bold border-r border-slate-200">Risk Alert</th>
                      <th className="px-3 py-3 font-bold">Risk Status</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredVsrData.map((record) => {
                      const isRedFlag = record.workforceStatus === 'Removed - Red Flag';
                      const isMissingCode = record.employeeCode === 'TO BE ADDED';
                      const isFunded = record.status === 'Funded';
                      const isUnderReview = record.status.includes('Under Review');
                      const isProspective = record.workforceStatus === 'Prospective VSR';

                      return (
                        <tr
                          key={record.sn}
                          onClick={() => setSelectedRowDetail({ ...record, recordCategory: 'vsr' })}
                          className={`transition-colors cursor-pointer hover:bg-emerald-50/50 ${
                            isRedFlag
                              ? 'bg-rose-50/50 hover:bg-rose-100/60'
                              : record.sn % 2 === 0
                              ? 'bg-slate-50/30'
                              : 'bg-white'
                          }`}
                        >
                          <td className="px-3 py-2 text-center font-mono font-bold text-slate-600 border-r border-slate-100">
                            {record.sn}
                          </td>

                          <td className="px-3.5 py-2 font-mono border-r border-slate-100">
                            {isMissingCode ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                TO BE ADDED
                              </span>
                            ) : (
                              <span className="font-semibold text-slate-800">
                                {record.employeeCode}
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-2 font-bold text-slate-900 border-r border-slate-100">
                            {record.fullName}
                          </td>

                          <td className="px-3 py-2 text-center font-mono text-slate-600 border-r border-slate-100">
                            {record.onboardedDate || '-'}
                          </td>

                          <td className="px-3.5 py-2 border-r border-slate-100">
                            {record.workforceStatus === 'Active VSR' ? (
                              <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Active VSR
                              </span>
                            ) : isRedFlag ? (
                              <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-rose-50 text-rose-700 border border-rose-200">
                                Removed - Red Flag
                              </span>
                            ) : isProspective ? (
                              <span className="px-2 py-0.5 rounded-full font-medium text-[10px] bg-slate-100 text-slate-600">
                                Prospective VSR
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-slate-100 text-slate-700">
                                {record.workforceStatus}
                              </span>
                            )}
                          </td>

                          <td className="px-3.5 py-2 border-r border-slate-100">
                            {isFunded ? (
                              <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Funded
                              </span>
                            ) : isUnderReview ? (
                              <span className="px-2 py-0.5 rounded font-semibold text-[10px] bg-amber-50 text-amber-800 border border-amber-200">
                                {record.status}
                              </span>
                            ) : record.status ? (
                              <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                                {record.status}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">-</span>
                            )}
                          </td>

                          <td className="px-3 py-2 text-center font-mono text-slate-600 border-r border-slate-100">
                            {record.dateFunded || '-'}
                          </td>

                          <td className="px-3 py-2 text-center font-bold border-r border-slate-100">
                            {record.fidelityInsurance === 'YES' ? (
                              <span className="text-emerald-600 font-bold">YES</span>
                            ) : record.fidelityInsurance === 'NOT YET' ? (
                              <span className="text-amber-600 font-bold">NOT YET</span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>

                          <td className="px-3.5 py-2 font-semibold text-slate-700 border-r border-slate-100">
                            {record.location}
                          </td>

                          <td className="px-3.5 py-2 font-mono text-[11px] text-slate-600 border-r border-slate-100 max-w-[200px] truncate" title={record.email}>
                            {record.email || '-'}
                          </td>

                          <td className="px-3.5 py-2 font-mono text-[11px] text-slate-600 border-r border-slate-100">
                            {record.phone || '-'}
                          </td>

                          <td className="px-2.5 py-2 text-center font-mono font-bold text-slate-700 border-r border-slate-100">
                            {record.priority}
                          </td>

                          <td className="px-3 py-2 border-r border-slate-100">
                            {record.riskAlert ? (
                              <span className="font-bold text-rose-600 flex items-center gap-1 text-[11px]">
                                {record.riskAlert}
                              </span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>

                          <td className="px-3 py-2">
                            {record.riskStatus ? (
                              <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-rose-50 text-rose-700 border border-rose-200">
                                {record.riskStatus}
                              </span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* BOTTOM SPREADSHEET FOOTER / AUDIT STAMP */}
        <div className="px-6 py-3.5 bg-slate-50 text-slate-500 text-xs flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-medium text-slate-700">KEA Group Official VSR Human Resources &amp; Funding Ledger</span>
            <span className="text-slate-300">•</span>
            <span className="font-mono text-slate-500">
              {trackerSubTab === 'asst_vsr'
                ? '6 Live Assistant VSR Records'
                : trackerSubTab === 'no_loan'
                ? '5 Live No Loan / Insured Records Synchronized'
                : '57 Live Records Synchronized with Head Office'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {onNavigate && (
              <button
                onClick={() => onNavigate('operations')}
                className="text-emerald-700 hover:text-emerald-800 hover:underline font-bold flex items-center gap-1"
              >
                <span>Go to Daily Operations</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ROW DETAIL MODAL (Light Theme) */}
      {selectedRowDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white text-slate-800 border border-slate-200 rounded-[12px] max-w-lg w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className={`w-8 h-8 rounded-full font-black flex items-center justify-center text-xs ${
                  selectedRowDetail.recordCategory === 'asst_vsr'
                    ? 'bg-slate-800 text-white'
                    : selectedRowDetail.recordCategory === 'no_loan'
                    ? 'bg-slate-700 text-white'
                    : 'bg-emerald-600 text-white'
                }`}>
                  {selectedRowDetail.sn}
                </span>
                <div>
                  <h4 className="font-bold text-base text-slate-900">
                    {selectedRowDetail.fullName}
                  </h4>
                  <span className="text-xs text-slate-500 font-mono">
                    {selectedRowDetail.recordCategory === 'no_loan'
                      ? `No Loan Required / Insured • ${selectedRowDetail.location}`
                      : `Code: ${selectedRowDetail.employeeCode} • ${selectedRowDetail.location}`}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedRowDetail(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2.5 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Workforce Status:</span>
                <span className="font-bold text-emerald-700">
                  {selectedRowDetail.recordCategory === 'no_loan'
                    ? 'Insured (No Loan Required)'
                    : selectedRowDetail.workforceStatus}
                </span>
              </div>

              {selectedRowDetail.recordCategory === 'no_loan' ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Classification:</span>
                    <span className="text-slate-900 font-bold">No Loan Required / Insured</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Location:</span>
                    <span className="text-slate-700">{selectedRowDetail.location}</span>
                  </div>

                  <div className="flex justify-between items-start gap-2">
                    <span className="text-slate-500">Reason / Notes:</span>
                    <span className="font-semibold text-right text-slate-800">
                      {selectedRowDetail.reasonNotes && selectedRowDetail.reasonNotes !== '0'
                        ? selectedRowDetail.reasonNotes
                        : 'Standard policy: Insured non-borrower'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Fidelity Insurance:</span>
                    <span className="text-emerald-700 font-bold">YES (Coverage Active)</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Email:</span>
                    <span className="text-slate-700 truncate max-w-[240px]">
                      {selectedRowDetail.email === '0' ? 'None on file' : selectedRowDetail.email}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Phone:</span>
                    <span className="text-slate-700">
                      {selectedRowDetail.phone === '0' ? 'None on file' : selectedRowDetail.phone}
                    </span>
                  </div>
                </>
              ) : selectedRowDetail.recordCategory === 'asst_vsr' ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-500">VSR Role Type:</span>
                    <span className="text-slate-900 font-bold">{selectedRowDetail.vsrType}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Onboarded Date:</span>
                    <span className="text-slate-700">{selectedRowDetail.onboardedDate}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Location:</span>
                    <span className="text-slate-700">{selectedRowDetail.location}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Email:</span>
                    <span className="text-slate-700 truncate max-w-[240px]">{selectedRowDetail.email}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Phone:</span>
                    <span className="text-slate-700">{selectedRowDetail.phone}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Code Audit:</span>
                    <span className="text-amber-700 font-bold">{selectedRowDetail.employeeCode}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Funding Status:</span>
                    <span className="text-slate-900 font-bold">{selectedRowDetail.status || 'None'}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Date Funded:</span>
                    <span className="text-slate-700">{selectedRowDetail.dateFunded || 'Not Funded Yet'}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Fidelity Insurance:</span>
                    <span className={`font-bold ${
                      selectedRowDetail.fidelityInsurance === 'YES' ? 'text-emerald-700' : 'text-amber-600'
                    }`}>
                      {selectedRowDetail.fidelityInsurance || 'Pending'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Email:</span>
                    <span className="text-slate-700 truncate max-w-[240px]">{selectedRowDetail.email || 'None on file'}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Phone:</span>
                    <span className="text-slate-700">{selectedRowDetail.phone || 'None on file'}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Priority Level:</span>
                    <span className="text-slate-900">Priority {selectedRowDetail.priority}</span>
                  </div>

                  {selectedRowDetail.riskAlert && (
                    <div className="pt-2 border-t border-rose-200 text-rose-600 font-bold">
                      ⚠️ Alert: {selectedRowDetail.riskAlert}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedRowDetail(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
              >
                Close
              </button>
              {onNavigate && (
                <button
                  onClick={() => {
                    setSelectedRowDetail(null);
                    onNavigate('operations');
                  }}
                  className="px-4 py-2 rounded-lg font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                >
                  View Operations Record
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DRILL-DOWN MODAL FOR ACTION ITEMS (Light Theme) */}
      {selectedDrillDown && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white text-slate-800 border border-slate-200 rounded-[12px] max-w-xl w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h4 className="font-bold text-base text-slate-900">
                  Audit Issue: {selectedDrillDown}
                </h4>
              </div>
              <button
                onClick={() => setSelectedDrillDown(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2">
              <p>
                The audit system flagged <strong>{selectedDrillDown}</strong> on file. Records require compliance verification before end-of-month reconciliation.
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2 font-mono text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Category:</span>
                  <span className="text-slate-900">Human Resources &amp; Payroll</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Auto-Audit Verification:</span>
                  <span className="text-emerald-700 font-bold">Active (Hourly)</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Authorized Action:</span>
                  <span className="text-amber-700 font-bold">Contact Area Supervisor</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedDrillDown(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
              >
                Dismiss
              </button>
              <button
                onClick={() => {
                  setSelectedDrillDown(null);
                  setActiveTab('tracker');
                  setStatusFilter('Missing Code');
                }}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                Filter In Tracker
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RED FLAG DETAIL MODAL (Light Theme) */}
      {selectedRedFlag && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white text-slate-800 border border-rose-200 rounded-[12px] max-w-lg w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-rose-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🚩</span>
                <div>
                  <h4 className="font-bold text-base text-rose-700">
                    {selectedRedFlag.name}
                  </h4>
                  <span className="text-xs text-rose-500 font-mono">
                    {selectedRedFlag.code} • {selectedRedFlag.location}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedRedFlag(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs space-y-2">
              <div className="text-rose-800 font-bold uppercase tracking-wider text-[10px]">
                Flagged Reason &amp; Risk Notes
              </div>
              <p className="text-rose-700 font-medium">
                {selectedRedFlag.reason}
              </p>
              <div className="text-[11px] text-slate-500 pt-1 border-t border-rose-200 flex justify-between">
                <span>Date Flagged: {selectedRedFlag.dateFlagged}</span>
                <span className="text-rose-700 font-bold uppercase">Status: Removed from Active</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedRedFlag(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedRedFlag(null);
                }}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                Request Audit Clearance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real-Time Universal Drill-Down Tabular Modal */}
      <DashboardDrillDownModal
        state={drillDown}
        onClose={closeDrillDown}
        onSelectRecord={(rec: any) => setSelectedRowDetail(rec)}
      />

      {/* Real-Time Operational Live Telemetry Feed Drawer */}
      <DashboardLiveFeedWidget
        isOpen={isFeedDrawerOpen}
        onClose={() => setIsFeedDrawerOpen(false)}
        events={events}
        isSyncing={isSyncing}
        onTriggerSync={triggerManualSync}
        pollingInterval={pollingInterval}
        onSetPollingInterval={setPollingInterval}
      />
    </div>
  );
};
