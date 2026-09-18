import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 shadow-sm flex flex-col justify-between" [class.col-span-2]="wide">
      <p class="text-label-md text-on-surface-variant uppercase tracking-wider mb-2">{{ label }}</p>
      <div class="flex items-baseline gap-2">
        <span class="font-mono text-xl font-bold" [class]="valueClass || 'text-on-background'">{{ value }}</span>
        @if (trend) {
          <span class="material-symbols-outlined text-[16px]" [class]="trend === 'up' ? 'text-on-tertiary-container' : 'text-error'">
            {{ trend === 'up' ? 'trending_up' : 'trending_down' }}
          </span>
        }
      </div>
      @if (subtext) {
        <p class="text-xs text-on-surface-variant mt-1">{{ subtext }}</p>
      }
    </div>
  `,
})
export class StatCardComponent {
  @Input() label = '';
  @Input() value = '';
  @Input() subtext?: string;
  @Input() trend?: 'up' | 'down';
  @Input() valueClass?: string;
  @Input() wide = false;
}
