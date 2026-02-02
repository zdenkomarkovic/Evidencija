import { NextRequest, NextResponse } from 'next/server';
import { getGoogleAdsById, updateGoogleAds, updateGoogleAdsNastavak, addGoogleAdsNastavak } from '@/lib/supabase-helpers';

// POST - Označi iznos kao plaćen
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { kampanjaId, tipIznosa, nastavakId, datumPlacanja, datumPocetka, iznos } = body;

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

    // Koristi trenutni datum ako nije poslat datumPlacanja
    const datum_placanja = datumPlacanja || new Date().toISOString().split('T')[0];

    if (tipIznosa === 'osnovni') {
      await updateGoogleAds(kampanjaId, {
        placeno: true,
        datum_placanja,
      });
    } else if (tipIznosa === 'nastavak') {
      // Ako nastavak već postoji, ažuriraj ga
      if (nastavakId) {
        await updateGoogleAdsNastavak(nastavakId, {
          placeno: true,
          datum_placanja,
        });
      } else {
        // Ako nastavak ne postoji (buduci period), kreiraj ga
        if (!datumPocetka || iznos === undefined) {
          return NextResponse.json(
            { error: 'Datum početka i iznos su obavezni za kreiranje novog nastavka' },
            { status: 400 }
          );
        }

        await addGoogleAdsNastavak(kampanjaId, {
          datum: new Date(datumPocetka).toISOString(),
          iznos,
          placeno: true,
          datum_placanja,
        });
      }
    } else {
      return NextResponse.json(
        { error: 'Nevažeći tip iznosa' },
        { status: 400 }
      );
    }

    console.log('Iznos označen kao plaćen:', kampanjaId, tipIznosa, nastavakId, datum_placanja);
    return NextResponse.json({ message: 'Iznos uspešno označen kao plaćen' });
  } catch (error) {
    console.error('Greška pri označavanju iznosa kao plaćenog:', error);
    return NextResponse.json(
      { error: 'Greška pri označavanju iznosa kao plaćenog', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
