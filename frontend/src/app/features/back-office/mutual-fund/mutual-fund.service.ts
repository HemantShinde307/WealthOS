import { Injectable, computed, signal } from '@angular/core';
import {
  BrokerRecord,
  BrokerageSlab,
  MOCK_BROKERAGE_SLABS,
  MOCK_BROKER_RECORDS,
  MOCK_MF_FOLIOS,
  MOCK_MF_TRANSACTIONS,
  MOCK_REGISTRAR_IMPORT_LOG,
  MOCK_SYSTEMATIC_MANDATES,
  MandateFrequency,
  MandateStatus,
  MandateType,
  MfFolio,
  MfTransaction,
  MfTransactionSource,
  MfTransactionType,
  RegistrarImportLogEntry,
  SystematicMandate,
} from './mutual-fund-data.mock';

export interface RegistrarImportRow {
  folio: string;
  scheme: string;
  transactionType: string;
  amount: number;
  units: number;
  nav: number;
  date: string;
}

export interface BrokerImportRow {
  brokerCode: string;
  brokerName: string;
  arn: string;
  euin: string;
  folio: string;
}

let nextTxnSeq = 50017;
let nextMandateSeq = { SIP: 3007, SWP: 4004, STP: 5004 };
let nextImportSeq = 3;
let nextBrokerSeq = 4;
let nextSlabSeq = 8;

@Injectable({ providedIn: 'root' })
export class MutualFundService {
  private readonly _folios = signal<MfFolio[]>(MOCK_MF_FOLIOS.map((f) => ({ ...f })));
  private readonly _transactions = signal<MfTransaction[]>(MOCK_MF_TRANSACTIONS.map((t) => ({ ...t })));
  private readonly _mandates = signal<SystematicMandate[]>(MOCK_SYSTEMATIC_MANDATES.map((m) => ({ ...m })));
  private readonly _registrarImportLog = signal<RegistrarImportLogEntry[]>(MOCK_REGISTRAR_IMPORT_LOG.map((r) => ({ ...r })));
  private readonly _brokerRecords = signal<BrokerRecord[]>(MOCK_BROKER_RECORDS.map((b) => ({ ...b })));
  private readonly _brokerageSlabs = signal<BrokerageSlab[]>(MOCK_BROKERAGE_SLABS.map((s) => ({ ...s })));

  readonly folios = this._folios.asReadonly();
  readonly transactions = this._transactions.asReadonly();
  readonly mandates = this._mandates.asReadonly();
  readonly registrarImportLog = this._registrarImportLog.asReadonly();
  readonly brokerRecords = this._brokerRecords.asReadonly();
  readonly brokerageSlabs = this._brokerageSlabs.asReadonly();

  readonly activeFolioCount = computed(() => this._folios().filter((f) => f.status === 'Active').length);
  readonly totalAum = computed(() => this._folios().reduce((sum, f) => sum + f.units * f.currentNav, 0));
  readonly sipMandates = computed(() => this._mandates().filter((m) => m.type === 'SIP'));
  readonly swpMandates = computed(() => this._mandates().filter((m) => m.type === 'SWP'));
  readonly stpMandates = computed(() => this._mandates().filter((m) => m.type === 'STP'));

  getFolio(id: string): MfFolio | undefined {
    return this._folios().find((f) => f.id === id);
  }

  findFolioByNumber(folioNumber: string): MfFolio | undefined {
    const q = folioNumber.trim().toLowerCase();
    return this._folios().find((f) => f.folioNumber.toLowerCase() === q || f.folioNumber.toLowerCase().includes(q));
  }

