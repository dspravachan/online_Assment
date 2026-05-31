import React from 'react';
import { useAssessmentStore } from '../store/assessmentStore';
import type { SecurityLog } from '../store/assessmentStore';
import { ShieldAlert, AlertTriangle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SecurityLogsPanel: React.FC = () => {
  const securityLogs = useAssessmentStore(state => state.securityLogs);
  const strikes = useAssessmentStore(state => state.strikes);
  const isHighRisk = useAssessmentStore(state => state.isHighRisk);

  const getSeverityStyles = (severity: SecurityLog['severity']) => {
    switch (severity) {
      case 'high':
        return 'border-red-500/30 bg-red-950/20 text-red-400';
      case 'medium':
        return 'border-amber-500/30 bg-amber-950/20 text-amber-400';
      case 'low':
      default:
        return 'border-blue-500/20 bg-blue-950/10 text-blue-400';
    }
  };

  return (
    <div className="bg-enterprise-card border border-enterprise-border rounded-xl p-4 flex flex-col h-full select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-enterprise-border pb-3 mb-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className={`w-4 h-4 ${isHighRisk ? 'text-red-500 animate-bounce' : 'text-blue-400'}`} />
          <h3 className="text-xs font-mono font-bold text-white tracking-widest uppercase">
            PROCTOR SECURITY LEDGER
          </h3>
        </div>
        <div className={`px-2 py-0.5 rounded text-[9px] font-mono font-semibold ${
          isHighRisk 
            ? 'bg-red-950/30 border border-red-500/30 text-red-400 animate-pulse' 
            : 'bg-green-950/20 border border-green-500/20 text-green-400'
        }`}>
          {isHighRisk ? 'HIGH RISK STATE' : 'COMPLIANT'}
        </div>
      </div>

      {/* Strikes Threat Bar */}
      <div className="bg-enterprise-darker border border-enterprise-border rounded-lg p-3 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-mono text-gray-400 uppercase">Proctor Integrity Status</span>
          <span className="text-[10px] font-mono text-gray-500">{strikes}/3 Strikes</span>
        </div>
        
        {/* Strikes visual indicator */}
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => {
            const isActive = strikes >= s;
            return (
              <div 
                key={s} 
                className={`flex-1 h-2 rounded transition-all duration-300 ${
                  isActive 
                    ? 'bg-red-500 shadow-glow-red border-red-400 border' 
                    : 'bg-enterprise-border'
                }`} 
              />
            );
          })}
        </div>
        {strikes > 0 && (
          <p className="text-[9px] font-mono text-red-400 mt-2 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-red-500" />
            <span>WARNING: Exceeding 3 strikes triggers auto-termination!</span>
          </p>
        )}
      </div>

      {/* Real-time Logs List */}
      <div className="flex-1 flex flex-col min-h-0">
        <span className="text-[9px] font-mono font-bold text-gray-500 tracking-wider mb-2 uppercase block">
          SECURE PROCTOR AUDIT TRACK (LATEST FIRST)
        </span>
        
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 h-48 max-h-56">
          <AnimatePresence initial={false}>
            {securityLogs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 border border-dashed border-enterprise-border/50 rounded-lg">
                <ShieldCheck className="w-8 h-8 text-blue-500/20 mb-2" />
                <p className="text-[10px] font-mono text-gray-500 leading-normal">
                  No suspicious network or hardware anomalies detected. Workspace secure.
                </p>
              </div>
            ) : (
              securityLogs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`p-2.5 rounded-lg border text-[10px] font-mono leading-normal space-y-1 ${getSeverityStyles(log.severity)}`}
                >
                  <div className="flex justify-between items-center text-[8px] opacity-75">
                    <span className="font-bold font-mono text-white/90">[{log.type}]</span>
                    <span>{log.timestamp}</span>
                  </div>
                  <p className="text-[9.5px] leading-relaxed break-words">{log.message}</p>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
