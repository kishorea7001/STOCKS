import React from 'react';
import { Mic } from 'lucide-react';

export interface VoiceStatusWidgetProps {
  status?: string;
  hint?: string;
  isListening?: boolean;
  className?: string;
}

export function VoiceStatusWidget({
  status = 'Voice Ready',
  hint = 'Say something...',
  isListening = false,
  className = '',
}: VoiceStatusWidgetProps) {
  return (
    <div
      className={`rounded-2xl border border-blue-100/70 bg-gradient-to-br from-blue-50/70 to-indigo-50/40 p-4 shadow-xs ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/25">
          <Mic className="h-5 w-5" />
          {isListening && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-rose-500" />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs md:text-sm font-semibold text-slate-800 leading-tight">
            {status}
          </p>
          <p className="text-xs text-slate-500 truncate mt-0.5">{hint}</p>
        </div>
      </div>

      {/* Animated audio waveform bars */}
      <div className="mt-3 flex items-center justify-center gap-1 h-5 px-2">
        <span className="h-2 w-1 rounded-full bg-blue-400 animate-pulse [animation-delay:0ms]" />
        <span className="h-3 w-1 rounded-full bg-blue-500 animate-pulse [animation-delay:150ms]" />
        <span className="h-4 w-1 rounded-full bg-blue-600 animate-pulse [animation-delay:300ms]" />
        <span className="h-3 w-1 rounded-full bg-blue-500 animate-pulse [animation-delay:200ms]" />
        <span className="h-5 w-1 rounded-full bg-blue-600 animate-pulse [animation-delay:400ms]" />
        <span className="h-2 w-1 rounded-full bg-blue-400 animate-pulse [animation-delay:100ms]" />
        <span className="h-4 w-1 rounded-full bg-blue-500 animate-pulse [animation-delay:250ms]" />
      </div>
    </div>
  );
}

export default VoiceStatusWidget;
