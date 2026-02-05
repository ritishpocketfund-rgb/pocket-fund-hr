import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase env vars. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================================
// Storage adapter — same interface as window.storage / localStorage
// but backed by Supabase PostgreSQL for persistence + multi-user
// ============================================================
// "pocketfund-currentuser" → localStorage (per-browser session)
// Everything else → Supabase (shared database)
// ============================================================

const LOCAL_ONLY_KEYS = ['pocketfund-currentuser'];

export const storage = {
  async get(key) {
    // Session stays in browser
    if (LOCAL_ONLY_KEYS.includes(key)) {
      try {
        const val = localStorage.getItem(key);
        return val !== null ? { value: val } : null;
      } catch { return null; }
    }

    // Everything else from Supabase
    try {
      const { data, error } = await supabase
        .from('app_data')
        .select('value')
        .eq('key', key)
        .single();

      if (error || !data) return null;
      return { value: JSON.stringify(data.value) };
    } catch {
      return null;
    }
  },

  async set(key, value) {
    // Session stays in browser
    if (LOCAL_ONLY_KEYS.includes(key)) {
      try {
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
        return { key, value };
      } catch { return null; }
    }

    // Everything else to Supabase
    try {
      const jsonValue = typeof value === 'string' ? JSON.parse(value) : value;
      const { error } = await supabase
        .from('app_data')
        .upsert(
          { key, value: jsonValue, updated_at: new Date().toISOString() },
          { onConflict: 'key' }
        );

      if (error) {
        console.error('Supabase set error:', error);
        return null;
      }
      return { key, value };
    } catch (e) {
      console.error('Storage set error:', e);
      return null;
    }
  },

  async delete(key) {
    // Session stays in browser
    if (LOCAL_ONLY_KEYS.includes(key)) {
      try {
        localStorage.removeItem(key);
        return { key, deleted: true };
      } catch { return null; }
    }

    // Everything else from Supabase
    try {
      const { error } = await supabase
        .from('app_data')
        .delete()
        .eq('key', key);

      if (error) {
        console.error('Supabase delete error:', error);
        return null;
      }
      return { key, deleted: true };
    } catch (e) {
      console.error('Storage delete error:', e);
      return null;
    }
  },
};
