import { Injectable } from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

export interface CasParsedRow {
  folio: string;
  amc: string;
  schemeName: string;
  units: number;
  investedValue: number;
  currentValue: number;
}

export interface CasParseResult {
  rows: CasParsedRow[];
  investorName?: string;
}

export class CasParseError extends Error {
  constructor(
    message: string,
    public readonly reason: 'password' | 'wrong-password' | 'unrecognized' | 'unreadable',
  ) {
    super(message);
  }
}

// Known AMC name prefixes -> canonical AMC display name. Indian MF scheme names
// almost always start with their fund house's brand name, so this is a robust
// way to attribute a scheme to its AMC without depending on exact PDF layout.
const AMC_PREFIXES: Array<[string, string]> = [
  ['Aditya Birla Sun Life', 'Aditya Birla Sun Life Mutual Fund'],
  ['Axis', 'Axis Mutual Fund'],
  ['Bandhan', 'Bandhan Mutual Fund'],
  ['Bank of India', 'Bank of India Mutual Fund'],
  ['Baroda BNP Paribas', 'Baroda BNP Paribas Mutual Fund'],
  ['Canara Robeco', 'Canara Robeco Mutual Fund'],
  ['DSP', 'DSP Mutual Fund'],
  ['Edelweiss', 'Edelweiss Mutual Fund'],
  ['Franklin', 'Franklin Templeton Mutual Fund'],
  ['HDFC', 'HDFC Mutual Fund'],
  ['HSBC', 'HSBC Mutual Fund'],
  ['ICICI Prudential', 'ICICI Prudential Mutual Fund'],
  ['IDFC', 'Bandhan Mutual Fund'],
  ['Invesco', 'Invesco Mutual Fund'],
  ['ITI', 'ITI Mutual Fund'],
  ['JM Financial', 'JM Financial Mutual Fund'],
  ['Kotak', 'Kotak Mahindra Mutual Fund'],
  ['LIC', 'LIC Mutual Fund'],
  ['Mahindra Manulife', 'Mahindra Manulife Mutual Fund'],
  ['Mirae Asset', 'Mirae Asset Mutual Fund'],
  ['Motilal Oswal', 'Motilal Oswal Mutual Fund'],
  ['Nippon India', 'Nippon India Mutual Fund'],
  ['NJ', 'NJ Mutual Fund'],
  ['PGIM India', 'PGIM India Mutual Fund'],
  ['Parag Parikh', 'PPFAS Mutual Fund'],
  ['PPFAS', 'PPFAS Mutual Fund'],
  ['Quant', 'Quant Mutual Fund'],
  ['Quantum', 'Quantum Mutual Fund'],
  ['SBI', 'SBI Mutual Fund'],
  ['Shriram', 'Shriram Mutual Fund'],
  ['Sundaram', 'Sundaram Mutual Fund'],
  ['Tata', 'Tata Mutual Fund'],
  ['Taurus', 'Taurus Mutual Fund'],
  ['Union', 'Union Mutual Fund'],
  ['UTI', 'UTI Mutual Fund'],
  ['WhiteOak', 'WhiteOak Capital Mutual Fund'],
];

function guessAmc(schemeName: string): string {
  const match = AMC_PREFIXES.find(([prefix]) => schemeName.toLowerCase().startsWith(prefix.toLowerCase()));
  if (match) return match[1];
  const firstWords = schemeName.split(' ').slice(0, 2).join(' ');
  return `${firstWords} Mutual Fund`;
}

function toNumber(raw: string): number {
  return Number(raw.replace(/,/g, ''));
}

// Matches a scheme header line, e.g.:
// "B1180B-Aditya Birla Sun Life Banking And Financial Services Fund - Gr. REGULAR (Non-Demat) - ISIN: INF209K011W7(Advisor: ARN-242424) Registrar : CAMS"
const SCHEME_HEADER_RE = /\b[A-Z0-9]{2,14}-([A-Za-z0-9&.,'()/\- ]{6,160}?)\s*\((?:Non[\s-]*)?Demat\)/g;
const FOLIO_RE = /Folio No\.?:?\s*(\d+(?:\s*\/\s*\d+)?)/;
const CLOSING_RE = /Closing Unit Balance:\s*([\d,]+\.\d+)\s+Total Cost Value:\s*([\d,]+\.\d+)/;
const MARKET_VALUE_RE = /Market Value on [^:]+:\s*INR\s*([\d,]+\.\d+)/;

@Injectable({ providedIn: 'root' })
export class CasParserService {
  async parseFile(file: File, password?: string): Promise<CasParseResult> {
    const buffer = await file.arrayBuffer();
    let doc;
    try {
      doc = await pdfjsLib.getDocument({ data: buffer, password: password || undefined }).promise;
    } catch (err: unknown) {
      const name = (err as { name?: string })?.name;
      if (name === 'PasswordException') {
        const code = (err as { code?: number }).code;
        // pdf.js: code 1 = need password, code 2 = incorrect password supplied
        throw new CasParseError(
          code === 2 ? 'Incorrect password. Try your PAN in uppercase.' : 'This PDF is password protected. Enter the password to continue.',
          code === 2 ? 'wrong-password' : 'password',
        );
      }
      throw new CasParseError('Could not read this file. Please make sure it is a valid PDF.', 'unreadable');
    }

    let fullText = '';
    for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
      const page = await doc.getPage(pageNum);
      const content = await page.getTextContent();
      fullText += content.items.map((item) => ('str' in item ? item.str : '')).join(' ') + '\n';
    }

    const rows = this.extractRows(fullText);
    if (rows.length === 0) {
      throw new CasParseError(
        "We couldn't find any mutual fund holdings in this PDF. Make sure it's a CAMS/KFintech Consolidated Account Statement.",
        'unrecognized',
      );
    }

    const investorNameMatch = fullText.match(/Email Id:[^\n]*\n\s*([A-Za-z .]{4,60})/);
    return { rows, investorName: investorNameMatch?.[1]?.trim() };
  }

  private extractRows(fullText: string): CasParsedRow[] {
    const headerMatches = [...fullText.matchAll(SCHEME_HEADER_RE)];
    const rows: CasParsedRow[] = [];

    for (let i = 0; i < headerMatches.length; i++) {
      const current = headerMatches[i];
      const next = headerMatches[i + 1];
      const blockStart = current.index! + current[0].length;
      const blockEnd = next ? next.index! : fullText.length;
      const block = fullText.slice(blockStart, blockEnd);

      const schemeName = current[1].replace(/\s{2,}/g, ' ').replace(/[\s-]+$/, '').trim();
      const folioMatch = block.match(FOLIO_RE);
      const closingMatch = block.match(CLOSING_RE);
      const marketMatch = block.match(MARKET_VALUE_RE);

      if (!folioMatch || !closingMatch) continue;
      const units = toNumber(closingMatch[1]);
      if (units <= 0) continue; // fully redeemed / closed folio — not a current holding

      const investedValue = toNumber(closingMatch[2]);
      const currentValue = marketMatch ? toNumber(marketMatch[1]) : investedValue;
      rows.push({
        folio: folioMatch[1].replace(/\s+/g, ' ').trim(),
        amc: guessAmc(schemeName),
        schemeName,
        units,
        investedValue,
        currentValue,
      });
    }

    return rows;
  }
}
