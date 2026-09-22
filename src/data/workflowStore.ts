export type WorkflowRequestType = 'funding' | 'leave';
export type WorkflowStatus = 'pending' | 'accepted' | 'rejected';

export interface WorkflowReport { id: string; senderId: string; senderName: string; period: 'weekly' | 'monthly'; fileName: string; submittedAt: string; status: WorkflowStatus; reviewedAt?: string; reviewedBy?: string; }
export interface WorkflowRequest { id: string; senderId: string; senderName: string; type: WorkflowRequestType; amount?: string; dates?: string; reason: string; submittedAt: string; status: WorkflowStatus; reviewedAt?: string; reviewedBy?: string; }
export interface WorkflowMessage { id: string; senderId: string; senderName: string; audience: 'all' | string; subject: string; body: string; attachmentName?: string; createdAt: string; readBy: string[]; }
export interface WorkflowState { reports: WorkflowReport[]; requests: WorkflowRequest[]; messages: WorkflowMessage[]; }

const STORAGE_KEY = 'kea_workflow_state_v1';
const emptyState: WorkflowState = { reports: [], requests: [], messages: [] };
let cachedState = emptyState;
let socket: WebSocket | undefined;
let pollingTimer: number | undefined;
let remoteUnavailable = false;
const listeners = new Set<() => void>();

const readLocalState = (): WorkflowState => {
  try { return { ...emptyState, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') }; } catch { return emptyState; }
};
const notify = (state: WorkflowState) => { cachedState = state; localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); listeners.forEach((listener) => listener()); };
const apiRequest = async (path: string, method = 'GET', body?: unknown) => {
  const currentUser = JSON.parse(localStorage.getItem('kea_current_user') || 'null');
  const response = await fetch(`/api/workflow${path}`, { method, headers: { 'Content-Type': 'application/json', 'x-user-id': currentUser?.id || 'anonymous', 'x-user-name': currentUser?.name || 'Anonymous' }, body: body ? JSON.stringify(body) : undefined });
  if (!response.ok) throw new Error(`Workflow API request failed: ${response.status}`);
  return response.json() as Promise<WorkflowState>;
};
const sync = async () => {
  if (remoteUnavailable) return false;
  try {
    notify(await apiRequest('/state'));
    return true;
  } catch {
    remoteUnavailable = true;
    notify(cachedState.reports.length || cachedState.requests.length || cachedState.messages.length ? cachedState : readLocalState());
    return false;
  }
};

export const getWorkflowState = () => { cachedState = readLocalState(); void sync(); return cachedState; };
export const subscribeToWorkflow = (listener: () => void) => {
  listeners.add(listener);
  void sync().then((available) => {
    if (!available || pollingTimer || remoteUnavailable) return;
    pollingTimer = window.setInterval(() => void sync(), 5000);
    if (!socket && window.location.protocol !== 'file:') {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        socket = new WebSocket(`${protocol}//${window.location.host}/api/workflow/stream`);
        socket.onmessage = (event) => { const message = JSON.parse(event.data); if (message.type === 'workflow-state') notify(message.state); };
        socket.onclose = () => { socket = undefined; };
      } catch { socket = undefined; }
    }
  });
  return () => { listeners.delete(listener); };
};

const mutate = async (path: string, body: unknown, fallback: (state: WorkflowState) => WorkflowState) => {
  if (remoteUnavailable) { notify(fallback(cachedState)); return; }
  try { notify(await apiRequest(path, 'POST', body)); } catch { remoteUnavailable = true; notify(fallback(cachedState)); }
};

export const addReport = (report: Omit<WorkflowReport, 'id' | 'submittedAt' | 'status'>) => mutate('/reports', report, (state) => ({ ...state, reports: [{ ...report, id: `report-${Date.now()}`, submittedAt: new Date().toISOString(), status: 'pending' }, ...state.reports] }));
export const addRequest = (request: Omit<WorkflowRequest, 'id' | 'submittedAt' | 'status'>) => mutate('/requests', request, (state) => ({ ...state, requests: [{ ...request, id: `request-${Date.now()}`, submittedAt: new Date().toISOString(), status: 'pending' }, ...state.requests] }));
export const addMessage = (message: Omit<WorkflowMessage, 'id' | 'createdAt' | 'readBy'>) => mutate('/messages', message, (state) => ({ ...state, messages: [{ ...message, id: `message-${Date.now()}`, createdAt: new Date().toISOString(), readBy: [] }, ...state.messages] }));
export const reviewReport = (id: string, status: Exclude<WorkflowStatus, 'pending'>) => void mutate(`/reports/${id}/review`, { status }, (state) => state);
export const reviewRequest = (id: string, status: Exclude<WorkflowStatus, 'pending'>) => void mutate(`/requests/${id}/review`, { status }, (state) => state);
