import React, { useEffect, useState } from 'react';
import { useAssessmentStore } from '../store/assessmentStore';
import { ShieldCheck, Cpu, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LOADING_STEPS = [
  "Initializing Secure Assessment Environment...",
  "Verifying Browser Integrity & User-Agent...",
  "Synchronizing Secure Session & Tokens...",
  "Activating Webcam & Audio Monitoring Channels...",
  "Loading Aptitude & Algorithmic Modules..."
];

export const LoadingScreen: React.FC = () => {
  const setPhase = useAssessmentStore(state => state.setPhase);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);

  useEffect(() => {
    // Progress Increment Loop
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 40);

    // Step Transition Loop
    const stepInterval = setInterval(() => {
      setCurrentStepIndex(prev => {
        if (prev < LOADING_STEPS.length - 1) {
          // Add a tech console log
          const newLogs = [
            `[SYSTEM] OK: ${LOADING_STEPS[prev]}`,
            `[INIT] Boot sector sync code: 0x${Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase()}`,
            `[NET] WebSockets secure listener bind successful.`
          ];
          setConsoleLogs(curr => [...curr, ...newLogs]);
          return prev + 1;
        }
        return prev;
      });
    }, 800);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, []);

  useEffect(() => {
    if (progress === 100) {
      // Trigger fullscreen and advance to active assessment
      const enterFullscreenAndActivate = async () => {
        try {
          if (document.documentElement.requestFullscreen) {
            await document.documentElement.requestFullscreen();
          } else if ((document.documentElement as any).webkitRequestFullscreen) {
            await (document.documentElement as any).webkitRequestFullscreen();
          } else if ((document.documentElement as any).msRequestFullscreen) {
            await (document.documentElement as any).msRequestFullscreen();
          }
        } catch (err) {
          console.warn("Fullscreen permission rejected or blocked: ", err);
        } finally {
          setPhase('active');
        }
      };

      const timer = setTimeout(() => {
        enterFullscreenAndActivate();
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [progress, setPhase]);

  return (
    <div className="min-h-screen bg-enterprise-darker flex flex-col items-center justify-center p-6 text-gray-200 secure-select-none relative overflow-hidden">
      {/* Scanline Animation */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] pointer-events-none opacity-30" />
      <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-500/35 animate-scanline pointer-events-none" />

      <div className="w-full max-w-xl flex flex-col items-center relative z-10">
        {/* Core Shield Animation */}
        <motion.div
          animate={{ 
            rotateY: 360,
            boxShadow: ["0 0 15px rgba(59, 130, 246, 0.2)", "0 0 30px rgba(59, 130, 246, 0.4)", "0 0 15px rgba(59, 130, 246, 0.2)"]
          }}
          transition={{ 
            rotateY: { duration: 4, repeat: Infinity, ease: "linear" },
            boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
          className="p-5 bg-blue-900/10 border border-blue-500/40 rounded-full mb-8 relative"
        >
          <ShieldCheck className="w-12 h-12 text-blue-400" />
        </motion.div>

        {/* Loading details */}
        <h2 className="text-xl font-bold tracking-widest font-mono text-white mb-2 uppercase">
          SECURING WORKSPACE
        </h2>
        
        <div className="h-6 w-full text-center overflow-hidden mb-6">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentStepIndex}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-sm font-mono text-blue-400"
            >
              {LOADING_STEPS[currentStepIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Dynamic Custom Progress Bar */}
        <div className="w-full h-2 bg-enterprise-card border border-enterprise-border rounded-full overflow-hidden mb-6 relative shadow-inner">
          <motion.div 
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "easeOut" }}
            className="h-full bg-[linear-gradient(90deg,_#2563eb,_#60a5fa)] rounded-full shadow-glow"
          />
        </div>

        {/* Loading text percentage */}
        <div className="flex justify-between w-full font-mono text-xs text-gray-500 mb-8 px-1">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 animate-spin" />
            <span>CALIBRATING ENVIRONMENT SECURE HASH</span>
          </div>
          <span className="font-bold text-blue-400">{progress}%</span>
        </div>

        {/* Console Log Simulator */}
        <div className="w-full bg-black/50 border border-enterprise-border rounded-lg p-4 font-mono text-[10px] text-gray-500 h-32 overflow-y-auto space-y-1.5 flex flex-col justify-end text-left shadow-inner">
          <div className="flex items-center gap-1 text-gray-400 border-b border-enterprise-border pb-1 mb-1 font-bold">
            <Terminal className="w-3 h-3 text-blue-500" />
            <span>SECURE SYSTEM LOGS</span>
          </div>
          <div className="overflow-y-auto max-h-24 space-y-1">
            {consoleLogs.slice(-6).map((log, idx) => (
              <div key={idx} className="truncate">
                <span className="text-blue-500/70">► </span>
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
