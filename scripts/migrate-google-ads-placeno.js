const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/podsetnik-rate';

const GoogleAdsSchema = new mongoose.Schema({
  kupacId: { type: mongoose.Schema.Types.ObjectId, ref: 'Kupac' },
  imeKampanje: String,
  imeGoogleNaloga: String,
  datumPocetka: Date,
  datumIsteka: Date,
  iznos: Number,
  placeno: { type: Boolean, default: false },
  nastavci: [{
    datum: Date,
    iznos: Number,
    placeno: { type: Boolean, default: false }
  }]
}, { timestamps: true });

const GoogleAds = mongoose.models.GoogleAds || mongoose.model('GoogleAds', GoogleAdsSchema);

async function migrate() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Povezan sa MongoDB');

    // Postavi placeno na false za sve kampanje koje nemaju to polje
    const result1 = await GoogleAds.updateMany(
      { placeno: { $exists: false } },
      { $set: { placeno: false } }
    );

    console.log(`Ažurirano ${result1.modifiedCount} Google Ads kampanja - osnovni iznos`);

    // Ažuriraj nastavke da dodaju placeno polje ako ga nemaju
    const kampanje = await GoogleAds.find({});
    let updatedNastavci = 0;

    for (const kampanja of kampanje) {
      let modified = false;

      kampanja.nastavci = kampanja.nastavci.map(nastavak => {
        if (nastavak.placeno === undefined) {
          nastavak.placeno = false;
          modified = true;
        }
        return nastavak;
      });

      if (modified) {
        await kampanja.save();
        updatedNastavci++;
      }
    }

    console.log(`Ažurirano ${updatedNastavci} kampanja sa nastavcima`);

    await mongoose.disconnect();
    console.log('Migracija završena');
  } catch (error) {
    console.error('Greška pri migraciji:', error);
    process.exit(1);
  }
}

migrate();
