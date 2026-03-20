-- =====================================================
-- MIGRACIJA: Katalog usluga/proizvoda za fakturisanje
-- =====================================================

CREATE TABLE IF NOT EXISTS katalog_usluga (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  naziv TEXT NOT NULL,
  jedinica_mere TEXT NOT NULL DEFAULT 'usl',
  cena NUMERIC(10, 2) NOT NULL DEFAULT 0,
  ima_rok_trajanja BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
