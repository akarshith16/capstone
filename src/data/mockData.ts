export type IncidentPriority = 'Critical' | 'High' | 'Moderate' | 'Low' | 'Pending';
export type IncidentStatus = 'New' | 'Verifying' | 'Prioritizing' | 'Routed' | 'Resolved';

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
  sensorVerification?: {
    verified: boolean;
    sensorId: string;
    readingDb: number;
    thresholdDb: number;
    match: boolean;
  };
  agentLogs: {
    agent: 'Chulapo' | 'Sentinel' | 'Decider' | 'Coordinator';
    action: string;
    timestamp: string;
  }[];
}

const MADRID_DISTRICTS = [
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

export const generateMockIncidents = (): Incident[] => {
  const incidents: Incident[] = [];
  const categories = ['Terrace Ordinance', 'Nightlife Disturbance', 'Construction', 'Traffic Noise', 'Private Party'];

  for (let i = 1; i <= 200; i++) {
    const districtInfo = MADRID_DISTRICTS[Math.floor(Math.random() * MADRID_DISTRICTS.length)];
    // Jitter coordinates to spread them out within the district
    const jitterLat = districtInfo.coords[0] + (Math.random() - 0.5) * 0.02;
    const jitterLng = districtInfo.coords[1] + (Math.random() - 0.5) * 0.02;
    
    const isCritical = Math.random() > 0.85;
    const priority = isCritical ? 'Critical' : (Math.random() > 0.4 ? 'High' : 'Moderate');
    
    // Mix of statuses
    const randStatus = Math.random();
    let status: IncidentStatus = 'Routed';
    if (randStatus > 0.8) status = 'Resolved';
    else if (randStatus < 0.1) status = 'Verifying';
    else if (randStatus < 0.2) status = 'Prioritizing';
    else if (randStatus < 0.3) status = 'New';

    const readingDb = 60 + Math.floor(Math.random() * 40);
    const thresholdDb = isCritical ? 65 : 75;

    incidents.push({
      id: `REQ-${new Date().getFullYear()}-${1000 + i}`,
      timestamp: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(), // within last 3 days
      location: `Calle Mock ${i}, ${districtInfo.name}`,
      district: districtInfo.name,
      coordinates: [jitterLat, jitterLng] as [number, number],
      description: `Citizen reported excessive noise from a local venue in ${districtInfo.name}. Continuous disturbance.`,
      reporter: `Citizen-${Math.floor(Math.random() * 10000)}`,
      priority: status === 'Verifying' ? 'Pending' : priority,
      status: status,
      category: categories[Math.floor(Math.random() * categories.length)],
      sensorVerification: {
        verified: status !== 'New',
        sensorId: `SN-MAD-${100 + i}`,
        readingDb,
        thresholdDb,
        match: readingDb > thresholdDb
      },
      agentLogs: [
        { agent: 'Chulapo', action: 'Ingested raw report and extracted entities.', timestamp: new Date(Date.now() - 50000).toISOString() },
        { agent: 'Sentinel', action: `Cross-referenced with sensor SN-MAD-${100 + i}. Reading: ${readingDb}dB.`, timestamp: new Date(Date.now() - 40000).toISOString() },
        { agent: 'Decider', action: `Evaluated limits. Assigned priority: ${priority}.`, timestamp: new Date(Date.now() - 30000).toISOString() },
        { agent: 'Coordinator', action: `Routed ticket to Environmental Inspectors.`, timestamp: new Date(Date.now() - 20000).toISOString() },
      ]
    });
  }

  // Sort by timestamp descending
  return incidents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const initialIncidents = generateMockIncidents();
