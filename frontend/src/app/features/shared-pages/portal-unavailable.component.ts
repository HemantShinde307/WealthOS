import { Component } from '@angular/core';

@Component({
  selector: 'app-portal-unavailable',
  standalone: true,
  template: `
    <div class="min-h-screen bg-background flex items-center justify-center p-6">
      <div class="max-w-md w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-8 text-center space-y-4">
        <span class="material-symbols-outlined text-warning text-[40px]">cloud_off</span>
        <h2 class="text-title-lg text-on-background">Portal unavailable</h2>
        <p class="text-on-surface-variant text-sm">This portal is currently unavailable. Please contact your distributor for more information.</p>
      </div>
    </div>
  `,
})
export class PortalUnavailableComponent {}
