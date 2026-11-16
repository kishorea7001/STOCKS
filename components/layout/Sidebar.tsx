'use client';

import React from 'react';
import {
  Home,
  Package,
  Gift,
  Bell,
  Settings,
  Info,
  Sun,
  ChevronDown,
  Boxes,
} from 'lucide-react';
import { VoiceStatusWidget } from '../ui/VoiceStatusWidget';

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
  className?: string;
}

export function Sidebar({
  activeItem = 'home',
  onSelectItem,
  className = '',
}: SidebarProps) {
  const navItems: NavItem[] = [
    { key: 'home', label: 'Home', icon: <Home className="h-5 w-5" /> },
    { key: 'products', label: 'Products', icon: <Package className="h-5 w-5" /> },
    { key: 'leftover', label: 'Leftover Stock', icon: <Gift className="h-5 w-5" /> },
    {
      key: 'alerts',
      label: 'Alerts',
      icon: <Bell className="h-5 w-5" />,
      badge: 2,
    },
    { key: 'settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
    { key: 'about', label: 'About', icon: <Info className="h-5 w-5" /> },
  ];

  return (
    <aside
      className={`w-60 md:w-64 shrink-0 bg-white border-r border-slate-200/70 flex flex-col justify-between h-full select-none z-20 ${className}`}
    >
      {/* Top Branding Section */}
      <div className="p-5 md:p-6 pb-2">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-md shadow-blue-500/25">
            <Boxes className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-tight">
              TalkStock
            </h1>
            <p className="text-[11px] font-medium text-slate-400 leading-tight mt-0.5">
              Smart Inventory,<br />
              Powered by Voice
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="mt-7 space-y-1.5" aria-label="Main Navigation">
          {navItems.map((item) => {
            const isActive = activeItem === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onSelectItem?.(item.key)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl md:rounded-2xl text-sm font-medium transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-500'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
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

      {/* Bottom Area: Voice Status & Theme Selector */}
      <div className="p-4 md:p-5 space-y-3 border-t border-slate-100">
        {/* Voice Status Widget */}
        <VoiceStatusWidget status="Voice Ready" hint="Say something..." />

        {/* Theme Selector */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50/80 border border-slate-200/60 text-slate-700 text-xs font-medium cursor-pointer hover:bg-slate-100/80 transition-colors">
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4 text-amber-500" />
            <span>Light Mode</span>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
