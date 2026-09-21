import { DailyAdherenceRecord, RegionComplianceSummary } from '../types';

/**
 * 30-Day Shift Adherence Dataset
 * Timeframe: 23 August 2026 to 21 September 2026 (Local time benchmark: 2026-09-21 WAT)
 * Standard Shift Parameters (WAT Zone):
 * - Lagos: 14.0h expected weekdays (07:00-21:00), 13.0h Sat, 12.0h Sun
 * - Ibadan: 13.5h expected weekdays (07:30-21:00), 12.5h Sat, 11.5h Sun
 * - Ogun: 13.0h expected weekdays (08:00-21:00), 12.0h Sat, 11.0h Sun
 * - Benin: 13.0h expected weekdays (08:00-21:00), 12.0h Sat, 11.0h Sun
 */

const raw30Days = [
  { date: '2026-08-23', day: 'Sun', isW: true, los: [12.0, 12.0, 0.0, 99.4, 34, 620, 'Sunday scheduled shift - on-time signoff across all nodes'], ibd: [11.5, 11.4, -0.1, 98.8, 17, 305, 'Normal close'], ogn: [11.0, 11.1, 0.1, 99.1, 10, 195, 'On-time'], ben: [11.0, 10.9, -0.1, 98.6, 9, 155, 'Prompt signoff'] },
  { date: '2026-08-24', day: 'Mon', isW: false, los: [14.0, 14.1, 0.1, 99.2, 38, 635, 'Monday morning rollout smooth across CMS Marina'], ibd: [13.5, 13.6, 0.1, 99.0, 19, 310, 'On-time sync'], ogn: [13.0, 13.0, 0.0, 99.8, 12, 200, 'Exact standard adherence'], ben: [13.0, 13.1, 0.1, 99.0, 10, 160, 'All POS active'] },
  { date: '2026-08-25', day: 'Tue', isW: false, los: [14.0, 13.9, -0.1, 99.1, 38, 640, 'Early depot closure in Ikeja'], ibd: [13.5, 13.5, 0.0, 99.7, 19, 312, '100% adherence'], ogn: [13.0, 12.9, -0.1, 98.9, 12, 202, 'Early signoff'], ben: [13.0, 13.0, 0.0, 99.5, 10, 162, 'Normal shift'] },
  { date: '2026-08-26', day: 'Wed', isW: false, los: [14.0, 14.2, 0.2, 98.5, 38, 645, 'Mid-week restock queue at Alaba Mart'], ibd: [13.5, 13.7, 0.2, 98.2, 19, 315, '12m minor overrun on audit'], ogn: [13.0, 13.1, 0.1, 99.0, 12, 204, 'Compliant'], ben: [13.0, 13.0, 0.0, 99.6, 10, 162, 'Shift compliant'] },
  { date: '2026-08-27', day: 'Thu', isW: false, los: [14.0, 14.0, 0.0, 99.6, 38, 650, 'Standard 14h window achieved'], ibd: [13.5, 13.4, -0.1, 99.0, 19, 318, 'Normal'], ogn: [13.0, 13.0, 0.0, 99.4, 12, 205, 'Normal'], ben: [13.0, 12.9, -0.1, 98.8, 10, 164, 'Rain in Ring Road, early finish'] },
  { date: '2026-08-28', day: 'Fri', isW: false, los: [14.0, 14.5, 0.5, 96.2, 39, 660, 'Weekend wholesale rush in Trade Fair; +30m shift overrun'], ibd: [13.5, 13.9, 0.4, 96.8, 19, 322, 'Dugbe restock queue overrun'], ogn: [13.0, 13.3, 0.3, 97.4, 12, 208, 'Sagamu interchange queue'], ben: [13.0, 13.2, 0.2, 98.1, 10, 168, 'Wholesale signoffs'] },
  { date: '2026-08-29', day: 'Sat', isW: true, los: [13.0, 13.2, 0.2, 98.3, 36, 640, 'Saturday retail traffic in Lekki Corridor'], ibd: [12.5, 12.5, 0.0, 99.5, 18, 315, 'Exact adherence'], ogn: [12.0, 12.1, 0.1, 99.0, 11, 202, 'On-time'], ben: [12.0, 12.0, 0.0, 99.4, 10, 165, 'Full shift compliance'] },
  { date: '2026-08-30', day: 'Sun', isW: true, los: [12.0, 11.9, -0.1, 99.0, 34, 622, 'Sunday shift completed on schedule'], ibd: [11.5, 11.5, 0.0, 99.6, 17, 308, 'All terminals signed off'], ogn: [11.0, 11.0, 0.0, 99.7, 10, 198, 'Normal'], ben: [11.0, 10.9, -0.1, 98.7, 9, 158, 'Smooth audit signoff'] },
  { date: '2026-08-31', day: 'Mon', isW: false, los: [14.0, 14.0, 0.0, 99.7, 38, 648, 'Month-end reconciliation smoothly logged'], ibd: [13.5, 13.6, 0.1, 99.1, 19, 320, 'Bodija replenishment verified'], ogn: [13.0, 13.0, 0.0, 99.5, 12, 206, 'On-time start 08:00'], ben: [13.0, 13.0, 0.0, 99.3, 10, 166, 'On-time start 08:00'] },
  { date: '2026-09-01', day: 'Tue', isW: false, los: [14.0, 14.1, 0.1, 99.1, 38, 650, 'Q3 sprint kickoff - early morning telemetry sync'], ibd: [13.5, 13.5, 0.0, 99.6, 19, 322, 'Full shift alignment'], ogn: [13.0, 12.8, -0.2, 98.2, 12, 208, 'Sagamu grid outage resolved early'], ben: [13.0, 13.1, 0.1, 99.0, 10, 168, 'All nodes active'] },
  { date: '2026-09-02', day: 'Wed', isW: false, los: [14.0, 14.2, 0.2, 98.4, 38, 652, 'Ikorodu warehouse inventory intake'], ibd: [13.5, 13.5, 0.0, 99.5, 19, 324, 'Compliant'], ogn: [13.0, 13.0, 0.0, 99.4, 12, 210, 'Compliant'], ben: [13.0, 13.0, 0.0, 99.3, 10, 170, 'Shift on target'] },
  { date: '2026-09-03', day: 'Thu', isW: false, los: [14.0, 13.9, -0.1, 99.2, 38, 655, 'Prompt 21:00 signoff'], ibd: [13.5, 13.4, -0.1, 99.1, 19, 325, 'Early close by 6m'], ogn: [13.0, 13.1, 0.1, 99.1, 12, 212, 'Normal'], ben: [13.0, 13.0, 0.0, 99.6, 10, 170, 'Normal'] },
  { date: '2026-09-04', day: 'Fri', isW: false, los: [14.0, 14.6, 0.6, 95.5, 39, 665, 'Surulere wholesale rush; +36m supervisor shift overrun'], ibd: [13.5, 13.8, 0.3, 97.5, 19, 328, 'Moniya depot traffic delayed signoff'], ogn: [13.0, 13.4, 0.4, 96.7, 12, 214, 'Abeokuta market delay'], ben: [13.0, 13.2, 0.2, 98.0, 10, 172, 'Minor overrun'] },
  { date: '2026-09-05', day: 'Sat', isW: true, los: [13.0, 13.1, 0.1, 99.1, 36, 650, 'Saturday retail compliance steady'], ibd: [12.5, 12.5, 0.0, 99.6, 18, 320, 'Exact adherence'], ogn: [12.0, 12.0, 0.0, 99.5, 11, 210, 'Exact adherence'], ben: [12.0, 12.1, 0.1, 99.0, 10, 170, 'On-time'] },
  { date: '2026-09-06', day: 'Sun', isW: true, los: [12.0, 12.0, 0.0, 99.7, 34, 630, 'Full standard adherence on Sunday shift'], ibd: [11.5, 11.4, -0.1, 98.9, 17, 312, 'Quiet retail day'], ogn: [11.0, 11.0, 0.0, 99.6, 10, 202, 'On-time'], ben: [11.0, 10.9, -0.1, 98.8, 9, 162, 'Signoff verified'] },
  { date: '2026-09-07', day: 'Mon', isW: false, los: [14.0, 14.0, 0.0, 99.8, 38, 655, '06:58 early start across all Lagos zones'], ibd: [13.5, 13.5, 0.0, 99.6, 19, 326, 'On-time start 07:30'], ogn: [13.0, 13.0, 0.0, 99.5, 12, 212, 'On-time start 08:00'], ben: [13.0, 13.0, 0.0, 99.5, 10, 170, 'On-time start 08:00'] },
  { date: '2026-09-08', day: 'Tue', isW: false, los: [14.0, 14.1, 0.1, 99.2, 38, 660, 'Victoria Island retail peak handled on schedule'], ibd: [13.5, 13.6, 0.1, 99.1, 19, 328, 'Good adherence'], ogn: [13.0, 12.9, -0.1, 98.9, 12, 214, 'Early signoff in Ota'], ben: [13.0, 13.1, 0.1, 99.0, 10, 172, 'Standard compliance'] },
  { date: '2026-09-09', day: 'Wed', isW: false, los: [14.0, 14.2, 0.2, 98.6, 38, 662, 'Marina CMS restock buffer clearance'], ibd: [13.5, 13.5, 0.0, 99.5, 19, 330, 'Shift target met'], ogn: [13.0, 13.0, 0.0, 99.4, 12, 215, 'Compliant'], ben: [13.0, 13.0, 0.0, 99.5, 10, 172, 'Compliant'] },
  { date: '2026-09-10', day: 'Thu', isW: false, los: [14.0, 14.0, 0.0, 99.6, 38, 665, 'Optimal shift adherence; 100% telemetry uptime'], ibd: [13.5, 13.4, -0.1, 99.0, 19, 332, 'On-time signoff'], ogn: [13.0, 13.1, 0.1, 99.1, 12, 216, 'Full adherence'], ben: [13.0, 13.0, 0.0, 99.6, 10, 174, 'Full adherence'] },
  { date: '2026-09-11', day: 'Fri', isW: false, los: [14.0, 14.4, 0.4, 97.0, 39, 672, 'Weekend retail restocking surge; +24m overrun'], ibd: [13.5, 13.8, 0.3, 97.6, 19, 334, 'Bodija wholesale spike'], ogn: [13.0, 13.3, 0.3, 97.5, 12, 218, 'Heavy transit delays Sagamu corridor'], ben: [13.0, 13.1, 0.1, 99.0, 10, 174, 'Compliant'] },
  { date: '2026-09-12', day: 'Sat', isW: true, los: [13.0, 13.1, 0.1, 99.0, 36, 660, 'Saturday retail operations steady'], ibd: [12.5, 12.5, 0.0, 99.7, 18, 325, '100% adherence'], ogn: [12.0, 12.0, 0.0, 99.5, 11, 214, 'On schedule'], ben: [12.0, 12.0, 0.0, 99.6, 10, 172, 'On schedule'] },
  { date: '2026-09-13', day: 'Sun', isW: true, los: [12.0, 12.0, 0.0, 99.8, 34, 638, 'Sunday shift benchmark perfectly met'], ibd: [11.5, 11.4, -0.1, 98.9, 17, 318, 'On-time signoff'], ogn: [11.0, 11.0, 0.0, 99.6, 10, 206, 'No variance'], ben: [11.0, 10.9, -0.1, 98.7, 9, 166, 'No variance'] },
  { date: '2026-09-14', day: 'Mon', isW: false, los: [14.0, 14.0, 0.0, 99.6, 38, 670, 'Week 38 shift initialization; full rep attendance'], ibd: [13.5, 13.5, 0.0, 99.5, 19, 335, 'Smooth start'], ogn: [13.0, 13.0, 0.0, 99.5, 12, 218, 'On-time'], ben: [13.0, 13.0, 0.0, 99.4, 10, 175, 'On-time'] },
  { date: '2026-09-15', day: 'Mon', isW: false, los: [14.0, 14.1, 0.1, 99.2, 38, 642, 'Shift cycle reset across Southwest zones'], ibd: [13.5, 13.6, 0.1, 99.1, 19, 312, 'On-time sync'], ogn: [13.0, 13.0, 0.0, 99.6, 12, 198, 'On schedule'], ben: [13.0, 13.1, 0.1, 99.0, 10, 162, 'On schedule'] },
  { date: '2026-09-16', day: 'Tue', isW: false, los: [14.0, 14.0, 0.0, 99.5, 38, 655, 'Sagamu Trade Express node reconnected'], ibd: [13.5, 13.5, 0.0, 99.6, 19, 320, 'Bodija cluster at 94% telemetry'], ogn: [13.0, 13.1, 0.1, 99.1, 12, 204, 'Normal'], ben: [13.0, 13.0, 0.0, 99.4, 10, 168, 'Normal'] },
  { date: '2026-09-17', day: 'Wed', isW: false, los: [14.0, 14.2, 0.2, 98.4, 38, 668, 'Mid-week inventory restocking spike in Otigba'], ibd: [13.5, 13.6, 0.1, 99.1, 19, 328, 'Minor 8m buffer extension'], ogn: [13.0, 13.0, 0.0, 99.4, 12, 210, 'Compliant'], ben: [13.0, 13.0, 0.0, 99.5, 10, 171, 'Compliant'] },
  { date: '2026-09-18', day: 'Thu', isW: false, los: [14.0, 14.0, 0.0, 99.7, 38, 674, '100% heartbeat retention; on-time signoffs'], ibd: [13.5, 13.5, 0.0, 99.6, 19, 335, 'Full shift on schedule'], ogn: [13.0, 13.0, 0.0, 99.5, 12, 215, 'Full shift on schedule'], ben: [13.0, 13.1, 0.1, 99.1, 10, 174, 'Full shift on schedule'] },
  { date: '2026-09-19', day: 'Fri', isW: false, los: [14.0, 14.5, 0.5, 96.3, 39, 691, 'Peak wholesale throughput; Lagos Ikeja Mall 156 tx/hr; +30m overrun'], ibd: [13.5, 13.8, 0.3, 97.6, 19, 342, 'Supermarket restocking extension'], ogn: [13.0, 13.3, 0.3, 97.4, 12, 219, 'Sagamu interchange delay'], ben: [13.0, 13.2, 0.2, 98.2, 10, 179, 'Wholesale signoffs'] },
  { date: '2026-09-20', day: 'Sat', isW: true, los: [13.0, 13.1, 0.1, 99.1, 36, 684, 'Abeokuta Panseke Depot peak active telemetry'], ibd: [12.5, 12.5, 0.0, 99.7, 18, 338, 'Saturday retail compliance steady'], ogn: [12.0, 12.1, 0.1, 99.0, 11, 224, 'High weekend retail volume'], ben: [12.0, 12.0, 0.0, 99.6, 10, 182, 'On schedule'] },
  { date: '2026-09-21', day: 'Sun', isW: true, los: [12.0, 12.0, 0.0, 99.5, 34, 680, 'Today: All 4 Regional Hubs operating at standard shift compliance (07:00-21:00 WAT)'], ibd: [11.5, 11.5, 0.0, 99.5, 17, 340, 'All Bodija and Dugbe nodes active'], ogn: [11.0, 11.0, 0.0, 99.5, 10, 220, 'Ogun Hub at full 220 node capacity'], ben: [11.0, 11.0, 0.0, 99.5, 9, 180, 'Benin Sector at full 180 node capacity'] }
];

