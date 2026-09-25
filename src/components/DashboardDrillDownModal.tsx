import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Search, 
  Download, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Building2, 
  Phone, 
  Mail, 
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { UnifiedRecord } from '../data/liveVsrTrackerData';

interface DrillDownModalState {
  isOpen: boolean;
  title: string;
  description: string;
  records: UnifiedRecord[];
  badgeColor?: string;
  filterKey?: string;
  extraParam?: string;
}

interface DashboardDrillDownModalProps {
  isOpen?: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  records?: UnifiedRecord[];
  badgeColor?: string;
  onViewRecordDetails?: (record: UnifiedRecord) => void;
  state?: DrillDownModalState;
  onSelectRecord?: (record: any) => void;
}

type SortField = 'sn' | 'employeeCode' | 'fullName' | 'location' | 'status' | 'onboardedDate';
type SortOrder = 'asc' | 'desc';

export const DashboardDrillDownModal: React.FC<DashboardDrillDownModalProps> = ({
  isOpen: propIsOpen,
  onClose,
  title: propTitle,
  description: propDescription,
  records: propRecords,
  badgeColor: propBadgeColor = '#10b981',
  onViewRecordDetails,
  state,
  onSelectRecord
}) => {
  const isOpen = state ? state.isOpen : !!propIsOpen;
  const title = state ? state.title : (propTitle || 'Filtered Staff Records');
  const description = state ? state.description : (propDescription || '');
  const records = state ? state.records : (propRecords || []);
  const badgeColor = state ? (state.badgeColor || '#10b981') : propBadgeColor;
  const handleSelect = onSelectRecord || onViewRecordDetails;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortField, setSortField] = useState<SortField>('sn');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [inspectRecord, setInspectRecord] = useState<UnifiedRecord | null>(null);

  // AUTOMATIC STATE RESET: When modal opens or title/filter changes, reset all search/pagination state
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setLocationFilter('All');
      setStatusFilter('All');
      setCurrentPage(1);
      setInspectRecord(null);
    }
  }, [isOpen, title, state?.filterKey, state?.extraParam]);

  // Extract unique locations and statuses from provided records
  const availableLocations = useMemo(() => {
    const locs = new Set<string>();
    records.forEach(r => {
      if (r.location) locs.add(r.location);
    });
    return ['All', ...Array.from(locs).sort()];
  }, [records]);

  const availableStatuses = useMemo(() => {
    const statuses = new Set<string>();
    records.forEach(r => {
      if (r.status) statuses.add(r.status);
    });
    return ['All', ...Array.from(statuses).sort()];
  }, [records]);

  // Ensure filters match available records
  useEffect(() => {
    if (locationFilter !== 'All' && !availableLocations.includes(locationFilter)) {
      setLocationFilter('All');
    }
    if (statusFilter !== 'All' && !availableStatuses.includes(statusFilter)) {
      setStatusFilter('All');
    }
  }, [availableLocations, availableStatuses, locationFilter, statusFilter]);

  if (!isOpen) return null;

  // Filter records
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      // Search
      const query = searchQuery.toLowerCase().trim();
      if (query) {
        const matchesName = record.fullName?.toLowerCase().includes(query) || false;
        const matchesCode = record.employeeCode?.toLowerCase().includes(query) || false;
        const matchesLocation = record.location?.toLowerCase().includes(query) || false;
        const matchesEmail = record.email?.toLowerCase().includes(query) || false;
        const matchesPhone = record.phone?.includes(query) || false;
        const matchesNotes = record.notes?.toLowerCase().includes(query) || false;
        const matchesReason = record.reasonNotes?.toLowerCase().includes(query) || false;
        if (!matchesName && !matchesCode && !matchesLocation && !matchesEmail && !matchesPhone && !matchesNotes && !matchesReason) {
          return false;
        }
      }

      // Location
      if (locationFilter !== 'All' && record.location !== locationFilter) {
        return false;
      }

      // Status
      if (statusFilter !== 'All' && record.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [records, searchQuery, locationFilter, statusFilter]);

  // Sort records
  const sortedRecords = useMemo(() => {
    const sorted = [...filteredRecords];
    sorted.sort((a, b) => {
      let valA: any = a[sortField] || '';
      let valB: any = b[sortField] || '';

      if (sortField === 'sn') {
        valA = Number(a.sn) || 0;
        valB = Number(b.sn) || 0;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredRecords, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedRecords.length / pageSize));
  
  // Safe page index calculation
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedRecords = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return sortedRecords.slice(start, start + pageSize);
  }, [sortedRecords, safeCurrentPage, pageSize]);

  // Toggle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'S/N',
      'Employee Code',
      'Full Name',
      'Staff Type',
      'Location',
      'Workforce Status',
      'Status / Funding',
      'Fidelity Insurance',
      'Onboarded Date',
      'Date Funded',
      'Phone',
      'Email',
      'Notes'
    ];

    const rows = sortedRecords.map(r => [
      `"${r.sn}"`,
      `"${r.employeeCode || 'N/A'}"`,
      `"${r.fullName}"`,
      `"${r.vsrType || 'VSR'}"`,
      `"${r.location}"`,
      `"${r.workforceStatus}"`,
      `"${r.status || 'N/A'}"`,
      `"${r.fidelityInsurance || 'N/A'}"`,
      `"${r.onboardedDate || 'N/A'}"`,
      `"${r.dateFunded || 'N/A'}"`,
      `"${r.phone}"`,
      `"${r.email}"`,
      `"${(r.notes || r.reasonNotes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `KEA_Staff_${title.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200/90 rounded-[16px] w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* MODAL HEADER */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span 
              className="w-2.5 h-8 rounded-full"
              style={{ backgroundColor: badgeColor }}
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  {title}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {sortedRecords.length} records
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors shadow-sm"
              title="Export visible rows to CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* FILTER & SEARCH STRIP */}
        <div className="px-6 py-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, code, location, phone..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Location Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-semibold uppercase text-[10px]">Location:</span>
            <select
              value={locationFilter}
              onChange={e => {
                setLocationFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {availableLocations.map(loc => (
                <option key={loc} value={loc} className="bg-white text-slate-800">
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          {availableStatuses.length > 2 && (
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-semibold uppercase text-[10px]">Status:</span>
              <select
                value={statusFilter}
                onChange={e => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {availableStatuses.map(st => (
                  <option key={st} value={st} className="bg-white text-slate-800">
                    {st}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Page size selector */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-slate-500 text-[11px]">Rows:</span>
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>All</option>
            </select>
          </div>
        </div>

        {/* DATA TABLE CONTAINER */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead className="bg-slate-50/90 text-slate-600 font-semibold uppercase text-[10px] tracking-wider sticky top-0 z-10 border-b border-slate-200">
              <tr>
                <th 
                  onClick={() => handleSort('sn')}
                  className="px-4 py-3 cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>S/N</span>
                    {sortField === 'sn' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-600" /> : <ArrowDown className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('employeeCode')}
                  className="px-4 py-3 cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Staff Code</span>
                    {sortField === 'employeeCode' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-600" /> : <ArrowDown className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('fullName')}
                  className="px-4 py-3 cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Full Name</span>
                    {sortField === 'fullName' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-600" /> : <ArrowDown className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('location')}
                  className="px-4 py-3 cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Location</span>
                    {sortField === 'location' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-600" /> : <ArrowDown className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('status')}
                  className="px-4 py-3 cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Status / Funding</span>
                    {sortField === 'status' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-600" /> : <ArrowDown className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </th>
                <th className="px-4 py-3">Fidelity Insurance</th>
                <th 
                  onClick={() => handleSort('onboardedDate')}
                  className="px-4 py-3 cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Onboarded</span>
                    {sortField === 'onboardedDate' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-600" /> : <ArrowDown className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRecords.map((record, index) => {
                const isEven = index % 2 === 0;
                const isFunded = record.status?.toLowerCase().includes('funded');
                const isInsured = record.fidelityInsurance?.toLowerCase() === 'yes' || record.status?.toLowerCase().includes('insured');
                const hasCode = record.employeeCode && record.employeeCode !== 'TO BE ADDED';

                return (
                  <tr 
                    key={record.id || `${record.sn}-${record.fullName}`}
                    className={`transition-colors hover:bg-slate-50 group ${
                      isEven ? 'bg-white' : 'bg-slate-50/40'
                    }`}
                  >
                    {/* S/N */}
                    <td className="px-4 py-3 font-mono text-slate-400 font-medium w-12">
                      {record.sn}
                    </td>

                    {/* Employee Code */}
                    <td className="px-4 py-3 font-mono font-bold">
                      {hasCode ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-900">{record.employeeCode}</span>
                          <button
                            onClick={() => handleCopy(record.employeeCode || '', `code-${record.sn}`)}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-700 transition-opacity"
                            title="Copy code"
                          >
                            {copiedId === `code-${record.sn}` ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-medium">
                          Pending Code
                        </span>
                      )}
                    </td>

                    {/* Full Name & Contacts */}
                    <td className="px-4 py-3 font-medium">
                      <div className="text-slate-900 font-semibold flex items-center gap-1.5">
                        <span>{record.fullName}</span>
                        {record.vsrType === 'ASST. VSR' && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-bold border border-amber-200">
                            ASST
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5 font-mono">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {record.phone}
                        </span>
                        {record.email && (
                          <span className="flex items-center gap-1 truncate max-w-[160px]">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {record.email}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-slate-700 font-medium">
                        <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{record.location}</span>
                      </div>
                    </td>

                    {/* Status / Funding */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        isFunded 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : record.status?.includes('Awaiting')
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {record.status || record.workforceStatus}
                      </span>
                      {record.dateFunded && (
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Funded: {record.dateFunded}
                        </div>
                      )}
                    </td>

                    {/* Fidelity Insurance */}
                    <td className="px-4 py-3">
                      {isInsured ? (
                        <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>Covered</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <span className="w-2 h-2 rounded-full bg-slate-300" />
                          <span>Not Covered</span>
                        </div>
                      )}
                    </td>

                    {/* Onboarded Date */}
                    <td className="px-4 py-3 font-mono text-slate-600">
                      {record.onboardedDate || 'Pending'}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          setInspectRecord(record);
                          handleSelect?.(record);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-emerald-700 border border-slate-200 text-[11px] font-semibold transition-colors inline-flex items-center gap-1"
                      >
                        <span>Inspect</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {paginatedRecords.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500 text-xs">
                    No staff records match the current filter or search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* MODAL FOOTER WITH PAGINATION */}
        <div className="px-6 py-3 bg-slate-50/70 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <strong className="text-slate-800">{sortedRecords.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> to{' '}
            <strong className="text-slate-800">{Math.min(currentPage * pageSize, sortedRecords.length)}</strong> of{' '}
            <strong className="text-slate-800">{sortedRecords.length}</strong> records
          </div>

          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors shadow-sm"
            >
              Previous
            </button>
            <span className="px-3 py-1 font-mono text-slate-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors shadow-sm"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* RECORD INSPECTOR DRAWER */}
      {inspectRecord && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-bold text-base text-slate-900">
                  {inspectRecord.fullName}
                </h4>
                <div className="text-xs text-emerald-700 font-mono mt-0.5">
                  Code: {inspectRecord.employeeCode || 'PENDING'} • {inspectRecord.location}
                </div>
              </div>
              <button
                onClick={() => setInspectRecord(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Staff Role</span>
                <span className="text-slate-900 font-bold">{inspectRecord.vsrType || 'VSR'}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Workforce Status</span>
                <span className="text-emerald-700 font-bold">{inspectRecord.workforceStatus}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Funding Status</span>
                <span className="text-slate-900 font-bold">{inspectRecord.status || 'N/A'}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Insurance Coverage</span>
                <span className="text-emerald-700 font-bold">{inspectRecord.fidelityInsurance || 'Yes'}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 col-span-2">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Phone & Email</span>
                <span className="text-slate-900 font-mono block font-medium">{inspectRecord.phone}</span>
                <span className="text-slate-600 font-mono text-[11px] block">{inspectRecord.email || 'N/A'}</span>
              </div>
              {(inspectRecord.notes || inspectRecord.reasonNotes) && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 col-span-2">
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Operational Notes / Reason</span>
                  <span className="text-amber-800 font-medium block mt-0.5">
                    {inspectRecord.notes || inspectRecord.reasonNotes}
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setInspectRecord(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
