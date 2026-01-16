-- Fix SQL šeme - Omogući NULL vrednosti za polja koja nisu uvek popunjena
-- Pokreni ovu skriptu u Supabase SQL Editor-u

-- 1. Dozvoli NULL za nacin_placanja u kupci tabeli
ALTER TABLE kupci ALTER COLUMN nacin_placanja DROP NOT NULL;

-- 2. Dozvoli NULL za datum_pocetka u hosting tabeli
ALTER TABLE hosting ALTER COLUMN datum_pocetka DROP NOT NULL;

-- 3. (Opciono) Postavi default vrednost za nacin_placanja
-- ALTER TABLE kupci ALTER COLUMN nacin_placanja SET DEFAULT 'fiskalni';

-- Provera
SELECT
  'kupci' AS tabela,
  column_name,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'kupci' AND column_name = 'nacin_placanja'
UNION ALL
SELECT
  'hosting' AS tabela,
  column_name,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'hosting' AND column_name = 'datum_pocetka';
