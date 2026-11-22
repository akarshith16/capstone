import MapView from './components/MapView';
import TriageFeed from './components/TriageFeed';
import ChulapoChat from './components/ChulapoChat';
import TicketModal from './components/TicketModal';
import AnalyticsModal from './components/AnalyticsModal';
import VerificationTestModal from './components/VerificationTestModal';
import TransparencyLegend from './components/TransparencyLegend';
import ToastContainer from './components/ToastContainer';
import CitizenPortal from './components/CitizenPortal';
import { useAgentPipeline } from './context/AgentPipelineContext';
import { Shield, BarChart3, ShieldCheck, UserCheck } from 'lucide-react';

function App() {
  const {
    setIsAnalyticsOpen,
    setIsVerificationModalOpen,
    currentAppView,
    setCurrentAppView,
  } = useAgentPipeline();

  return (
    <div className="h-screen w-screen bg-background overflow-hidden relative font-sans text-white flex flex-col">
      {/* Primary Citizen Experience as the First Screen */}
      {currentAppView === 'citizen' ? (
        <div className="h-full w-full overflow-y-auto custom-scrollbar relative z-10">
          <CitizenPortal />
        </div>
      ) : (
        /* Municipal Command Center (092 Operations & Telemetry Map) */
        <div className="h-full w-full flex flex-col relative overflow-hidden">
          {/* Scope & Transparency Legend Bar */}
          <TransparencyLegend />

          <div className="flex-1 relative overflow-hidden">
            {/* Background Full-Screen Map */}
            <div className="absolute inset-0 z-0">
              <MapView />
            </div>

            {/* Floating Navbar */}
            <header className="absolute top-4 left-4 right-4 h-16 rounded-2xl border border-white/10 bg-surface/85 backdrop-blur-xl shadow-2xl flex items-center justify-between px-6 z-20">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/20 rounded-xl border border-primary/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-xl font-bold tracking-tight text-white leading-tight">
                      Chulapo Calma
                    </h1>
                    <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase rounded bg-primary/20 text-primary border border-primary/30">
                      v1.0-submission
                    </span>
                  </div>
                  <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">
                    Madrid Acoustic Operations Centre
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 sm:space-x-4">
                {/* Switch back to Citizen Portal */}
                <button
                  type="button"
                  onClick={() => setCurrentAppView('citizen')}
                  className="flex items-center space-x-1.5 text-xs font-bold text-blue-300 hover:text-white px-3 py-1.5 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 transition-all shadow-sm"
                >
                  <UserCheck className="w-4 h-4 text-blue-400" />
                  <span>Citizen Portal</span>
                </button>

                <button
                  onClick={() => setIsVerificationModalOpen(true)}
                  className="flex items-center space-x-2 text-xs font-bold text-gray-300 hover:text-white px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Appendix C Verification</span>
                </button>

                <button
                  onClick={() => setIsAnalyticsOpen(true)}
                  className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                >
                  <BarChart3 className="w-5 h-5" />
                  <span className="text-sm font-semibold">Intelligence Hub</span>
                </button>

                <div className="hidden lg:flex items-center space-x-2 bg-secondary/10 px-3 py-1.5 rounded-full border border-secondary/20">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary"></span>
                  </span>
                  <span className="text-xs text-secondary font-medium tracking-wide">
                    Active SIVCA Network (31 Fixed + 17 Mobile Units)
                  </span>
                </div>

                <div className="h-9 w-9 rounded-full bg-surfaceHighlight border border-white/10 flex items-center justify-center text-xs font-bold text-gray-300 cursor-pointer hover:bg-white/10 transition-colors">
                  092
                </div>
              </div>
            </header>

            {/* Floating Triage Sidebar */}
            <div className="absolute top-24 left-4 bottom-4 z-10 pointer-events-none">
              <div className="pointer-events-auto h-full">
                <TriageFeed />
              </div>
            </div>

            {/* Floating Chat Widget */}
            <div className="absolute bottom-6 right-6 z-30">
              <ChulapoChat />
            </div>
          </div>
        </div>
      )}

      {/* Global Modals & Overlays available in all perspectives */}
      <ToastContainer />
      <TicketModal />
      <AnalyticsModal />
      <VerificationTestModal />
    </div>
  );
}

export default App;
