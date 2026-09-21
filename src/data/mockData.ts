import { StaffRecord, Requisition, FundingActionLog, FieldMerchandiserHub } from '../types';

export const INITIAL_STAFF_RECORDS: StaffRecord[] = [
  {
    id: 'staff-1',
    name: 'Oluwaseun Babatunde',
    initials: 'OB',
    code: 'VSR-LG-0412',
    status: 'funded',
    statusLabel: 'FUNDED ON 29TH',
    region: 'Lagos',
    location: 'Lagos Island (Marina & CMS)',
    tenureMonths: 5.2,
    tenureDisplay: '5.2 Months Tenure',
    phone: '+234 803 451 8892',
    hasLoan: false,
    loanLabel: 'No Active Loan',
    boxType: 'audit',
    boxHeaderTitle: 'EXECUTIVE AUDIT & DIRECTIVE THREAD',
    boxHeaderTag: 'DISBURSEMENT LOG: ₦185,000 VERIFIED',
    allocationAmount: 185000,
    bankName: 'Access Bank',
    accountNumber: '0039481920',
    verificationStatus: 'NIBSS BVN Verified',
    guarantorName: 'Chief O. Babatunde (Lagos Chamber of Commerce)',
    posCount: 28,
    thread: [
      {
        id: 'msg-1',
        sender: 'CEO',
        role: 'CEO',
        text: 'Tope, good job on expanding Marina cluster. Has his weekly merchandise POS reconciliation cleared?',
        time: '09:15 AM'
      },
      {
        id: 'msg-2',
        sender: 'TOPE (OPS)',
        role: 'TOPE (OPS)',
        text: 'Yes sir. 100% stock verified at CMS station yesterday. 29th batch funding disbursed directly to card.',
        time: '09:42 AM',
        isOps: true
      }
    ]
  },
  {
    id: 'staff-2',
    name: 'Adewale Adeleke',
    initials: 'AA',
    code: 'VSR-IB-0891',
    status: 'unfunded',
    statusLabel: 'UNFUNDED / PENDING VERIFICATION',
    region: 'Ibadan',
    location: 'Ibadan Central (Dugbe & Bodija)',
    tenureMonths: 1.8,
    tenureDisplay: '1.8 Months Tenure',
    phone: '+234 814 209 1104',
    hasLoan: true,
    loanAmount: 85000,
    loanLabel: 'On Loan (₦85,000)',
    boxType: 'blocker',
    boxHeaderTitle: 'FUNDING BLOCKER & INVESTIGATION LOG',
    boxHeaderTag: 'OVERDUE TARGET: 25TH',
    allocationAmount: 85000,
    bankName: 'Zenith Bank',
    accountNumber: '2119045512',
    verificationStatus: 'Pending Name Alignment (NIBSS)',
    guarantorName: 'Dr. Rasheed Adeleke (University of Ibadan)',
    posCount: 19,
    thread: [
      {
        id: 'msg-3',
        sender: 'CEO',
        role: 'CEO',
        text: 'Tope, what is delaying funding for this rep? Target was 25th. Bodija route cannot stay dry.',
        time: 'Yesterday'
      },
      {
        id: 'msg-4',
        sender: 'TOPE (OPS)',
        role: 'TOPE (OPS)',
        text: 'Bank account verification delayed by Zenith Bank; resolving today by 2 PM. Rep will receive direct transfer as soon as NIBSS clears name mismatch.',
        time: '11:14 AM',
        isOps: true
      }
    ]
  },
  {
    id: 'staff-3',
    name: 'Folake Ibikunle',
    initials: 'FI',
    code: 'VSR-OG-1029',
    status: 'funded',
    statusLabel: 'FUNDED ON 29TH',
    region: 'Ogun',
    location: 'Abeokuta Industrial & Sagamu',
    tenureMonths: 8.4,
    tenureDisplay: '8.4 Months Tenure',
    phone: '+234 705 993 4421',
    hasLoan: false,
    loanLabel: 'No Active Loan',
    boxType: 'milestone',
    boxHeaderTitle: 'REGIONAL PERFORMANCE MILESTONE',
    boxHeaderTag: 'TARGET: 114% ACHIEVED',
    boxHighlightText: 'Top-tier merchandiser integration. Lead rep for 14 key trade stores in Sagamu corridor. ₦210,000 disbursement executed on schedule.',
    allocationAmount: 210000,
    bankName: 'First Bank Nigeria',
    accountNumber: '3049281190',
    verificationStatus: 'Fully Cleared & Validated',
    guarantorName: 'Mrs. Funke Ibikunle (Sagamu Traders Union)',
    posCount: 34,
    thread: []
  },
  {
    id: 'staff-4',
    name: 'Efeosa Erhabor',
    initials: 'EE',
    code: 'VSR-BN-0304',
    status: 'unfunded',
    statusLabel: 'UNFUNDED / PENDING VERIFICATION',
    region: 'Benin',
    location: 'Benin City (Ring Road & Uselu)',
    tenureMonths: 0.9,
    tenureDisplay: '0.9 Months Tenure',
    phone: '+234 802 771 9043',
    hasLoan: false,
    loanLabel: 'No Active Loan',
    boxType: 'onboarding',
    boxHeaderTitle: 'ONBOARDING & GUARANTOR VERIFICATION',
    boxHeaderTag: 'AWAITING STEP 2',
    boxHighlightText: 'Guarantor letter submitted today; Field ops supervisor in Benin (Godwin) scheduled for physical residence confirmation tomorrow morning.',
    allocationAmount: 140000,
    bankName: 'United Bank for Africa',
    accountNumber: '2093849182',
    verificationStatus: 'Physical Verification Pending',
    guarantorName: 'Elder Osamwonyi Erhabor (Edo State Civil Service)',
    posCount: 14,
    thread: []
  },
  // Additional Page 2 & Page 3 Active records
  {
    id: 'staff-5',
    name: 'Chinedu Okonkwo',
    initials: 'CO',
    code: 'VSR-LG-0518',
    status: 'funded',
    statusLabel: 'FUNDED ON 29TH',
    region: 'Lagos',
    location: 'Ikeja Commercial (Allen & Computer Village)',
    tenureMonths: 6.8,
    tenureDisplay: '6.8 Months Tenure',
    phone: '+234 802 334 1198',
    hasLoan: false,
    loanLabel: 'No Active Loan',
    boxType: 'milestone',
    boxHeaderTitle: 'REGIONAL PERFORMANCE MILESTONE',
    boxHeaderTag: 'TARGET: 108% ACHIEVED',
    boxHighlightText: 'Supervised 32 active POS kiosks in Ikeja tech corridor with 100% daily reconciliations in week 38.',
    allocationAmount: 195000,
    bankName: 'GTBank',
    accountNumber: '0129485712',
    posCount: 32,
    thread: [
      {
        id: 'msg-5',
        sender: 'TOPE (OPS)',
        role: 'TOPE (OPS)',
        text: 'Chinedu exceeded his replenishment target by 8% this Monday. POS restocking logged in system.',
        time: '08:45 AM',
        isOps: true
      }
    ]
  },
  {
    id: 'staff-6',
    name: 'Blessing Omowunmi',
    initials: 'BO',
    code: 'VSR-IB-0922',
    status: 'funded',
    statusLabel: 'FUNDED ON 29TH',
    region: 'Ibadan',
    location: 'Ibadan North (Mokola & UI Road)',
    tenureMonths: 4.1,
    tenureDisplay: '4.1 Months Tenure',
    phone: '+234 703 118 7643',
    hasLoan: false,
    loanLabel: 'No Active Loan',
    boxType: 'audit',
    boxHeaderTitle: 'EXECUTIVE AUDIT & DIRECTIVE THREAD',
    boxHeaderTag: 'DISBURSEMENT LOG: ₦160,000 VERIFIED',
    allocationAmount: 160000,
    bankName: 'Kuda Microfinance',
    accountNumber: '2001928471',
    posCount: 22,
    thread: [
      {
        id: 'msg-6',
        sender: 'CEO',
        role: 'CEO',
        text: 'Ensure Mokola outlet inventory matches daily telemetric upload before Friday close.',
        time: '10:02 AM'
      }
    ]
  },
  {
    id: 'staff-7',
    name: 'Ayomide Dosunmu',
    initials: 'AD',
    code: 'VSR-OG-1102',
    status: 'unfunded',
    statusLabel: 'UNFUNDED / PENDING VERIFICATION',
    region: 'Ogun',
    location: 'Ota Industrial Estate & Sango',
    tenureMonths: 2.1,
    tenureDisplay: '2.1 Months Tenure',
    phone: '+234 813 440 9921',
    hasLoan: true,
    loanAmount: 45000,
    loanLabel: 'On Loan (₦45,000)',
    boxType: 'blocker',
    boxHeaderTitle: 'FUNDING BLOCKER & INVESTIGATION LOG',
    boxHeaderTag: 'AUDIT REVIEW SCHEDULED',
    allocationAmount: 150000,
    bankName: 'Fidelity Bank',
    accountNumber: '5019284729',
    posCount: 17,
    thread: [
      {
        id: 'msg-7',
        sender: 'TOPE (OPS)',
        role: 'TOPE (OPS)',
        text: 'Loan deduction schedule of ₦15,000/month being aligned with next disbursement tranche.',
        time: 'Yesterday',
        isOps: true
      }
    ]
  },
  {
    id: 'staff-8',
    name: 'Osaze Iyamu',
    initials: 'OI',
    code: 'VSR-BN-0320',
    status: 'funded',
    statusLabel: 'FUNDED ON 29TH',
    region: 'Benin',
    location: 'Benin GRA & Airport Road',
    tenureMonths: 7.2,
    tenureDisplay: '7.2 Months Tenure',
    phone: '+234 805 229 6710',
    hasLoan: false,
    loanLabel: 'No Active Loan',
    boxType: 'milestone',
    boxHeaderTitle: 'REGIONAL PERFORMANCE MILESTONE',
    boxHeaderTag: 'TARGET: 102% ACHIEVED',
    boxHighlightText: 'Established 6 new hospitality venue supply partnerships across Airport Road commercial zone.',
    allocationAmount: 175000,
    bankName: 'Stanbic IBTC',
    accountNumber: '0029384711',
    posCount: 26,
    thread: []
  }
];

