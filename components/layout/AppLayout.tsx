'use client';

import React, { useState } from 'react';
import { WindowBar } from './WindowBar';
import { Sidebar, NavItemKey } from './Sidebar';
import { X, Menu, Boxes } from 'lucide-react';

export interface AppLayoutProps {
  children: React.ReactNode;
  activeItem?: NavItemKey;
  onSelectItem?: (key: NavItemKey) => void;
  alertsCount?: number;
  isListening?: boolean;
  className?: string;
}

export function AppLayout({
  children,
  activeItem = 'home',
  onSelectItem,
  alertsCount,
  isListening = false,
  className = '',
}: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSelectItem = (key: NavItemKey) => {
    onSelectItem?.(key);
    setMobileMenuOpen(false);
  };

  return (
    <div
      className={`h-screen w-screen overflow-hidden flex flex-col bg-slate-900 font-sans text-slate-800 ${className}`}
    >
      {/* Top Desktop Window Bar */}
      <WindowBar title="TalkStock" />

      {/* Mobile Top Header Bar (Shown only on mobile viewports < md) */}
      <div className="md:hidden flex items-center justify-between px-4 py-2.5 bg-white border-b border-slate-200/80 shrink-0 z-20">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open sidebar navigation"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <Boxes className="h-5 w-5 text-blue-600" />
            <span className="font-bold text-slate-900 text-sm">TalkStock</span>
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50/50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Online</span>
        </div>
      </div>

      {/* Main Desktop/Tablet Container */}
      <div className="flex-1 flex overflow-hidden bg-slate-50 relative">
        {/* Desktop Fixed Left Sidebar (w-[220px]) */}
        <div className="hidden md:flex shrink-0 h-full">
          <Sidebar
            activeItem={activeItem}
            onSelectItem={handleSelectItem}
            alertsCount={alertsCount}
            isListening={isListening}
          />
        </div>

        {/* Mobile Navigation Drawer & Backdrop */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Slide-out Drawer */}
            <div className="relative flex w-[230px] flex-col bg-white shadow-2xl z-10 animate-in slide-in-from-left duration-200">
              <div className="absolute top-3.5 right-3.5 z-20">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close navigation drawer"
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <Sidebar
                activeItem={activeItem}
                onSelectItem={handleSelectItem}
                alertsCount={alertsCount}
                isListening={isListening}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-blue-50/40 relative">
          {/* Subtle Ambient Background Lighting Accents */}
          <div className="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-blue-100/40 blur-3xl" />
          <div className="pointer-events-none absolute top-1/2 -left-20 h-96 w-96 rounded-full bg-indigo-100/30 blur-3xl" />

          {/* Inner Content Container with Large Spacing & Page Transition */}
          <div className="relative z-10 max-w-7xl mx-auto p-5 sm:p-6 md:p-8 lg:p-10 animate-in fade-in duration-200">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
