"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import KupciTabela from "@/components/admin/KupciTabela";
import RateTabela from "@/components/admin/RateTabela";
import HostingTabela from "@/components/admin/HostingTabela";
import GoogleAdsTabela from "@/components/admin/GoogleAdsTabela";
import DodajKupcaModal from "@/components/admin/DodajKupcaModal";
import DodajRatuModal from "@/components/admin/DodajRatuModal";
import DodajHostingModal from "@/components/admin/DodajHostingModal";
import DodajGoogleAdsModal from "@/components/admin/DodajGoogleAdsModal";
import IzmeniKupcaModal from "@/components/admin/IzmeniKupcaModal";
import IzmeniRatuModal from "@/components/admin/IzmeniRatuModal";
import IzmeniHostingModal from "@/components/admin/IzmeniHostingModal";
import IzmeniGoogleAdsModal from "@/components/admin/IzmeniGoogleAdsModal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import KupacDetaljiModal from "@/components/admin/KupacDetaljiModal";

interface Kupac {
  _id: string;
  ime: string;
  email: string;
  email2?: string;
  telefon: string;
  telefon2?: string;
  firma?: string;
  nacinPlacanja?: "fiskalni" | "faktura";
  domen?: string;
  brojRata: number;
  brojNeplacenihRata: number;
  ukupanDug: number;
}

interface Rata {
  _id: string;
  kupacId: {
    _id: string;
    ime: string;
    email: string;
  };
  iznos: number;
  datumDospeca: string;
  placeno: boolean;
  datumPlacanja: string | null;
  nacinPlacanja: string | null;
  podsetnikPoslat: boolean;
}

interface Hosting {
  _id: string;
  kupacId: {
    _id: string;
    ime: string;
    email: string;
  };
  datumObnavljanja: string;
  podsetnikPoslat: boolean;
}

interface Nastavak {
  datum: string;
  iznos: number;
  placeno: boolean;
}

interface GoogleAds {
  _id: string;
  kupacId: {
    _id: string;
    ime: string;
    email: string;
  };
  imeKampanje: string;
  imeGoogleNaloga: string;
  datumPocetka: string;
  datumIsteka: string;
  iznos: number;
  placeno: boolean;
  nastavci: Nastavak[];
}

