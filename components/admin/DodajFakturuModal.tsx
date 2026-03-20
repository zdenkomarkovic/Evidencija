"use client";

import { useState, useEffect } from "react";

interface Kupac {
  _id: string;
  ime: string;
  firma?: string;
  nacinPlacanja?: string;
}

interface KatalogUsluga {
  id: string;
  naziv: string;
  jedinicaMere: string;
  cena: number;
  imaRokTrajanja: boolean;
}

interface Stavka {
  naziv: string;
  jedinicaMere: string;
  kolicina: string;
  cena: string;
  iznos: number;
  datumOd: string;
  datumDo: string;
  imaRokTrajanja: boolean;
}

interface DodajFakturuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  kupci: Kupac[];
}

const JEDINICE_MERE = ["kom", "sat", "mesec", "god", "usl", "par"];

function formatDatumZaNaziv(datum: string): string {
  if (!datum) return "";
  const d = new Date(datum);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}.`;
}

function nazivSaDatumima(stavka: Stavka): string {
  if (stavka.imaRokTrajanja && stavka.datumOd && stavka.datumDo) {
    return `${stavka.naziv} od ${formatDatumZaNaziv(stavka.datumOd)} do ${formatDatumZaNaziv(stavka.datumDo)}`;
  }
  return stavka.naziv;
}

export default function DodajFakturuModal({
  isOpen,
  onClose,
  onSuccess,
  kupci,
}: DodajFakturuModalProps) {
  const today = new Date().toISOString().split("T")[0];
  const valutaDefault = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const [kupacId, setKupacId] = useState("");
  const [datumIzdavanja, setDatumIzdavanja] = useState(today);
  const [datumValute, setDatumValute] = useState(valutaDefault);
  const [status, setStatus] = useState<"nacrt" | "izdata">("izdata");
  const [napomena, setNapomena] = useState("");
  const [stavke, setStavke] = useState<Stavka[]>([
    { naziv: "", jedinicaMere: "usl", kolicina: "1", cena: "", iznos: 0, datumOd: "", datumDo: "", imaRokTrajanja: false },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [katalog, setKatalog] = useState<KatalogUsluga[]>([]);
  const [openKatalogIndex, setOpenKatalogIndex] = useState<number | null>(null);

  const kupciZaFakturu = kupci.filter(
    (k) => k.nacinPlacanja === "faktura" || k.firma
  );

  useEffect(() => {
    if (!isOpen) return;
    setKupacId("");
    setDatumIzdavanja(today);
    setDatumValute(valutaDefault);
    setStatus("izdata");
    setNapomena("");
    setStavke([{ naziv: "", jedinicaMere: "usl", kolicina: "1", cena: "", iznos: 0, datumOd: "", datumDo: "", imaRokTrajanja: false }]);
    setError("");
    setOpenKatalogIndex(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    fetch("/api/katalog-usluga")
      .then((r) => r.json())
      .then((data) => setKatalog(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const izracunajIznos = (kolicina: string, cena: string): number => {
    const k = parseFloat(kolicina) || 0;
    const c = parseFloat(cena) || 0;
    return Math.round(k * c * 100) / 100;
  };

  const izmeniStavku = (index: number, field: keyof Stavka, value: string | boolean) => {
    const noveStavke = [...stavke];
    noveStavke[index] = { ...noveStavke[index], [field]: value };
    if (field === "kolicina" || field === "cena") {
      const kolicina = field === "kolicina" ? (value as string) : noveStavke[index].kolicina;
      const cena = field === "cena" ? (value as string) : noveStavke[index].cena;
      noveStavke[index].iznos = izracunajIznos(kolicina, cena);
    }
    setStavke(noveStavke);
  };

  const izaberiIzKataloga = (index: number, usluga: KatalogUsluga) => {
    const noveStavke = [...stavke];
    const iznos = izracunajIznos(noveStavke[index].kolicina, String(usluga.cena));
    noveStavke[index] = {
      ...noveStavke[index],
      naziv: usluga.naziv,
      jedinicaMere: usluga.jedinicaMere,
      cena: String(usluga.cena),
      iznos,
      imaRokTrajanja: usluga.imaRokTrajanja,
      datumOd: noveStavke[index].datumOd,
      datumDo: noveStavke[index].datumDo,
    };
    setStavke(noveStavke);
    setOpenKatalogIndex(null);
  };

  const dodajStavku = () => {
    setStavke([
      ...stavke,
      { naziv: "", jedinicaMere: "usl", kolicina: "1", cena: "", iznos: 0, datumOd: "", datumDo: "", imaRokTrajanja: false },
    ]);
  };

  const obrisiStavku = (index: number) => {
    if (stavke.length > 1) {
      setStavke(stavke.filter((_, i) => i !== index));
    }
  };

  const ukupanIznos = stavke.reduce((sum, s) => sum + s.iznos, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!kupacId) {
      setError("Izaberite kupca");
      return;
    }

    const validneStavke = stavke.filter((s) => s.naziv && parseFloat(s.cena) > 0);
    if (validneStavke.length === 0) {
      setError("Dodajte bar jednu stavku sa nazivom i cenom");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/fakture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kupacId,
          datumIzdavanja,
          datumValute,
          status,
          napomena: napomena || null,
          stavke: validneStavke.map((s) => ({
            naziv: nazivSaDatumima(s),
            jedinicaMere: s.jedinicaMere,
            kolicina: parseFloat(s.kolicina) || 1,
            cena: parseFloat(s.cena) || 0,
            iznos: s.iznos,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Greška pri kreiranju fakture");
        return;
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(`Greška: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpenKatalogIndex(null);
      }}
    >
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full my-8">
        <h2 className="text-xl font-bold mb-5 text-gray-900">Nova Faktura</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* KUPAC I DATUMI */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kupac (pravno lice) *
              </label>
              <select
                value={kupacId}
                onChange={(e) => setKupacId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">— Izaberi kupca —</option>
                {kupciZaFakturu.map((k) => (
                  <option key={k._id} value={k._id}>
                    {k.firma ? `${k.firma} (${k.ime})` : k.ime}
                  </option>
                ))}
                {kupciZaFakturu.length === 0 && (
                  <option disabled value="">
                    Nema kupaca sa nacinom placanja &quot;Faktura&quot;
                  </option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Datum izdavanja *
              </label>
              <input
                type="date"
                value={datumIzdavanja}
                onChange={(e) => setDatumIzdavanja(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Datum valute (rok plaćanja) *
              </label>
              <input
                type="date"
                value={datumValute}
                onChange={(e) => setDatumValute(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "nacrt" | "izdata")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="izdata">Izdata</option>
                <option value="nacrt">Nacrt</option>
              </select>
            </div>
          </div>

          {/* STAVKE */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Stavke *</label>
              <button
                type="button"
                onClick={dodajStavku}
                className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
              >
                + Dodaj stavku
              </button>
            </div>

            <div className="space-y-3">
              {stavke.map((stavka, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3">
                  {/* Naziv + katalog */}
                  <div className="flex gap-2 mb-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={stavka.naziv}
                        onChange={(e) => izmeniStavku(index, "naziv", e.target.value)}
                        placeholder="Naziv usluge/robe"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    {katalog.length > 0 && (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setOpenKatalogIndex(openKatalogIndex === index ? null : index)}
                          className="px-2 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded text-xs hover:bg-indigo-100 transition-colors whitespace-nowrap"
                        >
                          Iz kataloga ▾
                        </button>
                        {openKatalogIndex === index && (
                          <div className="absolute right-0 top-full mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                            {katalog.map((u) => (
                              <button
                                key={u.id}
                                type="button"
                                onClick={() => izaberiIzKataloga(index, u)}
                                className="w-full text-left px-3 py-2 hover:bg-indigo-50 text-sm border-b border-gray-100 last:border-0"
                              >
                                <div className="font-medium text-gray-900">{u.naziv}</div>
                                <div className="text-xs text-gray-500">
                                  {u.cena.toLocaleString("sr-RS", { minimumFractionDigits: 2 })} RSD / {u.jedinicaMere}
                                  {u.imaRokTrajanja && <span className="ml-2 text-blue-600">• rok trajanja</span>}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {stavke.length > 1 && (
                      <button
                        type="button"
                        onClick={() => obrisiStavku(index)}
                        className="text-red-400 hover:text-red-600 text-lg leading-none px-1"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  {/* JM, Kolicina, Cena, Iznos */}
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-0.5">J.m.</label>
                      <select
                        value={stavka.jedinicaMere}
                        onChange={(e) => izmeniStavku(index, "jedinicaMere", e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        {JEDINICE_MERE.map((jm) => <option key={jm} value={jm}>{jm}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-0.5">Količina</label>
                      <input
                        type="number"
                        value={stavka.kolicina}
                        onChange={(e) => izmeniStavku(index, "kolicina", e.target.value)}
                        min="0.001" step="0.001"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-right focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-0.5">Cena (RSD)</label>
                      <input
                        type="number"
                        value={stavka.cena}
                        onChange={(e) => izmeniStavku(index, "cena", e.target.value)}
                        min="0" step="0.01" placeholder="0.00"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-right focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-0.5">Iznos (RSD)</label>
                      <div className="px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-sm text-right font-semibold text-gray-800">
                        {stavka.iznos.toLocaleString("sr-RS", { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>

                  {/* Rok trajanja (od/do) */}
                  {stavka.imaRokTrajanja && (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-blue-100 bg-blue-50 -mx-3 -mb-3 px-3 pb-3 rounded-b-lg mt-2">
                      <div>
                        <label className="block text-xs text-blue-700 font-medium mb-0.5">Datum od *</label>
                        <input
                          type="date"
                          value={stavka.datumOd}
                          onChange={(e) => izmeniStavku(index, "datumOd", e.target.value)}
                          className="w-full px-2 py-1.5 border border-blue-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-blue-700 font-medium mb-0.5">Datum do *</label>
                        <input
                          type="date"
                          value={stavka.datumDo}
                          onChange={(e) => izmeniStavku(index, "datumDo", e.target.value)}
                          className="w-full px-2 py-1.5 border border-blue-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-3 flex justify-end">
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-2">
                <span className="text-sm font-bold text-gray-700 mr-3">UKUPNO:</span>
                <span className="text-base font-bold text-indigo-700">
                  {ukupanIznos.toLocaleString("sr-RS", { minimumFractionDigits: 2 })} RSD
                </span>
              </div>
            </div>
          </div>

          {/* NAPOMENA */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Napomena (opciono)
            </label>
            <textarea
              value={napomena}
              onChange={(e) => setNapomena(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Napomena na fakturi..."
            />
          </div>

          {/* DUGMAD */}
          <div className="flex gap-3 pt-2 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
              disabled={loading}
            >
              Otkaži
            </button>
            <button
              type="submit"
              disabled={loading || kupciZaFakturu.length === 0}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 text-sm"
            >
              {loading ? "Kreiranje..." : "Kreiraj Fakturu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
