import React from 'react';
import { useAssessmentStore } from '../store/assessmentStore';
import { AlertOctagon, Maximize2, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WarningModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WarningModal: React.FC<WarningModalProps> = ({ isOpen, onClose }) => {
  const strikes = useAssessmentStore(state => state.strikes);

  const handleReEnterFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else if ((document.documentElement as any).webkitRequestFullscreen) {
        await (document.documentElement as any).webkitRequestFullscreen();
      } else if ((document.documentElement as any).msRequestFullscreen) {
        await (document.documentElement as any).msRequestFullscreen();
      }
    } catch (err) {
      console.warn("Fullscreen enter failed:", err);
    } finally {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
          {/* Intense red pulsing background overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-red-950/80 backdrop-blur-md"
          />

          {/* Warning Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="w-full max-w-lg bg-black border-2 border-red-500 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.4)] p-8 relative overflow-hidden"
          >
            {/* Glowing borders */}
            <div className="absolute inset-0 border border-red-500/50 rounded-2xl animate-pulse-red pointer-events-none" />

            {/* Warning Header */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-full animate-bounce">
                <AlertOctagon className="w-12 h-12 text-red-500" />
              </div>
              
              <h2 className="text-xl font-mono font-bold tracking-widest text-red-500 uppercase">
                SECURITY EXCLUSION WARNING
              </h2>
              
              <div className="px-4 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full flex items-center gap-1.5 font-mono">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <span className="text-xs font-bold text-red-400">STRIKE {strikes} / 3 INCURRED</span>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed font-mono max-w-sm">
                Proctoring system detected a focus out-of-bounds event (exiting locked full-screen mode or focus loss). Swapping tabs or resizing windows is strictly recorded.
              </p>

              <div className="bg-red-950/20 border border-red-500/20 rounded-lg p-3 w-full font-mono text-[10px] text-red-400 text-center leading-normal">
                <strong>CRITICAL NOTICE:</strong> Exceeding 3 strikes triggers an automatic assessment termination, instant zero scoring, and immediate admin audit locks.
              </div>

              {/* Re-enter Fullscreen Button */}
              <button
                onClick={handleReEnterFullscreen}
                className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-mono font-extrabold tracking-widest shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Maximize2 className="w-4 h-4" />
                RESTORE FULLSCREEN LOCK
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
