import { Injectable, signal } from '@angular/core';
import {
  BondHolding,
  BullionHolding,
  CompanyDeposit,
  DebentureHolding,
  FdRdEntry,
  ImportLogEntry,
  IncomeSchemeEntry,
  InstrumentMaster,
  MOCK_BONDS,
  MOCK_BULLION,
  MOCK_COMPANY_DEPOSITS,
  MOCK_DEBENTURES,
  MOCK_FDS_RDS,
  MOCK_INCOME_SCHEMES,
  MOCK_INSTRUMENT_MASTERS,
  MOCK_PMS_TRANSACTIONS,
  MOCK_POSTAL_INVESTMENTS,
  MOCK_PPF_ACCOUNTS,
  MOCK_RECURRING_DEPOSITS,
  MOCK_STOCK_HOLDINGS,
  OtherInvestmentImportRow,
  PmsTransaction,
  PostalInvestment,
  PpfAccount,
  RecurringDepositEntry,
  StockHolding,
} from './insurance-investments-data.mock';

let nextMasterSeq = 100;
let nextStockSeq = 100;
let nextPostalSeq = 100;
let nextFdRdSeq = 100;
let nextPpfSeq = 100;
let nextPpfContribSeq = 100;
let nextBondSeq = 100;
let nextDebentureSeq = 100;
let nextCompanyDepositSeq = 100;
let nextRecurringDepositSeq = 100;
let nextIncomeSchemeSeq = 100;
let nextBullionSeq = 100;
let nextPmsSeq = 100;
let nextImportLogSeq = 1;

/** Backs all thirteen "Other Investments" screens with one shared signal-based service. */
@Injectable({ providedIn: 'root' })
export class OtherInvestmentsService {
  private readonly _masters = signal<InstrumentMaster[]>(MOCK_INSTRUMENT_MASTERS.map((m) => ({ ...m })));
  private readonly _stocks = signal<StockHolding[]>(MOCK_STOCK_HOLDINGS.map((s) => ({ ...s })));
  private readonly _postal = signal<PostalInvestment[]>(MOCK_POSTAL_INVESTMENTS.map((p) => ({ ...p })));
  private readonly _fdsRds = signal<FdRdEntry[]>(MOCK_FDS_RDS.map((f) => ({ ...f })));
  private readonly _ppfAccounts = signal<PpfAccount[]>(MOCK_PPF_ACCOUNTS.map((p) => ({ ...p, contributions: [...p.contributions] })));
  private readonly _bonds = signal<BondHolding[]>(MOCK_BONDS.map((b) => ({ ...b })));
  private readonly _debentures = signal<DebentureHolding[]>(MOCK_DEBENTURES.map((d) => ({ ...d })));
  private readonly _companyDeposits = signal<CompanyDeposit[]>(MOCK_COMPANY_DEPOSITS.map((c) => ({ ...c })));
  private readonly _recurringDeposits = signal<RecurringDepositEntry[]>(MOCK_RECURRING_DEPOSITS.map((r) => ({ ...r })));
  private readonly _incomeSchemes = signal<IncomeSchemeEntry[]>(MOCK_INCOME_SCHEMES.map((i) => ({ ...i })));
  private readonly _bullion = signal<BullionHolding[]>(MOCK_BULLION.map((b) => ({ ...b })));
  private readonly _pmsTransactions = signal<PmsTransaction[]>(MOCK_PMS_TRANSACTIONS.map((p) => ({ ...p })));
  private readonly _importLog = signal<ImportLogEntry[]>([]);

  readonly masters = this._masters.asReadonly();
  readonly stocks = this._stocks.asReadonly();
  readonly postal = this._postal.asReadonly();
  readonly fdsRds = this._fdsRds.asReadonly();
  readonly ppfAccounts = this._ppfAccounts.asReadonly();
  readonly bonds = this._bonds.asReadonly();
  readonly debentures = this._debentures.asReadonly();
  readonly companyDeposits = this._companyDeposits.asReadonly();
  readonly recurringDeposits = this._recurringDeposits.asReadonly();
  readonly incomeSchemes = this._incomeSchemes.asReadonly();
  readonly bullion = this._bullion.asReadonly();
  readonly pmsTransactions = this._pmsTransactions.asReadonly();
  readonly importLog = this._importLog.asReadonly();

