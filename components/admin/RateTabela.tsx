'use client';

import { useState } from 'react';

interface Kupac {
  _id: string;
  ime: string;
  email: string;
}

interface Rata {
  _id: string;
  kupacId: Kupac;
  iznos: number;
  datumDospeca: string;
  placeno: boolean;
  datumPlacanja: string | null;
  nacinPlacanja: string | null;
  podsetnikPoslat: boolean;
}

interface RateTabelaProps {
  rate: Rata[];
  onOznaciPlaceno: (rataId: string) => void;
  onResetujPodsetnik: (rataId: string) => void;
  onEdit: (rata: Rata) => void;
  onDelete: (rataId: string) => void;
  onKupacKlik?: (kupacId: string) => void;
}

export default function RateTabela({
  rate,
  onOznaciPlaceno,
  onResetujPodsetnik,
  onEdit,
  onDelete,
  onKupacKlik,
}: RateTabelaProps) {
  const danas = new Date();
  const [filter, setFilter] = useState<'sve' | 'neplacene' | 'placene'>('neplacene');
  const [pretraga, setPretraga] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRataId, setSelectedRataId] = useState<string | null>(null);
  const [datumPlacanja, setDatumPlacanja] = useState(new Date().toISOString().split('T')[0]);

  // Paginacija po mesecima
  const [izabraniMesec, setIzabraniMesec] = useState(danas.getMonth()); // 0-11
  const [izabranaGodina, setIzabranaGodina] = useState(danas.getFullYear());

  const meseci = [
    'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun',
    'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'
  ];

  // Navigacija meseci
  const prethodniMesec = () => {
    if (izabraniMesec === 0) {
      setIzabraniMesec(11);
      setIzabranaGodina(izabranaGodina - 1);
    } else {
      setIzabraniMesec(izabraniMesec - 1);
    }
  };

  const sledeciMesec = () => {
    if (izabraniMesec === 11) {
      setIzabraniMesec(0);
      setIzabranaGodina(izabranaGodina + 1);
    } else {
      setIzabraniMesec(izabraniMesec + 1);
    }
  };

  const filtriraneRate = rate
    .filter((rata) => {
      if (filter === 'neplacene') return !rata.placeno;
      if (filter === 'placene') return rata.placeno;
      return true;
    })
    .filter((rata) =>
      rata.kupacId?.ime?.toLowerCase().includes(pretraga.toLowerCase())
    )
    .filter((rata) => {
      // Filtriranje po izabranom mesecu i godini
      const datumDospeca = new Date(rata.datumDospeca);
      return datumDospeca.getMonth() === izabraniMesec &&
             datumDospeca.getFullYear() === izabranaGodina;
    });

  const formatDatum = (datum: string) => {
    return new Date(datum).toLocaleDateString('sr-RS', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const jeDospela = (datum: string) => {
    return new Date(datum) < new Date();
  };

  const handleOznaciPlaceno = (rataId: string) => {
    setSelectedRataId(rataId);
    setDatumPlacanja(new Date().toISOString().split('T')[0]);
    setModalOpen(true);
  };

  const handlePotvrdiPlacanje = async () => {
    if (!selectedRataId) return;

    try {
      const res = await fetch('/api/oznaciPlaceno', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rataId: selectedRataId,
          nacinPlacanja: 'manual',
          datumPlacanja,
        }),
      });

      if (res.ok) {
        onOznaciPlaceno(selectedRataId);
        setModalOpen(false);
        setSelectedRataId(null);
      }
    } catch (error) {
      console.error('Greška pri označavanju rate kao plaćene:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Rate</h2>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <input
              type="text"
              placeholder="Pretraži po kupcu..."
              value={pretraga}
              onChange={(e) => setPretraga(e.target.value)}
              className="w-full sm:flex-1 lg:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'sve' | 'neplacene' | 'placene')}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="sve">Sve rate</option>
              <option value="neplacene">Neplaćene</option>
              <option value="placene">Plaćene</option>
            </select>
          </div>
        </div>
      </div>

      {/* Paginacija po mesecima */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <div className="flex flex-col sm:flex-row sm:justify-center sm:items-center gap-3 sm:gap-4">
          <button
            onClick={prethodniMesec}
            className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-sm sm:text-base"
          >
            ← Prethodni
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            <select
              value={izabraniMesec}
              onChange={(e) => setIzabraniMesec(Number(e.target.value))}
              className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-sm sm:text-base"
            >
              {meseci.map((mesec, index) => (
                <option key={index} value={index}>
                  {mesec}
                </option>
              ))}
            </select>

            <select
              value={izabranaGodina}
              onChange={(e) => setIzabranaGodina(Number(e.target.value))}
              className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-sm sm:text-base"
            >
              {[...Array(5)].map((_, i) => {
                const godina = danas.getFullYear() - 2 + i;
                return (
                  <option key={godina} value={godina}>
                    {godina}
                  </option>
                );
              })}
            </select>
          </div>

          <button
            onClick={sledeciMesec}
            className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-sm sm:text-base"
          >
            Sledeći →
          </button>
        </div>

        <div className="mt-3 text-center text-sm text-gray-600">
          Prikazano: <span className="font-bold text-gray-900">{filtriraneRate.length}</span> rata
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Br.
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kupac
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Iznos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Datum dospeća
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Datum plaćanja
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Način plaćanja
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Podsetnik
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Akcije
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtriraneRate.map((rata, index) => (
              <tr
                key={rata._id}
                className={`hover:bg-gray-50 transition-colors ${
                  !rata.placeno && jeDospela(rata.datumDospeca)
                    ? 'bg-red-50'
                    : ''
                }`}
              >
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-600">
                    {index + 1}.
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div
                    className={`text-sm font-medium text-gray-900 ${
                      onKupacKlik && rata.kupacId?._id ? 'cursor-pointer hover:text-indigo-600 hover:underline' : ''
                    }`}
                    onClick={() => {
                      if (onKupacKlik && rata.kupacId?._id) {
                        onKupacKlik(rata.kupacId._id);
                      }
                    }}
                  >
                    {rata.kupacId?.ime || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">
                    {rata.iznos.toLocaleString('sr-RS')} RSD
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatDatum(rata.datumDospeca)}
                    {!rata.placeno && jeDospela(rata.datumDospeca) && (
                      <span className="ml-2 text-xs text-red-600 font-semibold">
                        Dospela!
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      rata.placeno
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {rata.placeno ? 'Plaćeno' : 'Neplaćeno'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {rata.datumPlacanja ? formatDatum(rata.datumPlacanja) : '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {rata.nacinPlacanja || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      rata.podsetnikPoslat
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {rata.podsetnikPoslat ? 'Poslat' : 'Nije poslat'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2 flex-wrap">
                    {!rata.placeno && (
                      <button
                        onClick={() => handleOznaciPlaceno(rata._id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Plaćeno
                      </button>
                    )}
                    {rata.podsetnikPoslat && (
                      <button
                        onClick={() => onResetujPodsetnik(rata._id)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Resetuj
                      </button>
                    )}
                    <button
                      onClick={() => onEdit(rata)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Izmeni
                    </button>
                    <button
                      onClick={() => onDelete(rata._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Obriši
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtriraneRate.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nema rata za prikaz
          </div>
        )}
      </div>

      {/* Modal za unos datuma plaćanja */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4 text-gray-900">Označi kao plaćeno</h3>
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
            <div className="flex gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Otkaži
              </button>
              <button
                onClick={handlePotvrdiPlacanje}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Potvrdi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
