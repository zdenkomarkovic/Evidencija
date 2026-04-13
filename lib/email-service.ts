import Mailjet from 'node-mailjet';

const mailjet = new Mailjet({
  apiKey: process.env.MAILJET_API_KEY!,
  apiSecret: process.env.MAILJET_SECRET_KEY!,
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
  attachment?: {
    content: Buffer;
    filename: string;
    contentType: string;
  };
}

export async function posaljiEmail({ to, subject, html, from, attachment }: EmailOptions) {
  try {
    const toAdresa = process.env.TEST_EMAIL_OVERRIDE || to;
    const fromAdresa = from || process.env.SITE_MAIL_SENDER || 'noreply@manikamwebsolutions.com';

    const poruka: Record<string, unknown> = {
      From: { Email: fromAdresa },
      To: [{ Email: toAdresa }],
      Subject: subject,
      HTMLPart: html,
    };

    if (attachment) {
      poruka.Attachments = [
        {
          ContentType: attachment.contentType,
          Filename: attachment.filename,
          Base64Content: attachment.content.toString('base64'),
        },
      ];
    }

    const response = await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [poruka],
    });

    console.log('Email uspešno poslat:', response.body);
    return { success: true, data: response.body };
  } catch (error) {
    console.error('Greška pri slanju emaila:', error);
    return { success: false, error };
  }
}

