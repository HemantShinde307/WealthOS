import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LifeInsuranceService } from '../life-insurance.service';
import { ExportButtonComponent } from '../../../../shared/components/export-button/export-button.component';

@Component({
  selector: 'app-fup-date-batch-update',
  standalone: true,
  imports: [CommonModule, ExportButtonComponent],
  templateUrl: './fup-date-batch-update.component.html',
})
export class FupDateBatchUpdateComponent {
  readonly svc = inject(LifeInsuranceService);

  readonly exportHeaders = ['Policy No.', 'Policyholder', 'Insurer', 'Current FUP Date', 'Status'];
  readonly exportRows = computed(() => this.svc.policies().map((p) => [p.policyNumber, p.policyholderName, p.insurer, p.fupDate, p.status]));

  readonly selectedIds = signal<Set<string>>(new Set());
  readonly newFupDate = signal(new Date().toISOString().slice(0, 10));
  readonly lastUpdateCount = signal<number | null>(null);

  toggle(id: string, checked: boolean): void {
    const next = new Set(this.selectedIds());
    if (checked) next.add(id);
    else next.delete(id);
    this.selectedIds.set(next);
  }

  isSelected(id: string): boolean {
    return this.selectedIds().has(id);
  }

  toggleAll(checked: boolean): void {
    this.selectedIds.set(checked ? new Set(this.svc.policies().map((p) => p.id)) : new Set());
  }

  applyBatchUpdate(): void {
    const ids = [...this.selectedIds()];
    if (!ids.length) return;
    const count = this.svc.bulkUpdateFupDate(ids, this.newFupDate());
    this.lastUpdateCount.set(count);
    this.selectedIds.set(new Set());
  }
}
