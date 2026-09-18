import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { InrCompactPipe } from '../../../shared/pipes/inr-compact.pipe';
import { BackOfficeCustomerService } from '../back-office-customer.service';

@Component({
  selector: 'app-customer-groups',
  standalone: true,
  imports: [CommonModule, RouterLink, InrCompactPipe],
  templateUrl: './customer-groups.component.html',
})
export class CustomerGroupsComponent {
  readonly boService = inject(BackOfficeCustomerService);
  private readonly router = inject(Router);

  readonly newGroupName = signal('');

  createGroup(): void {
    const name = this.newGroupName().trim();
    if (!name) return;
    const group = this.boService.createGroup(name);
    this.newGroupName.set('');
    this.router.navigate(['/back-office/customer-management/groups', group.id]);
  }
}
