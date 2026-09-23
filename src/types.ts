export type Region = 'All' | 'Lagos' | 'Ibadan' | 'Ogun' | 'Benin';

export type TenureFilter = 'All' | '0–3 Mo (New)' | '3–6 Mo (Mid)' | '6+ Mo';

export type TabType = 'active' | 'prospective' | 'archive';

export type AppRole = 'SUPER_ADMIN' | 'CEO' | 'OPS_DIRECTOR' | 'REGIONAL_SUPERVISOR' | 'AUDIT_LEAD' | 'VSR' | 'VSR_SUPERVISOR';

export interface LoginLocation {
  latitude?: number;
  longitude?: number;
  label: string;
  city?: string;
  country?: string;
  countryCode?: string;
  accuracy?: number;
  source: 'browser' | 'fallback';
}

export interface SessionMeta {
  signedInAt: string;
  timezone: string;
  location: LoginLocation;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  roleTitle: string;
  department: string;
  initials: string;
  avatarColor: string;
  assignedRegion: 'All' | 'Lagos' | 'Ibadan' | 'Ogun' | 'Benin';
  securityClearance: 'Level 5 (Unrestricted)' | 'Level 4 (Regional Ops)' | 'Level 3 (Audit & HR)';
  lastLogin?: string;
  platform?: 'admin' | 'vsr';
  sessionMeta?: SessionMeta;
}

export interface GeneratedCredential {
  user: AuthUser;
  passwordText: string;
  description: string;
  badge: string;
}

export type NavigationScreen =
  | 'operations'
  | 'merchandisers'
  | 'trends'
  | 'compliance'
  | 'head_office'
  | 'archive'
  | 'telemetry_preferences'
  | 'shift_compliance';

export interface RegionalShiftDayData {
  expectedHours: number;
  actualHours: number;
  varianceHours: number;
  adherenceRate: number;
  merchandiserCount: number;
  activePOS: number;
  onTimeStartRate: number;
  status: 'compliant' | 'minor_overrun' | 'major_overrun' | 'under_hours';
  notes?: string;
}

export interface DailyAdherenceRecord {
  date: string; // YYYY-MM-DD
  displayDate: string; // e.g. "23 Aug"
  dayOfWeek: string; // "Mon", "Tue", etc.
  isWeekend: boolean;
  Lagos: RegionalShiftDayData;
  Ibadan: RegionalShiftDayData;
  Ogun: RegionalShiftDayData;
  Benin: RegionalShiftDayData;
  aggregate: {
    expectedHours: number;
    actualHours: number;
    varianceHours: number;
    adherenceRate: number;
    totalMerchandisers: number;
    totalActivePOS: number;
    overallStatus: 'compliant' | 'minor_overrun' | 'major_overrun' | 'under_hours';
    operationalEvent?: string;
  };
}

export interface RegionComplianceSummary {
  region: 'All' | 'Lagos' | 'Ibadan' | 'Ogun' | 'Benin';
  displayName: string;
  standardDailyHours: number;
  standardShiftWindow: string;
  totalExpectedHours: number;
  totalActualHours: number;
  netVarianceHours: number;
  averageAdherenceRate: number;
  fullComplianceDays: number;
  minorOverrunDays: number;
  majorOverrunDays: number;
  underHourDays: number;
  avgMerchandisersOnDuty: number;
  color: string;
}

export interface DailyHubTelemetryPoint {
  date: string;
  displayDate: string;
  dayLabel: string;
  Lagos: number;
  Ibadan: number;
  Ogun: number;
  Benin: number;
  total: number;
  notes?: string;
}

export interface DirectiveMessage {
  id: string;
  sender: string;
  role: 'CEO' | 'TOPE (OPS)' | 'SYSTEM' | 'HR' | 'AUDIT';
  text: string;
  time: string;
  isOps?: boolean;
}

export type BoxType = 'audit' | 'blocker' | 'milestone' | 'onboarding';

export interface StaffRecord {
  id: string;
  name: string;
  initials: string;
  code: string;
  status: 'funded' | 'unfunded' | 'prospective' | 'archived';
  statusLabel: string;
  region: 'Lagos' | 'Ibadan' | 'Ogun' | 'Benin';
  location: string;
  tenureMonths: number;
  tenureDisplay: string;
  phone: string;
  hasLoan: boolean;
  loanAmount?: number;
  loanLabel: string;
  boxType: BoxType;
  boxHeaderTitle: string;
  boxHeaderTag: string;
  boxHighlightText?: string;
  thread: DirectiveMessage[];
  allocationAmount?: number;
  bankName?: string;
  accountNumber?: string;
  verificationStatus?: string;
  guarantorName?: string;
  posCount?: number;
  archivedReason?: string;
  archivedDate?: string;
}

export interface Requisition {
  id: string;
  title: string;
  department: 'Executive' | 'Finance & Ops' | 'Tech & Log.';
  location: string;
  applicantCount: number;
  status: 'active' | 'interviewing' | 'offer_out';
  salaryRange: string;
}

export interface FundingActionLog {
  id: string;
  amountText: string;
  time: string;
  description: string;
  type: 'disbursed' | 'hold';
}

export interface FieldMerchandiserHub {
  hub: 'Lagos' | 'Ibadan' | 'Ogun' | 'Benin';
  hubDisplayName: string;
  merchandiserCount: number;
  percentage: number;
  colorHex: string;
  activePOS: number;
  reconciliationRate: number;
  shiftStart?: string;
  telemetryIdleMinutes?: number;
  isShiftOverrun?: boolean;
  isIdleBreached?: boolean;
  idleThresholdMinutes?: number;
  idleAlertEnabled?: boolean;
  overrunAlertEnabled?: boolean;
}

export interface HubTelemetryPreference {
  hub: 'Lagos' | 'Ibadan' | 'Ogun' | 'Benin';
  hubDisplayName: string;
  shiftOverrunAlert: boolean; // toggle on/off Shift Overrun (>21:00 WAT)
  idleBreachAlert: boolean; // toggle on/off Idle Breach (heartbeat loss post opening)
  idleThresholdMinutes: number; // custom alert threshold for idle time in minutes (default 30)
}

export interface TelemetryPreferencesConfig {
  globalIdleThresholdMinutes: number; // global baseline threshold (default 30)
  enableSoundAlerts?: boolean;
  alertThrottleMinutes?: number; // deduplication window (e.g. 15m)
  hubs: Record<'Lagos' | 'Ibadan' | 'Ogun' | 'Benin', HubTelemetryPreference>;
  lastUpdatedWat?: string;
}

export interface HubShiftComplianceRecord {
  region: 'Lagos' | 'Ibadan' | 'Ogun' | 'Benin';
  hubDisplayName: string;
  merchandiserCount: number;
  activePOS: number;
  scheduledStart: string;
  scheduledEnd: string;
  scheduledDurationMinutes: number;
  actualStart: string;
  actualEnd: string;
  actualDurationMinutes: number;
  startVarianceMinutes: number;
  endVarianceMinutes: number;
  standardWindowDeltaMinutes: number;
  startStatus: 'on_time' | 'early' | 'delayed';
  endStatus: 'normal_signoff' | 'shift_overrun';
  complianceScore: number;
  notes: string;
}
