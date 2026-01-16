import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import {
  posaljiEmail,
  generisiRataEmailTemplate,
} from '@/lib/email-service';
import {
  posaljiSMS,
  generisiRataSMSPoruka,
} from '@/lib/sms-service';

// GET - Dnevni podsetnici za rate
export async function GET(request: NextRequest) {
  try {
    // Provera authorization tokena za sigurnost (opciono)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Neautorizovan pristup' }, { status: 401 });
    }

    // Pronađi sve neplaćene rate koje dospevaju danas i kojima podsetnik nije poslat
    const danas = new Date();
    danas.setHours(0, 0, 0, 0);

    const sutra = new Date(danas);
    sutra.setDate(sutra.getDate() + 1);

    const { data: rateDospeleToday, error } = await supabase
      .from('rate')
      .select(`
        *,
        kupci (*)
      `)
      .eq('placeno', false)
      .eq('podsetnik_poslat', false)
      .gte('datum_dospeca', danas.toISOString())
      .lt('datum_dospeca', sutra.toISOString());

    if (error) throw error;

    const rezultati = [];

    for (const rata of rateDospeleToday) {
      const kupac = rata.kupci;

      if (!kupac || !kupac.email) {
        console.warn(`Kupac nije pronađen ili nema email za ratu: ${rata.id}`);
        continue;
      }

      // Formatiraj datum
      const datumFormatiran = new Date(rata.datum_dospeca).toLocaleDateString('sr-RS', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });

      // Pošalji email
      const emailHtml = generisiRataEmailTemplate(
        kupac.ime,
        rata.iznos,
        datumFormatiran
      );

      try {
        await posaljiEmail({ to: kupac.email, subject: 'Podsetnik za ratu', html: emailHtml });

        // Ako je SMS omogućen i korisnik ima telefon
        if (process.env.SMS_ENABLED === 'true' && kupac.telefon) {
          const smsPoruka = generisiRataSMSPoruka(kupac.ime, rata.iznos, datumFormatiran);
          await posaljiSMS({ to: kupac.telefon, message: smsPoruka });
        }

        // Označi podsetnik kao poslat
        await supabase
          .from('rate')
          .update({ podsetnik_poslat: true })
          .eq('id', rata.id);

        rezultati.push({
          rataId: rata.id,
          kupac: kupac.ime,
          email: kupac.email,
          iznos: rata.iznos,
          uspesno: true,
        });
      } catch (err) {
        console.error(`Greška pri slanju podsetnika za ratu ${rata.id}:`, err);
        rezultati.push({
          rataId: rata.id,
          kupac: kupac.ime,
          email: kupac.email,
          iznos: rata.iznos,
          uspesno: false,
          greska: err instanceof Error ? err.message : String(err),
        });
      }
    }

    return NextResponse.json({
      message: `Poslato ${rezultati.filter(r => r.uspesno).length} od ${rezultati.length} podsetnika`,
      rezultati,
    });
  } catch (error) {
    console.error('Greška pri slanju podsetnika:', error);
    return NextResponse.json(
      { error: 'Greška pri slanju podsetnika' },
      { status: 500 }
    );
  }
}
