import { Tables } from '@/integrations/supabase/types';
import { ReactNode } from 'react';

// Data Types
export type Product = Tables<'products'>;
export type Order = Tables<'orders'>;
export type Category = Tables<'categories'>;
export type Brand = Tables<'brands'>;
export type ContactMessage = Tables<'contact_messages'>;

// Context Types
export interface RealtimeContextType {
  products: Product[];
  orders: Order[];
  categories: Category[];
  brands: Brand[];
  contactMessages: ContactMessage[];
  isLoading: boolean;
  isConnected: boolean;
  lastUpdate: Date | null;
  excludedDeliveredOrders: Set<string>;
  excludeDeliveredOrder: (orderId: string) => void;
  includeDeliveredOrder: (orderId: string) => void;
  refreshData: () => Promise<void>;
}

export interface RealtimeProviderProps {
  children: ReactNode;
}
