import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { SyncPayload } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body: SyncPayload = await request.json();
    const { products, sales } = body;

    if ((!products || products.length === 0) && (!sales || sales.length === 0)) {
      return NextResponse.json({ message: 'No data to sync.' }, { status: 200 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME);

    const productCollection = db.collection('products');
    const saleCollection = db.collection('sales');
    
    const syncedIds = { productIds: [] as string[], saleIds: [] as string[] };

    // Using bulkWrite for efficiency
    if (products && products.length > 0) {
      const productOps = products.map(product => ({
        updateOne: {
          filter: { _id: product.id },
          update: { $set: { name: product.name, price: product.price, createdAt: new Date(product.createdAt) } },
          upsert: true,
        }
      }));
      await productCollection.bulkWrite(productOps);
      syncedIds.productIds = products.map(p => p.id);
    }

    if (sales && sales.length > 0) {
        const saleOps = sales.map(sale => ({
            updateOne: {
              filter: { _id: sale.id },
              update: { $set: { ...sale, saleDate: new Date(sale.saleDate), _id: sale.id } },
              upsert: true,
            }
        }));
        await saleCollection.bulkWrite(saleOps);
        syncedIds.saleIds = sales.map(s => s.id);
    }

    return NextResponse.json({ message: 'Sync successful', syncedIds }, { status: 200 });

  } catch (error) {
    console.error('Sync API Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}