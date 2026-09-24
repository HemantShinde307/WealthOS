import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PresentationsService } from '../presentations.service';
import { ReportHeaderComponent } from '../shared/report-header.component';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import { ExportButtonComponent } from '../../../../shared/components/export-button/export-button.component';
import { InrCompactPipe } from '../../../../shared/pipes/inr-compact.pipe';

@Component({
  selector: 'app-ppf-passbook',
  standalone: true,
  imports: [CommonModule, ReportHeaderComponent, StatCardComponent, InrCompactPipe, ExportButtonComponent],
  templateUrl: './ppf-passbook.component.html',
})
export class PpfPassbookComponent {
  readonly presentations = inject(PresentationsService);

  readonly accounts = this.presentations.ppfAccounts;
  readonly selectedAccountId = signal<string | null>(null);

  readonly selectedAccount = computed(() => {
    const id = this.selectedAccountId();
    return this.accounts().find((a) => a.id === id) ?? this.accounts()[0] ?? null;
  });

  readonly contributions = computed(() => {
    const account = this.selectedAccount();
    return account ? this.presentations.ppfContributions(account.id) : [];
  });

  readonly exportHeaders = ['Financial Year', 'Opening Balance', 'Contribution', 'Interest Credited', 'Closing Balance'];
  readonly exportRows = computed(() => this.contributions().map((c) => [c.financialYear, c.openingBalance, c.contribution, c.interestCredited, c.closingBalance]));

  selectAccount(id: string): void {
    this.selectedAccountId.set(id);
  }

  yearsToMaturity(maturityDate: string): number {
    return Math.max(new Date(maturityDate).getFullYear() - new Date().getFullYear(), 0);
  }
}
