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

export interface OverviewPlaceholderProps {
  totalProductsCount?: number;
  lowStockCount?: number;
  totalStockSum?: number;
  onResetDemo?: () => void;
  onRefresh?: () => void;
  onOpenSettings?: () => void;
  onVoiceCommand?: () => void;
  onViewDetails?: () => void;
  isListening?: boolean;
  onMicClick?: () => void;
  onSelectExample?: (cmd: string) => void;
  loadingReset?: boolean;
  loadingRefresh?: boolean;
}

export function OverviewPlaceholder({
  totalProductsCount = 10,
  lowStockCount = 2,
  totalStockSum = 401,
  onResetDemo,
  onRefresh,
  onOpenSettings,
  onVoiceCommand,
  onViewDetails,
  isListening = false,
  onMicClick,
  onSelectExample,
  loadingReset = false,
  loadingRefresh = false,
}: OverviewPlaceholderProps) {
  return (
    <div className="space-y-6 md:space-y-8">
      {/* 1. Statistics Cards Row (Equal Height, Perfectly Aligned) */}
      <section aria-label="Key Statistics">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 items-stretch">
          {/* Card 1: Total Products */}
          <StatCard
            title="Total Products"
            number={totalProductsCount}
            variant="blue"
            icon={<Box className="h-6 w-6 text-blue-600" />}
          />

          {/* Card 2: Low Stock Alerts */}
          <StatCard
            title="Low Stock Alerts"
            number={lowStockCount}
            variant="green"
            icon={<AlertTriangle className="h-6 w-6 text-emerald-600" />}
          />

          {/* Card 3: 401 / View Details → */}
          <StatCard
            number={totalStockSum}
            linkText="View Details →"
            onLinkClick={onViewDetails}
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
              onClick={onViewDetails}
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
              label={loadingReset ? 'Resetting...' : 'Reset Demo'}
              variant="blue"
              onClick={onResetDemo}
              disabled={loadingReset}
              icon={
                <RotateCcw
                  className={`h-8 w-8 stroke-[2.2] ${
                    loadingReset ? 'animate-spin' : ''
                  }`}
                />
              }
            />

            {/* Button 2: Refresh (Light green bg, green icon/text) */}
            <QuickActionTile
              label={loadingRefresh ? 'Refreshing...' : 'Refresh'}
              variant="green"
              onClick={onRefresh}
              disabled={loadingRefresh}
              icon={
                <RefreshCw
                  className={`h-8 w-8 stroke-[2.2] ${
                    loadingRefresh ? 'animate-spin' : ''
                  }`}
                />
              }
            />

            {/* Button 3: Settings (Light purple bg, purple icon/text) */}
            <QuickActionTile
              label="Settings"
              variant="purple"
              onClick={onOpenSettings}
              icon={<Settings className="h-8 w-8 stroke-[2.2]" />}
            />

            {/* Button 4: Voice Command (Light blue bg, blue icon/text) */}
            <QuickActionTile
              label={isListening ? 'Listening...' : 'Voice Command'}
              variant="blue"
              onClick={onVoiceCommand || onMicClick}
              icon={
                <Mic
                  className={`h-8 w-8 stroke-[2.2] ${
                    isListening ? 'animate-bounce text-blue-700' : ''
                  }`}
                />
              }
            />
          </div>
        </Card>
      </section>

      {/* 3. Large Prominent Voice Interaction Card */}
      <VoiceInteractionCard
        isListening={isListening}
        onMicClick={onMicClick}
        onSelectExample={onSelectExample}
      />

      {/* 4. Dashboard Overview Smooth Line Chart Card */}
      <DashboardOverviewCard />
    </div>
  );
}

export default OverviewPlaceholder;
