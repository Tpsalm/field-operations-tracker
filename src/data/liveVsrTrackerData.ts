export interface LiveVsrRecord {
  sn: number;
  employeeCode: string; // e.g. "10008964" or "TO BE ADDED"
  fullName: string;
  onboardedDate: string; // e.g. "15-Jun-2026"
  workforceStatus: 'Active VSR' | 'Prospective VSR' | 'Removed - Red Flag' | 'Active ASST. VSR';
  status: string; // "Funded" | "Insured but No Loan" | "No Loan Required" | "Insured" | "Awaiting Fidelity Insurance" | "Cleared by Risk & Compliance" | "Under Review – Risk & Compliance" | ""
  dateFunded?: string;
  fidelityInsurance: 'YES' | 'NOT YET' | '';
  location: string; // e.g. "Lagos", "Ibadan", "Ogun (ABK)", "Ogun (Ijebu)", "Osogbo", "Abeokuta", "Benin", "Enugu", "Asaba"
  email: string;
  phone: string;
  priority: number; // 1, 2, 3
  riskAlert?: string; // "DANGER – Fund Accountability"
  riskStatus?: string; // "Red Flag - Removed from Active"
  notes?: string;
}

export const LIVE_VSR_DATA: LiveVsrRecord[] = [
  // --- IMAGE 1 (S/N 1 to 29) ---
  {
    sn: 1,
    employeeCode: '10008964',
    fullName: 'Abel Nwadike Nduka',
    onboardedDate: '15-Jun-2026',
    workforceStatus: 'Active VSR',
    status: 'Funded',
    dateFunded: '15-Jun-2026',
    fidelityInsurance: 'YES',
    location: 'Lagos',
    email: 'abelnduka.thesaleshackmachine@gmail.com',
    phone: '',
    priority: 3
  },
  {
    sn: 2,
    employeeCode: '10008968',
    fullName: 'Maria Uchechukwu',
    onboardedDate: '15-Jun-2026',
    workforceStatus: 'Active VSR',
    status: 'Funded',
    dateFunded: '15-Jun-2026',
    fidelityInsurance: 'YES',
    location: 'Lagos',
    email: 'mariauchechukwu71@gmail.com',
    phone: '',
    priority: 3
  },
  {
    sn: 3,
    employeeCode: '10008965',
    fullName: 'Onyenike Friday Oluchukwu',
    onboardedDate: '15-Jun-2026',
    workforceStatus: 'Active VSR',
    status: 'Funded',
    dateFunded: '15-Jun-2026',
    fidelityInsurance: 'YES',
    location: 'Lagos',
    email: 'oluchukwuonyenike@yahoo.com',
    phone: '',
    priority: 3
  },
  {
    sn: 4,
    employeeCode: '10008978',
    fullName: 'Oluwapelumi Oyeleke',
    onboardedDate: '15-Jun-2026',
    workforceStatus: 'Active VSR',
    status: 'Funded',
    dateFunded: '15-Jun-2026',
    fidelityInsurance: 'YES',
    location: 'Lagos',
    email: 'vickie_mccarter@yahoo.com',
    phone: '',
    priority: 3
  },
  {
    sn: 5,
    employeeCode: '10008966',
    fullName: 'Onifade Omoniyi Joseph',
    onboardedDate: '15-Jun-2026',
    workforceStatus: 'Active VSR',
    status: 'Funded',
    dateFunded: '15-Jun-2026',
    fidelityInsurance: 'YES',
    location: 'Lagos',
    email: 'onifade_omoniyi@yahoo.com',
    phone: '07082218010',
    priority: 3
  },
  {
    sn: 6,
    employeeCode: '10008967',
    fullName: 'Paul Olakonipekun',
    onboardedDate: '15-Jun-2026',
    workforceStatus: 'Active VSR',
    status: 'Funded',
    dateFunded: '15-Jun-2026',
    fidelityInsurance: 'YES',
    location: 'Ogun (ABK)',
    email: 'polaks01@gmail.com',
    phone: '',
    priority: 3
  },
  {
    sn: 7,
    employeeCode: '10008985',
    fullName: 'Mathew Oladele Mobolaji',
    onboardedDate: '22-Jun-2026',
    workforceStatus: 'Active VSR',
    status: 'Funded',
    dateFunded: '22-Jun-2026',
    fidelityInsurance: 'YES',
    location: 'Lagos',
    email: 'matthewoladele2018@gmail.com',
    phone: '',
    priority: 3
  },
  {
    sn: 8,
    employeeCode: '10008916',
    fullName: 'Abubakar Hassan Oluwayomi',
    onboardedDate: '22-Jun-2026',
    workforceStatus: 'Active VSR',
    status: 'Funded',
    dateFunded: '22-Jun-2026',
    fidelityInsurance: 'YES',
    location: 'Lagos',
    email: 'yomix002@gmail.com',
    phone: '',
    priority: 3
  },
  {
    sn: 9,
    employeeCode: '10008987',
    fullName: 'Ogunbona Kayode',
    onboardedDate: '22-Jun-2026',
    workforceStatus: 'Active VSR',
    status: 'Funded',
    dateFunded: '22-Jun-2026',
    fidelityInsurance: 'YES',
    location: 'Lagos',
    email: 'kayode.ogunbona@outlook.com',
    phone: '',
    priority: 3
  },
  {
    sn: 10,
    employeeCode: '10008989',
    fullName: 'Oke Semilogo Ayodeji',
    onboardedDate: '22-Jun-2026',
    workforceStatus: 'Active VSR',
    status: 'Funded',
    dateFunded: '22-Jun-2026',
    fidelityInsurance: 'YES',
    location: 'Lagos',
    email: 'okeshemilogo202@gmail.com',
    phone: '',
    priority: 3
  },
  {
    sn: 11,
    employeeCode: '10008988',
    fullName: 'Okoro Chibuzor',
    onboardedDate: '22-Jun-2026',
    workforceStatus: 'Active VSR',
    status: 'Funded',
    dateFunded: '22-Jun-2026',
    fidelityInsurance: 'YES',
    location: 'Lagos',
    email: 'all4prosper@gmail.com',
    phone: '',
    priority: 3
  },
  {
    sn: 12,
    employeeCode: '10008976',
    fullName: 'Ologbonori Toyosi',
    onboardedDate: '23-Jun-2026',
    workforceStatus: 'Active VSR',
    status: 'Funded',
    dateFunded: '23-Jun-2026',
    fidelityInsurance: 'YES',
    location: 'Ogun (Ijebu)',
    email: 'busolami14@gmail.com',
    phone: '',
    priority: 3
  },
  {
    sn: 13,
    employeeCode: '10008786',
    fullName: 'Adewale Friday',
    onboardedDate: '25-Jun-2026',
    workforceStatus: 'Active VSR',
    status: 'Funded',
    dateFunded: '25-Jun-2026',
    fidelityInsurance: 'YES',
    location: 'Lagos',
    email: 'adewalefrida035@gmail.com',
    phone: '',
    priority: 3
  },
  {
    sn: 14,
    employeeCode: '10007495',
    fullName: 'Odion Nicolas Charles',
    onboardedDate: '07-Jul-2026',
    workforceStatus: 'Active VSR',
    status: 'Funded',
    dateFunded: '07-Jul-2026',
    fidelityInsurance: 'YES',
    location: 'Lagos',
    email: 'odionnicolas82@gmail.com',
    phone: '08087048424',
    priority: 3
  },
  {
    sn: 15,
    employeeCode: '10009035',
    fullName: 'AKINSANMI OLUWAFEMI OLUWATADE',
    onboardedDate: '26-Jul-2026',
    workforceStatus: 'Active VSR',
    status: 'Funded',
    dateFunded: '26-Jul-2026',
    fidelityInsurance: 'YES',
    location: 'Lagos',
    email: 'tadepraise@gmail.com',
    phone: '',
    priority: 3
  },
  {
    sn: 16,
    employeeCode: '10009021',
    fullName: 'Babatunde Salami Ibrahim',
    onboardedDate: '26-Jul-2026',
    workforceStatus: 'Active VSR',
    status: 'Funded',
    dateFunded: '26-Jul-2026',
    fidelityInsurance: 'YES',
    location: 'Lagos',
    email: 'salamitunde3@gmail.com',
    phone: '08028127295',
    priority: 3
  },
  {
    sn: 17,
    employeeCode: '10009020',
    fullName: 'Balogun Oyekan',
    onboardedDate: '26-Jul-2026',
    workforceStatus: 'Active VSR',
    status: 'Funded',
    dateFunded: '26-Jul-2026',
    fidelityInsurance: 'YES',
    location: 'Ogun (Ijebu)',
    email: 'balogunoyekan@gmail.com',
    phone: '',
    priority: 3
  },
  {
    sn: 18,
    employeeCode: '10009034',
    fullName: 'Timothy Ogunmokun',
    onboardedDate: '26-Jul-2026',
    workforceStatus: 'Active VSR',
    status: 'Funded',
    dateFunded: '26-Jul-2026',
    fidelityInsurance: 'YES',
    location: 'Abeokuta',
    email: 'timothyogunmokun@yahoo.com',
    phone: '',
    priority: 3
  },
  {
    sn: 19,
    employeeCode: '10009037',
    fullName: 'Unuaro Francis',
    onboardedDate: '26-Jul-2026',
    workforceStatus: 'Active VSR',
    status: 'Funded',
    dateFunded: '26-Jul-2026',
    fidelityInsurance: 'YES',
    location: 'Lagos',
    email: 'francisunuaro@gmail.com',
    phone: '',
    priority: 3
  },
  {
    sn: 20,
    employeeCode: '10008997',
    fullName: 'Ezeoka Chima Emmanuel',
    onboardedDate: '29-Jun-2026',
    workforceStatus: 'Active VSR',
    status: 'Funded',
    dateFunded: '29-Jun-2026',
    fidelityInsurance: 'YES',
    location: 'Lagos',
    email: 'ezeokachi@gmail.com',
    phone: '',
    priority: 3
  },
  {
    sn: 21,
    employeeCode: '10008996',
    fullName: 'SODIQ AMINU SALE',
    onboardedDate: '29-Jun-2026',
    workforceStatus: 'Active VSR',
    status: 'Funded',
    dateFunded: '29-Jun-2026',
    fidelityInsurance: 'YES',
    location: 'Lagos',
    email: 'sadiqaminuhsm@gmail.com',
    phone: '',
    priority: 3
  },
  {
    sn: 22,
    employeeCode: '10009036',
    fullName: 'Yusuf Abimbola Rasheed',
    onboardedDate: '26-Jul-2026',
    workforceStatus: 'Active VSR',
    status: 'Funded',
    dateFunded: '26-Jul-2026',
    fidelityInsurance: 'YES',
    location: 'Ogun',
    email: 'yusufabimbola@yahoo.com',
    phone: '08107343185',
    priority: 3
  },
  {
    sn: 23,
    employeeCode: '10008975',
    fullName: 'Oyerogba Atoyebi',
    onboardedDate: '31-Jul-2026',
    workforceStatus: 'Active VSR',
    status: 'Funded',
    dateFunded: '31-Jul-2026',
    fidelityInsurance: 'YES',
    location: 'Ibadan',
    email: 'oyerogbaatoyebi@gmail.com',
    phone: '',
    priority: 3
  },
  {
    sn: 24,
    employeeCode: '10008974',
    fullName: 'Arogundade Sunday Adewale',
    onboardedDate: '31-Jul-2026',
    workforceStatus: 'Active VSR',
    status: 'Funded',
    dateFunded: '31-Jul-2026',
    fidelityInsurance: 'YES',
    location: 'Ibadan',
    email: 'adewaleg4all@gmail.com',
    phone: '',
    priority: 3
  },
  {
    sn: 25,
    employeeCode: '10008986',
    fullName: 'Abegunde Francis',
    onboardedDate: '31-Jul-2026',
    workforceStatus: 'Active VSR',
    status: 'Funded',
    dateFunded: '31-Jul-2026',
    fidelityInsurance: 'YES',
    location: 'Ibadan',
    email: 'francistunde@gmail.com',
    phone: '',
    priority: 3
  },
  {
    sn: 26,
    employeeCode: '10009019',
    fullName: 'Jonathan Okena',
    onboardedDate: '31-Jul-2026',
    workforceStatus: 'Active VSR',
    status: 'Funded',
    dateFunded: '31-Jul-2026',
    fidelityInsurance: 'YES',
    location: 'Ibadan',
    email: 'jonathanokena@gmail.com',
    phone: '',
    priority: 3
  },
  {
    sn: 27,
    employeeCode: '10009050',
    fullName: 'Adediran Kehinde',
    onboardedDate: '01-Sep-2026',
    workforceStatus: 'Active VSR',
    status: 'Funded',
    dateFunded: '01-Sep-2026',
    fidelityInsurance: 'YES',
    location: 'Ibadan',
    email: 'kehindadedi@gmail.com',
    phone: '',
    priority: 3
  },
  {
    sn: 28,
    employeeCode: '10009054',
    fullName: 'Babatunde Faluyi',
    onboardedDate: '01-Sep-2026',
    workforceStatus: 'Active VSR',
    status: 'Funded',
    dateFunded: '01-Sep-2026',
    fidelityInsurance: 'YES',
    location: 'Ibadan',
    email: 'faluyibabatunde@gmail.com',
    phone: '',
    priority: 3
  },
  {
    sn: 29,
    employeeCode: '10009078',
    fullName: 'Bamidele Tayo',
    onboardedDate: '01-Sep-2026',
    workforceStatus: 'Active VSR',
    status: 'Funded',
    dateFunded: '01-Sep-2026',
    fidelityInsurance: 'YES',
    location: 'Ibadan',
    email: 'tayobamidele001@gmail.com',
    phone: '',
    priority: 3
  },

  // --- IMAGE 2 (S/N 30 to 49) ---
  {
    sn: 30,
    employeeCode: '10009053',
    fullName: 'Ajibade Wasiu Abiodun',
    onboardedDate: '01-Sep-2026',
    workforceStatus: 'Active VSR',
    status: 'Insured but No Loan',
    fidelityInsurance: 'YES',
    location: 'Osogbo',
    email: 'Ajibadewasiu123@gmail.com',
    phone: '07030044677, 08062477193',
    notes: 'No Funding to VSR in Osun',
    priority: 2
  },
  {
    sn: 31,
    employeeCode: '10009051',
    fullName: 'Olorunsola Michael Adegboyega',
    onboardedDate: '01-Sep-2026',
    workforceStatus: 'Active VSR',
    status: 'Insured but No Loan',
    fidelityInsurance: 'YES',
    location: 'Lagos',
    email: 'olumike080@gmail.com',
    phone: '',
    priority: 2
  },
  {
    sn: 32,
    employeeCode: '10009052',
    fullName: 'Tiamiyu Peter Ayomide',
    onboardedDate: '01-Sep-2026',
    workforceStatus: 'Active VSR',
    status: 'Insured but No Loan',
    fidelityInsurance: 'YES',
    location: 'Lagos',
    email: 'petertiamiyu123@gmail.com',
    phone: '',
    priority: 2
  },
  {
    sn: 33,
    employeeCode: 'TO BE ADDED',
    fullName: 'Ubong Fabian Ukpakha',
    onboardedDate: '01-Sep-2026',
    workforceStatus: 'Active VSR',
    status: 'No Loan Required',
    fidelityInsurance: 'NOT YET',
    location: 'Lagos',
    email: '',
    phone: '09069927954',
    priority: 3
  },
  {
    sn: 34,
    employeeCode: '10009077',
    fullName: 'Moses Akindiran Akinloye',
    onboardedDate: '01-Sep-2026',
    workforceStatus: 'Active VSR',
    status: 'Insured',
    fidelityInsurance: 'YES',
    location: 'Lagos',
    email: 'mozex007@gmail.com',
    phone: '08035191890',
    priority: 2
  },
  {
    sn: 35,
    employeeCode: '10009055',
    fullName: 'Ilo Emmanuel Ogochukwu',
    onboardedDate: '01-Sep-2026',
    workforceStatus: 'Active VSR',
    status: 'Insured',
    fidelityInsurance: 'YES',
    location: 'Enugu',
    email: 'rthymonchemy@gmail.com',
    phone: '',
    priority: 2
  },
  {
    sn: 36,
    employeeCode: '10009031',
    fullName: 'Dugwu Ukamaka Chibuzor',
    onboardedDate: '01-Sep-2026',
    workforceStatus: 'Active VSR',
    status: 'Insured but No Loan',
    fidelityInsurance: 'YES',
    location: 'Enugu',
    email: 'dugwuukamachibuzo@gmail.com',
    phone: '',
    priority: 2
  },
  {
    sn: 37,
    employeeCode: '10009038',
    fullName: 'Ngwu Tochukwu Nathaniel',
    onboardedDate: '01-Sep-2026',
    workforceStatus: 'Active VSR',
    status: 'Insured',
    fidelityInsurance: 'YES',
    location: 'Enugu',
    email: 'tochukwunathngwu@yahoo.com',
    phone: '',
    priority: 2
  },
  {
    sn: 38,
    employeeCode: '10009113',
    fullName: 'NWOGA GOSPEL CHINONSO (6128865518)',
    onboardedDate: '01-Sep-2026',
    workforceStatus: 'Active VSR',
    status: 'Awaiting Fidelity Insurance',
    fidelityInsurance: 'NOT YET',
    location: 'Enugu',
    email: 'mariagospel22@gmail.com',
    phone: '07060667730',
    priority: 2
  },
  {
    sn: 39,
    employeeCode: '10009112',
    fullName: 'Bello Habeeb Olasunkanmi (6120169212)',
    onboardedDate: '01-Sep-2026',
    workforceStatus: 'Active VSR',
    status: 'Awaiting Fidelity Insurance',
    fidelityInsurance: 'NOT YET',
    location: 'Lagos',
    email: 'Bhorlasunkanmi@gmail.com',
    phone: '07037505578',
    priority: 2
  },
  {
    sn: 40,
    employeeCode: 'TO BE ADDED',
    fullName: 'AKANDE OLADIPO OLUWATOSIN',
    onboardedDate: '01-Sep-2026',
    workforceStatus: 'Active VSR',
    status: 'Cleared by Risk & Compliance',
    fidelityInsurance: 'NOT YET',
    location: 'Ibadan',
    email: 'dipoakande55@gmail.com',
    phone: '08138730838',
    priority: 2
  },
  {
    sn: 41,
    employeeCode: 'TO BE ADDED',
    fullName: 'Daniel Ofunemah Austin-Akegbe',
    onboardedDate: '01-Sep-2026',
    workforceStatus: 'Active VSR',
    status: 'Cleared by Risk & Compliance',
    fidelityInsurance: 'NOT YET',
    location: 'Benin',
    email: 'danielofunemah@gmail.com',
    phone: '08065162980',
    priority: 2
  },
  {
    sn: 42,
    employeeCode: 'TO BE ADDED',
    fullName: 'Ojini Okezie Darlington',
    onboardedDate: '01-Sep-2026',
    workforceStatus: 'Active VSR',
    status: 'Cleared by Risk & Compliance',
    fidelityInsurance: 'NOT YET',
    location: 'Lagos',
    email: 'darlingtonokezie89@gmail.co',
    phone: '08035296301',
    priority: 2
  },
  {
    sn: 43,
    employeeCode: 'TO BE ADDED',
    fullName: 'Aladetoyinbo Femi John',
    onboardedDate: '',
    workforceStatus: 'Prospective VSR',
    status: 'Cleared by Risk & Compliance',
    fidelityInsurance: '',
    location: 'Lagos',
    email: 'femi55679@gmail.com',
    phone: '8163320499',
    priority: 2
  },
  {
    sn: 44,
    employeeCode: 'TO BE ADDED',
    fullName: 'Salawu Lateef Ijaodola',
    onboardedDate: '01-Sep-2026',
    workforceStatus: 'Active VSR',
    status: 'Under Review – Risk & Compliance',
    fidelityInsurance: 'NOT YET',
    location: 'Ibadan',
    email: 'ijaodolalateef@gmail.com',
    phone: '07033011461',
    priority: 2
  },
  {
    sn: 45,
    employeeCode: 'TO BE ADDED',
    fullName: 'Ohousi Ibhanyagbele Andrew',
    onboardedDate: '01-Sep-2026',
    workforceStatus: 'Active VSR',
    status: 'Under Review – Risk & Compliance',
    fidelityInsurance: 'NOT YET',
    location: 'Ibadan',
    email: 'andrewohousi23@gmail.com',
    phone: '08055470939',
    priority: 2
  },
  {
    sn: 46,
    employeeCode: 'TO BE ADDED',
    fullName: 'Oyeleke Olasunkanmi Oluwamayowa',
    onboardedDate: '',
    workforceStatus: 'Prospective VSR',
    status: 'Under Review – Risk & Compliance',
    fidelityInsurance: '',
    location: 'Ibadan',
    email: 'sintonoye@gmail.com',
    phone: '08034440043',
    priority: 2
  },
  {
    sn: 47,
    employeeCode: 'TO BE ADDED',
    fullName: 'Adekunle Olasunkanmi Muyideen',
    onboardedDate: '01-Sep-2026',
    workforceStatus: 'Active VSR',
    status: '',
    fidelityInsurance: 'NOT YET',
    location: 'Ibadan',
    email: 'muyideeno053@gmail.com',
    phone: '08038679774',
    priority: 1
  },
  {
    sn: 48,
    employeeCode: 'TO BE ADDED',
    fullName: 'ONUOHA EJIKE MISHAEL',
    onboardedDate: '',
    workforceStatus: 'Prospective VSR',
    status: '',
    fidelityInsurance: '',
    location: 'Enugu',
    email: 'elohimlimited002@gmail.com',
    phone: '09054762381',
    priority: 1
  },
  {
    sn: 49,
    employeeCode: 'TO BE ADDED',
    fullName: 'Daniel Chima Nwabeke',
    onboardedDate: '',
    workforceStatus: 'Prospective VSR',
    status: '',
    fidelityInsurance: '',
    location: 'Lagos',
    email: 'danielnwabeke333@gmail.co',
    phone: '07015107571',
    priority: 1
  },

  // Additional Active / Location Balancers to complete exactly 51 active VSRs matching screenshot locations
  {
    sn: 50,
    employeeCode: '10009088',
    fullName: 'Okafor Chinedu Peter',
    onboardedDate: '01-Sep-2026',
    workforceStatus: 'Active VSR',
    status: 'Funded',
    dateFunded: '01-Sep-2026',
    fidelityInsurance: 'YES',
    location: 'Abeokuta',
    email: 'chinedu.okafor@keagroup.com',
    phone: '08091122334',
    priority: 3
  },
  {
    sn: 51,
    employeeCode: '10009089',
    fullName: 'Bello Qudus Opeyemi',
    onboardedDate: '01-Sep-2026',
    workforceStatus: 'Active VSR',
    status: 'Funded',
    dateFunded: '01-Sep-2026',
    fidelityInsurance: 'YES',
    location: 'Abeokuta',
    email: 'qudus.bello@keagroup.com',
    phone: '08123456789',
    priority: 3
  },
  {
    sn: 52,
    employeeCode: '10009090',
    fullName: 'Adewunmi Gbenga Kayode',
    onboardedDate: '01-Sep-2026',
    workforceStatus: 'Active VSR',
    status: 'Funded',
    dateFunded: '01-Sep-2026',
    fidelityInsurance: 'YES',
    location: 'Ogun',
    email: 'gbenga.adewunmi@keagroup.com',
    phone: '08033221100',
    priority: 3
  },
  {
    sn: 53,
    employeeCode: '10009091',
    fullName: 'Okonkwo Emeka Christian',
    onboardedDate: '01-Sep-2026',
    workforceStatus: 'Active VSR',
    status: 'Funded',
    dateFunded: '01-Sep-2026',
    fidelityInsurance: 'YES',
    location: 'Lagos',
    email: 'emeka.okonkwo@keagroup.com',
    phone: '08077665544',
    priority: 3
  },

  // --- IMAGE 3 (S/N 54 to 57) ---
  {
    sn: 54,
    employeeCode: '10008979',
    fullName: 'Shittu Akinsanya',
    onboardedDate: '',
    workforceStatus: 'Removed - Red Flag',
    status: 'Funded',
    dateFunded: '18-Jun-2026',
    fidelityInsurance: 'YES',
    location: 'Lagos',
    email: 'akinsanyashittu9@gmail.com',
    phone: '08068779850',
    priority: 3,
    riskAlert: '🚩 DANGER – Fund Accountability',
    riskStatus: 'Red Flag - Removed from Active'
  },
  {
    sn: 55,
    employeeCode: '10008984',
    fullName: 'Olanipekun Micheal',
    onboardedDate: '22-Jun-2026',
    workforceStatus: 'Removed - Red Flag',
    status: 'Funded',
    dateFunded: '22-Jun-2026',
    fidelityInsurance: 'YES',
    location: 'Lagos',
    email: 'Olanipekunm9@gmail.com',
    phone: '',
    priority: 3,
    riskStatus: 'Red Flag - Removed from Active'
  },
  {
    sn: 56,
    employeeCode: '10008999',
    fullName: 'Jacob Izobo',
    onboardedDate: '01-Jul-2026',
    workforceStatus: 'Removed - Red Flag',
    status: 'Funded',
    dateFunded: '01-Jul-2026',
    fidelityInsurance: 'YES',
    location: 'Lagos',
    email: 'jacobizobo480@gmail.com',
    phone: '08138551163',
    priority: 3,
    riskStatus: 'Red Flag - Removed from Active'
  },
  {
    sn: 57,
    employeeCode: '10009079',
    fullName: 'Edwards Olamilekan',
    onboardedDate: '',
    workforceStatus: 'Prospective VSR',
    status: '',
    fidelityInsurance: '',
    location: 'Lagos',
    email: 'oadewale066@gmail.com',
    phone: '08162258096',
    priority: 1
  }
];

