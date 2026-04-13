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
    nacinPlacanja?: string | null;
  } | null;
  brojFakture: string;
  datumIzdavanja: string;
  datumValute: string;
  status: "nacrt" | "predracun" | "izdata" | "placena" | "stornirana";
  napomena?: string;
  ukupanIznos: number;
  stavke: FakturaStavka[];
}

interface FaktureTabelaProps {
  fakture: Faktura[];
  onEdit: (faktura: Faktura) => void;
  onDelete: (fakturaId: string) => void;
  onOznaciPlacenu: (fakturaId: string) => void;
  onPretvoriUFakturu: (fakturaId: string) => void;
}

const statusBoja: Record<string, string> = {
  nacrt: "bg-gray-100 text-gray-700",
  predracun: "bg-orange-100 text-orange-700",
  izdata: "bg-blue-100 text-blue-700",
  placena: "bg-green-100 text-green-700",
  stornirana: "bg-red-100 text-red-700",
};

const statusNaziv: Record<string, string> = {
  nacrt: "Nacrt",
  predracun: "Predračun",
  izdata: "Izdata",
  placena: "Plaćena",
  stornirana: "Stornirana",
};

function formatDatum(datum: string): string {
  const d = new Date(datum);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}.`;
}

function TabelaSekcija({
  naslov,
  stavke,
  pdfLoading,
  onEdit,
  onDelete,
  onOznaciPlacenu,
  onPretvoriUFakturu,
  handlePreuzmiPdf,
}: {
  naslov: string;
  stavke: Faktura[];
  pdfLoading: string | null;
  onEdit: (f: Faktura) => void;
  onDelete: (id: string) => void;
  onOznaciPlacenu: (id: string) => void;
  onPretvoriUFakturu: (id: string) => void;
  handlePreuzmiPdf: (f: Faktura) => void;
}) {
  if (stavke.length === 0) return null;

  return (
    <div className="mb-0">
      {naslov && (
        <div className="px-4 py-2 bg-gray-100 border-b border-t">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
            {naslov} ({stavke.length})
          </h3>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">#</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Broj fakture</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kupac</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Datum izdavanja</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Datum valute</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Iznos (RSD)</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Akcije</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stavke.map((faktura, idx) => (
              <tr key={faktura._id} className="hover:bg-gray-50">
                <td className="px-3 py-3 text-xs text-gray-400 font-mono text-center">{idx + 1}</td>
                <td className="px-4 py-3">
                  <span className="font-mono text-sm font-semibold text-indigo-700">{faktura.brojFakture}</span>
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
                <td className="px-4 py-3 text-sm text-gray-700">{formatDatum(faktura.datumIzdavanja)}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{formatDatum(faktura.datumValute)}</td>
                <td className="px-4 py-3 text-right">
                  <span className="text-sm font-semibold text-gray-900">
                    {faktura.ukupanIznos.toLocaleString("sr-RS", { minimumFractionDigits: 2 })}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusBoja[faktura.status]}`}>
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
                    {faktura.status === "predracun" && faktura.kupacId?.nacinPlacanja === "faktura" && (
                      <button
                        onClick={() => onPretvoriUFakturu(faktura._id)}
                        className="px-2 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded text-xs transition-colors font-semibold"
                        title="Pretvori u fakturu"
                      >
                        → Faktura
                      </button>
                    )}
                    {(faktura.status === "izdata" || faktura.status === "predracun") && (
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function FaktureTabela({
  fakture,
  onEdit,
  onDelete,
  onOznaciPlacenu,
  onPretvoriUFakturu,
}: FaktureTabelaProps) {
  const [pretraga, setPretraga] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("sve");
  const [pdfLoading, setPdfLoading] = useState<string | null>(null);
  const [aktivniTab, setAktivniTab] = useState<"fakture" | "predracuni">("fakture");

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

  const svePredracuni = fakture.filter((f) => f.status === "predracun");
  const sveFakture = fakture.filter((f) => f.status !== "predracun");

  const predracuni = filtriraneFakture.filter((f) => f.status === "predracun");
  const ostale = filtriraneFakture.filter((f) => f.status !== "predracun");

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
      const filePrefix = faktura.status === "predracun" ? "profaktura" : "faktura";
      a.download = `${filePrefix}-${faktura.brojFakture.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`;
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
      <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 border-b">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-800">{fakture.length}</p>
          <p className="text-xs text-gray-500">Ukupno faktura</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-orange-600">
            {fakture.filter((f) => f.status === "predracun").length}
          </p>
          <p className="text-xs text-gray-500">Predračuni</p>
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

      {/* Tab switcher */}
      <div className="flex border-b">
        <button
          onClick={() => { setAktivniTab("fakture"); setFilterStatus("sve"); }}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            aktivniTab === "fakture"
              ? "border-b-2 border-indigo-600 text-indigo-600 bg-white"
              : "text-gray-500 hover:text-gray-700 bg-gray-50"
          }`}
        >
          Fakture
          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${aktivniTab === "fakture" ? "bg-indigo-100 text-indigo-700" : "bg-gray-200 text-gray-600"}`}>
            {sveFakture.length}
          </span>
        </button>
        <button
          onClick={() => { setAktivniTab("predracuni"); setFilterStatus("sve"); }}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            aktivniTab === "predracuni"
              ? "border-b-2 border-orange-500 text-orange-600 bg-white"
              : "text-gray-500 hover:text-gray-700 bg-gray-50"
          }`}
        >
          Predračuni / Profakture
          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${aktivniTab === "predracuni" ? "bg-orange-100 text-orange-700" : "bg-gray-200 text-gray-600"}`}>
            {svePredracuni.length}
          </span>
        </button>
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
        {aktivniTab === "fakture" && (
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="sve">Sve</option>
            <option value="nacrt">Nacrt</option>
            <option value="izdata">Izdate</option>
            <option value="placena">Plaćene</option>
            <option value="stornirana">Stornirane</option>
          </select>
        )}
      </div>

      {/* Tabela */}
      {aktivniTab === "fakture" ? (
        ostale.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500 text-sm">Nema faktura za prikaz</div>
        ) : (
          <TabelaSekcija
            naslov=""
            stavke={ostale}
            pdfLoading={pdfLoading}
            onEdit={onEdit}
            onDelete={onDelete}
            onOznaciPlacenu={onOznaciPlacenu}
            onPretvoriUFakturu={onPretvoriUFakturu}
            handlePreuzmiPdf={handlePreuzmiPdf}
          />
        )
      ) : (
        predracuni.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500 text-sm">Nema predračuna za prikaz</div>
        ) : (
          <TabelaSekcija
            naslov=""
            stavke={predracuni}
            pdfLoading={pdfLoading}
            onEdit={onEdit}
            onDelete={onDelete}
            onOznaciPlacenu={onOznaciPlacenu}
            onPretvoriUFakturu={onPretvoriUFakturu}
            handlePreuzmiPdf={handlePreuzmiPdf}
          />
        )
      )}

      <div className="px-4 py-3 bg-gray-50 border-t text-sm text-gray-500">
        {aktivniTab === "fakture"
          ? `Prikazano ${ostale.length} od ${sveFakture.length} faktura`
          : `Prikazano ${predracuni.length} od ${svePredracuni.length} predračuna`}
      </div>
    </div>
  );
}
