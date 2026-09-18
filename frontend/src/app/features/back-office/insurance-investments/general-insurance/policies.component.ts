import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeneralInsuranceService } from '../general-insurance.service';
import { GENERAL_INSURERS, GENERAL_POLICY_TYPES, GeneralInsurancePolicy } from '../insurance-investments-data.mock';

@Component({
  selector: 'app-general-insurance-policies',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './policies.component.html',
})
export class GeneralInsurancePoliciesComponent {
  readonly svc = inject(GeneralInsuranceService);
  readonly insurers = GENERAL_INSURERS;
  readonly types = GENERAL_POLICY_TYPES;
  readonly statuses: GeneralInsurancePolicy['status'][] = ['Active', 'Due for Renewal', 'Expired', 'Cancelled'];

  readonly editingId = signal<string | null>(null);
  readonly formVisible = signal(false);

  readonly policyNumber = signal('');
  readonly policyholderName = signal('');
  readonly insurer = signal(this.insurers[0]);
  readonly type = signal<GeneralInsurancePolicy['type']>('Motor');
  readonly sumInsured = signal<number | null>(null);
  readonly premium = signal<number | null>(null);
  readonly issueDate = signal(new Date().toISOString().slice(0, 10));
  readonly renewalDate = signal(new Date().toISOString().slice(0, 10));
  readonly status = signal<GeneralInsurancePolicy['status']>('Active');
  readonly error = signal<string | null>(null);

  openNew(): void {
    this.editingId.set(null);
    this.policyNumber.set('');
    this.policyholderName.set('');
    this.insurer.set(this.insurers[0]);
    this.type.set('Motor');
    this.sumInsured.set(null);
    this.premium.set(null);
    this.issueDate.set(new Date().toISOString().slice(0, 10));
    this.renewalDate.set(new Date().toISOString().slice(0, 10));
    this.status.set('Active');
    this.error.set(null);
    this.formVisible.set(true);
  }

  edit(p: GeneralInsurancePolicy): void {
    this.editingId.set(p.id);
    this.policyNumber.set(p.policyNumber);
    this.policyholderName.set(p.policyholderName);
    this.insurer.set(p.insurer);
    this.type.set(p.type);
    this.sumInsured.set(p.sumInsured);
    this.premium.set(p.premium);
    this.issueDate.set(p.issueDate);
    this.renewalDate.set(p.renewalDate);
    this.status.set(p.status);
    this.error.set(null);
    this.formVisible.set(true);
  }

  cancel(): void {
    this.formVisible.set(false);
    this.editingId.set(null);
  }

  save(): void {
    this.error.set(null);
    if (!this.policyNumber().trim() || !this.policyholderName().trim()) {
      this.error.set('Policy number and policyholder name are required.');
      return;
    }
    if (!this.sumInsured() || !this.premium()) {
      this.error.set('Sum insured and premium must be greater than zero.');
      return;
    }
    const payload = {
      policyNumber: this.policyNumber().trim(),
      policyholderName: this.policyholderName().trim(),
      insurer: this.insurer(),
      type: this.type(),
      sumInsured: this.sumInsured()!,
      premium: this.premium()!,
      issueDate: this.issueDate(),
      renewalDate: this.renewalDate(),
      status: this.status(),
    };
    const id = this.editingId();
    if (id) this.svc.updatePolicy(id, payload);
    else this.svc.addPolicy(payload);
    this.formVisible.set(false);
    this.editingId.set(null);
  }

  remove(id: string): void {
    this.svc.deletePolicy(id);
  }
}
