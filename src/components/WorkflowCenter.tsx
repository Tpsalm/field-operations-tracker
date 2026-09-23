import React, { useEffect, useMemo, useState } from 'react';
import {
  addMessage,
  addReport,
  addRequest,
  getWorkflowState,
  reviewReport,
  reviewRequest,
  subscribeToWorkflow,
  WorkflowState
} from '../data/workflowStore';
import { AuthUser } from '../types';

interface WorkflowCenterProps {
  user: AuthUser;
}

const panel = 'rounded-xl border border-[#20314d] bg-[#0b1627]';
const input = 'w-full rounded-lg border border-[#2a3d5a] bg-[#0d1729] px-3 py-2 text-xs text-white outline-none focus:border-[#92C842]';

export const WorkflowCenter: React.FC<WorkflowCenterProps> = ({ user }) => {
  const isAdmin = user.platform === 'admin';
  const [state, setState] = useState<WorkflowState>(getWorkflowState());
  const [reportPeriod, setReportPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [requestType, setRequestType] = useState<'funding' | 'leave'>('funding');
  const [requestReason, setRequestReason] = useState('');
  const [requestAmount, setRequestAmount] = useState('');
  const [requestDates, setRequestDates] = useState('');
  const [messageSubject, setMessageSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [messageFile, setMessageFile] = useState<File | null>(null);
  const [notice, setNotice] = useState('');

  useEffect(() => subscribeToWorkflow(() => setState(getWorkflowState())), []);

  const visibleMessages = useMemo(() => state.messages.filter((message) => isAdmin ? message.audience === 'all' || message.senderId !== user.id : message.audience === 'all' || message.audience === user.id), [isAdmin, state.messages, user.id]);
  const pendingReports = state.reports.filter((report) => report.status === 'pending');
  const pendingRequests = state.requests.filter((request) => request.status === 'pending');
  const acceptedReports = state.reports.filter((report) => report.status === 'accepted').length;

  const showNotice = (text: string) => { setNotice(text); window.setTimeout(() => setNotice(''), 3000); };
  const submitReport = (event: React.FormEvent) => {
    event.preventDefault();
    if (!reportFile) return;
    addReport({ senderId: user.id, senderName: user.name, period: reportPeriod, fileName: reportFile.name });
    setReportFile(null);
    showNotice('Report submitted to Super Admin for review.');
  };
  const submitRequest = (event: React.FormEvent) => {
    event.preventDefault();
    if (!requestReason.trim()) return;
    addRequest({ senderId: user.id, senderName: user.name, type: requestType, reason: requestReason, amount: requestAmount || undefined, dates: requestDates || undefined });
    setRequestReason(''); setRequestAmount(''); setRequestDates('');
    showNotice(`${requestType === 'funding' ? 'Funding' : 'Leave'} request sent to Super Admin.`);
  };
  const submitMessage = (event: React.FormEvent) => {
    event.preventDefault();
    if (!messageSubject.trim() || !messageBody.trim()) return;
    addMessage({ senderId: user.id, senderName: user.name, audience: isAdmin ? 'all' : 'admin', subject: messageSubject, body: messageBody, attachmentName: messageFile?.name });
    setMessageSubject(''); setMessageBody(''); setMessageFile(null);
    showNotice('Message delivered to the workflow inbox.');
  };

  return (
    <section className={`${panel} p-5`}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#20314d] pb-4">
        <div><div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#92C842]">Live workflow center</div><h2 className="mt-1 text-lg font-bold text-white">{isAdmin ? 'Field communications & approvals' : 'Message'}</h2><p className="mt-1 text-xs text-slate-400">Cross-tab notifications are delivered instantly in this browser session.</p></div>
        <div className="rounded-lg border border-[#92C842]/30 bg-[#92C842]/10 px-3 py-2 text-right"><div className="text-[10px] uppercase text-slate-400">Accepted reports</div><div className="text-lg font-bold text-[#b5e86d]">{acceptedReports}</div></div>
      </div>
      {notice && <div className="mt-4 rounded-lg border border-[#92C842]/30 bg-[#92C842]/10 px-3 py-2 text-xs text-[#b5e86d]">{notice}</div>}

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <div className="space-y-5">
          {!isAdmin && <>
            <form onSubmit={submitReport} className="rounded-xl border border-[#20314d] bg-[#0d1729] p-4"><div className="text-xs font-bold uppercase tracking-wider text-white">Submit organisation report</div><p className="mt-1 text-[11px] text-slate-400">Use the approved KEA weekly or monthly report template.</p><div className="mt-3 grid gap-2 sm:grid-cols-2"><select className={input} value={reportPeriod} onChange={(event) => setReportPeriod(event.target.value as 'weekly' | 'monthly')}><option value="weekly">Weekly report</option><option value="monthly">Monthly report</option></select><input required type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.csv" onChange={(event) => setReportFile(event.target.files?.[0] || null)} className="block w-full rounded-lg border border-[#2a3d5a] bg-[#101d31] px-2 py-1.5 text-[11px] text-slate-300" /></div><button className="mt-3 rounded-lg bg-[#92C842] px-3 py-2 text-xs font-bold text-[#07101d]">Send report for approval</button></form>
            <form onSubmit={submitRequest} className="rounded-xl border border-[#20314d] bg-[#0d1729] p-4"><div className="text-xs font-bold uppercase tracking-wider text-white">Apply for support</div><div className="mt-3 grid gap-2 sm:grid-cols-2"><select className={input} value={requestType} onChange={(event) => setRequestType(event.target.value as 'funding' | 'leave')}><option value="funding">Funding / loan request</option><option value="leave">Leave request</option></select><input value={requestType === 'funding' ? requestAmount : requestDates} onChange={(event) => requestType === 'funding' ? setRequestAmount(event.target.value) : setRequestDates(event.target.value)} placeholder={requestType === 'funding' ? 'Amount requested' : 'Dates requested'} className={input} /></div><textarea required value={requestReason} onChange={(event) => setRequestReason(event.target.value)} placeholder="Reason and operational context" rows={3} className={`${input} mt-2`} /><button className="mt-3 rounded-lg border border-[#92C842]/50 px-3 py-2 text-xs font-bold text-[#b5e86d]">Submit request</button></form>
          </>}
          <form onSubmit={submitMessage} className="rounded-xl border border-[#20314d] bg-[#0d1729] p-4"><div className="text-xs font-bold uppercase tracking-wider text-white">{isAdmin ? 'Broadcast to VSR platform' : 'Message Super Admin'}</div><div className="mt-3 space-y-2"><input required value={messageSubject} onChange={(event) => setMessageSubject(event.target.value)} placeholder="Subject" className={input} /><textarea required value={messageBody} onChange={(event) => setMessageBody(event.target.value)} placeholder="Write an operational message..." rows={3} className={input} /><div className="flex flex-wrap items-center justify-between gap-2"><input type="file" onChange={(event) => setMessageFile(event.target.files?.[0] || null)} className="max-w-full text-[11px] text-slate-400" /><button className="rounded-lg bg-[#92C842] px-3 py-2 text-xs font-bold text-[#07101d]">Send message</button></div></div></form>
        </div>

        <div className="space-y-5">
          <div className="rounded-xl border border-[#20314d] bg-[#0d1729] p-4"><div className="flex items-center justify-between"><div><div className="text-xs font-bold uppercase tracking-wider text-white">Inbox & notifications</div><div className="mt-1 text-[11px] text-slate-400">{visibleMessages.length} messages available</div></div><span className="h-2 w-2 rounded-full bg-[#92C842]" /></div><div className="mt-3 max-h-60 space-y-2 overflow-y-auto">{visibleMessages.length === 0 ? <div className="rounded-lg border border-dashed border-[#2a3d5a] p-5 text-center text-xs text-slate-500">No messages yet.</div> : visibleMessages.map((message) => <div key={message.id} className="rounded-lg border border-[#263653] bg-[#101d31] p-3"><div className="flex justify-between gap-2"><span className="text-xs font-bold text-white">{message.subject}</span><span className="text-[10px] text-slate-500">{new Date(message.createdAt).toLocaleTimeString()}</span></div><div className="mt-1 text-[11px] text-slate-300">{message.body}</div><div className="mt-2 text-[10px] text-slate-500">From {message.senderName}{message.attachmentName ? ` · ${message.attachmentName}` : ''}</div></div>)}</div></div>
          {isAdmin && <><div className="rounded-xl border border-[#20314d] bg-[#0d1729] p-4"><div className="text-xs font-bold uppercase tracking-wider text-white">Reports awaiting acceptance <span className="text-[#92C842]">{pendingReports.length}</span></div><div className="mt-3 space-y-2">{pendingReports.map((report) => <div key={report.id} className="rounded-lg border border-[#263653] bg-[#101d31] p-3"><div className="flex flex-wrap items-center justify-between gap-2"><div><div className="text-xs font-semibold text-white">{report.senderName} · {report.period}</div><div className="text-[10px] text-slate-400">{report.fileName} · {new Date(report.submittedAt).toLocaleString()}</div></div><div className="flex gap-2"><button onClick={() => reviewReport(report.id, 'accepted')} className="rounded bg-[#92C842] px-2 py-1 text-[10px] font-bold text-[#07101d]">Accept & update KPIs</button><button onClick={() => reviewReport(report.id, 'rejected')} className="rounded border border-red-400/40 px-2 py-1 text-[10px] text-red-300">Reject</button></div></div></div>)}</div></div>
          <div className="rounded-xl border border-[#20314d] bg-[#0d1729] p-4"><div className="text-xs font-bold uppercase tracking-wider text-white">Funding & leave approvals <span className="text-[#92C842]">{pendingRequests.length}</span></div><div className="mt-3 space-y-2">{pendingRequests.map((request) => <div key={request.id} className="rounded-lg border border-[#263653] bg-[#101d31] p-3"><div className="flex flex-wrap items-center justify-between gap-2"><div><div className="text-xs font-semibold text-white">{request.senderName} · {request.type}</div><div className="text-[10px] text-slate-400">{request.amount || request.dates || 'No amount/date'} · {request.reason}</div></div><div className="flex gap-2"><button onClick={() => reviewRequest(request.id, 'accepted')} className="rounded bg-[#92C842] px-2 py-1 text-[10px] font-bold text-[#07101d]">Accept</button><button onClick={() => reviewRequest(request.id, 'rejected')} className="rounded border border-red-400/40 px-2 py-1 text-[10px] text-red-300">Reject</button></div></div></div>)}</div></div></>}
        </div>
      </div>
    </section>
  );
};
