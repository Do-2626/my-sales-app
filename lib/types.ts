export interface Product {
  id: string; // locally generated UUID
  name: string;
  price: number;
  createdAt: number; // timestamp
  isSynced: boolean;
}

export interface Sale {
  id: string; // locally generated UUID
  productId: string;
  quantity: number;
  totalPrice: number;
  saleDate: number; // timestamp
  isSynced: boolean;
}

export interface SyncPayload {
  products: Product[];
  sales: Sale[];
}