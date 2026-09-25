import React, { useState, useMemo } from 'react';
import { WorkerGpsSignIn } from '../types';
import { INITIAL_GPS_SIGN_INS, PRESET_TEST_STORES } from '../data/gpsSignInData';

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
    setActionSuccessMsg('Worker flagged. Warning notice queued.');
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
        'Worker_ID',
        'Worker_Name',
        'Phone_Number',
        'Assigned_Store',
        'Branch_Location',
        'Sign_In_Time_WAT',
        'Sign_In_Date',
        'Latitude',
        'Longitude',
        'Street_Address',
        'Distance_From_Store_Meters',
        'Store_Boundary_Status',
        'Battery_Pct',
        'Phone_Model',
        'Mobile_Network',
        'Check_In_Method',
        'Approval_Status'
      ].join(','));

      signIns.forEach((s) => {
        rows.push([
          `"${s.workerCode}"`,
          `"${s.workerName}"`,
          `"${s.workerPhone}"`,
          `"${s.assignedStore}"`,
          `"${s.assignedHub}"`,
          `"${s.signInTimeWat}"`,
          `"${s.signInDate}"`,
          s.latitude,
          s.longitude,
          `"${s.locationAddress}"`,
          s.distanceMeters,
          `"${s.geofenceStatus === 'in_store' ? 'INSIDE STORE' : s.geofenceStatus === 'near_store' ? 'NEARBY' : 'OUTSIDE STORE'}"`,
          s.batteryPct,
          `"${s.deviceModel}"`,
          `"${s.networkCarrier}"`,
          `"${s.verificationMethod}"`,
          `"${s.status.toUpperCase()}"`
        ].join(','));
      });

      const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(rows.join('\n'));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', csvContent);
      downloadAnchor.setAttribute('download', `KEA_Worker_GPS_SignIns_${now.toISOString().substring(0, 10)}.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setIsExportingCsv(false), 1000);
    }
  };

  // Submit Simulated Worker Check-in
  const handleSimulateSubmit = () => {
    const store = PRESET_TEST_STORES[simStoreIndex];
    const isInside = simDistanceType === 'inside';

    const latOffset = isInside ? (Math.random() - 0.5) * 0.0002 : (Math.random() + 0.02) * 0.05;
    const lngOffset = isInside ? (Math.random() - 0.5) * 0.0002 : (Math.random() + 0.02) * 0.05;

    const newSignIn: WorkerGpsSignIn = {
      id: `gps-sim-${Date.now()}`,
      workerName: simWorkerName.trim() || 'New Field Worker',
      workerCode: simWorkerCode.trim() || 'VSR-NEW-01',
      workerPhone: '+234 803 ' + Math.floor(1000000 + Math.random() * 9000000),
      assignedStore: store.name,
      assignedHub: store.hub,
      signInTimeWat: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' WAT',
      signInDate: 'Today',
      latitude: parseFloat((store.lat + latOffset).toFixed(5)),
      longitude: parseFloat((store.lng + lngOffset).toFixed(5)),
      locationAddress: isInside ? store.address : 'Residential Area (Away from store)',
      geofenceStatus: isInside ? 'in_store' : 'out_of_bounds',
      distanceMeters: isInside ? Math.floor(5 + Math.random() * 20) : Math.floor(1200 + Math.random() * 3000),
      batteryPct: Math.floor(75 + Math.random() * 23),
      deviceModel: simDevice,
      networkCarrier: 'MTN 4G',
      verificationMethod: isInside ? 'GPS Geofence' : 'Manager Override',
      status: isInside ? 'approved' : 'flagged',
      liveIpAddress: '102.89.' + Math.floor(10 + Math.random() * 200) + '.' + Math.floor(10 + Math.random() * 200),
      signInAccuracyMeters: isInside ? 6 : 28
    };

    setSignIns((prev) => [newSignIn, ...prev]);
    setSelectedSignIn(newSignIn);
    setShowSimulatorModal(false);
    setActionSuccessMsg(`Live Sign-in recorded for ${newSignIn.workerName}! Location: ${isInside ? 'Inside Store' : 'Outside Store (Alert)'}`);
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  // Get real browser GPS
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
        <div className="p-3.5 rounded-xl bg-[#92C842]/20 border border-[#92C842]/50 text-[#92C842] flex items-center justify-between shadow-lg text-xs font-semibold animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#92C842] animate-ping" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg('')} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* TOP HEADER & ACTION BUTTONS */}
      <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-xl p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#92C842]/10 text-[#92C842] border border-[#92C842]/30">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
                <path
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white tracking-wide">
              Worker GPS Sign-In Ledger
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#92C842]/20 text-[#92C842] border border-[#92C842]/30">
              LIVE TELEMETRY
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Audit where workers sign in from every morning. Validate store boundary compliance, GPS accuracy, and device telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="px-3.5 py-2 rounded-lg bg-[#151f38] hover:bg-[#1a2745] text-slate-300 hover:text-white border border-[#1e2d4d] text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              ← Back to Main Dashboard
            </button>
          )}

          <button
            onClick={handleExportCsv}
            disabled={isExportingCsv}
            className="px-4 py-2 rounded-lg bg-[#151f38] hover:bg-[#1a2745] text-slate-200 border border-[#1e2d4d] hover:border-[#92C842]/50 text-xs font-semibold flex items-center gap-2 transition-all shadow-sm disabled:opacity-50"
            title="Download CSV file of all worker sign-in coordinates and times"
          >
            <svg className="w-4 h-4 text-[#92C842]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
            <span>{isExportingCsv ? 'Creating CSV...' : 'Download Sign-In Log (CSV)'}</span>
          </button>

          <button
            onClick={() => setShowSimulatorModal(true)}
            className="px-4 py-2 rounded-lg bg-[#92C842] hover:bg-[#7bb32e] text-[#090e1c] text-xs font-bold shadow-md shadow-[#92C842]/20 flex items-center gap-1.5 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
            <span>Simulate Worker Sign-In</span>
          </button>
        </div>
      </div>

      {/* 4 SUMMARY STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Signed In */}
        <div
          onClick={() => setSelectedStatusFilter('all')}
          className={`bg-[#0e1628] border rounded-xl p-4 transition-all cursor-pointer ${
            selectedStatusFilter === 'all' ? 'border-[#92C842]' : 'border-[#1e2d4d] hover:border-[#1e2d4d]/80'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>TOTAL SIGNED IN TODAY</span>
            <span className="text-[#92C842] p-1 rounded bg-[#92C842]/10">✓</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">{stats.total}</span>
            <span className="text-xs text-slate-400">Workers</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">All registered morning check-ins</p>
        </div>

        {/* Inside Store (Safe) */}
        <div
          onClick={() => setSelectedStatusFilter('in_store')}
          className={`bg-[#0e1628] border rounded-xl p-4 transition-all cursor-pointer ${
            selectedStatusFilter === 'in_store' ? 'border-[#92C842]' : 'border-[#1e2d4d] hover:border-[#92C842]/40'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>INSIDE STORE (VERIFIED)</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#92C842]"></span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#92C842] font-mono">{stats.insideStore}</span>
            <span className="text-xs text-[#92C842] bg-[#92C842]/10 px-1.5 py-0.5 rounded font-bold">
              {stats.total > 0 ? Math.round((stats.insideStore / stats.total) * 100) : 0}%
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">Within 50 meters of store door</p>
        </div>

        {/* Outside Store (Flagged) */}
        <div
          onClick={() => setSelectedStatusFilter('out_of_bounds')}
          className={`bg-[#0e1628] border rounded-xl p-4 transition-all cursor-pointer ${
            selectedStatusFilter === 'out_of_bounds' ? 'border-[#E05252]' : 'border-[#1e2d4d] hover:border-[#E05252]/40'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>OUTSIDE STORE (ALERT)</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#E05252]"></span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#E05252] font-mono">{stats.outsideStore}</span>
            <span className="text-xs font-bold text-[#E05252] bg-[#E05252]/15 px-1.5 py-0.5 rounded border border-[#E05252]/30">
              Needs Check
            </span>
          </div>
          <p className="mt-2 text-[11px] text-[#E05252] font-medium">Signed in far from assigned store</p>
        </div>

        {/* Pending Review */}
        <div
          onClick={() => setSelectedStatusFilter('pending_review')}
          className={`bg-[#0e1628] border rounded-xl p-4 transition-all cursor-pointer ${
            selectedStatusFilter === 'pending_review' ? 'border-[#F17F31]' : 'border-[#1e2d4d] hover:border-[#F17F31]/40'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>WAITING FOR REVIEW</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#F17F31]"></span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#F17F31] font-mono">{stats.pendingReview}</span>
            <span className="text-xs text-slate-400">Workers</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">Near store or manual check-in</p>
        </div>
      </div>

      {/* FILTER & SEARCH CONTROLS */}
      <div className="bg-[#0b1222] border border-[#1e2d4d] rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Hub Location Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-400 font-mono text-[11px] mr-1">LOCATION:</span>
          {['All', 'Lagos', 'Ibadan', 'Ogun', 'Benin'].map((hubName) => (
            <button
              key={hubName}
              onClick={() => setSelectedHub(hubName)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedHub === hubName
                  ? 'bg-[#92C842] text-[#090e1c] shadow-sm font-bold'
                  : 'bg-[#151f38] text-slate-300 hover:text-white border border-[#1e2d4d]'
              }`}
            >
              {hubName === 'All' ? 'All 4 Locations' : `${hubName} Branch`}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative min-w-[260px] flex-1 max-w-sm">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search worker name, store, or phone..."
            className="w-full bg-[#151f38] border border-[#1e2d4d] rounded-lg px-3 py-1.5 pl-8 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#92C842]"
          />
          <svg className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-2 text-slate-400 hover:text-white">✕</button>
          )}
        </div>
      </div>

      {/* MAIN TWO-COLUMN VIEW: DATA LEDGER TABLE + INSPECTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* WORKER GPS SIGN-IN LEDGER TABLE (8 COLS) */}
        <div className="lg:col-span-8 bg-[#0e1628] border border-[#1e2d4d] rounded-xl overflow-hidden shadow-xl">
          <div className="px-5 py-3.5 bg-[#090e1c] border-b border-[#1e2d4d] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white uppercase tracking-wider">
                Morning Worker Sign-In Records
              </span>
              <span className="text-[11px] font-mono text-[#92C842] bg-[#92C842]/10 px-2 py-0.5 rounded border border-[#92C842]/30">
                LIVE
              </span>
            </div>
            <span className="text-slate-400 font-mono text-xs">
              Showing {filteredSignIns.length} of {signIns.length} records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#151f38] text-slate-400 font-mono text-[10px] uppercase tracking-wider border-b border-[#1e2d4d]">
                <tr>
                  <th className="px-4 py-3">Worker</th>
                  <th className="px-4 py-3">Branch</th>
                  <th className="px-4 py-3">Assigned Store</th>
                  <th className="px-4 py-3">Time (WAT)</th>
                  <th className="px-4 py-3">Distance to Store</th>
                  <th className="px-4 py-3">Boundary Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2d4d]/60">
                {filteredSignIns.map((row) => {
                  const isSelected = selectedSignIn?.id === row.id;
                  const isSafe = row.geofenceStatus === 'in_store';
                  const isWarning = row.geofenceStatus === 'near_store';

                  return (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedSignIn(row)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#151f38] ring-1 ring-inset ring-[#92C842]/40' : 'hover:bg-[#151f38]/50'
                      }`}
                    >
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${isSafe ? 'bg-[#92C842]' : isWarning ? 'bg-[#F17F31]' : 'bg-[#E05252]'}`} />
                          <span>{row.workerName}</span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">{row.workerCode}</div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-300 font-medium">{row.assignedHub}</td>
                      <td className="px-4 py-3.5 text-slate-200">
                        <div className="truncate max-w-[160px]">{row.assignedStore}</div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[#92C842] font-semibold">{row.signInTimeWat}</td>
                      <td className="px-4 py-3.5 font-mono">
                        <span className={`font-bold ${isSafe ? 'text-[#92C842]' : isWarning ? 'text-[#F17F31]' : 'text-[#E05252]'}`}>
                          {row.distanceMeters < 1000 ? `${row.distanceMeters}m` : `${(row.distanceMeters / 1000).toFixed(1)}km`}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide border uppercase ${
                            isSafe
                              ? 'bg-[#92C842]/15 text-[#92C842] border-[#92C842]/30'
                              : isWarning
                              ? 'bg-[#F17F31]/15 text-[#F17F31] border-[#F17F31]/30'
                              : 'bg-[#E05252]/15 text-[#E05252] border-[#E05252]/30'
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
                          className="px-2.5 py-1 rounded bg-[#92C842]/20 hover:bg-[#92C842]/30 text-[#92C842] text-[11px] border border-[#92C842]/30 font-bold"
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
        <div className="lg:col-span-4 bg-[#0e1628] border border-[#1e2d4d] rounded-xl p-5 shadow-xl space-y-4">
          <div className="border-b border-[#1e2d4d] pb-3 flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] font-mono text-[#92C842] uppercase tracking-wider font-bold">
                WORKER TELEMETRY INSPECTOR
              </span>
              <h3 className="text-base font-bold text-white mt-1">
                {selectedSignIn ? selectedSignIn.workerName : 'Select a worker'}
              </h3>
              <p className="text-xs text-slate-400">
                {selectedSignIn ? `${selectedSignIn.workerCode} • ${selectedSignIn.assignedHub} Branch` : 'Click a record in the table to view'}
              </p>
            </div>

            {selectedSignIn && (
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                  selectedSignIn.geofenceStatus === 'in_store'
                    ? 'bg-[#92C842]/20 text-[#92C842] border-[#92C842]/40'
                    : selectedSignIn.geofenceStatus === 'near_store'
                    ? 'bg-[#F17F31]/20 text-[#F17F31] border-[#F17F31]/40'
                    : 'bg-[#E05252]/20 text-[#E05252] border-[#E05252]/40'
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
                className={`p-3 rounded-lg border flex items-center justify-between font-mono ${
                  selectedSignIn.geofenceStatus === 'in_store'
                    ? 'bg-[#92C842]/10 border-[#92C842]/30 text-[#92C842]'
                    : selectedSignIn.geofenceStatus === 'near_store'
                    ? 'bg-[#F17F31]/10 border-[#F17F31]/30 text-[#F17F31]'
                    : 'bg-[#E05252]/10 border-[#E05252]/30 text-[#E05252]'
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
              <div className="bg-[#151f38]/60 border border-[#1e2d4d] rounded-lg p-3 space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned Store:</span>
                  <span className="text-white font-semibold text-right">{selectedSignIn.assignedStore}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Sign-In Time:</span>
                  <span className="text-[#92C842] font-bold">{selectedSignIn.signInTimeWat}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Coordinates:</span>
                  <span className="text-slate-200">{selectedSignIn.latitude.toFixed(4)}, {selectedSignIn.longitude.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Location Address:</span>
                  <span className="text-slate-300 text-right text-[11px] max-w-[190px] truncate">{selectedSignIn.locationAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Phone Model:</span>
                  <span className="text-slate-200">{selectedSignIn.deviceModel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Battery Level:</span>
                  <span className={selectedSignIn.batteryPct < 50 ? 'text-[#F17F31] font-bold' : 'text-[#92C842]'}>
                    {selectedSignIn.batteryPct}% Charged
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mobile Network:</span>
                  <span className="text-slate-200">{selectedSignIn.networkCarrier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Verification:</span>
                  <span className="text-slate-200">{selectedSignIn.verificationMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">IP Address:</span>
                  <span className="text-slate-300">{selectedSignIn.liveIpAddress || '102.89.44.12'}</span>
                </div>
              </div>

              {/* Action Buttons for Super Admin */}
              <div className="space-y-2 pt-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleApprove(selectedSignIn.id)}
                    className="py-2 px-3 rounded-lg bg-[#92C842] hover:bg-[#7bb32e] text-[#090e1c] font-bold text-xs shadow-md transition-all text-center"
                  >
                    ✓ Approve Sign-In
                  </button>
                  <button
                    onClick={() => handleFlag(selectedSignIn.id)}
                    className="py-2 px-3 rounded-lg bg-[#E05252]/20 hover:bg-[#E05252]/30 text-[#E05252] border border-[#E05252]/40 font-bold text-xs transition-all text-center"
                  >
                    ⚠️ Flag Suspicious
                  </button>
                </div>

                <button
                  onClick={() => handleSendWarning(selectedSignIn.workerPhone, selectedSignIn.workerName)}
                  className="w-full py-2 px-3 rounded-lg bg-[#151f38] hover:bg-[#1a2745] text-slate-200 border border-[#1e2d4d] text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <svg className="w-3.5 h-3.5 text-[#F17F31]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                  <span>Send Warning Message to Worker</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              Select any worker from the table to inspect their telemetry coordinates.
            </div>
          )}
        </div>
      </div>

      {/* SIMULATOR MODAL */}
      {showSimulatorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e2d4d] pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Simulate Worker Sign-In</h3>
                <p className="text-xs text-slate-400 mt-0.5">Test how the GPS tracker catches worker check-ins</p>
              </div>
              <button
                onClick={() => setShowSimulatorModal(false)}
                className="text-slate-400 hover:text-white text-base"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Worker Name</label>
                <input
                  type="text"
                  value={simWorkerName}
                  onChange={(e) => setSimWorkerName(e.target.value)}
                  className="w-full bg-[#151f38] border border-[#1e2d4d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#92C842]"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Worker Staff ID</label>
                <input
                  type="text"
                  value={simWorkerCode}
                  onChange={(e) => setSimWorkerCode(e.target.value)}
                  className="w-full bg-[#151f38] border border-[#1e2d4d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#92C842]"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Assigned Retail Store</label>
                <select
                  value={simStoreIndex}
                  onChange={(e) => setSimStoreIndex(parseInt(e.target.value))}
                  className="w-full bg-[#151f38] border border-[#1e2d4d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#92C842]"
                >
                  {PRESET_TEST_STORES.map((s, idx) => (
                    <option key={s.name} value={idx}>
                      {s.name} ({s.hub})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">GPS Location Result</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSimDistanceType('inside')}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 ${
                      simDistanceType === 'inside'
                        ? 'bg-[#92C842]/20 border-[#92C842] text-[#92C842]'
                        : 'bg-[#151f38] border-[#1e2d4d] text-slate-400'
                    }`}
                  >
                    <span>✓ Inside Store (&lt;20m)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimDistanceType('outside')}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 ${
                      simDistanceType === 'outside'
                        ? 'bg-[#E05252]/20 border-[#E05252] text-[#E05252]'
                        : 'bg-[#151f38] border-[#1e2d4d] text-slate-400'
                    }`}
                  >
                    <span>⚠️ Outside Store (Alert)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Phone Device</label>
                <input
                  type="text"
                  value={simDevice}
                  onChange={(e) => setSimDevice(e.target.value)}
                  className="w-full bg-[#151f38] border border-[#1e2d4d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#92C842]"
                />
              </div>

              {/* Or use browser's real GPS */}
              <div className="pt-2 border-t border-[#1e2d4d]">
                <button
                  type="button"
                  onClick={handleUseRealGps}
                  disabled={isGettingRealGps}
                  className="w-full py-2 px-3 rounded-lg bg-[#151f38] hover:bg-[#1a2745] text-[#92C842] border border-[#92C842]/40 text-xs font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                  <span>{isGettingRealGps ? 'Locating...' : 'Use My Browser\'s Real GPS'}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1e2d4d]">
              <button
                type="button"
                onClick={() => setShowSimulatorModal(false)}
                className="px-4 py-2 rounded-lg bg-[#151f38] text-slate-300 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSimulateSubmit}
                className="px-4 py-2 rounded-lg bg-[#92C842] hover:bg-[#7bb32e] text-[#090e1c] text-xs font-bold shadow-md shadow-[#92C842]/20"
              >
                Submit Sign-In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
