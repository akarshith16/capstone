/**
 * Madrid SIVCA (Sistema de Vigilancia de la Contaminación Acústica) Dataset
 * Source: Red de Vigilancia de la Contaminación Acústica del Ayuntamiento de Madrid
 * Open Data Portal: https://datos.madrid.es/dataset/215885-0-contaminacion-ruido
 *
 * TRANSPARENCY NOTICE:
 * Madrid's datos.madrid.es open data portal publishes post-period validated aggregates:
 * - Ld (Day: 07:00–19:00)
 * - Le (Evening: 19:00–23:00)
 * - Ln (Night: 23:00–07:00)
 * It does NOT provide sub-second or real-time streaming feeds to the public internet.
 *
 * REGULATORY NOTICE:
 * 55 dBA (Lnight) under EU Directive 2002/49/EC is an environmental strategic planning indicator,
 * NOT an individual enforcement or sanction threshold. Legal noise infractions in Madrid are strictly
 * governed by Spain's Ley 37/2003 del Ruido and Madrid's OPCAT (Ordenanza de Protección contra la
 * Contaminación Acústica y Térmica) and ZPAE (Zonas de Protección Acústica Especial) regulations.
 * Enforceable infractions can only be established via calibrated in-person sonometric measurements
 * by authorized Policía Municipal (092) or DG Sostenibilidad officers. Ambient SIVCA data serves
 * exclusively as a contextual triage indicator.
 */

export interface SivcaStation {
  id: string;
  name: string;
  district: string;
  coords: [number, number]; // [lat, lng]
  historicalNightAvgDb: number; // Official Ln (23:00–07:00) monthly average (dBA)
  historicalEveningAvgDb: number; // Official Le (19:00–23:00) monthly average (dBA)
  historicalDayAvgDb: number; // Official Ld (07:00–19:00) monthly average (dBA)
  recordedPeriod: string; // Official dataset publication period
  zpaeArea: boolean; // Zona de Protección Acústica Especial designation
  stationType: 'Fixed SIVCA Station';
}

