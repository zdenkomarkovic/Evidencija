import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { posaljiEmail, generisiHostingEmailBody } from '@/lib/email-service';
import { generisiProfakturaBuffer } from '@/lib/profaktura-pdf';

const FIRMA = {
  naziv: process.env.FIRMA_NAZIV || 'Vaša Firma',
  pib: process.env.FIRMA_PIB || '',
  maticniBroj: process.env.FIRMA_MATICNI_BROJ || '',
  adresa: process.env.FIRMA_ADRESA || '',
  grad: process.env.FIRMA_GRAD || '',
  racun1: process.env.FIRMA_ZIRO_RACUN_1 || '',
  banka1: process.env.FIRMA_BANKA_1 || '',
  racun2: process.env.FIRMA_ZIRO_RACUN_2 || '',
  banka2: process.env.FIRMA_BANKA_2 || '',
  telefon: process.env.FIRMA_TELEFON || '',
};

interface Podsetnik {
  dana: number;
  polje: string;
  label: string;
}

const PODSETNICI: Podsetnik[] = [
  { dana: 30, polje: 'podsetnik_30_poslat', label: '30 dana' },
  { dana: 14, polje: 'podsetnik_14_poslat', label: '14 dana' },
  { dana: 7,  polje: 'podsetnik_7_poslat',  label: '7 dana'  },
  { dana: 1,  polje: 'podsetnik_1_poslat',  label: '1 dan'   },
];

async function posaljiPodsetnik(
  hosting: Record<string, unknown>,
  kupac: Record<string, unknown>,
  podsetnik: Podsetnik
) {
  const danas = new Date();
  danas.setHours(0, 0, 0, 0);

  const datumObnove = new Date(hosting.datum_obnavljanja as string);
  const danaPreostalo = Math.ceil((datumObnove.getTime() - danas.getTime()) / (1000 * 60 * 60 * 24));

  const datumFormatiran = datumObnove.toLocaleDateString('sr-RS', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });

  const iznos = (hosting.iznos as number) || 0;
  const hostingId = hosting.id as string;

  // Generiši profaktura PDF
  const profakturaBroj = `PF-${danas.getFullYear()}-${hostingId.substring(0, 8).toUpperCase()}`;

  const pdfBuffer = await generisiProfakturaBuffer({
    broj: profakturaBroj,
    datum: danas,
    datumObnavljanja: datumObnove,
    kupac: {
      ime: kupac.ime as string,
      firma: kupac.firma as string | null,
      pib: kupac.pib as string | null,
      adresa: kupac.adresa as string | null,
      grad: kupac.grad as string | null,
    },
    iznos,
    firma: FIRMA,
  });

  const emailHtml = generisiHostingEmailBody(
    kupac.ime as string,
    datumFormatiran,
    danaPreostalo,
    iznos
  );

  const subject = danaPreostalo <= 7
    ? `⚠️ Hitno: Obnova hostinga za ${danaPreostalo} ${danaPreostalo === 1 ? 'dan' : 'dana'}`
    : `Podsetnik za obnovu hostinga - ${podsetnik.label}`;

  await posaljiEmail({
    to: kupac.email as string,
    subject,
    html: emailHtml,
    attachment: {
      content: pdfBuffer,
      filename: `profaktura-${profakturaBroj}.pdf`,
      contentType: 'application/pdf',
    },
  });

  // Označi podsetnik kao poslat
  await supabase
    .from('hosting')
    .update({ [podsetnik.polje]: true })
    .eq('id', hostingId);

  return {
    hostingId,
    kupac: kupac.ime,
    email: kupac.email,
    datumObnavljanja: datumFormatiran,
    danaPreostalo,
    iznos,
    podsetnik: podsetnik.label,
    uspesno: true,
  };
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Neautorizovan pristup' }, { status: 401 });
    }

    const danas = new Date();
    danas.setHours(0, 0, 0, 0);

    const rezultati = [];

    for (const podsetnik of PODSETNICI) {
      const granica = new Date(danas);
      granica.setDate(granica.getDate() + podsetnik.dana);

      const { data: hostingZaObnovu, error } = await supabase
        .from('hosting')
        .select('*, kupci (*)')
        .eq(podsetnik.polje, false)
        .eq('placeno', false)
        .gte('datum_obnavljanja', danas.toISOString())
        .lte('datum_obnavljanja', granica.toISOString());

      if (error) {
        console.error(`Greška pri upitu za ${podsetnik.label}:`, error);
        continue;
      }

      for (const hosting of hostingZaObnovu) {
        const kupac = hosting.kupci;

        if (!kupac?.email) {
          console.warn(`Kupac nema email za hosting: ${hosting.id}`);
          continue;
        }

        try {
          const rezultat = await posaljiPodsetnik(hosting, kupac, podsetnik);
          rezultati.push(rezultat);
        } catch (err) {
          console.error(`Greška pri slanju podsetnika (${podsetnik.label}) za hosting ${hosting.id}:`, err);
          rezultati.push({
            hostingId: hosting.id,
            kupac: kupac.ime,
            email: kupac.email,
            podsetnik: podsetnik.label,
            uspesno: false,
            greska: err instanceof Error ? err.message : String(err),
          });
        }
      }
    }

    const uspesnih = rezultati.filter(r => r.uspesno).length;
    return NextResponse.json({
      message: `Poslato ${uspesnih} od ${rezultati.length} podsetnika`,
      rezultati,
    });
  } catch (error) {
    console.error('Greška pri slanju podsetnika za hosting:', error);
    return NextResponse.json(
      { error: 'Greška pri slanju podsetnika za hosting' },
      { status: 500 }
    );
  }
}
