import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InrCompactPipe } from '../../../shared/pipes/inr-compact.pipe';
import { BackOfficeCustomer } from '../back-office-data.mock';
import { BackOfficeCustomerService } from '../back-office-customer.service';

@Component({
  selector: 'app-bulk-merge-customers',
  standalone: true,
  imports: [CommonModule, RouterLink, InrCompactPipe],
  templateUrl: './bulk-merge-customers.component.html',
})
export class BulkMergeCustomersComponent {
  readonly boService = inject(BackOfficeCustomerService);

  readonly clusters = this.boService.duplicateClusters;
  readonly survivorChoice = signal<Record<string, string>>({});

  private clusterKey(cluster: BackOfficeCustomer[]): string {
    return cluster.map((c) => c.id).join(',');
  }

  survivorFor(cluster: BackOfficeCustomer[]): string {
    return this.survivorChoice()[this.clusterKey(cluster)] ?? cluster[0].id;
  }

  setSurvivor(cluster: BackOfficeCustomer[], customerId: string): void {
    this.survivorChoice.update((m) => ({ ...m, [this.clusterKey(cluster)]: customerId }));
  }

  mergeCluster(cluster: BackOfficeCustomer[]): void {
    const survivorId = this.survivorFor(cluster);
    const losers = cluster.filter((c) => c.id !== survivorId);
    for (const loser of losers) {
      this.boService.mergeCustomers(survivorId, loser.id, {});
    }
  }

  mergeAll(): void {
    for (const cluster of this.clusters()) this.mergeCluster(cluster);
  }
}
