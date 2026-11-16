'use client';

import React from 'react';
import {
  Boxes,
  AlertTriangle,
  Package,
  Zap,
  RotateCcw,
  RefreshCw,
  Settings,
  Mic,
  ArrowRight,
  TrendingUp,
  Clock,
  LayoutGrid,
} from 'lucide-react';
import { StatCard } from '../ui/StatCard';
import { Card } from '../ui/Card';
import { QuickActionTile } from '../ui/QuickActionTile';

export function OverviewPlaceholder() {
  return (
    <div className="space-y-6 md:space-y-8">
      {/* 1. Statistics Cards Row */}
      <section aria-label="Key Statistics">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          <StatCard
            label="Total Products"
            value="10"
            variant="blue"
            icon={<Boxes className="h-6 w-6" />}
          />
          <StatCard
            label="Low Stock Alerts"
            value="2"
            variant="green"
            icon={<AlertTriangle className="h-6 w-6" />}
          />
          <StatCard
            label="Inventory Details"
            value="401"
            variant="purple"
            icon={<Package className="h-6 w-6" />}
            linkText="View Details"
          />
        </div>
      </section>

      {/* 2. Quick Actions Card */}
      <section aria-label="Quick Actions">
        <Card
          title="Quick Actions"
          icon={<Zap className="h-5 w-5 text-amber-500 fill-amber-500" />}
          action={
            <button
              type="button"
              className="inline-flex items-center gap-1 text-xs md:text-sm font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              <span>See All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          }
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <QuickActionTile
              label="Reset Demo"
              variant="blue"
              icon={<RotateCcw className="h-5 w-5 text-blue-600" />}
            />
            <QuickActionTile
              label="Refresh"
              variant="green"
              icon={<RefreshCw className="h-5 w-5 text-emerald-600" />}
            />
            <QuickActionTile
              label="Settings"
              variant="purple"
              icon={<Settings className="h-5 w-5 text-purple-600" />}
            />
            <QuickActionTile
              label="Voice Command"
              variant="blue"
              icon={<Mic className="h-5 w-5 text-blue-600" />}
            />
          </div>
        </Card>
      </section>

      {/* 3. Voice Command Section */}
      <section aria-label="Voice Command Interaction">
        <div className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50/80 via-white to-indigo-50/60 p-6 md:p-8 shadow-[0_4px_24px_rgba(37,99,235,0.04)]">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
            {/* Left: Glowing Circular Microphone Button */}
            <div className="relative flex items-center justify-center shrink-0">
              {/* Concentric glowing rings */}
              <div className="absolute h-28 w-28 rounded-full bg-blue-400/10 animate-ping opacity-75" />
              <div className="absolute h-24 w-24 rounded-full bg-blue-500/15" />
              <button
                type="button"
                className="relative flex h-18 w-18 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                aria-label="Tap to speak voice command"
              >
                <Mic className="h-8 w-8" />
              </button>
            </div>

            {/* Right: Tap to Speak text & Example commands */}
            <div className="flex-1 text-center md:text-left space-y-2.5">
              <div>
                <h3 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
                  Tap to Speak
                </h3>
                <p className="text-xs md:text-sm text-slate-500 font-medium">
                  Say something like:
                </p>
              </div>

              {/* Sample Command Chips Container */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
                <span className="inline-flex items-center rounded-xl bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs border border-blue-100/80">
                  &ldquo;Update rice count to 50&rdquo;
                </span>
                <span className="inline-flex items-center rounded-xl bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs border border-blue-100/80">
                  &ldquo;Sold 5 packets of milk&rdquo;
                </span>
                <span className="inline-flex items-center rounded-xl bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs border border-blue-100/80">
                  &ldquo;2 kg sugar left&rdquo;
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Modular Dashboard Content Slots (Placeholder Framework) */}
      <section aria-label="Dashboard Framework">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Visual Slot */}
          <div className="lg:col-span-2">
            <Card
              title="Dashboard Overview"
              subtitle="Performance and inventory movement trends"
              icon={<TrendingUp className="h-5 w-5 text-blue-600" />}
              action={
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
                  This Month
                </span>
              }
            >
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100/70 text-blue-600 mb-3">
                  <LayoutGrid className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-semibold text-slate-800">
                  Dashboard Analytics Area
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Ready for interactive charts, stock level timelines, and automated business insights.
                </p>
              </div>
            </Card>
          </div>

          {/* Activity Slot */}
          <div className="lg:col-span-1">
            <Card
              title="Recent Activity"
              subtitle="Latest voice updates"
              icon={<Clock className="h-5 w-5 text-purple-600" />}
            >
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100/70 text-purple-600 mb-3">
                  <Clock className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-semibold text-slate-800">
                  Activity Feed Area
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  Ready for live transaction logs, audit history, and low-stock notification feeds.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

export default OverviewPlaceholder;
