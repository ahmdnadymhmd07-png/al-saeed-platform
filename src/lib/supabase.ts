import { createClient } from '@supabase/supabase-js';

// Supabase Connection Credentials (configured with project values and .env.local fallback)
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://woeexrunqmeaudksuiis.supabase.co';
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_-8_bp-u9qj6Xy85t-MfP_Q_BueUQMnq';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Checks connection health to Supabase
 */
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string; tablesExist?: boolean }> {
  try {
    const { error } = await supabase.from('settings').select('*').limit(1);
    if (error) {
      // 42P01 (Postgres table not found) or PGRST205 (PostgREST table not in cache)
      if (
        error.code === '42P01' || 
        error.code === 'PGRST205' || 
        error.message?.includes('Could not find the table')
      ) {
        return { 
          success: true, 
          tablesExist: false,
          message: 'متصل بنجاح بمشروع Supabase، ولكن الجداول لم تُنشأ بعد في المشروع. يرجى نسخ وتشغيل استعلامات SQL Schema داخل Supabase SQL Editor.' 
        };
      }
      return { success: false, message: `تعذر الاتصال بـ Supabase: ${error.message}` };
    }
    return { 
      success: true, 
      tablesExist: true,
      message: 'متصل بنجاح بقاعدة بيانات Supabase، وجداول منصة السعيد جاهزة وتعمل بكفاءة.' 
    };
  } catch (err: any) {
    return { success: false, message: err?.message || 'تعذر الاتصال بخادم Supabase' };
  }
}

/**
 * Helper to get masked credentials for display in settings UI
 */
export function getSupabaseDetails() {
  const url = supabaseUrl;
  let projectId = 'woeexrunqmeaudksuiis';
  try {
    const parsed = new URL(url);
    projectId = parsed.hostname.split('.')[0] || projectId;
  } catch {
    // fallback
  }

  const maskedKey = supabaseAnonKey 
    ? `${supabaseAnonKey.slice(0, 10)}••••••••${supabaseAnonKey.slice(-6)}` 
    : 'غير محدد';

  return {
    url,
    projectId,
    maskedKey,
    isConfigured: isSupabaseConfigured,
  };
}
