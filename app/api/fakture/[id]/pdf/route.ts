import { NextRequest, NextResponse } from 'next/server';
import { getFakturaById } from '@/lib/supabase-helpers';
import React from 'react';
import { renderToBuffer, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: 40,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    borderBottom: '2pt solid #1a1a2e',
    paddingBottom: 15,
  },
  firmaBlok: {
    flex: 1,
  },
  firmaNaziv: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
    color: '#1a1a2e',
  },
  firmaPodaci: {
    fontSize: 9,
    color: '#444',
    marginBottom: 2,
  },
  naslovBlok: {
    alignItems: 'flex-end',
    flex: 1,
  },
  naslov: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a2e',
    marginBottom: 6,
  },
  brojFakture: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#2563eb',
    marginBottom: 4,
  },
  datumPodaci: {
    fontSize: 9,
    color: '#444',
    marginBottom: 2,
  },
  kupacSekcija: {
    flexDirection: 'row',
    marginBottom: 25,
    gap: 20,
  },
  kupacBlok: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 4,
  },
  kupacNaslov: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  kupacNaziv: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a2e',
    marginBottom: 3,
  },
  kupacPodaci: {
    fontSize: 9,
    color: '#444',
    marginBottom: 2,
  },
  tabela: {
    marginBottom: 20,
  },
  tabelaHeader: {
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    padding: 8,
    borderRadius: 2,
  },
  tabelaHeaderText: {
    color: '#ffffff',
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
  },
  tabelaRed: {
    flexDirection: 'row',
    borderBottom: '0.5pt solid #e5e7eb',
    padding: '6 8',
  },
  tabelaRedSivi: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderBottom: '0.5pt solid #e5e7eb',
    padding: '6 8',
  },
  tabelaCell: {
    fontSize: 9,
    color: '#333',
  },
  colRb: { width: '5%' },
  colNaziv: { width: '45%' },
  colJm: { width: '10%' },
  colKol: { width: '10%', textAlign: 'right' },
  colCena: { width: '15%', textAlign: 'right' },
  colIznos: { width: '15%', textAlign: 'right' },
  ukupnoSekcija: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  ukupnoBlok: {
    width: '35%',
  },
  ukupnoRed: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: '5 8',
    borderBottom: '0.5pt solid #e5e7eb',
  },
  ukupnoRedZavrsni: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: '8',
    backgroundColor: '#1a1a2e',
    borderRadius: 2,
  },
  ukupnoLabel: {
    fontSize: 9,
    color: '#666',
  },
  ukupnoVrednost: {
    fontSize: 9,
    color: '#333',
    fontFamily: 'Helvetica-Bold',
  },
  ukupnoZavrsniLabel: {
    fontSize: 10,
    color: '#ffffff',
    fontFamily: 'Helvetica-Bold',
  },
  ukupnoZavrsniVrednost: {
    fontSize: 11,
    color: '#ffffff',
    fontFamily: 'Helvetica-Bold',
  },
  napomenaBlok: {
    marginBottom: 30,
    padding: 10,
    backgroundColor: '#fffbeb',
    borderLeft: '3pt solid #f59e0b',
    borderRadius: 2,
  },
  napomenaNaslov: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#92400e',
    marginBottom: 4,
  },
  napomenaText: {
    fontSize: 9,
    color: '#78350f',
  },
  pdvNapomena: {
    marginBottom: 20,
    padding: 8,
    backgroundColor: '#f0fdf4',
    borderLeft: '3pt solid #16a34a',
  },
  pdvText: {
    fontSize: 8,
    color: '#166534',
  },
  footer: {
    marginTop: 'auto',
    borderTop: '1pt solid #e5e7eb',
    paddingTop: 15,
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
    fontSize: 8,
    color: '#666',
  },
  racunBlok: {
    marginBottom: 15,
  },
  racunNaslov: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  racunText: {
    fontSize: 9,
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
    }[];

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
            React.createElement(Text, { style: styles.firmaNaziv }, firma.naziv),
            React.createElement(Text, { style: styles.firmaPodaci }, firma.adresa),
            React.createElement(Text, { style: styles.firmaPodaci }, firma.grad),
            React.createElement(Text, { style: styles.firmaPodaci }, `PIB: ${firma.pib}  |  Mat. br.: ${firma.maticniBroj}`)
          ),
          React.createElement(
            View,
            { style: styles.naslovBlok },
            React.createElement(Text, { style: styles.naslov }, 'RACUN-OTPREMNICA'),
            React.createElement(Text, { style: styles.brojFakture }, `Br. ${faktura.brojFakture}`),
            React.createElement(Text, { style: styles.datumPodaci }, `Datum izdavanja: ${formatDatum(faktura.datumIzdavanja)}`),
            React.createElement(Text, { style: styles.datumPodaci }, `Datum valute: ${formatDatum(faktura.datumValute)}`),
            React.createElement(Text, { style: styles.datumPodaci }, `Mesto izdavanja: ${firma.mestoIzdavanja}`)
          )
        ),

        // PRODAVAC / KUPAC
        React.createElement(
          View,
          { style: styles.kupacSekcija },
          React.createElement(
            View,
            { style: styles.kupacBlok },
            React.createElement(Text, { style: styles.kupacNaslov }, 'PRODAVAC'),
            React.createElement(Text, { style: styles.kupacNaziv }, firma.naziv),
            React.createElement(Text, { style: styles.kupacPodaci }, firma.adresa),
            React.createElement(Text, { style: styles.kupacPodaci }, firma.grad),
            React.createElement(Text, { style: styles.kupacPodaci }, `PIB: ${firma.pib}`),
            React.createElement(Text, { style: styles.kupacPodaci }, `Mat. br.: ${firma.maticniBroj}`)
          ),
          React.createElement(
            View,
            { style: styles.kupacBlok },
            React.createElement(Text, { style: styles.kupacNaslov }, 'KUPAC'),
            React.createElement(Text, { style: styles.kupacNaziv }, kupac?.firma || kupac?.ime || ''),
            kupac?.firma ? React.createElement(Text, { style: styles.kupacPodaci }, `Kontakt: ${kupac.ime}`) : null,
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
          // Header
          React.createElement(
            View,
            { style: styles.tabelaHeader },
            React.createElement(Text, { style: [styles.tabelaHeaderText, styles.colRb] }, 'Rb.'),
            React.createElement(Text, { style: [styles.tabelaHeaderText, styles.colNaziv] }, 'Naziv robe/usluge'),
            React.createElement(Text, { style: [styles.tabelaHeaderText, styles.colJm] }, 'J.m.'),
            React.createElement(Text, { style: [styles.tabelaHeaderText, styles.colKol] }, 'Kol.'),
            React.createElement(Text, { style: [styles.tabelaHeaderText, styles.colCena] }, 'Cena (RSD)'),
            React.createElement(Text, { style: [styles.tabelaHeaderText, styles.colIznos] }, 'Iznos (RSD)')
          ),
          // Stavke
          ...stavke.map((s, idx) =>
            React.createElement(
              View,
              { key: s._id, style: idx % 2 === 0 ? styles.tabelaRed : styles.tabelaRedSivi },
              React.createElement(Text, { style: [styles.tabelaCell, styles.colRb] }, String(s.redniBroj)),
              React.createElement(Text, { style: [styles.tabelaCell, styles.colNaziv] }, s.naziv),
              React.createElement(Text, { style: [styles.tabelaCell, styles.colJm] }, s.jedinicaMere),
              React.createElement(Text, { style: [styles.tabelaCell, styles.colKol] }, String(s.kolicina)),
              React.createElement(Text, { style: [styles.tabelaCell, styles.colCena] }, formatIznos(s.cena)),
              React.createElement(Text, { style: [styles.tabelaCell, styles.colIznos] }, formatIznos(s.iznos))
            )
          )
        ),

        // UKUPNO
        React.createElement(
          View,
          { style: styles.ukupnoSekcija },
          React.createElement(
            View,
            { style: styles.ukupnoBlok },
            React.createElement(
              View,
              { style: styles.ukupnoRedZavrsni },
              React.createElement(Text, { style: styles.ukupnoZavrsniLabel }, 'UKUPNO ZA UPLATU:'),
              React.createElement(Text, { style: styles.ukupnoZavrsniVrednost }, `${formatIznos(faktura.ukupanIznos)} RSD`)
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
            React.createElement(Text, { style: styles.footerLabel }, 'Ovlasceno lice prodavca')
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