export const PROSPECTIVE_STAFF_RECORDS: StaffRecord[] = [
  {
    id: 'prosp-1',
    name: 'Kehinde Alabi',
    initials: 'KA',
    code: 'PRE-LG-0112',
    status: 'prospective',
    statusLabel: 'OFFER OUT / STAGE 3',
    region: 'Lagos',
    location: 'Lekki Phase 1 & Ikoyi Corridor',
    tenureMonths: 0,
    tenureDisplay: 'Pre-Induction',
    phone: '+234 812 345 6789',
    hasLoan: false,
    loanLabel: 'No Loan Eligibility',
    boxType: 'onboarding',
    boxHeaderTitle: 'BACKGROUND AUDIT & OFFER ACCEPTANCE',
    boxHeaderTag: 'AWAITING SIGNED CONTRACT',
    boxHighlightText: 'Candidate cleared interview panel with 92% assessment score. Medical clearance and guarantor validation package in progress.',
    allocationAmount: 180000,
    posCount: 0,
    thread: [
      {
        id: 'p-msg-1',
        sender: 'HR',
        role: 'HR',
        text: 'Offer letter transmitted via DocuSign yesterday. Candidate promised submission by 4 PM today.',
        time: '08:30 AM'
      }
    ]
  },
  {
    id: 'prosp-2',
    name: 'Yetunde Ajayi',
    initials: 'YA',
    code: 'PRE-IB-0089',
    status: 'prospective',
    statusLabel: 'INTERVIEW CLEARED',
    region: 'Ibadan',
    location: 'Ibadan Ring Road & Challenge',
    tenureMonths: 0,
    tenureDisplay: 'Pre-Induction',
    phone: '+234 809 112 3344',
    hasLoan: false,
    loanLabel: 'No Loan Eligibility',
    boxType: 'onboarding',
    boxHeaderTitle: 'PRE-INDUCTION FIELD FAMILIARIZATION',
    boxHeaderTag: 'ORIENTATION OCT 1ST',
    boxHighlightText: 'Assigned to shadow Folake Ibikunle on Sagamu-Ibadan trade border to master POS reconciliation workflows.',
    allocationAmount: 155000,
    posCount: 0,
    thread: []
  },
  {
    id: 'prosp-3',
    name: 'Samuel Okoro',
    initials: 'SO',
    code: 'PRE-BN-0044',
    status: 'prospective',
    statusLabel: 'GUARANTOR VETTING',
    region: 'Benin',
    location: 'Benin City Central & Ekenwan Road',
    tenureMonths: 0,
    tenureDisplay: 'Pre-Induction',
    phone: '+234 818 990 1234',
    hasLoan: false,
    loanLabel: 'No Loan Eligibility',
    boxType: 'onboarding',
    boxHeaderTitle: 'GUARANTOR VERIFICATION IN PROGRESS',
    boxHeaderTag: 'PHYSICAL CONFIRMATION',
    boxHighlightText: 'Benin Regional Field Trainer scheduled for physical residence confirmation on Thursday.',
    allocationAmount: 145000,
    posCount: 0,
    thread: []
  }
];

