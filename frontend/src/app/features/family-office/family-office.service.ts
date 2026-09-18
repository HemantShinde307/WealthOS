import { Injectable, computed, inject, signal } from '@angular/core';
import { Holding, Transaction } from '../../core/models/domain.models';
import { PortfolioService } from '../../core/services/portfolio.service';
import { TransactionService } from '../../core/services/transaction.service';
import { GoalService } from '../../core/services/goal.service';
import { FamilyMember, HOLDING_OWNER, MOCK_FAMILY_GOALS, MOCK_FAMILY_MEMBERS } from './family-office.models';

export interface MemberHolding extends Holding {
  ownerId: string;
}

export interface MemberTransaction extends Transaction {
  ownerId: string;
  ownerName: string;
}

let nextMemberSeq = MOCK_FAMILY_MEMBERS.length + 1;

/**
 * Family-office-scoped facade over the shared mock-data services. It layers a set of
 * FamilyMember "owners" on top of the same Holding/Transaction/Goal data every other
 * module uses, so the consolidated views are built from real (mock) investment data
 * rather than a second parallel dataset.
 */
@Injectable({ providedIn: 'root' })
export class FamilyOfficeService {
  private readonly portfolio = inject(PortfolioService);
  private readonly transactionSvc = inject(TransactionService);
  private readonly goalSvc = inject(GoalService);

  private readonly _members = signal<FamilyMember[]>(MOCK_FAMILY_MEMBERS);
  readonly members = this._members.asReadonly();
  readonly familyGoals = MOCK_FAMILY_GOALS;

  /** Sum of each member's reported AUM (platform + externally held/CAS-discovered). */
  readonly totalFamilyAum = computed(() => this._members().reduce((sum, m) => sum + m.aum, 0));

  /** AUM actually visible on-platform today (shared holdings valued via PortfolioService). */
  readonly platformAum = computed(() => this.portfolio.currentValue());

  /** Portion of family wealth known only from CAS imports / external statements. */
  readonly externalAum = computed(() => Math.max(0, this.totalFamilyAum() - this.platformAum()));

  readonly pendingCasCount = computed(() => this._members().filter((m) => m.casStatus !== 'Synced').length);

  sharePct(member: FamilyMember): number {
    const total = this.totalFamilyAum();
    return total ? Number(((member.aum / total) * 100).toFixed(1)) : 0;
  }

  getById(id: string): FamilyMember | undefined {
    return this._members().find((m) => m.id === id);
  }

  addMember(member: Omit<FamilyMember, 'id'>): FamilyMember {
    const created: FamilyMember = { ...member, id: `FM-${String(nextMemberSeq++).padStart(2, '0')}` };
    this._members.update((list) => [...list, created]);
    return created;
  }

  /** Shared portfolio holdings tagged with the family member who owns each folio. */
  readonly memberHoldings = computed<MemberHolding[]>(() =>
    this.portfolio.holdings().map((h) => ({ ...h, ownerId: HOLDING_OWNER[h.schemeId] ?? this._members()[0].id })),
  );

  holdingsForMember(memberId: string): MemberHolding[] {
    return this.memberHoldings().filter((h) => h.ownerId === memberId);
  }

  /** Shared transaction ledger, round-robin tagged across family members for a per-member ledger view. */
  readonly taggedTransactions = computed<MemberTransaction[]>(() => {
    const members = this._members();
    return this.transactionSvc.transactions().map((t, i) => {
      const owner = members[i % members.length];
      return { ...t, ownerId: owner.id, ownerName: owner.name };
    });
  });
}
