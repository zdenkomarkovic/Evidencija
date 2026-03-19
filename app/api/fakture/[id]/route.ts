import { NextRequest, NextResponse } from 'next/server';
import { getFakturaById, updateFaktura, deleteFaktura } from '@/lib/supabase-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const faktura = await getFakturaById(id);
    return NextResponse.json(faktura);
  } catch (error) {
    console.error('Greška pri dohvatanju fakture:', error);
    return NextResponse.json(
      { error: 'Faktura nije pronađena', details: error instanceof Error ? error.message : String(error) },
      { status: 404 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { kupacId, datumIzdavanja, datumValute, status, napomena, stavke } = body;

    const ukupanIznos = stavke
      ? stavke.reduce((sum: number, s: { iznos: number }) => sum + s.iznos, 0)
      : undefined;

    const azuriranaFaktura = await updateFaktura(
      id,
      {
        kupac_id: kupacId,
        datum_izdavanja: datumIzdavanja,
        datum_valute: datumValute,
        status,
        napomena: napomena || null,
        ukupan_iznos: ukupanIznos,
      },
      stavke
        ? stavke.map((s: { naziv: string; jedinicaMere: string; kolicina: number; cena: number; iznos: number }, i: number) => ({
            naziv: s.naziv,
            jedinica_mere: s.jedinicaMere || 'kom',
            kolicina: s.kolicina,
            cena: s.cena,
            iznos: s.iznos,
            redni_broj: i + 1,
          }))
        : undefined
    );

    return NextResponse.json(azuriranaFaktura);
  } catch (error) {
    console.error('Greška pri ažuriranju fakture:', error);
    return NextResponse.json(
      { error: 'Greška pri ažuriranju fakture', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteFaktura(id);
    return NextResponse.json({ message: 'Faktura je uspešno obrisana' });
  } catch (error) {
    console.error('Greška pri brisanju fakture:', error);
    return NextResponse.json(
      { error: 'Greška pri brisanju fakture', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
