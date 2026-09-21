import { DailyHubTelemetryPoint } from '../types';

export const SEVEN_DAY_TELEMETRY_TRENDS: DailyHubTelemetryPoint[] = [
  {
    date: '2026-09-15',
    displayDate: 'Mon 15 Sep',
    dayLabel: 'Mon',
    Lagos: 642,
    Ibadan: 312,
    Ogun: 198,
    Benin: 162,
    total: 1314,
    notes: 'Shift cycle reset across Southwest zones; early Marina CMS provisioning'
  },
  {
    date: '2026-09-16',
    displayDate: 'Tue 16 Sep',
    dayLabel: 'Tue',
    Lagos: 655,
    Ibadan: 320,
    Ogun: 204,
    Benin: 168,
    total: 1347,
    notes: 'Sagamu Trade Express node reconnected; Bodija cluster at 94% telemetry'
  },
  {
    date: '2026-09-17',
    displayDate: 'Wed 17 Sep',
    dayLabel: 'Wed',
    Lagos: 668,
    Ibadan: 328,
    Ogun: 210,
    Benin: 171,
    total: 1377,
    notes: 'Mid-week inventory restocking spike across Otigba Computer Village'
  },
  {
    date: '2026-09-18',
    displayDate: 'Thu 18 Sep',
    dayLabel: 'Thu',
    Lagos: 674,
    Ibadan: 335,
    Ogun: 215,
    Benin: 174,
    total: 1398,
    notes: 'Benin Ring Road CBD commercial expansion; 100% heartbeat retention'
  },
  {
    date: '2026-09-19',
    displayDate: 'Fri 19 Sep',
    dayLabel: 'Fri',
    Lagos: 691,
    Ibadan: 342,
    Ogun: 219,
    Benin: 179,
    total: 1431,
    notes: 'Peak wholesale throughput; Lagos Ikeja City Mall recording 156 tx/hr'
  },
  {
    date: '2026-09-20',
    displayDate: 'Sat 20 Sep',
    dayLabel: 'Sat',
    Lagos: 684,
    Ibadan: 338,
    Ogun: 224,
    Benin: 182,
    total: 1428,
    notes: 'Weekend retail rush; Ogun Abeokuta Panseke Depot peak active telemetry'
  },
  {
    date: '2026-09-21',
    displayDate: 'Sun 21 Sep',
    dayLabel: 'Sun (Today)',
    dayLabelFull: 'Sunday 21 Sep 2026',
    Lagos: 680,
    Ibadan: 340,
    Ogun: 220,
    Benin: 180,
    total: 1420,
    notes: 'All 4 Regional Hubs operating at full standard shift compliance (07:00-21:00 WAT)'
  } as DailyHubTelemetryPoint & { dayLabelFull: string }
];

export interface HubTrendConfig {
  key: 'Lagos' | 'Ibadan' | 'Ogun' | 'Benin';
  name: string;
  shortName: string;
  color: string;
  nominalCapacity: number;
  hubHead: string;
  telemetryWindow: string;
}

export const HUB_TREND_CONFIGS: Record<'Lagos' | 'Ibadan' | 'Ogun' | 'Benin', HubTrendConfig> = {
  Lagos: {
    key: 'Lagos',
    name: 'Southwest Hub (Lagos)',
    shortName: 'Lagos',
    color: '#92C842',
    nominalCapacity: 680,
    hubHead: 'Oluwaseun Babatunde / Tope Balogun',
    telemetryWindow: '07:00 - 21:00 WAT'
  },
  Ibadan: {
    key: 'Ibadan',
    name: 'Oyo Cluster (Ibadan)',
    shortName: 'Ibadan',
    color: '#22d3ee',
    nominalCapacity: 340,
    hubHead: 'Adewale Adeleke',
    telemetryWindow: '07:30 - 21:00 WAT'
  },
  Ogun: {
    key: 'Ogun',
    name: 'Ogun Hub (Abeokuta / Sagamu)',
    shortName: 'Ogun',
    color: '#F17F31',
    nominalCapacity: 220,
    hubHead: 'Folake Ibikunle',
    telemetryWindow: '08:00 - 21:00 WAT'
  },
  Benin: {
    key: 'Benin',
    name: 'Edo Sector (Benin)',
    shortName: 'Benin',
    color: '#c084fc',
    nominalCapacity: 180,
    hubHead: 'Efeosa Erhabor',
    telemetryWindow: '08:00 - 21:00 WAT'
  }
};
