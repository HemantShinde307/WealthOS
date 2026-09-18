import { Component, computed, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { TransactionService } from '../../../core/services/transaction.service';
import { MobileTxnStateService } from './mobile-txn-state.service';

@Component({
  selector: 'app-transaction-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transaction-success.component.html',
})
export class TransactionSuccessComponent {
  private readonly transactionService = inject(TransactionService);
  readonly state = inject(MobileTxnStateService);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  readonly order = computed(() => {
    const id = this.state.lastOrderId();
    return id ? this.transactionService.getById(id) : undefined;
  });

  readonly estimatedFee = computed(() => Number((this.state.amount() * 0.00005).toFixed(2)));

  goBack(): void {
    this.location.back();
  }

  viewPortfolio(): void {
    this.router.navigate(['/mobile/portfolio']);
  }

  backToDashboard(): void {
    this.state.reset();
    this.router.navigate(['/mobile/dashboard']);
  }
}
