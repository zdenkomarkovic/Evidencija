import { NextRequest, NextResponse } from "next/server";
import { getHosting, createHosting, getKupacById } from "@/lib/supabase-helpers";

// GET - Dohvati sve hosting zapise sa informacijama o kupcu
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const kupacId = searchParams.get("kupacId");

    const filters: { kupac_id?: string } = {};

    if (kupacId) {
      filters.kupac_id = kupacId;
    }

    const hosting = await getHosting(filters);

    return NextResponse.json(hosting);
  } catch (error) {
    console.error("Greška pri dohvatanju hosting zapisa:", error);
    return NextResponse.json(
      { error: "Greška pri dohvatanju hosting zapisa" },
      { status: 500 }
    );
  }
}

// POST - Kreiraj novi hosting zapis
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { kupacId, datumPocetka, datumObnavljanja } = body;

    if (!kupacId || !datumObnavljanja) {
      return NextResponse.json(
        { error: "KupacId i datum obnavljanja su obavezni" },
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

    const noviHosting = await createHosting({
      kupac_id: kupacId,
      datum_pocetka: datumPocetka ? new Date(datumPocetka).toISOString() : null,
      datum_obnavljanja: new Date(datumObnavljanja).toISOString(),
      podsetnik_poslat: false,
    });

    return NextResponse.json(noviHosting, { status: 201 });
  } catch (error) {
    console.error("Greška pri kreiranju hosting zapisa:", error);
    return NextResponse.json(
      { error: "Greška pri kreiranju hosting zapisa" },
      { status: 500 }
    );
  }
}
