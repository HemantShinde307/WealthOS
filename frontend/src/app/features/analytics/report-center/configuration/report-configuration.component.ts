import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { PRESENTATION_MODULES, PresentationModule } from '../../analytics-data.mock';

const STEPS = ['Content Selection', 'Branding', 'Schedule'];

@Component({
  selector: 'app-report-configuration',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './report-configuration.component.html',
})
export class ReportConfigurationComponent {
  private readonly router = inject(Router);

  readonly steps = STEPS;
  readonly currentStep = signal(0);

  readonly modules = signal<PresentationModule[]>(PRESENTATION_MODULES.map((m) => ({ ...m })));
  readonly selectedCount = computed(() => this.modules().filter((m) => m.selected).length);

  readonly targetPortfolio = signal('The Malhotra Family Trust (Acct ending 4402)');
  readonly preparedFor = signal('Mr. & Mrs. Rohan Malhotra');
  readonly coverAccent = signal<'primary' | 'secondary' | 'tertiary'>('primary');
  readonly frequency = signal<'One-Time' | 'Monthly' | 'Quarterly' | 'Annually'>('Quarterly');
  readonly deliveryMethod = signal<'Portal' | 'Email' | 'Portal & Print'>('Portal');

  readonly estimatedPages = computed(() => 4 + this.selectedCount() * 2);

  toggleModule(id: string): void {
    this.modules.update((list) => list.map((m) => (m.id === id ? { ...m, selected: !m.selected } : m)));
  }

  goToStep(index: number): void {
    this.currentStep.set(index);
  }

  next(): void {
    this.currentStep.update((s) => Math.min(s + 1, this.steps.length - 1));
  }

  back(): void {
    this.currentStep.update((s) => Math.max(s - 1, 0));
  }

  setTargetPortfolio(value: string): void {
    this.targetPortfolio.set(value);
  }

  setPreparedFor(value: string): void {
    this.preparedFor.set(value);
  }

  setAccent(accent: 'primary' | 'secondary' | 'tertiary'): void {
    this.coverAccent.set(accent);
  }

  setFrequency(value: string): void {
    this.frequency.set(value as 'One-Time' | 'Monthly' | 'Quarterly' | 'Annually');
  }

  setDeliveryMethod(value: string): void {
    this.deliveryMethod.set(value as 'Portal' | 'Email' | 'Portal & Print');
  }

  generatePreview(): void {
    this.router.navigate(['/analytics/report-center/preview']);
  }
}
