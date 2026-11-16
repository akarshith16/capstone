import { findNearestSivcaStation } from './sivca_dataset.ts';

export type IncidentPriority = 'Critical' | 'High' | 'Moderate' | 'Low' | 'Pending';
export type IncidentStatus = 'New' | 'Verifying' | 'Prioritizing' | 'Routed' | 'Resolved';

export type VerificationDataMode = 'historical' | 'simulated_spike' | 'out_of_range';
export type CitizenIntakeMode = 'anonymous' | 'formal_denuncia';

export interface SensorVerificationData {
  verified: boolean;
  stationId: string;
  stationName: string;
  stationType: 'Fixed SIVCA' | 'Mobile Unit UMMA';
  distanceMeters: number;
  isOutOfRange: boolean;
  mobileCandidate: boolean;
  historicalNightAvgDb: number;
  recordedPeriod: string;
  observedDb: number;
  dataMode: VerificationDataMode;
  euStrategicIndicatorDb: number; // 55 dBA (Lnight target, EU Dir 2002/49/EC)
  opcatReferenceDb: number; // 60 dBA (Madrid OPCAT Night ZPAE ambient guideline)
  neighbourClusterCount: number;
  isDuplicateMerged: boolean;
  clusterWindowMinutes: number;
}

export interface OfficerReviewData {
  reviewedAt: string;
  reviewDurationSeconds: number;
  decision: 'approved' | 'modified' | 'rejected';
  originalPriority: IncidentPriority;
  finalPriority: IncidentPriority;
  overrideReason?: string;
  officerBadge: string;
}

export interface BaselineComparisonData {
  baselinePriority: IncidentPriority;
  baselineRouting: string;
  baselineContext: string;
  enrichedPriority: IncidentPriority;
  enrichedRouting: string;
  enrichmentDiffSummary: string;
}

export interface Incident {
  id: string;
  timestamp: string;
  location: string;
  district: string;
  coordinates: [number, number]; // [lat, lng]
  description: string;
  reporter: string;
  isAnonymous: boolean;
  priority: IncidentPriority;
  status: IncidentStatus;
  category: string;
  eventContext?: string;
  sensorVerification?: SensorVerificationData;
  officerReview?: OfficerReviewData;
  baselineComparison?: BaselineComparisonData;
  agentLogs: {
    agent: 'Chulapo' | 'Sentinel' | 'Decider' | 'Coordinator';
    action: string;
    timestamp: string;
  }[];
}

export const MADRID_DISTRICTS = [
  { name: 'Centro', coords: [40.418, -3.703] as [number, number] },
  { name: 'Arganzuela', coords: [40.398, -3.693] as [number, number] },
  { name: 'Retiro', coords: [40.411, -3.676] as [number, number] },
  { name: 'Salamanca', coords: [40.428, -3.687] as [number, number] },
  { name: 'Chamartín', coords: [40.458, -3.677] as [number, number] },
  { name: 'Tetuán', coords: [40.460, -3.698] as [number, number] },
  { name: 'Chamberí', coords: [40.434, -3.703] as [number, number] },
  { name: 'Fuencarral-El Pardo', coords: [40.478, -3.711] as [number, number] },
  { name: 'Moncloa-Aravaca', coords: [40.435, -3.731] as [number, number] },
  { name: 'Latina', coords: [40.388, -3.744] as [number, number] },
  { name: 'Carabanchel', coords: [40.378, -3.743] as [number, number] },
  { name: 'Usera', coords: [40.383, -3.704] as [number, number] },
  { name: 'Puente de Vallecas', coords: [40.383, -3.666] as [number, number] },
  { name: 'Moratalaz', coords: [40.407, -3.645] as [number, number] },
  { name: 'Ciudad Lineal', coords: [40.445, -3.652] as [number, number] },
  { name: 'Hortaleza', coords: [40.472, -3.642] as [number, number] },
  { name: 'Villaverde', coords: [40.345, -3.708] as [number, number] },
  { name: 'Villa de Vallecas', coords: [40.373, -3.623] as [number, number] },
  { name: 'Vicálvaro', coords: [40.404, -3.608] as [number, number] },
  { name: 'San Blas-Canillejas', coords: [40.430, -3.615] as [number, number] },
  { name: 'Barajas', coords: [40.474, -3.578] as [number, number] },
];

export const EVENTS = [
  { name: 'Real Madrid Match (Santiago Bernabéu)', district: 'Chamartín', prob: 0.15 },
  { name: 'San Isidro Festival (Pradera)', district: 'Carabanchel', prob: 0.1 },
  { name: 'Mad Cool Festival (Valdebebas)', district: 'Hortaleza', prob: 0.05 },
  { name: 'Pride Parade (Chueca)', district: 'Centro', prob: 0.2 },
  { name: 'El Rastro Market (La Latina)', district: 'Centro', prob: 0.15 },
  { name: 'WiZink Center Concert', district: 'Salamanca', prob: 0.1 },
];

/**
 * Procedural seeded generation for background map rendering & macro-analytics.
 * Anchored to the 31 real Madrid SIVCA stations and their actual historical Ln night baseline.
 */
