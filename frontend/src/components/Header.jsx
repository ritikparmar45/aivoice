import React from 'react';
import { ShieldCheck, Languages } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-dark-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-brand-primary to-brand-secondary shadow-lg shadow-brand-primary/20">
            <Languages className="h-5.5 w-5.5 text-white" />
          </div>
          <div>
            <span className="font-display text-xl font-bold tracking-tight text-white">
              Accent<span className="bg-linear-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">Flow</span>
            </span>
            <span className="hidden sm:inline-block ml-2 rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase text-white/50 border border-white/5">
              v1.0
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3.5 py-1.5 text-xs font-semibold text-emerald-400">
          <ShieldCheck className="h-4 w-4" />
          <span>DPDP Compliant</span>
        </div>
      </div>
    </header>
  );
}
