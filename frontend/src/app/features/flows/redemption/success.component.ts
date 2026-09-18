import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RedemptionStateService } from './redemption-state.service';

@Component({
  selector: 'app-redemption-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './success.component.html',
})
export class SuccessComponent {
  readonly state = inject(RedemptionStateService);
  private readonly router = inject(Router);

  goToPortfolio(): void {
    this.state.reset();
    this.router.navigate(['/investor/portfolio']);
  }
}
