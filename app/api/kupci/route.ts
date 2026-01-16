import { NextRequest, NextResponse } from 'next/server';
import { getKupci, createKupac, getRate } from '@/lib/supabase-helpers';

// GET - Dohvati sve kupce sa informacijama o ratama
export async function GET() {
  try {
    const kupci = await getKupci();

    // Za svakog kupca dohvati informacije o ratama
    const kupciSaRatama = await Promise.all(
      kupci.map(async (kupac) => {
        const rate = await getRate({ kupac_id: (kupac as Record<string, string>)._id });
        const neplaceneRate = rate.filter((r) => !r.placeno);
        const ukupanDug = neplaceneRate.reduce((sum, r) => sum + r.iznos, 0);

        return {
          ...kupac,
          brojRata: rate.length,
          brojNeplacenihRata: neplaceneRate.length,
          ukupanDug,
        };
      })
    );

    return NextResponse.json(kupciSaRatama);
  } catch (error) {
    console.error('Greška pri dohvatanju kupaca:', error);
    return NextResponse.json(
      { error: 'Greška pri dohvatanju kupaca' },
      { status: 500 }
    );
  }
}

// POST - Kreiraj novog kupca
export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/kupci - Starting...');

    const body = await request.json();
    console.log('Request body:', body);

    const { ime, firma, email, email2, telefon, telefon2, nacinPlacanja, domen } = body;

    if (!ime || !email || !telefon) {
      return NextResponse.json(
        { error: 'Ime, email i telefon su obavezni' },
        { status: 400 }
      );
    }

    if (nacinPlacanja && nacinPlacanja !== 'fiskalni' && nacinPlacanja !== 'faktura') {
      return NextResponse.json(
        { error: 'Način plaćanja mora biti "fiskalni" ili "faktura"' },
        { status: 400 }
      );
    }

    const noviKupac = await createKupac({
      ime,
      firma: firma || null,
      email,
      email2: email2 || null,
      telefon,
      telefon2: telefon2 || null,
      nacin_placanja: nacinPlacanja || null,
      domen: domen || null,
    });

    console.log('Kupac kreiran:', noviKupac.id);
    return NextResponse.json(noviKupac, { status: 201 });
  } catch (error) {
    console.error('Greška pri kreiranju kupca:', error);
    return NextResponse.json(
      {
        error: 'Greška pri kreiranju kupca',
        details: error instanceof Error ? error.message : String(error),
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
