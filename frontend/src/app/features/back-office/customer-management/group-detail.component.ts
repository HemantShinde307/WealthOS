import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { InrCompactPipe } from '../../../shared/pipes/inr-compact.pipe';
import { ExportButtonComponent } from '../../../shared/components/export-button/export-button.component';
import { confirmDelete } from '../../../shared/utils/confirm';
import { BackOfficeCustomerService } from '../back-office-customer.service';

@Component({
  selector: 'app-group-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, InrCompactPipe, ExportButtonComponent],
  templateUrl: './group-detail.component.html',
})
export class GroupDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly boService = inject(BackOfficeCustomerService);

  readonly groupId = this.route.snapshot.paramMap.get('id')!;
  readonly group = computed(() => this.boService.getGroup(this.groupId));
  readonly members = computed(() =>
    this.boService
      .customers()
      .filter((c) => c.groupId === this.groupId)
      .sort((a, b) => a.sortOrder - b.sortOrder),
  );
  readonly totalAum = computed(() => this.members().reduce((sum, m) => sum + m.aum, 0));
  readonly ungrouped = this.boService.ungroupedCustomers;

  readonly exportHeaders = ['Customer ID', 'Name', 'Primary Contact', 'AUM'];
  readonly exportRows = computed(() => this.members().map((m) => [m.id, m.name, this.group()?.primaryContactId === m.id ? 'Yes' : 'No', m.aum]));

  readonly addMemberId = signal('');

  addMember(): void {
    const id = this.addMemberId();
    if (!id) return;
    this.boService.addMemberToGroup(id, this.groupId);
    this.addMemberId.set('');
  }

  removeMember(customerId: string): void {
    const m = this.members().find((x) => x.id === customerId);
    if (!confirmDelete(`${m?.name ?? customerId} from this group`)) return;
    this.boService.removeMemberFromGroup(customerId);
  }

  setPrimary(customerId: string): void {
    this.boService.setPrimaryContact(this.groupId, customerId);
  }

  goBack(): void {
    this.router.navigate(['/back-office/customer-management/groups']);
  }
}
