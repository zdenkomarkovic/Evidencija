import { NextRequest, NextResponse } from 'next/server';
import { updateHosting, getHostingById, createHosting } from '@/lib/supabase-helpers';

// POST - Označi hosting kao plaćen i kreiraj novu godinu
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hostingId, nacinPlacanja, datumPlacanja } = body;

    if (!hostingId) {
      return NextResponse.json(
        { error: 'Hosting ID je obavezan' },
        { status: 400 }
      );
    }

    // Dohvati trenutni hosting zapis
    const trenutniHosting = await getHostingById(hostingId);

    if (!trenutniHosting) {
      return NextResponse.json(
        { error: 'Hosting zapis nije pronađen' },
        { status: 404 }
      );
    }

    // Označi trenutni hosting kao plaćen
    const azuriranHosting = await updateHosting(hostingId, {
      placeno: true,
      nacin_placanja: nacinPlacanja || 'manual',
      datum_placanja: datumPlacanja ? new Date(datumPlacanja).toISOString() : new Date().toISOString(),
    });

    // Kreiraj novi hosting za narednu godinu
    const datumObnavljanja = new Date(trenutniHosting.datum_obnavljanja);
    const novaDatumObnavljanja = new Date(datumObnavljanja);
    novaDatumObnavljanja.setFullYear(datumObnavljanja.getFullYear() + 1);

    const noviHosting = await createHosting({
      kupac_id: trenutniHosting.kupac_id,
      datum_pocetka: datumObnavljanja.toISOString(),
      datum_obnavljanja: novaDatumObnavljanja.toISOString(),
      placeno: false,
      datum_placanja: null,
      nacin_placanja: null,
      podsetnik_poslat: false,
    });

    return NextResponse.json({
      message: 'Hosting je uspešno označen kao plaćen i kreiran novi zapis za narednu godinu',
      hosting: azuriranHosting,
      noviHosting: noviHosting,
    });
  } catch (error) {
    console.error('Greška pri označavanju hostinga kao plaćenog:', error);
    return NextResponse.json(
      { error: 'Greška pri označavanju hostinga kao plaćenog' },
      { status: 500 }
    );
  }
}
