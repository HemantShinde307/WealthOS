import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService, ROLE_HOME_ROUTE, ROLE_LABELS } from '../../core/services/auth.service';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-background flex items-center justify-center p-6">
      <div class="max-w-md w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-8 text-center space-y-4">
        <span class="material-symbols-outlined text-error text-[40px]">block</span>
        <h2 class="text-title-lg text-on-background">Access Denied</h2>
        <p class="text-on-surface-variant text-sm">
          Your account is signed in as <strong class="text-on-background">{{ roleLabel }}</strong>, which doesn't have
          permission to view that page.
        </p>
        <div class="flex flex-col gap-2 pt-2">
          <a [routerLink]="homeRoute" class="bg-primary-container text-on-primary py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
            Go to My Dashboard
          </a>
          <button (click)="switchAccount()" class="text-secondary text-sm font-medium hover:underline">Log in as a different user</button>
        </div>
      </div>
    </div>
  `,
})
export class AccessDeniedComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly roleLabel = ROLE_LABELS[this.auth.currentUser().role];
  readonly homeRoute = ROLE_HOME_ROUTE[this.auth.currentUser().role];

  switchAccount(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
