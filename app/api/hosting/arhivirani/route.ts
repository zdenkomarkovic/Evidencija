import { NextResponse } from 'next/server';
import { getArhiviraniHosting } from '@/lib/supabase-helpers';

// GET - Dohvati sav hosting arhiviranih kupaca
export async function GET() {
  try {
    const hosting = await getArhiviraniHosting();
    return NextResponse.json(hosting);
  } catch (error) {
    console.error('Greška pri dohvatanju arhiviranih hosting zapisa:', error);
    return NextResponse.json(
      { error: 'Greška pri dohvatanju arhiviranih hosting zapisa' },
      { status: 500 }
    );
  }
}
