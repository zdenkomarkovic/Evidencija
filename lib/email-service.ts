import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function posaljiEmail({ to, subject, html, from }: EmailOptions) {
  try {
    const data = await resend.emails.send({
      from: from || process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to,
      subject,
      html,
    });

    console.log('Email uspešno poslat:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Greška pri slanju emaila:', error);
    return { success: false, error };
  }
}

// Template za podsetnik o rati
export function generisiRataEmailTemplate(
  imeKupca: string,
  iznos: number,
  datumDospeca: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px; }
          .amount { font-size: 24px; font-weight: bold; color: #4F46E5; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Podsetnik za uplatu rate</h1>
          </div>
          <div class="content">
            <p>Poštovani/a ${imeKupca},</p>
            <p>Ovim putem Vas podsetamo da je danas datum dospeća Vaše rate.</p>
            <p><strong>Iznos rate:</strong> <span class="amount">${iznos} RSD</span></p>
            <p><strong>Datum dospeća:</strong> ${datumDospeca}</p>
            <p>Molimo Vas da izvršite uplatu u najkraćem mogućem roku.</p>
            <p>Ukoliko ste već izvršili uplatu, molimo zanemarite ovu poruku.</p>
            <p>Hvala na razumevanju!</p>
            <p style="margin-top: 30px;">Srdačan pozdrav,<br>Vaš tim</p>
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
