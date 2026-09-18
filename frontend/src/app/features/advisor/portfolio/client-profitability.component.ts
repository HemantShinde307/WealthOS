import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ClientService } from '../../../core/services/client.service';
import { InrCompactPipe } from '../../../shared/pipes/inr-compact.pipe';
import { CLIENT_HOLDINGS_REVENUE } from '../advisor-mock-data';

@Component({
  selector: 'app-client-profitability',
  standalone: true,
  imports: [CommonModule, RouterLink, InrCompactPipe],
  templateUrl: './client-profitability.component.html',
})
export class ClientProfitabilityComponent {
  private readonly route = inject(ActivatedRoute);
  readonly clientService = inject(ClientService);

  readonly eligibleClientIds = Object.keys(CLIENT_HOLDINGS_REVENUE);
  readonly selectedClientId = signal(
    this.route.snapshot.queryParamMap.get('client') ?? this.eligibleClientIds[0],
  );

  readonly eligibleClients = computed(() =>
    this.eligibleClientIds.map((id) => this.clientService.getById(id)).filter((c): c is NonNullable<typeof c> => !!c),
  );

  readonly selectedClient = computed(() => this.clientService.getById(this.selectedClientId()));

  readonly holdings = computed(() => CLIENT_HOLDINGS_REVENUE[this.selectedClientId()] ?? []);

  readonly totalAum = computed(() => this.holdings().reduce((s, h) => s + h.currentValue, 0));
  readonly annualRevenue = computed(() =>
    this.holdings().reduce((s, h) => s + (h.currentValue * h.trailBps) / 10000, 0),
  );
  readonly blendedBps = computed(() => {
    const aum = this.totalAum();
    return aum ? Math.round((this.annualRevenue() / aum) * 10000 * 10) / 10 : 0;
  });
  readonly monthlyRevenue = (h: { currentValue: number; trailBps: number }) => Math.round((h.currentValue * h.trailBps) / 10000 / 12);
}
