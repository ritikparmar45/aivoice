import React from 'react';
import { Sparkles, Trash2, ShieldAlert } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/5 bg-dark-bg/60 py-8 mt-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left mb-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2 text-white/90 font-semibold text-sm">
              <Trash2 className="h-4 w-4 text-brand-secondary" />
              <span>Zero-Storage Policy</span>
            </div>
            <p className="text-xs text-white/50 max-w-xs leading-relaxed">
              Your audio files are loaded into temporary memory, processed immediately, and permanently destroyed post-analysis.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2 text-white/90 font-semibold text-sm">
              <ShieldAlert className="h-4 w-4 text-brand-secondary" />
              <span>DPDP Compliance</span>
            </div>
            <p className="text-xs text-white/50 max-w-xs leading-relaxed">
              We collect zero personal identifiers or voice metadata. No persistent databases are attached to this application.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2 text-white/90 font-semibold text-sm">
              <Sparkles className="h-4 w-4 text-brand-secondary" />
              <span>AI-Driven Analysis</span>
            </div>
            <p className="text-xs text-white/50 max-w-xs leading-relaxed">
              Powered by speech-to-text transcription and Gemini 2.5 Flash for high-accuracy assessment.
            </p>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-[11px] text-white/40">
            &copy; {new Date().getFullYear()} AccentFlow. All rights reserved.
          </span>
          <div className="flex gap-4 text-[11px] text-white/40">
            <a href="#" className="hover:text-brand-secondary transition">Terms of Service</a>
            <span>&bull;</span>
            <a href="#" className="hover:text-brand-secondary transition">Privacy Shield</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
