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
} from 'lucide-react';
import { StatCard } from '../ui/StatCard';
import { Card } from '../ui/Card';
import { QuickActionTile } from '../ui/QuickActionTile';
import { VoiceInteractionCard } from './VoiceInteractionCard';
import { DashboardOverviewCard } from './DashboardOverviewCard';

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

      {/* 4. Dashboard Overview Smooth Line Chart Card */}
      <DashboardOverviewCard />
    </div>
  );
}

export default OverviewPlaceholder;
