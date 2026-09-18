import { Injectable, computed, signal } from '@angular/core';
import {
  BackOfficeCustomer,
  CustomerGroup,
  ImportLogEntry,
  MergeLogEntry,
  MOCK_BO_CUSTOMERS,
  MOCK_CUSTOMER_GROUPS,
  RiskAssessmentHistoryEntry,
  RISK_QUESTIONNAIRE_MAX_SCORE,
  scoreToRiskProfile,
} from './back-office-data.mock';

const REVIEW_DUE_DAYS = 365;

export interface ImportCustomerRow {
  name: string;
  email: string;
  phone: string;
  pan: string;
  riskProfile: BackOfficeCustomer['riskProfile'];
  segment: BackOfficeCustomer['segment'];
}

let nextCustomerSeq = 2000;
let nextGroupSeq = 100;

@Injectable({ providedIn: 'root' })
export class BackOfficeCustomerService {
  private readonly _customers = signal<BackOfficeCustomer[]>(MOCK_BO_CUSTOMERS.map((c) => ({ ...c })));
  private readonly _groups = signal<CustomerGroup[]>(MOCK_CUSTOMER_GROUPS.map((g) => ({ ...g })));
  private readonly _mergeLog = signal<MergeLogEntry[]>([]);
  private readonly _importLog = signal<ImportLogEntry[]>([]);
  private readonly _riskAssessmentHistory = signal<RiskAssessmentHistoryEntry[]>([]);

  readonly customers = this._customers.asReadonly();
  readonly groups = this._groups.asReadonly();
  readonly mergeLog = this._mergeLog.asReadonly();
  readonly importLog = this._importLog.asReadonly();
  readonly riskAssessmentHistory = this._riskAssessmentHistory.asReadonly();

  readonly activeCount = computed(() => this._customers().filter((c) => c.status === 'Active').length);
  readonly inactiveCount = computed(() => this._customers().filter((c) => c.status === 'Inactive').length);
  readonly ungroupedCustomers = computed(() => this._customers().filter((c) => !c.groupId));

  readonly groupSummaries = computed(() =>
    this._groups().map((g) => {
      const members = this._customers().filter((c) => c.groupId === g.id);
      return {
        group: g,
        members,
        memberCount: members.length,
        totalAum: members.reduce((sum, m) => sum + m.aum, 0),
        primaryContact: members.find((m) => m.id === g.primaryContactId) ?? members[0],
      };
    }),
  );

  /** Groups of 2+ customers sharing the same PAN or phone — candidate duplicates for bulk merge. */
  readonly duplicateClusters = computed(() => {
    const byKey = new Map<string, BackOfficeCustomer[]>();
    for (const c of this._customers()) {
      const key = `pan:${c.pan}`;
      byKey.set(key, [...(byKey.get(key) ?? []), c]);
    }
    for (const c of this._customers()) {
      const key = `phone:${c.phone}`;
      const existing = byKey.get(key) ?? [];
      if (!existing.some((e) => e.id === c.id)) byKey.set(key, [...existing, c]);
    }
    const seen = new Set<string>();
    const clusters: BackOfficeCustomer[][] = [];
    for (const group of byKey.values()) {
      if (group.length < 2) continue;
      const dedupKey = group.map((c) => c.id).sort().join(',');
      if (seen.has(dedupKey)) continue;
      seen.add(dedupKey);
      clusters.push(group);
    }
    return clusters;
  });

  getCustomer(id: string): BackOfficeCustomer | undefined {
    return this._customers().find((c) => c.id === id);
  }

  getGroup(id: string): CustomerGroup | undefined {
    return this._groups().find((g) => g.id === id);
  }

