'use server';

import React from 'react';
import { renderToBuffer, Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import path from 'path';

Font.register({
  family: 'Arial',
  fonts: [
    { src: path.join(process.cwd(), 'public/fonts/arial.ttf'), fontWeight: 'normal' },
    { src: path.join(process.cwd(), 'public/fonts/arialbd.ttf'), fontWeight: 'bold' },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Arial',
    fontSize: 10,
    padding: 40,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingBottom: 15,
    borderBottom: '2pt solid #1a1a2e',
  },
  firmaBlok: {
    flex: 1,
  },
  firmaNaziv: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  firmaInfo: {
    fontSize: 8.5,
    color: '#555',
    marginBottom: 2,
  },
  naslovBlok: {
    alignItems: 'flex-end',
  },
  naslov: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  brojDatum: {
    fontSize: 9,
    color: '#555',
    marginBottom: 2,
    textAlign: 'right',
  },
  sekcija: {
    marginBottom: 20,
  },
  sekcijaLabel: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  kupacBlok: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 4,
  },
  kupacNaziv: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 3,
  },
  kupacInfo: {
    fontSize: 9,
    color: '#555',
    marginBottom: 2,
  },
  tabelaHeader: {
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    padding: '6 8',
    borderRadius: 2,
    marginBottom: 0,
  },
  tabelaHeaderText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  tabelaRed: {
    flexDirection: 'row',
    borderBottom: '0.5pt solid #e5e7eb',
    padding: '8 8',
    backgroundColor: '#f9fafb',
  },
  tabelaCell: {
    fontSize: 9.5,
    color: '#333',
  },
  colNaziv: { flex: 1 },
  colKol: { width: '12%', textAlign: 'center' },
  colCena: { width: '20%', textAlign: 'right' },
  colIznos: { width: '20%', textAlign: 'right' },
  sumaBlok: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    marginBottom: 20,
  },
  sumaTabela: {
    width: '40%',
  },
  sumaRed: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: '5 8',
    borderBottom: '0.5pt solid #e5e7eb',
  },
  sumaLabel: {
    fontSize: 9,
    color: '#555',
  },
  sumaVrednost: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#333',
  },
  ukupnoRed: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: '8 8',
    backgroundColor: '#1a1a2e',
    borderRadius: 2,
    marginTop: 4,
  },
  ukupnoLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  ukupnoVrednost: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
  },
  racunBlok: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f0f4ff',
    borderLeft: '3pt solid #1a1a2e',
  },
  racunLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  racunText: {
    fontSize: 9,
    color: '#333',
    marginBottom: 2,
  },
  pozivBlok: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#fffbeb',
    borderLeft: '3pt solid #f59e0b',
  },
  pozivLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  pozivBroj: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a1a2e',
    letterSpacing: 1,
  },
  pozivNapomena: {
    fontSize: 7.5,
    color: '#92400e',
    marginTop: 3,
  },
  napomena: {
    fontSize: 8,
    color: '#888',
    marginTop: 10,
    textAlign: 'center',
  },
});