export function generisiHostingEmailBody(
  imeKupca: string,
  datumObnavljanja: string,
  danaPreostalo: number,
  iznos: number,
  firma?: string | null,
  racun1?: string,
  banka1?: string,
  racun2?: string,
  banka2?: string,
  pozivNaBroj?: string,
): string {
  const hitno = danaPreostalo <= 7;
  const jeFirema = !!firma;
  const pozdrav = jeFirema ? `Poštovana kompanijo ${firma},` : `Poštovani/a ${imeKupca},`;
  const primaocPodaci = jeFirema
    ? `Kompanija: <strong>${firma}</strong> (kontakt: ${imeKupca})`
    : `Korisnik: <strong>${imeKupca}</strong>`;

  const uplataSekcija = racun1 ? `
    <div style="background:#f0f4ff;border-left:4px solid #1a1a2e;padding:15px;margin:20px 0;border-radius:4px;">
      <p style="font-weight:bold;color:#1a1a2e;margin:0 0 8px 0;text-transform:uppercase;font-size:12px;">Uplata na račun:</p>
      <p style="margin:4px 0;font-size:14px;">${racun1}${banka1 ? ` &mdash; ${banka1}` : ''}</p>
      ${racun2 ? `<p style="margin:4px 0;font-size:14px;">${racun2}${banka2 ? ` &mdash; ${banka2}` : ''}</p>` : ''}
    </div>
  ` : '';

  const pozivSekcija = pozivNaBroj ? `
    <div style="background:#fffbeb;border-left:4px solid #f59e0b;padding:15px;margin:20px 0;border-radius:4px;">
      <p style="font-weight:bold;color:#92400e;margin:0 0 6px 0;text-transform:uppercase;font-size:11px;">Poziv na broj (obavezno upisati pri uplati):</p>
      <p style="font-size:22px;font-weight:bold;color:#1a1a2e;letter-spacing:3px;margin:0 0 6px 0;">${pozivNaBroj}</p>
      <p style="font-size:11px;color:#92400e;margin:0;">Obavezno upišite ovaj poziv na broj kako bismo identifikovali Vašu uplatu.</p>
    </div>
  ` : '';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${hitno ? '#DC2626' : '#059669'}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .info-box { background: ${hitno ? '#FEF2F2' : '#FEF3C7'}; border-left: 4px solid ${hitno ? '#DC2626' : '#F59E0B'}; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .days { font-size: 32px; font-weight: bold; color: ${hitno ? '#DC2626' : '#059669'}; }
          .amount { font-size: 20px; font-weight: bold; color: #1a1a2e; }
          .primac { font-size: 13px; color: #555; margin-bottom: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin:0;">${hitno ? '⚠️ Hitno: Obnova hostinga' : 'Podsetnik za obnovu hostinga'}</h1>
          </div>
          <div class="content">
            <p>${pozdrav}</p>
            <p class="primac">${primaocPodaci}</p>
            <p>Obaveštavamo Vas da se ${hitno ? '<strong>hitno</strong> ' : ''}približava datum obnove Vašeg hosting paketa.</p>
            <div class="info-box">
              ${danaPreostalo > 0
                ? `<p><strong>Preostalo dana:</strong> <span class="days">${danaPreostalo}</span></p>`
                : `<p style="color:#DC2626;font-weight:bold;">Hosting ističe DANAS!</p>`
              }
              <p><strong>Datum obnavljanja:</strong> ${datumObnavljanja}</p>
              <p><strong>Iznos za uplatu:</strong> <span class="amount">${iznos.toLocaleString('de-DE', { minimumFractionDigits: 2 })} RSD</span></p>
            </div>
            ${uplataSekcija}
            ${pozivSekcija}
            <p>U prilogu se nalazi profaktura sa detaljima uplate.</p>
            <p>Molimo Vas da blagovremeno izvršite uplatu kako ne bi došlo do prekida usluge hosting servisa.</p>
            <p style="margin-top: 30px;">Srdačan pozdrav,<br><strong>${process.env.FIRMA_NAZIV || 'Vaš tim'}</strong></p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Template za podsetnik o rati
export function generisiRataEmailTemplate(
  imeKupca: string,
  iznos: number,
  datumDospeca: string,
  danaPreostalo: number = 0
): string {
  const hitno = danaPreostalo <= 1;
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${hitno ? '#DC2626' : '#4F46E5'}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .info-box { background: ${hitno ? '#FEF2F2' : '#EEF2FF'}; border-left: 4px solid ${hitno ? '#DC2626' : '#4F46E5'}; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .days { font-size: 32px; font-weight: bold; color: ${hitno ? '#DC2626' : '#4F46E5'}; }
          .amount { font-size: 20px; font-weight: bold; color: #1a1a2e; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin:0;">${hitno ? '⚠️ Hitno: Uplata rate' : 'Podsetnik za uplatu rate'}</h1>
          </div>
          <div class="content">
            <p>Poštovani/a ${imeKupca},</p>
            <p>Obaveštavamo Vas da se ${hitno ? '<strong>sutra ističe</strong>' : 'uskoro ističe'} rok za uplatu Vaše rate.</p>
            <div class="info-box">
              ${danaPreostalo > 1
                ? `<p><strong>Preostalo dana:</strong> <span class="days">${danaPreostalo}</span></p>`
                : danaPreostalo === 1
                  ? `<p style="color:#DC2626;font-weight:bold;">Rata dospeva SUTRA!</p>`
                  : `<p style="color:#DC2626;font-weight:bold;">Rata dospeva DANAS!</p>`
              }
              <p><strong>Datum dospeća:</strong> ${datumDospeca}</p>
              <p><strong>Iznos rate:</strong> <span class="amount">${iznos.toLocaleString('de-DE', { minimumFractionDigits: 2 })} RSD</span></p>
            </div>
            <p>Molimo Vas da izvršite uplatu u najkraćem mogućem roku.</p>
            <p>Ukoliko ste već izvršili uplatu, molimo zanemarite ovu poruku.</p>
            <p style="margin-top: 30px;">Srdačan pozdrav,<br><strong>${process.env.FIRMA_NAZIV || 'Vaš tim'}</strong></p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Template za podsetnik o hostingu
export function generisiHostingEmailTemplate(
  imeKupca: string,
  datumObnavljanja: string,
  danaPreostalo: number
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .warning { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; }
          .days { font-size: 36px; font-weight: bold; color: #059669; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Podsetnik za obnovu hostinga</h1>
          </div>
          <div class="content">
            <p>Poštovani/a ${imeKupca},</p>
            <p>Obaveštavamo Vas da se približava datum obnove Vašeg hosting paketa.</p>
            ${
              danaPreostalo > 0
                ? `<div class="warning">
                    <p><strong>Preostalo dana:</strong> <span class="days">${danaPreostalo}</span></p>
                    <p><strong>Datum obnavljanja:</strong> ${datumObnavljanja}</p>
                  </div>`
                : `<div class="warning">
                    <p style="color: #DC2626; font-weight: bold;">⚠️ Hosting ističe danas!</p>
                    <p><strong>Datum obnavljanja:</strong> ${datumObnavljanja}</p>
                  </div>`
            }
            <p>Molimo Vas da blagovremeno obnovite hosting kako ne bi došlo do prekida usluge.</p>
            <p>Za dodatne informacije ili pomoć, slobodno nas kontaktirajte.</p>
            <p style="margin-top: 30px;">Srdačan pozdrav,<br>Vaš tim</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function generisiGoogleAdsEmailBody(
  imeKupca: string,
  imeKampanje: string,
  datumIsteka: string,
  danaPreostalo: number,
  iznos: number,
  firma?: string | null,
  racun1?: string,
  banka1?: string,
  racun2?: string,
  banka2?: string,
  pozivNaBroj?: string,
): string {
  const hitno = danaPreostalo <= 1;
  const jeFirema = !!firma;
  const pozdrav = jeFirema ? `Poštovana kompanijo ${firma},` : `Poštovani/a ${imeKupca},`;

  const uplataSekcija = racun1 ? `
    <div style="background:#f0f4ff;border-left:4px solid #1a1a2e;padding:15px;margin:20px 0;border-radius:4px;">
      <p style="font-weight:bold;color:#1a1a2e;margin:0 0 8px 0;text-transform:uppercase;font-size:12px;">Uplata na račun:</p>
      <p style="margin:4px 0;font-size:14px;">${racun1}${banka1 ? ` &mdash; ${banka1}` : ''}</p>
      ${racun2 ? `<p style="margin:4px 0;font-size:14px;">${racun2}${banka2 ? ` &mdash; ${banka2}` : ''}</p>` : ''}
    </div>
  ` : '';

  const pozivSekcija = pozivNaBroj ? `
    <div style="background:#fffbeb;border-left:4px solid #f59e0b;padding:15px;margin:20px 0;border-radius:4px;">
      <p style="font-weight:bold;color:#92400e;margin:0 0 6px 0;text-transform:uppercase;font-size:11px;">Poziv na broj (obavezno upisati pri uplati):</p>
      <p style="font-size:22px;font-weight:bold;color:#1a1a2e;letter-spacing:3px;margin:0 0 6px 0;">${pozivNaBroj}</p>
      <p style="font-size:11px;color:#92400e;margin:0;">Obavezno upišite ovaj poziv na broj kako bismo identifikovali Vašu uplatu.</p>
    </div>
  ` : '';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${hitno ? '#DC2626' : '#4F46E5'}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .info-box { background: ${hitno ? '#FEF2F2' : '#EEF2FF'}; border-left: 4px solid ${hitno ? '#DC2626' : '#4F46E5'}; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .days { font-size: 32px; font-weight: bold; color: ${hitno ? '#DC2626' : '#4F46E5'}; }
          .amount { font-size: 20px; font-weight: bold; color: #1a1a2e; }
          .primac { font-size: 13px; color: #555; margin-bottom: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin:0;">${hitno ? '⚠️ Hitno: Plaćanje Google Ads kampanje' : 'Podsetnik za plaćanje Google Ads kampanje'}</h1>
          </div>
          <div class="content">
            <p>${pozdrav}</p>
            <p>Obaveštavamo Vas da se ${hitno ? '<strong>sutra ističe</strong>' : 'uskoro ističe'} period upravljanja Vašom Google Ads kampanjom.</p>
            <div class="info-box">
              ${danaPreostalo > 1
                ? `<p><strong>Preostalo dana:</strong> <span class="days">${danaPreostalo}</span></p>`
                : danaPreostalo === 1
                  ? `<p style="color:#DC2626;font-weight:bold;">Kampanja ističe SUTRA!</p>`
                  : `<p style="color:#DC2626;font-weight:bold;">Kampanja ističe DANAS!</p>`
              }
              <p><strong>Datum isteka:</strong> ${datumIsteka}</p>
              <p><strong>Iznos za uplatu:</strong> <span class="amount">${iznos.toLocaleString('de-DE', { minimumFractionDigits: 2 })} RSD</span></p>
            </div>
            ${uplataSekcija}
            ${pozivSekcija}
            <p>U prilogu se nalazi profaktura sa detaljima uplate.</p>
            <p>Molimo Vas da blagovremeno izvršite uplatu kako ne bi došlo do prekida vođenja kampanje.</p>
            <p style="margin-top: 30px;">Srdačan pozdrav,<br><strong>${process.env.FIRMA_NAZIV || 'Vaš tim'}</strong></p>
          </div>
        </div>
      </body>
    </html>
  `;
}
