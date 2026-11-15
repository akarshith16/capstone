
export type IncidentPriority = 'Critical' | 'High' | 'Moderate' | 'Low' | 'Pending';
export type IncidentStatus = 'New' | 'Verifying' | 'Prioritizing' | 'Routed' | 'Resolved';
export type ResolutionType = 'warning' | 'fine' | 'seizure';

export interface SensorContext {
  stationId: string | null;
  stationName: string | null;
  distanceM: number | null;
  withinRange: boolean; // a station within CONTEXT_RADIUS_M of the report
  coverageDate: string; // YYYY-MM-DD the report falls in
  publishedOn: string; // YYYY-MM-DD that day's SIVCA average becomes open data
  readingLoaded: false; // the prototype holds no SIVCA readings yet
}

export interface Incident {
  id: string;
  timestamp: string;
  location: string;
  district: string;
  coordinates: [number, number]; // [lat, lng]
  description: string;
  reporter: string;
  priority: IncidentPriority;
  status: IncidentStatus;
  category: string;
  eventContext?: string;
  resolution?: ResolutionType;
  // Area context from the nearest SIVCA station. Never a verification: see src/lib/triage.ts.
  sensorContext?: SensorContext;
  agentLogs: {
    agent: 'Chulapo' | 'Sentinel' | 'Decider' | 'Coordinator';
    action: string;
    timestamp: string;
  }[];
}

export const MADRID_DISTRICTS: { name: string; coords: [number, number] }[] = [
  { name: 'Centro', coords: [40.418, -3.703] },
  { name: 'Arganzuela', coords: [40.398, -3.693] },
  { name: 'Retiro', coords: [40.411, -3.676] },
  { name: 'Salamanca', coords: [40.428, -3.687] },
  { name: 'Chamartín', coords: [40.458, -3.677] },
  { name: 'Tetuán', coords: [40.460, -3.698] },
  { name: 'Chamberí', coords: [40.434, -3.703] },
  { name: 'Fuencarral-El Pardo', coords: [40.478, -3.711] },
  { name: 'Moncloa-Aravaca', coords: [40.435, -3.731] },
  { name: 'Latina', coords: [40.388, -3.744] },
  { name: 'Carabanchel', coords: [40.378, -3.743] },
  { name: 'Usera', coords: [40.383, -3.704] },
  { name: 'Puente de Vallecas', coords: [40.383, -3.666] },
  { name: 'Moratalaz', coords: [40.407, -3.645] },
  { name: 'Ciudad Lineal', coords: [40.445, -3.652] },
  { name: 'Hortaleza', coords: [40.472, -3.642] },
  { name: 'Villaverde', coords: [40.345, -3.708] },
  { name: 'Villa de Vallecas', coords: [40.373, -3.623] },
  { name: 'Vicálvaro', coords: [40.404, -3.608] },
  { name: 'San Blas-Canillejas', coords: [40.430, -3.615] },
  { name: 'Barajas', coords: [40.474, -3.578] },
];

// Approximate: picks the district whose reference point is closest. Good enough to label a
// map pin until real district boundaries are wired in.
export const nearestDistrict = ([lat, lng]: [number, number]) => {
  let nearest = MADRID_DISTRICTS[0];
  let minDistance = Infinity;
  MADRID_DISTRICTS.forEach(d => {
    const dist = Math.hypot(d.coords[0] - lat, d.coords[1] - lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = d;
    }
  });
  return nearest.name;
};

export const generateMockIncidents = (): Incident[] => {
  const incidents: Incident[] = [];
  const categories = ['Terrace Ordinance', 'Nightlife Disturbance', 'Construction', 'Traffic Noise', 'Private Party'];

  const EVENTS = [
    { name: 'Real Madrid Match (Santiago Bernabéu)', district: 'Chamartín', prob: 0.15 },
    { name: 'San Isidro Festival (Pradera)', district: 'Carabanchel', prob: 0.1 },
    { name: 'Mad Cool Festival (Valdebebas)', district: 'Hortaleza', prob: 0.05 },
    { name: 'Pride Parade (Chueca)', district: 'Centro', prob: 0.2 },
    { name: 'El Rastro Market (La Latina)', district: 'Centro', prob: 0.15 },
    { name: 'WiZink Center Concert', district: 'Salamanca', prob: 0.1 }
  ];

  // Generating 3000 incidents for deep analytics based on real SIVCA stations
  for (let i = 1; i <= 3000; i++) {
    const districtInfo = MADRID_DISTRICTS[Math.floor(Math.random() * MADRID_DISTRICTS.length)];
    
    // Check if this district has a correlated event
    let eventContext = undefined;
    const possibleEvents = EVENTS.filter(e => e.district === districtInfo.name);
    if (possibleEvents.length > 0) {
      if (Math.random() < possibleEvents[0].prob) {
        eventContext = possibleEvents[0].name;
      }
    }

    const jitterLat = districtInfo.coords[0] + (Math.random() - 0.5) * 0.02;
    const jitterLng = districtInfo.coords[1] + (Math.random() - 0.5) * 0.02;
    
    const isCritical = Math.random() > 0.85;
    const priority = isCritical ? 'Critical' : (Math.random() > 0.4 ? 'High' : 'Moderate');
    
    const randStatus = Math.random();
    let status: IncidentStatus = 'Routed';
    if (randStatus > 0.8) status = 'Resolved';
    else if (randStatus < 0.1) status = 'Verifying';
    else if (randStatus < 0.2) status = 'Prioritizing';
    else if (randStatus < 0.3) status = 'New';

    const routedTo = priority === 'Critical' ? 'Policía Municipal (092)' : 'Environmental inspection service (DG Sostenibilidad y Control Ambiental)';
    const timestamp = new Date(Date.now() - Math.random() * 86400000 * 30).toISOString();

    let description = `Citizen reported excessive noise from a local venue in ${districtInfo.name}. Continuous disturbance.`;
    if (eventContext) {
      description = `Major noise disturbance correlated with ${eventContext}. Multiple reports aggregated.`;
    }

    incidents.push({
      id: `REQ-${new Date().getFullYear()}-${1000 + i}`,
      timestamp,
      location: `Calle Mock ${i}, ${districtInfo.name}`,
      district: districtInfo.name,
      coordinates: [jitterLat, jitterLng] as [number, number],
      description,
      reporter: 'Sample data',
      priority: status === 'Verifying' ? 'Pending' : priority,
      status: status,
      category: categories[Math.floor(Math.random() * categories.length)],
      eventContext,
      agentLogs: [
        { agent: 'Chulapo', action: 'Sample case generated for the demo. Not a real report.', timestamp: new Date(Date.now() - 50000).toISOString() },
        { agent: 'Sentinel', action: 'Sample case: no sensor context attached.', timestamp: new Date(Date.now() - 40000).toISOString() },
        { agent: 'Decider', action: `Sample priority: ${priority}.`, timestamp: new Date(Date.now() - 30000).toISOString() },
        { agent: 'Coordinator', action: `Sample route: ${routedTo}.`, timestamp: new Date(Date.now() - 20000).toISOString() },
      ]
    });
  }

  return incidents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const initialIncidents = generateMockIncidents();
