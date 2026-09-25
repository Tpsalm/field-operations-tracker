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

const panel = 'rounded-[12px] border border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.03)]';
const input = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-500 shadow-xs';

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
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">Live Workflow Center</div>
          <h2 className="mt-1 text-lg font-bold text-slate-900">{isAdmin ? 'Field Communications & Approvals' : 'Messages'}</h2>
          <p className="mt-1 text-xs text-slate-500">Live operational notices and approvals updated in real time.</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-right">
          <div className="text-[10px] font-semibold uppercase text-slate-500">Accepted Reports</div>
          <div className="text-lg font-bold text-emerald-700">{acceptedReports}</div>
        </div>
      </div>
      {notice && <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs text-emerald-800 font-medium">{notice}</div>}

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <div className="space-y-5">
          {!isAdmin && (
            <>
              <form onSubmit={submitReport} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-900">Submit Operations Report</div>
                <p className="mt-1 text-[11px] text-slate-500">Upload weekly or monthly retail reports.</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <select className={input} value={reportPeriod} onChange={(event) => setReportPeriod(event.target.value as 'weekly' | 'monthly')}>
                    <option value="weekly">Weekly Report</option>
                    <option value="monthly">Monthly Report</option>
                  </select>
                  <input required type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.csv" onChange={(event) => setReportFile(event.target.files?.[0] || null)} className="block w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-[11px] text-slate-700" />
                </div>
                <button className="mt-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white px-3.5 py-2 text-xs font-bold shadow-xs transition-colors">
                  Send Report for Approval
                </button>
              </form>
              <form onSubmit={submitRequest} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-900">Submit Request</div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <select className={input} value={requestType} onChange={(event) => setRequestType(event.target.value as 'funding' | 'leave')}>
                    <option value="funding">Funding / Loan Request</option>
                    <option value="leave">Leave Request</option>
                  </select>
                  <input value={requestType === 'funding' ? requestAmount : requestDates} onChange={(event) => requestType === 'funding' ? setRequestAmount(event.target.value) : setRequestDates(event.target.value)} placeholder={requestType === 'funding' ? 'Amount requested' : 'Dates requested'} className={input} />
                </div>
                <textarea required value={requestReason} onChange={(event) => setRequestReason(event.target.value)} placeholder="Reason and operational context" rows={3} className={`${input} mt-2`} />
                <button className="mt-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white px-3.5 py-2 text-xs font-bold shadow-xs transition-colors">
                  Submit Request
                </button>
              </form>
            </>
          )}
          <form onSubmit={submitMessage} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900">{isAdmin ? 'Broadcast to Field Staff' : 'Message Super Admin'}</div>
            <div className="mt-3 space-y-2">
              <input required value={messageSubject} onChange={(event) => setMessageSubject(event.target.value)} placeholder="Subject" className={input} />
              <textarea required value={messageBody} onChange={(event) => setMessageBody(event.target.value)} placeholder="Write an operational note or message..." rows={3} className={input} />
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <input type="file" onChange={(event) => setMessageFile(event.target.files?.[0] || null)} className="max-w-full text-[11px] text-slate-500" />
                <button className="rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-xs font-bold shadow-xs transition-colors">
                  Send Message
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="space-y-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-900">Inbox &amp; Notifications</div>
                <div className="mt-1 text-[11px] text-slate-500">{visibleMessages.length} messages available</div>
              </div>
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
            </div>
            <div className="mt-3 max-h-60 space-y-2 overflow-y-auto">
              {visibleMessages.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 p-5 text-center text-xs text-slate-500 bg-white">No messages yet.</div>
              ) : (
                visibleMessages.map((message) => (
                  <div key={message.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
                    <div className="flex justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900">{message.subject}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{new Date(message.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <div className="mt-1 text-[11px] text-slate-600">{message.body}</div>
                    <div className="mt-2 text-[10px] text-slate-400">From {message.senderName}{message.attachmentName ? ` · ${message.attachmentName}` : ''}</div>
                  </div>
                ))
              )}
            </div>
          </div>
          {isAdmin && (
            <>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Reports Awaiting Review <span className="text-emerald-700">({pendingReports.length})</span>
                </div>
                <div className="mt-3 space-y-2">
                  {pendingReports.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-slate-300 p-3 text-center text-xs text-slate-500 bg-white">No pending reports.</div>
                  ) : (
                    pendingReports.map((report) => (
                      <div key={report.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <div className="text-xs font-semibold text-slate-900">{report.senderName} · {report.period}</div>
                            <div className="text-[10px] text-slate-500">{report.fileName} · {new Date(report.submittedAt).toLocaleString()}</div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => reviewReport(report.id, 'accepted')} className="rounded-lg bg-emerald-500 text-white px-2.5 py-1 text-[10px] font-bold shadow-xs">Accept</button>
                            <button onClick={() => reviewReport(report.id, 'rejected')} className="rounded-lg border border-rose-300 text-rose-700 bg-rose-50 px-2.5 py-1 text-[10px] font-semibold">Reject</button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Funding &amp; Leave Approvals <span className="text-emerald-700">({pendingRequests.length})</span>
                </div>
                <div className="mt-3 space-y-2">
                  {pendingRequests.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-slate-300 p-3 text-center text-xs text-slate-500 bg-white">No pending requests.</div>
                  ) : (
                    pendingRequests.map((request) => (
                      <div key={request.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <div className="text-xs font-semibold text-slate-900">{request.senderName} · {request.type}</div>
                            <div className="text-[10px] text-slate-500">{request.amount || request.dates || 'No amount/date'} · {request.reason}</div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => reviewRequest(request.id, 'accepted')} className="rounded-lg bg-emerald-500 text-white px-2.5 py-1 text-[10px] font-bold shadow-xs">Accept</button>
                            <button onClick={() => reviewRequest(request.id, 'rejected')} className="rounded-lg border border-rose-300 text-rose-700 bg-rose-50 px-2.5 py-1 text-[10px] font-semibold">Reject</button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};
