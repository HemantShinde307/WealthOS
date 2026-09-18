import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MOCK_REVIEW_QUEUE, ReviewQueueEntity } from '../../institutional-data.mock';

type RiskFilter = 'All' | 'High' | 'Medium';

@Component({
  selector: 'app-review-queue',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './review-queue.component.html',
})
export class ReviewQueueComponent {
  readonly queue = MOCK_REVIEW_QUEUE;
  readonly filter = signal<RiskFilter>('All');
  readonly selected = signal<ReviewQueueEntity>(MOCK_REVIEW_QUEUE[0]);
  readonly decisionMessage = signal<string | null>(null);

  get filtered(): ReviewQueueEntity[] {
    const f = this.filter();
    return f === 'All' ? this.queue : this.queue.filter((q) => q.riskRating === f);
  }

  setFilter(f: RiskFilter): void {
    this.filter.set(f);
  }

  select(entity: ReviewQueueEntity): void {
    this.selected.set(entity);
    this.decisionMessage.set(null);
  }

  formatTimeInQueue(hrs: number): string {
    const h = Math.floor(hrs);
    const m = Math.round((hrs - h) * 60);
    return `${h}h ${m.toString().padStart(2, '0')}m`;
  }

  riskClass(risk: string): string {
    switch (risk) {
      case 'High':
        return 'text-error';
      case 'Medium':
        return 'text-warning';
      default:
        return 'text-on-tertiary-container';
    }
  }

  riskIcon(risk: string): string {
    return risk === 'High' ? 'warning' : risk === 'Medium' ? 'error' : 'check_circle';
  }

  decide(action: 'approve' | 'clarify' | 'reject'): void {
    const name = this.selected().entityName;
    this.decisionMessage.set(
      action === 'approve'
        ? `${name} approved with conditions.`
        : action === 'clarify'
          ? `Clarification requested from ${name}'s sales contact.`
          : `${name} application rejected.`,
    );
  }
}
