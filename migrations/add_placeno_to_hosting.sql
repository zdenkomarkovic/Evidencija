-- Dodaj polja za plaćanje hostinga
ALTER TABLE hosting
ADD COLUMN IF NOT EXISTS placeno BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS datum_placanja DATE,
ADD COLUMN IF NOT EXISTS nacin_placanja VARCHAR(50);

-- Komentar za objašnjenje polja
COMMENT ON COLUMN hosting.placeno IS 'Da li je hosting plaćen';
COMMENT ON COLUMN hosting.datum_placanja IS 'Datum kada je hosting plaćen';
COMMENT ON COLUMN hosting.nacin_placanja IS 'Način plaćanja hostinga';
