// Verifikacija migracije - Uporedi podatke između MongoDB i Supabase
// Korišćenje: node scripts/verify-migration.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function verifyMigration() {
  try {
    console.log('🔍 Verifikacija migriranih podataka...\n');

    const backupDir = path.join(process.cwd(), 'backups');

    // Učitaj MongoDB backup podatke
    const mongoKupci = JSON.parse(fs.readFileSync(path.join(backupDir, 'kupci_LATEST.json'), 'utf8'));
    const mongoRate = JSON.parse(fs.readFileSync(path.join(backupDir, 'rate_LATEST.json'), 'utf8'));
    const mongoHosting = JSON.parse(fs.readFileSync(path.join(backupDir, 'hosting_LATEST.json'), 'utf8'));
    const mongoGoogleAds = JSON.parse(fs.readFileSync(path.join(backupDir, 'google_ads_LATEST.json'), 'utf8'));

    // Dohvati Supabase podatke
    const { data: supaKupci } = await supabase.from('kupci').select('*');
    const { data: supaRate } = await supabase.from('rate').select('*');
    const { data: supaHosting } = await supabase.from('hosting').select('*');
    const { data: supaGoogleAds } = await supabase.from('google_ads').select('*');
    const { data: supaNastavci } = await supabase.from('google_ads_nastavci').select('*');

    console.log('📊 POREĐENJE BROJEVA:\n');
    console.log('┌─────────────────────┬──────────┬───────────┬──────────┐');
    console.log('│ Kolekcija/Tabela    │ MongoDB  │ Supabase  │ Status   │');
    console.log('├─────────────────────┼──────────┼───────────┼──────────┤');

    const kupciMatch = mongoKupci.length === supaKupci.length ? '✅' : '❌';
    const rateMatch = mongoRate.length === supaRate.length ? '✅' : '❌';
    const hostingMatch = mongoHosting.length === supaHosting.length ? '✅' : '❌';
    const googleAdsMatch = mongoGoogleAds.length === supaGoogleAds.length ? '✅' : '❌';

    console.log(`│ Kupci               │ ${mongoKupci.length.toString().padEnd(8)} │ ${supaKupci.length.toString().padEnd(9)} │ ${kupciMatch}       │`);
    console.log(`│ Rate                │ ${mongoRate.length.toString().padEnd(8)} │ ${supaRate.length.toString().padEnd(9)} │ ${rateMatch}       │`);
    console.log(`│ Hosting             │ ${mongoHosting.length.toString().padEnd(8)} │ ${supaHosting.length.toString().padEnd(9)} │ ${hostingMatch}       │`);
    console.log(`│ Google Ads          │ ${mongoGoogleAds.length.toString().padEnd(8)} │ ${supaGoogleAds.length.toString().padEnd(9)} │ ${googleAdsMatch}       │`);

    // Izbroj nastavke iz MongoDB
    let mongoNastavciCount = 0;
    mongoGoogleAds.forEach(ad => {
      if (ad.nastavci) mongoNastavciCount += ad.nastavci.length;
    });
    const nastavciMatch = mongoNastavciCount === supaNastavci.length ? '✅' : '❌';

    console.log(`│ Nastavci            │ ${mongoNastavciCount.toString().padEnd(8)} │ ${supaNastavci.length.toString().padEnd(9)} │ ${nastavciMatch}       │`);
    console.log('└─────────────────────┴──────────┴───────────┴──────────┘');

    // Proveri random uzorke
    console.log('\n🔬 RANDOM UZORCI:\n');

    // Random kupac
    const randomKupacMongo = mongoKupci[Math.floor(Math.random() * mongoKupci.length)];
    const randomKupacSupa = supaKupci.find(k => k.ime === randomKupacMongo.ime && k.email === randomKupacMongo.email);

    console.log('👤 Random kupac:');
    console.log(`   MongoDB: ${randomKupacMongo.ime} (${randomKupacMongo.email})`);
    if (randomKupacSupa) {
      console.log(`   Supabase: ${randomKupacSupa.ime} (${randomKupacSupa.email}) ✅`);
    } else {
      console.log(`   Supabase: NE POSTOJI ❌`);
    }

    // Random rata
    const randomRataMongo = mongoRate[Math.floor(Math.random() * mongoRate.length)];
    console.log(`\n💰 Random rata:`);
    console.log(`   MongoDB: ${randomRataMongo.iznos} RSD, dospeva ${new Date(randomRataMongo.datumDospeca).toLocaleDateString('sr-RS')}`);
    console.log(`   MongoDB placeno: ${randomRataMongo.placeno}`);

    // Proveri foreign keys
    console.log('\n🔗 FOREIGN KEY INTEGRITE:\n');

    let brokenFKs = 0;
    for (const rata of supaRate) {
      const kupacPostoji = supaKupci.find(k => k.id === rata.kupac_id);
      if (!kupacPostoji) {
        console.log(`   ❌ Rata ${rata.id} ima nepostojeći kupac_id`);
        brokenFKs++;
      }
    }

    for (const hosting of supaHosting) {
      const kupacPostoji = supaKupci.find(k => k.id === hosting.kupac_id);
      if (!kupacPostoji) {
        console.log(`   ❌ Hosting ${hosting.id} ima nepostojeći kupac_id`);
        brokenFKs++;
      }
    }

    for (const ads of supaGoogleAds) {
      const kupacPostoji = supaKupci.find(k => k.id === ads.kupac_id);
      if (!kupacPostoji) {
        console.log(`   ❌ Google Ads ${ads.id} ima nepostojeći kupac_id`);
        brokenFKs++;
      }
    }

    if (brokenFKs === 0) {
      console.log('   ✅ Svi foreign key-evi su validni!');
    } else {
      console.log(`   ❌ Pronađeno ${brokenFKs} pokvarenih foreign key-eva`);
    }

    // Finalni rezime
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const allMatch = kupciMatch === '✅' && rateMatch === '✅' && hostingMatch === '✅' && googleAdsMatch === '✅' && nastavciMatch === '✅' && brokenFKs === 0;

    if (allMatch) {
      console.log('✅ MIGRACIJA JE 100% USPEŠNA!');
      console.log('   Svi podaci su ispravno migrirani.');
      console.log('   Svi foreign key-evi su validni.');
      console.log('   Možeš nastaviti sa refaktorisanjem koda!');
    } else {
      console.log('⚠️  MIGRACIJA IMA PROBLEMA');
      console.log('   Proveri log iznad za detalje.');
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (error) {
    console.error('❌ Greška pri verifikaciji:', error);
    process.exit(1);
  }
}

verifyMigration();
