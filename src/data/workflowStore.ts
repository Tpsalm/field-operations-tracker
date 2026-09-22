export type WorkflowRole = 'admin' | 'vsr';
export type WorkflowRequestType = 'funding' | 'leave';
export type WorkflowStatus = 'pending' | 'accepted' | 'rejected';

export interface WorkflowReport {
  id: string;
  senderId: string;
  senderName: string;
  period: 'weekly' | 'monthly';
  fileName: string;
  submittedAt: string;
  status: WorkflowStatus;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface WorkflowRequest {
  id: string;
  senderId: string;
  senderName: string;
  type: WorkflowRequestType;
  amount?: string;
  dates?: string;
  reason: string;
  submittedAt: string;
  status: WorkflowStatus;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface WorkflowMessage {
  id: string;
  senderId: string;
  senderName: string;
  audience: 'all' | string;
  subject: string;
  body: string;
  attachmentName?: string;
  createdAt: string;
  readBy: string[];
}

export interface WorkflowState {
  reports: WorkflowReport[];
  requests: WorkflowRequest[];
  messages: WorkflowMessage[];
}

const STORAGE_KEY = 'kea_workflow_state_v1';
const CHANNEL_NAME = 'kea-workflow-events-v1';
const emptyState: WorkflowState = { reports: [], requests: [], messages: [] };

const readState = (): WorkflowState => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    return parsed ? { ...emptyState, ...parsed } : emptyState;
  } catch {
    return emptyState;
  }
};

const writeState = (state: WorkflowState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent('kea-workflow-change'));
  try {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage({ type: 'workflow-change' });
    channel.close();
  } catch {
    // BroadcastChannel is unavailable in older browsers; storage events still work across tabs.
  }
};

export const getWorkflowState = () => readState();
export const subscribeToWorkflow = (listener: () => void) => {
  const handleChange = () => listener();
  window.addEventListener('kea-workflow-change', handleChange);
  window.addEventListener('storage', handleChange);
  let channel: BroadcastChannel | undefined;
  try {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.addEventListener('message', handleChange);
  } catch {
    channel = undefined;
  }
  return () => {
    window.removeEventListener('kea-workflow-change', handleChange);
    window.removeEventListener('storage', handleChange);
    channel?.close();
  };
};

export const updateWorkflowState = (updater: (state: WorkflowState) => WorkflowState) => {
  const next = updater(readState());
  writeState(next);
  return next;
};

export const createId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export const addReport = (report: Omit<WorkflowReport, 'id' | 'submittedAt' | 'status'>) => updateWorkflowState((state) => ({
  ...state,
  reports: [{ ...report, id: createId('report'), submittedAt: new Date().toISOString(), status: 'pending' }, ...state.reports]
}));

export const addRequest = (request: Omit<WorkflowRequest, 'id' | 'submittedAt' | 'status'>) => updateWorkflowState((state) => ({
  ...state,
  requests: [{ ...request, id: createId('request'), submittedAt: new Date().toISOString(), status: 'pending' }, ...state.requests]
}));

export const addMessage = (message: Omit<WorkflowMessage, 'id' | 'createdAt' | 'readBy'>) => updateWorkflowState((state) => ({
  ...state,
  messages: [{ ...message, id: createId('message'), createdAt: new Date().toISOString(), readBy: [] }, ...state.messages]
}));

export const reviewReport = (id: string, status: Exclude<WorkflowStatus, 'pending'>, reviewer: string) => updateWorkflowState((state) => ({
  ...state,
  reports: state.reports.map((report) => report.id === id ? { ...report, status, reviewedAt: new Date().toISOString(), reviewedBy: reviewer } : report),
  messages: [{ id: createId('message'), senderId: 'system', senderName: 'KEA Workflow', audience: state.reports.find((report) => report.id === id)?.senderId || 'all', subject: `Report ${status}`, body: `Your ${state.reports.find((report) => report.id === id)?.period || ''} report was ${status} by ${reviewer}.`, createdAt: new Date().toISOString(), readBy: [] }, ...state.messages]
}));

export const reviewRequest = (id: string, status: Exclude<WorkflowStatus, 'pending'>, reviewer: string) => updateWorkflowState((state) => {
  const request = state.requests.find((item) => item.id === id);
  return {
    ...state,
    requests: state.requests.map((item) => item.id === id ? { ...item, status, reviewedAt: new Date().toISOString(), reviewedBy: reviewer } : item),
    messages: request ? [{ id: createId('message'), senderId: 'system', senderName: 'KEA Workflow', audience: request.senderId, subject: `${request.type === 'funding' ? 'Funding' : 'Leave'} request ${status}`, body: `Your ${request.type} request was ${status} by ${reviewer}.`, createdAt: new Date().toISOString(), readBy: [] }, ...state.messages] : state.messages
  };
});
