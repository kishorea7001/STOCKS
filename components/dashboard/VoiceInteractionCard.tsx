'use client';

import React from 'react';
import { Mic, MessageSquare } from 'lucide-react';

export interface VoiceInteractionCardProps {
  onMicClick?: () => void;
  className?: string;
}

export function VoiceInteractionCard({
  onMicClick,
  className = '',
}: VoiceInteractionCardProps) {
  return (
    <section aria-label="Voice Command Interaction" className={className}>
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-blue-200/80 bg-gradient-to-r from-blue-50/90 via-sky-50/60 to-blue-100/50 p-6 md:p-8 lg:p-9 shadow-[0_4px_24px_rgba(37,99,235,0.05)]">
        {/* Subtle Ambient Radial Glow */}
        <div className="pointer-events-none absolute -left-10 top-1/2 -translate-y-1/2 h-56 w-56 rounded-full bg-blue-400/15 blur-2xl" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-7 md:gap-9">
          {/* Left: Large Circular Microphone Control with Multiple Concentric Rings & Soft Glow */}
          <div className="relative flex items-center justify-center shrink-0">
            {/* Outermost Concentric Ring with Gentle Pulse */}
            <div className="h-32 w-32 md:h-36 md:w-36 rounded-full border border-blue-300/35 bg-blue-400/5 flex items-center justify-center animate-pulse duration-1000">
              {/* Middle Concentric Ring */}
              <div className="h-25 w-25 md:h-28 md:w-28 rounded-full border border-blue-400/30 bg-blue-500/10 flex items-center justify-center">
                {/* Inner Concentric Ring */}
                <div className="h-19 w-19 md:h-21 md:w-21 rounded-full border border-blue-500/35 bg-blue-500/15 flex items-center justify-center">
                  {/* Central Microphone Button with Soft Glow */}
                  <button
                    type="button"
                    onClick={onMicClick}
                    className="relative flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 via-blue-500 to-sky-500 text-white shadow-[0_0_28px_rgba(37,99,235,0.45)] transition-all duration-200 hover:scale-105 hover:shadow-[0_0_35px_rgba(37,99,235,0.6)] active:scale-95 cursor-pointer"
                    aria-label="Tap to speak voice command"
                  >
                    <Mic className="h-7 w-7 md:h-8 md:w-8 text-white stroke-[2.3]" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Heading, Subtitle & White Translucent Container for Example Commands */}
          <div className="flex-1 w-full text-center md:text-left space-y-3">
            <div>
              <h3 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] tracking-tight leading-tight">
                Tap to Speak
              </h3>
              <p className="text-sm md:text-[15px] text-slate-500 font-medium mt-1">
                Say something like:
              </p>
            </div>

            {/* White/Light Translucent Rounded Container with Example Commands */}
            <div className="rounded-2xl border border-white/90 bg-white/80 backdrop-blur-xs p-4 md:p-4.5 shadow-xs">
              <div className="flex items-start gap-3">
                {/* Speech Bubble Icon */}
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 shrink-0 mt-0.5">
                  <MessageSquare className="h-4 w-4 stroke-[2.2]" />
                </div>

                {/* Example Voice Commands */}
                <div className="flex-1 text-left space-y-1 text-xs md:text-[13.5px] font-semibold text-slate-700 leading-relaxed">
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                    <span>&ldquo;Update rice count to 50&rdquo;</span>
                    <span className="text-slate-300 font-normal hidden sm:inline">|</span>
                    <span>&ldquo;Sold 5 packets of milk&rdquo;</span>
                  </div>
                  <div className="text-slate-600">
                    <span>&ldquo;2 kg sugar left&rdquo;</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default VoiceInteractionCard;
