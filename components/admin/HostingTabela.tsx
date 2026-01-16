'use client';

import { useState } from 'react';

interface Kupac {
  _id: string;
  ime: string;
  email: string;
}

interface Hosting {
  _id: string;
  kupacId: Kupac;
  datumPocetka?: string;
  datumObnavljanja: string;
  podsetnikPoslat: boolean;
}

interface HostingTabelaProps {
  hosting: Hosting[];
  onResetujPodsetnik: (hostingId: string) => void;
  onEdit: (hosting: Hosting) => void;
  onDelete: (hostingId: string) => void;
  onKupacKlik?: (kupacId: string) => void;
}

export default function HostingTabela({
  hosting,
  onResetujPodsetnik,
  onEdit,
  onDelete,
  onKupacKlik,
}: HostingTabelaProps) {
  const [pretraga, setPretraga] = useState('');

  const filtriraniHosting = hosting.filter((h) =>
    h.kupacId?.ime?.toLowerCase().includes(pretraga.toLowerCase())
  );

  const formatDatum = (datum: string) => {
    return new Date(datum).toLocaleDateString('sr-RS', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const preostaloDana = (datum: string) => {
    const danas = new Date();
    danas.setHours(0, 0, 0, 0);
    const datumObnove = new Date(datum);
    datumObnove.setHours(0, 0, 0, 0);

    const razlika = datumObnove.getTime() - danas.getTime();
    const dana = Math.ceil(razlika / (1000 * 60 * 60 * 24));

    return dana;
  };

  const getStatusColor = (dana: number) => {
    if (dana < 0) return 'text-red-600 font-bold';
    if (dana <= 7) return 'text-red-600';
    if (dana <= 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Hosting</h2>
        <input
          type="text"
          placeholder="Pretraži po kupcu..."
          value={pretraga}
          onChange={(e) => setPretraga(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kupac
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Datum početka
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Datum isteka
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Preostalo dana
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
            {filtriraniHosting.map((h) => {
              const dana = preostaloDana(h.datumObnavljanja);

              return (
                <tr
                  key={h._id}
                  className={`hover:bg-gray-50 transition-colors ${
                    dana <= 7 ? 'bg-red-50' : dana <= 30 ? 'bg-yellow-50' : ''
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className={`text-sm font-medium text-gray-900 ${
                        onKupacKlik ? 'cursor-pointer hover:text-indigo-600 hover:underline' : ''
                      }`}
                      onClick={() => onKupacKlik && h.kupacId?._id && onKupacKlik(h.kupacId._id)}
                    >
                      {h.kupacId?.ime || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {h.kupacId?.email ? (
                      <a
                        href={`mailto:${h.kupacId.email}`}
                        className="text-sm text-indigo-600 hover:text-indigo-900 hover:underline"
                      >
                        {h.kupacId.email}
                      </a>
                    ) : (
                      <div className="text-sm text-gray-500">N/A</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {h.datumPocetka ? formatDatum(h.datumPocetka) : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDatum(h.datumObnavljanja)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-semibold ${getStatusColor(dana)}`}>
                      {dana < 0 ? (
                        <span>Isteklo pre {Math.abs(dana)} dana</span>
                      ) : dana === 0 ? (
                        <span>Ističe danas!</span>
                      ) : (
                        <span>{dana} dana</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        h.podsetnikPoslat
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {h.podsetnikPoslat ? 'Poslat' : 'Nije poslat'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2 flex-wrap">
                      {h.podsetnikPoslat && (
                        <button
                          onClick={() => onResetujPodsetnik(h._id)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Resetuj
                        </button>
                      )}
                      <button
                        onClick={() => onEdit(h)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Izmeni
                      </button>
                      <button
                        onClick={() => onDelete(h._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Obriši
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtriraniHosting.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nema hosting zapisa za prikaz
          </div>
        )}
      </div>
    </div>
  );
}
