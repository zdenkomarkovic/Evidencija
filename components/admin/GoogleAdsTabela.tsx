'use client';

import { useState, useEffect } from 'react';
import OznaciPlacenoModal from './OznaciPlacenoModal';
import PonistiPlacenoModal from './PonistiPlacenoModal';
import ToggleAktivnaModal from './ToggleAktivnaModal';

interface Kupac {
  _id: string;
  ime: string;
  email: string;
  nacinPlacanja?: string | null;
}

function borderKupca(nacinPlacanja?: string | null) {
  if (nacinPlacanja === 'faktura') return 'border-l-4 border-l-green-400';
  if (nacinPlacanja === 'kes') return 'border-l-4 border-l-amber-400';
  return 'border-l-4 border-l-blue-300';
}

interface Nastavak {
  _id?: string;
  datum: string;
  iznos: number;
  placeno: boolean;
  datumPlacanja?: string | null;
}

interface GoogleAds {
  _id: string;
  kupacId: Kupac;
  imeKampanje: string;
  imeGoogleNaloga: string;
  datumPocetka: string;
  datumIsteka: string;
  iznos: number;
  iznosNastavka: number;
  datumPrimeneIznosaNavstavka: string | null;
  placeno: boolean;
  datumPlacanja: string | null;
  aktivna: boolean;
  datumZaustavljanja: string | null;
  datumPonovnogPokretanja: string | null;
  nastavci: Nastavak[];
  podsetnik7Poslat?: boolean;
  podsetnik1Poslat?: boolean;
}

interface GoogleAdsTabelaProps {
  kampanje: GoogleAds[];
  onEdit: (kampanja: GoogleAds) => void;
  onDelete: (kampanjaId: string) => void;
  onOznaciPlacenoOsnovni: (kampanjaId: string, datumPlacanja?: string) => void;
  onOznaciPlacenoNastavak: (kampanjaId: string, nastavakId: string | null, datumPocetka: string, iznos: number, datumPlacanja?: string) => void;
  onPonistiPlacenoOsnovni: (kampanjaId: string) => void;
  onPonistiPlacenoNastavak: (kampanjaId: string, nastavakId: string) => void;
  onToggleAktivna: (kampanjaId: string, aktivna: boolean, datum?: string) => void;
  onKupacKlik?: (kupacId: string) => void;
}

