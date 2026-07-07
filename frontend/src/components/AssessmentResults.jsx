import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { AlertTriangle, HelpCircle, CheckCircle, RefreshCw, BookOpen, MessageSquareCode, Award } from 'lucide-react';

export default function AssessmentResults() {
  const { analysisResult, resetState } = useApp();
  const [selectedWord, setSelectedWord] = useState(null);

  if (!analysisResult) return null;

  const { overallScore, confidenceLevel, transcript, mispronouncedWords = [] } = analysisResult;

  // Clean helper to check if a word matches one of the mispronounced list
  const cleanWord = (w) => w.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim();

  const mispronouncedMap = useMemo(() => {
    const map = new Map();
    mispronouncedWords.forEach((item) => {
      map.set(cleanWord(item.word), item);
    });
    return map;
  }, [mispronouncedWords]);

  // Helper to split transcript into words for interactive display
  const wordsArray = useMemo(() => {
    if (!transcript) return [];
    return transcript.split(/\s+/);
  }, [transcript]);

  // Scoring styling details
  const getScoreColor = (score) => {
    if (score >= 80) return 'stroke-emerald-400 text-emerald-400';
    if (score >= 55) return 'stroke-amber-400 text-amber-400';
    return 'stroke-danger text-danger';
  };

  const getSeverityBadge = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return 'bg-danger/10 text-danger border-danger/20';
      case 'medium':
        return 'bg-amber-400/10 text-amber-400 border-amber-400/20';
      default:
        return 'bg-brand-primary/10 text-brand-secondary border-brand-primary/20';
    }
  };

  const circumference = 2 * Math.PI * 40; // r=40
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      {/* Header action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="font-display font-bold text-2xl text-white flex items-center gap-2">
            <Award className="h-6 w-6 text-brand-secondary" />
            Pronunciation Report
          </h2>
          <p className="text-sm text-white/50">Comprehensive overview of your speech assessment</p>
        </div>
        <button
          type="button"
          onClick={resetState}
          className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white transition active:scale-95 cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Analyze New Audio</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Score & Interactive Transcript */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Circular Score Widget */}
          <div className="glass-panel rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg border-white/5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4">Overall Accuracy</h3>
            
            <div className="relative h-32 w-32 flex items-center justify-center mb-4">
              <svg className="h-full w-full rotate-270">
                <circle
                  cx="64"
                  cy="64"
                  r="40"
                  className="stroke-white/5 fill-transparent"
                  strokeWidth="8"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="40"
                  className={`fill-transparent transition-all duration-1000 ease-out ${getScoreColor(overallScore)}`}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="font-display text-3xl font-extrabold text-white leading-none">
                  {overallScore}
                </span>
                <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider mt-1">/ 100</span>
              </div>
            </div>

            <div className="flex flex-col gap-1 items-center mt-2">
              <span className="text-xs text-white/60">Assessment Confidence</span>
              <span className="text-sm font-bold text-white/90 bg-white/5 border border-white/10 px-3 py-0.5 rounded-full uppercase tracking-wider">
                {confidenceLevel || 'High'}
              </span>
            </div>
          </div>

          {/* Interactive Transcript Panel */}
          <div className="glass-panel rounded-2xl p-6 shadow-lg border-white/5">
            <h3 className="font-display font-bold text-white mb-3 flex items-center gap-2 text-sm uppercase tracking-wide text-white/60">
              <BookOpen className="h-4 w-4 text-brand-secondary" />
              Speech Transcript
            </h3>
            
            <div className="bg-dark-surface/50 border border-white/5 rounded-xl p-4 min-h-[120px] max-h-[220px] overflow-y-auto leading-relaxed text-sm sm:text-base">
              {wordsArray.map((word, idx) => {
                const cleaned = cleanWord(word);
                const issueData = mispronouncedMap.get(cleaned);
                
                if (issueData) {
                  const isSelected = selectedWord?.toLowerCase() === cleaned;
                  return (
                    <span key={idx} className="relative inline-block mr-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedWord(isSelected ? null : cleaned)}
                        className={`font-semibold cursor-pointer underline decoration-wavy underline-offset-4 px-1 rounded-sm transition ${
                          isSelected
                            ? 'bg-danger/25 text-danger decoration-danger'
                            : 'bg-danger/5 text-danger/90 decoration-danger/40 hover:bg-danger/15'
                        }`}
                      >
                        {word}
                      </button>
                    </span>
                  );
                }

                return <span key={idx} className="text-white/80 mr-1.5 inline-block">{word}</span>;
              })}
            </div>
            
            <p className="text-[11px] text-white/40 mt-3 leading-relaxed">
              * Words marked in <span className="text-danger font-medium">red</span> indicate potential pronunciation concerns. Click on any marked word to review specific phonics feedback.
            </p>
          </div>
        </div>

        {/* Right Side: Mistake Details Cards */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="glass-panel rounded-2xl p-6 shadow-lg border-white/5 flex-1 flex flex-col">
            <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2 text-sm uppercase tracking-wide text-white/60">
              <MessageSquareCode className="h-4 w-4 text-brand-secondary" />
              Pronunciation Analysis ({mispronouncedWords.length})
            </h3>

            {mispronouncedWords.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                <CheckCircle className="h-12 w-12 text-emerald-400 mb-3 animate-pulse" />
                <h4 className="font-display font-bold text-white mb-1">Excellent Pronunciation!</h4>
                <p className="text-xs text-white/50 max-w-sm">
                  We did not detect any notable pronunciation errors in your speech recording. Keep up the great work!
                </p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-4 max-h-[460px] overflow-y-auto pr-1">
                {mispronouncedWords.map((item, index) => {
                  const cleaned = cleanWord(item.word);
                  const isHighlighted = selectedWord?.toLowerCase() === cleaned;
                  
                  return (
                    <div
                      key={index}
                      id={`word-card-${cleaned}`}
                      className={`rounded-xl border p-4.5 transition-all duration-300 ${
                        isHighlighted
                          ? 'bg-danger/10 border-danger/40 ring-1 ring-danger/40 translate-x-1'
                          : 'bg-white/2 border-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          <span className="font-display font-extrabold text-base sm:text-lg text-white">
                            "{item.word}"
                          </span>
                          <span className={`text-[10px] uppercase font-bold tracking-wider rounded-md border px-2 py-0.5 ${getSeverityBadge(item.severity)}`}>
                            {item.severity || 'medium'}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-brand-secondary/90 bg-brand-primary/5 px-2.5 py-0.5 rounded-full border border-brand-primary/10">
                          {item.issue}
                        </span>
                      </div>

                      <div className="space-y-2.5 mt-3 text-xs sm:text-sm">
                        <div className="flex gap-2">
                          <span className="font-semibold text-white/50 shrink-0">Issue:</span>
                          <span className="text-white/80">{item.explanation}</span>
                        </div>
                        <div className="flex gap-2 bg-emerald-500/5 rounded-lg border border-emerald-500/10 p-2.5">
                          <span className="font-semibold text-emerald-400 shrink-0">Improve:</span>
                          <span className="text-white/90">{item.suggestion}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
