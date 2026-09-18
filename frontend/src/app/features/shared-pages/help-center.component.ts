import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-help-center',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-background flex items-center justify-center p-6">
      <div class="max-w-md w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-8 text-center space-y-4">
        <span class="material-symbols-outlined text-secondary text-[40px]">contact_support</span>
        <h2 class="text-title-lg text-on-background">Help & Support</h2>
        <p class="text-on-surface-variant text-sm">Need assistance? Reach our support team at support&#64;wealthos.com or call 1800-123-4567.</p>
        <a routerLink="/investor/portfolio" class="inline-block mt-2 text-secondary font-medium text-sm hover:underline">Back to Dashboard</a>
      </div>
    </div>
  `,
})
export class HelpCenterComponent {}
