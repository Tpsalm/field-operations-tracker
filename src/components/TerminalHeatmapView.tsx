import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { FieldMerchandiserHub } from '../types';

export interface SpatialPOSTerminal {
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
  x: number; // 0 - 1000
  y: number; // 0 - 640
  hourlyTransactions: number;
}

// 24 Detailed spatial retail terminals plotted across the 4 Nigerian regional commercial zones
export const SPATIAL_TERMINALS: SpatialPOSTerminal[] = [
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
    x: 240,
    y: 470,
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
    x: 280,
    y: 485,
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
    x: 215,
    y: 390,
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
    x: 230,
    y: 440,
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
    x: 205,
    y: 375,
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
    x: 195,
    y: 430,
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
    x: 160,
    y: 460,
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
    x: 220,
    y: 415,
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
    x: 340,
    y: 330,
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
    x: 270,
    y: 270,
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
    x: 220,
    y: 320,
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
    x: 390,
    y: 360,
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
    x: 290,
    y: 350,
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
    x: 430,
    y: 200,
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
    x: 390,
    y: 225,
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
    x: 380,
    y: 250,
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
    x: 460,
    y: 220,
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
    x: 420,
    y: 175,
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
    x: 405,
    y: 210,
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
    x: 770,
    y: 380,
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
    x: 800,
    y: 400,
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
    x: 820,
    y: 430,
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
    x: 840,
    y: 370,
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
    x: 790,
    y: 360,
    hourlyTransactions: 92
  }
];

// Regional Hub Coordinates for Hub Macro Nodes & Telemetry Trunks
const HUB_CENTERS: Record<string, { x: number; y: number; label: string; sub: string }> = {
  Lagos: { x: 230, y: 440, label: 'Lagos Hub (LOS)', sub: '680 POS • 38 Merchandisers' },
  Ogun: { x: 320, y: 320, label: 'Ogun Hub (OGN)', sub: '220 POS • 12 Merchandisers' },
  Ibadan: { x: 415, y: 215, label: 'Ibadan Cluster (IBD)', sub: '340 POS • 18 Merchandisers' },
  Benin: { x: 805, y: 390, label: 'Benin Sector (BEN)', sub: '180 POS • 10 Merchandisers' }
};

interface TerminalHeatmapViewProps {
  hubs: FieldMerchandiserHub[];
  selectedHub: string;
  onSelectHub: (hub: string) => void;
  onOpenNewVSR: () => void;
  onOpenShiftCompliance?: () => void;
}