  updateCustomer(id: string, patch: Partial<BackOfficeCustomer>): void {
    this._customers.update((list) => list.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  setStatus(ids: string[], status: 'Active' | 'Inactive'): void {
    const idSet = new Set(ids);
    this._customers.update((list) => list.map((c) => (idSet.has(c.id) ? { ...c, status } : c)));
  }

  /** Bulk manual override (Risk Profile Batch Edit) — still tracked in the audit history, per SEBI record-keeping expectations. */
  setRiskProfile(ids: string[], riskProfile: BackOfficeCustomer['riskProfile'], reason = 'Bulk risk profile update', assessedBy = 'Back Office Admin'): void {
    const idSet = new Set(ids);
    const today = new Date().toISOString().slice(0, 10);
    this._customers.update((list) =>
      list.map((c) => (idSet.has(c.id) ? { ...c, riskProfile, riskProfileMethod: 'Manual', riskProfileScore: undefined, riskProfileAssessedOn: today } : c)),
    );
    const timestamp = new Date().toISOString();
    this._riskAssessmentHistory.update((log) => [
      ...ids.map((customerId, i) => ({
        id: `RPA-${log.length + i + 1}`,
        customerId,
        profile: riskProfile,
        method: 'Manual' as const,
        reason,
        assessedBy,
        timestamp,
      })),
      ...log,
    ]);
  }

  historyFor(customerId: string): RiskAssessmentHistoryEntry[] {
    return this._riskAssessmentHistory().filter((h) => h.customerId === customerId);
  }

  /** True once >12 months have passed since the last assessment, or if the customer has never been formally assessed. */
  isReviewDue(customer: BackOfficeCustomer): boolean {
    if (!customer.riskProfileAssessedOn) return true;
    const ageDays = (Date.now() - new Date(customer.riskProfileAssessedOn).getTime()) / (1000 * 60 * 60 * 24);
    return ageDays > REVIEW_DUE_DAYS;
  }

  /** Auto risk-profile: computes a score from questionnaire answers and applies it, logged as a Questionnaire-method entry. */
  assessRiskProfileViaQuestionnaire(customerId: string, answerScores: number[], assessedBy = 'Back Office Admin'): { score: number; profile: BackOfficeCustomer['riskProfile'] } {
    const score = answerScores.reduce((sum, s) => sum + s, 0);
    const profile = scoreToRiskProfile(score);
    const today = new Date().toISOString().slice(0, 10);
    this._customers.update((list) =>
      list.map((c) => (c.id === customerId ? { ...c, riskProfile: profile, riskProfileMethod: 'Questionnaire', riskProfileScore: score, riskProfileAssessedOn: today } : c)),
    );
    this._riskAssessmentHistory.update((log) => [
      {
        id: `RPA-${log.length + 1}`,
        customerId,
        profile,
        method: 'Questionnaire',
        score,
        maxScore: RISK_QUESTIONNAIRE_MAX_SCORE,
        assessedBy,
        timestamp: new Date().toISOString(),
      },
      ...log,
    ]);
    return { score, profile };
  }

  /** Manual override for a single customer — requires a reason, kept for SEBI-style audit trail. */
  setRiskProfileManual(customerId: string, riskProfile: BackOfficeCustomer['riskProfile'], reason: string, assessedBy = 'Back Office Admin'): void {
    const today = new Date().toISOString().slice(0, 10);
    this._customers.update((list) =>
      list.map((c) => (c.id === customerId ? { ...c, riskProfile, riskProfileMethod: 'Manual', riskProfileScore: undefined, riskProfileAssessedOn: today } : c)),
    );
    this._riskAssessmentHistory.update((log) => [
      { id: `RPA-${log.length + 1}`, customerId, profile: riskProfile, method: 'Manual', reason, assessedBy, timestamp: new Date().toISOString() },
      ...log,
    ]);
  }

  createGroup(name: string): CustomerGroup {
    const group: CustomerGroup = { id: `GRP-${String(nextGroupSeq++).padStart(3, '0')}`, name, primaryContactId: null, createdOn: new Date().toISOString().slice(0, 10) };
    this._groups.update((list) => [...list, group]);
    return group;
  }

  addMemberToGroup(customerId: string, groupId: string): void {
    const membersInGroup = this._customers().filter((c) => c.groupId === groupId).length;
    this._customers.update((list) => list.map((c) => (c.id === customerId ? { ...c, groupId, sortOrder: membersInGroup } : c)));
  }

  removeMemberFromGroup(customerId: string): void {
    this._customers.update((list) => list.map((c) => (c.id === customerId ? { ...c, groupId: null } : c)));
    const group = this._groups().find((g) => g.primaryContactId === customerId);
    if (group) this._groups.update((list) => list.map((g) => (g.id === group.id ? { ...g, primaryContactId: null } : g)));
  }

  setPrimaryContact(groupId: string, customerId: string): void {
    this._groups.update((list) => list.map((g) => (g.id === groupId ? { ...g, primaryContactId: customerId } : g)));
  }

  reorderGroupMembers(groupId: string, orderedCustomerIds: string[]): void {
    const orderMap = new Map(orderedCustomerIds.map((id, i) => [id, i]));
    this._customers.update((list) => list.map((c) => (c.groupId === groupId && orderMap.has(c.id) ? { ...c, sortOrder: orderMap.get(c.id)! } : c)));
  }

  /** Merge one or more source groups into a single survivor group. */
  mergeGroups(sourceGroupIds: string[], survivorGroupId: string): void {
    const toMerge = sourceGroupIds.filter((id) => id !== survivorGroupId);
    if (toMerge.length === 0) return;
    const mergeSet = new Set(toMerge);
    const mergedNames = this._groups()
      .filter((g) => mergeSet.has(g.id))
      .map((g) => g.name)
      .join(', ');
    const survivorName = this._groups().find((g) => g.id === survivorGroupId)?.name ?? survivorGroupId;

    this._customers.update((list) => list.map((c) => (c.groupId && mergeSet.has(c.groupId) ? { ...c, groupId: survivorGroupId } : c)));
    this._groups.update((list) => list.filter((g) => !mergeSet.has(g.id)));
    this._mergeLog.update((log) => [
      { id: `MRG-${log.length + 1}`, kind: 'Group', survivorLabel: survivorName, mergedLabel: mergedNames, timestamp: new Date().toISOString() },
      ...log,
    ]);
  }

  splitGroup(sourceGroupId: string, memberIdsToMove: string[], newGroupName: string): CustomerGroup {
    const newGroup = this.createGroup(newGroupName);
    const idSet = new Set(memberIdsToMove);
    this._customers.update((list) => list.map((c, i) => (idSet.has(c.id) ? { ...c, groupId: newGroup.id, sortOrder: i } : c)));
    return newGroup;
  }

  renumberGroupCodes(): { oldId: string; newId: string; name: string }[] {
    const sorted = [...this._groups()].sort((a, b) => a.createdOn.localeCompare(b.createdOn));
    const mapping = sorted.map((g, i) => ({ oldId: g.id, newId: `GRP-${String(i + 1).padStart(3, '0')}`, name: g.name }));
    const remap = new Map(mapping.map((m) => [m.oldId, m.newId]));
    this._groups.update((list) => list.map((g) => ({ ...g, id: remap.get(g.id) ?? g.id })));
    this._customers.update((list) => list.map((c) => (c.groupId && remap.has(c.groupId) ? { ...c, groupId: remap.get(c.groupId)! } : c)));
    return mapping;
  }

  /** Merge exactly two customer records: survivorId keeps its id, but is patched with the chosen field values. */
  mergeCustomers(survivorId: string, loserId: string, fieldOverrides: Partial<BackOfficeCustomer>): void {
    const survivor = this.getCustomer(survivorId);
    const loser = this.getCustomer(loserId);
    if (!survivor || !loser) return;
    this._customers.update((list) =>
      list.filter((c) => c.id !== loserId).map((c) => (c.id === survivorId ? { ...c, ...fieldOverrides, aum: survivor.aum + loser.aum } : c)),
    );
    this._mergeLog.update((log) => [
      { id: `MRG-${log.length + 1}`, kind: 'Customer', survivorLabel: `${survivor.name} (${survivorId})`, mergedLabel: `${loser.name} (${loserId})`, timestamp: new Date().toISOString() },
      ...log,
    ]);
  }

  addCustomer(data: {
    name: string;
    pan: string;
    email: string;
    phone: string;
    riskProfile: BackOfficeCustomer['riskProfile'];
    segment: BackOfficeCustomer['segment'];
    kycStatus: BackOfficeCustomer['kycStatus'];
    groupId: string | null;
  }): BackOfficeCustomer {
    const membersInGroup = data.groupId ? this._customers().filter((c) => c.groupId === data.groupId).length : 0;
    const customer: BackOfficeCustomer = {
      id: `BOC-${nextCustomerSeq++}`,
      name: data.name,
      pan: data.pan,
      email: data.email,
      phone: data.phone,
      kycStatus: data.kycStatus,
      riskProfile: data.riskProfile,
      segment: data.segment,
      groupId: data.groupId,
      status: 'Active',
      aum: 0,
      joinedOn: new Date().toISOString().slice(0, 10),
      sortOrder: membersInGroup,
    };
    this._customers.update((list) => [...list, customer]);
    return customer;
  }

  importCustomers(rows: ImportCustomerRow[], fileName: string): number {
    const newCustomers: BackOfficeCustomer[] = rows.map((r) => ({
      id: `BOC-${nextCustomerSeq++}`,
      name: r.name,
      pan: r.pan,
      email: r.email,
      phone: r.phone,
      kycStatus: 'Not Started',
      riskProfile: r.riskProfile,
      segment: r.segment,
      groupId: null,
      status: 'Active',
      aum: 0,
      joinedOn: new Date().toISOString().slice(0, 10),
      sortOrder: 0,
    }));
    this._customers.update((list) => [...list, ...newCustomers]);
    this._importLog.update((log) => [{ id: `IMP-${log.length + 1}`, fileName, rowCount: newCustomers.length, importedOn: new Date().toISOString() }, ...log]);
    return newCustomers.length;
  }
}
