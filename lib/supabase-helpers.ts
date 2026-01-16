// Supabase helper funkcije za pristup podacima
// Zamenjuje MongoDB modele

import supabase from './supabase';

// =====================================================
// KUPCI
// =====================================================

export interface Kupac {
  id: string;
  ime: string;
  firma?: string | null;
  email: string;
  email2?: string | null;
  telefon: string;
  telefon2?: string | null;
  nacin_placanja?: 'fiskalni' | 'faktura' | null;
  domen?: string | null;
  arhiviran?: boolean;
  created_at: string;
  updated_at: string;
}

export async function getKupci(includeArhivirani = false) {
  let query = supabase
    .from('kupci')
    .select('*')
    .order('created_at', { ascending: false });

  // Podrazumevano ne prikazujemo arhivirane kupce
  if (!includeArhivirani) {
    query = query.eq('arhiviran', false);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Mapiranje za kompatibilnost sa frontend-om (snake_case -> camelCase i id -> _id)
  return data.map((kupac) => ({
    _id: kupac.id,
    ime: kupac.ime,
    firma: kupac.firma,
    email: kupac.email,
    email2: kupac.email2,
    telefon: kupac.telefon,
    telefon2: kupac.telefon2,
    nacinPlacanja: kupac.nacin_placanja,
    domen: kupac.domen,
    arhiviran: kupac.arhiviran,
    created_at: kupac.created_at,
    updated_at: kupac.updated_at,
  }));
}

export async function getArhiviraniKupci() {
  const { data, error } = await supabase
    .from('kupci')
    .select('*')
    .eq('arhiviran', true)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Mapiranje za kompatibilnost sa frontend-om
  return data.map((kupac) => ({
    _id: kupac.id,
    ime: kupac.ime,
    firma: kupac.firma,
    email: kupac.email,
    email2: kupac.email2,
    telefon: kupac.telefon,
    telefon2: kupac.telefon2,
    nacinPlacanja: kupac.nacin_placanja,
    domen: kupac.domen,
    arhiviran: kupac.arhiviran,
    created_at: kupac.created_at,
    updated_at: kupac.updated_at,
  }));
}

export async function arhivirajKupca(id: string, arhiviran: boolean) {
  const { data, error } = await supabase
    .from('kupci')
    .update({ arhiviran })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getKupacById(id: string) {
  const { data, error } = await supabase
    .from('kupci')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Kupac;
}

export async function createKupac(kupac: Omit<Kupac, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('kupci')
    .insert(kupac)
    .select()
    .single();

  if (error) throw error;
  return data as Kupac;
}

export async function updateKupac(id: string, updates: Partial<Omit<Kupac, 'id' | 'created_at' | 'updated_at'>>) {
  const { data, error } = await supabase
    .from('kupci')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Kupac;
}

export async function deleteKupac(id: string) {
  const { error } = await supabase
    .from('kupci')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// =====================================================
// RATE
// =====================================================

export interface Rata {
  id: string;
  kupac_id: string;
  iznos: number;
  datum_dospeca: string;
  placeno: boolean;
  datum_placanja?: string | null;
  nacin_placanja?: 'racun1' | 'racun2' | 'manual' | null;
  podsetnik_poslat: boolean;
  created_at: string;
  updated_at: string;
  kupacId?: Kupac | null; // Za populate
}

export async function getRate(filters?: { kupac_id?: string; placeno?: boolean; includeArhivirani?: boolean }) {
  let query = supabase
    .from('rate')
    .select(`
      *,
      kupci (*)
    `)
    .order('datum_dospeca', { ascending: true });

  if (filters?.kupac_id) {
    query = query.eq('kupac_id', filters.kupac_id);
  }

  if (filters?.placeno !== undefined) {
    query = query.eq('placeno', filters.placeno);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Mapiranje za kompatibilnost sa frontend-om (snake_case -> camelCase, id -> _id)
  let mapped = data.map((rata) => ({
    _id: rata.id,
    kupacId: rata.kupci ? {
      _id: rata.kupci.id,
      ime: rata.kupci.ime,
      email: rata.kupci.email,
      email2: rata.kupci.email2,
      telefon: rata.kupci.telefon,
      telefon2: rata.kupci.telefon2,
      firma: rata.kupci.firma,
      nacinPlacanja: rata.kupci.nacin_placanja,
      domen: rata.kupci.domen,
      arhiviran: rata.kupci.arhiviran,
    } : null,
    iznos: rata.iznos,
    datumDospeca: rata.datum_dospeca,
    placeno: rata.placeno,
    datumPlacanja: rata.datum_placanja,
    nacinPlacanja: rata.nacin_placanja,
    podsetnikPoslat: rata.podsetnik_poslat,
  }));

  // Podrazumevano filtriramo rate arhiviranih kupaca
  if (!filters?.includeArhivirani) {
    mapped = mapped.filter((rata) => !rata.kupacId?.arhiviran);
  }

  return mapped;
}

export async function getArhiviraneRate() {
  let query = supabase
    .from('rate')
    .select(`
      *,
      kupci (*)
    `)
    .eq('kupci.arhiviran', true)
    .order('datum_dospeca', { ascending: true });

  const { data, error } = await query;

  if (error) throw error;

  return data.map((rata) => ({
    _id: rata.id,
    kupacId: rata.kupci ? {
      _id: rata.kupci.id,
      ime: rata.kupci.ime,
      email: rata.kupci.email,
      email2: rata.kupci.email2,
      telefon: rata.kupci.telefon,
      telefon2: rata.kupci.telefon2,
      firma: rata.kupci.firma,
      nacinPlacanja: rata.kupci.nacin_placanja,
      domen: rata.kupci.domen,
      arhiviran: rata.kupci.arhiviran,
    } : null,
    iznos: rata.iznos,
    datumDospeca: rata.datum_dospeca,
    placeno: rata.placeno,
    datumPlacanja: rata.datum_placanja,
    nacinPlacanja: rata.nacin_placanja,
    podsetnikPoslat: rata.podsetnik_poslat,
  })).filter((rata) => rata.kupacId?.arhiviran);
}

export async function getRataById(id: string) {
  const { data, error } = await supabase
    .from('rate')
    .select(`
      *,
      kupci (*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;

  return {
    ...data,
    kupacId: data.kupci,
  };
}

export async function createRata(rata: Omit<Rata, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('rate')
    .insert(rata)
    .select()
    .single();

  if (error) throw error;
  return data as Rata;
}

export async function updateRata(id: string, updates: Partial<Omit<Rata, 'id' | 'created_at' | 'updated_at'>>) {
  const { data, error } = await supabase
    .from('rate')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Rata;
}

export async function deleteRata(id: string) {
  const { error } = await supabase
    .from('rate')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// =====================================================
// HOSTING
// =====================================================

export interface Hosting {
  id: string;
  kupac_id: string;
  datum_pocetka?: string | null;
  datum_obnavljanja: string;
  podsetnik_poslat: boolean;
  created_at: string;
  updated_at: string;
  kupacId?: Kupac | null; // Za populate
}

export async function getHosting(filters?: { kupac_id?: string; includeArhivirani?: boolean }) {
  let query = supabase
    .from('hosting')
    .select(`
      *,
      kupci (*)
    `)
    .order('datum_obnavljanja', { ascending: true });

  if (filters?.kupac_id) {
    query = query.eq('kupac_id', filters.kupac_id);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Mapiranje za kompatibilnost sa frontend-om (snake_case -> camelCase, id -> _id)
  let mapped = data.map((host) => ({
    _id: host.id,
    kupacId: host.kupci ? {
      _id: host.kupci.id,
      ime: host.kupci.ime,
      email: host.kupci.email,
      email2: host.kupci.email2,
      telefon: host.kupci.telefon,
      telefon2: host.kupci.telefon2,
      firma: host.kupci.firma,
      nacinPlacanja: host.kupci.nacin_placanja,
      domen: host.kupci.domen,
      arhiviran: host.kupci.arhiviran,
    } : null,
    datumPocetka: host.datum_pocetka,
    datumObnavljanja: host.datum_obnavljanja,
    podsetnikPoslat: host.podsetnik_poslat,
  }));

  // Podrazumevano filtriramo hosting arhiviranih kupaca
  if (!filters?.includeArhivirani) {
    mapped = mapped.filter((host) => !host.kupacId?.arhiviran);
  }

  return mapped;
}

export async function getArhiviraniHosting() {
  let query = supabase
    .from('hosting')
    .select(`
      *,
      kupci (*)
    `)
    .eq('kupci.arhiviran', true)
    .order('datum_obnavljanja', { ascending: true });

  const { data, error } = await query;

  if (error) throw error;

  return data.map((host) => ({
    _id: host.id,
    kupacId: host.kupci ? {
      _id: host.kupci.id,
      ime: host.kupci.ime,
      email: host.kupci.email,
      email2: host.kupci.email2,
      telefon: host.kupci.telefon,
      telefon2: host.kupci.telefon2,
      firma: host.kupci.firma,
      nacinPlacanja: host.kupci.nacin_placanja,
      domen: host.kupci.domen,
      arhiviran: host.kupci.arhiviran,
    } : null,
    datumPocetka: host.datum_pocetka,
    datumObnavljanja: host.datum_obnavljanja,
    podsetnikPoslat: host.podsetnik_poslat,
  })).filter((host) => host.kupacId?.arhiviran);
}

export async function getHostingById(id: string) {
  const { data, error } = await supabase
    .from('hosting')
    .select(`
      *,
      kupci (*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;

  return {
    ...data,
    kupacId: data.kupci,
  };
}

export async function createHosting(hosting: Omit<Hosting, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('hosting')
    .insert(hosting)
    .select()
    .single();

  if (error) throw error;
  return data as Hosting;
}

export async function updateHosting(id: string, updates: Partial<Omit<Hosting, 'id' | 'created_at' | 'updated_at'>>) {
  const { data, error } = await supabase
    .from('hosting')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Hosting;
}

export async function deleteHosting(id: string) {
  const { error } = await supabase
    .from('hosting')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// =====================================================
// GOOGLE ADS
// =====================================================

export interface GoogleAdsNastavak {
  id: string;
  google_ads_id: string;
  datum: string;
  iznos: number;
  placeno: boolean;
  created_at: string;
}

export interface GoogleAds {
  id: string;
  kupac_id: string;
  ime_kampanje: string;
  ime_google_naloga: string;
  datum_pocetka: string;
  datum_isteka: string;
  iznos: number;
  placeno: boolean;
  created_at: string;
  updated_at: string;
  nastavci?: GoogleAdsNastavak[];
  kupacId?: Kupac | null; // Za populate
}

export async function getGoogleAds(filters?: { kupac_id?: string }) {
  let query = supabase
    .from('google_ads')
    .select(`
      *,
      kupci (*),
      google_ads_nastavci (*)
    `)
    .order('datum_isteka', { ascending: true });

  if (filters?.kupac_id) {
    query = query.eq('kupac_id', filters.kupac_id);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Mapiranje za kompatibilnost sa frontend-om (snake_case -> camelCase, id -> _id)
  return data.map((ads) => ({
    _id: ads.id,
    kupacId: ads.kupci ? {
      _id: ads.kupci.id,
      ime: ads.kupci.ime,
      email: ads.kupci.email,
      email2: ads.kupci.email2,
      telefon: ads.kupci.telefon,
      telefon2: ads.kupci.telefon2,
      firma: ads.kupci.firma,
      nacinPlacanja: ads.kupci.nacin_placanja,
      domen: ads.kupci.domen,
    } : null,
    imeKampanje: ads.ime_kampanje,
    imeGoogleNaloga: ads.ime_google_naloga,
    datumPocetka: ads.datum_pocetka,
    datumIsteka: ads.datum_isteka,
    iznos: ads.iznos,
    placeno: ads.placeno,
    nastavci: ads.google_ads_nastavci ? ads.google_ads_nastavci.map((n: GoogleAdsNastavak) => ({
      datum: n.datum,
      iznos: n.iznos,
      placeno: n.placeno,
    })) : [],
  }));
}

export async function getGoogleAdsById(id: string) {
  const { data, error } = await supabase
    .from('google_ads')
    .select(`
      *,
      kupci (*),
      google_ads_nastavci (*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;

  return {
    ...data,
    nastavci: data.google_ads_nastavci,
    kupacId: data.kupci,
  };
}

export async function createGoogleAds(ads: Omit<GoogleAds, 'id' | 'created_at' | 'updated_at' | 'nastavci'>) {
  const { data, error } = await supabase
    .from('google_ads')
    .insert(ads)
    .select()
    .single();

  if (error) throw error;
  return data as GoogleAds;
}

export async function updateGoogleAds(id: string, updates: Partial<Omit<GoogleAds, 'id' | 'created_at' | 'updated_at' | 'nastavci'>>) {
  const { data, error } = await supabase
    .from('google_ads')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as GoogleAds;
}

export async function deleteGoogleAds(id: string) {
  const { error } = await supabase
    .from('google_ads')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Nastavci funkcije
export async function addGoogleAdsNastavak(google_ads_id: string, nastavak: Omit<GoogleAdsNastavak, 'id' | 'google_ads_id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('google_ads_nastavci')
    .insert({
      google_ads_id,
      ...nastavak,
    })
    .select()
    .single();

  if (error) throw error;
  return data as GoogleAdsNastavak;
}

export async function updateGoogleAdsNastavak(id: string, updates: Partial<Omit<GoogleAdsNastavak, 'id' | 'google_ads_id' | 'created_at'>>) {
  const { data, error } = await supabase
    .from('google_ads_nastavci')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as GoogleAdsNastavak;
}

export async function deleteGoogleAdsNastavak(id: string) {
  const { error } = await supabase
    .from('google_ads_nastavci')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
