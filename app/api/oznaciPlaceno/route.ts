import { NextRequest, NextResponse } from 'next/server';
import { getRataById, updateRata } from '@/lib/supabase-helpers';
import supabase from '@/lib/supabase';

// POST - Označi ratu kao plaćenu
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rataId, nacinPlacanja, datumPlacanja } = body;

    if (!rataId) {
      return NextResponse.json(
        { error: 'Rata ID je obavezan' },
        { status: 400 }
      );
    }

    const rata = await getRataById(rataId);

    if (!rata) {
      return NextResponse.json(
        { error: 'Rata sa ovim ID-om ne postoji' },
        { status: 404 }
      );
    }

    const azuriranRata = await updateRata(rataId, {
      placeno: true,
      nacin_placanja: nacinPlacanja || 'manual',
      datum_placanja: datumPlacanja ? new Date(datumPlacanja).toISOString() : new Date().toISOString(),
    });

    return NextResponse.json({
      message: 'Rata je uspešno označena kao plaćena',
      rata: azuriranRata,
    });
  } catch (error) {
    console.error('Greška pri označavanju rate kao plaćene:', error);
    return NextResponse.json(
      { error: 'Greška pri označavanju rate kao plaćene' },
      { status: 500 }
    );
  }
}

// PUT - Označi više rata kao plaćenih
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { rateIds, nacinPlacanja, datumPlacanja } = body;

    if (!rateIds || !Array.isArray(rateIds) || rateIds.length === 0) {
      return NextResponse.json(
        { error: 'Rate IDs mora biti neprazan niz' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('rate')
      .update({
        placeno: true,
        nacin_placanja: nacinPlacanja || 'manual',
        datum_placanja: datumPlacanja ? new Date(datumPlacanja).toISOString() : new Date().toISOString(),
      })
      .in('id', rateIds)
      .select();

    if (error) throw error;

    return NextResponse.json({
      message: `${data.length} rata je uspešno označeno kao plaćeno`,
      modifiedCount: data.length,
    });
  } catch (error) {
    console.error('Greška pri označavanju rata kao plaćenih:', error);
    return NextResponse.json(
      { error: 'Greška pri označavanju rata kao plaćenih' },
      { status: 500 }
    );
  }
}
