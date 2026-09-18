import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CampaignService } from '../../../core/services/campaign.service';
import { CAMPAIGN_CHANNELS, LEAD_ACTIVITY, LEAD_INFLOW_SERIES } from '../advisor-mock-data';

@Component({
  selector: 'app-campaigns-hub',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './campaigns-hub.component.html',
})
export class CampaignsHubComponent {
  readonly campaignService = inject(CampaignService);
  readonly channels = CAMPAIGN_CHANNELS;
  readonly activity = LEAD_ACTIVITY;
  readonly inflow = LEAD_INFLOW_SERIES;
  readonly maxInflow = Math.max(...LEAD_INFLOW_SERIES);

  barHeight(v: number): number {
    return Math.max(10, (v / this.maxInflow) * 100);
  }

  channelIconClasses(channel: string): string {
    switch (channel) {
      case 'WhatsApp':
        return 'bg-tertiary-container text-on-tertiary-container';
      case 'SMS':
        return 'bg-secondary-fixed text-on-secondary-fixed';
      case 'Push':
        return 'bg-error-container text-error';
      default:
        return 'bg-surface-container text-on-surface-variant';
    }
  }
}
