-- Migration: Dodaj polje 'datum_primene_iznosa_nastavka' u google_ads tabelu
-- Datum: 2026-02-01
-- Opis: Omogućava postavljanje datuma od kada će se primenjivati novi iznos nastavka

-- Dodaj kolonu 'datum_primene_iznosa_nastavka'
ALTER TABLE google_ads
ADD COLUMN IF NOT EXISTS datum_primene_iznosa_nastavka DATE;

-- Dodaj komentar
COMMENT ON COLUMN google_ads.datum_primene_iznosa_nastavka IS 'Datum od kada se primenjuje iznos_nastavka. Ako je NULL, odmah se primenjuje.';
