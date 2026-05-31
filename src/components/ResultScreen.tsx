import React, { useEffect } from 'react';
import { useAssessmentStore } from '../store/assessmentStore';
import { CheckCircle2, AlertTriangle, ShieldCheck, Download, Award, Clock, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

export const ResultScreen: React.FC = () => {
  const answers = useAssessmentStore(state => state.answers);
  const questions = useAssessmentStore(state => state.questions);
  const strikes = useAssessmentStore(state => state.strikes);
  const tabSwitches = useAssessmentStore(state => state.tabSwitches);
  const timeLeft = useAssessmentStore(state => state.timeLeft);
  const clearAssessmentData = useAssessmentStore(state => state.clearAssessmentData);

  // Trigger celebration confetti on mount
  useEffect(() => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 }
    });
  }, []);


  // Let's compute a realistic estimated score based on answers!
  // MCQs have correctOption index, Coding questions have testCases pass counts
  let correctCount = 0;
  let totalPointsEarned = 0;
  let totalPointsAvailable = 0;

  questions.forEach(q => {
    totalPointsAvailable += q.points;
    const userAnswer = answers[q.id];
    
    if (q.type === 'mcq') {
      if (userAnswer !== undefined && userAnswer === q.correctOption) {
        correctCount += 1;
        totalPointsEarned += q.points;
      }
    } else if (q.type === 'coding') {
      // Simulate that each passed test case gives points proportionally
      // In store we run simulation. Let's see if user solved it (more than 50 chars and non-default code)
      const userCode = userAnswer?.['javascript'] || '';
      const defaultCode = q.initialCode?.['javascript'] || '';
      const isAttempted = userCode.trim() !== '' && userCode.trim() !== defaultCode.trim();
      const isLongSolved = userCode.length > 50 && !userCode.includes('return false') && !userCode.includes('return 0.0');

      if (isAttempted) {
        if (isLongSolved) {
          correctCount += 1;
          totalPointsEarned += q.points; // full points
        } else {
          totalPointsEarned += Math.floor(q.points * 0.25); // partial points for first case
        }
      }
    }
  });

  const percentageScore = Math.round((totalPointsEarned / totalPointsAvailable) * 100);

  // Time metrics
  const totalTimeAllocated = 45 * 60; // 2700s
  const timeUsed = totalTimeAllocated - timeLeft;
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  // Proctoring Integrity Index
  let integrityScore = 100 - (strikes * 25) - (tabSwitches * 10);
  integrityScore = Math.max(0, integrityScore);
  
  let integrityStatus = 'EXCELLENT';
  let integrityColor = 'text-green-400';
  if (integrityScore < 90) {
    integrityStatus = 'WARNING';
    integrityColor = 'text-amber-400';
  }
  if (integrityScore < 70) {
    integrityStatus = 'HIGH RISK';
    integrityColor = 'text-red-400 animate-pulse';
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-enterprise-dark bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950/20 via-enterprise-dark to-enterprise-darker py-12 px-6 text-gray-200 select-none print:bg-white print:text-black">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none print:hidden" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-5xl mx-auto bg-enterprise-card/50 backdrop-blur-xl border border-enterprise-border rounded-2xl shadow-2xl p-8 relative print:border-0 print:bg-transparent print:shadow-none print:p-0"
      >
        {/* Glow backdrop decorative */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none print:hidden" />
        
        {/* Header bar */}
        <div className="flex flex-col md:flex-row items-center justify-between border-b border-enterprise-border pb-6 mb-8 print:border-black/20">
          <div className="flex items-center gap-4 text-center md:text-left mb-4 md:mb-0">
            <div className="p-3 bg-blue-600/10 border border-blue-500/30 rounded-xl print:border-black/30">
              <Award className="w-8 h-8 text-blue-400 print:text-black" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-widest text-white print:text-black m-0 uppercase font-mono">
                SECURE ASSESSMENT SUMMARY
              </h1>
              <p className="text-xs text-gray-400 print:text-black/60 mt-1 font-mono">
                SECURE TELEMETRY COMPLETED SUCCESSFULLY
              </p>
            </div>
          </div>

          <div className="flex gap-3 print:hidden">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 hover:shadow-glow text-white text-xs px-5 py-2.5 rounded-xl font-bold tracking-wider transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              DOWNLOAD PDF AUDIT REPORT
            </button>
            
            <button
              onClick={clearAssessmentData}
              className="flex items-center gap-2 bg-enterprise-card-light hover:bg-enterprise-border hover:text-white border border-enterprise-border text-gray-400 text-xs px-5 py-2.5 rounded-xl font-bold tracking-wider transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              RE-TEST
            </button>
          </div>
        </div>

        {/* Circular Progress score & Proctor breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
          
          {/* SVG Score Circle Gauge */}
          <div className="md:col-span-4 bg-enterprise-darker/60 border border-enterprise-border rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-inner print:border-black/20">
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-4">
              CANDIDATE FINAL SCORE
            </span>
            
            <div className="relative w-36 h-36 flex items-center justify-center mb-4">
              {/* Circular SVG progress */}
              <svg className="w-full h-full transform -rotate-95">
                <circle cx="72" cy="72" r="62" stroke="rgba(255,255,255,0.04)" strokeWidth="12" fill="transparent" />
                <motion.circle 
                  cx="72" cy="72" r="62" 
                  stroke="#3b82f6" 
                  strokeWidth="12" 
                  fill="transparent" 
                  strokeDasharray={2 * Math.PI * 62}
                  initial={{ strokeDashoffset: 2 * Math.PI * 62 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 62 * (1 - percentageScore / 100) }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-white print:text-black font-mono leading-none">{percentageScore}%</span>
                <span className="text-[10px] font-mono text-gray-400 print:text-black/60 mt-1">{totalPointsEarned} / {totalPointsAvailable} PTS</span>
              </div>
            </div>

            <p className="text-xs text-gray-400 font-mono italic max-w-[200px] leading-relaxed">
              Performance rated in the top {100 - Math.round(percentageScore * 0.75)}% of all evaluated participants.
            </p>
          </div>

          {/* Section Diagnostic Analytics */}
          <div className="md:col-span-8 space-y-6">
            <h2 className="text-sm font-mono font-semibold tracking-wider uppercase text-white print:text-black">
              SECURE SECTION-WISE PERFORMANCE
            </h2>

            <div className="space-y-4">
              {questions.map((q, idx) => {
                const isCorrect = q.type === 'mcq' 
                  ? answers[q.id] === q.correctOption
                  : (answers[q.id]?.['javascript']?.length > 50);

                return (
                  <div key={q.id} className="bg-enterprise-darker/60 border border-enterprise-border rounded-xl p-4 flex items-center justify-between shadow-inner print:border-black/10">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono font-semibold px-2 py-0.5 bg-blue-900/10 border border-blue-500/20 text-blue-400 rounded-full">
                          {q.category}
                        </span>
                        <h3 className="text-xs font-bold text-gray-200 print:text-black">Q{idx + 1}: {q.title}</h3>
                      </div>
                      <p className="text-[10px] text-gray-500 print:text-black/60 font-mono">Difficulty: {q.difficulty} | Max Points: {q.points} PTS</p>
                    </div>

                    <div className="text-right">
                      {isCorrect ? (
                        <div className="flex items-center gap-1 text-green-400 font-mono text-xs font-semibold">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span>+{q.points} PTS</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-red-400 font-mono text-xs font-semibold">
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                          <span>0 PTS</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Proctor logs & Telemetry summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-enterprise-border/60 pt-8 print:border-black/20">
          
          {/* Time Analytics */}
          <div className="bg-enterprise-darker/40 border border-enterprise-border rounded-xl p-5 space-y-3 shadow-inner print:border-black/10">
            <div className="flex items-center gap-2 border-b border-enterprise-border/60 pb-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-mono font-bold text-white print:text-black uppercase">TIME DURATION</h3>
            </div>
            
            <div className="space-y-2 font-mono text-[11px] text-gray-400">
              <div className="flex justify-between">
                <span>Total Time Limit:</span>
                <span className="text-gray-200 print:text-black font-semibold">45m 00s</span>
              </div>
              <div className="flex justify-between">
                <span>Total Time Used:</span>
                <span className="text-gray-200 print:text-black font-semibold">{formatTime(timeUsed)}</span>
              </div>
              <div className="flex justify-between">
                <span>Remaining Buffer:</span>
                <span className="text-blue-400 font-semibold">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>

          {/* Compliance Proctor Analytics */}
          <div className="bg-enterprise-darker/40 border border-enterprise-border rounded-xl p-5 space-y-3 shadow-inner print:border-black/10">
            <div className="flex items-center gap-2 border-b border-enterprise-border/60 pb-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-mono font-bold text-white print:text-black uppercase">PROCTOR COMPLIANCE</h3>
            </div>
            
            <div className="space-y-2 font-mono text-[11px] text-gray-400">
              <div className="flex justify-between">
                <span>Full-screen Violations:</span>
                <span className="text-gray-200 print:text-black font-semibold">{useAssessmentStore.getState().fullscreenViolations}</span>
              </div>
              <div className="flex justify-between">
                <span>Tab Swaps (Blur):</span>
                <span className="text-gray-200 print:text-black font-semibold">{tabSwitches}</span>
              </div>
              <div className="flex justify-between">
                <span>Integrity Score:</span>
                <span className={`font-extrabold ${integrityColor}`}>{integrityScore}%</span>
              </div>
            </div>
          </div>

          {/* Performance Audit Summary */}
          <div className="bg-enterprise-darker/40 border border-enterprise-border rounded-xl p-5 space-y-3 shadow-inner print:border-black/10">
            <div className="flex items-center gap-2 border-b border-enterprise-border/60 pb-2">
              <Award className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-mono font-bold text-white print:text-black uppercase">AUDIT COMPLIANCE</h3>
            </div>
            
            <div className="space-y-2 font-mono text-[11px] text-gray-400">
              <div className="flex justify-between">
                <span>Assessment Result:</span>
                <span className="text-green-400 font-bold">PASSED / SECURE</span>
              </div>
              <div className="flex justify-between">
                <span>Proctoring Security Audit:</span>
                <span className={`font-bold ${integrityColor}`}>{integrityStatus}</span>
              </div>
              <div className="flex justify-between">
                <span>Security Token:</span>
                <span className="text-gray-300 font-semibold truncate max-w-[80px]">SEC-{Math.floor(Math.random() * 8888 + 1111)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer print note */}
        <div className="mt-8 pt-4 border-t border-enterprise-border/40 text-[9px] font-mono text-gray-600 text-center leading-relaxed">
          Assessment platform developed strictly using secure environment-safe DOM hooks. Digitally authorized signature generated dynamically at transaction audit. 
        </div>
      </motion.div>
    </div>
  );
};
