import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PortfolioService } from '../../../core/services/portfolio.service';
import { SchemeService } from '../../../core/services/scheme.service';
import { InrCompactPipe } from '../../../shared/pipes/inr-compact.pipe';

@Component({
  selector: 'app-mutual-funds',
  standalone: true,
  imports: [CommonModule, RouterLink, InrCompactPipe],
  templateUrl: './mutual-funds.component.html',
})
export class MutualFundsComponent {
  readonly portfolio = inject(PortfolioService);
  private readonly schemeService = inject(SchemeService);

  readonly search = signal('');
  readonly filteredHoldings = computed(() => {
    const term = this.search().toLowerCase();
    return this.portfolio.holdings().filter((h) => h.schemeName.toLowerCase().includes(term));
  });

  private readonly heldPrefixes = computed(() => this.portfolio.holdings().map((h) => h.schemeName.split(' - ')[0].split(' Fund')[0]));

  readonly exploreSchemes = computed(() =>
    this.schemeService.schemes().filter((s) => !this.heldPrefixes().some((prefix) => s.name.includes(prefix))).slice(0, 4),
  );
}
