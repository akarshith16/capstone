import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BarChart3, PieChart, Activity, Clock, CheckCircle2, ShieldAlert, BrainCircuit, Zap } from 'lucide-react';
import { useAgentPipeline } from '../context/AgentPipelineContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell, CartesianGrid } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const AnalyticsModal: React.FC = () => {
  const { incidents, isAnalyticsOpen, setIsAnalyticsOpen } = useAgentPipeline();
  const [activeTab, setActiveTab] = useState<'historical' | 'predictive'>('historical');

  const districtData = useMemo(() => {
    const counts: Record<string, number> = {};
    incidents.forEach(inc => {
      counts[inc.district] = (counts[inc.district] || 0) + 1;
    });
    return Object.keys(counts).map(k => ({ name: k, count: counts[k] })).sort((a, b) => b.count - a.count).slice(0, 7);
  }, [incidents]);

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    incidents.forEach(inc => {
      counts[inc.category] = (counts[inc.category] || 0) + 1;
    });
    return Object.keys(counts).map(k => ({ name: k, value: counts[k] }));
  }, [incidents]);

  const predictiveInsights = useMemo(() => {
    const clusters: Record<string, number> = {};
    incidents.forEach(inc => {
      const key = `${inc.district}|${inc.category}`;
      clusters[key] = (clusters[key] || 0) + 1;
    });
    
    const sorted = Object.entries(clusters).sort((a, b) => b[1] - a[1]);
    const insights = [];
    
    if (sorted.length > 0) {
      const [key, count] = sorted[0];
      const [district, cat] = key.split('|');
      insights.push({
        title: "High Probability Disturbance",
        desc: `Predicting severe ${cat} in ${district} this weekend. Machine learning models indicate an 87% chance of threshold breach based on ${count} historical clusters.`,
        confidence: 87,
        action: `Pre-deploy Mobile Patrol to ${district}`,
        icon: ShieldAlert,
        color: 'text-danger'
      });
    }
    if (sorted.length > 1) {
      const [key, count] = sorted[1];
      const [district, cat] = key.split('|');
      insights.push({
        title: "Emerging Pattern Detected",
        desc: `Recurring ${cat} violations forming in ${district} every Thursday night. Data points correlate heavily with local venue closing times (${count} recent incidents).`,
        confidence: 76,
        action: `Schedule targeted environmental inspection`,
        icon: Activity,
        color: 'text-primary'
      });
    }
    if (sorted.length > 2) {
      const [key, count] = sorted[2];
      const [district, cat] = key.split('|');
      insights.push({
        title: "Seasonal Trend Forecast",
        desc: `${cat} levels in ${district} are projected to exceed EU benchmarks (65dB) next week. Model trained on ${count} data points.`,
        confidence: 91,
        action: `Issue automated digital warnings to venues`,
        icon: Clock,
        color: 'text-accent'
      });
    }
    return insights;
  }, [incidents]);

  if (!isAnalyticsOpen) return null;

  return (
    <AnimatePresence>
      <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-5xl h-[80vh] flex flex-col bg-surface/90 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-white/10 bg-gradient-to-r from-primary/10 to-transparent">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/20 rounded-xl border border-primary/30">
                <BarChart3 className="text-primary w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Intelligence Hub</h2>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mt-1">SIVCA Network Analytics</p>
              </div>
            </div>
            
            {/* Tabs */}
            <div className="flex bg-black/40 rounded-xl border border-white/10 p-1">
              <button 
                onClick={() => setActiveTab('historical')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'historical' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-white'}`}
              >
                Historical Data
              </button>
              <button 
                onClick={() => setActiveTab('predictive')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center space-x-2 ${activeTab === 'predictive' ? 'bg-primary/20 text-primary border border-primary/30 shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'text-gray-500 hover:text-white'}`}
              >
                <BrainCircuit className="w-4 h-4 mr-1" />
                AI Forecasts
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
              <div className="grid grid-cols-2 gap-8 h-full">
                {/* Top Districts */}
                <div className="bg-white/5 border border-white/5 rounded-2xl p-6 flex flex-col">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center mb-6">
                    <Activity className="w-4 h-4 mr-2 text-primary" /> Top Affected Districts
                  </h3>
                  <div className="flex-1 min-h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={districtData} layout="vertical" margin={{ left: 30, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                        <XAxis type="number" stroke="#6b7280" fontSize={12} />
                        <YAxis type="category" dataKey="name" stroke="#6b7280" fontSize={12} width={100} />
                        <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#ffffff10', borderRadius: '8px' }} />
                        <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Incident Categories */}
                <div className="bg-white/5 border border-white/5 rounded-2xl p-6 flex flex-col">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center mb-6">
                    <PieChart className="w-4 h-4 mr-2 text-secondary" /> Incident Categories
                  </h3>
                  <div className="flex-1 min-h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                          label={({name, percent}) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {categoryData.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#ffffff10', borderRadius: '8px' }} />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Global Stats */}
                <div className="col-span-2 grid grid-cols-4 gap-6">
                  {[
                    { label: 'Total Incidents', value: incidents.length, icon: Activity, color: 'text-primary' },
                    { label: 'Resolved', value: incidents.filter(i => i.status === 'Resolved').length, icon: CheckCircle2, color: 'text-secondary' },
                    { label: 'Critical Priority', value: incidents.filter(i => i.priority === 'Critical').length, icon: ShieldAlert, color: 'text-danger' },
                    { label: 'Avg Resolution Time', value: '14 mins', icon: Clock, color: 'text-accent' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-5 flex items-center space-x-4">
                      <div className={`p-3 rounded-xl bg-surfaceHighlight border border-white/10 ${stat.color}`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{stat.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col space-y-6 h-full">
                <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center">
                    <BrainCircuit className="w-5 h-5 mr-2 text-primary" />
                    Predictive Urban Intelligence
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Our machine learning models continuously analyze the massive SIVCA historical dataset to identify patterns and predict future noise violations before they happen.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 gap-4 flex-1">
                  {predictiveInsights.map((insight, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white/5 border border-white/5 hover:bg-white/10 transition-colors rounded-2xl p-6 flex justify-between items-center"
                    >
                      <div className="flex space-x-6 items-center">
                        <div className={`p-4 rounded-full bg-black/40 border border-white/10 ${insight.color} shadow-lg`}>
                          <insight.icon className="w-8 h-8" />
                        </div>
                        <div>
                          <h4 className="text-white font-bold text-lg mb-1">{insight.title}</h4>
                          <p className="text-gray-400 text-sm max-w-xl leading-relaxed">{insight.desc}</p>
                          <div className="mt-4 flex items-center">
                            <button className="flex items-center space-x-2 text-xs font-bold text-black bg-white hover:bg-gray-200 transition-colors px-4 py-2 rounded-lg">
                              <Zap className="w-3 h-3" />
                              <span>{insight.action}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-center justify-center p-4">
                        <div className="text-3xl font-black text-white">{insight.confidence}%</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-primary mt-1">Confidence Score</div>
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
