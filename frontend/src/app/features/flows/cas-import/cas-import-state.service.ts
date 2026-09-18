import { Injectable, signal } from '@angular/core';
import { CasParsedRow } from '../../../core/services/cas-parser.service';

export interface ParsedFolio extends CasParsedRow {
  id: string;
  selected: boolean;
}

// Sample rows matching a real CAMS/KFintech Consolidated Account Statement, used for the
// "Use sample statement" demo path when a customer doesn't have their own CAS PDF on hand.
// A folio can hold several schemes, so real imports are keyed by row `id`, not `folio`.
const SAMPLE_ROWS: CasParsedRow[] = [
  { folio: '1043873860', amc: 'Aditya Birla Sun Life Mutual Fund', schemeName: 'Aditya Birla Sun Life Banking And Financial Services Fund - Regular Growth', units: 75.845, investedValue: 2987.99, currentValue: 4723.63 },
  { folio: '1043873860', amc: 'Aditya Birla Sun Life Mutual Fund', schemeName: 'Aditya Birla Sun Life Transportation And Logistics Fund - Regular Growth', units: 252.770, investedValue: 2527.83, currentValue: 4365.34 },
  { folio: '1043873860', amc: 'Aditya Birla Sun Life Mutual Fund', schemeName: 'Aditya Birla Sun Life Midcap Fund - Regular Growth', units: 18.338, investedValue: 14312.46, currentValue: 15551.72 },
  { folio: '910133602585 / 0', amc: 'Axis Mutual Fund', schemeName: 'Axis Large & Mid Cap Fund - Direct Growth', units: 148.393, investedValue: 5000.00, currentValue: 5771.00 },
  { folio: '910203361794 / 0', amc: 'Axis Mutual Fund', schemeName: 'Axis Services Opportunities Fund - Regular Growth', units: 999.950, investedValue: 10000.00, currentValue: 9769.51 },
  { folio: '38819314 / 64', amc: 'HDFC Mutual Fund', schemeName: 'HDFC Flexi Cap Fund - Regular Growth', units: 12.164, investedValue: 25000.00, currentValue: 24838.46 },
  { folio: '38819314 / 64', amc: 'HDFC Mutual Fund', schemeName: 'HDFC Small Cap Fund - Regular Growth', units: 43.919, investedValue: 6000.00, currentValue: 6111.90 },
  { folio: '38819314 / 64', amc: 'HDFC Mutual Fund', schemeName: 'HDFC Multi Asset Allocation Fund - Regular Growth', units: 79.379, investedValue: 6000.00, currentValue: 5918.82 },
  { folio: '5852557 / 08', amc: 'HSBC Mutual Fund', schemeName: 'HSBC Small Cap Fund - Direct Growth', units: 13.000, investedValue: 1000.00, currentValue: 1348.60 },
  { folio: '77749363854 / 0', amc: 'Mirae Asset Mutual Fund', schemeName: 'Mirae Asset Large and Midcap Fund - Direct Growth', units: 53.120, investedValue: 7459.32, currentValue: 9426.41 },
  { folio: '477277332953 / 0', amc: 'Nippon India Mutual Fund', schemeName: 'Nippon India Large Cap Fund - Growth', units: 56.298, investedValue: 3077.71, currentValue: 4930.73 },
  { folio: '13246822', amc: 'PPFAS Mutual Fund', schemeName: 'Parag Parikh Flexi Cap Fund - Regular Growth', units: 536.997, investedValue: 43216.54, currentValue: 43777.93 },
  { folio: '34996839', amc: 'SBI Mutual Fund', schemeName: 'SBI Dividend Yield Fund - Regular Growth', units: 1802.415, investedValue: 25669.11, currentValue: 28078.02 },
  { folio: '34996839', amc: 'SBI Mutual Fund', schemeName: 'SBI Energy Opportunities Fund - Regular Growth', units: 1424.606, investedValue: 15000.00, currentValue: 15625.08 },
  { folio: '37790731', amc: 'SBI Mutual Fund', schemeName: 'SBI Energy Opportunities Fund - Regular Growth', units: 957.412, investedValue: 10000.00, currentValue: 10500.89 },
  { folio: '40478843', amc: 'SBI Mutual Fund', schemeName: 'SBI Innovative Opportunities Fund - Regular Growth', units: 1872.049, investedValue: 17850.76, currentValue: 19968.77 },
  { folio: '42510696', amc: 'SBI Mutual Fund', schemeName: 'SBI Dividend Yield Fund - Regular Growth', units: 1324.656, investedValue: 20000.00, currentValue: 20635.49 },
  { folio: '7342694 / 36', amc: 'Tata Mutual Fund', schemeName: 'Tata Digital India Fund - Direct Growth', units: 127.171, investedValue: 5000.00, currentValue: 6095.31 },
  { folio: '577349412226 / 0', amc: 'UTI Mutual Fund', schemeName: 'UTI Large Cap Fund - Regular Plan', units: 22.918, investedValue: 4193.57, currentValue: 5973.55 },
  { folio: '577349412226 / 0', amc: 'UTI Mutual Fund', schemeName: 'UTI Small Cap Fund - Regular Plan', units: 428.200, investedValue: 6476.93, currentValue: 11886.45 },
  { folio: '577349456771 / 0', amc: 'UTI Mutual Fund', schemeName: 'UTI Large Cap Fund - Direct Plan', units: 7.027, investedValue: 2000.00, currentValue: 2026.34 },
  { folio: '577349456771 / 0', amc: 'UTI Mutual Fund', schemeName: 'UTI Large Cap Fund - Regular Plan', units: 129.937, investedValue: 30831.06, currentValue: 33867.95 },
];

function toParsedFolios(rows: CasParsedRow[]): ParsedFolio[] {
  return rows.map((r, i) => ({ ...r, id: `row-${i}`, selected: true }));
}

@Injectable({ providedIn: 'root' })
export class CasImportStateService {
  readonly fileName = signal<string | null>(null);
  readonly folios = signal<ParsedFolio[]>([]);
  readonly isSample = signal(false);

  setParsedRows(fileName: string, rows: CasParsedRow[]): void {
    this.fileName.set(fileName);
    this.folios.set(toParsedFolios(rows));
    this.isSample.set(false);
  }

  loadSample(): void {
    this.fileName.set('Sample CAS Statement.pdf');
    this.folios.set(toParsedFolios(SAMPLE_ROWS));
    this.isSample.set(true);
  }

  toggleFolio(id: string): void {
    this.folios.update((list) => list.map((f) => (f.id === id ? { ...f, selected: !f.selected } : f)));
  }

  reset(): void {
    this.fileName.set(null);
    this.folios.set([]);
    this.isSample.set(false);
  }
}
