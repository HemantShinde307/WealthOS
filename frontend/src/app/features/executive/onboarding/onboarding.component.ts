import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientService } from '../../../core/services/client.service';
import { KycService } from '../../../core/services/kyc.service';
import { KycRecord } from '../../../core/models/domain.models';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './onboarding.component.html',
})
export class OnboardingComponent {
  private readonly clientService = inject(ClientService);
  private readonly kycService = inject(KycService);

  readonly records = this.kycService.records;

  // Onboarding funnel derived from real client KYC status distribution.
  readonly funnel = computed(() => {
    const clients = this.clientService.clients();
    const total = clients.length || 1;
    const stages: { label: string; count: number }[] = [
      { label: 'Not Started', count: clients.filter((c) => c.kycStatus === 'Not Started').length },
      { label: 'Pending', count: clients.filter((c) => c.kycStatus === 'Pending').length },
      { label: 'Verified', count: clients.filter((c) => c.kycStatus === 'Verified').length },
    ];
    return stages.map((s) => ({ ...s, pct: Math.round((s.count / total) * 100) }));
  });

  readonly rejectedCount = computed(() => this.clientService.clients().filter((c) => c.kycStatus === 'Rejected').length);
  readonly verifiedCount = computed(() => this.clientService.clients().filter((c) => c.kycStatus === 'Verified').length);
  readonly conversionRate = computed(() => {
    const total = this.clientService.clients().length;
    return total ? Number(((this.verifiedCount() / total) * 100).toFixed(1)) : 0;
  });

  docsProgress(record: KycRecord): { verified: number; total: number } {
    const total = record.documents.length;
    const verified = record.documents.filter((d) => d.status === 'Verified').length;
    return { verified, total };
  }

  statusBadgeClass(status: string): string {
    switch (status) {
      case 'Verified':
        return 'bg-success/10 text-success border-success/20';
      case 'Rejected':
        return 'bg-error/10 text-error border-error/20';
      case 'In Review':
        return 'bg-primary/10 text-primary border-primary/20';
      default:
        return 'bg-secondary/10 text-secondary border-secondary/20';
    }
  }
}
