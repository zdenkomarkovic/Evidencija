"use client";

import { useState } from "react";

interface Kupac {
  _id: string;
  ime: string;
  firma?: string;
  email: string;
  email2?: string;
  telefon: string;
  telefon2?: string;
  nacinPlacanja?: "fiskalni" | "faktura";
  domen?: string;
  brojRata: number;
  brojNeplacenihRata: number;
  ukupanDug: number;
}

interface KupciTabelaProps {
  kupci: Kupac[];
  onKupacKlik: (kupacId: string) => void;
  onEdit: (kupac: Kupac) => void;
  onDelete: (kupacId: string) => void;
}

export default function KupciTabela({
  kupci,
  onKupacKlik,
  onEdit,
  onDelete,
}: KupciTabelaProps) {
  const [pretraga, setPretraga] = useState("");

  const filtrianiKupci = kupci.filter(
    (kupac) =>
      kupac.ime.toLowerCase().includes(pretraga.toLowerCase()) ||
      kupac.email.toLowerCase().includes(pretraga.toLowerCase()) ||
      kupac.telefon.includes(pretraga)
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Klijenti</h2>
        <input
          type="text"
          placeholder="Pretraži klijente..."
          value={pretraga}
          onChange={(e) => setPretraga(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ime / Firma
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Telefon
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Način plaćanja
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Domen
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Broj rata
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Neplaćeno
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ukupan dug
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Akcije
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtrianiKupci.map((kupac) => (
              <tr
                key={kupac._id}
                className="hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => onKupacKlik(kupac._id)}
              >
                <td className="px-3 py-2">
                  <div className="text-sm font-medium text-gray-900">
                    {kupac.ime}
                  </div>
                  {kupac.firma && (
                    <div className="text-sm text-gray-500 mt-1">
                      {kupac.firma}
                    </div>
                  )}
                </td>
                <td className="px-3 py-2">
                  <a
                    href={`mailto:${kupac.email}`}
                    className="text-sm text-indigo-600 hover:text-indigo-900 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {kupac.email}
                  </a>
                  {kupac.email2 && (
                    <a
                      href={`mailto:${kupac.email2}`}
                      className="text-sm text-indigo-600 hover:text-indigo-900 hover:underline block mt-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {kupac.email2}
                    </a>
                  )}
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-900">{kupac.telefon}</span>
                    <div className="flex gap-1">
                      <a
                        href={`tel:${kupac.telefon}`}
                        className="text-xs px-2 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded"
                        onClick={(e) => e.stopPropagation()}
                        title="Pozovi"
                      >
                        📞
                      </a>
                      <a
                        href={`viber://chat?number=${kupac.telefon.replace(/\s/g, '')}`}
                        className="text-xs px-2 py-1 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded"
                        onClick={(e) => e.stopPropagation()}
                        title="Viber"
                      >
                        V
                      </a>
                    </div>
                  </div>
                  {kupac.telefon2 && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-900">{kupac.telefon2}</span>
                      <div className="flex gap-1">
                        <a
                          href={`tel:${kupac.telefon2}`}
                          className="text-xs px-2 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded"
                          onClick={(e) => e.stopPropagation()}
                          title="Pozovi"
                        >
                          📞
                        </a>
                        <a
                          href={`viber://chat?number=${kupac.telefon2.replace(/\s/g, '')}`}
                          className="text-xs px-2 py-1 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded"
                          onClick={(e) => e.stopPropagation()}
                          title="Viber"
                        >
                          V
                        </a>
                      </div>
                    </div>
                  )}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <span
                    className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${
                      (kupac.nacinPlacanja || "fiskalni") === "fiskalni"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {(kupac.nacinPlacanja || "fiskalni") === "fiskalni"
                      ? "Fiskalni"
                      : "Faktura"}
                  </span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {kupac.domen ? (
                    <a
                      href={
                        kupac.domen.startsWith("http")
                          ? kupac.domen
                          : `https://${kupac.domen}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 hover:text-indigo-900 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {kupac.domen}
                    </a>
                  ) : (
                    <div className="text-sm text-gray-500">-</div>
                  )}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{kupac.brojRata}</div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      kupac.brojNeplacenihRata > 0
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {kupac.brojNeplacenihRata}
                  </span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <div
                    className={`text-sm font-semibold ${
                      kupac.ukupanDug > 0 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {kupac.ukupanDug.toLocaleString("sr-RS")} RSD
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(kupac);
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Izmeni
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(kupac._id);
                      }}
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

        {filtrianiKupci.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nema kupaca za prikaz
          </div>
        )}
      </div>
    </div>
  );
}
