import { TelemetryPreferencesConfig } from '../types';
import { supabase, requireSupabaseClient } from '../lib/supabase';

export const DEFAULT_TELEMETRY_PREFERENCES: TelemetryPreferencesConfig = {
  globalIdleThresholdMinutes: 30,
  enableSoundAlerts: false,
  alertThrottleMinutes: 15,
  lastUpdatedWat: '08:00 WAT',
  hubs: {
    Lagos: {
      hub: 'Lagos',
      hubDisplayName: 'Southwest Hub (Lagos)',
      shiftOverrunAlert: true,
      idleBreachAlert: true,
      idleThresholdMinutes: 30
    },
    Ibadan: {
      hub: 'Ibadan',
      hubDisplayName: 'Oyo Cluster (Ibadan)',
      shiftOverrunAlert: true,
      idleBreachAlert: true,
      idleThresholdMinutes: 30
    },
    Ogun: {
      hub: 'Ogun',
      hubDisplayName: 'Ogun Hub (Abeokuta / Sagamu)',
      shiftOverrunAlert: true,
      idleBreachAlert: true,
      idleThresholdMinutes: 30
    },
    Benin: {
      hub: 'Benin',
      hubDisplayName: 'Edo Sector (Benin)',
      shiftOverrunAlert: true,
      idleBreachAlert: true,
      idleThresholdMinutes: 30
    }
  }
};

const STORAGE_KEY = 'kea_telemetry_preferences_v1';

async function persistTelemetryPreferencesToSupabase(prefs: TelemetryPreferencesConfig): Promise<void> {
  if (!supabase) return;

  try {
    const client = requireSupabaseClient();
    const existing = await client.from('telemetry_preferences').select('id').limit(1);
    if (existing.error) throw new Error(existing.error.message);

    const payload = {
      global_idle_threshold_minutes: prefs.globalIdleThresholdMinutes,
      enable_sound_alerts: prefs.enableSoundAlerts ?? true,
      alert_throttle_minutes: prefs.alertThrottleMinutes ?? 15,
      hubs: prefs.hubs,
      last_updated_wat: prefs.lastUpdatedWat ?? 'N/A'
    };

    if (existing.data && existing.data.length > 0) {
      const { error } = await client.from('telemetry_preferences').update(payload).eq('id', existing.data[0].id);
      if (error) throw new Error(error.message);
      return;
    }

    const { error } = await client.from('telemetry_preferences').insert(payload);
    if (error) throw new Error(error.message);
  } catch (error) {
    console.warn('Supabase telemetry write-back failed; localStorage copy remains intact.', error);
  }
}

export function loadTelemetryPreferences(): TelemetryPreferencesConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_TELEMETRY_PREFERENCES;
    const parsed = JSON.parse(raw) as TelemetryPreferencesConfig;
    if (!parsed.hubs || !parsed.hubs.Lagos || !parsed.hubs.Ibadan) {
      return DEFAULT_TELEMETRY_PREFERENCES;
    }
    return {
      ...DEFAULT_TELEMETRY_PREFERENCES,
      ...parsed,
      hubs: {
        Lagos: { ...DEFAULT_TELEMETRY_PREFERENCES.hubs.Lagos, ...parsed.hubs.Lagos },
        Ibadan: { ...DEFAULT_TELEMETRY_PREFERENCES.hubs.Ibadan, ...parsed.hubs.Ibadan },
        Ogun: { ...DEFAULT_TELEMETRY_PREFERENCES.hubs.Ogun, ...parsed.hubs.Ogun },
        Benin: { ...DEFAULT_TELEMETRY_PREFERENCES.hubs.Benin, ...parsed.hubs.Benin }
      }
    };
  } catch (err) {
    console.warn('Failed to parse telemetry preferences from localStorage, using defaults:', err);
    return DEFAULT_TELEMETRY_PREFERENCES;
  }
}

export function saveTelemetryPreferences(prefs: TelemetryPreferencesConfig): void {
  try {
    const now = new Date();
    const timeString = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Africa/Lagos',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(now);

    const updated: TelemetryPreferencesConfig = {
      ...prefs,
      lastUpdatedWat: `${timeString} WAT`
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    void persistTelemetryPreferencesToSupabase(updated);
  } catch (err) {
    console.error('Failed to save telemetry preferences to localStorage:', err);
  }
}
