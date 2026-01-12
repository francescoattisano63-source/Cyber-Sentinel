
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

// URL del tuo progetto Supabase
const supabaseUrl = 'https://jgqovfbgknwbkstwlcgd.supabase.co';

/**
 * Chiave Publishable (anon) ottenuta dalle impostazioni API di Supabase.
 * Questa chiave permette all'app di comunicare con il database rispettando le policy di sicurezza (RLS).
 */
const supabaseAnonKey = 'sb_publishable_dUm841FycE8SR60jMcNklQ_et8Ut3lm';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
