import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LifeInsuranceService } from '../life-insurance.service';
import { LIFE_INSURERS, LIFE_POLICY_TYPES, LifeInsurancePolicy } from '../insurance-investments-data.mock';

@Component({
  selector: 'app-policy-entry',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './policy-entry.component.html',
})
export class PolicyEntryComponent {
  readonly svc = inject(LifeInsuranceService);

  readonly insurers = LIFE_INSURERS;
  readonly policyTypes = LIFE_POLICY_TYPES;
  readonly frequencies: LifeInsurancePolicy['premiumFrequency'][] = ['Monthly', 'Quarterly', 'Half-Yearly', 'Annual'];

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
    this.policyNumber.set('');
    this.policyholderName.set('');
    this.sumAssured.set(null);
    this.premium.set(null);
    this.nominee.set('');
  }
}
