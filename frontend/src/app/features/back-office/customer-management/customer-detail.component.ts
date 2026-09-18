import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { InrCompactPipe } from '../../../shared/pipes/inr-compact.pipe';
import { BackOfficeCustomer } from '../back-office-data.mock';
import { BackOfficeCustomerService } from '../back-office-customer.service';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, InrCompactPipe],
  templateUrl: './customer-detail.component.html',
})
export class CustomerDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly boService = inject(BackOfficeCustomerService);

  readonly customerId = this.route.snapshot.paramMap.get('id')!;
  readonly customer = computed(() => this.boService.getCustomer(this.customerId));
  readonly groups = this.boService.groups;
  readonly reviewDue = computed(() => {
    const c = this.customer();
    return c ? this.boService.isReviewDue(c) : false;
  });

  readonly saved = signal(false);

  readonly draft = signal<Partial<BackOfficeCustomer>>(this.buildDraft());

  private buildDraft(): Partial<BackOfficeCustomer> {
    const c = this.boService.getCustomer(this.customerId);
    return c ? { ...c } : {};
  }

  setField<K extends keyof BackOfficeCustomer>(key: K, value: BackOfficeCustomer[K]): void {
    this.draft.update((d) => ({ ...d, [key]: value }));
    this.saved.set(false);
  }

  save(): void {
    this.boService.updateCustomer(this.customerId, this.draft());
    this.saved.set(true);
  }

  goBack(): void {
    this.router.navigate(['/back-office/customer-management/master']);
  }
}
