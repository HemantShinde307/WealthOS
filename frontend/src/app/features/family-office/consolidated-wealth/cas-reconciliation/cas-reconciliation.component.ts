import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FamilyOfficeService } from '../../family-office.service';
import { InrCompactPipe } from '../../../../shared/pipes/inr-compact.pipe';

@Component({
  selector: 'app-cas-reconciliation',
  standalone: true,
  imports: [CommonModule, RouterLink, InrCompactPipe],
  templateUrl: './cas-reconciliation.component.html',
})
export class CasReconciliationComponent {
  readonly familyOffice = inject(FamilyOfficeService);

  readonly holdings = this.familyOffice.memberHoldings;
  readonly pendingMembers = computed(() => this.familyOffice.members().filter((m) => m.casStatus !== 'Synced'));

  readonly previouslyTracked = this.familyOffice.platformAum;
  readonly newlyDiscovered = this.familyOffice.externalAum;
  readonly totalConsolidated = this.familyOffice.totalFamilyAum;

  readonly increasePct = computed(() => {
    const before = this.previouslyTracked();
    return before ? Number(((this.newlyDiscovered() / before) * 100).toFixed(1)) : 0;
  });

  ownerName(ownerId: string): string {
    return this.familyOffice.getById(ownerId)?.name ?? 'Unassigned';
  }

  isMapped(ownerId: string): boolean {
    return this.familyOffice.getById(ownerId)?.casStatus === 'Synced';
  }
}
