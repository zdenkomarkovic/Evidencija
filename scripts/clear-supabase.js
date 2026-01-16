// Skripta za brisanje svih podataka iz Supabase tabela
// PAŽNJA: Ovo briše sve podatke!
// Korišćenje: node scripts/clear-supabase.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ SUPABASE_URL ili SUPABASE_ANON_KEY nisu postavljeni');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function clearSupabase() {
  try {
    console.log('⚠️  Brisanje svih podataka iz Supabase tabela...\n');

    // Obriši u obrnutom redosledu zbog foreign keys
    console.log('🗑️  Brisanje google_ads_nastavci...');
    await supabase.from('google_ads_nastavci').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    console.log('🗑️  Brisanje google_ads...');
    await supabase.from('google_ads').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    console.log('🗑️  Brisanje hosting...');
    await supabase.from('hosting').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    console.log('🗑️  Brisanje rate...');
    await supabase.from('rate').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    console.log('🗑️  Brisanje kupci...');
    await supabase.from('kupci').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    console.log('🗑️  Brisanje id_mapping...');
    await supabase.from('id_mapping').delete().neq('mongodb_id', 'dummy');

    console.log('\n✅ Svi podaci obrisani!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Greška:', error);
    process.exit(1);
  }
}

clearSupabase();
