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
  arhiviran?: boolean;
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
  placeno: boolean;
  datumPlacanja?: string | null;
  nacinPlacanja?: string | null;
  podsetnikPoslat: boolean;
}

interface Nastavak {
  _id?: string;
  datum: string;
  iznos: number;
  placeno: boolean;
  datumPlacanja?: string | null;
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
  iznosNastavka: number;
  datumPrimeneIznosaNavstavka: string | null;
  placeno: boolean;
  datumPlacanja: string | null;
  aktivna: boolean;
  datumZaustavljanja: string | null;
  datumPonovnogPokretanja: string | null;
  nastavci: Nastavak[];
}

export default function AdminPage() {
  const [kupci, setKupci] = useState<Kupac[]>([]);
  const [arhiviraniKupci, setArhiviraniKupci] = useState<Kupac[]>([]);
  const [rate, setRate] = useState<Rata[]>([]);
  const [arhiviraneRate, setArhiviraneRate] = useState<Rata[]>([]);
  const [hosting, setHosting] = useState<Hosting[]>([]);
  const [arhiviraniHosting, setArhiviraniHosting] = useState<Hosting[]>([]);
  const [kampanje, setKampanje] = useState<GoogleAds[]>([]);
  const [arhiviraneKampanje, setArhiviraneKampanje] = useState<GoogleAds[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "kupci" | "rate" | "hosting" | "googleads" | "arhivirani"
  >("kupci");

  // Paginacija za kupce
  const [kupciPage, setKupciPage] = useState(1);
  const [kupciLimit, setKupciLimit] = useState(25);
  const [kupciTotal, setKupciTotal] = useState(0);
  const [kupciTotalPages, setKupciTotalPages] = useState(0);
  const [kupciSearch, setKupciSearch] = useState("");

  // Paginacija za arhivirane kupce
  const [arhiviraniKupciPage, setArhiviraniKupciPage] = useState(1);
  const [arhiviraniKupciLimit, setArhiviraniKupciLimit] = useState(25);
  const [arhiviraniKupciTotal, setArhiviraniKupciTotal] = useState(0);
  const [arhiviraniKupciTotalPages, setArhiviraniKupciTotalPages] = useState(0);
  const [arhiviraniKupciSearch, setArhiviraniKupciSearch] = useState("");

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
  }, [kupciPage, kupciLimit]);

  useEffect(() => {
    ucitajArhiviraneKupce();
  }, [arhiviraniKupciPage, arhiviraniKupciLimit, arhiviraniKupciSearch]);

  const ucitajPodatke = async () => {
    setLoading(true);
    try {
      // Učitaj SVE kupce odjednom za client-side pretragu
      const kupciUrl = `/api/kupci?page=1&limit=10000`;
      const [kupciRes, rateRes, hostingRes, kampanjeRes] = await Promise.all([
        fetch(kupciUrl),
        fetch("/api/rate"),
        fetch("/api/hosting"),
        fetch("/api/google-ads"),
      ]);

      const kupciData = await kupciRes.json();
      const rateData = await rateRes.json();
      const hostingData = await hostingRes.json();
      const kampanjeData = await kampanjeRes.json();

      // Proveri da li kupciData ima paginaciju
      if (kupciData.data && kupciData.pagination) {
        setKupci(Array.isArray(kupciData.data) ? kupciData.data : []);
        setKupciTotal(kupciData.pagination.total);
        setKupciTotalPages(kupciData.pagination.totalPages);
      } else {
        // Fallback za stari format
        setKupci(Array.isArray(kupciData) ? kupciData : []);
      }

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
      const arhiviraniKupciUrl = `/api/kupci/arhivirani?page=${arhiviraniKupciPage}&limit=${arhiviraniKupciLimit}&search=${encodeURIComponent(arhiviraniKupciSearch)}`;
      const [kupciRes, rateRes, hostingRes, kampanjeRes] = await Promise.all([
        fetch(arhiviraniKupciUrl),
        fetch("/api/rate/arhivirani"),
        fetch("/api/hosting/arhivirani"),
        fetch("/api/google-ads/arhivirani"),
      ]);

      const kupciData = await kupciRes.json();
      const rateData = await rateRes.json();
      const hostingData = await hostingRes.json();
      const kampanjeData = await kampanjeRes.json();

      // Proveri da li kupciData ima paginaciju
      if (kupciData.data && kupciData.pagination) {
        setArhiviraniKupci(Array.isArray(kupciData.data) ? kupciData.data : []);
        setArhiviraniKupciTotal(kupciData.pagination.total);
        setArhiviraniKupciTotalPages(kupciData.pagination.totalPages);
      } else {
        // Fallback za stari format
        setArhiviraniKupci(Array.isArray(kupciData) ? kupciData : []);
      }

      setArhiviraneRate(Array.isArray(rateData) ? rateData : []);
      setArhiviraniHosting(Array.isArray(hostingData) ? hostingData : []);
      setArhiviraneKampanje(Array.isArray(kampanjeData) ? kampanjeData : []);
    } catch (error) {
      console.error("Greška pri učitavanju arhiviranih podataka:", error);
      setArhiviraniKupci([]);
      setArhiviraneRate([]);
      setArhiviraniHosting([]);
      setArhiviraneKampanje([]);
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

  const oznaciPlacenoHosting = async (hostingId: string) => {
    try {
      const res = await fetch("/api/hosting/oznaciPlaceno", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hostingId,
          nacinPlacanja: "manual",
          datumPlacanja: new Date().toISOString().split('T')[0]
        }),
      });

      if (res.ok) {
        ucitajPodatke();
      } else {
        console.error("Greška pri označavanju hostinga kao plaćenog");
      }
    } catch (error) {
      console.error("Greška:", error);
    }
  };

  const oznaciPlacenoOsnovniGoogleAds = async (kampanjaId: string, datumPlacanja?: string) => {
    try {
      const res = await fetch("/api/google-ads/oznaciPlaceno", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kampanjaId,
          tipIznosa: "osnovni",
          datumPlacanja: datumPlacanja || new Date().toISOString().split('T')[0],
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
    nastavakId: string | null,
    datumPocetka: string,
    iznos: number,
    datumPlacanja?: string
  ) => {
    try {
      const res = await fetch("/api/google-ads/oznaciPlaceno", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kampanjaId,
          tipIznosa: "nastavak",
          nastavakId,
          datumPocetka,
          iznos,
          datumPlacanja: datumPlacanja || new Date().toISOString().split('T')[0],
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

  const ponistiPlacenoOsnovniGoogleAds = async (kampanjaId: string) => {
    try {
      const res = await fetch("/api/google-ads/ponistiPlaceno", {
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
        console.error("Greška pri poništavanju plaćanja osnovnog iznosa");
      }
    } catch (error) {
      console.error("Greška:", error);
    }
  };

  const ponistiPlacenoNastavakGoogleAds = async (
    kampanjaId: string,
    nastavakId: string
  ) => {
    try {
      const res = await fetch("/api/google-ads/ponistiPlaceno", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kampanjaId,
          tipIznosa: "nastavak",
          nastavakId,
        }),
      });

      if (res.ok) {
        ucitajPodatke();
      } else {
        console.error("Greška pri poništavanju plaćanja nastavka");
      }
    } catch (error) {
      console.error("Greška:", error);
    }
  };

  const toggleAktivnaGoogleAds = async (kampanjaId: string, aktivna: boolean, datum?: string) => {
    try {
      const res = await fetch("/api/google-ads/toggleAktivna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kampanjaId,
          aktivna,
          datum,
        }),
      });

      if (res.ok) {
        ucitajPodatke();
      } else {
        console.error("Greška pri ažuriranju statusa kampanje");
      }
    } catch (error) {
      console.error("Greška:", error);
    }
  };

  const handleKupacKlik = async (kupacId: string) => {
    // Traži kupca i u normalnim i u arhiviranim kupcima
    let kupac = kupci.find((k) => k._id === kupacId);
    if (!kupac) {
      kupac = arhiviraniKupci.find((k) => k._id === kupacId);
    }

    // Ako kupac nije pronađen u učitanim listama, pokušaj da ga učitaš direktno
    if (!kupac) {
      try {
        const res = await fetch(`/api/kupci/${kupacId}`);
        if (res.ok) {
          kupac = await res.json();
        }
      } catch (error) {
        console.error("Greška pri učitavanju kupca:", error);
      }
    }

    if (kupac) {
      setIzabraniKupacZaDetalje(kupac);
      setKupacDetaljiModalOpen(true);
    } else {
      alert(`Kupac sa ID-om ${kupacId} nije pronađen.`);
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
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
              Admin Panel
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Upravljanje klijentima, ratama i hostingom
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm sm:text-base"
          >
            Odjavi se
          </button>
        </div>

        {/* Statistika */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h3 className="text-sm sm:text-lg font-semibold text-gray-700 mb-2">
              Ukupno klijenata
            </h3>
            <p className="text-2xl sm:text-3xl font-bold text-indigo-600">
              {kupciTotal || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h3 className="text-sm sm:text-lg font-semibold text-gray-700 mb-2">
              Neplaćene rate
            </h3>
            <p className="text-2xl sm:text-3xl font-bold text-red-600">
              {rate?.filter((r) => !r.placeno)?.length || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h3 className="text-sm sm:text-lg font-semibold text-gray-700 mb-2">
              Ukupan dug
            </h3>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-600">
              {(
                rate
                  ?.filter((r) => !r.placeno)
                  ?.reduce((sum, r) => sum + r.iznos, 0) || 0
              ).toLocaleString("sr-RS")}{" "}
              <span className="text-base sm:text-lg">RSD</span>
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h3 className="text-sm sm:text-lg font-semibold text-gray-700 mb-2">
              Aktivne kampanje
            </h3>
            <p className="text-2xl sm:text-3xl font-bold text-green-600">
              {kampanje?.length || 0}
            </p>
          </div>
        </div>

        {/* Tabovi i Dugmad */}
        <div className="mb-6">
          {/* Dugmad za dodavanje - iznad tabova */}
          <div className="mb-4 flex justify-end">
            {activeTab === "kupci" && (
              <button
                onClick={() => setKupcaModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
              >
                + Dodaj Klijenta
              </button>
            )}
            {activeTab === "rate" && (
              <button
                onClick={() => setRatuModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
                disabled={kupci.length === 0}
              >
                + Dodaj Ratu
              </button>
            )}
            {activeTab === "hosting" && (
              <button
                onClick={() => setHostingModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
                disabled={kupci.length === 0}
              >
                + Dodaj Hosting
              </button>
            )}
            {activeTab === "googleads" && (
              <button
                onClick={() => setGoogleAdsModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
                disabled={kupci.length === 0}
              >
                + Dodaj Google Ads Kampanju
              </button>
            )}
          </div>

          {/* Tabovi sa horizontal scroll */}
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="-mb-px flex space-x-4 sm:space-x-8 min-w-max">
              <button
                onClick={() => setActiveTab("kupci")}
                className={`${
                  activeTab === "kupci"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Klijenti ({kupciTotal || 0})
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
                🗄️ Arhivirani ({arhiviraniKupciTotal || 0})
              </button>
            </nav>
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
              currentPage={kupciPage}
              totalPages={kupciTotalPages}
              totalItems={kupciTotal}
              itemsPerPage={kupciLimit}
              onPageChange={(page) => setKupciPage(page)}
              onItemsPerPageChange={(limit) => {
                setKupciLimit(limit);
                setKupciPage(1); // Reset na prvu stranicu
              }}
              onSearchChange={(search) => {
                setKupciSearch(search);
                setKupciPage(1); // Reset na prvu stranicu
              }}
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
              onOznaciPlaceno={oznaciPlacenoHosting}
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
              onPonistiPlacenoOsnovni={ponistiPlacenoOsnovniGoogleAds}
              onPonistiPlacenoNastavak={ponistiPlacenoNastavakGoogleAds}
              onToggleAktivna={toggleAktivnaGoogleAds}
              onKupacKlik={handleKupacKlik}
            />
          )}
          {activeTab === "arhivirani" && (
            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  📦 Arhivirani klijenti i njihova evidencija
                </h3>
                <p className="text-sm text-red-700">
                  Ovo su klijenti koji ne plaćaju ili su na drugom načinu označeni za arhiviranje.
                  Njihova evidencija (kupci, rate, hosting, Google Ads) se čuva ali ne pojavljuje u normalnom pregledu.
                </p>
              </div>

              {/* Arhivirani kupci */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  Kupci ({arhiviraniKupciTotal})
                </h3>
                <KupciTabela
                  kupci={arhiviraniKupci}
                  onKupacKlik={handleKupacKlik}
                  onEdit={handleEditKupac}
                  onDelete={handleDeleteKupac}
                  currentPage={arhiviraniKupciPage}
                  totalPages={arhiviraniKupciTotalPages}
                  totalItems={arhiviraniKupciTotal}
                  itemsPerPage={arhiviraniKupciLimit}
                  onPageChange={(page) => setArhiviraniKupciPage(page)}
                  onItemsPerPageChange={(limit) => {
                    setArhiviraniKupciLimit(limit);
                    setArhiviraniKupciPage(1); // Reset na prvu stranicu
                  }}
                  onSearchChange={(search) => {
                    setArhiviraniKupciSearch(search);
                    setArhiviraniKupciPage(1); // Reset na prvu stranicu
                  }}
                />
              </div>

              {/* Arhivirane rate */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  Rate ({arhiviraneRate.length})
                </h3>
                <RateTabela
                  rate={arhiviraneRate}
                  onOznaciPlaceno={oznaciPlaceno}
                  onResetujPodsetnik={resetujPodsetnikRata}
                  onEdit={handleEditRata}
                  onDelete={handleDeleteRata}
                  onKupacKlik={handleKupacKlik}
                />
              </div>

              {/* Arhivirani hosting */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  Hosting ({arhiviraniHosting.length})
                </h3>
                <HostingTabela
                  hosting={arhiviraniHosting}
                  onResetujPodsetnik={resetujPodsetnikHosting}
                  onOznaciPlaceno={oznaciPlacenoHosting}
                  onEdit={handleEditHosting}
                  onDelete={handleDeleteHosting}
                  onKupacKlik={handleKupacKlik}
                />
              </div>

              {/* Arhivirane Google Ads kampanje */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  Google Ads ({arhiviraneKampanje.length})
                </h3>
                <GoogleAdsTabela
                  kampanje={arhiviraneKampanje}
                  onEdit={handleEditGoogleAds}
                  onDelete={handleDeleteGoogleAds}
                  onOznaciPlacenoOsnovni={oznaciPlacenoOsnovniGoogleAds}
                  onOznaciPlacenoNastavak={oznaciPlacenoNastavakGoogleAds}
                  onPonistiPlacenoOsnovni={ponistiPlacenoOsnovniGoogleAds}
                  onPonistiPlacenoNastavak={ponistiPlacenoNastavakGoogleAds}
                  onToggleAktivna={toggleAktivnaGoogleAds}
                  onKupacKlik={handleKupacKlik}
                />
              </div>
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
