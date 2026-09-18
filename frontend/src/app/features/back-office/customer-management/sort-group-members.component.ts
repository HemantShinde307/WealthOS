import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { BackOfficeCustomerService } from '../back-office-customer.service';

@Component({
  selector: 'app-sort-group-members',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sort-group-members.component.html',
})
export class SortGroupMembersComponent {
  readonly boService = inject(BackOfficeCustomerService);
  private readonly route = inject(ActivatedRoute);

  readonly groupId = signal(this.route.snapshot.queryParamMap.get('groupId') ?? '');
  readonly saved = signal(false);

  readonly members = computed(() =>
    this.boService
      .customers()
      .filter((c) => c.groupId === this.groupId())
      .sort((a, b) => a.sortOrder - b.sortOrder),
  );

  selectGroup(groupId: string): void {
    this.groupId.set(groupId);
    this.saved.set(false);
  }

  moveUp(index: number): void {
    if (index === 0) return;
    this.reorder(index, index - 1);
  }

  moveDown(index: number): void {
    if (index === this.members().length - 1) return;
    this.reorder(index, index + 1);
  }

  private reorder(from: number, to: number): void {
    const ids = this.members().map((m) => m.id);
    const [moved] = ids.splice(from, 1);
    ids.splice(to, 0, moved);
    this.boService.reorderGroupMembers(this.groupId(), ids);
    this.saved.set(true);
  }
}
