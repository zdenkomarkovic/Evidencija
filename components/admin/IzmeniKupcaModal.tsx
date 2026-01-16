'use client';

import { useState, useEffect } from 'react';

interface Kupac {
  _id: string;
  ime: string;
  firma?: string;
  email: string;
  email2?: string;
  telefon: string;
  telefon2?: string;
  nacinPlacanja?: 'fiskalni' | 'faktura';
  domen?: string;
}

interface IzmeniKupcaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  kupac: Kupac | null;
}

export default function IzmeniKupcaModal({
  isOpen,
  onClose,
  onSuccess,
  kupac,
}: IzmeniKupcaModalProps) {
  const [ime, setIme] = useState('');
  const [firma, setFirma] = useState('');
  const [email, setEmail] = useState('');
  const [email2, setEmail2] = useState('');
  const [telefon, setTelefon] = useState('');
  const [telefon2, setTelefon2] = useState('');
  const [nacinPlacanja, setNacinPlacanja] = useState<'fiskalni' | 'faktura'>('fiskalni');
  const [domen, setDomen] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (kupac) {
      setIme(kupac.ime);
      setFirma(kupac.firma || '');
      setEmail(kupac.email);
      setEmail2(kupac.email2 || '');
      setTelefon(kupac.telefon);
      setTelefon2(kupac.telefon2 || '');
      setNacinPlacanja(kupac.nacinPlacanja || 'fiskalni');
      setDomen(kupac.domen || '');
    }
  }, [kupac]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kupac) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/kupci/${kupac._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ime, firma, email, email2, telefon, telefon2, nacinPlacanja, domen }),
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
      setError(`Greška pri ažuriranju kupca: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !kupac) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Izmeni Kupca</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ime i Prezime
            </label>
            <input
              type="text"
              value={ime}
              onChange={(e) => setIme(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Marko Marković"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Firma (opciono)
            </label>
            <input
              type="text"
              value={firma}
              onChange={(e) => setFirma(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Naziv firme"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="marko@example.com"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email 2 (opciono)
            </label>
            <input
              type="email"
              value={email2}
              onChange={(e) => setEmail2(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="marko.drugi@example.com"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefon
            </label>
            <input
              type="tel"
              value={telefon}
              onChange={(e) => setTelefon(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="+381641234567"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefon 2 (opciono)
            </label>
            <input
              type="tel"
              value={telefon2}
              onChange={(e) => setTelefon2(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="+381641234567"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Način plaćanja
            </label>
            <div className="flex gap-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="nacinPlacanja"
                  value="fiskalni"
                  checked={nacinPlacanja === 'fiskalni'}
                  onChange={(e) => setNacinPlacanja(e.target.value as 'fiskalni' | 'faktura')}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Fiskalni</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="nacinPlacanja"
                  value="faktura"
                  checked={nacinPlacanja === 'faktura'}
                  onChange={(e) => setNacinPlacanja(e.target.value as 'fiskalni' | 'faktura')}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Faktura</span>
              </label>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Domen (opciono)
            </label>
            <input
              type="text"
              value={domen}
              onChange={(e) => setDomen(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="www.example.com"
            />
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
