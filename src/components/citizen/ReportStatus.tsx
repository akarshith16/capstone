import React from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2, MapPin, ChevronLeft, Plus } from 'lucide-react';
import type { Incident, IncidentStatus } from '../../data/mockData';
import { REAL_SIVCA_STATIONS } from '../../data/sivca_dataset';
import { getNoiseCategory } from './noiseCategories';

const STATUS_ORDER: IncidentStatus[] = ['New', 'Verifying', 'Prioritizing', 'Routed', 'Resolved'];

const RESOLUTION_TEXT: Record<NonNullable<Incident['resolution']>, string> = {
  warning: 'Inspectors gave a formal warning and the noise stopped.',
  fine: 'An administrative fine was issued to the source of the noise.',
  seizure: 'Sound equipment was seized and the gathering was shut down.',
};

const formatTime = (iso?: string) =>
  iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null;

const sensorText = (report: Incident) => {
  const sensor = report.sensorVerification;
  if (!sensor) return null;
  const station = REAL_SIVCA_STATIONS.find(s => s.id === sensor.sensorId);
  const source = sensor.sensorType === 'Fixed SIVCA' && station ? `The sensor at ${station.name}` : 'A mobile unit';
  return `${source} measured ${sensor.readingDb} dB (limit ${sensor.thresholdDb} dB).`;
};

const priorityText = (report: Incident) => {
  switch (report.priority) {
    case 'Critical': return 'Marked as urgent.';
    case 'High': return 'Marked as high priority.';
    case 'Moderate': return 'Marked as standard priority.';
    default: return null;
  }
};

const routedText = (report: Incident) => {
  const log = report.agentLogs.find(l => l.agent === 'Coordinator' && l.action.startsWith('Routed'));
  const team = log?.action.match(/Routed ticket to (.+?) based on/)?.[1];
  return team ? `Assigned to ${team}.` : null;
};

interface Stage {
  title: string;
  activeTitle: string;
  detail: (report: Incident) => string | null;
  time: (report: Incident) => string | undefined;
}

const logTime = (agent: Incident['agentLogs'][number]['agent'], last = false) => (report: Incident) => {
  const logs = report.agentLogs.filter(l => l.agent === agent);
  return (last ? logs[logs.length - 1] : logs[0])?.timestamp;
};

// One stage per pipeline status, in STATUS_ORDER.
const STAGES: Stage[] = [
  { title: 'Report received', activeTitle: 'Sending your report', detail: r => `Ticket ${r.id}`, time: logTime('Chulapo') },
  { title: 'Checked with noise sensors', activeTitle: 'Checking nearby noise sensors', detail: sensorText, time: logTime('Sentinel') },
  { title: 'Urgency assessed', activeTitle: 'Assessing how urgent it is', detail: priorityText, time: logTime('Decider') },
  { title: 'Sent to responders', activeTitle: 'Choosing who should respond', detail: routedText, time: logTime('Coordinator') },
  {
    title: 'Resolved',
    activeTitle: 'Waiting for the team to act',
    detail: r => (r.resolution ? RESOLUTION_TEXT[r.resolution] : null),
    time: r => (r.status === 'Resolved' ? logTime('Coordinator', true)(r) : undefined),
  },
];

interface ReportStatusProps {
  report: Incident;
  onBack: () => void;
  onNewReport: () => void;
}

const ReportStatus: React.FC<ReportStatusProps> = ({ report, onBack, onNewReport }) => {
  const current = STATUS_ORDER.indexOf(report.status);
  const category = getNoiseCategory(report.category);
  const isResolved = report.status === 'Resolved';

  return (
    <div className="pb-10">
      <button
        onClick={onBack}
        className="-ml-2 flex items-center gap-1 min-h-11 px-2 text-sm text-gray-400 hover:text-white rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <ChevronLeft className="w-4 h-4" /> Your reports
      </button>

      <div className="mt-2 mb-8">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 border ${
            isResolved ? 'bg-secondary/15 border-secondary/30 text-secondary' : 'bg-primary/15 border-primary/30 text-primary'
          }`}
        >
          <Check className="w-7 h-7" />
        </motion.div>
        <h2 className="text-2xl font-bold tracking-tight">
          {isResolved ? 'Your report was resolved' : "Thanks, we've got your report"}
        </h2>
        <p className="mt-2 text-gray-400 leading-relaxed">
          {isResolved
            ? 'Thank you for helping keep your neighborhood livable.'
            : 'You can follow its progress here. This page updates by itself.'}
        </p>
      </div>

      <div className="rounded-2xl bg-surface border border-white/10 p-4 mb-6 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-300">
          <category.icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold">{category.label}</p>
          <p className="text-sm text-gray-400 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{report.location}, {report.district}</span>
          </p>
          <p className="text-xs text-gray-500 mt-1 font-mono">{report.id}</p>
        </div>
      </div>

      <ol className="relative" aria-label="Report progress">
        {STAGES.map((stage, i) => {
          const isDone = i <= current;
          const isActive = i === current + 1;
          const detail = isDone ? stage.detail(report) : null;
          const time = isDone ? formatTime(stage.time(report)) : null;
          const isLast = i === STAGES.length - 1;

          return (
            <li key={stage.title} className="relative flex gap-4 pb-6 last:pb-0">
              {!isLast && (
                <span
                  aria-hidden
                  className={`absolute left-[15px] top-8 bottom-0 w-0.5 ${i < current ? 'bg-primary' : 'bg-white/10'}`}
                />
              )}
              <span
                className={`relative z-10 w-8 h-8 shrink-0 rounded-full flex items-center justify-center border-2 transition-colors ${
                  isDone
                    ? isLast ? 'bg-secondary border-secondary text-background' : 'bg-primary border-primary text-white'
                    : isActive ? 'border-primary text-primary bg-background' : 'border-white/15 bg-background'
                }`}
              >
                {isDone ? <Check className="w-4 h-4" strokeWidth={3} /> : isActive ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              </span>
              <div className="pt-1 min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <p className={`font-semibold ${isDone ? 'text-white' : isActive ? 'text-gray-200' : 'text-gray-500'}`}>
                    {isDone ? stage.title : isActive ? `${stage.activeTitle}…` : stage.title}
                  </p>
                  {time && <span className="text-xs text-gray-500 tabular-nums shrink-0">{time}</span>}
                </div>
                {detail && <p className="text-sm text-gray-400 mt-1 leading-relaxed">{detail}</p>}
              </div>
            </li>
          );
        })}
      </ol>

      <button
        onClick={onNewReport}
        className="mt-10 w-full flex items-center justify-center gap-2 min-h-12 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 font-semibold text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <Plus className="w-4 h-4" /> Report something else
      </button>
    </div>
  );
};

export default ReportStatus;
