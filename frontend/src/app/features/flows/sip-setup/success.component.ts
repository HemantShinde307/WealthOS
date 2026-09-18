import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SipSetupStateService } from './sip-setup-state.service';

@Component({
  selector: 'app-sip-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './success.component.html',
})
export class SuccessComponent {
  readonly state = inject(SipSetupStateService);
  private readonly router = inject(Router);

  goToPortfolio(): void {
    this.state.reset();
    this.router.navigate(['/investor/portfolio']);
  }
}
