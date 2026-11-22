import { createContext, useContext, useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import { initialIncidents } from '../data/mockData';
import type {
  Incident,
  IncidentPriority,
  IncidentStatus,
  VerificationDataMode,
  CitizenIntakeMode,
  IncidentPhotoAnalysis,
  IncidentAudioAnalysis,
} from '../data/mockData';
import { evaluateTriageCase } from '../utils/triageVerificationSuite';

export type Toast = {
  id: string;
  message: string;
  type: 'info' | 'critical' | 'success';
};

interface AgentPipelineContextType {
  incidents: Incident[];
  activeIncident: Incident | null;
  setActiveIncident: (incident: Incident | null) => void;
  currentAppView: 'citizen' | 'command_center';
  setCurrentAppView: (view: 'citizen' | 'command_center') => void;
  lastSubmittedTicketId: string | null;
  setLastSubmittedTicketId: (id: string | null) => void;
  submitReport: (
    reportText: string,
    location: string,
    coordinates: [number, number],
    district: string,
    category: string,
    multimodal?: {
      photoUrl?: string;
      photoAnalysis?: IncidentPhotoAnalysis;
      audioUrl?: string;
      audioAnalysis?: IncidentAudioAnalysis;
      isCurrent?: boolean;
      isRecurring?: boolean;
    }
  ) => string;
  resolveIncident: (id: string, resolutionType: 'warning' | 'fine' | 'seizure') => void;
  officerOverrideIncident: (
    id: string,
    newPriority: IncidentPriority,
    overrideReason: string,
    reviewDurationSeconds: number
  ) => void;
  officerApproveIncident: (id: string, reviewDurationSeconds: number) => void;

  // Verification Data Mode controls
  verificationMode: VerificationDataMode;
  setVerificationMode: (mode: VerificationDataMode) => void;
  simulatedSpikeDb: number;
  setSimulatedSpikeDb: (db: number) => void;

  // Citizen Intake Mode
  intakeMode: CitizenIntakeMode;
  setIntakeMode: (mode: CitizenIntakeMode) => void;

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
  isVerificationModalOpen: boolean;
  setIsVerificationModalOpen: (v: boolean) => void;
  isTransparencyOpen: boolean;
  setIsTransparencyOpen: (v: boolean) => void;

  // Toasts
  toasts: Toast[];
  removeToast: (id: string) => void;

  // Citizen Feedback
  citizenFeedback: string | null;
  setCitizenFeedback: (msg: string | null) => void;
}

const AgentPipelineContext = createContext<AgentPipelineContextType | undefined>(undefined);

export const AgentPipelineProvider = ({ children }: { children: ReactNode }) => {
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  const [activeIncident, setActiveIncident] = useState<Incident | null>(null);
  const [citizenFeedback, setCitizenFeedback] = useState<string | null>(null);
  const [currentAppView, setCurrentAppView] = useState<'citizen' | 'command_center'>('citizen');
  const [lastSubmittedTicketId, setLastSubmittedTicketId] = useState<string | null>(null);

  // Verification & Demo Controls
  const [verificationMode, setVerificationMode] = useState<VerificationDataMode>('historical');
  const [simulatedSpikeDb, setSimulatedSpikeDb] = useState<number>(78.0);
  const [intakeMode, setIntakeMode] = useState<CitizenIntakeMode>('anonymous');

  // Filters
  const [filterDistrict, setFilterDistrict] = useState<string | 'All'>('All');
  const [filterStatus, setFilterStatus] = useState<IncidentStatus | 'All'>('All');
  const [filterCategory, setFilterCategory] = useState<string | 'All'>('All');
  const [filterTime, setFilterTime] = useState<'All' | 'Daytime' | 'Nighttime'>('All');

  // Modals
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isTransparencyOpen, setIsTransparencyOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: Toast['type']) => {
    const id = Date.now().toString(36);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
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
        actionLog = 'Issued administrative fine (Acta de Infracción) for repeat offense under OPCAT.';
        toastMsg = 'Incident resolved: Administrative fine issued.';
        toastType = 'success';
        break;
      case 'seizure':
        actionLog = 'Executed equipment seizure (Decomiso Cautelar) and dispersed gathering.';
        toastMsg = 'Incident resolved: Equipment seized and event shut down.';
        toastType = 'critical';
        break;
    }

    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === id) {
          if (inc.reporter.includes('(You)')) {
            setCitizenFeedback(`Update on ${inc.id}: Municipal action taken. ${toastMsg}`);
          }
          return {
            ...inc,
            status: 'Resolved',
            agentLogs: [
              ...inc.agentLogs,
              { agent: 'Coordinator', action: actionLog, timestamp: new Date().toISOString() },
            ],
          };
        }
        return inc;
      })
    );
    addToast(toastMsg, toastType);
  };

  const officerOverrideIncident = (
    id: string,
    newPriority: IncidentPriority,
    overrideReason: string,
    reviewDurationSeconds: number
  ) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === id) {
          const originalPriority = inc.priority;
          const updated: Incident = {
            ...inc,
            priority: newPriority,
            officerReview: {
              reviewedAt: new Date().toISOString(),
              reviewDurationSeconds,
              decision: 'modified',
              originalPriority,
              finalPriority: newPriority,
              overrideReason,
              officerBadge: 'POL-MAD-092-OP',
            },
            agentLogs: [
              ...inc.agentLogs,
              {
                agent: 'Coordinator',
                action: `Human Officer Override: Priority modified from ${originalPriority} to ${newPriority}. Justification: "${overrideReason}" (Review duration: ${reviewDurationSeconds}s).`,
                timestamp: new Date().toISOString(),
              },
            ],
          };
          if (activeIncident?.id === id) {
            setActiveIncident(updated);
          }
          return updated;
        }
        return inc;
      })
    );
    addToast(`Officer Override Saved: Priority set to ${newPriority}`, 'info');
  };

  const officerApproveIncident = (id: string, reviewDurationSeconds: number) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === id) {
          const updated: Incident = {
            ...inc,
            officerReview: {
              reviewedAt: new Date().toISOString(),
              reviewDurationSeconds,
              decision: 'approved',
              originalPriority: inc.priority,
              finalPriority: inc.priority,
              officerBadge: 'POL-MAD-092-OP',
            },
            agentLogs: [
              ...inc.agentLogs,
              {
                agent: 'Coordinator',
                action: `Human Officer Sign-Off: AI triage recommendation approved as submitted (${inc.priority}). Review duration: ${reviewDurationSeconds}s.`,
                timestamp: new Date().toISOString(),
              },
            ],
          };
          if (activeIncident?.id === id) {
            setActiveIncident(updated);
          }
          return updated;
        }
        return inc;
      })
    );
    addToast(`Officer Signed Off: Triage confirmed (${activeIncident?.priority || 'Approved'})`, 'success');
  };

  const submitReport = (
    reportText: string,
    location: string,
    coordinates: [number, number],
    district: string,
    category: string,
    multimodal?: {
      photoUrl?: string;
      photoAnalysis?: IncidentPhotoAnalysis;
      audioUrl?: string;
      audioAnalysis?: IncidentAudioAnalysis;
      isCurrent?: boolean;
      isRecurring?: boolean;
    }
  ): string => {
    const isAnon = intakeMode === 'anonymous';
    const reporter = isAnon
      ? 'Citizen (You - Anonymous)'
      : 'Citizen (You - Cl@ve DNI ***7194*)';

    const timestamp = new Date().toISOString();
    const newIncidentId = `REQ-${2026}-${Date.now().toString().slice(-4)}`;

    let chulapoAction = `Received report from citizen (${isAnon ? 'Anonymous mode' : 'Authenticated via Cl@ve'}). NLP structured entity extraction complete.`;
    if (multimodal?.photoAnalysis || multimodal?.audioAnalysis) {
      const parts: string[] = [];
      if (multimodal.photoAnalysis) {
        parts.push(`Gemini Vision: ${multimodal.photoAnalysis.tags.slice(0, 3).join(', ')} (${multimodal.photoAnalysis.confidence}% conf)`);
      }
      if (multimodal.audioAnalysis) {
        parts.push(`Gemini Audio: ~${multimodal.audioAnalysis.estimatedDb} dBA perceptual impact`);
      }
      chulapoAction += ` Multimodal verification attached: [${parts.join(' | ')}].`;
    }

    const newIncident: Incident = {
      id: newIncidentId,
      timestamp,
      location,
      district,
      coordinates,
      description: reportText,
      reporter,
      isAnonymous: isAnon,
      priority: 'Pending',
      status: 'New',
      category,
      photoUrl: multimodal?.photoUrl,
      photoAnalysis: multimodal?.photoAnalysis,
      audioUrl: multimodal?.audioUrl,
      audioAnalysis: multimodal?.audioAnalysis,
      isCurrent: multimodal?.isCurrent ?? true,
      isRecurring: multimodal?.isRecurring ?? false,
      agentLogs: [
        {
          agent: 'Chulapo',
          action: chulapoAction,
          timestamp: new Date().toISOString(),
        },
      ],
    };

    setLastSubmittedTicketId(newIncidentId);
    setIncidents((prev) => [newIncident, ...prev]);

    // Sentinel step (deterministic verification, zero random numbers)
    setTimeout(() => {
      // Gather existing active incidents for clustering check
      const recentList = incidents.slice(0, 15).map((i) => ({
        location: i.location,
        coordinates: i.coordinates,
        timestamp: i.timestamp,
        district: i.district,
      }));

      const evaluation = evaluateTriageCase({
        reportText,
        location,
        district,
        coordinates,
        category,
        timestamp,
        intakeMode,
        verificationMode,
        simulatedSpikeDb,
        recentIncidents: recentList,
      });

      const verifiedIncident: Incident = {
        ...newIncident,
        status: 'Verifying',
        sensorVerification: evaluation.sensorVerification,
        baselineComparison: evaluation.baselineComparison,
        agentLogs: [
          ...newIncident.agentLogs,
          {
            agent: 'Sentinel',
            action: evaluation.reasoning[0] + (evaluation.reasoning[1] ? ` ${evaluation.reasoning[1]}` : ''),
            timestamp: new Date().toISOString(),
          },
        ],
      };

      setIncidents((prev) =>
        prev.map((inc) => (inc.id === verifiedIncident.id ? verifiedIncident : inc))
      );

      // Decider step (deterministic asymmetric scoring)
      setTimeout(() => {
        const prioritizedIncident: Incident = {
          ...verifiedIncident,
          status: 'Prioritizing',
          priority: evaluation.priority,
          agentLogs: [
            ...verifiedIncident.agentLogs,
            {
              agent: 'Decider',
              action: `Evaluated context under Ley 37/2003 and Madrid OPCAT. Asymmetric score applied. Priority set to ${evaluation.priority}.`,
              timestamp: new Date().toISOString(),
            },
          ],
        };

        setIncidents((prev) =>
          prev.map((inc) => (inc.id === prioritizedIncident.id ? prioritizedIncident : inc))
        );

        if (evaluation.priority === 'Critical') {
          addToast(`Critical triage priority flagged for ${district}!`, 'critical');
        }

        // Coordinator step (department routing)
        setTimeout(() => {
          const routedIncident: Incident = {
            ...prioritizedIncident,
            status: 'Routed',
            agentLogs: [
              ...prioritizedIncident.agentLogs,
              {
                agent: 'Coordinator',
                action: `Routed ticket to ${evaluation.routedTo} based on priority and sensor clustering.`,
                timestamp: new Date().toISOString(),
              },
            ],
          };

          setIncidents((prev) =>
            prev.map((inc) => (inc.id === routedIncident.id ? routedIncident : inc))
          );
          setActiveIncident(routedIncident);
        }, 1800);
      }, 1800);
    }, 1500);

    return newIncidentId;
  };

  return (
    <AgentPipelineContext.Provider
      value={{
        incidents,
        activeIncident,
        setActiveIncident,
        currentAppView,
        setCurrentAppView,
        lastSubmittedTicketId,
        setLastSubmittedTicketId,
        submitReport,
        resolveIncident,
        officerOverrideIncident,
        officerApproveIncident,
        verificationMode,
        setVerificationMode,
        simulatedSpikeDb,
        setSimulatedSpikeDb,
        intakeMode,
        setIntakeMode,
        filterDistrict,
        setFilterDistrict,
        filterStatus,
        setFilterStatus,
        filterCategory,
        setFilterCategory,
        filterTime,
        setFilterTime,
        filteredIncidents,
        isAnalyticsOpen,
        setIsAnalyticsOpen,
        isVerificationModalOpen,
        setIsVerificationModalOpen,
        isTransparencyOpen,
        setIsTransparencyOpen,
        toasts,
        removeToast,
        citizenFeedback,
        setCitizenFeedback,
      }}
    >
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
