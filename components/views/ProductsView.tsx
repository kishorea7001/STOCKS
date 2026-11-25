'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Package,
  Plus,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
  Boxes,
} from 'lucide-react';
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

export const defaultExampleProducts: ProductItem[] = [
  { id: 'prod-1', name: 'Rice (Basmati)', category: 'Grains & Staples', currentStock: 50, unit: 'kg', pricePerUnit: 95 },
  { id: 'prod-2', name: 'Milk (Toned)', category: 'Dairy', currentStock: 15, unit: 'packets', pricePerUnit: 28 },
  { id: 'prod-3', name: 'Sugar (Refined)', category: 'Grains & Staples', currentStock: 0, unit: 'kg', pricePerUnit: 44 },
  { id: 'prod-4', name: 'Wheat Flour (Atta)', category: 'Grains & Staples', currentStock: 80, unit: 'kg', pricePerUnit: 42 },
  { id: 'prod-5', name: 'Cooking Oil (Sunflower)', category: 'Oils & Ghee', currentStock: 30, unit: 'liters', pricePerUnit: 140 },
  { id: 'prod-6', name: 'Biscuits (Marie)', category: 'Snacks & Bakery', currentStock: 45, unit: 'packets', pricePerUnit: 20 },
  { id: 'prod-7', name: 'Tea (Premium Powder)', category: 'Beverages', currentStock: 12, unit: 'kg', pricePerUnit: 450 },
  { id: 'prod-8', name: 'Coffee (Instant)', category: 'Beverages', currentStock: 25, unit: 'jars', pricePerUnit: 280 },
];

export interface ProductsViewProps {
  products?: ProductItem[];
  loading?: boolean;
  onRefresh?: () => void;
  onAdjustStock?: (productId: string, delta: number) => void;
  onAddProduct?: (product: Omit<ProductItem, 'id'>) => void;
  className?: string;
}

