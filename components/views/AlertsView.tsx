'use client';

import React from 'react';
import { Bell, AlertTriangle, CheckCircle2, Plus } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ProductItem } from './ProductsView';

export interface AlertsViewProps {
  products: ProductItem[];
  onRestockItem?: (productId: string, amount: number) => void;
  onRestockAll?: () => void;
  className?: string;
}

export function AlertsView({
  products = [],
  onRestockItem,
  onRestockAll,
  className = '',
}: AlertsViewProps) {
  const safeProducts = Array.isArray(products) ? products : [];
  // Items with low stock (threshold of <= 20 units)
  const lowStockItems = safeProducts.filter((p) => p.currentStock <= 20);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Alert Summary Banner */}
      <div className="rounded-2xl md:rounded-3xl border border-rose-200/80 dark:border-rose-900/60 bg-gradient-to-r from-rose-50/90 via-amber-50/40 to-white/95 dark:from-slate-900 dark:via-rose-950/30 dark:to-slate-900 p-6 shadow-xs flex items-center justify-between flex-wrap gap-4 transition-colors">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-sm shadow-rose-500/25">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {lowStockItems.length === 0
                ? 'All Stock Levels Normal'
                : `${lowStockItems.length} Products Need Replenishment`}
            </h3>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {lowStockItems.length === 0
                ? 'All products are above the minimum threshold of 20 units. Sidebar alert badge cleared.'
                : 'Items at or below minimum threshold of 20 units.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {lowStockItems.length > 0 && onRestockAll && (
            <Button
              variant="primary"
              size="sm"
              onClick={onRestockAll}
              icon={<CheckCircle2 className="h-4 w-4" />}
              className="shadow-sm shadow-blue-500/20"
            >
              Restock All ({lowStockItems.length})
            </Button>
          )}

          {lowStockItems.length > 0 ? (
            <Badge variant="danger" size="md" dot pulse>
              Action Required
            </Badge>
          ) : (
            <Badge variant="success" size="md">
              Healthy
            </Badge>
          )}
        </div>
      </div>

      {/* Alert Items List */}
      <Card
        title="Active Stock Alerts"
        subtitle="Replenish depleted inventory before items run out"
        icon={<Bell className="h-5 w-5 text-rose-600 dark:text-rose-400" />}
      >
        {lowStockItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-3" />
            <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
              All Stock Levels Healthy!
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
              No items currently require urgent replenishment.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {lowStockItems.map((item) => {
              const isOut = item.currentStock <= 0;

              return (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-rose-100 dark:border-slate-800 bg-rose-50/30 dark:bg-slate-800/40 hover:bg-rose-50/50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 flex items-center justify-center rounded-xl font-bold text-sm ${
                        isOut
                          ? 'bg-rose-600 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {item.currentStock}
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {item.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Category: {item.category} • Unit: {item.unit}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        isOut
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                          : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                      }`}
                    >
                      {isOut ? 'Depleted' : 'Low Stock'}
                    </span>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onRestockItem?.(item.id, 20)}
                      icon={<Plus className="h-3.5 w-3.5" />}
                    >
                      Restock +20
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

export default AlertsView;
