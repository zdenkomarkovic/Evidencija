import { NextRequest, NextResponse } from 'next/server';
import { updateKatalogUsluga, deleteKatalogUsluga } from '@/lib/supabase-helpers';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    await updateKatalogUsluga(id, {
      naziv: body.naziv,
      jedinicaMere: body.jedinicaMere,
      cena: body.cena,
      imaRokTrajanja: body.imaRokTrajanja ?? false,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteKatalogUsluga(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
