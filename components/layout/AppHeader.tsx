'use client';

import React from 'react';
import { Menu } from 'lucide-react';

export interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  onToggleMobileMenu?: () => void;
  className?: string;
}

export function AppHeader({
  title = 'Welcome to TalkStock',
  subtitle = 'Manage your business inventory with the power of voice.',
  onToggleMobileMenu,
  className = '',
}: AppHeaderProps) {
  return (
    <header
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 md:mb-10 ${className}`}
    >
      <div className="flex items-start gap-3">
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            aria-label="Open navigation menu"
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-xs mt-1"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <div>
          <h2 className="text-3xl md:text-[32px] lg:text-[34px] font-bold text-[#0F172A] tracking-tight leading-tight">
            {title}
          </h2>
          <p className="text-sm md:text-[15px] text-slate-500 font-normal mt-1.5">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Upper-right Status Pill: Rounded pill shape, green circular indicator, Online text, white/light-green background */}
      <div className="flex items-center gap-2 self-start sm:self-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-white/90 px-3.5 py-1.5 shadow-xs transition-colors hover:bg-emerald-50/40">
          <span className="relative flex h-2.5 w-2.5 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs md:text-sm font-semibold tracking-tight text-slate-800">
            Online
          </span>
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
