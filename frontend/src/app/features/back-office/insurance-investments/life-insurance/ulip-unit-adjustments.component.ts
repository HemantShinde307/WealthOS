import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LifeInsuranceService } from '../life-insurance.service';
import { UlipUnitAdjustment } from '../insurance-investments-data.mock';
import { ExportButtonComponent } from '../../../../shared/components/export-button/export-button.component';
import { confirmDelete } from '../../../../shared/utils/confirm';

@Component({
  selector: 'app-ulip-unit-adjustments',
  standalone: true,
  imports: [CommonModule, ExportButtonComponent],
  templateUrl: './ulip-unit-adjustments.component.html',
})
export class UlipUnitAdjustmentsComponent {
  readonly svc = inject(LifeInsuranceService);

  readonly adjustmentTypes: UlipUnitAdjustment['adjustmentType'][] = ['Switch In', 'Switch Out', 'Top-Up', 'Partial Withdrawal'];

  readonly exportHeaders = ['Policy No.', 'Fund', 'Type', 'Units', 'NAV', 'Amount', 'Date'];
  readonly exportRows = computed(() =>
    this.svc.ulipAdjustments().map((a) => [a.policyNumber, a.fundName, a.adjustmentType, a.units, a.nav, a.amount, a.date]),
  );

  readonly editingId = signal<string | null>(null);
  readonly policyId = signal('');
  readonly fundName = signal('');
  readonly adjustmentType = signal<UlipUnitAdjustment['adjustmentType']>('Switch In');
  readonly units = signal<number | null>(null);
  readonly nav = signal<number | null>(null);
  readonly date = signal(new Date().toISOString().slice(0, 10));
  readonly error = signal<string | null>(null);
  readonly saved = signal(false);

  record(): void {
    this.error.set(null);
    this.saved.set(false);
    const policy = this.svc.getPolicy(this.policyId());
    if (!policy) {
      this.error.set('Please select a ULIP policy.');
      return;
    }
    if (!this.fundName().trim() || !this.units() || !this.nav()) {
      this.error.set('Fund name, units and NAV are required.');
      return;
    }
    const editId = this.editingId();
    if (editId) {
      this.svc.updateUlipAdjustment(editId, {
        policyId: policy.id,
        policyNumber: policy.policyNumber,
        fundName: this.fundName().trim(),
        adjustmentType: this.adjustmentType(),
        units: this.units()!,
        nav: this.nav()!,
        amount: Math.round(this.units()! * this.nav()!),
        date: this.date(),
      });
      this.saved.set(true);
      this.resetForm();
      return;
    }
    this.svc.addUlipAdjustment({
      policyId: policy.id,
      policyNumber: policy.policyNumber,
      fundName: this.fundName().trim(),
      adjustmentType: this.adjustmentType(),
      units: this.units()!,
      nav: this.nav()!,
      amount: Math.round(this.units()! * this.nav()!),
      date: this.date(),
    });
    this.saved.set(true);
    this.fundName.set('');
    this.units.set(null);
    this.nav.set(null);
  }

  edit(a: UlipUnitAdjustment): void {
    this.editingId.set(a.id);
    this.policyId.set(a.policyId);
    this.fundName.set(a.fundName);
    this.adjustmentType.set(a.adjustmentType);
    this.units.set(a.units);
    this.nav.set(a.nav);
    this.date.set(a.date);
    this.error.set(null);
    this.saved.set(false);
  }

  cancelEdit(): void {
    this.resetForm();
  }

  remove(a: UlipUnitAdjustment): void {
    if (!confirmDelete(`the ${a.adjustmentType} adjustment for policy ${a.policyNumber}`)) return;
    this.svc.deleteUlipAdjustment(a.id);
    if (this.editingId() === a.id) this.resetForm();
  }

  private resetForm(): void {
    this.editingId.set(null);
    this.policyId.set('');
    this.fundName.set('');
    this.units.set(null);
    this.nav.set(null);
  }
}
