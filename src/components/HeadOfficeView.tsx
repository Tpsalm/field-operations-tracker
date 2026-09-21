import React, { useState } from 'react';
import { Requisition } from '../types';

interface HeadOfficeViewProps {
  requisitions: Requisition[];
  onAddRequisition?: (req: Requisition) => void;
}

export const HeadOfficeView: React.FC<HeadOfficeViewProps> = ({ requisitions, onAddRequisition }) => {
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [activeReqModal, setActiveReqModal] = useState<Requisition | null>(null);
  const [newRoleTitle, setNewRoleTitle] = useState('');
  const [newRoleDept, setNewRoleDept] = useState<'Executive' | 'Finance & Ops' | 'Tech & Log.'>('Tech & Log.');
  const [newRoleLocation, setNewRoleLocation] = useState('Victoria Island HQ');
  const [showAddForm, setShowAddForm] = useState(false);

  const hqMembers = [
    { name: 'Tope Balogun', role: 'Chief Executive Officer', dept: 'Executive', location: 'Victoria Island HQ', tenure: '3.4 Yrs', email: 't.balogun@keahospitality.com' },
    { name: 'Adetoun Majekodunmi', role: 'VP, Operations & Field Logistics', dept: 'Executive', location: 'Victoria Island HQ', tenure: '2.8 Yrs', email: 'a.majek@keahospitality.com' },
    { name: 'Emeka Nwosu', role: 'Director of Audit & Compliance', dept: 'Executive', location: 'Victoria Island HQ', tenure: '2.1 Yrs', email: 'e.nwosu@keahospitality.com' },
    { name: 'Fatima Sanusi', role: 'Head of People & Field Recruitment', dept: 'Executive', location: 'Victoria Island HQ', tenure: '1.9 Yrs', email: 'f.sanusi@keahospitality.com' },
    { name: 'Olumide Adelekan', role: 'Senior Treasury Manager', dept: 'Finance & Ops', location: 'Victoria Island HQ', tenure: '2.5 Yrs', email: 'o.adelekan@keahospitality.com' },
    { name: 'Kolawole Davies', role: 'Regional Ops Lead (Lagos & Ogun)', dept: 'Finance & Ops', location: 'Victoria Island HQ', tenure: '2.2 Yrs', email: 'k.davies@keahospitality.com' },
    { name: 'Godwin Igbinovia', role: 'Field Operations Supervisor', dept: 'Finance & Ops', location: 'Benin Hub', tenure: '1.4 Yrs', email: 'g.igbinovia@keahospitality.com' },
    { name: 'Folashade Coker', role: 'POS Reconciliation Analyst', dept: 'Tech & Log.', location: 'Victoria Island HQ', tenure: '1.6 Yrs', email: 'f.coker@keahospitality.com' },
    { name: 'Abdulrahman Bello', role: 'Infrastructure & Fleet Lead', dept: 'Tech & Log.', location: 'Ibadan Hub', tenure: '1.8 Yrs', email: 'a.bello@keahospitality.com' }
  ];

  const filteredMembers =
    selectedDept === 'All' ? hqMembers : hqMembers.filter((m) => m.dept === selectedDept);

  const handleCreateReq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleTitle.trim()) return;

    const newReq: Requisition = {
      id: `req-${Date.now()}`,
      title: newRoleTitle.trim(),
      department: newRoleDept,
      location: newRoleLocation,
      applicantCount: 0,
      status: 'active',
      salaryRange: '₦350k – ₦450k / mo'
    };

    if (onAddRequisition) onAddRequisition(newReq);
    setNewRoleTitle('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-xl p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#92C842]/10 text-[#92C842] border border-[#92C842]/30">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </span>
            <h2 className="text-lg font-bold text-white">Head Office Staffing &amp; Talent Recruitment</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            34 HQ personnel across 3 specialized divisions supporting 184 active field operatives across Nigeria.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 rounded-lg bg-[#92C842] hover:bg-[#7bb32e] text-[#090e1c] text-xs font-bold shadow-md shadow-[#92C842]/20"
        >
          {showAddForm ? '✕ Close Form' : '+ Open New Requisition'}
        </button>
      </div>

      {/* New Requisition Form */}
      {showAddForm && (
        <form
          onSubmit={handleCreateReq}
          className="bg-[#0e1628] border border-[#92C842]/40 rounded-xl p-5 shadow-xl space-y-4 text-xs"
        >
          <h3 className="text-sm font-bold text-white">Create New Open Job Requisition</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-400 mb-1">Position Title *</label>
              <input
                required
                value={newRoleTitle}
                onChange={(e) => setNewRoleTitle(e.target.value)}
                placeholder="e.g. Regional Field Auditor"
                className="w-full bg-[#151f38] border border-[#1e2d4d] focus:border-[#92C842] rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Department</label>
              <select
                value={newRoleDept}
                onChange={(e) => setNewRoleDept(e.target.value as any)}
                className="w-full bg-[#151f38] border border-[#1e2d4d] focus:border-[#92C842] rounded-lg px-3 py-2 text-white"
              >
                <option value="Executive">Executive</option>
                <option value="Finance & Ops">Finance &amp; Ops</option>
                <option value="Tech & Log.">Tech &amp; Log.</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1">HQ / Hub Location</label>
              <input
                value={newRoleLocation}
                onChange={(e) => setNewRoleLocation(e.target.value)}
                placeholder="Victoria Island HQ"
                className="w-full bg-[#151f38] border border-[#1e2d4d] focus:border-[#92C842] rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 rounded-lg bg-[#151f38] text-slate-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-[#92C842] text-[#090e1c] font-bold"
            >
              Publish Requisition
            </button>
          </div>
        </form>
      )}

      {/* Dept Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setSelectedDept('Executive')}
          className={`bg-[#0e1628] border rounded-xl p-4 cursor-pointer transition-all ${
            selectedDept === 'Executive' ? 'border-[#92C842]' : 'border-[#1e2d4d] hover:border-[#1e2d4d]/80'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="uppercase font-semibold">Executive Leadership</span>
            <span className="w-2 h-2 rounded-full bg-[#92C842]"></span>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">4</div>
          <div className="text-[11px] text-slate-400 mt-2">C-Suite &amp; Directorate Oversight</div>
        </div>

        <div
          onClick={() => setSelectedDept('Finance & Ops')}
          className={`bg-[#0e1628] border rounded-xl p-4 cursor-pointer transition-all ${
            selectedDept === 'Finance & Ops' ? 'border-[#92C842]' : 'border-[#1e2d4d] hover:border-[#1e2d4d]/80'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="uppercase font-semibold">Finance &amp; Field Operations</span>
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">12</div>
          <div className="text-[11px] text-slate-400 mt-2">Disbursements, audits &amp; territory leads</div>
        </div>

        <div
          onClick={() => setSelectedDept('Tech & Log.')}
          className={`bg-[#0e1628] border rounded-xl p-4 cursor-pointer transition-all ${
            selectedDept === 'Tech & Log.' ? 'border-[#92C842]' : 'border-[#1e2d4d] hover:border-[#1e2d4d]/80'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="uppercase font-semibold">Technology &amp; POS Logistics</span>
            <span className="w-2 h-2 rounded-full bg-[#F17F31]"></span>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">18</div>
          <div className="text-[11px] text-slate-400 mt-2">Hardware telemetry, NIBSS integration &amp; sync</div>
        </div>
      </div>

      {/* Active Requisitions Grid */}
      <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Active Job Requisitions ({requisitions.length} Openings)
            </h3>
          </div>
          <span className="text-[11px] font-bold text-[#F17F31] bg-[#F17F31]/10 px-2 py-0.5 rounded border border-[#F17F31]/30">
            5 Hiring Pipelines Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {requisitions.map((req) => (
            <div
              key={req.id}
              onClick={() => setActiveReqModal(req)}
              className="bg-[#090e1c] border border-[#1e2d4d] hover:border-[#92C842]/40 rounded-xl p-4 space-y-3 cursor-pointer transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-white text-xs hover:text-[#92C842]">{req.title}</h4>
                  <div className="text-[11px] text-slate-400 mt-0.5">{req.location}</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#151f38] border border-[#1e2d4d] font-mono text-[#92C842] text-[11px] font-bold">
                  {req.applicantCount} Apps
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-[#1e2d4d] pt-2">
                <span className="bg-[#151f38] px-2 py-0.5 rounded text-slate-300">{req.department}</span>
                <span className="font-mono text-slate-300">{req.salaryRange}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* HQ Staff Table */}
      <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-xl overflow-hidden shadow-lg">
        <div className="px-5 py-3 border-b border-[#1e2d4d] bg-[#090e1c]/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200 uppercase tracking-wider">Head Office Roster Directory</span>
            {selectedDept !== 'All' && (
              <button
                onClick={() => setSelectedDept('All')}
                className="text-[10px] text-[#92C842] hover:underline"
              >
                (Clear filter: {selectedDept})
              </button>
            )}
          </div>
          <span className="text-[11px] font-mono text-slate-400">{filteredMembers.length} Staff Listed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#151f38] text-slate-400 font-mono text-[10px] uppercase tracking-wider border-b border-[#1e2d4d]">
              <tr>
                <th className="px-5 py-3">Employee Name</th>
                <th className="px-5 py-3">Role / Designation</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Primary Station</th>
                <th className="px-5 py-3">Tenure</th>
                <th className="px-5 py-3">Contact Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2d4d]/60">
              {filteredMembers.map((member, idx) => (
                <tr key={idx} className="hover:bg-[#151f38]/50 transition-colors">
                  <td className="px-5 py-3 font-semibold text-white">{member.name}</td>
                  <td className="px-5 py-3 text-[#92C842] font-medium">{member.role}</td>
                  <td className="px-5 py-3 text-slate-300">{member.dept}</td>
                  <td className="px-5 py-3 text-slate-400">{member.location}</td>
                  <td className="px-5 py-3 font-mono text-slate-300">{member.tenure}</td>
                  <td className="px-5 py-3 font-mono text-slate-500">{member.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Requisition Detail Modal */}
      {activeReqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-2xl w-full max-w-lg p-6 text-slate-200 space-y-4">
            <div className="flex items-start justify-between border-b border-[#1e2d4d] pb-3">
              <div>
                <h3 className="text-base font-bold text-white">{activeReqModal.title}</h3>
                <p className="text-xs text-slate-400">
                  {activeReqModal.department} • {activeReqModal.location}
                </p>
              </div>
              <button
                onClick={() => setActiveReqModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between p-3 bg-[#151f38] rounded-lg border border-[#1e2d4d]">
                <span className="text-slate-400">Total Applicants In Pipeline:</span>
                <span className="font-bold text-[#92C842] font-mono">{activeReqModal.applicantCount} Candidates</span>
              </div>
              <div className="flex justify-between p-3 bg-[#151f38] rounded-lg border border-[#1e2d4d]">
                <span className="text-slate-400">Compensation Band:</span>
                <span className="font-mono text-white font-semibold">{activeReqModal.salaryRange}</span>
              </div>
              <div className="p-3 bg-[#090e1c] rounded-lg border border-[#1e2d4d] space-y-2">
                <span className="text-slate-400 block font-semibold">Candidate Pipeline Stages:</span>
                <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                  <div className="bg-[#151f38] p-2 rounded">Screening: <strong>14</strong></div>
                  <div className="bg-[#151f38] p-2 rounded">Interview: <strong>6</strong></div>
                  <div className="bg-[#151f38] p-2 rounded">Assessment: <strong>3</strong></div>
                  <div className="bg-[#92C842]/20 text-[#92C842] p-2 rounded font-bold">Offer: <strong>1</strong></div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-[#1e2d4d]">
              <button
                onClick={() => setActiveReqModal(null)}
                className="px-4 py-2 bg-[#151f38] text-slate-300 text-xs font-semibold rounded-lg"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