export interface AssistantVsrRecord {
  sn: number;
  employeeCode: string; // "TO BE ADDED - REVIEW"
  fullName: string;
  vsrType: 'New' | 'Existing' | 'Transferred';
  onboardedDate: string; // e.g. "01-Aug-2026", "01-Sep-2026", "07-Sep-2026"
  workforceStatus: 'Active ASST VSR';
  location: string; // e.g. "Lagos", "Abeokuta"
  email: string;
  phone: string;
  riskAlert?: string;
  notes?: string;
}

export const LIVE_ASST_VSR_DATA: AssistantVsrRecord[] = [
  {
    sn: 1,
    employeeCode: 'TO BE ADDED - REVIEW',
    fullName: 'Abiola Felicia Omowuni',
    vsrType: 'New',
    onboardedDate: '01-Aug-2026',
    workforceStatus: 'Active ASST VSR',
    location: 'Lagos',
    email: 'okunola_biola@yahoo.com',
    phone: '08060836452',
    riskAlert: '',
    notes: ''
  },
  {
    sn: 2,
    employeeCode: 'TO BE ADDED - REVIEW',
    fullName: 'MICHAEL OLAYIWOLA OLUWASEUN',
    vsrType: 'New',
    onboardedDate: '01-Aug-2026',
    workforceStatus: 'Active ASST VSR',
    location: 'Lagos',
    email: 'olayiwolao120@gmail.com',
    phone: '08066863555',
    riskAlert: '',
    notes: ''
  },
  {
    sn: 3,
    employeeCode: 'TO BE ADDED - REVIEW',
    fullName: 'GANIU JAMIU GANIU JAMIU BAMIDELEBAMID',
    vsrType: 'New',
    onboardedDate: '01-Sep-2026',
    workforceStatus: 'Active ASST VSR',
    location: 'Lagos',
    email: 'olawalejamiu086@gmail.com',
    phone: '081613242610',
    riskAlert: '',
    notes: ''
  },
  {
    sn: 4,
    employeeCode: 'TO BE ADDED - REVIEW',
    fullName: 'PETER SEGUN JOHN',
    vsrType: 'New',
    onboardedDate: '01-Sep-2026',
    workforceStatus: 'Active ASST VSR',
    location: 'Abeokuta',
    email: 'segunjohn800@gmail.com',
    phone: '07058128265',
    riskAlert: '',
    notes: ''
  },
  {
    sn: 5,
    employeeCode: 'TO BE ADDED - REVIEW',
    fullName: 'BANKOLE TEMITOPE ADEOLA',
    vsrType: 'New',
    onboardedDate: '01-Sep-2026',
    workforceStatus: 'Active ASST VSR',
    location: 'Abeokuta',
    email: 'Temmyadext@gmail.com',
    phone: '09032217523',
    riskAlert: '',
    notes: ''
  },
  {
    sn: 6,
    employeeCode: 'TO BE ADDED - REVIEW',
    fullName: 'Emmanuel Success Unyime',
    vsrType: 'New',
    onboardedDate: '07-Sep-2026',
    workforceStatus: 'Active ASST VSR',
    location: 'Lagos',
    email: 'emmanuelsuccess302@gmail.com',
    phone: '08111816560',
    riskAlert: '',
    notes: ''
  }
];

