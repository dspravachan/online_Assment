import React from 'react';
import { useAssessmentStore } from '../store/assessmentStore';
import { ShieldAlert, Wifi, CloudUpload, Clock, Maximize2 } from 'lucide-react';

export const SecureBar: React.FC = () => {
  const timeLeft = useAssessmentStore(state => state.timeLeft);
  const autoSaveStatus = useAssessmentStore(state => state.autoSaveStatus);
  const isFullscreen = useAssessmentStore(state => state.isFullscreen);
  const networkStability = useAssessmentStore(state => state.networkStability);
  const strikes = useAssessmentStore(state => state.strikes);
  const questions = useAssessmentStore(state => state.questions);
  const answers = useAssessmentStore(state => state.answers);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isTimeUrgent = timeLeft < 300; // less than 5 minutes

  // Calculate completed questions
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="bg-enterprise-darker border-b border-enterprise-border py-3 px-6 flex items-center justify-between text-gray-200 select-none">
      {/* Title & Secure Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-blue-500 animate-pulse" />
          <span className="font-mono text-xs font-semibold tracking-widest text-white uppercase">
            SECURE EXAMINATION NODE
          </span>
        </div>
        <div className="h-4 w-px bg-enterprise-border" />
        <span className="text-sm font-semibold tracking-wide text-gray-300">
          Senior Systems Engineer - Technical Evaluation
        </span>
      </div>

      {/* Proctor Badges */}
      <div className="flex items-center gap-4">
        {/* Fullscreen Badge */}
        <div className={`px-2.5 py-1 rounded border text-[10px] font-mono font-semibold flex items-center gap-1.5 transition-all ${
          isFullscreen 
            ? 'bg-blue-900/10 border-blue-500/30 text-blue-400' 
            : 'bg-red-950/20 border-red-500/30 text-red-400 animate-pulse-red'
        }`}>
          <Maximize2 className="w-3.5 h-3.5" />
          <span>{isFullscreen ? 'FULLSCREEN LOCKED' : 'FULLSCREEN ALERT'}</span>
        </div>

        {/* Strikes Indicator */}
        <div className={`px-2.5 py-1 rounded border text-[10px] font-mono font-semibold transition-all ${
          strikes > 0
            ? 'bg-red-950/20 border-red-500/30 text-red-400 animate-pulse'
            : 'bg-green-950/20 border-green-500/30 text-green-400'
        }`}>
          <span>STRIKES: {strikes} / 3</span>
        </div>

        {/* Progress Badge */}
        <div className="bg-enterprise-card border border-enterprise-border px-3 py-1 rounded text-xs font-mono">
          <span>PROGRESS: {answeredCount}/{totalQuestions}</span>
        </div>

        {/* Autosave Status */}
        <div className="flex items-center gap-1.5 text-gray-400 text-xs font-mono">
          <CloudUpload className={`w-4 h-4 ${autoSaveStatus === 'saving' ? 'animate-bounce text-blue-400' : 'text-gray-500'}`} />
          <span>
            {autoSaveStatus === 'saving' && 'Auto-saving...'}
            {autoSaveStatus === 'saved' && 'Synced'}
            {autoSaveStatus === 'idle' && 'Secure Sync'}
          </span>
        </div>

        {/* Network Quality */}
        <div className="flex items-center gap-1.5 bg-enterprise-card border border-enterprise-border px-2.5 py-1 rounded text-xs font-mono text-gray-300">
          <Wifi className="w-3.5 h-3.5 text-blue-400" />
          <span>{networkStability}%</span>
        </div>
      </div>

      {/* Countdown Timer */}
      <div className={`flex items-center gap-2 px-4 py-1.5 rounded-lg border font-mono tracking-wider transition-all duration-300 ${
        isTimeUrgent 
          ? 'bg-red-950/20 border-red-500/50 text-red-500 shadow-glow-red animate-pulse' 
          : 'bg-blue-950/10 border-blue-500/20 text-blue-400 shadow-glow'
      }`}>
        <Clock className={`w-4 h-4 ${isTimeUrgent ? 'animate-spin' : ''}`} />
        <span className="text-sm font-bold">{formatTime(timeLeft)}</span>
      </div>
    </div>
  );
};
