import { NextResponse } from 'next/server';
import { getArhiviraneRate } from '@/lib/supabase-helpers';

// GET - Dohvati sve rate arhiviranih kupaca
export async function GET() {
  try {
    const rate = await getArhiviraneRate();
    return NextResponse.json(rate);
  } catch (error) {
    console.error('Greška pri dohvatanju arhiviranih rata:', error);
    return NextResponse.json(
      { error: 'Greška pri dohvatanju arhiviranih rata' },
      { status: 500 }
    );
  }
}
