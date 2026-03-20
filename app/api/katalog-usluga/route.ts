import { NextRequest, NextResponse } from 'next/server';
import { getKatalogUsluga, createKatalogUsluga } from '@/lib/supabase-helpers';

export async function GET() {
  try {
    const data = await getKatalogUsluga();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const usluga = await createKatalogUsluga({
      naziv: body.naziv,
      jedinicaMere: body.jedinicaMere,
      cena: body.cena,
      imaRokTrajanja: body.imaRokTrajanja ?? false,
    });
    return NextResponse.json(usluga, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
