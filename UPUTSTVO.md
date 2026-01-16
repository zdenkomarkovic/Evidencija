# Uputstvo za Podsetnik Rate & Hosting

## Brzo Pokretanje

### 1. Instaliraj zavisnosti
```bash
npm install
```

### 2. Kreiraj `.env.local` fajl
```bash
cp .env.example .env.local
```

### 3. Konfiguriši MongoDB
- Idi na [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- Kreiraj besplatan cluster
- Kopiraj connection string u `.env.local`:
```env
MONGODB_URI=mongodb+srv://korisnik:lozinka@cluster.mongodb.net/podsetnik-rate
```

### 4. Konfiguriši Email (Resend)
- Idi na [resend.com](https://resend.com)
- Registruj se i kreiraj API ključ
- Dodaj u `.env.local`:
```env
RESEND_API_KEY=re_your_api_key
EMAIL_FROM=onboarding@resend.dev
```

### 5. Pokreni aplikaciju
```bash
npm run dev
```

Otvori: [http://localhost:3000/admin](http://localhost:3000/admin)

## Korišćenje

### Dodavanje kupca (preko API)

```bash
curl -X POST http://localhost:3000/api/kupci \
  -H "Content-Type: application/json" \
  -d '{
    "ime": "Petar Petrović",
    "email": "petar@example.com",
    "telefon": "+381641234567"
  }'
```

### Dodavanje rate

```bash
curl -X POST http://localhost:3000/api/rate \
  -H "Content-Type: application/json" \
  -d '{
    "kupacId": "KOPIRAJ_ID_KUPCA_OVDE",
    "iznos": 10000,
    "datumDospeca": "2025-12-31"
  }'
```

### Dodavanje hostinga

```bash
curl -X POST http://localhost:3000/api/hosting \
  -H "Content-Type: application/json" \
  -d '{
    "kupacId": "KOPIRAJ_ID_KUPCA_OVDE",
    "datumObnavljanja": "2026-06-15"
  }'
```

## Admin Panel

Otvori `http://localhost:3000/admin`

### Kupci Tab
- Vidi sve kupce
- Pretraži po imenu, email-u ili telefonu
- Vidi broj rata i ukupan dug

### Rate Tab
- Vidi sve rate
- Filtriraj po statusu (sve/neplaćene/plaćene)
- Označi kao plaćeno
- Resetuj podsetnik

### Hosting Tab
- Vidi sve hosting zapise
- Vidi preostalo vreme do obnove
- Resetuj podsetnik

## Deploy na Vercel

### 1. Instaliraj Vercel CLI
```bash
npm install -g vercel
```

### 2. Deploy
```bash
vercel
```

### 3. Dodaj Environment Variables
U Vercel dashboardu:
- Settings → Environment Variables
- Dodaj `MONGODB_URI`
- Dodaj `RESEND_API_KEY`
- Dodaj `EMAIL_FROM`
- Dodaj `CRON_SECRET` (bilo koji string)

### 4. Automatski Podsetnici
Vercel automatski podešava cron jobs iz `vercel.json`:
- Dnevni podsetnici za rate: 09:00
- Podsetnici za hosting: 09:00

## Testiranje Podsetnika

### Lokalno testiranje
```bash
# Test podsetnika za rate
curl http://localhost:3000/api/podsetnici

# Test podsetnika za hosting
curl http://localhost:3000/api/podsetnici-hosting
```

### Na produkciji (sa CRON_SECRET)
```bash
curl https://vasa-domena.vercel.app/api/podsetnici \
  -H "Authorization: Bearer your-cron-secret"
```

## SMS Podrška (Opciono)

### Twilio Setup
1. Instaliraj Twilio:
```bash
npm install twilio
```

2. Dodaj u `.env.local`:
```env
SMS_ENABLED=true
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+381xxxxxxxxx
```

3. Otvori `lib/sms-service.ts` i otkomenturiši Twilio kod

## Česte Greške

### MongoDB konekcija ne radi
- Proveri da li je IP adresa whitelistovana u MongoDB Atlas
- Proveri username i password u connection stringu

### Email se ne šalje
- Proveri da li je `RESEND_API_KEY` tačan
- Za Resend, verifikuj domenu u dashboardu

### Cron jobs ne rade
- Proveri `vercel.json` sintaksu
- Proveri da li je `CRON_SECRET` dodat u environment variables
- Proveri Vercel logs: `vercel logs`

## Podrška

Za detaljno uputstvo, pogledaj `README.md`.
Za probleme, pogledaj "Troubleshooting" sekciju u README-u.
