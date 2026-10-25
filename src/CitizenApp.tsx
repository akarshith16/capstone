import { useEffect, useState } from 'react';
import { Shield, Volume2, ChevronRight, Phone, Inbox } from 'lucide-react';
import { useAgentPipeline } from './context/AgentPipelineContext';
import ReportWizard from './components/citizen/ReportWizard';
import ReportStatus from './components/citizen/ReportStatus';
import { STATUS_LABELS } from './components/citizen/constants';
import { useMyReports } from './components/citizen/useMyReports';
import { getNoiseCategory } from './components/citizen/noiseCategories';
import type { Incident } from './data/mockData';

type View = { name: 'home' } | { name: 'report' } | { name: 'status'; reportId: string };

const timeAgo = (iso: string) => {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return new Date(iso).toLocaleDateString([], { day: 'numeric', month: 'short' });
};

const StatusPill = ({ status }: { status: Incident['status'] }) => (
  <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold border ${
    status === 'Resolved'
      ? 'text-secondary border-secondary/30 bg-secondary/10'
      : 'text-primary border-primary/30 bg-primary/10'
  }`}>
    {STATUS_LABELS[status]}
  </span>
);

// Resident-facing app, served at /report. Shares the agent pipeline with the operator
// dashboard; open both in the same browser to see reports flow between them.
function CitizenApp() {
  const { incidents } = useAgentPipeline();
  const { reports, addReport } = useMyReports(incidents);
  const [view, setView] = useState<View>({ name: 'home' });

  useEffect(() => {
    document.title = 'ViaCiudad · Report noise';
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  const activeReport = view.name === 'status' ? reports.find(r => r.id === view.reportId) : undefined;

  return (
    <div className="min-h-dvh bg-background text-white font-sans">
      <div className="mx-auto max-w-md px-4">
        <header className="h-[4.5rem] flex items-center gap-3">
          <button
            onClick={() => setView({ name: 'home' })}
            className="flex items-center gap-3 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span className="p-2 bg-primary/20 rounded-xl border border-primary/30">
              <Shield className="w-5 h-5 text-primary" />
            </span>
            <span className="text-left">
              <span className="block text-lg font-bold tracking-tight leading-tight">ViaCiudad</span>
              <span className="block text-xs text-gray-400">Madrid noise reports</span>
            </span>
          </button>
        </header>

        {view.name === 'report' && (
          <ReportWizard
            onCancel={() => setView({ name: 'home' })}
            onSubmitted={id => {
              addReport(id);
              setView({ name: 'status', reportId: id });
            }}
          />
        )}

        {view.name === 'status' && activeReport && (
          <ReportStatus
            report={activeReport}
            onBack={() => setView({ name: 'home' })}
            onNewReport={() => setView({ name: 'report' })}
          />
        )}

        {(view.name === 'home' || (view.name === 'status' && !activeReport)) && (
          <main className="pb-10">
            <section className="mt-4 rounded-3xl p-6 bg-gradient-to-br from-primary/25 via-surface to-surface border border-white/10">
              <span className="inline-flex p-3 rounded-2xl bg-primary text-white mb-5 shadow-[0_10px_30px_rgba(59,130,246,0.35)]">
                <Volume2 className="w-6 h-6" />
              </span>
              <h1 className="text-[1.75rem] font-bold tracking-tight leading-tight">Is noise keeping you up?</h1>
              <p className="mt-3 text-gray-300 leading-relaxed">
                Tell us where it's coming from. We check it against Madrid's noise sensors and send it to the team that can act.
              </p>
              <button
                onClick={() => setView({ name: 'report' })}
                className="mt-6 w-full min-h-14 rounded-2xl bg-white text-background font-bold hover:bg-gray-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Report noise
              </button>
              <p className="mt-3 text-center text-xs text-gray-400">Takes about a minute. No account needed.</p>
            </section>

            <section className="mt-10" aria-labelledby="my-reports-heading">
              <h2 id="my-reports-heading" className="text-lg font-bold mb-3">Your reports</h2>
              {reports.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/15 p-6 text-center">
                  <Inbox className="w-6 h-6 text-gray-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Reports you send from this device will show up here, with live updates.</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {reports.map(report => {
                    const category = getNoiseCategory(report.category);
                    return (
                      <li key={report.id}>
                        <button
                          onClick={() => setView({ name: 'status', reportId: report.id })}
                          className="w-full flex items-center gap-3 p-4 rounded-2xl bg-surface border border-white/10 hover:border-white/25 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          <span className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-300">
                            <category.icon className="w-5 h-5" />
                          </span>
                          <span className="flex-1 min-w-0">
                            <span className="flex items-center justify-between gap-2">
                              <span className="font-semibold truncate">{category.label}</span>
                              <StatusPill status={report.status} />
                            </span>
                            <span className="block text-sm text-gray-400 truncate mt-0.5">
                              {report.district} · {timeAgo(report.timestamp)}
                            </span>
                          </span>
                          <ChevronRight className="w-4 h-4 text-gray-500 shrink-0" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <aside className="mt-10 rounded-2xl bg-surface border border-white/10 p-4 flex gap-3">
              <Phone className="w-5 h-5 text-danger shrink-0 mt-0.5" />
              <p className="text-sm text-gray-300 leading-relaxed">
                <span className="font-semibold text-white">Someone in danger?</span> Call{' '}
                <a href="tel:112" className="font-semibold text-white underline underline-offset-2">112</a>.
                For urgent noise at night you can also call Policía Municipal on{' '}
                <a href="tel:092" className="font-semibold text-white underline underline-offset-2">092</a>.
              </p>
            </aside>
          </main>
        )}
      </div>
    </div>
  );
}

export default CitizenApp;
