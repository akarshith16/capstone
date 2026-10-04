import React from 'react';
import { useAgentPipeline } from '../context/AgentPipelineContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Activity, CheckCircle2, ShieldAlert, AlertTriangle, Shield, VolumeX, History } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const TicketModal: React.FC = () => {
  const { activeIncident, setActiveIncident, resolveIncident } = useAgentPipeline();

  if (!activeIncident) return null;

  // Generate deterministic chart data based on incident reading
  const baseDb = activeIncident.sensorVerification?.readingDb || 60;
  const chartData = Array.from({ length: 12 }, (_, i) => ({
    time: `-${(11 - i) * 5}m`,
    db: Math.max(30, Math.min(100, baseDb + (Math.sin(i) * 15) + (Math.random() * 5 - 2.5)))
  }));

  const isResolved = activeIncident.status === 'Resolved';

  return (
    <AnimatePresence>
      <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-5xl h-[85vh] flex flex-col bg-surface/90 backdrop-blur-3xl rounded-3xl border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-white/10 bg-gradient-to-r from-primary/10 to-transparent">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-2xl border shadow-lg ${isResolved ? 'bg-gray-800/50 border-gray-600/50 text-gray-400' : 'bg-primary/20 border-primary/30 text-primary shadow-primary/20'}`}>
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight flex items-center">
                  Municipal Work Order
                  {isResolved && <span className="ml-3 px-2 py-0.5 rounded text-xs bg-gray-800 text-gray-400 border border-gray-600 uppercase tracking-wider">Archived</span>}
                </h2>
                <div className="flex items-center text-xs text-gray-400 font-medium uppercase tracking-widest mt-1.5 space-x-2">
                  <span>Ref: {activeIncident.id}</span>
                  <span>•</span>
                  <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> {activeIncident.location}, {activeIncident.district}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setActiveIncident(null)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-hidden flex">
            {/* Left Column: Details & Telemetry */}
            <div className="flex-[3] p-8 overflow-y-auto custom-scrollbar border-r border-white/5 space-y-8">
              
              {/* Incident Details Card */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                  <Activity className="w-4 h-4 mr-2" /> Report Overview
                </h3>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Category</p>
                    <p className="text-white font-medium">{activeIncident.category}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Priority Assignment</p>
                    <span className={`inline-flex px-2 py-1 rounded text-xs font-bold uppercase tracking-wider border ${
                      activeIncident.priority === 'Critical' ? 'text-danger border-danger/30 bg-danger/10' :
                      activeIncident.priority === 'High' ? 'text-accent border-accent/30 bg-accent/10' :
                      'text-secondary border-secondary/30 bg-secondary/10'
                    }`}>
                      {activeIncident.priority}
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Original Citizen Report</p>
                  <p className="text-sm text-gray-300 italic leading-relaxed">"{activeIncident.description}"</p>
                </div>
              </div>

              {/* Telemetry Card */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center">
                    <VolumeX className="w-4 h-4 mr-2" /> Acoustic Telemetry
                  </h3>
                  {activeIncident.sensorVerification && (
                    <span className="text-[10px] font-mono text-primary bg-primary/10 px-2 py-1 rounded border border-primary/20">
                      Sensor: {activeIncident.sensorVerification.sensorId}
                    </span>
                  )}
                </div>
                
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis dataKey="time" stroke="#6b7280" fontSize={10} tickMargin={10} />
                      <YAxis stroke="#6b7280" fontSize={10} domain={['dataMin - 5', 'dataMax + 5']} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1E293B', borderColor: '#ffffff10', borderRadius: '12px', fontSize: '12px' }}
                        itemStyle={{ color: '#3B82F6', fontWeight: 'bold' }}
                      />
                      <ReferenceLine 
                        y={activeIncident.sensorVerification?.thresholdDb || 65} 
                        stroke="#EF4444" 
                        strokeDasharray="4 4" 
                        label={{ position: 'insideTopRight', value: 'Legal Limit', fill: '#EF4444', fontSize: 10 }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="db" 
                        stroke="#3B82F6" 
                        strokeWidth={3}
                        dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4, stroke: '#1E293B' }} 
                        activeDot={{ r: 6, fill: '#60A5FA', stroke: '#fff' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Right Column: Audit Trail & Actions */}
            <div className="flex-[2] flex flex-col bg-black/20">
              
              <div className="flex-1 p-8 overflow-y-auto custom-scrollbar border-b border-white/5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center">
                  <History className="w-4 h-4 mr-2" /> Agent Audit Trail
                </h3>
                
                <div className="relative space-y-6">
                  {/* Vertical Line */}
                  <div className="absolute top-2 bottom-2 left-[11px] w-0.5 bg-gradient-to-b from-primary/50 to-transparent"></div>
                  
                  {activeIncident.agentLogs.map((log, idx) => (
                    <div key={idx} className="relative flex items-start pl-8 group">
                      <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-surface border-2 border-primary flex items-center justify-center z-10 shadow-[0_0_10px_rgba(59,130,246,0.3)] group-hover:scale-110 transition-transform">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                      </div>
                      <div className="bg-white/5 border border-white/5 rounded-xl p-4 w-full group-hover:bg-white/10 transition-colors">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-xs font-bold text-white uppercase tracking-wider">{log.agent}</span>
                          <span className="text-[10px] text-gray-500 font-mono">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed">{log.action}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resolution Action Panel */}
              <div className="p-8 bg-surfaceHighlight/30 backdrop-blur-xl">
                {!isResolved ? (
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 text-center">
                      Escalation Action Panel
                    </h3>
                    <div className="flex flex-col space-y-3">
                      <button 
                        onClick={() => { resolveIncident(activeIncident.id, 'warning'); setActiveIncident(null); }}
                        className="group flex items-center justify-between p-4 rounded-xl border border-secondary/30 bg-secondary/10 hover:bg-secondary/20 transition-all cursor-pointer"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-secondary/20 rounded-lg text-secondary group-hover:scale-110 transition-transform"><AlertTriangle className="w-5 h-5" /></div>
                          <div className="text-left">
                            <h4 className="text-sm font-bold text-white tracking-wide">Issue Warning</h4>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">Apercibimiento verbal</p>
                          </div>
                        </div>
                      </button>

                      <button 
                        onClick={() => { resolveIncident(activeIncident.id, 'fine'); setActiveIncident(null); }}
                        className="group flex items-center justify-between p-4 rounded-xl border border-accent/30 bg-accent/10 hover:bg-accent/20 transition-all cursor-pointer"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-accent/20 rounded-lg text-accent group-hover:scale-110 transition-transform"><CheckCircle2 className="w-5 h-5" /></div>
                          <div className="text-left">
                            <h4 className="text-sm font-bold text-white tracking-wide">Administrative Fine</h4>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">Acta de Infracción (up to €3k)</p>
                          </div>
                        </div>
                      </button>

                      <button 
                        onClick={() => { resolveIncident(activeIncident.id, 'seizure'); setActiveIncident(null); }}
                        className="group flex items-center justify-between p-4 rounded-xl border border-danger/30 bg-danger/10 hover:bg-danger/20 transition-all cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.15)] hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-danger/20 rounded-lg text-danger group-hover:scale-110 transition-transform"><ShieldAlert className="w-5 h-5" /></div>
                          <div className="text-left">
                            <h4 className="text-sm font-bold text-white tracking-wide">Equipment Seizure</h4>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">Decomiso Cautelar / Shutdown</p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-300">Incident Resolved</h3>
                    <p className="text-xs text-gray-500 mt-2 uppercase tracking-widest">Case Closed & Archived</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TicketModal;
