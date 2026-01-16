import { NextRequest, NextResponse } from "next/server";
import { getHostingById, updateHosting, deleteHosting, getKupacById } from "@/lib/supabase-helpers";

// GET - Dohvati jedan hosting zapis
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const hosting = await getHostingById(id);

    if (!hosting) {
      return NextResponse.json(
        { error: "Hosting zapis nije pronađen" },
        { status: 404 }
      );
    }

    return NextResponse.json(hosting);
  } catch (error) {
    console.error("Greška pri dohvatanju hosting zapisa:", error);
    return NextResponse.json(
      {
        error: "Greška pri dohvatanju hosting zapisa",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// PUT - Ažuriraj hosting zapis
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await request.json();
    const { kupacId, datumPocetka, datumObnavljanja, podsetnikPoslat } = body;

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

    const azuriranHosting = await updateHosting(id, {
      kupac_id: kupacId,
      datum_pocetka: datumPocetka ? new Date(datumPocetka).toISOString() : null,
      datum_obnavljanja: new Date(datumObnavljanja).toISOString(),
      podsetnik_poslat: podsetnikPoslat !== undefined ? podsetnikPoslat : false,
    });

    if (!azuriranHosting) {
      return NextResponse.json(
        { error: "Hosting zapis nije pronađen" },
        { status: 404 }
      );
    }

    console.log("Hosting ažuriran:", azuriranHosting.id);
    return NextResponse.json(azuriranHosting);
  } catch (error) {
    console.error("Greška pri ažuriranju hosting zapisa:", error);
    return NextResponse.json(
      {
        error: "Greška pri ažuriranju hosting zapisa",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// DELETE - Obriši hosting zapis
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await deleteHosting(id);

    console.log("Hosting obrisan:", id);
    return NextResponse.json({
      message: "Hosting zapis je uspešno obrisan",
    });
  } catch (error) {
    console.error("Greška pri brisanju hosting zapisa:", error);
    return NextResponse.json(
      {
        error: "Greška pri brisanju hosting zapisa",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
