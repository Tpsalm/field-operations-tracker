import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    })
  : null;

export const getSupabaseStatus = () => ({
  configured: isSupabaseConfigured,
  url: supabaseUrl || null,
  hasAnonKey: Boolean(supabaseAnonKey)
});

export const requireSupabaseClient = () => {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.'
    );
  }

  return supabase;
};

export const testSupabaseConnection = async () => {
  if (!supabase) {
    return {
      connected: false,
      error: 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
    };
  }

  try {
    const { error } = await supabase.from('profiles').select('id', { count: 'exact', head: true }).limit(1);

    if (!error) {
      return { connected: true, error: null };
    }

    const recoverableCodes = new Set(['PGRST116', '42P01', 'PGRST301', 'PGRST205', '42501']);
    if (recoverableCodes.has(error.code ?? '')) {
      return { connected: false, error: error.message };
    }

    return { connected: false, error: error.message };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Supabase project is unreachable or not configured correctly.'
    };
  }
};

export const isSupabaseReachable = async (): Promise<boolean> => {
  const result = await testSupabaseConnection();
  return result.connected;
};

export async function fetchFromTable<T>(
  table: string,
  columns: string = '*',
  options?: {
    eq?: Record<string, unknown>;
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
  }
): Promise<{ data: T[] | null; error: Error | null }> {
  const client = requireSupabaseClient();

  let query = client.from(table).select(columns);

  if (options?.eq) {
    Object.entries(options.eq).forEach(([key, value]) => {
      query = query.eq(key, value as never);
    });
  }

  if (options?.orderBy) {
    query = query.order(options.orderBy.column, {
      ascending: options.orderBy.ascending ?? true
    });
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  return { data: (data as T[]) ?? [], error: null };
}
