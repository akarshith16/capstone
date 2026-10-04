import { createContext, useContext, useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import { initialIncidents } from '../data/mockData';
import type { Incident, IncidentStatus } from '../data/mockData';

export type Toast = {
  id: string;
  message: string;
  type: 'info' | 'critical' | 'success';
};

interface AgentPipelineContextType {
  incidents: Incident[];
  activeIncident: Incident | null;
  setActiveIncident: (incident: Incident | null) => void;
  submitReport: (reportText: string, location: string, coordinates: [number, number], district: string) => void;
  resolveIncident: (id: string, resolutionType: 'warning' | 'fine' | 'seizure') => void;
  
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
}

const AgentPipelineContext = createContext<AgentPipelineContextType | undefined>(undefined);

export const AgentPipelineProvider = ({ children }: { children: ReactNode }) => {
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  const [activeIncident, setActiveIncident] = useState<Incident | null>(null);

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

  const resolveIncident = (id: string, resolutionType: 'warning' | 'fine' | 'seizure') => {
    let actionLog = '';
    let toastMsg = '';
    let toastType: Toast['type'] = 'success';

    switch (resolutionType) {
      case 'warning':
        actionLog = 'Issued verbal warning (Apercibimiento). Resident complied.';
        toastMsg = 'Incident resolved: Verbal warning issued.';
        toastType = 'info';
        break;
      case 'fine':
        actionLog = 'Issued administrative fine (Acta de Infracción) for repeat offense.';
        toastMsg = 'Incident resolved: Administrative fine issued.';
        toastType = 'success';
        break;
      case 'seizure':
        actionLog = 'Executed equipment seizure (Decomiso Cautelar) and dispersed gathering.';
        toastMsg = 'Incident resolved: Equipment seized and event shut down.';
        toastType = 'critical';
        break;
    }

    setIncidents(prev => prev.map(inc => {
      if (inc.id === id) {
        return {
          ...inc,
          status: 'Resolved',
          agentLogs: [
            ...inc.agentLogs,
            { agent: 'Coordinator', action: actionLog, timestamp: new Date().toISOString() }
          ]
        };
      }
      return inc;
    }));
    addToast(toastMsg, toastType);
  };

  const submitReport = (reportText: string, location: string, coordinates: [number, number], district: string) => {
    const newIncident: Incident = {
      id: `REQ-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
      timestamp: new Date().toISOString(),
      location,
      district,
      coordinates,
      description: reportText,
      reporter: 'Citizen (You)',
      priority: 'Pending',
      status: 'New',
      category: 'Pending Analysis',
      agentLogs: [{ agent: 'Chulapo', action: 'Received report from citizen.', timestamp: new Date().toISOString() }],
    };

    setIncidents(prev => [newIncident, ...prev]);

    setTimeout(() => {
      const readingDb = 60 + Math.floor(Math.random() * 40);
      const thresholdDb = 65;
      const verifiedIncident = {
        ...newIncident,
        status: 'Verifying' as const,
        sensorVerification: {
          verified: true,
          sensorId: `SN-MAD-${Math.floor(Math.random() * 900) + 100}`,
          readingDb,
          thresholdDb,
          match: readingDb > thresholdDb
        },
        agentLogs: [
          ...newIncident.agentLogs,
          { agent: 'Sentinel' as const, action: `Cross-checked sensor data. Found reading: ${readingDb}dB.`, timestamp: new Date().toISOString() }
        ]
      };
      setIncidents(prev => prev.map(inc => inc.id === verifiedIncident.id ? verifiedIncident : inc));

      setTimeout(() => {
        const priority = readingDb > 80 ? 'Critical' : (readingDb > 65 ? 'High' : 'Moderate');
        const prioritizedIncident = {
          ...verifiedIncident,
          status: 'Prioritizing' as const,
          priority: priority as 'Critical' | 'High' | 'Moderate',
          category: 'Nightlife Disturbance',
          agentLogs: [
            ...verifiedIncident.agentLogs,
            { agent: 'Decider' as const, action: `Calculated impact score. Priority set to ${priority}.`, timestamp: new Date().toISOString() }
          ]
        };
        setIncidents(prev => prev.map(inc => inc.id === prioritizedIncident.id ? prioritizedIncident : inc));
        
        if (priority === 'Critical') {
          addToast(`Critical incident detected in ${district}!`, 'critical');
        }

        setTimeout(() => {
          const routedIncident = {
            ...prioritizedIncident,
            status: 'Routed' as const,
            agentLogs: [
              ...prioritizedIncident.agentLogs,
              { agent: 'Coordinator' as const, action: `Dispatched work order to Municipal Police 092.`, timestamp: new Date().toISOString() }
            ]
          };
          setIncidents(prev => prev.map(inc => inc.id === routedIncident.id ? routedIncident : inc));
          setActiveIncident(routedIncident);
        }, 3000);
      }, 3000);
    }, 2000);
  };

  return (
    <AgentPipelineContext.Provider value={{ 
      incidents, activeIncident, setActiveIncident, submitReport, resolveIncident,
      filterDistrict, setFilterDistrict, filterStatus, setFilterStatus, 
      filterCategory, setFilterCategory, filterTime, setFilterTime,
      filteredIncidents, isAnalyticsOpen, setIsAnalyticsOpen, toasts, removeToast
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
