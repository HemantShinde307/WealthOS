import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CampaignService } from '../../../core/services/campaign.service';

@Component({
  selector: 'app-marketing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './marketing.component.html',
})
export class MarketingComponent {
  private readonly campaignService = inject(CampaignService);

  readonly campaigns = this.campaignService.campaigns;

  readonly totalAudience = computed(() => this.campaigns().reduce((s, c) => s + c.audience, 0));
  readonly totalSent = computed(() => this.campaigns().reduce((s, c) => s + c.sent, 0));
  readonly totalOpened = computed(() => this.campaigns().reduce((s, c) => s + c.opened, 0));
  readonly totalConverted = computed(() => this.campaigns().reduce((s, c) => s + c.converted, 0));
  readonly overallConversionRate = computed(() => (this.totalSent() ? Number(((this.totalConverted() / this.totalSent()) * 100).toFixed(2)) : 0));
  readonly activeCampaigns = computed(() => this.campaigns().filter((c) => c.status === 'Active').length);

  openRate(sent: number, opened: number): number {
    return sent ? Number(((opened / sent) * 100).toFixed(1)) : 0;
  }

  conversionRate(sent: number, converted: number): number {
    return sent ? Number(((converted / sent) * 100).toFixed(1)) : 0;
  }

  statusBadgeClass(status: string): string {
    switch (status) {
      case 'Active':
        return 'bg-success/10 text-success border-success/20';
      case 'Completed':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'Paused':
        return 'bg-secondary/10 text-secondary border-secondary/20';
      default:
        return 'bg-outline-variant/20 text-on-surface-variant border-outline-variant/30';
    }
  }
}
