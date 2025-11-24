'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useIndexedDB } from '@/hooks/useIndexedDB';
import { Product } from '@/lib/types';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addProduct, getProducts, isDbReady } = useIndexedDB();

  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);

  const refreshProducts = async () => {
    setProducts(await getProducts());
  };

  useEffect(() => {
    if (isDbReady) {
      setIsLoading(true);
      refreshProducts().finally(() => setIsLoading(false));
    }
  }, [isDbReady]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || price <= 0) return;
    await addProduct({ name, price });
    setName('');
    setPrice(0);
    await refreshProducts();
  };

  if (isLoading) {
    return <div>Loading products...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Products</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-8 flex gap-4 items-end">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name</label>
          <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
          <input type="number" id="price" value={price} onChange={e => setPrice(Number(e.target.value))} min="0" step="0.01" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 h-10">Add Product</button>
      </form>

      <h2 className="text-2xl font-bold mb-4">Product List</h2>
      <div className="bg-white p-6 rounded-lg shadow">
        <ul className="space-y-2">
          {products.map(product => (
            <li key={product.id} className={`flex justify-between items-center p-3 rounded-md ${!product.isSynced ? 'bg-amber-100' : 'bg-transparent'}`}>
              <div>
                <p className="font-semibold">{product.name}</p>
                <p className="text-xs text-slate-500">Added: {new Date(product.createdAt).toLocaleDateString()}</p>
              </div>
              <div className='flex items-center gap-4'>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${!product.isSynced ? 'bg-amber-200 text-amber-800' : 'bg-green-200 text-green-800'}`}>
                    {!product.isSynced ? 'Pending Sync' : 'Synced'}
                  </span>
                <p className="font-semibold text-gray-800">${product.price.toFixed(2)}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}