export const ARCHIVE_STAFF_RECORDS: StaffRecord[] = [
  {
    id: 'arch-1',
    name: 'Tunde Bakare',
    initials: 'TB',
    code: 'VSR-LG-0211',
    status: 'archived',
    statusLabel: 'VOLUNTARY RESIGNATION',
    region: 'Lagos',
    location: 'Surulere & Yaba Route',
    tenureMonths: 14.5,
    tenureDisplay: '14.5 Months Tenure (Exited)',
    phone: '+234 802 998 1234',
    hasLoan: false,
    loanLabel: 'Loan Cleared (₦0)',
    boxType: 'audit',
    boxHeaderTitle: 'OFFBOARDING AUDIT & POS RECOVERY',
    boxHeaderTag: 'ALL 18 TERMINALS RETRIEVED',
    boxHighlightText: 'Final reconciliation executed on Aug 15th. 100% equipment returned in good working condition. Gratuity settlement disbursed.',
    allocationAmount: 0,
    archivedReason: 'Relocation to UK for postgraduate studies',
    archivedDate: 'August 15, 2025',
    posCount: 0,
    thread: [
      {
        id: 'a-msg-1',
        sender: 'AUDIT',
        role: 'AUDIT',
        text: 'All stock balanced and signed off by Tope Balogun and internal controller.',
        time: 'Aug 15, 2025'
      }
    ]
  },
  {
    id: 'arch-2',
    name: 'Ibrahim Danladi',
    initials: 'ID',
    code: 'VSR-IB-0651',
    status: 'archived',
    statusLabel: 'POLICY DISENGAGEMENT',
    region: 'Ibadan',
    location: 'Iwo Road Interchange',
    tenureMonths: 3.2,
    tenureDisplay: '3.2 Months Tenure (Exited)',
    phone: '+234 813 554 8765',
    hasLoan: false,
    loanLabel: 'Recovery Complete',
    boxType: 'blocker',
    boxHeaderTitle: 'DISCIPLINARY REVIEW & RECOVERY LOG',
    boxHeaderTag: 'SECURITY DEPOSIT OFFSET',
    boxHighlightText: 'Failure to comply with daily inventory barcode audits. All POS terminals retrieved and inventory deficit recovered from security guarantor bond.',
    allocationAmount: 0,
    archivedReason: 'Continuous non-compliance with telemetry audits',
    archivedDate: 'July 28, 2025',
    posCount: 0,
    thread: []
  }
];

