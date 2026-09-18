import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CORPORATE_FD_OFFERS, CorporateFdStateService } from './corporate-fd-state.service';

@Component({
  selector: 'app-corporate-fd-marketplace',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './marketplace.component.html',
})
export class MarketplaceComponent {
  private readonly state = inject(CorporateFdStateService);
  private readonly router = inject(Router);

  readonly offers = CORPORATE_FD_OFFERS;

  select(offerId: string): void {
    this.state.selectedOfferId.set(offerId);
    this.router.navigate(['/corporate-fd/application']);
  }
}
