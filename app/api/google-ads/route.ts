import { NextRequest, NextResponse } from "next/server";
import { getGoogleAds, createGoogleAds, getKupacById } from "@/lib/supabase-helpers";

// GET - Dohvati sve Google Ads kampanje
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const kupacId = searchParams.get("kupacId");

    const filters: { kupac_id?: string; includeArhivirani?: boolean } = {};

    if (kupacId) {
      filters.kupac_id = kupacId;
      // Kada tražimo podatke za specifičnog kupca, uključi sve bez obzira da li je arhiviran
      filters.includeArhivirani = true;
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
      iznosNastavka,
      datumPrimeneIznosaNavstavka,
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
      iznos_nastavka: iznosNastavka || iznos,
      datum_primene_iznosa_nastavka: datumPrimeneIznosaNavstavka ? new Date(datumPrimeneIznosaNavstavka).toISOString() : null,
      placeno: false,
      datum_placanja: null,
      aktivna: true,
      datum_zaustavljanja: null,
      datum_ponovnog_pokretanja: null,
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
