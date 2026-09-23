import { supabase, requireSupabaseClient, isSupabaseReachable } from './supabase';
import {
  StaffRecord,
  Requisition,
  FundingActionLog,
  FieldMerchandiserHub,
  TelemetryPreferencesConfig,
  HubTelemetryPreference
} from '../types';

export type LiveDataStatus = {
  isUsingSupabase: boolean;
  error: string | null;
  source: 'local' | 'supabase';
};

export const DASHBOARD_PAGE_QUERY_MAP = {
  operations: {
    table: 'staff_records',
    select: 'id, name, initials, code, status, status_label, region, location, tenure_months, tenure_display, phone, has_loan, loan_amount, loan_label, box_type, box_header_title, box_header_tag, box_highlight_text, allocation_amount, bank_name, account_number, verification_status, guarantor_name, pos_count, archived_reason, archived_date, created_at, updated_at',
    order: 'created_at.desc'
  },
  head_office: {
    table: 'requisitions',
    select: 'id, title, department, location, applicant_count, status, salary_range, created_at, updated_at',
    order: 'created_at.desc'
  },
  funding: {
    table: 'funding_logs',
    select: 'id, amount_text, time, description, type, created_at, updated_at',
    order: 'created_at.desc'
  },
  merchandisers: {
    table: 'merchandiser_hubs',
    select: 'id, hub, hub_display_name, merchandiser_count, percentage, color_hex, active_pos, reconciliation_rate, shift_start, telemetry_idle_minutes, is_shift_overrun, is_idle_breached, idle_threshold_minutes, idle_alert_enabled, overrun_alert_enabled, created_at, updated_at',
    order: 'hub.asc'
  },
  telemetry_preferences: {
    table: 'telemetry_preferences',
    select: 'id, global_idle_threshold_minutes, enable_sound_alerts, alert_throttle_minutes, hubs, last_updated_wat, created_at, updated_at',
    limit: 1
  },
  admin_notifications: {
    table: 'notifications',
    select: 'id, title, detail, time, type, unread, created_at, updated_at',
    order: 'created_at.desc',
    limit: 12
  }
} as const;

const normalizeStaffRecord = (row: any): StaffRecord => ({
  id: row.id ?? 'staff-unknown',
  name: row.name ?? 'Unknown staff member',
  initials: row.initials ?? (row.name ? row.name.split(' ').map((part: string) => part[0]).slice(0, 2).join('').toUpperCase() : 'NA'),
  code: row.code ?? 'N/A',
  status: (row.status ?? 'prospective') as StaffRecord['status'],
  statusLabel: row.status_label ?? row.status ?? 'Pending review',
  region: (row.region ?? 'Lagos') as StaffRecord['region'],
  location: row.location ?? 'Unassigned region',
  tenureMonths: Number(row.tenure_months ?? 0),
  tenureDisplay: row.tenure_display ?? `${Number(row.tenure_months ?? 0)} mo`,
  phone: row.phone ?? 'N/A',
  hasLoan: Boolean(row.has_loan),
  loanAmount: row.loan_amount ?? 0,
  loanLabel: row.loan_label ?? 'No active loan',
  boxType: (row.box_type ?? 'audit') as StaffRecord['boxType'],
  boxHeaderTitle: row.box_header_title ?? 'Operations profile',
  boxHeaderTag: row.box_header_tag ?? 'Live profile',
  boxHighlightText: row.box_highlight_text ?? '',
  thread: Array.isArray(row.thread) ? row.thread : [],
  allocationAmount: row.allocation_amount ?? 0,
  bankName: row.bank_name ?? 'N/A',
  accountNumber: row.account_number ?? 'N/A',
  verificationStatus: row.verification_status ?? 'Pending verification',
  guarantorName: row.guarantor_name ?? 'N/A',
  posCount: Number(row.pos_count ?? 0),
  archivedReason: row.archived_reason ?? '',
  archivedDate: row.archived_date ?? ''
});

const normalizeRequisition = (row: any): Requisition => ({
  id: row.id ?? `req-${Math.random()}`,
  title: row.title ?? 'Open requisition',
  department: (row.department ?? 'Tech & Log.') as Requisition['department'],
  location: row.location ?? 'HQ',
  applicantCount: Number(row.applicant_count ?? 0),
  status: (row.status ?? 'active') as Requisition['status'],
  salaryRange: row.salary_range ?? 'Not specified'
});

