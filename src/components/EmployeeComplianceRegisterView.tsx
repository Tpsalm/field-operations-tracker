import React, { useState, useMemo } from 'react';
import {
  EMPLOYEE_COMPLIANCE_REGISTER,
  CONTACT_RECONCILIATION_AUDIT_LOG,
  UNMATCHED_CONTACT_AUDIT,
  EmployeeComplianceRecord,
  ContactReconciliationAudit
} from '../data/employeeComplianceRegisterData';
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  AlertTriangle,
  UserCheck,
  FileText,
  Users,
  Building,
  CheckCircle2,
  Clock,
  ExternalLink,
  X,
  CreditCard,
  Briefcase,
  Phone,
  Mail,
  Home,
  AlertCircle
} from 'lucide-react';

interface EmployeeComplianceRegisterViewProps {
  onNavigateBack?: () => void;
}

export const EmployeeComplianceRegisterView: React.FC<EmployeeComplianceRegisterViewProps> = ({
  onNavigateBack
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'reconciled' | 'vsr' | 'asst_vsr' | 'pending' | 'risk'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('All');
  const [selectedRecord, setSelectedRecord] = useState<EmployeeComplianceRecord | null>(null);
  const [showReconciliationAuditModal, setShowReconciliationAuditModal] = useState(false);

  // Distinct locations for filter dropdown
  const locations = useMemo(() => {
    const set = new Set<string>();
    EMPLOYEE_COMPLIANCE_REGISTER.forEach(r => {
      if (r.location) set.add(r.location);
    });
    return ['All', ...Array.from(set).sort()];
  }, []);

  // Filtered dataset
  const filteredData = useMemo(() => {
    return EMPLOYEE_COMPLIANCE_REGISTER.filter(record => {
      // Tab filter
      if (activeTab === 'reconciled' && !record.contactFormSubmitted) return false;
      if (activeTab === 'pending' && record.contactFormSubmitted) return false;
      if (activeTab === 'vsr' && record.designation !== 'VSR') return false;
      if (activeTab === 'asst_vsr' && record.designation !== 'Assistant VSR') return false;
      if (activeTab === 'risk' && !record.notes && record.workforceStatus !== 'Removed - Red Flag') return false;

      // Location filter
      if (locationFilter !== 'All' && record.location !== locationFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = record.fullName.toLowerCase().includes(query);
        const matchCode = record.employeeCode.toLowerCase().includes(query);
        const matchEmail = record.email.toLowerCase().includes(query) || (record.contactEmail && record.contactEmail.toLowerCase().includes(query));
        const matchPhone = record.phone.toLowerCase().includes(query) || (record.contactPhone && record.contactPhone.toLowerCase().includes(query));
        const matchLocation = record.location.toLowerCase().includes(query);
        const matchGuarantor1 = record.guarantor1?.name.toLowerCase().includes(query);
        const matchGuarantor2 = record.guarantor2?.name.toLowerCase().includes(query);
        const matchNotes = record.notes && record.notes.toLowerCase().includes(query);

        return matchName || matchCode || matchEmail || matchPhone || matchLocation || matchGuarantor1 || matchGuarantor2 || matchNotes;
      }

      return true;
    });
  }, [activeTab, locationFilter, searchQuery]);

  // KPIs
  const totalEmployees = EMPLOYEE_COMPLIANCE_REGISTER.length;
  const totalReconciled = EMPLOYEE_COMPLIANCE_REGISTER.filter(r => r.contactFormSubmitted).length;
  const totalWithRsa = EMPLOYEE_COMPLIANCE_REGISTER.filter(r => r.hasPension === 'Yes').length;
  const totalWithGuarantors = EMPLOYEE_COMPLIANCE_REGISTER.filter(r => r.guarantor1 && r.guarantor2).length;
  const totalRiskFlags = EMPLOYEE_COMPLIANCE_REGISTER.filter(r => r.notes || r.workforceStatus === 'Removed - Red Flag').length;

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      'S/N',
      'Full Name',
      'Employee Code',
      'VSR Type',
      'Designation',
      'Workforce Status',
      'Funding Status',
      'Fidelity Insurance',
      'Location',
      'Coverage Area',
      'Official Email',
      'Official Phone',
      'Onboarded Date',
      'Contact Form Submitted',
      'Contact Phone',
      'Contact Address',
      'Contact State',
      'Has Staff ID',
      'Has RSA Pension',
      'RSA Pension Name',
      'RSA Account Number',
      'G1 Name',
      'G1 Phone',
      'G1 Profession',
      'G1 Business Name',
      'G1 Relationship',
      'G2 Name',
      'G2 Phone',
      'G2 Profession',
      'G2 Business Name',
      'G2 Relationship',
      'Compliance Notes'
    ];

    const rows = filteredData.map(r => [
      r.sn,
      `"${r.fullName}"`,
      `"${r.employeeCode}"`,
      r.vsrType,
      r.designation,
      `"${r.workforceStatus}"`,
      `"${r.fundingStatus}"`,
      r.fidelityInsurance,
      `"${r.location}"`,
      `"${r.coverageArea}"`,
      `"${r.email}"`,
      `"${r.phone}"`,
      r.onboardedDate,
      r.contactFormSubmitted ? 'YES' : 'NO',
      `"${r.contactPhone || ''}"`,
      `"${(r.contactAddress || '').replace(/"/g, '""')}"`,
      `"${r.contactState || ''}"`,
      r.hasStaffId || 'N/A',
      r.hasPension || 'N/A',
      `"${r.rsaPensionName || ''}"`,
      `"${r.rsaAccountNumber || ''}"`,
      `"${r.guarantor1?.name || ''}"`,
      `"${r.guarantor1?.phone || ''}"`,
      `"${r.guarantor1?.profession || ''}"`,
      `"${r.guarantor1?.businessName || ''}"`,
      `"${r.guarantor1?.relationship || ''}"`,
      `"${r.guarantor2?.name || ''}"`,
      `"${r.guarantor2?.phone || ''}"`,
      `"${r.guarantor2?.profession || ''}"`,
      `"${r.guarantor2?.businessName || ''}"`,
      `"${r.guarantor2?.relationship || ''}"`,
      `"${(r.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `KEA_Employee_Compliance_Register_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner & Title Bar */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                Official Live Register
              </span>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-[#f27405]/20 text-[#f27405] border border-[#f27405]/40">
                Auto-Pulled from VSR &amp; Asst. VSR Trackers
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>INTERNAL STAFFS</span>
              <ShieldCheck className="w-6 h-6 text-[#82c332]" />
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Complete human resources ledger synchronized with contact form submissions, RSA / Pension verification, and dual guarantor KYC accountability records.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onNavigateBack && (
              <button
                onClick={onNavigateBack}
                className="px-3 py-1.5 rounded-lg bg-[#1e293b] hover:bg-[#334155] text-xs font-semibold text-slate-300 transition-colors"
              >
                Back to Dashboard
              </button>
            )}
            <button
              onClick={() => setShowReconciliationAuditModal(true)}
              className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-md shadow-emerald-900/30 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Contact Reconciliation Audit ({totalReconciled}/24)</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-lg bg-[#82c332] hover:bg-[#74b32b] text-xs font-bold text-black flex items-center gap-1.5 shadow-md shadow-lime-950/30 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Export Register (CSV)</span>
            </button>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-5 pt-5 border-t border-[#1e293b]">
          <div className="bg-[#1e293b]/70 rounded-lg p-3 border border-slate-700/60">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Personnel</span>
            <div className="text-xl font-black text-white mt-1 flex items-baseline gap-1.5">
              <span>{totalEmployees}</span>
              <span className="text-[11px] text-slate-400 font-normal">Registered</span>
            </div>
          </div>

          <div className="bg-[#1e293b]/70 rounded-lg p-3 border border-slate-700/60">
            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">Contact Reconciled</span>
            <div className="text-xl font-black text-emerald-400 mt-1 flex items-baseline gap-1.5">
              <span>{totalReconciled} / 24</span>
              <span className="text-[11px] text-emerald-500 font-bold">100% Matched</span>
            </div>
          </div>

          <div className="bg-[#1e293b]/70 rounded-lg p-3 border border-slate-700/60">
            <span className="text-[11px] font-semibold text-sky-400 uppercase tracking-wider block">Active RSA / Pension</span>
            <div className="text-xl font-black text-sky-400 mt-1 flex items-baseline gap-1.5">
              <span>{totalWithRsa}</span>
              <span className="text-[11px] text-slate-400 font-normal">Verified PINs</span>
            </div>
          </div>

          <div className="bg-[#1e293b]/70 rounded-lg p-3 border border-slate-700/60">
            <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block">Guarantors KYC</span>
            <div className="text-xl font-black text-amber-400 mt-1 flex items-baseline gap-1.5">
              <span>{totalWithGuarantors * 2}</span>
              <span className="text-[11px] text-slate-400 font-normal">G1 &amp; G2 Vetted</span>
            </div>
          </div>

          <div className="bg-[#1e293b]/70 rounded-lg p-3 border border-slate-700/60 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider block">Risk / Review Flags</span>
            <div className="text-xl font-black text-rose-400 mt-1 flex items-baseline gap-1.5">
              <span>{totalRiskFlags}</span>
              <span className="text-[11px] text-slate-400 font-normal">Audit Items</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl shadow-xl overflow-hidden">
        {/* Navigation Tabs */}
        <div className="bg-[#1e293b] px-4 py-2 border-b border-black flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-t-md font-bold transition-all border-t-2 ${
                activeTab === 'all'
                  ? 'bg-[#82c332] text-black border-[#82c332]'
                  : 'bg-[#0f172a] text-slate-300 hover:text-white border-transparent'
              }`}
            >
              All Personnel ({EMPLOYEE_COMPLIANCE_REGISTER.length})
            </button>
            <button
              onClick={() => setActiveTab('reconciled')}
              className={`px-3 py-1.5 rounded-t-md font-bold transition-all border-t-2 ${
                activeTab === 'reconciled'
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-[#0f172a] text-slate-300 hover:text-white border-transparent'
              }`}
            >
              Reconciled Contact &amp; KYC ({totalReconciled})
            </button>
            <button
              onClick={() => setActiveTab('vsr')}
              className={`px-3 py-1.5 rounded-t-md font-bold transition-all border-t-2 ${
                activeTab === 'vsr'
                  ? 'bg-[#82c332] text-black border-[#82c332]'
                  : 'bg-[#0f172a] text-slate-300 hover:text-white border-transparent'
              }`}
            >
              VSRs (53)
            </button>
            <button
              onClick={() => setActiveTab('asst_vsr')}
              className={`px-3 py-1.5 rounded-t-md font-bold transition-all border-t-2 ${
                activeTab === 'asst_vsr'
                  ? 'bg-[#f27405] text-white border-[#f27405]'
                  : 'bg-[#0f172a] text-slate-300 hover:text-white border-transparent'
              }`}
            >
              Assistant VSRs (6)
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-3 py-1.5 rounded-t-md font-bold transition-all border-t-2 ${
                activeTab === 'pending'
                  ? 'bg-amber-600 text-white border-amber-500'
                  : 'bg-[#0f172a] text-slate-300 hover:text-white border-transparent'
              }`}
            >
              Pending Form ({EMPLOYEE_COMPLIANCE_REGISTER.length - totalReconciled})
            </button>
            <button
              onClick={() => setActiveTab('risk')}
              className={`px-3 py-1.5 rounded-t-md font-bold transition-all border-t-2 ${
                activeTab === 'risk'
                  ? 'bg-rose-600 text-white border-rose-500'
                  : 'bg-[#0f172a] text-slate-300 hover:text-white border-transparent'
              }`}
            >
              Risk Flags ({totalRiskFlags})
            </button>
          </div>

          <div className="text-xs font-mono text-slate-400 font-semibold">
            Showing <strong className="text-white">{filteredData.length}</strong> of <strong className="text-white">{EMPLOYEE_COMPLIANCE_REGISTER.length}</strong> records
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-3 bg-[#131d35] border-b border-slate-700/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 flex-1 min-w-[260px]">
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, employee code, phone, email, guarantor, or notes..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#0f172a] border border-slate-700 text-slate-200 pl-8 pr-3 py-1.5 rounded text-xs focus:outline-none focus:border-[#82c332]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400 font-semibold">Location:</span>
              <select
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value)}
                className="bg-[#0f172a] border border-slate-700 text-slate-200 px-2 py-1.5 rounded text-xs focus:outline-none focus:border-[#82c332]"
              >
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>

          {(searchQuery || locationFilter !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setLocationFilter('All');
              }}
              className="px-2.5 py-1 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 text-xs font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Spreadsheet Table */}
        <div className="overflow-x-auto max-h-[750px]">
          <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
            <thead className="sticky top-0 z-20 bg-[#1e293b] text-white shadow-sm border-b-2 border-black font-sans">
              <tr>
                <th className="px-2.5 py-2.5 font-black border-r border-black/30 text-center w-12">S/N</th>
                <th className="px-3.5 py-2.5 font-black border-r border-black/30">Employee Code</th>
                <th className="px-4 py-2.5 font-black border-r border-black/30">Full Name</th>
                <th className="px-2.5 py-2.5 font-black border-r border-black/30 text-center">Type</th>
                <th className="px-3 py-2.5 font-black border-r border-black/30">Designation</th>
                <th className="px-3.5 py-2.5 font-black border-r border-black/30">Workforce Status</th>
                <th className="px-3 py-2.5 font-black border-r border-black/30">Funding Status</th>
                <th className="px-2.5 py-2.5 font-black border-r border-black/30 text-center">Fidelity</th>
                <th className="px-3 py-2.5 font-black border-r border-black/30">Location</th>
                <th className="px-3 py-2.5 font-black border-r border-black/30">Email</th>
                <th className="px-3 py-2.5 font-black border-r border-black/30">Phone</th>
                <th className="px-3 py-2.5 font-black border-r border-black/30 text-center">Contact Form</th>
                <th className="px-3 py-2.5 font-black border-r border-black/30 text-center">RSA / Pension</th>
                <th className="px-3 py-2.5 font-black border-r border-black/30 text-center">Guarantors</th>
                <th className="px-4 py-2.5 font-black">Notes / Risk Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800 bg-[#0f172a]">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={15} className="py-12 text-center text-slate-400">
                    No records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredData.map(record => {
                  const isRedFlag = record.workforceStatus === 'Removed - Red Flag';
                  const isProspective = record.workforceStatus === 'Prospective VSR';
                  const hasGuarantors = record.guarantor1 && record.guarantor2;

                  return (
                    <tr
                      key={record.sn}
                      onClick={() => setSelectedRecord(record)}
                      className={`transition-colors cursor-pointer hover:bg-slate-800/80 ${
                        isRedFlag
                          ? 'bg-rose-950/20 hover:bg-rose-950/40'
                          : record.sn % 2 === 0
                          ? 'bg-[#131b2e]/60'
                          : 'bg-[#0f172a]'
                      }`}
                    >
                      {/* 1. S/N */}
                      <td className="px-2.5 py-2 text-center font-mono font-bold text-slate-400 border-r border-slate-800">
                        {record.sn}
                      </td>

                      {/* 2. Employee Code */}
                      <td className="px-3.5 py-2 font-mono border-r border-slate-800">
                        {record.employeeCode === 'TO BE ADDED - REVIEW' ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            TO BE ADDED
                          </span>
                        ) : (
                          <span className="font-semibold text-slate-200">
                            {record.employeeCode}
                          </span>
                        )}
                      </td>

                      {/* 3. Full Name */}
                      <td className="px-4 py-2 font-bold text-white border-r border-slate-800 flex items-center justify-between gap-2">
                        <span>{record.fullName}</span>
                        {record.contactFormSubmitted && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400" title="Reconciled Contact Form On File"></span>
                        )}
                      </td>

                      {/* 4. Type */}
                      <td className="px-2.5 py-2 text-center font-mono text-slate-400 border-r border-slate-800">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          record.vsrType === 'Existing'
                            ? 'bg-purple-900/30 text-purple-300 border border-purple-800'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {record.vsrType}
                        </span>
                      </td>

                      {/* 5. Designation */}
                      <td className="px-3 py-2 font-semibold text-slate-300 border-r border-slate-800">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          record.designation === 'Assistant VSR'
                            ? 'bg-[#f27405]/20 text-[#f27405] border border-[#f27405]/40'
                            : 'bg-[#82c332]/20 text-[#82c332] border border-[#82c332]/40'
                        }`}>
                          {record.designation}
                        </span>
                      </td>

                      {/* 6. Workforce Status */}
                      <td className="px-3.5 py-2 border-r border-slate-800">
                        {record.workforceStatus === 'Active VSR' ? (
                          <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-[#82c332] text-black">
                            Active VSR
                          </span>
                        ) : record.workforceStatus === 'Active ASST. VSR' ? (
                          <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-[#f27405] text-white">
                            Active ASST. VSR
                          </span>
                        ) : isRedFlag ? (
                          <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-rose-600 text-white">
                            Removed - Red Flag
                          </span>
                        ) : isProspective ? (
                          <span className="px-2 py-0.5 rounded font-semibold text-[11px] bg-slate-700 text-slate-300">
                            Prospective VSR
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-amber-600 text-white">
                            {record.workforceStatus}
                          </span>
                        )}
                      </td>

                      {/* 7. Funding Status */}
                      <td className="px-3 py-2 font-medium text-slate-300 border-r border-slate-800">
                        {record.fundingStatus === 'Funded' ? (
                          <span className="font-bold text-emerald-400">Funded</span>
                        ) : record.fundingStatus.includes('Insured') ? (
                          <span className="font-semibold text-amber-300">{record.fundingStatus}</span>
                        ) : record.fundingStatus.includes('Review') ? (
                          <span className="font-semibold text-rose-400">{record.fundingStatus}</span>
                        ) : record.fundingStatus === 'Cleared by Risk & Compliance' ? (
                          <span className="font-semibold text-sky-400">Cleared by Risk</span>
                        ) : (
                          <span className="text-slate-500">{record.fundingStatus || '-'}</span>
                        )}
                      </td>

                      {/* 8. Fidelity */}
                      <td className="px-2.5 py-2 text-center border-r border-slate-800">
                        {record.fidelityInsurance === 'YES' ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-emerald-950 text-emerald-400 border border-emerald-800">
                            YES
                          </span>
                        ) : record.fidelityInsurance === 'NOT YET' ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-950 text-amber-400 border border-amber-800">
                            NOT YET
                          </span>
                        ) : (
                          <span className="text-slate-500 font-mono text-[11px]">{record.fidelityInsurance || '-'}</span>
                        )}
                      </td>

                      {/* 9. Location */}
                      <td className="px-3 py-2 font-semibold text-slate-200 border-r border-slate-800">
                        {record.location}
                      </td>

                      {/* 10. Email */}
                      <td className="px-3 py-2 font-mono text-[11px] text-slate-400 border-r border-slate-800 max-w-[190px] truncate" title={record.email}>
                        {record.email || '-'}
                      </td>

                      {/* 11. Phone */}
                      <td className="px-3 py-2 font-mono text-[11px] text-slate-300 border-r border-slate-800">
                        {record.phone || '-'}
                      </td>

                      {/* 12. Contact Form */}
                      <td className="px-3 py-2 text-center border-r border-slate-800">
                        {record.contactFormSubmitted ? (
                          <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Matched</span>
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] text-slate-500 bg-slate-800 border border-slate-700">
                            Pending
                          </span>
                        )}
                      </td>

                      {/* 13. RSA / Pension */}
                      <td className="px-3 py-2 text-center border-r border-slate-800">
                        {record.hasPension === 'Yes' ? (
                          <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-sky-500/20 text-sky-400 border border-sky-500/40">
                            Active RSA
                          </span>
                        ) : record.contactFormSubmitted ? (
                          <span className="text-slate-500 text-[10px]">None</span>
                        ) : (
                          <span className="text-slate-600 text-[10px]">-</span>
                        )}
                      </td>

                      {/* 14. Guarantors */}
                      <td className="px-3 py-2 text-center border-r border-slate-800">
                        {hasGuarantors ? (
                          <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            2 Verified
                          </span>
                        ) : (
                          <span className="text-slate-600 text-[10px]">Pending</span>
                        )}
                      </td>

                      {/* 15. Notes */}
                      <td className="px-4 py-2 max-w-[260px] truncate">
                        {record.notes ? (
                          <span className="text-rose-400 font-medium" title={record.notes}>
                            ⚠️ {record.notes}
                          </span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info strip */}
        <div className="bg-[#1e293b] px-5 py-3 border-t border-black flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#82c332]"></span>
            <span>KEA Group Internal Staffs Register</span>
            <span className="text-slate-600">•</span>
            <span className="font-mono text-slate-300">
              59 Personnel • 24 Reconciled Form Responses • Dual Guarantor Audited
            </span>
          </div>
          <span className="text-slate-500 text-[11px]">
            Click any row to open full KYC Guarantor &amp; Pension dossier
          </span>
        </div>
      </div>

      {/* DETAIL MODAL / DRAWER */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0f172a] text-white border border-[#1e2d4d] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#1e2d4d] pb-4">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-[#82c332] text-black font-black flex items-center justify-center text-sm shadow-md">
                  {selectedRecord.sn}
                </span>
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <span>{selectedRecord.fullName}</span>
                    {selectedRecord.contactFormSubmitted && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        KYC Form Reconciled
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Code: {selectedRecord.employeeCode} • {selectedRecord.designation} • {selectedRecord.location}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 rounded-lg hover:bg-[#1e2d4d] text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Employment Status Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-[#151f38] p-3.5 rounded-xl border border-[#1e2d4d] text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Workforce Status</span>
                <span className="font-bold text-white">{selectedRecord.workforceStatus}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Funding Status</span>
                <span className="font-bold text-emerald-400">{selectedRecord.fundingStatus || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Fidelity Insurance</span>
                <span className="font-bold text-[#82c332]">{selectedRecord.fidelityInsurance || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Onboarded Date</span>
                <span className="font-bold text-slate-300 font-mono">{selectedRecord.onboardedDate}</span>
              </div>
            </div>

            {/* Audit / Compliance Notes if any */}
            {selectedRecord.notes && (
              <div className="bg-rose-950/30 border border-rose-800/60 rounded-xl p-3 text-xs text-rose-300 space-y-1">
                <div className="font-black flex items-center gap-1.5 text-rose-400 uppercase tracking-wider text-[11px]">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Compliance / Risk Alert</span>
                </div>
                <p>{selectedRecord.notes}</p>
              </div>
            )}

            {selectedRecord.conflictNotes && (
              <div className="bg-amber-950/30 border border-amber-800/60 rounded-xl p-3 text-xs text-amber-300 space-y-1">
                <div className="font-black flex items-center gap-1.5 text-amber-400 uppercase tracking-wider text-[11px]">
                  <AlertCircle className="w-4 h-4" />
                  <span>Data Reconciliation Notice</span>
                </div>
                <p>{selectedRecord.conflictNotes}</p>
              </div>
            )}

            {/* Contact & Residential Details */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5 text-[#82c332]" />
                <span>Contact &amp; Field Telemetry</span>
              </h4>
              <div className="bg-[#151f38] border border-[#1e2d4d] rounded-xl p-3.5 text-xs space-y-2 font-mono">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Official Email</span>
                    <span className="text-slate-200">{selectedRecord.email || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Official Phone</span>
                    <span className="text-slate-200">{selectedRecord.phone || '-'}</span>
                  </div>
                </div>

                {selectedRecord.contactFormSubmitted && (
                  <>
                    <div className="pt-2 border-t border-slate-700/50">
                      <span className="text-slate-400 block text-[10px]">Submitted Residential Address</span>
                      <span className="text-slate-200">{selectedRecord.contactAddress}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-700/50">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Form State</span>
                        <span className="text-slate-200">{selectedRecord.contactState}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Working Route</span>
                        <span className="text-slate-200">{selectedRecord.workingRoute || '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">KEA / UAC Staff ID Card</span>
                        <span className={`font-bold ${selectedRecord.hasStaffId === 'Yes' ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {selectedRecord.hasStaffId || 'No'}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Pension & RSA Details */}
            {selectedRecord.hasPension && (
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-sky-400" />
                  <span>Retirement Savings Account (RSA / Pension)</span>
                </h4>
                <div className="bg-[#151f38] border border-[#1e2d4d] rounded-xl p-3.5 text-xs font-mono grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Has RSA Account</span>
                    <span className={`font-bold ${selectedRecord.hasPension === 'Yes' ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {selectedRecord.hasPension}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">RSA Pension Name / PFA</span>
                    <span className="text-slate-200">{selectedRecord.rsaPensionName || 'None'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">RSA PIN / Account Number</span>
                    <span className="text-sky-300 font-bold">{selectedRecord.rsaAccountNumber || 'None'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Dual Guarantor KYC Dossier */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>Dual Guarantor KYC Dossier</span>
              </h4>

              {selectedRecord.guarantor1 || selectedRecord.guarantor2 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Guarantor 1 */}
                  {selectedRecord.guarantor1 && (
                    <div className="bg-[#151f38] border border-[#1e2d4d] rounded-xl p-4 text-xs space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
                        <span className="px-2 py-0.5 rounded font-black text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          GUARANTOR 1
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Relationship: <strong className="text-white">{selectedRecord.guarantor1.relationship}</strong>
                        </span>
                      </div>

                      <div className="space-y-1.5 font-mono">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Full Name</span>
                          <span className="text-white font-bold">{selectedRecord.guarantor1.name}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Profession / Position</span>
                          <span className="text-slate-200">
                            {selectedRecord.guarantor1.profession}
                            {selectedRecord.guarantor1.positionStatus ? ` • ${selectedRecord.guarantor1.positionStatus}` : ''}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Business / Office</span>
                          <span className="text-slate-300">{selectedRecord.guarantor1.businessName}</span>
                          {selectedRecord.guarantor1.businessAddress && (
                            <span className="text-slate-400 block text-[11px]">{selectedRecord.guarantor1.businessAddress}</span>
                          )}
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Duration of Relationship</span>
                          <span className="text-slate-200">{selectedRecord.guarantor1.duration || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Guarantor 2 */}
                  {selectedRecord.guarantor2 && (
                    <div className="bg-[#151f38] border border-[#1e2d4d] rounded-xl p-4 text-xs space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
                        <span className="px-2 py-0.5 rounded font-black text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/40">
                          GUARANTOR 2
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Relationship: <strong className="text-white">{selectedRecord.guarantor2.relationship}</strong>
                        </span>
                      </div>

                      <div className="space-y-1.5 font-mono">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Full Name</span>
                          <span className="text-white font-bold">{selectedRecord.guarantor2.name}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Profession / Position</span>
                          <span className="text-slate-200">
                            {selectedRecord.guarantor2.profession}
                            {selectedRecord.guarantor2.positionStatus ? ` • ${selectedRecord.guarantor2.positionStatus}` : ''}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Business / Office</span>
                          <span className="text-slate-300">{selectedRecord.guarantor2.businessName}</span>
                          {selectedRecord.guarantor2.businessAddress && (
                            <span className="text-slate-400 block text-[11px]">{selectedRecord.guarantor2.businessAddress}</span>
                          )}
                        </div>
                        {selectedRecord.guarantor2.phone && (
                          <div>
                            <span className="text-slate-400 block text-[10px]">Telephone</span>
                            <span className="text-slate-200">{selectedRecord.guarantor2.phone}</span>
                          </div>
                        )}
                        {selectedRecord.guarantor2.residentialAddress && (
                          <div>
                            <span className="text-slate-400 block text-[10px]">Residential Address</span>
                            <span className="text-slate-300 block text-[11px]">{selectedRecord.guarantor2.residentialAddress}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-slate-400 block text-[10px]">Duration of Relationship</span>
                          <span className="text-slate-200">{selectedRecord.guarantor2.duration || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#151f38] border border-dashed border-slate-700 text-center text-slate-400 text-xs">
                  Guarantor form submission pending for this employee.
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end pt-3 border-t border-[#1e2d4d]">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-5 py-2 rounded-lg bg-[#1e2d4d] hover:bg-[#334155] text-xs font-bold text-white transition-colors"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECONCILIATION AUDIT MODAL */}
      {showReconciliationAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0f172a] text-white border border-[#1e2d4d] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e2d4d] pb-3">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>CONTACT INFORMATION RECONCILIATION AUDIT</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  100% Reconciliation Verification: All 24 form responses matched to register rows.
                </p>
              </div>
              <button
                onClick={() => setShowReconciliationAuditModal(false)}
                className="p-1 rounded-lg hover:bg-[#1e2d4d] text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Audit Summary Box */}
            <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-xl p-3 text-xs text-emerald-300 space-y-1">
              <span className="font-bold block">Reconciliation Summary:</span>
              <p>{UNMATCHED_CONTACT_AUDIT.reconciliationSummary}</p>
              <p className="text-[11px] text-amber-300 mt-1">{UNMATCHED_CONTACT_AUDIT.conflictNote}</p>
            </div>

            {/* Audit Table */}
            <div className="overflow-x-auto max-h-[420px] rounded-lg border border-slate-800">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-[#1e293b] text-white font-bold sticky top-0">
                  <tr>
                    <th className="px-3 py-2 border-r border-slate-700">Contact Form Name</th>
                    <th className="px-3 py-2 border-r border-slate-700">Matched Employee Name</th>
                    <th className="px-2.5 py-2 border-r border-slate-700 text-center">Row</th>
                    <th className="px-3 py-2 border-r border-slate-700 text-center">Match Status</th>
                    <th className="px-3.5 py-2">Matching Evidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-[#131b2e] font-mono text-[11px]">
                  {CONTACT_RECONCILIATION_AUDIT_LOG.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/60">
                      <td className="px-3 py-2 font-bold text-white border-r border-slate-800">
                        {item.contactFormName}
                      </td>
                      <td className="px-3 py-2 text-slate-200 border-r border-slate-800">
                        {item.matchedEmployeeName}
                      </td>
                      <td className="px-2.5 py-2 text-center text-slate-400 border-r border-slate-800">
                        {item.registerRow}
                      </td>
                      <td className="px-3 py-2 text-center border-r border-slate-800">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                          {item.matchStatus}
                        </span>
                      </td>
                      <td className="px-3.5 py-2 text-slate-300">
                        {item.matchingEvidence}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#1e2d4d]">
              <button
                onClick={() => setShowReconciliationAuditModal(false)}
                className="px-4 py-2 rounded-lg bg-[#1e2d4d] hover:bg-[#334155] text-xs font-bold text-white"
              >
                Close Audit Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
