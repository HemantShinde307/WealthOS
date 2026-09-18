import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClientService } from '../../../core/services/client.service';
import { PortfolioService } from '../../../core/services/portfolio.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { CommissionService } from '../../../core/services/commission.service';
import { KycService } from '../../../core/services/kyc.service';
import { InrCompactPipe } from '../../../shared/pipes/inr-compact.pipe';

/** Approximate retail digital-gold rate (INR/gram) — kept consistent with the investor Digital Gold screen. */
const GOLD_RATE_PER_GRAM = 7842;

@Component({
  selector: 'app-command-center',
  standalone: true,
  imports: [CommonModule, RouterLink, InrCompactPipe],
  templateUrl: './command-center.component.html',
})
export class CommandCenterComponent {
  private readonly clientService = inject(ClientService);
  private readonly portfolioService = inject(PortfolioService);
  private readonly transactionService = inject(TransactionService);
  private readonly commissionService = inject(CommissionService);
  private readonly kycService = inject(KycService);

  // --- KPI ribbon ---
  readonly totalAum = this.clientService.totalAum;
  readonly totalClients = computed(() => this.clientService.clients().length);
  readonly activeDistributors = computed(() => new Set(this.commissionService.entries().map((e) => e.advisorName)).size);
  readonly revenueProjection = computed(() => this.commissionService.totalPaid() + this.commissionService.totalPending());

  // --- Growth trend chart (reuses PortfolioService.growthSeries, same SVG-path technique as the investor dashboard) ---
  readonly growthSeries = this.portfolioService.growthSeries;
  readonly chartPath = this.buildPath(this.growthSeries.map((p) => p.value));
  readonly benchmarkPath = this.buildPath(this.growthSeries.map((p) => p.benchmark ?? 0));

  // --- Asset allocation (real aggregate from PortfolioService; stands in for "product distribution") ---
  readonly assetAllocation = this.portfolioService.assetAllocation;

  // --- Regulatory & compliance ---
  readonly kycCompliantPct = computed(() => {
    const clients = this.clientService.clients();
    const verified = clients.filter((c) => c.kycStatus === 'Verified').length;
    return clients.length ? Number(((verified / clients.length) * 100).toFixed(1)) : 0;
  });
  readonly auditReviewPending = computed(() => this.kycService.auditLog().some((a) => a.status === 'Failure'));

  // --- Growth pillars ---
  readonly nriClients = computed(() => this.clientService.clients().filter((c) => c.segment === 'NRI'));
  readonly nriAum = computed(() => this.nriClients().reduce((s, c) => s + c.aum, 0));
  readonly nriAumSharePct = computed(() => (this.totalAum() ? Math.min(100, (this.nriAum() / this.totalAum()) * 100) : 0));

  readonly goldTransactionValue = computed(() =>
    this.transactionService
      .transactions()
      .filter((t) => t.type.startsWith('Gold'))
      .reduce((s, t) => s + (t.type === 'Gold Sell' ? -t.amount : t.amount), 0),
  );
  readonly goldHoldingsKg = computed(() => Math.max(0, this.goldTransactionValue() / GOLD_RATE_PER_GRAM / 1000));
  readonly goldSharePct = computed(() => (this.totalAum() ? Math.min(100, (this.goldTransactionValue() / this.totalAum()) * 10000) : 0));

  readonly familyOfficeClients = computed(() => this.clientService.clients().filter((c) => c.segment === 'Family Office'));
  readonly familyOfficeAum = computed(() => this.familyOfficeClients().reduce((s, c) => s + c.aum, 0));
  readonly familyOfficeSharePct = computed(() => (this.totalAum() ? Math.min(100, (this.familyOfficeAum() / this.totalAum()) * 100) : 0));

  // --- Recent global activity ---
  readonly recentActivity = this.transactionService.recent(6);

  statusBadgeClass(status: string): string {
    switch (status) {
      case 'Completed':
        return 'bg-success/10 text-success border-success/20';
      case 'Processing':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'Pending':
        return 'bg-secondary/10 text-secondary border-secondary/20';
      default:
        return 'bg-error/10 text-error border-error/20';
    }
  }

  private buildPath(values: number[]): string {
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    const points = values.map((v, i) => {
      const x = (i / (values.length - 1)) * 100;
      const y = 100 - ((v - min) / range) * 90 - 5;
      return `${x},${y.toFixed(1)}`;
    });
    return `M${points.join(' L')}`;
  }
}
