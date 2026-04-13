import { NextRequest, NextResponse } from 'next/server';
import { getFakture, createFaktura, getSledediBrojFakture, getSledediBrojPredracuna } from '@/lib/supabase-helpers';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const kupacId = searchParams.get('kupacId') || undefined;
    const status = searchParams.get('status') || undefined;

    const fakture = await getFakture({ kupac_id: kupacId, status });
    return NextResponse.json(fakture);
  } catch (error) {
    console.error('Greška pri dohvatanju faktura:', error);
    return NextResponse.json(
      { error: 'Greška pri dohvatanju faktura', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { kupacId, datumIzdavanja, datumValute, status, napomena, stavke } = body;

    if (!kupacId || !datumIzdavanja || !datumValute) {
      return NextResponse.json(
        { error: 'KupacId, datum izdavanja i datum valute su obavezni' },
        { status: 400 }
      );
    }

    if (!stavke || stavke.length === 0) {
      return NextResponse.json(
        { error: 'Faktura mora imati bar jednu stavku' },
        { status: 400 }
      );
    }

    const ukupanIznos = stavke.reduce(
      (sum: number, s: { iznos: number }) => sum + s.iznos,
      0
    );

    const brojFakture = status === 'predracun'
      ? await getSledediBrojPredracuna()
      : await getSledediBrojFakture();

    const novaFaktura = await createFaktura(
      {
        kupac_id: kupacId,
        broj_fakture: brojFakture,
        datum_izdavanja: datumIzdavanja,
        datum_valute: datumValute,
        status: status || 'izdata',
        napomena: napomena || null,
        ukupan_iznos: ukupanIznos,
      },
      stavke.map((s: { naziv: string; jedinicaMere: string; kolicina: number; cena: number; iznos: number }, i: number) => ({
        naziv: s.naziv,
        jedinica_mere: s.jedinicaMere || 'kom',
        kolicina: s.kolicina,
        cena: s.cena,
        iznos: s.iznos,
        redni_broj: i + 1,
      }))
    );

    return NextResponse.json(novaFaktura, { status: 201 });
  } catch (error) {
    console.error('Greška pri kreiranju fakture:', error);
    return NextResponse.json(
      { error: 'Greška pri kreiranju fakture', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