export const INITIAL_REQUISITIONS: Requisition[] = [
  {
    id: 'req-1',
    title: 'Senior Logistics Analyst',
    department: 'Tech & Log.',
    location: 'Victoria Island HQ',
    applicantCount: 24,
    status: 'active',
    salaryRange: '₦450k – ₦600k / mo'
  },
  {
    id: 'req-2',
    title: 'Regional Field Trainer',
    department: 'Finance & Ops',
    location: 'Benin Hub',
    applicantCount: 12,
    status: 'active',
    salaryRange: '₦300k – ₦380k / mo'
  },
  {
    id: 'req-3',
    title: 'Field Audit Lead',
    department: 'Finance & Ops',
    location: 'Ibadan / Oyo',
    applicantCount: 19,
    status: 'interviewing',
    salaryRange: '₦350k – ₦450k / mo'
  },
  {
    id: 'req-4',
    title: 'Inventory & POS Controller',
    department: 'Tech & Log.',
    location: 'Victoria Island HQ',
    applicantCount: 31,
    status: 'active',
    salaryRange: '₦320k – ₦420k / mo'
  },
  {
    id: 'req-5',
    title: 'Executive Assistant to CEO',
    department: 'Executive',
    location: 'Victoria Island HQ',
    applicantCount: 45,
    status: 'offer_out',
    salaryRange: '₦400k – ₦550k / mo'
  }
];

