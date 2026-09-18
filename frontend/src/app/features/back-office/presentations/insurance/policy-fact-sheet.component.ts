import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PresentationsService } from '../presentations.service';
import { ReportHeaderComponent } from '../shared/report-header.component';

@Component({
  selector: 'app-policy-fact-sheet',
  standalone: true,
  imports: [CommonModule, ReportHeaderComponent],
  templateUrl: './policy-fact-sheet.component.html',
})
export class PolicyFactSheetComponent {
  readonly presentations = inject(PresentationsService);

  readonly selectedPolicyId = signal<string | null>(null);

  readonly policies = this.presentations.giPolicies;

  readonly selectedPolicy = computed(() => {
    const id = this.selectedPolicyId();
    return this.policies().find((p) => p.id === id) ?? this.policies()[0] ?? null;
  });

  selectPolicy(id: string): void {
    this.selectedPolicyId.set(id);
  }

  daysToExpiry(expiryDate: string): number {
    return Math.round((new Date(expiryDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
  }
}
