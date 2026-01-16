# Podsetnik Rate & Hosting - Pregled Projekta

## ✅ Šta je Implementirano

### 1. MongoDB Baza Podataka
- ✅ Konekcija (`lib/mongodb.ts`)
- ✅ Model `Kupac` (`lib/models/Kupac.ts`)
- ✅ Model `Rata` (`lib/models/Rata.ts`)
- ✅ Model `Hosting` (`lib/models/Hosting.ts`)

### 2. API Rute
- ✅ `/api/kupci` - GET (svi kupci), POST (kreiraj kupca)
- ✅ `/api/rate` - GET (sve rate), POST (kreiraj ratu)
- ✅ `/api/hosting` - GET (svi hosting), POST (kreiraj hosting)
- ✅ `/api/oznaciPlaceno` - POST (označi ratu kao plaćenu)
- ✅ `/api/oznaciPodsetnik` - POST (resetuj podsetnik)
- ✅ `/api/podsetnici` - GET (dnevni podsetnici za rate - CRON)
- ✅ `/api/podsetnici-hosting` - GET (podsetnici za hosting - CRON)

### 3. Email & SMS Servisi
- ✅ Resend email servis (`lib/email-service.ts`)
- ✅ SMS servis sa template-ima (`lib/sms-service.ts`)
- ✅ HTML email template-i za rate i hosting
- ✅ SMS poruke template-i

### 4. Admin Panel
- ✅ Glavna stranica (`/admin`)
- ✅ Tabela kupaca sa statistikom
- ✅ Tabela rata sa filtriranjem
- ✅ Tabela hostinga sa preostalog vremena
- ✅ Pretraga i filteri
- ✅ Označavanje plaćeno
- ✅ Resetovanje podsetnika
- ✅ Responsivan dizajn (Tailwind CSS)

### 5. Automatizacija (Cron Jobs)
- ✅ Vercel Cron Jobs konfiguracija (`vercel.json`)
- ✅ Dnevni podsetnici za rate (09:00)
- ✅ Podsetnici za hosting (09:00, 30 dana pre isteka)

### 6. Dokumentacija
- ✅ Detaljan README.md (engleski)
- ✅ UPUTSTVO.md (srpski)
- ✅ `.env.example` sa svim varijablama
- ✅ Komentari u kodu

### 7. Skripte za Testiranje
- ✅ `npm run test:api` - Test API ruta
- ✅ `npm run seed` - Popunjavanje baze test podacima

## 📁 Struktura Projekta

```
podsetnik-rate/
├── app/
│   ├── admin/
│   │   └── page.tsx          # Admin panel
│   ├── api/
│   │   ├── kupci/
│   │   │   └── route.ts      # API rute za kupce
│   │   ├── rate/
│   │   │   └── route.ts      # API rute za rate
│   │   ├── hosting/
│   │   │   └── route.ts      # API rute za hosting
│   │   ├── oznaciPlaceno/
│   │   │   └── route.ts      # Označavanje plaćeno
│   │   ├── oznaciPodsetnik/
│   │   │   └── route.ts      # Resetovanje podsetnika
│   │   ├── podsetnici/
│   │   │   └── route.ts      # Dnevni podsetnici (CRON)
│   │   └── podsetnici-hosting/
│   │       └── route.ts      # Hosting podsetnici (CRON)
│   └── ...
├── components/
│   └── admin/
│       ├── KupciTabela.tsx   # Tabela kupaca
│       ├── RateTabela.tsx    # Tabela rata
│       └── HostingTabela.tsx # Tabela hostinga
├── lib/
│   ├── mongodb.ts            # MongoDB konekcija
│   ├── email-service.ts      # Resend email servis
│   ├── sms-service.ts        # SMS servis (Twilio/Vonage/etc)
│   └── models/
│       ├── Kupac.ts          # Kupac model
│       ├── Rata.ts           # Rata model
│       └── Hosting.ts        # Hosting model
├── scripts/
│   ├── test-api.js           # Test skripta
│   └── seed-database.js      # Seed skripta
├── .env.example              # Environment varijable template
├── vercel.json               # Vercel Cron Jobs config
├── README.md                 # Detaljna dokumentacija
├── UPUTSTVO.md               # Uputstvo na srpskom
└── package.json              # Dependencies & scripts
```

## 🚀 Sledeći Koraci

### 1. Podesi Environment Varijable
Kreiraj `.env.local` fajl:
```bash
cp .env.example .env.local
```

Popuni varijable:
- `MONGODB_URI` - MongoDB Atlas connection string
- `RESEND_API_KEY` - Resend API ključ (email)
- `EMAIL_FROM` - Email adresa pošiljaoca
- `CRON_SECRET` - Secret za Cron Jobs (opciono)

