"use client";

import { useState, useEffect } from "react";

interface KatalogUsluga {
  id: string;
  naziv: string;
  jedinicaMere: string;
  cena: number;
  imaRokTrajanja: boolean;
}

const JEDINICE_MERE = ["usl", "kom", "sat", "mesec", "god", "par"];

export default function KatalogUslugarTabela() {
  const [stavke, setStavke] = useState<KatalogUsluga[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ naziv: "", jedinicaMere: "usl", cena: "", imaRokTrajanja: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const ucitaj = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/katalog-usluga");
      const data = await res.json();
      setStavke(data);
    } catch {
      setError("Greška pri učitavanju");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { ucitaj(); }, []);

  const otvoriNovu = () => {
    setEditId(null);
    setForm({ naziv: "", jedinicaMere: "usl", cena: "", imaRokTrajanja: false });
    setError("");
    setShowForm(true);
  };

  const otvoriIzmenu = (u: KatalogUsluga) => {
    setEditId(u.id);
    setForm({ naziv: u.naziv, jedinicaMere: u.jedinicaMere, cena: String(u.cena), imaRokTrajanja: u.imaRokTrajanja });
    setError("");
    setShowForm(true);
  };

  const sacuvaj = async () => {
    if (!form.naziv.trim()) { setError("Naziv je obavezan"); return; }
    setSaving(true);
    setError("");
    try {
      const body = { naziv: form.naziv.trim(), jedinicaMere: form.jedinicaMere, cena: parseFloat(form.cena) || 0, imaRokTrajanja: form.imaRokTrajanja };
      const res = editId
        ? await fetch(`/api/katalog-usluga/${editId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        : await fetch("/api/katalog-usluga", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error("Greška pri čuvanju");
      setShowForm(false);
      ucitaj();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Greška");
    } finally {
      setSaving(false);
    }
  };

  const obrisi = async (id: string, naziv: string) => {
    if (!confirm(`Obrisati "${naziv}" iz kataloga?`)) return;
    try {
      await fetch(`/api/katalog-usluga/${id}`, { method: "DELETE" });
      ucitaj();
    } catch {
      alert("Greška pri brisanju");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-semibold text-gray-800">Katalog usluga / proizvoda</h3>
        <button
          onClick={otvoriNovu}
          className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors"
        >
          + Dodaj uslugu
        </button>
      </div>

      {showForm && (
        <div className="mb-5 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
          <h4 className="text-sm font-semibold text-indigo-800 mb-3">
            {editId ? "Izmeni uslugu" : "Nova usluga"}
          </h4>
          {error && <div className="mb-3 text-xs text-red-600">{error}</div>}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Naziv *</label>
              <input
                type="text"
                value={form.naziv}
                onChange={(e) => setForm({ ...form, naziv: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="npr. Izrada sajta"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Jedinica mere</label>
              <select
                value={form.jedinicaMere}
                onChange={(e) => setForm({ ...form, jedinicaMere: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {JEDINICE_MERE.map((jm) => <option key={jm} value={jm}>{jm}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Cena (RSD)</label>
              <input
                type="number"
                value={form.cena}
                onChange={(e) => setForm({ ...form, cena: e.target.value })}
                min="0" step="0.01"
                className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="0.00"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 mb-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.imaRokTrajanja}
              onChange={(e) => setForm({ ...form, imaRokTrajanja: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded"
            />
            <span className="text-sm text-gray-700">Usluga ima rok trajanja (od / do)</span>
          </label>
          {form.imaRokTrajanja && (
            <p className="text-xs text-indigo-600 mb-3 ml-6">
              Datum od/do će se unositi svaki put pri kreiranju fakture.
            </p>
          )}
          <div className="flex gap-2">
            <button
              onClick={sacuvaj}
              disabled={saving}
              className="px-4 py-1.5 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors"
            >
              {saving ? "Čuvanje..." : "Sačuvaj"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-1.5 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Otkaži
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-sm text-gray-500 py-4 text-center">Učitavanje...</div>
      ) : stavke.length === 0 ? (
        <div className="text-sm text-gray-400 py-8 text-center border-2 border-dashed border-gray-200 rounded-lg">
          Katalog je prazan. Dodajte usluge koje često fakturišete.
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs text-gray-500 font-medium">Naziv</th>
                <th className="px-4 py-2.5 text-left text-xs text-gray-500 font-medium">J.m.</th>
                <th className="px-4 py-2.5 text-right text-xs text-gray-500 font-medium">Cena (RSD)</th>
                <th className="px-4 py-2.5 text-center text-xs text-gray-500 font-medium">Rok trajanja</th>
                <th className="px-4 py-2.5 text-right text-xs text-gray-500 font-medium w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stavke.map((u) => (
                <tr key={u.id} className="bg-white hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-medium text-gray-900">{u.naziv}</td>
                  <td className="px-4 py-2.5 text-gray-600">{u.jedinicaMere}</td>
                  <td className="px-4 py-2.5 text-right text-gray-800">
                    {u.cena.toLocaleString("sr-RS", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {u.imaRokTrajanja ? (
                      <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">da</span>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      onClick={() => otvoriIzmenu(u)}
                      className="text-indigo-600 hover:text-indigo-800 text-xs mr-3"
                    >
                      Izmeni
                    </button>
                    <button
                      onClick={() => obrisi(u.id, u.naziv)}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      Obriši
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
