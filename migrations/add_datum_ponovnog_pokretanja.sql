-- Dodaj polje za datum kada je kampanja ponovo pokrenuta
ALTER TABLE google_ads
ADD COLUMN IF NOT EXISTS datum_ponovnog_pokretanja DATE;

-- Komentar za objašnjenje polja
COMMENT ON COLUMN google_ads.datum_ponovnog_pokretanja IS 'Datum kada je kampanja ponovo pokrenuta nakon pauze';
