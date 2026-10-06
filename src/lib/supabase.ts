import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Order, OrderItem } from '@/types';

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

// In-memory Fallback Store
const localOrders = new Map<string, Order>();

export async function saveOrder(order: Order): Promise<Order> {
  const client = supabaseAdmin || supabase;
  if (client) {
    try {
      const primaryItem = order.items?.[0];
      const { data, error } = await client
        .from('orders')
        .insert({
          id: order.id,
          user_id: order.userId || null,
          customer_name: order.customerName,
          customer_email: order.customerEmail,
          customer_phone: order.customerPhone || null,
          total_amount: order.totalAmount,
          status: order.status,
          promptpay_ref: order.promptpayRef || null,
          slip_url: order.slipUrl || null,
          merchant_id: order.merchantId || null,
          created_at: order.createdAt,
          paid_at: order.paidAt || null,
          // Legacy fields
          book_id: order.bookId || primaryItem?.productId || null,
          book_title: order.bookTitle || primaryItem?.title || null,
          book_price: order.bookPrice || primaryItem?.price || order.totalAmount,
          file_name: order.fileName || primaryItem?.fileName || null,
        })
        .select()
        .single();

      if (!error && data) {
        // Also insert order_items if array present
        if (order.items && order.items.length > 0) {
          try {
            await client.from('order_items').insert(
              order.items.map((item) => ({
                order_id: order.id,
                product_id: item.productId,
                title: item.title,
                price: item.price,
                file_name: item.fileName,
              }))
            );
          } catch (itemErr) {
            console.warn('order_items insert warning:', itemErr);
          }
        }
        localOrders.set(order.id, order);
        return order;
      }
      console.warn('Supabase insert notice, saving in local fallback:', error?.message);
    } catch (err) {
      console.warn('Supabase connection exception, fallback to memory store:', err);
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
        // Fetch order items if exists
        let items: OrderItem[] = [];
        try {
          const { data: itemRows } = await client
            .from('order_items')
            .select('*')
            .eq('order_id', id);
          if (itemRows && itemRows.length > 0) {
            items = itemRows.map((r: any) => ({
              id: r.id,
              productId: r.product_id,
              title: r.title,
              price: Number(r.price),
              fileName: r.file_name,
            }));
          }
        } catch {
          // ignore
        }

        if (items.length === 0 && data.book_id) {
          items = [
            {
              productId: data.book_id,
              title: data.book_title || 'Digital Product',
              price: Number(data.book_price || data.total_amount || 0),
              fileName: data.file_name || 'download.pdf',
            },
          ];
        }

        let merchantName = data.merchant_name || undefined;
        let merchantPromptPay = data.merchant_promptpay || undefined;

        if (data.merchant_id && (!merchantName || !merchantPromptPay)) {
          try {
            const { data: mProf } = await client
              .from('profiles')
              .select('store_name, promptpay_id')
              .eq('id', data.merchant_id)
              .maybeSingle();
            if (mProf) {
              merchantName = mProf.store_name || merchantName;
              merchantPromptPay = mProf.promptpay_id || merchantPromptPay;
            }
          } catch {}
        }

        const cached = localOrders.get(data.id);

        return {
          id: data.id,
          userId: data.user_id,
          merchantId: data.merchant_id,
          merchantName: merchantName || cached?.merchantName,
          merchantPromptPay: merchantPromptPay || cached?.merchantPromptPay,
          customerName: data.customer_name,
          customerEmail: data.customer_email,
          customerPhone: data.customer_phone,
          totalAmount: Number(data.total_amount || data.book_price || 0),
          status: data.status,
          promptpayRef: data.promptpay_ref,
          slipUrl: data.slip_url,
          items,
          createdAt: data.created_at,
          paidAt: data.paid_at,
          bookId: data.book_id,
          bookTitle: data.book_title,
          bookPrice: Number(data.book_price || 0),
          fileName: data.file_name,
        };
      }
    } catch (err) {
      console.warn('Supabase fetch error, fallback to memory:', err);
    }
  }

  return localOrders.get(id) || null;
}

export async function getAllOrders(): Promise<Order[]> {
  const client = supabaseAdmin || supabase;
  if (client) {
    try {
      const { data, error } = await client
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((d: any) => {
          let items: OrderItem[] = [];
          if (Array.isArray(d.order_items) && d.order_items.length > 0) {
            items = d.order_items.map((it: any) => ({
              id: it.id,
              productId: it.product_id,
              title: it.title,
              price: Number(it.price || 0),
              fileName: it.file_name,
            }));
          } else {
            items = [
              {
                productId: d.book_id || 'product',
                title: d.book_title || 'Digital Product',
                price: Number(d.book_price || d.total_amount || 0),
                fileName: d.file_name || 'download.pdf',
              },
            ];
          }

          return {
            id: d.id,
            userId: d.user_id,
            customerName: d.customer_name,
            customerEmail: d.customer_email,
            customerPhone: d.customer_phone,
            totalAmount: Number(d.total_amount || d.book_price || 0),
            status: d.status,
            promptpayRef: d.promptpay_ref,
            slipUrl: d.slip_url,
            merchantId: d.merchant_id,
            merchantName: d.merchant_name,
            merchantPromptPay: d.merchant_promptpay,
            items,
            createdAt: d.created_at,
            paidAt: d.paid_at,
            bookId: d.book_id,
            bookTitle: d.book_title,
            bookPrice: Number(d.book_price || 0),
            fileName: d.file_name,
          };
        });
      }
    } catch (err) {
      console.warn('Supabase getAllOrders error:', err);
    }
  }

  return Array.from(localOrders.values()).reverse();
}

export async function getOrdersByMerchant(merchantId?: string, storeName?: string): Promise<Order[]> {
  const allOrders = await getAllOrders();
  if (!merchantId && !storeName) return [];
  const normalizedStore = storeName?.trim().toLowerCase();

  return allOrders.filter((o) => {
    if (merchantId && o.merchantId === merchantId) return true;
    if (normalizedStore && o.merchantName && o.merchantName.trim().toLowerCase() === normalizedStore) return true;
    return false;
  });
}

export async function getOrdersByUser(email?: string, userId?: string): Promise<Order[]> {
  const allOrders = await getAllOrders();
  if (!email && !userId) return [];

  const normEmail = email?.toLowerCase().trim();
  return allOrders.filter((o) => {
    const matchEmail = normEmail && o.customerEmail.toLowerCase().trim() === normEmail;
    const matchUser = userId && o.userId === userId;
    return matchEmail || matchUser;
  });
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

export async function attachOrderSlip(id: string, slipUrl: string): Promise<Order | null> {
  const existing = await getOrderById(id);
  if (!existing) return null;

  const updated: Order = {
    ...existing,
    slipUrl,
  };

  const client = supabaseAdmin || supabase;
  if (client) {
    try {
      await client
        .from('orders')
        .update({ slip_url: slipUrl })
        .eq('id', id);
    } catch (err) {
      console.warn('Supabase attach slip error:', err);
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
