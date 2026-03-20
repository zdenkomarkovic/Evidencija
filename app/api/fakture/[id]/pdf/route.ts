import { NextRequest, NextResponse } from 'next/server';
import { getFakturaById } from '@/lib/supabase-helpers';
import React from 'react';
import { renderToBuffer, Document, Page, Text, View, Image, StyleSheet, Font } from '@react-pdf/renderer';
import fs from 'fs';

Font.register({
  family: 'Arial',
  fonts: [
    { src: 'C:/Windows/Fonts/arial.ttf', fontWeight: 'normal' },
    { src: 'C:/Windows/Fonts/arialbd.ttf', fontWeight: 'bold' },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Arial',
    fontSize: 9,
    padding: 30,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottom: '2pt solid #1a1a2e',
    paddingBottom: 12,
  },
  firmaBlok: {
    flex: 1,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 6,
    objectFit: 'contain',
  },
  firmaNaziv: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 3,
    color: '#1a1a2e',
  },
  firmaPodaci: {
    fontSize: 8,
    color: '#444',
    marginBottom: 2,
  },
  naslovBlok: {
    alignItems: 'flex-end',
    flex: 1,
  },
  naslov: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 5,
  },
  brojFakture: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 3,
  },
  datumPodaci: {
    fontSize: 8,
    color: '#444',
    marginBottom: 2,
  },
  kupacSekcija: {
    flexDirection: 'row',
    marginBottom: 18,
    gap: 20,
  },
  kupacBlok: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 4,
  },
  kupacNaslov: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  kupacNaziv: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 3,
  },
  kupacPodaci: {
    fontSize: 8,
    color: '#444',
    marginBottom: 2,
  },
  // TABELA
  tabela: {
    marginBottom: 15,
  },
  tabelaHeader: {
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    padding: '5 4',
    borderRadius: 2,
  },
  tabelaHeaderText: {
    color: '#ffffff',
    fontSize: 6.5,
    fontWeight: 'bold',
  },
  tabelaRed: {
    flexDirection: 'row',
    borderBottom: '0.5pt solid #e5e7eb',
    padding: '4 4',
  },
  tabelaRedSivi: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderBottom: '0.5pt solid #e5e7eb',
    padding: '4 4',
  },
  tabelaCell: {
    fontSize: 7,
    color: '#333',
  },
  // Kolone tabele - redosled: Rb | Sifra | Naziv | KOL | Cena bez PDV | Iznos PDV | Vrednost sa PDV | % | Rabat | Barkod | JM | PDV
  colRb:            { width: '3.5%' },
  colSifra:         { width: '7%' },
  colNaziv:         { width: '20%' },
  colKol:           { width: '6%', textAlign: 'right' },
  colCenaBezPdv:    { width: '11%', textAlign: 'right' },
  colIznosPdv:      { width: '9%', textAlign: 'right' },
  colVrednostSaPdv: { width: '12%', textAlign: 'right' },
  colPdvProc:       { width: '4%', textAlign: 'right' },
  colRabat:         { width: '8%', textAlign: 'right' },
  colBarkod:        { width: '9%' },
  colJm:            { width: '4.5%' },
  colPdv:           { width: '6%' },
  // SPECIFIKACIJA POREZA
  specSekcija: {
    marginBottom: 15,
  },
  specNaslov: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  specHeader: {
    flexDirection: 'row',
    backgroundColor: '#e5e7eb',
    padding: '4 6',
  },
  specRed: {
    flexDirection: 'row',
    borderBottom: '0.5pt solid #e5e7eb',
    padding: '4 6',
  },
  specHeaderText: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#333',
  },
  specCell: {
    fontSize: 7,
    color: '#333',
  },
  specColDatum:   { width: '13%' },
  specColBroj:    { width: '18%' },
  specColIznos:   { width: '14%', textAlign: 'right' },
  specColOsnov20: { width: '14%', textAlign: 'right' },
  specColPdv20:   { width: '14%', textAlign: 'right' },
  specColOsnov10: { width: '13%', textAlign: 'right' },
  specColPdv10:   { width: '14%', textAlign: 'right' },
  // SUMA
  sumaSekcija: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 15,
  },
  sumaBlok: {
    width: '40%',
    borderTop: '1pt solid #e5e7eb',
  },
  sumaRed: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: '4 8',
    borderBottom: '0.5pt solid #e5e7eb',
  },
  sumaLabel: {
    fontSize: 8,
    color: '#555',
  },
  sumaVrednost: {
    fontSize: 8,
    color: '#333',
    fontWeight: 'bold',
  },
  sumaUkupnoRed: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: '7 8',
    backgroundColor: '#1a1a2e',
    borderRadius: 2,
    marginTop: 4,
  },
  sumaUkupnoLabel: {
    fontSize: 9,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  sumaUkupnoVrednost: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  napomenaBlok: {
    marginBottom: 20,
    padding: 8,
    backgroundColor: '#fffbeb',
    borderLeft: '3pt solid #f59e0b',
    borderRadius: 2,
  },
  napomenaNaslov: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 3,
  },
  napomenaText: {
    fontSize: 8,
    color: '#78350f',
  },
  pdvNapomena: {
    marginBottom: 15,
    padding: 7,
    backgroundColor: '#f0fdf4',
    borderLeft: '3pt solid #16a34a',
  },
  pdvText: {
    fontSize: 7.5,
    color: '#166534',
  },
  footer: {
    marginTop: 'auto',
    borderTop: '1pt solid #e5e7eb',
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerBlok: {
    alignItems: 'center',
    width: '30%',
  },
  footerLinija: {
    borderTop: '1pt solid #333',
    width: '100%',
    marginBottom: 4,
  },
  footerLabel: {
    fontSize: 7.5,
    color: '#666',
  },
  racunBlok: {
    marginBottom: 12,
  },
  racunNaslov: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  racunText: {
    fontSize: 8,
    color: '#333',
    marginBottom: 1,
  },
});

