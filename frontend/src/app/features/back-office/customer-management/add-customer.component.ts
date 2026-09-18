import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { BackOfficeCustomer } from '../back-office-data.mock';
import { BackOfficeCustomerService } from '../back-office-customer.service';

@Component({
  selector: 'app-add-customer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './add-customer.component.html',
})
export class AddCustomerComponent {
  private readonly boService = inject(BackOfficeCustomerService);
  private readonly router = inject(Router);

  readonly groups = this.boService.groups;

  readonly name = signal('');
  readonly pan = signal('');
  readonly email = signal('');
  readonly phone = signal('');
  readonly riskProfile = signal<BackOfficeCustomer['riskProfile']>('Moderate');
  readonly segment = signal<BackOfficeCustomer['segment']>('Retail');
  readonly kycStatus = signal<BackOfficeCustomer['kycStatus']>('Not Started');
  readonly groupId = signal('');

  readonly submitted = signal(false);

  readonly nameError = computed(() => this.submitted() && !this.name().trim());
  readonly emailError = computed(() => this.submitted() && !this.email().trim());
  readonly canSave = computed(() => this.name().trim().length > 0 && this.email().trim().length > 0);

  save(): void {
    this.submitted.set(true);
    if (!this.canSave()) return;
    const customer = this.boService.addCustomer({
      name: this.name().trim(),
      pan: this.pan().trim(),
      email: this.email().trim(),
      phone: this.phone().trim(),
      riskProfile: this.riskProfile(),
      segment: this.segment(),
      kycStatus: this.kycStatus(),
      groupId: this.groupId() || null,
    });
    this.router.navigate(['/back-office/customer-management/master', customer.id]);
  }
}
