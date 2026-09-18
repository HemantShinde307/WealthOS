import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { InrCompactPipe } from '../../../shared/pipes/inr-compact.pipe';
import { BackOfficeCustomerService } from '../back-office-customer.service';

@Component({
  selector: 'app-merge-groups',
  standalone: true,
  imports: [CommonModule, RouterLink, InrCompactPipe],
  templateUrl: './merge-groups.component.html',
})
export class MergeGroupsComponent {
  readonly boService = inject(BackOfficeCustomerService);
  private readonly router = inject(Router);

  readonly groupAId = signal('');
  readonly groupBId = signal('');
  readonly survivor = signal<'A' | 'B'>('A');
  readonly done = signal(false);

  readonly groupA = computed(() => this.boService.groupSummaries().find((s) => s.group.id === this.groupAId()));
  readonly groupB = computed(() => this.boService.groupSummaries().find((s) => s.group.id === this.groupBId()));
  readonly canMerge = computed(() => !!this.groupAId() && !!this.groupBId() && this.groupAId() !== this.groupBId());

  merge(): void {
    if (!this.canMerge()) return;
    const survivorId = this.survivor() === 'A' ? this.groupAId() : this.groupBId();
    const otherId = this.survivor() === 'A' ? this.groupBId() : this.groupAId();
    this.boService.mergeGroups([otherId], survivorId);
    this.done.set(true);
    setTimeout(() => this.router.navigate(['/back-office/customer-management/groups', survivorId]), 1200);
  }
}
