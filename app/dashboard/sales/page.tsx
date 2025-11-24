'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useIndexedDB } from '@/hooks/useIndexedDB';
import { Sale, Product } from '@/lib/types';

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addSale, getSales, getProducts, isDbReady } = useIndexedDB();

  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);

  const refreshData = async () => {
    const [localSales, localProducts] = await Promise.all([getSales(), getProducts()]);
    setSales(localSales);
    setProducts(localProducts);
    if (localProducts.length > 0 && !selectedProduct) {
        setSelectedProduct(localProducts[0].id);
    }
  };

  useEffect(() => {
    if (isDbReady) {
      setIsLoading(true);
      refreshData().finally(() => setIsLoading(false));
    }
  }, [isDbReady]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.id === selectedProduct);
    if (!product || quantity <= 0) return;

    await addSale({
      productId: product.id,
      quantity,
      totalPrice: product.price * quantity,
    });
    
    setQuantity(1);
    await refreshData();
  };

  if (isLoading) {
    return <div>Loading sales...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Record a Sale</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-8 flex gap-4 items-end">
        <div>
          <label htmlFor="product" className="block text-sm font-medium text-gray-700">Product</label>
          <select id="product" value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
            {products.map(p => <option key={p.id} value={p.id}>{p.name} - ${p.price.toFixed(2)}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
          <input type="number" id="quantity" value={quantity} onChange={e => setQuantity(Number(e.target.value))} min="1" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 h-10">Record Sale</button>
      </form>

      <h2 className="text-2xl font-bold mb-4">Sales History</h2>
       <div className="bg-white p-6 rounded-lg shadow">
        <ul className="space-y-2">
          {sales.map(sale => {
            const productName = products.find(p => p.id === sale.productId)?.name || 'Unknown';
            return (
              <li key={sale.id} className={`flex justify-between items-center p-3 rounded-md ${!sale.isSynced ? 'bg-amber-100' : 'bg-green-50'}`}>
                <div>
                  <p className="font-semibold">{productName} (x{sale.quantity})</p>
                  <p className="text-xs text-slate-500">{new Date(sale.saleDate).toLocaleString()}</p>
                </div>
                <div className='flex items-center gap-4'>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${!sale.isSynced ? 'bg-amber-200 text-amber-800' : 'bg-green-200 text-green-800'}`}>
                    {!sale.isSynced ? 'Pending Sync' : 'Synced'}
                  </span>
                  <p className="font-semibold text-green-700">${sale.totalPrice.toFixed(2)}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}