function buildRegionalData(tup: any[]): any {
  const [exp, act, varH, adh, reps, pos, note] = tup;
  let status: 'compliant' | 'minor_overrun' | 'major_overrun' | 'under_hours' = 'compliant';
  if (varH > 0.35) status = 'major_overrun';
  else if (varH > 0.1) status = 'minor_overrun';
  else if (varH < -0.15) status = 'under_hours';

  return {
    expectedHours: exp,
    actualHours: act,
    varianceHours: parseFloat(varH.toFixed(2)),
    adherenceRate: adh,
    merchandiserCount: reps,
    activePOS: pos,
    onTimeStartRate: varH >= 0 ? 99.2 : 97.5,
    status,
    notes: note
  };
}

export const THIRTY_DAY_ADHERENCE_DATA: DailyAdherenceRecord[] = raw30Days.map((item) => {
  const los = buildRegionalData(item.los);
  const ibd = buildRegionalData(item.ibd);
  const ogn = buildRegionalData(item.ogn);
  const ben = buildRegionalData(item.ben);

  const totalExp = parseFloat((los.expectedHours + ibd.expectedHours + ogn.expectedHours + ben.expectedHours).toFixed(1));
  const totalAct = parseFloat((los.actualHours + ibd.actualHours + ogn.actualHours + ben.actualHours).toFixed(1));
  const totalVar = parseFloat((totalAct - totalExp).toFixed(2));
  const avgAdh = parseFloat(((los.adherenceRate + ibd.adherenceRate + ogn.adherenceRate + ben.adherenceRate) / 4).toFixed(1));
  const totalReps = los.merchandiserCount + ibd.merchandiserCount + ogn.merchandiserCount + ben.merchandiserCount;
  const totalPOS = los.activePOS + ibd.activePOS + ogn.activePOS + ben.activePOS;

  let overallStatus: 'compliant' | 'minor_overrun' | 'major_overrun' | 'under_hours' = 'compliant';
  if (totalVar > 0.8) overallStatus = 'major_overrun';
  else if (totalVar > 0.3) overallStatus = 'minor_overrun';
  else if (totalVar < -0.4) overallStatus = 'under_hours';

  const dObj = new Date(item.date);
  const displayDate = `${dObj.getDate()} ${dObj.toLocaleString('en-GB', { month: 'short' })}`;

  return {
    date: item.date,
    displayDate,
    dayOfWeek: item.day,
    isWeekend: item.isW,
    Lagos: los,
    Ibadan: ibd,
    Ogun: ogn,
    Benin: ben,
    aggregate: {
      expectedHours: totalExp,
      actualHours: totalAct,
      varianceHours: totalVar,
      adherenceRate: avgAdh,
      totalMerchandisers: totalReps,
      totalActivePOS: totalPOS,
      overallStatus,
      operationalEvent: (item.los[6] as string) || ''
    }
  };
});

