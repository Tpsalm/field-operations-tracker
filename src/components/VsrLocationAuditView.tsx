import React, { useState, useMemo } from 'react';
import {
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Download,
  Filter,
  Search,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Wifi,
  ExternalLink,
  ChevronRight,
  Calendar,
  Eye,
  Send,
  Flag,
  RotateCcw,
  Sparkles,
  Compass,
  Radio,
  SlidersHorizontal,
  X,
  UserCheck
} from 'lucide-react';
import { VSR_LOCATION_AUDIT_DATA, computeVsrAuditKPIs } from '../data/vsrLocationAuditData';
import { VsrLocationAuditRecord } from '../types';

interface VsrLocationAuditViewProps {
  onBackToDashboard?: () => void;
  onOpenShiftAdherence?: () => void;
}

type HubFilter = 'All' | 'Lagos' | 'Ibadan' | 'Ogun' | 'Benin';
type GeofenceFilter = 'all' | 'in_store' | 'near_store' | 'out_of_bounds';
type SignOutFilter = 'all' | 'completed' | 'active_shift' | 'early_signout' | 'overrun';
type AuditStatusFilter = 'all' | 'verified' | 'flagged' | 'pending_review';

export const VsrLocationAuditView: React.FC<VsrLocationAuditViewProps> = ({
  onBackToDashboard,
  onOpenShiftAdherence
}) => {
  const [records, setRecords] = useState<VsrLocationAuditRecord[]>(VSR_LOCATION_AUDIT_DATA);
  const [selectedHub, setSelectedHub] = useState<HubFilter>('All');
  const [geofenceFilter, setGeofenceFilter] = useState<GeofenceFilter>('all');
  const [signOutFilter, setSignOutFilter] = useState<SignOutFilter>('all');
  const [auditFilter, setAuditFilter] = useState<AuditStatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedVsr, setSelectedVsr] = useState<VsrLocationAuditRecord | null>(records[0] || null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<string>('');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Compute live KPIs
  const kpis = useMemo(() => computeVsrAuditKPIs(records), [records]);

  // Filtered Records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Hub
      if (selectedHub !== 'All' && r.hub !== selectedHub) return false;

      // Geofence
      if (geofenceFilter !== 'all' && r.signInGeofenceStatus !== geofenceFilter) return false;

      // Sign-out
      if (signOutFilter === 'completed' && !r.signOutTimeWat) return false;
      if (signOutFilter === 'active_shift' && r.signOutTimeWat !== null) return false;
      if (signOutFilter === 'early_signout' && r.closingComplianceStatus !== 'early_signout') return false;
      if (
        signOutFilter === 'overrun' &&
        r.closingComplianceStatus !== 'minor_overrun' &&
        r.closingComplianceStatus !== 'major_overrun'
      ) {
        return false;
      }

      // Audit status
      if (auditFilter !== 'all' && r.auditStatus !== auditFilter) return false;

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = r.vsrName.toLowerCase().includes(q);
        const matchesCode = r.vsrCode.toLowerCase().includes(q);
        const matchesStore = r.assignedStore.toLowerCase().includes(q);
        const matchesLoc = r.signInLocationName.toLowerCase().includes(q) || r.signInAddress.toLowerCase().includes(q);
        const matchesPhone = r.phone.toLowerCase().includes(q);
        const matchesIp = r.ipAddress.toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesStore && !matchesLoc && !matchesPhone && !matchesIp) {
          return false;
        }
      }

      return true;
    });
  }, [records, selectedHub, geofenceFilter, signOutFilter, auditFilter, searchQuery]);

  // Action handlers
  const handleMarkVerified = (id: string) => {
    setRecords((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              auditStatus: 'verified',
              auditNotes: 'Manual verification approved by active Corporate Operations Auditor.'
            }
          : item
      )
    );
    if (selectedVsr?.id === id) {
      setSelectedVsr((prev) =>
        prev
          ? {
              ...prev,
              auditStatus: 'verified',
              auditNotes: 'Manual verification approved by active Corporate Operations Auditor.'
            }
          : null
      );
    }
    setActionNotice('VSR location audit marked as VERIFIED.');
    setTimeout(() => setActionNotice(''), 3000);
  };

  const handleFlagVSR = (id: string) => {
    setRecords((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              auditStatus: 'flagged',
              auditFlagReason: 'Flagged by Auditor: Suspicious distance offset or unscheduled movement.'
            }
          : item
      )
    );
    if (selectedVsr?.id === id) {
      setSelectedVsr((prev) =>
        prev
          ? {
              ...prev,
              auditStatus: 'flagged',
              auditFlagReason: 'Flagged by Auditor: Suspicious distance offset or unscheduled movement.'
            }
          : null
      );
    }
    setActionNotice('VSR record FLAGGED for investigation.');
    setTimeout(() => setActionNotice(''), 3000);
  };

  const handleSendNotice = (vsr: VsrLocationAuditRecord) => {
    setActionNotice(`Dispatch SMS queued to ${vsr.vsrName} (${vsr.phone}): "Location audit notice for ${vsr.assignedStore}."`);
    setTimeout(() => setActionNotice(''), 3500);
  };

  // CSV Export
  const handleExportCsv = () => {
    setIsExporting(true);
    try {
      const rows: string[] = [];
      rows.push([
        'VSR_Code',
        'VSR_Name',
        'Phone',
        'Regional_Hub',
        'Corridor',
        'Assigned_Store',
        'Sign_In_Time_WAT',
        'Sign_In_Date',
        'Sign_In_Location_Name',
        'Sign_In_Address',
        'Sign_In_Coords',
        'Sign_In_Distance_Meters',
        'Sign_In_Geofence_Status',
        'Sign_In_On_Time_Status',
        'Sign_Out_Time_WAT',
        'Sign_Out_Location',
        'Sign_Out_Distance_Meters',
        'Total_Shift_Hours',
        'Closing_Compliance_2100_WAT',
        'Device_Model',
        'Network_Carrier',
        'IP_Address',
        'Battery_Pct',
        'Verification_Method',
        'Audit_Status',
        'Audit_Flag_Reason'
      ].join(','));

      records.forEach((r) => {
        rows.push([
          r.vsrCode,
          `"${r.vsrName}"`,
          r.phone,
          r.hub,
          `"${r.corridor}"`,
          `"${r.assignedStore}"`,
          r.signInTimeWat,
          `"${r.signInDate}"`,
          `"${r.signInLocationName.replace(/"/g, '""')}"`,
          `"${r.signInAddress.replace(/"/g, '""')}"`,
          `"${r.signInCoords.lat}, ${r.signInCoords.lng}"`,
          r.signInDistanceMeters,
          r.signInGeofenceStatus,
          r.signInOnTimeStatus,
          r.signOutTimeWat ? `"${r.signOutTimeWat}"` : '"ACTIVE_SHIFT"',
          r.signOutLocationName ? `"${r.signOutLocationName.replace(/"/g, '""')}"` : '"N/A"',
          r.signOutDistanceMeters !== undefined ? r.signOutDistanceMeters : 'N/A',
          `"${r.totalHoursFormatted}"`,
          r.closingComplianceStatus,
          `"${r.deviceModel}"`,
          `"${r.networkCarrier}"`,
          r.ipAddress,
          `${r.batteryPct}%`,
          `"${r.verificationMethod}"`,
          r.auditStatus.toUpperCase(),
          `"${(r.auditFlagReason || '').replace(/"/g, '""')}"`
        ].join(','));
      });

      const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `KEA_VSR_Location_Audit_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setTimeout(() => setIsExporting(false), 800);
    }
  };

  return (
    <div className="space-y-6">
      {/* ACTION NOTICE TOAST */}
      {actionNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#152342] text-white px-4 py-3 rounded-xl border border-cyan-500 shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#92C842]" />
          <span className="text-xs font-semibold">{actionNotice}</span>
        </div>
      )}

      {/* TOP HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#0d1527] via-[#0f1b33] to-[#0d1527] border border-[#1e2d4d] rounded-2xl p-6 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold font-mono tracking-wide bg-cyan-950/60 text-cyan-400 border border-cyan-800/60 uppercase">
              <Compass className="w-3.5 h-3.5" /> VSR Location Audit
            </span>
            <span className="text-xs text-slate-500 font-mono">• Geofence &amp; Timestamps</span>
            <span className="inline-flex items-center gap-1 text-[11px] text-[#92C842] font-mono bg-[#92C842]/10 px-2 py-0.5 rounded border border-[#92C842]/30">
              <Clock className="w-3 h-3" /> 21:00 WAT Sign-Out Cutoff
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            VSR Location &amp; Shift Audit
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Audit where VSRs are signing in and signing out from, exact times, specific corridors, GPS coordinates, distance from assigned stores, and compliance with the 21:00 WAT closing cutoff.
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onOpenShiftAdherence}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#142343] hover:bg-[#1c305c] text-emerald-300 border border-emerald-800/50 hover:border-emerald-500/50 transition-all shadow-sm"
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>Shift Adherence (30D)</span>
            <ArrowRight className="w-3 h-3 text-emerald-400" />
          </button>

          <button
            onClick={handleExportCsv}
            disabled={isExporting}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#92C842] hover:bg-[#a0db4b] text-[#090e1c] transition-all shadow-md shadow-[#92C842]/20 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Exporting...' : 'Export Audit CSV'}</span>
          </button>
        </div>
      </div>

      {/* 5 AUDIT SUMMARY KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* KPI 1: Total Audited */}
        <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-xl p-4 flex flex-col justify-between hover:border-cyan-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold uppercase text-[10px] tracking-wider">VSRs Audited</span>
            <UserCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-white font-mono">{kpis.totalAudited}</div>
            <div className="text-[10px] text-slate-400 mt-1">Across 4 regional hubs</div>
          </div>
        </div>

        {/* KPI 2: Verified In-Store Rate */}
        <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-xl p-4 flex flex-col justify-between hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold uppercase text-[10px] tracking-wider">In-Store Geofence</span>
            <Compass className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-400 font-mono">{kpis.inStorePct}%</div>
            <div className="text-[10px] text-slate-400 mt-1">
              <strong className="text-emerald-300 font-mono">{kpis.inStoreCount}</strong> within 25m radius
            </div>
          </div>
        </div>

        {/* KPI 3: Out-of-Bounds Flagged */}
        <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-xl p-4 flex flex-col justify-between hover:border-rose-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold uppercase text-[10px] tracking-wider">Out-Of-Bounds</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-rose-400 font-mono">{kpis.outOfBoundsCount}</div>
            <div className="text-[10px] text-slate-400 mt-1">
              {kpis.outOfBoundsCount > 0 ? 'Requires immediate action' : 'Zero offsite sign-ins'}
            </div>
          </div>
        </div>

        {/* KPI 4: On-Time Check-In */}
        <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-xl p-4 flex flex-col justify-between hover:border-indigo-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold uppercase text-[10px] tracking-wider">On-Time Check-In</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-indigo-300 font-mono">{kpis.onTimeSignInPct}%</div>
            <div className="text-[10px] text-slate-400 mt-1">Met store opening hour</div>
          </div>
        </div>

        {/* KPI 5: 21:00 Closing Compliance */}
        <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-xl p-4 flex flex-col justify-between hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold uppercase text-[10px] tracking-wider">21:00 Sign-Out</span>
            <ShieldCheck className="w-4 h-4 text-[#92C842]" />
          </div>
          <div>
            <div className="text-2xl font-black text-[#92C842] font-mono">{kpis.closingCompliantCount}</div>
            <div className="text-[10px] text-slate-400 mt-1">
              {kpis.activeOnShiftCount} active on shift now
            </div>
          </div>
        </div>

        {/* KPI 6: Average Duration */}
        <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-xl p-4 flex flex-col justify-between hover:border-purple-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold uppercase text-[10px] tracking-wider">Avg Shift Hours</span>
            <Radio className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-purple-300 font-mono">{kpis.avgDurationHours}h</div>
            <div className="text-[10px] text-slate-400 mt-1">Average shift length</div>
          </div>
        </div>
      </div>

      {/* INTERACTIVE STORE CORRIDORS & GEOFENCE VISUALIZER */}
      <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              Active Retail Store Geofence Corridors
            </h2>
            <p className="text-[11px] text-slate-400">
              Store radius verification and compliance matrix. Click any representative to inspect their exact sign-in and sign-out coordinates.
            </p>
          </div>

          <div className="flex items-center gap-3 text-[11px] flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
              <span className="text-slate-300">In-Store (&lt;25m)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
              <span className="text-slate-300">Near Perimeter (25m–100m)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              <span className="text-slate-300">Out of Bounds / Flagged</span>
            </div>
          </div>
        </div>

        {/* Selected VSR Radar / Pin Inspector */}
        {selectedVsr && (
          <div className="bg-[#121c35] border border-[#1e2f55] rounded-xl p-4 mb-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-5 space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-[#92C842]/20 text-[#92C842]">
                  {selectedVsr.vsrCode}
                </span>
                <span className="font-bold text-white text-sm">{selectedVsr.vsrName}</span>
                <span className="text-[10px] text-slate-400 font-mono">{selectedVsr.hub} Hub</span>
              </div>
              <div className="text-xs text-slate-300 font-medium flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Assigned Store: <strong className="text-white">{selectedVsr.assignedStore}</strong></span>
              </div>
              <div className="text-[11px] text-slate-400">
                Corridor: <span className="text-slate-300">{selectedVsr.corridor}</span>
              </div>
            </div>

            <div className="md:col-span-4 space-y-1 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>Sign-In: <strong className="text-white font-mono">{selectedVsr.signInTimeWat}</strong></span>
                <span className="text-[11px] font-mono text-cyan-300 font-bold">
                  {selectedVsr.signInDistanceMeters}m from store
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Sign-Out: <strong className="text-white font-mono">{selectedVsr.signOutTimeWat || 'Active (On Duty)'}</strong></span>
                <span className="text-[11px] font-mono text-emerald-400 font-bold">
                  {selectedVsr.totalHoursFormatted}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                Address: {selectedVsr.signInAddress}
              </div>
            </div>

            <div className="md:col-span-3 flex md:justify-end items-center gap-2">
              <button
                onClick={() => setIsDetailModalOpen(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" /> Full Audit Sheet
              </button>
              {selectedVsr.auditStatus !== 'verified' && (
                <button
                  onClick={() => handleMarkVerified(selectedVsr.id)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                  title="Mark Verified"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Corridor Chips */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {records.map((r) => {
            const isSelected = selectedVsr?.id === r.id;
            const isOutOfBounds = r.signInGeofenceStatus === 'out_of_bounds';
            const isNear = r.signInGeofenceStatus === 'near_store';

            let indicatorBg = 'bg-emerald-500';
            if (isOutOfBounds) indicatorBg = 'bg-rose-500';
            else if (isNear) indicatorBg = 'bg-amber-400';

            return (
              <button
                key={r.id}
                onClick={() => setSelectedVsr(r)}
                className={`p-3 rounded-xl border text-left transition-all relative ${
                  isSelected
                    ? 'bg-[#152342] border-cyan-500 shadow-md shadow-cyan-500/20'
                    : 'bg-[#111a30] border-[#1e2f55] hover:border-slate-400'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${indicatorBg}`} />
                    <span className="font-bold text-white font-mono">{r.vsrCode}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{r.hub}</span>
                </div>

                <div className="text-xs font-semibold text-slate-200 truncate">{r.vsrName}</div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">{r.assignedStore}</div>

                <div className="mt-2 pt-2 border-t border-[#1a294a] flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400">In: <strong className="text-slate-200">{r.signInTimeWat}</strong></span>
                  <span className="text-slate-400">Out: <strong className="text-slate-200">{r.signOutTimeWat ? r.signOutTimeWat.slice(0, 5) : 'Active'}</strong></span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Hub Selector */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Regional Hub:
          </span>
          {(['All', 'Lagos', 'Ibadan', 'Ogun', 'Benin'] as HubFilter[]).map((hub) => {
            const isSelected = selectedHub === hub;
            return (
              <button
                key={hub}
                onClick={() => setSelectedHub(hub)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-[#92C842] text-[#090e1c] shadow-sm'
                    : 'bg-[#141f38] hover:bg-[#1a294a] text-slate-300 border border-[#1e2f55]'
                }`}
              >
                {hub === 'All' ? 'All Hubs' : hub}
              </button>
            );
          })}
        </div>

        {/* Dropdown Filters & Search */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Geofence Status */}
          <select
            value={geofenceFilter}
            onChange={(e) => setGeofenceFilter(e.target.value as GeofenceFilter)}
            className="bg-[#141f38] border border-[#1e2f55] text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:border-[#92C842] focus:outline-none"
          >
            <option value="all">Geofence: All Statuses</option>
            <option value="in_store">In-Store Only (&lt;25m)</option>
            <option value="near_store">Near Perimeter (25m–100m)</option>
            <option value="out_of_bounds">Out-Of-Bounds (&gt;100m)</option>
          </select>

          {/* Sign-Out Filter */}
          <select
            value={signOutFilter}
            onChange={(e) => setSignOutFilter(e.target.value as SignOutFilter)}
            className="bg-[#141f38] border border-[#1e2f55] text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:border-[#92C842] focus:outline-none"
          >
            <option value="all">Sign-Out: All</option>
            <option value="completed">Completed Sign-Out</option>
            <option value="active_shift">Active on Shift Now</option>
            <option value="early_signout">Early Sign-Out (&lt;21:00)</option>
            <option value="overrun">Shift Overrun (&gt;21:00)</option>
          </select>

          {/* Audit Status Filter */}
          <select
            value={auditFilter}
            onChange={(e) => setAuditFilter(e.target.value as AuditStatusFilter)}
            className="bg-[#141f38] border border-[#1e2f55] text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:border-[#92C842] focus:outline-none"
          >
            <option value="all">Audit: All Reviews</option>
            <option value="verified">Verified Only</option>
            <option value="flagged">Flagged for Breach</option>
            <option value="pending_review">Pending Review</option>
          </select>

          {/* Search Field */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search VSR, code, store, IP..."
              className="bg-[#141f38] border border-[#1e2f55] rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-[#92C842] focus:outline-none w-48 sm:w-56"
            />
          </div>
        </div>
      </div>

      {/* COMPREHENSIVE VSR LOCATION AUDIT TABLE */}
      <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#1e2d4d] flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              VSR Check-In &amp; Check-Out Location Audit Register
            </h3>
            <p className="text-[11px] text-slate-400">
              Showing {filteredRecords.length} audited VSR personnel records with exact physical coordinates and 21:00 WAT closing compliance.
            </p>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Standard closing: <strong className="text-amber-400">21:00 WAT</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#090e1c] text-slate-400 uppercase text-[10px] tracking-wider border-b border-[#1e2d4d]">
              <tr>
                <th className="py-3 px-4">VSR Representative</th>
                <th className="py-3 px-4">Assigned Store &amp; Hub</th>
                <th className="py-3 px-4">Sign-In Time &amp; Status</th>
                <th className="py-3 px-4">Sign-In Specific Location</th>
                <th className="py-3 px-4">Sign-Out Time &amp; Location</th>
                <th className="py-3 px-4">Duration &amp; 21:00 WAT Status</th>
                <th className="py-3 px-4">Device &amp; IP Telemetry</th>
                <th className="py-3 px-4">Audit Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#182540]">
              {filteredRecords.map((r) => {
                const isSelected = selectedVsr?.id === r.id;
                const isOutOfBounds = r.signInGeofenceStatus === 'out_of_bounds';
                const isNear = r.signInGeofenceStatus === 'near_store';
                const isFlagged = r.auditStatus === 'flagged';
                const isPending = r.auditStatus === 'pending_review';

                return (
                  <tr
                    key={r.id}
                    className={`hover:bg-[#131d36] transition-colors cursor-pointer ${
                      isSelected ? 'bg-[#121c35]' : ''
                    }`}
                    onClick={() => setSelectedVsr(r)}
                  >
                    {/* VSR Rep Details */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-white text-xs">{r.vsrName}</div>
                      <div className="text-[11px] text-cyan-400 font-semibold">{r.vsrCode}</div>
                      <div className="text-[10px] text-slate-400">{r.phone}</div>
                    </td>

                    {/* Assigned Store */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white text-xs">{r.assignedStore}</div>
                      <div className="text-[10px] text-slate-400">{r.corridor}</div>
                      <span className="inline-block mt-1 px-1.5 py-0.2 rounded text-[10px] font-mono bg-[#142343] text-cyan-300">
                        {r.hub} Hub
                      </span>
                    </td>

                    {/* Sign-In Time */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-white">{r.signInTimeWat}</div>
                      <div className="text-[10px] text-slate-400">{r.signInDate}</div>
                      {r.signInOnTimeStatus === 'on_time' ? (
                        <span className="text-[10px] text-emerald-400 font-bold">On-Time</span>
                      ) : (
                        <span className="text-[10px] text-rose-400 font-bold">Late Arrival</span>
                      )}
                    </td>

                    {/* Sign-In Specific Location */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-slate-200 text-xs truncate">
                        {r.signInLocationName}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{r.signInAddress}</div>
                      <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                        {isOutOfBounds ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">
                            <AlertTriangle className="w-3 h-3" /> Out of Bounds ({r.signInDistanceMeters}m)
                          </span>
                        ) : isNear ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                            Perimeter ({r.signInDistanceMeters}m)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                            <CheckCircle2 className="w-3 h-3" /> In-Store ({r.signInDistanceMeters}m)
                          </span>
                        )}
                        <span className="text-[9px] font-mono text-slate-500">
                          {r.signInCoords.lat.toFixed(4)}°N, {r.signInCoords.lng.toFixed(4)}°E (±{r.signInAccuracyMeters}m)
                        </span>
                      </div>
                    </td>

                    {/* Sign-Out Time & Location */}
                    <td className="py-3.5 px-4 font-mono">
                      {r.signOutTimeWat ? (
                        <div>
                          <div className="font-bold text-white">{r.signOutTimeWat}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[160px]">
                            {r.signOutLocationName}
                          </div>
                          <span className="text-[9px] text-emerald-400">
                            {r.signOutDistanceMeters !== undefined ? `Verified (${r.signOutDistanceMeters}m)` : 'Verified'}
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
                            <Radio className="w-3 h-3 text-cyan-400 animate-pulse" /> Active on Shift
                          </span>
                          <div className="text-[9px] text-slate-500 mt-1">Pending 21:00 WAT Sign-Out</div>
                        </div>
                      )}
                    </td>

                    {/* Duration & 21:00 Closing Status */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-white">{r.totalHoursFormatted}</div>
                      <div className="mt-1">
                        {r.closingComplianceStatus === 'on_time_signout' && (
                          <span className="text-[10px] font-bold text-emerald-400">21:00 Compliant</span>
                        )}
                        {r.closingComplianceStatus === 'minor_overrun' && (
                          <span className="text-[10px] font-bold text-amber-400">+Overrun Shift</span>
                        )}
                        {r.closingComplianceStatus === 'early_signout' && (
                          <span className="text-[10px] font-bold text-rose-400">Early Departure</span>
                        )}
                        {r.closingComplianceStatus === 'active_shift' && (
                          <span className="text-[10px] font-bold text-cyan-400">In Progress</span>
                        )}
                      </div>
                    </td>

                    {/* Device & IP Telemetry */}
                    <td className="py-3.5 px-4 text-[10px] font-mono">
                      <div className="text-slate-300 font-semibold">{r.deviceModel}</div>
                      <div className="text-slate-400">{r.networkCarrier} • IP {r.ipAddress}</div>
                      <div className="text-slate-500 mt-0.5">Batt: {r.batteryPct}% • {r.verificationMethod}</div>
                    </td>

                    {/* Audit Status */}
                    <td className="py-3.5 px-4">
                      {isFlagged ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          <Flag className="w-3 h-3" /> Flagged Breach
                        </span>
                      ) : isPending ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          <AlertTriangle className="w-3 h-3" /> Under Review
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <ShieldCheck className="w-3 h-3" /> Audited &amp; Clean
                        </span>
                      )}
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedVsr(r);
                            setIsDetailModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-[#141f38] hover:bg-[#1f2f55] text-slate-300 hover:text-white transition-colors"
                          title="Open Full Audit Sheet"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSendNotice(r);
                          }}
                          className="p-1.5 rounded-lg bg-[#141f38] hover:bg-[#1f2f55] text-cyan-300 hover:text-cyan-200 transition-colors"
                          title="Send SMS / WhatsApp Notice"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 text-xs">
                    No VSR location audit records matched your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FULL VSR AUDIT DETAIL MODAL */}
      {isDetailModalOpen && selectedVsr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0b1222] border border-[#1e2d4d] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#1e2d4d] flex items-center justify-between sticky top-0 bg-[#0b1222] z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-cyan-950/70 text-cyan-400 border border-cyan-800/40">
                    VSR AUDIT CERTIFICATE
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{selectedVsr.vsrCode}</span>
                </div>
                <h3 className="text-xl font-black text-white tracking-tight">
                  {selectedVsr.vsrName} — Geofence &amp; Shift Telemetry
                </h3>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-2 rounded-xl bg-[#141f38] text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Store & Hub Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#0e1628] border border-[#1e2d4d] rounded-xl p-4 text-xs">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Assigned Retail Store</div>
                  <div className="text-sm font-bold text-white mt-0.5">{selectedVsr.assignedStore}</div>
                  <div className="text-[11px] text-slate-400">{selectedVsr.corridor}</div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Regional Operating Hub</div>
                  <div className="text-sm font-bold text-cyan-300 mt-0.5">{selectedVsr.hub} Hub</div>
                  <div className="text-[11px] text-slate-400">Supervisor: {selectedVsr.supervisorName || 'Regional Lead'}</div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Contact / Phone</div>
                  <div className="text-sm font-bold font-mono text-white mt-0.5">{selectedVsr.phone}</div>
                  <div className="text-[11px] text-emerald-400">Carrier: {selectedVsr.networkCarrier}</div>
                </div>
              </div>

              {/* Side-by-Side: Check-In vs Check-Out Audit */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* SIGN IN AUDIT */}
                <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#1e2d4d] pb-2">
                    <span className="font-bold text-white text-xs flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" /> Sign-In Audit
                    </span>
                    <span className="text-[11px] font-mono font-bold text-emerald-400">
                      {selectedVsr.signInTimeWat}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Specific Location Signed From:</span>
                      <p className="font-semibold text-slate-200 mt-0.5">{selectedVsr.signInLocationName}</p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Physical Address:</span>
                      <p className="text-slate-300 text-[11px] mt-0.5">{selectedVsr.signInAddress}</p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">GPS Coordinates &amp; Accuracy:</span>
                      <p className="text-cyan-300 font-mono text-[11px] mt-0.5">
                        {selectedVsr.signInCoords.lat.toFixed(6)}° N, {selectedVsr.signInCoords.lng.toFixed(6)}° E (±{selectedVsr.signInAccuracyMeters}m)
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Geofence Offset:</span>
                      <span className="font-mono font-bold text-xs text-white">
                        {selectedVsr.signInDistanceMeters} meters from store
                      </span>
                    </div>
                  </div>
                </div>

                {/* SIGN OUT AUDIT */}
                <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#1e2d4d] pb-2">
                    <span className="font-bold text-white text-xs flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" /> Sign-Out Audit
                    </span>
                    <span className="text-[11px] font-mono font-bold text-cyan-400">
                      {selectedVsr.signOutTimeWat || 'Pending (Active Shift)'}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Specific Location Signed Out From:</span>
                      <p className="font-semibold text-slate-200 mt-0.5">
                        {selectedVsr.signOutLocationName || 'Currently on retail store floor'}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Physical Address:</span>
                      <p className="text-slate-300 text-[11px] mt-0.5">
                        {selectedVsr.signOutAddress || 'Same as assigned store post'}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Total Shift Logged:</span>
                      <p className="text-white font-mono font-bold text-sm mt-0.5">
                        {selectedVsr.totalHoursFormatted}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-400">21:00 Closing Status:</span>
                      <span className="font-mono font-bold text-xs text-[#92C842]">
                        {selectedVsr.closingComplianceStatus.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hardware & Network Verification */}
              <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-cyan-400" /> Hardware &amp; Network Telemetry Verification
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 font-bold">Device Hardware</span>
                    <div className="font-mono text-white mt-0.5">{selectedVsr.deviceModel}</div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase text-slate-500 font-bold">Network Carrier</span>
                    <div className="font-mono text-cyan-300 mt-0.5">{selectedVsr.networkCarrier}</div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase text-slate-500 font-bold">Verified IP Subnet</span>
                    <div className="font-mono text-indigo-300 mt-0.5">{selectedVsr.ipAddress}</div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase text-slate-500 font-bold">Verification Engine</span>
                    <div className="font-mono text-[#92C842] mt-0.5">{selectedVsr.verificationMethod}</div>
                  </div>
                </div>
              </div>

              {/* Auditor Notes & Flag Reasons */}
              <div className="bg-[#121c35] border border-[#1e2f55] rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#92C842]" /> Auditor Investigation Notes
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Status: {selectedVsr.auditStatus.toUpperCase()}</span>
                </div>

                {selectedVsr.auditFlagReason && (
                  <div className="p-2.5 bg-rose-950/30 border border-rose-800/40 rounded-lg text-rose-300 text-xs font-medium">
                    ⚠️ {selectedVsr.auditFlagReason}
                  </div>
                )}

                <p className="text-xs text-slate-300">
                  {selectedVsr.auditNotes || 'All geofence coordinates verified against central database.'}
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-[#1e2d4d] bg-[#090e1c] flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleMarkVerified(selectedVsr.id)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approve &amp; Verify
                </button>
                <button
                  onClick={() => handleFlagVSR(selectedVsr.id)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors flex items-center gap-1.5"
                >
                  <Flag className="w-3.5 h-3.5" /> Flag for Investigation
                </button>
              </div>

              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#141f38] hover:bg-[#1e2d4d] text-white transition-colors"
              >
                Close Audit Sheet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
