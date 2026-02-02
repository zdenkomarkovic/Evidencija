'use client';

import { useState } from 'react';

interface ToggleAktivnaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (datum: string | null) => void;
  trenutnoAktivna: boolean;
  imeKampanje: string;
}

export default function ToggleAktivnaModal({
  isOpen,
  onClose,
  onConfirm,
  trenutnoAktivna,
  imeKampanje,
}: ToggleAktivnaModalProps) {
  const [datum, setDatum] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(trenutnoAktivna ? datum : datum);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4 text-gray-900">
          {trenutnoAktivna ? '⏸️ Zaustavi kampanju' : '▶️ Aktiviraj kampanju'}
        </h2>

        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800 font-medium">{imeKampanje}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {trenutnoAktivna
                ? 'Datum zaustavljanja kampanje'
                : 'Datum ponovnog pokretanja kampanje'}
            </label>
            <input
              type="date"
              value={datum}
              onChange={(e) => setDatum(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="mt-2 text-xs text-gray-500">
              {trenutnoAktivna
                ? 'Kampanja će biti pauzirana od ovog datuma. Klijent neće biti naplaćen za periode kada kampanja nije aktivna.'
                : 'Kampanja će biti ponovo pokrenuta od ovog datuma. Novi nastavci će početi od ovog datuma.'}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Otkaži
            </button>
            <button
              type="submit"
              className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${
                trenutnoAktivna
                  ? 'bg-orange-600 hover:bg-orange-700'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {trenutnoAktivna ? 'Zaustavi' : 'Aktiviraj'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
