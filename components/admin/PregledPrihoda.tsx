'use client';

import { useState, useMemo } from 'react';

interface Rata {
  iznos: number;
  placeno: boolean;
  datumDospeca: string;
}

interface Hosting {
  iznos?: number;
  placeno: boolean;
  datumObnavljanja: string;
}

interface Nastavak {
  iznos: number;
  placeno: boolean;
  datum: string;
}

interface GoogleAds {
  iznos: number;
  iznosNastavka: number;
  datumPrimeneIznosaNavstavka: string | null;
  placeno: boolean;
  datumPocetka: string;
  datumIsteka: string;
  aktivna: boolean;
  datumZaustavljanja: string | null;
  datumPonovnogPokretanja: string | null;
  nastavci: Nastavak[];
}

interface PregledPrihodaProps {
  rate: Rata[];
  hosting: Hosting[];
  kampanje: GoogleAds[];
}

function formatRSD(iznos: number) {
  if (iznos === 0) return '—';
  return iznos.toLocaleString('sr-RS', { minimumFractionDigits: 2 }) + ' RSD';
}

function formatRSDNum(iznos: number) {
  return iznos.toLocaleString('sr-RS', { minimumFractionDigits: 2 }) + ' RSD';
}

const MESECI_FULL = ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun', 'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'];

// Ista logika kao u GoogleAdsTabela
function jeKampanjaAktivnaUMesecu(kampanja: GoogleAds, godina: number, mesecIdx: number): boolean {
  const pocetakMeseca = new Date(godina, mesecIdx, 1);
  const krajMeseca = new Date(godina, mesecIdx + 1, 0, 23, 59, 59);
  const pocetakKampanje = new Date(kampanja.datumPocetka);
  const danas = new Date();

  const osnovnoPravilo = pocetakKampanje <= krajMeseca && pocetakMeseca <= danas;
  if (!osnovnoPravilo) return false;

  const mesecKey = `${godina}-${String(mesecIdx + 1).padStart(2, '0')}`;

  if (kampanja.datumZaustavljanja && kampanja.datumPonovnogPokretanja) {
    const dz = new Date(kampanja.datumZaustavljanja);
    const dp = new Date(kampanja.datumPonovnogPokretanja);
    dz.setDate(1); dz.setHours(0, 0, 0, 0);
    dp.setDate(1); dp.setHours(0, 0, 0, 0);
    const pm = new Date(pocetakMeseca);
    pm.setHours(0, 0, 0, 0);
    if (pm >= dz && pm < dp) return false;
    return true;
  }

  if (kampanja.datumZaustavljanja && !kampanja.aktivna) {
    const dz = new Date(kampanja.datumZaustavljanja);
    dz.setDate(1); dz.setHours(0, 0, 0, 0);
    const pm = new Date(pocetakMeseca);
    pm.setHours(0, 0, 0, 0);
    if (pm >= dz) return false;
  }

  return true;
  void mesecKey;
}

function getBazuZaBuduci(kampanja: GoogleAds, mesecKey: string): Date {
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
}

// Vraća {iznos, placeno} za kampanju u datom mesecu — ista logika kao getPeriodZaMesec u tabeli
function getPeriodZaMesec(kampanja: GoogleAds, godina: number, mesecIdx: number): { iznos: number; placeno: boolean } | null {
  const mesecKey = `${godina}-${String(mesecIdx + 1).padStart(2, '0')}`;

  if (!jeKampanjaAktivnaUMesecu(kampanja, godina, mesecIdx)) return null;

  const pocetakKampanje = new Date(kampanja.datumPocetka);
  const mesecPocetka = `${pocetakKampanje.getFullYear()}-${String(pocetakKampanje.getMonth() + 1).padStart(2, '0')}`;

  // Osnovni period
  if (mesecKey === mesecPocetka) {
    return { iznos: kampanja.iznos, placeno: kampanja.placeno };
  }

  // Nastavak za ovaj mesec
  for (const n of kampanja.nastavci) {
    const pn = new Date(n.datum);
    const mn = `${pn.getFullYear()}-${String(pn.getMonth() + 1).padStart(2, '0')}`;
    if (mn === mesecKey) {
      return { iznos: n.iznos, placeno: n.placeno };
    }
  }

  // Buduci period — neplaćen, iznos se računa
  const baza = getBazuZaBuduci(kampanja, mesecKey);
  const meseciBrojac = (godina - baza.getFullYear()) * 12 + (mesecIdx - baza.getMonth());
  const pocetakNovog = new Date(baza);
  pocetakNovog.setMonth(baza.getMonth() + meseciBrojac);

  let iznosZaKoriscenje = kampanja.iznosNastavka;
  if (kampanja.datumPrimeneIznosaNavstavka) {
    const datumPrimene = new Date(kampanja.datumPrimeneIznosaNavstavka);
    if (pocetakNovog < datumPrimene) iznosZaKoriscenje = kampanja.iznos;
  }

  return { iznos: iznosZaKoriscenje, placeno: false };
}

