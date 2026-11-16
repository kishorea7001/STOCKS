'use client';

import React, { useState } from 'react';
import { Settings, Mic, ShieldCheck, Sun } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export function SettingsView({ className = '' }: { className?: string }) {
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
        icon={<Mic className="h-5 w-5 text-blue-600" />}
      >
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <p className="text-sm font-bold text-slate-900">Speech Recognition Dialect</p>
              <p className="text-xs text-slate-500 mt-0.5">
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
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <p className="text-sm font-bold text-slate-900">Audio Confirmations</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Play sound cue when voice command is recognized
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSoundEffects(!soundEffects)}
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                soundEffects ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <span className="bg-white w-4 h-4 rounded-full shadow-md" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-slate-900">Low Stock Alert Threshold</p>
              <p className="text-xs text-slate-500 mt-0.5">
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
                className="w-20 px-3 py-1.5 rounded-xl border border-slate-200 text-sm font-bold text-center text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <span className="text-xs font-semibold text-slate-500">Units</span>
            </div>
          </div>
        </div>
      </Card>

      {/* General Settings */}
      <Card
        title="Application Preferences"
        subtitle="Theme, currency, and sync options"
        icon={<Settings className="h-5 w-5 text-purple-600" />}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <Sun className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium text-slate-800">Interface Theme</span>
            </div>
            <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-xl">
              Light Mode
            </span>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-sm font-medium text-slate-800">Primary Currency</span>
            <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-xl">
              ₹ INR (Indian Rupee)
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-800">Auto Database Backup</span>
            <span className="text-xs font-semibold text-emerald-600">Enabled (Daily)</span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          {saved && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
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
