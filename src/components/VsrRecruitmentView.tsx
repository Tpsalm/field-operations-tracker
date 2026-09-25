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

  // KPIs
  const totalCount = candidates.length;
  const inAssessmentCount = candidates.filter((c) => c.stage === 'interview' || c.stage === 'screening').length;
  const inKycCount = candidates.filter((c) => c.stage === 'kyc_guarantors' || c.stage === 'risk_clearance').length;
  const selectedCount = candidates.filter((c) => c.stage === 'selected').length;
  const rejectedCount = candidates.filter((c) => c.stage === 'rejected').length;
  const selectionRate = totalCount > 0 ? Math.round((selectedCount / totalCount) * 100) : 0;

  // Handle stage change
  const handleMoveStage = (candidateId: string, newStage: RecruitmentStage) => {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id === candidateId) {
          const stageConfig = RECRUITMENT_STAGES_CONFIG.find((s) => s.id === newStage);
          const updatedLogs = [
            ...c.activityLog,
            {
              id: `act-${Date.now()}`,
              action: `Stage updated to: ${stageConfig?.shortLabel || newStage}`,
              timestamp: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
              performedBy: 'Talent Acquisition Team',
              notes: newStage === 'selected' ? 'Pre-allocated to store corridor' : undefined
            }
          ];
          return {
            ...c,
            stage: newStage,
            activityLog: updatedLogs
          };
        }
        return c;
      })
    );

    if (selectedCandidate && selectedCandidate.id === candidateId) {
      setSelectedCandidate((prev) => (prev ? { ...prev, stage: newStage } : null));
    }
  };

  // Toggle guarantor verification
  const handleToggleGuarantor = (candidateId: string, guarantorNumber: 1 | 2) => {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id === candidateId) {
          const updatedG1 = guarantorNumber === 1 ? { ...c.guarantor1, verified: !c.guarantor1.verified } : c.guarantor1;
          const updatedG2 = guarantorNumber === 2 ? { ...c.guarantor2, verified: !c.guarantor2.verified } : c.guarantor2;
          return {
            ...c,
            guarantor1: updatedG1,
            guarantor2: updatedG2
          };
        }
        return c;
      })
    );

    if (selectedCandidate && selectedCandidate.id === candidateId) {
      setSelectedCandidate((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          guarantor1: guarantorNumber === 1 ? { ...prev.guarantor1, verified: !prev.guarantor1.verified } : prev.guarantor1,
          guarantor2: guarantorNumber === 2 ? { ...prev.guarantor2, verified: !prev.guarantor2.verified } : prev.guarantor2
        };
      });
    }
  };

  // Add note to candidate
  const handleAddNote = () => {
    if (!selectedCandidate || !newNoteText.trim()) return;

    const newLogItem = {
      id: `act-${Date.now()}`,
      action: 'Recruiter Assessment Note',
      timestamp: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      performedBy: 'Lead Recruiter',
      notes: newNoteText.trim()
    };

    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id === selectedCandidate.id) {
          return {
            ...c,
            activityLog: [...c.activityLog, newLogItem]
          };
        }
        return c;
      })
    );

    setSelectedCandidate((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        activityLog: [...prev.activityLog, newLogItem]
      };
    });

    setNewNoteText('');
  };

  // Handle add applicant
  const handleCreateApplicant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApplicant.fullName.trim() || !newApplicant.phone.trim()) return;

    const newId = `cand-${Date.now().toString().slice(-4)}`;
    const nextNum = candidates.length + 42;
    const applicantNumber = `KEA-REC-2026-0${nextNum}`;

    const created: VsrCandidate = {
      id: newId,
      applicantNumber,
      fullName: newApplicant.fullName.trim(),
      email: newApplicant.email.trim() || `${newApplicant.fullName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      phone: newApplicant.phone.trim(),
      hub: newApplicant.hub,
      targetStore: newApplicant.targetStore.trim() || `${newApplicant.hub} Primary Retail Store`,
      role: newApplicant.role,
      stage: 'sourced',
      appliedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      sourceChannel: newApplicant.sourceChannel,
      experienceYears: Number(newApplicant.experienceYears) || 1,
      highestEducation: newApplicant.highestEducation,
      pitchScore: 7,
      mathScore: 7,
      communicationScore: 7,
      overallScore: 70,
      evaluatorNotes: newApplicant.notes.trim() || 'New applicant added into pipeline. Pending initial screening.',
      guarantor1: {
        name: newApplicant.guarantor1Name.trim() || 'Pending Submission',
        relationship: 'Primary Guarantor',
        phone: newApplicant.guarantor1Phone.trim(),
        profession: newApplicant.guarantor1Profession.trim() || 'Civil Servant / Business',
        company: 'Private / Public Sector',
        verified: false
      },
      guarantor2: {
        name: newApplicant.guarantor2Name.trim() || 'Pending Submission',
        relationship: 'Secondary Guarantor',
        phone: newApplicant.guarantor2Phone.trim(),
        profession: newApplicant.guarantor2Profession.trim() || 'Corporate Employee',
        company: 'Private Sector',
        verified: false
      },
      hasPension: false,
      riskVettingStatus: 'Pending',
      fidelityEligible: false,
      activityLog: [
        {
          id: `act-${Date.now()}`,
          action: 'Candidate Registered in Pipeline',
          timestamp: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          performedBy: 'Fatima Sanusi (Talent Acquisition)',
          notes: 'Ingested via VSR Recruitment Portal'
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
      `KEA_VSR_Recruitment_Pipeline_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner & Title Bar */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                Official Recruitment
              </span>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-[#f27405]/20 text-[#f27405] border border-[#f27405]/40">
                VSR Talent Acquisition Pipeline
              </span>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                Dual Guarantor &amp; Store Matching
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>VSR RECRUITMENT</span>
              <Users className="w-6 h-6 text-[#82c332]" />
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              End-to-end talent pipeline for Van Sales Representatives &amp; Field Merchandisers — from candidate sourcing and store sales pitch evaluations to dual-guarantor vetting, risk/fidelity clearance, and onboarding deployment.
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
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Recruit New VSR</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-lg bg-[#82c332] hover:bg-[#74b32b] text-xs font-bold text-black flex items-center gap-1.5 shadow-md shadow-lime-950/30 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Export Roster (CSV)</span>
            </button>
          </div>
        </div>

        {/* Top Funnel KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-5 pt-5 border-t border-[#1e293b]">
          <div className="bg-[#1e293b]/70 rounded-lg p-3 border border-slate-700/60">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Total Candidates
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-white font-mono">{totalCount}</span>
              <span className="text-[10px] text-slate-400 font-mono">Active Pipeline</span>
            </div>
          </div>

          <div className="bg-[#1e293b]/70 rounded-lg p-3 border border-slate-700/60">
            <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
              In Assessment / Pitch
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-amber-300 font-mono">{inAssessmentCount}</span>
              <span className="text-[10px] text-amber-400/80 font-mono">Testing</span>
            </div>
          </div>

          <div className="bg-[#1e293b]/70 rounded-lg p-3 border border-slate-700/60">
            <span className="text-[10px] uppercase font-bold text-purple-400 block tracking-wider">
              Dual Guarantor &amp; KYC
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-purple-300 font-mono">{inKycCount}</span>
              <span className="text-[10px] text-purple-400/80 font-mono">Vetting</span>
            </div>
          </div>

          <div className="bg-[#1e293b]/70 rounded-lg p-3 border border-slate-700/60">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">
              Selected / Ready
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-emerald-400 font-mono">{selectedCount}</span>
              <span className="text-[10px] text-emerald-500 font-mono">For Induction</span>
            </div>
          </div>

          <div className="bg-[#1e293b]/70 rounded-lg p-3 border border-slate-700/60">
            <span className="text-[10px] uppercase font-bold text-sky-400 block tracking-wider">
              Selection Pass Rate
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-sky-300 font-mono">{selectionRate}%</span>
              <span className="text-[10px] text-sky-400/80 font-mono">High Quality</span>
            </div>
          </div>

          <div className="bg-[#1e293b]/70 rounded-lg p-3 border border-slate-700/60">
            <span className="text-[10px] uppercase font-bold text-rose-400 block tracking-wider">
              Disqualified / Red Flag
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-rose-400 font-mono">{rejectedCount}</span>
              <span className="text-[10px] text-rose-400/80 font-mono">Integrity Dropped</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar: Search, Filters & View Mode Tabs */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search & Select Filters */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Box */}
          <div className="relative min-w-[220px] flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidate name, ID, phone, store..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1e293b] border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#82c332]"
            />
          </div>

          {/* Hub Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium">Hub:</span>
            <select
              value={selectedHub}
              onChange={(e) => setSelectedHub(e.target.value)}
              className="bg-[#1e293b] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-[#82c332]"
            >
              <option value="All">All Hubs (Lagos, Ibadan, Ogun, Benin, Enugu)</option>
              <option value="Lagos">Lagos Cluster</option>
              <option value="Ibadan">Ibadan Hub</option>
              <option value="Ogun">Ogun (Abeokuta/Sagamu)</option>
              <option value="Benin">Benin City</option>
              <option value="Enugu">Enugu Hub</option>
            </select>
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium">Role:</span>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="bg-[#1e293b] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-[#82c332]"
            >
              <option value="All">All Roles</option>
              <option value="VSR">Van Sales Representative (VSR)</option>
              <option value="Assistant VSR">Assistant VSR</option>
            </select>
          </div>

          {/* Stage Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium">Stage:</span>
            <select
              value={selectedStageFilter}
              onChange={(e) => setSelectedStageFilter(e.target.value)}
              className="bg-[#1e293b] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-[#82c332]"
            >
              <option value="All">All Stages (Funnel)</option>
              <option value="sourced">1. Sourced</option>
              <option value="screening">2. Screening</option>
              <option value="interview">3. Pitch / Exam</option>
              <option value="kyc_guarantors">4. Dual Guarantor</option>
              <option value="risk_clearance">5. Risk &amp; Fidelity</option>
              <option value="selected">6. Selected &amp; Ready</option>
              <option value="rejected">Disqualified / Red Flag</option>
            </select>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-[#1e293b] p-1 rounded-lg border border-slate-700 shrink-0">
          <button
            onClick={() => setActiveViewTab('kanban')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeViewTab === 'kanban'
                ? 'bg-[#82c332] text-black font-bold shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Pipeline Board</span>
          </button>
          <button
            onClick={() => setActiveViewTab('table')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeViewTab === 'table'
                ? 'bg-[#82c332] text-black font-bold shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Candidate Table</span>
          </button>
          <button
            onClick={() => setActiveViewTab('quotas')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeViewTab === 'quotas'
                ? 'bg-[#82c332] text-black font-bold shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Hub Quotas &amp; Stores</span>
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
                className="bg-[#0f172a] border border-[#1e293b] rounded-xl flex flex-col h-full min-h-[500px] shadow-md"
              >
                {/* Stage Header */}
                <div className={`p-3.5 border-b border-[#1e293b] ${stage.bgColor} rounded-t-xl`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-xs font-black uppercase tracking-wider ${stage.badgeColor}`}>
                      {stage.shortLabel}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-black/40 text-white border border-slate-700">
                      {stageCandidates.length}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {stage.description}
                  </p>
                </div>

                {/* Candidate Cards List */}
                <div className="p-2.5 space-y-2.5 flex-1 overflow-y-auto max-h-[700px]">
                  {stageCandidates.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500 italic">
                      No candidates in this stage
                    </div>
                  ) : (
                    stageCandidates.map((c) => {
                      const bothGuarantorsVerified = c.guarantor1.verified && c.guarantor2.verified;

                      return (
                        <div
                          key={c.id}
                          className="bg-[#1e293b] hover:bg-[#283548] border border-slate-700/80 hover:border-[#82c332]/60 rounded-lg p-3 transition-all cursor-pointer shadow-sm group"
                          onClick={() => setSelectedCandidate(c)}
                        >
                          {/* Header pill: number & role */}
                          <div className="flex items-center justify-between gap-1.5 mb-1.5">
                            <span className="text-[10px] font-mono font-semibold text-slate-400">
                              {c.applicantNumber}
                            </span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              c.role === 'VSR' ? 'bg-[#82c332]/20 text-[#82c332]' : 'bg-[#f27405]/20 text-[#f27405]'
                            }`}>
                              {c.role}
                            </span>
                          </div>

                          {/* Candidate Name */}
                          <h4 className="text-xs font-bold text-white group-hover:text-[#82c332] transition-colors leading-tight">
                            {c.fullName}
                          </h4>

                          {/* Hub & Target Store */}
                          <div className="flex items-center gap-1 text-[11px] text-slate-300 mt-1 font-medium">
                            <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{c.hub} • {c.targetStore}</span>
                          </div>

                          {/* Assessment Score & Guarantor Status Badges */}
                          <div className="flex items-center justify-between gap-2 mt-2.5 pt-2 border-t border-slate-700/60">
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-slate-400">Score:</span>
                              <span
                                className={`text-[11px] font-bold font-mono px-1.5 py-0.2 rounded ${
                                  c.overallScore >= 85
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : c.overallScore >= 70
                                    ? 'bg-amber-500/20 text-amber-400'
                                    : 'bg-rose-500/20 text-rose-400'
                                }`}
                              >
                                {c.overallScore > 0 ? `${c.overallScore}%` : 'Pending'}
                              </span>
                            </div>

                            {/* Dual Guarantor Quick Tag */}
                            <span
                              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-1 ${
                                bothGuarantorsVerified
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-slate-700/60 text-slate-400'
                              }`}
                              title={`G1: ${c.guarantor1.verified ? 'Verified' : 'Pending'} | G2: ${c.guarantor2.verified ? 'Verified' : 'Pending'}`}
                            >
                              <ShieldCheck className="w-3 h-3" />
                              <span>{bothGuarantorsVerified ? '2/2 KYC' : c.guarantor1.verified || c.guarantor2.verified ? '1/2 KYC' : '0/2 KYC'}</span>
                            </span>
                          </div>

                          {/* Advance stage quick bar */}
                          <div className="mt-2.5 flex items-center justify-between gap-1 text-[10px] text-slate-400 group-hover:text-slate-200">
                            <span>Applied: {c.appliedDate}</span>
                            <span className="text-[#82c332] font-semibold flex items-center gap-0.5">
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
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1e293b] text-slate-300 font-bold uppercase tracking-wider text-[10px] border-b border-black">
                <tr>
                  <th className="py-3 px-4">Applicant ID</th>
                  <th className="py-3 px-4">Candidate Full Name</th>
                  <th className="py-3 px-4">Hub &amp; Territory</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Target Store Corridor</th>
                  <th className="py-3 px-4 text-center">Sales Pitch</th>
                  <th className="py-3 px-4 text-center">Retail Math</th>
                  <th className="py-3 px-4 text-center">Overall %</th>
                  <th className="py-3 px-4 text-center">Dual Guarantor KYC</th>
                  <th className="py-3 px-4">Current Pipeline Stage</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
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
                        className="hover:bg-[#1e293b]/70 transition-colors cursor-pointer"
                        onClick={() => setSelectedCandidate(c)}
                      >
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                          {c.applicantNumber}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-white hover:text-[#82c332] transition-colors">
                            {c.fullName}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>{c.phone}</span>
                            <span>•</span>
                            <span>{c.email}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-200">
                          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[11px]">
                            {c.hub}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              c.role === 'VSR'
                                ? 'bg-[#82c332]/20 text-[#82c332]'
                                : 'bg-[#f27405]/20 text-[#f27405]'
                            }`}
                          >
                            {c.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-300 text-xs max-w-[200px] truncate">
                          {c.targetStore}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold">
                          {c.pitchScore > 0 ? `${c.pitchScore}/10` : '—'}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold">
                          {c.mathScore > 0 ? `${c.mathScore}/10` : '—'}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-black">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] ${
                              c.overallScore >= 85
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : c.overallScore >= 70
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            {c.overallScore > 0 ? `${c.overallScore}%` : 'Pending'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                              bothGuarantors
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : c.guarantor1.verified || c.guarantor2.verified
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            <ShieldCheck className="w-3 h-3" />
                            <span>
                              {bothGuarantors ? '2/2 Verified' : c.guarantor1.verified || c.guarantor2.verified ? '1/2 Verified' : 'Unverified'}
                            </span>
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${stageConfig?.bgColor} ${stageConfig?.badgeColor} border ${stageConfig?.borderColor}`}
                          >
                            {stageConfig?.shortLabel || c.stage}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCandidate(c);
                            }}
                            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-[#82c332] text-slate-300 hover:text-black font-semibold text-[11px] transition-all"
                          >
                            Dossier ➔
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="bg-[#1e293b] px-4 py-2.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Showing {filteredCandidates.length} of {candidates.length} candidates in recruitment database</span>
            <span className="font-mono text-slate-300">Synchronized with Head Office HR &amp; VSR Operations</span>
          </div>
        </div>
      )}

      {/* VIEW MODE 3: HUB QUOTA & CAPACITY FILL VIEW */}
      {activeViewTab === 'quotas' && (
        <div className="space-y-6">
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-5 shadow-lg">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#82c332]" />
              <span>Regional Recruitment Quota &amp; Store Allocation Targets</span>
            </h3>
            <p className="text-xs text-slate-400 max-w-3xl mb-6">
              Track open retail headcount targets per Nigerian cluster. Match successful candidates to specific retail chains (Shoprite, Justrite, Prince Ebeano, SPAR, Hubmart, Market Square).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  hub: 'Lagos Cluster',
                  target: 15,
                  deployed: 2,
                  inPipeline: candidates.filter((c) => c.hub === 'Lagos').length,
                  stores: ['SPAR Victoria Island', 'Shoprite Ikeja City Mall', 'Prince Ebeano Lekki', 'Hubmart VI'],
                  color: 'border-[#82c332]'
                },
                {
                  hub: 'Ibadan Regional Hub',
                  target: 6,
                  deployed: 1,
                  inPipeline: candidates.filter((c) => c.hub === 'Ibadan').length,
                  stores: ['Justrite Dugbe & Challenge', 'Foodco Ring Road', 'Bodija Trade Corridor'],
                  color: 'border-[#f27405]'
                },
                {
                  hub: 'Ogun Territory',
                  target: 5,
                  deployed: 0,
                  inPipeline: candidates.filter((c) => c.hub === 'Ogun').length,
                  stores: ['Justrite Abeokuta', 'Sagamu Expressway Depot', 'Ijebu Ode Central'],
                  color: 'border-emerald-500'
                },
                {
                  hub: 'Benin City Hub',
                  target: 4,
                  deployed: 0,
                  inPipeline: candidates.filter((c) => c.hub === 'Benin').length,
                  stores: ['Market Square Sapele Road', 'Ekenwan Trade Hub'],
                  color: 'border-purple-500'
                },
                {
                  hub: 'Enugu Cluster',
                  target: 3,
                  deployed: 0,
                  inPipeline: candidates.filter((c) => c.hub === 'Enugu').length,
                  stores: ['Polo Park Mall Enugu', 'Ogui Road Commercial Depot'],
                  color: 'border-sky-500'
                }
              ].map((q) => {
                const fillPct = Math.round(((q.deployed + q.inPipeline) / q.target) * 100);

                return (
                  <div
                    key={q.hub}
                    className="bg-[#1e293b] border border-slate-700/80 rounded-xl p-4 shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-bold text-white">{q.hub}</h4>
                        <span className="text-xs font-mono font-bold text-slate-300">
                          {q.deployed + q.inPipeline} / {q.target} Target
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden mb-3">
                        <div
                          className="bg-gradient-to-r from-[#82c332] to-emerald-400 h-2.5 rounded-full"
                          style={{ width: `${Math.min(100, fillPct)}%` }}
                        ></div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-400 mb-4 font-mono">
                        <span>Selected: {q.deployed}</span>
                        <span>In Pipeline: {q.inPipeline}</span>
                        <span className="text-[#82c332] font-bold">{fillPct}% Filled</span>
                      </div>

                      <div className="text-[11px] text-slate-300 font-semibold mb-1">
                        Assigned Store Corridors:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {q.stores.map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded bg-black/40 text-slate-300 text-[10px] border border-slate-700"
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
                      className="mt-4 w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-[#1e293b] p-5 border-b border-black flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-black/60 text-[#82c332] border border-[#82c332]/40">
                    {selectedCandidate.applicantNumber}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#82c332]/20 text-[#82c332]">
                    {selectedCandidate.role}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                    {selectedCandidate.hub} Hub
                  </span>
                </div>
                <h2 className="text-xl font-black text-white">{selectedCandidate.fullName}</h2>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                  <span>Target Store: <strong className="text-slate-200">{selectedCandidate.targetStore}</strong></span>
                  <span>•</span>
                  <span>Applied on {selectedCandidate.appliedDate}</span>
                </p>
              </div>

              <button
                onClick={() => setSelectedCandidate(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* STAGE ADVANCEMENT STRIP */}
              <div className="bg-[#1e293b]/70 border border-slate-700/80 rounded-xl p-4">
                <div className="text-xs font-bold text-white uppercase tracking-wider mb-2.5 flex items-center justify-between">
                  <span>Pipeline Stage Transition</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    Current: <strong className="text-[#82c332]">{RECRUITMENT_STAGES_CONFIG.find((s) => s.id === selectedCandidate.stage)?.label}</strong>
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
                            ? 'bg-[#82c332] text-black font-black shadow-md ring-2 ring-[#82c332]/40'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
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
                <div className="bg-[#1e293b]/60 border border-slate-700/80 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider border-b border-slate-700/60 pb-2">
                    <Award className="w-4 h-4 text-[#82c332]" />
                    <span>Selection Evaluation</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Store Sales Pitch:</span>
                      <span className="font-mono font-bold text-white">{selectedCandidate.pitchScore} / 10</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">POS / Retail Math:</span>
                      <span className="font-mono font-bold text-white">{selectedCandidate.mathScore} / 10</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Communication Rating:</span>
                      <span className="font-mono font-bold text-white">{selectedCandidate.communicationScore} / 10</span>
                    </div>

                    <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300">Composite Score:</span>
                      <span
                        className={`text-sm font-black font-mono px-2 py-0.5 rounded ${
                          selectedCandidate.overallScore >= 85
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : selectedCandidate.overallScore >= 70
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {selectedCandidate.overallScore}%
                      </span>
                    </div>
                  </div>

                  <div className="bg-black/30 rounded-lg p-2.5 border border-slate-800 text-[11px] text-slate-300">
                    <span className="font-bold text-slate-400 block mb-0.5">Evaluator Remarks:</span>
                    {selectedCandidate.evaluatorNotes}
                  </div>
                </div>

                {/* 2. DUAL GUARANTOR KYC DOSSIER */}
                <div className="bg-[#1e293b]/60 border border-slate-700/80 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider border-b border-slate-700/60 pb-2">
                    <ShieldCheck className="w-4 h-4 text-[#f27405]" />
                    <span>Dual Guarantor KYC</span>
                  </div>

                  {/* Guarantor 1 */}
                  <div className="bg-black/30 p-2.5 rounded-lg border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">1. {selectedCandidate.guarantor1.name}</span>
                      <button
                        onClick={() => handleToggleGuarantor(selectedCandidate.id, 1)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          selectedCandidate.guarantor1.verified
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        }`}
                      >
                        {selectedCandidate.guarantor1.verified ? 'Verified ✓' : 'Unverified ✗'}
                      </button>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {selectedCandidate.guarantor1.profession} • {selectedCandidate.guarantor1.company}
                    </div>
                    <div className="text-[11px] font-mono text-slate-300">
                      {selectedCandidate.guarantor1.phone || 'No phone provided'}
                    </div>
                  </div>

                  {/* Guarantor 2 */}
                  <div className="bg-black/30 p-2.5 rounded-lg border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">2. {selectedCandidate.guarantor2.name}</span>
                      <button
                        onClick={() => handleToggleGuarantor(selectedCandidate.id, 2)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          selectedCandidate.guarantor2.verified
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        }`}
                      >
                        {selectedCandidate.guarantor2.verified ? 'Verified ✓' : 'Unverified ✗'}
                      </button>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {selectedCandidate.guarantor2.profession} • {selectedCandidate.guarantor2.company}
                    </div>
                    <div className="text-[11px] font-mono text-slate-300">
                      {selectedCandidate.guarantor2.phone || 'No phone provided'}
                    </div>
                  </div>
                </div>

                {/* 3. COMPLIANCE, PENSION & RISK CLEARANCE */}
                <div className="bg-[#1e293b]/60 border border-slate-700/80 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider border-b border-slate-700/60 pb-2">
                    <FileText className="w-4 h-4 text-sky-400" />
                    <span>Compliance &amp; Fidelity</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Risk Audit Status:</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          selectedCandidate.riskVettingStatus === 'Cleared'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : selectedCandidate.riskVettingStatus === 'Under Review'
                            ? 'bg-amber-500/20 text-amber-400'
                            : selectedCandidate.riskVettingStatus === 'Flagged'
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {selectedCandidate.riskVettingStatus}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Fidelity Insurance:</span>
                      <span className="font-semibold text-white">
                        {selectedCandidate.fidelityEligible ? 'Pre-Approved' : 'Pending Underwriting'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">RSA Pension Fund:</span>
                      <span className="font-semibold text-white">
                        {selectedCandidate.hasPension ? selectedCandidate.pensionPfa || 'Active RSA' : 'To Be Registered'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Education / Tenure:</span>
                      <span className="font-semibold text-white">
                        {selectedCandidate.highestEducation} ({selectedCandidate.experienceYears} yrs exp)
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Source Channel:</span>
                      <span className="font-semibold text-slate-200">
                        {selectedCandidate.sourceChannel}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RECRUITMENT AUDIT TRAIL / ACTIVITY LOG */}
              <div className="bg-[#1e293b]/70 border border-slate-700/80 rounded-xl p-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                  Recruitment Audit Trail &amp; Interview Notes
                </h4>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {selectedCandidate.activityLog.map((log) => (
                    <div
                      key={log.id}
                      className="bg-black/40 border border-slate-800 rounded-lg p-2.5 text-xs flex items-start justify-between gap-3"
                    >
                      <div>
                        <div className="font-semibold text-slate-200 flex items-center gap-2">
                          <span>{log.action}</span>
                          <span className="text-[10px] text-slate-500 font-mono">by {log.performedBy}</span>
                        </div>
                        {log.notes && <p className="text-[11px] text-slate-400 mt-0.5">{log.notes}</p>}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">{log.timestamp}</span>
                    </div>
                  ))}
                </div>

                {/* Add new note input */}
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    placeholder="Log recruiter observation or assessment note..."
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    className="flex-1 bg-black/40 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#82c332]"
                  />
                  <button
                    onClick={handleAddNote}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-[#82c332] text-slate-300 hover:text-black font-bold text-xs transition-colors shrink-0"
                  >
                    Add Note
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-[#1e293b] p-4 border-t border-black flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Mail className="w-3.5 h-3.5" />
                <span>{selectedCandidate.email}</span>
                <span>•</span>
                <Phone className="w-3.5 h-3.5" />
                <span>{selectedCandidate.phone}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleMoveStage(selectedCandidate.id, 'rejected')}
                  className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/40 text-xs font-bold transition-all"
                >
                  Flag as Red Flag / Disqualify
                </button>
                <button
                  onClick={() => handleMoveStage(selectedCandidate.id, 'selected')}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
                >
                  Select for Store Deployment ✓
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RECRUIT NEW VSR / APPLICANT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden">
            <div className="bg-[#1e293b] p-5 border-b border-black flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-[#82c332]" />
                  <span>Recruit New VSR / Add Applicant</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ingest a new candidate into the KEA Group VSR recruitment pipeline.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateApplicant} className="p-6 space-y-4 overflow-y-auto max-h-[80vh]">
              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Candidate Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Babatunde Olumide"
                    value={newApplicant.fullName}
                    onChange={(e) => setNewApplicant({ ...newApplicant, fullName: e.target.value })}
                    className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#82c332]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Official Mobile Phone *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +234 803 123 4567"
                    value={newApplicant.phone}
                    onChange={(e) => setNewApplicant({ ...newApplicant, phone: e.target.value })}
                    className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#82c332]"
                  />
                </div>
              </div>

              {/* Email & Hub */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. b.olumide@gmail.com"
                    value={newApplicant.email}
                    onChange={(e) => setNewApplicant({ ...newApplicant, email: e.target.value })}
                    className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#82c332]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Target Regional Hub
                  </label>
                  <select
                    value={newApplicant.hub}
                    onChange={(e) => setNewApplicant({ ...newApplicant, hub: e.target.value as any })}
                    className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#82c332]"
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
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Designation / Role
                  </label>
                  <select
                    value={newApplicant.role}
                    onChange={(e) => setNewApplicant({ ...newApplicant, role: e.target.value as any })}
                    className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#82c332]"
                  >
                    <option value="VSR">Van Sales Representative (VSR)</option>
                    <option value="Assistant VSR">Assistant VSR</option>
                    <option value="Retail Merchandiser">Retail Merchandiser</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Target Retail Store Corridor
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SPAR Victoria Island, Justrite Dugbe"
                    value={newApplicant.targetStore}
                    onChange={(e) => setNewApplicant({ ...newApplicant, targetStore: e.target.value })}
                    className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#82c332]"
                  />
                </div>
              </div>

              {/* Guarantor 1 & 2 */}
              <div className="bg-[#1e293b]/70 border border-slate-700/80 rounded-xl p-3.5 space-y-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Initial Dual Guarantor Submission
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Guarantor 1 Full Name"
                    value={newApplicant.guarantor1Name}
                    onChange={(e) => setNewApplicant({ ...newApplicant, guarantor1Name: e.target.value })}
                    className="bg-black/30 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#82c332]"
                  />
                  <input
                    type="text"
                    placeholder="Guarantor 1 Phone"
                    value={newApplicant.guarantor1Phone}
                    onChange={(e) => setNewApplicant({ ...newApplicant, guarantor1Phone: e.target.value })}
                    className="bg-black/30 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#82c332]"
                  />
                  <input
                    type="text"
                    placeholder="Profession / Org"
                    value={newApplicant.guarantor1Profession}
                    onChange={(e) => setNewApplicant({ ...newApplicant, guarantor1Profession: e.target.value })}
                    className="bg-black/30 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#82c332]"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Guarantor 2 Full Name"
                    value={newApplicant.guarantor2Name}
                    onChange={(e) => setNewApplicant({ ...newApplicant, guarantor2Name: e.target.value })}
                    className="bg-black/30 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#82c332]"
                  />
                  <input
                    type="text"
                    placeholder="Guarantor 2 Phone"
                    value={newApplicant.guarantor2Phone}
                    onChange={(e) => setNewApplicant({ ...newApplicant, guarantor2Phone: e.target.value })}
                    className="bg-black/30 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#82c332]"
                  />
                  <input
                    type="text"
                    placeholder="Profession / Org"
                    value={newApplicant.guarantor2Profession}
                    onChange={(e) => setNewApplicant({ ...newApplicant, guarantor2Profession: e.target.value })}
                    className="bg-black/30 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#82c332]"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Recruiter Screening Remarks
                </label>
                <textarea
                  rows={2}
                  placeholder="Notes from resume screening, background check, or referral source..."
                  value={newApplicant.notes}
                  onChange={(e) => setNewApplicant({ ...newApplicant, notes: e.target.value })}
                  className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#82c332]"
                ></textarea>
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-black flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#82c332] hover:bg-[#74b32b] text-black text-xs font-bold transition-all shadow-md shadow-lime-950/40"
                >
                  Save &amp; Ingest Applicant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
