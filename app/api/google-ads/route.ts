import { NextRequest, NextResponse } from "next/server";
import { getGoogleAds, createGoogleAds, getKupacById } from "@/lib/supabase-helpers";

// GET - Dohvati sve Google Ads kampanje
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const kupacId = searchParams.get("kupacId");

    const filters: { kupac_id?: string } = {};

    if (kupacId) {
      filters.kupac_id = kupacId;
    }

    const kampanje = await getGoogleAds(filters);

    return NextResponse.json(kampanje);
  } catch (error) {
    console.error("Greška pri dohvatanju Google Ads kampanja:", error);
    return NextResponse.json(
      { error: "Greška pri dohvatanju Google Ads kampanja" },
      { status: 500 }
    );
  }
}

// POST - Kreiraj novu Google Ads kampanju
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      kupacId,
      imeKampanje,
      imeGoogleNaloga,
      datumPocetka,
      datumIsteka,
      iznos,
    } = body;

    if (
      !kupacId ||
      !imeKampanje ||
      !imeGoogleNaloga ||
      !datumPocetka ||
      !datumIsteka ||
      !iznos
    ) {
      return NextResponse.json(
        {
          error:
            "KupacId, ime kampanje, ime Google naloga, datum početka, datum isteka i iznos su obavezni",
        },
        { status: 400 }
      );
    }

    // Proveri da li kupac postoji
    const kupac = await getKupacById(kupacId);
    if (!kupac) {
      return NextResponse.json(
        { error: "Kupac sa ovim ID-om ne postoji" },
        { status: 404 }
      );
    }

    const novaKampanja = await createGoogleAds({
      kupac_id: kupacId,
      ime_kampanje: imeKampanje,
      ime_google_naloga: imeGoogleNaloga,
      datum_pocetka: new Date(datumPocetka).toISOString(),
      datum_isteka: new Date(datumIsteka).toISOString(),
      iznos,
      placeno: false,
    });

    return NextResponse.json(novaKampanja, { status: 201 });
  } catch (error) {
    console.error("Greška pri kreiranju Google Ads kampanje:", error);
    return NextResponse.json(
      { error: "Greška pri kreiranju Google Ads kampanje" },
      { status: 500 }
    );
  }
}
