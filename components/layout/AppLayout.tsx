'use client';

import React, { useState } from 'react';
import { WindowBar } from './WindowBar';
import { Sidebar, NavItemKey } from './Sidebar';
import { X } from 'lucide-react';

export interface AppLayoutProps {
  children: React.ReactNode;
  activeItem?: NavItemKey;
  onSelectItem?: (key: NavItemKey) => void;
  className?: string;
}

export function AppLayout({
  children,
  activeItem = 'home',
  onSelectItem,
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

      {/* Main Desktop Container */}
      <div className="flex-1 flex overflow-hidden bg-slate-50 relative">
        {/* Desktop Fixed Left Sidebar */}
        <div className="hidden md:flex shrink-0 h-full">
          <Sidebar activeItem={activeItem} onSelectItem={handleSelectItem} />
        </div>

        {/* Mobile Navigation Drawer & Backdrop */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <div className="relative flex w-[220px] flex-col bg-white shadow-2xl z-10">
              <div className="absolute top-4 right-4 z-20">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <Sidebar activeItem={activeItem} onSelectItem={handleSelectItem} />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-blue-50/40 relative">
          {/* Subtle Ambient Background Accents */}
          <div className="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-blue-100/40 blur-3xl" />
          <div className="pointer-events-none absolute top-1/2 -left-20 h-96 w-96 rounded-full bg-indigo-100/30 blur-3xl" />

          {/* Inner Content Container with Large Spacing */}
          <div className="relative z-10 max-w-7xl mx-auto p-6 md:p-8 lg:p-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
