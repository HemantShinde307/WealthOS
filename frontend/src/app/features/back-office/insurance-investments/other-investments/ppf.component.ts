import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OtherInvestmentsService } from '../other-investments.service';
import { PpfAccount } from '../insurance-investments-data.mock';

@Component({
  selector: 'app-other-investments-ppf',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ppf.component.html',
})
export class PpfComponent {
  readonly svc = inject(OtherInvestmentsService);

  readonly formVisible = signal(false);
  readonly accountNumber = signal('');
  readonly holderName = signal('');
  readonly institution = signal('');
  readonly openingDate = signal(new Date().toISOString().slice(0, 10));
  readonly balance = signal<number | null>(null);
  readonly error = signal<string | null>(null);

  readonly contributingAccountId = signal<string | null>(null);
  readonly contributionAmount = signal<number | null>(null);
  readonly contributionDate = signal(new Date().toISOString().slice(0, 10));

  openNew(): void {
    this.accountNumber.set('');
    this.holderName.set('');
    this.institution.set('');
    this.openingDate.set(new Date().toISOString().slice(0, 10));
    this.balance.set(null);
    this.error.set(null);
    this.formVisible.set(true);
  }

  cancel(): void {
    this.formVisible.set(false);
  }

  save(): void {
    if (!this.accountNumber().trim() || !this.holderName().trim()) {
      this.error.set('Account number and holder name are required.');
      return;
    }
    this.svc.addPpfAccount({
      accountNumber: this.accountNumber().trim(),
      holderName: this.holderName().trim(),
      institution: this.institution().trim() || 'Post Office',
      openingDate: this.openingDate(),
      balance: this.balance() ?? 0,
    });
    this.formVisible.set(false);
  }

  remove(id: string): void {
    this.svc.deletePpfAccount(id);
  }

  startContribution(account: PpfAccount): void {
    this.contributingAccountId.set(this.contributingAccountId() === account.id ? null : account.id);
    this.contributionAmount.set(null);
    this.contributionDate.set(new Date().toISOString().slice(0, 10));
  }

  addContribution(accountId: string): void {
    if (!this.contributionAmount() || this.contributionAmount()! <= 0) return;
    this.svc.addPpfContribution(accountId, this.contributionDate(), this.contributionAmount()!);
    this.contributingAccountId.set(null);
  }
}
