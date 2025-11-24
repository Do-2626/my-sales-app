'use client';

import { useEffect, useState } from 'react';
import { useIndexedDB } from '@/hooks/useIndexedDB';
import { Sale, Product } from '@/lib/types';

export default function DashboardPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getSales, getProducts, isDbReady } = useIndexedDB();

  useEffect(() => {
    if (isDbReady) {
      const fetchData = async () => {
        const [localSales, localProducts] = await Promise.all([
          getSales(),
          getProducts(),
        ]);
        setSales(localSales);
        setProducts(localProducts);
        setIsLoading(false);
      };
      fetchData();
    }
  }, [isDbReady, getSales, getProducts]);

  const totalRevenue = sales.reduce((acc, sale) => acc + sale.totalPrice, 0);
  const salesToday = sales.filter(sale => new Date(sale.saleDate).toDateString() === new Date().toDateString()).length;

  if (isLoading) {
    return <div>Loading dashboard data...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-slate-500">Total Revenue</h2>
          <p className="text-4xl font-bold mt-2">${totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-slate-500">Sales Today</h2>
          <p className="text-4xl font-bold mt-2">{salesToday}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-slate-500">Total Products</h2>
          <p className="text-4xl font-bold mt-2">{products.length}</p>
        </div>
      </div>
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Recent Sales</h2>
        <ul className="space-y-2">
          {sales.slice(0, 5).map(sale => {
            const productName = products.find(p => p.id === sale.productId)?.name || 'Unknown Product';
            return (
              <li key={sale.id} className="flex justify-between items-center p-2 border-b">
                <div>
                  <p className="font-semibold">{productName}</p>
                  <p className="text-sm text-slate-500">Qty: {sale.quantity}</p>
                </div>
                <div className="text-right">
                    <p className="font-semibold text-green-600">+${sale.totalPrice.toFixed(2)}</p>
                    <p className="text-xs text-slate-400">{new Date(sale.saleDate).toLocaleString()}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}