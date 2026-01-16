// Backup skripta - Exportuje sve MongoDB podatke u JSON fajlove
// Korišćenje: node scripts/backup-mongodb.js

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

async function backupMongoDB() {
  try {
    console.log('🔌 Povezivanje sa MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Povezan sa MongoDB\n');

    const backupDir = path.join(process.cwd(), 'backups');

    // Proveri da li postoji backups folder
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
      console.log('📁 Kreiran backups folder\n');
    }

    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];

    console.log('📦 Exportovanje podataka...\n');

    // Backup Kupci
    console.log('👥 Exportujem Kupce...');
    const kupci = await Kupac.find().lean();
    const kupciFile = path.join(backupDir, `kupci_${timestamp}.json`);
    fs.writeFileSync(kupciFile, JSON.stringify(kupci, null, 2));
    console.log(`   ✅ ${kupci.length} kupaca → ${path.basename(kupciFile)}`);

    // Backup Rate
    console.log('💰 Exportujem Rate...');
    const rate = await Rata.find().lean();
    const rateFile = path.join(backupDir, `rate_${timestamp}.json`);
    fs.writeFileSync(rateFile, JSON.stringify(rate, null, 2));
    console.log(`   ✅ ${rate.length} rata → ${path.basename(rateFile)}`);

    // Backup Hosting
    console.log('🌐 Exportujem Hosting...');
    const hosting = await Hosting.find().lean();
    const hostingFile = path.join(backupDir, `hosting_${timestamp}.json`);
    fs.writeFileSync(hostingFile, JSON.stringify(hosting, null, 2));
    console.log(`   ✅ ${hosting.length} hosting zapisa → ${path.basename(hostingFile)}`);

    // Backup Google Ads
    console.log('📢 Exportujem Google Ads...');
    const googleAds = await GoogleAds.find().lean();
    const googleAdsFile = path.join(backupDir, `google_ads_${timestamp}.json`);
    fs.writeFileSync(googleAdsFile, JSON.stringify(googleAds, null, 2));
    console.log(`   ✅ ${googleAds.length} Google Ads kampanja → ${path.basename(googleAdsFile)}`);

    // Kreiraj manifest fajl sa metapodacima
    const manifest = {
      timestamp,
      date: new Date().toISOString(),
      collections: {
        kupci: { count: kupci.length, file: path.basename(kupciFile) },
        rate: { count: rate.length, file: path.basename(rateFile) },
        hosting: { count: hosting.length, file: path.basename(hostingFile) },
        googleAds: { count: googleAds.length, file: path.basename(googleAdsFile) },
      },
      totalRecords: kupci.length + rate.length + hosting.length + googleAds.length,
    };

    const manifestFile = path.join(backupDir, `manifest_${timestamp}.json`);
    fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));

    // Kreiraj LATEST fajlove (za lakši pristup)
    fs.writeFileSync(path.join(backupDir, 'kupci_LATEST.json'), JSON.stringify(kupci, null, 2));
    fs.writeFileSync(path.join(backupDir, 'rate_LATEST.json'), JSON.stringify(rate, null, 2));
    fs.writeFileSync(path.join(backupDir, 'hosting_LATEST.json'), JSON.stringify(hosting, null, 2));
    fs.writeFileSync(path.join(backupDir, 'google_ads_LATEST.json'), JSON.stringify(googleAds, null, 2));
    fs.writeFileSync(path.join(backupDir, 'manifest_LATEST.json'), JSON.stringify(manifest, null, 2));

    console.log('\n📊 STATISTIKA BACKUP-A:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Kupci:        ${kupci.length}`);
    console.log(`   Rate:         ${rate.length}`);
    console.log(`   Hosting:      ${hosting.length}`);
    console.log(`   Google Ads:   ${googleAds.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   UKUPNO:       ${manifest.totalRecords} zapisa`);
    console.log('\n✨ Backup uspešno završen!');
    console.log(`📁 Lokacija: ${backupDir}`);
    console.log(`\n💡 Svi fajlovi su sačuvani i dostupni u 'backups/' folderu`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Greška pri backup-u:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

backupMongoDB();
