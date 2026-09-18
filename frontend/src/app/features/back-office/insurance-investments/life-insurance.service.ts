import { Injectable, computed, signal } from '@angular/core';
import {
  ImportLogEntry,
  LifeInsuranceImportRow,
  LifeInsurancePolicy,
  MOCK_LIFE_POLICIES,
  MOCK_PREMIUM_DEPOSITS,
  MOCK_ULIP_ADJUSTMENTS,
  PremiumDeposit,
  UlipUnitAdjustment,
} from './insurance-investments-data.mock';

let nextPolicySeq = 200;
let nextDepositSeq = 400;
let nextAdjSeq = 400;

@Injectable({ providedIn: 'root' })
export class LifeInsuranceService {
  private readonly _policies = signal<LifeInsurancePolicy[]>(MOCK_LIFE_POLICIES.map((p) => ({ ...p })));
  private readonly _premiumDeposits = signal<PremiumDeposit[]>(MOCK_PREMIUM_DEPOSITS.map((d) => ({ ...d })));
  private readonly _ulipAdjustments = signal<UlipUnitAdjustment[]>(MOCK_ULIP_ADJUSTMENTS.map((a) => ({ ...a })));
  private readonly _importLog = signal<ImportLogEntry[]>([]);

  readonly policies = this._policies.asReadonly();
  readonly premiumDeposits = this._premiumDeposits.asReadonly();
  readonly ulipAdjustments = this._ulipAdjustments.asReadonly();
  readonly importLog = this._importLog.asReadonly();

  readonly ulipPolicies = computed(() => this._policies().filter((p) => p.policyType === 'ULIP'));
  readonly activeCount = computed(() => this._policies().filter((p) => p.status === 'Active').length);

  getPolicy(id: string): LifeInsurancePolicy | undefined {
    return this._policies().find((p) => p.id === id);
  }

  addPolicy(policy: Omit<LifeInsurancePolicy, 'id'>): LifeInsurancePolicy {
    const newPolicy: LifeInsurancePolicy = { ...policy, id: `LIP-${nextPolicySeq++}` };
    this._policies.update((list) => [newPolicy, ...list]);
    return newPolicy;
  }

  updatePolicy(id: string, patch: Partial<LifeInsurancePolicy>): void {
    this._policies.update((list) => list.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  /** Bulk-updates the First Unpaid Premium date for a set of policies; returns how many were touched. */
  bulkUpdateFupDate(ids: string[], newFupDate: string): number {
    const idSet = new Set(ids);
    this._policies.update((list) => list.map((p) => (idSet.has(p.id) ? { ...p, fupDate: newFupDate } : p)));
    return ids.length;
  }

  addPremiumDeposit(deposit: Omit<PremiumDeposit, 'id' | 'receiptNumber'>): PremiumDeposit {
    const seq = nextDepositSeq++;
    const entry: PremiumDeposit = { ...deposit, id: `PD-${seq}`, receiptNumber: `RCPT-${seq}` };
    this._premiumDeposits.update((list) => [entry, ...list]);
    return entry;
  }

  addUlipAdjustment(adj: Omit<UlipUnitAdjustment, 'id'>): UlipUnitAdjustment {
    const entry: UlipUnitAdjustment = { ...adj, id: `ULIP-${nextAdjSeq++}` };
    this._ulipAdjustments.update((list) => [entry, ...list]);
    return entry;
  }

  importPolicies(rows: LifeInsuranceImportRow[], fileName: string): number {
    const today = new Date().toISOString().slice(0, 10);
    const newPolicies: LifeInsurancePolicy[] = rows.map((r) => ({
      id: `LIP-${nextPolicySeq++}`,
      policyNumber: r.policyNumber,
      policyholderName: r.policyholderName,
      insurer: r.insurer,
      policyType: r.policyType,
      sumAssured: r.sumAssured,
      premium: r.premium,
      premiumFrequency: r.premiumFrequency,
      commencementDate: today,
      fupDate: today,
      nominee: '—',
      status: 'Active',
    }));
    this._policies.update((list) => [...newPolicies, ...list]);
    this._importLog.update((log) => [
      { id: `IMP-${log.length + 1}`, fileName, rowCount: newPolicies.length, importedOn: new Date().toISOString() },
      ...log,
    ]);
    return newPolicies.length;
  }
}
