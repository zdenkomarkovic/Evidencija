import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl) {
  throw new Error('Molimo definišite SUPABASE_URL environment varijablu u .env.local');
}

if (!supabaseAnonKey) {
  throw new Error('Molimo definišite SUPABASE_ANON_KEY environment varijablu u .env.local');
}

// Kreiraj Supabase klijent
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
