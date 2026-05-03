import supabase from '@/lib/supabase';
import { posaljiEmail, generisiGoogleAdsEmailBody } from '@/lib/email-service';
import { generisiProfakturaBuffer, generisiPozivNaBroj } from '@/lib/profaktura-pdf';
import { createFaktura } from '@/lib/supabase-helpers';

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
  { dana: 7, polje: 'podsetnik_7_poslat', label: '7 dana' },
  { dana: 1, polje: 'podsetnik_1_poslat', label: '1 dan'  },
];

function getAktuelniPeriod(kampanja: Record<string, unknown>): { datumIsteka: Date; iznos: number } | null {
  const nastavci = (kampanja.google_ads_nastavci as Record<string, unknown>[] | null) || [];

  const neplaceniNastavci = nastavci
    .filter(n => !n.placeno)
    .sort((a, b) => new Date(b.datum as string).getTime() - new Date(a.datum as string).getTime());

  if (neplaceniNastavci.length > 0) {
    const poslednji = neplaceniNastavci[0];
    const pocetakNastavka = new Date(poslednji.datum as string);
    const krajNastavka = new Date(pocetakNastavka);
    krajNastavka.setMonth(pocetakNastavka.getMonth() + 1);
    return {
      datumIsteka: krajNastavka,
      iznos: (poslednji.iznos as number) || 0,
    };
  }

  if (!kampanja.placeno) {
    return {
      datumIsteka: new Date(kampanja.datum_isteka as string),
      iznos: (kampanja.iznos as number) || 0,
    };
  }

  return null;
}

async function posaljiPodsetnik(
  kampanja: Record<string, unknown>,
  kupac: Record<string, unknown>,
  podsetnik: Podsetnik,
  datumIsteka: Date,
  iznos: number,
) {
  const danas = new Date();
  danas.setHours(0, 0, 0, 0);

  const danaPreostalo = Math.ceil((datumIsteka.getTime() - danas.getTime()) / (1000 * 60 * 60 * 24));

  const datumFormatiran = datumIsteka.toLocaleDateString('sr-RS', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });

  const kampanjaId = kampanja.id as string;
  const imeKampanje = kampanja.ime_kampanje as string;
  const nacinPlacanja = kupac.nacin_placanja as string | null;
  const jeKes = nacinPlacanja === 'kes';
  const firma = kupac.firma as string | null;
  const prikazNaziv = firma || kupac.ime as string;

  const subject = danaPreostalo <= 1
    ? `⚠️ Hitno: Google Ads kampanja ističe za ${danaPreostalo} ${danaPreostalo === 1 ? 'dan' : 'dana'} - ${prikazNaziv}`
    : `Podsetnik za plaćanje Google Ads - ${podsetnik.label} - ${prikazNaziv}`;

  if (!jeKes) {
    const profakturaBroj = `GA-${danas.getFullYear()}-${kampanjaId.substring(0, 8).toUpperCase()}`;
    const pozivNaBroj = await generisiPozivNaBroj(profakturaBroj);

    const { data: postojeca } = await supabase
      .from('fakture')
      .select('id, datum_izdavanja')
      .eq('broj_fakture', profakturaBroj)
      .maybeSingle();

    const datumIzdavanja = postojeca ? new Date(postojeca.datum_izdavanja) : danas;

    const pdfBuffer = await generisiProfakturaBuffer({
      broj: profakturaBroj,
      datum: datumIzdavanja,
      rokZaPlacanje: datumIsteka,
      opisUsluge: 'Usluga digitalnog marketinga - upravljanje Google Ads kampanjama za period od mesec dana',
      kupac: {
        ime: kupac.ime as string,
        firma,
        pib: kupac.pib as string | null,
        adresa: kupac.adresa as string | null,
        grad: kupac.grad as string | null,
      },
      iznos,
      pozivNaBroj,
      firma: FIRMA,
    });

    const emailHtml = generisiGoogleAdsEmailBody(
      kupac.ime as string,
      imeKampanje,
      datumFormatiran,
      danaPreostalo,
      iznos,
      firma,
      FIRMA.racun1,
      FIRMA.banka1,
      FIRMA.racun2,
      FIRMA.banka2,
      pozivNaBroj,
    );

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

    if (!postojeca) {
      await createFaktura(
        {
          kupac_id: kampanja.kupac_id as string,
          broj_fakture: profakturaBroj,
          datum_izdavanja: danas.toISOString(),
          datum_valute: datumIsteka.toISOString(),
          status: 'predracun',
          napomena: `Kampanja: ${imeKampanje}`,
          ukupan_iznos: iznos,
        },
        [{ naziv: `Google Ads - ${imeKampanje}`, jedinica_mere: 'kom', kolicina: 1, cena: iznos, iznos, redni_broj: 1 }]
      );
    }
  } else {
    const emailHtml = generisiGoogleAdsEmailBody(
      kupac.ime as string,
      imeKampanje,
      datumFormatiran,
      danaPreostalo,
      iznos,
    );

    await posaljiEmail({ to: kupac.email as string, subject, html: emailHtml });
  }

  await supabase
    .from('google_ads')
    .update({ [podsetnik.polje]: true })
    .eq('id', kampanjaId);

  return {
    kampanjaId,
    imeKampanje,
    kupac: kupac.ime,
    email: kupac.email,
    datumIsteka: datumFormatiran,
    danaPreostalo,
    iznos,
    podsetnik: podsetnik.label,
    uspesno: true,
  };
}

export async function pokreniPodsetnike() {
  const danas = new Date();
  danas.setHours(0, 0, 0, 0);

  const { data: svKampanje, error } = await supabase
    .from('google_ads')
    .select('*, kupci (*), google_ads_nastavci (*)')
    .eq('aktivna', true);

  if (error) {
    console.error('Greška pri dohvatanju kampanja:', error);
    throw new Error('Greška pri dohvatanju kampanja');
  }

  const rezultati = [];

  for (const podsetnik of PODSETNICI) {
    const granica = new Date(danas);
    granica.setDate(granica.getDate() + podsetnik.dana);

    for (const kampanja of svKampanje) {
      const kupac = kampanja.kupci;

      if (!kupac?.email) continue;
      if (kampanja[podsetnik.polje]) continue;

      const period = getAktuelniPeriod(kampanja);
      if (!period) continue;

      const { datumIsteka, iznos } = period;
      if (datumIsteka < danas || datumIsteka > granica) continue;

      try {
        const rezultat = await posaljiPodsetnik(kampanja, kupac, podsetnik, datumIsteka, iznos);
        rezultati.push(rezultat);
      } catch (err) {
        console.error(`Greška pri slanju podsetnika (${podsetnik.label}) za kampanju ${kampanja.id}:`, err);
        rezultati.push({
          kampanjaId: kampanja.id,
          imeKampanje: kampanja.ime_kampanje,
          kupac: kupac.ime,
          email: kupac.email,
          podsetnik: podsetnik.label,
          uspesno: false,
          greska: err instanceof Error ? err.message : String(err),
        });
      }
    }
  }

  return rezultati;
}
