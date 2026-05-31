import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { useAssessmentStore } from '../store/assessmentStore';
import type { Question } from '../data/mockQuestions';
import { Play, Terminal, CheckCircle2, XCircle, Code2, Loader2 } from 'lucide-react';


interface CodingWorkspaceProps {
  question: Question;
}

export const CodingWorkspace: React.FC<CodingWorkspaceProps> = ({ question }) => {
  const answers = useAssessmentStore(state => state.answers);
  const selectedLanguage = useAssessmentStore(state => state.selectedLanguage);
  const codeOutput = useAssessmentStore(state => state.codeOutput);
  
  const setCodingAnswer = useAssessmentStore(state => state.setCodingAnswer);
  const setSelectedLanguage = useAssessmentStore(state => state.setSelectedLanguage);
  const runCodeSimulation = useAssessmentStore(state => state.runCodeSimulation);
  const triggerViolation = useAssessmentStore(state => state.triggerViolation);

  const activeLang = selectedLanguage[question.id] || 'javascript';
  const code = answers[question.id]?.[activeLang] || '';
  const output = codeOutput[question.id] || { status: 'idle', testResults: [], consoleLogs: [] };

  const [activeTab, setActiveTab] = useState<'console' | 'tests'>('tests');

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLanguage(question.id, e.target.value);
  };

  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCodingAnswer(question.id, activeLang, value);
    }
  };

  const handleRunCode = async () => {
    await runCodeSimulation(question.id);
    setActiveTab('tests'); // automatically switch to tests to show results
  };

  // Convert Python/C++ labels for Monaco
  const getMonacoLanguage = (lang: string) => {
    if (lang === 'cpp') return 'cpp';
    if (lang === 'python') return 'python';
    return 'javascript';
  };

  // Block copy paste in the editor specifically
  const handleEditorDidMount = (editor: any, monaco: any) => {
    // Add custom keybindings or trigger violation on paste
    editor.onKeyDown((e: any) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      if (isCtrlOrCmd && e.keyCode === monaco.KeyCode.KeyV) {
        e.preventDefault();
        triggerViolation(
          'INPUT_PASTE_ATTEMPT',
          'Block paste operation detected in coding sandbox. Input intercepted.',
          'medium'
        );
      }
      if (isCtrlOrCmd && e.keyCode === monaco.KeyCode.KeyC) {
        e.preventDefault();
        triggerViolation(
          'INPUT_COPY_ATTEMPT',
          'Block copy operation detected in coding sandbox. Content shielded.',
          'medium'
        );
      }
    });
  };

  return (
    <div className="flex flex-col h-full bg-enterprise-card-light/40 border border-enterprise-border rounded-xl overflow-hidden select-none">
      {/* Editor Sub-Header bar */}
      <div className="bg-enterprise-darker/80 px-4 py-2 border-b border-enterprise-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-300">
            <Code2 className="w-4 h-4 text-blue-400" />
            <span className="font-mono">SANDBOX_IDE_V4.2</span>
          </div>
          <div className="px-2 py-0.5 bg-red-950/45 border border-red-500/25 rounded text-[8px] font-extrabold text-red-400 uppercase tracking-widest flex items-center gap-1 font-mono">
            <span>🔒</span> CLIPBOARD PROTECTED (NO COPY/PASTE)
          </div>
        </div>

        {/* Language selector & actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-gray-500 uppercase">LANGUAGE</span>
            <select
              value={activeLang}
              onChange={handleLanguageChange}
              className="bg-enterprise-dark border border-enterprise-border text-gray-300 text-xs rounded px-2.5 py-1 focus:outline-none focus:border-blue-500/50 cursor-pointer font-mono"
            >
              <option value="javascript">JavaScript (NodeJS)</option>
              <option value="python">Python (v3.11)</option>
              <option value="cpp">C++ (GCC 17)</option>
            </select>
          </div>

          <button
            onClick={handleRunCode}
            disabled={output.status === 'running'}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-enterprise-border disabled:text-gray-500 disabled:shadow-none hover:shadow-glow text-white text-xs px-3.5 py-1.5 rounded font-semibold tracking-wider transition-all cursor-pointer"
          >
            {output.status === 'running' ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>COMPILING...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>RUN CODE</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor Body Split */}
      <div className="flex-1 min-h-[350px] relative">
        <Editor
          height="100%"
          language={getMonacoLanguage(activeLang)}
          theme="vs-dark"
          value={code}
          onChange={handleCodeChange}
          onMount={handleEditorDidMount}
          options={{
            fontSize: 13,
            fontFamily: "'Fira Code', monospace",
            minimap: { enabled: false },
            automaticLayout: true,
            scrollBeyondLastLine: false,
            padding: { top: 12, bottom: 12 },
            lineHeight: 20,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            scrollbar: {
              vertical: 'visible',
              horizontal: 'visible',
              verticalScrollbarSize: 6,
              horizontalScrollbarSize: 6,
            },
            contextmenu: false, // disable monaco context menu
          }}
          loading={
            <div className="absolute inset-0 bg-enterprise-dark/95 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">LOADING SECURE IDE CORE...</span>
            </div>
          }
        />
      </div>

      {/* Compiler Output & Terminal section */}
      <div className="h-64 border-t border-enterprise-border bg-enterprise-darker flex flex-col min-h-0">
        {/* Terminal Header */}
        <div className="bg-black/45 border-b border-enterprise-border px-4 flex justify-between items-center text-xs">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('tests')}
              className={`py-2 px-3 border-b-2 font-mono font-bold tracking-wide transition-all ${
                activeTab === 'tests' 
                  ? 'border-blue-500 text-blue-400 bg-blue-500/[0.02]' 
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              UNIT TEST CASES
            </button>
            <button
              onClick={() => setActiveTab('console')}
              className={`py-2 px-3 border-b-2 font-mono font-bold tracking-wide transition-all ${
                activeTab === 'console' 
                  ? 'border-blue-500 text-blue-400 bg-blue-500/[0.02]' 
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              COMPILATION TERMINAL
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-gray-500 font-mono text-[10px]">
            <Terminal className="w-3.5 h-3.5" />
            <span>SANDBOX_OUTPUT_STREAM</span>
          </div>
        </div>

        {/* Terminal Content Box */}
        <div className="flex-1 overflow-y-auto p-4 font-mono text-xs text-gray-300">
          {/* Active Tab: Console compilation logs */}
          {activeTab === 'console' && (
            <div className="space-y-1 text-gray-400 text-[11px]">
              {output.status === 'idle' ? (
                <div className="text-gray-600 italic">No compile logs recorded. Press "Run Code" to compile.</div>
              ) : (
                output.consoleLogs.map((log, i) => (
                  <div key={i} className={`${log.includes('Failed') || log.includes('error') ? 'text-red-400' : 'text-gray-400'}`}>
                    <span className="text-blue-500/50">[$]</span> {log}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Active Tab: Unit Test Cases */}
          {activeTab === 'tests' && (
            <div className="space-y-3">
              {output.status === 'idle' && (
                <div className="text-gray-600 italic">Sandbox compiles unit checks automatically. Press "Run Code" to start validation checks.</div>
              )}

              {output.status === 'running' && (
                <div className="flex flex-col items-center justify-center h-full py-8 text-center space-y-2">
                  <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                  <span className="text-xs text-gray-500 uppercase tracking-widest animate-pulse">Compiling modules & generating assertion test suite...</span>
                </div>
              )}

              {output.status !== 'idle' && output.status !== 'running' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {output.testResults.map((tr, idx) => (
                    <div 
                      key={idx} 
                      className={`p-3 rounded-lg border ${
                        tr.passed 
                          ? 'border-green-500/20 bg-green-950/10' 
                          : 'border-red-500/20 bg-red-950/10'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2 text-[10px]">
                        <span className="font-bold text-gray-400 uppercase">Test Case {idx + 1}</span>
                        {tr.passed ? (
                          <span className="text-green-400 font-bold flex items-center gap-1 font-mono">
                            <CheckCircle2 className="w-3.5 h-3.5" /> PASSED
                          </span>
                        ) : (
                          <span className="text-red-400 font-bold flex items-center gap-1 font-mono">
                            <XCircle className="w-3.5 h-3.5" /> FAILED
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-1 text-[10px] text-gray-400 leading-normal">
                        <div>
                          <span className="font-bold text-gray-500 uppercase font-mono">INPUT:</span> 
                          <code className="bg-black/35 px-1 py-0.5 rounded text-gray-300 ml-1 font-mono">{tr.input}</code>
                        </div>
                        <div>
                          <span className="font-bold text-gray-500 uppercase font-mono">EXPECTED:</span> 
                          <code className="bg-black/35 px-1 py-0.5 rounded text-green-400 ml-1 font-mono">{tr.expected}</code>
                        </div>
                        <div>
                          <span className="font-bold text-gray-500 uppercase font-mono">ACTUAL:</span> 
                          <code className={`bg-black/35 px-1 py-0.5 rounded ml-1 font-mono ${tr.passed ? 'text-green-400' : 'text-red-400'}`}>
                            {tr.actual}
                          </code>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
