'use client';

import React from 'react';
import { Minus, Square, X, Boxes } from 'lucide-react';

export interface WindowBarProps {
  title?: string;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
  className?: string;
}

export function WindowBar({
  title = 'TalkStock',
  onMinimize,
  onMaximize,
  onClose,
  className = '',
}: WindowBarProps) {
  return (
    <header
      className={`h-9 w-full bg-slate-900 dark:bg-slate-950 text-slate-300 flex items-center justify-between px-3 select-none text-xs border-b border-slate-800/80 dark:border-slate-850 z-30 shrink-0 transition-colors ${className}`}
    >
      {/* Left: App Identity */}
      <div className="flex items-center gap-2">
        <div className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-600 text-white">
          <Boxes className="h-3 w-3" />
        </div>
        <span className="font-semibold text-slate-200 tracking-tight">{title}</span>
        <span className="text-slate-500 hidden sm:inline text-[11px]">
          — Desktop Application
        </span>
      </div>

      {/* Right: Window Controls */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={onMinimize}
          aria-label="Minimize window"
          className="flex h-7 w-9 items-center justify-center hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onMaximize}
          aria-label="Maximize window"
          className="flex h-7 w-9 items-center justify-center hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <Square className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close window"
          className="flex h-7 w-9 items-center justify-center hover:bg-rose-600 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </header>
  );
}

export default WindowBar;
