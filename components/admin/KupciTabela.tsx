"use client";

import { useState, useEffect } from "react";

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
  currentPage?: number;
  totalPages?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
}

export default function KupciTabela({
  kupci,
  onKupacKlik,
  onEdit,
  onDelete,
  itemsPerPage = 25,
  onItemsPerPageChange,
}: KupciTabelaProps) {
  const [pretraga, setPretraga] = useState("");
  const [currentLocalPage, setCurrentLocalPage] = useState(1);

  // CLIENT-SIDE filtriranje - bez API poziva
  const filtriraniKupci = kupci.filter((kupac) => {
    if (!pretraga) return true;
    const searchLower = pretraga.toLowerCase();
    return (
      kupac.ime?.toLowerCase().includes(searchLower) ||
      kupac.firma?.toLowerCase().includes(searchLower) ||
      kupac.email?.toLowerCase().includes(searchLower) ||
      kupac.email2?.toLowerCase().includes(searchLower) ||
      kupac.telefon?.toLowerCase().includes(searchLower) ||
      kupac.telefon2?.toLowerCase().includes(searchLower) ||
      kupac.domen?.toLowerCase().includes(searchLower)
    );
  });

  // Lokalna paginacija
  const startIndex = (currentLocalPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const prikazaniKupci = filtriraniKupci.slice(startIndex, endIndex);
  const localTotalPages = Math.ceil(filtriraniKupci.length / itemsPerPage);

  // Reset na prvu stranicu kada se menja pretraga
  useEffect(() => {
    setCurrentLocalPage(1);
  }, [pretraga]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Klijenti</h2>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="flex items-center gap-2">
              <label
                htmlFor="itemsPerPage"
                className="text-sm text-gray-600 whitespace-nowrap"
              >
                Prikaži:
              </label>
              <select
                id="itemsPerPage"
                value={itemsPerPage}
                onChange={(e) =>
                  onItemsPerPageChange &&
                  onItemsPerPageChange(parseInt(e.target.value))
                }
                className="flex-1 sm:flex-initial px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <input
              type="text"
              placeholder="Pretraži klijente..."
              value={pretraga}
              onChange={(e) => setPretraga(e.target.value)}
              className="w-full sm:flex-1 lg:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
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
            {prikazaniKupci.map((kupac) => (
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
                    <span className="text-sm text-gray-900">
                      {kupac.telefon}
                    </span>
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
                        href={`viber://chat?number=${kupac.telefon.replace(
                          /\s/g,
                          ""
                        )}`}
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
                      <span className="text-sm text-gray-900">
                        {kupac.telefon2}
                      </span>
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
                          href={`viber://chat?number=${kupac.telefon2.replace(
                            /\s/g,
                            ""
                          )}`}
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

        {prikazaniKupci.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {pretraga ? 'Nema rezultata za unetu pretragu' : 'Nema kupaca za prikaz'}
          </div>
        )}
      </div>

      {/* Lokalna paginacija */}
      {localTotalPages > 1 && (
        <div className="mt-6">
          <div className="text-sm text-gray-600 mb-3 text-center sm:text-left">
            Prikazano{" "}
            {Math.min((currentLocalPage - 1) * itemsPerPage + 1, filtriraniKupci.length)} -{" "}
            {Math.min(currentLocalPage * itemsPerPage, filtriraniKupci.length)} od {filtriraniKupci.length}
            {pretraga && ` (filtrirano od ${kupci.length})`}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-3">
            <button
              onClick={() => setCurrentLocalPage(currentLocalPage - 1)}
              disabled={currentLocalPage === 1}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Prethodna
            </button>
            <div className="flex gap-1 justify-center">
              <span className="px-3 py-2 text-sm">
                Stranica {currentLocalPage} od {localTotalPages}
              </span>
            </div>
            <button
              onClick={() => setCurrentLocalPage(currentLocalPage + 1)}
              disabled={currentLocalPage === localTotalPages}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Sledeća
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
