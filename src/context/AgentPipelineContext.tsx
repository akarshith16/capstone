import { createContext, useContext, useState, useMemo, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { initialIncidents } from '../data/mockData';
import type { Incident, IncidentStatus, ResolutionType } from '../data/mockData';
import { INTAKE_FLOW, buildSensorContext, sensorContextSummary, findNearbyReports, decidePriority, suggestRoute, SUGGESTED_ROUTE_PREFIX } from '../lib/triage';
import type { ResidentAnswers } from '../lib/triage';
import { publishIncident, subscribeToIncidents, loadIncidents } from '../lib/pipelineSync';

export type Toast = {
  id: string;
  message: string;
  type: 'info' | 'critical' | 'success';
};

interface AgentPipelineContextType {
  incidents: Incident[];
  activeIncident: Incident | null;
  setActiveIncident: (incident: Incident | null) => void;
  submitReport: (reportText: string, location: string, coordinates: [number, number], district: string, category: string, reporter?: string, answers?: ResidentAnswers) => string;
  resolveIncident: (id: string, resolutionType: ResolutionType) => void;
  
  // Filtering state
  filterDistrict: string | 'All';
  setFilterDistrict: (d: string | 'All') => void;
  filterStatus: IncidentStatus | 'All';
  setFilterStatus: (s: IncidentStatus | 'All') => void;
  filterCategory: string | 'All';
  setFilterCategory: (c: string | 'All') => void;
  filterTime: 'All' | 'Daytime' | 'Nighttime';
  setFilterTime: (t: 'All' | 'Daytime' | 'Nighttime') => void;
  filteredIncidents: Incident[];

  // Modals
  isAnalyticsOpen: boolean;
  setIsAnalyticsOpen: (v: boolean) => void;

  // Toasts
  toasts: Toast[];
  removeToast: (id: string) => void;

  // Citizen Feedback
  citizenFeedback: string | null;
  setCitizenFeedback: (msg: string | null) => void;
}

const AgentPipelineContext = createContext<AgentPipelineContextType | undefined>(undefined);

// Mock incidents are regenerated randomly on every load, so they stay local and are never synced.
const MOCK_IDS = new Set(initialIncidents.map(inc => inc.id));

export const AgentPipelineProvider = ({ children }: { children: ReactNode }) => {
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  // Latest incidents for the pipeline steps below, which run after a delay.
  const incidentsRef = useRef(incidents);
  useEffect(() => { incidentsRef.current = incidents; }, [incidents]);
  const [activeIncident, setActiveIncident] = useState<Incident | null>(null);
  const [citizenFeedback, setCitizenFeedback] = useState<string | null>(null);

  // Filters
  const [filterDistrict, setFilterDistrict] = useState<string | 'All'>('All');
  const [filterStatus, setFilterStatus] = useState<IncidentStatus | 'All'>('All');
  const [filterCategory, setFilterCategory] = useState<string | 'All'>('All');
  const [filterTime, setFilterTime] = useState<'All' | 'Daytime' | 'Nighttime'>('All');

  // Modals
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: Toast['type']) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const upsertIncident = (incident: Incident) => {
    setIncidents(prev => prev.some(inc => inc.id === incident.id)
      ? prev.map(inc => inc.id === incident.id ? incident : inc)
      : [incident, ...prev]);
  };

  // Every local change goes through here so other tabs and devices see it too.
  const commitIncident = (incident: Incident) => {
    upsertIncident(incident);
    if (!MOCK_IDS.has(incident.id)) publishIncident(incident);
  };

  useEffect(() => {
    loadIncidents().then(saved => {
      if (saved.length === 0) return;
      const savedIds = new Set(saved.map(inc => inc.id));
      setIncidents(prev => [...saved, ...prev.filter(inc => !savedIds.has(inc.id))]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    });
  }, []);

  useEffect(() => subscribeToIncidents(incident => {
    upsertIncident(incident);
    if (incident.status === 'New') {
      addToast(`New resident report in ${incident.district}`, 'info');
    } else if (incident.status === 'Prioritizing' && incident.priority === 'Critical') {
      addToast(`Critical incident detected in ${incident.district}!`, 'critical');
    }
  }), []);

  const filteredIncidents = useMemo(() => {
    return incidents.filter(inc => {
      const matchDistrict = filterDistrict === 'All' || inc.district === filterDistrict;
      const matchStatus = filterStatus === 'All' || inc.status === filterStatus;
      const matchCategory = filterCategory === 'All' || inc.category === filterCategory;
      
      let matchTime = true;
      if (filterTime !== 'All') {
        const hour = new Date(inc.timestamp).getHours();
        const isNight = hour >= 22 || hour < 6;
        if (filterTime === 'Nighttime' && !isNight) matchTime = false;
        if (filterTime === 'Daytime' && isNight) matchTime = false;
      }

      return matchDistrict && matchStatus && matchCategory && matchTime;
    });
  }, [incidents, filterDistrict, filterStatus, filterCategory, filterTime]);

  const resolveIncident = (id: string, resolutionType: ResolutionType) => {
    let actionLog = '';
    let toastMsg = '';
    let toastType: Toast['type'] = 'success';

    switch (resolutionType) {
      case 'warning':
        actionLog = 'Officer recorded a verbal warning (Apercibimiento).';
        toastMsg = 'Incident resolved: Verbal warning issued.';
        toastType = 'info';
        break;
      case 'fine':
        actionLog = 'Officer recorded an administrative fine (Acta de Infracción).';
        toastMsg = 'Incident resolved: Administrative fine issued.';
        toastType = 'success';
        break;
      case 'seizure':
        actionLog = 'Officer recorded an equipment seizure (Decomiso Cautelar).';
        toastMsg = 'Incident resolved: Equipment seized and event shut down.';
        toastType = 'critical';
        break;
    }

    const target = incidents.find(inc => inc.id === id);
    if (!target) return;
    if (target.reporter === 'Citizen (You)') {
      setCitizenFeedback(`Update on ${target.id}: Municipal action taken. ${toastMsg}`);
    }
    commitIncident({
      ...target,
      status: 'Resolved',
      resolution: resolutionType,
      agentLogs: [
        ...target.agentLogs,
        { agent: 'Coordinator', action: actionLog, timestamp: new Date().toISOString() }
      ]
    });
    addToast(toastMsg, toastType);
  };

  // The pipeline a report goes through. The delays only pace the demo; each step's
  // rule lives in src/lib/triage.ts.
  const submitReport = (reportText: string, location: string, coordinates: [number, number], district: string, category: string, reporter = 'Citizen (You)', answers: ResidentAnswers = { ongoing: null, recurring: null }) => {
    const reportedAt = new Date().toISOString();
    const newIncident: Incident = {
      // 5-digit suffix so new reports never collide with the 4-digit sample IDs
      id: `REQ-${new Date().getFullYear()}-${10000 + Math.floor(Math.random() * 90000)}`,
      timestamp: reportedAt,
      location,
      district,
      coordinates,
      description: reportText,
      reporter,
      priority: 'Pending',
      status: 'New',
      category: category,
      agentLogs: [{
        agent: 'Chulapo',
        action: INTAKE_FLOW === 'simple'
          ? 'Received resident report (simple intake: no sensor step).'
          : 'Received resident report.',
        timestamp: reportedAt,
      }],
    };

    commitIncident(newIncident);

    const prioritize = (current: Incident) => {
      const nearby = findNearbyReports(incidentsRef.current, coordinates, reportedAt, new Set([...MOCK_IDS, current.id]));
      const { priority, reasons } = decidePriority(answers, nearby);
      const prioritized: Incident = {
        ...current,
        status: 'Prioritizing',
        priority,
        agentLogs: [
          ...current.agentLogs,
          { agent: 'Decider', action: `Priority ${priority}: ${reasons.join('; ')}. Rule-based; sensor data is not an input.`, timestamp: new Date().toISOString() },
        ],
      };
      commitIncident(prioritized);

      setTimeout(() => {
        const { team, rule } = suggestRoute(category, answers);
        const routed: Incident = {
          ...prioritized,
          status: 'Routed',
          agentLogs: [
            ...prioritized.agentLogs,
            { agent: 'Coordinator', action: `${SUGGESTED_ROUTE_PREFIX}${team}. Rule: ${rule}. Simulated: no dispatch system is connected; waiting for officer sign-off.`, timestamp: new Date().toISOString() },
          ],
        };
        commitIncident(routed);
        setActiveIncident(routed);
      }, 2500);
    };

    setTimeout(() => {
      if (INTAKE_FLOW === 'simple') {
        prioritize(newIncident);
        return;
      }
      const sensorContext = buildSensorContext(coordinates, reportedAt);
      const withContext: Incident = {
        ...newIncident,
        status: 'Verifying',
        sensorContext,
        agentLogs: [
          ...newIncident.agentLogs,
          { agent: 'Sentinel', action: `${sensorContextSummary(sensorContext)} No reading is loaded in this prototype.`, timestamp: new Date().toISOString() },
        ],
      };
      commitIncident(withContext);
      setTimeout(() => prioritize(withContext), 2500);
    }, 1500);

    return newIncident.id;
  };

  return (
    <AgentPipelineContext.Provider value={{ 
      incidents, activeIncident, setActiveIncident, submitReport, resolveIncident,
      filterDistrict, setFilterDistrict, filterStatus, setFilterStatus, 
      filterCategory, setFilterCategory, filterTime, setFilterTime,
      filteredIncidents, isAnalyticsOpen, setIsAnalyticsOpen, toasts, removeToast,
      citizenFeedback, setCitizenFeedback
    }}>
      {children}
    </AgentPipelineContext.Provider>
  );
};

export const useAgentPipeline = () => {
  const context = useContext(AgentPipelineContext);
  if (context === undefined) {
    throw new Error('useAgentPipeline must be used within an AgentPipelineProvider');
  }
  return context;
};
