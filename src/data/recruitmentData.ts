export type RecruitmentStage =
  | 'sourced'
  | 'screening'
  | 'interview'
  | 'kyc_guarantors'
  | 'risk_clearance'
  | 'selected'
  | 'rejected';

export interface VsrCandidate {
  id: string;
  applicantNumber: string;
  fullName: string;
  email: string;
  phone: string;
  whatsapp?: string;
  hub: 'Lagos' | 'Ibadan' | 'Ogun' | 'Benin' | 'Enugu';
  targetStore: string;
  role: 'VSR' | 'Assistant VSR' | 'Retail Merchandiser';
  stage: RecruitmentStage;
  appliedDate: string;
  sourceChannel: 'Online Job Board' | 'Employee Referral' | 'Walk-In / Regional Fair' | 'Agency Sourced';
  experienceYears: number;
  highestEducation: 'OND' | 'HND' | 'B.Sc' | 'SSCE';
  
  // Selection Assessments (0 - 10)
  pitchScore: number;
  mathScore: number;
  communicationScore: number;
  overallScore: number; // percentage (0 - 100)
  evaluatorNotes: string;
  
  // KYC & Dual Guarantor
  guarantor1: {
    name: string;
    relationship: string;
    phone: string;
    profession: string;
    company: string;
    verified: boolean;
  };
  guarantor2: {
    name: string;
    relationship: string;
    phone: string;
    profession: string;
    company: string;
    verified: boolean;
  };
  
  // Compliance & Pension
  hasPension: boolean;
  pensionPfa?: string;
  riskVettingStatus: 'Cleared' | 'Under Review' | 'Flagged' | 'Pending';
  fidelityEligible: boolean;
  
  activityLog: Array<{
    id: string;
    action: string;
    timestamp: string;
    performedBy: string;
    notes?: string;
  }>;
}

