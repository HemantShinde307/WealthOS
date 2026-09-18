import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CasImportStateService } from './cas-import-state.service';
import { PortfolioService } from '../../../core/services/portfolio.service';

@Component({
  selector: 'app-cas-success-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './success-summary.component.html',
})
export class SuccessSummaryComponent {
  readonly state = inject(CasImportStateService);
  private readonly portfolio = inject(PortfolioService);
  private readonly router = inject(Router);

  readonly imported = computed(() => this.state.folios().filter((f) => f.selected));
  readonly totalValue = computed(() => this.imported().reduce((sum, f) => sum + f.currentValue, 0));

  constructor() {
    this.portfolio.importHoldings(this.imported());
  }

  goToPortfolio(): void {
    this.state.reset();
    this.router.navigate(['/investor/portfolio']);
  }
}
