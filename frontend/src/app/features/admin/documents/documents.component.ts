import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientService } from '../../../core/services/client.service';
import { DOCUMENT_CATEGORIES, CLIENT_AGREEMENT_OVERLAYS, ClientAgreementOverlay } from '../admin-data.mock';

interface ClientAgreementRow extends ClientAgreementOverlay {
  clientName: string;
  kycStatus: string;
}

@Component({
  selector: 'app-document-vault',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './documents.component.html',
})
export class DocumentsComponent {
  private readonly clientService = inject(ClientService);

  readonly categories = DOCUMENT_CATEGORIES;
  readonly activeCategoryId = signal(this.categories[0].id);
  readonly searchTerm = signal('');

  readonly clientAgreements = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    return CLIENT_AGREEMENT_OVERLAYS.map((overlay) => {
      const client = this.clientService.getById(overlay.clientId);
      return {
        ...overlay,
        clientName: client?.name ?? 'Unknown Client',
        kycStatus: client?.kycStatus ?? 'Not Started',
      };
    }).filter((row) => !term || row.clientName.toLowerCase().includes(term) || row.clientId.toLowerCase().includes(term));
  });

  readonly selectedRow = signal<ClientAgreementRow | null>(null);

  selectCategory(id: string): void {
    this.activeCategoryId.set(id);
  }

  selectRow(row: ClientAgreementRow): void {
    this.selectedRow.set(row);
  }

  kycBadgeClass(status: string): string {
    switch (status) {
      case 'Verified':
        return 'bg-tertiary-fixed-dim/20 text-on-tertiary-fixed-variant';
      case 'Rejected':
        return 'bg-error-container text-on-error-container';
      default:
        return 'bg-surface-variant text-on-surface-variant';
    }
  }

  agreementBadgeClass(status: string): string {
    switch (status) {
      case 'Signed':
        return 'text-on-tertiary-container font-medium';
      case 'Expired':
        return 'text-error font-medium';
      default:
        return 'text-secondary font-medium';
    }
  }
}