export const TerminalHeatmapView: React.FC<TerminalHeatmapViewProps> = ({
  hubs,
  selectedHub,
  onSelectHub,
  onOpenNewVSR,
  onOpenShiftCompliance
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Display metric mode
  const [metricMode, setMetricMode] = useState<'intensity' | 'battery' | 'stock' | 'throughput'>('intensity');
  // Layer toggles
  const [showDensityHalos, setShowDensityHalos] = useState(true);
  const [showNetworkTrunks, setShowNetworkTrunks] = useState(true);
  const [showTerminalLabels, setShowTerminalLabels] = useState(false);
  // Selected terminal for inspector drawer
  const [selectedTerminal, setSelectedTerminal] = useState<SpatialPOSTerminal | null>(SPATIAL_TERMINALS[0]);
  const [hoveredTerminal, setHoveredTerminal] = useState<SpatialPOSTerminal | null>(null);
  const [pingSuccessId, setPingSuccessId] = useState<string | null>(null);

  // Filter terminals based on selected hub
  const filteredTerminals = useMemo(() => {
    if (selectedHub === 'All') return SPATIAL_TERMINALS;
    return SPATIAL_TERMINALS.filter((t) => t.hub === selectedHub);
  }, [selectedHub]);

  // Aggregate metrics for summary badge
  const stats = useMemo(() => {
    const list = filteredTerminals;
    const avgIntensity = Math.round(list.reduce((acc, t) => acc + t.intensity, 0) / list.length);
    const avgBattery = Math.round(list.reduce((acc, t) => acc + t.battery, 0) / list.length);
    const totalTransactions = list.reduce((acc, t) => acc + t.hourlyTransactions, 0);
    const warningCount = list.filter((t) => t.status === 'warning').length;
    return { avgIntensity, avgBattery, totalTransactions, warningCount };
  }, [filteredTerminals]);

  // Handle single terminal ping
  const handlePingTerminal = (terminalId: string) => {
    setPingSuccessId(terminalId);
    setTimeout(() => setPingSuccessId(null), 2500);
  };

  // Render D3 Interactive Heatmap Visualization
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    const width = 1000;
    const height = 620;

    // Root Group
    const g = svg.append('g').attr('class', 'heatmap-root');

    // 1. DEFS: Color Gradients and Blur Filters
    const defs = svg.append('defs');

    // Gaussian blur filter for spatial heat dissipation
    const filter = defs.append('filter')
      .attr('id', 'heat-blur')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '18')
      .attr('result', 'blur');

    // Subtle blur for node halo
    const glowFilter = defs.append('filter')
      .attr('id', 'node-glow')
      .attr('x', '-30%')
      .attr('y', '-30%')
      .attr('width', '160%')
      .attr('height', '160%');
    glowFilter.append('feGaussianBlur')
      .attr('stdDeviation', '4')
      .attr('result', 'glow');

    // High Intensity Radial Heat Gradient (Crimson / Coral Peak)
    const radHigh = defs.append('radialGradient')
      .attr('id', 'grad-high')
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', '50%');
    radHigh.append('stop').attr('offset', '0%').attr('stop-color', '#E05252').attr('stop-opacity', '0.75');
    radHigh.append('stop').attr('offset', '45%').attr('stop-color', '#F17F31').attr('stop-opacity', '0.45');
    radHigh.append('stop').attr('offset', '80%').attr('stop-color', '#92C842').attr('stop-opacity', '0.15');
    radHigh.append('stop').attr('offset', '100%').attr('stop-color', '#92C842').attr('stop-opacity', '0');

    // Medium Intensity Radial Heat Gradient (Lime / Amber)
    const radMed = defs.append('radialGradient')
      .attr('id', 'grad-med')
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', '50%');
    radMed.append('stop').attr('offset', '0%').attr('stop-color', '#92C842').attr('stop-opacity', '0.7');
    radMed.append('stop').attr('offset', '50%').attr('stop-color', '#22d3ee').attr('stop-opacity', '0.35');
    radMed.append('stop').attr('offset', '100%').attr('stop-color', '#22d3ee').attr('stop-opacity', '0');

    // Normal / Cool Radial Heat Gradient (Teal / Emerald)
    const radCool = defs.append('radialGradient')
      .attr('id', 'grad-cool')
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', '50%');
    radCool.append('stop').attr('offset', '0%').attr('stop-color', '#22d3ee').attr('stop-opacity', '0.6');
    radCool.append('stop').attr('offset', '60%').attr('stop-color', '#151f38').attr('stop-opacity', '0.2');
    radCool.append('stop').attr('offset', '100%').attr('stop-color', '#151f38').attr('stop-opacity', '0');

    // 2. BACKGROUND & REGIONAL GEOGRAPHIC ZONES
    // Clean coordinate grid lines
    const gridGroup = g.append('g').attr('class', 'spatial-grid').attr('opacity', 0.15);
    for (let x = 50; x < width; x += 100) {
      gridGroup.append('line')
        .attr('x1', x)
        .attr('y1', 20)
        .attr('x2', x)
        .attr('y2', height - 20)
        .attr('stroke', '#475569')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '3,6');
    }
    for (let y = 50; y < height; y += 100) {
      gridGroup.append('line')
        .attr('x1', 20)
        .attr('y1', y)
        .attr('x2', width - 20)
        .attr('y2', y)
        .attr('stroke', '#475569')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '3,6');
    }

    // Territorial boundaries for the 4 regional hubs
    const territories = [
      { id: 'Lagos', x: 130, y: 350, w: 200, h: 170, label: 'LAGOS COMMERCIAL CORRIDOR', latLon: '6.5244° N, 3.3792° E' },
      { id: 'Ogun', x: 200, y: 240, w: 220, h: 140, label: 'OGUN TRADE & INDUSTRIAL ZONE', latLon: '7.1604° N, 3.3483° E' },
      { id: 'Ibadan', x: 360, y: 150, w: 140, h: 130, label: 'IBADAN METROPOLIS CLUSTER', latLon: '7.3775° N, 3.9470° E' },
      { id: 'Benin', x: 740, y: 320, w: 140, h: 140, label: 'BENIN SECTOR COMMERCE HUB', latLon: '6.3350° N, 5.6037° E' }
    ];

    const territoryGroup = g.append('g').attr('class', 'territory-boundaries');
    territories.forEach((t) => {
      const isFocused = selectedHub === 'All' || selectedHub === t.id;

      territoryGroup.append('rect')
        .attr('x', t.x)
        .attr('y', t.y)
        .attr('width', t.w)
        .attr('height', t.h)
        .attr('rx', 12)
        .attr('fill', isFocused ? '#151f38' : '#0b1222')
        .attr('fill-opacity', isFocused ? 0.35 : 0.1)
        .attr('stroke', isFocused ? '#1e2d4d' : '#151f38')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', isFocused ? '4,4' : '2,4');

      territoryGroup.append('text')
        .attr('x', t.x + 10)
        .attr('y', t.y + 16)
        .attr('fill', isFocused ? '#94a3b8' : '#475569')
        .attr('font-size', '9px')
        .attr('font-family', 'monospace')
        .attr('font-weight', 'bold')
        .attr('letter-spacing', '0.08em')
        .text(t.label);

      territoryGroup.append('text')
        .attr('x', t.x + 10)
        .attr('y', t.y + 27)
        .attr('fill', isFocused ? '#64748b' : '#334155')
        .attr('font-size', '8px')
        .attr('font-family', 'monospace')
        .text(t.latLon);
    });

    // 3. NETWORK TELEMETRY TRUNKS & CORRIDORS
    if (showNetworkTrunks) {
      const trunkGroup = g.append('g').attr('class', 'telemetry-trunks');

      // Trunk links between major hubs
      const links = [
        { from: HUB_CENTERS.Lagos, to: HUB_CENTERS.Ogun, name: 'LOS-OGN Express Corridor (E1)' },
        { from: HUB_CENTERS.Ogun, to: HUB_CENTERS.Ibadan, name: 'OGN-IBD Highway Trunk (A1)' },
        { from: HUB_CENTERS.Ogun, to: HUB_CENTERS.Benin, name: 'Sagamu-Ore-Benin Coastal Arterial (A121)' }
      ];

      links.forEach((l) => {
        // Background line
        trunkGroup.append('line')
          .attr('x1', l.from.x)
          .attr('y1', l.from.y)
          .attr('x2', l.to.x)
          .attr('y2', l.to.y)
          .attr('stroke', '#1e2d4d')
          .attr('stroke-width', 2);

        // Animated telemetry pulse line
        trunkGroup.append('line')
          .attr('x1', l.from.x)
          .attr('y1', l.from.y)
          .attr('x2', l.to.x)
          .attr('y2', l.to.y)
          .attr('stroke', '#92C842')
          .attr('stroke-width', 1.5)
          .attr('stroke-opacity', 0.4)
          .attr('stroke-dasharray', '6,10')
          .attr('class', 'telemetry-stream-pulse');
      });
    }

    // 4. SPATIAL DENSITY HEATMAP LAYER
    // Renders high-density energy halos centered around terminals
    if (showDensityHalos) {
      const heatHaloGroup = g.append('g').attr('class', 'spatial-heat-halos');

      filteredTerminals.forEach((term) => {
        let gradId = 'grad-med';
        let radius = 45;

        if (metricMode === 'intensity') {
          if (term.intensity >= 92) {
            gradId = 'grad-high';
            radius = 55;
          } else if (term.intensity >= 80) {
            gradId = 'grad-med';
            radius = 42;
          } else {
            gradId = 'grad-cool';
            radius = 32;
          }
        } else if (metricMode === 'throughput') {
          radius = Math.max(25, term.hourlyTransactions * 0.4);
          gradId = term.hourlyTransactions > 100 ? 'grad-high' : 'grad-med';
        } else if (metricMode === 'battery') {
          gradId = term.battery < 50 ? 'grad-high' : 'grad-med';
          radius = 38;
        }

        // Dissipated heat radius circle
        heatHaloGroup.append('circle')
          .attr('cx', term.x)
          .attr('cy', term.y)
          .attr('r', radius)
          .attr('fill', `url(#${gradId})`)
          .attr('filter', 'url(#heat-blur)')
          .attr('opacity', 0.85);
      });
    }

    // 5. REGIONAL HUB MASTER NODES (Lagos, Ogun, Ibadan, Benin)
    const hubNodeGroup = g.append('g').attr('class', 'regional-hub-nodes');
    Object.entries(HUB_CENTERS).forEach(([hubName, pos]) => {
      const isSelected = selectedHub === 'All' || selectedHub === hubName;

      const nodeG = hubNodeGroup.append('g')
        .attr('transform', `translate(${pos.x}, ${pos.y})`)
        .attr('cursor', 'pointer')
        .on('click', () => onSelectHub(selectedHub === hubName ? 'All' : hubName));

      // Concentric beacon rings
      nodeG.append('circle')
        .attr('r', 20)
        .attr('fill', isSelected ? '#92C842' : '#1e2d4d')
        .attr('fill-opacity', 0.12)
        .attr('stroke', isSelected ? '#92C842' : '#475569')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '2,2');

      nodeG.append('circle')
        .attr('r', 10)
        .attr('fill', '#090e1c')
        .attr('stroke', isSelected ? '#92C842' : '#64748b')
        .attr('stroke-width', 2);

      nodeG.append('circle')
        .attr('r', 4)
        .attr('fill', isSelected ? '#92C842' : '#94a3b8');

      // Hub Label Badge
      nodeG.append('text')
        .attr('x', 0)
        .attr('y', -18)
        .attr('text-anchor', 'middle')
        .attr('fill', isSelected ? '#ffffff' : '#94a3b8')
        .attr('font-size', '11px')
        .attr('font-weight', 'bold')
        .attr('font-family', 'sans-serif')
        .text(pos.label);

      nodeG.append('text')
        .attr('x', 0)
        .attr('y', 24)
        .attr('text-anchor', 'middle')
        .attr('fill', '#64748b')
        .attr('font-size', '9px')
        .attr('font-family', 'monospace')
        .text(pos.sub);
    });

    // 6. TERMINAL POS INTERACTIVE NODES
    const terminalGroup = g.append('g').attr('class', 'terminal-nodes');

    filteredTerminals.forEach((term) => {
      const isSelected = selectedTerminal?.id === term.id;
      const isWarning = term.status === 'warning';

      const tGroup = terminalGroup.append('g')
        .attr('transform', `translate(${term.x}, ${term.y})`)
        .attr('cursor', 'pointer')
        .on('click', (event) => {
          event.stopPropagation();
          setSelectedTerminal(term);
        })
        .on('mouseenter', () => setHoveredTerminal(term))
        .on('mouseleave', () => setHoveredTerminal(null));

      // Ping radar pulse
      tGroup.append('circle')
        .attr('r', isSelected ? 14 : 9)
        .attr('fill', isWarning ? '#F17F31' : '#92C842')
        .attr('fill-opacity', isSelected ? 0.25 : 0.15)
        .attr('stroke', isWarning ? '#F17F31' : '#92C842')
        .attr('stroke-width', 1)
        .attr('filter', 'url(#node-glow)');

      // Core POS device pip
      tGroup.append('circle')
        .attr('r', isSelected ? 5 : 3.5)
        .attr('fill', isWarning ? '#F17F31' : term.intensity >= 90 ? '#92C842' : '#22d3ee')
        .attr('stroke', '#090e1c')
        .attr('stroke-width', 1.5);

      // Terminal ID Label (optional toggle)
      if (showTerminalLabels || isSelected) {
        tGroup.append('text')
          .attr('x', 9)
          .attr('y', 3)
          .attr('fill', isSelected ? '#92C842' : '#cbd5e1')
          .attr('font-size', '9px')
          .attr('font-weight', isSelected ? 'bold' : 'normal')
          .attr('font-family', 'monospace')
          .text(term.terminalCode.replace('POS-', ''));
      }
    });

    // 7. D3 ZOOM & PAN BEHAVIOR
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.8, 3.5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

  }, [filteredTerminals, metricMode, showDensityHalos, showNetworkTrunks, showTerminalLabels, selectedTerminal, selectedHub, onSelectHub]);

  return (
    <div className="space-y-4">
      {/* HEATMAP TOP ACTION & METRIC CONTROL BAR */}
      <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#92C842]/10 text-[#92C842] border border-[#92C842]/30">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                Terminal Activity &amp; Spatial Density Map
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#92C842]/20 text-[#92C842] border border-[#92C842]/30">
                D3 SPATIAL HEATMAP
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#151f38] text-slate-300 border border-[#1e2d4d]">
                1,420 MONITORED POS NODES
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Visualizing real-time retail heartbeat density, active POS intensity, and network trunks across 4 Nigerian regional hubs.
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {onOpenShiftCompliance && (
            <button
              onClick={onOpenShiftCompliance}
              className="px-3 py-1.5 rounded-lg bg-[#151f38] hover:bg-[#1a2745] text-slate-200 border border-[#1e2d4d] hover:border-[#92C842]/40 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              title="Generate PDF-ready Shift Compliance Audit"
            >
              <svg className="w-4 h-4 text-[#92C842]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
              <span>Shift Compliance (PDF)</span>
            </button>
          )}

          <button
            onClick={onOpenNewVSR}
            className="px-4 py-1.5 rounded-lg bg-[#92C842] hover:bg-[#7bb32e] text-[#090e1c] text-xs font-bold shadow-md shadow-[#92C842]/20 transition-all active:scale-95"
          >
            + Allocate Merchandiser
          </button>
        </div>
      </div>

      {/* FILTER & METRIC SELECTOR TOOLBAR */}
      <div className="bg-[#0b1222] border border-[#1e2d4d] rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Hub Filter Switcher */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-400 font-mono text-[11px] mr-1">TERRITORY:</span>
          {['All', 'Lagos', 'Ibadan', 'Ogun', 'Benin'].map((hubName) => (
            <button
              key={hubName}
              onClick={() => onSelectHub(hubName)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedHub === hubName
                  ? 'bg-[#92C842] text-[#090e1c] shadow-sm shadow-[#92C842]/20'
                  : 'bg-[#151f38] text-slate-300 hover:text-white border border-[#1e2d4d]'
              }`}
            >
              {hubName === 'All' ? 'All 4 Regional Hubs' : `${hubName} Cluster`}
            </button>
          ))}
        </div>

        {/* Heatmap Dimension Metric */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-400 font-mono text-[11px] mr-1">METRIC:</span>
          {[
            { id: 'intensity', label: 'Activity Intensity' },
            { id: 'throughput', label: 'Hourly Throughput' },
            { id: 'battery', label: 'Battery Capacity' }
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setMetricMode(m.id as any)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                metricMode === m.id
                  ? 'bg-[#1e2d4d] text-[#92C842] border border-[#92C842]/40 font-bold'
                  : 'bg-[#0e1628] text-slate-400 hover:text-slate-200 border border-[#1e2d4d]'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Layer Toggles */}
        <div className="flex items-center gap-2 text-slate-400 text-[11px]">
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-200 select-none">
            <input
              type="checkbox"
              checked={showDensityHalos}
              onChange={(e) => setShowDensityHalos(e.target.checked)}
              className="rounded bg-[#151f38] border-[#1e2d4d] text-[#92C842] focus:ring-0"
            />
            <span>Heat Halos</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-200 select-none">
            <input
              type="checkbox"
              checked={showNetworkTrunks}
              onChange={(e) => setShowNetworkTrunks(e.target.checked)}
              className="rounded bg-[#151f38] border-[#1e2d4d] text-[#92C842] focus:ring-0"
            />
            <span>Trunks</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-200 select-none">
            <input
              type="checkbox"
              checked={showTerminalLabels}
              onChange={(e) => setShowTerminalLabels(e.target.checked)}
              className="rounded bg-[#151f38] border-[#1e2d4d] text-[#92C842] focus:ring-0"
            />
            <span>Labels</span>
          </label>
        </div>
      </div>

      {/* MAIN SPATIAL CANVAS & INSPECTOR GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* D3 SPATIAL DENSITY CANVAS CONTAINER (8 or 9 cols) */}
        <div className="lg:col-span-8 xl:col-span-9 bg-[#090e1c] border border-[#1e2d4d] rounded-xl overflow-hidden shadow-2xl relative">
          
          {/* Canvas Sub-header with Live Indicator & Legends */}
          <div className="px-4 py-2.5 bg-[#0e1628]/90 border-b border-[#1e2d4d] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 font-mono">
              <span className="w-2 h-2 rounded-full bg-[#92C842] animate-pulse"></span>
              <span className="text-[#92C842] font-semibold text-[11px]">SPATIAL STREAM ACTIVE</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300 text-[11px]">
                Showing <strong className="text-white font-bold">{filteredTerminals.length}</strong> active retail points
              </span>
            </div>

            {/* Heatmap Color Scale Legend */}
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
              <span>Low Density</span>
              <div className="w-20 h-2 rounded-full bg-gradient-to-r from-[#22d3ee] via-[#92C842] to-[#E05252]"></div>
              <span className="text-[#E05252] font-bold">Peak Intensity</span>
            </div>
          </div>

          {/* SVG Canvas Element */}
          <div ref={containerRef} className="relative w-full aspect-[16/10] min-h-[440px] max-h-[620px] bg-[#090e1c] select-none">
            <svg
              ref={svgRef}
              viewBox="0 0 1000 620"
              preserveAspectRatio="xMidYMid meet"
              className="w-full h-full block"
            />

            {/* Zoom / Navigation Overlay Controls */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-[#0e1628]/90 border border-[#1e2d4d] p-1 rounded-lg text-xs shadow-lg">
              <span className="px-2 text-[10px] font-mono text-slate-400">Pan / Scroll to Zoom</span>
              <button
                onClick={() => {
                  if (svgRef.current) {
                    d3.select(svgRef.current).transition().duration(400).call(
                      d3.zoom<SVGSVGElement, unknown>().transform as any,
                      d3.zoomIdentity
                    );
                  }
                }}
                className="px-2 py-0.5 rounded bg-[#151f38] hover:bg-[#1a2745] text-slate-300 hover:text-white font-mono text-[10px]"
                title="Reset zoom"
              >
                Reset
              </button>
            </div>

            {/* Hover Tooltip Overlay */}
            {hoveredTerminal && !selectedTerminal && (
              <div
                className="absolute pointer-events-none z-20 bg-[#0e1628]/95 border border-[#92C842]/50 rounded-lg p-2.5 shadow-xl text-xs font-mono"
                style={{
                  left: `${(hoveredTerminal.x / 1000) * 100}%`,
                  top: `${(hoveredTerminal.y / 620) * 100}%`,
                  transform: 'translate(-50%, -120%)'
                }}
              >
                <div className="font-bold text-white">{hoveredTerminal.terminalCode}</div>
                <div className="text-[11px] text-[#92C842]">{hoveredTerminal.storeName}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Intensity: <strong className="text-white">{hoveredTerminal.intensity}%</strong> • Battery: {hoveredTerminal.battery}%
                </div>
              </div>
            )}
          </div>

          {/* Quick Hub Metric Footer Summary */}
          <div className="p-3 bg-[#0e1628] border-t border-[#1e2d4d] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="border-r border-[#1e2d4d]/60 pr-2">
              <span className="text-slate-400 text-[10px]">AVG INTENSITY:</span>
              <div className="text-[#92C842] font-bold text-sm">{stats.avgIntensity}% Adherence</div>
            </div>
            <div className="border-r border-[#1e2d4d]/60 pr-2">
              <span className="text-slate-400 text-[10px]">AVG BATTERY:</span>
              <div className="text-white font-bold text-sm">{stats.avgBattery}% Charged</div>
            </div>
            <div className="border-r border-[#1e2d4d]/60 pr-2">
              <span className="text-slate-400 text-[10px]">HOURLY TX:</span>
              <div className="text-white font-bold text-sm">{stats.totalTransactions} / hr</div>
            </div>
            <div>
              <span className="text-slate-400 text-[10px]">FLAGGED NODES:</span>
              <div className={`font-bold text-sm ${stats.warningCount > 0 ? 'text-[#F17F31]' : 'text-[#92C842]'}`}>
                {stats.warningCount} Device{stats.warningCount !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

        </div>

        {/* TERMINAL INSPECTOR & TELEMETRY NODE DETAILS (4 or 3 cols) */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-4">
          
          {selectedTerminal ? (
            <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-xl p-4 shadow-xl space-y-4 animate-in fade-in">
              <div className="flex items-start justify-between gap-2 border-b border-[#1e2d4d] pb-3">
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#92C842]/20 text-[#92C842] border border-[#92C842]/30">
                    {selectedTerminal.terminalCode}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-1.5 leading-snug">
                    {selectedTerminal.storeName}
                  </h3>
                  <div className="text-xs text-slate-400">
                    {selectedTerminal.zone} • <strong className="text-slate-300">{selectedTerminal.hub} Hub</strong>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${
                    selectedTerminal.status === 'reconciled'
                      ? 'bg-[#92C842]/20 text-[#92C842] border-[#92C842]/30'
                      : selectedTerminal.status === 'warning'
                      ? 'bg-[#F17F31]/20 text-[#F17F31] border-[#F17F31]/30'
                      : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  }`}
                >
                  {selectedTerminal.status}
                </span>
              </div>

              {/* Intensity Gauges */}
              <div className="space-y-2.5">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Telemetry Activity Intensity:</span>
                    <span className="font-bold text-[#92C842]">{selectedTerminal.intensity}%</span>
                  </div>
                  <div className="w-full bg-[#151f38] h-2 rounded-full overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-[#22d3ee] to-[#92C842]"
                      style={{ width: `${selectedTerminal.intensity}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Battery Level:</span>
                    <span className={selectedTerminal.battery < 50 ? 'text-[#F17F31] font-bold' : 'text-slate-200'}>
                      {selectedTerminal.battery}%
                    </span>
                  </div>
                  <div className="w-full bg-[#151f38] h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${
                        selectedTerminal.battery < 50 ? 'bg-[#F17F31]' : 'bg-[#92C842]'
                      }`}
                      style={{ width: `${selectedTerminal.battery}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Inventory Stock Level:</span>
                    <span className="text-slate-200">{selectedTerminal.stockLevel}%</span>
                  </div>
                  <div className="w-full bg-[#151f38] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-1.5 rounded-full bg-blue-500"
                      style={{ width: `${selectedTerminal.stockLevel}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Node Metadata Table */}
              <div className="bg-[#151f38]/60 border border-[#1e2d4d] rounded-lg p-3 text-xs font-mono space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned VSR:</span>
                  <span className="font-semibold text-slate-200">{selectedTerminal.assignedRep}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Last Heartbeat:</span>
                  <span className="text-[#92C842]">{selectedTerminal.lastPing}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Throughput:</span>
                  <span className="text-white font-bold">{selectedTerminal.hourlyTransactions} tx/hr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Spatial Node:</span>
                  <span className="text-slate-400">X:{selectedTerminal.x} Y:{selectedTerminal.y}</span>
                </div>
              </div>

              {/* Action Buttons for this Terminal */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => handlePingTerminal(selectedTerminal.id)}
                  className="w-full py-2 px-3 rounded-lg bg-[#151f38] hover:bg-[#1a2745] text-slate-200 border border-[#1e2d4d] hover:border-[#92C842]/40 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <svg className="w-3.5 h-3.5 text-[#92C842]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                  <span>
                    {pingSuccessId === selectedTerminal.id ? '✓ Ping Ack (0.04s)' : 'Dispatch Heartbeat Ping'}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-xl p-6 text-center text-xs text-slate-400 space-y-2">
              <svg className="w-8 h-8 text-slate-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
              <div className="font-semibold text-slate-200">No Terminal Selected</div>
              <p>Click any node on the D3 spatial heatmap to inspect real-time device telemetry.</p>
            </div>
          )}

          {/* Hub Summary Card */}
          <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-xl p-4 shadow-lg space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Regional POS Density Tally
            </h4>
            <div className="space-y-2">
              {hubs.map((h) => (
                <div
                  key={h.hub}
                  onClick={() => onSelectHub(h.hub)}
                  className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between text-xs ${
                    selectedHub === h.hub
                      ? 'bg-[#151f38] border-[#92C842]'
                      : 'bg-[#0b1222] border-[#1e2d4d]/60 hover:border-[#1e2d4d]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: h.colorHex }} />
                    <span className="font-semibold text-slate-200">{h.hub}</span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-400">
                    <strong className="text-white">{h.activePOS}</strong> POS ({h.percentage}%)
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
