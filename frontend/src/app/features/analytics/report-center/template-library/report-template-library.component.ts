import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { REPORT_TEMPLATES, ReportTemplate } from '../../analytics-data.mock';

type CategoryFilter = 'All' | ReportTemplate['category'];

@Component({
  selector: 'app-report-template-library',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './report-template-library.component.html',
})
export class ReportTemplateLibraryComponent {
  private readonly router = inject(Router);

  readonly categories: CategoryFilter[] = ['All', 'HNW Individuals', 'Institutions', 'Internal Audit'];
  readonly selectedCategory = signal<CategoryFilter>('All');
  readonly templates = REPORT_TEMPLATES;

  readonly filteredTemplates = computed(() => {
    const category = this.selectedCategory();
    return category === 'All' ? this.templates : this.templates.filter((t) => t.category === category);
  });

  selectCategory(category: CategoryFilter): void {
    this.selectedCategory.set(category);
  }

  useTemplate(template: ReportTemplate): void {
    this.router.navigate(['/analytics/report-center/configure'], { queryParams: { template: template.id } });
  }

  createNew(): void {
    this.router.navigate(['/analytics/report-center/configure']);
  }
}
