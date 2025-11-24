import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Product, Sale } from './types';

interface SalesDB extends DBSchema {
  products: {
    key: string;
    value: Product;
    indexes: { 'by-name': string };
  };
  sales: {
    key: string;
    value: Sale;
    indexes: { 'by-date': number };
  };
}

let dbPromise: Promise<IDBPDatabase<SalesDB>> | null = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<SalesDB>('SalesDB', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('products')) {
          const productStore = db.createObjectStore('products', { keyPath: 'id' });
          productStore.createIndex('by-name', 'name');
        }
        if (!db.objectStoreNames.contains('sales')) {
          const saleStore = db.createObjectStore('sales', { keyPath: 'id' });
          saleStore.createIndex('by-date', 'saleDate');
        }
      },
    });
  }
  return dbPromise;
}