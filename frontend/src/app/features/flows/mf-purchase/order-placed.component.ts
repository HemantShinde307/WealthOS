import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MfPurchaseStateService } from './mf-purchase-state.service';

@Component({
  selector: 'app-mf-order-placed',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-placed.component.html',
})
export class OrderPlacedComponent {
  readonly state = inject(MfPurchaseStateService);
  private readonly router = inject(Router);

  goToPortfolio(): void {
    this.state.reset();
    this.router.navigate(['/investor/portfolio']);
  }
}
