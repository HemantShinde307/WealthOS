import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FamilyOfficeService } from '../family-office.service';
import { PortfolioService } from '../../../core/services/portfolio.service';
import { InrCompactPipe } from '../../../shared/pipes/inr-compact.pipe';

@Component({
  selector: 'app-portfolio-aggregator',
  standalone: true,
  imports: [CommonModule, InrCompactPipe],
  templateUrl: './portfolio-aggregator.component.html',
})
export class PortfolioAggregatorComponent {
  readonly familyOffice = inject(FamilyOfficeService);
  private readonly portfolio = inject(PortfolioService);

  readonly members = this.familyOffice.members;
  readonly memberFilter = signal<string>('all');
  readonly assetClassFilter = signal<string>('all');

  readonly assetClasses = ['Large Cap', 'Mid Cap', 'Short Duration', 'Thematic', 'Flexi Cap', 'ELSS'];

  readonly totalAum = this.familyOffice.totalFamilyAum;
  readonly unrealizedPl = this.portfolio.unrealizedPl;
  readonly absoluteReturnPct = this.portfolio.absoluteReturnPct;

  readonly largestHolding = computed(() =>
    [...this.portfolio.holdings()].sort((a, b) => b.currentValue - a.currentValue)[0],
  );

  readonly filteredHoldings = computed(() => {
    const member = this.memberFilter();
    const assetClass = this.assetClassFilter();
    return this.familyOffice
      .memberHoldings()
      .filter((h) => (member === 'all' ? true : h.ownerId === member))
      .filter((h) => (assetClass === 'all' ? true : h.category === assetClass));
  });

  onMemberFilterChange(event: Event): void {
    this.memberFilter.set((event.target as HTMLSelectElement).value);
  }

  onAssetClassFilterChange(event: Event): void {
    this.assetClassFilter.set((event.target as HTMLSelectElement).value);
  }

  ownerName(ownerId: string): string {
    return this.familyOffice.getById(ownerId)?.name ?? 'Unassigned';
  }

  ownerInitials(ownerId: string): string {
    return this.familyOffice.getById(ownerId)?.initials ?? '?';
  }
}