const normalizeFundingLog = (row: any): FundingActionLog => ({
  id: row.id ?? `log-${Math.random()}`,
  amountText: row.amount_text ?? '₦0',
  time: row.time ?? (row.created_at ? new Date(row.created_at).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }) : 'Just now'),
  description: row.description ?? 'No description',
  type: (row.type ?? 'disbursed') as FundingActionLog['type']
});

const normalizeHub = (row: any): FieldMerchandiserHub => ({
  hub: (row.hub ?? 'Lagos') as FieldMerchandiserHub['hub'],
  hubDisplayName: row.hub_display_name ?? row.hub ?? 'Lagos',
  merchandiserCount: Number(row.merchandiser_count ?? 0),
  percentage: Number(row.percentage ?? 0),
  colorHex: row.color_hex ?? '#92C842',
  activePOS: Number(row.active_pos ?? 0),
  reconciliationRate: Number(row.reconciliation_rate ?? 0),
  shiftStart: row.shift_start ?? '08:00 WAT',
  telemetryIdleMinutes: Number(row.telemetry_idle_minutes ?? 0),
  isShiftOverrun: Boolean(row.is_shift_overrun),
  isIdleBreached: Boolean(row.is_idle_breached),
  idleThresholdMinutes: Number(row.idle_threshold_minutes ?? 30),
  idleAlertEnabled: row.idle_alert_enabled ?? true,
  overrunAlertEnabled: row.overrun_alert_enabled ?? true
});

const normalizeTelemetryPreferences = (row: any): TelemetryPreferencesConfig | null => {
  if (!row) return null;

  const hubValues = row.hubs ?? {};
  const defaultHubValues = {
    Lagos: { hub: 'Lagos', hubDisplayName: 'Lagos', shiftOverrunAlert: true, idleBreachAlert: true, idleThresholdMinutes: 30 },
    Ibadan: { hub: 'Ibadan', hubDisplayName: 'Ibadan', shiftOverrunAlert: true, idleBreachAlert: true, idleThresholdMinutes: 30 },
    Ogun: { hub: 'Ogun', hubDisplayName: 'Ogun', shiftOverrunAlert: true, idleBreachAlert: true, idleThresholdMinutes: 30 },
    Benin: { hub: 'Benin', hubDisplayName: 'Benin', shiftOverrunAlert: true, idleBreachAlert: true, idleThresholdMinutes: 30 }
  } as const;

  const normalizedHubs: Record<'Lagos' | 'Ibadan' | 'Ogun' | 'Benin', HubTelemetryPreference> = {
    Lagos: { ...defaultHubValues.Lagos, ...(hubValues.Lagos ?? {}) },
    Ibadan: { ...defaultHubValues.Ibadan, ...(hubValues.Ibadan ?? {}) },
    Ogun: { ...defaultHubValues.Ogun, ...(hubValues.Ogun ?? {}) },
    Benin: { ...defaultHubValues.Benin, ...(hubValues.Benin ?? {}) }
  };

  return {
    globalIdleThresholdMinutes: Number(row.global_idle_threshold_minutes ?? 30),
    enableSoundAlerts: row.enable_sound_alerts ?? true,
    alertThrottleMinutes: Number(row.alert_throttle_minutes ?? 15),
    hubs: normalizedHubs,
    lastUpdatedWat: row.last_updated_wat ?? undefined
  };
};

export async function fetchNotifications(limit = 12) {
  if (!supabase) return [];

  const client = requireSupabaseClient();
  const { data, error } = await client.from('notifications').select('id, title, detail, time, type, unread, created_at').order('created_at', { ascending: false }).limit(limit);

  if (error || !data) return [];

  return data.map((item: any) => ({
    id: item.id,
    title: item.title ?? 'Operations notification',
    detail: item.detail ?? '',
    time: item.time ?? new Date(item.created_at).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }),
    type: (item.type ?? 'info') as 'alert' | 'success' | 'info',
    unread: Boolean(item.unread)
  }));
}

