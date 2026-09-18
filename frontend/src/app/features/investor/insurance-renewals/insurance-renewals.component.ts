import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CampaignService } from '../../../core/services/campaign.service';

@Component({
  selector: 'app-insurance-renewals',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './insurance-renewals.component.html',
})
export class InsuranceRenewalsComponent {
  readonly campaignService = inject(CampaignService);

  daysUntil(dateStr: string): number {
    const diff = new Date(dateStr).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
}
