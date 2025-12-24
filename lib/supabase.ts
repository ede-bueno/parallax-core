import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client for Parallax
 * 
 * IMPORTANT: 
 * - This client requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
 * - If these are not set, the client will be null (graceful degradation)
 * - Services must handle null client scenario
 * 
 * Setup:
 * 1. Create .env.local file in project root
 * 2. Add:
 *    NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
 *    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Only create client if credentials are available
export const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

/**
 * Helper to check if Supabase is configured
 */
export const isSupabaseConfigured = (): boolean => {
    return supabase !== null;
};
