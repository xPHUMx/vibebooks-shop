import { createBrowserClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient<any, 'public', any> | null = null;

const hybridStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null;

    // 1. Try localStorage first (fastest and most reliable for SPA / Next client)
    try {
      const localVal = localStorage.getItem(key);
      if (localVal && localVal !== 'undefined' && localVal !== 'null') {
        // Also ensure cookie matches
        try {
          const maxAge = 60 * 60 * 24 * 365;
          document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(localVal)}; path=/; max-age=${maxAge}; SameSite=Lax`;
        } catch {}
        return localVal;
      }
    } catch {}

    // 2. Try document.cookie
    try {
      const match = document.cookie.match(new RegExp('(^|;\\s*)(' + encodeURIComponent(key) + ')=([^;]*)'));
      if (match && match[3]) {
        const decoded = decodeURIComponent(match[3]);
        if (decoded && decoded !== 'undefined' && decoded !== 'null') {
          // Mirror into localStorage
          try {
            localStorage.setItem(key, decoded);
          } catch {}
          return decoded;
        }
      }
    } catch {}

    return null;
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') return;

    // Set localStorage
    try {
      localStorage.setItem(key, value);
    } catch {}

    // Set document.cookie
    try {
      const maxAge = 60 * 60 * 24 * 365;
      document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
    } catch {}
  },
  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(key);
    } catch {}

    try {
      document.cookie = `${encodeURIComponent(key)}=; path=/; max-age=0; SameSite=Lax`;
    } catch {}
  },
};

export function createClient(): SupabaseClient<any, 'public', any> {
  if (typeof window !== 'undefined' && client) {
    return client;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  const newClient = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: hybridStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });

  if (typeof window !== 'undefined') {
    client = newClient;
  }
  return newClient;
}

