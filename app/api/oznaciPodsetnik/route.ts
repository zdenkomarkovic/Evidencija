import { NextRequest, NextResponse } from 'next/server';
import { getRataById, updateRata, getHostingById, updateHosting } from '@/lib/supabase-helpers';

// POST - Resetuj status podsetnika (postavi na false da se može ponovo poslati)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, type } = body;

    if (!id || !type) {
      return NextResponse.json(
        { error: 'ID i tip su obavezni' },
        { status: 400 }
      );
    }

    if (type === 'rata') {
      const rata = await getRataById(id);

      if (!rata) {
        return NextResponse.json(
          { error: 'Rata sa ovim ID-om ne postoji' },
          { status: 404 }
        );
      }

      const azuriranRata = await updateRata(id, {
        podsetnik_poslat: false,
      });

      return NextResponse.json({
        message: 'Status podsetnika za ratu je resetovan',
        rata: azuriranRata,
      });
    } else if (type === 'hosting') {
      const hosting = await getHostingById(id);

      if (!hosting) {
        return NextResponse.json(
          { error: 'Hosting zapis sa ovim ID-om ne postoji' },
          { status: 404 }
        );
      }

      const azuriranHosting = await updateHosting(id, {
        podsetnik_poslat: false,
      });

      return NextResponse.json({
        message: 'Status podsetnika za hosting je resetovan',
        hosting: azuriranHosting,
      });
    } else {
      return NextResponse.json(
        { error: 'Tip mora biti "rata" ili "hosting"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Greška pri resetovanju statusa podsetnika:', error);
    return NextResponse.json(
      { error: 'Greška pri resetovanju statusa podsetnika' },
      { status: 500 }
    );
  }
}
