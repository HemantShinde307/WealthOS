import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PortfolioService } from '../../../core/services/portfolio.service';
import { RedemptionStateService } from './redemption-state.service';

@Component({
  selector: 'app-redemption-select-scheme',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './select-scheme.component.html',
})
export class SelectSchemeComponent {
  readonly portfolioService = inject(PortfolioService);
  private readonly state = inject(RedemptionStateService);
  private readonly router = inject(Router);

  select(schemeId: string): void {
    this.state.selectedSchemeId.set(schemeId);
    this.state.amount.set(0);
    this.state.units.set(0);
    this.state.fullRedemption.set(false);
    this.router.navigate(['/redemption/details']);
  }
}
