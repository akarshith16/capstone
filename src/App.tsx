
import MapView from './components/MapView';
import TriageFeed from './components/TriageFeed';
import ChulapoChat from './components/ChulapoChat';
import TicketModal from './components/TicketModal';
import AnalyticsModal from './components/AnalyticsModal';
import ToastContainer from './components/ToastContainer';
import { useAgentPipeline } from './context/AgentPipelineContext';
import { Shield, BarChart3 } from 'lucide-react';

function App() {
  const { setIsAnalyticsOpen } = useAgentPipeline();

  return (
    <div className="h-screen w-screen bg-background overflow-hidden relative font-sans text-white">
      {/* Background Full-Screen Map */}
      <div className="absolute inset-0 z-0">
        <MapView />
      </div>

      {/* Floating Navbar */}
      <header className="absolute top-4 left-4 right-4 h-16 rounded-2xl border border-white/10 bg-surface/80 backdrop-blur-xl shadow-2xl flex items-center justify-between px-6 z-20">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/20 rounded-xl border border-primary/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white leading-tight">ViaCiudad</h1>
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Urban Operations Center</p>
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <button 
            onClick={() => setIsAnalyticsOpen(true)}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-sm font-semibold">Insights</span>
          </button>
          <div className="flex items-center space-x-2 bg-secondary/10 px-3 py-1.5 rounded-full border border-secondary/20">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary"></span>
            </span>
            <span className="text-xs text-secondary font-medium tracking-wide">AI Pipeline Active</span>
          </div>
          <div className="h-10 w-10 rounded-full bg-surfaceHighlight border border-white/10 flex items-center justify-center text-sm font-bold text-gray-300 cursor-pointer hover:bg-white/10 transition-colors">
            MC
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

      {/* Modals & Overlays */}
      <ToastContainer />
      <TicketModal />
      <AnalyticsModal />
    </div>
  );
}

export default App;
