'use client';

import React from 'react';
import { Mic, MessageSquare, Volume2, Sparkles } from 'lucide-react';

export interface VoiceInteractionCardProps {
  isListening?: boolean;
  onMicClick?: () => void;
  onSelectExample?: (command: string) => void;
  className?: string;
}

export function VoiceInteractionCard({
  isListening = false,
  onMicClick,
  onSelectExample,
  className = '',
}: VoiceInteractionCardProps) {
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
                  {isListening ? 'Listening...' : 'Tap to Speak'}
                </h3>
                {isListening && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 text-white text-xs font-semibold px-2.5 py-0.5 shadow-xs animate-pulse">
                    <Volume2 className="h-3.5 w-3.5" />
                    Audio Active
                  </span>
                )}
              </div>
              <p className="text-sm md:text-[15px] text-slate-500 font-medium mt-1">
                {isListening
                  ? 'Speak your inventory update or click an example below to test:'
                  : 'Say something like:'}
              </p>
            </div>

            {/* White/Light Translucent Rounded Container with Example Commands */}
            <div className="rounded-2xl border border-white/90 bg-white/85 backdrop-blur-xs p-4 md:p-4.5 shadow-xs transition-all">
              {isListening ? (
                /* Dynamic Waveform Visualizer during Active Listening */
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-blue-600 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 animate-spin" />
                      Listening for voice input...
                    </span>
                    <button
                      type="button"
                      onClick={onMicClick}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  {/* Equalizer animation */}
                  <div className="flex items-center justify-center gap-1.5 h-8 py-1">
                    {[
                      'h-3 bg-blue-400',
                      'h-6 bg-blue-500',
                      'h-8 bg-blue-600',
                      'h-5 bg-blue-500',
                      'h-7 bg-blue-600',
                      'h-4 bg-blue-400',
                      'h-7 bg-blue-500',
                      'h-8 bg-blue-600',
                      'h-5 bg-blue-500',
                      'h-3 bg-blue-400',
                    ].map((cls, i) => (
                      <span
                        key={i}
                        className={`w-1.5 rounded-full ${cls} animate-pulse`}
                        style={{ animationDelay: `${i * 80}ms` }}
                      />
                    ))}
                  </div>

                  {/* Quick test clickable prompts */}
                  <div className="pt-1 flex flex-wrap items-center gap-2 border-t border-slate-100/80">
                    <span className="text-[11px] font-medium text-slate-400">
                      Or test sample command:
                    </span>
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
                  </div>
                </div>
              ) : (
                /* Ready State with Example Commands */
                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 shrink-0 mt-0.5">
                    <MessageSquare className="h-4 w-4 stroke-[2.2]" />
                  </div>

                  <div className="flex-1 text-left space-y-1 text-xs md:text-[13.5px] font-semibold text-slate-700 leading-relaxed">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                      <button
                        type="button"
                        onClick={() => onSelectExample?.('Update rice count to 50')}
                        className="hover:text-blue-600 transition-colors text-left cursor-pointer hover:underline"
                      >
                        &ldquo;Update rice count to 50&rdquo;
                      </button>
                      <span className="text-slate-300 font-normal hidden sm:inline">|</span>
                      <button
                        type="button"
                        onClick={() => onSelectExample?.('Sold 5 packets of milk')}
                        className="hover:text-blue-600 transition-colors text-left cursor-pointer hover:underline"
                      >
                        &ldquo;Sold 5 packets of milk&rdquo;
                      </button>
                    </div>
                    <div className="text-slate-600">
                      <button
                        type="button"
                        onClick={() => onSelectExample?.('2 kg sugar left')}
                        className="hover:text-blue-600 transition-colors text-left cursor-pointer hover:underline"
                      >
                        &ldquo;2 kg sugar left&rdquo;
                      </button>
                    </div>
                  </div>
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
