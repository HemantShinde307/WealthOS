import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientService } from '../../../core/services/client.service';
import { InrCompactPipe } from '../../../shared/pipes/inr-compact.pipe';

@Component({
  selector: 'app-institutional-portfolio',
  standalone: true,
  imports: [CommonModule, InrCompactPipe],
  templateUrl: './institutional-portfolio.component.html',
})
export class InstitutionalPortfolioComponent {
  private readonly clientService = inject(ClientService);

  readonly institutionalClients = computed(() =>
    [...this.clientService.clients()]
      .filter((c) => c.segment === 'Corporate' || c.segment === 'Family Office')
      .sort((a, b) => b.aum - a.aum),
  );

  readonly institutionalAum = computed(() => this.institutionalClients().reduce((s, c) => s + c.aum, 0));
  readonly avgAumPerClient = computed(() => (this.institutionalClients().length ? this.institutionalAum() / this.institutionalClients().length : 0));
  readonly platformSharePct = computed(() => (this.clientService.totalAum() ? (this.institutionalAum() / this.clientService.totalAum()) * 100 : 0));

  readonly bySegment = computed(() => {
    const corporate = this.institutionalClients().filter((c) => c.segment === 'Corporate');
    const familyOffice = this.institutionalClients().filter((c) => c.segment === 'Family Office');
    return [
      { label: 'Corporate', count: corporate.length, aum: corporate.reduce((s, c) => s + c.aum, 0) },
      { label: 'Family Office', count: familyOffice.length, aum: familyOffice.reduce((s, c) => s + c.aum, 0) },
    ];
  });

  readonly maxSegmentAum = computed(() => Math.max(...this.bySegment().map((s) => s.aum), 1));
}