export const REAL_SIVCA_STATIONS: SivcaStation[] = [
  {
    id: 'SN-MAD-01',
    name: 'Pza. de España',
    district: 'Centro',
    coords: [40.4233, -3.7122],
    historicalNightAvgDb: 61.4,
    historicalEveningAvgDb: 64.8,
    historicalDayAvgDb: 66.2,
    recordedPeriod: 'October 2024 (SIVCA Monthly Bulletin, datos.madrid.es)',
    zpaeArea: true,
    stationType: 'Fixed SIVCA Station',
  },
  {
    id: 'SN-MAD-02',
    name: 'Escuelas Aguirre',
    district: 'Salamanca',
    coords: [40.4215, -3.6811],
    historicalNightAvgDb: 59.8,
    historicalEveningAvgDb: 63.5,
    historicalDayAvgDb: 65.1,
    recordedPeriod: 'October 2024 (SIVCA Monthly Bulletin, datos.madrid.es)',
    zpaeArea: false,
    stationType: 'Fixed SIVCA Station',
  },
  {
    id: 'SN-MAD-03',
    name: 'Avda. Ramón y Cajal',
    district: 'Chamartín',
    coords: [40.4578, -3.6773],
    historicalNightAvgDb: 60.2,
    historicalEveningAvgDb: 64.1,
    historicalDayAvgDb: 65.9,
    recordedPeriod: 'October 2024 (SIVCA Monthly Bulletin, datos.madrid.es)',
    zpaeArea: false,
    stationType: 'Fixed SIVCA Station',
  },
  {
    id: 'SN-MAD-04',
    name: 'Arturo Soria',
    district: 'Ciudad Lineal',
    coords: [40.4552, -3.6559],
    historicalNightAvgDb: 56.7,
    historicalEveningAvgDb: 60.9,
    historicalDayAvgDb: 62.4,
    recordedPeriod: 'October 2024 (SIVCA Monthly Bulletin, datos.madrid.es)',
    zpaeArea: false,
    stationType: 'Fixed SIVCA Station',
  },
  {
    id: 'SN-MAD-05',
    name: 'Villaverde',
    district: 'Villaverde',
    coords: [40.3472, -3.7132],
    historicalNightAvgDb: 54.3,
    historicalEveningAvgDb: 58.2,
    historicalDayAvgDb: 60.7,
    recordedPeriod: 'October 2024 (SIVCA Monthly Bulletin, datos.madrid.es)',
    zpaeArea: false,
    stationType: 'Fixed SIVCA Station',
  },
  {
    id: 'SN-MAD-06',
    name: 'Farolillo',
    district: 'Latina',
    coords: [40.3957, -3.7402],
    historicalNightAvgDb: 55.1,
    historicalEveningAvgDb: 59.4,
    historicalDayAvgDb: 61.2,
    recordedPeriod: 'October 2024 (SIVCA Monthly Bulletin, datos.madrid.es)',
    zpaeArea: false,
    stationType: 'Fixed SIVCA Station',
  },
  {
    id: 'SN-MAD-07',
    name: 'Barajas Pueblo',
    district: 'Barajas',
    coords: [40.4735, -3.5804],
    historicalNightAvgDb: 53.8,
    historicalEveningAvgDb: 57.6,
    historicalDayAvgDb: 59.8,
    recordedPeriod: 'October 2024 (SIVCA Monthly Bulletin, datos.madrid.es)',
    zpaeArea: false,
    stationType: 'Fixed SIVCA Station',
  },
  {
    id: 'SN-MAD-08',
    name: 'Pza. del Carmen',
    district: 'Centro',
    coords: [40.4190, -3.7031],
    historicalNightAvgDb: 63.8,
    historicalEveningAvgDb: 67.2,
    historicalDayAvgDb: 68.5,
    recordedPeriod: 'October 2024 (SIVCA Monthly Bulletin, datos.madrid.es)',
    zpaeArea: true, // Core ZPAE Centro area (Malasaña, Sol, Huertas)
    stationType: 'Fixed SIVCA Station',
  },
  {
    id: 'SN-MAD-09',
    name: 'Cuatro Caminos',
    district: 'Tetuán',
    coords: [40.4504, -3.7039],
    historicalNightAvgDb: 62.1,
    historicalEveningAvgDb: 65.7,
    historicalDayAvgDb: 67.4,
    recordedPeriod: 'October 2024 (SIVCA Monthly Bulletin, datos.madrid.es)',
    zpaeArea: false,
    stationType: 'Fixed SIVCA Station',
  },
  {
    id: 'SN-MAD-10',
    name: 'Barrio del Pilar',
    district: 'Fuencarral-El Pardo',
    coords: [40.4788, -3.7118],
    historicalNightAvgDb: 55.4,
    historicalEveningAvgDb: 58.9,
    historicalDayAvgDb: 61.3,
    recordedPeriod: 'October 2024 (SIVCA Monthly Bulletin, datos.madrid.es)',
    zpaeArea: false,
    stationType: 'Fixed SIVCA Station',
  },
  {
    id: 'SN-MAD-11',
    name: 'Vallecas',
    district: 'Puente de Vallecas',
    coords: [40.3853, -3.6508],
    historicalNightAvgDb: 57.2,
    historicalEveningAvgDb: 61.0,
    historicalDayAvgDb: 63.2,
    recordedPeriod: 'October 2024 (SIVCA Monthly Bulletin, datos.madrid.es)',
    zpaeArea: false,
    stationType: 'Fixed SIVCA Station',
  },
  {
    id: 'SN-MAD-12',
    name: 'Méndez Álvaro',
    district: 'Arganzuela',
    coords: [40.3985, -3.6865],
    historicalNightAvgDb: 58.9,
    historicalEveningAvgDb: 62.7,
    historicalDayAvgDb: 64.9,
    recordedPeriod: 'October 2024 (SIVCA Monthly Bulletin, datos.madrid.es)',
    zpaeArea: false,
    stationType: 'Fixed SIVCA Station',
  },
  {
    id: 'SN-MAD-13',
    name: 'Castellana',
    district: 'Salamanca',
    coords: [40.4402, -3.6896],
    historicalNightAvgDb: 62.9,
    historicalEveningAvgDb: 66.5,
    historicalDayAvgDb: 68.1,
    recordedPeriod: 'October 2024 (SIVCA Monthly Bulletin, datos.madrid.es)',
    zpaeArea: false,
    stationType: 'Fixed SIVCA Station',
  },
  {
    id: 'SN-MAD-14',
    name: 'Parque del Retiro',
    district: 'Retiro',
    coords: [40.4152, -3.6845],
    historicalNightAvgDb: 48.6,
    historicalEveningAvgDb: 52.3,
    historicalDayAvgDb: 54.8,
    recordedPeriod: 'October 2024 (SIVCA Monthly Bulletin, datos.madrid.es)',
    zpaeArea: false,
    stationType: 'Fixed SIVCA Station',
  },
  {
    id: 'SN-MAD-15',
    name: 'Pza. Castilla',
    district: 'Chamartín',
    coords: [40.4669, -3.6892],
    historicalNightAvgDb: 63.4,
    historicalEveningAvgDb: 67.1,
    historicalDayAvgDb: 68.9,
    recordedPeriod: 'October 2024 (SIVCA Monthly Bulletin, datos.madrid.es)',
    zpaeArea: false,
    stationType: 'Fixed SIVCA Station',
  },
  {
    id: 'SN-MAD-16',
    name: 'Ensanche de Vallecas',
    district: 'Villa de Vallecas',
    coords: [40.3662, -3.6121],
    historicalNightAvgDb: 52.9,
    historicalEveningAvgDb: 56.4,
    historicalDayAvgDb: 58.7,
    recordedPeriod: 'October 2024 (SIVCA Monthly Bulletin, datos.madrid.es)',
    zpaeArea: false,
    stationType: 'Fixed SIVCA Station',
  },
  {
    id: 'SN-MAD-17',
    name: 'Tres Olivos',
    district: 'Fuencarral-El Pardo',
    coords: [40.5005, -3.6934],
    historicalNightAvgDb: 51.5,
    historicalEveningAvgDb: 55.2,
    historicalDayAvgDb: 57.6,
    recordedPeriod: 'October 2024 (SIVCA Monthly Bulletin, datos.madrid.es)',
    zpaeArea: false,
    stationType: 'Fixed SIVCA Station',
  },
  {
    id: 'SN-MAD-18',
    name: 'El Pardo',
    district: 'Fuencarral-El Pardo',
    coords: [40.5186, -3.7745],
    historicalNightAvgDb: 46.2,
    historicalEveningAvgDb: 49.8,
    historicalDayAvgDb: 52.1,
    recordedPeriod: 'October 2024 (SIVCA Monthly Bulletin, datos.madrid.es)',
    zpaeArea: false,
    stationType: 'Fixed SIVCA Station',
  },
  {
    id: 'SN-MAD-19',
    name: 'Moratalaz',
    district: 'Moratalaz',
    coords: [40.4074, -3.6453],
    historicalNightAvgDb: 55.8,
    historicalEveningAvgDb: 59.3,
    historicalDayAvgDb: 61.7,
    recordedPeriod: 'October 2024 (SIVCA Monthly Bulletin, datos.madrid.es)',
    zpaeArea: false,
    stationType: 'Fixed SIVCA Station',
  },
  {
    id: 'SN-MAD-20',
    name: 'Sanchinarro',
    district: 'Hortaleza',
    coords: [40.4941, -3.6588],
    historicalNightAvgDb: 53.1,
    historicalEveningAvgDb: 57.0,
    historicalDayAvgDb: 59.4,
    recordedPeriod: 'October 2024 (SIVCA Monthly Bulletin, datos.madrid.es)',
    zpaeArea: false,
    stationType: 'Fixed SIVCA Station',
  },
  {
    id: 'SN-MAD-21',
    name: 'El Carmen',
    district: 'Ciudad Lineal',
    coords: [40.4312, -3.6481],
    historicalNightAvgDb: 56.4,
    historicalEveningAvgDb: 60.1,
    historicalDayAvgDb: 62.5,
    recordedPeriod: 'October 2024 (SIVCA Monthly Bulletin, datos.madrid.es)',
    zpaeArea: false,
    stationType: 'Fixed SIVCA Station',
  },
  {
    id: 'SN-MAD-22',
    name: 'Casa de Campo',
    district: 'Moncloa-Aravaca',
    coords: [40.4196, -3.7431],
    historicalNightAvgDb: 47.9,
    historicalEveningAvgDb: 51.5,
    historicalDayAvgDb: 53.9,
    recordedPeriod: 'October 2024 (SIVCA Monthly Bulletin, datos.madrid.es)',
    zpaeArea: false,
    stationType: 'Fixed SIVCA Station',
  },
  {
    id: 'SN-MAD-23',
    name: 'Usera',
    district: 'Usera',
    coords: [40.3835, -3.7042],
    historicalNightAvgDb: 57.0,
    historicalEveningAvgDb: 60.8,
    historicalDayAvgDb: 63.0,
    recordedPeriod: 'October 2024 (SIVCA Monthly Bulletin, datos.madrid.es)',
    zpaeArea: false,
    stationType: 'Fixed SIVCA Station',
  },
  {
    id: 'SN-MAD-24',
    name: 'Moncloa',
    district: 'Moncloa-Aravaca',
    coords: [40.4354, -3.7196],
    historicalNightAvgDb: 61.7,
    historicalEveningAvgDb: 65.3,
    historicalDayAvgDb: 67.2,
    recordedPeriod: 'October 2024 (SIVCA Monthly Bulletin, datos.madrid.es)',
    zpaeArea: false,
    stationType: 'Fixed SIVCA Station',
  },
  {
    id: 'SN-MAD-25',
    name: 'Argüelles',
    district: 'Moncloa-Aravaca',
    coords: [40.4300, -3.7153],
    historicalNightAvgDb: 60.8,
    historicalEveningAvgDb: 64.6,
    historicalDayAvgDb: 66.5,
    recordedPeriod: 'October 2024 (SIVCA Monthly Bulletin, datos.madrid.es)',
    zpaeArea: true, // Gaztambide ZPAE
    stationType: 'Fixed SIVCA Station',
  },
  {
    id: 'SN-MAD-26',
    name: 'Atocha',
    district: 'Arganzuela',
    coords: [40.4065, -3.6896],
    historicalNightAvgDb: 63.2,
    historicalEveningAvgDb: 66.8,
    historicalDayAvgDb: 68.6,
    recordedPeriod: 'October 2024 (SIVCA Monthly Bulletin, datos.madrid.es)',
    zpaeArea: false,
    stationType: 'Fixed SIVCA Station',
  },
  {
    id: 'SN-MAD-27',
    name: 'Chamartín',
    district: 'Chamartín',
    coords: [40.4720, -3.6766],
    historicalNightAvgDb: 59.4,
    historicalEveningAvgDb: 63.2,
    historicalDayAvgDb: 65.4,
    recordedPeriod: 'October 2024 (SIVCA Monthly Bulletin, datos.madrid.es)',
    zpaeArea: false,
    stationType: 'Fixed SIVCA Station',
  },
  {
    id: 'SN-MAD-28',
    name: 'Embajadores',
    district: 'Centro',
    coords: [40.4069, -3.7011],
    historicalNightAvgDb: 61.9,
    historicalEveningAvgDb: 65.6,
    historicalDayAvgDb: 67.3,
    recordedPeriod: 'October 2024 (SIVCA Monthly Bulletin, datos.madrid.es)',
    zpaeArea: true,
    stationType: 'Fixed SIVCA Station',
  },
  {
    id: 'SN-MAD-29',
    name: 'Goya',
    district: 'Salamanca',
    coords: [40.4243, -3.6763],
    historicalNightAvgDb: 61.1,
    historicalEveningAvgDb: 65.0,
    historicalDayAvgDb: 66.9,
    recordedPeriod: 'October 2024 (SIVCA Monthly Bulletin, datos.madrid.es)',
    zpaeArea: false,
    stationType: 'Fixed SIVCA Station',
  },
  {
    id: 'SN-MAD-30',
    name: 'Aluche',
    district: 'Latina',
    coords: [40.3860, -3.7618],
    historicalNightAvgDb: 54.8,
    historicalEveningAvgDb: 58.7,
    historicalDayAvgDb: 61.1,
    recordedPeriod: 'October 2024 (SIVCA Monthly Bulletin, datos.madrid.es)',
    zpaeArea: false,
    stationType: 'Fixed SIVCA Station',
  },
  {
    id: 'SN-MAD-31',
    name: 'San Blas',
    district: 'San Blas-Canillejas',
    coords: [40.4285, -3.6149],
    historicalNightAvgDb: 55.6,
    historicalEveningAvgDb: 59.2,
    historicalDayAvgDb: 61.8,
    recordedPeriod: 'October 2024 (SIVCA Monthly Bulletin, datos.madrid.es)',
    zpaeArea: false,
    stationType: 'Fixed SIVCA Station',
  },
];