export default function PregledPrihoda({ rate, hosting, kampanje }: PregledPrihodaProps) {
  const danas = new Date();

  const godine = useMemo(() => {
    const set = new Set<number>();
    set.add(danas.getFullYear());
    rate.forEach(r => set.add(new Date(r.datumDospeca).getFullYear()));
    hosting.forEach(h => set.add(new Date(h.datumObnavljanja).getFullYear()));
    kampanje.forEach(k => {
      set.add(new Date(k.datumPocetka).getFullYear());
      k.nastavci.forEach(n => set.add(new Date(n.datum).getFullYear()));
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [rate, hosting, kampanje]);

  const [godina, setGodina] = useState(danas.getFullYear());

  const mesecniPodaci = useMemo(() => {
    return MESECI_FULL.map((mesecNaziv, mesecIdx) => {
      const uMesecu = (datum: string) => {
        const d = new Date(datum);
        return d.getFullYear() === godina && d.getMonth() === mesecIdx;
      };

      const ratePlacene   = rate.filter(r =>  r.placeno && uMesecu(r.datumDospeca)).reduce((s, r) => s + r.iznos, 0);
      const rateNeplacene = rate.filter(r => !r.placeno && uMesecu(r.datumDospeca)).reduce((s, r) => s + r.iznos, 0);
      const hostPlacen    = hosting.filter(h =>  h.placeno && uMesecu(h.datumObnavljanja)).reduce((s, h) => s + (h.iznos || 0), 0);
      const hostNeplacen  = hosting.filter(h => !h.placeno && uMesecu(h.datumObnavljanja)).reduce((s, h) => s + (h.iznos || 0), 0);

      let gadsPlaceno = 0, gadsNeplaceno = 0;
      for (const k of kampanje) {
        const period = getPeriodZaMesec(k, godina, mesecIdx);
        if (!period) continue;
        if (period.placeno) gadsPlaceno += period.iznos;
        else gadsNeplaceno += period.iznos;
      }

      return {
        mesec: mesecNaziv,
        mesecIdx,
        ratePlacene, rateNeplacene,
        hostPlacen, hostNeplacen,
        gadsPlaceno, gadsNeplaceno,
        ukupnoPlaceno: ratePlacene + hostPlacen + gadsPlaceno,
        ukupnoNeplaceno: rateNeplacene + hostNeplacen + gadsNeplaceno,
      };
    });
  }, [rate, hosting, kampanje, godina]);

  const godisnjePlaceno  = mesecniPodaci.reduce((s, m) => s + m.ukupnoPlaceno, 0);
  const godisnjNeplaceno = mesecniPodaci.reduce((s, m) => s + m.ukupnoNeplaceno, 0);

  return (
    <div className="space-y-5">

      {/* Filter godine */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-gray-600">Godina:</span>
        {godine.map(g => (
          <button
            key={g}
            onClick={() => setGodina(g)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              godina === g ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Godišnji zbir */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1">Naplaćeno {godina}.</p>
          <p className="text-xl font-bold text-green-700">{formatRSDNum(godisnjePlaceno)}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-1">Otvoreno {godina}.</p>
          <p className="text-xl font-bold text-red-700">{formatRSDNum(godisnjNeplaceno)}</p>
        </div>
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">Ukupno {godina}.</p>
          <p className="text-xl font-bold text-indigo-700">{formatRSDNum(godisnjePlaceno + godisnjNeplaceno)}</p>
        </div>
      </div>

      {/* Mesečna tabela */}
      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Mesec</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-blue-500 uppercase" colSpan={2}>Rate</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-purple-500 uppercase" colSpan={2}>Hosting</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-cyan-600 uppercase" colSpan={2}>Google Ads</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-green-600 uppercase">Naplaćeno</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-red-500 uppercase">Otvoreno</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Ukupno</th>
            </tr>
            <tr className="bg-gray-50 border-b text-xs text-gray-400">
              <th className="px-4 py-1"></th>
              <th className="px-4 py-1 text-right text-green-500">Napl.</th>
              <th className="px-4 py-1 text-right text-red-400">Otv.</th>
              <th className="px-4 py-1 text-right text-green-500">Napl.</th>
              <th className="px-4 py-1 text-right text-red-400">Otv.</th>
              <th className="px-4 py-1 text-right text-green-500">Napl.</th>
              <th className="px-4 py-1 text-right text-red-400">Otv.</th>
              <th className="px-4 py-1"></th>
              <th className="px-4 py-1"></th>
              <th className="px-4 py-1"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mesecniPodaci.map((m) => {
              const jeTrenutni = m.mesecIdx === danas.getMonth() && godina === danas.getFullYear();
              const imaIcega = (m.ukupnoPlaceno + m.ukupnoNeplaceno) > 0;
              return (
                <tr key={m.mesec} className={`transition-colors ${jeTrenutni ? 'bg-indigo-50' : imaIcega ? 'hover:bg-gray-50' : 'opacity-40'}`}>
                  <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
                    {jeTrenutni && <span className="mr-1.5 text-indigo-500">▶</span>}
                    {m.mesec}
                  </td>
                  <td className="px-4 py-3 text-right text-green-700 whitespace-nowrap">{formatRSD(m.ratePlacene)}</td>
                  <td className="px-4 py-3 text-right text-red-500 whitespace-nowrap">{formatRSD(m.rateNeplacene)}</td>
                  <td className="px-4 py-3 text-right text-green-700 whitespace-nowrap">{formatRSD(m.hostPlacen)}</td>
                  <td className="px-4 py-3 text-right text-red-500 whitespace-nowrap">{formatRSD(m.hostNeplacen)}</td>
                  <td className="px-4 py-3 text-right text-green-700 whitespace-nowrap">{formatRSD(m.gadsPlaceno)}</td>
                  <td className="px-4 py-3 text-right text-red-500 whitespace-nowrap">{formatRSD(m.gadsNeplaceno)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-green-700 whitespace-nowrap">{formatRSD(m.ukupnoPlaceno)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-red-600 whitespace-nowrap">{formatRSD(m.ukupnoNeplaceno)}</td>
                  <td className="px-4 py-3 text-right font-bold text-gray-800 whitespace-nowrap">{formatRSD(m.ukupnoPlaceno + m.ukupnoNeplaceno)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 border-t-2 border-gray-300 font-bold text-sm">
              <td className="px-4 py-3 text-gray-800">GODIŠNJI ZBIR</td>
              <td className="px-4 py-3 text-right text-green-700">{formatRSD(mesecniPodaci.reduce((s, m) => s + m.ratePlacene, 0))}</td>
              <td className="px-4 py-3 text-right text-red-500">{formatRSD(mesecniPodaci.reduce((s, m) => s + m.rateNeplacene, 0))}</td>
              <td className="px-4 py-3 text-right text-green-700">{formatRSD(mesecniPodaci.reduce((s, m) => s + m.hostPlacen, 0))}</td>
              <td className="px-4 py-3 text-right text-red-500">{formatRSD(mesecniPodaci.reduce((s, m) => s + m.hostNeplacen, 0))}</td>
              <td className="px-4 py-3 text-right text-green-700">{formatRSD(mesecniPodaci.reduce((s, m) => s + m.gadsPlaceno, 0))}</td>
              <td className="px-4 py-3 text-right text-red-500">{formatRSD(mesecniPodaci.reduce((s, m) => s + m.gadsNeplaceno, 0))}</td>
              <td className="px-4 py-3 text-right text-green-700">{formatRSDNum(godisnjePlaceno)}</td>
              <td className="px-4 py-3 text-right text-red-600">{formatRSDNum(godisnjNeplaceno)}</td>
              <td className="px-4 py-3 text-right text-gray-900">{formatRSDNum(godisnjePlaceno + godisnjNeplaceno)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

    </div>
  );
}
