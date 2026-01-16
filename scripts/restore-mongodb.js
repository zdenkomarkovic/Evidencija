// Rollback skripta - Vraća podatke iz JSON backup-a nazad u MongoDB
// PAŽNJA: Ova skripta BRIŠE postojeće podatke i učitava backup!
// Korišćenje: node scripts/restore-mongodb.js

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Jednostavni modeli
const kupacSchema = new mongoose.Schema({
  ime: String,
  firma: String,
  email: String,
  email2: String,
  telefon: String,
  telefon2: String,
  nacinPlacanja: String,
  domen: String,
}, { timestamps: true });

const rataSchema = new mongoose.Schema({
  kupacId: { type: mongoose.Schema.Types.ObjectId, ref: 'Kupac' },
  iznos: Number,
  datumDospeca: Date,
  placeno: Boolean,
  datumPlacanja: Date,
  nacinPlacanja: String,
  podsetnikPoslat: Boolean,
}, { timestamps: true });

const hostingSchema = new mongoose.Schema({
  kupacId: { type: mongoose.Schema.Types.ObjectId, ref: 'Kupac' },
  datumPocetka: Date,
  datumObnavljanja: Date,
  podsetnikPoslat: Boolean,
}, { timestamps: true });

const googleAdsSchema = new mongoose.Schema({
  kupacId: { type: mongoose.Schema.Types.ObjectId, ref: 'Kupac' },
  imeKampanje: String,
  imeGoogleNaloga: String,
  datumPocetka: Date,
  datumIsteka: Date,
  iznos: Number,
  placeno: Boolean,
  nastavci: [{
    datum: Date,
    iznos: Number,
    placeno: Boolean,
  }],
}, { timestamps: true });

const Kupac = mongoose.models.Kupac || mongoose.model('Kupac', kupacSchema);
const Rata = mongoose.models.Rata || mongoose.model('Rata', rataSchema);
const Hosting = mongoose.models.Hosting || mongoose.model('Hosting', hostingSchema);
const GoogleAds = mongoose.models.GoogleAds || mongoose.model('GoogleAds', googleAdsSchema);

async function restoreMongoDB() {
  try {
    console.log('⚠️  PAŽNJA: Ova skripta će obrisati sve postojeće podatke!');
    console.log('⏳ Čekam 3 sekunde pre nego što nastavim...\n');

    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('🔌 Povezivanje sa MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Povezan sa MongoDB\n');

    const backupDir = path.join(process.cwd(), 'backups');

    // Učitaj LATEST backup fajlove
    const kupciFile = path.join(backupDir, 'kupci_LATEST.json');
    const rateFile = path.join(backupDir, 'rate_LATEST.json');
    const hostingFile = path.join(backupDir, 'hosting_LATEST.json');
    const googleAdsFile = path.join(backupDir, 'google_ads_LATEST.json');

    // Proveri da li backup fajlovi postoje
    if (!fs.existsSync(kupciFile)) {
      throw new Error('Backup fajlovi ne postoje! Prvo pokreni backup skriptu.');
    }

    console.log('📦 Učitavanje backup podataka...\n');

    const kupci = JSON.parse(fs.readFileSync(kupciFile, 'utf8'));
    const rate = JSON.parse(fs.readFileSync(rateFile, 'utf8'));
    const hosting = JSON.parse(fs.readFileSync(hostingFile, 'utf8'));
    const googleAds = JSON.parse(fs.readFileSync(googleAdsFile, 'utf8'));

    console.log('🗑️  Brisanje postojećih podataka...');
    await Kupac.deleteMany({});
    await Rata.deleteMany({});
    await Hosting.deleteMany({});
    await GoogleAds.deleteMany({});
    console.log('   ✅ Stari podaci obrisani\n');

    console.log('📥 Vraćam podatke iz backup-a...\n');

    // Restore Kupci
    console.log('👥 Vraćam Kupce...');
    await Kupac.insertMany(kupci);
    console.log(`   ✅ ${kupci.length} kupaca vraćeno`);

    // Restore Rate
    console.log('💰 Vraćam Rate...');
    await Rata.insertMany(rate);
    console.log(`   ✅ ${rate.length} rata vraćeno`);

    // Restore Hosting
    console.log('🌐 Vraćam Hosting...');
    await Hosting.insertMany(hosting);
    console.log(`   ✅ ${hosting.length} hosting zapisa vraćeno`);

    // Restore Google Ads
    console.log('📢 Vraćam Google Ads...');
    await GoogleAds.insertMany(googleAds);
    console.log(`   ✅ ${googleAds.length} Google Ads kampanja vraćeno`);

    console.log('\n📊 STATISTIKA RESTORE-A:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Kupci:        ${kupci.length}`);
    console.log(`   Rate:         ${rate.length}`);
    console.log(`   Hosting:      ${hosting.length}`);
    console.log(`   Google Ads:   ${googleAds.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   UKUPNO:       ${kupci.length + rate.length + hosting.length + googleAds.length} zapisa`);
    console.log('\n✨ Restore uspešno završen!');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Greška pri restore-u:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

restoreMongoDB();