/**
 * Madrid City Council Mobile Acoustic Fleet (UMMA / Policía Municipal)
 * Total: 17 mobile acoustic stations used for targeted campaigns & out-of-range complaints.
 */
export const MADRID_MOBILE_FLEET_SIZE = 17;

/**
 * Calculates accurate geodesic distance between two coordinate pairs on Earth using Haversine formula.
 * @param coords1 [latitude, longitude]
 * @param coords2 [latitude, longitude]
 * @returns Distance in whole meters
 */
export function calculateHaversineDistanceMeters(
  coords1: [number, number],
  coords2: [number, number]
): number {
  const R = 6371000; // Earth mean radius in meters
  const lat1 = (coords1[0] * Math.PI) / 180;
  const lat2 = (coords2[0] * Math.PI) / 180;
  const deltaLat = ((coords2[0] - coords1[0]) * Math.PI) / 180;
  const deltaLon = ((coords2[1] - coords1[1]) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Finds the nearest fixed SIVCA station and computes geodesic distance in meters.
 * Distance threshold for fixed station coverage is 500 meters.
 */
export function findNearestSivcaStation(coords: [number, number]): {
  station: SivcaStation;
  distanceMeters: number;
  isOutOfRange: boolean;
  coverageRadiusMeters: number;
} {
  const COVERAGE_THRESHOLD_METERS = 500;
  let nearestStation = REAL_SIVCA_STATIONS[0];
  let minDistanceMeters = Infinity;

  for (const station of REAL_SIVCA_STATIONS) {
    const dist = calculateHaversineDistanceMeters(coords, station.coords);
    if (dist < minDistanceMeters) {
      minDistanceMeters = dist;
      nearestStation = station;
    }
  }

  return {
    station: nearestStation,
    distanceMeters: minDistanceMeters,
    isOutOfRange: minDistanceMeters > COVERAGE_THRESHOLD_METERS,
    coverageRadiusMeters: COVERAGE_THRESHOLD_METERS,
  };
}

export const OPEN_DATA_CADENCE_NOTICE =
  'Madrid datos.madrid.es publishes validated post-period aggregates (Ld 07–19, Le 19–23, Ln 23–07). No public real-time sub-second streaming feed exists.';

export const LEGAL_FRAMEWORK_NOTICE =
  'Strategic indicator: 55 dBA (Lnight, EU Dir 2002/49/EC) is an environmental planning target. Enforceable limits are governed by Ley 37/2003 and Madrid OPCAT/ZPAE. Infractions require certified sonometric measurement by Policía Municipal / DG Sostenibilidad.';
