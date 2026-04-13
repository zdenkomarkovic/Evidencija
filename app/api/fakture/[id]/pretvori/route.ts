import { NextRequest, NextResponse } from 'next/server';
import { getFakturaById, updateFaktura, getSledediBrojFakture } from '@/lib/supabase-helpers';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const faktura = await getFakturaById(id);

    if (faktura.status !== 'predracun') {
      return NextResponse.json(
        { error: 'Samo predračun može biti konvertovan u fakturu' },
        { status: 400 }
      );
    }

    const noviBroj = await getSledediBrojFakture();

    const azurirana = await updateFaktura(id, {
      status: 'izdata',
      broj_fakture: noviBroj,
    });

    return NextResponse.json(azurirana);
  } catch (error) {
    console.error('Greška pri konverziji predračuna:', error);
    return NextResponse.json(
      { error: 'Greška pri konverziji predračuna', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
