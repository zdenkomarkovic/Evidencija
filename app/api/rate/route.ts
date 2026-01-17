import { NextRequest, NextResponse } from "next/server";
import { getRate, createRata, getKupacById } from "@/lib/supabase-helpers";

// GET - Dohvati sve rate sa informacijama o kupcu
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const kupacId = searchParams.get("kupacId");
    const placeno = searchParams.get("placeno");

    const filters: { kupac_id?: string; placeno?: boolean; includeArhivirani?: boolean } = {};

    if (kupacId) {
      filters.kupac_id = kupacId;
      // Kada tražimo podatke za specifičnog kupca, uključi sve bez obzira da li je arhiviran
      filters.includeArhivirani = true;
    }

    if (placeno !== null && placeno !== undefined && placeno !== "") {
      filters.placeno = placeno === "true";
    }

    const rate = await getRate(filters);

    return NextResponse.json(rate);
  } catch (error) {
    console.error("Greška pri dohvatanju rata:", error);
    return NextResponse.json(
      { error: "Greška pri dohvatanju rata" },
      { status: 500 }
    );
  }
}

// POST - Kreiraj novu ratu
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { kupacId, iznos, datumDospeca, placeno, nacinPlacanja } = body;

    if (!kupacId || !iznos || !datumDospeca) {
      return NextResponse.json(
        { error: "KupacId, iznos i datum dospeća su obavezni" },
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

    const novaRata = await createRata({
      kupac_id: kupacId,
      iznos,
      datum_dospeca: new Date(datumDospeca).toISOString(),
      placeno: placeno || false,
      datum_placanja: null,
      nacin_placanja: nacinPlacanja || null,
      podsetnik_poslat: false,
    });

    return NextResponse.json(novaRata, { status: 201 });
  } catch (error) {
    console.error("Greška pri kreiranju rate:", error);
    return NextResponse.json(
      { error: "Greška pri kreiranju rate" },
      { status: 500 }
    );
  }
}
