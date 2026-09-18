import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FamilyOfficeService } from '../family-office.service';
import { PortfolioService } from '../../../core/services/portfolio.service';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { InrCompactPipe } from '../../../shared/pipes/inr-compact.pipe';

@Component({
  selector: 'app-family-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, StatCardComponent, InrCompactPipe],
  templateUrl: './dashboard.component.html',
})
export class FamilyDashboardComponent {
  readonly familyOffice = inject(FamilyOfficeService);
  private readonly portfolio = inject(PortfolioService);

  readonly members = this.familyOffice.members;
  readonly goals = this.familyOffice.familyGoals;
  readonly pendingCas = this.familyOffice.pendingCasCount;
  readonly assetAllocation = this.portfolio.assetAllocation;

  allocationAmount(pct: number): number {
    return (this.familyOffice.platformAum() * pct) / 100;
  }

  sharePct(memberId: string): number {
    const member = this.familyOffice.getById(memberId);
    return member ? this.familyOffice.sharePct(member) : 0;
  }

  goalOwnerName(clientId: string): string {
    return this.familyOffice.getById(clientId)?.name ?? 'Family';
  }
}
