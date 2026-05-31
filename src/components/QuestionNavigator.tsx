import React from 'react';
import { useAssessmentStore } from '../store/assessmentStore';
import type { Question } from '../data/mockQuestions';
import { Layers, Bookmark, CheckCircle2 } from 'lucide-react';


export const QuestionNavigator: React.FC = () => {
  const questions = useAssessmentStore(state => state.questions);
  const currentIdx = useAssessmentStore(state => state.currentQuestionIndex);
  const setCurrentQuestionIndex = useAssessmentStore(state => state.setCurrentQuestionIndex);
  const answers = useAssessmentStore(state => state.answers);
  const markedForReview = useAssessmentStore(state => state.markedForReview);

  const getQuestionState = (q: Question, idx: number) => {
    const isCurrent = currentIdx === idx;
    const isMarked = markedForReview[q.id];
    
    // Check if answered
    let isAnswered = false;
    const answer = answers[q.id];
    if (q.type === 'mcq') {
      isAnswered = answer !== undefined;
    } else if (q.type === 'coding') {
      // Check if user has written code in any language (must be non-default)
      if (answer) {
        const activeLang = 'javascript'; // standard check
        const code = answer[activeLang] || '';
        const defaultCode = q.initialCode?.[activeLang] || '';
        isAnswered = code.trim() !== '' && code.trim() !== defaultCode.trim();
      }
    }

    return { isCurrent, isMarked, isAnswered };
  };

  const handleNavigate = (idx: number) => {
    setCurrentQuestionIndex(idx);
  };

  // Group questions by category
  const categories = ['Aptitude', 'Logical', 'Coding'] as const;

  return (
    <div className="bg-enterprise-card border border-enterprise-border rounded-xl p-4 flex flex-col gap-4 select-none">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-enterprise-border pb-3">
        <Layers className="w-4 h-4 text-blue-400" />
        <h3 className="text-xs font-mono font-bold text-white tracking-widest uppercase">
          QUESTION WORKSPACE NAV
        </h3>
      </div>

      {/* Grid of categories */}
      <div className="space-y-4">
        {categories.map((category) => {
          // Filter questions of this category
          const catQuestions = questions
            .map((q, idx) => ({ q, idx }))
            .filter(({ q }) => q.category === category);

          if (catQuestions.length === 0) return null;

          return (
            <div key={category} className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                <span>{category} Module</span>
                <span className="text-gray-600 font-bold">---</span>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {catQuestions.map(({ q, idx }) => {
                  const { isCurrent, isMarked, isAnswered } = getQuestionState(q, idx);

                  let btnStyle = 'bg-enterprise-darker border-enterprise-border text-gray-400 hover:border-blue-500/50';
                  
                  if (isAnswered) {
                    btnStyle = 'bg-green-950/20 border-green-500/40 text-green-400 font-semibold hover:bg-green-950/30';
                  }
                  if (isMarked) {
                    btnStyle = 'bg-amber-950/20 border-amber-500/40 text-amber-400 font-semibold hover:bg-amber-950/30';
                  }
                  if (isCurrent) {
                    btnStyle = 'bg-blue-600 border-blue-400 text-white font-bold shadow-glow hover:bg-blue-500';
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => handleNavigate(idx)}
                      className={`relative aspect-square rounded-lg border text-xs flex items-center justify-center font-mono transition-all cursor-pointer ${btnStyle}`}
                      title={`${q.category} Q${idx + 1}`}
                    >
                      <span>{idx + 1}</span>
                      
                      {/* Sub-indicators for reviews/saves */}
                      {isMarked && !isCurrent && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border border-enterprise-dark shadow-sm flex items-center justify-center">
                          <Bookmark className="w-1.5 h-1.5 text-black fill-black" />
                        </span>
                      )}
                      {isAnswered && !isCurrent && (
                        <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border border-enterprise-dark shadow-sm flex items-center justify-center">
                          <CheckCircle2 className="w-1.5 h-1.5 text-black" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Legend */}
      <div className="border-t border-enterprise-border/60 pt-3 space-y-2">
        <span className="text-[8px] font-mono font-bold text-gray-500 uppercase tracking-wider block">
          NAVIGATION PROTOCOL LEGEND
        </span>
        <div className="grid grid-cols-2 gap-2 text-[9px] font-mono text-gray-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-blue-600 border border-blue-400 inline-block" />
            <span>Active / Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-green-950/20 border border-green-500/40 inline-block" />
            <span>Solved / Saved</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-amber-950/20 border border-amber-500/40 inline-block" />
            <span>Marked For Review</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-enterprise-darker border border-enterprise-border inline-block" />
            <span>Unattempted</span>
          </div>
        </div>
      </div>
    </div>
  );
};
