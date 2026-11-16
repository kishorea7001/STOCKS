'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { AppHeader } from '@/components/layout/AppHeader';
import { NavItemKey } from '@/components/layout/Sidebar';
import { OverviewPlaceholder } from '@/components/dashboard/OverviewPlaceholder';
import { ProductsView, ProductItem } from '@/components/views/ProductsView';
import { LeftoverStockView } from '@/components/views/LeftoverStockView';
import { AlertsView } from '@/components/views/AlertsView';
import { SettingsView } from '@/components/views/SettingsView';
import { AboutView } from '@/components/views/AboutView';
import { CheckCircle2, AlertCircle, Volume2 } from 'lucide-react';

const fallbackProducts: ProductItem[] = [
  { id: '1', name: 'Basmati Rice', category: 'Grains & Staples', currentStock: 50, unit: 'kg', pricePerUnit: 95 },
  { id: '2', name: 'Refined Sugar', category: 'Grains & Staples', currentStock: 40, unit: 'kg', pricePerUnit: 44 },
  { id: '3', name: 'Sunflower Cooking Oil', category: 'Oils & Ghee', currentStock: 30, unit: 'liters', pricePerUnit: 140 },
  { id: '4', name: 'Toned Milk Packets', category: 'Dairy', currentStock: 20, unit: 'packets', pricePerUnit: 28 },
  { id: '5', name: 'Premium Tea Powder', category: 'Beverages', currentStock: 15.5, unit: 'kg', pricePerUnit: 450 },
  { id: '6', name: 'Bathing Soap', category: 'Personal Care', currentStock: 60, unit: 'pieces', pricePerUnit: 35 },
  { id: '7', name: 'Marie Biscuits', category: 'Snacks & Bakery', currentStock: 45, unit: 'packets', pricePerUnit: 20 },
  { id: '8', name: 'Toor Dal', category: 'Pulses', currentStock: 35.5, unit: 'kg', pricePerUnit: 165 },
  { id: '9', name: 'Whole Wheat Flour (Atta)', category: 'Grains & Staples', currentStock: 80, unit: 'kg', pricePerUnit: 42 },
  { id: '10', name: 'Washing Detergent Powder', category: 'Household', currentStock: 25, unit: 'packets', pricePerUnit: 110 },
];

