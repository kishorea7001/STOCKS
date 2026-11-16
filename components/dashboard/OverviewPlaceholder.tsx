'use client';

import React from 'react';
import {
  Box,
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
import { VoiceInteractionCard } from './VoiceInteractionCard';

export function OverviewPlaceholder() {
  return (
    <div className="space-y-6 md:space-y-8">
      {/* 1. Statistics Cards Row (Equal Height, Perfectly Aligned) */}
      <section aria-label="Key Statistics">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 items-stretch">
          {/* Card 1: Total Products */}
          <StatCard
            title="Total Products"
            number="10"
            variant="blue"
            icon={<Box className="h-6 w-6 text-blue-600" />}
          />

          {/* Card 2: Low Stock Alerts */}
          <StatCard
            title="Low Stock Alerts"
            number="2"
            variant="green"
            icon={<AlertTriangle className="h-6 w-6 text-emerald-600" />}
          />

          {/* Card 3: 401 / View Details → */}
          <StatCard
            number="401"
            linkText="View Details →"
            variant="purple"
            icon={<Package className="h-6 w-6 text-purple-600" />}
          />
        </div>
      </section>

      {/* 2. Quick Actions Card */}
      <section aria-label="Quick Actions">
        <Card
          title="Quick Actions"
          icon={<Zap className="h-5 w-5 text-amber-500 fill-amber-400" />}
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {/* Button 1: Reset Demo (Light blue bg, blue icon/text) */}
            <QuickActionTile
              label="Reset Demo"
              variant="blue"
              icon={<RotateCcw className="h-8 w-8 stroke-[2.2]" />}
            />

            {/* Button 2: Refresh (Light green bg, green icon/text) */}
            <QuickActionTile
              label="Refresh"
              variant="green"
              icon={<RefreshCw className="h-8 w-8 stroke-[2.2]" />}
            />

            {/* Button 3: Settings (Light purple bg, purple icon/text) */}
            <QuickActionTile
              label="Settings"
              variant="purple"
              icon={<Settings className="h-8 w-8 stroke-[2.2]" />}
            />

            {/* Button 4: Voice Command (Light blue bg, blue icon/text) */}
            <QuickActionTile
              label="Voice Command"
              variant="blue"
              icon={<Mic className="h-8 w-8 stroke-[2.2]" />}
            />
          </div>
        </Card>
      </section>

      {/* 3. Large Prominent Voice Interaction Card */}
      <VoiceInteractionCard />

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
