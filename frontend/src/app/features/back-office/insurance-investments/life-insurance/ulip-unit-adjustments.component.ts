import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LifeInsuranceService } from '../life-insurance.service';
import { UlipUnitAdjustment } from '../insurance-investments-data.mock';

@Component({
  selector: 'app-ulip-unit-adjustments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ulip-unit-adjustments.component.html',
})
export class UlipUnitAdjustmentsComponent {
  readonly svc = inject(LifeInsuranceService);

  readonly adjustmentTypes: UlipUnitAdjustment['adjustmentType'][] = ['Switch In', 'Switch Out', 'Top-Up', 'Partial Withdrawal'];

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
}
