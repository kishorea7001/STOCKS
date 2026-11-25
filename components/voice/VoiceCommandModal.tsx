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
      <div className="relative w-full max-w-xl rounded-3xl bg-white border border-slate-100 shadow-2xl p-6 sm:p-8 z-10 space-y-6 animate-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/25">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                TalkStock Voice Assistant
              </h3>
              <p className="text-xs text-slate-500">
                Speak your inventory command or tap a suggestion below
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close voice assistant"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer"
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
                  ? 'border-blue-400/80 bg-blue-500/15 scale-110 animate-pulse shadow-[0_0_40px_rgba(37,99,235,0.35)]'
                  : 'border-blue-200/60 bg-blue-50/50'
              }`}
            >
              {/* Inner Circle */}
              <div
                className={`h-20 w-20 rounded-full border transition-all duration-300 flex items-center justify-center ${
                  isListening
                    ? 'border-blue-600 bg-blue-600/25 scale-105'
                    : 'border-blue-300/60 bg-blue-100/50'
                }`}
              >
                {/* Action Button */}
                <button
                  type="button"
                  onClick={onToggleMic}
                  className={`relative flex h-14 w-14 items-center justify-center rounded-full text-white transition-all duration-200 active:scale-95 cursor-pointer shadow-lg ${
                    isListening
                      ? 'bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 ring-4 ring-rose-200 shadow-rose-500/35'
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
                <span className="inline-flex items-center gap-1.5 text-rose-600 bg-rose-50 border border-rose-200/80 px-3 py-0.5 rounded-full animate-pulse">
                  <span className="h-2 w-2 rounded-full bg-rose-600 animate-ping" />
                  Listening... speak into your microphone
                </span>
              ) : (
                <span className="text-slate-600 bg-slate-100 border border-slate-200 px-3 py-0.5 rounded-full">
                  Tap microphone to start speaking
                </span>
              )}
            </div>
          </div>

          {/* Audio Equalizer Bars */}
          <div className="flex items-center justify-center gap-1 h-7 py-1">
            {[4, 8, 14, 20, 12, 18, 24, 16, 10, 6].map((baseHeight, i) => {
              const dynHeight = isListening
                ? Math.min(28, Math.max(4, baseHeight + (audioLevel > 5 ? (audioLevel % (i + 5)) * 3 : 0)))
                : 4;
              return (
                <span
                  key={i}
                  className={`w-1 rounded-full transition-all duration-150 ${
                    isListening ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                  style={{ height: `${dynHeight}px` }}
                />
              );
            })}
          </div>
        </div>

        {/* Live Spoken Transcript Display */}
        <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-left space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
              <Volume2 className="h-3.5 w-3.5 text-blue-600" />
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

          <p className="text-sm sm:text-base font-bold text-slate-900 min-h-[28px] break-words">
            {liveTranscript ? (
              `“${liveTranscript}”`
            ) : (
              <span className="text-slate-400 italic font-normal text-xs sm:text-sm">
                Say something like: &ldquo;Sold 5 packets of milk&rdquo; or &ldquo;Update rice count to 50&rdquo;...
              </span>
            )}
          </p>
        </div>

        {/* Speech Error Banner (if any) */}
        {speechError && (
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Microphone notice: </span>
              <span>{speechError}</span>
            </div>
          </div>
        )}

        {/* Execution Feedback Banner (Confirmed action) */}
        {speechFeedback && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{speechFeedback}</span>
          </div>
        )}

        {/* One-Tap Voice Simulations */}
        <div className="space-y-2 pt-1 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-500">
            Or tap to test sample voice commands:
          </span>
          <div className="flex flex-wrap gap-2">
            {sampleCommands.map((sample) => (
              <button
                key={sample.label}
                type="button"
                onClick={() => handleQuickCommand(sample.label)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-blue-50 hover:border-blue-300 text-xs font-semibold text-slate-700 hover:text-blue-700 transition cursor-pointer"
              >
                <Sparkles className="h-3 w-3 text-blue-500" />
                <span>&ldquo;{sample.label}&rdquo;</span>
              </button>
            ))}
          </div>
        </div>

        {/* Manual Command Input Fallback */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 pt-2 border-t border-slate-100"
        >
          <input
            type="text"
            value={typedCommand}
            onChange={(e) => setTypedCommand(e.target.value)}
            placeholder='Or type any command e.g. "Sold 5 milk", "Rice 50"'
            className="flex-1 text-xs px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer shadow-sm shadow-blue-500/25 transition"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Run</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default VoiceCommandModal;
