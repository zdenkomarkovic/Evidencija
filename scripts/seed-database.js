// Skripta za popunjavanje baze test podacima
// Korišćenje: node scripts/seed-database.js
// NAPOMENA: Zahteva da MongoDB i environment varijable budu postavljeni

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Jednostavni modeli (bez importa TypeScript fajlova)
const kupacSchema = new mongoose.Schema({
  ime: String,
  email: String,
  telefon: String,
}, { timestamps: true });

const rataSchema = new mongoose.Schema({
  kupacId: { type: mongoose.Schema.Types.ObjectId, ref: 'Kupac' },
  iznos: Number,
  datumDospeca: Date,
  placeno: Boolean,
  nacinPlacanja: String,
  podsetnikPoslat: Boolean,
}, { timestamps: true });

const hostingSchema = new mongoose.Schema({
  kupacId: { type: mongoose.Schema.Types.ObjectId, ref: 'Kupac' },
  datumObnavljanja: Date,
  podsetnikPoslat: Boolean,
}, { timestamps: true });

const Kupac = mongoose.models.Kupac || mongoose.model('Kupac', kupacSchema);
const Rata = mongoose.models.Rata || mongoose.model('Rata', rataSchema);
const Hosting = mongoose.models.Hosting || mongoose.model('Hosting', hostingSchema);

// Test podaci
const testKupci = [
  { ime: 'Marko Marković', email: 'marko@example.com', telefon: '+381641111111' },
  { ime: 'Ana Anić', email: 'ana@example.com', telefon: '+381642222222' },
  { ime: 'Petar Petrović', email: 'petar@example.com', telefon: '+381643333333' },
  { ime: 'Jovana Jovanović', email: 'jovana@example.com', telefon: '+381644444444' },
  { ime: 'Stefan Stefanović', email: 'stefan@example.com', telefon: '+381645555555' },
];

async function seedDatabase() {
  try {
    console.log('🔌 Povezivanje sa MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Povezan sa MongoDB\n');

    // Obriši postojeće podatke (opciono)
    console.log('🗑️  Brisanje postojećih test podataka...');
    await Kupac.deleteMany({});
    await Rata.deleteMany({});
    await Hosting.deleteMany({});
    console.log('✅ Stari podaci obrisani\n');

    // Kreiraj kupce
    console.log('👥 Kreiranje kupaca...');
    const kupci = await Kupac.insertMany(testKupci);
    console.log(`✅ Kreirano ${kupci.length} kupaca\n`);

    // Kreiraj rate za svakog kupca
    console.log('💰 Kreiranje rata...');
    const rate = [];
    for (const kupac of kupci) {
      // 3 rate po kupcu
      for (let i = 0; i < 3; i++) {
        const datum = new Date();
        datum.setDate(datum.getDate() + (i * 30)); // Svaki mesec

        rate.push({
          kupacId: kupac._id,
          iznos: Math.floor(Math.random() * 10000) + 5000, // Random iznos 5000-15000
          datumDospeca: datum,
          placeno: i === 0 ? true : false, // Prva je plaćena
          nacinPlacanja: i === 0 ? 'manual' : null,
          podsetnikPoslat: false,
        });
      }
    }
    await Rata.insertMany(rate);
    console.log(`✅ Kreirano ${rate.length} rata\n`);

    // Kreiraj hosting za svakog kupca
    console.log('🌐 Kreiranje hosting zapisa...');
    const hosting = [];
    for (const kupac of kupci) {
      const datum = new Date();
      datum.setMonth(datum.getMonth() + Math.floor(Math.random() * 12)); // Random u sledećih 12 meseci

      hosting.push({
        kupacId: kupac._id,
        datumObnavljanja: datum,
        podsetnikPoslat: false,
      });
    }
    await Hosting.insertMany(hosting);
    console.log(`✅ Kreirano ${hosting.length} hosting zapisa\n`);

    // Statistika
    console.log('📊 Statistika:');
    console.log(`   Kupci: ${kupci.length}`);
    console.log(`   Rate: ${rate.length}`);
    console.log(`   Hosting: ${hosting.length}`);
    console.log(`   Neplaćene rate: ${rate.filter(r => !r.placeno).length}`);
    console.log(`   Ukupan dug: ${rate.filter(r => !r.placeno).reduce((sum, r) => sum + r.iznos, 0).toLocaleString('sr-RS')} RSD`);

    console.log('\n✨ Baza uspešno popunjena test podacima!');
    console.log('🌐 Otvori admin panel: http://localhost:3000/admin');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Greška:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedDatabase();
