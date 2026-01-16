# Podsetnik za Rate i Hosting

Next.js aplikacija za praćenje rata klijenata i hosting obnova sa automatskim email/SMS podsetnicima.

## Funkcionalnosti

### 1. **Baza podataka (MongoDB)**
- **Kolekcija kupci**: ime, email, telefon
- **Kolekcija rate**: kupacId, iznos, datumDospeca, placeno, nacinPlacanja, podsetnikPoslat
- **Kolekcija hosting**: kupacId, datumObnavljanja, podsetnikPoslat

### 2. **Admin Panel**
- Pregled svih kupaca sa ukupnim dugom
- Evidencija neplaćenih rata po kupcu
- Oznacavanje rata kao plaćenih
- Praćenje statusa hostinga i podsetnika
- Filtriranje i pretraga

### 3. **Automatski Podsetnici**
- **Dnevni podsetnici za rate** - šalju se kupcima čije rate dospevaju tog dana
- **Podsetnici za hosting** - šalju se 30 dana pre isteka hostinga
- Email i SMS podsetnici (SMS je opciono)

### 4. **Email/SMS Integracija**
- **Resend** za email podsetnik (moderno i jednostavno)
- **Nodemailer** kao alternativa
- **SMS servis** - lako se integriše sa Twilio, Vonage, Infobip ili Viber Business

## Instalacija

### 1. Kloniraj projekat i instaliraj zavisnosti

```bash
npm install
```

### 2. Konfiguriši environment varijable

Kreiraj `.env.local` fajl u root direktorijumu:

```bash
cp .env.example .env.local
```

Popuni environment varijable:

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/podsetnik-rate

# Resend (preporučeno za email)
RESEND_API_KEY=re_xxxxxxxxxx
EMAIL_FROM=noreply@vasadomena.com

# SMS (opciono)
SMS_ENABLED=false

# Cron sigurnost
CRON_SECRET=neki-tajni-kljuc
```

### 3. Pokreni development server

```bash
npm run dev
```

Otvori [http://localhost:3000/admin](http://localhost:3000/admin) za admin panel.

## API Rute

### Kupci
- `GET /api/kupci` - Dohvati sve kupce
- `POST /api/kupci` - Kreiraj novog kupca

### Rate
- `GET /api/rate` - Dohvati sve rate
- `POST /api/rate` - Kreiraj novu ratu
- `GET /api/rate?kupacId=ID` - Filtriraj rate po kupcu
- `GET /api/rate?placeno=false` - Filtriraj neplaćene rate

### Hosting
- `GET /api/hosting` - Dohvati sve hosting zapise
- `POST /api/hosting` - Kreiraj novi hosting zapis

### Akcije
- `POST /api/oznaciPlaceno` - Označi ratu kao plaćenu
- `POST /api/oznaciPodsetnik` - Resetuj status podsetnika

### Podsetnici (Cron Jobs)
- `GET /api/podsetnici` - Pošalji dnevne podsetnike za rate
- `GET /api/podsetnici-hosting` - Pošalji podsetnike za hosting

## Email Servis Setup

### Resend (preporučeno)

1. Registruj se na [resend.com](https://resend.com)
2. Kreiraj API ključ
3. Dodaj u `.env.local`:
```env
RESEND_API_KEY=re_your_api_key
EMAIL_FROM=onboarding@resend.dev
```

### Nodemailer (alternativa)

```env
SMTP_SERVER_HOST=smtp.gmail.com
SMTP_SERVER_USERNAME=vas-email@gmail.com
SMTP_SERVER_PASSWORD=app-password
```

## SMS Servis Setup

### Twilio (primer)

```bash
npm install twilio
```

U `.env.local`:
```env
SMS_ENABLED=true
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+381xxxxxxxxx
```

Otvori `lib/sms-service.ts` i otkomenturiši Twilio kod.

### Drugi provajderi
- **Vonage (Nexmo)**: npm install @vonage/server-sdk
- **Infobip**: npm install @infobip-api/sdk
- **Viber Business**: Koristi Viber Business API

Detaljne instrukcije su u `lib/sms-service.ts`.

## Vercel Deployment & Cron Jobs

### 1. Deploy na Vercel

```bash
npm install -g vercel
vercel
```

### 2. Dodaj Environment Varijable

U Vercel dashboardu:
- Project Settings → Environment Variables
- Dodaj sve varijable iz `.env.local`

### 3. Vercel Cron Jobs

Vercel automatski detektuje `vercel.json` i podešava cron jobove:

```json
{
  "crons": [
    {
      "path": "/api/podsetnici",
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/podsetnici-hosting",
      "schedule": "0 9 * * *"
    }
  ]
}
```

**Raspored**: `0 9 * * *` = Svaki dan u 09:00

Cron sintaksa:
- `0 9 * * *` - Svaki dan u 09:00
- `0 */6 * * *` - Svakih 6 sati
- `0 0 * * 0` - Svake nedelje u ponoć

### 4. Testiranje Cron Jobova

Ručno pozovi API rute:

```bash
curl -X GET https://vasa-domena.vercel.app/api/podsetnici \
  -H "Authorization: Bearer your-cron-secret"