export async function upsertStaffRecord(staffRecord: Partial<StaffRecord> & { id?: string }) {
  if (!supabase) return null;

  const client = requireSupabaseClient();
  const payload = {
    id: staffRecord.id ?? crypto.randomUUID(),
    name: staffRecord.name ?? 'Unknown staff member',
    initials: staffRecord.initials ?? 'NA',
    code: staffRecord.code ?? 'N/A',
    status: staffRecord.status ?? 'prospective',
    status_label: staffRecord.statusLabel ?? staffRecord.status ?? 'Pending review',
    region: staffRecord.region ?? 'Lagos',
    location: staffRecord.location ?? 'Unassigned region',
    tenure_months: Number(staffRecord.tenureMonths ?? 0),
    tenure_display: staffRecord.tenureDisplay ?? `${Number(staffRecord.tenureMonths ?? 0)} mo`,
    phone: staffRecord.phone ?? 'N/A',
    has_loan: Boolean(staffRecord.hasLoan),
    loan_amount: Number(staffRecord.loanAmount ?? 0),
    loan_label: staffRecord.loanLabel ?? 'No active loan',
    box_type: staffRecord.boxType ?? 'audit',
    box_header_title: staffRecord.boxHeaderTitle ?? 'Operations profile',
    box_header_tag: staffRecord.boxHeaderTag ?? 'Live profile',
    box_highlight_text: staffRecord.boxHighlightText ?? '',
    allocation_amount: Number(staffRecord.allocationAmount ?? 0),
    bank_name: staffRecord.bankName ?? 'N/A',
    account_number: staffRecord.accountNumber ?? 'N/A',
    verification_status: staffRecord.verificationStatus ?? 'Pending verification',
    guarantor_name: staffRecord.guarantorName ?? 'N/A',
    pos_count: Number(staffRecord.posCount ?? 0),
    archived_reason: staffRecord.archivedReason ?? '',
    archived_date: staffRecord.archivedDate ?? ''
  };

  const { data, error } = staffRecord.id
    ? await client.from('staff_records').update(payload).eq('id', staffRecord.id).select('*').single()
    : await client.from('staff_records').insert(payload).select('*').single();

  if (error) throw new Error(error.message);
  return data;
}

export async function insertRequisition(requisition: Requisition) {
  if (!supabase) return null;

  const client = requireSupabaseClient();
  const payload = {
    title: requisition.title,
    department: requisition.department,
    location: requisition.location,
    applicant_count: requisition.applicantCount,
    status: requisition.status,
    salary_range: requisition.salaryRange
  };

  const { data, error } = await client.from('requisitions').insert(payload).select('*').single();
  if (error) throw new Error(error.message);
  return data;
}

export async function insertFundingLog(log: FundingActionLog) {
  if (!supabase) return null;

  const client = requireSupabaseClient();
  const payload = {
    amount_text: log.amountText,
    time: log.time,
    description: log.description,
    type: log.type
  };

  const { data, error } = await client.from('funding_logs').insert(payload).select('*').single();
  if (error) throw new Error(error.message);
  return data;
}

export async function upsertTelemetryPreferences(preferences: TelemetryPreferencesConfig) {
  if (!supabase) return null;

  const client = requireSupabaseClient();
  const existing = await client.from('telemetry_preferences').select('id').limit(1);
  const payload = {
    global_idle_threshold_minutes: preferences.globalIdleThresholdMinutes,
    enable_sound_alerts: preferences.enableSoundAlerts ?? true,
    alert_throttle_minutes: preferences.alertThrottleMinutes ?? 15,
    hubs: preferences.hubs,
    last_updated_wat: preferences.lastUpdatedWat ?? new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Africa/Lagos',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(new Date()) + ' WAT'
  };

  if (existing.error) throw new Error(existing.error.message);

  const { data, error } = existing.data && existing.data.length > 0
    ? await client.from('telemetry_preferences').update(payload).eq('id', existing.data[0].id).select('*').single()
    : await client.from('telemetry_preferences').insert(payload).select('*').single();

  if (error) throw new Error(error.message);
  return data;
}

export async function insertNotification(notification: {
  title: string;
  detail: string;
  time: string;
  type: 'alert' | 'success' | 'info';
  unread?: boolean;
}) {
  if (!supabase) return null;

  const client = requireSupabaseClient();
  const payload = {
    title: notification.title,
    detail: notification.detail,
    time: notification.time,
    type: notification.type,
    unread: notification.unread ?? true
  };

  const { data, error } = await client.from('notifications').insert(payload).select('*').single();
  if (error) throw new Error(error.message);
  return data;
}

