export interface POSTerminalRecord {
  id: string;
  terminalCode: string;
  storeName: string;
  hub: 'Lagos' | 'Ibadan' | 'Ogun' | 'Benin';
  zone: string;
  assignedRep: string;
  battery: number;
  stockLevel: number;
  lastPing: string;
  status: 'online' | 'warning' | 'reconciled';
  intensity: number; // 0 - 100
  hourlyTransactions: number;
}

// 24 Detailed retail card machines & POS terminals across the 4 Nigerian regional commercial zones
export const STORE_POS_TERMINALS: POSTerminalRecord[] = [
  // LAGOS CLUSTER (Southwest Hub - Dense commercial coastal zone)
  {
    id: 'term-lg-1',
    terminalCode: 'POS-LG-8801',
    storeName: 'Mega Plaza Supermarket',
    hub: 'Lagos',
    zone: 'Victoria Island',
    assignedRep: 'Oluwaseun Babatunde',
    battery: 94,
    stockLevel: 88,
    lastPing: '4s ago',
    status: 'reconciled',
    intensity: 98,
    hourlyTransactions: 142
  },
  {
    id: 'term-lg-2',
    terminalCode: 'POS-LG-8802',
    storeName: 'Ebeano Mart Victoria Island',
    hub: 'Lagos',
    zone: 'Victoria Island / Lekki',
    assignedRep: 'Chinedu Okonkwo',
    battery: 81,
    stockLevel: 92,
    lastPing: '12s ago',
    status: 'reconciled',
    intensity: 94,
    hourlyTransactions: 128
  },
  {
    id: 'term-lg-3',
    terminalCode: 'POS-LG-8815',
    storeName: 'Ikeja City Mall Provision Outlet',
    hub: 'Lagos',
    zone: 'Ikeja Mainland',
    assignedRep: 'Babatunde Adebayo',
    battery: 89,
    stockLevel: 78,
    lastPing: '8s ago',
    status: 'reconciled',
    intensity: 99,
    hourlyTransactions: 156
  },
  {
    id: 'term-lg-4',
    terminalCode: 'POS-LG-8840',
    storeName: 'Marina CMS Ferry Terminal Store',
    hub: 'Lagos',
    zone: 'Lagos Island',
    assignedRep: 'Oluwaseun Babatunde',
    battery: 89,
    stockLevel: 79,
    lastPing: '18s ago',
    status: 'reconciled',
    intensity: 85,
    hourlyTransactions: 110
  },
  {
    id: 'term-lg-5',
    terminalCode: 'POS-LG-8852',
    storeName: 'Otigba Computer Village Tech Kiosk',
    hub: 'Lagos',
    zone: 'Ikeja',
    assignedRep: 'Korede Adeleke',
    battery: 76,
    stockLevel: 84,
    lastPing: '15s ago',
    status: 'reconciled',
    intensity: 96,
    hourlyTransactions: 135
  },
  {
    id: 'term-lg-6',
    terminalCode: 'POS-LG-8860',
    storeName: 'Surulere National Stadium Mart',
    hub: 'Lagos',
    zone: 'Surulere',
    assignedRep: 'Chinedu Okonkwo',
    battery: 72,
    stockLevel: 65,
    lastPing: '30s ago',
    status: 'online',
    intensity: 76,
    hourlyTransactions: 84
  },
  {
    id: 'term-lg-7',
    terminalCode: 'POS-LG-8874',
    storeName: 'Alaba International Electronic Depot',
    hub: 'Lagos',
    zone: 'Ojo / Trade Fair',
    assignedRep: 'Tope Balogun (Direct VSR)',
    battery: 92,
    stockLevel: 94,
    lastPing: '6s ago',
    status: 'reconciled',
    intensity: 93,
    hourlyTransactions: 122
  },
  {
    id: 'term-lg-8',
    terminalCode: 'POS-LG-8888',
    storeName: 'Oshodi Transport Interchange Kiosk',
    hub: 'Lagos',
    zone: 'Oshodi-Isolo',
    assignedRep: 'Babatunde Adebayo',
    battery: 88,
    stockLevel: 70,
    lastPing: '22s ago',
    status: 'reconciled',
    intensity: 91,
    hourlyTransactions: 118
  },

  // OGUN CLUSTER (Abeokuta, Sagamu, Ota Industrial corridor)
  {
    id: 'term-og-1',
    terminalCode: 'POS-OG-2109',
    storeName: 'Sagamu Trade Express Outlet',
    hub: 'Ogun',
    zone: 'Sagamu Interchange',
    assignedRep: 'Folake Ibikunle',
    battery: 98,
    stockLevel: 96,
    lastPing: '9s ago',
    status: 'reconciled',
    intensity: 92,
    hourlyTransactions: 98
  },
  {
    id: 'term-og-2',
    terminalCode: 'POS-OG-2114',
    storeName: 'Panseke Market Depot',
    hub: 'Ogun',
    zone: 'Abeokuta Central',
    assignedRep: 'Folake Ibikunle',
    battery: 84,
    stockLevel: 81,
    lastPing: '45s ago',
    status: 'reconciled',
    intensity: 79,
    hourlyTransactions: 74
  },
  {
    id: 'term-og-3',
    terminalCode: 'POS-OG-2122',
    storeName: 'Ota Industrial Estate Provision Kiosk',
    hub: 'Ogun',
    zone: 'Ota Industrial Zone',
    assignedRep: 'Kayode Solarin',
    battery: 69,
    stockLevel: 62,
    lastPing: '2m ago',
    status: 'online',
    intensity: 85,
    hourlyTransactions: 86
  },
  {
    id: 'term-og-4',
    terminalCode: 'POS-OG-2130',
    storeName: 'Ijebu-Ode Central Provision Hub',
    hub: 'Ogun',
    zone: 'Ijebu-Ode',
    assignedRep: 'Kayode Solarin',
    battery: 91,
    stockLevel: 89,
    lastPing: '28s ago',
    status: 'reconciled',
    intensity: 75,
    hourlyTransactions: 68
  },
  {
    id: 'term-og-5',
    terminalCode: 'POS-OG-2145',
    storeName: 'Mowe Redemption Camp Transit Store',
    hub: 'Ogun',
    zone: 'Mowe Expressway',
    assignedRep: 'Folake Ibikunle',
    battery: 78,
    stockLevel: 73,
    lastPing: '1m ago',
    status: 'online',
    intensity: 83,
    hourlyTransactions: 80
  },

  // IBADAN CLUSTER (Oyo State - Bodija, Ring Road, Dugbe, UI)
  {
    id: 'term-ib-1',
    terminalCode: 'POS-IB-4410',
    storeName: 'Ventura Mall Bodija',
    hub: 'Ibadan',
    zone: 'Bodija Market',
    assignedRep: 'Adewale Adeleke',
    battery: 42,
    stockLevel: 31,
    lastPing: '1m ago',
    status: 'warning',
    intensity: 64,
    hourlyTransactions: 58
  },
  {
    id: 'term-ib-2',
    terminalCode: 'POS-IB-4418',
    storeName: 'Dugbe Commercial Depot',
    hub: 'Ibadan',
    zone: 'Dugbe CBD',
    assignedRep: 'Adewale Adeleke',
    battery: 83,
    stockLevel: 89,
    lastPing: '14s ago',
    status: 'reconciled',
    intensity: 88,
    hourlyTransactions: 94
  },
  {
    id: 'term-ib-3',
    terminalCode: 'POS-IB-4425',
    storeName: 'Ring Road FoodCo Outlet',
    hub: 'Ibadan',
    zone: 'Ring Road',
    assignedRep: 'Taofeek Alabi',
    battery: 90,
    stockLevel: 94,
    lastPing: '8s ago',
    status: 'reconciled',
    intensity: 90,
    hourlyTransactions: 102
  },
  {
    id: 'term-ib-4',
    terminalCode: 'POS-IB-4433',
    storeName: 'Iwo Road Transport Depot',
    hub: 'Ibadan',
    zone: 'Iwo Road',
    assignedRep: 'Taofeek Alabi',
    battery: 77,
    stockLevel: 75,
    lastPing: '40s ago',
    status: 'reconciled',
    intensity: 86,
    hourlyTransactions: 88
  },
  {
    id: 'term-ib-5',
    terminalCode: 'POS-IB-4440',
    storeName: 'University of Ibadan Tech Junction',
    hub: 'Ibadan',
    zone: 'UI / Agbowo',
    assignedRep: 'Adewale Adeleke',
    battery: 88,
    stockLevel: 80,
    lastPing: '35s ago',
    status: 'online',
    intensity: 78,
    hourlyTransactions: 72
  },
  {
    id: 'term-ib-6',
    terminalCode: 'POS-IB-4452',
    storeName: 'Mokola Roundabout Trade Post',
    hub: 'Ibadan',
    zone: 'Mokola',
    assignedRep: 'Taofeek Alabi',
    battery: 65,
    stockLevel: 58,
    lastPing: '1m ago',
    status: 'online',
    intensity: 72,
    hourlyTransactions: 66
  },

  // BENIN CLUSTER (Edo Sector - Ring Road, Uselu, GRA, New Benin)
  {
    id: 'term-bn-1',
    terminalCode: 'POS-BN-1102',
    storeName: 'Uselu Market Provision Depot',
    hub: 'Benin',
    zone: 'Uselu',
    assignedRep: 'Efeosa Erhabor',
    battery: 76,
    stockLevel: 64,
    lastPing: '35s ago',
    status: 'online',
    intensity: 87,
    hourlyTransactions: 85
  },
  {
    id: 'term-bn-2',
    terminalCode: 'POS-BN-1110',
    storeName: 'Oba Market Ring Road Terminal',
    hub: 'Benin',
    zone: 'Ring Road CBD',
    assignedRep: 'Efeosa Erhabor',
    battery: 93,
    stockLevel: 91,
    lastPing: '11s ago',
    status: 'reconciled',
    intensity: 92,
    hourlyTransactions: 98
  },
  {
    id: 'term-bn-3',
    terminalCode: 'POS-BN-1120',
    storeName: 'Benin GRA Plaza Commercial Kiosk',
    hub: 'Benin',
    zone: 'GRA',
    assignedRep: 'Osaze Iyamu',
    battery: 85,
    stockLevel: 82,
    lastPing: '20s ago',
    status: 'reconciled',
    intensity: 81,
    hourlyTransactions: 76
  },
  {
    id: 'term-bn-4',
    terminalCode: 'POS-BN-1135',
    storeName: 'Ikpoba Hill Wholesale Outpost',
    hub: 'Benin',
    zone: 'Ikpoba Hill',
    assignedRep: 'Osaze Iyamu',
    battery: 79,
    stockLevel: 77,
    lastPing: '50s ago',
    status: 'reconciled',
    intensity: 77,
    hourlyTransactions: 70
  },
  {
    id: 'term-bn-5',
    terminalCode: 'POS-BN-1142',
    storeName: 'New Benin Commercial Junction',
    hub: 'Benin',
    zone: 'New Benin Market',
    assignedRep: 'Efeosa Erhabor',
    battery: 88,
    stockLevel: 86,
    lastPing: '19s ago',
    status: 'reconciled',
    intensity: 89,
    hourlyTransactions: 92
  }
];
