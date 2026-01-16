import { NextRequest, NextResponse } from 'next/server';
import { getGoogleAdsById, updateGoogleAds, updateGoogleAdsNastavak } from '@/lib/supabase-helpers';

// POST - Označi iznos kao plaćen
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
        placeno: true,
      });
    } else if (tipIznosa === 'nastavak') {
      if (!nastavakId) {
        return NextResponse.json(
          { error: 'Nastavak ID je obavezan za označavanje nastavka' },
          { status: 400 }
        );
      }

      await updateGoogleAdsNastavak(nastavakId, {
        placeno: true,
      });
    } else {
      return NextResponse.json(
        { error: 'Nevažeći tip iznosa' },
        { status: 400 }
      );
    }

    console.log('Iznos označen kao plaćen:', kampanjaId, tipIznosa, nastavakId);
    return NextResponse.json({ message: 'Iznos uspešno označen kao plaćen' });
  } catch (error) {
    console.error('Greška pri označavanju iznosa kao plaćenog:', error);
    return NextResponse.json(
      { error: 'Greška pri označavanju iznosa kao plaćenog', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
