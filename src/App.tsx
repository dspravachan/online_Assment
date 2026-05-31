import { useEffect, useState } from 'react';
import { useAssessmentStore } from './store/assessmentStore';
import { SetupScreen } from './components/SetupScreen';
import { LoadingScreen } from './components/LoadingScreen';
import { SecureBar } from './components/SecureBar';
import { WebcamProctor } from './components/WebcamProctor';
import { QuestionNavigator } from './components/QuestionNavigator';
import { SecurityLogsPanel } from './components/SecurityLogsPanel';
import { CodingWorkspace } from './components/CodingWorkspace';
import { WarningModal } from './components/WarningModal';
import { TerminatedScreen } from './components/TerminatedScreen';
import { ResultScreen } from './components/ResultScreen';
import { SecurityToastContainer } from './components/SecurityToastContainer';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ArrowLeft, ArrowRight, Bookmark, Send, Sparkles } from 'lucide-react';


export default function App() {
  const phase = useAssessmentStore(state => state.phase);
  const questions = useAssessmentStore(state => state.questions);
  const currentIdx = useAssessmentStore(state => state.currentQuestionIndex);
  const answers = useAssessmentStore(state => state.answers);
  const markedForReview = useAssessmentStore(state => state.markedForReview);
  const isHighRisk = useAssessmentStore(state => state.isHighRisk);
  
  const tickTimer = useAssessmentStore(state => state.tickTimer);
  const setCurrentIdx = useAssessmentStore(state => state.setCurrentQuestionIndex);
  const setMCQAnswer = useAssessmentStore(state => state.setMCQAnswer);
  const toggleMarked = useAssessmentStore(state => state.toggleMarkedForReview);
  const setFullscreen = useAssessmentStore(state => state.setFullscreen);
  const triggerViolation = useAssessmentStore(state => state.triggerViolation);
  const addStrike = useAssessmentStore(state => state.addStrike);
  const submitAssessment = useAssessmentStore(state => state.submitAssessment);

  const [warningOpen, setWarningOpen] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [submittingLoader, setSubmittingLoader] = useState(false);
  const [loaderMessage, setLoaderMessage] = useState('');

  // 1. Proctoring listeners & timer tick
  useEffect(() => {
    let timerInterval: number;

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      triggerViolation(
        'RIGHT_CLICK_ATTEMPT',
        'Right click contextual action intercepted in secure canvas.',
        'medium'
      );
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      triggerViolation(
        'CLIPBOARD_SHIELD',
        'Keyboard copy action intercepted. Copying assessment context is blocked.',
        'medium'
      );
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      triggerViolation(
        'CLIPBOARD_SHIELD',
        'Keyboard paste action intercepted. Sandboxed inputs block clipboard feeds.',
        'medium'
      );
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;
      
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        triggerViolation('BROWSER_INSPECT_BLOCK', 'Developer Console invocation (F12) intercepted.', 'high');
        addStrike('Debugger tools access attempt');
        setWarningOpen(true);
      }

      // Ctrl+Shift+I / Cmd+Opt+I (Developer tools)
      if (isCtrlOrCmd && isShift && (e.key === 'I' || e.key === 'i' || e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        triggerViolation('BROWSER_INSPECT_BLOCK', 'Developer Tools inspect keyboard hotkey intercepted.', 'high');
        addStrike('Developer tools access attempt');
        setWarningOpen(true);
      }

      // Ctrl+U / Cmd+Opt+U (View Source)
      if (isCtrlOrCmd && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        triggerViolation('BROWSER_SOURCE_BLOCK', 'View Source request (Ctrl+U) intercepted.', 'high');
        addStrike('Source code access attempt');
        setWarningOpen(true);
      }

      // Ctrl+P / Cmd+P (Print)
      if (isCtrlOrCmd && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        triggerViolation('BROWSER_PRINT_BLOCK', 'Context printing command (Ctrl+P) blocked.', 'medium');
      }
    };

    // Tab Switch / Focus Loss Detection
    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerViolation(
          'TAB_FOCUS_LOST',
          'Focus deviation: User transitioned to background tab/app.',
          'high'
        );
        addStrike('Swapping active tab or window');
        setWarningOpen(true);
      }
    };

    const handleWindowBlur = () => {
      // Triggers when focus leaves the window (e.g. clicking external app)
      triggerViolation(
        'TAB_FOCUS_LOST',
        'Focus deviation: Screen focus shifted outside assessment bounds.',
        'high'
      );
      addStrike('Window lost system focus');
      setWarningOpen(true);
    };

    // Fullscreen change listener
    const handleFullscreenChange = () => {
      const isCurrentlyFull = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).msFullscreenElement
      );
      
      setFullscreen(isCurrentlyFull);
      
      if (!isCurrentlyFull) {
        triggerViolation(
          'FULLSCREEN_VIOLATION',
          'Proctor terminal exited from locked fullscreen mode.',
          'high'
        );
        addStrike('Exiting full-screen terminal');
        setWarningOpen(true);
      }
    };

    if (phase === 'active') {
      // Tick remaining time every second
      timerInterval = setInterval(() => {
        tickTimer();
      }, 1000);

      // Add listeners
      window.addEventListener('contextmenu', handleContextMenu);
      window.addEventListener('copy', handleCopy);
      window.addEventListener('paste', handlePaste);
      window.addEventListener('keydown', handleKeyDown);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('blur', handleWindowBlur);
      
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.addEventListener('msfullscreenchange', handleFullscreenChange);
    }

    return () => {
      clearInterval(timerInterval);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('copy', handleCopy);
      window.removeEventListener('paste', handlePaste);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, [phase, tickTimer, triggerViolation, addStrike, setFullscreen]);

  if (phase === 'setup') {
    return <SetupScreen />;
  }

  if (phase === 'loading') {
    return <LoadingScreen />;
  }

  if (phase === 'terminated') {
    return <TerminatedScreen />;
  }

  if (phase === 'submitted') {
    return <ResultScreen />;
  }

  // Active Workspace variables
  const currentQuestion = questions[currentIdx];
  const isFirstQuestion = currentIdx === 0;
  const isLastQuestion = currentIdx === questions.length - 1;
  const currentAnswer = answers[currentQuestion.id];
  const isMarked = markedForReview[currentQuestion.id];

  const handleNext = () => {
    if (!isLastQuestion) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstQuestion) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const triggerSubmitFlow = () => {
    setSubmitModalOpen(true);
  };

  const executeFinalSubmit = () => {
    setSubmitModalOpen(false);
    setSubmittingLoader(true);
    
    // Simulate high tech AI evaluator checks
    const evaluationMessages = [
      'Synchronizing sandboxed logs to audit registry...',
      'Compiling final algorithmic transaction payload...',
      'Evaluating semantic constraints and runtime speed...',
      'Analyzing proctoring ledger for validation tokens...',
      'Generating final certificate signatures...'
    ];

    let step = 0;
    setLoaderMessage(evaluationMessages[0]);
    
    const interval = setInterval(() => {
      step++;
      if (step < evaluationMessages.length) {
        setLoaderMessage(evaluationMessages[step]);
      } else {
        clearInterval(interval);
        setSubmittingLoader(false);
        submitAssessment();
      }
    }, 1000);
  };

  // Counting unanswered questions
  const unansweredCount = questions.length - Object.keys(answers).length;

  return (
    <div className={`min-h-screen bg-enterprise-dark flex flex-col font-sans secure-select-none relative overflow-hidden transition-all duration-300 ${
      isHighRisk ? 'ring-8 ring-red-600/40' : ''
    }`}>
      {/* Dynamic Red Pulsing screen overlay during danger alerts */}
      <AnimatePresence>
        {isHighRisk && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-red-600 pointer-events-none z-40 animate-pulse-red"
          />
        )}
      </AnimatePresence>

      {/* SECURE HEADER UTILITY BAR */}
      <SecureBar />

      {/* CENTRAL SPLIT VIEWPORT */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 bg-enterprise-dark">
        {/* Left Side: Dynamic Assessment Workspace */}
        <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-6 md:max-w-[70%]">
          
          {/* Question Details header */}
          <div className="bg-enterprise-card border border-enterprise-border rounded-xl p-5 shadow-sm space-y-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono font-bold px-2.5 py-1 bg-blue-900/10 border border-blue-500/20 text-blue-400 rounded-full">
                  {currentQuestion.category} Module
                </span>
                <span className="text-[10px] font-mono text-gray-500 font-semibold">
                  PTS: {currentQuestion.points}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  currentQuestion.difficulty === 'Easy' ? 'bg-green-950/20 border border-green-500/30 text-green-400' :
                  currentQuestion.difficulty === 'Medium' ? 'bg-amber-950/20 border border-amber-500/30 text-amber-400' :
                  'bg-red-950/20 border border-red-500/30 text-red-400'
                }`}>
                  {currentQuestion.difficulty}
                </span>
                <button
                  onClick={() => toggleMarked(currentQuestion.id)}
                  className={`p-1.5 rounded-lg border text-xs font-semibold font-mono flex items-center gap-1 cursor-pointer transition-all ${
                    isMarked 
                      ? 'bg-amber-950/25 border-amber-500/40 text-amber-400 shadow-glow-amber' 
                      : 'bg-enterprise-dark border-enterprise-border text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isMarked ? 'fill-amber-400' : ''}`} />
                  <span>{isMarked ? 'REVIEW_PINNED' : 'MARK_REVIEW'}</span>
                </button>
              </div>
            </div>

            <h2 className="text-base font-bold text-white leading-tight">
              Question {currentIdx + 1}: {currentQuestion.title}
            </h2>
          </div>

          {/* Question Body: Aptitude MCQ vs Coding Sandbox */}
          <div className="flex-1 flex flex-col min-h-0">
            {currentQuestion.type === 'mcq' ? (
              <div className="bg-enterprise-card border border-enterprise-border rounded-xl p-6 shadow-sm space-y-6 flex-1 relative overflow-hidden">
                {/* Visual Clipboard shield badge */}
                <div className="flex items-center justify-between border-b border-enterprise-border/60 pb-3 mb-1 font-mono">
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-blue-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    <span>SECURE ASSESSMENT CANVAS</span>
                  </div>
                  <div className="px-2.5 py-0.5 bg-red-950/45 border border-red-500/25 rounded text-[8px] font-extrabold text-red-400 uppercase tracking-widest flex items-center gap-1">
                    <span>🔒</span> COPY/PASTE LOCKED AREA
                  </div>
                </div>
                
                {/* Description content */}
                <div className="text-sm text-gray-300 leading-relaxed font-mono whitespace-pre-wrap">
                  {currentQuestion.description}
                </div>

                {/* Analytical Tabular Data if MCQ is data interpretation */}
                {currentQuestion.tableData && (
                  <div className="border border-enterprise-border rounded-lg overflow-hidden my-4 bg-enterprise-darker/60 shadow-inner">
                    <table className="w-full text-left font-mono text-[11px] border-collapse">
                      <thead>
                        <tr className="bg-blue-900/10 border-b border-enterprise-border text-gray-400 font-bold">
                          {currentQuestion.tableData.headers.map((h, i) => (
                            <th key={i} className="px-4 py-2.5">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-enterprise-border/50 text-gray-300">
                        {currentQuestion.tableData.rows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-blue-950/5">
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="px-4 py-2">{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Options Radio List */}
                <div className="space-y-3 pt-4">
                  <span className="text-[10px] font-mono font-bold text-gray-500 uppercase block tracking-wider">
                    CHOOSE THE CORRECT REPRESENTATION:
                  </span>
                  
                  {currentQuestion.options?.map((option, idx) => {
                    const isSelected = currentAnswer === idx;
                    
                    return (
                      <button
                        key={idx}
                        onClick={() => setMCQAnswer(currentQuestion.id, idx)}
                        className={`w-full text-left p-4 rounded-xl border flex items-start gap-4 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-950/15 border-blue-500 shadow-glow text-white'
                            : 'bg-enterprise-darker border-enterprise-border text-gray-400 hover:border-enterprise-border-light hover:text-gray-300'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border shrink-0 mt-0.5 flex items-center justify-center font-mono text-[10px] font-extrabold ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-600 text-white shadow-glow' 
                            : 'border-enterprise-border bg-enterprise-dark text-gray-500'
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span className="text-xs leading-normal font-mono">{option}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              // Renders high-fidelity Monaco Sandboxed Coding IDE
              <CodingWorkspace question={currentQuestion} />
            )}
          </div>

          {/* Bottom navigation buttons bar */}
          <div className="bg-enterprise-card border border-enterprise-border rounded-xl p-4 flex items-center justify-between shadow-sm">
            <button
              onClick={handleBack}
              disabled={isFirstQuestion}
              className={`flex items-center gap-1.5 px-4 py-2 border rounded-xl text-xs font-semibold tracking-wider font-mono transition-all ${
                isFirstQuestion
                  ? 'border-enterprise-border text-gray-600 cursor-not-allowed bg-enterprise-darker/20'
                  : 'bg-enterprise-dark border-enterprise-border text-gray-300 hover:text-white cursor-pointer hover:border-enterprise-border-light'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>PREVIOUS</span>
            </button>

            {isLastQuestion ? (
              <button
                onClick={triggerSubmitFlow}
                className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 hover:shadow-glow-green text-white text-xs px-5 py-2.5 rounded-xl font-bold tracking-widest transition-all cursor-pointer"
              >
                <span>FINALIZE ASSESSMENT</span>
                <Send className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 hover:shadow-glow text-white text-xs px-5 py-2.5 rounded-xl font-bold tracking-widest transition-all cursor-pointer font-mono"
              >
                <span>CONTINUE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>

        {/* Right Side: Proctored Telemetry panel */}
        <div className="flex-1 md:max-w-[30%] border-l border-enterprise-border p-6 flex flex-col gap-6 overflow-y-auto min-h-0 bg-enterprise-darker/35">
          {/* Simulated Webcam Feeds */}
          <WebcamProctor />

          {/* Modular Nav Grid */}
          <QuestionNavigator />

          {/* Security Logging Monitor Ledger */}
          <SecurityLogsPanel />
        </div>
      </div>

      {/* Warning Fullscreen modal */}
      <WarningModal 
        isOpen={warningOpen} 
        onClose={() => setWarningOpen(false)} 
      />

      {/* Final Submit Confirmation Modal */}
      <AnimatePresence>
        {submitModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
              onClick={() => setSubmitModalOpen(false)}
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-enterprise-card border border-enterprise-border rounded-2xl shadow-2xl p-6 relative overflow-hidden z-10"
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="text-center space-y-4">
                <div className="p-3.5 bg-blue-600/10 border border-blue-500/20 rounded-full inline-block text-blue-400">
                  <AlertCircle className="w-8 h-8" />
                </div>

                <h3 className="text-lg font-bold text-white tracking-wide uppercase font-mono">FINALIZE EXAM SUBMISSION?</h3>
                <p className="text-xs text-gray-400 font-mono leading-relaxed">
                  You are about to close your locked secure assessment node. This action will permanently freeze inputs and compile proctor logs for the evaluation registry.
                </p>

                {/* Warning about unanswered questions */}
                {unansweredCount > 0 ? (
                  <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-3 text-left font-mono text-[10px] text-amber-400 space-y-1">
                    <strong>SYSTEM DETECTED UNANSWERED TASKS:</strong>
                    <p className="leading-normal">{unansweredCount} question(s) remain unattempted or unsaved. Submitting now marks these as zero points.</p>
                  </div>
                ) : (
                  <div className="bg-green-950/20 border border-green-500/20 rounded-xl p-3 text-left font-mono text-[10px] text-green-400">
                    <strong>ALL TASKS RESOLVED:</strong> All answers and coding variables successfully synchronized onto cloud nodes.
                  </div>
                )}

                <div className="text-[10px] text-red-400 font-mono font-bold pt-2 uppercase">
                  "Final Submission Cannot Be Undone"
                </div>

                {/* Confirm actions */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => setSubmitModalOpen(false)}
                    className="py-2.5 border border-enterprise-border rounded-xl text-xs font-mono font-bold text-gray-400 hover:text-white hover:bg-enterprise-border/50 cursor-pointer"
                  >
                    RETURN_WORKSPACE
                  </button>
                  <button
                    onClick={executeFinalSubmit}
                    className="py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl text-xs font-mono font-bold tracking-wider cursor-pointer shadow-glow-green"
                  >
                    CONFIRM_SUBMIT
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI secure evaluating processing full screen animation */}
      <AnimatePresence>
        {submittingLoader && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-enterprise-darker">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.06)_0%,_transparent_75%)] pointer-events-none" />
            
            <div className="text-center space-y-6 max-w-sm flex flex-col items-center">
              <motion.div
                animate={{ 
                  scale: [1, 1.15, 1],
                  boxShadow: ["0 0 15px rgba(59,130,246,0.1)", "0 0 30px rgba(59,130,246,0.3)", "0 0 15px rgba(59,130,246,0.1)"] 
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="p-5 bg-blue-950/20 border border-blue-500/30 rounded-full text-blue-400 relative"
              >
                <Sparkles className="w-10 h-10 animate-pulse text-blue-400" />
                <div className="absolute -inset-1 border border-blue-400/40 rounded-full animate-ping pointer-events-none" />
              </motion.div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white tracking-widest font-mono uppercase">AI EVALUATING RESPONSE DATA</h3>
                
                <div className="h-6 overflow-hidden flex items-center justify-center">
                  <motion.p
                    key={loaderMessage}
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -15, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-[10px] font-mono text-blue-400 uppercase tracking-wider"
                  >
                    {loaderMessage}
                  </motion.p>
                </div>
              </div>

              <div className="w-48 h-1 bg-enterprise-card rounded-full overflow-hidden border border-enterprise-border relative shadow-inner">
                <div className="h-full bg-blue-600 animate-[pulse-cyan_1.5s_infinite] w-full" />
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
      <SecurityToastContainer />
    </div>
  );
}

