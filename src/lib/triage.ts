import { REAL_SIVCA_STATIONS } from '../data/sivca_dataset';
import type { Incident, IncidentPriority, SensorContext } from '../data/mockData';

// What the prototype does with a report after it is filed. Every rule here is written out
// so an officer (and a reviewer) can see why a case got its priority and route.
//
//   Real:      the report itself, its location, and the grouping of nearby reports.
//   Context:   the nearest SIVCA station and when its daily average is published.
//              The prototype holds no SIVCA readings, and a station hundreds of metres
//              away cannot show what happened at one address, so this is never used as
//              verification and never changes the priority.
//   Simulated: routing. No dispatch system is connected; an officer signs off every case.

// ?flow=simple runs plain intake and routing with no sensor step, for comparison tests.
export type IntakeFlow = 'enriched' | 'simple';
export const INTAKE_FLOW: IntakeFlow =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('flow') === 'simple'
    ? 'simple'
    : 'enriched';

// A station further than this is not shown as context for the report.
export const CONTEXT_RADIUS_M = 1000;
// Reports this close together, this close in time, are grouped as one problem.
export const GROUP_RADIUS_M = 150;
export const GROUP_WINDOW_MIN = 60;

export const distanceM = ([lat1, lng1]: [number, number], [lat2, lng2]: [number, number]) => {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.sqrt(a));
};

const isoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// SIVCA publishes each day's averages as open data the following day.
export const buildSensorContext = (coordinates: [number, number], reportedAt: string): SensorContext => {
  let nearest = REAL_SIVCA_STATIONS[0];
  let best = Infinity;
  for (const s of REAL_SIVCA_STATIONS) {
    const d = distanceM(coordinates, s.coords);
    if (d < best) {
      best = d;
      nearest = s;
    }
  }
  const day = new Date(reportedAt);
  const next = new Date(day);
  next.setDate(day.getDate() + 1);
  const withinRange = best <= CONTEXT_RADIUS_M;
  return {
    stationId: withinRange ? nearest.id : null,
    stationName: withinRange ? nearest.name : null,
    distanceM: withinRange ? Math.round(best / 10) * 10 : null,
    withinRange,
    coverageDate: isoDate(day),
    publishedOn: isoDate(next),
    readingLoaded: false,
  };
};

export const formatDay = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

export const sensorContextSummary = (ctx: SensorContext) =>
  ctx.withinRange
    ? `Nearest SIVCA station: ${ctx.stationName}, ${ctx.distanceM} m away. Its daily average for ${formatDay(ctx.coverageDate)} is published on ${formatDay(ctx.publishedOn)}. Context only: it describes the area around the station, not this address.`
    : `No SIVCA station within ${CONTEXT_RADIUS_M / 1000} km. The case goes ahead on the resident's report alone.`;

export interface ResidentAnswers {
  ongoing: boolean | null; // null = not asked (e.g. reports typed into the chat)
  recurring: boolean | null;
}

// Other open reports near this one in the last hour (sample data excluded).
export const findNearbyReports = (
  incidents: Incident[],
  coordinates: [number, number],
  reportedAt: string,
  excludeIds: Set<string>,
) => {
  const t = new Date(reportedAt).getTime();
  return incidents.filter(inc =>
    !excludeIds.has(inc.id) &&
    inc.status !== 'Resolved' &&
    t - new Date(inc.timestamp).getTime() <= GROUP_WINDOW_MIN * 60000 &&
    t - new Date(inc.timestamp).getTime() >= 0 &&
    distanceM(coordinates, inc.coordinates) <= GROUP_RADIUS_M,
  );
};

// Priority from what the resident told us and from duplicate grouping, the two inputs the
// base licence includes. Sensor data is deliberately not an input.
export const decidePriority = (answers: ResidentAnswers, nearby: Incident[]): { priority: IncidentPriority; reasons: string[] } => {
  const now = answers.ongoing !== false;
  const reasons: string[] = [];
  if (answers.ongoing === true) reasons.push('resident says it is happening now');
  if (answers.ongoing === null) reasons.push('timing not given, treated as happening now');
  if (answers.ongoing === false) reasons.push('resident says it has stopped');
  if (answers.recurring) reasons.push('resident says it happens often');

  if (nearby.length > 0) {
    reasons.push(`grouped with ${nearby.length} other report${nearby.length > 1 ? 's' : ''} within ${GROUP_RADIUS_M} m in the last hour (${nearby.map(n => n.id).join(', ')})`);
  } else {
    reasons.push(`no other reports within ${GROUP_RADIUS_M} m in the last hour`);
  }

  if (now && nearby.length > 0) return { priority: 'High', reasons };
  if (now) return { priority: 'Moderate', reasons };
  if (answers.recurring) return { priority: 'Moderate', reasons };
  return { priority: 'Low', reasons };
};

const INSPECTION = 'Environmental inspection service (DG Sostenibilidad y Control Ambiental)';

// Suggested owner by type of noise and timing. A suggestion for the officer, not a dispatch.
export const suggestRoute = (category: string, answers: ResidentAnswers): { team: string; rule: string } => {
  const now = answers.ongoing !== false;
  switch (category) {
    case 'Traffic Noise':
      return { team: 'Mobility and urban planning (Área de Urbanismo, Medio Ambiente y Movilidad)', rule: 'traffic noise is a planning issue, not a patrol call' };
    case 'Construction':
      return { team: INSPECTION, rule: 'works noise is checked against permitted hours by inspectors' };
    default:
      return now
        ? { team: 'Policía Municipal (092)', rule: 'venue or party noise happening now needs on-the-spot enforcement' }
        : { team: INSPECTION, rule: 'venue or party noise that has stopped is followed up by inspection and licensing' };
  }
};

export const SUGGESTED_ROUTE_PREFIX = 'Suggested route: ';
