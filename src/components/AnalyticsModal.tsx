import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BarChart3, PieChart, Activity, Clock, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useAgentPipeline } from '../context/AgentPipelineContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell, CartesianGrid } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const AnalyticsModal: React.FC = () => {
  const { incidents, isAnalyticsOpen, setIsAnalyticsOpen } = useAgentPipeline();

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
                <h2 className="text-2xl font-bold text-white tracking-tight">Macro-Analytics</h2>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mt-1">City-wide Operational Insights</p>
              </div>
            </div>
            <button 
              onClick={() => setIsAnalyticsOpen(false)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-8 grid grid-cols-2 gap-8">
            
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
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AnalyticsModal;
