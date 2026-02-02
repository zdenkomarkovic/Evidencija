-- Dodaj polje datum_placanja u google_ads tabelu (za osnovni period)
ALTER TABLE google_ads
ADD COLUMN IF NOT EXISTS datum_placanja DATE;

-- Dodaj polje datum_placanja u google_ads_nastavci tabelu (za nastavke)
ALTER TABLE google_ads_nastavci
ADD COLUMN IF NOT EXISTS datum_placanja DATE;

-- Komentar za objašnjenje polja
COMMENT ON COLUMN google_ads.datum_placanja IS 'Datum kada je osnovni period plaćen';
COMMENT ON COLUMN google_ads_nastavci.datum_placanja IS 'Datum kada je nastavak plaćen';
