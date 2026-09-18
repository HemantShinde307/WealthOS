import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SchemeService } from '../../../core/services/scheme.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { AuthService } from '../../../core/services/auth.service';
import { PortfolioService } from '../../../core/services/portfolio.service';
import { MfPurchaseStateService } from './mf-purchase-state.service';

@Component({
  selector: 'app-mf-review-confirm',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './review-confirm.component.html',
})
export class ReviewConfirmComponent {
  private readonly schemeService = inject(SchemeService);
  private readonly transactionService = inject(TransactionService);
  private readonly auth = inject(AuthService);
  private readonly portfolioService = inject(PortfolioService);
  readonly state = inject(MfPurchaseStateService);
  private readonly router = inject(Router);

  readonly scheme = computed(() => this.schemeService.getById(this.state.selectedSchemeId() ?? ''));
  readonly estimatedUnits = computed(() => {
    const s = this.scheme();
    return s ? this.state.amount() / s.nav : 0;
  });
  readonly submitting = signal(false);

  confirm(): void {
    const s = this.scheme();
    if (!s) return;
    this.submitting.set(true);
    const txn = this.transactionService.add({
      clientId: this.auth.currentUser().customerId ?? 'CL-SELF',
      clientName: this.auth.currentUser().name,
      type: 'Purchase',
      schemeName: s.name,
      amount: this.state.amount(),
      units: Number(this.estimatedUnits().toFixed(3)),
      nav: s.nav,
      status: 'Completed',
      date: new Date().toISOString().slice(0, 10),
      folio: 'FL-' + Math.floor(70000 + Math.random() * 9999),
    });
    this.portfolioService.recordPurchase(s.name, s.category, Number(this.estimatedUnits().toFixed(3)), this.state.amount(), s.nav);
    this.state.lastOrderId.set(txn.id);
    this.router.navigate(['/mf-purchase/order-placed']);
  }
}
