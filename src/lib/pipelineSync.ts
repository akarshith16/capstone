import type { Incident } from '../data/mockData';

// Keeps incidents in sync between open tabs (e.g. the resident app at /report and the
// operator dashboard) so a report filed in one shows up in the other. Same-browser only:
// there is no backend yet, so this is what links the two views in a demo.
const CHANNEL_NAME = 'viaciudad-pipeline';

type SyncMessage = { type: 'upsert'; incident: Incident };

let channel: BroadcastChannel | null = null;

const getChannel = () => {
  if (!channel && typeof BroadcastChannel !== 'undefined') {
    channel = new BroadcastChannel(CHANNEL_NAME);
  }
  return channel;
};

export const publishIncident = (incident: Incident) => {
  getChannel()?.postMessage({ type: 'upsert', incident } satisfies SyncMessage);
};

// A channel never receives its own messages, so a tab only hears updates from other tabs.
export const subscribeToIncidents = (onIncident: (incident: Incident) => void) => {
  const ch = getChannel();
  if (!ch) return () => {};

  const handler = (event: MessageEvent<SyncMessage>) => {
    if (event.data?.type === 'upsert') onIncident(event.data.incident);
  };
  ch.addEventListener('message', handler);
  return () => ch.removeEventListener('message', handler);
};
