import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LifeInsuranceService } from '../life-insurance.service';
import { LIFE_INSURERS, LIFE_POLICY_TYPES, LifeInsurancePolicy } from '../insurance-investments-data.mock';
import { ExportButtonComponent } from '../../../../shared/components/export-button/export-button.component';
import { confirmDelete } from '../../../../shared/utils/confirm';

@Component({
  selector: 'app-policy-entry',
  standalone: true,
  imports: [CommonModule, ExportButtonComponent],
  templateUrl: './policy-entry.component.html',
})
export class PolicyEntryComponent {
  readonly svc = inject(LifeInsuranceService);

  readonly insurers = LIFE_INSURERS;
  readonly policyTypes = LIFE_POLICY_TYPES;
  readonly frequencies: LifeInsurancePolicy['premiumFrequency'][] = ['Monthly', 'Quarterly', 'Half-Yearly', 'Annual'];

  readonly exportHeaders = ['Policy No.', 'Policyholder', 'Insurer', 'Type', 'Sum Assured', 'Premium', 'Frequency', 'Commencement Date', 'FUP Date', 'Nominee', 'Status'];
  readonly exportRows = computed(() =>
    this.svc.policies().map((p) => [p.policyNumber, p.policyholderName, p.insurer, p.policyType, p.sumAssured, p.premium, p.premiumFrequency, p.commencementDate, p.fupDate, p.nominee, p.status]),
  );

  readonly editingId = signal<string | null>(null);
  readonly policyNumber = signal('');
  readonly policyholderName = signal('');
  readonly insurer = signal(this.insurers[0]);
  readonly policyType = signal<LifeInsurancePolicy['policyType']>('Term Life');
  readonly sumAssured = signal<number | null>(null);
  readonly premium = signal<number | null>(null);
  readonly premiumFrequency = signal<LifeInsurancePolicy['premiumFrequency']>('Annual');
  readonly commencementDate = signal(new Date().toISOString().slice(0, 10));
  readonly nominee = signal('');
  readonly justSaved = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  submit(): void {
    this.error.set(null);
    if (!this.policyNumber().trim() || !this.policyholderName().trim()) {
      this.error.set('Policy number and policyholder name are required.');
      return;
    }
    if (!this.sumAssured() || !this.premium()) {
      this.error.set('Sum assured and premium must be greater than zero.');
      return;
    }
    const editId = this.editingId();
    if (editId) {
      this.svc.updatePolicy(editId, {
        policyNumber: this.policyNumber().trim(),
        policyholderName: this.policyholderName().trim(),
        insurer: this.insurer(),
        policyType: this.policyType(),
        sumAssured: this.sumAssured()!,
        premium: this.premium()!,
        premiumFrequency: this.premiumFrequency(),
        commencementDate: this.commencementDate(),
        nominee: this.nominee().trim() || '—',
      });
      this.justSaved.set(this.policyNumber().trim());
      this.resetForm();
      return;
    }
    const policy = this.svc.addPolicy({
      policyNumber: this.policyNumber().trim(),
      policyholderName: this.policyholderName().trim(),
      insurer: this.insurer(),
      policyType: this.policyType(),
      sumAssured: this.sumAssured()!,
      premium: this.premium()!,
      premiumFrequency: this.premiumFrequency(),
      commencementDate: this.commencementDate(),
      fupDate: this.commencementDate(),
      nominee: this.nominee().trim() || '—',
      status: 'Active',
    });
    this.justSaved.set(policy.policyNumber);
    this.resetForm();
  }

  edit(p: LifeInsurancePolicy): void {
    this.editingId.set(p.id);
    this.policyNumber.set(p.policyNumber);
    this.policyholderName.set(p.policyholderName);
    this.insurer.set(p.insurer);
    this.policyType.set(p.policyType);
    this.sumAssured.set(p.sumAssured);
    this.premium.set(p.premium);
    this.premiumFrequency.set(p.premiumFrequency);
    this.commencementDate.set(p.commencementDate);
    this.nominee.set(p.nominee === '—' ? '' : p.nominee);
    this.error.set(null);
    this.justSaved.set(null);
  }

  cancelEdit(): void {
    this.resetForm();
  }

  remove(p: LifeInsurancePolicy): void {
    if (!confirmDelete(`policy ${p.policyNumber} (${p.policyholderName})`)) return;
    this.svc.deletePolicy(p.id);
    if (this.editingId() === p.id) this.resetForm();
  }

  private resetForm(): void {
    this.editingId.set(null);
    this.policyNumber.set('');
    this.policyholderName.set('');
    this.sumAssured.set(null);
    this.premium.set(null);
    this.nominee.set('');
  }
}
