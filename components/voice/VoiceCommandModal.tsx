'use client';

import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  X,
  Volume2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Send,
  Boxes,
  Info,
} from 'lucide-react';

export interface VoiceCommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  isListening: boolean;
  liveTranscript: string;
  speechFeedback: string | null;
  speechError: string | null;
  onToggleMic: () => void;
  onExecuteCommand: (cmd: string) => void;
  audioLevel?: number; // 0 to 100
}

export function VoiceCommandModal({
  isOpen,
  onClose,
  isListening,
  liveTranscript,
  speechFeedback,
  speechError,
  onToggleMic,
  onExecuteCommand,
  audioLevel = 0,
}: VoiceCommandModalProps) {
  const [typedCommand, setTypedCommand] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedCommand.trim()) return;
    onExecuteCommand(typedCommand.trim());
    setTypedCommand('');
  };

  const handleQuickCommand = (cmd: string) => {
    onExecuteCommand(cmd);
  };

  const sampleCommands = [
    { label: '5kg rice left', category: 'Deduct' },
    { label: 'Sold 5 packets of milk', category: 'Sale' },
    { label: 'Update rice count to 50', category: 'Update' },
    { label: '2 kg sugar left', category: 'Stock' },
    { label: 'Restock 20 tea', category: 'Restock' },
    { label: 'Add 15 cooking oil', category: 'Add' },
    { label: 'Restock all alerts', category: 'Bulk' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Dark backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl p-6 sm:p-8 z-10 space-y-6 animate-in zoom-in-95 duration-200 transition-colors">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/25">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                TalkStock Voice Assistant
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Speak your inventory command or tap a suggestion below
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close voice assistant"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Center: Large Animated Microphone Controller */}
        <div className="flex flex-col items-center text-center space-y-4 py-2">
          <div className="relative flex items-center justify-center">
            {/* Outer Concentric Glow */}
            <div
              className={`h-28 w-28 rounded-full border transition-all duration-300 flex items-center justify-center ${
                isListening
                  ? 'border-blue-400/80 dark:border-blue-500/80 bg-blue-500/15 dark:bg-blue-500/20 scale-110 animate-pulse shadow-[0_0_40px_rgba(37,99,235,0.35)]'
                  : 'border-blue-200/60 dark:border-slate-700 bg-blue-50/50 dark:bg-slate-800/50'
              }`}
            >
              {/* Inner Circle */}
              <div
                className={`h-20 w-20 rounded-full border transition-all duration-300 flex items-center justify-center ${
                  isListening
                    ? 'border-blue-600 bg-blue-600/25 scale-105'
                    : 'border-blue-300/60 dark:border-slate-600 bg-blue-100/50 dark:bg-slate-700/50'
                }`}
              >
                {/* Action Button */}
                <button
                  type="button"
                  onClick={onToggleMic}
                  className={`relative flex h-14 w-14 items-center justify-center rounded-full text-white transition-all duration-200 active:scale-95 cursor-pointer shadow-lg ${
                    isListening
                      ? 'bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 ring-4 ring-rose-200 dark:ring-rose-900 shadow-rose-500/35'
                      : 'bg-gradient-to-tr from-blue-600 via-blue-500 to-sky-500 hover:scale-105 shadow-blue-500/30'
                  }`}
                  aria-label={isListening ? 'Stop listening' : 'Start speaking'}
                >
                  {isListening ? (
                    <Mic className="h-7 w-7 text-white stroke-[2.3] animate-pulse" />
                  ) : (
                    <Mic className="h-7 w-7 text-white stroke-[2.3]" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Status Label */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-tight">
              {isListening ? (
                <span className="inline-flex items-center gap-1.5 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/60 px-3 py-0.5 rounded-full animate-pulse">
                  <span className="h-2 w-2 rounded-full bg-rose-600 dark:bg-rose-400 animate-ping" />
                  Listening... speak into your microphone
                </span>
              ) : (
                <span className="text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-0.5 rounded-full">
                  Tap microphone to start speaking
                </span>
              )}
            </div>
          </div>

          {/* Audio Equalizer Bars */}
          <div className="flex items-center justify-center gap-1.5 h-8 py-1">
            {[
              'h-3 bg-blue-400',
              'h-5 bg-blue-500',
              'h-7 bg-blue-600',
              'h-4 bg-blue-500',
              'h-6 bg-blue-600',
              'h-8 bg-blue-700',
              'h-5 bg-blue-600',
              'h-7 bg-blue-500',
              'h-4 bg-blue-400',
              'h-2 bg-blue-300',
            ].map((cls, i) => (
              <span
                key={i}
                className={`w-1 rounded-full transition-all duration-200 ${
                  isListening ? `${cls} animate-pulse` : 'h-1.5 bg-slate-300 dark:bg-slate-700'
                }`}
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        </div>

        {/* Live Spoken Transcript Display */}
        <div className="rounded-2xl border border-blue-100 dark:border-slate-800 bg-blue-50/60 dark:bg-slate-800/60 p-4 text-left space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <Volume2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              Live Speech Transcript
            </span>
            {liveTranscript && (
              <button
                type="button"
                onClick={() => onExecuteCommand(liveTranscript)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
              >
                <span>Apply Command</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>

          <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white min-h-[28px] break-words">
            {liveTranscript ? (
              `“${liveTranscript}”`
            ) : (
              <span className="text-slate-400 dark:text-slate-500 italic font-normal text-xs sm:text-sm">
                Say something like: &ldquo;Sold 5 packets of milk&rdquo; or &ldquo;5kg rice left&rdquo;...
              </span>
            )}
          </p>
        </div>

        {/* Speech Error Banner (if any) */}
        {speechError && (
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Microphone notice: </span>
              <span>{speechError}</span>
            </div>
          </div>
        )}

        {/* Execution Feedback Banner (Confirmed action) */}
        {speechFeedback && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-800 dark:text-emerald-300 font-medium animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{speechFeedback}</span>
          </div>
        )}

        {/* One-Tap Voice Simulations */}
        <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Or tap to test sample voice commands:
          </span>
          <div className="flex flex-wrap gap-2">
            {sampleCommands.map((sample) => (
              <button
                key={sample.label}
                type="button"
                onClick={() => handleQuickCommand(sample.label)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 hover:border-blue-300 dark:hover:border-blue-500 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-400 transition cursor-pointer"
              >
                <Sparkles className="h-3 w-3 text-blue-500 dark:text-blue-400" />
                <span>&ldquo;{sample.label}&rdquo;</span>
              </button>
            ))}
          </div>
        </div>

        {/* Manual Command Input Fallback */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800"
        >
          <input
            type="text"
            value={typedCommand}
            onChange={(e) => setTypedCommand(e.target.value)}
            placeholder='Or type any command e.g. "Sold 5 milk", "Rice 50"'
            className="flex-1 text-xs px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer shadow-sm shadow-blue-500/25 transition"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Run</span>
          </button>
        </form>

        {/* Browser & OS Permission Tip */}
        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          <Info className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />
          <span>
            <strong className="text-slate-700 dark:text-slate-300 font-semibold">No plugins required:</strong> Powered by the browser-native Web Speech API. If your voice isn&apos;t picked up, ensure you are using <strong>Google Chrome</strong> or <strong>Edge</strong>, and verify microphone access in <strong>Windows Settings &gt; Privacy &gt; Microphone</strong> and your browser address bar.
          </span>
        </div>
      </div>
    </div>
  );
}

export default VoiceCommandModal;
