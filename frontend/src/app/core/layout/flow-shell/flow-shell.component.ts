import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, startWith } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

export interface FlowStepData {
  title: string;
  subtitle?: string;
  stepIndex?: number;
  hideBack?: boolean;
}

@Component({
  selector: 'app-flow-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './flow-shell.component.html',
})
export class FlowShellComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  readonly steps = (this.route.snapshot.data['flowSteps'] as string[] | undefined) ?? [];
  readonly brand = (this.route.snapshot.data['flowBrand'] as string | undefined) ?? 'WealthOS';

  private readonly navEnd = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      startWith(null),
    ),
  );

  readonly childData = computed<FlowStepData>(() => {
    this.navEnd();
    let child = this.route.snapshot.firstChild;
    while (child?.firstChild) {
      child = child.firstChild;
    }
    return (child?.data as FlowStepData) ?? { title: '' };
  });

  goBack(): void {
    this.location.back();
  }
}
