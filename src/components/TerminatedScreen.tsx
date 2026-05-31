import React from 'react';
import { useAssessmentStore } from '../store/assessmentStore';
import { ShieldAlert, AlertOctagon, RefreshCw, Terminal, Lock } from 'lucide-react';
import { motion } from 'framer-motion';


export const TerminatedScreen: React.FC = () => {
  const securityLogs = useAssessmentStore(state => state.securityLogs);
  const clearAssessmentData = useAssessmentStore(state => state.clearAssessmentData);

  const handleRestart = () => {
    // Allows resetting the demo state for evaluation purposes
    clearAssessmentData();
  };

  const getSystemMetadata = () => {
    return {
      timestamp: new Date().toISOString(),
      agent: navigator.userAgent,
      refId: `SEC-BREACH-${Math.floor(100000 + Math.random() * 900000)}`
    };
  };

  const metadata = getSystemMetadata();

  return (
    <div className="min-h-screen bg-[#070101] flex flex-col items-center justify-center p-6 text-gray-200 select-none relative overflow-hidden">
      {/* Intense pulsing red alarm glow backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(239,68,68,0.12)_0%,_transparent_75%)] animate-pulse-red pointer-events-none" />
      
      {/* Cybersecurity digital grid scanlines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.45)_50%)] bg-[size:100%_4px] pointer-events-none opacity-40" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-3xl bg-black/60 backdrop-blur-2xl border-2 border-red-500/40 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.25)] p-8 relative overflow-hidden z-10"
      >
        {/* Glow corners */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />

        {/* Security Header */}
        <div className="flex items-center gap-4 border-b border-red-500/20 pb-6 mb-6">
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl animate-pulse">
            <ShieldAlert className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-widest text-red-500 m-0 uppercase font-mono">
              SECURITY LOCKDOWN INITIATED
            </h1>
            <p className="text-xs text-gray-500 mt-1 font-mono">
              Reference: {metadata.refId}
            </p>
          </div>
          <div className="ml-auto bg-red-500/10 border border-red-500/20 px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-red-500" />
            <span className="text-[10px] font-mono text-red-400 font-bold tracking-wider">HARD LOCKOUT</span>
          </div>
        </div>

        {/* Alarm Banner */}
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5 mb-6 text-center space-y-2">
          <div className="flex justify-center text-red-500">
            <AlertOctagon className="w-12 h-12 animate-bounce" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-wide uppercase font-mono">
            ASSESSMENT TERMINATED DUE TO PROCTORING VIOLATIONS
          </h2>
          <p className="text-xs text-gray-400 max-w-xl mx-auto leading-relaxed">
            The workspace security engine has locked this session due to three consecutive out-of-bounds events. In accordance with anti-cheating protocols, the assessment content is locked and your log history has been compiled for administrator audit.
          </p>
        </div>

        {/* Ledger logs preview */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-gray-400 font-mono text-xs">
            <Terminal className="w-4 h-4 text-red-500" />
            <span>SECURITY ALARM AUDIT LOGS</span>
          </div>

          <div className="bg-black/55 border border-red-500/15 rounded-lg p-4 h-48 overflow-y-auto space-y-2 text-[10px] font-mono text-gray-400 text-left">
            {securityLogs.length === 0 ? (
              <div className="text-gray-600 italic">No logs recorded. System integrity audit is incomplete.</div>
            ) : (
              securityLogs.map((log) => (
                <div key={log.id} className="p-2 border-b border-red-500/5 bg-red-950/5 text-red-300 flex justify-between gap-4">
                  <div className="space-y-1">
                    <span className="font-bold text-red-400">[{log.type}]</span>
                    <p className="text-[9.5px] leading-normal">{log.message}</p>
                  </div>
                  <span className="text-gray-600 shrink-0 text-[8.5px]">{log.timestamp}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Action Button for Demo restart */}
        <div className="mt-8 flex items-center justify-between border-t border-red-500/20 pt-6">
          <div className="text-[10px] font-mono text-gray-600 leading-normal max-w-md">
            IP and hardware fingerprinted. System synchronization timestamp: {metadata.timestamp}
          </div>
          
          <button
            onClick={handleRestart}
            className="flex items-center gap-2 bg-enterprise-card-light hover:bg-enterprise-border hover:text-white border border-enterprise-border text-gray-400 text-xs px-5 py-2.5 rounded-xl font-bold tracking-wider transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            RESET DEMO ENVIRONMENT
          </button>
        </div>
      </motion.div>
    </div>
  );
};
