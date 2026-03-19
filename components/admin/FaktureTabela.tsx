"use client";

import { useState } from "react";

export interface FakturaStavka {
  _id: string;
  naziv: string;
  jedinicaMere: string;
  kolicina: number;
  cena: number;
  iznos: number;
  redniBroj: number;
}

export interface Faktura {
  _id: string;
  kupacId: {
    _id: string;
    ime: string;
    firma?: string;
    email?: string;
    pib?: string;
    maticnibroj?: string;
    adresa?: string;
    grad?: string;
    postanskiBroj?: string;
  } | null;
  brojFakture: string;
  datumIzdavanja: string;
  datumValute: string;
  status: "nacrt" | "izdata" | "placena" | "stornirana";
  napomena?: string;
  ukupanIznos: number;
  stavke: FakturaStavka[];
}

interface FaktureTabelaProps {
  fakture: Faktura[];
  onEdit: (faktura: Faktura) => void;
  onDelete: (fakturaId: string) => void;
  onOznaciPlacenu: (fakturaId: string) => void;
}

const statusBoja: Record<string, string> = {
  nacrt: "bg-gray-100 text-gray-700",
  izdata: "bg-blue-100 text-blue-700",
  placena: "bg-green-100 text-green-700",
  stornirana: "bg-red-100 text-red-700",
};

const statusNaziv: Record<string, string> = {
  nacrt: "Nacrt",
  izdata: "Izdata",
  placena: "Plaćena",
  stornirana: "Stornirana",
};

function formatDatum(datum: string): string {
  const d = new Date(datum);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}.`;
}

export default function FaktureTabela({
  fakture,
  onEdit,
  onDelete,
  onOznaciPlacenu,
}: FaktureTabelaProps) {
  const [pretraga, setPretraga] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("sve");
  const [pdfLoading, setPdfLoading] = useState<string | null>(null);

  const filtriraneFakture = fakture.filter((f) => {
    const matchStatus = filterStatus === "sve" || f.status === filterStatus;
    const searchLower = pretraga.toLowerCase();
    const matchPretraga =
      !pretraga ||
      f.brojFakture.toLowerCase().includes(searchLower) ||
      f.kupacId?.ime?.toLowerCase().includes(searchLower) ||
      f.kupacId?.firma?.toLowerCase().includes(searchLower);
    return matchStatus && matchPretraga;
  });

  const ukupnoNeplaceno = fakture
    .filter((f) => f.status === "izdata")
    .reduce((sum, f) => sum + f.ukupanIznos, 0);

  const handlePreuzmiPdf = async (faktura: Faktura) => {
    setPdfLoading(faktura._id);
    try {
      const res = await fetch(`/api/fakture/${faktura._id}/pdf`);
      if (!res.ok) throw new Error("PDF greška");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `faktura-${faktura.brojFakture.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Greška pri preuzimanju PDF:", error);
      alert("Greška pri generisanju PDF-a");
    } finally {
      setPdfLoading(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Statistika */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 border-b">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-800">{fakture.length}</p>
          <p className="text-xs text-gray-500">Ukupno faktura</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">
            {fakture.filter((f) => f.status === "izdata").length}
          </p>
          <p className="text-xs text-gray-500">Neplaćene</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-red-600">
            {ukupnoNeplaceno.toLocaleString("sr-RS")} RSD
          </p>
          <p className="text-xs text-gray-500">Otvoreno</p>
        </div>
      </div>

      {/* Filteri */}
      <div className="p-4 border-b flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Pretraži po broju, kupcu..."
          value={pretraga}
          onChange={(e) => setPretraga(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="sve">Sve fakture</option>
          <option value="nacrt">Nacrt</option>
          <option value="izdata">Izdate</option>
          <option value="placena">Plaćene</option>
          <option value="stornirana">Stornirane</option>
        </select>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Broj fakture
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kupac
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Datum izdavanja
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Datum valute
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Iznos (RSD)
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Akcije
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtriraneFakture.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  Nema faktura za prikaz
                </td>
              </tr>
            ) : (
              filtriraneFakture.map((faktura) => (
                <tr key={faktura._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm font-semibold text-indigo-700">
                      {faktura.brojFakture}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {faktura.kupacId?.firma || faktura.kupacId?.ime || "—"}
                      </p>
                      {faktura.kupacId?.firma && (
                        <p className="text-xs text-gray-500">{faktura.kupacId.ime}</p>
                      )}
                      {faktura.kupacId?.pib && (
                        <p className="text-xs text-gray-400">PIB: {faktura.kupacId.pib}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {formatDatum(faktura.datumIzdavanja)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {formatDatum(faktura.datumValute)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-semibold text-gray-900">
                      {faktura.ukupanIznos.toLocaleString("sr-RS", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusBoja[faktura.status]}`}
                    >
                      {statusNaziv[faktura.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-center flex-wrap">
                      <button
                        onClick={() => handlePreuzmiPdf(faktura)}
                        disabled={pdfLoading === faktura._id}
                        className="px-2 py-1 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded text-xs transition-colors disabled:opacity-50"
                        title="Preuzmi PDF"
                      >
                        {pdfLoading === faktura._id ? "..." : "PDF"}
                      </button>
                      {faktura.status === "izdata" && (
                        <button
                          onClick={() => onOznaciPlacenu(faktura._id)}
                          className="px-2 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded text-xs transition-colors"
                          title="Označi kao plaćenu"
                        >
                          Plaćeno
                        </button>
                      )}
                      <button
                        onClick={() => onEdit(faktura)}
                        className="px-2 py-1 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded text-xs transition-colors"
                        title="Izmeni"
                      >
                        Izmeni
                      </button>
                      <button
                        onClick={() => onDelete(faktura._id)}
                        className="px-2 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-xs transition-colors"
                        title="Obriši"
                      >
                        Obriši
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 bg-gray-50 border-t text-sm text-gray-500">
        Prikazano {filtriraneFakture.length} od {fakture.length} faktura
      </div>
    </div>
  );
}
