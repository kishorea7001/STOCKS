'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, Sun, Moon, Globe } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

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
  const { isDark, toggleTheme } = useTheme();

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
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 shadow-xs mt-1 cursor-pointer"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <div>
          <h2 className="text-3xl md:text-[32px] lg:text-[34px] font-bold text-[#0F172A] dark:text-white tracking-tight leading-tight">
            {title}
          </h2>
          <p className="text-sm md:text-[15px] text-slate-500 dark:text-slate-400 font-normal mt-1.5">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Upper-right Status & Quick Navigation */}
      <div className="flex items-center gap-2.5 self-start sm:self-center">
        {/* Link back to KV Landing / 3D Globe */}
        <Link
          href="/"
          title="Return to KV Freight 3D Globe & Overview"
          className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-50/80 dark:bg-blue-950/40 px-3.5 py-1.5 text-xs md:text-sm font-semibold text-[#2f63ff] dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors shadow-xs"
        >
          <Globe className="h-4 w-4 text-[#2f63ff]" />
          <span>KV Freight Home</span>
        </Link>

        {/* Quick Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 px-3 py-1.5 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer text-slate-700 dark:text-slate-200"
        >
          {isDark ? (
            <Moon className="h-4 w-4 text-indigo-400 fill-indigo-400" />
          ) : (
            <Sun className="h-4 w-4 text-amber-500 fill-amber-400" />
          )}
          <span className="text-xs md:text-sm font-semibold tracking-tight">
            {isDark ? 'Dark' : 'Light'}
          </span>
        </button>

        {/* Online Status Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 dark:border-emerald-500/30 bg-white/90 dark:bg-slate-900/90 px-3.5 py-1.5 shadow-xs transition-colors hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20">
          <span className="relative flex h-2.5 w-2.5 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs md:text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-200">
            Online
          </span>
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
