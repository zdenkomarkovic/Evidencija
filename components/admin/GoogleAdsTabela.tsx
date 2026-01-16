'use client';

import { useState } from 'react';

interface Kupac {
  _id: string;
  ime: string;
  email: string;
}

interface Nastavak {
  datum: string;
  iznos: number;
  placeno: boolean;
}

interface GoogleAds {
  _id: string;
  kupacId: Kupac;
  imeKampanje: string;
  imeGoogleNaloga: string;
  datumPocetka: string;
  datumIsteka: string;
  iznos: number;
  placeno: boolean;
  nastavci: Nastavak[];
}

interface GoogleAdsTabelaProps {
  kampanje: GoogleAds[];
  onEdit: (kampanja: GoogleAds) => void;
  onDelete: (kampanjaId: string) => void;
  onOznaciPlacenoOsnovni: (kampanjaId: string) => void;
  onOznaciPlacenoNastavak: (kampanjaId: string, nastavakIndex: number) => void;
  onKupacKlik?: (kupacId: string) => void;
}

export default function GoogleAdsTabela({
  kampanje,
  onEdit,
  onDelete,
  onOznaciPlacenoOsnovni,
  onOznaciPlacenoNastavak,
  onKupacKlik,
}: GoogleAdsTabelaProps) {
  const [pretraga, setPretraga] = useState('');

  const filtriraneKampanje = kampanje.filter((k) =>
    k.kupacId?.ime?.toLowerCase().includes(pretraga.toLowerCase()) ||
    k.imeKampanje?.toLowerCase().includes(pretraga.toLowerCase()) ||
    k.imeGoogleNaloga?.toLowerCase().includes(pretraga.toLowerCase())
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
    const datumIsteka = new Date(datum);
    datumIsteka.setHours(0, 0, 0, 0);

    const razlika = datumIsteka.getTime() - danas.getTime();
    const dana = Math.ceil(razlika / (1000 * 60 * 60 * 24));

    return dana;
  };

  const getStatusColor = (dana: number) => {
    if (dana < 0) return 'text-red-600 font-bold';
    if (dana <= 7) return 'text-red-600';
    if (dana <= 14) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Google Ads Kampanje</h2>
        <input
          type="text"
          placeholder="Pretraži kampanje..."
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
                Kampanja / Google nalog
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Period
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Iznos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Akcije
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtriraneKampanje.map((kampanja) => {
              const dana = preostaloDana(kampanja.datumIsteka);

              return (
                <>
                  {/* Osnovni iznos */}
                  <tr
                    key={`${kampanja._id}-osnovni`}
                    className={`hover:bg-gray-50 transition-colors ${
                      dana <= 7 ? 'bg-red-50' : dana <= 14 ? 'bg-yellow-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap" rowSpan={1 + kampanja.nastavci.length}>
                      <div
                        className={`text-sm font-medium text-gray-900 ${
                          onKupacKlik ? 'cursor-pointer hover:text-indigo-600 hover:underline' : ''
                        }`}
                        onClick={() => onKupacKlik && kampanja.kupacId?._id && onKupacKlik(kampanja.kupacId._id)}
                      >
                        {kampanja.kupacId?.ime || 'N/A'}
                      </div>
                      {kampanja.kupacId?.email && (
                        <a
                          href={`mailto:${kampanja.kupacId.email}`}
                          className="text-sm text-indigo-600 hover:text-indigo-900 hover:underline"
                        >
                          {kampanja.kupacId.email}
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4" rowSpan={1 + kampanja.nastavci.length}>
                      <div className="text-sm font-semibold text-gray-900">{kampanja.imeKampanje}</div>
                      <div className="text-sm text-gray-500">{kampanja.imeGoogleNaloga}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDatum(kampanja.datumPocetka)} - {formatDatum(kampanja.datumIsteka)}
                      </div>
                      <div className={`text-xs font-semibold ${getStatusColor(dana)}`}>
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
                      <div className="text-sm font-semibold text-gray-900">
                        {kampanja.iznos.toLocaleString('sr-RS')} RSD
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            kampanja.placeno
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {kampanja.placeno ? 'Plaćeno' : 'Neplaćeno'}
                        </span>
                        {!kampanja.placeno && (
                          <button
                            onClick={() => onOznaciPlacenoOsnovni(kampanja._id)}
                            className="text-green-600 hover:text-green-900 text-xs"
                          >
                            Označi plaćeno
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" rowSpan={1 + kampanja.nastavci.length}>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => onEdit(kampanja)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Izmeni
                        </button>
                        <button
                          onClick={() => onDelete(kampanja._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Obriši
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Nastavci */}
                  {kampanja.nastavci.map((nastavak, index) => {
                    const datumNastavka = new Date(nastavak.datum);
                    const krajNastavka = new Date(datumNastavka);
                    krajNastavka.setMonth(krajNastavka.getMonth() + 1);
                    const danaNastavka = preostaloDana(krajNastavka.toISOString());

                    return (
                      <tr
                        key={`${kampanja._id}-nastavak-${index}`}
                        className={`hover:bg-gray-50 transition-colors ${
                          danaNastavka <= 7 ? 'bg-red-50' : danaNastavka <= 14 ? 'bg-yellow-50' : ''
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDatum(nastavak.datum)} - {formatDatum(krajNastavka.toISOString())}
                          </div>
                          <div className={`text-xs font-semibold ${getStatusColor(danaNastavka)}`}>
                            {danaNastavka < 0 ? (
                              <span>Isteklo pre {Math.abs(danaNastavka)} dana</span>
                            ) : danaNastavka === 0 ? (
                              <span>Ističe danas!</span>
                            ) : (
                              <span>{danaNastavka} dana</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {nastavak.iznos.toLocaleString('sr-RS')} RSD
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                nastavak.placeno
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {nastavak.placeno ? 'Plaćeno' : 'Neplaćeno'}
                            </span>
                            {!nastavak.placeno && (
                              <button
                                onClick={() => onOznaciPlacenoNastavak(kampanja._id, index)}
                                className="text-green-600 hover:text-green-900 text-xs"
                              >
                                Označi plaćeno
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </>
              );
            })}
          </tbody>
        </table>

        {filtriraneKampanje.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nema Google Ads kampanja za prikaz
          </div>
        )}
      </div>
    </div>
  );
}
