import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClientService } from '../../../core/services/client.service';
import { Client } from '../../../core/models/domain.models';
import { InrCompactPipe } from '../../../shared/pipes/inr-compact.pipe';

type SegmentFilter = 'All' | Client['segment'];
type KycFilter = 'All' | Client['kycStatus'];

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, RouterLink, InrCompactPipe],
  templateUrl: './client-list.component.html',
})
export class ClientListComponent {
  readonly clientService = inject(ClientService);

  readonly search = signal('');
  readonly segmentFilter = signal<SegmentFilter>('All');
  readonly kycFilter = signal<KycFilter>('All');

  readonly segments: SegmentFilter[] = ['All', 'Retail', 'HNI', 'Corporate', 'NRI', 'Family Office'];
  readonly kycStatuses: KycFilter[] = ['All', 'Verified', 'Pending', 'Rejected', 'Not Started'];

  readonly filteredClients = computed(() => {
    const term = this.search().trim().toLowerCase();
    const segment = this.segmentFilter();
    const kyc = this.kycFilter();
    return this.clientService
      .clients()
      .filter((c) => (segment === 'All' ? true : c.segment === segment))
      .filter((c) => (kyc === 'All' ? true : c.kycStatus === kyc))
      .filter((c) => (term ? c.name.toLowerCase().includes(term) || c.email.toLowerCase().includes(term) : true))
      .sort((a, b) => b.aum - a.aum);
  });

  initials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join('')
      .toUpperCase();
  }

  kycClasses(status: Client['kycStatus']): string {
    switch (status) {
      case 'Verified':
        return 'bg-tertiary-container text-on-tertiary-container';
      case 'Pending':
        return 'bg-surface-container text-on-surface-variant';
      case 'Rejected':
        return 'bg-error-container text-error';
      default:
        return 'bg-surface-container-high text-on-surface-variant';
    }
  }

  riskClasses(risk: Client['riskProfile']): string {
    switch (risk) {
      case 'Aggressive':
        return 'bg-error-container text-error';
      case 'Moderate':
        return 'bg-surface-container text-on-surface-variant';
      default:
        return 'bg-tertiary-container text-on-tertiary-container';
    }
  }
}
