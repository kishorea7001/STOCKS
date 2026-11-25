'use client';

import React, { useState } from 'react';
import { Mic, MessageSquare, Volume2, Sparkles, CheckCircle2, AlertCircle, Send } from 'lucide-react';

export interface VoiceInteractionCardProps {
  isListening?: boolean;
  liveTranscript?: string;
  speechFeedback?: string | null;
  speechError?: string | null;
  onMicClick?: () => void;
  onSelectExample?: (command: string) => void;
  onManualSubmit?: (command: string) => void;
  className?: string;
}

export function VoiceInteractionCard({
  isListening = false,
  liveTranscript = '',
  speechFeedback = null,
  speechError = null,
  onMicClick,
  onSelectExample,
  onManualSubmit,
  className = '',
}: VoiceInteractionCardProps) {
  const [typedInput, setTypedInput] = useState('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedInput.trim()) return;
    onManualSubmit?.(typedInput.trim());
    setTypedInput('');
  };

  return (
    <section aria-label="Voice Command Interaction" className={className}>
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-blue-200/80 bg-gradient-to-r from-blue-50/90 via-sky-50/60 to-blue-100/50 p-6 md:p-8 lg:p-9 shadow-[0_4px_24px_rgba(37,99,235,0.05)] transition-all duration-300">
        {/* Subtle Ambient Radial Glow */}
        <div
          className={`pointer-events-none absolute -left-10 top-1/2 -translate-y-1/2 h-56 w-56 rounded-full transition-opacity duration-500 blur-2xl ${
            isListening ? 'bg-blue-500/25 opacity-100 scale-125' : 'bg-blue-400/15 opacity-80'
          }`}
        />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-7 md:gap-9">
          {/* Left: Large Circular Microphone Control with Multiple Concentric Rings */}
          <div className="relative flex items-center justify-center shrink-0">
            {/* Outermost Concentric Ring */}
            <div
              className={`h-32 w-32 md:h-36 md:w-36 rounded-full border border-blue-300/35 bg-blue-400/5 flex items-center justify-center transition-all duration-300 ${
                isListening
                  ? 'scale-110 border-blue-400/60 bg-blue-400/15 shadow-[0_0_40px_rgba(37,99,235,0.25)] animate-pulse'
                  : 'animate-pulse'
              }`}
            >
              {/* Middle Concentric Ring */}
              <div
                className={`h-25 w-25 md:h-28 md:w-28 rounded-full border border-blue-400/30 bg-blue-500/10 flex items-center justify-center transition-all duration-300 ${
                  isListening
                    ? 'border-blue-500/60 bg-blue-500/20 scale-105'
                    : ''
                }`}
              >
                {/* Inner Concentric Ring */}
                <div
                  className={`h-19 w-19 md:h-21 md:w-21 rounded-full border border-blue-500/35 bg-blue-500/15 flex items-center justify-center transition-all duration-300 ${
                    isListening
                      ? 'border-blue-600/70 bg-blue-500/30'
                      : ''
                  }`}
                >
                  {/* Central Microphone Button */}
                  <button
                    type="button"
                    onClick={onMicClick}
                    className={`relative flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-full text-white transition-all duration-300 active:scale-95 cursor-pointer ${
                      isListening
                        ? 'bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 shadow-[0_0_35px_rgba(37,99,235,0.7)] scale-110 ring-4 ring-blue-300/50'
                        : 'bg-gradient-to-tr from-blue-600 via-blue-500 to-sky-500 shadow-[0_0_28px_rgba(37,99,235,0.45)] hover:scale-105 hover:shadow-[0_0_35px_rgba(37,99,235,0.6)]'
                    }`}
                    aria-label={isListening ? 'Stop listening' : 'Tap to speak voice command'}
                  >
                    <Mic
                      className={`h-7 w-7 md:h-8 md:w-8 text-white stroke-[2.3] transition-transform duration-300 ${
                        isListening ? 'animate-bounce' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Heading, Subtitle & Interactive Translucent Container */}
          <div className="flex-1 w-full text-center md:text-left space-y-3">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2.5">
                <h3 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] tracking-tight leading-tight">
                  {isListening ? 'Listening to Microphone...' : 'Tap to Speak'}
                </h3>
                {isListening && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 text-white text-xs font-semibold px-2.5 py-0.5 shadow-xs animate-pulse">
                    <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                    Recording
                  </span>
                )}
              </div>
              <p className="text-sm md:text-[15px] text-slate-500 font-medium mt-1">
                {isListening
                  ? 'Speak clearly into your microphone now:'
                  : 'Say something like:'}
              </p>
            </div>

            {/* White/Light Translucent Rounded Container with Example Commands */}
            <div className="rounded-2xl border border-white/90 bg-white/85 backdrop-blur-xs p-4 md:p-4.5 shadow-xs transition-all space-y-3">
              {isListening ? (
                /* Dynamic Live Speech Feedback during Active Listening */
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-blue-600 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 animate-spin" />
                      Live Speech Recognition Active
                    </span>
                    <button
                      type="button"
                      onClick={onMicClick}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg transition cursor-pointer"
                    >
                      Stop Listening
                    </button>
                  </div>

                  {/* Real-time Spoken Transcript Box */}
                  <div className="p-3.5 rounded-xl bg-blue-50/90 border border-blue-200/90 text-left space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
                        <Volume2 className="h-3.5 w-3.5 text-blue-500" />
                        <span>Live Speech Transcript:</span>
                      </div>
                      {liveTranscript && (
                        <button
                          type="button"
                          onClick={() => onSelectExample?.(liveTranscript)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
                        >
                          Apply Command →
                        </button>
                      )}
                    </div>
                    <p className="text-sm md:text-base font-bold text-slate-900 min-h-[24px]">
                      {liveTranscript ? `“${liveTranscript}”` : (
                        <span className="text-slate-400 italic font-normal">
                          Listening... speak now (e.g. &ldquo;Update rice count to 50&rdquo; or &ldquo;Sold 5 packets of milk&rdquo;)
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Equalizer animation */}
                  <div className="flex items-center justify-center gap-1.5 h-6 py-1">
                    {[
                      'h-2.5 bg-blue-400',
                      'h-5 bg-blue-500',
                      'h-6 bg-blue-600',
                      'h-4 bg-blue-500',
                      'h-6 bg-blue-600',
                      'h-3.5 bg-blue-400',
                      'h-5 bg-blue-500',
                      'h-6 bg-blue-600',
                      'h-4 bg-blue-500',
                      'h-2.5 bg-blue-400',
                    ].map((cls, i) => (
                      <span
                        key={i}
                        className={`w-1.5 rounded-full ${cls} animate-pulse`}
                        style={{ animationDelay: `${i * 80}ms` }}
                      />
                    ))}
                  </div>

                  {/* Quick test clickable prompts */}
                  <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-slate-100">
                    <span className="text-[11px] font-medium text-slate-400">
                      Or tap to test command:
                    </span>
                    <button
                      type="button"
                      onClick={() => onSelectExample?.('5kg rice left')}
                      className="text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg px-2.5 py-1 transition cursor-pointer"
                    >
                      &ldquo;5kg rice left&rdquo;
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectExample?.('Sold 5 packets of milk')}
                      className="text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg px-2.5 py-1 transition cursor-pointer"
                    >
                      &ldquo;Sold 5 packets of milk&rdquo;
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectExample?.('Update rice count to 50')}
                      className="text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg px-2.5 py-1 transition cursor-pointer"
                    >
                      &ldquo;Update rice count to 50&rdquo;
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectExample?.('2 kg sugar left')}
                      className="text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg px-2.5 py-1 transition cursor-pointer"
                    >
                      &ldquo;2 kg sugar left&rdquo;
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectExample?.('Restock all')}
                      className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg px-2.5 py-1 transition cursor-pointer"
                    >
                      &ldquo;Restock all&rdquo;
                    </button>
                  </div>
                </div>
              ) : (
                /* Ready State with Example Commands */
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 shrink-0 mt-0.5">
                      <MessageSquare className="h-4 w-4 stroke-[2.2]" />
                    </div>

                    <div className="flex-1 text-left space-y-1 text-xs md:text-[13.5px] font-semibold text-slate-700 leading-relaxed">
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                        <button
                          type="button"
                          onClick={() => onSelectExample?.('5kg rice left')}
                          className="hover:text-rose-600 transition-colors text-left cursor-pointer hover:underline text-rose-600 font-semibold"
                        >
                          &ldquo;5kg rice left&rdquo;
                        </button>
                        <span className="text-slate-300 font-normal hidden sm:inline">|</span>
                        <button
                          type="button"
                          onClick={() => onSelectExample?.('Sold 5 packets of milk')}
                          className="hover:text-blue-600 transition-colors text-left cursor-pointer hover:underline"
                        >
                          &ldquo;Sold 5 packets of milk&rdquo;
                        </button>
                        <span className="text-slate-300 font-normal hidden sm:inline">|</span>
                        <button
                          type="button"
                          onClick={() => onSelectExample?.('Update rice count to 50')}
                          className="hover:text-blue-600 transition-colors text-left cursor-pointer hover:underline"
                        >
                          &ldquo;Update rice count to 50&rdquo;
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                        <button
                          type="button"
                          onClick={() => onSelectExample?.('2 kg sugar left')}
                          className="hover:text-blue-600 transition-colors text-left cursor-pointer hover:underline text-slate-600"
                        >
                          &ldquo;2 kg sugar left&rdquo;
                        </button>
                        <span className="text-slate-300 font-normal hidden sm:inline">|</span>
                        <button
                          type="button"
                          onClick={() => onSelectExample?.('Restock all')}
                          className="text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer hover:underline text-left"
                        >
                          &ldquo;Restock all&rdquo;
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Fallback Command Input */}
                  <form
                    onSubmit={handleFormSubmit}
                    className="flex items-center gap-2 pt-2 border-t border-slate-100"
                  >
                    <input
                      type="text"
                      value={typedInput}
                      onChange={(e) => setTypedInput(e.target.value)}
                      placeholder='Type a command e.g. "Sold 5 milk" or "Update rice to 50"'
                      className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800 placeholder:text-slate-400"
                    />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer shadow-xs transition"
                    >
                      <Send className="h-3 w-3" />
                      <span>Execute</span>
                    </button>
                  </form>
                </div>
              )}

              {/* Speech Error Banner */}
              {speechError && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>{speechError}</span>
                </div>
              )}

              {/* Last Recognized Result Feedback Banner */}
              {speechFeedback && !isListening && (
                <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium animate-in fade-in">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{speechFeedback}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default VoiceInteractionCard;
