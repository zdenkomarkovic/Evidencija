// Migraciona skripta - Prebacuje podatke iz MongoDB backup-a u Supabase
// Korišćenje: node scripts/migrate-to-supabase.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Supabase klijent
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ SUPABASE_URL ili SUPABASE_ANON_KEY nisu postavljeni u .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Globalni mapping: MongoDB ObjectId → Supabase UUID
const idMapping = {
  kupci: new Map(),
  rate: new Map(),
  hosting: new Map(),
  google_ads: new Map(),
};

async function migrateToSupabase() {
  try {
    console.log('🚀 Pokretanje migracije MongoDB → Supabase\n');

    const backupDir = path.join(process.cwd(), 'backups');

    // Učitaj backup fajlove
    console.log('📦 Učitavanje backup podataka...');
    const kupci = JSON.parse(fs.readFileSync(path.join(backupDir, 'kupci_LATEST.json'), 'utf8'));
    const rate = JSON.parse(fs.readFileSync(path.join(backupDir, 'rate_LATEST.json'), 'utf8'));
    const hosting = JSON.parse(fs.readFileSync(path.join(backupDir, 'hosting_LATEST.json'), 'utf8'));
    const googleAds = JSON.parse(fs.readFileSync(path.join(backupDir, 'google_ads_LATEST.json'), 'utf8'));

    console.log(`   ✅ Učitano ${kupci.length} kupaca`);
    console.log(`   ✅ Učitano ${rate.length} rata`);
    console.log(`   ✅ Učitano ${hosting.length} hosting zapisa`);
    console.log(`   ✅ Učitano ${googleAds.length} Google Ads kampanja\n`);

    // ========================================
    // 1. MIGRACIJA KUPACA (parent tabela)
    // ========================================
    console.log('👥 Migracija kupaca...');
    let successCount = 0;

    for (const kupac of kupci) {
      const { data, error } = await supabase
        .from('kupci')
        .insert({
          ime: kupac.ime,
          firma: kupac.firma || null,
          email: kupac.email,
          email2: kupac.email2 || null,
          telefon: kupac.telefon,
          telefon2: kupac.telefon2 || null,
          nacin_placanja: kupac.nacinPlacanja,
          domen: kupac.domen || null,
          created_at: kupac.createdAt,
          updated_at: kupac.updatedAt,
        })
        .select('id')
        .single();

      if (error) {
        console.error(`   ❌ Greška pri migraciji kupca "${kupac.ime}":`, error.message);
        continue;
      }

      // Sačuvaj mapping MongoDB ObjectId → Supabase UUID
      idMapping.kupci.set(kupac._id, data.id);
      successCount++;
    }

    console.log(`   ✅ Migrirano ${successCount}/${kupci.length} kupaca\n`);

    // ========================================
    // 2. MIGRACIJA RATA
    // ========================================
    console.log('💰 Migracija rata...');
    successCount = 0;

    for (const rata of rate) {
      const kupacId = idMapping.kupci.get(rata.kupacId);

      if (!kupacId) {
        console.error(`   ⚠️  Kupac sa ID ${rata.kupacId} ne postoji (preskačem ratu)`);
        continue;
      }

      const { data, error } = await supabase
        .from('rate')
        .insert({
          kupac_id: kupacId,
          iznos: rata.iznos,
          datum_dospeca: rata.datumDospeca,
          placeno: rata.placeno,
          datum_placanja: rata.datumPlacanja || null,
          nacin_placanja: rata.nacinPlacanja || null,
          podsetnik_poslat: rata.podsetnikPoslat,
          created_at: rata.createdAt,
          updated_at: rata.updatedAt,
        })
        .select('id')
        .single();

      if (error) {
        console.error(`   ❌ Greška pri migraciji rate:`, error.message);
        continue;
      }

      idMapping.rate.set(rata._id, data.id);
      successCount++;
    }

    console.log(`   ✅ Migrirano ${successCount}/${rate.length} rata\n`);

    // ========================================
    // 3. MIGRACIJA HOSTING-A
    // ========================================
    console.log('🌐 Migracija hosting zapisa...');
    successCount = 0;

    for (const host of hosting) {
      const kupacId = idMapping.kupci.get(host.kupacId);

      if (!kupacId) {
        console.error(`   ⚠️  Kupac sa ID ${host.kupacId} ne postoji (preskačem hosting)`);
        continue;
      }

      const { data, error } = await supabase
        .from('hosting')
        .insert({
          kupac_id: kupacId,
          datum_pocetka: host.datumPocetka,
          datum_obnavljanja: host.datumObnavljanja,
          podsetnik_poslat: host.podsetnikPoslat,
          created_at: host.createdAt,
          updated_at: host.updatedAt,
        })
        .select('id')
        .single();

      if (error) {
        console.error(`   ❌ Greška pri migraciji hosting-a:`, error.message);
        continue;
      }

      idMapping.hosting.set(host._id, data.id);
      successCount++;
    }

    console.log(`   ✅ Migrirano ${successCount}/${hosting.length} hosting zapisa\n`);

    // ========================================
    // 4. MIGRACIJA GOOGLE ADS
    // ========================================
    console.log('📢 Migracija Google Ads kampanja...');
    successCount = 0;
    let nastavciCount = 0;

    for (const ad of googleAds) {
      const kupacId = idMapping.kupci.get(ad.kupacId);

      if (!kupacId) {
        console.error(`   ⚠️  Kupac sa ID ${ad.kupacId} ne postoji (preskačem kampanju)`);
        continue;
      }

      // Insert Google Ads kampanje
      const { data, error } = await supabase
        .from('google_ads')
        .insert({
          kupac_id: kupacId,
          ime_kampanje: ad.imeKampanje,
          ime_google_naloga: ad.imeGoogleNaloga,
          datum_pocetka: ad.datumPocetka,
          datum_isteka: ad.datumIsteka,
          iznos: ad.iznos,
          placeno: ad.placeno,
          created_at: ad.createdAt,
          updated_at: ad.updatedAt,
        })
        .select('id')
        .single();

      if (error) {
        console.error(`   ❌ Greška pri migraciji Google Ads:`, error.message);
        continue;
      }

      const googleAdsId = data.id;
      idMapping.google_ads.set(ad._id, googleAdsId);
      successCount++;

      // Insert nastavke (nested documents iz MongoDB)
      if (ad.nastavci && ad.nastavci.length > 0) {
        for (const nastavak of ad.nastavci) {
          const { error: nastavakError } = await supabase
            .from('google_ads_nastavci')
            .insert({
              google_ads_id: googleAdsId,
              datum: nastavak.datum,
              iznos: nastavak.iznos,
              placeno: nastavak.placeno,
            });

          if (nastavakError) {
            console.error(`   ⚠️  Greška pri migraciji nastavka:`, nastavakError.message);
          } else {
            nastavciCount++;
          }
        }
      }
    }

    console.log(`   ✅ Migrirano ${successCount}/${googleAds.length} Google Ads kampanja`);
    console.log(`   ✅ Migrirano ${nastavciCount} nastavaka\n`);

    // ========================================
    // 5. SAČUVAJ ID MAPPING U BAZU (opciono, za debugging)
    // ========================================
    console.log('💾 Čuvanje ID mapping-a...');
    const mappingRecords = [];

    idMapping.kupci.forEach((supabaseId, mongoId) => {
      mappingRecords.push({ mongodb_id: mongoId, supabase_id: supabaseId, collection_name: 'kupci' });
    });
    idMapping.rate.forEach((supabaseId, mongoId) => {
      mappingRecords.push({ mongodb_id: mongoId, supabase_id: supabaseId, collection_name: 'rate' });
    });
    idMapping.hosting.forEach((supabaseId, mongoId) => {
      mappingRecords.push({ mongodb_id: mongoId, supabase_id: supabaseId, collection_name: 'hosting' });
    });
    idMapping.google_ads.forEach((supabaseId, mongoId) => {
      mappingRecords.push({ mongodb_id: mongoId, supabase_id: supabaseId, collection_name: 'google_ads' });
    });

    const { error: mappingError } = await supabase.from('id_mapping').insert(mappingRecords);

    if (mappingError) {
      console.log(`   ⚠️  Greška pri čuvanju mapping-a (nije kritično):`, mappingError.message);
    } else {
      console.log(`   ✅ Sačuvano ${mappingRecords.length} ID mapping zapisa\n`);
    }

    // ========================================
    // 6. VERIFIKACIJA
    // ========================================
    console.log('🔍 Verifikacija migriranih podataka...');

    const { data: stats, error: statsError } = await supabase.rpc('get_database_stats');

    if (statsError) {
      console.log('   ⚠️  Ne mogu dohvatiti statistiku');
    } else {
      console.log('   📊 Supabase baza statistika:');
      stats.forEach(row => {
        console.log(`      ${row.tabela}: ${row.broj_zapisa} zapisa`);
      });
    }

    console.log('\n✨ Migracija uspešno završena!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   MongoDB → Supabase');
    console.log(`   Kupci:        ${idMapping.kupci.size} ✅`);
    console.log(`   Rate:         ${idMapping.rate.size} ✅`);
    console.log(`   Hosting:      ${idMapping.hosting.size} ✅`);
    console.log(`   Google Ads:   ${idMapping.google_ads.size} ✅`);
    console.log(`   Nastavci:     ${nastavciCount} ✅`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🎉 Svi podaci su uspešno migrirani u Supabase!');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Kritična greška tokom migracije:', error);
    process.exit(1);
  }
}

migrateToSupabase();
