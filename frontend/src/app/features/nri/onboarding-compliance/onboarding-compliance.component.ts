import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NriDataService } from '../nri-data.service';

@Component({
  selector: 'app-nri-onboarding-compliance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './onboarding-compliance.component.html',
})
export class OnboardingComplianceComponent {
  readonly nri = inject(NriDataService);

  readonly selectedClientId = signal<string | undefined>(undefined);

  readonly selectedView = computed(() => {
    const views = this.nri.views();
    const id = this.selectedClientId() ?? views[0]?.client.id;
    return views.find((v) => v.client.id === id);
  });

  readonly verifiedDocs = computed(() => this.selectedView()?.profile.documents.filter((d) => d.status === 'Verified') ?? []);
  readonly pendingDocs = computed(() => this.selectedView()?.profile.documents.filter((d) => d.status !== 'Verified') ?? []);

  selectClient(clientId: string): void {
    this.selectedClientId.set(clientId);
  }
}
