import express from 'express';
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer } from 'ws';

const root = dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 10000);
const dataDirectory = process.env.WORKFLOW_DATA_DIR || join(root, 'data');
const dataFile = join(dataDirectory, 'workflow-state.json');
const emptyState = { reports: [], requests: [], messages: [] };

mkdirSync(dataDirectory, { recursive: true });
const readState = () => {
  try {
    return { ...emptyState, ...JSON.parse(readFileSync(dataFile, 'utf8')) };
  } catch {
    return emptyState;
  }
};
const saveState = (state) => writeFileSync(dataFile, JSON.stringify(state, null, 2));
const id = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const now = () => new Date().toISOString();
const actor = (request) => ({ id: request.header('x-user-id') || 'unknown', name: request.header('x-user-name') || 'Unknown user' });

const app = express();
app.use(express.json({ limit: '2mb' }));
app.get('/api/health', (_request, response) => response.json({ ok: true, service: 'kea-workflow-api', time: now() }));
app.get('/api/workflow/state', (_request, response) => response.json(readState()));

const broadcast = (state) => {
  const payload = JSON.stringify({ type: 'workflow-state', state });
  sockets.forEach((socket) => {
    if (socket.readyState === 1) socket.send(payload);
  });
};
const mutate = (change, response) => {
  const state = readState();
  const next = change(state);
  saveState(next);
  broadcast(next);
  response.status(201).json(next);
};

app.post('/api/workflow/reports', (request, response) => {
  const user = actor(request);
  const { period, fileName } = request.body || {};
  if (!user.id || !fileName || !['weekly', 'monthly'].includes(period)) return response.status(400).json({ error: 'period and fileName are required' });
  mutate((state) => ({ ...state, reports: [{ id: id('report'), senderId: user.id, senderName: user.name, period, fileName, submittedAt: now(), status: 'pending' }, ...state.reports] }), response);
});

app.post('/api/workflow/requests', (request, response) => {
  const user = actor(request);
  const { type, amount, dates, reason } = request.body || {};
  if (!reason || !['funding', 'leave'].includes(type)) return response.status(400).json({ error: 'type and reason are required' });
  mutate((state) => ({ ...state, requests: [{ id: id('request'), senderId: user.id, senderName: user.name, type, amount, dates, reason, submittedAt: now(), status: 'pending' }, ...state.requests] }), response);
});

app.post('/api/workflow/messages', (request, response) => {
  const user = actor(request);
  const { audience, subject, body, attachmentName } = request.body || {};
  if (!subject || !body) return response.status(400).json({ error: 'subject and body are required' });
  mutate((state) => ({ ...state, messages: [{ id: id('message'), senderId: user.id, senderName: user.name, audience: audience || 'all', subject, body, attachmentName, createdAt: now(), readBy: [] }, ...state.messages] }), response);
});

app.post('/api/workflow/reports/:reportId/review', (request, response) => {
  const user = actor(request);
  const status = request.body?.status;
  if (!['accepted', 'rejected'].includes(status)) return response.status(400).json({ error: 'Invalid review status' });
  mutate((state) => {
    const report = state.reports.find((item) => item.id === request.params.reportId);
    if (!report) return state;
    return { ...state, reports: state.reports.map((item) => item.id === report.id ? { ...item, status, reviewedAt: now(), reviewedBy: user.name } : item), messages: [{ id: id('message'), senderId: 'system', senderName: 'KEA Workflow', audience: report.senderId, subject: `Report ${status}`, body: `Your ${report.period} report was ${status} by ${user.name}.`, createdAt: now(), readBy: [] }, ...state.messages] };
  }, response);
});

app.post('/api/workflow/requests/:requestId/review', (request, response) => {
  const user = actor(request);
  const status = request.body?.status;
  if (!['accepted', 'rejected'].includes(status)) return response.status(400).json({ error: 'Invalid review status' });
  mutate((state) => {
    const item = state.requests.find((requestItem) => requestItem.id === request.params.requestId);
    if (!item) return state;
    return { ...state, requests: state.requests.map((requestItem) => requestItem.id === item.id ? { ...requestItem, status, reviewedAt: now(), reviewedBy: user.name } : requestItem), messages: [{ id: id('message'), senderId: 'system', senderName: 'KEA Workflow', audience: item.senderId, subject: `${item.type === 'funding' ? 'Funding' : 'Leave'} request ${status}`, body: `Your ${item.type} request was ${status} by ${user.name}.`, createdAt: now(), readBy: [] }, ...state.messages] };
  }, response);
});

const dist = join(root, 'dist');
app.use(express.static(dist));
app.get('*', (_request, response) => response.sendFile(join(dist, 'index.html')));

const server = createServer(app);
const sockets = new Set();
const webSocketServer = new WebSocketServer({ server, path: '/api/workflow/stream' });
webSocketServer.on('connection', (socket) => { sockets.add(socket); socket.send(JSON.stringify({ type: 'workflow-state', state: readState() })); socket.on('close', () => sockets.delete(socket)); });
server.listen(port, () => console.log(`KEA workflow server listening on ${port}`));
