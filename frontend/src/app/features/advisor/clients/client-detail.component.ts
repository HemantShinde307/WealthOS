import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ClientService } from '../../../core/services/client.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { InrCompactPipe } from '../../../shared/pipes/inr-compact.pipe';
import { CLIENT_HOLDINGS_REVENUE } from '../advisor-mock-data';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, InrCompactPipe],
  templateUrl: './client-detail.component.html',
})
export class ClientDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly clientService = inject(ClientService);
  private readonly transactionService = inject(TransactionService);

  private readonly clientId = toSignal(this.route.paramMap.pipe(map((p) => p.get('id') ?? '')), { initialValue: '' });

  readonly client = computed(() => this.clientService.getById(this.clientId()));

  readonly transactions = computed(() =>
    this.transactionService.transactions().filter((t) => t.clientId === this.clientId()),
  );

  readonly holdings = computed(() => CLIENT_HOLDINGS_REVENUE[this.clientId()] ?? []);

  readonly holdingsTotal = computed(() => this.holdings().reduce((sum, h) => sum + h.currentValue, 0));

  initials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join('')
      .toUpperCase();
  }
}
