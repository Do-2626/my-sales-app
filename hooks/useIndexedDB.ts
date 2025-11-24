'use client';

import { useState, useEffect, useCallback } from 'react';
import { IDBPDatabase } from 'idb';
import { getDB } from '@/lib/db';
import { Product, Sale } from '@/lib/types';

export function useIndexedDB() {
  const [db, setDb] = useState<IDBPDatabase<any> | null>(null);
  const [isDbReady, setIsDbReady] = useState(false);

  useEffect(() => {
    getDB().then(database => {
      setDb(database);
      setIsDbReady(true);
    });
  }, []);

  // Products
  const addProduct = useCallback(async (product: Omit<Product, 'id' | 'isSynced' | 'createdAt'>) => {
    if (!db) return;
    const newProduct: Product = {
      ...product,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      isSynced: false,
    };
    await db.add('products', newProduct);
    return newProduct;
  }, [db]);

  const getProducts = useCallback(async (): Promise<Product[]> => {
    if (!db) return [];
    return db.getAll('products');
  }, [db]);

  // Sales
  const addSale = useCallback(async (sale: Omit<Sale, 'id' | 'isSynced' | 'saleDate'>) => {
    if (!db) return;
    const newSale: Sale = {
      ...sale,
      id: crypto.randomUUID(),
      saleDate: Date.now(),
      isSynced: false,
    };
    await db.add('sales', newSale);
    return newSale;
  }, [db]);

  const getSales = useCallback(async (): Promise<Sale[]> => {
    if (!db) return [];
    const sales = await db.getAll('sales');
    return sales.sort((a, b) => b.saleDate - a.saleDate);
  }, [db]);

  // Sync related
  const getUnsyncedData = useCallback(async () => {
     if (!db) return { products: [], sales: [] };
     const unsyncedProducts = await db.getAll('products').then(p => p.filter(item => !item.isSynced));
     const unsyncedSales = await db.getAll('sales').then(s => s.filter(item => !item.isSynced));
     return { products: unsyncedProducts, sales: unsyncedSales };
  }, [db]);

  const markDataAsSynced = useCallback(async (syncedIds: { productIds: string[], saleIds: string[] }) => {
    if (!db) return;
    const tx = db.transaction(['products', 'sales'], 'readwrite');
    for (const id of syncedIds.productIds) {
        const product = await tx.objectStore('products').get(id);
        if (product) {
            product.isSynced = true;
            await tx.objectStore('products').put(product);
        }
    }
    for (const id of syncedIds.saleIds) {
        const sale = await tx.objectStore('sales').get(id);
        if (sale) {
            sale.isSynced = true;
            await tx.objectStore('sales').put(sale);
        }
    }
    await tx.done;
  }, [db]);

  return { isDbReady, addProduct, getProducts, addSale, getSales, getUnsyncedData, markDataAsSynced };
}