export const generateMockIncidents = (): Incident[] => {
  const incidents: Incident[] = [];
  const categories = [
    'Terrace Ordinance',
    'Nightlife Disturbance',
    'Construction Noise',
    'Traffic/Vehicles',
    'Private Party',
  ];

  // 3000 incidents for historical urban analytics
  for (let i = 1; i <= 3000; i++) {
    const districtInfo = MADRID_DISTRICTS[(i * 7) % MADRID_DISTRICTS.length];

    let eventContext = undefined;
    const possibleEvents = EVENTS.filter((e) => e.district === districtInfo.name);
    if (possibleEvents.length > 0 && (i % 5 === 0)) {
      eventContext = possibleEvents[0].name;
    }

    // Pseudo-deterministic coordinates based on index i
    const angle = (i * 0.618033) * 2 * Math.PI;
    const radius = 0.005 + ((i % 100) / 100) * 0.015;
    const lat = districtInfo.coords[0] + Math.sin(angle) * radius;
    const lng = districtInfo.coords[1] + Math.cos(angle) * radius;

    const nearestLookup = findNearestSivcaStation([lat, lng]);
    const nearest = nearestLookup.station;
    const distMeters = nearestLookup.distanceMeters;
    const isOutOfRange = nearestLookup.isOutOfRange;

    const baseLn = nearest.historicalNightAvgDb;
    const category = categories[i % categories.length];

    const isCritical = (i % 9 === 0) || (eventContext !== undefined && i % 3 === 0);
    const isHigh = !isCritical && (i % 4 === 0 || baseLn > 61);
    const priority: IncidentPriority = isCritical ? 'Critical' : isHigh ? 'High' : 'Moderate';

    const statusMod = i % 10;
    let status: IncidentStatus = 'Routed';
    if (statusMod >= 7) status = 'Resolved';
    else if (statusMod === 1) status = 'Verifying';
    else if (statusMod === 2) status = 'Prioritizing';
    else if (statusMod === 0) status = 'New';

    const clusterCount = (i % 7 === 0) ? 4 : (i % 3 === 0) ? 2 : 1;
    const routedTo =
      priority === 'Critical'
        ? 'Policía Municipal (092 - Priority Patrol)'
        : 'DG Sostenibilidad (Environmental Inspectors)';

    const stationType = isOutOfRange ? 'Mobile Unit UMMA' : 'Fixed SIVCA';
    const assignedSensorId = isOutOfRange
      ? `UMMA-MOBILE-${((i % 17) + 1).toString().padStart(2, '0')}`
      : nearest.id;

    const observedDb = isOutOfRange
      ? baseLn
      : Number((baseLn + (isCritical ? 12.5 : isHigh ? 6.2 : 1.1)).toFixed(1));

    let description = `Citizen report concerning ${category.toLowerCase()} in ${districtInfo.name}.`;
    if (eventContext) {
      description = `Noise disturbance correlated with ${eventContext}. Multiple resident notices.`;
    }

    const baselinePriority: IncidentPriority = 'Moderate';
    const baselineRouting = 'DG Sostenibilidad (General Queue)';
    const diffSummary =
      priority === 'Critical'
        ? 'Asymmetric triage uplift from Moderate to Critical due to 4x multi-resident cluster and high contextual night reading.'
        : priority === 'High'
        ? 'Triage uplift from Moderate to High based on repeat venue history and ZPAE zone status.'
        : 'Priorities maintained without sensor downgrade.';

    incidents.push({
      id: `REQ-${2026}-${(1000 + i).toString()}`,
      timestamp: new Date(Date.now() - (i * 864000) - (i % 86400000)).toISOString(),
      location: `Calle ${districtInfo.name} ${((i % 180) + 1)}, ${districtInfo.name}`,
      district: districtInfo.name,
      coordinates: [lat, lng],
      description,
      reporter: (i % 3 === 0) ? 'Anonymous Citizen (Madrid)' : `Authenticated via Cl@ve (DNI ***${(1000 + (i % 8999))}*)`,
      isAnonymous: i % 3 === 0,
      priority: status === 'Verifying' ? 'Pending' : priority,
      status,
      category,
      eventContext,
      sensorVerification: {
        verified: status !== 'New',
        stationId: assignedSensorId,
        stationName: isOutOfRange ? 'Madrid Mobile Unit Fleet (17 UMMA)' : nearest.name,
        stationType,
        distanceMeters: distMeters,
        isOutOfRange,
        mobileCandidate: isOutOfRange,
        historicalNightAvgDb: nearest.historicalNightAvgDb,
        recordedPeriod: nearest.recordedPeriod,
        observedDb,
        dataMode: 'historical',
        euStrategicIndicatorDb: 55,
        opcatReferenceDb: nearest.zpaeArea ? 60 : 65,
        neighbourClusterCount: clusterCount,
        isDuplicateMerged: clusterCount > 1,
        clusterWindowMinutes: 20,
      },
      baselineComparison: {
        baselinePriority,
        baselineRouting,
        baselineContext: 'Single unverified web intake, 0m sensor context, isolated report.',
        enrichedPriority: priority,
        enrichedRouting: routedTo,
        enrichmentDiffSummary: diffSummary,
      },
      agentLogs: [
        {
          agent: 'Chulapo',
          action: 'Extracted structured entities (NLP) and validated Madrid district coordinates.',
          timestamp: new Date(Date.now() - 50000).toISOString(),
        },
        {
          agent: 'Sentinel',
          action: `Cross-referenced with SIVCA ${nearest.id} (${nearest.name}, dist: ${distMeters}m). Historical Ln: ${nearest.historicalNightAvgDb} dBA. ${
            isOutOfRange ? 'Distance >500m: flagged for Madrid UMMA Mobile fleet.' : 'Within fixed station radius.'
          }`,
          timestamp: new Date(Date.now() - 40000).toISOString(),
        },
        {
          agent: 'Decider',
          action: `Asymmetric scoring applied. Baseline context evaluated under Ley 37/2003 & OPCAT. Triage priority: ${priority}.`,
          timestamp: new Date(Date.now() - 30000).toISOString(),
        },
        {
          agent: 'Coordinator',
          action: `Routed ticket to ${routedTo}.`,
          timestamp: new Date(Date.now() - 20000).toISOString(),
        },
      ],
    });
  }

  return incidents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const initialIncidents = generateMockIncidents();
