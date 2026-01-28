import { NextRequest, NextResponse } from 'next/server';
import { getArhiviraniKupci, getRate } from '@/lib/supabase-helpers';

interface KupacSaRatama {
  _id: string;
  ime: string;
  email: string;
  telefon: string;
  firma?: string;
  email2?: string;
  telefon2?: string;
  nacin_placanja?: string;
  domen?: string;
  arhiviran?: boolean;
  brojRata: number;
  brojNeplacenihRata: number;
  ukupanDug: number;
}

// GET - Dohvati sve arhivirane kupce sa informacijama o ratama
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const search = searchParams.get('search') || '';

    const kupci = await getArhiviraniKupci();

    // Za svakog arhiviranog kupca dohvati informacije o ratama
    const kupciSaRatama: KupacSaRatama[] = await Promise.all(
      kupci.map(async (kupac) => {
        const rate = await getRate({ kupac_id: (kupac as Record<string, string>)._id });
        const neplaceneRate = rate.filter((r) => !r.placeno);
        const ukupanDug = neplaceneRate.reduce((sum, r) => sum + r.iznos, 0);

        return {
          ...kupac,
          brojRata: rate.length,
          brojNeplacenihRata: neplaceneRate.length,
          ukupanDug,
        } as KupacSaRatama;
      })
    );

    // Filtriraj kupce prema pretrazi
    let filteredKupci = kupciSaRatama;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredKupci = kupciSaRatama.filter(
        (kupac) =>
          kupac.ime?.toLowerCase().includes(searchLower) ||
          kupac.email?.toLowerCase().includes(searchLower) ||
          kupac.telefon?.includes(search) ||
          kupac.firma?.toLowerCase().includes(searchLower)
      );
    }

    // Paginacija
    const total = filteredKupci.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedKupci = filteredKupci.slice(offset, offset + limit);

    return NextResponse.json({
      data: paginatedKupci,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Greška pri dohvatanju arhiviranih kupaca:', error);
    return NextResponse.json(
      { error: 'Greška pri dohvatanju arhiviranih kupaca' },
      { status: 500 }
    );
  }
}
