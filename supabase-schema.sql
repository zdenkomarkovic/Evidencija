-- =====================================================
-- SUPABASE SQL ŠEMA
-- Migracija iz MongoDB u PostgreSQL
-- =====================================================

-- Omogući UUID ekstenziju
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABELA: kupci
-- =====================================================
CREATE TABLE IF NOT EXISTS kupci (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ime TEXT NOT NULL,
  firma TEXT,
  email TEXT NOT NULL,
  email2 TEXT,
  telefon TEXT NOT NULL,
  telefon2 TEXT,
  nacin_placanja TEXT NOT NULL CHECK (nacin_placanja IN ('fiskalni', 'faktura')),
  domen TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index za email (često pretraživanje)
CREATE INDEX idx_kupci_email ON kupci(email);

-- =====================================================
-- TABELA: rate
-- =====================================================
CREATE TABLE IF NOT EXISTS rate (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kupac_id UUID NOT NULL REFERENCES kupci(id) ON DELETE CASCADE,
  iznos NUMERIC(10, 2) NOT NULL CHECK (iznos >= 0),
  datum_dospeca TIMESTAMP WITH TIME ZONE NOT NULL,
  placeno BOOLEAN DEFAULT FALSE,
  datum_placanja TIMESTAMP WITH TIME ZONE,
  nacin_placanja TEXT CHECK (nacin_placanja IN ('racun1', 'racun2', 'manual')),
  podsetnik_poslat BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes za brže pretraživanje
CREATE INDEX idx_rate_kupac_id ON rate(kupac_id);
CREATE INDEX idx_rate_datum_dospeca ON rate(datum_dospeca);
CREATE INDEX idx_rate_placeno ON rate(placeno);
CREATE INDEX idx_rate_placeno_datum ON rate(placeno, datum_dospeca);

-- =====================================================
-- TABELA: hosting
-- =====================================================
CREATE TABLE IF NOT EXISTS hosting (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kupac_id UUID NOT NULL REFERENCES kupci(id) ON DELETE CASCADE,
  datum_pocetka TIMESTAMP WITH TIME ZONE NOT NULL,
  datum_obnavljanja TIMESTAMP WITH TIME ZONE NOT NULL,
  podsetnik_poslat BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes za brže pretraživanje
CREATE INDEX idx_hosting_kupac_id ON hosting(kupac_id);
CREATE INDEX idx_hosting_datum_obnavljanja ON hosting(datum_obnavljanja);

-- =====================================================
-- TABELA: google_ads
-- =====================================================
CREATE TABLE IF NOT EXISTS google_ads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kupac_id UUID NOT NULL REFERENCES kupci(id) ON DELETE CASCADE,
  ime_kampanje TEXT NOT NULL,
  ime_google_naloga TEXT NOT NULL,
  datum_pocetka TIMESTAMP WITH TIME ZONE NOT NULL,
  datum_isteka TIMESTAMP WITH TIME ZONE NOT NULL,
  iznos NUMERIC(10, 2) NOT NULL CHECK (iznos >= 0),
  placeno BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes za brže pretraživanje
CREATE INDEX idx_google_ads_kupac_id ON google_ads(kupac_id);
CREATE INDEX idx_google_ads_datum_isteka ON google_ads(datum_isteka);

-- =====================================================
-- TABELA: google_ads_nastavci
-- (MongoDB nested documents → PostgreSQL odvojena tabela)
-- =====================================================
CREATE TABLE IF NOT EXISTS google_ads_nastavci (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  google_ads_id UUID NOT NULL REFERENCES google_ads(id) ON DELETE CASCADE,
  datum TIMESTAMP WITH TIME ZONE NOT NULL,
  iznos NUMERIC(10, 2) NOT NULL CHECK (iznos >= 0),
  placeno BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index za povezivanje sa google_ads
CREATE INDEX idx_google_ads_nastavci_google_ads_id ON google_ads_nastavci(google_ads_id);

-- =====================================================
-- FUNKCIJA: Auto-update updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger za auto-update updated_at na svim tabelama
CREATE TRIGGER update_kupci_updated_at BEFORE UPDATE ON kupci
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rate_updated_at BEFORE UPDATE ON rate
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hosting_updated_at BEFORE UPDATE ON hosting
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_google_ads_updated_at BEFORE UPDATE ON google_ads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) - Opciono
-- Trenutno isključeno za testiranje, ali može se aktivirati kasnije
-- =====================================================

-- Omogući RLS (zakomentarisano za sada)
-- ALTER TABLE kupci ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE rate ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE hosting ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE google_ads ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE google_ads_nastavci ENABLE ROW LEVEL SECURITY;

-- Primer policy (zakomentarisano)
-- CREATE POLICY "Enable read access for authenticated users" ON kupci
--     FOR SELECT USING (auth.role() = 'authenticated');

-- =====================================================
-- MAPPING TABELA (MongoDB ObjectId → Supabase UUID)
-- Ova tabela čuva mapiranje između starih MongoDB ID-eva i novih UUID-eva
-- Korisna za debugging i eventualne buduće migracije
-- =====================================================
CREATE TABLE IF NOT EXISTS id_mapping (
  mongodb_id TEXT PRIMARY KEY,
  supabase_id UUID NOT NULL,
  collection_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_id_mapping_supabase_id ON id_mapping(supabase_id);
CREATE INDEX idx_id_mapping_collection ON id_mapping(collection_name);

-- =====================================================
-- STATISTIKA FUNCIJA
-- Helper funkcija za prikaz statistike podataka
-- =====================================================
CREATE OR REPLACE FUNCTION get_database_stats()
RETURNS TABLE (
  tabela TEXT,
  broj_zapisa BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 'kupci'::TEXT, COUNT(*)::BIGINT FROM kupci
  UNION ALL
  SELECT 'rate'::TEXT, COUNT(*)::BIGINT FROM rate
  UNION ALL
  SELECT 'hosting'::TEXT, COUNT(*)::BIGINT FROM hosting
  UNION ALL
  SELECT 'google_ads'::TEXT, COUNT(*)::BIGINT FROM google_ads
  UNION ALL
  SELECT 'google_ads_nastavci'::TEXT, COUNT(*)::BIGINT FROM google_ads_nastavci;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- KOMANDE ZA TESTIRANJE
-- =====================================================

-- Prikaži statistiku
-- SELECT * FROM get_database_stats();

-- Proveri kupce
-- SELECT * FROM kupci LIMIT 5;

-- Proveri rate sa join-om na kupce
-- SELECT r.*, k.ime AS kupac_ime FROM rate r
-- LEFT JOIN kupci k ON r.kupac_id = k.id
-- LIMIT 5;

-- Proveri google ads sa nastavcima
-- SELECT ga.*, gan.* FROM google_ads ga
-- LEFT JOIN google_ads_nastavci gan ON ga.id = gan.google_ads_id
-- LIMIT 5;
