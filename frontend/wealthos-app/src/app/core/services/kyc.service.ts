import { Injectable, signal } from '@angular/core';
import { KycRecord, AuditLogEntry } from '../models/domain.models';
import { MOCK_KYC_RECORDS, MOCK_AUDIT_LOG } from '../mock-data/kyc.mock';

@Injectable({ providedIn: 'root' })
export class KycService {
  private readonly _records = signal<KycRecord[]>(MOCK_KYC_RECORDS);
  readonly records = this._records.asReadonly();

  private readonly _auditLog = signal<AuditLogEntry[]>(MOCK_AUDIT_LOG);
  readonly auditLog = this._auditLog.asReadonly();

  updateStatus(id: string, status: KycRecord['status']): void {
    this._records.update((list) => list.map((r) => (r.id === id ? { ...r, status } : r)));
  }
}
