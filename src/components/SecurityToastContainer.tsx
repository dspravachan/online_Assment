import React, { useEffect, useState } from 'react';
import { useAssessmentStore } from '../store/assessmentStore';
import { ShieldAlert, Ban, Eye, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ToastItem {
  id: string;
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export const SecurityToastContainer: React.FC = () => {
  const securityLogs = useAssessmentStore(state => state.securityLogs);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    if (securityLogs.length === 0) return;
    const latest = securityLogs[0];

    // Filter for actionable visual proctor violations
    const secureTypes = [
      'CLIPBOARD_SHIELD',
      'RIGHT_CLICK_ATTEMPT',
      'INPUT_PASTE_ATTEMPT',
      'INPUT_COPY_ATTEMPT',
      'BROWSER_INSPECT_BLOCK',
      'BROWSER_SOURCE_BLOCK',
      'BROWSER_PRINT_BLOCK',
      'SECURITY_STRIKE'
    ];

    if (secureTypes.includes(latest.type)) {
      // Check if this toast is already displayed to avoid double triggers
      setToasts(prev => {
        const exists = prev.some(t => t.id === latest.id);
        if (exists) return prev;
        
        // Add new toast and schedule its destruction
        const newToast: ToastItem = {
          id: latest.id,
          type: latest.type,
          message: latest.message,
          severity: latest.severity
        };

        // Remove oldest toast if there are more than 3 active
        const list = [...prev, newToast];
        if (list.length > 3) list.shift();
        return list;
      });

      // Auto fade-out after 3.5 seconds
      const timer = setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== latest.id));
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [securityLogs]);

  const getToastIcon = (type: string) => {
    switch (type) {
      case 'RIGHT_CLICK_ATTEMPT':
        return <Ban className="w-5 h-5 text-amber-400 shrink-0" />;
      case 'BROWSER_INSPECT_BLOCK':
      case 'BROWSER_SOURCE_BLOCK':
        return <KeyRound className="w-5 h-5 text-red-500 shrink-0 animate-pulse" />;
      case 'CLIPBOARD_SHIELD':
      case 'INPUT_PASTE_ATTEMPT':
      case 'INPUT_COPY_ATTEMPT':
        return <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />;
      default:
        return <Eye className="w-5 h-5 text-blue-400 shrink-0" />;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[999] flex flex-col gap-3 max-w-sm w-full pointer-events-none select-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9, transition: { duration: 0.2 } }}
            className={`p-4 rounded-xl border flex items-start gap-3 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-md ${
              t.severity === 'high'
                ? 'bg-red-950/90 border-red-500/50 shadow-red-950/20'
                : 'bg-amber-950/90 border-amber-500/50 shadow-amber-950/20'
            }`}
          >
            {getToastIcon(t.type)}
            
            <div className="flex-1 space-y-1">
              <span className="text-[10px] font-mono font-bold tracking-widest text-white/90 uppercase block">
                {t.type.replace(/_/g, ' ')}
              </span>
              <p className="text-[10.5px] font-mono text-gray-300 leading-snug">
                {t.message}
              </p>
              <div className="flex items-center gap-1.5 pt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                <span className="text-[8px] font-mono text-red-400 font-bold uppercase tracking-wider">
                  CLIPBOARD ACTIONS DISABLED
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
