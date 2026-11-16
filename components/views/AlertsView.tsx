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
  className?: string;
}

export function AlertsView({
  products,
  onRestockItem,
  className = '',
}: AlertsViewProps) {
  // Items with low stock (e.g. <= 25 units)
  const lowStockItems = products.filter((p) => p.currentStock <= 25);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Alert Summary Banner */}
      <div className="rounded-2xl md:rounded-3xl border border-rose-200/80 bg-gradient-to-r from-rose-50/90 via-amber-50/40 to-white/95 p-6 shadow-xs flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-sm shadow-rose-500/25">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {lowStockItems.length} Products Need Replenishment
            </h3>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
              Items at or below minimum threshold of 25 units.
            </p>
          </div>
        </div>

        <Badge variant="danger" size="md" dot pulse>
          Action Required
        </Badge>
      </div>

      {/* Alert Items List */}
      <Card
        title="Active Stock Alerts"
        subtitle="Replenish depleted inventory before items run out"
        icon={<Bell className="h-5 w-5 text-rose-600" />}
      >
        {lowStockItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-3" />
            <h4 className="text-base font-bold text-slate-800">
              All Stock Levels Healthy!
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
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
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-rose-100 bg-rose-50/30 hover:bg-rose-50/50 transition-colors"
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
                      <h4 className="text-sm font-bold text-slate-900">
                        {item.name}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Category: {item.category} • Unit: {item.unit}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        isOut
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-800'
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
