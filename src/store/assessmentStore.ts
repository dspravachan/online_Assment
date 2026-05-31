import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockQuestions } from '../data/mockQuestions';
import type { Question } from '../data/mockQuestions';

export type AssessmentPhase = 'setup' | 'loading' | 'active' | 'terminated' | 'submitted';

export interface SecurityLog {
  id: string;
  timestamp: string;
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

interface CodeOutput {
  status: 'idle' | 'running' | 'success' | 'failed';
  testResults: Array<{
    input: string;
    expected: string;
    actual: string;
    passed: boolean;
  }>;
  consoleLogs: string[];
  error?: string;
}

interface AssessmentState {
  // Core Assessment State
  phase: AssessmentPhase;
  startTime: number | null;
  timeLeft: number; // in seconds
  autoSaveStatus: 'idle' | 'saving' | 'saved';
  
  // Navigation & User Input
  questions: Question[];
  currentQuestionIndex: number;
  answers: Record<string, any>; // maps questionId to index (MCQ) or language code block map (Coding)
  selectedLanguage: Record<string, string>; // maps questionId to selected language ('javascript' | 'python' | 'cpp')
  markedForReview: Record<string, boolean>;
  
  // Security & Proctoring
  isFullscreen: boolean;
  fullscreenViolations: number;
  tabSwitches: number;
  strikes: number;
  securityLogs: SecurityLog[];
  isHighRisk: boolean;
  networkStability: number;
  webcamActive: boolean;
  webcamSimulatedFeed: boolean;
  
  // Code Compilation Simulation
  codeOutput: Record<string, CodeOutput>; // maps questionId to its compilation output
  
  // Actions
  setPhase: (phase: AssessmentPhase) => void;
  initializeSession: () => void;
  tickTimer: () => void;
  setCurrentQuestionIndex: (index: number) => void;
  setMCQAnswer: (questionId: string, optionIndex: number) => void;
  setCodingAnswer: (questionId: string, language: string, code: string) => void;
  setSelectedLanguage: (questionId: string, language: string) => void;
  toggleMarkedForReview: (questionId: string) => void;
  
  // Security Actions
  setFullscreen: (active: boolean) => void;
  triggerViolation: (type: string, message: string, severity: 'low' | 'medium' | 'high') => void;
  addStrike: (reason: string) => void;
  clearAssessmentData: () => void;
  
