-- Dodaj polje za datum kada je kampanja zaustavljena
ALTER TABLE google_ads
ADD COLUMN IF NOT EXISTS datum_zaustavljanja DATE;

-- Komentar za objašnjenje polja
COMMENT ON COLUMN google_ads.datum_zaustavljanja IS 'Datum kada je kampanja pauzirana/zaustavljena';
