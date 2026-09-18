import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { SchemeService } from '../../../core/services/scheme.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { AuthService } from '../../../core/services/auth.service';
import { MobileTxnStateService } from './mobile-txn-state.service';

@Component({
  selector: 'app-order-review',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-review.component.html',
})
export class OrderReviewComponent {
  private readonly schemeService = inject(SchemeService);
  private readonly transactionService = inject(TransactionService);
  private readonly auth = inject(AuthService);
  readonly state = inject(MobileTxnStateService);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  readonly agreed = signal(false);
  readonly submitting = signal(false);

  readonly scheme = computed(() => this.schemeService.getById(this.state.selectedSchemeId()));
  readonly stampDuty = computed(() => Number((this.state.amount() * 0.00005).toFixed(2)));
  readonly totalPayable = computed(() => this.state.amount() + this.stampDuty());

  goBack(): void {
    this.location.back();
  }

  confirmAndPay(): void {
    const scheme = this.scheme();
    if (!scheme || !this.agreed() || this.submitting()) return;
    this.submitting.set(true);
    const units = Number((this.state.amount() / scheme.nav).toFixed(3));
    const created = this.transactionService.add({
      clientId: this.auth.currentUser().customerId ?? 'CL-SELF',
      clientName: this.auth.currentUser().name,
      type: 'Purchase',
      schemeName: scheme.name,
      amount: this.state.amount(),
      units,
      nav: scheme.nav,
      status: 'Completed',
      date: new Date().toISOString().slice(0, 10),
    });
    this.state.lastOrderId.set(created.id);
    setTimeout(() => {
      this.router.navigate(['/mobile/transaction-success']);
    }, 400);
  }
}
