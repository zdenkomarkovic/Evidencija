import { NextRequest, NextResponse } from 'next/server';
import {
  getGoogleAdsById,
  updateGoogleAds,
  deleteGoogleAds,
  getKupacById
} from '@/lib/supabase-helpers';

// GET - Dohvati jednu Google Ads kampanju
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const kampanja = await getGoogleAdsById(id);

    if (!kampanja) {
      return NextResponse.json(
        { error: 'Google Ads kampanja nije pronađena' },
        { status: 404 }
      );
    }

    return NextResponse.json(kampanja);
  } catch (error) {
    console.error('Greška pri dohvatanju Google Ads kampanje:', error);
    return NextResponse.json(
      { error: 'Greška pri dohvatanju Google Ads kampanje', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// PUT - Ažuriraj Google Ads kampanju
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await request.json();
    const { kupacId, imeKampanje, imeGoogleNaloga, datumPocetka, datumIsteka, iznos, placeno } = body;

    if (!kupacId || !imeKampanje || !imeGoogleNaloga || !datumPocetka || !datumIsteka || iznos === undefined) {
      return NextResponse.json(
        { error: 'Sva polja su obavezna' },
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

    const azuriranKampanja = await updateGoogleAds(id, {
      kupac_id: kupacId,
      ime_kampanje: imeKampanje,
      ime_google_naloga: imeGoogleNaloga,
      datum_pocetka: new Date(datumPocetka).toISOString(),
      datum_isteka: new Date(datumIsteka).toISOString(),
      iznos,
      placeno: placeno !== undefined ? placeno : false,
    });

    if (!azuriranKampanja) {
      return NextResponse.json(
        { error: 'Google Ads kampanja nije pronađena' },
        { status: 404 }
      );
    }

    console.log('Google Ads kampanja ažurirana:', azuriranKampanja.id);
    return NextResponse.json(azuriranKampanja);
  } catch (error) {
    console.error('Greška pri ažuriranju Google Ads kampanje:', error);
    return NextResponse.json(
      { error: 'Greška pri ažuriranju Google Ads kampanje', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// DELETE - Obriši Google Ads kampanju
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await deleteGoogleAds(id);

    console.log('Google Ads kampanja obrisana:', id);
    return NextResponse.json({
      message: 'Google Ads kampanja je uspešno obrisana',
    });
  } catch (error) {
    console.error('Greška pri brisanju Google Ads kampanje:', error);
    return NextResponse.json(
      { error: 'Greška pri brisanju Google Ads kampanje', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