export default function AdminPage() {
  const [kupci, setKupci] = useState<Kupac[]>([]);
  const [arhiviraniKupci, setArhiviraniKupci] = useState<Kupac[]>([]);
  const [rate, setRate] = useState<Rata[]>([]);
  const [hosting, setHosting] = useState<Hosting[]>([]);
  const [kampanje, setKampanje] = useState<GoogleAds[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "kupci" | "rate" | "hosting" | "googleads" | "arhivirani"
  >("kupci");

  // Modali za dodavanje
  const [kupcaModalOpen, setKupcaModalOpen] = useState(false);
  const [ratuModalOpen, setRatuModalOpen] = useState(false);
  const [hostingModalOpen, setHostingModalOpen] = useState(false);
  const [googleAdsModalOpen, setGoogleAdsModalOpen] = useState(false);

  // Modali za editovanje
  const [izmeniKupcaModalOpen, setIzmeniKupcaModalOpen] = useState(false);
  const [izmeniRatuModalOpen, setIzmeniRatuModalOpen] = useState(false);
  const [izmeniHostingModalOpen, setIzmeniHostingModalOpen] = useState(false);
  const [izmeniGoogleAdsModalOpen, setIzmeniGoogleAdsModalOpen] =
    useState(false);

  // Modal za detalje kupca
  const [kupacDetaljiModalOpen, setKupacDetaljiModalOpen] = useState(false);
  const [izabraniKupacZaDetalje, setIzabraniKupacZaDetalje] =
    useState<Kupac | null>(null);

  // Izabrani entiteti za editovanje
  const [izabraniKupac, setIzabraniKupac] = useState<Kupac | null>(null);
  const [izabranaRata, setIzabranaRata] = useState<Rata | null>(null);
  const [izabraniHosting, setIzabraniHosting] = useState<Hosting | null>(null);
  const [izabranaKampanja, setIzabranaKampanja] = useState<GoogleAds | null>(
    null
  );

  // Confirmation dialog
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogConfig, setConfirmDialogConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    title: "",
    message: "",
    onConfirm: () => {},
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    ucitajPodatke();
    ucitajArhiviraneKupce();
  }, []);

  const ucitajPodatke = async () => {
    setLoading(true);
    try {
      const [kupciRes, rateRes, hostingRes, kampanjeRes] = await Promise.all([
        fetch("/api/kupci"),
        fetch("/api/rate"),
        fetch("/api/hosting"),
        fetch("/api/google-ads"),
      ]);

      const kupciData = await kupciRes.json();
      const rateData = await rateRes.json();
      const hostingData = await hostingRes.json();
      const kampanjeData = await kampanjeRes.json();

      // Proveri da su podaci nizovi pre postavljanja u state
      setKupci(Array.isArray(kupciData) ? kupciData : []);
      setRate(Array.isArray(rateData) ? rateData : []);
      setHosting(Array.isArray(hostingData) ? hostingData : []);
      setKampanje(Array.isArray(kampanjeData) ? kampanjeData : []);
    } catch (error) {
      console.error("Greška pri učitavanju podataka:", error);
      // Postavi prazne nizove u slučaju greške
      setKupci([]);
      setRate([]);
      setHosting([]);
      setKampanje([]);
    } finally {
      setLoading(false);
    }
  };

  const ucitajArhiviraneKupce = async () => {
    try {
      const res = await fetch("/api/kupci/arhivirani");
      const data = await res.json();
      setArhiviraniKupci(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Greška pri učitavanju arhiviranih kupaca:", error);
      setArhiviraniKupci([]);
    }
  };

  const arhivirajKupca = async (kupacId: string, arhiviran: boolean) => {
    try {
      const res = await fetch("/api/kupci/arhiviraj", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kupacId, arhiviran }),
      });

      if (res.ok) {
        // Refresh oba pregleda
        ucitajPodatke();
        ucitajArhiviraneKupce();
        setKupacDetaljiModalOpen(false);
      } else {
        console.error("Greška pri arhiviranju kupca");
      }
    } catch (error) {
      console.error("Greška:", error);
    }
  };

  const oznaciPlaceno = async (rataId: string) => {
    try {
      const res = await fetch("/api/oznaciPlaceno", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rataId, nacinPlacanja: "manual" }),
      });

      if (res.ok) {
        // Refresh podataka
        ucitajPodatke();
      } else {
        console.error("Greška pri označavanju rate kao plaćene");
      }
    } catch (error) {
      console.error("Greška:", error);
    }
  };

  const resetujPodsetnikRata = async (rataId: string) => {
    try {
      const res = await fetch("/api/oznaciPodsetnik", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: rataId, type: "rata" }),
      });

      if (res.ok) {
        ucitajPodatke();
      } else {
        console.error("Greška pri resetovanju podsetnika");
      }
    } catch (error) {
      console.error("Greška:", error);
    }
  };

  const resetujPodsetnikHosting = async (hostingId: string) => {
    try {
      const res = await fetch("/api/oznaciPodsetnik", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: hostingId, type: "hosting" }),
      });

      if (res.ok) {
        ucitajPodatke();
      } else {
        console.error("Greška pri resetovanju podsetnika");
      }
    } catch (error) {
      console.error("Greška:", error);
    }
  };

  const oznaciPlacenoOsnovniGoogleAds = async (kampanjaId: string) => {
    try {
      const res = await fetch("/api/google-ads/oznaciPlaceno", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kampanjaId,
          tipIznosa: "osnovni",
        }),
      });

      if (res.ok) {
        ucitajPodatke();
      } else {
        console.error("Greška pri označavanju osnovnog iznosa kao plaćenog");
      }
    } catch (error) {
      console.error("Greška:", error);
    }
  };

  const oznaciPlacenoNastavakGoogleAds = async (
    kampanjaId: string,
    nastavakIndex: number
  ) => {
    try {
      const res = await fetch("/api/google-ads/oznaciPlaceno", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kampanjaId,
          tipIznosa: "nastavak",
          nastavakIndex,
        }),
      });

      if (res.ok) {
        ucitajPodatke();
      } else {
        console.error("Greška pri označavanju nastavka kao plaćenog");
      }
    } catch (error) {
      console.error("Greška:", error);
    }
  };

  const handleKupacKlik = (kupacId: string) => {
    const kupac = kupci.find((k) => k._id === kupacId);
    if (kupac) {
      setIzabraniKupacZaDetalje(kupac);
      setKupacDetaljiModalOpen(true);
    }
  };

  // Edit handlers
  const handleEditKupac = (kupac: Kupac) => {
    setIzabraniKupac(kupac);
    setIzmeniKupcaModalOpen(true);
  };

  const handleEditRata = (rata: Rata) => {
    setIzabranaRata(rata);
    setIzmeniRatuModalOpen(true);
  };

  const handleEditHosting = (hosting: Hosting) => {
    setIzabraniHosting(hosting);
    setIzmeniHostingModalOpen(true);
  };

  const handleEditGoogleAds = (kampanja: GoogleAds) => {
    setIzabranaKampanja(kampanja);
    setIzmeniGoogleAdsModalOpen(true);
  };

  // Delete handlers
  const handleDeleteKupac = (kupacId: string) => {
    setConfirmDialogConfig({
      title: "Obriši kupca",
      message:
        "Da li ste sigurni da želite da obrišete ovog kupca? Ova akcija će obrisati i sve njegove rate i hosting zapise.",
      onConfirm: async () => {
        setDeleteLoading(true);
        try {
          const res = await fetch(`/api/kupci/${kupacId}`, {
            method: "DELETE",
          });

          if (res.ok) {
            ucitajPodatke();
            setConfirmDialogOpen(false);
          } else {
            console.error("Greška pri brisanju kupca");
          }
        } catch (error) {
          console.error("Greška:", error);
        } finally {
          setDeleteLoading(false);
        }
      },
    });
    setConfirmDialogOpen(true);
  };

  const handleDeleteRata = (rataId: string) => {
    setConfirmDialogConfig({
      title: "Obriši ratu",
      message: "Da li ste sigurni da želite da obrišete ovu ratu?",
      onConfirm: async () => {
        setDeleteLoading(true);
        try {
          const res = await fetch(`/api/rate/${rataId}`, {
            method: "DELETE",
          });

          if (res.ok) {
            ucitajPodatke();
            setConfirmDialogOpen(false);
          } else {
            console.error("Greška pri brisanju rate");
          }
        } catch (error) {
          console.error("Greška:", error);
        } finally {
          setDeleteLoading(false);
        }
      },
    });
    setConfirmDialogOpen(true);
  };

  const handleDeleteHosting = (hostingId: string) => {
    setConfirmDialogConfig({
      title: "Obriši hosting",
      message: "Da li ste sigurni da želite da obrišete ovaj hosting zapis?",
      onConfirm: async () => {
        setDeleteLoading(true);
        try {
          const res = await fetch(`/api/hosting/${hostingId}`, {
            method: "DELETE",
          });

          if (res.ok) {
            ucitajPodatke();
            setConfirmDialogOpen(false);
          } else {
            console.error("Greška pri brisanju hosting zapisa");
          }
        } catch (error) {
          console.error("Greška:", error);
        } finally {
          setDeleteLoading(false);
        }
      },
    });
    setConfirmDialogOpen(true);
  };

  const handleDeleteGoogleAds = (kampanjaId: string) => {
    setConfirmDialogConfig({
      title: "Obriši Google Ads kampanju",
      message:
        "Da li ste sigurni da želite da obrišete ovu Google Ads kampanju?",
      onConfirm: async () => {
        setDeleteLoading(true);
        try {
          const res = await fetch(`/api/google-ads/${kampanjaId}`, {
            method: "DELETE",
          });

          if (res.ok) {
            ucitajPodatke();
            setConfirmDialogOpen(false);
          } else {
            console.error("Greška pri brisanju Google Ads kampanje");
          }
        } catch (error) {
          console.error("Greška:", error);
        } finally {
          setDeleteLoading(false);
        }
      },
    });
    setConfirmDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Učitavanje...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Admin Panel
            </h1>
            <p className="text-gray-600">
              Upravljanje klijentima, ratama i hostingom
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Odjavi se
          </button>
        </div>

        {/* Statistika */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Ukupno klijenata
            </h3>
            <p className="text-3xl font-bold text-indigo-600">
              {kupci?.length || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Neplaćene rate
            </h3>
            <p className="text-3xl font-bold text-red-600">
              {rate?.filter((r) => !r.placeno)?.length || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Ukupan dug
            </h3>
            <p className="text-3xl font-bold text-red-600">
              {(
                rate
                  ?.filter((r) => !r.placeno)
                  ?.reduce((sum, r) => sum + r.iznos, 0) || 0
              ).toLocaleString("sr-RS")}{" "}
              RSD
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Aktivne kampanje
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {kampanje?.length || 0}
            </p>
          </div>
        </div>

        {/* Tabovi i Dugmad */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <div className="flex justify-between items-center">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab("kupci")}
                  className={`${
                    activeTab === "kupci"
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                >
                  Klijenti ({kupci?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab("rate")}
                  className={`${
                    activeTab === "rate"
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                >
                  Rate ({rate?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab("hosting")}
                  className={`${
                    activeTab === "hosting"
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                >
                  Hosting ({hosting?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab("googleads")}
                  className={`${
                    activeTab === "googleads"
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                >
                  Google Ads ({kampanje?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab("arhivirani")}
                  className={`${
                    activeTab === "arhivirani"
                      ? "border-red-500 text-red-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                >
                  🗄️ Arhivirani ({arhiviraniKupci?.length || 0})
                </button>
              </nav>

              {/* Dugmad za dodavanje */}
              <div className="mb-4">
                {activeTab === "kupci" && (
                  <button
                    onClick={() => setKupcaModalOpen(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    + Dodaj Klijenta
                  </button>
                )}
                {activeTab === "rate" && (
                  <button
                    onClick={() => setRatuModalOpen(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    disabled={kupci.length === 0}
                  >
                    + Dodaj Ratu
                  </button>
                )}
                {activeTab === "hosting" && (
                  <button
                    onClick={() => setHostingModalOpen(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    disabled={kupci.length === 0}
                  >
                    + Dodaj Hosting
                  </button>
                )}
                {activeTab === "googleads" && (
                  <button
                    onClick={() => setGoogleAdsModalOpen(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    disabled={kupci.length === 0}
                  >
                    + Dodaj Google Ads Kampanju
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sadržaj tabova */}
        <div className="mt-6">
          {activeTab === "kupci" && (
            <KupciTabela
              kupci={kupci}
              onKupacKlik={handleKupacKlik}
              onEdit={handleEditKupac}
              onDelete={handleDeleteKupac}
            />
          )}
          {activeTab === "rate" && (
            <RateTabela
              rate={rate}
              onOznaciPlaceno={oznaciPlaceno}
              onResetujPodsetnik={resetujPodsetnikRata}
              onEdit={handleEditRata}
              onDelete={handleDeleteRata}
              onKupacKlik={handleKupacKlik}
            />
          )}
          {activeTab === "hosting" && (
            <HostingTabela
              hosting={hosting}
              onResetujPodsetnik={resetujPodsetnikHosting}
              onEdit={handleEditHosting}
              onDelete={handleDeleteHosting}
              onKupacKlik={handleKupacKlik}
            />
          )}
          {activeTab === "googleads" && (
            <GoogleAdsTabela
              kampanje={kampanje}
              onEdit={handleEditGoogleAds}
              onDelete={handleDeleteGoogleAds}
              onOznaciPlacenoOsnovni={oznaciPlacenoOsnovniGoogleAds}
              onOznaciPlacenoNastavak={oznaciPlacenoNastavakGoogleAds}
              onKupacKlik={handleKupacKlik}
            />
          )}
          {activeTab === "arhivirani" && (
            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  📦 Arhivirani klijenti
                </h3>
                <p className="text-sm text-red-700">
                  Ovo su klijenti koji ne plaćaju ili su na drugom načinu označeni za arhiviranje.
                  Njihova evidencija se čuva ali ne pojavljuje u normalnom pregledu.
                </p>
              </div>
              <KupciTabela
                kupci={arhiviraniKupci}
                onKupacKlik={handleKupacKlik}
                onEdit={handleEditKupac}
                onDelete={handleDeleteKupac}
              />
            </div>
          )}
        </div>

        {/* Modali za dodavanje */}
        <DodajKupcaModal
          isOpen={kupcaModalOpen}
          onClose={() => setKupcaModalOpen(false)}
          onSuccess={ucitajPodatke}
        />
        <DodajRatuModal
          isOpen={ratuModalOpen}
          onClose={() => setRatuModalOpen(false)}
          onSuccess={ucitajPodatke}
          kupci={kupci}
        />
        <DodajHostingModal
          isOpen={hostingModalOpen}
          onClose={() => setHostingModalOpen(false)}
          onSuccess={ucitajPodatke}
          kupci={kupci}
        />
        <DodajGoogleAdsModal
          isOpen={googleAdsModalOpen}
          onClose={() => setGoogleAdsModalOpen(false)}
          onSuccess={ucitajPodatke}
          kupci={kupci}
        />

        {/* Modali za editovanje */}
        <IzmeniKupcaModal
          isOpen={izmeniKupcaModalOpen}
          onClose={() => setIzmeniKupcaModalOpen(false)}
          onSuccess={ucitajPodatke}
          kupac={izabraniKupac}
        />
        <IzmeniRatuModal
          isOpen={izmeniRatuModalOpen}
          onClose={() => setIzmeniRatuModalOpen(false)}
          onSuccess={ucitajPodatke}
          rata={izabranaRata}
          kupci={kupci}
        />
        <IzmeniHostingModal
          isOpen={izmeniHostingModalOpen}
          onClose={() => setIzmeniHostingModalOpen(false)}
          onSuccess={ucitajPodatke}
          hosting={izabraniHosting}
          kupci={kupci}
        />
        <IzmeniGoogleAdsModal
          isOpen={izmeniGoogleAdsModalOpen}
          onClose={() => setIzmeniGoogleAdsModalOpen(false)}
          onSuccess={ucitajPodatke}
          kampanja={izabranaKampanja}
          kupci={kupci}
        />

        {/* Confirmation Dialog */}
        <ConfirmDialog
          isOpen={confirmDialogOpen}
          title={confirmDialogConfig.title}
          message={confirmDialogConfig.message}
          onConfirm={confirmDialogConfig.onConfirm}
          onCancel={() => setConfirmDialogOpen(false)}
          isLoading={deleteLoading}
          confirmText="Obriši"
        />

        {/* Modal za detalje kupca */}
        <KupacDetaljiModal
          isOpen={kupacDetaljiModalOpen}
          onClose={() => setKupacDetaljiModalOpen(false)}
          kupac={izabraniKupacZaDetalje}
          onArhiviraj={arhivirajKupca}
        />
      </div>
    </div>
  );
}
