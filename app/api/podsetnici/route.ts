import { NextRequest, NextResponse } from 'next/server';
import { pokreniPodsetnike } from '@/lib/podsetnici-rate';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Neautorizovan pristup' }, { status: 401 });
    }

    const rezultati = await pokreniPodsetnike();

    return NextResponse.json({
      message: `Poslato ${rezultati.filter(r => r.uspesno).length} od ${rezultati.length} podsetnika`,
      rezultati,
    });
  } catch (error) {
    console.error('Greška pri slanju podsetnika za rate:', error);
    return NextResponse.json(
      { error: 'Greška pri slanju podsetnika za rate' },
      { status: 500 }
    );
  }
}
