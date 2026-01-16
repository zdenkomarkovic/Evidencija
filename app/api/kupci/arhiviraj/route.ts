import { NextRequest, NextResponse } from 'next/server';
import { arhivirajKupca } from '@/lib/supabase-helpers';

// POST - Arhiviraj ili dearhiviraj kupca
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { kupacId, arhiviran } = body;

    if (!kupacId || arhiviran === undefined) {
      return NextResponse.json(
        { error: 'KupacId i arhiviran status su obavezni' },
        { status: 400 }
      );
    }

    const azuriranKupac = await arhivirajKupca(kupacId, arhiviran);

    console.log(`Kupac ${arhiviran ? 'arhiviran' : 'dearhiviran'}:`, azuriranKupac.id);
    return NextResponse.json(azuriranKupac);
  } catch (error) {
    console.error('Greška pri arhiviranju kupca:', error);
    return NextResponse.json(
      {
        error: 'Greška pri arhiviranju kupca',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
