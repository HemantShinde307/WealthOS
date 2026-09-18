import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PresentationsService } from '../presentations.service';

/** Shared header used by every Portfolio Presentations report: a customer switcher (kept in
 * PresentationsService so every report reflects the same "currently open" customer, mirroring
 * how an RTA back-office picks a client once and then browses reports for them), a title block,
 * a slot for report-specific action buttons (Export etc.), and a compact customer info strip. */
@Component({
  selector: 'app-report-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col gap-4">
      <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <p class="text-label-md text-on-surface-variant uppercase tracking-wider">Portfolio Presentations</p>
          <h2 class="text-headline-lg-mobile md:text-headline-lg text-on-background">{{ title }}</h2>
          @if (subtitle) {
            <p class="text-body-md text-on-surface-variant mt-1">{{ subtitle }}</p>
          }
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <select
            class="bg-surface-container-lowest border border-outline-variant text-on-surface px-3 py-2 rounded-md text-sm font-medium shadow-sm"
            [ngModel]="presentations.selectedCustomerId()"
            (ngModelChange)="presentations.selectCustomer($event)"
          >
            @for (c of presentations.customers; track c.id) {
              <option [value]="c.id">{{ c.name }}</option>
            }
          </select>
          <ng-content select="[reportActions]" />
        </div>
      </div>

      @if (beta) {
        <div class="flex items-center gap-2 bg-secondary-container/20 border border-secondary/40 text-on-surface rounded-md px-4 py-2 text-sm">
          <span class="material-symbols-outlined text-[18px] text-secondary">science</span>
          <span><strong class="font-semibold">Beta report</strong> — new layout and computation engine, currently rolling out alongside the classic version of this report.</span>
        </div>
      }

      <div class="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
        <div>
          <p class="text-label-md text-on-surface-variant uppercase tracking-wider">Customer</p>
          <p class="font-medium text-on-background mt-0.5">{{ presentations.selectedCustomer().name }}</p>
        </div>
        <div>
          <p class="text-label-md text-on-surface-variant uppercase tracking-wider">PAN</p>
          <p class="font-mono font-medium text-on-background mt-0.5">{{ presentations.selectedCustomer().pan }}</p>
        </div>
        <div>
          <p class="text-label-md text-on-surface-variant uppercase tracking-wider">Relationship Manager</p>
          <p class="font-medium text-on-background mt-0.5">{{ presentations.selectedCustomer().rmName }}</p>
        </div>
        <div>
          <p class="text-label-md text-on-surface-variant uppercase tracking-wider">Report As Of</p>
          <p class="font-mono font-medium text-on-background mt-0.5">{{ today | date: 'dd-MMM-yyyy' }}</p>
        </div>
      </div>
    </div>
  `,
})
export class ReportHeaderComponent {
  readonly presentations = inject(PresentationsService);

  @Input() title = '';
  @Input() subtitle?: string;
  @Input() beta = false;

  readonly today = new Date();
}
