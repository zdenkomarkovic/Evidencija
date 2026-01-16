-- Dodavanje polja arhiviran u tabelu kupci
ALTER TABLE kupci ADD COLUMN IF NOT EXISTS arhiviran BOOLEAN DEFAULT false;

-- Indeks za brže pretraživanje arhiviranih kupaca
CREATE INDEX IF NOT EXISTS idx_kupci_arhiviran ON kupci(arhiviran);
