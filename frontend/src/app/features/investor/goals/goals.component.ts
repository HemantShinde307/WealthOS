import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GoalService } from '../../../core/services/goal.service';
import { AuthService } from '../../../core/services/auth.service';
import { InrCompactPipe } from '../../../shared/pipes/inr-compact.pipe';

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [CommonModule, RouterLink, InrCompactPipe],
  templateUrl: './goals.component.html',
})
export class GoalsComponent {
  private readonly goalService = inject(GoalService);
  private readonly auth = inject(AuthService);

  /** Only this customer's goals — GoalService itself holds every advisor client's goals. */
  readonly myGoals = computed(() => this.goalService.goals().filter((g) => g.clientId === this.auth.currentUser().customerId));

  readonly categoryIcons: Partial<Record<string, string>> = {
    Retirement: 'savings',
    Education: 'school',
    Home: 'home',
    Wedding: 'favorite',
    Travel: 'flight',
    'Wealth Creation': 'trending_up',
    'Emergency Fund': 'health_and_safety',
  };
}
