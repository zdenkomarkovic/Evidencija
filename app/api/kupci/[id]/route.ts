import { NextRequest, NextResponse } from 'next/server';
import { getKupacById, updateKupac, deleteKupac } from '@/lib/supabase-helpers';

// GET - Dohvati jednog kupca
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const kupac = await getKupacById(id);

    if (!kupac) {
      return NextResponse.json(
        { error: 'Kupac nije pronađen' },
        { status: 404 }
      );
    }

    return NextResponse.json(kupac);
  } catch (error) {
    console.error('Greška pri dohvatanju kupca:', error);
    return NextResponse.json(
      { error: 'Greška pri dohvatanju kupca', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// PUT - Ažuriraj kupca
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await request.json();
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

    const azuriranKupac = await updateKupac(id, {
      ime,
      firma: firma || null,
      email,
      email2: email2 || null,
      telefon,
      telefon2: telefon2 || null,
      nacin_placanja: nacinPlacanja || null,
      domen: domen || null,
    });

    if (!azuriranKupac) {
      return NextResponse.json(
        { error: 'Kupac nije pronađen' },
        { status: 404 }
      );
    }

    console.log('Kupac ažuriran:', azuriranKupac.id);
    return NextResponse.json(azuriranKupac);
  } catch (error) {
    console.error('Greška pri ažuriranju kupca:', error);
    return NextResponse.json(
      { error: 'Greška pri ažuriranju kupca', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// DELETE - Obriši kupca
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Proveri da li kupac postoji
    const kupac = await getKupacById(id);
    if (!kupac) {
      return NextResponse.json(
        { error: 'Kupac nije pronađen' },
        { status: 404 }
      );
    }

    // Obriši kupca (CASCADE će automatski obrisati povezane podatke)
    await deleteKupac(id);

    console.log('Kupac i svi povezani podaci obrisani:', id);
    return NextResponse.json({
      message: 'Kupac i svi povezani podaci su uspešno obrisani',
    });
  } catch (error) {
    console.error('Greška pri brisanju kupca:', error);
    return NextResponse.json(
      { error: 'Greška pri brisanju kupca', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
