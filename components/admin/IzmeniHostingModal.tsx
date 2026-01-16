'use client';

import { useState, useEffect } from 'react';

interface Kupac {
  _id: string;
  ime: string;
}

interface Hosting {
  _id: string;
  kupacId: string | { _id: string; ime: string };
  datumPocetka?: string;
  datumObnavljanja: string;
}

interface IzmeniHostingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  hosting: Hosting | null;
  kupci: Kupac[];
}

export default function IzmeniHostingModal({
  isOpen,
  onClose,
  onSuccess,
  hosting,
  kupci,
}: IzmeniHostingModalProps) {
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

  useEffect(() => {
    if (hosting) {
      const kupacIdValue = typeof hosting.kupacId === 'string' ? hosting.kupacId : hosting.kupacId._id;
      setKupacId(kupacIdValue);

      // Ako datumPocetka postoji, koristi ga, inače izračunaj iz datuma isteka (godina dana unazad)
      if (hosting.datumPocetka) {
        setDatumPocetka(new Date(hosting.datumPocetka).toISOString().split('T')[0]);
      } else {
        // Izračunaj datum početka kao godinu dana pre isteka
        const datumIsteka = new Date(hosting.datumObnavljanja);
        const pocetakDate = new Date(datumIsteka);
        pocetakDate.setFullYear(pocetakDate.getFullYear() - 1);
        setDatumPocetka(pocetakDate.toISOString().split('T')[0]);
      }
    }
  }, [hosting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hosting) return;

    setLoading(true);
    setError('');

    try {
      const datumIsteka = getDatumIsteka();

      const res = await fetch(`/api/hosting/${hosting._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kupacId,
          datumPocetka,
          datumObnavljanja: datumIsteka,
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
      setError(`Greška pri ažuriranju hosting zapisa: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !hosting) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Izmeni Hosting</h2>

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
              {loading ? 'Čuvanje...' : 'Sačuvaj'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
