-- =====================================================
-- MIGRACIJA: Fakture za pravna lica
-- =====================================================

-- Dodavanje novih kolona u tabelu kupci (podaci za fakturisanje)
ALTER TABLE kupci ADD COLUMN IF NOT EXISTS pib TEXT;
ALTER TABLE kupci ADD COLUMN IF NOT EXISTS maticni_broj TEXT;
ALTER TABLE kupci ADD COLUMN IF NOT EXISTS adresa TEXT;
ALTER TABLE kupci ADD COLUMN IF NOT EXISTS grad TEXT;
ALTER TABLE kupci ADD COLUMN IF NOT EXISTS postanski_broj TEXT;

-- =====================================================
-- TABELA: fakture
-- =====================================================
CREATE TABLE IF NOT EXISTS fakture (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kupac_id UUID NOT NULL REFERENCES kupci(id) ON DELETE RESTRICT,
  broj_fakture TEXT NOT NULL UNIQUE,
  datum_izdavanja DATE NOT NULL,
  datum_valute DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'izdata' CHECK (status IN ('nacrt', 'izdata', 'placena', 'stornirana')),
  napomena TEXT,
  ukupan_iznos NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fakture_kupac_id ON fakture(kupac_id);
CREATE INDEX IF NOT EXISTS idx_fakture_datum_izdavanja ON fakture(datum_izdavanja);
CREATE INDEX IF NOT EXISTS idx_fakture_status ON fakture(status);

-- =====================================================
-- TABELA: fakture_stavke
-- =====================================================
CREATE TABLE IF NOT EXISTS fakture_stavke (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  faktura_id UUID NOT NULL REFERENCES fakture(id) ON DELETE CASCADE,
  naziv TEXT NOT NULL,
  jedinica_mere TEXT NOT NULL DEFAULT 'kom',
  kolicina NUMERIC(10, 3) NOT NULL DEFAULT 1,
  cena NUMERIC(10, 2) NOT NULL,
  iznos NUMERIC(10, 2) NOT NULL,
  redni_broj INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fakture_stavke_faktura_id ON fakture_stavke(faktura_id);

-- Trigger za auto-update updated_at
CREATE TRIGGER update_fakture_updated_at BEFORE UPDATE ON fakture
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
