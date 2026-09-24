import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackOfficeCustomer } from '../back-office-data.mock';
import { ExportButtonComponent } from '../../../shared/components/export-button/export-button.component';
import { BackOfficeCustomerService } from '../back-office-customer.service';

@Component({
  selector: 'app-risk-profile-batch-edit',
  standalone: true,
  imports: [CommonModule, ExportButtonComponent],
  templateUrl: './risk-profile-batch-edit.component.html',
})
export class RiskProfileBatchEditComponent {
  readonly boService = inject(BackOfficeCustomerService);

  readonly exportHeaders = ['ID', 'Name', 'Segment', 'Current Risk Profile'];
  readonly exportRows = computed(() => this.filtered().map((c) => [c.id, c.name, c.segment, c.riskProfile]));

  readonly segmentFilter = signal('All');
  readonly currentRiskFilter = signal('All');
  readonly newRiskProfile = signal<BackOfficeCustomer['riskProfile']>('Moderate');
  readonly reason = signal('');
  readonly submitted = signal(false);
  readonly selectedIds = signal<Set<string>>(new Set());
  readonly applied = signal(false);

  readonly reasonError = computed(() => this.submitted() && !this.reason().trim());
  readonly canApply = computed(() => this.selectedIds().size > 0 && this.reason().trim().length > 0);

  readonly filtered = computed(() => {
    const segment = this.segmentFilter();
    const risk = this.currentRiskFilter();
    return this.boService.customers().filter((c) => (segment === 'All' || c.segment === segment) && (risk === 'All' || c.riskProfile === risk));
  });

  toggle(id: string): void {
    this.selectedIds.update((set) => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    this.applied.set(false);
  }

  toggleAll(): void {
    const allIds = this.filtered().map((c) => c.id);
    const allSelected = allIds.every((id) => this.selectedIds().has(id));
    this.selectedIds.set(allSelected ? new Set() : new Set(allIds));
  }

  apply(): void {
    this.submitted.set(true);
    if (!this.canApply()) return;
    this.boService.setRiskProfile([...this.selectedIds()], this.newRiskProfile(), this.reason().trim());
    this.applied.set(true);
    this.selectedIds.set(new Set());
    this.reason.set('');
    this.submitted.set(false);
  }
}
