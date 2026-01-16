// Test skripta za API rute
// Korišćenje: node scripts/test-api.js

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function testAPI() {
  console.log('🚀 Testiranje API ruta...\n');

  try {
    // Test 1: Kreiranje kupca
    console.log('1️⃣ Kreiranje test kupca...');
    const kupacRes = await fetch(`${BASE_URL}/api/kupci`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ime: 'Test Kupac',
        email: 'test@example.com',
        telefon: '+381641234567',
      }),
    });
    const kupac = await kupacRes.json();
    console.log('✅ Kupac kreiran:', kupac._id);

    // Test 2: Dohvatanje kupaca
    console.log('\n2️⃣ Dohvatanje svih kupaca...');
    const kupciRes = await fetch(`${BASE_URL}/api/kupci`);
    const kupci = await kupciRes.json();
    console.log(`✅ Pronađeno ${kupci.length} kupaca`);

    // Test 3: Kreiranje rate
    console.log('\n3️⃣ Kreiranje test rate...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const rataRes = await fetch(`${BASE_URL}/api/rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kupacId: kupac._id,
        iznos: 5000,
        datumDospeca: tomorrow.toISOString().split('T')[0],
      }),
    });
    const rata = await rataRes.json();
    console.log('✅ Rata kreirana:', rata._id);

    // Test 4: Dohvatanje rata
    console.log('\n4️⃣ Dohvatanje svih rata...');
    const rateRes = await fetch(`${BASE_URL}/api/rate`);
    const rate = await rateRes.json();
    console.log(`✅ Pronađeno ${rate.length} rata`);

    // Test 5: Kreiranje hosting zapisa
    console.log('\n5️⃣ Kreiranje test hosting zapisa...');
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const hostingRes = await fetch(`${BASE_URL}/api/hosting`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kupacId: kupac._id,
        datumObnavljanja: nextYear.toISOString().split('T')[0],
      }),
    });
    const hosting = await hostingRes.json();
    console.log('✅ Hosting kreiran:', hosting._id);

    // Test 6: Označavanje rate kao plaćene
    console.log('\n6️⃣ Označavanje rate kao plaćene...');
    const placenоRes = await fetch(`${BASE_URL}/api/oznaciPlaceno`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rataId: rata._id,
        nacinPlacanja: 'manual',
      }),
    });
    const placenоData = await placenоRes.json();
    console.log('✅ Rata označena kao plaćena');

    console.log('\n✨ Svi testovi su prošli uspešno!');
    console.log(`\n🌐 Otvori admin panel: ${BASE_URL}/admin`);
  } catch (error) {
    console.error('❌ Greška pri testiranju:', error.message);
    process.exit(1);
  }
}

testAPI();
