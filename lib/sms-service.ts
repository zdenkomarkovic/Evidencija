// SMS servis - lako se može zameniti sa bilo kojim provajderom
// Primeri provajdera: Twilio, Vonage (Nexmo), Infobip, Viber Business, etc.

export interface SMSOptions {
  to: string;
  message: string;
}

export async function posaljiSMS({ to, message }: SMSOptions) {
  try {
    // TODO: Integrisati sa SMS provajderom
    // Primer za Twilio:
    /*
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = require('twilio')(accountSid, authToken);

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to
    });

    console.log('SMS uspešno poslat:', result.sid);
    return { success: true, data: result };
    */

    // Za sada samo logujemo (zameni sa pravim SMS servisom)
    console.log('SMS bi bio poslat na:', to);
    console.log('Poruka:', message);

    return { success: true, message: 'SMS servis nije konfigurisan (placeholder)' };
  } catch (error) {
    console.error('Greška pri slanju SMS-a:', error);
    return { success: false, error };
  }
}

// Template za SMS podsetnik o rati
export function generisiRataSMSPoruka(
  imeKupca: string,
  iznos: number,
  datumDospeca: string
): string {
  return `Poštovani/a ${imeKupca}, podsetnik: Vaša rata od ${iznos} RSD dospeva ${datumDospeca}. Molimo izvršite uplatu. Hvala!`;
}

// Template za SMS podsetnik o hostingu
export function generisiHostingSMSPoruka(
  imeKupca: string,
  datumObnavljanja: string,
  danaPreostalo: number
): string {
  if (danaPreostalo > 0) {
    return `Poštovani/a ${imeKupca}, podsetnik: Vaš hosting ističe za ${danaPreostalo} dana (${datumObnavljanja}). Molimo obnovite ga na vreme.`;
  } else {
    return `Poštovani/a ${imeKupca}, HITNO: Vaš hosting ističe danas (${datumObnavljanja}). Molimo obnovite ga odmah!`;
  }
}

// Instrukcije za integraciju sa različitim provajderima:
/*
=== TWILIO ===
1. npm install twilio
2. Dodaj u .env.local:
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number

=== VONAGE (NEXMO) ===
1. npm install @vonage/server-sdk
2. Dodaj u .env.local:
   VONAGE_API_KEY=your_api_key
   VONAGE_API_SECRET=your_api_secret
   VONAGE_FROM_NUMBER=your_number

=== INFOBIP ===
1. npm install @infobip-api/sdk
2. Dodaj u .env.local:
   INFOBIP_API_KEY=your_api_key
   INFOBIP_BASE_URL=your_base_url

=== VIBER BUSINESS ===
1. Koristi Viber Business API
2. Dodaj u .env.local:
   VIBER_AUTH_TOKEN=your_auth_token
*/
