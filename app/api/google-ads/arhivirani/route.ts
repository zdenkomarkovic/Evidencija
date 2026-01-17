import { NextResponse } from 'next/server';
import { getArhiviraniGoogleAds } from '@/lib/supabase-helpers';

// GET - Dohvati sve Google Ads kampanje arhiviranih kupaca
export async function GET() {
  try {
    const kampanje = await getArhiviraniGoogleAds();
    return NextResponse.json(kampanje);
  } catch (error) {
    console.error('Greška pri dohvatanju arhiviranih Google Ads kampanja:', error);
    return NextResponse.json(
      { error: 'Greška pri dohvatanju arhiviranih Google Ads kampanja' },
      { status: 500 }
    );
  }
}
