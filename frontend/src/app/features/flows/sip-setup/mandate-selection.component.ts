import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MOCK_BANK_ACCOUNTS, SipSetupStateService } from './sip-setup-state.service';

@Component({
  selector: 'app-sip-mandate-selection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mandate-selection.component.html',
})
export class MandateSelectionComponent {
  readonly state = inject(SipSetupStateService);
  private readonly router = inject(Router);

  readonly bankAccounts = MOCK_BANK_ACCOUNTS;
  readonly otp = signal('');
  readonly sendingOtp = signal(false);
  readonly otpSent = signal(false);
  readonly verifying = signal(false);

  readonly selectedBank = computed(() => this.bankAccounts.find((b) => b.id === this.state.bankAccountId()));

  selectBank(id: string): void {
    if (this.state.bankAccountId() !== id) {
      this.state.mandateAuthorized.set(false);
      this.otpSent.set(false);
      this.otp.set('');
    }
    this.state.bankAccountId.set(id);
  }

  sendOtp(): void {
    if (!this.state.bankAccountId()) return;
    this.sendingOtp.set(true);
    setTimeout(() => {
      this.sendingOtp.set(false);
      this.otpSent.set(true);
    }, 600);
  }

  authorize(): void {
    if (this.otp().length < 4) return;
    this.verifying.set(true);
    setTimeout(() => {
      this.verifying.set(false);
      this.state.mandateAuthorized.set(true);
    }, 700);
  }

  continue(): void {
    this.router.navigate(['/sip-setup/review-confirm']);
  }
}
