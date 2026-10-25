import type { Incident } from '../data/mockData';
import { supabase } from './supabase';

// Keeps incidents in sync between the resident app (/report) and the operator dashboard.
// With Supabase configured, reports are stored in the `incidents` table and changes are
// pushed to every open browser. Without it, this falls back to a BroadcastChannel, which
// only reaches other tabs in the same browser.

// Identifies this tab so it can ignore realtime echoes of its own writes.
const CLIENT_ID = Math.random().toString(36).slice(2) + Date.now().toString(36);

interface IncidentRow {
  id: string;
  created_at: string;
  location: string;
  district: string;
  lat: number;
  lng: number;
  description: string;
  reporter: string;
  priority: Incident['priority'];
  status: Incident['status'];
  category: string;
  event_context: string | null;
  resolution: Incident['resolution'] | null;
  sensor_verification: Incident['sensorVerification'] | null;
  agent_logs: Incident['agentLogs'];
  updated_by: string | null;
}

const toRow = (incident: Incident): IncidentRow => ({
  id: incident.id,
  created_at: incident.timestamp,
  location: incident.location,
  district: incident.district,
  lat: incident.coordinates[0],
  lng: incident.coordinates[1],
  description: incident.description,
  reporter: incident.reporter,
  priority: incident.priority,
  status: incident.status,
  category: incident.category,
  event_context: incident.eventContext ?? null,
  resolution: incident.resolution ?? null,
  sensor_verification: incident.sensorVerification ?? null,
  agent_logs: incident.agentLogs,
  updated_by: CLIENT_ID,
});

const fromRow = (row: IncidentRow): Incident => ({
  id: row.id,
  timestamp: row.created_at,
  location: row.location,
  district: row.district,
  coordinates: [row.lat, row.lng],
  description: row.description,
  reporter: row.reporter,
  priority: row.priority,
  status: row.status,
  category: row.category,
  eventContext: row.event_context ?? undefined,
  resolution: row.resolution ?? undefined,
  sensorVerification: row.sensor_verification ?? undefined,
  agentLogs: row.agent_logs,
});

// Writes for the same incident run in order, so a status update never lands before
// the insert that creates the row.
const writeQueue = new Map<string, Promise<void>>();

const saveIncident = (incident: Incident) => {
  if (!supabase) return;
  const db = supabase;
  const row = toRow(incident);
  const write = async () => {
    const { error } = incident.status === 'New'
      ? await db.from('incidents').insert(row)
      : await db.from('incidents').update(row).eq('id', incident.id);
    if (error) console.error(`Couldn't save ${incident.id}:`, error.message);
  };
  const next = (writeQueue.get(incident.id) ?? Promise.resolve()).then(write);
  writeQueue.set(incident.id, next);
};

// Fallback transport: other tabs in the same browser.
const CHANNEL_NAME = 'viaciudad-pipeline';
type SyncMessage = { type: 'upsert'; incident: Incident };
let broadcast: BroadcastChannel | null = null;

const getBroadcast = () => {
  if (!broadcast && typeof BroadcastChannel !== 'undefined') {
    broadcast = new BroadcastChannel(CHANNEL_NAME);
  }
  return broadcast;
};

export const publishIncident = (incident: Incident) => {
  if (supabase) saveIncident(incident);
  else getBroadcast()?.postMessage({ type: 'upsert', incident } satisfies SyncMessage);
};

// Reports already in the database, newest first. Empty without Supabase.
export const loadIncidents = async (): Promise<Incident[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('incidents')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);
  if (error) {
    console.error("Couldn't load reports:", error.message);
    return [];
  }
  return (data as IncidentRow[]).map(fromRow);
};

let subscriptionCount = 0;

// Calls onIncident for changes made by other tabs and devices, never for this tab's own.
export const subscribeToIncidents = (onIncident: (incident: Incident) => void) => {
  if (supabase) {
    const db = supabase;
    const channel = db
      .channel(`incidents-${CLIENT_ID}-${++subscriptionCount}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, payload => {
        const row = payload.new as Partial<IncidentRow>;
        if (!row.id || row.updated_by === CLIENT_ID) return;
        onIncident(fromRow(row as IncidentRow));
      })
      .subscribe();
    return () => { db.removeChannel(channel); };
  }

  const ch = getBroadcast();
  if (!ch) return () => {};
  const handler = (event: MessageEvent<SyncMessage>) => {
    if (event.data?.type === 'upsert') onIncident(event.data.incident);
  };
  ch.addEventListener('message', handler);
  return () => ch.removeEventListener('message', handler);
};