export const INITIAL_RECRUITMENT_CANDIDATES: VsrCandidate[] = [
  {
    id: 'cand-001',
    applicantNumber: 'KEA-REC-2026-041',
    fullName: 'Aladetoyinbo Femi John',
    email: 'femi55679@gmail.com',
    phone: '+234 816 332 0499',
    whatsapp: '+234 816 332 0499',
    hub: 'Lagos',
    targetStore: 'SPAR Victoria Island Corridor',
    role: 'VSR',
    stage: 'selected',
    appliedDate: '12-Aug-2026',
    sourceChannel: 'Employee Referral',
    experienceYears: 3,
    highestEducation: 'HND',
    pitchScore: 9,
    mathScore: 9,
    communicationScore: 9,
    overallScore: 91,
    evaluatorNotes: 'Exceptional retail sales pitch. Demonstrates sharp inventory reconciliation and fast POS checkout flow.',
    guarantor1: {
      name: 'Dr. Kunle Aladetoyinbo',
      relationship: 'Uncle (Civil Servant)',
      phone: '08033219800',
      profession: 'Deputy Director, Lagos State Ministry',
      company: 'LASG Education District IV',
      verified: true
    },
    guarantor2: {
      name: 'Mrs. Folake Adekoya',
      relationship: 'Business Associate',
      phone: '08023419912',
      profession: 'Managing Partner',
      company: 'Adekoya Logistics Ltd',
      verified: true
    },
    hasPension: true,
    pensionPfa: 'Stanbic IBTC Pension Managers',
    riskVettingStatus: 'Cleared',
    fidelityEligible: true,
    activityLog: [
      { id: 'act-1', action: 'Candidate Sourced', timestamp: '12-Aug-2026 09:15', performedBy: 'Fatima Sanusi', notes: 'Referred by Adeyemi Babatunde' },
      { id: 'act-2', action: 'Assessment Cleared (91%)', timestamp: '18-Aug-2026 14:00', performedBy: 'Ibrahim Oloyede', notes: 'Scored highest in sales pitch evaluation' },
      { id: 'act-3', action: 'Dual Guarantors Verified', timestamp: '24-Aug-2026 11:30', performedBy: 'Compliance Desk', notes: 'Both employer and residential addresses confirmed' },
      { id: 'act-4', action: 'Risk & Fidelity Cleared', timestamp: '01-Sep-2026 16:45', performedBy: 'Risk Audit Lead', notes: 'Disbursement pre-approved' }
    ]
  },
  {
    id: 'cand-002',
    applicantNumber: 'KEA-REC-2026-042',
    fullName: 'Oyeleke Olasunkanmi Oluwamayowa',
    email: 'sintonoye@gmail.com',
    phone: '+234 803 444 0043',
    hub: 'Ibadan',
    targetStore: 'Justrite Dugbe & Challenge Hub',
    role: 'VSR',
    stage: 'risk_clearance',
    appliedDate: '15-Aug-2026',
    sourceChannel: 'Online Job Board',
    experienceYears: 2,
    highestEducation: 'B.Sc',
    pitchScore: 8,
    mathScore: 8,
    communicationScore: 8,
    overallScore: 82,
    evaluatorNotes: 'Strong FMCG merchandising background in Bodija and Ring Road markets. Solid sales aptitude.',
    guarantor1: {
      name: 'Pastor Samuel Oyeleke',
      relationship: 'Elder Brother',
      phone: '08055123984',
      profession: 'School Administrator',
      company: 'Grace High School Ibadan',
      verified: true
    },
    guarantor2: {
      name: 'Alhaji Rasheed Akanni',
      relationship: 'Family Landlord',
      phone: '08077651234',
      profession: 'Licensed Contractor',
      company: 'Akanni Real Estate Ltd',
      verified: true
    },
    hasPension: true,
    pensionPfa: 'Leadway Pensure PFA',
    riskVettingStatus: 'Under Review',
    fidelityEligible: true,
    activityLog: [
      { id: 'act-10', action: 'Screening Passed', timestamp: '17-Aug-2026 10:20', performedBy: 'Fatima Sanusi' },
      { id: 'act-11', action: 'Sales Pitch Assessed (82%)', timestamp: '22-Aug-2026 12:15', performedBy: 'Regional Supervisor Ibadan' },
      { id: 'act-12', action: 'Sent for Fidelity Risk Review', timestamp: '29-Aug-2026 15:30', performedBy: 'Audit Lead', notes: 'Final sign-off pending credit check' }
    ]
  },
  {
    id: 'cand-003',
    applicantNumber: 'KEA-REC-2026-043',
    fullName: 'Edwards Olamilekan',
    email: 'oadewale066@gmail.com',
    phone: '+234 816 225 8096',
    hub: 'Lagos',
    targetStore: 'Shoprite Ikeja City Mall',
    role: 'VSR',
    stage: 'kyc_guarantors',
    appliedDate: '20-Aug-2026',
    sourceChannel: 'Walk-In / Regional Fair',
    experienceYears: 4,
    highestEducation: 'OND',
    pitchScore: 9,
    mathScore: 8,
    communicationScore: 8,
    overallScore: 85,
    evaluatorNotes: 'Impressive retail store experience. High stamina and proactive consumer engagement pitch.',
    guarantor1: {
      name: 'Engr. Taiwo Edwards',
      relationship: 'Father',
      phone: '08022319088',
      profession: 'Senior Technical Officer',
      company: 'Federal Ministry of Works',
      verified: true
    },
    guarantor2: {
      name: 'Bimpe Adebayo',
      relationship: 'Former Store Manager',
      phone: '08099881122',
      profession: 'Branch Operations Lead',
      company: 'Addide Supermarkets',
      verified: false
    },
    hasPension: false,
    riskVettingStatus: 'Pending',
    fidelityEligible: false,
    activityLog: [
      { id: 'act-20', action: 'Walk-In Fair Registration', timestamp: '20-Aug-2026 11:00', performedBy: 'Recruitment Team' },
      { id: 'act-21', action: 'Interview Panel Rating: 85%', timestamp: '25-Aug-2026 15:40', performedBy: 'Ibrahim Oloyede' },
      { id: 'act-22', action: 'Guarantor 2 Call Scheduled', timestamp: '02-Sep-2026 09:30', performedBy: 'HR Verification' }
    ]
  },
  {
    id: 'cand-004',
    applicantNumber: 'KEA-REC-2026-044',
    fullName: 'Daniel Chima Nwabeke',
    email: 'danielnwabeke333@gmail.com',
    phone: '+234 701 510 7571',
    hub: 'Lagos',
    targetStore: 'Prince Ebeano Lekki Hub',
    role: 'VSR',
    stage: 'interview',
    appliedDate: '24-Aug-2026',
    sourceChannel: 'Online Job Board',
    experienceYears: 1,
    highestEducation: 'B.Sc',
    pitchScore: 7,
    mathScore: 8,
    communicationScore: 8,
    overallScore: 77,
    evaluatorNotes: 'Good business communication and polite demeanor. Candidate is undergoing retail simulator test.',
    guarantor1: {
      name: 'Chief Emeka Nwabeke',
      relationship: 'Uncle',
      phone: '08033009911',
      profession: 'Commercial Trader',
      company: 'Alaba International Market',
      verified: false
    },
    guarantor2: {
      name: 'Chisom Obi',
      relationship: 'Colleague',
      phone: '08055442211',
      profession: 'Accountant',
      company: 'Oakwood Hospitality',
      verified: false
    },
    hasPension: false,
    riskVettingStatus: 'Pending',
    fidelityEligible: false,
    activityLog: [
      { id: 'act-30', action: 'Application Screened', timestamp: '24-Aug-2026 14:10', performedBy: 'Fatima Sanusi' },
      { id: 'act-31', action: 'Scheduled for Technical Interview', timestamp: '28-Aug-2026 16:00', performedBy: 'HR Team' }
    ]
  },
  {
    id: 'cand-005',
    applicantNumber: 'KEA-REC-2026-045',
    fullName: 'ONUOHA EJIKE MISHAEL',
    email: 'elohimlimited002@gmail.com',
    phone: '+234 905 476 2381',
    hub: 'Enugu',
    targetStore: 'Polo Park Mall Enugu',
    role: 'VSR',
    stage: 'interview',
    appliedDate: '26-Aug-2026',
    sourceChannel: 'Employee Referral',
    experienceYears: 3,
    highestEducation: 'HND',
    pitchScore: 8,
    mathScore: 7,
    communicationScore: 7,
    overallScore: 75,
    evaluatorNotes: 'Extensive eastern region distribution experience. Good knowledge of POS terminal charging cycles.',
    guarantor1: {
      name: 'Elder Jude Onuoha',
      relationship: 'Father',
      phone: '08066554433',
      profession: 'Retired Civil Servant',
      company: 'Enugu State Water Board',
      verified: false
    },
    guarantor2: {
      name: 'Nkemdilim Eze',
      relationship: 'Former Employer',
      phone: '08099887766',
      profession: 'Store Proprietor',
      company: 'Eze Superstores Enugu',
      verified: false
    },
    hasPension: true,
    pensionPfa: 'FCMB Pensions Limited',
    riskVettingStatus: 'Pending',
    fidelityEligible: false,
    activityLog: [
      { id: 'act-40', action: 'Candidate Submitted', timestamp: '26-Aug-2026 10:00', performedBy: 'Regional HR Enugu' }
    ]
  },
  {
    id: 'cand-006',
    applicantNumber: 'KEA-REC-2026-046',
    fullName: 'Kehinde Alabi',
    email: 'kehinde.alabi@gmail.com',
    phone: '+234 812 345 6789',
    hub: 'Lagos',
    targetStore: 'Lekki Phase 1 & Ikoyi Corridor',
    role: 'VSR',
    stage: 'selected',
    appliedDate: '01-Aug-2026',
    sourceChannel: 'Agency Sourced',
    experienceYears: 5,
    highestEducation: 'B.Sc',
    pitchScore: 10,
    mathScore: 9,
    communicationScore: 9,
    overallScore: 93,
    evaluatorNotes: 'Top 1% candidate in retail pitching. Proven track record in upscale consumer retail locations.',
    guarantor1: {
      name: 'Prof. J. O. Alabi',
      relationship: 'Father (University Don)',
      phone: '08034567812',
      profession: 'Professor of Economics',
      company: 'University of Lagos',
      verified: true
    },
    guarantor2: {
      name: 'Barrister Tolu George',
      relationship: 'Family Legal Counsel',
      phone: '08023456789',
      profession: 'Senior Advocate (SAN)',
      company: 'George & Co Chambers',
      verified: true
    },
    hasPension: true,
    pensionPfa: 'ARM Pension Managers',
    riskVettingStatus: 'Cleared',
    fidelityEligible: true,
    activityLog: [
      { id: 'act-50', action: 'Offer Letter Signed', timestamp: '28-Aug-2026 10:15', performedBy: 'Head of People' },
      { id: 'act-51', action: 'POS Terminal Kit Assigned', timestamp: '02-Sep-2026 12:00', performedBy: 'Field Operations Lead' }
    ]
  },
  {
    id: 'cand-007',
    applicantNumber: 'KEA-REC-2026-047',
    fullName: 'Yetunde Ajayi',
    email: 'yetunde.ajayi@yahoo.com',
    phone: '+234 809 112 3344',
    hub: 'Ibadan',
    targetStore: 'Ibadan Ring Road & Challenge Hub',
    role: 'Assistant VSR',
    stage: 'selected',
    appliedDate: '05-Aug-2026',
    sourceChannel: 'Online Job Board',
    experienceYears: 2,
    highestEducation: 'OND',
    pitchScore: 9,
    mathScore: 8,
    communicationScore: 9,
    overallScore: 88,
    evaluatorNotes: 'Pairing approved with Folake Ibikunle on Sagamu-Ibadan trade border to shadow daily cash and machine reconciliations.',
    guarantor1: {
      name: 'Chief Olatunji Ajayi',
      relationship: 'Father',
      phone: '08033445566',
      profession: 'Chairman',
      company: 'Ajayi Agricultural Cooperatives',
      verified: true
    },
    guarantor2: {
      name: 'Mrs. Funke Balogun',
      relationship: 'Aunt',
      phone: '08055667788',
      profession: 'Branch Controller',
      company: 'Union Bank Ibadan',
      verified: true
    },
    hasPension: true,
    pensionPfa: 'CrusaderSterling Pensions',
    riskVettingStatus: 'Cleared',
    fidelityEligible: true,
    activityLog: [
      { id: 'act-60', action: 'Orientation Package Issued', timestamp: '01-Sep-2026 09:00', performedBy: 'Fatima Sanusi' }
    ]
  },
  {
    id: 'cand-008',
    applicantNumber: 'KEA-REC-2026-048',
    fullName: 'Samuel Okoro',
    email: 'samuel.okoro@gmail.com',
    phone: '+234 818 990 1234',
    hub: 'Benin',
    targetStore: 'Market Square Sapele Road Benin',
    role: 'VSR',
    stage: 'kyc_guarantors',
    appliedDate: '18-Aug-2026',
    sourceChannel: 'Employee Referral',
    experienceYears: 3,
    highestEducation: 'HND',
    pitchScore: 8,
    mathScore: 8,
    communicationScore: 8,
    overallScore: 80,
    evaluatorNotes: 'Benin Regional Field Trainer scheduled for physical residence confirmation on Thursday. Strong store presence.',
    guarantor1: {
      name: 'Chief Dennis Okoro',
      relationship: 'Elder Brother',
      phone: '08022119933',
      profession: 'General Merchant',
      company: 'Okoro Enterprise Ltd',
      verified: true
    },
    guarantor2: {
      name: 'Engr. Osaro Ighodalo',
      relationship: 'Family Friend',
      phone: '08077889900',
      profession: 'Operations Manager',
      company: 'Benin Electricity Distribution Plc',
      verified: false
    },
    hasPension: false,
    riskVettingStatus: 'Under Review',
    fidelityEligible: false,
    activityLog: [
      { id: 'act-70', action: 'Guarantor 1 Confirmed', timestamp: '29-Aug-2026 14:20', performedBy: 'Field Verification Officer' }
    ]
  },
  {
    id: 'cand-009',
    applicantNumber: 'KEA-REC-2026-049',
    fullName: 'Blessing Chioma Eze',
    email: 'blessing.eze@gmail.com',
    phone: '+234 814 556 7890',
    hub: 'Lagos',
    targetStore: 'Hubmart Victoria Island',
    role: 'Assistant VSR',
    stage: 'screening',
    appliedDate: '01-Sep-2026',
    sourceChannel: 'Online Job Board',
    experienceYears: 1,
    highestEducation: 'OND',
    pitchScore: 7,
    mathScore: 7,
    communicationScore: 8,
    overallScore: 73,
    evaluatorNotes: 'Good customer greeting voice and energetic personality. Verification of OND certificate pending.',
    guarantor1: {
      name: 'Mr. Emmanuel Eze',
      relationship: 'Father',
      phone: '08034567891',
      profession: 'Civil Servant',
      company: 'Lagos State Civil Service Commission',
      verified: false
    },
    guarantor2: {
      name: 'Mrs. Joy Okoye',
      relationship: 'Aunt',
      phone: '08023456780',
      profession: 'Registered Nurse',
      company: 'LUTH Idi-Araba',
      verified: false
    },
    hasPension: false,
    riskVettingStatus: 'Pending',
    fidelityEligible: false,
    activityLog: [
      { id: 'act-80', action: 'Online Resume Ingestion', timestamp: '01-Sep-2026 17:30', performedBy: 'HR Portal System' }
    ]
  },
  {
    id: 'cand-010',
    applicantNumber: 'KEA-REC-2026-050',
    fullName: 'Adekunle Sheriff Olanrewaju',
    email: 'sheriff.adekunle@outlook.com',
    phone: '+234 802 998 1122',
    hub: 'Ogun',
    targetStore: 'Justrite Superstore Abeokuta',
    role: 'VSR',
    stage: 'risk_clearance',
    appliedDate: '10-Aug-2026',
    sourceChannel: 'Employee Referral',
    experienceYears: 3,
    highestEducation: 'B.Sc',
    pitchScore: 9,
    mathScore: 8,
    communicationScore: 8,
    overallScore: 86,
    evaluatorNotes: 'Prior experience at Unilever distributor in Sagamu. Excellent knowledge of Abeokuta retail corridor.',
    guarantor1: {
      name: 'Hon. Musibau Olanrewaju',
      relationship: 'Uncle',
      phone: '08033221144',
      profession: 'Community Leader & Councilor',
      company: 'Abeokuta South Local Government',
      verified: true
    },
    guarantor2: {
      name: 'Mrs. Bolanle Sobowale',
      relationship: 'Former Supervisor',
      phone: '08055443322',
      profession: 'Area Sales Manager',
      company: 'Grand Cereals Plc',
      verified: true
    },
    hasPension: true,
    pensionPfa: 'Trustfund Pensions Limited',
    riskVettingStatus: 'Cleared',
    fidelityEligible: true,
    activityLog: [
      { id: 'act-90', action: 'Risk Committee Vetted', timestamp: '03-Sep-2026 11:30', performedBy: 'Chief Risk Officer' }
    ]
  },
  {
    id: 'cand-011',
    applicantNumber: 'KEA-REC-2026-051',
    fullName: 'Ifeanyi Chukwuemeka',
    email: 'ifeanyi.chukwu@gmail.com',
    phone: '+234 703 112 4455',
    hub: 'Lagos',
    targetStore: 'SPAR Ilupeju Industrial Store',
    role: 'VSR',
    stage: 'sourced',
    appliedDate: '03-Sep-2026',
    sourceChannel: 'Online Job Board',
    experienceYears: 2,
    highestEducation: 'HND',
    pitchScore: 0,
    mathScore: 0,
    communicationScore: 0,
    overallScore: 0,
    evaluatorNotes: 'Newly ingested applicant from Jobberman campaign. Pending initial phone screening call.',
    guarantor1: {
      name: 'Awaiting Submission',
      relationship: '',
      phone: '',
      profession: '',
      company: '',
      verified: false
    },
    guarantor2: {
      name: 'Awaiting Submission',
      relationship: '',
      phone: '',
      profession: '',
      company: '',
      verified: false
    },
    hasPension: false,
    riskVettingStatus: 'Pending',
    fidelityEligible: false,
    activityLog: [
      { id: 'act-100', action: 'Candidate Sourced', timestamp: '03-Sep-2026 08:45', performedBy: 'Automated Job Ingestion' }
    ]
  },
  {
    id: 'cand-012',
    applicantNumber: 'KEA-REC-2026-052',
    fullName: 'Mustapha Kabir Danjuma',
    email: 'kabir.danjuma@gmail.com',
    phone: '+234 813 908 7766',
    hub: 'Lagos',
    targetStore: 'Ebeano Oniru & Lekki',
    role: 'VSR',
    stage: 'rejected',
    appliedDate: '08-Aug-2026',
    sourceChannel: 'Walk-In / Regional Fair',
    experienceYears: 1,
    highestEducation: 'SSCE',
    pitchScore: 4,
    mathScore: 4,
    communicationScore: 5,
    overallScore: 43,
    evaluatorNotes: 'Failed retail math test twice. Dual guarantor telephone numbers belonged to applicant with simulated identities.',
    guarantor1: {
      name: 'Disqualified - Fake Contact',
      relationship: 'Unverified',
      phone: '08011223344',
      profession: 'Unverified',
      company: 'Unverified',
      verified: false
    },
    guarantor2: {
      name: 'Disqualified - Fake Contact',
      relationship: 'Unverified',
      phone: '08022334455',
      profession: 'Unverified',
      company: 'Unverified',
      verified: false
    },
    hasPension: false,
    riskVettingStatus: 'Flagged',
    fidelityEligible: false,
    activityLog: [
      { id: 'act-110', action: 'Audit Disqualification Logged', timestamp: '14-Aug-2026 16:30', performedBy: 'Head of Audit', notes: 'Red-flagged for KYC identity anomaly' }
    ]
  }
];