```

## Alternativni Hosting sa Cron Jobs

### Railway.app

1. Deploy projekat na Railway
2. Dodaj environment varijable
3. Koristi Railway Cron ili eksterni servis (cron-job.org)

### Render.com

1. Deploy kao Web Service
2. Dodaj Cron Job:
   ```
   0 9 * * * curl https://vasa-app.onrender.com/api/podsetnici
   ```

### cron-job.org (Eksterni Cron Servis)

1. Registruj se na [cron-job.org](https://cron-job.org)
2. Kreiraj novi cron job:
   - URL: `https://vasa-domena.com/api/podsetnici`
   - Header: `Authorization: Bearer your-cron-secret`
   - Schedule: `0 9 * * *`

## Korišćenje Admin Panela

### Pristup
Otvori: `http://localhost:3000/admin` (ili produkcijski URL)

### Funkcionalnosti

1. **Tab "Kupci"**
   - Pregled svih kupaca
   - Broj rata i ukupan dug po kupcu
   - Pretraga po imenu, emailu ili telefonu
   - Klik na kupca za prikaz njegovih rata

2. **Tab "Rate"**
   - Pregled svih rata
   - Filtriranje: Sve / Neplaćene / Plaćene
   - Označavanje rate kao plaćene (dugme "Plaćeno")
   - Resetovanje podsetnika (dugme "Resetuj")
   - Dospele rate su označene crvenom pozadinom

3. **Tab "Hosting"**
   - Pregled svih hosting zapisa
   - Prikaz preostalog vremena do obnove
   - Oznake:
     - Crveno: Manje od 7 dana
     - Žuto: 7-30 dana
     - Zeleno: Više od 30 dana
   - Resetovanje podsetnika

## Dodavanje Novih Zapisa

### Kroz API (Postman, curl, ili frontend forma)

**Kreiraj kupca:**
```bash
curl -X POST http://localhost:3000/api/kupci \
  -H "Content-Type: application/json" \
  -d '{
    "ime": "Marko Marković",
    "email": "marko@example.com",
    "telefon": "+381641234567"
  }'
```

**Kreiraj ratu:**
```bash
curl -X POST http://localhost:3000/api/rate \
  -H "Content-Type: application/json" \
  -d '{
    "kupacId": "kupac_id_ovde",
    "iznos": 5000,
    "datumDospeca": "2025-12-25"
  }'
```

**Kreiraj hosting:**
```bash
curl -X POST http://localhost:3000/api/hosting \
  -H "Content-Type: application/json" \
  -d '{
    "kupacId": "kupac_id_ovde",
    "datumObnavljanja": "2026-01-15"
  }'
```

## MongoDB Setup

### MongoDB Atlas (Cloud - Besplatno)

1. Registruj se na [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Kreiraj novi cluster (besplatni tier je dovoljan)
3. Kreiraj database user
4. Whitelist IP adresu (ili dodaj `0.0.0.0/0` za sve IP-eve)
5. Kopiraj Connection String i dodaj u `.env.local`

### Lokalni MongoDB

```bash
# Instaliraj MongoDB lokalno
# macOS
brew install mongodb-community

# Ubuntu
sudo apt-get install mongodb

# Pokreni MongoDB
mongod

# Connection string
MONGODB_URI=mongodb://localhost:27017/podsetnik-rate
```

## Tehnologije

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **MongoDB** (Mongoose)
- **Resend** (Email)
- **Vercel Cron Jobs**

## Troubleshooting

### Problem: Podsetnici se ne šalju

1. Proveri da li su environment varijable pravilno postavljene
2. Proveri Vercel logs: `vercel logs`
3. Testuj API rute ručno sa curl
4. Proveri `CRON_SECRET` u headeru

### Problem: Email se ne šalje

1. Proveri `RESEND_API_KEY`
2. Proveri da li je email domena verifikovana (Resend dashboard)
3. Pogledaj logs u Resend dashboardu

### Problem: MongoDB konekcija pada

1. Proveri `MONGODB_URI` format
2. Proveri da li je IP adresa whitelistovana u MongoDB Atlas
3. Proveri database user credentials

## Licenca

MIT

## Podrška

Za pitanja ili probleme, otvori issue na GitHub repozitorijumu.
