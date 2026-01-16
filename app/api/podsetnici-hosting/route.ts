import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import {
  posaljiEmail,
  generisiHostingEmailTemplate,
} from '@/lib/email-service';
import {
  posaljiSMS,
  generisiHostingSMSPoruka,
} from '@/lib/sms-service';

// GET - Godišnji podsetnici za hosting
export async function GET(request: NextRequest) {
  try {
    // Provera authorization tokena za sigurnost (opciono)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Neautorizovan pristup' }, { status: 401 });
    }

    // Pronađi hosting zapise koji ističu u narednih 30 dana i kojima podsetnik nije poslat
    const danas = new Date();
    danas.setHours(0, 0, 0, 0);

    const za30Dana = new Date(danas);
    za30Dana.setDate(za30Dana.getDate() + 30);

    const { data: hostingZaObnovu, error } = await supabase
      .from('hosting')
      .select(`
        *,
        kupci (*)
      `)
      .eq('podsetnik_poslat', false)
      .gte('datum_obnavljanja', danas.toISOString())
      .lte('datum_obnavljanja', za30Dana.toISOString());

    if (error) throw error;

    const rezultati = [];

    for (const hosting of hostingZaObnovu) {
      const kupac = hosting.kupci;

      if (!kupac || !kupac.email) {
        console.warn(
          `Kupac nije pronađen ili nema email za hosting: ${hosting.id}`
        );
        continue;
      }

      // Izračunaj broj dana do obnove
      const danaPreostalo = Math.ceil(
        (new Date(hosting.datum_obnavljanja).getTime() - danas.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      // Formatiraj datum
      const datumFormatiran = new Date(hosting.datum_obnavljanja).toLocaleDateString(
        'sr-RS',
        {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }
      );

      // Pošalji email
      const emailHtml = generisiHostingEmailTemplate(
        kupac.ime,
        datumFormatiran,
        danaPreostalo
      );

      try {
        await posaljiEmail({
          to: kupac.email,
          subject: 'Podsetnik za obnovu hostinga',
          html: emailHtml
        });

        // Ako je SMS omogućen i korisnik ima telefon
        if (process.env.SMS_ENABLED === 'true' && kupac.telefon) {
          const smsPoruka = generisiHostingSMSPoruka(
            kupac.ime,
            datumFormatiran,
            danaPreostalo
          );
          await posaljiSMS({ to: kupac.telefon, message: smsPoruka });
        }

        // Označi podsetnik kao poslat
        await supabase
          .from('hosting')
          .update({ podsetnik_poslat: true })
          .eq('id', hosting.id);

        rezultati.push({
          hostingId: hosting.id,
          kupac: kupac.ime,
          email: kupac.email,
          datumObnavljanja: datumFormatiran,
          danaPreostalo,
          uspesno: true,
        });
      } catch (err) {
        console.error(
          `Greška pri slanju podsetnika za hosting ${hosting.id}:`,
          err
        );
        rezultati.push({
          hostingId: hosting.id,
          kupac: kupac.ime,
          email: kupac.email,
          datumObnavljanja: datumFormatiran,
          danaPreostalo,
          uspesno: false,
          greska: err instanceof Error ? err.message : String(err),
        });
      }
    }

    return NextResponse.json({
      message: `Poslato ${rezultati.filter(r => r.uspesno).length} od ${rezultati.length} podsetnika za hosting`,
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
