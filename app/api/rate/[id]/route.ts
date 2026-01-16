import { NextRequest, NextResponse } from 'next/server';
import { getRataById, updateRata, deleteRata, getKupacById } from '@/lib/supabase-helpers';

// GET - Dohvati jednu ratu
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const rata = await getRataById(id);

    if (!rata) {
      return NextResponse.json(
        { error: 'Rata nije pronađena' },
        { status: 404 }
      );
    }

    return NextResponse.json(rata);
  } catch (error) {
    console.error('Greška pri dohvatanju rate:', error);
    return NextResponse.json(
      { error: 'Greška pri dohvatanju rate', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// PUT - Ažuriraj ratu
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await request.json();
    const { kupacId, iznos, datumDospeca, placeno, datumPlacanja, nacinPlacanja } = body;

    if (!kupacId || !iznos || !datumDospeca) {
      return NextResponse.json(
        { error: 'KupacId, iznos i datum dospeća su obavezni' },
        { status: 400 }
      );
    }

    // Proveri da li kupac postoji
    const kupac = await getKupacById(kupacId);
    if (!kupac) {
      return NextResponse.json(
        { error: 'Kupac sa ovim ID-om ne postoji' },
        { status: 404 }
      );
    }

    const azuriranRata = await updateRata(id, {
      kupac_id: kupacId,
      iznos,
      datum_dospeca: new Date(datumDospeca).toISOString(),
      placeno: placeno !== undefined ? placeno : false,
      datum_placanja: datumPlacanja ? new Date(datumPlacanja).toISOString() : null,
      nacin_placanja: nacinPlacanja || null,
    });

    if (!azuriranRata) {
      return NextResponse.json(
        { error: 'Rata nije pronađena' },
        { status: 404 }
      );
    }

    console.log('Rata ažurirana:', azuriranRata.id);
    return NextResponse.json(azuriranRata);
  } catch (error) {
    console.error('Greška pri ažuriranju rate:', error);
    return NextResponse.json(
      { error: 'Greška pri ažuriranju rate', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// DELETE - Obriši ratu
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await deleteRata(id);

    console.log('Rata obrisana:', id);
    return NextResponse.json({
      message: 'Rata je uspešno obrisana',
    });
  } catch (error) {
    console.error('Greška pri brisanju rate:', error);
    return NextResponse.json(
      { error: 'Greška pri brisanju rate', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