export const INITIAL_FUNDING_LOGS: FundingActionLog[] = [
  {
    id: 'log-1',
    amountText: '₦210,000 Disbursed',
    time: '13:42 WAT',
    description: 'Folake Ibikunle (VSR-OG-1029) via Paystack Transfer',
    type: 'disbursed'
  },
  {
    id: 'log-2',
    amountText: '₦185,000 Disbursed',
    time: '11:15 WAT',
    description: 'Oluwaseun Babatunde (VSR-LG-0412) Batch 29 approved',
    type: 'disbursed'
  },
  {
    id: 'log-3',
    amountText: 'Disbursement Hold',
    time: '08:30 WAT',
    description: 'Adewale Adeleke (VSR-IB-0891) - Zenith account mismatch',
    type: 'hold'
  },
  {
    id: 'log-4',
    amountText: '₦195,000 Disbursed',
    time: '07:12 WAT',
    description: 'Chinedu Okonkwo (VSR-LG-0518) Batch 29 approved',
    type: 'disbursed'
  }
];

export const MERCHANDISER_HUBS: FieldMerchandiserHub[] = [
  {
    hub: 'Lagos',
    hubDisplayName: 'Southwest Hub (Lagos)',
    merchandiserCount: 38,
    percentage: 48.7,
    colorHex: '#92C842',
    activePOS: 680,
    reconciliationRate: 99.4
  },
  {
    hub: 'Ibadan',
    hubDisplayName: 'Oyo Cluster (Ibadan)',
    merchandiserCount: 18,
    percentage: 23.0,
    colorHex: '#22d3ee',
    activePOS: 340,
    reconciliationRate: 98.1
  },
  {
    hub: 'Ogun',
    hubDisplayName: 'Ogun Hub (Abeokuta / Sagamu)',
    merchandiserCount: 12,
    percentage: 15.3,
    colorHex: '#F17F31',
    activePOS: 220,
    reconciliationRate: 97.8
  },
  {
    hub: 'Benin',
    hubDisplayName: 'Edo Sector (Benin)',
    merchandiserCount: 10,
    percentage: 12.8,
    colorHex: '#c084fc',
    activePOS: 180,
    reconciliationRate: 99.1
  }
];
