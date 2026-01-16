'use client';

import { useState } from 'react';

interface Kupac {
  _id: string;
  ime: string;
}

interface Rata {
  iznos: string;
  datumDospeca: string;
}

interface DodajRatuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  kupci: Kupac[];
}

export default function DodajRatuModal({
  isOpen,
  onClose,
  onSuccess,
  kupci,
}: DodajRatuModalProps) {
  const [kupacId, setKupacId] = useState('');
  const [rate, setRate] = useState<Rata[]>([{ iznos: '', datumDospeca: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const dodajRatu = () => {
    setRate([...rate, { iznos: '', datumDospeca: '' }]);
  };

  const obrisiRatu = (index: number) => {
    if (rate.length > 1) {
      const noveRate = rate.filter((_, i) => i !== index);
      setRate(noveRate);
    }
  };

  const izmeniRatu = (index: number, field: 'iznos' | 'datumDospeca', value: string) => {
    const noveRate = [...rate];
    noveRate[index][field] = value;
    setRate(noveRate);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Kreiraj sve rate odjednom
      const promises = rate.map(rata =>
        fetch('/api/rate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            kupacId,
            iznos: parseFloat(rata.iznos),
            datumDospeca: rata.datumDospeca,
          }),
        })
      );

      const results = await Promise.all(promises);
      const failedRequests = results.filter(res => !res.ok);

      if (failedRequests.length === 0) {
        // Sve rate uspešno kreirane
        setKupacId('');
        setRate([{ iznos: '', datumDospeca: '' }]);
        onSuccess();
        onClose();
      } else {
        setError(`Greška pri kreiranju ${failedRequests.length} od ${rate.length} rata`);
      }
    } catch {
      setError('Greška pri kreiranju rata');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setKupacId('');
    setRate([{ iznos: '', datumDospeca: '' }]);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Dodaj Rate</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
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
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Rate
              </label>
              <button
                type="button"
                onClick={dodajRatu}
                className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-1"
              >
                <span className="text-lg">+</span>
                <span>Dodaj ratu</span>
              </button>
            </div>

            <div className="space-y-3">
              {rate.map((rata, index) => (
                <div key={index} className="flex gap-3 items-start p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Iznos (RSD)
                    </label>
                    <input
                      type="number"
                      value={rata.iznos}
                      onChange={(e) => izmeniRatu(index, 'iznos', e.target.value)}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="10000"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Datum dospeća
                    </label>
                    <input
                      type="date"
                      value={rata.datumDospeca}
                      onChange={(e) => izmeniRatu(index, 'datumDospeca', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  {rate.length > 1 && (
                    <button
                      type="button"
                      onClick={() => obrisiRatu(index)}
                      className="mt-6 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      title="Obriši ratu"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
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
              {loading ? 'Kreiranje...' : `Kreiraj ${rate.length} ${rate.length === 1 ? 'ratu' : 'rata'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
