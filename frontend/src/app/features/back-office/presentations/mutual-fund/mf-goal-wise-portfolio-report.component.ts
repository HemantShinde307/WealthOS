import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PresentationsService } from '../presentations.service';
import { ReportHeaderComponent } from '../shared/report-header.component';
import { InrCompactPipe } from '../../../../shared/pipes/inr-compact.pipe';

@Component({
  selector: 'app-mf-goal-wise-portfolio-report',
  standalone: true,
  imports: [CommonModule, ReportHeaderComponent, InrCompactPipe],
  templateUrl: './mf-goal-wise-portfolio-report.component.html',
})
export class MfGoalWisePortfolioReportComponent {
  readonly presentations = inject(PresentationsService);

  readonly goals = computed(() =>
    this.presentations.mfGoals().map((g) => {
      const linkedHoldings = this.presentations.mfHoldings().filter((h) => g.linkedFolios.includes(h.folioNo));
      const currentValue = linkedHoldings.reduce((s, h) => s + h.units * h.currentNav, 0);
      const pctAchieved = g.targetAmount > 0 ? Math.min(Math.round((currentValue / g.targetAmount) * 100), 100) : 0;
      const yearsLeft = Math.max(new Date(g.targetDate).getFullYear() - new Date().getFullYear(), 0);
      return { ...g, linkedHoldings, currentValue, pctAchieved, yearsLeft };
    }),
  );
}
