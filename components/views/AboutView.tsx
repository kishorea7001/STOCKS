'use client';

import React from 'react';
import { Info, Mic } from 'lucide-react';
import { Card } from '../ui/Card';

export function AboutView({ className = '' }: { className?: string }) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Brand Intro Card */}
      <Card
        title="About TalkStock"
        subtitle="Voice-first inventory intelligence for modern businesses"
        icon={<Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
      >
        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            <strong className="text-slate-900 dark:text-white font-semibold">TalkStock</strong> transforms traditional
            stock keeping into a hands-free, conversational experience. Built for busy retail merchants,
            kirana stores, and warehouse operators, it enables inventory logging via speech.
          </p>
          <p>
            Rather than navigating complex spreadsheets or small mobile keyboards, simply tap the microphone
            and speak naturally in English, Hindi, or Hinglish.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50">
            <span className="text-xs font-bold text-blue-800 dark:text-blue-400">Version</span>
            <p className="text-base font-extrabold text-[#0F172A] dark:text-white mt-1">v1.0 Desktop</p>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400">AI Engine</span>
            <p className="text-base font-extrabold text-[#0F172A] dark:text-white mt-1">Multimodal Voice AI</p>
          </div>
          <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/50">
            <span className="text-xs font-bold text-purple-800 dark:text-purple-400">License</span>
            <p className="text-base font-extrabold text-[#0F172A] dark:text-white mt-1">Enterprise Ready</p>
          </div>
        </div>
      </Card>

      {/* Voice Command Reference Tips */}
      <Card
        title="Supported Voice Commands"
        subtitle="Examples of phrases you can speak into TalkStock"
        icon={<Mic className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
            <h4 className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
              Sales & Reductions
            </h4>
            <ul className="mt-2 space-y-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <li>• &ldquo;Sold 5 packets of milk&rdquo;</li>
              <li>• &ldquo;5kg rice left&rdquo;</li>
              <li>• &ldquo;Becha 2 kg cheeni&rdquo;</li>
              <li>• &ldquo;Deducted 3 bottles of cooking oil&rdquo;</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
            <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Restock & Intakes
            </h4>
            <ul className="mt-2 space-y-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <li>• &ldquo;Received 50 kg of Basmati Rice&rdquo;</li>
              <li>• &ldquo;Aaya 20 packets washing powder&rdquo;</li>
              <li>• &ldquo;Restocked 40 bars of soap&rdquo;</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default AboutView;
