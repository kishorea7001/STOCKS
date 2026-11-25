'use client';

import React from 'react';
import { Gift, ArrowRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProductItem } from './ProductsView';

export interface LeftoverStockViewProps {
  products: ProductItem[];
  onGoToProducts?: () => void;
  className?: string;
}

export function LeftoverStockView({
  products = [],
  onGoToProducts,
  className = '',
}: LeftoverStockViewProps) {
  const safeProducts = Array.isArray(products) ? products : [];
  const totalLeftoverUnits = safeProducts.reduce((acc, p) => acc + (p.currentStock || 0), 0);
  const totalValuation = safeProducts.reduce(
    (acc, p) => acc + (p.currentStock || 0) * (p.pricePerUnit || 0),
    0
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Top Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="rounded-2xl md:rounded-3xl border border-emerald-200/80 dark:border-emerald-900/50 bg-gradient-to-br from-emerald-50/90 via-teal-50/50 to-white/95 dark:from-slate-900 dark:via-emerald-950/30 dark:to-slate-900 p-6 shadow-xs transition-colors">
          <p className="text-xs md:text-sm font-semibold text-emerald-800 dark:text-emerald-400">
            Total Leftover Inventory
          </p>
          <p className="text-3xl md:text-4xl font-extrabold text-[#0F172A] dark:text-white mt-2">
            {totalLeftoverUnits.toFixed(1)}{' '}
            <span className="text-sm font-normal text-slate-500 dark:text-slate-400">Units Total</span>
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Across {safeProducts.length} catalog items
          </p>
        </div>

        <div className="rounded-2xl md:rounded-3xl border border-blue-200/80 dark:border-blue-900/50 bg-gradient-to-br from-blue-50/90 via-sky-50/50 to-white/95 dark:from-slate-900 dark:via-blue-950/30 dark:to-slate-900 p-6 shadow-xs transition-colors">
          <p className="text-xs md:text-sm font-semibold text-blue-800 dark:text-blue-400">
            Estimated Inventory Value
          </p>
          <p className="text-3xl md:text-4xl font-extrabold text-[#0F172A] dark:text-white mt-2">
            ₹{totalValuation.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Current end-of-day stock valuation
          </p>
        </div>
      </div>

      {/* Detailed Leftover Breakdown */}
      <Card
        title="Leftover Inventory Breakdown"
        subtitle="End-of-day remaining quantities ready for morning reconciliation"
        icon={<Gift className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
        action={
          onGoToProducts && (
            <button
              type="button"
              onClick={onGoToProducts}
              className="inline-flex items-center gap-1 text-xs md:text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer"
            >
              <span>Manage Products</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {safeProducts.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.name}</h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{item.category}</p>
                </div>
                <Badge variant="neutral" size="sm">
                  {item.unit}
                </Badge>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 dark:text-slate-500">Remaining</span>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {item.currentStock}{' '}
                    <span className="text-xs text-slate-500 dark:text-slate-400">{item.unit}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 dark:text-slate-500">Valuation</span>
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    ₹{(item.currentStock * item.pricePerUnit).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default LeftoverStockView;
