import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavService } from '../../../core/services/nav.service';
import { PortfolioService } from '../../../core/services/portfolio.service';

@Component({
  selector: 'app-portfolio-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './portfolio-detail.component.html',
})
export class PortfolioDetailComponent {
  readonly portfolio = inject(PortfolioService);
  readonly nav = inject(NavService);
}
