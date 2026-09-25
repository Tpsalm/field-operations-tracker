import React, { useState, useMemo } from 'react';
import { WorkerGpsSignIn } from '../types';
import { INITIAL_GPS_SIGN_INS, PRESET_TEST_STORES } from '../data/gpsSignInData';
import {
  MapPin,
  Download,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Smartphone,
  Wifi,
  ShieldCheck,
  Search,
  X
} from 'lucide-react';

interface GpsTrackerViewProps {
  onBackToDashboard?: () => void;
}

export const GpsTrackerView: React.FC<GpsTrackerViewProps> = ({ onBackToDashboard }) => {
  const [signIns, setSignIns] = useState<WorkerGpsSignIn[]>(INITIAL_GPS_SIGN_INS);
  const [selectedHub, setSelectedHub] = useState<string>('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'in_store' | 'out_of_bounds' | 'pending_review'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSignIn, setSelectedSignIn] = useState<WorkerGpsSignIn | null>(INITIAL_GPS_SIGN_INS[0]);
  const [showSimulatorModal, setShowSimulatorModal] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string>('');
  const [isExportingCsv, setIsExportingCsv] = useState<boolean>(false);

  // Check-in simulator state
  const [simWorkerName, setSimWorkerName] = useState<string>('Blessing Emmanuel');
  const [simWorkerCode, setSimWorkerCode] = useState<string>('VSR-LOS-099');
  const [simStoreIndex, setSimStoreIndex] = useState<number>(0);
  const [simDistanceType, setSimDistanceType] = useState<'inside' | 'outside'>('inside');
  const [simDevice, setSimDevice] = useState<string>('Tecno Spark 10');
  const [isGettingRealGps, setIsGettingRealGps] = useState<boolean>(false);

  // Filtered sign-in records
  const filteredSignIns = useMemo(() => {
    return signIns.filter((record) => {
      const matchHub = selectedHub === 'All' || record.assignedHub === selectedHub;
      const matchStatus =
        selectedStatusFilter === 'all'
          ? true
          : selectedStatusFilter === 'in_store'
          ? record.geofenceStatus === 'in_store'
          : selectedStatusFilter === 'out_of_bounds'
          ? record.geofenceStatus === 'out_of_bounds'
          : record.status === 'pending_review';

      const matchSearch =
        searchQuery === '' ||
        record.workerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.workerCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.assignedStore.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.locationAddress.toLowerCase().includes(searchQuery.toLowerCase());

      return matchHub && matchStatus && matchSearch;
    });
  }, [signIns, selectedHub, selectedStatusFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = signIns.length;
    const insideStore = signIns.filter((s) => s.geofenceStatus === 'in_store').length;
    const outsideStore = signIns.filter((s) => s.geofenceStatus === 'out_of_bounds').length;
    const pendingReview = signIns.filter((s) => s.status === 'pending_review' || s.status === 'flagged').length;

    return { total, insideStore, outsideStore, pendingReview };
  }, [signIns]);

  // Action handlers
  const handleApprove = (id: string) => {
    setSignIns((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'approved' } : item))
    );
    if (selectedSignIn && selectedSignIn.id === id) {
      setSelectedSignIn((prev) => (prev ? { ...prev, status: 'approved' } : null));
    }
    setActionSuccessMsg('Sign-in approved for today!');
    setTimeout(() => setActionSuccessMsg(''), 3000);
  };

  const handleFlag = (id: string) => {
    setSignIns((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'flagged' } : item))
    );
    if (selectedSignIn && selectedSignIn.id === id) {
      setSelectedSignIn((prev) => (prev ? { ...prev, status: 'flagged' } : null));
    }
    setActionSuccessMsg('Staff flagged. Warning notice queued.');
    setTimeout(() => setActionSuccessMsg(''), 3000);
  };

  const handleSendWarning = (phone: string, name: string) => {
    setActionSuccessMsg(`Warning text sent to ${name} (${phone}): "You signed in outside your designated store."`);
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  // Export full sign-in CSV log
  const handleExportCsv = () => {
    setIsExportingCsv(true);
    try {
      const now = new Date();
      const rows: string[] = [];

      // CSV Header
      rows.push([
        'Staff_ID',
        'Staff_Name',
        'Phone_Number',
        'Branch_Hub',
        'Assigned_Store',
        'Sign_In_Time_WAT',
        'Sign_In_Date',
        'Latitude',
        'Longitude',
        'Physical_Address',
        'Distance_Meters_From_Store',
        'Boundary_Status',
        'Device_Phone_Model',
        'Battery_Pct',
        'Network_Carrier',
        'Verification_Engine',
        'Approval_Status'
      ].join(','));

      signIns.forEach((item) => {
        rows.push([
          `"${item.workerCode}"`,
          `"${item.workerName}"`,
          `"${item.workerPhone}"`,
          `"${item.assignedHub}"`,
          `"${item.assignedStore}"`,
          `"${item.signInTimeWat}"`,
          `"${item.signInDate}"`,
          item.latitude,
          item.longitude,
          `"${item.locationAddress.replace(/"/g, '""')}"`,
          item.distanceMeters,
          `"${item.geofenceStatus.toUpperCase()}"`,
          `"${item.deviceModel}"`,
          item.batteryPct,
          `"${item.networkCarrier}"`,
          `"${item.verificationMethod}"`,
          `"${item.status.toUpperCase()}"`
        ].join(','));
      });

      const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(rows.join('\n'));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', csvContent);
      downloadAnchor.setAttribute('download', `KEA_GPS_SignIn_Audit_${now.toISOString().substring(0, 10)}.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);
    } catch (e) {
      console.error('Failed to export CSV', e);
    } finally {
      setTimeout(() => setIsExportingCsv(false), 1000);
    }
  };

  // Check-in simulator submit
  const handleSimulateSubmit = () => {
    const store = PRESET_TEST_STORES[simStoreIndex];
    const isInside = simDistanceType === 'inside';

    const latOffset = isInside ? (Math.random() - 0.5) * 0.0002 : (Math.random() > 0.5 ? 0.015 : -0.015);
    const lngOffset = isInside ? (Math.random() - 0.5) * 0.0002 : (Math.random() > 0.5 ? 0.015 : -0.015);
    const calculatedDistance = isInside ? Math.floor(8 + Math.random() * 15) : Math.floor(1200 + Math.random() * 800);

    const newSignIn: WorkerGpsSignIn = {
      id: `gps-sim-${Date.now()}`,
      workerName: simWorkerName || 'Staff Member',
      workerCode: simWorkerCode || 'VSR-LOS-100',
      workerPhone: '+234 802 999 1122',
      assignedStore: store.name,
      assignedHub: store.hub,
      signInTimeWat: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' WAT',
      signInDate: 'Today',
      latitude: parseFloat((store.lat + latOffset).toFixed(5)),
      longitude: parseFloat((store.lng + lngOffset).toFixed(5)),
      locationAddress: isInside ? `${store.name}, ${store.hub}` : `Unknown location ${calculatedDistance}m from store`,
      geofenceStatus: isInside ? 'in_store' : 'out_of_bounds',
      distanceMeters: calculatedDistance,
      batteryPct: Math.floor(65 + Math.random() * 32),
      deviceModel: simDevice || 'Tecno Spark 10',
      networkCarrier: 'MTN Nigeria 4G',
      verificationMethod: 'GPS Geofence',
      status: isInside ? 'approved' : 'pending_review',
      signInAccuracyMeters: isInside ? 12 : 45
    };

    setSignIns((prev) => [newSignIn, ...prev]);
    setSelectedSignIn(newSignIn);
    setShowSimulatorModal(false);
    setActionSuccessMsg(`Captured sign-in for ${newSignIn.workerName} (${isInside ? 'Inside store' : 'Outside store'})!`);
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  // Use real GPS
  const handleUseRealGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsGettingRealGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsGettingRealGps(false);
        const store = PRESET_TEST_STORES[simStoreIndex];
        const newSignIn: WorkerGpsSignIn = {
          id: `gps-real-${Date.now()}`,
          workerName: 'You (Real GPS Test)',
          workerCode: 'VSR-ADMIN-00',
          workerPhone: '+234 800 000 0000',
          assignedStore: store.name,
          assignedHub: store.hub,
          signInTimeWat: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' WAT',
          signInDate: 'Today',
          latitude: parseFloat(pos.coords.latitude.toFixed(5)),
          longitude: parseFloat(pos.coords.longitude.toFixed(5)),
          locationAddress: `Real GPS Location (Accuracy ±${Math.round(pos.coords.accuracy)}m)`,
          geofenceStatus: 'in_store',
          distanceMeters: Math.round(pos.coords.accuracy),
          batteryPct: 98,
          deviceModel: navigator.userAgent.includes('Mobile') ? 'Mobile Phone' : 'Admin Computer',
          networkCarrier: 'Active Connection',
          verificationMethod: 'GPS Geofence',
          status: 'approved',
          signInAccuracyMeters: Math.round(pos.coords.accuracy)
        };
        setSignIns((prev) => [newSignIn, ...prev]);
        setSelectedSignIn(newSignIn);
        setShowSimulatorModal(false);
        setActionSuccessMsg(`Live check-in captured using your actual GPS coordinates!`);
        setTimeout(() => setActionSuccessMsg(''), 4000);
      },
      (err) => {
        setIsGettingRealGps(false);
        alert('Could not get GPS position: ' + err.message);
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className="space-y-6">
      {/* SUCCESS ACTION BANNER */}
      {actionSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between shadow-xs text-xs font-semibold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg('')} className="text-slate-400 hover:text-slate-700">✕</button>
        </div>
      )}

      {/* TOP HEADER & ACTION BUTTONS */}
      <div className="bg-white rounded-[12px] border border-slate-200/80 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
              <MapPin className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Live GPS Map Tracker
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              LIVE TELEMETRY
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Verify where staff sign in from every morning. Inspect store boundary distance, device battery level, network carrier, and exact physical coordinates.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-all"
            >
              ← Back to Main Dashboard
            </button>
          )}

          <button
            onClick={handleExportCsv}
            disabled={isExportingCsv}
            className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-2 transition-all shadow-xs disabled:opacity-50"
            title="Download CSV file of all worker sign-in coordinates and times"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>{isExportingCsv ? 'Creating CSV...' : 'Download GPS Log (CSV)'}</span>
          </button>

          <button
            onClick={() => setShowSimulatorModal(true)}
            className="px-4 py-2 rounded-xl bg-[#10b981] hover:bg-emerald-600 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Simulate Staff Check-In</span>
          </button>
        </div>
      </div>

      {/* 4 SUMMARY STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Signed In */}
        <div
          onClick={() => setSelectedStatusFilter('all')}
          className={`bg-white rounded-[12px] border p-4 transition-all cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.03)] ${
            selectedStatusFilter === 'all' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>TOTAL SIGNED IN TODAY</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 font-mono">{stats.total}</span>
            <span className="text-xs text-slate-500">Staff</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">All registered morning check-ins</p>
        </div>

        {/* Inside Store (Safe) */}
        <div
          onClick={() => setSelectedStatusFilter('in_store')}
          className={`bg-white rounded-[12px] border p-4 transition-all cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.03)] ${
            selectedStatusFilter === 'in_store' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>INSIDE STORE (VERIFIED)</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600 font-mono">{stats.insideStore}</span>
            <span className="text-xs text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
              {stats.total > 0 ? Math.round((stats.insideStore / stats.total) * 100) : 0}%
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">Within 50 meters of store premises</p>
        </div>

        {/* Outside Store (Alert) */}
        <div
          onClick={() => setSelectedStatusFilter('out_of_bounds')}
          className={`bg-white rounded-[12px] border p-4 transition-all cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.03)] ${
            selectedStatusFilter === 'out_of_bounds' ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>OUTSIDE STORE (ALERT)</span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-600 font-mono">{stats.outsideStore}</span>
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
              Needs Check
            </span>
          </div>
          <p className="mt-2 text-[11px] text-rose-600 font-medium">Signed in far from assigned store</p>
        </div>

        {/* Pending Review */}
        <div
          onClick={() => setSelectedStatusFilter('pending_review')}
          className={`bg-white rounded-[12px] border p-4 transition-all cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.03)] ${
            selectedStatusFilter === 'pending_review' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>WAITING FOR REVIEW</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600 font-mono">{stats.pendingReview}</span>
            <span className="text-xs text-slate-500">Staff</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">Near store perimeter or manual check-in</p>
        </div>
      </div>

      {/* FILTER & SEARCH CONTROLS */}
      <div className="bg-white rounded-[12px] border border-slate-200/80 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
        {/* Hub Location Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-500 font-semibold text-[11px] mr-1">BRANCH:</span>
          {['All', 'Lagos', 'Ibadan', 'Ogun', 'Benin'].map((hubName) => (
            <button
              key={hubName}
              onClick={() => setSelectedHub(hubName)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedHub === hubName
                  ? 'bg-[#10b981] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {hubName === 'All' ? 'All 4 Locations' : `${hubName} Branch`}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative min-w-[260px] flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search staff name, store, or phone..."
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 pl-8 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-700">✕</button>
          )}
        </div>
      </div>

      {/* MAIN TWO-COLUMN VIEW: DATA LEDGER TABLE + INSPECTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* WORKER GPS SIGN-IN LEDGER TABLE (8 COLS) */}
        <div className="lg:col-span-8 bg-white rounded-[12px] border border-slate-200/80 overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 uppercase tracking-wider">
                Morning Staff Sign-In Log
              </span>
              <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                LIVE
              </span>
            </div>
            <span className="text-slate-500 font-mono text-xs">
              Showing {filteredSignIns.length} of {signIns.length} records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 font-mono text-[10px] uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Staff Member</th>
                  <th className="px-4 py-3">Branch</th>
                  <th className="px-4 py-3">Assigned Store</th>
                  <th className="px-4 py-3">Time (WAT)</th>
                  <th className="px-4 py-3">Distance to Store</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSignIns.map((row) => {
                  const isSelected = selectedSignIn?.id === row.id;
                  const isSafe = row.geofenceStatus === 'in_store';
                  const isWarning = row.geofenceStatus === 'near_store';

                  return (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedSignIn(row)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-slate-50 ring-1 ring-inset ring-emerald-500' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${isSafe ? 'bg-emerald-500' : isWarning ? 'bg-amber-500' : 'bg-rose-500'}`} />
                          <span>{row.workerName}</span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">{row.workerCode}</div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700 font-medium">{row.assignedHub}</td>
                      <td className="px-4 py-3.5 text-slate-800">
                        <div className="truncate max-w-[160px]">{row.assignedStore}</div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-emerald-700 font-semibold">{row.signInTimeWat}</td>
                      <td className="px-4 py-3.5 font-mono">
                        <span className={`font-bold ${isSafe ? 'text-emerald-600' : isWarning ? 'text-amber-600' : 'text-rose-600'}`}>
                          {row.distanceMeters < 1000 ? `${row.distanceMeters}m` : `${(row.distanceMeters / 1000).toFixed(1)}km`}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide border uppercase ${
                            isSafe
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : isWarning
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {isSafe ? 'INSIDE STORE' : isWarning ? 'NEARBY' : 'OUTSIDE STORE'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApprove(row.id);
                          }}
                          className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] border border-emerald-200 font-bold transition-colors"
                        >
                          Approve
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* WORKER SIGN-IN INSPECTOR CARD (4 COLS) */}
        <div className="lg:col-span-4 bg-white rounded-[12px] border border-slate-200/80 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-4">
          <div className="border-b border-slate-200 pb-3 flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] font-mono text-emerald-700 uppercase tracking-wider font-bold">
                STAFF CHECK-IN DETAILS
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                {selectedSignIn ? selectedSignIn.workerName : 'Select a staff member'}
              </h3>
              <p className="text-xs text-slate-500">
                {selectedSignIn ? `${selectedSignIn.workerCode} • ${selectedSignIn.assignedHub} Branch` : 'Click a record in the table to view'}
              </p>
            </div>

            {selectedSignIn && (
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                  selectedSignIn.geofenceStatus === 'in_store'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : selectedSignIn.geofenceStatus === 'near_store'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {selectedSignIn.geofenceStatus === 'in_store'
                  ? 'INSIDE STORE'
                  : selectedSignIn.geofenceStatus === 'near_store'
                  ? 'NEAR STORE'
                  : 'OUTSIDE STORE'}
              </span>
            )}
          </div>

          {selectedSignIn ? (
            <div className="space-y-4 text-xs">
              {/* Distance from Store Alert Banner */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between font-mono ${
                  selectedSignIn.geofenceStatus === 'in_store'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : selectedSignIn.geofenceStatus === 'near_store'
                    ? 'bg-amber-50 border-amber-200 text-amber-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                <span>Distance to Store:</span>
                <strong className="text-sm font-bold">
                  {selectedSignIn.distanceMeters < 1000
                    ? `${selectedSignIn.distanceMeters} meters away`
                    : `${(selectedSignIn.distanceMeters / 1000).toFixed(2)} km away`}
                </strong>
              </div>

              {/* Data Rows */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Assigned Store:</span>
                  <span className="text-slate-900 font-semibold text-right">{selectedSignIn.assignedStore}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Sign-In Time:</span>
                  <span className="text-emerald-700 font-bold">{selectedSignIn.signInTimeWat}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Coordinates:</span>
                  <span className="text-slate-800">{selectedSignIn.latitude.toFixed(4)}, {selectedSignIn.longitude.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Address:</span>
                  <span className="text-slate-700 text-right text-[11px] max-w-[190px] truncate">{selectedSignIn.locationAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone Model:</span>
                  <span className="text-slate-800">{selectedSignIn.deviceModel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Battery Level:</span>
                  <span className={selectedSignIn.batteryPct < 50 ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'}>
                    {selectedSignIn.batteryPct}% Charged
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mobile Carrier:</span>
                  <span className="text-slate-800">{selectedSignIn.networkCarrier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Verification:</span>
                  <span className="text-slate-800">{selectedSignIn.verificationMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">IP Address:</span>
                  <span className="text-slate-700">{selectedSignIn.liveIpAddress || '102.89.44.12'}</span>
                </div>
              </div>

              {/* Action Buttons for Super Admin */}
              <div className="space-y-2 pt-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleApprove(selectedSignIn.id)}
                    className="py-2 px-3 rounded-xl bg-[#10b981] hover:bg-emerald-600 text-white font-bold text-xs shadow-sm transition-all text-center"
                  >
                    ✓ Approve Check-In
                  </button>
                  <button
                    onClick={() => handleFlag(selectedSignIn.id)}
                    className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-all text-center"
                  >
                    ⚠️ Flag for Review
                  </button>
                </div>

                <button
                  onClick={() => handleSendWarning(selectedSignIn.workerPhone, selectedSignIn.workerName)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Send Warning Message to Staff</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              Select any staff member from the table to view check-in coordinates.
            </div>
          )}
        </div>
      </div>

      {/* SIMULATOR MODAL */}
      {showSimulatorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-[16px] p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Simulate Staff Check-In</h3>
                <p className="text-xs text-slate-500 mt-0.5">Test how the GPS tracker records staff locations</p>
              </div>
              <button
                onClick={() => setShowSimulatorModal(false)}
                className="text-slate-400 hover:text-slate-700 text-base"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Staff Name</label>
                <input
                  type="text"
                  value={simWorkerName}
                  onChange={(e) => setSimWorkerName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Staff ID Code</label>
                <input
                  type="text"
                  value={simWorkerCode}
                  onChange={(e) => setSimWorkerCode(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Assigned Retail Store</label>
                <select
                  value={simStoreIndex}
                  onChange={(e) => setSimStoreIndex(parseInt(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500"
                >
                  {PRESET_TEST_STORES.map((s, idx) => (
                    <option key={s.name} value={idx}>
                      {s.name} ({s.hub})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">GPS Location Result</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSimDistanceType('inside')}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 ${
                      simDistanceType === 'inside'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-bold'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <span>✓ Inside Store (&lt;20m)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimDistanceType('outside')}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 ${
                      simDistanceType === 'outside'
                        ? 'bg-rose-50 border-rose-500 text-rose-700 font-bold'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <span>⚠️ Outside Store (Alert)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Phone Device Model</label>
                <input
                  type="text"
                  value={simDevice}
                  onChange={(e) => setSimDevice(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Or use browser's real GPS */}
              <div className="pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleUseRealGps}
                  disabled={isGettingRealGps}
                  className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isGettingRealGps ? 'Locating...' : 'Use My Browser\'s Real GPS'}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowSimulatorModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSimulateSubmit}
                className="px-4 py-2 rounded-xl bg-[#10b981] hover:bg-emerald-600 text-white text-xs font-bold shadow-sm"
              >
                Save Sign-In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
