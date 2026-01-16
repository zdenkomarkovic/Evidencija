// Test MongoDB konekcije
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  try {
    console.log('Pokušavam da se povežem na MongoDB...');
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Postoji ✓' : 'Ne postoji ✗');

    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI nije definisan u .env.local');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Uspešno povezan na MongoDB!');

    // Test kreiranje kupca
    const KupacSchema = new mongoose.Schema({
      ime: String,
      email: String,
      telefon: String,
    }, { timestamps: true });

    const Kupac = mongoose.models.Kupac || mongoose.model('Kupac', KupacSchema);

    const testKupac = await Kupac.create({
      ime: 'Test Kupac',
      email: 'test@example.com',
      telefon: '+381641234567',
    });

    console.log('✓ Test kupac kreiran:', testKupac._id);

    // Obriši test kupca
    await Kupac.findByIdAndDelete(testKupac._id);
    console.log('✓ Test kupac obrisan');

    await mongoose.disconnect();
    console.log('✓ Veza zatvorena');

    console.log('\n🎉 MongoDB konekcija radi ispravno!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ GREŠKA:', error.message);
    console.error('\nDetalji:', error);
    process.exit(1);
  }
}

testConnection();
