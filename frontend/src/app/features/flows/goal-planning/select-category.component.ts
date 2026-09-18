import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Goal } from '../../../core/models/domain.models';
import { GoalPlanningStateService } from './goal-planning-state.service';

interface CategoryOption {
  category: Goal['category'];
  icon: string;
  description: string;
}

@Component({
  selector: 'app-goal-select-category',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './select-category.component.html',
})
export class SelectCategoryComponent {
  private readonly state = inject(GoalPlanningStateService);
  private readonly router = inject(Router);

  readonly categories: CategoryOption[] = [
    { category: 'Retirement', icon: 'savings', description: 'Build a corpus for a comfortable retirement.' },
    { category: 'Education', icon: 'school', description: "Plan for your child's higher education." },
    { category: 'Home', icon: 'home', description: 'Save for a down payment on your dream home.' },
    { category: 'Wedding', icon: 'favorite', description: 'Plan the wedding you have always envisioned.' },
    { category: 'Travel', icon: 'flight', description: 'Fund your next big trip or bucket-list vacation.' },
    { category: 'Wealth Creation', icon: 'trending_up', description: 'Grow long-term wealth beyond a specific need.' },
    { category: 'Emergency Fund', icon: 'health_and_safety', description: 'Build a safety net for unexpected expenses.' },
  ];

  select(option: CategoryOption): void {
    this.state.category.set(option.category);
    if (!this.state.goalName()) {
      this.state.goalName.set(option.category === 'Wealth Creation' ? 'Wealth Creation Goal' : `My ${option.category} Goal`);
    }
    this.router.navigate(['/goal-planning/define-parameters']);
  }
}
