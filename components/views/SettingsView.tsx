'use client';

import React, { useState } from 'react';
import { Settings, Mic, ShieldCheck, Sun, Moon } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useTheme } from '../../context/ThemeContext';

export function SettingsView({ className = '' }: { className?: string }) {
  const { theme, setTheme, isDark } = useTheme();
  const [dialect, setDialect] = useState('Hinglish');
  const [soundEffects, setSoundEffects] = useState(true);
  const [threshold, setThreshold] = useState(25);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Voice & AI Configuration Card */}
      <Card
        title="Voice & Speech Settings"
        subtitle="Configure speech dialect, input sensitivity, and audio triggers"
        icon={<Mic className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
      >
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Speech Recognition Dialect</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Support natural mix of Hindi and English numbers & words
              </p>
            </div>
            <div className="flex gap-2">
              {['English', 'Hindi', 'Hinglish'].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setDialect(mode)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    dialect === mode
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Audio Confirmations</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Play sound cue when voice command is recognized
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSoundEffects(!soundEffects)}
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                soundEffects ? 'bg-blue-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
              }`}
            >
              <span className="bg-white w-4 h-4 rounded-full shadow-md" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Low Stock Alert Threshold</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Notify when an item drops to or below this quantity
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="100"
                value={threshold}
                onChange={(e) => setThreshold(parseInt(e.target.value) || 1)}
                className="w-20 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-center text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Units</span>
            </div>
          </div>
        </div>
      </Card>

      {/* General Settings */}
      <Card
        title="Application Preferences"
        subtitle="Theme, currency, and sync options"
        icon={<Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              {isDark ? (
                <Moon className="h-4 w-4 text-indigo-400 fill-indigo-400" />
              ) : (
                <Sun className="h-4 w-4 text-amber-500 fill-amber-400" />
              )}
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Interface Theme</p>
                <p className="text-xs text-slate-400">Choose between light and dark visual mode</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <Sun className="h-3.5 w-3.5 text-amber-500" />
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <Moon className="h-3.5 w-3.5 text-indigo-300" />
                <span>Dark</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Primary Currency</span>
            <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-xl border border-slate-200/60 dark:border-slate-700">
              ₹ INR (Indian Rupee)
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Auto Database Backup</span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Enabled (Daily)</span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          {saved && (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="h-4 w-4" />
              Settings Saved!
            </span>
          )}
          <Button variant="primary" size="md" onClick={handleSave}>
            Save Preferences
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default SettingsView;
