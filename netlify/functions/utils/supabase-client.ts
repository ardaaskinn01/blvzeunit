import { SupabaseClient, createClient } from '@supabase/supabase-js';

/**
 * Supabase Client Singleton
 * 
 * Her function call'da yeni client oluşturmak yerine singleton pattern kullanır.
 * Bu sayede connection pool exhaustion önlenir.
 */

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
    if (!supabaseInstance) {
        const supabaseUrl = process.env.VITE_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Supabase credentials missing');
        }

        supabaseInstance = createClient(supabaseUrl, supabaseKey, {
            auth: {
                persistSession: false, // Serverless functions don't need session persistence
                autoRefreshToken: false,
            },
            db: {
                schema: 'public',
            },
        });

        console.log('✅ Supabase client initialized (singleton)');
    }

    return supabaseInstance;
}
