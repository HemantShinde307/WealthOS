import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BackOfficeCustomerService } from '../back-office-customer.service';

@Component({
  selector: 'app-split-group',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './split-group.component.html',
})
export class SplitGroupComponent {
  readonly boService = inject(BackOfficeCustomerService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly sourceGroupId = signal(this.route.snapshot.queryParamMap.get('groupId') ?? '');
  readonly selectedMemberIds = signal<Set<string>>(new Set());
  readonly newGroupName = signal('');
  readonly done = signal(false);

  readonly sourceMembers = computed(() => this.boService.customers().filter((c) => c.groupId === this.sourceGroupId()));
  readonly canSplit = computed(() => this.selectedMemberIds().size > 0 && this.newGroupName().trim().length > 0 && !!this.sourceGroupId());

  selectGroup(groupId: string): void {
    this.sourceGroupId.set(groupId);
    this.selectedMemberIds.set(new Set());
  }

  toggleMember(customerId: string): void {
    this.selectedMemberIds.update((set) => {
      const next = new Set(set);
      if (next.has(customerId)) next.delete(customerId);
      else next.add(customerId);
      return next;
    });
  }

  split(): void {
    if (!this.canSplit()) return;
    const newGroup = this.boService.splitGroup(this.sourceGroupId(), [...this.selectedMemberIds()], this.newGroupName().trim());
    this.done.set(true);
    setTimeout(() => this.router.navigate(['/back-office/customer-management/groups', newGroup.id]), 1200);
  }
}
