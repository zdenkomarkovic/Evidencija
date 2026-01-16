'use client';

import { useEffect, useState } from 'react';

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
  arhiviran?: boolean;
}

interface Rata {
  _id: string;
  kupacId: string;
  iznos: number;
  datumDospeca: string;
  placeno: boolean;
  datumPlacanja: string | null;
  nacinPlacanja: string | null;
  podsetnikPoslat: boolean;
}

interface Hosting {
  _id: string;
  kupacId: string;
  datumPocetka: string;
  datumObnavljanja: string;
  podsetnikPoslat: boolean;
}

interface Nastavak {
  datum: string;
  iznos: number;
  placeno: boolean;
}

interface GoogleAds {
  _id: string;
  kupacId: string;
  imeKampanje: string;
  imeGoogleNaloga: string;
  datumPocetka: string;
  datumIsteka: string;
  iznos: number;
  placeno: boolean;
  nastavci: Nastavak[];
}

interface KupacDetaljiModalProps {
  isOpen: boolean;
  onClose: () => void;
  kupac: Kupac | null;
  onArhiviraj?: (kupacId: string, arhiviran: boolean) => void;
}

export default function KupacDetaljiModal({
  isOpen,
  onClose,
  kupac,
  onArhiviraj,
}: KupacDetaljiModalProps) {
  const [rate, setRate] = useState<Rata[]>([]);
  const [hosting, setHosting] = useState<Hosting[]>([]);
  const [googleAds, setGoogleAds] = useState<GoogleAds[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (kupac && isOpen) {
      ucitajPodatkeKupca();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kupac, isOpen]);

  const ucitajPodatkeKupca = async () => {
    if (!kupac) return;

    setLoading(true);
    try {
      const [rateRes, hostingRes, googleAdsRes] = await Promise.all([
        fetch(`/api/rate?kupacId=${kupac._id}`),
        fetch(`/api/hosting?kupacId=${kupac._id}`),
        fetch(`/api/google-ads?kupacId=${kupac._id}`),
      ]);

      const rateData = await rateRes.json();
      const hostingData = await hostingRes.json();
      const googleAdsData = await googleAdsRes.json();

      setRate(Array.isArray(rateData) ? rateData : []);
      setHosting(Array.isArray(hostingData) ? hostingData : []);
      setGoogleAds(Array.isArray(googleAdsData) ? googleAdsData : []);
    } catch (error) {
      console.error('Greška pri učitavanju podataka kupca:', error);
      setRate([]);
      setHosting([]);
      setGoogleAds([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDatum = (datum: string) => {
    return new Date(datum).toLocaleDateString('sr-RS', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatNacinPlacanja = (nacin: string) => {
    switch (nacin) {
      case 'racun1':
        return 'Račun 1';
      case 'racun2':
        return 'Račun 2';
      case 'manual':
        return 'Manual';
      default:
        return nacin;
    }
  };

  if (!isOpen || !kupac) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{kupac.ime}</h2>
            {kupac.firma && <p className="text-lg text-gray-600 mt-1">{kupac.firma}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Osnovni podaci o kupcu */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Kontakt Informacije</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="font-medium text-gray-700">Email:</span>{' '}
              <a
                href={`mailto:${kupac.email}`}
                className="text-indigo-600 hover:text-indigo-900 hover:underline"
              >
                {kupac.email}
              </a>
            </div>
            {kupac.email2 && (
              <div>
                <span className="font-medium text-gray-700">Email 2:</span>{' '}
                <a
                  href={`mailto:${kupac.email2}`}
                  className="text-indigo-600 hover:text-indigo-900 hover:underline"
                >
                  {kupac.email2}
                </a>
              </div>
            )}
            <div>
              <span className="font-medium text-gray-700">Telefon:</span>{' '}
              <span className="text-gray-900">{kupac.telefon}</span>
              <div className="inline-flex gap-2 ml-3">
                <a
                  href={`tel:${kupac.telefon}`}
                  className="text-xs px-2 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded"
                  title="Pozovi"
                >
                  📞 Pozovi
                </a>
                <a
                  href={`viber://chat?number=${kupac.telefon.replace(/\s/g, '')}`}
                  className="text-xs px-2 py-1 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded"
                  title="Viber"
                >
                  Viber
                </a>
              </div>
            </div>
            {kupac.telefon2 && (
              <div>
                <span className="font-medium text-gray-700">Telefon 2:</span>{' '}
                <span className="text-gray-900">{kupac.telefon2}</span>
                <div className="inline-flex gap-2 ml-3">
                  <a
                    href={`tel:${kupac.telefon2}`}
                    className="text-xs px-2 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded"
                    title="Pozovi"
                  >
                    📞 Pozovi
                  </a>
                  <a
                    href={`viber://chat?number=${kupac.telefon2.replace(/\s/g, '')}`}
                    className="text-xs px-2 py-1 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded"
                    title="Viber"
                  >
                    Viber
                  </a>
                </div>
              </div>
            )}
            <div>
              <span className="font-medium text-gray-700">Način plaćanja:</span>{' '}
              <span className="text-gray-900 capitalize">{kupac.nacinPlacanja}</span>
            </div>
            {kupac.domen && (
              <div>
                <span className="font-medium text-gray-700">Domen:</span>{' '}
                <a
                  href={kupac.domen.startsWith('http') ? kupac.domen : `https://${kupac.domen}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-900 hover:underline"
                >
                  {kupac.domen}
                </a>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-600">Učitavanje podataka...</div>
        ) : (
          <>
            {/* Rate */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Rate ({rate.length})
              </h3>
              {rate.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Iznos
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Datum dospeća
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Datum plaćanja
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Način plaćanja
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {rate.map((rata) => (
                        <tr key={rata._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-semibold text-gray-900">
                            {rata.iznos.toLocaleString('sr-RS')} RSD
                          </td>
                          <td className="px-4 py-3 text-gray-900">
                            {formatDatum(rata.datumDospeca)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                rata.placeno
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {rata.placeno ? 'Plaćeno' : 'Neplaćeno'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-900">
                            {rata.datumPlacanja ? formatDatum(rata.datumPlacanja) : '-'}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {rata.nacinPlacanja ? formatNacinPlacanja(rata.nacinPlacanja) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Nema rata za ovog kupca</p>
              )}
            </div>

            {/* Hosting */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Hosting ({hosting.length})
              </h3>
              {hosting.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Datum početka
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Datum obnavljanja
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Podsetnik
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {hosting.map((host) => (
                        <tr key={host._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-900">
                            {formatDatum(host.datumPocetka)}
                          </td>
                          <td className="px-4 py-3 text-gray-900">
                            {formatDatum(host.datumObnavljanja)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                host.podsetnikPoslat
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {host.podsetnikPoslat ? 'Poslat' : 'Nije poslat'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Nema hosting zapisa za ovog kupca</p>
              )}
            </div>

            {/* Google Ads */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Google Ads Kampanje ({googleAds.length})
              </h3>
              {googleAds.length > 0 ? (
                <div className="space-y-4">
                  {googleAds.map((kampanja) => (
                    <div key={kampanja._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{kampanja.imeKampanje}</h4>
                          <p className="text-sm text-gray-600">{kampanja.imeGoogleNaloga}</p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            kampanja.placeno
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {kampanja.placeno ? 'Plaćeno' : 'Neplaćeno'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                        <div>
                          <span className="font-medium text-gray-700">Iznos:</span>{' '}
                          <span className="text-gray-900">
                            {kampanja.iznos.toLocaleString('sr-RS')} RSD
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Početak:</span>{' '}
                          <span className="text-gray-900">{formatDatum(kampanja.datumPocetka)}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Istek:</span>{' '}
                          <span className="text-gray-900">{formatDatum(kampanja.datumIsteka)}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Nastavci:</span>{' '}
                          <span className="text-gray-900">{kampanja.nastavci.length}</span>
                        </div>
                      </div>
                      {kampanja.nastavci.length > 0 && (
                        <div className="mt-3 pl-4 border-l-2 border-gray-200">
                          <h5 className="text-xs font-semibold text-gray-700 uppercase mb-2">
                            Nastavci
                          </h5>
                          <div className="space-y-2">
                            {kampanja.nastavci.map((nastavak, index) => (
                              <div
                                key={index}
                                className="flex justify-between items-center text-sm"
                              >
                                <div>
                                  <span className="text-gray-700">
                                    {formatDatum(nastavak.datum)}
                                  </span>
                                  {' - '}
                                  <span className="font-semibold text-gray-900">
                                    {nastavak.iznos.toLocaleString('sr-RS')} RSD
                                  </span>
                                </div>
                                <span
                                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                    nastavak.placeno
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {nastavak.placeno ? 'Plaćeno' : 'Neplaćeno'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Nema Google Ads kampanja za ovog kupca</p>
              )}
            </div>
          </>
        )}

        <div className="mt-6 flex justify-between items-center">
          {/* Dugme za arhiviranje */}
          {onArhiviraj && (
            <button
              onClick={() => onArhiviraj(kupac._id, !kupac.arhiviran)}
              className={`px-6 py-2 rounded-lg transition-colors font-semibold ${
                kupac.arhiviran
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {kupac.arhiviran ? '✓ Vrati u Aktivne' : '🗄️ Arhiviraj Kupca'}
            </button>
          )}

          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Zatvori
          </button>
        </div>
      </div>
    </div>
  );
}
