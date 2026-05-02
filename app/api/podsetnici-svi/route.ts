import { NextRequest, NextResponse } from 'next/server';
import { pokreniPodsetnike as pokreniRate } from '@/app/api/podsetnici/route';
import { pokreniPodsetnike as pokreniHosting } from '@/app/api/podsetnici-hosting/route';
import { pokreniPodsetnike as pokreniGoogleAds } from '@/app/api/podsetnici-google-ads/route';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Neautorizovan pristup' }, { status: 401 });
  }

  const rezultati: Record<string, unknown> = {};

  try {
    const rate = await pokreniRate();
    rezultati.rate = {
      message: `Poslato ${rate.filter(r => r.uspesno).length} od ${rate.length} podsetnika`,
      rezultati: rate,
    };
  } catch (err) {
    console.error('[podsetnici-svi] Greška za rate:', err);
    rezultati.rate = { error: err instanceof Error ? err.message : String(err) };
  }

  try {
    const hosting = await pokreniHosting();
    rezultati.hosting = {
      message: `Poslato ${hosting.filter(r => r.uspesno).length} od ${hosting.length} podsetnika`,
      rezultati: hosting,
    };
  } catch (err) {
    console.error('[podsetnici-svi] Greška za hosting:', err);
    rezultati.hosting = { error: err instanceof Error ? err.message : String(err) };
  }

  try {
    const googleAds = await pokreniGoogleAds();
    rezultati['google-ads'] = {
      message: `Poslato ${googleAds.filter(r => r.uspesno).length} od ${googleAds.length} podsetnika`,
      rezultati: googleAds,
    };
  } catch (err) {
    console.error('[podsetnici-svi] Greška za google-ads:', err);
    rezultati['google-ads'] = { error: err instanceof Error ? err.message : String(err) };
  }

  return NextResponse.json({ rezultati });
}
