'use client';

import { useState } from 'react';

interface Kupac {
  _id: string;
  ime: string;
}

interface DodajGoogleAdsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  kupci: Kupac[];
}

export default function DodajGoogleAdsModal({
  isOpen,
  onClose,
  onSuccess,
  kupci,
}: DodajGoogleAdsModalProps) {
  const [kupacId, setKupacId] = useState('');
  const [imeKampanje, setImeKampanje] = useState('');
  const [imeGoogleNaloga, setImeGoogleNaloga] = useState('');
  const [datumPocetka, setDatumPocetka] = useState('');
  const [iznos, setIznos] = useState('');
  const [placeno, setPlaceno] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const datumIsteka = getDatumIsteka();

      const res = await fetch('/api/google-ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kupacId,
          imeKampanje,
          imeGoogleNaloga,
          datumPocetka,
          datumIsteka,
          iznos: parseFloat(iznos),
          placeno,
        }),
      });

      if (res.ok) {
        setKupacId('');
        setImeKampanje('');
        setImeGoogleNaloga('');
        setDatumPocetka('');
        setIznos('');
        setPlaceno(false);
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        setError(data.error || 'Greška pri kreiranju Google Ads kampanje');
      }
    } catch {
      setError('Greška pri kreiranju Google Ads kampanje');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Dodaj Google Ads Kampanju</h2>

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
              Iznos (RSD)
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
              {loading ? 'Kreiranje...' : 'Kreiraj'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
