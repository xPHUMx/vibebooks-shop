import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Order } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project')
);

// Standard Client for public operations
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Admin Client for secure server-side operations (Signed URLs from Private Buckets)
export const supabaseAdmin: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey)
  : null;

// In-memory Fallback Store for seamless demo & testing
const localOrders = new Map<string, Order>();

// Seed a default demo order for immediate tracking testing
const demoOrder: Order = {
  id: 'ORD-2026-8821',
  bookId: 'media-player-pro',
  bookTitle: 'Media Player PRO Engineering',
  bookPrice: 199,
  fileName: 'Media_Player_PRO_Engineering.pdf',
  customerName: 'เกียรติภูมิ หารศรีนาถ',
  customerEmail: 'kiatphum.h@example.com',
  status: 'PAID',
  createdAt: new Date().toISOString(),
  paidAt: new Date().toISOString(),
};
localOrders.set(demoOrder.id, demoOrder);

export async function saveOrder(order: Order): Promise<Order> {
  const client = supabaseAdmin || supabase;
  if (client) {
    try {
      const { data, error } = await client
        .from('orders')
        .insert({
          id: order.id,
          book_id: order.bookId,
          book_title: order.bookTitle,
          book_price: order.bookPrice,
          file_name: order.fileName,
          customer_name: order.customerName,
          customer_email: order.customerEmail,
          status: order.status,
          created_at: order.createdAt,
        })
        .select()
        .single();

      if (!error && data) {
        return order;
      }
      console.warn('Supabase insert notice, falling back to local memory store:', error?.message);
    } catch (err) {
      console.warn('Supabase connection exception, fallback to memory:', err);
    }
  }

  localOrders.set(order.id, order);
  return order;
}

export async function getOrderById(id: string): Promise<Order | null> {
  const client = supabaseAdmin || supabase;
  if (client) {
    try {
      const { data, error } = await client
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        return {
          id: data.id,
          bookId: data.book_id,
          bookTitle: data.book_title,
          bookPrice: data.book_price,
          fileName: data.file_name,
          customerName: data.customer_name,
          customerEmail: data.customer_email,
          status: data.status,
          createdAt: data.created_at,
          paidAt: data.paid_at,
        };
      }
    } catch (err) {
      console.warn('Supabase fetch error, fallback to memory:', err);
    }
  }

  return localOrders.get(id) || null;
}

export async function updateOrderStatus(id: string, status: Order['status']): Promise<Order | null> {
  const existing = await getOrderById(id);
  if (!existing) return null;

  const updated: Order = {
    ...existing,
    status,
    paidAt: status === 'PAID' ? new Date().toISOString() : existing.paidAt,
  };

  const client = supabaseAdmin || supabase;
  if (client) {
    try {
      await client
        .from('orders')
        .update({
          status,
          paid_at: updated.paidAt,
        })
        .eq('id', id);
    } catch (err) {
      console.warn('Supabase status update error:', err);
    }
  }

  localOrders.set(id, updated);
  return updated;
}

export async function lookupOrders(orderId: string, email: string): Promise<Order | null> {
  const order = await getOrderById(orderId);
  if (order && order.customerEmail.toLowerCase().trim() === email.toLowerCase().trim()) {
    return order;
  }
  return null;
}
