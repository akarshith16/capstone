import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BarChart3, PieChart, Activity, Clock, BrainCircuit, Zap, Calendar, TrendingUp } from 'lucide-react';
import { useAgentPipeline } from '../context/AgentPipelineContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell, CartesianGrid, AreaChart, Area } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const AnalyticsModal: React.FC = () => {
  const { incidents, isAnalyticsOpen, setIsAnalyticsOpen } = useAgentPipeline();
  const [activeTab, setActiveTab] = useState<'historical' | 'predictive'>('predictive');

  const districtData = useMemo(() => {
    const counts: Record<string, number> = {};
    incidents.forEach(inc => {
      counts[inc.district] = (counts[inc.district] || 0) + 1;
    });
    return Object.keys(counts).map(k => ({ name: k, count: counts[k] })).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [incidents]);

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    incidents.forEach(inc => {
      counts[inc.category] = (counts[inc.category] || 0) + 1;
    });
    return Object.keys(counts).map(k => ({ name: k, value: counts[k] }));
  }, [incidents]);

  // Generate a timeline array (e.g. 30 days)
  const timelineData = useMemo(() => {
    const days: Record<string, number> = {};
    incidents.forEach(inc => {
      const d = new Date(inc.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      days[d] = (days[d] || 0) + 1;
    });
    return Object.keys(days).slice(0, 15).map(k => ({ date: k, count: days[k] })).reverse();
  }, [incidents]);

  const eventCorrelations = useMemo(() => {
    const events: Record<string, number> = {};
    incidents.forEach(inc => {
      if (inc.eventContext) {
        events[inc.eventContext] = (events[inc.eventContext] || 0) + 1;
      }
    });
    return Object.keys(events).map(k => ({ name: k, impact: events[k] })).sort((a, b) => b.impact - a.impact).slice(0, 4);
  }, [incidents]);

  const predictiveInsights = useMemo(() => {
    const insights = [];
    if (eventCorrelations.length > 0) {
      insights.push({
        title: "Event-Triggered Spike Predicted",
        desc: `High correlation detected between "${eventCorrelations[0].name}" and critical noise violations. Models forecast a 92% chance of EU benchmark breaches (65dB+) in the surrounding district.`,
        confidence: 92,
        action: `Pre-deploy 2 Mobile SIVCA Patrols`,
        icon: Calendar,
        color: 'text-danger',
        bg: 'bg-danger/10'
      });
    }
    
    if (districtData.length > 0) {
      insights.push({
        title: "Emerging Hotspot Pattern",
        desc: `Recurring acoustic anomalies forming in ${districtData[0].name}. Time-series analysis indicates peak disturbances consistently occur between 23:00 and 02:00.`,
        confidence: 84,
        action: `Schedule targeted environmental inspection`,
        icon: TrendingUp,
        color: 'text-primary',
        bg: 'bg-primary/10'
      });
    }

    insights.push({
      title: "Seasonal Trend Forecast",
      desc: `Aggregated data from 3,000+ nodes projects a 15% increase in 'Terrace Ordinance' violations over the next weekend due to weather patterns.`,
      confidence: 78,
      action: `Issue automated digital warnings to venues`,
      icon: Clock,
      color: 'text-accent',
      bg: 'bg-accent/10'
    });

    return insights;
  }, [eventCorrelations, districtData]);

  if (!isAnalyticsOpen) return null;

  return (
    <AnimatePresence>
      <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-6xl h-[85vh] flex flex-col bg-surface/95 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-[0_0_100px_rgba(59,130,246,0.15)] overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-8 py-5 border-b border-white/10 bg-black/40">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-primary/20 to-blue-600/20 rounded-2xl border border-primary/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                <BrainCircuit className="text-primary w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">Intelligence Hub</h2>
                <p className="text-xs text-primary font-bold uppercase tracking-widest mt-1 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse mr-2"></span>
                  Processing {incidents.length.toLocaleString()} Data Points
                </p>
              </div>
            </div>
            
            {/* Tabs */}
            <div className="flex bg-black/60 rounded-xl border border-white/10 p-1">
              <button 
                onClick={() => setActiveTab('predictive')}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center space-x-2 ${activeTab === 'predictive' ? 'bg-primary/20 text-primary border border-primary/30 shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'text-gray-500 hover:text-white'}`}
              >
                <Zap className="w-4 h-4 mr-1" />
                AI Forecasts
              </button>
              <button 
                onClick={() => setActiveTab('historical')}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'historical' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-white'}`}
              >
                Historical Data
              </button>
            </div>

            <button 
              onClick={() => setIsAnalyticsOpen(false)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
            
            {activeTab === 'historical' ? (
              <div className="grid grid-cols-3 gap-6 h-full">
                
                {/* Timeline Chart (Spans 2 cols) */}
                <div className="col-span-2 bg-gradient-to-b from-white/5 to-transparent border border-white/5 rounded-3xl p-6 flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center mb-6 z-10">
                    <Activity className="w-4 h-4 mr-2 text-primary" /> Incident Volume Over Time
                  </h3>
                  <div className="flex-1 min-h-[200px] z-10">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#ffffff10', borderRadius: '12px' }} />
                        <Area type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Event Correlations */}
                <div className="col-span-1 bg-white/5 border border-white/5 rounded-3xl p-6 flex flex-col">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center mb-6">
                    <Calendar className="w-4 h-4 mr-2 text-accent" /> Event Correlations
                  </h3>
                  <div className="flex-1 flex flex-col space-y-4">
                    {eventCorrelations.map((ev, i) => (
                      <div key={i} className="flex flex-col space-y-1">
                        <div className="flex justify-between items-end">
                          <span className="text-sm text-gray-200 font-medium truncate pr-2">{ev.name}</span>
                          <span className="text-xs text-accent font-bold">{ev.impact} pts</span>
                        </div>
                        <div className="w-full bg-black/50 h-2 rounded-full overflow-hidden">
                          <div className="h-full bg-accent rounded-full" style={{ width: `${(ev.impact / eventCorrelations[0].impact) * 100}%` }}></div>
                        </div>
                      </div>
                    ))}
                    {eventCorrelations.length === 0 && (
                      <p className="text-sm text-gray-500 italic mt-4 text-center">No major events correlated.</p>
                    )}
                  </div>
                </div>

                {/* Top Districts */}
                <div className="col-span-2 bg-white/5 border border-white/5 rounded-3xl p-6 flex flex-col">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center mb-6">
                    <BarChart3 className="w-4 h-4 mr-2 text-primary" /> Hotspot Districts
                  </h3>
                  <div className="flex-1 min-h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={districtData} layout="vertical" margin={{ left: 30, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" horizontal={false} />
                        <XAxis type="number" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis type="category" dataKey="name" stroke="#e5e7eb" fontSize={11} width={80} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#ffffff10', borderRadius: '12px' }} cursor={{fill: '#ffffff05'}} />
                        <Bar dataKey="count" fill="#3B82F6" radius={[0, 6, 6, 0]} barSize={16}>
                          {districtData.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Incident Categories */}
                <div className="col-span-1 bg-white/5 border border-white/5 rounded-3xl p-6 flex flex-col">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center mb-6">
                    <PieChart className="w-4 h-4 mr-2 text-secondary" /> Breakdown
                  </h3>
                  <div className="flex-1 min-h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          {categoryData.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#ffffff10', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex flex-col space-y-6 h-full max-w-4xl mx-auto">
                <div className="bg-gradient-to-r from-primary/10 via-transparent to-transparent border border-primary/20 rounded-3xl p-8 relative overflow-hidden">
                  <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-primary/5 to-transparent"></div>
                  <h3 className="text-xl font-black text-white mb-3 flex items-center">
                    <BrainCircuit className="w-6 h-6 mr-3 text-primary" />
                    Machine Learning Forecasting
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed max-w-2xl">
                    Our AI models continuously process SIVCA acoustic telemetry and cross-reference it with Madrid's public event calendars. By analyzing over {incidents.length.toLocaleString()} historical nodes, we identify recurring clusters and predict future threshold breaches before they occur.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 gap-5 flex-1">
                  {predictiveInsights.map((insight, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-black/40 border border-white/5 hover:border-white/10 hover:bg-black/60 transition-all duration-300 rounded-3xl p-6 flex justify-between items-center group relative overflow-hidden"
                    >
                      {/* Glow effect */}
                      <div className={`absolute top-0 left-0 w-1 h-full ${insight.bg} opacity-50 group-hover:opacity-100 transition-opacity`}></div>

                      <div className="flex space-x-6 items-center z-10 pl-4">
                        <div className={`p-4 rounded-2xl ${insight.bg} border border-white/5 shadow-lg`}>
                          <insight.icon className={`w-8 h-8 ${insight.color}`} />
                        </div>
                        <div>
                          <h4 className="text-white font-bold text-lg mb-1">{insight.title}</h4>
                          <p className="text-gray-400 text-sm max-w-2xl leading-relaxed">{insight.desc}</p>
                          <div className="mt-4 flex items-center">
                            <button className="flex items-center space-x-2 text-xs font-bold text-black bg-white hover:bg-gray-200 transition-colors px-5 py-2.5 rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                              <Zap className="w-4 h-4" />
                              <span>{insight.action}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-center justify-center p-6 bg-white/5 rounded-2xl border border-white/5 z-10 min-w-[140px]">
                        <div className="text-4xl font-black text-white tracking-tighter">{insight.confidence}%</div>
                        <div className={`text-[10px] font-bold uppercase tracking-widest mt-2 ${insight.color}`}>Confidence</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AnalyticsModal;