export async function insertDirective(directive: {
  staff_record_id?: string | null;
  sender?: string;
  role?: string;
  text: string;
  time: string;
  is_ops?: boolean;
}) {
  if (!supabase) return null;

  const client = requireSupabaseClient();
  const payload = {
    staff_record_id: directive.staff_record_id ?? null,
    sender: directive.sender ?? 'CEO',
    role: directive.role ?? 'CEO',
    text: directive.text,
    time: directive.time,
    is_ops: directive.is_ops ?? false
  };

  const { data, error } = await client.from('directives').insert(payload).select('*').single();
  if (error) throw new Error(error.message);
  return data;
}

export async function loadDashboardData(): Promise<{
  staff: StaffRecord[];
  requisitions: Requisition[];
  fundingLogs: FundingActionLog[];
  hubs: FieldMerchandiserHub[];
  telemetryPreferences: TelemetryPreferencesConfig | null;
  status: LiveDataStatus;
}> {
  if (!supabase) {
    return {
      staff: [],
      requisitions: [],
      fundingLogs: [],
      hubs: [],
      telemetryPreferences: null,
      status: {
        isUsingSupabase: false,
        error: null,
        source: 'local'
      }
    };
  }

  try {
    const isReachable = await isSupabaseReachable();
    if (!isReachable) {
      return {
        staff: [],
        requisitions: [],
        fundingLogs: [],
        hubs: [],
        telemetryPreferences: null,
        status: {
          isUsingSupabase: false,
          error: 'Supabase project is unavailable or the schema is not yet created.',
          source: 'local'
        }
      };
    }

    const client = requireSupabaseClient();

    const [staffResult, requisitionsResult, fundingResult, hubsResult, prefsResult] = await Promise.all([
      client.from('staff_records').select(DASHBOARD_PAGE_QUERY_MAP.operations.select).order('created_at', { ascending: false }),
      client.from('requisitions').select(DASHBOARD_PAGE_QUERY_MAP.head_office.select).order('created_at', { ascending: false }),
      client.from('funding_logs').select(DASHBOARD_PAGE_QUERY_MAP.funding.select).order('created_at', { ascending: false }),
      client.from('merchandiser_hubs').select(DASHBOARD_PAGE_QUERY_MAP.merchandisers.select).order('hub', { ascending: true }),
      client.from('telemetry_preferences').select(DASHBOARD_PAGE_QUERY_MAP.telemetry_preferences.select).limit(1)
    ]);

    if (staffResult.error || requisitionsResult.error || fundingResult.error || hubsResult.error || prefsResult.error) {
      return {
        staff: [],
        requisitions: [],
        fundingLogs: [],
        hubs: [],
        telemetryPreferences: null,
        status: {
          isUsingSupabase: false,
          error: [staffResult.error, requisitionsResult.error, fundingResult.error, hubsResult.error, prefsResult.error]
            .filter(Boolean)
            .map((item) => item?.message)
            .join('; '),
          source: 'local'
        }
      };
    }

    return {
      staff: (staffResult.data ?? []).map(normalizeStaffRecord),
      requisitions: (requisitionsResult.data ?? []).map(normalizeRequisition),
      fundingLogs: (fundingResult.data ?? []).map(normalizeFundingLog),
      hubs: (hubsResult.data ?? []).map(normalizeHub),
      telemetryPreferences: normalizeTelemetryPreferences(prefsResult.data?.[0] ?? null),
      status: {
        isUsingSupabase: true,
        error: null,
        source: 'supabase'
      }
    };
  } catch (error) {
    return {
      staff: [],
      requisitions: [],
      fundingLogs: [],
      hubs: [],
      telemetryPreferences: null,
      status: {
        isUsingSupabase: false,
        error: error instanceof Error ? error.message : 'Unknown Supabase load error',
        source: 'local'
      }
    };
  }
}

export async function signInWithSupabase(email: string, password: string) {
  const client = requireSupabaseClient();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) {
    throw new Error(error.message);
  }
  return data.user;
}

export async function signOutSupabase() {
  const client = requireSupabaseClient();
  const { error } = await client.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
}
