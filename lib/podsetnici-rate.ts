import supabase from '@/lib/supabase';
import { posaljiEmail, generisiRataEmailTemplate } from '@/lib/email-service';
import { posaljiSMS, generisiRataSMSPoruka } from '@/lib/sms-service';

interface Podsetnik {
  dana: number;
  polje: string;
  label: string;
}

const PODSETNICI: Podsetnik[] = [
  { dana: 7, polje: 'podsetnik_7_poslat', label: '7 dana' },
  { dana: 1, polje: 'podsetnik_1_poslat', label: '1 dan' },
];

export async function pokreniPodsetnike() {
  const danas = new Date();
  danas.setHours(0, 0, 0, 0);

  const rezultati = [];

  for (const podsetnik of PODSETNICI) {
    const granica = new Date(danas);
    granica.setDate(granica.getDate() + podsetnik.dana);

    const { data: rate, error } = await supabase
      .from('rate')
      .select('*, kupci (*)')
      .eq('placeno', false)
      .not(podsetnik.polje, 'is', true)
      .gte('datum_dospeca', danas.toISOString().split('T')[0])
      .lte('datum_dospeca', granica.toISOString().split('T')[0]);

    if (error) {
      console.error(`Greška pri upitu za ${podsetnik.label}:`, error);
      continue;
    }

    for (const rata of rate) {
      const kupac = rata.kupci;

      if (kupac?.arhiviran) continue;

      if (!kupac?.email) {
        console.warn(`Kupac nema email za ratu: ${rata.id}`);
        continue;
      }

      const datumDospeca = new Date(rata.datum_dospeca);
      const danaPreostalo = Math.ceil((datumDospeca.getTime() - danas.getTime()) / (1000 * 60 * 60 * 24));

      const datumFormatiran = datumDospeca.toLocaleDateString('sr-RS', {
        day: '2-digit', month: '2-digit', year: 'numeric',
      });

      const subject = danaPreostalo <= 1
        ? `⚠️ Hitno: Rata dospeva sutra - ${kupac.ime}`
        : `Podsetnik za uplatu rate - ${podsetnik.label} - ${kupac.ime}`;

      try {
        const emailHtml = generisiRataEmailTemplate(kupac.ime, rata.iznos, datumFormatiran, danaPreostalo);
        await posaljiEmail({ to: kupac.email, subject, html: emailHtml });

        if (process.env.SMS_ENABLED === 'true' && kupac.telefon) {
          const smsPoruka = generisiRataSMSPoruka(kupac.ime, rata.iznos, datumFormatiran);
          await posaljiSMS({ to: kupac.telefon, message: smsPoruka });
        }

        await supabase
          .from('rate')
          .update({ [podsetnik.polje]: true })
          .eq('id', rata.id);

        rezultati.push({
          rataId: rata.id,
          kupac: kupac.ime,
          email: kupac.email,
          iznos: rata.iznos,
          datumDospeca: datumFormatiran,
          danaPreostalo,
          podsetnik: podsetnik.label,
          uspesno: true,
        });
      } catch (err) {
        console.error(`Greška pri slanju podsetnika za ratu ${rata.id}:`, err);
        rezultati.push({
          rataId: rata.id,
          kupac: kupac.ime,
          email: kupac.email,
          iznos: rata.iznos,
          podsetnik: podsetnik.label,
          uspesno: false,
          greska: err instanceof Error ? err.message : String(err),
        });
      }
    }
  }

  return rezultati;
}
