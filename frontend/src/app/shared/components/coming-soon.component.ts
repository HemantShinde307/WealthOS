import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-coming-soon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center text-center py-16 gap-3">
      <span class="material-symbols-outlined text-on-surface-variant text-[40px]">construction</span>
      <h2 class="text-title-lg text-on-background">{{ title || (route.snapshot.data['title'] ?? 'Coming Soon') }}</h2>
      <p class="text-on-surface-variant max-w-sm">This screen is being built out. Check back soon.</p>
    </div>
  `,
})
export class ComingSoonComponent {
  @Input() title = '';
  readonly route = inject(ActivatedRoute);
}