function formatIznos(iznos: number): string {
  return iznos.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDatum(datum: Date): string {
  return `${String(datum.getDate()).padStart(2, '0')}.${String(datum.getMonth() + 1).padStart(2, '0')}.${datum.getFullYear()}.`;
}

interface ProfakturaData {
  broj: string;
  datum: Date;
  datumObnavljanja: Date;
  opisUsluge?: string;
  kupac: {
    ime: string;
    firma?: string | null;
    pib?: string | null;
    adresa?: string | null;
    grad?: string | null;
  };
  iznos: number;
  pozivNaBroj?: string;
  firma: {
    naziv: string;
    pib: string;
    maticniBroj: string;
    adresa: string;
    grad: string;
    racun1: string;
    banka1: string;
    racun2?: string;
    banka2?: string;
    telefon?: string;
  };
}

export async function generisiPozivNaBroj(profakturaBroj: string): Promise<string> {
  return profakturaBroj.replace(/[^0-9]/g, '');
}

export async function generisiProfakturaBuffer(data: ProfakturaData): Promise<Buffer> {
  const { kupac, firma, iznos, pozivNaBroj, opisUsluge = 'Hosting usluga - godišnje održavanje' } = data;

  const jeFirema = !!kupac.firma;
  const prikazIme = kupac.firma || kupac.ime;
  const primaocLabel = jeFirema ? 'Primalac (pravno lice)' : 'Primalac (fizičko lice)';

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
          React.createElement(Text, { style: styles.firmaInfo }, firma.adresa),
          React.createElement(Text, { style: styles.firmaInfo }, firma.grad),
          React.createElement(Text, { style: styles.firmaInfo }, `PIB: ${firma.pib}  |  Mat. br.: ${firma.maticniBroj}`),
          firma.telefon ? React.createElement(Text, { style: styles.firmaInfo }, `Tel: ${firma.telefon}`) : null
        ),
        React.createElement(
          View,
          { style: styles.naslovBlok },
          React.createElement(Text, { style: styles.naslov }, 'PROFAKTURA'),
          React.createElement(Text, { style: styles.brojDatum }, `Br. ${data.broj}`),
          React.createElement(Text, { style: styles.brojDatum }, `Datum: ${formatDatum(data.datum)}`),
          React.createElement(Text, { style: styles.brojDatum }, `Datum obnove: ${formatDatum(data.datumObnavljanja)}`)
        )
      ),

      // PRIMALAC
      React.createElement(
        View,
        { style: styles.sekcija },
        React.createElement(Text, { style: styles.sekcijaLabel }, primaocLabel),
        React.createElement(
          View,
          { style: styles.kupacBlok },
          React.createElement(Text, { style: styles.kupacNaziv }, prikazIme),
          null,
          kupac.adresa ? React.createElement(Text, { style: styles.kupacInfo }, kupac.adresa) : null,
          kupac.grad ? React.createElement(Text, { style: styles.kupacInfo }, kupac.grad) : null,
          jeFirema && kupac.pib
            ? React.createElement(Text, { style: styles.kupacInfo }, `PIB: ${kupac.pib}`)
            : null
        )
      ),

      // TABELA
      React.createElement(
        View,
        { style: styles.sekcija },
        React.createElement(
          View,
          { style: styles.tabelaHeader },
          React.createElement(Text, { style: [styles.tabelaHeaderText, styles.colNaziv] }, 'Opis usluge'),
          React.createElement(Text, { style: [styles.tabelaHeaderText, styles.colKol] }, 'Kol.'),
          React.createElement(Text, { style: [styles.tabelaHeaderText, styles.colCena] }, 'Cena'),
          React.createElement(Text, { style: [styles.tabelaHeaderText, styles.colIznos] }, 'Iznos')
        ),
        React.createElement(
          View,
          { style: styles.tabelaRed },
          React.createElement(Text, { style: [styles.tabelaCell, styles.colNaziv] }, opisUsluge),
          React.createElement(Text, { style: [styles.tabelaCell, styles.colKol] }, '1'),
          React.createElement(Text, { style: [styles.tabelaCell, styles.colCena] }, `${formatIznos(iznos)} RSD`),
          React.createElement(Text, { style: [styles.tabelaCell, styles.colIznos] }, `${formatIznos(iznos)} RSD`)
        )
      ),

      // SUMA
      React.createElement(
        View,
        { style: styles.sumaBlok },
        React.createElement(
          View,
          { style: styles.sumaTabela },
          jeFirema
            ? React.createElement(
                View,
                { style: styles.sumaRed },
                React.createElement(Text, { style: styles.sumaLabel }, 'Iznos bez PDV:'),
                React.createElement(Text, { style: styles.sumaVrednost }, `${formatIznos(iznos)} RSD`)
              )
            : null,
          jeFirema
            ? React.createElement(
                View,
                { style: styles.sumaRed },
                React.createElement(Text, { style: styles.sumaLabel }, 'PDV (0%):'),
                React.createElement(Text, { style: styles.sumaVrednost }, '0,00 RSD')
              )
            : null,
          React.createElement(
            View,
            { style: styles.ukupnoRed },
            React.createElement(Text, { style: styles.ukupnoLabel }, 'UKUPNO ZA UPLATU:'),
            React.createElement(Text, { style: styles.ukupnoVrednost }, `${formatIznos(iznos)} RSD`)
          )
        )
      ),

      // RACUN - uvek prikazati
      firma.racun1
        ? React.createElement(
            View,
            { style: styles.racunBlok },
            React.createElement(Text, { style: styles.racunLabel }, 'Uplata na račun:'),
            React.createElement(Text, { style: styles.racunText }, `${firma.racun1}${firma.banka1 ? ` - ${firma.banka1}` : ''}`),
            firma.racun2 ? React.createElement(Text, { style: styles.racunText }, `${firma.racun2}${firma.banka2 ? ` - ${firma.banka2}` : ''}`) : null
          )
        : null,

      // POZIV NA BROJ
      pozivNaBroj
        ? React.createElement(
            View,
            { style: styles.pozivBlok },
            React.createElement(Text, { style: styles.pozivLabel }, 'Poziv na broj (obavezno upisati pri uplati):'),
            React.createElement(Text, { style: styles.pozivBroj }, pozivNaBroj),
            React.createElement(
              Text,
              { style: styles.pozivNapomena },
              'Obavezno upišite ovaj poziv na broj kako bismo identifikovali Vašu uplatu.'
            )
          )
        : null,

      // NAPOMENA - razlicita za firme i fizicka lica
      React.createElement(
        Text,
        { style: styles.napomena },
        'Profaktura nije fiskalni dokument. Plaćanjem po ovoj profakturi potvrđujete narudžbinu usluge.'
      ),
      jeFirema
        ? React.createElement(
            Text,
            { style: styles.napomena },
            'Obveznik nije u sistemu PDV-a u skladu sa čl. 33. Zakona o PDV-u.'
          )
        : React.createElement(
            Text,
            { style: styles.napomena },
            'Uplatu možete izvršiti na navedeni žiro račun ili na blagajni.'
          )
    )
  );

  const buffer = await renderToBuffer(doc);
  return Buffer.from(buffer);
}
