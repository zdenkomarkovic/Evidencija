'use client';

import { useState } from 'react';

interface PonistiPlacenoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  naslov: string;
}

export default function PonistiPlacenoModal({
  isOpen,
  onClose,
  onConfirm,
  naslov,
}: PonistiPlacenoModalProps) {
  const [potvrdaTekst, setPotvrdaTekst] = useState('');
  const [greska, setGreska] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (potvrdaTekst.toUpperCase() !== 'POTVRDI') {
      setGreska('Morate upisati "POTVRDI" da biste nastavili');
      return;
    }

    onConfirm();
    setPotvrdaTekst('');
    setGreska('');
    onClose();
  };

  const handleClose = () => {
    setPotvrdaTekst('');
    setGreska('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4 text-red-900">⚠️ Poništi plaćanje</h2>

        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800 font-medium">{naslov}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Da biste poništili plaćanje, upišite: <span className="font-bold text-red-600">POTVRDI</span>
            </label>
            <input
              type="text"
              value={potvrdaTekst}
              onChange={(e) => {
                setPotvrdaTekst(e.target.value);
                setGreska('');
              }}
              placeholder="Upišite POTVRDI"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {greska && (
              <p className="mt-1 text-sm text-red-600">{greska}</p>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Ova akcija će označiti period kao neplaćen i obrisati datum plaćanja.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Otkaži
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Poništi plaćanje
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
