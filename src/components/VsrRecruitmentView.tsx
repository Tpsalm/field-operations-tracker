import React, { useState, useMemo } from 'react';
import {
  VsrCandidate,
  RecruitmentStage,
  INITIAL_RECRUITMENT_CANDIDATES,
  RECRUITMENT_STAGES_CONFIG
} from '../data/recruitmentData';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronRight,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  Award,
  FileText,
  X,
  ArrowRight,
  UserCheck,
  UserX,
  Sparkles,
  BarChart3,
  Kanban,
  Table as TableIcon
} from 'lucide-react';

interface VsrRecruitmentViewProps {
  onNavigateBack?: () => void;
  onSelectCandidateToDeploy?: (candidate: VsrCandidate) => void;
}

export const VsrRecruitmentView: React.FC<VsrRecruitmentViewProps> = ({
  onNavigateBack
}) => {
  const [candidates, setCandidates] = useState<VsrCandidate[]>(INITIAL_RECRUITMENT_CANDIDATES);
  const [activeViewTab, setActiveViewTab] = useState<'kanban' | 'table' | 'quotas'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHub, setSelectedHub] = useState<string>('All');
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('All');

  // Selected candidate modal
  const [selectedCandidate, setSelectedCandidate] = useState<VsrCandidate | null>(null);

  // New applicant modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newApplicant, setNewApplicant] = useState({
    fullName: '',
    email: '',
    phone: '',
    hub: 'Lagos' as 'Lagos' | 'Ibadan' | 'Ogun' | 'Benin' | 'Enugu',
    targetStore: '',
    role: 'VSR' as 'VSR' | 'Assistant VSR' | 'Retail Merchandiser',
    sourceChannel: 'Online Job Board' as const,
    experienceYears: 2,
    highestEducation: 'HND' as const,
    guarantor1Name: '',
    guarantor1Phone: '',
    guarantor1Profession: '',
    guarantor2Name: '',
    guarantor2Phone: '',
    guarantor2Profession: '',
    notes: ''
  });

  // Note text input inside candidate detail modal
  const [newNoteText, setNewNoteText] = useState('');

  // Filtered candidate list
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      // Hub filter
      if (selectedHub !== 'All' && c.hub !== selectedHub) return false;
      // Role filter
      if (selectedRole !== 'All' && c.role !== selectedRole) return false;
      // Stage filter
      if (selectedStageFilter !== 'All' && c.stage !== selectedStageFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = c.fullName.toLowerCase().includes(q);
        const matchNumber = c.applicantNumber.toLowerCase().includes(q);
        const matchPhone = c.phone.includes(q);
        const matchEmail = c.email.toLowerCase().includes(q);
        const matchStore = c.targetStore.toLowerCase().includes(q);
        const matchHub = c.hub.toLowerCase().includes(q);
        return matchName || matchNumber || matchPhone || matchEmail || matchStore || matchHub;
      }

      return true;
    });
  }, [candidates, selectedHub, selectedRole, selectedStageFilter, searchQuery]);

  // Aggregate Funnel Metrics
  const totalCount = candidates.length;
  const inAssessmentCount = candidates.filter((c) => c.stage === 'interview' || c.stage === 'screening').length;
  const inKycCount = candidates.filter((c) => c.stage === 'kyc_guarantors' || c.stage === 'risk_clearance').length;
  const selectedCount = candidates.filter((c) => c.stage === 'selected').length;
  const rejectedCount = candidates.filter((c) => c.stage === 'rejected').length;
  const selectionRate = totalCount > 0 ? Math.round((selectedCount / totalCount) * 100) : 0;

  // Move candidate to another stage
  const handleMoveStage = (candidateId: string, newStage: RecruitmentStage) => {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id === candidateId) {
          const stageConfig = RECRUITMENT_STAGES_CONFIG.find((s) => s.id === newStage);
          const newLog = {
            id: `act-${Date.now()}`,
            action: `Moved to ${stageConfig?.label || newStage}`,
            timestamp: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            performedBy: 'Hiring Manager',
            notes: `Status updated in recruitment dashboard.`
          };
          return {
            ...c,
            stage: newStage,
            activityLog: [newLog, ...c.activityLog]
          };
        }
        return c;
      })
    );

    if (selectedCandidate && selectedCandidate.id === candidateId) {
      const stageConfig = RECRUITMENT_STAGES_CONFIG.find((s) => s.id === newStage);
      const newLog = {
        id: `act-${Date.now()}`,
        action: `Moved to ${stageConfig?.label || newStage}`,
        timestamp: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        performedBy: 'Hiring Manager',
        notes: `Status updated in recruitment dashboard.`
      };
      setSelectedCandidate({
        ...selectedCandidate,
        stage: newStage,
        activityLog: [newLog, ...selectedCandidate.activityLog]
      });
    }
  };

  // Toggle guarantor verification status
  const handleToggleGuarantor = (candidateId: string, guarantorNum: 1 | 2) => {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id === candidateId) {
          const updatedG1 = guarantorNum === 1 ? { ...c.guarantor1, verified: !c.guarantor1.verified } : c.guarantor1;
          const updatedG2 = guarantorNum === 2 ? { ...c.guarantor2, verified: !c.guarantor2.verified } : c.guarantor2;
          const statusText = guarantorNum === 1 ? (!c.guarantor1.verified ? 'Verified' : 'Unverified') : (!c.guarantor2.verified ? 'Verified' : 'Unverified');
          const newLog = {
            id: `act-${Date.now()}`,
            action: `Guarantor ${guarantorNum} marked ${statusText}`,
            timestamp: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            performedBy: 'Verification Officer',
            notes: `Telephone and physical reference check updated.`
          };
          return {
            ...c,
            guarantor1: updatedG1,
            guarantor2: updatedG2,
            activityLog: [newLog, ...c.activityLog]
          };
        }
        return c;
      })
    );

    if (selectedCandidate && selectedCandidate.id === candidateId) {
      const updatedG1 = guarantorNum === 1 ? { ...selectedCandidate.guarantor1, verified: !selectedCandidate.guarantor1.verified } : selectedCandidate.guarantor1;
      const updatedG2 = guarantorNum === 2 ? { ...selectedCandidate.guarantor2, verified: !selectedCandidate.guarantor2.verified } : selectedCandidate.guarantor2;
      const statusText = guarantorNum === 1 ? (!selectedCandidate.guarantor1.verified ? 'Verified' : 'Unverified') : (!selectedCandidate.guarantor2.verified ? 'Verified' : 'Unverified');
      const newLog = {
        id: `act-${Date.now()}`,
        action: `Guarantor ${guarantorNum} marked ${statusText}`,
        timestamp: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        performedBy: 'Verification Officer',
        notes: `Telephone and physical reference check updated.`
      };
      setSelectedCandidate({
        ...selectedCandidate,
        guarantor1: updatedG1,
        guarantor2: updatedG2,
        activityLog: [newLog, ...selectedCandidate.activityLog]
      });
    }
  };

  // Add note to candidate
  const handleAddNote = () => {
    if (!newNoteText.trim() || !selectedCandidate) return;

    const newLog = {
      id: `act-${Date.now()}`,
      action: 'Recruiter Note Added',
      timestamp: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      performedBy: 'Super Admin',
      notes: newNoteText.trim()
    };

    setCandidates((prev) =>
      prev.map((c) => (c.id === selectedCandidate.id ? { ...c, activityLog: [newLog, ...c.activityLog] } : c))
    );
    setSelectedCandidate({
      ...selectedCandidate,
      activityLog: [newLog, ...selectedCandidate.activityLog]
    });
    setNewNoteText('');
  };

  // Create new applicant
  const handleCreateApplicant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApplicant.fullName || !newApplicant.phone) return;

    const count = candidates.length + 1;
    const applicantNumber = `REC-${newApplicant.hub.substring(0, 3).toUpperCase()}-${String(count).padStart(3, '0')}`;

    const created: VsrCandidate = {
      id: `cand-${Date.now()}`,
      applicantNumber,
      fullName: newApplicant.fullName,
      email: newApplicant.email || `${newApplicant.fullName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      phone: newApplicant.phone,
      hub: newApplicant.hub,
      targetStore: newApplicant.targetStore || 'General Branch Deployment',
      role: newApplicant.role,
      stage: 'sourced',
      appliedDate: 'Today',
      sourceChannel: newApplicant.sourceChannel,
      experienceYears: newApplicant.experienceYears,
      highestEducation: newApplicant.highestEducation,
      pitchScore: 0,
      mathScore: 0,
      communicationScore: 0,
      overallScore: 0,
      evaluatorNotes: newApplicant.notes || 'Newly registered applicant awaiting initial review.',
      guarantor1: {
        name: newApplicant.guarantor1Name || 'Guarantor 1 (Pending Submission)',
        phone: newApplicant.guarantor1Phone || '',
        profession: newApplicant.guarantor1Profession || 'Civil Servant / Business Owner',
        company: 'Local Business',
        verified: false
      },
      guarantor2: {
        name: newApplicant.guarantor2Name || 'Guarantor 2 (Pending Submission)',
        phone: newApplicant.guarantor2Phone || '',
        profession: newApplicant.guarantor2Profession || 'Clergy / Verified Professional',
        company: 'Community Organization',
        verified: false
      },
      hasPension: false,
      riskVettingStatus: 'Pending',
      fidelityEligible: false,
      activityLog: [
        {
          id: `act-${Date.now()}`,
          action: 'Candidate Registered in System',
          timestamp: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          performedBy: 'Hiring Admin',
          notes: 'Registered via hiring form'
        }
      ]
    };

    setCandidates([created, ...candidates]);
    setIsAddModalOpen(false);
    setSelectedCandidate(created);
    setNewApplicant({
      fullName: '',
      email: '',
      phone: '',
      hub: 'Lagos',
      targetStore: '',
      role: 'VSR',
      sourceChannel: 'Online Job Board',
      experienceYears: 2,
      highestEducation: 'HND',
      guarantor1Name: '',
      guarantor1Phone: '',
      guarantor1Profession: '',
      guarantor2Name: '',
      guarantor2Phone: '',
      guarantor2Profession: '',
      notes: ''
    });
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Applicant ID',
      'Full Name',
      'Hub',
      'Target Store',
      'Role',
      'Stage',
      'Applied Date',
      'Phone',
      'Email',
      'Pitch Score',
      'Math Score',
      'Comm Score',
      'Overall %',
      'Guarantor 1 Name',
      'Guarantor 1 Verified',
      'Guarantor 2 Name',
      'Guarantor 2 Verified',
      'Risk Status',
      'Pension',
      'Evaluator Remarks'
    ];

    const rows = candidates.map((c) => [
      c.applicantNumber,
      `"${c.fullName}"`,
      c.hub,
      `"${c.targetStore}"`,
      c.role,
      c.stage,
      c.appliedDate,
      `"${c.phone}"`,
      `"${c.email}"`,
      c.pitchScore,
      c.mathScore,
      c.communicationScore,
      `${c.overallScore}%`,
      `"${c.guarantor1.name}"`,
      c.guarantor1.verified ? 'YES' : 'NO',
      `"${c.guarantor2.name}"`,
      c.guarantor2.verified ? 'YES' : 'NO',
      c.riskVettingStatus,
      c.hasPension ? 'YES' : 'NO',
      `"${c.evaluatorNotes.replace(/"/g, '""')}"`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `KEA_Hiring_Applicants_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner & Title Bar */}
      <div className="bg-white rounded-[12px] border border-slate-200/80 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                Staff Recruitment
              </span>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200">
                Job Applicants Pipeline
              </span>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                Guarantor &amp; Store Matching
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>Hiring &amp; Job Applicants</span>
              <Users className="w-6 h-6 text-emerald-600" />
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
              Manage field sales recruitment — review candidate applications, score sales pitch tests, verify references, and approve staff for store deployment.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onNavigateBack && (
              <button
                onClick={onNavigateBack}
                className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-200 transition-colors"
              >
                Back to Dashboard
              </button>
            )}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-[#10b981] hover:bg-emerald-600 text-xs font-bold text-white flex items-center gap-1.5 shadow-sm transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Add New Candidate</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 border border-slate-200 flex items-center gap-1.5 shadow-xs transition-all"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Download Roster (CSV)</span>
            </button>
          </div>
        </div>

        {/* Top Funnel KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-5 pt-5 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">
              Total Applicants
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-slate-900 font-mono">{totalCount}</span>
              <span className="text-[10px] text-slate-500 font-mono">In System</span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-amber-700 block tracking-wider">
              Interview / Test
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-amber-600 font-mono">{inAssessmentCount}</span>
              <span className="text-[10px] text-amber-600/80 font-mono">Testing</span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-purple-700 block tracking-wider">
              Reference Check
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-purple-600 font-mono">{inKycCount}</span>
              <span className="text-[10px] text-purple-600/80 font-mono">Vetting</span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-emerald-700 block tracking-wider">
              Ready to Hire
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-emerald-600 font-mono">{selectedCount}</span>
              <span className="text-[10px] text-emerald-600 font-mono">Approved</span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-sky-700 block tracking-wider">
              Pass Rate
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-sky-600 font-mono">{selectionRate}%</span>
              <span className="text-[10px] text-sky-600/80 font-mono">Selected</span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-rose-700 block tracking-wider">
              Disqualified
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-rose-600 font-mono">{rejectedCount}</span>
              <span className="text-[10px] text-rose-600/80 font-mono">Rejected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar: Search, Filters & View Mode Tabs */}
      <div className="bg-white rounded-[12px] border border-slate-200/80 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
        {/* Search & Select Filters */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Box */}
          <div className="relative min-w-[220px] flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidate, code, phone, store..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Hub Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Branch:</span>
            <select
              value={selectedHub}
              onChange={(e) => setSelectedHub(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Branches</option>
              <option value="Lagos">Lagos Cluster</option>
              <option value="Ibadan">Ibadan Hub</option>
              <option value="Ogun">Ogun (Abeokuta)</option>
              <option value="Benin">Benin City</option>
              <option value="Enugu">Enugu Hub</option>
            </select>
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Role:</span>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Roles</option>
              <option value="VSR">Van Sales Representative (VSR)</option>
              <option value="Assistant VSR">Assistant VSR</option>
            </select>
          </div>

          {/* Stage Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Stage:</span>
            <select
              value={selectedStageFilter}
              onChange={(e) => setSelectedStageFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Stages</option>
              <option value="sourced">1. Sourced</option>
              <option value="screening">2. Screening</option>
              <option value="interview">3. Pitch / Exam</option>
              <option value="kyc_guarantors">4. Guarantors</option>
              <option value="risk_clearance">5. Risk Clearance</option>
              <option value="selected">6. Ready to Hire</option>
              <option value="rejected">Disqualified</option>
            </select>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0">
          <button
            onClick={() => setActiveViewTab('kanban')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeViewTab === 'kanban'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Kanban className="w-3.5 h-3.5 text-slate-600" />
            <span>Pipeline Board</span>
          </button>
          <button
            onClick={() => setActiveViewTab('table')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeViewTab === 'table'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5 text-slate-600" />
            <span>Table View</span>
          </button>
          <button
            onClick={() => setActiveViewTab('quotas')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeViewTab === 'quotas'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-slate-600" />
            <span>Branch Targets</span>
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: KANBAN PIPELINE BOARD */}
      {activeViewTab === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
          {RECRUITMENT_STAGES_CONFIG.map((stage) => {
            const stageCandidates = filteredCandidates.filter((c) => c.stage === stage.id);

            return (
              <div
                key={stage.id}
                className="bg-slate-50 border border-slate-200/80 rounded-[12px] flex flex-col h-full min-h-[500px] shadow-[0_2px_8px_rgba(0,0,0,0.03)]"
              >
                {/* Stage Header */}
                <div className="p-3.5 border-b border-slate-200 bg-white rounded-t-[12px]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      {stage.shortLabel}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {stageCandidates.length}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {stage.description}
                  </p>
                </div>

                {/* Candidate Cards List */}
                <div className="p-2.5 space-y-2.5 flex-1 overflow-y-auto max-h-[700px]">
                  {stageCandidates.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400 italic">
                      No candidates in this stage
                    </div>
                  ) : (
                    stageCandidates.map((c) => {
                      const bothGuarantorsVerified = c.guarantor1.verified && c.guarantor2.verified;

                      return (
                        <div
                          key={c.id}
                          className="bg-white hover:border-emerald-400 border border-slate-200 rounded-xl p-3 transition-all cursor-pointer shadow-xs group"
                          onClick={() => setSelectedCandidate(c)}
                        >
                          {/* Header pill: number & role */}
                          <div className="flex items-center justify-between gap-1.5 mb-1.5">
                            <span className="text-[10px] font-mono font-semibold text-slate-400">
                              {c.applicantNumber}
                            </span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              c.role === 'VSR' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                            }`}>
                              {c.role}
                            </span>
                          </div>

                          {/* Candidate Name */}
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-tight">
                            {c.fullName}
                          </h4>

                          {/* Hub & Target Store */}
                          <div className="flex items-center gap-1 text-[11px] text-slate-600 mt-1 font-medium">
                            <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{c.hub} • {c.targetStore}</span>
                          </div>

                          {/* Assessment Score & Guarantor Status Badges */}
                          <div className="flex items-center justify-between gap-2 mt-2.5 pt-2 border-t border-slate-100">
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-slate-400">Score:</span>
                              <span
                                className={`text-[11px] font-bold font-mono px-1.5 py-0.2 rounded ${
                                  c.overallScore >= 85
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : c.overallScore >= 70
                                    ? 'bg-amber-50 text-amber-700'
                                    : 'bg-rose-50 text-rose-700'
                                }`}
                              >
                                {c.overallScore > 0 ? `${c.overallScore}%` : 'Pending'}
                              </span>
                            </div>

                            {/* Dual Guarantor Quick Tag */}
                            <span
                              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-1 ${
                                bothGuarantorsVerified
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-500'
                              }`}
                              title={`G1: ${c.guarantor1.verified ? 'Verified' : 'Pending'} | G2: ${c.guarantor2.verified ? 'Verified' : 'Pending'}`}
                            >
                              <ShieldCheck className="w-3 h-3" />
                              <span>{bothGuarantorsVerified ? '2/2 KYC' : c.guarantor1.verified || c.guarantor2.verified ? '1/2 KYC' : '0/2 KYC'}</span>
                            </span>
                          </div>

                          {/* Advance stage quick bar */}
                          <div className="mt-2.5 flex items-center justify-between gap-1 text-[10px] text-slate-400 group-hover:text-slate-600">
                            <span>Applied: {c.appliedDate}</span>
                            <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                              <span>Inspect</span>
                              <ChevronRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE 2: CANDIDATE TABLE VIEW */}
      {activeViewTab === 'table' && (
        <div className="bg-white rounded-[12px] border border-slate-200/80 overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Applicant ID</th>
                  <th className="py-3 px-4">Candidate Full Name</th>
                  <th className="py-3 px-4">Branch Hub</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Target Store</th>
                  <th className="py-3 px-4 text-center">Sales Pitch</th>
                  <th className="py-3 px-4 text-center">Retail Math</th>
                  <th className="py-3 px-4 text-center">Score %</th>
                  <th className="py-3 px-4 text-center">References</th>
                  <th className="py-3 px-4">Status Stage</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCandidates.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-slate-400 italic">
                      No candidates match your search filters.
                    </td>
                  </tr>
                ) : (
                  filteredCandidates.map((c) => {
                    const stageConfig = RECRUITMENT_STAGES_CONFIG.find((s) => s.id === c.stage);
                    const bothGuarantors = c.guarantor1.verified && c.guarantor2.verified;

                    return (
                      <tr
                        key={c.id}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                        onClick={() => setSelectedCandidate(c)}
                      >
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                          {c.applicantNumber}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 hover:text-emerald-700 transition-colors">
                            {c.fullName}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>{c.phone}</span>
                            <span>•</span>
                            <span>{c.email}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-700">
                          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px]">
                            {c.hub}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              c.role === 'VSR'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {c.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-xs max-w-[200px] truncate">
                          {c.targetStore}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                          {c.pitchScore > 0 ? `${c.pitchScore}/10` : '—'}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                          {c.mathScore > 0 ? `${c.mathScore}/10` : '—'}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-black">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] ${
                              c.overallScore >= 85
                                ? 'bg-emerald-50 text-emerald-700'
                                : c.overallScore >= 70
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {c.overallScore > 0 ? `${c.overallScore}%` : 'Pending'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                              bothGuarantors
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : c.guarantor1.verified || c.guarantor2.verified
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}
                          >
                            <ShieldCheck className="w-3 h-3" />
                            <span>
                              {bothGuarantors ? '2/2 Verified' : c.guarantor1.verified || c.guarantor2.verified ? '1/2 Verified' : 'Unverified'}
                            </span>
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200">
                            {stageConfig?.shortLabel || c.stage}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCandidate(c);
                            }}
                            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-all"
                          >
                            Details ➔
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>Showing {filteredCandidates.length} of {candidates.length} candidates in database</span>
            <span className="font-mono text-slate-600">Updated across all branch stores</span>
          </div>
        </div>
      )}

      {/* VIEW MODE 3: HUB QUOTA & CAPACITY FILL VIEW */}
      {activeViewTab === 'quotas' && (
        <div className="space-y-6">
          <div className="bg-white rounded-[12px] border border-slate-200/80 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              <span>Branch Recruitment Targets &amp; Store Allocations</span>
            </h3>
            <p className="text-xs text-slate-500 max-w-3xl mb-6 leading-relaxed">
              Track open retail hiring targets per Nigerian branch. Match candidates to specific retail chains (Shoprite, Justrite, Prince Ebeano, SPAR, Hubmart, Market Square).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  hub: 'Lagos Cluster',
                  target: 15,
                  deployed: 2,
                  inPipeline: candidates.filter((c) => c.hub === 'Lagos').length,
                  stores: ['SPAR Victoria Island', 'Shoprite Ikeja City Mall', 'Prince Ebeano Lekki', 'Hubmart VI']
                },
                {
                  hub: 'Ibadan Regional Hub',
                  target: 6,
                  deployed: 1,
                  inPipeline: candidates.filter((c) => c.hub === 'Ibadan').length,
                  stores: ['Justrite Dugbe & Challenge', 'Foodco Ring Road', 'Bodija Trade Corridor']
                },
                {
                  hub: 'Ogun Territory',
                  target: 5,
                  deployed: 0,
                  inPipeline: candidates.filter((c) => c.hub === 'Ogun').length,
                  stores: ['Justrite Abeokuta', 'Sagamu Expressway Depot', 'Ijebu Ode Central']
                },
                {
                  hub: 'Benin City Hub',
                  target: 4,
                  deployed: 0,
                  inPipeline: candidates.filter((c) => c.hub === 'Benin').length,
                  stores: ['Market Square Sapele Road', 'Ekenwan Trade Hub']
                },
                {
                  hub: 'Enugu Cluster',
                  target: 3,
                  deployed: 0,
                  inPipeline: candidates.filter((c) => c.hub === 'Enugu').length,
                  stores: ['Polo Park Mall Enugu', 'Ogui Road Commercial Depot']
                }
              ].map((q) => {
                const fillPct = Math.round(((q.deployed + q.inPipeline) / q.target) * 100);

                return (
                  <div
                    key={q.hub}
                    className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-bold text-slate-900">{q.hub}</h4>
                        <span className="text-xs font-mono font-bold text-slate-600">
                          {q.deployed + q.inPipeline} / {q.target} Target
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden mb-3">
                        <div
                          className="bg-emerald-500 h-2.5 rounded-full"
                          style={{ width: `${Math.min(100, fillPct)}%` }}
                        ></div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 mb-4 font-mono">
                        <span>Hired: {q.deployed}</span>
                        <span>In Pipeline: {q.inPipeline}</span>
                        <span className="text-emerald-700 font-bold">{fillPct}% Filled</span>
                      </div>

                      <div className="text-[11px] text-slate-700 font-semibold mb-1">
                        Assigned Store Corridors:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {q.stores.map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded bg-white text-slate-600 text-[10px] border border-slate-200"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedHub(q.hub.split(' ')[0]);
                        setActiveViewTab('kanban');
                      }}
                      className="mt-4 w-full py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200 transition-colors"
                    >
                      Filter Candidates for {q.hub.split(' ')[0]} ➔
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* CANDIDATE DETAIL & ASSESSMENT DOSSIER MODAL */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-[16px] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-slate-50 p-5 border-b border-slate-200 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {selectedCandidate.applicantNumber}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                    {selectedCandidate.role}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                    {selectedCandidate.hub} Hub
                  </span>
                </div>
                <h2 className="text-xl font-black text-slate-900">{selectedCandidate.fullName}</h2>
                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                  <span>Target Store: <strong className="text-slate-800">{selectedCandidate.targetStore}</strong></span>
                  <span>•</span>
                  <span>Applied on {selectedCandidate.appliedDate}</span>
                </p>
              </div>

              <button
                onClick={() => setSelectedCandidate(null)}
                className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* STAGE ADVANCEMENT STRIP */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                  <span>Change Hiring Stage</span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    Current: <strong className="text-emerald-700">{RECRUITMENT_STAGES_CONFIG.find((s) => s.id === selectedCandidate.stage)?.label}</strong>
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {RECRUITMENT_STAGES_CONFIG.map((stage) => {
                    const isCurrent = selectedCandidate.stage === stage.id;
                    return (
                      <button
                        key={stage.id}
                        onClick={() => handleMoveStage(selectedCandidate.id, stage.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          isCurrent
                            ? 'bg-[#10b981] text-white font-bold shadow-xs'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {isCurrent && <CheckCircle2 className="w-3.5 h-3.5" />}
                        <span>{stage.shortLabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* THREE COLUMN DETAILS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. SELECTION ASSESSMENT & EXAM SCORES */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>Interview &amp; Exam Score</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Sales Pitch Test:</span>
                      <span className="font-mono font-bold text-slate-900">{selectedCandidate.pitchScore} / 10</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Retail Math:</span>
                      <span className="font-mono font-bold text-slate-900">{selectedCandidate.mathScore} / 10</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Communication:</span>
                      <span className="font-mono font-bold text-slate-900">{selectedCandidate.communicationScore} / 10</span>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">Overall Score:</span>
                      <span
                        className={`text-sm font-black font-mono px-2 py-0.5 rounded ${
                          selectedCandidate.overallScore >= 85
                            ? 'bg-emerald-50 text-emerald-700'
                            : selectedCandidate.overallScore >= 70
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {selectedCandidate.overallScore}%
                      </span>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-2.5 border border-slate-200 text-[11px] text-slate-600">
                    <span className="font-bold text-slate-800 block mb-0.5">Interviewer Notes:</span>
                    {selectedCandidate.evaluatorNotes}
                  </div>
                </div>

                {/* 2. DUAL GUARANTOR KYC DOSSIER */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>Guarantor References</span>
                  </div>

                  {/* Guarantor 1 */}
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs space-y-1 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">1. {selectedCandidate.guarantor1.name}</span>
                      <button
                        onClick={() => handleToggleGuarantor(selectedCandidate.id, 1)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          selectedCandidate.guarantor1.verified
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {selectedCandidate.guarantor1.verified ? 'Verified ✓' : 'Unverified ✗'}
                      </button>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {selectedCandidate.guarantor1.profession} • {selectedCandidate.guarantor1.company}
                    </div>
                    <div className="text-[11px] font-mono text-slate-700">
                      {selectedCandidate.guarantor1.phone || 'No phone provided'}
                    </div>
                  </div>

                  {/* Guarantor 2 */}
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs space-y-1 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">2. {selectedCandidate.guarantor2.name}</span>
                      <button
                        onClick={() => handleToggleGuarantor(selectedCandidate.id, 2)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          selectedCandidate.guarantor2.verified
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {selectedCandidate.guarantor2.verified ? 'Verified ✓' : 'Unverified ✗'}
                      </button>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {selectedCandidate.guarantor2.profession} • {selectedCandidate.guarantor2.company}
                    </div>
                    <div className="text-[11px] font-mono text-slate-700">
                      {selectedCandidate.guarantor2.phone || 'No phone provided'}
                    </div>
                  </div>
                </div>

                {/* 3. COMPLIANCE, PENSION & RISK CLEARANCE */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
                    <FileText className="w-4 h-4 text-sky-600" />
                    <span>Compliance &amp; Details</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Background Check:</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          selectedCandidate.riskVettingStatus === 'Cleared'
                            ? 'bg-emerald-50 text-emerald-700'
                            : selectedCandidate.riskVettingStatus === 'Under Review'
                            ? 'bg-amber-50 text-amber-700'
                            : selectedCandidate.riskVettingStatus === 'Flagged'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {selectedCandidate.riskVettingStatus}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Fidelity Bond:</span>
                      <span className="font-semibold text-slate-800">
                        {selectedCandidate.fidelityEligible ? 'Pre-Approved' : 'Pending'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Pension RSA:</span>
                      <span className="font-semibold text-slate-800">
                        {selectedCandidate.hasPension ? selectedCandidate.pensionPfa || 'Active RSA' : 'To Register'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Education:</span>
                      <span className="font-semibold text-slate-800">
                        {selectedCandidate.highestEducation} ({selectedCandidate.experienceYears} yrs exp)
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Source:</span>
                      <span className="font-semibold text-slate-700">
                        {selectedCandidate.sourceChannel}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RECRUITMENT AUDIT TRAIL / ACTIVITY LOG */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Activity History &amp; Interview Log
                </h4>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {selectedCandidate.activityLog.map((log) => (
                    <div
                      key={log.id}
                      className="bg-white border border-slate-200 rounded-lg p-2.5 text-xs flex items-start justify-between gap-3 shadow-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-800 flex items-center gap-2">
                          <span>{log.action}</span>
                          <span className="text-[10px] text-slate-400 font-mono">by {log.performedBy}</span>
                        </div>
                        {log.notes && <p className="text-[11px] text-slate-500 mt-0.5">{log.notes}</p>}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">{log.timestamp}</span>
                    </div>
                  ))}
                </div>

                {/* Add new note input */}
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    placeholder="Add recruiter interview note or observation..."
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={handleAddNote}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition-colors shrink-0"
                  >
                    Add Note
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Mail className="w-3.5 h-3.5" />
                <span>{selectedCandidate.email}</span>
                <span>•</span>
                <Phone className="w-3.5 h-3.5" />
                <span>{selectedCandidate.phone}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleMoveStage(selectedCandidate.id, 'rejected')}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all"
                >
                  Disqualify Candidate
                </button>
                <button
                  onClick={() => handleMoveStage(selectedCandidate.id, 'selected')}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm"
                >
                  Approve for Store Deployment ✓
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RECRUIT NEW VSR / APPLICANT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-[16px] w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden">
            <div className="bg-slate-50 p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-emerald-600" />
                  <span>Add New Job Candidate</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter candidate details into the hiring pipeline.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateApplicant} className="p-6 space-y-4 overflow-y-auto max-h-[80vh]">
              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Candidate Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Babatunde Olumide"
                    value={newApplicant.fullName}
                    onChange={(e) => setNewApplicant({ ...newApplicant, fullName: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +234 803 123 4567"
                    value={newApplicant.phone}
                    onChange={(e) => setNewApplicant({ ...newApplicant, phone: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Email & Hub */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. b.olumide@gmail.com"
                    value={newApplicant.email}
                    onChange={(e) => setNewApplicant({ ...newApplicant, email: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Branch Hub
                  </label>
                  <select
                    value={newApplicant.hub}
                    onChange={(e) => setNewApplicant({ ...newApplicant, hub: e.target.value as any })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Lagos">Lagos Cluster</option>
                    <option value="Ibadan">Ibadan Hub</option>
                    <option value="Ogun">Ogun (Abeokuta)</option>
                    <option value="Benin">Benin City</option>
                    <option value="Enugu">Enugu Hub</option>
                  </select>
                </div>
              </div>

              {/* Role & Target Store */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Role
                  </label>
                  <select
                    value={newApplicant.role}
                    onChange={(e) => setNewApplicant({ ...newApplicant, role: e.target.value as any })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="VSR">Van Sales Representative (VSR)</option>
                    <option value="Assistant VSR">Assistant VSR</option>
                    <option value="Retail Merchandiser">Retail Merchandiser</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Target Store Corridor
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SPAR Victoria Island, Justrite Dugbe"
                    value={newApplicant.targetStore}
                    onChange={(e) => setNewApplicant({ ...newApplicant, targetStore: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Guarantor 1 & 2 */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Initial Guarantor References
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Guarantor 1 Full Name"
                    value={newApplicant.guarantor1Name}
                    onChange={(e) => setNewApplicant({ ...newApplicant, guarantor1Name: e.target.value })}
                    className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="text"
                    placeholder="Guarantor 1 Phone"
                    value={newApplicant.guarantor1Phone}
                    onChange={(e) => setNewApplicant({ ...newApplicant, guarantor1Phone: e.target.value })}
                    className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="text"
                    placeholder="Profession / Org"
                    value={newApplicant.guarantor1Profession}
                    onChange={(e) => setNewApplicant({ ...newApplicant, guarantor1Profession: e.target.value })}
                    className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Guarantor 2 Full Name"
                    value={newApplicant.guarantor2Name}
                    onChange={(e) => setNewApplicant({ ...newApplicant, guarantor2Name: e.target.value })}
                    className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="text"
                    placeholder="Guarantor 2 Phone"
                    value={newApplicant.guarantor2Phone}
                    onChange={(e) => setNewApplicant({ ...newApplicant, guarantor2Phone: e.target.value })}
                    className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="text"
                    placeholder="Profession / Org"
                    value={newApplicant.guarantor2Profession}
                    onChange={(e) => setNewApplicant({ ...newApplicant, guarantor2Profession: e.target.value })}
                    className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Interview Remarks / Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Notes from initial screening or referral source..."
                  value={newApplicant.notes}
                  onChange={(e) => setNewApplicant({ ...newApplicant, notes: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                ></textarea>
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#10b981] hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-sm"
                >
                  Save Applicant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
