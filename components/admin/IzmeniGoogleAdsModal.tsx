'use client';

import { useState, useEffect } from 'react';

interface Kupac {
  _id: string;
  ime: string;
}

interface Nastavak {
  datum: string;
  iznos: number;
  placeno: boolean;
}

interface GoogleAds {
  _id: string;
  kupacId: string | { _id: string; ime: string };
  imeKampanje: string;
  imeGoogleNaloga: string;
  datumPocetka: string;
  datumIsteka: string;
  iznos: number;
  iznosNastavka: number;
  datumPrimeneIznosaNavstavka: string | null;
  placeno: boolean;
  aktivna: boolean;
  nastavci: Nastavak[];
}

interface IzmeniGoogleAdsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  kampanja: GoogleAds | null;
  kupci: Kupac[];
}

export default function IzmeniGoogleAdsModal({
  isOpen,
  onClose,
  onSuccess,
  kampanja,
  kupci,
}: IzmeniGoogleAdsModalProps) {
  const [kupacId, setKupacId] = useState('');
  const [imeKampanje, setImeKampanje] = useState('');
  const [imeGoogleNaloga, setImeGoogleNaloga] = useState('');
  const [datumPocetka, setDatumPocetka] = useState('');
  const [iznos, setIznos] = useState('');
  const [iznosNastavka, setIznosNastavka] = useState('');
  const [datumPrimene, setDatumPrimene] = useState('');
  const [placeno, setPlaceno] = useState(false);
  const [nastavci, setNastavci] = useState<Nastavak[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Automatski izračunaj datum isteka (mesec dana nakon početka)
  const getDatumIsteka = () => {
    if (!datumPocetka) return '';
    const pocetakDate = new Date(datumPocetka);
    const istekDate = new Date(pocetakDate);
    istekDate.setMonth(istekDate.getMonth() + 1);
    return istekDate.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (kampanja) {
      const kupacIdValue = typeof kampanja.kupacId === 'string' ? kampanja.kupacId : kampanja.kupacId._id;
      setKupacId(kupacIdValue);
      setImeKampanje(kampanja.imeKampanje);
      setImeGoogleNaloga(kampanja.imeGoogleNaloga);
      setDatumPocetka(new Date(kampanja.datumPocetka).toISOString().split('T')[0]);
      setIznos(kampanja.iznos.toString());
      setIznosNastavka(kampanja.iznosNastavka?.toString() || '');
      setDatumPrimene(kampanja.datumPrimeneIznosaNavstavka ? new Date(kampanja.datumPrimeneIznosaNavstavka).toISOString().split('T')[0] : '');
      setPlaceno(kampanja.placeno || false);
      setNastavci(kampanja.nastavci.map(n => ({
        datum: new Date(n.datum).toISOString().split('T')[0],
        iznos: n.iznos,
        placeno: n.placeno || false,
      })));
    }
  }, [kampanja]);

  const dodajNastavak = () => {
    const iznosZaNastavak = parseFloat(iznosNastavka) || parseFloat(iznos) || 0;
    const poslednji = nastavci.length > 0
      ? nastavci[nastavci.length - 1]
      : { datum: getDatumIsteka(), iznos: iznosZaNastavak, placeno: false };

    // Dodaj mesec dana na poslednji datum nastavka
    const datumNastavka = new Date(poslednji.datum);
    datumNastavka.setMonth(datumNastavka.getMonth() + 1);

    setNastavci([...nastavci, {
      datum: datumNastavka.toISOString().split('T')[0],
      iznos: iznosZaNastavak,
      placeno: false,
    }]);
  };

  const obrisiNastavak = (index: number) => {
    const noviNastavci = nastavci.filter((_, i) => i !== index);
    setNastavci(noviNastavci);
  };

  const izmeniNastavak = (index: number, field: 'datum' | 'iznos' | 'placeno', value: string | number | boolean) => {
    const noviNastavci = [...nastavci];
    if (field === 'datum') {
      noviNastavci[index].datum = value as string;
    } else if (field === 'iznos') {
      noviNastavci[index].iznos = parseFloat(value as string) || 0;
    } else if (field === 'placeno') {
      noviNastavci[index].placeno = value as boolean;
    }
    setNastavci(noviNastavci);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kampanja) return;

    setLoading(true);
    setError('');

    try {
      const datumIsteka = getDatumIsteka();

      const res = await fetch(`/api/google-ads/${kampanja._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kupacId,
          imeKampanje,
          imeGoogleNaloga,
          datumPocetka,
          datumIsteka,
          iznos: parseFloat(iznos),
          iznosNastavka: iznosNastavka ? parseFloat(iznosNastavka) : parseFloat(iznos),
          datumPrimeneIznosaNavstavka: datumPrimene || null,
          placeno,
          nastavci,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        console.error('API Error:', data);
        setError(data.error || `Greška: ${JSON.stringify(data)}`);
      }
    } catch (err) {
      console.error('Network Error:', err);
      setError(`Greška pri ažuriranju kampanje: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !kampanja) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Izmeni Google Ads Kampanju</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kupac
            </label>
            <select
              value={kupacId}
              onChange={(e) => setKupacId(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Izaberi kupca...</option>
              {kupci.map((kupac) => (
                <option key={kupac._id} value={kupac._id}>
                  {kupac.ime}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ime kampanje
            </label>
            <input
              type="text"
              value={imeKampanje}
              onChange={(e) => setImeKampanje(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Naziv kampanje"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ime Google naloga
            </label>
            <input
              type="text"
              value={imeGoogleNaloga}
              onChange={(e) => setImeGoogleNaloga(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Google nalog"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Datum početka kampanje
            </label>
            <input
              type="date"
              value={datumPocetka}
              onChange={(e) => setDatumPocetka(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {datumPocetka && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Datum isteka kampanje (automatski)
              </label>
              <input
                type="date"
                value={getDatumIsteka()}
                readOnly
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              />
              <p className="mt-1 text-sm text-gray-500">
                Kampanja traje tačno mesec dana
              </p>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Iznos prvog meseca (RSD)
            </label>
            <input
              type="number"
              value={iznos}
              onChange={(e) => setIznos(e.target.value)}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="10000"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Iznos za nastavak (mesečno) - RSD
            </label>
            <input
              type="number"
              value={iznosNastavka}
              onChange={(e) => setIznosNastavka(e.target.value)}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={iznos || "10000"}
            />
            <p className="mt-1 text-sm text-gray-500">
              Ako nije uneto, koristiće se isti iznos kao prvi mesec
            </p>
          </div>

          {iznosNastavka && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Datum primene novog iznosa (opciono)
              </label>
              <input
                type="date"
                value={datumPrimene}
                onChange={(e) => setDatumPrimene(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Od ovog datuma će se primenjivati novi iznos. Ako nije uneto, primenjuje se odmah.
              </p>
            </div>
          )}

          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={placeno}
                onChange={(e) => setPlaceno(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">Plaćeno</span>
            </label>
          </div>

          <div className="mb-6 border-t pt-6">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Nastavci kampanje
              </label>
              <button
                type="button"
                onClick={dodajNastavak}
                className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-1"
              >
                <span className="text-lg">+</span>
                <span>Dodaj nastavak</span>
              </button>
            </div>

            {nastavci.length > 0 && (
              <div className="space-y-3">
                {nastavci.map((nastavak, index) => (
                  <div key={index} className="flex gap-3 items-start p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Datum nastavka
                      </label>
                      <input
                        type="date"
                        value={nastavak.datum}
                        onChange={(e) => izmeniNastavak(index, 'datum', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Iznos (RSD)
                      </label>
                      <input
                        type="number"
                        value={nastavak.iznos}
                        onChange={(e) => izmeniNastavak(index, 'iznos', e.target.value)}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="10000"
                      />
                    </div>
                    <div className="mt-6">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={nastavak.placeno}
                          onChange={(e) => izmeniNastavak(index, 'placeno', e.target.checked)}
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-xs text-gray-700">Plaćeno</span>
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={() => obrisiNastavak(index)}
                      className="mt-6 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      title="Obriši nastavak"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {nastavci.length === 0 && (
              <p className="text-sm text-gray-500 italic">Nema nastavaka kampanje</p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Otkaži
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
            >
              {loading ? 'Čuvanje...' : 'Sačuvaj'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
