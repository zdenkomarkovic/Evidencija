'use client';

import { useState } from 'react';

interface OznaciPlacenoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (datumPlacanja: string) => void;
  naslov: string;
}

export default function OznaciPlacenoModal({
  isOpen,
  onClose,
  onConfirm,
  naslov,
}: OznaciPlacenoModalProps) {
  const [datumPlacanja, setDatumPlacanja] = useState(
    new Date().toISOString().split('T')[0]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(datumPlacanja);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4 text-gray-900">{naslov}</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Datum plaćanja
            </label>
            <input
              type="date"
              value={datumPlacanja}
              onChange={(e) => setDatumPlacanja(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Izaberite datum kada je kampanja plaćena
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
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Potvrdi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
