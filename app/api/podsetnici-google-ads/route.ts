import { NextRequest, NextResponse } from 'next/server';
import { pokreniPodsetnike } from '@/lib/podsetnici-google-ads';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Neautorizovan pristup' }, { status: 401 });
    }

    const rezultati = await pokreniPodsetnike();

    const uspesnih = rezultati.filter(r => r.uspesno).length;
    return NextResponse.json({
      message: `Poslato ${uspesnih} od ${rezultati.length} podsetnika`,
      rezultati,
    });
  } catch (error) {
    console.error('Greška pri slanju podsetnika za Google Ads:', error);
    return NextResponse.json(
      { error: 'Greška pri slanju podsetnika za Google Ads' },
      { status: 500 }
    );
  }
}
