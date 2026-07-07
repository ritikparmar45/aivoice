import React from 'react';
import { useApp } from '../context/AppContext';
import DragDropUploader from '../components/DragDropUploader';
import AssessmentResults from '../components/AssessmentResults';
import { Sparkles, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const { analysisResult, error } = useApp();

  return (
    <div className="space-y-10 py-6">
      {/* Landing/Setup view header - hidden once results are ready to maximize vertical space */}
      {!analysisResult && (
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/20 bg-brand-primary/5 px-4 py-1.5 text-xs font-semibold text-brand-secondary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Refine Your Speech & Phonetics</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight leading-tight">
            Perfect Your English{' '}
            <span className="bg-linear-to-r from-brand-primary via-brand-secondary to-brand-accent bg-clip-text text-transparent">
              Pronunciation
            </span>
          </h1>
          <p className="text-sm sm:text-base text-white/60 leading-relaxed">
            Record a short audio clip (30–45 seconds) speaking English, upload it, and our AI will deliver instantaneous feedback on mispronounced words, speech accuracy, and actionable tips for improvement.
          </p>
        </div>
      )}

      {/* Global Form/API Error Display */}
      {error && (
        <div className="flex gap-3 rounded-2xl border border-danger/20 bg-danger/5 p-4 max-w-2xl mx-auto text-danger animate-pulse">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm">Analysis Request Failed</h4>
            <p className="text-xs text-white/70 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Primary view switch */}
      <div className="flex justify-center">
        {!analysisResult ? (
          <DragDropUploader />
        ) : (
          <AssessmentResults />
        )}
      </div>
    </div>
  );
}
