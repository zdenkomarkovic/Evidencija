-- Migration: Dodaj polje 'aktivna' u google_ads tabelu
-- Datum: 2026-02-01
-- Opis: Kampanje su po defaultu aktivne i automatski se produžavaju.
--       Polje 'aktivna' omogućava eksplicitno stopiranje kampanje.

-- Dodaj kolonu 'aktivna' u google_ads tabelu
ALTER TABLE google_ads
ADD COLUMN IF NOT EXISTS aktivna BOOLEAN DEFAULT TRUE;

-- Index za brže filtriranje po aktivnim kampanjama
CREATE INDEX IF NOT EXISTS idx_google_ads_aktivna ON google_ads(aktivna);

-- Dodaj komentar na kolonu
COMMENT ON COLUMN google_ads.aktivna IS 'Označava da li je kampanja aktivna. Po defaultu TRUE - kampanje se automatski produžavaju mesečno dok se ne stopiraju.';
