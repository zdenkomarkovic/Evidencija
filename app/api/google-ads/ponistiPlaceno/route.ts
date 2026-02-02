import { NextRequest, NextResponse } from 'next/server';
import { getGoogleAdsById, updateGoogleAds, updateGoogleAdsNastavak } from '@/lib/supabase-helpers';

// POST - Poništi oznaku plaćeno
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { kampanjaId, tipIznosa, nastavakId } = body;

    if (!kampanjaId || !tipIznosa) {
      return NextResponse.json(
        { error: 'Kampanja ID i tip iznosa su obavezni' },
        { status: 400 }
      );
    }

    const kampanja = await getGoogleAdsById(kampanjaId);

    if (!kampanja) {
      return NextResponse.json(
        { error: 'Google Ads kampanja nije pronađena' },
        { status: 404 }
      );
    }

    if (tipIznosa === 'osnovni') {
      await updateGoogleAds(kampanjaId, {
        placeno: false,
        datum_placanja: null,
      });
    } else if (tipIznosa === 'nastavak') {
      if (!nastavakId) {
        return NextResponse.json(
          { error: 'Nastavak ID je obavezan za poništavanje nastavka' },
          { status: 400 }
        );
      }

      await updateGoogleAdsNastavak(nastavakId, {
        placeno: false,
        datum_placanja: null,
      });
    } else {
      return NextResponse.json(
        { error: 'Nevažeći tip iznosa' },
        { status: 400 }
      );
    }

    console.log('Plaćanje poništeno:', kampanjaId, tipIznosa, nastavakId);
    return NextResponse.json({ message: 'Plaćanje uspešno poništeno' });
  } catch (error) {
    console.error('Greška pri poništavanju plaćanja:', error);
    return NextResponse.json(
      { error: 'Greška pri poništavanju plaćanja', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
