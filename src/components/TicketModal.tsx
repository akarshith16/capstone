import React, { useState, useEffect } from 'react';
import { useAgentPipeline } from '../context/AgentPipelineContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MapPin,
  Activity,
  CheckCircle2,
  ShieldAlert,
  Shield,
  VolumeX,
  History,
  Scale,
  Users,
  Clock,
  Layers,
  Edit3,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { IncidentPriority } from '../data/mockData';

const TicketModal: React.FC = () => {
  const {
    activeIncident,
    setActiveIncident,
    resolveIncident,
    officerOverrideIncident,
    officerApproveIncident,
  } = useAgentPipeline();

  const [showComparison, setShowComparison] = useState(false);
  const [isOverriding, setIsOverriding] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<IncidentPriority>('Critical');
  const [overrideReason, setOverrideReason] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    setElapsedSeconds(0);
    setIsOverriding(false);
    setOverrideReason('');
    if (!activeIncident) return;

    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [activeIncident?.id]);

  if (!activeIncident) return null;

  // Deterministic chart points derived from actual observed/historical decibels (no Math.random)
  const baseDb =
    activeIncident.sensorVerification?.observedDb ||
    activeIncident.sensorVerification?.historicalNightAvgDb ||
    60;

  const chartData = Array.from({ length: 12 }, (_, i) => {
    const wave = Math.sin((i / 11) * Math.PI * 2) * 3.5;
    return {
      time: `-${(11 - i) * 5}m`,
      db: Number((baseDb + wave).toFixed(1)),
    };
  });

  const isResolved = activeIncident.status === 'Resolved';
  const sv = activeIncident.sensorVerification;
  const review = activeIncident.officerReview;
  const cmp = activeIncident.baselineComparison;

  const handleOverrideSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideReason.trim()) return;
    officerOverrideIncident(activeIncident.id, selectedPriority, overrideReason, elapsedSeconds);
    setIsOverriding(false);
  };

  return (
    <AnimatePresence>
      <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-6xl h-[88vh] flex flex-col bg-surface/95 backdrop-blur-3xl rounded-3xl border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.85)] overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-white/10 bg-gradient-to-r from-primary/15 via-surfaceHighlight to-transparent">
            <div className="flex items-center space-x-4">
              <div
                className={`p-3 rounded-2xl border shadow-lg ${
                  isResolved
                    ? 'bg-gray-800/50 border-gray-600/50 text-gray-400'
                    : 'bg-primary/20 border-primary/30 text-primary shadow-primary/20'
                }`}
              >
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-3">
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    Expediente Municipal de Triaje
                  </h2>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-primary/20 text-primary border border-primary/30">
                    [REAL ASYMMETRIC TRIAGE]
                  </span>
                  {isResolved && (
                    <span className="px-2 py-0.5 rounded text-xs bg-gray-800 text-gray-400 border border-gray-600 uppercase tracking-wider">
                      Archivado
                    </span>
                  )}
                </div>
                <div className="flex items-center text-xs text-gray-400 font-medium uppercase tracking-widest mt-1.5 space-x-2">
                  <span>Ref: {activeIncident.id}</span>
                  <span>•</span>
                  <span className="flex items-center">
                    <MapPin className="w-3 h-3 mr-1 text-primary" /> {activeIncident.location},{' '}
                    {activeIncident.district}
                  </span>
                  <span>•</span>
                  <span className="text-gray-300">
                    {activeIncident.isAnonymous ? 'Anónimo' : 'Identificado Cl@ve'}
                  </span>
                </div>
              </div>
            </div>

            {/* View Switcher & Timer */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 text-xs text-gray-300">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>Tiempo de Revisión: {elapsedSeconds}s</span>
              </div>

              <button
                type="button"
                onClick={() => setShowComparison(!showComparison)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all border ${
                  showComparison
                    ? 'bg-primary/20 text-primary border-primary/40 shadow-sm'
                    : 'bg-white/5 text-gray-300 border-white/10 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{showComparison ? 'Vista Operativa' : 'Comparar vs. Sin Sensores'}</span>
              </button>

              <button
                onClick={() => setActiveIncident(null)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-hidden flex">
            {/* Left Column: Details, Comparison & Telemetry */}
            <div className="flex-[3] p-6 overflow-y-auto custom-scrollbar border-r border-white/5 space-y-6">
              {/* SIDE-BY-SIDE COMPARISON VIEW */}
              {showComparison && cmp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-black/50 border border-primary/30 rounded-2xl p-5 space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center space-x-2">
                      <Scale className="w-4 h-4 text-primary" />
                      <h3 className="text-xs font-bold text-white uppercase tracking-widest">
                        Evaluación Comparativa: Línea Base vs. Chulapo Calma
                      </h3>
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono">
                      Impacto de Enriquecimiento SIVCA
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Baseline */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-gray-400">
                          Línea Base: Formulario Web / 311
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-700 text-gray-300 border border-gray-600">
                          {cmp.baselinePriority}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed">{cmp.baselineContext}</p>
                      <div className="pt-2 border-t border-white/5 text-[11px] text-gray-400">
                        <span className="text-gray-500 font-medium">Derivación ciega: </span>
                        {cmp.baselineRouting}
                      </div>
                      <p className="text-[10px] text-amber-400/80 italic">
                        Riesgo: Múltiples patrullas despachadas a llamadas duplicadas no correlacionadas.
                      </p>
                    </div>

                    {/* Chulapo Calma Enriched */}
                    <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 space-y-2 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-primary">
                          Chulapo Calma: Contexto SIVCA + Clúster
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/20 text-primary border border-primary/40">
                          {activeIncident.priority}
                        </span>
                      </div>
                      <p className="text-xs text-gray-200 leading-relaxed">
                        Correlacionado con {sv?.stationName} ({sv?.distanceMeters}m). Clúster:{' '}
                        {sv?.neighbourClusterCount} avisos en ventana de 20 min.
                      </p>
                      <div className="pt-2 border-t border-primary/20 text-[11px] text-gray-300">
                        <span className="text-primary font-medium">Derivación dirigida: </span>
                        {cmp.enrichedRouting}
                      </div>
                      <p className="text-[10px] text-emerald-400 italic">
                        Ventaja: Despacho único pre-informado con lectura ambiental y mapa de proximidad.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-white/5 rounded-xl text-xs text-gray-300 border border-white/5">
                    <span className="font-semibold text-primary">Diagnóstico Diferencial: </span>
                    {cmp.enrichmentDiffSummary}
                  </div>
                </motion.div>
              )}

              {/* Incident Details Card */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                  <Activity className="w-4 h-4 mr-2 text-primary" /> Resumen de la Incidencia
                </h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Categoría</p>
                    <p className="text-white font-medium text-sm">{activeIncident.category}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Prioridad Asignada</p>
                    <span
                      className={`inline-flex px-2 py-1 rounded text-xs font-bold uppercase tracking-wider border ${
                        activeIncident.priority === 'Critical'
                          ? 'text-danger border-danger/30 bg-danger/10'
                          : activeIncident.priority === 'High'
                          ? 'text-accent border-accent/30 bg-accent/10'
                          : activeIncident.priority === 'Moderate'
                          ? 'text-secondary border-secondary/30 bg-secondary/10'
                          : 'text-gray-300 border-gray-600 bg-gray-800'
                      }`}
                    >
                      {activeIncident.priority}
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
                      Clúster Espaciotemporal (20 min)
                    </p>
                    <span className="flex items-center text-xs font-semibold text-primary">
                      <Users className="w-3.5 h-3.5 mr-1" />
                      {sv?.neighbourClusterCount || 1} avisos en la zona
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">
                    Declaración del Ciudadano ({activeIncident.reporter})
                  </p>
                  <p className="text-xs text-gray-200 italic leading-relaxed">
                    "{activeIncident.description}"
                  </p>
                </div>
              </div>

              {/* Acoustic Telemetry Card */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center">
                      <VolumeX className="w-4 h-4 mr-2 text-primary" /> Telemetría Contextual SIVCA
                    </h3>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Estación: <strong className="text-white">{sv?.stationName}</strong> ({sv?.stationId}) •
                      Distancia: <strong className="text-primary">{sv?.distanceMeters} m</strong>
                    </p>
                  </div>

                  <div className="flex flex-col items-end space-y-1">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        sv?.isOutOfRange
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {sv?.isOutOfRange
                        ? 'Candidato Flota Móvil (17 UMMA)'
                        : `Histórico Ln: ${sv?.historicalNightAvgDb} dBA`}
                    </span>
                    <span className="text-[9px] text-gray-500">
                      {sv?.recordedPeriod || 'datos.madrid.es (Agregado Mensual)'}
                    </span>
                  </div>
                </div>

                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 20, right: 30, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis dataKey="time" stroke="#6b7280" fontSize={10} tickMargin={8} />
                      <YAxis stroke="#6b7280" fontSize={10} domain={[40, 90]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0B0F19',
                          borderColor: '#ffffff15',
                          borderRadius: '12px',
                          fontSize: '11px',
                        }}
                        itemStyle={{ color: '#3B82F6', fontWeight: 'bold' }}
                      />
                      {/* EU Directive 2002/49/EC Strategic Planning Target Reference Line */}
                      <ReferenceLine
                        y={55}
                        stroke="#10B981"
                        strokeDasharray="4 4"
                        label={{
                          position: 'insideTopLeft',
                          value: 'Obj. Estratégico UE Dir 2002/49/CE (55 dBA)',
                          fill: '#10B981',
                          fontSize: 9,
                        }}
                      />
                      {/* Madrid OPCAT Night Reference Line */}
                      <ReferenceLine
                        y={sv?.opcatReferenceDb || 60}
                        stroke="#EF4444"
                        strokeDasharray="4 4"
                        label={{
                          position: 'insideTopRight',
                          value: `Referencia Nocturna OPCAT ZPAE (${sv?.opcatReferenceDb || 60} dBA)`,
                          fill: '#EF4444',
                          fontSize: 9,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="db"
                        stroke="#3B82F6"
                        strokeWidth={2.5}
                        dot={{ fill: '#3B82F6', strokeWidth: 1.5, r: 3, stroke: '#0B0F19' }}
                        activeDot={{ r: 5, fill: '#60A5FA', stroke: '#fff' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Regulatory Notice Footnote */}
                <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-[10px] text-gray-400 leading-relaxed">
                  <strong className="text-gray-300">Encuadre Jurídico (Ley 37/2003 & OPCAT): </strong>
                  Los 55 dB de la Directiva Europea 2002/49/CE constituyen un indicador de planificación ambiental,
                  no un límite sancionador individual. En Madrid, las infracciones solo pueden ser constatadas
                  fehacientemente por agentes de la Policía Municipal o Inspectores Ambientales con sonómetro tipo 1
                  calibrado in situ. La telemetría SIVCA actúa estrictamente como señal contextual de triaje.
                </div>
              </div>
            </div>

            {/* Right Column: Audit Trail & Officer Oversight Actions */}
            <div className="flex-[2] flex flex-col bg-black/25">
              {/* Audit Trail */}
              <div className="flex-1 p-6 overflow-y-auto custom-scrollbar border-b border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center">
                    <History className="w-4 h-4 mr-2 text-primary" /> Trazabilidad de Agentes
                  </h3>
                  <span className="text-[9px] font-mono text-gray-500">Auditoría Inmutable</span>
                </div>

                <div className="relative space-y-4">
                  <div className="absolute top-2 bottom-2 left-[11px] w-0.5 bg-gradient-to-b from-primary/50 via-primary/20 to-transparent"></div>

                  {activeIncident.agentLogs.map((log, idx) => (
                    <div key={idx} className="relative flex items-start pl-8 group">
                      <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-surface border-2 border-primary flex items-center justify-center z-10 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                      </div>
                      <div className="bg-white/5 border border-white/5 rounded-xl p-3 w-full">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-white uppercase tracking-wider">
                            {log.agent}
                          </span>
                          <span className="text-[10px] text-gray-500 font-mono">
                            {new Date(log.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-300 leading-relaxed">{log.action}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* HUMAN OFFICER OVERSIGHT PANEL (EU AI ACT ART. 14) */}
              <div className="p-6 bg-surfaceHighlight/40 backdrop-blur-xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center">
                    <ShieldAlert className="w-4 h-4 mr-1.5 text-primary" /> Supervisión Humana Obligatoria
                  </h3>
                  <span className="text-[9px] text-primary font-mono font-bold uppercase">
                    [EU AI Act Art. 14]
                  </span>
                </div>

                {/* If already reviewed by Officer */}
                {review ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-300 flex items-center">
                        <CheckCircle2 className="w-4 h-4 mr-1.5" />
                        Revisión de Oficial Registrada
                      </span>
                      <span className="text-[10px] font-mono text-gray-400">
                        Placa: {review.officerBadge}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300">
                      Decisión:{' '}
                      <strong className="text-white uppercase">
                        {review.decision === 'approved' ? 'Aprobado sin cambios' : 'Prioridad Modificada'}
                      </strong>{' '}
                      • Prioridad Final: <strong className="text-primary">{review.finalPriority}</strong> (en{' '}
                      {review.reviewDurationSeconds}s)
                    </p>
                    {review.overrideReason && (
                      <div className="p-2 bg-black/40 rounded text-xs text-gray-300 italic border border-white/5">
                        Motivo del oficial: "{review.overrideReason}"
                      </div>
                    )}
                  </div>
                ) : isOverriding ? (
                  /* Officer Override Form */
                  <form onSubmit={handleOverrideSubmit} className="bg-black/50 border border-white/10 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-white flex items-center">
                        <Edit3 className="w-3.5 h-3.5 mr-1 text-primary" /> Modificar Prioridad de Triaje
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsOverriding(false)}
                        className="text-[10px] text-gray-400 hover:text-white"
                      >
                        Cancelar
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5">
                      {(['Critical', 'High', 'Moderate', 'Low'] as IncidentPriority[]).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setSelectedPriority(p)}
                          className={`py-1 rounded text-[10px] font-bold uppercase transition-all ${
                            selectedPriority === p
                              ? 'bg-primary text-black'
                              : 'bg-white/5 text-gray-400 hover:text-white'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">
                        Justificación del Agente (Obligatoria)
                      </label>
                      <textarea
                        required
                        value={overrideReason}
                        onChange={(e) => setOverrideReason(e.target.value)}
                        placeholder="Ej.: 'Calle adyacente a urgencias hospitalarias / reincidencia acreditada...'"
                        className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 min-h-[60px] resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!overrideReason.trim()}
                      className="w-full py-2 bg-primary text-black font-bold text-xs rounded-lg hover:bg-blue-400 transition-colors disabled:opacity-40"
                    >
                      Confirmar Modificación y Derivar
                    </button>
                  </form>
                ) : (
                  /* Standard Officer Action Controls */
                  <div className="space-y-2">
                    <p className="text-[11px] text-gray-400">
                      El agente Decider recomienda derivar como <strong>{activeIncident.priority}</strong> a{' '}
                      <strong>{activeIncident.baselineComparison?.enrichedRouting || 'Policía Municipal'}</strong>.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => officerApproveIncident(activeIncident.id, elapsedSeconds)}
                        className="py-2.5 px-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 font-bold text-xs flex items-center justify-center space-x-1.5 transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Aprobar Recomendación</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsOverriding(true)}
                        className="py-2.5 px-3 rounded-xl bg-primary/20 border border-primary/40 text-primary hover:bg-primary/30 font-bold text-xs flex items-center justify-center space-x-1.5 transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Modificar (Override)</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Resolution Action Panel (Only if not resolved) */}
                {!isResolved ? (
                  <div className="pt-2 border-t border-white/5 space-y-2">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest block text-center">
                      Resolución Municipal en Destino (092 / Inspección)
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => {
                          resolveIncident(activeIncident.id, 'warning');
                          setActiveIncident(null);
                        }}
                        className="p-2 rounded-lg border border-secondary/30 bg-secondary/10 hover:bg-secondary/20 text-center transition-all"
                      >
                        <p className="text-[11px] font-bold text-white">Apercibimiento</p>
                        <p className="text-[9px] text-gray-400">Aviso verbal</p>
                      </button>

                      <button
                        onClick={() => {
                          resolveIncident(activeIncident.id, 'fine');
                          setActiveIncident(null);
                        }}
                        className="p-2 rounded-lg border border-accent/30 bg-accent/10 hover:bg-accent/20 text-center transition-all"
                      >
                        <p className="text-[11px] font-bold text-white">Acta Infracción</p>
                        <p className="text-[9px] text-gray-400">Sanción OPCAT</p>
                      </button>

                      <button
                        onClick={() => {
                          resolveIncident(activeIncident.id, 'seizure');
                          setActiveIncident(null);
                        }}
                        className="p-2 rounded-lg border border-danger/30 bg-danger/10 hover:bg-danger/20 text-center transition-all"
                      >
                        <p className="text-[11px] font-bold text-white">Decomiso</p>
                        <p className="text-[9px] text-gray-400">Cese cautelar</p>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-white/5 rounded-xl text-center border border-white/5">
                    <p className="text-xs text-gray-400">Expediente cerrado con resolución oficial documentada.</p>
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