export function ProductsView({
  products = defaultExampleProducts,
  loading = false,
  onRefresh,
  onAdjustStock,
  onAddProduct,
  className = '',
}: ProductsViewProps) {
  const safeProducts = useMemo(() => {
    return Array.isArray(products) && products.length > 0
      ? products
      : defaultExampleProducts;
  }, [products]);

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New product form fields
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('Grains & Staples');
  const [newProductStock, setNewProductStock] = useState('20');
  const [newProductUnit, setNewProductUnit] = useState('kg');
  const [newProductPrice, setNewProductPrice] = useState('50');

  const categories = useMemo(() => {
    const set = new Set<string>();
    safeProducts.forEach((p) => set.add(p.category));
    return ['All', ...Array.from(set)];
  }, [safeProducts]);

  const filtered = useMemo(() => {
    return safeProducts.filter((p) => {
      const matchName = p.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = selectedCat === 'All' || p.category === selectedCat;
      return matchName && matchCat;
    });
  }, [safeProducts, search, selectedCat]);

  // Metric Totals
  const inStockCount = safeProducts.filter((p) => p.currentStock > 20).length;
  const lowStockCount = safeProducts.filter((p) => p.currentStock > 0 && p.currentStock <= 20).length;
  const outOfStockCount = safeProducts.filter((p) => p.currentStock <= 0).length;

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim()) return;

    onAddProduct?.({
      name: newProductName.trim(),
      category: newProductCategory,
      currentStock: parseFloat(newProductStock) || 0,
      unit: newProductUnit,
      pricePerUnit: parseFloat(newProductPrice) || 0,
    });

    // Reset and close
    setNewProductName('');
    setNewProductStock('20');
    setNewProductPrice('50');
    setIsAddModalOpen(false);
  };

  return (
    <div className={`space-y-6 md:space-y-8 ${className}`}>
      {/* 1. Header with Title, Subtitle, and Prominent Add Product Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-3xl md:text-[32px] lg:text-[34px] font-bold text-[#0F172A] dark:text-white tracking-tight leading-tight">
            Products
          </h2>
          <p className="text-sm md:text-[15px] text-slate-500 dark:text-slate-400 font-normal mt-1.5">
            Manage your inventory and product quantities.
          </p>
        </div>

        {/* Prominent Add Product Button */}
        <Button
          variant="primary"
          size="lg"
          onClick={() => setIsAddModalOpen(true)}
          icon={<Plus className="h-5 w-5" />}
          className="shadow-md shadow-blue-500/25 px-5 py-3 font-semibold text-sm self-start sm:self-center cursor-pointer"
        >
          Add Product
        </Button>
      </div>

      {/* 2. Overview Metric Cards Row (Blue / Green / Purple / Rose System) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Products */}
        <div className="rounded-2xl border border-blue-100/90 dark:border-blue-900/50 bg-gradient-to-br from-blue-50/80 via-white to-blue-50/40 dark:from-slate-900/90 dark:via-blue-950/30 dark:to-slate-900/90 p-5 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">Total Products</span>
            <Boxes className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            {safeProducts.length}
          </p>
        </div>

        {/* In Stock */}
        <div className="rounded-2xl border border-emerald-100/90 dark:border-emerald-900/50 bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/40 dark:from-slate-900/90 dark:via-emerald-950/30 dark:to-slate-900/90 p-5 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">In Stock</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            {inStockCount}
          </p>
        </div>

        {/* Low Stock */}
        <div className="rounded-2xl border border-amber-100/90 dark:border-amber-900/50 bg-gradient-to-br from-amber-50/80 via-white to-amber-50/40 dark:from-slate-900/90 dark:via-amber-950/30 dark:to-slate-900/90 p-5 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-400">Low Stock</span>
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            {lowStockCount}
          </p>
        </div>

        {/* Out of Stock */}
        <div className="rounded-2xl border border-rose-100/90 dark:border-rose-900/50 bg-gradient-to-br from-rose-50/80 via-white to-rose-50/40 dark:from-slate-900/90 dark:via-rose-950/30 dark:to-slate-900/90 p-5 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700 dark:text-rose-400">Out of Stock</span>
            <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            {outOfStockCount}
          </p>
        </div>
      </div>

      {/* 3. Search & Category Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search products by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCat(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCat === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Clean Product Table / Card Layout */}
      <Card
        title="Products Inventory"
        subtitle={`Displaying ${filtered.length} of ${safeProducts.length} registered products`}
        icon={<Package className="h-5 w-5 text-blue-600" />}
        action={
          onRefresh && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onRefresh}
              icon={<RotateCcw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>
          )
        }
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <RotateCcw className="h-8 w-8 text-blue-600 animate-spin mb-3" />
            <p className="text-sm font-semibold text-slate-700">Loading products...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="h-10 w-10 text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No products found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search or category filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm select-none">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-400 dark:text-slate-500">
                  <th className="pb-3.5 px-3">Product Name</th>
                  <th className="pb-3.5 px-3">Category</th>
                  <th className="pb-3.5 px-3">Current Quantity</th>
                  <th className="pb-3.5 px-3">Stock Status</th>
                  <th className="pb-3.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((item) => {
                  const isOut = item.currentStock <= 0;
                  const isLow = item.currentStock > 0 && item.currentStock <= 20;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group"
                    >
                      {/* Product Name */}
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-xs shrink-0">
                            {item.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white leading-tight">
                              {item.name}
                            </p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                              ₹{item.pricePerUnit.toFixed(2)} per {item.unit}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-3 text-slate-500 dark:text-slate-400 font-medium text-xs">
                        {item.category}
                      </td>

                      {/* Current Quantity */}
                      <td className="py-4 px-3">
                        <span className="text-base font-extrabold text-slate-900 dark:text-white">
                          {item.currentStock}
                        </span>{' '}
                        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                          {item.unit}
                        </span>
                      </td>

                      {/* Stock Status Badge */}
                      <td className="py-4 px-3">
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

                      {/* Actions: Quick Increment / Decrement & Restock */}
                      <td className="py-4 px-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onAdjustStock?.(item.id, -1)}
                            className="h-8 w-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center font-bold text-xs cursor-pointer active:scale-95 transition-all shadow-xs"
                            title="Decrease quantity by 1"
                          >
                            -
                          </button>
                          <button
                            type="button"
                            onClick={() => onAdjustStock?.(item.id, 1)}
                            className="h-8 w-8 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 flex items-center justify-center font-bold text-xs cursor-pointer active:scale-95 transition-all shadow-xs"
                            title="Increase quantity by 1"
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

      {/* 5. Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl p-6 md:p-7 space-y-5 animate-in zoom-in-95 duration-200 transition-colors">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                  <Package className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add New Product</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Green Cardamom, Almonds"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newProductCategory}
                    onChange={(e) => setNewProductCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white dark:bg-slate-800"
                  >
                    <option value="Grains & Staples">Grains & Staples</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Snacks & Bakery">Snacks & Bakery</option>
                    <option value="Oils & Ghee">Oils & Ghee</option>
                    <option value="Pulses">Pulses</option>
                    <option value="Personal Care">Personal Care</option>
                    <option value="Household">Household</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Unit
                  </label>
                  <select
                    value={newProductUnit}
                    onChange={(e) => setNewProductUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white dark:bg-slate-800"
                  >
                    <option value="kg">kg</option>
                    <option value="packets">packets</option>
                    <option value="liters">liters</option>
                    <option value="jars">jars</option>
                    <option value="pieces">pieces</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Initial Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={newProductStock}
                    onChange={(e) => setNewProductStock(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Price per Unit (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="md">
                  Create Product
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductsView;
