'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { AppHeader } from '@/components/layout/AppHeader';
import { NavItemKey } from '@/components/layout/Sidebar';
import { OverviewPlaceholder } from '@/components/dashboard/OverviewPlaceholder';
import { Card } from '@/components/ui/Card';
import { Package, Gift, Bell, Settings, Info } from 'lucide-react';

export default function TalkStockApp() {
  const [activeTab, setActiveTab] = useState<NavItemKey>('home');

  return (
    <AppLayout activeItem={activeTab} onSelectItem={setActiveTab}>
      <AppHeader
        title={
          activeTab === 'home'
            ? 'Welcome to TalkStock'
            : activeTab === 'products'
            ? 'Products Inventory'
            : activeTab === 'leftover'
            ? 'Leftover Stock'
            : activeTab === 'alerts'
            ? 'Inventory Alerts'
            : activeTab === 'settings'
            ? 'Application Settings'
            : 'About TalkStock'
        }
        subtitle={
          activeTab === 'home'
            ? 'Manage your business inventory with the power of voice.'
            : activeTab === 'products'
            ? 'Manage all your catalog items, units, and reorder levels.'
            : activeTab === 'leftover'
            ? 'Review end-of-day leftover stock and surplus inventory.'
            : activeTab === 'alerts'
            ? 'Real-time alerts for low stock and depleted items.'
            : activeTab === 'settings'
            ? 'Configure voice models, currency, and notifications.'
            : 'Voice-first inventory intelligence for modern businesses.'
        }
      />

      {/* View routing based on active sidebar tab */}
      {activeTab === 'home' && <OverviewPlaceholder />}

      {activeTab === 'products' && (
        <Card
          title="Products Catalog"
          subtitle="View and manage store stock levels"
          icon={<Package className="h-5 w-5 text-blue-600" />}
        >
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100/70 text-blue-600 mb-4">
              <Package className="h-7 w-7" />
            </div>
            <h4 className="text-base font-semibold text-slate-800">
              Products Management View
            </h4>
            <p className="text-xs md:text-sm text-slate-500 max-w-md mt-1.5">
              This section will contain the full searchable products catalog, stock adjustments, batch editing, and category filters.
            </p>
          </div>
        </Card>
      )}

      {activeTab === 'leftover' && (
        <Card
          title="Leftover Stock"
          subtitle="End of day remaining stock tracker"
          icon={<Gift className="h-5 w-5 text-emerald-600" />}
        >
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100/70 text-emerald-600 mb-4">
              <Gift className="h-7 w-7" />
            </div>
            <h4 className="text-base font-semibold text-slate-800">
              Leftover Stock View
            </h4>
            <p className="text-xs md:text-sm text-slate-500 max-w-md mt-1.5">
              Quickly register remaining stock after daily closing or reconcile physical counts with voice commands.
            </p>
          </div>
        </Card>
      )}

      {activeTab === 'alerts' && (
        <Card
          title="Stock Alerts"
          subtitle="Items requiring replenishment"
          icon={<Bell className="h-5 w-5 text-rose-600" />}
        >
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100/70 text-rose-600 mb-4">
              <Bell className="h-7 w-7" />
            </div>
            <h4 className="text-base font-semibold text-slate-800">
              Alerts & Notifications
            </h4>
            <p className="text-xs md:text-sm text-slate-500 max-w-md mt-1.5">
              Items at or below reorder threshold appear here with instant vendor reorder shortcuts and automated warnings.
            </p>
          </div>
        </Card>
      )}

      {activeTab === 'settings' && (
        <Card
          title="Settings"
          subtitle="System preferences and configurations"
          icon={<Settings className="h-5 w-5 text-purple-600" />}
        >
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100/70 text-purple-600 mb-4">
              <Settings className="h-7 w-7" />
            </div>
            <h4 className="text-base font-semibold text-slate-800">
              Application Settings
            </h4>
            <p className="text-xs md:text-sm text-slate-500 max-w-md mt-1.5">
              Configure speech recognition dialects (English, Hindi, Hinglish), voice models, notifications, and printer integrations.
            </p>
          </div>
        </Card>
      )}

      {activeTab === 'about' && (
        <Card
          title="About TalkStock"
          subtitle="Voice-first inventory intelligence"
          icon={<Info className="h-5 w-5 text-blue-600" />}
        >
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100/70 text-blue-600 mb-4">
              <Info className="h-7 w-7" />
            </div>
            <h4 className="text-base font-semibold text-slate-800">
              TalkStock Desktop v1.0
            </h4>
            <p className="text-xs md:text-sm text-slate-500 max-w-md mt-1.5">
              Designed for retail merchants, grocers, and warehouses to effortlessly manage stocks through speech and AI.
            </p>
          </div>
        </Card>
      )}
    </AppLayout>
  );
}