export default function GoogleAdsTabela({
  kampanje,
  onEdit,
  onDelete,
  onOznaciPlacenoOsnovni,
  onOznaciPlacenoNastavak,
  onPonistiPlacenoOsnovni,
  onPonistiPlacenoNastavak,
  onToggleAktivna,
  onKupacKlik,
}: GoogleAdsTabelaProps) {
  const [pretraga, setPretraga] = useState('');
  const [filterStatus, setFilterStatus] = useState<'sve' | 'aktivne' | 'neaktivne'>('aktivne');
  const [placenoModalOpen, setPlacenoModalOpen] = useState(false);
  const [pendingPlaceno, setPendingPlaceno] = useState<{
    tip: 'osnovni' | 'nastavak';
    kampanjaId: string;
    nastavakId?: string | null;
    datumPocetka?: string;
    iznos?: number;
    naslov: string;
  } | null>(null);
  const [ponistiModalOpen, setPonistiModalOpen] = useState(false);
  const [pendingPonisti, setPendingPonisti] = useState<{
    tip: 'osnovni' | 'nastavak';
    kampanjaId: string;
    nastavakId?: string;
    naslov: string;
  } | null>(null);
  const [toggleAktivnaModalOpen, setToggleAktivnaModalOpen] = useState(false);
  const [pendingToggle, setPendingToggle] = useState<{
    kampanjaId: string;
    trenutnoAktivna: boolean;
    imeKampanje: string;
  } | null>(null);

  // Trenutni mesec kao default
  const getTrenutniMesec = () => {
    const danas = new Date();
    return `${danas.getFullYear()}-${String(danas.getMonth() + 1).padStart(2, '0')}`;
  };

  const [izabraniMesec, setIzabraniMesec] = useState<string>(getTrenutniMesec());

  // Filter kampanja po pretrazi i statusu
  const filtriraneKampanje = kampanje
    .filter((k) =>
      k.kupacId?.ime?.toLowerCase().includes(pretraga.toLowerCase()) ||
      k.imeKampanje?.toLowerCase().includes(pretraga.toLowerCase()) ||
      k.imeGoogleNaloga?.toLowerCase().includes(pretraga.toLowerCase())
    )
    .filter((k) => {
      if (filterStatus === 'sve') return true;
      if (filterStatus === 'aktivne') return k.aktivna === true;
      if (filterStatus === 'neaktivne') return k.aktivna === false;
      return true;
    });

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

  // Funkcija koja proverava da li je kampanja bila aktivna u datom mesecu
  const jeKampanjaAktivnaUMesecu = (kampanja: GoogleAds, mesecKey: string) => {
    const [godina, mesec] = mesecKey.split('-').map(Number);
    const pocetakMeseca = new Date(godina, mesec - 1, 1);
    const krajMeseca = new Date(godina, mesec, 0, 23, 59, 59);

    const pocetakKampanje = new Date(kampanja.datumPocetka);
    const danas = new Date();

    // Osnovno pravilo: kampanja se prikazuje od početka pa na dalje
    const osnovnoPravilo = pocetakKampanje <= krajMeseca && pocetakMeseca <= danas;
    if (!osnovnoPravilo) return false;

    // Proveri da li je mesec u periodu pauze
    if (kampanja.datumZaustavljanja && kampanja.datumPonovnogPokretanja) {
      // Kampanja ima i datum zaustavljanja i datum ponovnog pokretanja
      const datumZaustavljanja = new Date(kampanja.datumZaustavljanja);
      const datumPonovnogPokretanja = new Date(kampanja.datumPonovnogPokretanja);

      // Normalizuj datume da porede samo godine i mesece
      datumZaustavljanja.setDate(1);
      datumZaustavljanja.setHours(0, 0, 0, 0);
      datumPonovnogPokretanja.setDate(1);
      datumPonovnogPokretanja.setHours(0, 0, 0, 0);
      pocetakMeseca.setHours(0, 0, 0, 0);

      // Ako je mesec u periodu pauze (od zaustavljanja do ponovnog pokretanja)
      if (pocetakMeseca >= datumZaustavljanja && pocetakMeseca < datumPonovnogPokretanja) {
        return false; // Ne prikazuj mesece u periodu pauze
      }

      // Mesec je van periode pauze, prikaži ga
      return true;
    }

    if (kampanja.datumZaustavljanja && !kampanja.aktivna) {
      // Kampanja je zaustavljena i još nije ponovo pokrenuta
      const datumZaustavljanja = new Date(kampanja.datumZaustavljanja);
      datumZaustavljanja.setDate(1);
      datumZaustavljanja.setHours(0, 0, 0, 0);
      pocetakMeseca.setHours(0, 0, 0, 0);

      // Ne prikazuj mesece od datuma zaustavljanja pa nadalje
      if (pocetakMeseca >= datumZaustavljanja) {
        return false;
      }
    }

    // Ako nema pauze ili je sve OK, prikaži
    return true;
  };

  // Generisanje liste svih mogućih meseci (od najranije kampanje do trenutnog meseca)
  const generisiListuMeseci = () => {
    if (filtriraneKampanje.length === 0) return [];

    // Nađi najraniji datum početka kampanje
    const najranijiDatum = filtriraneKampanje.reduce((min, kampanja) => {
      const datum = new Date(kampanja.datumPocetka);
      return datum < min ? datum : min;
    }, new Date(filtriraneKampanje[0].datumPocetka));

    const danas = new Date();
    const meseci: string[] = [];

    // Od najranijeg datuma početka do trenutnog meseca
    const pocetak = new Date(najranijiDatum.getFullYear(), najranijiDatum.getMonth(), 1);
    const kraj = new Date(danas.getFullYear(), danas.getMonth(), 1);

    // eslint-disable-next-line prefer-const
    let trenutniMesec = new Date(pocetak);
    while (trenutniMesec <= kraj) {
      const mesecKey = `${trenutniMesec.getFullYear()}-${String(trenutniMesec.getMonth() + 1).padStart(2, '0')}`;
      meseci.push(mesecKey);
      trenutniMesec.setMonth(trenutniMesec.getMonth() + 1);
    }

    return meseci;
  };

  const sviMeseci = generisiListuMeseci();

  // Grupisanje kampanja po mesecima
  const kampanjePoMesecima = sviMeseci.reduce((acc, mesecKey) => {
    const kampanjeUMesecu = filtriraneKampanje.filter(k => jeKampanjaAktivnaUMesecu(k, mesecKey));

    if (kampanjeUMesecu.length > 0) {
      const [godina, mesec] = mesecKey.split('-').map(Number);
      const datum = new Date(godina, mesec - 1, 1);
      const mesecNaziv = datum.toLocaleDateString('sr-RS', { month: 'long', year: 'numeric' });

      acc[mesecKey] = {
        naziv: mesecNaziv,
        kampanje: kampanjeUMesecu
      };
    }

    return acc;
  }, {} as Record<string, { naziv: string; kampanje: GoogleAds[] }>);

  // Lista dostupnih meseci (koji imaju kampanje)
  const dostupniMeseci = Object.keys(kampanjePoMesecima).sort((a, b) => a.localeCompare(b));

  // Ako izabrani mesec nije u listi dostupnih, postavi na trenutni mesec
  useEffect(() => {
    if (dostupniMeseci.length > 0 && !dostupniMeseci.includes(izabraniMesec)) {
      const trenutniMesec = getTrenutniMesec();
      const najbliziMesec = dostupniMeseci.find(m => m >= trenutniMesec) || dostupniMeseci[dostupniMeseci.length - 1];
      setIzabraniMesec(najbliziMesec);
    }
  }, [dostupniMeseci, izabraniMesec]);

  // Vraća bazni datum za "buduci" period: kraj poslednjeg nastavka pre datog meseca,
  // ili datum_isteka kampanje ako nema nastavaka pre tog meseca.
  const getBazuZaBuduci = (kampanja: GoogleAds, mesecKey: string): Date => {
    const istekKampanje = new Date(kampanja.datumIsteka);
    if (!kampanja.nastavci || kampanja.nastavci.length === 0) return istekKampanje;

    const nastavciPre = kampanja.nastavci
      .filter(n => {
        const pn = new Date(n.datum);
        const mn = `${pn.getFullYear()}-${String(pn.getMonth() + 1).padStart(2, '0')}`;
        return mn < mesecKey;
      })
      .sort((a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime());

    if (nastavciPre.length === 0) return istekKampanje;

    const posledni = new Date(nastavciPre[0].datum);
    const krajPoslednjeg = new Date(posledni);
    krajPoslednjeg.setMonth(posledni.getMonth() + 1);
    return krajPoslednjeg;
  };

  // Filter po izabranom mesecu i sortiranje po datumu pocetka perioda u aktuelnom mesecu
  const konacneKampanje = [...(kampanjePoMesecima[izabraniMesec]?.kampanje || [])].sort((a, b) => {
    // Funkcija koja vraća datum početka perioda za datu kampanju u izabranom mesecu
    const getPeriodStartDate = (kampanja: GoogleAds) => {
      const pocetakKampanje = new Date(kampanja.datumPocetka);
      const mesecPocetkaKampanje = `${pocetakKampanje.getFullYear()}-${String(pocetakKampanje.getMonth() + 1).padStart(2, '0')}`;

      // Ako je ovo mesec kada je kampanja počela, koristi datum početka kampanje
      if (izabraniMesec === mesecPocetkaKampanje) {
        return pocetakKampanje.getTime();
      }

      // Proveri da li postoji nastavak za ovaj mesec
      if (kampanja.nastavci && kampanja.nastavci.length > 0) {
        for (const nastavak of kampanja.nastavci) {
          const pocetakNastavka = new Date(nastavak.datum);
          const mesecNastavka = `${pocetakNastavka.getFullYear()}-${String(pocetakNastavka.getMonth() + 1).padStart(2, '0')}`;

          if (izabraniMesec === mesecNastavka) {
            return pocetakNastavka.getTime();
          }
        }
      }

      // Ako nema nastavka, izračunaj datum budućeg perioda od kraja poslednjeg nastavka
      const baza = getBazuZaBuduci(kampanja, izabraniMesec);
      const [godina, mesec] = izabraniMesec.split('-').map(Number);
      const meseciBrojac = (godina - baza.getFullYear()) * 12 + (mesec - 1 - baza.getMonth());
      const pocetakNovogPerioda = new Date(baza);
      pocetakNovogPerioda.setMonth(baza.getMonth() + meseciBrojac);

      return pocetakNovogPerioda.getTime();
    };

    const dateA = getPeriodStartDate(a);
    const dateB = getPeriodStartDate(b);
    return dateA - dateB;
  });

  // Navigacija između meseci
  const getMesecNaziv = (mesecKey: string) => {
    const [godina, mesec] = mesecKey.split('-');
    const datum = new Date(parseInt(godina), parseInt(mesec) - 1, 1);
    return datum.toLocaleDateString('sr-RS', { month: 'long', year: 'numeric' });
  };

  const idiNaPrethodniMesec = () => {
    const trenutniIndex = dostupniMeseci.indexOf(izabraniMesec);
    if (trenutniIndex > 0) {
      setIzabraniMesec(dostupniMeseci[trenutniIndex - 1]);
    }
  };

  const idiNaSldeciMesec = () => {
    const trenutniIndex = dostupniMeseci.indexOf(izabraniMesec);
    if (trenutniIndex < dostupniMeseci.length - 1) {
      setIzabraniMesec(dostupniMeseci[trenutniIndex + 1]);
    }
  };

  const jePrviMesec = dostupniMeseci.indexOf(izabraniMesec) === 0;
  const jePosledniMesec = dostupniMeseci.indexOf(izabraniMesec) === dostupniMeseci.length - 1;

  const handleConfirmPlaceno = (datumPlacanja: string) => {
    if (!pendingPlaceno) return;

    if (pendingPlaceno.tip === 'osnovni') {
      onOznaciPlacenoOsnovni(pendingPlaceno.kampanjaId, datumPlacanja);
    } else {
      onOznaciPlacenoNastavak(
        pendingPlaceno.kampanjaId,
        pendingPlaceno.nastavakId || null,
        pendingPlaceno.datumPocetka || '',
        pendingPlaceno.iznos || 0,
        datumPlacanja
      );
    }

    setPendingPlaceno(null);
  };

  const handleConfirmPonisti = () => {
    if (!pendingPonisti) return;

    if (pendingPonisti.tip === 'osnovni') {
      onPonistiPlacenoOsnovni(pendingPonisti.kampanjaId);
    } else if (pendingPonisti.nastavakId) {
      onPonistiPlacenoNastavak(pendingPonisti.kampanjaId, pendingPonisti.nastavakId);
    }

    setPendingPonisti(null);
  };

  const handleConfirmToggle = (datum: string | null) => {
    if (!pendingToggle) return;

    onToggleAktivna(pendingToggle.kampanjaId, !pendingToggle.trenutnoAktivna, datum || undefined);
    setPendingToggle(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Google Ads Kampanje</h2>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <input
              type="text"
              placeholder="Pretraži kampanje..."
              value={pretraga}
              onChange={(e) => setPretraga(e.target.value)}
              className="w-full sm:flex-1 lg:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'sve' | 'aktivne' | 'neaktivne')}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="aktivne">Aktivne kampanje</option>
              <option value="neaktivne">Neaktivne kampanje</option>
              <option value="sve">Sve kampanje</option>
            </select>
          </div>
        </div>
      </div>

      {/* Navigacija po mesecima */}
      {dostupniMeseci.length > 0 && (
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <button
              onClick={idiNaPrethodniMesec}
              disabled={jePrviMesec}
              className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
            >
              ← Prethodni mesec
            </button>
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
              <span className="text-base sm:text-lg font-semibold text-gray-700 capitalize">
                {getMesecNaziv(izabraniMesec)}
              </span>
              <select
                value={izabraniMesec}
                onChange={(e) => setIzabraniMesec(e.target.value)}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm sm:text-base"
              >
                {dostupniMeseci.map((mesec) => (
                  <option key={mesec} value={mesec}>
                    {getMesecNaziv(mesec)}
                  </option>
                ))}
              </select>
              <span className="text-xs sm:text-sm text-gray-500">
                ({konacneKampanje.length} {konacneKampanje.length === 1 ? 'kampanja' : 'kampanja'})
              </span>
            </div>
            <button
              onClick={idiNaSldeciMesec}
              disabled={jePosledniMesec}
              className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
            >
              Sledeći mesec →
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                #
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kupac
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kampanja / Nalog
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Period
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dana
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Iznos
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Podstn.
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Akcije
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {konacneKampanje.map((kampanja, index) => {
              // Izračunaj koji period je aktivan u izabranom mesecu
              const getPeriodZaMesec = () => {
                const [godina, mesec] = izabraniMesec.split('-').map(Number);

                const pocetakKampanje = new Date(kampanja.datumPocetka);

                // Osnovni period se prikazuje SAMO u kalendarskom mesecu kada je kampanja počela
                const mesecPocetkaKampanje = `${pocetakKampanje.getFullYear()}-${String(pocetakKampanje.getMonth() + 1).padStart(2, '0')}`;

                if (izabraniMesec === mesecPocetkaKampanje) {
                  return {
                    tip: 'osnovni',
                    iznos: kampanja.iznos,
                    placeno: kampanja.placeno,
                    datumPlacanja: kampanja.datumPlacanja,
                    datumPocetka: kampanja.datumPocetka,
                    datumIsteka: kampanja.datumIsteka,
                    nastavakId: null,
                    nastavakIndex: null
                  };
                }

                // Za sve ostale mesece, traži odgovarajući nastavak
                if (kampanja.nastavci && kampanja.nastavci.length > 0) {
                  for (let i = 0; i < kampanja.nastavci.length; i++) {
                    const nastavak = kampanja.nastavci[i];
                    const pocetakNastavka = new Date(nastavak.datum);
                    const mesecNastavka = `${pocetakNastavka.getFullYear()}-${String(pocetakNastavka.getMonth() + 1).padStart(2, '0')}`;

                    // Nastavak se prikazuje u kalendarskom mesecu kada počinje
                    if (izabraniMesec === mesecNastavka) {
                      const krajNastavka = new Date(pocetakNastavka);
                      krajNastavka.setMonth(krajNastavka.getMonth() + 1);

                      return {
                        tip: 'nastavak',
                        iznos: nastavak.iznos,
                        placeno: nastavak.placeno,
                        datumPlacanja: nastavak.datumPlacanja,
                        datumPocetka: nastavak.datum,
                        datumIsteka: krajNastavka.toISOString(),
                        nastavakId: nastavak._id || null,
                        nastavakIndex: i
                      };
                    }
                  }
                }

                // Ako nema nastavka za ovaj mesec, izračunaj period od kraja poslednjeg nastavka
                const baza = getBazuZaBuduci(kampanja, izabraniMesec);
                const meseciBrojac = (godina - baza.getFullYear()) * 12 + (mesec - 1 - baza.getMonth());

                const pocetakNovogPerioda = new Date(baza);
                pocetakNovogPerioda.setMonth(baza.getMonth() + meseciBrojac);

                const krajNovogPerioda = new Date(pocetakNovogPerioda);
                krajNovogPerioda.setMonth(krajNovogPerioda.getMonth() + 1);

                // Odredi koji iznos koristiti na osnovu datuma primene
                let iznosZaKoriscenje = kampanja.iznosNastavka;

                if (kampanja.datumPrimeneIznosaNavstavka) {
                  const datumPrimene = new Date(kampanja.datumPrimeneIznosaNavstavka);

                  // Ako period počinje pre datuma primene, koristi osnovni iznos
                  if (pocetakNovogPerioda < datumPrimene) {
                    iznosZaKoriscenje = kampanja.iznos;
                  }
                  // Inače koristi iznosNastavka (već postavljeno)
                }

                return {
                  tip: 'buduci',
                  iznos: iznosZaKoriscenje,
                  placeno: false,
                  datumPlacanja: null,
                  datumPocetka: pocetakNovogPerioda.toISOString(),
                  datumIsteka: krajNovogPerioda.toISOString(),
                  nastavakId: null,
                  nastavakIndex: null
                };
              };

              const period = getPeriodZaMesec();
              const dana = preostaloDana(period.datumIsteka);

              // Za buduće periode, računaj dane do početka
              const danaDoPocetka = () => {
                if (period.tip !== 'buduci') return null;
                const danas = new Date();
                danas.setHours(0, 0, 0, 0);
                const pocetakDate = new Date(period.datumPocetka);
                pocetakDate.setHours(0, 0, 0, 0);
                const razlika = pocetakDate.getTime() - danas.getTime();
                return Math.ceil(razlika / (1000 * 60 * 60 * 24));
              };

              const danaDoPocetkaValue = danaDoPocetka();

              // Proveri da li ima neplaćenih prethodnih perioda
              const imaNeplacenePrethodnePeriode = () => {
                // Proveri osnovni period
                const pocetakKampanje = new Date(kampanja.datumPocetka);
                const mesecPocetkaKampanje = `${pocetakKampanje.getFullYear()}-${String(pocetakKampanje.getMonth() + 1).padStart(2, '0')}`;

                // Ako osnovni period počinje pre trenutnog meseca i nije plaćen
                if (mesecPocetkaKampanje < izabraniMesec && !kampanja.placeno) {
                  return true;
                }

                // Proveri nastavke
                if (kampanja.nastavci && kampanja.nastavci.length > 0) {
                  for (const nastavak of kampanja.nastavci) {
                    const pocetakNastavka = new Date(nastavak.datum);
                    const mesecNastavka = `${pocetakNastavka.getFullYear()}-${String(pocetakNastavka.getMonth() + 1).padStart(2, '0')}`;

                    // Ako nastavak počinje pre trenutnog meseca i nije plaćen
                    if (mesecNastavka < izabraniMesec && !nastavak.placeno) {
                      return true;
                    }
                  }
                }

                return false;
              };

              const imaNeplacene = imaNeplacenePrethodnePeriode();

              return (
                <tr
                  key={`${kampanja._id}-${izabraniMesec}`}
                  className={`hover:bg-gray-50 transition-colors ${
                    imaNeplacene
                      ? 'bg-red-50'
                      : !kampanja.aktivna
                      ? 'bg-gray-100 opacity-75'
                      : !period.placeno && dana < 0
                      ? 'bg-red-100'
                      : !period.placeno && dana <= 7
                      ? 'bg-red-50'
                      : !period.placeno && dana <= 14
                      ? 'bg-yellow-50'
                      : ''
                  }`}
                >
                  <td className={`px-2 py-2 whitespace-nowrap ${borderKupca(kampanja.kupacId?.nacinPlacanja)}`}>
                    <div className="text-sm text-gray-500">{index + 1}</div>
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap">
                    {imaNeplacene && (
                      <div className="mb-1">
                        <span className="px-1.5 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded">
                          ⚠️ Prethodni nije plaćen
                        </span>
                      </div>
                    )}
                    <div
                      className={`text-sm font-medium text-gray-900 ${
                        onKupacKlik && kampanja.kupacId?._id ? 'cursor-pointer hover:text-indigo-600 hover:underline' : ''
                      }`}
                      onClick={() => { if (onKupacKlik && kampanja.kupacId?._id) onKupacKlik(kampanja.kupacId._id); }}
                    >
                      {kampanja.kupacId?.ime || 'N/A'}
                    </div>
                    {kampanja.kupacId?.email && (
                      <a href={`mailto:${kampanja.kupacId.email}`} className="text-xs text-indigo-600 hover:underline">
                        {kampanja.kupacId.email}
                      </a>
                    )}
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-1 flex-wrap">
                      <div className="text-sm font-semibold text-gray-900">{kampanja.imeKampanje}</div>
                      <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${kampanja.aktivna ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {kampanja.aktivna ? 'Aktivna' : 'Stopirana'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">{kampanja.imeGoogleNaloga}</div>
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap">
                    <div className="text-xs text-gray-700">
                      {formatDatum(period.datumPocetka)}
                    </div>
                    <div className="text-xs text-gray-700">
                      {formatDatum(period.datumIsteka)}
                    </div>
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap">
                    {period.tip === 'buduci' ? (
                      <div className="text-xs font-semibold text-blue-600">
                        {danaDoPocetkaValue !== null && (
                          danaDoPocetkaValue > 0 ? `Za ${danaDoPocetkaValue}d` :
                          danaDoPocetkaValue === 0 ? 'Danas!' :
                          `Kasni ${Math.abs(danaDoPocetkaValue)}d`
                        )}
                      </div>
                    ) : (
                      <div className={`text-sm font-semibold ${getStatusColor(dana)}`}>
                        {dana < 0 ? `Isteklo ${Math.abs(dana)}d` : dana === 0 ? 'Danas!' : `${dana}d`}
                      </div>
                    )}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap">
                    <div className="text-xs font-semibold text-gray-900">
                      {period.iznos.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                    </div>
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap">
                    <div className="flex flex-col gap-0.5">
                      <span className={`px-1.5 py-0.5 inline-flex text-xs font-semibold rounded-full ${period.placeno ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {period.placeno ? 'Plaćeno' : 'Neplaćeno'}
                      </span>
                      {period.datumPlacanja && (
                        <div className="text-xs text-gray-400">{formatDatum(period.datumPlacanja)}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap">
                    <div className="flex gap-0.5 items-center">
                      {[
                        { label: '7', poslat: kampanja.podsetnik7Poslat, title: '7 dana pre' },
                        { label: '1', poslat: kampanja.podsetnik1Poslat, title: '1 dan pre'  },
                      ].map((p) => (
                        <span
                          key={p.label}
                          title={`Podsetnik ${p.title}: ${p.poslat ? 'poslat' : 'nije poslat'}`}
                          className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold transition-all ${
                            p.poslat ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-300'
                          }`}
                        >
                          {p.label}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs font-medium">
                    <div className="flex gap-1.5 flex-wrap">
                      {!period.placeno && (
                        <button
                          onClick={() => {
                            if (period.tip === 'osnovni') {
                              setPendingPlaceno({ tip: 'osnovni', kampanjaId: kampanja._id, naslov: `${kampanja.imeKampanje} (Osnovni)` });
                            } else {
                              setPendingPlaceno({ tip: 'nastavak', kampanjaId: kampanja._id, nastavakId: period.nastavakId, datumPocetka: period.datumPocetka, iznos: period.iznos, naslov: `${kampanja.imeKampanje} (Nastavak)` });
                            }
                            setPlacenoModalOpen(true);
                          }}
                          className="text-green-600 hover:text-green-900"
                        >
                          Plaćeno
                        </button>
                      )}
                      {period.placeno && (
                        <button
                          onClick={() => {
                            if (period.tip === 'osnovni') {
                              setPendingPonisti({ tip: 'osnovni', kampanjaId: kampanja._id, naslov: `${kampanja.imeKampanje} (Osnovni)` });
                            } else if (period.nastavakId) {
                              setPendingPonisti({ tip: 'nastavak', kampanjaId: kampanja._id, nastavakId: period.nastavakId, naslov: `${kampanja.imeKampanje} (Nastavak)` });
                            }
                            setPonistiModalOpen(true);
                          }}
                          className="text-orange-600 hover:text-orange-900"
                        >
                          Poništi
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setPendingToggle({ kampanjaId: kampanja._id, trenutnoAktivna: kampanja.aktivna, imeKampanje: kampanja.imeKampanje });
                          setToggleAktivnaModalOpen(true);
                        }}
                        className={kampanja.aktivna ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'}
                      >
                        {kampanja.aktivna ? 'Stopiraj' : 'Aktiviraj'}
                      </button>
                      <button onClick={() => onEdit(kampanja)} className="text-blue-600 hover:text-blue-900">Izmeni</button>
                      <button onClick={() => onDelete(kampanja._id)} className="text-red-600 hover:text-red-900">Obriši</button>
                    </div>
                  </td>
                  </tr>
              );
            })}
          </tbody>
        </table>

        {/* Legenda za upozorenja */}
        {konacneKampanje.some((k) => {
          const pocetakKampanje = new Date(k.datumPocetka);
          const mesecPocetkaKampanje = `${pocetakKampanje.getFullYear()}-${String(pocetakKampanje.getMonth() + 1).padStart(2, '0')}`;

          if (mesecPocetkaKampanje < izabraniMesec && !k.placeno) return true;

          if (k.nastavci && k.nastavci.length > 0) {
            for (const nastavak of k.nastavci) {
              const pocetakNastavka = new Date(nastavak.datum);
              const mesecNastavka = `${pocetakNastavka.getFullYear()}-${String(pocetakNastavka.getMonth() + 1).padStart(2, '0')}`;
              if (mesecNastavka < izabraniMesec && !nastavak.placeno) return true;
            }
          }
          return false;
        }) && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-red-800">
              <span className="font-bold">⚠️</span>
              <span className="font-medium">Upozorenje: Redovi sa crvenom oznakom imaju neplaćene prethodne periode</span>
            </div>
          </div>
        )}

        {konacneKampanje.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nema Google Ads kampanja za prikaz
          </div>
        )}

        {/* Zbir iznosa */}
        {konacneKampanje.length > 0 && (() => {
          let ukupno = 0;
          let neplaceno = 0;

          konacneKampanje.forEach((kampanja) => {
            const pocetakKampanje = new Date(kampanja.datumPocetka);
            const mesecPocetkaKampanje = `${pocetakKampanje.getFullYear()}-${String(pocetakKampanje.getMonth() + 1).padStart(2, '0')}`;

            let iznos = 0;
            let placeno = false;

            if (izabraniMesec === mesecPocetkaKampanje) {
              iznos = kampanja.iznos;
              placeno = kampanja.placeno;
            } else if (kampanja.nastavci) {
              for (const nastavak of kampanja.nastavci) {
                const pocetakNastavka = new Date(nastavak.datum);
                const mesecNastavka = `${pocetakNastavka.getFullYear()}-${String(pocetakNastavka.getMonth() + 1).padStart(2, '0')}`;
                if (izabraniMesec === mesecNastavka) {
                  iznos = nastavak.iznos;
                  placeno = nastavak.placeno;
                  break;
                }
              }
            }

            if (!iznos) {
              const baza = getBazuZaBuduci(kampanja, izabraniMesec);
              const [godina, mesec] = izabraniMesec.split('-').map(Number);
              const meseciBrojac = (godina - baza.getFullYear()) * 12 + (mesec - 1 - baza.getMonth());
              const pocetakNovogPerioda = new Date(baza);
              pocetakNovogPerioda.setMonth(baza.getMonth() + meseciBrojac);

              let iznosZaKoriscenje = kampanja.iznosNastavka;
              if (kampanja.datumPrimeneIznosaNavstavka) {
                const datumPrimene = new Date(kampanja.datumPrimeneIznosaNavstavka);
                if (pocetakNovogPerioda < datumPrimene) {
                  iznosZaKoriscenje = kampanja.iznos;
                }
              }
              iznos = iznosZaKoriscenje;
              placeno = false;
            }

            ukupno += iznos;
            if (!placeno) {
              neplaceno += iznos;
            }
          });

          return (
            <div className="mt-4 p-4 bg-gray-50 border-t-2 border-gray-300 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700">
                  Ukupno ({konacneKampanje.length} {konacneKampanje.length === 1 ? 'kampanja' : 'kampanja'}):
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {ukupno.toLocaleString('sr-RS')} RSD
                </span>
              </div>
              {neplaceno > 0 && (
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm font-semibold text-red-700">
                    Neplaćeno:
                  </span>
                  <span className="text-lg font-bold text-red-600">
                    {neplaceno.toLocaleString('sr-RS')} RSD
                  </span>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      <OznaciPlacenoModal
        isOpen={placenoModalOpen}
        onClose={() => {
          setPlacenoModalOpen(false);
          setPendingPlaceno(null);
        }}
        onConfirm={handleConfirmPlaceno}
        naslov={pendingPlaceno?.naslov || 'Označi plaćeno'}
      />

      <PonistiPlacenoModal
        isOpen={ponistiModalOpen}
        onClose={() => {
          setPonistiModalOpen(false);
          setPendingPonisti(null);
        }}
        onConfirm={handleConfirmPonisti}
        naslov={pendingPonisti?.naslov || ''}
      />

      <ToggleAktivnaModal
        isOpen={toggleAktivnaModalOpen}
        onClose={() => {
          setToggleAktivnaModalOpen(false);
          setPendingToggle(null);
        }}
        onConfirm={handleConfirmToggle}
        trenutnoAktivna={pendingToggle?.trenutnoAktivna || false}
        imeKampanje={pendingToggle?.imeKampanje || ''}
      />
    </div>
  );
}