export const RECRUITMENT_STAGES_CONFIG: Array<{
  id: RecruitmentStage;
  label: string;
  shortLabel: string;
  badgeColor: string;
  bgColor: string;
  borderColor: string;
  description: string;
}> = [
  {
    id: 'sourced',
    label: '1. Sourced / New Ingestion',
    shortLabel: 'Sourced',
    badgeColor: 'text-sky-400',
    bgColor: 'bg-sky-500/10',
    borderColor: 'border-sky-500/30',
    description: 'Fresh applicants received from job boards, referrals, and walk-in fairs'
  },
  {
    id: 'screening',
    label: '2. Phone Screening & Profile Check',
    shortLabel: 'Screening',
    badgeColor: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/30',
    description: 'Initial eligibility, age, certificate review, and territory coverage confirmation'
  },
  {
    id: 'interview',
    label: '3. Pitch Assessment & Math Exam',
    shortLabel: 'Interview',
    badgeColor: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    description: 'Retail sales simulator, POS reconciliation math test, and communication evaluation'
  },
  {
    id: 'kyc_guarantors',
    label: '4. Dual Guarantor & KYC Vetting',
    shortLabel: 'Dual Guarantor',
    badgeColor: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    description: 'Two verified civil service or senior business guarantors with physical home visits'
  },
  {
    id: 'risk_clearance',
    label: '5. Risk & Fidelity Pre-Approval',
    shortLabel: 'Risk Clearance',
    badgeColor: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    description: 'Credit bureau search, insurance underwriting clearance, and float allocation sign-off'
  },
  {
    id: 'selected',
    label: '6. Selected & Ready for Deployment',
    shortLabel: 'Selected',
    badgeColor: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    description: 'Offer signed, assigned store and retail supervisor ready for induction'
  },
  {
    id: 'rejected',
    label: 'Disqualified / Red Flag',
    shortLabel: 'Disqualified',
    badgeColor: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
    description: 'Failed exam, failed guarantor audit, or flagged for fraudulent documents'
  }
];
