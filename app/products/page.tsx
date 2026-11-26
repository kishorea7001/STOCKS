'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProductsView, defaultExampleProducts, ProductItem } from '@/components/views/ProductsView';
import { useRouter } from 'next/navigation';

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductItem[]>(defaultExampleProducts);

  const handleAdjustStock = (productId: string, delta: number) => {
    setProducts((prev) =>
      prev.map((item) =>
        item.id === productId
          ? { ...item, currentStock: Math.max(0, item.currentStock + delta) }
          : item
      )
    );
  };

  const handleAddProduct = (newProd: Omit<ProductItem, 'id'>) => {
    const item: ProductItem = {
      ...newProd,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [item, ...prev]);
  };

  const handleSelectNav = (key: string) => {
    if (key === 'home') {
      router.push('/dashboard');
    } else {
      router.push(`/dashboard?tab=${key}`);
    }
  };

  return (
    <AppLayout activeItem="products" onSelectItem={handleSelectNav}>
      <ProductsView
        products={products}
        onAdjustStock={handleAdjustStock}
        onAddProduct={handleAddProduct}
      />
    </AppLayout>
  );
}
