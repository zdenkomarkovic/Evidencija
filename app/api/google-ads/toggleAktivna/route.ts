import { NextRequest, NextResponse } from "next/server";
import { updateGoogleAds, getGoogleAdsById } from "@/lib/supabase-helpers";

export async function POST(request: NextRequest) {
  try {
    const { kampanjaId, aktivna, datum } = await request.json();

    if (!kampanjaId || typeof aktivna !== 'boolean') {
      return NextResponse.json(
        { error: "Nedostaju obavezna polja: kampanjaId i aktivna" },
        { status: 400 }
      );
    }

    // Proveri da li kampanja postoji
    const kampanja = await getGoogleAdsById(kampanjaId);
    if (!kampanja) {
      return NextResponse.json(
        { error: "Kampanja nije pronađena" },
        { status: 404 }
      );
    }

    // Pripremi podatke za ažuriranje
    const updateData: {
      aktivna: boolean;
      datum_zaustavljanja?: string | null;
      datum_ponovnog_pokretanja?: string | null;
    } = { aktivna };

    if (!aktivna && datum) {
      // Zaustavljanje kampanje - sačuvaj datum zaustavljanja
      updateData.datum_zaustavljanja = new Date(datum).toISOString();
    } else if (aktivna && datum) {
      // Ponovno pokretanje - sačuvaj datum ponovnog pokretanja
      // Originalni datum_pocetka ostaje isti!
      updateData.datum_ponovnog_pokretanja = new Date(datum).toISOString();
      // Ne brišemo datum_zaustavljanja - čuvamo istoriju pauze
    }

    // Ažuriraj kampanju
    const data = await updateGoogleAds(kampanjaId, updateData);

    return NextResponse.json(
      {
        message: `Kampanja uspešno ${aktivna ? 'aktivirana' : 'stopirana'}`,
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Greška:", error);
    return NextResponse.json(
      { error: "Interna greška servera" },
      { status: 500 }
    );
  }
}