  // --- Masters ---
  addMaster(m: Omit<InstrumentMaster, 'id'>): void {
    this._masters.update((list) => [{ ...m, id: `MST-${nextMasterSeq++}` }, ...list]);
  }
  updateMaster(id: string, patch: Partial<InstrumentMaster>): void {
    this._masters.update((list) => list.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }
  deleteMaster(id: string): void {
    this._masters.update((list) => list.filter((m) => m.id !== id));
  }

  // --- Stocks ---
  addStock(s: Omit<StockHolding, 'id'>): void {
    this._stocks.update((list) => [{ ...s, id: `STK-${nextStockSeq++}` }, ...list]);
  }
  updateStock(id: string, patch: Partial<StockHolding>): void {
    this._stocks.update((list) => list.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }
  deleteStock(id: string): void {
    this._stocks.update((list) => list.filter((s) => s.id !== id));
  }

  // --- Postal Investments ---
  addPostal(p: Omit<PostalInvestment, 'id'>): void {
    this._postal.update((list) => [{ ...p, id: `PST-${nextPostalSeq++}` }, ...list]);
  }
  updatePostal(id: string, patch: Partial<PostalInvestment>): void {
    this._postal.update((list) => list.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }
  deletePostal(id: string): void {
    this._postal.update((list) => list.filter((p) => p.id !== id));
  }

  // --- FDs & RDs ---
  addFdRd(f: Omit<FdRdEntry, 'id'>): void {
    this._fdsRds.update((list) => [{ ...f, id: `FDR-${nextFdRdSeq++}` }, ...list]);
  }
  updateFdRd(id: string, patch: Partial<FdRdEntry>): void {
    this._fdsRds.update((list) => list.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }
  deleteFdRd(id: string): void {
    this._fdsRds.update((list) => list.filter((f) => f.id !== id));
  }

  // --- PPF ---
  addPpfAccount(p: Omit<PpfAccount, 'id' | 'contributions'>): void {
    this._ppfAccounts.update((list) => [{ ...p, id: `PPF-${nextPpfSeq++}`, contributions: [] }, ...list]);
  }
  updatePpfAccount(id: string, patch: Partial<PpfAccount>): void {
    this._ppfAccounts.update((list) => list.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }
  deletePpfAccount(id: string): void {
    this._ppfAccounts.update((list) => list.filter((p) => p.id !== id));
  }
  addPpfContribution(accountId: string, date: string, amount: number): void {
    this._ppfAccounts.update((list) =>
      list.map((p) =>
        p.id === accountId
          ? { ...p, balance: p.balance + amount, contributions: [{ id: `C-${nextPpfContribSeq++}`, date, amount }, ...p.contributions] }
          : p,
      ),
    );
  }

  // --- Bonds ---
  addBond(b: Omit<BondHolding, 'id'>): void {
    this._bonds.update((list) => [{ ...b, id: `BND-${nextBondSeq++}` }, ...list]);
  }
  updateBond(id: string, patch: Partial<BondHolding>): void {
    this._bonds.update((list) => list.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }
  deleteBond(id: string): void {
    this._bonds.update((list) => list.filter((b) => b.id !== id));
  }

  // --- Debentures ---
  addDebenture(d: Omit<DebentureHolding, 'id'>): void {
    this._debentures.update((list) => [{ ...d, id: `DEB-${nextDebentureSeq++}` }, ...list]);
  }
  updateDebenture(id: string, patch: Partial<DebentureHolding>): void {
    this._debentures.update((list) => list.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  }
  deleteDebenture(id: string): void {
    this._debentures.update((list) => list.filter((d) => d.id !== id));
  }

  // --- Company Deposits ---
  addCompanyDeposit(c: Omit<CompanyDeposit, 'id'>): void {
    this._companyDeposits.update((list) => [{ ...c, id: `CD-${nextCompanyDepositSeq++}` }, ...list]);
  }
  updateCompanyDeposit(id: string, patch: Partial<CompanyDeposit>): void {
    this._companyDeposits.update((list) => list.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }
  deleteCompanyDeposit(id: string): void {
    this._companyDeposits.update((list) => list.filter((c) => c.id !== id));
  }

  // --- Recurring Deposits ---
  addRecurringDeposit(r: Omit<RecurringDepositEntry, 'id'>): void {
    this._recurringDeposits.update((list) => [{ ...r, id: `RD-${nextRecurringDepositSeq++}` }, ...list]);
  }
  updateRecurringDeposit(id: string, patch: Partial<RecurringDepositEntry>): void {
    this._recurringDeposits.update((list) => list.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }
  deleteRecurringDeposit(id: string): void {
    this._recurringDeposits.update((list) => list.filter((r) => r.id !== id));
  }

  // --- Income Schemes ---
  addIncomeScheme(i: Omit<IncomeSchemeEntry, 'id'>): void {
    this._incomeSchemes.update((list) => [{ ...i, id: `INC-${nextIncomeSchemeSeq++}` }, ...list]);
  }
  updateIncomeScheme(id: string, patch: Partial<IncomeSchemeEntry>): void {
    this._incomeSchemes.update((list) => list.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }
  deleteIncomeScheme(id: string): void {
    this._incomeSchemes.update((list) => list.filter((i) => i.id !== id));
  }

  // --- Bullion ---
  addBullion(b: Omit<BullionHolding, 'id'>): void {
    this._bullion.update((list) => [{ ...b, id: `BUL-${nextBullionSeq++}` }, ...list]);
  }
  updateBullion(id: string, patch: Partial<BullionHolding>): void {
    this._bullion.update((list) => list.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }
  deleteBullion(id: string): void {
    this._bullion.update((list) => list.filter((b) => b.id !== id));
  }

  // --- PMS Transactions ---
  addPmsTransaction(p: Omit<PmsTransaction, 'id'>): void {
    this._pmsTransactions.update((list) => [{ ...p, id: `PMS-${nextPmsSeq++}` }, ...list]);
  }
  updatePmsTransaction(id: string, patch: Partial<PmsTransaction>): void {
    this._pmsTransactions.update((list) => list.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }
  deletePmsTransaction(id: string): void {
    this._pmsTransactions.update((list) => list.filter((p) => p.id !== id));
  }

  // --- Import log ---
  deleteImportLogEntry(id: string): void {
    this._importLog.update((list) => list.filter((e) => e.id !== id));
  }

  // --- Generic bulk import (any instrument category) ---
  importOtherInvestments(rows: OtherInvestmentImportRow[], fileName: string): number {
    for (const row of rows) {
      switch (row.category) {
        case 'Stock':
          this.addStock({ customerName: row.customerName, symbol: row.instrumentName, exchange: 'NSE', quantity: 0, buyPrice: row.amount, currentPrice: row.amount, buyDate: row.date });
          break;
        case 'Bond':
          this.addBond({ customerName: row.customerName, issuer: row.instrumentName, isin: '—', faceValue: row.amount, quantity: 1, couponRate: 0, purchaseDate: row.date, maturityDate: row.date });
          break;
        case 'Debenture':
          this.addDebenture({ customerName: row.customerName, issuer: row.instrumentName, isin: '—', faceValue: row.amount, quantity: 1, interestRate: 0, convertible: false, purchaseDate: row.date, maturityDate: row.date });
          break;
        case 'FD/RD':
          this.addFdRd({ customerName: row.customerName, bank: row.instrumentName, type: 'FD', principalOrInstallment: row.amount, tenureMonths: 12, interestRate: 0, startDate: row.date, maturityDate: row.date });
          break;
        case 'Postal':
          this.addPostal({ customerName: row.customerName, schemeName: 'NSC', certificateNumber: row.instrumentName, amount: row.amount, investmentDate: row.date, maturityDate: row.date, interestRate: 0 });
          break;
        case 'Company Deposit':
          this.addCompanyDeposit({ customerName: row.customerName, companyName: row.instrumentName, amount: row.amount, interestRate: 0, tenureMonths: 12, startDate: row.date, maturityDate: row.date });
          break;
        case 'Bullion':
          this.addBullion({ customerName: row.customerName, metal: 'Gold', form: 'Coin', weightGrams: row.amount, purchaseRate: 0, currentRate: 0, purchaseDate: row.date });
          break;
        default:
          this.addMaster({ category: 'Other', name: row.instrumentName, code: '—', issuer: row.customerName, notes: `Imported from ${fileName}` });
      }
    }
    this._importLog.update((log) => [
      { id: `IMP-${nextImportLogSeq++}`, fileName, rowCount: rows.length, importedOn: new Date().toISOString() },
      ...log,
    ]);
    return rows.length;
  }
}
