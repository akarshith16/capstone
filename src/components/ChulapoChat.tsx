import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, LocateFixed, Activity, Cpu, ShieldAlert, CheckCircle, X, Sparkles } from 'lucide-react';
import { useAgentPipeline } from '../context/AgentPipelineContext';

const pipelineSteps = [
  { agent: 'Chulapo', icon: Bot, label: 'NLP Parsing', color: 'text-primary' },
  { agent: 'Sentinel', icon: Activity, label: 'Sensor Validation', color: 'text-secondary' },
  { agent: 'Decider', icon: Cpu, label: 'Priority Scoring', color: 'text-accent' },
  { agent: 'Coordinator', icon: ShieldAlert, label: 'Routing', color: 'text-danger' },
];

const ChulapoChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [reportText, setReportText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const { submitReport, citizenFeedback, setCitizenFeedback } = useAgentPipeline();

  React.useEffect(() => {
    if (citizenFeedback) {
      setIsOpen(true);
    }
  }, [citizenFeedback]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportText.trim()) return;

    setIsSubmitting(true);
    setActiveStep(0);

    const stepDuration = 2000;
    
    setTimeout(() => setActiveStep(1), stepDuration); // Sentinel
    setTimeout(() => setActiveStep(2), stepDuration * 2); // Decider
    setTimeout(() => setActiveStep(3), stepDuration * 3); // Coordinator
    
    setTimeout(() => {
      submitReport(
        reportText, 
        'Current Location (Centro)', 
        [40.4180, -3.7045], 
        'Centro'
      );
      setReportText('');
      setIsSubmitting(false);
      setActiveStep(-1);
      setIsOpen(false);
    }, stepDuration * 4);
  };

  return (
    <div className="flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[450px] bg-surface/80 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Chat Header */}
            <div className="flex justify-between items-center p-5 bg-gradient-to-r from-primary/10 to-transparent border-b border-white/5">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20">
                    <Bot className="text-white w-5 h-5" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary border border-surfaceHighlight"></span>
                  </span>
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm tracking-wide">Chulapo AI</h3>
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest flex items-center">
                    <Sparkles className="w-3 h-3 mr-1 text-primary" /> Active Municipal Agent
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  if (!isSubmitting) setIsOpen(false);
                  setCitizenFeedback(null);
                }}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="p-5">
              <div className="bg-white/5 rounded-2xl p-4 mb-4 border border-white/5 inline-block rounded-tl-sm">
                <p className="text-sm text-gray-200 leading-relaxed">
                  Hola. Describe the noise issue, and I'll route it through the urban sensor network instantly.
                </p>
              </div>

              {citizenFeedback && (
                <div className="bg-primary/20 rounded-2xl p-4 mb-4 border border-primary/30 inline-block rounded-tl-sm shadow-[0_0_15px_rgba(59,130,246,0.2)] w-full">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-200 leading-relaxed font-medium">
                      {citizenFeedback}
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <textarea
                    value={reportText}
                    onChange={(e) => setReportText(e.target.value)}
                    placeholder="E.g., 'The terrace at Plaza Mayor is playing loud music past 2 AM...'"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 min-h-[120px] resize-none custom-scrollbar transition-all"
                    disabled={isSubmitting}
                  />
                  <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
                    <button type="button" className="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-full transition-colors">
                      <LocateFixed className="w-4 h-4" />
                    </button>
                    {!isSubmitting && (
                      <button
                        type="submit"
                        disabled={!reportText.trim()}
                        className="flex items-center space-x-2 bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg"
                      >
                        <span>Send</span>
                        <Send className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Agent Pipeline Visualizer */}
                {isSubmitting && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-4 border-t border-white/5"
                  >
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest text-center mb-6">Executing Multi-Agent Loop</p>
                    <div className="flex justify-between relative px-2 mb-2">
                      <div className="absolute top-4 left-6 right-6 h-0.5 bg-white/5 -translate-y-1/2 z-0"></div>
                      
                      {pipelineSteps.map((step, idx) => {
                        const isActive = activeStep === idx;
                        const isPast = activeStep > idx;
                        const Icon = isPast ? CheckCircle : step.icon;
                        
                        return (
                          <div key={idx} className="relative z-10 flex flex-col items-center space-y-3 w-16">
                            <motion.div 
                              animate={{
                                scale: isActive ? [1, 1.2, 1] : 1,
                                borderColor: isActive ? 'rgba(59,130,246,0.5)' : (isPast ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255,255,255,0.05)'),
                                backgroundColor: isActive ? 'rgba(11,15,25,1)' : (isPast ? 'rgba(16, 185, 129, 0.1)' : 'rgba(21,28,44,1)')
                              }}
                              transition={{ repeat: isActive ? Infinity : 0, duration: 1.5 }}
                              className={`w-8 h-8 rounded-full flex items-center justify-center border ${isActive ? 'shadow-[0_0_15px_rgba(59,130,246,0.4)]' : ''}`}
                            >
                              <Icon className={`w-3.5 h-3.5 ${isActive ? step.color : (isPast ? 'text-secondary' : 'text-gray-600')}`} />
                            </motion.div>
                            <span className={`text-[9px] font-bold uppercase tracking-wider text-center ${isActive ? 'text-white' : 'text-gray-600'}`}>{step.agent}</span>
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-blue-700 shadow-[0_10px_30px_rgba(59,130,246,0.4)] border border-white/20 text-white"
        >
          <Bot className="w-7 h-7" />
        </motion.button>
      )}
    </div>
  );
};

export default ChulapoChat;
