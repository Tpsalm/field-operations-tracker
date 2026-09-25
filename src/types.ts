export type Region = 'All' | 'Lagos' | 'Ibadan' | 'Ogun' | 'Benin';

export type TenureFilter = 'All' | '0–3 Mo (New)' | '3–6 Mo (Mid)' | '6+ Mo';

export type TabType = 'active' | 'prospective' | 'archive';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'CEO' | 'OPS_DIRECTOR' | 'REGIONAL_SUPERVISOR' | 'AUDIT_LEAD';
  roleTitle: string;
  department: string;
  initials: string;
  avatarColor: string;
  assignedRegion: 'All' | 'Lagos' | 'Ibadan' | 'Ogun' | 'Benin';
  securityClearance: 'Level 5 (Unrestricted)' | 'Level 4 (Regional Ops)' | 'Level 3 (Audit & HR)';
  lastLogin?: string;
}

export interface GeneratedCredential {
  user: AuthUser;
  passwordText: string;
  description: string;
  badge: string;
}

export type NavigationScreen =
  | 'overall_dashboard'
  | 'shift_adherence_30d'
  | 'vsr_location_audit'
  | 'operations'
  | 'merchandisers'
  | 'gps_tracker'
  | 'vsr_recruitment'
  | 'trends'
  | 'compliance'
  | 'archive';

export interface VsrLocationAuditRecord {
  id: string;
  vsrCode: string;
  vsrName: string;
  phone: string;
  hub: 'Lagos' | 'Ibadan' | 'Ogun' | 'Benin';
  corridor: string;
  assignedStore: string;
  assignedStoreCoords: { lat: number; lng: number };

  // Sign-In Details
  signInTimeWat: string;
  signInDate: string;
  signInLocationName: string;
  signInAddress: string;
  signInCoords: { lat: number; lng: number };
  signInDistanceMeters: number;
  signInGeofenceStatus: 'in_store' | 'near_store' | 'out_of_bounds';
  signInAccuracyMeters: number;
  signInOnTimeStatus: 'on_time' | 'early' | 'late';

  // Sign-Out Details
  signOutTimeWat: string | null;
  signOutDate?: string;
  signOutLocationName: string | null;
  signOutAddress: string | null;
  signOutCoords: { lat: number; lng: number } | null;
  signOutDistanceMeters?: number;
  signOutGeofenceStatus?: 'in_store' | 'near_store' | 'out_of_bounds' | null;

  // Duration & Closing Adherence (21:00 WAT cutoff)
  totalHoursFormatted: string;
  totalHoursDecimal: number;
  closingComplianceStatus:
    | 'on_time_signout'
    | 'minor_overrun'
    | 'major_overrun'
    | 'early_signout'
    | 'active_shift'
    | 'missing_signout';

  // Telemetry & Hardware Security
  deviceModel: string;
  networkCarrier: string;
  ipAddress: string;
  batteryPct: number;
  verificationMethod:
    | 'GPS Geofence + QR'
    | 'GPS Geofence'
    | 'Store QR Code'
    | 'Supervisor Override'
    | 'Biometric Face Match';

  // Audit Verification
  auditStatus: 'verified' | 'flagged' | 'pending_review';
  auditFlagReason?: string;
  auditNotes?: string;
  supervisorName?: string;
}

export interface WorkerGpsSignIn {
  id: string;
  workerName: string;
  workerCode: string;
  workerPhone: string;
  assignedStore: string;
  assignedHub: 'Lagos' | 'Ibadan' | 'Ogun' | 'Benin';
  signInTimeWat: string;
  signInDate: string;
  latitude: number;
  longitude: number;
  locationAddress: string;
  geofenceStatus: 'in_store' | 'near_store' | 'out_of_bounds';
  distanceMeters: number;
  batteryPct: number;
  deviceModel: string;
  networkCarrier: string;
  verificationMethod: 'GPS Geofence' | 'Store QR Code' | 'Manager Override';
  status: 'approved' | 'flagged' | 'pending_review';
  liveIpAddress?: string;
  signInAccuracyMeters?: number;
}

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
