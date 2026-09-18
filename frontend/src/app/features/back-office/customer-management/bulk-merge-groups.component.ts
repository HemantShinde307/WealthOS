import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { InrCompactPipe } from '../../../shared/pipes/inr-compact.pipe';
import { BackOfficeCustomerService } from '../back-office-customer.service';

@Component({
  selector: 'app-bulk-merge-groups',
  standalone: true,
  imports: [CommonModule, InrCompactPipe],
  templateUrl: './bulk-merge-groups.component.html',
})
export class BulkMergeGroupsComponent {
  readonly boService = inject(BackOfficeCustomerService);
  private readonly router = inject(Router);

  readonly selectedIds = signal<Set<string>>(new Set());
  readonly survivorId = signal('');
  readonly done = signal(false);

  readonly selectedCount = computed(() => this.selectedIds().size);
  readonly canMerge = computed(() => this.selectedCount() >= 2 && this.selectedIds().has(this.survivorId()));

  toggle(groupId: string): void {
    this.selectedIds.update((set) => {
      const next = new Set(set);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
    if (!this.selectedIds().has(this.survivorId())) this.survivorId.set('');
  }

  mergeAll(): void {
    if (!this.canMerge()) return;
    const others = [...this.selectedIds()].filter((id) => id !== this.survivorId());
    this.boService.mergeGroups(others, this.survivorId());
    this.done.set(true);
    setTimeout(() => this.router.navigate(['/back-office/customer-management/groups']), 1200);
  }
}
