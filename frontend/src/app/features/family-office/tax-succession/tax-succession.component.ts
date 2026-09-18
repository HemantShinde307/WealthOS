import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FamilyOfficeService } from '../family-office.service';
import { FamilyMember } from '../family-office.models';
import { InrCompactPipe } from '../../../shared/pipes/inr-compact.pipe';

@Component({
  selector: 'app-tax-succession',
  standalone: true,
  imports: [CommonModule, InrCompactPipe],
  templateUrl: './tax-succession.component.html',
})
export class TaxSuccessionComponent {
  readonly familyOffice = inject(FamilyOfficeService);

  readonly members = this.familyOffice.members;
  readonly head = computed<FamilyMember | undefined>(() => this.members().find((m) => m.relationship === 'Family Head'));
  readonly beneficiaries = computed(() => this.members().filter((m) => m.relationship !== 'Family Head'));

  readonly totalAum = this.familyOffice.totalFamilyAum;

  // Illustrative blended tax exposure across the family's holdings.
  readonly ltcgExposure = computed(() => Math.round(this.totalAum() * 0.42 * 0.125));
  readonly stcgExposure = computed(() => Math.round(this.totalAum() * 0.08 * 0.2));
  readonly debtGainsExposure = computed(() => Math.round(this.totalAum() * 0.25 * 0.3));
  readonly estimatedTaxEvent = computed(() => this.ltcgExposure() + this.stcgExposure() + this.debtGainsExposure());

  sharePct(m: FamilyMember): number {
    return this.familyOffice.sharePct(m);
  }

  kycLabel(m: FamilyMember): string {
    return m.panMasked === 'Not Applicable' ? 'Guardian KYC' : m.casStatus === 'Synced' ? 'Verified' : 'Pending';
  }
}
