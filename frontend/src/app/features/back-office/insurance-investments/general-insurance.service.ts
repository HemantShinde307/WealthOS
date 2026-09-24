import { Injectable, computed, signal } from '@angular/core';
import { GeneralInsuranceImportRow, GeneralInsurancePolicy, ImportLogEntry, MOCK_GENERAL_POLICIES } from './insurance-investments-data.mock';

let nextPolicySeq = 500;
let nextImportSeq = 1;

@Injectable({ providedIn: 'root' })
export class GeneralInsuranceService {
  private readonly _policies = signal<GeneralInsurancePolicy[]>(MOCK_GENERAL_POLICIES.map((p) => ({ ...p })));
  private readonly _importLog = signal<ImportLogEntry[]>([]);

  readonly policies = this._policies.asReadonly();
  readonly importLog = this._importLog.asReadonly();
  readonly activeCount = computed(() => this._policies().filter((p) => p.status === 'Active').length);
  readonly dueForRenewalCount = computed(() => this._policies().filter((p) => p.status === 'Due for Renewal').length);

  getPolicy(id: string): GeneralInsurancePolicy | undefined {
    return this._policies().find((p) => p.id === id);
  }

  addPolicy(policy: Omit<GeneralInsurancePolicy, 'id'>): GeneralInsurancePolicy {
    const newPolicy: GeneralInsurancePolicy = { ...policy, id: `GIP-${nextPolicySeq++}` };
    this._policies.update((list) => [newPolicy, ...list]);
    return newPolicy;
  }

  updatePolicy(id: string, patch: Partial<GeneralInsurancePolicy>): void {
    this._policies.update((list) => list.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  deletePolicy(id: string): void {
    this._policies.update((list) => list.filter((p) => p.id !== id));
  }

  deleteImportLog(id: string): void {
    this._importLog.update((log) => log.filter((e) => e.id !== id));
  }

  importPolicies(rows: GeneralInsuranceImportRow[], fileName: string): number {
    const today = new Date().toISOString().slice(0, 10);
    const newPolicies: GeneralInsurancePolicy[] = rows.map((r) => ({
      id: `GIP-${nextPolicySeq++}`,
      policyNumber: r.policyNumber,
      policyholderName: r.policyholderName,
      insurer: r.insurer,
      type: r.type,
      sumInsured: r.sumInsured,
      premium: r.premium,
      issueDate: today,
      renewalDate: r.renewalDate,
      status: 'Active',
    }));
    this._policies.update((list) => [...newPolicies, ...list]);
    this._importLog.update((log) => [
      { id: `IMP-${nextImportSeq++}`, fileName, rowCount: newPolicies.length, importedOn: new Date().toISOString() },
      ...log,
    ]);
    return newPolicies.length;
  }
}
