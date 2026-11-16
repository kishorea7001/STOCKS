'use client';

import React from 'react';
import { Menu, Sparkles } from 'lucide-react';
import { Badge } from '../ui/Badge';

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
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 md:pb-8 ${className}`}
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
          <div className="flex items-center gap-2">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              {title}
            </h2>
            <Sparkles className="h-5 w-5 text-amber-400 hidden sm:inline-block animate-pulse" />
          </div>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 self-start sm:self-center">
        <Badge
          variant="success"
          size="md"
          dot
          pulse
          className="shadow-xs bg-white/90 border-emerald-200 text-emerald-700 font-semibold"
        >
          Online
        </Badge>
      </div>
    </header>
  );
}

export default AppHeader;
