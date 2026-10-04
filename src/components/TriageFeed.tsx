import React from 'react';
import { useAgentPipeline } from '../context/AgentPipelineContext';
import type { Incident } from '../data/mockData';
import { AlertCircle, Clock, CheckCircle2, ShieldAlert, Activity, Filter, MapPin, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const getPriorityColor = (priority: Incident['priority']) => {
  switch (priority) {
    case 'Critical': return 'text-danger bg-danger/10 border-danger/20';
    case 'High': return 'text-accent bg-accent/10 border-accent/20';
    case 'Moderate': return 'text-secondary bg-secondary/10 border-secondary/20';
    case 'Low': return 'text-primary bg-primary/10 border-primary/20';
    default: return 'text-gray-400 bg-gray-800 border-gray-700';
  }
};

const getStatusIcon = (status: Incident['status']) => {
  switch (status) {
    case 'New': return <AlertCircle className="w-4 h-4 text-gray-400" />;
    case 'Verifying': return <Activity className="w-4 h-4 text-primary animate-pulse" />;
    case 'Prioritizing': return <Clock className="w-4 h-4 text-accent animate-pulse" />;
    case 'Routed': return <ShieldAlert className="w-4 h-4 text-danger" />;
    case 'Resolved': return <CheckCircle2 className="w-4 h-4 text-secondary" />;
  }
};

const MADRID_DISTRICTS = [
  'All', 'Centro', 'Arganzuela', 'Retiro', 'Salamanca', 'Chamartín', 'Tetuán', 'Chamberí', 
  'Fuencarral-El Pardo', 'Moncloa-Aravaca', 'Latina', 'Carabanchel', 'Usera', 'Puente de Vallecas', 
  'Moratalaz', 'Ciudad Lineal', 'Hortaleza', 'Villaverde', 'Villa de Vallecas', 'Vicálvaro', 
  'San Blas-Canillejas', 'Barajas'
];

const CATEGORIES = [
  'All', 'Nightlife Disturbance', 'Terrace Ordinance', 'Construction Noise', 'Traffic/Vehicles', 'Private Party', 'Pending Analysis'
];

const TriageFeed: React.FC = () => {
  const { 
    filteredIncidents, activeIncident, setActiveIncident,
    filterDistrict, setFilterDistrict, filterStatus, setFilterStatus,
    filterCategory, setFilterCategory, filterTime, setFilterTime
  } = useAgentPipeline();

  const exportToCSV = () => {
    const headers = ['ID', 'Timestamp', 'District', 'Location', 'Category', 'Priority', 'Status', 'Description'];
    const csvContent = [
      headers.join(','),
      ...filteredIncidents.map(inc => [
        inc.id,
        new Date(inc.timestamp).toISOString(),
        inc.district,
        `"${inc.location.replace(/"/g, '""')}"`,
        inc.category,
        inc.priority,
        inc.status,
        `"${inc.description.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');
  
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `viaciudad_export_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-[420px] h-full flex flex-col rounded-2xl bg-surface/70 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
      
      {/* Header & Filters */}
      <div className="p-5 border-b border-white/10 bg-gradient-to-b from-surfaceHighlight/80 to-transparent">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white">Live Feed</h2>
            <p className="text-xs text-gray-400 mt-0.5">Prioritized operations queue</p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-lg font-mono font-bold text-primary">
              {filteredIncidents.filter(i => i.status !== 'Resolved').length}
            </span>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Active</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold tracking-wider uppercase text-gray-400">
            <div className="flex items-center space-x-2">
              <Filter className="w-3.5 h-3.5" />
              <span>Triage Filters</span>
            </div>
            <button 
              onClick={exportToCSV}
              className="flex items-center space-x-1.5 text-primary hover:text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <select 
                value={filterDistrict} 
                onChange={(e) => setFilterDistrict(e.target.value)}
                className="w-full appearance-none bg-surface/50 border border-white/10 rounded-lg pl-3 pr-8 py-2 text-xs text-gray-200 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all cursor-pointer"
              >
                {MADRID_DISTRICTS.map(d => <option key={d} value={d}>{d === 'All' ? 'All Districts' : d}</option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>

            <div className="relative">
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full appearance-none bg-surface/50 border border-white/10 rounded-lg pl-3 pr-8 py-2 text-xs text-gray-200 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="New">New</option>
                <option value="Verifying">Verifying</option>
                <option value="Prioritizing">Prioritizing</option>
                <option value="Routed">Routed</option>
                <option value="Resolved">Resolved</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>

            <div className="relative">
              <select 
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full appearance-none bg-surface/50 border border-white/10 rounded-lg pl-3 pr-8 py-2 text-xs text-gray-200 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all cursor-pointer"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>

            <div className="relative">
              <select 
                value={filterTime} 
                onChange={(e) => setFilterTime(e.target.value as any)}
                className="w-full appearance-none bg-surface/50 border border-white/10 rounded-lg pl-3 pr-8 py-2 text-xs text-gray-200 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all cursor-pointer"
              >
                <option value="All">All Times</option>
                <option value="Daytime">Daytime (06-22)</option>
                <option value="Nighttime">Nighttime (22-06)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Incident List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2 relative">
        <div className="sticky top-0 left-0 right-0 h-4 bg-gradient-to-b from-surface/70 to-transparent z-10 pointer-events-none"></div>

        <AnimatePresence>
          {filteredIncidents.map((incident) => {
            const isResolved = incident.status === 'Resolved';
            const isActive = activeIncident?.id === incident.id;
            
            return (
              <motion.div
                key={incident.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => setActiveIncident(incident)}
                className={`p-4 rounded-xl cursor-pointer transition-all border group ${
                  isActive 
                    ? 'border-primary/50 bg-primary/10 shadow-[0_4px_20px_rgba(59,130,246,0.15)]' 
                    : isResolved
                      ? 'border-white/5 bg-surface/20 hover:bg-surface/40 opacity-60 hover:opacity-100'
                      : 'border-white/5 bg-surface/40 hover:bg-surfaceHighlight/80 hover:border-white/10 hover:shadow-lg'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className={`p-1.5 rounded-lg ${isActive ? 'bg-primary/20 text-primary' : 'bg-surfaceHighlight text-gray-400 group-hover:text-white'}`}>
                      {getStatusIcon(incident.status)}
                    </div>
                    <div>
                      <span className={`block text-xs font-bold tracking-wider ${isResolved ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                        {incident.id}
                      </span>
                      <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{incident.status}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${getPriorityColor(incident.priority)}`}>
                    {incident.priority}
                  </span>
                </div>
                
                <p className={`text-sm leading-relaxed mb-4 line-clamp-2 ${isResolved ? 'text-gray-500' : 'text-gray-300'}`}>
                  {incident.description}
                </p>
                
                <div className="flex justify-between items-center text-xs text-gray-500 pt-3 border-t border-white/5">
                  <div className="flex items-center space-x-1.5 max-w-[65%]">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{incident.location}</span>
                  </div>
                  <span className="font-mono text-[10px] bg-black/20 px-1.5 py-0.5 rounded">
                    {new Date(incident.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            );
          })}
          
          {filteredIncidents.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-gray-400 font-medium">No incidents found</p>
              <p className="text-xs text-gray-500 mt-1">Try adjusting your filters</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TriageFeed;
