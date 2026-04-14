import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Neautorizovan pristup' }, { status: 401 });
  }

  const headers: HeadersInit = {};
  if (cronSecret) {
    headers['Authorization'] = `Bearer ${cronSecret}`;
  }

  const endpointi = [
    { naziv: 'rate', url: `${BASE_URL}/api/podsetnici` },
    { naziv: 'hosting', url: `${BASE_URL}/api/podsetnici-hosting` },
    { naziv: 'google-ads', url: `${BASE_URL}/api/podsetnici-google-ads` },
  ];

  const rezultati: Record<string, unknown> = {};

  for (const endpoint of endpointi) {
    try {
      const res = await fetch(endpoint.url, { headers });
      const data = await res.json();
      rezultati[endpoint.naziv] = data;
      console.log(`[podsetnici-svi] ${endpoint.naziv}: ${data.message || 'ok'}`);
    } catch (err) {
      console.error(`[podsetnici-svi] Greška za ${endpoint.naziv}:`, err);
      rezultati[endpoint.naziv] = {
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  return NextResponse.json({ rezultati });
}
