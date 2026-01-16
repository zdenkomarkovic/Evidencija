'use client';

import { useState, useEffect } from 'react';

interface Kupac {
  _id: string;
  ime: string;
}

interface Rata {
  _id: string;
  kupacId: string | { _id: string; ime: string };
  iznos: number;
  datumDospeca: string;
  placeno: boolean;
  datumPlacanja: string | null;
  nacinPlacanja: string | null;
}

interface IzmeniRatuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  rata: Rata | null;
  kupci: Kupac[];
}

export default function IzmeniRatuModal({
  isOpen,
  onClose,
  onSuccess,
  rata,
  kupci,
}: IzmeniRatuModalProps) {
  const [kupacId, setKupacId] = useState('');
  const [iznos, setIznos] = useState('');
  const [datumDospeca, setDatumDospeca] = useState('');
  const [placeno, setPlaceno] = useState(false);
  const [datumPlacanja, setDatumPlacanja] = useState('');
  const [nacinPlacanja, setNacinPlacanja] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (rata) {
      const kupacIdValue = typeof rata.kupacId === 'string' ? rata.kupacId : rata.kupacId._id;
      setKupacId(kupacIdValue);
      setIznos(rata.iznos.toString());
      setDatumDospeca(new Date(rata.datumDospeca).toISOString().split('T')[0]);
      setPlaceno(rata.placeno);
      setDatumPlacanja(rata.datumPlacanja ? new Date(rata.datumPlacanja).toISOString().split('T')[0] : '');
      setNacinPlacanja(rata.nacinPlacanja || '');
    }
  }, [rata]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rata) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/rate/${rata._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kupacId,
          iznos: parseFloat(iznos),
          datumDospeca,
          placeno,
          datumPlacanja: datumPlacanja || null,
          nacinPlacanja: nacinPlacanja || null,
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
      setError(`Greška pri ažuriranju rate: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !rata) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Izmeni Ratu</h2>

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

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Datum dospeća
            </label>
            <input
              type="date"
              value={datumDospeca}
              onChange={(e) => setDatumDospeca(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="mb-4">
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

          {placeno && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Datum plaćanja
              </label>
              <input
                type="date"
                value={datumPlacanja}
                onChange={(e) => setDatumPlacanja(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          {placeno && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Način plaćanja
              </label>
              <select
                value={nacinPlacanja}
                onChange={(e) => setNacinPlacanja(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Izaberi...</option>
                <option value="racun1">Račun 1</option>
                <option value="racun2">Račun 2</option>
                <option value="manual">Manual</option>
              </select>
            </div>
          )}

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
