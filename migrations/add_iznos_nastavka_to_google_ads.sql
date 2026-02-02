-- Migration: Dodaj polje 'iznos_nastavka' u google_ads tabelu
-- Datum: 2026-02-01
-- Opis: Iznos nastavka je default iznos koji se koristi za mesečne nastavke kampanje

-- Dodaj kolonu 'iznos_nastavka' u google_ads tabelu
ALTER TABLE google_ads
ADD COLUMN IF NOT EXISTS iznos_nastavka NUMERIC(10, 2);

-- Dodaj komentar na kolonu
COMMENT ON COLUMN google_ads.iznos_nastavka IS 'Default iznos za mesečne nastavke kampanje. Ako je NULL, koristi se osnovni iznos.';

-- Ažuriraj postojeće kampanje da koriste osnovni iznos kao default za nastavke
UPDATE google_ads
SET iznos_nastavka = iznos
WHERE iznos_nastavka IS NULL;
