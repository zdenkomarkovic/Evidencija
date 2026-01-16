// Skripta za migraciju postojećih hosting zapisa - dodaje datumPocetka polje
// Pokrenite sa: node scripts/migrate-hosting-dates.js

const mongoose = require('mongoose');

// MongoDB konekcija
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/podsetnik-rate';

// Hosting model (jednostavna verzija samo za migraciju)
const HostingSchema = new mongoose.Schema({
  kupacId: { type: mongoose.Schema.Types.ObjectId, ref: 'Kupac' },
  datumPocetka: Date,
  datumObnavljanja: Date,
  podsetnikPoslat: Boolean,
}, { timestamps: true });

const Hosting = mongoose.models.Hosting || mongoose.model('Hosting', HostingSchema);

async function migrateHostingDates() {
  try {
    console.log('Povezivanje sa MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Povezano!');

    // Pronađi sve hosting zapise koji nemaju datumPocetka
    const hostingBezPocetka = await Hosting.find({
      $or: [
        { datumPocetka: { $exists: false } },
        { datumPocetka: null }
      ]
    });

    console.log(`\nPronađeno ${hostingBezPocetka.length} hosting zapisa bez datuma početka.`);

    if (hostingBezPocetka.length === 0) {
      console.log('Svi zapisi već imaju datum početka. Migracija nije potrebna.');
      await mongoose.connection.close();
      return;
    }

    let azurirano = 0;
    let greske = 0;

    for (const hosting of hostingBezPocetka) {
      try {
        // Izračunaj datumPocetka kao godinu dana pre datumObnavljanja
        const datumIsteka = new Date(hosting.datumObnavljanja);
        const datumPocetka = new Date(datumIsteka);
        datumPocetka.setFullYear(datumPocetka.getFullYear() - 1);

        // Ažuriraj zapis
        await Hosting.updateOne(
          { _id: hosting._id },
          { $set: { datumPocetka: datumPocetka } }
        );

        azurirano++;
        console.log(`✓ Ažuriran hosting ${hosting._id}: Datum isteka ${datumIsteka.toLocaleDateString('sr-RS')} → Datum početka ${datumPocetka.toLocaleDateString('sr-RS')}`);
      } catch (error) {
        greske++;
        console.error(`✗ Greška pri ažuriranju hosting zapisa ${hosting._id}:`, error.message);
      }
    }

    console.log(`\n--- Rezultati migracije ---`);
    console.log(`Uspešno ažurirano: ${azurirano}`);
    console.log(`Greške: ${greske}`);
    console.log(`Ukupno: ${hostingBezPocetka.length}`);

    await mongoose.connection.close();
    console.log('\nVeza sa bazom zatvorena.');
  } catch (error) {
    console.error('Greška pri migraciji:', error);
    process.exit(1);
  }
}

// Pokreni migraciju
migrateHostingDates();
