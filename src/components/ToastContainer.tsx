import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useAgentPipeline } from '../context/AgentPipelineContext';
import type { Toast } from '../context/AgentPipelineContext';

const ToastIcon = ({ type }: { type: Toast['type'] }) => {
  switch (type) {
    case 'critical': return <AlertCircle className="w-5 h-5 text-danger" />;
    case 'success': return <CheckCircle2 className="w-5 h-5 text-secondary" />;
    default: return <Info className="w-5 h-5 text-primary" />;
  }
};

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useAgentPipeline();

  return (
    <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 flex flex-col space-y-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`pointer-events-auto flex items-center space-x-3 px-4 py-3 rounded-xl backdrop-blur-xl border shadow-2xl ${
              toast.type === 'critical' 
                ? 'bg-danger/10 border-danger/30 text-white shadow-[0_10px_30px_rgba(239,68,68,0.2)]'
                : toast.type === 'success'
                  ? 'bg-secondary/10 border-secondary/30 text-white shadow-[0_10px_30px_rgba(16,185,129,0.2)]'
                  : 'bg-primary/10 border-primary/30 text-white shadow-[0_10px_30px_rgba(59,130,246,0.2)]'
            }`}
          >
            <ToastIcon type={toast.type} />
            <span className="text-sm font-medium pr-4">{toast.message}</span>
            <button 
              onClick={() => removeToast(toast.id)}
              className="text-white/50 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
