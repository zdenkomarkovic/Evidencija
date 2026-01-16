import { NextResponse } from 'next/server';
import { getArhiviraniKupci, getRate } from '@/lib/supabase-helpers';

// GET - Dohvati sve arhivirane kupce sa informacijama o ratama
export async function GET() {
  try {
    const kupci = await getArhiviraniKupci();

    // Za svakog arhiviranog kupca dohvati informacije o ratama
    const kupciSaRatama = await Promise.all(
      kupci.map(async (kupac) => {
        const rate = await getRate({ kupac_id: (kupac as Record<string, string>)._id });
        const neplaceneRate = rate.filter((r) => !r.placeno);
        const ukupanDug = neplaceneRate.reduce((sum, r) => sum + r.iznos, 0);

        return {
          ...kupac,
          brojRata: rate.length,
          brojNeplacenihRata: neplaceneRate.length,
          ukupanDug,
        };
      })
    );

    return NextResponse.json(kupciSaRatama);
  } catch (error) {
    console.error('Greška pri dohvatanju arhiviranih kupaca:', error);
    return NextResponse.json(
      { error: 'Greška pri dohvatanju arhiviranih kupaca' },
      { status: 500 }
    );
  }
}