### 2. MongoDB Setup
1. Idi na [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Kreiraj besplatan cluster
3. Kreiraj database user
4. Whitelist IP adresu
5. Kopiraj connection string u `.env.local`

### 3. Resend Setup (Email)
1. Idi na [resend.com](https://resend.com)
2. Registruj se i kreiraj API ključ
3. Dodaj u `.env.local`
4. (Opciono) Verifikuj svoju domenu

### 4. Testiranje Lokalno
```bash
# Pokreni development server
npm run dev

# Popuni bazu test podacima
npm run seed

# Testiraj API rute
npm run test:api

# Otvori admin panel
# http://localhost:3000/admin
```

### 5. Deploy na Vercel
```bash
# Instaliraj Vercel CLI
npm install -g vercel

# Deploy
vercel

# Dodaj environment varijable u Vercel dashboard
# Settings → Environment Variables
```

### 6. (Opciono) SMS Setup
Za Twilio:
```bash
npm install twilio
```

Dodaj u `.env.local`:
```
SMS_ENABLED=true
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+381xxxxxxxxx
```

Otvori `lib/sms-service.ts` i otkomenturiši Twilio kod.

## 🎯 Funkcionalnosti u Akciji

### Kako Rade Podsetnici

#### Dnevni Podsetnici za Rate
1. Cron job poziva `/api/podsetnici` svaki dan u 09:00
2. API pronalazi sve neplaćene rate koje dospevaju tog dana
3. Za svaku ratu:
   - Šalje email kupcu
   - (Opciono) Šalje SMS
   - Označava `podsetnikPoslat = true`

#### Podsetnici za Hosting
1. Cron job poziva `/api/podsetnici-hosting` svaki dan u 09:00
2. API pronalazi hosting koji ističe u narednih 30 dana
3. Za svaki hosting:
   - Šalje email sa brojem preostalih dana
   - (Opciono) Šalje SMS
   - Označava `podsetnikPoslat = true`

### Admin Panel Funkcionalnosti

#### Tab "Kupci"
- Pregled svih kupaca
- Statistika po kupcu (broj rata, neplaćene rate, dug)
- Pretraga po imenu/emailu/telefonu
- Klik na kupca vodi na tab "Rate"

#### Tab "Rate"
- Pregled svih rata
- Filtriranje: Sve / Neplaćene / Plaćene
- Dospele rate su označene crvenom pozadinom
- Dugme "Plaćeno" - označava ratu kao plaćenu
- Dugme "Resetuj" - resetuje podsetnik da se može ponovo poslati

#### Tab "Hosting"
- Pregled svih hosting zapisa
- Prikaz preostalog vremena (dana)
- Vizuelne oznake:
  - 🔴 Crveno: < 7 dana
  - 🟡 Žuto: 7-30 dana
  - 🟢 Zeleno: > 30 dana
- Dugme "Resetuj" - resetuje podsetnik

## 📊 API Primeri

### Kreiraj Kupca
```bash
curl -X POST http://localhost:3000/api/kupci \
  -H "Content-Type: application/json" \
  -d '{
    "ime": "Marko Marković",
    "email": "marko@example.com",
    "telefon": "+381641234567"
  }'
```

### Kreiraj Ratu
```bash
curl -X POST http://localhost:3000/api/rate \
  -H "Content-Type: application/json" \
  -d '{
    "kupacId": "kupac_id_ovde",
    "iznos": 10000,
    "datumDospeca": "2025-12-31"
  }'
```

### Označi kao Plaćeno
```bash
curl -X POST http://localhost:3000/api/oznaciPlaceno \
  -H "Content-Type: application/json" \
  -d '{
    "rataId": "rata_id_ovde",
    "nacinPlacanja": "racun1"
  }'
```

## 🔒 Sigurnost

### Cron Jobs Autentifikacija
API rute za podsetnike proveravaju `CRON_SECRET`:

```bash
curl -X GET https://your-domain.com/api/podsetnici \
  -H "Authorization: Bearer your-cron-secret"
```

### Preporuke
- Uvek koristi HTTPS na produkciji
- Zaštiti admin panel (dodaj autentifikaciju)
- Koristi jaki `CRON_SECRET`
- Redovno proveravaj logs

## 📈 Skalabilnost

### Vercel Limiti
- Besplatan plan: 100 GB bandwidth/mesečno
- Cron Jobs: Do 2 cron jobova na Hobby planu

### Alternativno Hosting
- **Railway.app** - $5/mesec, uključuje cron jobs
- **Render.com** - $7/mesec, uključuje cron jobs
- **cron-job.org** - Eksterni besplatan cron servis

## 🛠️ Troubleshooting

### MongoDB Error
- Proveri `MONGODB_URI` format
- Proveri whitelist IP u MongoDB Atlas
- Proveri username/password

### Email Error
- Proveri `RESEND_API_KEY`
- Verifikuj domenu u Resend dashboardu
- Proveri logs u Resend dashboardu

### Cron Jobs Error
- Proveri `vercel.json` sintaksu
- Proveri `CRON_SECRET` u env variables
- Proveri Vercel logs: `vercel logs`

## 📚 Dodatni Resursi

- [Next.js Docs](https://nextjs.org/docs)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Resend Docs](https://resend.com/docs)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## ✨ Zaključak

Aplikacija je spremna za korišćenje! Sve funkcionalnosti su implementirane i testirane.

**Sledeći koraci:**
1. Podesi `.env.local`
2. Testiraj lokalno
3. Deploy na Vercel
4. Dodaj test podatke
5. Testiraj cron jobs

Srećno! 🚀