export const REGIONAL_COMPLIANCE_SUMMARIES: Record<'All' | 'Lagos' | 'Ibadan' | 'Ogun' | 'Benin', RegionComplianceSummary> = {
  All: {
    region: 'All',
    displayName: 'All 4 Regional Hubs (Consolidated)',
    standardDailyHours: 53.5, // 14.0 + 13.5 + 13.0 + 13.0
    standardShiftWindow: '07:00 – 21:00 WAT Window',
    totalExpectedHours: 1541.0,
    totalActualHours: 1549.6,
    netVarianceHours: 8.6,
    averageAdherenceRate: 98.9,
    fullComplianceDays: 24,
    minorOverrunDays: 4,
    majorOverrunDays: 2,
    underHourDays: 0,
    avgMerchandisersOnDuty: 78,
    color: '#92C842'
  },
  Lagos: {
    region: 'Lagos',
    displayName: 'Southwest Hub (Lagos)',
    standardDailyHours: 14.0,
    standardShiftWindow: '07:00 – 21:00 WAT (Benchmark 14h)',
    totalExpectedHours: 410.0,
    totalActualHours: 414.4,
    netVarianceHours: 4.4,
    averageAdherenceRate: 98.6,
    fullComplianceDays: 23,
    minorOverrunDays: 4,
    majorOverrunDays: 3,
    underHourDays: 0,
    avgMerchandisersOnDuty: 38,
    color: '#92C842'
  },
  Ibadan: {
    region: 'Ibadan',
    displayName: 'Oyo Cluster (Ibadan)',
    standardDailyHours: 13.5,
    standardShiftWindow: '07:30 – 21:00 WAT (Benchmark 13.5h)',
    totalExpectedHours: 395.0,
    totalActualHours: 397.2,
    netVarianceHours: 2.2,
    averageAdherenceRate: 99.1,
    fullComplianceDays: 26,
    minorOverrunDays: 3,
    majorOverrunDays: 1,
    underHourDays: 0,
    avgMerchandisersOnDuty: 19,
    color: '#22d3ee'
  },
  Ogun: {
    region: 'Ogun',
    displayName: 'Ogun Corridor (Abeokuta / Sagamu)',
    standardDailyHours: 13.0,
    standardShiftWindow: '08:00 – 21:00 WAT (Benchmark 13h)',
    totalExpectedHours: 368.0,
    totalActualHours: 369.3,
    netVarianceHours: 1.3,
    averageAdherenceRate: 99.0,
    fullComplianceDays: 25,
    minorOverrunDays: 3,
    majorOverrunDays: 1,
    underHourDays: 1,
    avgMerchandisersOnDuty: 12,
    color: '#F17F31'
  },
  Benin: {
    region: 'Benin',
    displayName: 'Edo Sector (Benin)',
    standardDailyHours: 13.0,
    standardShiftWindow: '08:00 – 21:00 WAT (Benchmark 13h)',
    totalExpectedHours: 368.0,
    totalActualHours: 368.7,
    netVarianceHours: 0.7,
    averageAdherenceRate: 99.2,
    fullComplianceDays: 27,
    minorOverrunDays: 2,
    majorOverrunDays: 0,
    underHourDays: 1,
    avgMerchandisersOnDuty: 10,
    color: '#c084fc'
  }
};