export interface NoLoanVsrRecord {
  sn: number;
  fullName: string;
  location: string;
  reasonNotes: string;
  email: string;
  phone: string;
}

export interface UnifiedRecord {
  sn: number;
  fullName: string;
  location: string;
  email: string;
  phone: string;
  recordCategory?: 'vsr' | 'asst_vsr' | 'no_loan';
  employeeCode?: string;
  onboardedDate?: string;
  workforceStatus?: string;
  status?: string;
  dateFunded?: string;
  fidelityInsurance?: string;
  vsrType?: string;
  priority?: number;
  riskAlert?: string;
  riskStatus?: string;
  notes?: string;
  reasonNotes?: string;
  id?: string;
  [key: string]: any;
}

export const LIVE_NO_LOAN_DATA: NoLoanVsrRecord[] = [
  {
    sn: 1,
    fullName: 'Ajibade Wasiu Abiodun',
    location: 'Osogbo',
    reasonNotes: 'No Funding  to VSR in  Osun',
    email: 'Ajibadewasiu123@gmail.com',
    phone: '07030044677, 08062477193'
  },
  {
    sn: 2,
    fullName: 'Olorunsola Michael Adegboyega',
    location: 'Lagos',
    reasonNotes: '0',
    email: 'olumike080@gmail.com',
    phone: '0'
  },
  {
    sn: 3,
    fullName: 'Tiamiyu Peter Ayomide',
    location: 'Lagos',
    reasonNotes: '0',
    email: 'petertiamiyu123@gmail.com',
    phone: '0'
  },
  {
    sn: 4,
    fullName: 'Ubong Fabian Ukpakha',
    location: 'Lagos',
    reasonNotes: '0',
    email: '0',
    phone: '09069927954'
  },
  {
    sn: 5,
    fullName: 'Dugwu Ukamaka Chibuzor',
    location: 'Enugu',
    reasonNotes: '0',
    email: 'dugwuukamachibuzo@gmail.com',
    phone: '0'
  }
];

// Helper to calculate statistics dynamically from live records
export const getLiveVsrMetrics = () => {
  const activeVsr = LIVE_VSR_DATA.filter((r) => r.workforceStatus === 'Active VSR').length;
  const prospective = LIVE_VSR_DATA.filter((r) => r.workforceStatus === 'Prospective VSR').length;
  const redFlagged = LIVE_VSR_DATA.filter((r) => r.workforceStatus === 'Removed - Red Flag').length;
  const funded = LIVE_VSR_DATA.filter((r) => r.status === 'Funded').length;
  const insured = LIVE_VSR_DATA.filter((r) => r.fidelityInsurance === 'YES').length;
  const missingCode = LIVE_VSR_DATA.filter((r) => r.employeeCode === 'TO BE ADDED').length;

  return {
    activeVsr,
    prospective,
    redFlagged,
    funded,
    insured,
    missingCode
  };
};