function formatIznos(iznos: number): string {
  return iznos.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDatum(datum: string): string {
  const d = new Date(datum);
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}.`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const faktura = await getFakturaById(id);

    const logoPath = 'c:\\Users\\DELL\\Pictures\\ChatGPT Image Oct 26, 2025, 02_32_36 AM.png';
    const logoBase64 = fs.existsSync(logoPath)
      ? `data:image/png;base64,${fs.readFileSync(logoPath).toString('base64')}`
      : null;

    const firma = {
      naziv: process.env.FIRMA_NAZIV || 'Vaša Firma d.o.o.',
      pib: process.env.FIRMA_PIB || '123456789',
      maticniBroj: process.env.FIRMA_MATICNI_BROJ || '12345678',
      adresa: process.env.FIRMA_ADRESA || 'Ulica i broj 1',
      grad: process.env.FIRMA_GRAD || '11000 Beograd',
      racun1: process.env.FIRMA_ZIRO_RACUN_1 || '',
      banka1: process.env.FIRMA_BANKA_1 || '',
      racun2: process.env.FIRMA_ZIRO_RACUN_2 || '',
      banka2: process.env.FIRMA_BANKA_2 || '',
      mestoIzdavanja: process.env.FIRMA_MESTO_IZDAVANJA || 'Beograd',
      telefon: process.env.FIRMA_TELEFON || '',
    };

    const kupac = faktura.kupacId as {
      ime: string;
      firma?: string;
      pib?: string;
      maticnibroj?: string;
      adresa?: string;
      grad?: string;
      postanskiBroj?: string;
    } | null;

    const stavke = faktura.stavke as {
      _id: string;
      naziv: string;
      jedinicaMere: string;
      kolicina: number;
      cena: number;
      iznos: number;
      redniBroj: number;
      sifra?: string;
      pdvStopa?: number;
      rabat?: number;
      barkod?: string;
    }[];

    // Izracunavanja za sumu
    const ukupnoBezPdv = stavke.reduce((sum, s) => sum + s.iznos, 0);
    const ukupnoIznosPdv = stavke.reduce((sum, s) => {
      const stopa = s.pdvStopa || 0;
      return sum + (s.iznos * stopa / 100);
    }, 0);
    const ukupnoRabat = stavke.reduce((sum, s) => sum + (s.rabat || 0), 0);

    const doc = React.createElement(
      Document,
      null,
      React.createElement(
        Page,
        { size: 'A4', style: styles.page },

        // HEADER
        React.createElement(
          View,
          { style: styles.header },
          React.createElement(
            View,
            { style: styles.firmaBlok },
            logoBase64 ? React.createElement(Image, { style: styles.logo, src: logoBase64 }) : null,
            React.createElement(Text, { style: styles.firmaNaziv }, firma.naziv),
            React.createElement(Text, { style: styles.firmaPodaci }, firma.adresa),
            React.createElement(Text, { style: styles.firmaPodaci }, firma.grad),
            React.createElement(Text, { style: styles.firmaPodaci }, `PIB: ${firma.pib}  |  Mat. br.: ${firma.maticniBroj}`),
            firma.telefon ? React.createElement(Text, { style: styles.firmaPodaci }, `Tel: ${firma.telefon}`) : null,
            firma.racun1 ? React.createElement(Text, { style: styles.firmaPodaci }, `Racun: ${firma.racun1}${firma.banka1 ? ` (${firma.banka1})` : ''}`) : null
          ),
          React.createElement(
            View,
            { style: styles.naslovBlok },
            React.createElement(Text, { style: styles.naslov }, 'RACUN-OTPREMNICA'),
            React.createElement(Text, { style: styles.brojFakture }, `Br. ${faktura.brojFakture}`),
            React.createElement(Text, { style: styles.datumPodaci }, `Datum izdavanja: ${formatDatum(faktura.datumIzdavanja)}`),
            React.createElement(Text, { style: styles.datumPodaci }, `Datum prometa: ${formatDatum(faktura.datumIzdavanja)}`),
            React.createElement(Text, { style: styles.datumPodaci }, `Datum valute: ${formatDatum(faktura.datumValute)}`),
            React.createElement(Text, { style: styles.datumPodaci }, `Mesto izdavanja: ${firma.mestoIzdavanja}`)
          )
        ),

        // PRIMALAC RACUNA
        React.createElement(
          View,
          { style: styles.kupacSekcija },
          React.createElement(
            View,
            { style: styles.kupacBlok },
            React.createElement(Text, { style: styles.kupacNaslov }, 'PRIMALAC RACUNA'),
            React.createElement(Text, { style: styles.kupacNaziv }, kupac?.firma || kupac?.ime || ''),
            kupac?.adresa ? React.createElement(Text, { style: styles.kupacPodaci }, kupac.adresa) : null,
            (kupac?.postanskiBroj || kupac?.grad)
              ? React.createElement(Text, { style: styles.kupacPodaci }, `${kupac?.postanskiBroj || ''} ${kupac?.grad || ''}`.trim())
              : null,
            kupac?.pib ? React.createElement(Text, { style: styles.kupacPodaci }, `PIB: ${kupac.pib}`) : null,
            kupac?.maticnibroj ? React.createElement(Text, { style: styles.kupacPodaci }, `Mat. br.: ${kupac.maticnibroj}`) : null
          )
        ),

        // TABELA STAVKI
        React.createElement(
          View,
          { style: styles.tabela },
          React.createElement(
            View,
            { style: styles.tabelaHeader },
            React.createElement(Text, { style: [styles.tabelaHeaderText, styles.colRb] }, 'Rb.'),
            React.createElement(Text, { style: [styles.tabelaHeaderText, styles.colSifra] }, 'Sifra'),
            React.createElement(Text, { style: [styles.tabelaHeaderText, styles.colNaziv] }, 'Naziv artikla'),
            React.createElement(Text, { style: [styles.tabelaHeaderText, styles.colKol] }, 'KOL'),
            React.createElement(Text, { style: [styles.tabelaHeaderText, styles.colCenaBezPdv] }, 'Cena bez PDV'),
            React.createElement(Text, { style: [styles.tabelaHeaderText, styles.colIznosPdv] }, 'Iznos PDV'),
            React.createElement(Text, { style: [styles.tabelaHeaderText, styles.colVrednostSaPdv] }, 'Vrednost sa PDV'),
            React.createElement(Text, { style: [styles.tabelaHeaderText, styles.colPdvProc] }, '%'),
            React.createElement(Text, { style: [styles.tabelaHeaderText, styles.colRabat] }, 'Rabat'),
            React.createElement(Text, { style: [styles.tabelaHeaderText, styles.colBarkod] }, 'Barkod'),
            React.createElement(Text, { style: [styles.tabelaHeaderText, styles.colJm] }, 'JM'),
            React.createElement(Text, { style: [styles.tabelaHeaderText, styles.colPdv] }, 'PDV')
          ),
          ...stavke.map((s, idx) => {
            const stopa = s.pdvStopa || 0;
            const iznosPdv = s.iznos * stopa / 100;
            const vrednostSaPdv = s.iznos + iznosPdv;
            return React.createElement(
              View,
              { key: s._id, style: idx % 2 === 0 ? styles.tabelaRed : styles.tabelaRedSivi },
              React.createElement(Text, { style: [styles.tabelaCell, styles.colRb] }, `${s.redniBroj}.`),
              React.createElement(Text, { style: [styles.tabelaCell, styles.colSifra] }, s.sifra || ''),
              React.createElement(Text, { style: [styles.tabelaCell, styles.colNaziv] }, s.naziv),
              React.createElement(Text, { style: [styles.tabelaCell, styles.colKol] }, formatIznos(s.kolicina)),
              React.createElement(Text, { style: [styles.tabelaCell, styles.colCenaBezPdv] }, formatIznos(s.cena)),
              React.createElement(Text, { style: [styles.tabelaCell, styles.colIznosPdv] }, formatIznos(iznosPdv)),
              React.createElement(Text, { style: [styles.tabelaCell, styles.colVrednostSaPdv] }, formatIznos(vrednostSaPdv)),
              React.createElement(Text, { style: [styles.tabelaCell, styles.colPdvProc] }, `${stopa}%`),
              React.createElement(Text, { style: [styles.tabelaCell, styles.colRabat] }, formatIznos(s.rabat || 0)),
              React.createElement(Text, { style: [styles.tabelaCell, styles.colBarkod] }, s.barkod || ''),
              React.createElement(Text, { style: [styles.tabelaCell, styles.colJm] }, s.jedinicaMere),
              React.createElement(Text, { style: [styles.tabelaCell, styles.colPdv] }, '')
            );
          })
        ),

        // SPECIFIKACIJA POREZA
        React.createElement(
          View,
          { style: styles.specSekcija },
          React.createElement(Text, { style: styles.specNaslov }, 'Specifikacija poreza'),
          React.createElement(
            View,
            { style: styles.specHeader },
            React.createElement(Text, { style: [styles.specHeaderText, styles.specColDatum] }, 'Datum'),
            React.createElement(Text, { style: [styles.specHeaderText, styles.specColBroj] }, 'Broj racuna'),
            React.createElement(Text, { style: [styles.specHeaderText, styles.specColIznos] }, 'Iznos'),
            React.createElement(Text, { style: [styles.specHeaderText, styles.specColOsnov20] }, 'Osnovica 20%'),
            React.createElement(Text, { style: [styles.specHeaderText, styles.specColPdv20] }, 'Iznos 20%'),
            React.createElement(Text, { style: [styles.specHeaderText, styles.specColOsnov10] }, 'Osnovica 10%'),
            React.createElement(Text, { style: [styles.specHeaderText, styles.specColPdv10] }, 'Iznos 10%')
          ),
          React.createElement(
            View,
            { style: styles.specRed },
            React.createElement(Text, { style: [styles.specCell, styles.specColDatum] }, formatDatum(faktura.datumIzdavanja)),
            React.createElement(Text, { style: [styles.specCell, styles.specColBroj] }, faktura.brojFakture),
            React.createElement(Text, { style: [styles.specCell, styles.specColIznos] }, formatIznos(faktura.ukupanIznos)),
            React.createElement(Text, { style: [styles.specCell, styles.specColOsnov20] }, formatIznos(0)),
            React.createElement(Text, { style: [styles.specCell, styles.specColPdv20] }, formatIznos(0)),
            React.createElement(Text, { style: [styles.specCell, styles.specColOsnov10] }, formatIznos(0)),
            React.createElement(Text, { style: [styles.specCell, styles.specColPdv10] }, formatIznos(0))
          )
        ),

        // SUMA
        React.createElement(
          View,
          { style: styles.sumaSekcija },
          React.createElement(
            View,
            { style: styles.sumaBlok },
            React.createElement(
              View,
              { style: styles.sumaRed },
              React.createElement(Text, { style: styles.sumaLabel }, 'Vrednost bez PDV:'),
              React.createElement(Text, { style: styles.sumaVrednost }, `${formatIznos(ukupnoBezPdv)} RSD`)
            ),
            React.createElement(
              View,
              { style: styles.sumaRed },
              React.createElement(Text, { style: styles.sumaLabel }, 'Iznos PDV:'),
              React.createElement(Text, { style: styles.sumaVrednost }, `${formatIznos(ukupnoIznosPdv)} RSD`)
            ),
            React.createElement(
              View,
              { style: styles.sumaRed },
              React.createElement(Text, { style: styles.sumaLabel }, 'Vrednost sa PDV:'),
              React.createElement(Text, { style: styles.sumaVrednost }, `${formatIznos(faktura.ukupanIznos)} RSD`)
            ),
            React.createElement(
              View,
              { style: styles.sumaRed },
              React.createElement(Text, { style: styles.sumaLabel }, 'Rabat:'),
              React.createElement(Text, { style: styles.sumaVrednost }, `${formatIznos(ukupnoRabat)} RSD`)
            ),
            React.createElement(
              View,
              { style: styles.sumaUkupnoRed },
              React.createElement(Text, { style: styles.sumaUkupnoLabel }, 'UKUPAN IZNOS ZA UPLATU:'),
              React.createElement(Text, { style: styles.sumaUkupnoVrednost }, `${formatIznos(faktura.ukupanIznos)} RSD`)
            )
          )
        ),

        // PDV NAPOMENA
        React.createElement(
          View,
          { style: styles.pdvNapomena },
          React.createElement(
            Text,
            { style: styles.pdvText },
            'Obveznik PDV-a nije u sistemu PDV-a u skladu sa clan. 33. Zakona o PDV-u.'
          )
        ),

        // NAPOMENA
        faktura.napomena
          ? React.createElement(
              View,
              { style: styles.napomenaBlok },
              React.createElement(Text, { style: styles.napomenaNaslov }, 'NAPOMENA:'),
              React.createElement(Text, { style: styles.napomenaText }, faktura.napomena)
            )
          : null,

        // RACUNI
        firma.racun1
          ? React.createElement(
              View,
              { style: styles.racunBlok },
              React.createElement(Text, { style: styles.racunNaslov }, 'UPLATA NA RACUN:'),
              React.createElement(Text, { style: styles.racunText }, `${firma.racun1}${firma.banka1 ? ` - ${firma.banka1}` : ''}`),
              firma.racun2 ? React.createElement(Text, { style: styles.racunText }, `${firma.racun2}${firma.banka2 ? ` - ${firma.banka2}` : ''}`) : null
            )
          : null,

        // FOOTER - POTPISI
        React.createElement(
          View,
          { style: styles.footer },
          React.createElement(
            View,
            { style: styles.footerBlok },
            React.createElement(View, { style: styles.footerLinija }),
            React.createElement(Text, { style: styles.footerLabel }, 'Primio/la')
          ),
          React.createElement(View, { style: { width: '30%' } }),
          React.createElement(
            View,
            { style: styles.footerBlok },
            React.createElement(View, { style: styles.footerLinija }),
            React.createElement(Text, { style: styles.footerLabel }, 'Primio/la')
          )
        )
      )
    );

    const buffer = await renderToBuffer(doc);

    const fileName = `faktura-${faktura.brojFakture.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': String(buffer.length),
      },
    });
  } catch (error) {
    console.error('Greška pri generisanju PDF-a:', error);
    return NextResponse.json(
      { error: 'Greška pri generisanju PDF-a', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
