import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CheckCircle2,
  Download,
  FileText,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { useAgentPipeline } from '../context/AgentPipelineContext';
import { runAllDeterministicTests } from '../utils/triageVerificationSuite';

const VerificationTestModal: React.FC = () => {
  const { isVerificationModalOpen, setIsVerificationModalOpen } = useAgentPipeline();
  const [suiteResult, setSuiteResult] = useState(() => runAllDeterministicTests());
  const [isRunning, setIsRunning] = useState(false);

  if (!isVerificationModalOpen) return null;

  const handleRerun = () => {
    setIsRunning(true);
    setTimeout(() => {
      setSuiteResult(runAllDeterministicTests());
      setIsRunning(false);
    }, 400);
  };

  const exportMarkdown = () => {
    let md = `# CHULAPO CALMA - DETERMINISTIC TRIAGE VERIFICATION LOG (APPENDIX C)\n`;
    md += `**Execution Timestamp:** ${suiteResult.timestamp}\n`;
    md += `**Overall Result:** ${suiteResult.passedTests}/${suiteResult.totalTests} tests passed (${
      suiteResult.allPassed ? '100% SUCCESS' : 'FAILURES DETECTED'
    })\n\n`;
    md += `---\n\n`;

    suiteResult.results.forEach((r) => {
      md += `### Test #${r.id}: ${r.title}\n`;
      md += `- **Category:** ${r.category}\n`;
      md += `- **Status:** ${r.passed ? '✓ PASSED' : '✗ FAILED'}\n`;
      md += `- **Operational Output:** ${r.actualOutput}\n`;
      md += `- **Detailed Metrics:**\n\`\`\`json\n${JSON.stringify(r.details, null, 2)}\n\`\`\`\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chulapo_calma_appendix_c_verification_${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(suiteResult, null, 2)], {
      type: 'application/json;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chulapo_calma_verification_suite_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-5xl h-[88vh] flex flex-col bg-surface/95 backdrop-blur-3xl rounded-3xl border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.9)] overflow-hidden text-white"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-white/10 bg-gradient-to-r from-primary/15 via-surfaceHighlight to-transparent">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-primary/20 rounded-2xl border border-primary/30 text-primary shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-bold tracking-tight">
                    Deterministic Verification Suite (Appendix C)
                  </h2>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {suiteResult.passedTests}/{suiteResult.totalTests} PASSED
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Reproducible validation of SIVCA distances, asymmetric fairness, and human oversight
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleRerun}
                disabled={isRunning}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
                <span>Re-run Tests</span>
              </button>

              <button
                type="button"
                onClick={exportMarkdown}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary text-xs font-bold transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Markdown</span>
              </button>

              <button
                type="button"
                onClick={exportJSON}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-xs font-semibold transition-all"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>JSON</span>
              </button>

              <button
                onClick={() => setIsVerificationModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Body: Test Cases List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
            <div className="bg-black/40 border border-white/10 rounded-2xl p-4 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>
                  All 8 assertions evaluate deterministically via local engine without external network dependencies.
                </span>
              </div>
              <span className="font-mono text-[10px] text-gray-400">
                CLI: <code>npm run test:triage</code>
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {suiteResult.results.map((test) => (
                <div
                  key={test.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    test.passed
                      ? 'bg-white/5 border-white/10 hover:border-emerald-500/30'
                      : 'bg-red-500/10 border-red-500/30'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2.5">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                          test.passed
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {test.passed ? '✓' : '✗'}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          #{test.id}: {test.title}
                        </h4>
                        <span className="text-[10px] font-mono text-primary uppercase tracking-wider">
                          {test.category}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                        test.passed
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-red-500/20 text-red-300 border-red-500/30'
                      }`}
                    >
                      {test.passed ? 'PASSED' : 'FAILED'}
                    </span>
                  </div>

                  <div className="mt-2 p-3 bg-black/40 rounded-xl border border-white/5 space-y-1 text-xs">
                    <p className="text-gray-300 leading-relaxed font-mono text-[11px]">
                      {test.actualOutput}
                    </p>
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

export default VerificationTestModal;
