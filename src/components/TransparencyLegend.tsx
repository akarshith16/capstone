import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Layers,
  Radio,
  Info,
  PlayCircle,
} from 'lucide-react';
import { useAgentPipeline } from '../context/AgentPipelineContext';
import type { VerificationDataMode } from '../data/mockData';

const TransparencyLegend: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    verificationMode,
    setVerificationMode,
    simulatedSpikeDb,
    setSimulatedSpikeDb,
    setIsVerificationModalOpen,
  } = useAgentPipeline();

  return (
    <div className="w-full bg-black/60 backdrop-blur-xl border-b border-white/10 text-white z-30">
      {/* Top Bar / Quick Controls */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between text-xs">
        {/* Left: Legend Pills */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-1.5 font-bold tracking-wide uppercase text-[11px] text-gray-300 hover:text-white transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-primary" />
            <span>Prototype Scope & Transparency Legend</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
          </button>

          <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            [REAL] Local Production
          </span>
          <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            [SIMULATED] Simulated
          </span>
          <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            [PLANNED] IBM watsonx
          </span>
        </div>

        {/* Right: Verification Mode Selector & Test Suite Launcher */}
        <div className="flex items-center space-x-3">
          {/* Data Mode Dropdown / Selector */}
          <div className="flex items-center space-x-1.5 bg-surfaceHighlight/60 px-2 py-1 rounded-xl border border-white/10">
            <Radio className="w-3 h-3 text-primary animate-pulse" />
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider hidden md:inline">
              Sentinel Mode:
            </span>
            <select
              value={verificationMode}
              onChange={(e) => setVerificationMode(e.target.value as VerificationDataMode)}
              className="bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="historical" className="bg-gray-900 text-white">
                Historical Open Data (Real SIVCA Record)
              </option>
              <option value="simulated_spike" className="bg-gray-900 text-white">
                Simulated Night Spike [SIMULATED]
              </option>
              <option value="out_of_range" className="bg-gray-900 text-white">
                No Sensor Coverage / &gt;500m Out-of-Range [FALLBACK]
              </option>
            </select>
          </div>

          {/* Slider for Simulated Spike if active */}
          {verificationMode === 'simulated_spike' && (
            <div className="flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 px-2 py-1 rounded-xl">
              <span className="text-[10px] font-mono font-bold text-amber-300">
                {simulatedSpikeDb.toFixed(0)} dBA
              </span>
              <input
                type="range"
                min="60"
                max="95"
                step="1"
                value={simulatedSpikeDb}
                onChange={(e) => setSimulatedSpikeDb(Number(e.target.value))}
                className="w-16 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>
          )}

          {/* Verification Test Runner Button */}
          <button
            type="button"
            onClick={() => setIsVerificationModalOpen(true)}
            className="flex items-center space-x-1.5 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/40 px-2.5 py-1 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>Test Suite (Appendix C)</span>
          </button>
        </div>
      </div>

      {/* Expandable Transparency Drawer */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-white/10 bg-black/80 px-6 py-4"
          >
            <div className="max-w-7xl mx-auto space-y-4">
              {/* Notice Banner */}
              <div className="flex items-start space-x-2 text-xs text-gray-300 bg-white/5 p-3 rounded-xl border border-white/5">
                <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p>
                    <strong>Madrid Open Data Cadence:</strong> The official portal{' '}
                    <code className="text-primary font-mono">datos.madrid.es</code> publishes post-period validated aggregates
                    (Day 07:00–19:00, Evening 19:00–23:00, Night 23:00–07:00), not real-time streaming feeds.
                  </p>
                  <p className="text-[11px] text-gray-400">
                    <strong>Legal Framework Notice:</strong> 55 dBA under EU Directive 2002/49/EC is an urban strategic planning indicator,
                    not a direct sanction limit. Legal noise infractions are defined exclusively under Spain's Law 37/2003 and
                    Madrid's OPCAT via certified in-person sonometric measurements by Policía Municipal or Environmental Inspectors.
                  </p>
                </div>
              </div>

              {/* Three Column Scope Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* REAL */}
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      [REAL]
                    </span>
                    <h4 className="font-bold text-white">Engineering & Operational Pipeline</h4>
                  </div>
                  <ul className="space-y-1 text-gray-300 text-[11px] list-disc list-inside">
                    <li>Gemini 1.5 Flash structured entity extraction (district, street, category).</li>
                    <li>Haversine geodesic distance calculation (in meters) to all 31 real SIVCA stations.</li>
                    <li>Direct query to official historical Ln (23–07 h) records from datos.madrid.es.</li>
                    <li>Spatial-temporal duplicate clustering in a 20-min rolling window.</li>
                    <li>Asymmetric scoring: sensor telemetry raises priority, never lowers it.</li>
                    <li>Mandatory human officer sign-off with justification logging and elapsed time tracking.</li>
                  </ul>
                </div>

                {/* SIMULATED */}
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      [SIMULATED]
                    </span>
                    <h4 className="font-bold text-white">Demonstration Environment</h4>
                  </div>
                  <ul className="space-y-1 text-gray-300 text-[11px] list-disc list-inside">
                    <li>Contextual night spike slider control [SIMULATED].</li>
                    <li>Timed state transitions (New ➔ Verifying ➔ Prioritizing ➔ Routed).</li>
                    <li>Simulated dispatch routing to Policía Municipal (092) and Inspectors.</li>
                    <li>Closed-loop resident notification returned inside citizen chat on resolution.</li>
                  </ul>
                </div>

                {/* PLANNED */}
                <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      [PLANNED]
                    </span>
                    <h4 className="font-bold text-white">IBM watsonx Enterprise Stack</h4>
                  </div>
                  <ul className="space-y-1 text-gray-300 text-[11px] list-disc list-inside">
                    <li>watsonx.data: Acoustic lakehouse with continuous Madrid telemetry ingestion.</li>
                    <li>watsonx.governance: Model drift tracking and EU AI Act regulatory audit trails.</li>
                    <li>watsonx Orchestrate: Direct bi-directional bridge into 092 CAD dispatch consoles.</li>
                    <li>Official Cl@ve e-ID citizen authentication for binding administrative sanction filings.</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TransparencyLegend;
