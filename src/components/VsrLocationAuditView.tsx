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
type KpiModalType = 'audited_staff' | 'inside_store' | 'outside_store' | 'on_time_arrival' | 'on_time_closing' | 'avg_shift_hours' | null;

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
  const [kpiModalType, setKpiModalType] = useState<KpiModalType>(null);
  const [kpiModalSearch, setKpiModalSearch] = useState<string>('');
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
              auditNotes: 'Manual verification approved by active Operations Supervisor.'
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
              auditNotes: 'Manual verification approved by active Operations Supervisor.'
            }
          : null
      );
    }
    setActionNotice('Staff location check-in marked as VERIFIED.');
    setTimeout(() => setActionNotice(''), 3000);
  };

  const handleFlagVSR = (id: string) => {
    setRecords((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              auditStatus: 'flagged',
              auditFlagReason: 'Flagged for review: Location is outside authorized store radius.'
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
              auditFlagReason: 'Flagged for review: Location is outside authorized store radius.'
            }
          : null
      );
    }
    setActionNotice('Record FLAGGED for supervisor review.');
    setTimeout(() => setActionNotice(''), 3000);
  };

  const handleSendNotice = (vsr: VsrLocationAuditRecord) => {
    setActionNotice(`Notice sent to ${vsr.vsrName} (${vsr.phone}): "Please confirm your store location for ${vsr.assignedStore}."`);
    setTimeout(() => setActionNotice(''), 3500);
  };

  // CSV Export
  const handleExportCsv = () => {
    setIsExporting(true);
    try {
      const rows: string[] = [];
      rows.push([
        'Staff_Code',
        'Staff_Name',
        'Phone',
        'Branch_Hub',
        'Corridor',
        'Assigned_Store',
        'Sign_In_Time_WAT',
        'Sign_In_Date',
        'Sign_In_Location_Name',
        'Sign_In_Address',
        'Sign_In_Coords',
        'Distance_Meters',
        'Geofence_Status',
        'On_Time_Status',
        'Sign_Out_Time_WAT',
        'Sign_Out_Location',
        'Sign_Out_Distance_Meters',
        'Total_Hours',
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
      link.setAttribute('download', `KEA_Store_Location_CheckIns_${new Date().toISOString().slice(0, 10)}.csv`);
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
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 border border-slate-700 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold">{actionNotice}</span>
        </div>
      )}

      {/* TOP HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-[12px] border border-slate-200/80 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold font-mono tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
              <Compass className="w-3.5 h-3.5 text-emerald-600" /> Location Check-Ins &amp; GPS
            </span>
            <span className="text-xs text-slate-500 font-mono">• GPS Distance Verification</span>
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              <Clock className="w-3 h-3 text-slate-500" /> 21:00 WAT Closing Standard
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            Store Location Check-Ins
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Verify where and when field staff sign in and sign out, exact GPS distance from assigned retail stores, device network status, and on-time 21:00 WAT closing compliance.
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onOpenShiftAdherence}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all shadow-sm"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-600" />
            <span>30-Day Attendance</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
          </button>

          <button
            onClick={handleExportCsv}
            disabled={isExporting}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#10b981] hover:bg-emerald-600 text-white transition-all shadow-sm disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Exporting...' : 'Download Check-Ins (CSV)'}</span>
          </button>
        </div>
      </div>

      {/* 6 AUDIT SUMMARY KPI CARDS (Click to open live tabular check-in records) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* KPI 1: Total Audited */}
        <div 
          onClick={() => setKpiModalType('audited_staff')}
          className="bg-white rounded-[12px] border border-slate-200/80 p-4 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group"
          title="Click to view full tabular list of all 45 audited staff"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold uppercase text-[10px] tracking-wider">Staff Audited</span>
            <UserCheck className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-mono group-hover:text-emerald-600 transition-colors">{kpis.totalAudited}</div>
            <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
              <span>Across 4 hubs</span>
              <span className="text-emerald-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">List ↗</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Verified In-Store Rate */}
        <div 
          onClick={() => setKpiModalType('inside_store')}
          className="bg-white rounded-[12px] border border-slate-200/80 p-4 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group"
          title="Click to view tabular list of verified in-store check-ins (<25m)"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold uppercase text-[10px] tracking-wider">Inside Store</span>
            <Compass className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-600 font-mono">{kpis.inStorePct}%</div>
            <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
              <span><strong className="text-slate-800 font-mono">{kpis.inStoreCount}</strong> within 25m</span>
              <span className="text-emerald-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">List ↗</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Out-of-Bounds Flagged */}
        <div 
          onClick={() => setKpiModalType('outside_store')}
          className="bg-white rounded-[12px] border border-rose-200 p-4 flex flex-col justify-between shadow-[0_2px_8px_rgba(244,63,94,0.06)] hover:border-rose-400 hover:shadow-md transition-all cursor-pointer group"
          title="Click to view tabular list of out-of-bounds check-ins (>100m)"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold uppercase text-[10px] tracking-wider text-rose-700">Outside Store</span>
            <AlertTriangle className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="text-2xl font-black text-rose-600 font-mono">{kpis.outOfBoundsCount}</div>
            <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
              <span>{kpis.outOfBoundsCount > 0 ? 'Needs review' : 'Zero offsite'}</span>
              <span className="text-rose-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Audit ↗</span>
            </div>
          </div>
        </div>

        {/* KPI 4: On-Time Check-In */}
        <div 
          onClick={() => setKpiModalType('on_time_arrival')}
          className="bg-white rounded-[12px] border border-slate-200/80 p-4 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:border-sky-400 hover:shadow-md transition-all cursor-pointer group"
          title="Click to view tabular list of morning arrival check-ins"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold uppercase text-[10px] tracking-wider">On-Time Arrival</span>
            <Clock className="w-4 h-4 text-sky-500 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-mono group-hover:text-sky-600 transition-colors">{kpis.onTimeSignInPct}%</div>
            <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
              <span>Met opening hour</span>
              <span className="text-sky-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">List ↗</span>
            </div>
          </div>
        </div>

        {/* KPI 5: 21:00 Closing Compliance */}
        <div 
          onClick={() => setKpiModalType('on_time_closing')}
          className="bg-white rounded-[12px] border border-slate-200/80 p-4 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group"
          title="Click to view tabular list of 21:00 closing compliance"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold uppercase text-[10px] tracking-wider">On-Time Closing</span>
            <ShieldCheck className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-mono group-hover:text-amber-600 transition-colors">{kpis.closingCompliantCount}</div>
            <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
              <span>{kpis.activeOnShiftCount} active now</span>
              <span className="text-amber-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">List ↗</span>
            </div>
          </div>
        </div>

        {/* KPI 6: Average Duration */}
        <div 
          onClick={() => setKpiModalType('avg_shift_hours')}
          className="bg-white rounded-[12px] border border-slate-200/80 p-4 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group"
          title="Click to view tabular list of shift duration per staff"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold uppercase text-[10px] tracking-wider">Avg Shift Hours</span>
            <Radio className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-mono group-hover:text-indigo-600 transition-colors">{kpis.avgDurationHours}h</div>
            <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
              <span>Average shift length</span>
              <span className="text-indigo-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">List ↗</span>
            </div>
          </div>
        </div>
      </div>

      {/* INTERACTIVE STORE CORRIDORS & GEOFENCE VISUALIZER */}
      <div className="bg-white rounded-[12px] border border-slate-200/80 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-600" />
              Active Store Staff Check-Ins
            </h2>
            <p className="text-[11px] text-slate-500">
              Click any staff card below to inspect their exact coordinates, GPS accuracy, and phone telemetry.
            </p>
          </div>

          <div className="flex items-center gap-3 text-[11px] flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span className="text-slate-600">Inside Store (&lt;25m)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              <span className="text-slate-600">Nearby (25m–100m)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              <span className="text-slate-600">Far / Outside Store</span>
            </div>
          </div>
        </div>

        {/* Selected VSR Radar / Pin Inspector */}
        {selectedVsr && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-5 space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {selectedVsr.vsrCode}
                </span>
                <span className="font-bold text-slate-900 text-sm">{selectedVsr.vsrName}</span>
                <span className="text-[10px] text-slate-500 font-mono">{selectedVsr.hub} Hub</span>
              </div>
              <div className="text-xs text-slate-700 font-medium flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Assigned Store: <strong className="text-slate-900">{selectedVsr.assignedStore}</strong></span>
              </div>
              <div className="text-[11px] text-slate-500">
                Corridor: <span className="text-slate-700">{selectedVsr.corridor}</span>
              </div>
            </div>

            <div className="md:col-span-4 space-y-1 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Check-In: <strong className="text-slate-900 font-mono">{selectedVsr.signInTimeWat}</strong></span>
                <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">
                  {selectedVsr.signInDistanceMeters}m from store
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Check-Out: <strong className="text-slate-900 font-mono">{selectedVsr.signOutTimeWat || 'Active Shift'}</strong></span>
                <span className="text-[11px] font-mono text-slate-800 font-bold">
                  {selectedVsr.totalHoursFormatted}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                Address: {selectedVsr.signInAddress}
              </div>
            </div>

            <div className="md:col-span-3 flex md:justify-end items-center gap-2">
              <button
                onClick={() => setIsDetailModalOpen(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white transition-colors flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" /> View Details
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
            else if (isNear) indicatorBg = 'bg-amber-500';

            return (
              <button
                key={r.id}
                onClick={() => setSelectedVsr(r)}
                className={`p-3 rounded-xl border text-left transition-all relative ${
                  isSelected
                    ? 'bg-slate-50 border-emerald-500 shadow-sm ring-1 ring-emerald-500'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${indicatorBg}`} />
                    <span className="font-bold text-slate-900 font-mono">{r.vsrCode}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{r.hub}</span>
                </div>

                <div className="text-xs font-semibold text-slate-900 truncate">{r.vsrName}</div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">{r.assignedStore}</div>

                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-500">In: <strong className="text-slate-800">{r.signInTimeWat}</strong></span>
                  <span className="text-slate-500">Out: <strong className="text-slate-800">{r.signOutTimeWat ? r.signOutTimeWat.slice(0, 5) : 'Active'}</strong></span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white rounded-[12px] border border-slate-200/80 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
        {/* Hub Selector */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Branch Hub:
          </span>
          {(['All', 'Lagos', 'Ibadan', 'Ogun', 'Benin'] as HubFilter[]).map((hub) => {
            const isSelected = selectedHub === hub;
            return (
              <button
                key={hub}
                onClick={() => setSelectedHub(hub)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-[#10b981] text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
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
            className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:border-emerald-500 focus:outline-none"
          >
            <option value="all">Location: All Positions</option>
            <option value="in_store">Inside Store (&lt;25m)</option>
            <option value="near_store">Nearby Store (25m–100m)</option>
            <option value="out_of_bounds">Outside Store Area (&gt;100m)</option>
          </select>

          {/* Sign-Out Filter */}
          <select
            value={signOutFilter}
            onChange={(e) => setSignOutFilter(e.target.value as SignOutFilter)}
            className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:border-emerald-500 focus:outline-none"
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
            className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:border-emerald-500 focus:outline-none"
          >
            <option value="all">Verification: All</option>
            <option value="verified">Verified Only</option>
            <option value="flagged">Flagged for Review</option>
            <option value="pending_review">Pending Review</option>
          </select>

          {/* Search Field */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search staff, code, store..."
              className="bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none w-48 sm:w-56"
            />
          </div>
        </div>
      </div>

      {/* COMPREHENSIVE VSR LOCATION AUDIT TABLE */}
      <div className="bg-white rounded-[12px] border border-slate-200/80 overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-600" />
              Staff Location Check-In Register
            </h3>
            <p className="text-[11px] text-slate-500">
              Showing {filteredRecords.length} recorded staff logs with verified GPS distance from store premises.
            </p>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Mandatory closing cutoff: <strong className="text-rose-600">21:00 WAT</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Field Staff</th>
                <th className="py-3 px-4">Store &amp; Hub</th>
                <th className="py-3 px-4">Check-In Time</th>
                <th className="py-3 px-4">Location &amp; Distance</th>
                <th className="py-3 px-4">Check-Out Time</th>
                <th className="py-3 px-4">Shift Hours &amp; 21:00 WAT</th>
                <th className="py-3 px-4">Device &amp; IP</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((r) => {
                const isSelected = selectedVsr?.id === r.id;
                const isOutOfBounds = r.signInGeofenceStatus === 'out_of_bounds';
                const isNear = r.signInGeofenceStatus === 'near_store';
                const isFlagged = r.auditStatus === 'flagged';
                const isPending = r.auditStatus === 'pending_review';

                return (
                  <tr
                    key={r.id}
                    className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                      isSelected ? 'bg-slate-50' : ''
                    }`}
                    onClick={() => setSelectedVsr(r)}
                  >
                    {/* VSR Rep Details */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-slate-900 text-xs">{r.vsrName}</div>
                      <div className="text-[11px] text-emerald-700 font-semibold">{r.vsrCode}</div>
                      <div className="text-[10px] text-slate-400">{r.phone}</div>
                    </td>

                    {/* Assigned Store */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 text-xs">{r.assignedStore}</div>
                      <div className="text-[10px] text-slate-500">{r.corridor}</div>
                      <span className="inline-block mt-1 px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-100 text-slate-700">
                        {r.hub} Hub
                      </span>
                    </td>

                    {/* Sign-In Time */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-slate-900">{r.signInTimeWat}</div>
                      <div className="text-[10px] text-slate-400">{r.signInDate}</div>
                      {r.signInOnTimeStatus === 'on_time' ? (
                        <span className="text-[10px] text-emerald-600 font-bold">On-Time</span>
                      ) : (
                        <span className="text-[10px] text-rose-600 font-bold">Late Arrival</span>
                      )}
                    </td>

                    {/* Sign-In Specific Location */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-slate-800 text-xs truncate">
                        {r.signInLocationName}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">{r.signInAddress}</div>
                      <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                        {isOutOfBounds ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertTriangle className="w-3 h-3 text-rose-600" /> Outside Area ({r.signInDistanceMeters}m)
                          </span>
                        ) : isNear ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Near Store ({r.signInDistanceMeters}m)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Inside Store ({r.signInDistanceMeters}m)
                          </span>
                        )}
                        <span className="text-[9px] font-mono text-slate-400">
                          {r.signInCoords.lat.toFixed(4)}°N, {r.signInCoords.lng.toFixed(4)}°E
                        </span>
                      </div>
                    </td>

                    {/* Sign-Out Time & Location */}
                    <td className="py-3.5 px-4 font-mono">
                      {r.signOutTimeWat ? (
                        <div>
                          <div className="font-bold text-slate-900">{r.signOutTimeWat}</div>
                          <div className="text-[10px] text-slate-500 truncate max-w-[160px]">
                            {r.signOutLocationName}
                          </div>
                          <span className="text-[9px] text-emerald-600">
                            {r.signOutDistanceMeters !== undefined ? `Verified (${r.signOutDistanceMeters}m)` : 'Verified'}
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Radio className="w-3 h-3 text-emerald-600 animate-pulse" /> On Duty Now
                          </span>
                          <div className="text-[9px] text-slate-400 mt-1">Pending 21:00 Sign-Out</div>
                        </div>
                      )}
                    </td>

                    {/* Duration & 21:00 Closing Status */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-slate-900">{r.totalHoursFormatted}</div>
                      <div className="mt-1">
                        {r.closingComplianceStatus === 'on_time_signout' && (
                          <span className="text-[10px] font-bold text-emerald-600">21:00 Compliant</span>
                        )}
                        {r.closingComplianceStatus === 'minor_overrun' && (
                          <span className="text-[10px] font-bold text-amber-600">Late Overrun</span>
                        )}
                        {r.closingComplianceStatus === 'early_signout' && (
                          <span className="text-[10px] font-bold text-rose-600">Early Signoff</span>
                        )}
                        {r.closingComplianceStatus === 'active_shift' && (
                          <span className="text-[10px] font-bold text-sky-600">In Progress</span>
                        )}
                      </div>
                    </td>

                    {/* Device & IP Telemetry */}
                    <td className="py-3.5 px-4 text-[10px] font-mono">
                      <div className="text-slate-800 font-semibold">{r.deviceModel}</div>
                      <div className="text-slate-500">{r.networkCarrier} • IP {r.ipAddress}</div>
                      <div className="text-slate-400 mt-0.5">Battery: {r.batteryPct}% • {r.verificationMethod}</div>
                    </td>

                    {/* Audit Status */}
                    <td className="py-3.5 px-4">
                      {isFlagged ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <Flag className="w-3 h-3 text-rose-600" /> Flagged
                        </span>
                      ) : isPending ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <AlertTriangle className="w-3 h-3 text-amber-600" /> In Review
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified
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
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSendNotice(r);
                          }}
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                          title="Send Message Notice"
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
                  <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                    No location check-in records matched your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FULL VSR AUDIT DETAIL MODAL */}
      {isDetailModalOpen && selectedVsr && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-[16px] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                    CHECK-IN DETAILS
                  </span>
                  <span className="text-xs text-slate-500 font-mono">{selectedVsr.vsrCode}</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  {selectedVsr.vsrName} — Store Location &amp; Shift
                </h3>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Store & Hub Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">Assigned Retail Store</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">{selectedVsr.assignedStore}</div>
                  <div className="text-[11px] text-slate-500">{selectedVsr.corridor}</div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">Branch Operating Hub</div>
                  <div className="text-sm font-bold text-emerald-700 mt-0.5">{selectedVsr.hub} Hub</div>
                  <div className="text-[11px] text-slate-500">Supervisor: {selectedVsr.supervisorName || 'Branch Manager'}</div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">Phone Contact</div>
                  <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">{selectedVsr.phone}</div>
                  <div className="text-[11px] text-slate-500">Carrier: {selectedVsr.networkCarrier}</div>
                </div>
              </div>

              {/* Side-by-Side: Check-In vs Check-Out Audit */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* SIGN IN AUDIT */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" /> Sign-In Audit
                    </span>
                    <span className="text-[11px] font-mono font-bold text-emerald-700">
                      {selectedVsr.signInTimeWat}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500">Location Name:</span>
                      <p className="font-semibold text-slate-900 mt-0.5">{selectedVsr.signInLocationName}</p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500">Physical Address:</span>
                      <p className="text-slate-600 text-[11px] mt-0.5">{selectedVsr.signInAddress}</p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500">GPS Coordinates:</span>
                      <p className="text-slate-700 font-mono text-[11px] mt-0.5">
                        {selectedVsr.signInCoords.lat.toFixed(6)}° N, {selectedVsr.signInCoords.lng.toFixed(6)}° E (±{selectedVsr.signInAccuracyMeters}m)
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-500">Distance from Store:</span>
                      <span className="font-mono font-bold text-xs text-slate-900">
                        {selectedVsr.signInDistanceMeters} meters
                      </span>
                    </div>
                  </div>
                </div>

                {/* SIGN OUT AUDIT */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-sky-600" /> Sign-Out Audit
                    </span>
                    <span className="text-[11px] font-mono font-bold text-sky-700">
                      {selectedVsr.signOutTimeWat || 'Pending (Active Shift)'}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500">Location Name:</span>
                      <p className="font-semibold text-slate-900 mt-0.5">
                        {selectedVsr.signOutLocationName || 'Currently on retail store floor'}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500">Physical Address:</span>
                      <p className="text-slate-600 text-[11px] mt-0.5">
                        {selectedVsr.signOutAddress || 'Same as assigned store location'}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500">Total Shift Logged:</span>
                      <p className="text-slate-900 font-mono font-bold text-sm mt-0.5">
                        {selectedVsr.totalHoursFormatted}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-500">21:00 Closing Status:</span>
                      <span className="font-mono font-bold text-xs text-emerald-700">
                        {selectedVsr.closingComplianceStatus.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hardware & Network Verification */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-600" /> Phone Hardware &amp; Network Info
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 font-bold">Device Model</span>
                    <div className="font-mono text-slate-900 mt-0.5">{selectedVsr.deviceModel}</div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase text-slate-500 font-bold">Network Carrier</span>
                    <div className="font-mono text-slate-900 mt-0.5">{selectedVsr.networkCarrier}</div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase text-slate-500 font-bold">Verified IP</span>
                    <div className="font-mono text-slate-900 mt-0.5">{selectedVsr.ipAddress}</div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase text-slate-500 font-bold">Verification Method</span>
                    <div className="font-mono text-emerald-700 font-bold mt-0.5">{selectedVsr.verificationMethod}</div>
                  </div>
                </div>
              </div>

              {/* Auditor Notes & Flag Reasons */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Supervisor Verification Notes
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Status: {selectedVsr.auditStatus.toUpperCase()}</span>
                </div>

                {selectedVsr.auditFlagReason && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-medium">
                    ⚠️ {selectedVsr.auditFlagReason}
                  </div>
                )}

                <p className="text-xs text-slate-600">
                  {selectedVsr.auditNotes || 'All geofence coordinates verified against central database.'}
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between flex-wrap gap-2">
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
                  <Flag className="w-3.5 h-3.5" /> Flag for Review
                </button>
              </div>

              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPI METRICS DRILL-DOWN TABULAR MODAL */}
      {kpiModalType && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-[16px] w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                    LIVE LOCATION AUDIT
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    GPS Geofence Verification • {selectedHub === 'All' ? 'All 4 Regional Hubs' : `${selectedHub} Hub`}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
                  {kpiModalType === 'audited_staff' && <span>👥 All Audited Staff Records ({kpis.totalAudited} Staff)</span>}
                  {kpiModalType === 'inside_store' && <span>📍 Verified In-Store Check-Ins &lt;25m ({kpis.inStoreCount} Staff)</span>}
                  {kpiModalType === 'outside_store' && <span>🚩 Out-of-Bounds Offsite Check-Ins ({kpis.outOfBoundsCount} Staff)</span>}
                  {kpiModalType === 'on_time_arrival' && <span>⏱️ Morning Arrival &amp; Opening Check-Ins ({kpis.onTimeSignInPct}%)</span>}
                  {kpiModalType === 'on_time_closing' && <span>🕒 21:00 WAT Closing Compliance ({kpis.closingCompliantCount} Compliant)</span>}
                  {kpiModalType === 'avg_shift_hours' && <span>📊 Shift Duration Audit ({kpis.avgDurationHours}h Average)</span>}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCsv}
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={() => {
                    setKpiModalType(null);
                    setKpiModalSearch('');
                  }}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filter / Search Bar */}
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter by staff name, code, store, or location..."
                  value={kpiModalSearch}
                  onChange={(e) => setKpiModalSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="text-slate-500 text-[11px] font-mono">
                Click any staff record to inspect full GPS telemetry &amp; battery
              </div>
            </div>

            {/* Table Area */}
            <div className="overflow-y-auto max-h-[550px] flex-1">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 font-mono text-[10px] uppercase tracking-wider sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Staff Code / Name</th>
                    <th className="py-3 px-4">Branch Hub</th>
                    <th className="py-3 px-4">Assigned Store</th>
                    <th className="py-3 px-4">Sign-In Time (WAT)</th>
                    <th className="py-3 px-4">GPS Distance</th>
                    <th className="py-3 px-4">Geofence Status</th>
                    <th className="py-3 px-4">21:00 Closing</th>
                    <th className="py-3 px-4">Device &amp; Battery</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {records
                    .filter((r) => {
                      if (selectedHub !== 'All' && r.hub !== selectedHub) return false;
                      if (kpiModalType === 'inside_store' && r.signInGeofenceStatus !== 'in_store') return false;
                      if (kpiModalType === 'outside_store' && r.signInGeofenceStatus !== 'out_of_bounds') return false;
                      if (kpiModalType === 'on_time_arrival' && r.signInOnTimeStatus !== 'on_time') return false;
                      if (kpiModalType === 'on_time_closing' && r.closingComplianceStatus !== 'compliant') return false;
                      if (kpiModalSearch.trim()) {
                        const q = kpiModalSearch.toLowerCase();
                        const matchName = r.vsrName.toLowerCase().includes(q);
                        const matchCode = r.vsrCode.toLowerCase().includes(q);
                        const matchStore = r.assignedStore.toLowerCase().includes(q);
                        const matchLoc = r.signInLocationName.toLowerCase().includes(q);
                        return matchName || matchCode || matchStore || matchLoc;
                      }
                      return true;
                    })
                    .map((r) => {
                      const isInside = r.signInGeofenceStatus === 'in_store';
                      const isOut = r.signInGeofenceStatus === 'out_of_bounds';

                      return (
                        <tr
                          key={r.id}
                          onClick={() => {
                            setSelectedVsr(r);
                            setIsDetailModalOpen(true);
                          }}
                          className="hover:bg-emerald-50/50 cursor-pointer transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 font-sans">{r.vsrName}</div>
                            <div className="text-[10px] text-emerald-700">{r.vsrCode} • {r.phone}</div>
                          </td>
                          <td className="py-3 px-4 font-sans font-semibold text-slate-700">{r.hub}</td>
                          <td className="py-3 px-4 font-sans max-w-xs truncate text-slate-800">{r.assignedStore}</td>
                          <td className="py-3 px-4 font-bold text-slate-900">{r.signInTimeWat}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              isInside ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : isOut ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {r.signInDistanceMeters}m
                            </span>
                          </td>
                          <td className="py-3 px-4 font-sans">
                            {isInside ? (
                              <span className="text-emerald-700 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                ✓ Inside Store
                              </span>
                            ) : isOut ? (
                              <span className="text-rose-700 font-bold text-[10px] bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                🚩 Outside Radius
                              </span>
                            ) : (
                              <span className="text-amber-700 font-bold text-[10px] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                ⚠️ Nearby Corridor
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-sans text-slate-700 text-[11px]">
                            {r.signOutTimeWat ? `${r.signOutTimeWat} (${r.totalHoursFormatted})` : 'Active Shift'}
                          </td>
                          <td className="py-3 px-4 text-slate-600 text-[11px]">
                            <div>{r.deviceModel}</div>
                            <div className="text-[10px] text-slate-400">Bat: {r.batteryPct}% • {r.networkCarrier}</div>
                          </td>
                          <td className="py-3 px-4 text-right font-sans">
                            <button className="px-2.5 py-1 rounded bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 text-[11px] font-bold transition-colors">
                              Audit ↗
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Super Admin Location &amp; Geofence Verification Control
              </span>
              <button
                onClick={() => {
                  setKpiModalType(null);
                  setKpiModalSearch('');
                }}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition-colors"
              >
                Close Audit List
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
