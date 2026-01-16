// Skripta za migraciju postojećih kupaca - dodaje nacinPlacanja polje
// Pokrenite sa: node scripts/migrate-kupci-nacin-placanja.js

const mongoose = require('mongoose');

// MongoDB konekcija
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/podsetnik-rate';

// Kupac model (jednostavna verzija samo za migraciju)
const KupacSchema = new mongoose.Schema({
  ime: String,
  firma: String,
  email: String,
  email2: String,
  telefon: String,
  telefon2: String,
  nacinPlacanja: { type: String, enum: ['fiskalni', 'faktura'] },
  domen: String,
}, { timestamps: true });

const Kupac = mongoose.models.Kupac || mongoose.model('Kupac', KupacSchema);

async function migrateKupciNacinPlacanja() {
  try {
    console.log('Povezivanje sa MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Povezano!');

    // Pronađi sve kupce koji nemaju nacinPlacanja
    const kupciBezNacinaPlacanja = await Kupac.find({
      $or: [
        { nacinPlacanja: { $exists: false } },
        { nacinPlacanja: null }
      ]
    });

    console.log(`\nPronađeno ${kupciBezNacinaPlacanja.length} kupaca bez načina plaćanja.`);

    if (kupciBezNacinaPlacanja.length === 0) {
      console.log('Svi kupci već imaju način plaćanja. Migracija nije potrebna.');
      await mongoose.connection.close();
      return;
    }

    let azurirano = 0;
    let greske = 0;

    for (const kupac of kupciBezNacinaPlacanja) {
      try {
        // Postavi default način plaćanja na 'fiskalni'
        await Kupac.updateOne(
          { _id: kupac._id },
          { $set: { nacinPlacanja: 'fiskalni' } }
        );

        azurirano++;
        console.log(`✓ Ažuriran kupac: ${kupac.ime} → Način plaćanja: fiskalni`);
      } catch (error) {
        greske++;
        console.error(`✗ Greška pri ažuriranju kupca ${kupac.ime}:`, error.message);
      }
    }

    console.log(`\n--- Rezultati migracije ---`);
    console.log(`Uspešno ažurirano: ${azurirano}`);
    console.log(`Greške: ${greske}`);
    console.log(`Ukupno: ${kupciBezNacinaPlacanja.length}`);

    await mongoose.connection.close();
    console.log('\nVeza sa bazom zatvorena.');
  } catch (error) {
    console.error('Greška pri migraciji:', error);
    process.exit(1);
  }
}

// Pokreni migraciju
migrateKupciNacinPlacanja();
