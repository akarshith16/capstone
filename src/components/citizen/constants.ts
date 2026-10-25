import type { IncidentStatus } from '../../data/mockData';

export const MADRID_CENTER: [number, number] = [40.4169, -3.7035]; // Puerta del Sol

export const isInMadrid = ([lat, lng]: [number, number]) =>
  lat > 40.31 && lat < 40.56 && lng > -3.89 && lng < -3.52;

// Plain-language status names shown to residents.
export const STATUS_LABELS: Record<IncidentStatus, string> = {
  New: 'Received',
  Verifying: 'Checking',
  Prioritizing: 'Assessing',
  Routed: 'With responders',
  Resolved: 'Resolved',
};
