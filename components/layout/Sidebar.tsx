'use client';

import React from 'react';
import Link from 'next/link';
import {
  Home,
  Box,
  Gift,
  Bell,
  Settings,
  Info,
  Sun,
  Moon,
  Mic,
  Globe,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export type NavItemKey =
  | 'home'
  | 'products'
  | 'leftover'
  | 'alerts'
  | 'settings'
  | 'about';

export interface NavItem {
  key: NavItemKey;
  label: string;
  icon: React.ReactNode;
  badge?: number | string;
}

export interface SidebarProps {
  activeItem?: NavItemKey;
  onSelectItem?: (key: NavItemKey) => void;
  alertsCount?: number;
  isListening?: boolean;
  onOpenVoice?: () => void;
  className?: string;
}

/**
 * 3D Isometric Blue Cube Logo Icon matching the TalkStock design reference
 */
function BlueCubeLogo({ className = 'h-11 w-11' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={44}
      height={44}
      style={{ width: 44, height: 44, maxWidth: 44, maxHeight: 44 }}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Top Rhombus Face */}
      <path
        d="M32 7L54 19.5L32 32L10 19.5L32 7Z"
        fill="url(#ts-cube-top)"
        stroke="#3B82F6"
        strokeWidth="1.5"
      />
      {/* Left Rhombus Face */}
      <path
        d="M10 19.5L32 32V57L10 44.5V19.5Z"
        fill="url(#ts-cube-left)"
        stroke="#2563EB"
        strokeWidth="1.5"
      />
      {/* Right Rhombus Face */}
      <path
        d="M32 32L54 19.5V44.5L32 57V32Z"
        fill="url(#ts-cube-right)"
        stroke="#1D4ED8"
        strokeWidth="1.5"
      />
      {/* Subtle Inner Highlight */}
      <path
        d="M32 14L46 22L32 30L18 22L32 14Z"
        fill="#93C5FD"
        fillOpacity="0.45"
      />
      <defs>
        <linearGradient
          id="ts-cube-top"
          x1="10"
          y1="7"
          x2="54"
          y2="32"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#60A5FA" />
          <stop offset="1" stopColor="#3B82F6" />
        </linearGradient>
        <linearGradient
          id="ts-cube-left"
          x1="10"
          y1="19.5"
          x2="32"
          y2="57"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#3B82F6" />
          <stop offset="1" stopColor="#2563EB" />
        </linearGradient>
        <linearGradient
          id="ts-cube-right"
          x1="54"
          y1="19.5"
          x2="32"
          y2="57"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#2563EB" />
          <stop offset="1" stopColor="#1E40AF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Sidebar({
  activeItem = 'home',
  onSelectItem,
  alertsCount,
  isListening = false,
  onOpenVoice,
  className = '',
}: SidebarProps) {
  const { isDark, toggleTheme } = useTheme();

  const navItems: NavItem[] = [
    {
      key: 'home',
      label: 'Home',
      icon: <Home className="h-[18px] w-[18px]" />,
    },
    {
      key: 'products',
      label: 'Products',
      icon: <Box className="h-[18px] w-[18px]" />,
    },
    {
      key: 'leftover',
      label: 'Leftover Stock',
      icon: <Gift className="h-[18px] w-[18px]" />,
    },
    {
      key: 'alerts',
      label: 'Alerts',
      icon: <Bell className="h-[18px] w-[18px]" />,
      badge: typeof alertsCount === 'number' ? alertsCount : 2,
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: <Settings className="h-[18px] w-[18px]" />,
    },
    {
      key: 'about',
      label: 'About',
      icon: <Info className="h-[18px] w-[18px]" />,
    },
  ];

  return (
    <aside
      className={`w-[220px] shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200/70 dark:border-slate-800 flex flex-col justify-between h-full select-none z-20 transition-colors duration-200 ${className}`}
    >
      {/* Top Branding & Navigation */}
      <div className="pt-6 pb-2 px-3.5 flex flex-col items-center">
        {/* Top Logo Section: Centered 3D Cube, Bold Title, Subtitle */}
        <Link href="/" title="Go to KV Freight Landing Page" className="flex flex-col items-center text-center group transition-transform hover:scale-[1.02]">
          <div className="filter drop-shadow-md">
            <BlueCubeLogo className="h-12 w-12" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight mt-2.5 group-hover:text-blue-600 transition-colors">
            TalkStock
          </h1>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-tight mt-1 text-center">
            Smart Inventory,<br />
            Powered by Voice
          </p>
        </Link>

        {/* Navigation Items (approx 220px layout) */}
        <nav
          className="mt-6 w-full space-y-1"
          aria-label="Sidebar Navigation"
        >
          {navItems.map((item) => {
            const isActive = activeItem === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onSelectItem?.(item.key)}
                className={`group w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white font-medium shadow-md shadow-blue-500/25'
                    : 'bg-transparent text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/70 dark:hover:bg-slate-800 font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`shrink-0 transition-colors ${
                      isActive
                        ? 'text-white'
                        : 'text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="text-[13.5px] tracking-tight">
                    {item.label}
                  </span>
                </div>

                {item.badge !== undefined && Number(item.badge) > 0 && (
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold shadow-xs ${
                      isActive
                        ? 'bg-white text-blue-600'
                        : 'bg-rose-500 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Area: Voice Status Card & Theme Selector */}
      <div className="p-3.5 space-y-2.5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors duration-200">
        {/* Voice Status Card */}
        <div
          onClick={onOpenVoice}
          role="button"
          tabIndex={0}
          aria-label="Open Voice Assistant"
          className={`rounded-2xl border p-3.5 shadow-xs flex flex-col items-center text-center transition-all cursor-pointer hover:scale-[1.02] hover:shadow-md ${
            isListening
              ? 'border-blue-400 dark:border-blue-500 bg-gradient-to-b from-blue-100/90 via-white to-blue-50 dark:from-slate-800 dark:via-slate-850 dark:to-slate-800 ring-2 ring-blue-300 dark:ring-blue-700'
              : 'border-blue-100/80 dark:border-slate-800 bg-gradient-to-b from-blue-50/50 via-white to-blue-50/30 dark:from-slate-800/60 dark:via-slate-800/30 dark:to-slate-800/50 hover:border-blue-300 dark:hover:border-slate-700'
          }`}
        >
          {/* Microphone Icon in subtle soft blue badge */}
          <div className={`flex h-10 w-10 items-center justify-center rounded-full mb-1.5 shadow-xs border transition-all ${
            isListening
              ? 'bg-blue-600 text-white border-blue-600 scale-105 animate-pulse'
              : 'bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 border-blue-100/60 dark:border-slate-700'
          }`}>
            <Mic className="h-5 w-5" />
          </div>

          <h3 className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">
            {isListening ? 'Listening...' : 'Voice Ready'}
          </h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-400 font-medium mt-0.5">
            {isListening ? 'Speak now...' : 'Say something...'}
          </p>

          {/* Small Blue Audio Waveform Underneath */}
          <div
            className="mt-2.5 flex items-center justify-center gap-1 h-5 px-2"
            aria-hidden="true"
          >
            <span className={`w-1 rounded-full bg-blue-400 animate-pulse [animation-delay:0ms] ${isListening ? 'h-3.5 bg-blue-600' : 'h-2'}`} />
            <span className={`w-1 rounded-full bg-blue-500 animate-pulse [animation-delay:150ms] ${isListening ? 'h-5 bg-blue-600' : 'h-3.5'}`} />
            <span className={`w-1 rounded-full bg-blue-600 animate-pulse [animation-delay:300ms] ${isListening ? 'h-6 bg-blue-700' : 'h-5'}`} />
            <span className={`w-1 rounded-full bg-blue-500 animate-pulse [animation-delay:180ms] ${isListening ? 'h-5 bg-blue-600' : 'h-3'}`} />
            <span className={`w-1 rounded-full bg-blue-600 animate-pulse [animation-delay:420ms] ${isListening ? 'h-6 bg-blue-700' : 'h-4.5'}`} />
            <span className={`w-1 rounded-full bg-blue-400 animate-pulse [animation-delay:90ms] ${isListening ? 'h-4 bg-blue-600' : 'h-2.5'}`} />
            <span className={`w-1 rounded-full bg-blue-500 animate-pulse [animation-delay:260ms] ${isListening ? 'h-5 bg-blue-600' : 'h-4'}`} />
          </div>
        </div>

        {/* Interactive Theme Selector Button */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors cursor-pointer text-slate-700 dark:text-slate-200"
        >
          <div className="flex items-center gap-2">
            {isDark ? (
              <Moon className="h-4 w-4 text-indigo-400 fill-indigo-400 shrink-0" />
            ) : (
              <Sun className="h-4 w-4 text-amber-500 fill-amber-400 shrink-0" />
            )}
            <span className="text-xs font-semibold tracking-tight text-slate-800 dark:text-slate-200">
              {isDark ? 'Dark Mode' : 'Light Mode'}
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-600">
            {isDark ? 'Dark' : 'Light'}
          </span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
