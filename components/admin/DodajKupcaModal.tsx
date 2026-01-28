"use client";

import { useState } from "react";

interface Rata {
  iznos: string;
  datumDospeca: string;
}

interface DodajKupcaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DodajKupcaModal({
  isOpen,
  onClose,
  onSuccess,
}: DodajKupcaModalProps) {
  // Osnovne informacije o kupcu
  const [ime, setIme] = useState("");
  const [firma, setFirma] = useState("");
  const [email, setEmail] = useState("");
  const [email2, setEmail2] = useState("");
  const [telefon, setTelefon] = useState("");
  const [telefon2, setTelefon2] = useState("");
  const [nacinPlacanja, setNacinPlacanja] = useState<"fiskalni" | "faktura">(
    "fiskalni"
  );
  const [domen, setDomen] = useState("");

  // Rate
  const [dodajRate, setDodajRate] = useState(false);
  const [rate, setRate] = useState<Rata[]>([{ iznos: "", datumDospeca: "" }]);

  // Hosting
  const [dodajHosting, setDodajHosting] = useState(false);
  const [hostingDatumPocetka, setHostingDatumPocetka] = useState("");

  // Google Ads
  const [dodajGoogleAds, setDodajGoogleAds] = useState(false);
  const [googleAdsImeKampanje, setGoogleAdsImeKampanje] = useState("");
  const [googleAdsImeNaloga, setGoogleAdsImeNaloga] = useState("");
  const [googleAdsDatumPocetka, setGoogleAdsDatumPocetka] = useState("");
  const [googleAdsIznos, setGoogleAdsIznos] = useState("");
  const [googleAdsPlaceno, setGoogleAdsPlaceno] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pomoćne funkcije za rate
  const dodajRatu = () => {
    setRate([...rate, { iznos: "", datumDospeca: "" }]);
  };

  const obrisiRatu = (index: number) => {
    if (rate.length > 1) {
      const noveRate = rate.filter((_, i) => i !== index);
      setRate(noveRate);
    }
  };

  const izmeniRatu = (index: number, field: "iznos" | "datumDospeca", value: string) => {
    const noveRate = [...rate];
    noveRate[index][field] = value;
    setRate(noveRate);
  };

  // Pomoćne funkcije za datume
  const getDatumIstekaHosting = () => {
    if (!hostingDatumPocetka) return "";
    const pocetakDate = new Date(hostingDatumPocetka);
    const istekDate = new Date(pocetakDate);
    istekDate.setFullYear(istekDate.getFullYear() + 1);
    return istekDate.toISOString().split("T")[0];
  };

  const getDatumIstekaGoogleAds = () => {
    if (!googleAdsDatumPocetka) return "";
    const pocetakDate = new Date(googleAdsDatumPocetka);
    const istekDate = new Date(pocetakDate);
    istekDate.setMonth(istekDate.getMonth() + 1);
    return istekDate.toISOString().split("T")[0];
  };

  const resetForm = () => {
    setIme("");
    setFirma("");
    setEmail("");
    setEmail2("");
    setTelefon("");
    setTelefon2("");
    setNacinPlacanja("fiskalni");
    setDomen("");
    setDodajRate(false);
    setRate([{ iznos: "", datumDospeca: "" }]);
    setDodajHosting(false);
    setHostingDatumPocetka("");
    setDodajGoogleAds(false);
    setGoogleAdsImeKampanje("");
    setGoogleAdsImeNaloga("");
    setGoogleAdsDatumPocetka("");
    setGoogleAdsIznos("");
    setGoogleAdsPlaceno(false);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Kreiraj kupca
      const kupacRes = await fetch("/api/kupci", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ime,
          firma,
          email,
          email2,
          telefon,
          telefon2,
          nacinPlacanja,
          domen,
        }),
      });

      const kupacData = await kupacRes.json();

      if (!kupacRes.ok) {
        console.error("API Error:", kupacData);
        setError(kupacData.error || `Greška pri kreiranju kupca: ${JSON.stringify(kupacData)}`);
        return;
      }

      const kupacId = kupacData.id || kupacData._id;
      const errors = [];

      // 2. Kreiraj rate ako su označene
      if (dodajRate && rate.length > 0) {
        const validneRate = rate.filter(r => r.iznos && r.datumDospeca);
        if (validneRate.length > 0) {
          const ratePromises = validneRate.map(rata =>
            fetch("/api/rate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                kupacId,
                iznos: parseFloat(rata.iznos),
                datumDospeca: rata.datumDospeca,
              }),
            })
          );

          const rateResults = await Promise.all(ratePromises);
          const failedRate = rateResults.filter(res => !res.ok);
          if (failedRate.length > 0) {
            errors.push(`Greška pri kreiranju ${failedRate.length} od ${validneRate.length} rata`);
          }
        }
      }

      // 3. Kreiraj hosting ako je označen
      if (dodajHosting && hostingDatumPocetka) {
        const hostingRes = await fetch("/api/hosting", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kupacId,
            datumPocetka: hostingDatumPocetka,
            datumObnavljanja: getDatumIstekaHosting(),
          }),
        });

        if (!hostingRes.ok) {
          errors.push("Greška pri kreiranju hostinga");
        }
      }

      // 4. Kreiraj Google Ads kampanju ako je označena
      if (dodajGoogleAds && googleAdsImeKampanje && googleAdsImeNaloga && googleAdsDatumPocetka && googleAdsIznos) {
        const googleAdsRes = await fetch("/api/google-ads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kupacId,
            imeKampanje: googleAdsImeKampanje,
            imeGoogleNaloga: googleAdsImeNaloga,
            datumPocetka: googleAdsDatumPocetka,
            datumIsteka: getDatumIstekaGoogleAds(),
            iznos: parseFloat(googleAdsIznos),
            placeno: googleAdsPlaceno,
          }),
        });

        if (!googleAdsRes.ok) {
          errors.push("Greška pri kreiranju Google Ads kampanje");
        }
      }

      // Prikaži rezultat
      if (errors.length > 0) {
        setError(`Kupac je kreiran, ali:\n${errors.join("\n")}`);
        setTimeout(() => {
          resetForm();
          onSuccess();
          onClose();
        }, 3000);
      } else {
        resetForm();
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error("Network Error:", err);
      setError(
        `Greška: ${err instanceof Error ? err.message : String(err)}`
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 my-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">
          Dodaj Novog Klijenta
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded whitespace-pre-line">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* OSNOVNI PODACI */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Osnovni podaci</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ime i Prezime *
                </label>
                <input
                  type="text"
                  value={ime}
                  onChange={(e) => setIme(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Marko Marković"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Firma (opciono)
                </label>
                <input
                  type="text"
                  value={firma}
                  onChange={(e) => setFirma(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Naziv firme"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="marko@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email 2 (opciono)
                </label>
                <input
                  type="email"
                  value={email2}
                  onChange={(e) => setEmail2(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="marko.drugi@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon *
                </label>
                <input
                  type="tel"
                  value={telefon}
                  onChange={(e) => setTelefon(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="+381641234567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon 2 (opciono)
                </label>
                <input
                  type="tel"
                  value={telefon2}
                  onChange={(e) => setTelefon2(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="+381641234567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Način plaćanja
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="nacinPlacanja"
                      value="fiskalni"
                      checked={nacinPlacanja === "fiskalni"}
                      onChange={(e) =>
                        setNacinPlacanja(e.target.value as "fiskalni" | "faktura")
                      }
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Fiskalni</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="nacinPlacanja"
                      value="faktura"
                      checked={nacinPlacanja === "faktura"}
                      onChange={(e) =>
                        setNacinPlacanja(e.target.value as "fiskalni" | "faktura")
                      }
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Faktura</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Domen (opciono)
                </label>
                <input
                  type="text"
                  value={domen}
                  onChange={(e) => setDomen(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="www.example.com"
                />
              </div>
            </div>
          </div>

          {/* RATE */}
          <div className="border-b border-gray-200 pb-6">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="dodajRate"
                checked={dodajRate}
                onChange={(e) => setDodajRate(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="dodajRate" className="ml-2 text-lg font-semibold text-gray-800 cursor-pointer">
                Dodaj Rate
              </label>
            </div>

            {dodajRate && (
              <div className="space-y-3">
                <div className="flex justify-end mb-2">
                  <button
                    type="button"
                    onClick={dodajRatu}
                    className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-1"
                  >
                    <span className="text-lg">+</span>
                    <span>Dodaj ratu</span>
                  </button>
                </div>
                {rate.map((rata, index) => (
                  <div key={index} className="flex gap-3 items-start p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Iznos (RSD)
                      </label>
                      <input
                        type="number"
                        value={rata.iznos}
                        onChange={(e) => izmeniRatu(index, "iznos", e.target.value)}
                        required={dodajRate}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="10000"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Datum dospeća
                      </label>
                      <input
                        type="date"
                        value={rata.datumDospeca}
                        onChange={(e) => izmeniRatu(index, "datumDospeca", e.target.value)}
                        required={dodajRate}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    {rate.length > 1 && (
                      <button
                        type="button"
                        onClick={() => obrisiRatu(index)}
                        className="mt-6 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        title="Obriši ratu"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* HOSTING */}
          <div className="border-b border-gray-200 pb-6">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="dodajHosting"
                checked={dodajHosting}
                onChange={(e) => setDodajHosting(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="dodajHosting" className="ml-2 text-lg font-semibold text-gray-800 cursor-pointer">
                Dodaj Hosting
              </label>
            </div>

            {dodajHosting && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Datum početka hostinga
                  </label>
                  <input
                    type="date"
                    value={hostingDatumPocetka}
                    onChange={(e) => setHostingDatumPocetka(e.target.value)}
                    required={dodajHosting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {hostingDatumPocetka && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Datum isteka (automatski)
                    </label>
                    <input
                      type="date"
                      value={getDatumIstekaHosting()}
                      readOnly
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Hosting ističe godinu dana nakon početka
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* GOOGLE ADS */}
          <div className="pb-6">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="dodajGoogleAds"
                checked={dodajGoogleAds}
                onChange={(e) => setDodajGoogleAds(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="dodajGoogleAds" className="ml-2 text-lg font-semibold text-gray-800 cursor-pointer">
                Dodaj Google Ads Kampanju
              </label>
            </div>

            {dodajGoogleAds && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ime kampanje
                  </label>
                  <input
                    type="text"
                    value={googleAdsImeKampanje}
                    onChange={(e) => setGoogleAdsImeKampanje(e.target.value)}
                    required={dodajGoogleAds}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Naziv kampanje"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ime Google naloga
                  </label>
                  <input
                    type="text"
                    value={googleAdsImeNaloga}
                    onChange={(e) => setGoogleAdsImeNaloga(e.target.value)}
                    required={dodajGoogleAds}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Google nalog"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Datum početka kampanje
                  </label>
                  <input
                    type="date"
                    value={googleAdsDatumPocetka}
                    onChange={(e) => setGoogleAdsDatumPocetka(e.target.value)}
                    required={dodajGoogleAds}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {googleAdsDatumPocetka && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Datum isteka (automatski)
                    </label>
                    <input
                      type="date"
                      value={getDatumIstekaGoogleAds()}
                      readOnly
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Kampanja traje mesec dana
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Iznos (RSD)
                  </label>
                  <input
                    type="number"
                    value={googleAdsIznos}
                    onChange={(e) => setGoogleAdsIznos(e.target.value)}
                    required={dodajGoogleAds}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="10000"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="googleAdsPlaceno"
                    checked={googleAdsPlaceno}
                    onChange={(e) => setGoogleAdsPlaceno(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="googleAdsPlaceno" className="ml-2 text-sm text-gray-700">
                    Plaćeno
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Otkaži
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
            >
              {loading ? "Kreiranje..." : "Kreiraj Sve"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