  // Compilation Actions
  runCodeSimulation: (questionId: string) => Promise<void>;
  submitAssessment: () => void;
}

const INITIAL_TIME = 45 * 60; // 45 minutes in seconds

export const useAssessmentStore = create<AssessmentState>()(
  persist(
    (set, get) => ({
      phase: 'setup',
      startTime: null,
      timeLeft: INITIAL_TIME,
      autoSaveStatus: 'idle',
      
      questions: mockQuestions,
      currentQuestionIndex: 0,
      answers: {},
      selectedLanguage: {},
      markedForReview: {},
      
      isFullscreen: false,
      fullscreenViolations: 0,
      tabSwitches: 0,
      strikes: 0,
      securityLogs: [],
      isHighRisk: false,
      networkStability: 98,
      webcamActive: false,
      webcamSimulatedFeed: true,
      
      codeOutput: {},
      
      setPhase: (phase) => set({ phase }),
      
      initializeSession: () => {
        // Populate default coding answers and languages
        const initialAnswers: Record<string, any> = {};
        const initialLanguages: Record<string, string> = {};
        
        mockQuestions.forEach(q => {
          if (q.type === 'coding' && q.initialCode) {
            initialAnswers[q.id] = { ...q.initialCode };
            initialLanguages[q.id] = 'javascript'; // Default language
          }
        });
        
        set({
          phase: 'loading',
          timeLeft: INITIAL_TIME,
          answers: initialAnswers,
          selectedLanguage: initialLanguages,
          markedForReview: {},
          fullscreenViolations: 0,
          tabSwitches: 0,
          strikes: 0,
          securityLogs: [
            {
              id: `log-init-${Date.now()}`,
              timestamp: new Date().toLocaleTimeString(),
              type: 'SYSTEM',
              message: 'Secure proctoring session initialized.',
              severity: 'low'
            }
          ],
          isHighRisk: false,
          startTime: Date.now()
        });
      },
      
      tickTimer: () => {
        const { timeLeft, phase } = get();
        if (phase !== 'active') return;
        
        if (timeLeft <= 1) {
          set({ timeLeft: 0 });
          get().submitAssessment();
        } else {
          // Simulate slight network fluctuations for realism
          const fluctuation = Math.random() > 0.8 ? (Math.random() > 0.5 ? 1 : -1) : 0;
          const nextNetwork = Math.max(90, Math.min(100, get().networkStability + fluctuation));
          
          // Auto-save notification every 60 seconds
          let nextAutoSave = get().autoSaveStatus;
          if (timeLeft % 60 === 0) {
            nextAutoSave = 'saving';
            setTimeout(() => {
              set({ autoSaveStatus: 'saved' });
              setTimeout(() => set({ autoSaveStatus: 'idle' }), 2000);
            }, 1500);
          }
          
          set({ 
            timeLeft: timeLeft - 1,
            networkStability: nextNetwork,
            autoSaveStatus: nextAutoSave
          });
        }
      },
      
      setCurrentQuestionIndex: (index) => {
        set({ currentQuestionIndex: index });
      },
      
      setMCQAnswer: (questionId, optionIndex) => {
        const { answers } = get();
        set({
          answers: {
            ...answers,
            [questionId]: optionIndex
          }
        });
      },
      
      setCodingAnswer: (questionId, language, code) => {
        const { answers } = get();
        const currentQuestionAnswers = answers[questionId] || {};
        set({
          answers: {
            ...answers,
            [questionId]: {
              ...currentQuestionAnswers,
              [language]: code
            }
          }
        });
      },
      
      setSelectedLanguage: (questionId, language) => {
        const { selectedLanguage } = get();
        set({
          selectedLanguage: {
            ...selectedLanguage,
            [questionId]: language
          }
        });
      },
      
      toggleMarkedForReview: (questionId) => {
        const { markedForReview } = get();
        set({
          markedForReview: {
            ...markedForReview,
            [questionId]: !markedForReview[questionId]
          }
        });
      },
      
      setFullscreen: (active) => {
        set({ isFullscreen: active });
      },
      
      triggerViolation: (type, message, severity) => {
        const { securityLogs, phase } = get();
        if (phase !== 'active') return;
        
        const newLog: SecurityLog = {
          id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          timestamp: new Date().toLocaleTimeString(),
          type,
          message,
          severity
        };
        
        const updatedLogs = [newLog, ...securityLogs];
        
        set({
          securityLogs: updatedLogs,
          isHighRisk: true
        });
        
        // Reset high risk visual indicator after 4 seconds
        setTimeout(() => {
          const currentLogs = get().securityLogs;
          // Check if there's any recent critical logs in the last 4 seconds
          const hasRecentHigh = currentLogs.slice(0, 3).some(l => l.severity === 'high');
          if (!hasRecentHigh) {
            set({ isHighRisk: false });
          }
        }, 4000);
      },
      
      addStrike: (reason) => {
        const { strikes } = get();
        const nextStrikes = strikes + 1;
        
        get().triggerViolation('SECURITY_STRIKE', `Strike incurred: ${reason}`, 'high');
        set({ strikes: nextStrikes });
        
        if (nextStrikes >= 3) {
          set({ 
            phase: 'terminated',
            isHighRisk: true
          });
          get().triggerViolation('SYSTEM_TERMINATED', 'Assessment forcibly terminated due to repeated proctoring violations.', 'high');
        }
      },
      
      runCodeSimulation: async (questionId) => {
        const { answers, selectedLanguage, questions, codeOutput } = get();
        const question = questions.find(q => q.id === questionId);
        if (!question || !question.testCases) return;
        
        const activeLang = selectedLanguage[questionId] || 'javascript';
        const userCode = answers[questionId]?.[activeLang] || '';
        
        set({
          codeOutput: {
            ...codeOutput,
            [questionId]: {
              status: 'running',
              testResults: [],
              consoleLogs: ['Initializing sandbox compiler...', 'Binding dynamic environment context...', 'Executing secure static analysis...']
            }
          }
        });
        
        // Simulate compilation latency
        await new Promise(resolve => setTimeout(resolve, 1800));
        
        const consoleLogs = [
          'Sandbox environment loaded successfully.',
          `Execution Environment: NodeJS / v20.10.0 (Vite Virtual Node)`,
          'Static analysis: 0 warnings, 0 syntax errors detected.',
          'Running Unit Test Cases...'
        ];
        
        // Simulate evaluation of the user's code
        // To make it look extremely realistic, we check if they actually attempted to solve the problem
        const isMockSuccess = userCode.length > 50 && 
          (userCode.includes('function') || userCode.includes('def') || userCode.includes('class')) && 
          !userCode.includes('return false') && 
          !userCode.includes('return False') && 
          !userCode.includes('return 0.0');
          
        const testResults = question.testCases.map((tc, idx) => {
          let passed = false;
          let actual = 'undefined';
          
          if (isMockSuccess) {
            passed = true;
            actual = tc.expectedOutput;
          } else {
            // First case passes sometimes, others fail to simulate a partial implementation
            passed = idx === 0 && userCode.length > 25; 
            actual = passed ? tc.expectedOutput : (questionId === 'cod-1' ? 'false' : '0.0');
          }
          
          return {
            input: tc.input,
            expected: tc.expectedOutput,
            actual: actual,
            passed: passed
          };
        });
        
        const passedCount = testResults.filter(t => t.passed).length;
        const isSuccess = passedCount === testResults.length;
        
        consoleLogs.push(`Execution completed. ${passedCount}/${testResults.length} test cases passed.`);
        
        set({
          codeOutput: {
            ...codeOutput,
            [questionId]: {
              status: isSuccess ? 'success' : 'failed',
              testResults,
              consoleLogs
            }
          }
        });
      },
      
      submitAssessment: () => {
        set({
          phase: 'submitted',
          isHighRisk: false
        });
        get().triggerViolation('SYSTEM', 'Assessment submitted successfully.', 'low');
      },
      
      clearAssessmentData: () => {
        set({
          phase: 'setup',
          timeLeft: INITIAL_TIME,
          answers: {},
          selectedLanguage: {},
          markedForReview: {},
          strikes: 0,
          fullscreenViolations: 0,
          tabSwitches: 0,
          securityLogs: [],
          isHighRisk: false,
          codeOutput: {}
        });
      }
    }),
    {
      name: 'secure-assessment-storage',
      partialize: (state) => ({
        phase: state.phase,
        startTime: state.startTime,
        timeLeft: state.timeLeft,
        currentQuestionIndex: state.currentQuestionIndex,
        answers: state.answers,
        selectedLanguage: state.selectedLanguage,
        markedForReview: state.markedForReview,
        fullscreenViolations: state.fullscreenViolations,
        tabSwitches: state.tabSwitches,
        strikes: state.strikes,
        securityLogs: state.securityLogs,
        isHighRisk: state.isHighRisk,
        codeOutput: state.codeOutput,
      }),
    }
  )
);
