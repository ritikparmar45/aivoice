import React from 'react';
import Header from './Header';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-dark-bg font-sans selection:bg-brand-primary/30 selection:text-white">
      {/* Decorative premium ambient glow spots */}
      <div className="absolute top-0 left-1/4 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-brand-primary/8 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 -z-10 h-[600px] w-[600px] translate-x-1/2 rounded-full bg-brand-secondary/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 -z-10 h-[400px] w-[400px] rounded-full bg-emerald-500/3 blur-[100px] pointer-events-none" />
      
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