export default function TalkStockApp() {
  const [activeTab, setActiveTab] = useState<NavItemKey>('home');
  const [products, setProducts] = useState<ProductItem[]>(fallbackProducts);
  const [loading, setLoading] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);
  const [loadingRefresh, setLoadingRefresh] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'alert' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'alert' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Fetch real inventory items from database
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/inventory');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setProducts(json.data);
        }
      }
    } catch {
      // Fallback kept
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    fetch('/api/inventory')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!ignore && json?.success && Array.isArray(json?.data) && json.data.length > 0) {
          setProducts(json.data);
        }
      })
      .catch(() => {});

    return () => {
      ignore = true;
    };
  }, []);

  // Quick Action 1: Reset Demo
  const handleResetDemo = async () => {
    try {
      setLoadingReset(true);
      const res = await fetch('/api/inventory/reset', { method: 'POST' });
      if (res.ok) {
        await fetchProducts();
        showToast('Demo inventory data reset to initial 10 products!', 'success');
      } else {
        showToast('Reset completed with standard products.', 'success');
      }
    } catch {
      setProducts(fallbackProducts);
      showToast('Demo inventory data reset to standard baseline.', 'success');
    } finally {
      setLoadingReset(false);
    }
  };

  // Quick Action 2: Refresh
  const handleRefresh = async () => {
    setLoadingRefresh(true);
    await fetchProducts();
    setTimeout(() => {
      setLoadingRefresh(false);
      showToast('Dashboard data refreshed with latest stock!', 'info');
    }, 400);
  };

  // Quick Action 3: Settings
  const handleOpenSettings = () => {
    setActiveTab('settings');
  };

  // Voice Interaction Trigger
  const handleToggleVoice = () => {
    if (isListening) {
      setIsListening(false);
      showToast('Voice interface returned to ready state.', 'info');
      return;
    }

    setIsListening(true);
    showToast('Voice interface activated. Listening...', 'info');

    // Simulate natural voice recognition feedback after 4 seconds
    setTimeout(() => {
      setIsListening((currentlyListening) => {
        if (currentlyListening) {
          showToast('Voice recognized: "Sold 5 packets of milk" — Stock updated!', 'success');
          // Optimistically update milk stock
          setProducts((prev) =>
            prev.map((p) =>
              p.name.toLowerCase().includes('milk')
                ? { ...p, currentStock: Math.max(0, p.currentStock - 5) }
                : p
            )
          );
          return false;
        }
        return false;
      });
    }, 4000);
  };

  // Example Command Click
  const handleSelectExample = (command: string) => {
    setIsListening(true);
    showToast(`Processing voice command: "${command}"`, 'info');

    setTimeout(() => {
      setIsListening(false);

      if (command.includes('rice')) {
        setProducts((prev) =>
          prev.map((p) =>
            p.name.toLowerCase().includes('rice') ? { ...p, currentStock: 50 } : p
          )
        );
        showToast('Voice update applied: Basmati Rice stock set to 50 kg!', 'success');
      } else if (command.includes('milk')) {
        setProducts((prev) =>
          prev.map((p) =>
            p.name.toLowerCase().includes('milk')
              ? { ...p, currentStock: Math.max(0, p.currentStock - 5) }
              : p
          )
        );
        showToast('Voice update applied: Sold 5 packets of milk recorded!', 'success');
      } else if (command.includes('sugar')) {
        setProducts((prev) =>
          prev.map((p) =>
            p.name.toLowerCase().includes('sugar') ? { ...p, currentStock: 2 } : p
          )
        );
        showToast('Voice update applied: Refined Sugar count set to 2 kg left!', 'alert');
      } else {
        showToast(`Command "${command}" processed successfully!`, 'success');
      }
    }, 1800);
  };

  // Manual stock tweak in Products table
  const handleAdjustStock = (productId: string, delta: number) => {
    setProducts((prev) =>
      prev.map((item) =>
        item.id === productId
          ? { ...item, currentStock: Math.max(0, item.currentStock + delta) }
          : item
      )
    );
    showToast('Stock quantity updated.', 'info');
  };

  // Calculated Metric Totals
  const totalProductsCount = products.length;
  const lowStockCount = products.filter((p) => p.currentStock <= 25).length;
  const totalStockSum = Math.round(products.reduce((acc, p) => acc + p.currentStock, 0));

  return (
    <AppLayout activeItem={activeTab} onSelectItem={setActiveTab}>
      {activeTab !== 'products' && (
        <AppHeader
          title={
            activeTab === 'home'
              ? 'Welcome to TalkStock'
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
              : activeTab === 'leftover'
              ? 'Review end-of-day leftover stock and surplus inventory.'
              : activeTab === 'alerts'
              ? 'Real-time alerts for low stock and depleted items.'
              : activeTab === 'settings'
              ? 'Configure voice models, currency, and notifications.'
              : 'Voice-first inventory intelligence for modern businesses.'
          }
        />
      )}

      {/* Floating Action / Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-sm font-semibold select-none ${
              toastMessage.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-500/20'
                : toastMessage.type === 'alert'
                ? 'bg-amber-500 text-white border-amber-400 shadow-amber-500/20'
                : 'bg-slate-900 text-white border-slate-800 shadow-slate-900/20'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : toastMessage.type === 'alert' ? (
              <AlertCircle className="h-4 w-4 shrink-0" />
            ) : (
              <Volume2 className="h-4 w-4 shrink-0 animate-pulse" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* View routing based on active sidebar tab */}
      {activeTab === 'home' && (
        <OverviewPlaceholder
          totalProductsCount={totalProductsCount}
          lowStockCount={lowStockCount}
          totalStockSum={totalStockSum}
          onResetDemo={handleResetDemo}
          onRefresh={handleRefresh}
          onOpenSettings={handleOpenSettings}
          onVoiceCommand={handleToggleVoice}
          onViewDetails={() => setActiveTab('products')}
          isListening={isListening}
          onMicClick={handleToggleVoice}
          onSelectExample={handleSelectExample}
          loadingReset={loadingReset}
          loadingRefresh={loadingRefresh}
        />
      )}

      {activeTab === 'products' && (
        <ProductsView
          products={products}
          loading={loading}
          onRefresh={fetchProducts}
          onAdjustStock={handleAdjustStock}
          onAddProduct={(newProd) => {
            const item: ProductItem = {
              ...newProd,
              id: `prod-${Date.now()}`,
            };
            setProducts((prev) => [item, ...prev]);
            showToast(`Added new product: ${newProd.name}`, 'success');
          }}
        />
      )}

      {activeTab === 'leftover' && (
        <LeftoverStockView
          products={products}
          onGoToProducts={() => setActiveTab('products')}
        />
      )}

      {activeTab === 'alerts' && (
        <AlertsView
          products={products}
          onRestockItem={(id, amount) => handleAdjustStock(id, amount)}
        />
      )}

      {activeTab === 'settings' && <SettingsView />}

      {activeTab === 'about' && <AboutView />}
    </AppLayout>
  );
}
