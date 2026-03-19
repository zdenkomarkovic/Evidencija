"use client";

import { useState, useEffect } from "react";
import { Faktura } from "./FaktureTabela";

interface Kupac {
  _id: string;
  ime: string;
  firma?: string;
  nacinPlacanja?: string;
}

interface Stavka {
  naziv: string;
  jedinicaMere: string;
  kolicina: string;
  cena: string;
  iznos: number;
}

interface IzmeniFaktureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  faktura: Faktura | null;
  kupci: Kupac[];
}

const JEDINICE_MERE = ["kom", "sat", "mesec", "god", "usl", "par"];

export default function IzmeniFaktureModal({
  isOpen,
  onClose,
  onSuccess,
  faktura,
  kupci,
}: IzmeniFaktureModalProps) {
  const [kupacId, setKupacId] = useState("");
  const [datumIzdavanja, setDatumIzdavanja] = useState("");
  const [datumValute, setDatumValute] = useState("");
  const [status, setStatus] = useState<"nacrt" | "izdata" | "placena" | "stornirana">("izdata");
  const [napomena, setNapomena] = useState("");
  const [stavke, setStavke] = useState<Stavka[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const kupciZaFakturu = kupci.filter(
    (k) => k.nacinPlacanja === "faktura" || k.firma
  );

  useEffect(() => {
    if (!faktura) return;
    setKupacId(faktura.kupacId?._id || "");
    setDatumIzdavanja(faktura.datumIzdavanja?.split("T")[0] || "");
    setDatumValute(faktura.datumValute?.split("T")[0] || "");
    setStatus(faktura.status);
    setNapomena(faktura.napomena || "");
    setStavke(
      faktura.stavke.map((s) => ({
        naziv: s.naziv,
        jedinicaMere: s.jedinicaMere,
        kolicina: String(s.kolicina),
        cena: String(s.cena),
        iznos: s.iznos,
      }))
    );
    setError("");
  }, [faktura]);

  const izracunajIznos = (kolicina: string, cena: string): number => {
    const k = parseFloat(kolicina) || 0;
    const c = parseFloat(cena) || 0;
    return Math.round(k * c * 100) / 100;
  };

  const izmeniStavku = (index: number, field: keyof Stavka, value: string) => {
    const noveStavke = [...stavke];
    noveStavke[index] = { ...noveStavke[index], [field]: value };
    if (field === "kolicina" || field === "cena") {
      const kolicina = field === "kolicina" ? value : noveStavke[index].kolicina;
      const cena = field === "cena" ? value : noveStavke[index].cena;
      noveStavke[index].iznos = izracunajIznos(kolicina, cena);
    }
    setStavke(noveStavke);
  };

  const dodajStavku = () => {
    setStavke([
      ...stavke,
      { naziv: "", jedinicaMere: "kom", kolicina: "1", cena: "", iznos: 0 },
    ]);
  };

  const obrisiStavku = (index: number) => {
    if (stavke.length > 1) setStavke(stavke.filter((_, i) => i !== index));
  };

  const ukupanIznos = stavke.reduce((sum, s) => sum + s.iznos, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faktura) return;
    setError("");

    const validneStavke = stavke.filter(
      (s) => s.naziv && parseFloat(s.cena) > 0
    );
    if (validneStavke.length === 0) {
      setError("Dodajte bar jednu stavku sa nazivom i cenom");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/fakture/${faktura._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kupacId,
          datumIzdavanja,
          datumValute,
          status,
          napomena: napomena || null,
          stavke: validneStavke.map((s) => ({
            naziv: s.naziv,
            jedinicaMere: s.jedinicaMere,
            kolicina: parseFloat(s.kolicina) || 1,
            cena: parseFloat(s.cena) || 0,
            iznos: s.iznos,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Greška pri ažuriranju fakture");
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

  if (!isOpen || !faktura) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full my-8">
        <h2 className="text-xl font-bold mb-1 text-gray-900">Izmeni Fakturu</h2>
        <p className="text-sm text-indigo-600 font-mono mb-5">{faktura.brojFakture}</p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kupac *
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
                Datum valute *
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value as "nacrt" | "izdata" | "placena" | "stornirana"
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="nacrt">Nacrt</option>
                <option value="izdata">Izdata</option>
                <option value="placena">Plaćena</option>
                <option value="stornirana">Stornirana</option>
              </select>
            </div>
          </div>

          {/* STAVKE */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Stavke *
              </label>
              <button
                type="button"
                onClick={dodajStavku}
                className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
              >
                + Dodaj stavku
              </button>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs text-gray-500 font-medium w-2/5">Naziv</th>
                    <th className="px-3 py-2 text-left text-xs text-gray-500 font-medium w-1/8">J.m.</th>
                    <th className="px-3 py-2 text-right text-xs text-gray-500 font-medium w-1/8">Kol.</th>
                    <th className="px-3 py-2 text-right text-xs text-gray-500 font-medium w-1/5">Cena (RSD)</th>
                    <th className="px-3 py-2 text-right text-xs text-gray-500 font-medium w-1/5">Iznos (RSD)</th>
                    <th className="w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stavke.map((stavka, index) => (
                    <tr key={index}>
                      <td className="px-2 py-2">
                        <input
                          type="text"
                          value={stavka.naziv}
                          onChange={(e) => izmeniStavku(index, "naziv", e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <select
                          value={stavka.jedinicaMere}
                          onChange={(e) => izmeniStavku(index, "jedinicaMere", e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          {JEDINICE_MERE.map((jm) => (
                            <option key={jm} value={jm}>{jm}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          value={stavka.kolicina}
                          onChange={(e) => izmeniStavku(index, "kolicina", e.target.value)}
                          min="0.001"
                          step="0.001"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-right"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          value={stavka.cena}
                          onChange={(e) => izmeniStavku(index, "cena", e.target.value)}
                          min="0"
                          step="0.01"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-right"
                        />
                      </td>
                      <td className="px-2 py-2 text-right">
                        <span className="text-sm font-semibold">
                          {stavka.iznos.toLocaleString("sr-RS", { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-2 py-2">
                        {stavke.length > 1 && (
                          <button
                            type="button"
                            onClick={() => obrisiStavku(index)}
                            className="text-red-500 hover:text-red-700 text-lg"
                          >
                            ×
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-indigo-50 border-t-2 border-indigo-200">
                    <td colSpan={4} className="px-3 py-2 text-right text-sm font-bold text-gray-700">
                      UKUPNO:
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span className="text-base font-bold text-indigo-700">
                        {ukupanIznos.toLocaleString("sr-RS", { minimumFractionDigits: 2 })} RSD
                      </span>
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Napomena (opciono)
            </label>
            <textarea
              value={napomena}
              onChange={(e) => setNapomena(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-3 pt-2 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
              disabled={loading}
            >
              Otkaži
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 text-sm"
            >
              {loading ? "Čuvanje..." : "Sačuvaj Izmene"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
