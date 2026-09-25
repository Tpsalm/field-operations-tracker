import { GeneratedCredential, AuthUser } from '../types';

export const PRESET_CREDENTIALS: GeneratedCredential[] = [
  {
    user: {
      id: 'usr_tope_ceo',
      name: 'Tope Balogun',
      email: 'tope.balogun@keahospitality.ng',
      role: 'CEO',
      roleTitle: 'Chief Executive Officer & Managing Director',
      department: 'Executive Governance & Capital Allocations',
      initials: 'TB',
      avatarColor: '#92C842',
      assignedRegion: 'All',
      securityClearance: 'Level 5 (Unrestricted)',
      lastLogin: '2026-09-21 07:15 WAT'
    },
    passwordText: 'KEA-Executive-2026!',
    description: 'Full unconstrained executive command across VSR allocations, field POS telemetry, funding approvals, and head office staffing.',
    badge: 'CEO / Level 5 Clearance'
  },
  {
    user: {
      id: 'usr_adebayo_ops',
      name: 'Adebayo Adeleke',
      email: 'adebayo.ops@keahospitality.ng',
      role: 'OPS_DIRECTOR',
      roleTitle: 'VP of Field Merchandising & Operations',
      department: 'Field Operations & VSR Telemetry Control',
      initials: 'AA',
      avatarColor: '#22d3ee',
      assignedRegion: 'All',
      securityClearance: 'Level 4 (Regional Ops)',
      lastLogin: '2026-09-21 06:45 WAT'
    },
    passwordText: 'Ops-VSR-Lagos#2026',
    description: 'Operational lead governing 78 field merchandisers, 1,420 POS terminals, heartbeat monitors, and shift compliance audits.',
    badge: 'Operations Command'
  },
  {
    user: {
      id: 'usr_chidinma_hr',
      name: 'Chidinma Okonkwo',
      email: 'chidinma.hr@keahospitality.ng',
      role: 'AUDIT_LEAD',
      roleTitle: 'Head of People & Organizational Governance',
      department: 'Human Resources, Recruitment & Audit',
      initials: 'CO',
      avatarColor: '#c084fc',
      assignedRegion: 'All',
      securityClearance: 'Level 3 (Audit & HR)',
      lastLogin: '2026-09-20 18:30 WAT'
    },
    passwordText: 'KEA-People-Audit$26',
    description: 'Governs Head Office staffing requisitions, candidate vetting, staff archival ledger, and compliance reviews.',
    badge: 'People & HR Governance'
  },
  {
    user: {
      id: 'usr_folashade_lagos',
      name: 'Folashade Alabi',
      email: 'folashade.alabi@keahospitality.ng',
      role: 'REGIONAL_SUPERVISOR',
      roleTitle: 'Southwest Regional Operations Supervisor',
      department: 'Lagos & Trade Fair Hub Terminal Command',
      initials: 'FA',
      avatarColor: '#F17F31',
      assignedRegion: 'Lagos',
      securityClearance: 'Level 4 (Regional Ops)',
      lastLogin: '2026-09-21 06:58 WAT'
    },
    passwordText: 'Hub-Lagos-Lead*2026',
    description: 'Field supervisor commanding the Lagos Hub (38 field merchandisers, 680 active retail POS terminals across Ikeja, Alaba, Trade Fair).',
    badge: 'Lagos Hub Supervisor'
  }
];

export function verifyCredentials(emailInput: string, passwordInput: string): AuthUser | null {
  const normalizedEmail = emailInput.trim().toLowerCase();
  const trimmedPassword = passwordInput.trim();

  const found = PRESET_CREDENTIALS.find(
    (c) => c.user.email.toLowerCase() === normalizedEmail && c.passwordText === trimmedPassword
  );

  return found ? found.user : null;
}

export function generateCustomAuditorCredential(hubScope: 'All' | 'Lagos' | 'Ibadan' | 'Ogun' | 'Benin' = 'All'): GeneratedCredential {
  const randomPin = Math.floor(1000 + Math.random() * 9000);
  const idSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();

  const user: AuthUser = {
    id: `usr_auditor_${idSuffix.toLowerCase()}`,
    name: `Field Auditor ${idSuffix}`,
    email: `auditor.${idSuffix.toLowerCase()}@keahospitality.ng`,
    role: 'AUDIT_LEAD',
    roleTitle: `Independent ${hubScope === 'All' ? 'National' : hubScope} Shift Auditor`,
    department: 'External Compliance & POS Quality Inspection',
    initials: `A${idSuffix[0]}`,
    avatarColor: '#eab308',
    assignedRegion: hubScope,
    securityClearance: 'Level 3 (Audit & HR)',
    lastLogin: 'Just generated (WAT)'
  };

  return {
    user,
    passwordText: `Audit-Pass#${randomPin}`,
    description: `Temporary on-demand inspection credential with read-only audit logging for ${hubScope} territory.`,
    badge: 'On-Demand Auditor'
  };
}
