'use client';

import React, { useState, useMemo } from 'react';
import { Search, Package, RotateCcw } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export interface ProductItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  unit: string;
  pricePerUnit: number;
  updatedAt?: string;
}

export interface ProductsViewProps {
  products: ProductItem[];
  loading?: boolean;
  onRefresh?: () => void;
  onAdjustStock?: (productId: string, delta: number) => void;
  className?: string;
}

export function ProductsView({
  products,
  loading = false,
  onRefresh,
  onAdjustStock,
  className = '',
}: ProductsViewProps) {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.category));
    return ['All', ...Array.from(set)];
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchName = p.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = selectedCat === 'All' || p.category === selectedCat;
      return matchName && matchCat;
    });
  }, [products, search, selectedCat]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search products by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200/80 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCat === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200/70 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table Card */}
      <Card
        title="Inventory Catalog"
        subtitle={`Showing ${filtered.length} of ${products.length} registered products`}
        icon={<Package className="h-5 w-5 text-blue-600" />}
        action={
          <Button
            variant="secondary"
            size="sm"
            onClick={onRefresh}
            icon={<RotateCcw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
        }
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <RotateCcw className="h-8 w-8 text-blue-600 animate-spin mb-3" />
            <p className="text-sm font-semibold text-slate-700">Loading catalog items...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="h-10 w-10 text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No products found</p>
            <p className="text-xs text-slate-400 mt-1">Try searching with a different term.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400">
                  <th className="pb-3 px-2">Product Name</th>
                  <th className="pb-3 px-2">Category</th>
                  <th className="pb-3 px-2">Stock Level</th>
                  <th className="pb-3 px-2">Unit Price</th>
                  <th className="pb-3 px-2">Status</th>
                  <th className="pb-3 px-2 text-right">Quick Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {filtered.map((item) => {
                  const isLow = item.currentStock <= 25;
                  const isOut = item.currentStock <= 0;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      <td className="py-3 px-2 font-semibold text-slate-900">
                        {item.name}
                      </td>
                      <td className="py-3 px-2 text-slate-500 text-xs">
                        {item.category}
                      </td>
                      <td className="py-3 px-2 font-bold text-slate-800">
                        {item.currentStock}{' '}
                        <span className="text-xs font-normal text-slate-400">
                          {item.unit}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-slate-600 text-xs font-medium">
                        ₹{item.pricePerUnit.toFixed(2)}
                      </td>
                      <td className="py-3 px-2">
                        {isOut ? (
                          <Badge variant="danger" size="sm" dot>
                            Out of Stock
                          </Badge>
                        ) : isLow ? (
                          <Badge variant="warning" size="sm" dot>
                            Low Stock
                          </Badge>
                        ) : (
                          <Badge variant="success" size="sm" dot>
                            In Stock
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onAdjustStock?.(item.id, -1)}
                            className="h-7 w-7 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 flex items-center justify-center font-bold text-xs cursor-pointer active:scale-95"
                            title="Decrease 1 unit"
                          >
                            -
                          </button>
                          <button
                            type="button"
                            onClick={() => onAdjustStock?.(item.id, 1)}
                            className="h-7 w-7 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center justify-center font-bold text-xs cursor-pointer active:scale-95"
                            title="Add 1 unit"
                          >
                            +
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

export default ProductsView;
