'use client';

import { useState } from 'react';

interface Kupac {
  _id: string;
  ime: string;
}

interface DodajHostingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  kupci: Kupac[];
}

export default function DodajHostingModal({
  isOpen,
  onClose,
  onSuccess,
  kupci,
}: DodajHostingModalProps) {
  const [kupacId, setKupacId] = useState('');
  const [datumPocetka, setDatumPocetka] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Automatski izračunaj datum isteka (godinu dana nakon početka)
  const getDatumIsteka = () => {
    if (!datumPocetka) return '';
    const pocetakDate = new Date(datumPocetka);
    const istekDate = new Date(pocetakDate);
    istekDate.setFullYear(istekDate.getFullYear() + 1);
    return istekDate.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const datumIsteka = getDatumIsteka();

      const res = await fetch('/api/hosting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kupacId,
          datumPocetka,
          datumObnavljanja: datumIsteka,
        }),
      });

      if (res.ok) {
        setKupacId('');
        setDatumPocetka('');
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        setError(data.error || 'Greška pri kreiranju hosting zapisa');
      }
    } catch {
      setError('Greška pri kreiranju hosting zapisa');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Dodaj Novi Hosting</h2>

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
              Datum početka hostinga
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
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Datum isteka hostinga (automatski)
              </label>
              <input
                type="date"
                value={getDatumIsteka()}
                readOnly
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              />
              <p className="mt-1 text-sm text-gray-500">
                Hosting ističe tačno godinu dana nakon početka
              </p>
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
              {loading ? 'Kreiranje...' : 'Kreiraj'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
