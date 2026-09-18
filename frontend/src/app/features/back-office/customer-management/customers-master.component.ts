import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InrCompactPipe } from '../../../shared/pipes/inr-compact.pipe';
import { BackOfficeCustomerService } from '../back-office-customer.service';

@Component({
  selector: 'app-customers-master',
  standalone: true,
  imports: [CommonModule, RouterLink, InrCompactPipe],
  templateUrl: './customers-master.component.html',
})
export class CustomersMasterComponent {
  readonly boService = inject(BackOfficeCustomerService);

  readonly search = signal('');

  readonly filtered = computed(() => {
    const term = this.search().toLowerCase().trim();
    if (!term) return this.boService.customers();
    return this.boService.customers().filter(
      (c) => c.name.toLowerCase().includes(term) || c.pan.toLowerCase().includes(term) || c.email.toLowerCase().includes(term) || c.id.toLowerCase().includes(term),
    );
  });

  groupName(groupId: string | null): string {
    if (!groupId) return '—';
    return this.boService.getGroup(groupId)?.name ?? groupId;
  }
}