  folioTransactions(folioId: string): MfTransaction[] {
    return this._transactions()
      .filter((t) => t.folioId === folioId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  folioMandates(folioId: string): SystematicMandate[] {
    return this._mandates().filter((m) => m.folioId === folioId || m.targetFolioId === folioId);
  }

  /** Record a Purchase / Additional Purchase against a folio — units are computed from amount / nav. */
  recordInward(folioId: string, transactionType: 'Purchase' | 'Additional Purchase', amount: number, nav: number, date: string, source: MfTransactionSource = 'Manual Entry'): MfTransaction | null {
    const folio = this.getFolio(folioId);
    if (!folio || amount <= 0 || nav <= 0) return null;
    const units = Math.round((amount / nav) * 1000) / 1000;
    const txn: MfTransaction = { id: `MFT-${nextTxnSeq++}`, folioId, scheme: folio.scheme, transactionType, amount, units, nav, date, status: 'Processed', source };
    this._transactions.update((list) => [txn, ...list]);
    this._folios.update((list) =>
      list.map((f) =>
        f.id === folioId
          ? { ...f, units: Math.round((f.units + units) * 1000) / 1000, status: 'Active', avgNav: this.recomputeAvgNav(f, units, nav) }
          : f,
      ),
    );
    return txn;
  }

  /** Record a Redemption against a folio — amount is computed from units * nav. */
  recordOutward(folioId: string, units: number, nav: number, date: string, source: MfTransactionSource = 'Manual Entry'): MfTransaction | null {
    const folio = this.getFolio(folioId);
    if (!folio || units <= 0 || nav <= 0 || units > folio.units) return null;
    const amount = Math.round(units * nav * 100) / 100;
    const txn: MfTransaction = { id: `MFT-${nextTxnSeq++}`, folioId, scheme: folio.scheme, transactionType: 'Redemption', amount, units, nav, date, status: 'Processed', source };
    this._transactions.update((list) => [txn, ...list]);
    this._folios.update((list) =>
      list.map((f) => {
        if (f.id !== folioId) return f;
        const remaining = Math.round((f.units - units) * 1000) / 1000;
        return { ...f, units: remaining, status: remaining <= 0.001 ? 'Zero Balance' : f.status };
      }),
    );
    return txn;
  }

  private recomputeAvgNav(folio: MfFolio, addedUnits: number, nav: number): number {
    const totalCost = folio.avgNav * folio.units + nav * addedUnits;
    const totalUnits = folio.units + addedUnits;
    return totalUnits > 0 ? Math.round((totalCost / totalUnits) * 100) / 100 : folio.avgNav;
  }

  createMandate(input: {
    type: MandateType;
    folioId: string;
    targetFolioId?: string;
    amount: number;
    frequency: MandateFrequency;
    startDate: string;
    endDate?: string;
    totalInstallments?: number;
  }): SystematicMandate | null {
    const folio = this.getFolio(input.folioId);
    if (!folio) return null;
    const target = input.targetFolioId ? this.getFolio(input.targetFolioId) : undefined;
    const prefix = input.type;
    const seq = nextMandateSeq[input.type]++;
    const mandate: SystematicMandate = {
      id: `${prefix}-${seq}`,
      type: input.type,
      folioId: input.folioId,
      scheme: folio.scheme,
      targetFolioId: input.targetFolioId,
      targetScheme: target?.scheme,
      amount: input.amount,
      frequency: input.frequency,
      startDate: input.startDate,
      nextDueDate: input.startDate,
      endDate: input.endDate,
      installmentsDone: 0,
      totalInstallments: input.totalInstallments,
      status: 'Active',
    };
    this._mandates.update((list) => [mandate, ...list]);
    return mandate;
  }

  setMandateStatus(id: string, status: MandateStatus): void {
    this._mandates.update((list) => list.map((m) => (m.id === id ? { ...m, status } : m)));
  }

  /** Parse & apply a registrar transaction file. Rows referencing unknown folios are skipped by the caller (validated at import time). */
  importRegistrarTransactions(rows: RegistrarImportRow[], fileName: string, registrar: 'CAMS' | 'KFintech'): number {
    let applied = 0;
    for (const row of rows) {
      const folio = this.findFolioByNumber(row.folio);
      if (!folio) continue;
      const type = row.transactionType as MfTransactionType;
      const txn: MfTransaction = {
        id: `MFT-${nextTxnSeq++}`,
        folioId: folio.id,
        scheme: folio.scheme,
        transactionType: type,
        amount: row.amount,
        units: row.units,
        nav: row.nav,
        date: row.date,
        status: 'Processed',
        source: 'Registrar Import',
      };
      this._transactions.update((list) => [txn, ...list]);
      const isRedemptionLike = type === 'Redemption' || type === 'SWP' || type === 'STP Out';
      this._folios.update((list) =>
        list.map((f) => {
          if (f.id !== folio.id) return f;
          const nextUnits = isRedemptionLike ? Math.round((f.units - row.units) * 1000) / 1000 : Math.round((f.units + row.units) * 1000) / 1000;
          return { ...f, units: Math.max(nextUnits, 0), status: nextUnits <= 0.001 ? 'Zero Balance' : 'Active' };
        }),
      );
      applied++;
    }
    this._registrarImportLog.update((log) => [{ id: `RIL-${String(nextImportSeq++).padStart(3, '0')}`, fileName, registrar, rowCount: applied, importedOn: new Date().toISOString() }, ...log]);
    return applied;
  }

  importBrokerRecords(rows: BrokerImportRow[]): number {
    const created: BrokerRecord[] = [];
    for (const row of rows) {
      const folio = this.findFolioByNumber(row.folio);
      if (!folio) continue;
      created.push({ id: `BRK-${String(nextBrokerSeq++).padStart(3, '0')}`, brokerCode: row.brokerCode, brokerName: row.brokerName, arn: row.arn, euin: row.euin, folioId: folio.id });
    }
    this._brokerRecords.update((list) => [...created, ...list]);
    return created.length;
  }

  /** Create the same transaction type/amount/date/nav across a batch of folios. Returns the number of transactions created. */
  batchCreateTransactions(folioIds: string[], transactionType: 'Purchase' | 'Additional Purchase' | 'Redemption', amount: number, date: string): number {
    let created = 0;
    for (const folioId of folioIds) {
      const folio = this.getFolio(folioId);
      if (!folio) continue;
      if (transactionType === 'Redemption') {
        const units = Math.min(Math.round((amount / folio.currentNav) * 1000) / 1000, folio.units);
        if (units <= 0) continue;
        if (this.recordOutward(folioId, units, folio.currentNav, date, 'Manual Entry')) created++;
      } else {
        if (this.recordInward(folioId, transactionType, amount, folio.currentNav, date, 'Manual Entry')) created++;
      }
    }
    return created;
  }

  addBrokerageSlab(slab: Omit<BrokerageSlab, 'id'>): BrokerageSlab {
    const created: BrokerageSlab = { ...slab, id: `BRS-${String(nextSlabSeq++).padStart(3, '0')}` };
    this._brokerageSlabs.update((list) => [created, ...list]);
    return created;
  }

  updateBrokerageSlab(id: string, patch: Partial<BrokerageSlab>): void {
    this._brokerageSlabs.update((list) => list.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  deleteBrokerageSlab(id: string): void {
    this._brokerageSlabs.update((list) => list.filter((s) => s.id !== id));
  }

  updateFolio(id: string, patch: Partial<MfFolio>): void {
    this._folios.update((list) => list.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }

  /** Deleting a folio also drops its transactions, mandates (source or target) and broker mappings. */
  deleteFolio(id: string): void {
    this._folios.update((list) => list.filter((f) => f.id !== id));
    this._transactions.update((list) => list.filter((t) => t.folioId !== id));
    this._mandates.update((list) => list.filter((m) => m.folioId !== id && m.targetFolioId !== id));
    this._brokerRecords.update((list) => list.filter((b) => b.folioId !== id));
  }

  /** Edit a transaction's amount/units/nav/date; the folio's unit balance is adjusted by the change in units. */
  updateTransaction(id: string, patch: Partial<Pick<MfTransaction, 'amount' | 'units' | 'nav' | 'date'>>): void {
    const txn = this._transactions().find((t) => t.id === id);
    if (!txn) return;
    const nextUnits = patch.units ?? txn.units;
    const delta = nextUnits - txn.units;
    this._transactions.update((list) => list.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    if (delta !== 0) {
      const sign = txn.transactionType === 'Redemption' || txn.transactionType === 'SWP' || txn.transactionType === 'STP Out' ? -1 : 1;
      this._folios.update((list) =>
        list.map((f) => (f.id === txn.folioId ? { ...f, units: Math.max(Math.round((f.units + sign * delta) * 1000) / 1000, 0) } : f)),
      );
    }
  }

  /** Deleting a transaction reverses its effect on the folio's unit balance. */
  deleteTransaction(id: string): void {
    const txn = this._transactions().find((t) => t.id === id);
    if (!txn) return;
    this._transactions.update((list) => list.filter((t) => t.id !== id));
    const sign = txn.transactionType === 'Redemption' || txn.transactionType === 'SWP' || txn.transactionType === 'STP Out' ? 1 : -1;
    this._folios.update((list) =>
      list.map((f) => (f.id === txn.folioId ? { ...f, units: Math.max(Math.round((f.units + sign * txn.units) * 1000) / 1000, 0) } : f)),
    );
  }

  updateMandate(id: string, patch: Partial<SystematicMandate>): void {
    this._mandates.update((list) => list.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }

  deleteMandate(id: string): void {
    this._mandates.update((list) => list.filter((m) => m.id !== id));
  }

  updateBrokerRecord(id: string, patch: Partial<BrokerRecord>): void {
    this._brokerRecords.update((list) => list.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }

  deleteBrokerRecord(id: string): void {
    this._brokerRecords.update((list) => list.filter((b) => b.id !== id));
  }

  deleteRegistrarImportLogEntry(id: string): void {
    this._registrarImportLog.update((list) => list.filter((r) => r.id !== id));
  }
}
