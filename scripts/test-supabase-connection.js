// Test skripta - Proverava konekciju sa Supabase
// Korišćenje: node scripts/test-supabase-connection.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testSupabaseConnection() {
  try {
    console.log('🔌 Testiram konekciju sa Supabase...\n');

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('SUPABASE_URL ili SUPABASE_ANON_KEY nisu postavljeni u .env.local');
    }

    console.log('📡 Supabase URL:', supabaseUrl);
    console.log('🔑 API Key:', supabaseAnonKey.substring(0, 20) + '...\n');

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Test 1: Proveri da li su tabele kreirane
    console.log('📊 Test 1: Provera tabela...');
    const { data: kupci, error: kupciError } = await supabase.from('kupci').select('*').limit(1);

    if (kupciError) {
      console.error('❌ Greška pri pristupu tabeli "kupci":', kupciError.message);
      console.log('\n⚠️  Molim te proveri da li si pokrenuo SQL skriptu (supabase-schema.sql) u Supabase SQL Editor-u!');
      process.exit(1);
    }

    console.log('   ✅ Tabela "kupci" postoji');

    // Test 2: Proveri ostale tabele
    const { error: rateError } = await supabase.from('rate').select('*').limit(1);
    const { error: hostingError } = await supabase.from('hosting').select('*').limit(1);
    const { error: googleAdsError } = await supabase.from('google_ads').select('*').limit(1);
    const { error: nastavciError } = await supabase.from('google_ads_nastavci').select('*').limit(1);

    if (rateError) {
      console.error('❌ Tabela "rate" ne postoji ili ima grešku');
      process.exit(1);
    }
    if (hostingError) {
      console.error('❌ Tabela "hosting" ne postoji ili ima grešku');
      process.exit(1);
    }
    if (googleAdsError) {
      console.error('❌ Tabela "google_ads" ne postoji ili ima grešku');
      process.exit(1);
    }
    if (nastavciError) {
      console.error('❌ Tabela "google_ads_nastavci" ne postoji ili ima grešku');
      process.exit(1);
    }

    console.log('   ✅ Tabela "rate" postoji');
    console.log('   ✅ Tabela "hosting" postoji');
    console.log('   ✅ Tabela "google_ads" postoji');
    console.log('   ✅ Tabela "google_ads_nastavci" postoji');

    // Test 3: Test insert
    console.log('\n📝 Test 2: Test insert...');
    const { data: testKupac, error: insertError } = await supabase
      .from('kupci')
      .insert({
        ime: 'Test Korisnik',
        email: 'test@example.com',
        telefon: '+381601234567',
        nacin_placanja: 'fiskalni',
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Greška pri insert-u:', insertError.message);
      process.exit(1);
    }

    console.log('   ✅ Test insert uspešan');
    console.log('   📄 Kreirani test kupac:', testKupac);

    // Test 4: Test delete (obrišemo test podatak)
    console.log('\n🗑️  Test 3: Test delete...');
    const { error: deleteError } = await supabase
      .from('kupci')
      .delete()
      .eq('id', testKupac.id);

    if (deleteError) {
      console.error('❌ Greška pri brisanju:', deleteError.message);
      process.exit(1);
    }

    console.log('   ✅ Test delete uspešan');

    // Test 5: Pozovi statistiku funkciju (ako postoji)
    console.log('\n📊 Test 4: Statistika baze...');
    const { data: stats, error: statsError } = await supabase.rpc('get_database_stats');

    if (statsError) {
      console.log('   ⚠️  Statistika funkcija nije dostupna (to je OK)');
    } else {
      console.log('   ✅ Statistika:');
      stats.forEach(row => {
        console.log(`      ${row.tabela}: ${row.broj_zapisa} zapisa`);
      });
    }

    console.log('\n✨ Svi testovi su prošli uspešno!');
    console.log('✅ Supabase konekcija funkcioniše pravilno');
    console.log('\n🚀 Spremni smo za migraciju podataka!');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Greška:', error.message);
    process.exit(1);
  }
}

testSupabaseConnection();
