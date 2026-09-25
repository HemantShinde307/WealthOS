import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, ROLE_HOME_ROUTE } from '../../core/services/auth.service';

@Component({
  selector: 'app-platform-login',
  standalone: true,
  template: `
    <div class="min-h-screen bg-background flex items-center justify-center p-6">
      <div class="w-full max-w-md">
        <div class="flex flex-col items-center mb-8">
          <img src="/branding/logo-icon.png" alt="" class="w-14 h-14 rounded-2xl object-cover mb-3" />
          <h1 class="text-headline-lg-mobile text-on-background font-bold">WealthOS Platform</h1>
          <p class="text-sm text-on-surface-variant mt-1">Sign in to the platform console</p>
        </div>
        <div class="bg-surface-container-lowest border border-outline-variant rounded-lg p-6 sm:p-8 shadow-sm space-y-5">
          <div>
            <label class="text-sm font-medium text-on-background block mb-2">Email</label>
            <input
              type="email"
              autocomplete="email"
              class="w-full px-4 py-2.5 border border-outline-variant rounded-md text-sm bg-surface-container-lowest focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/30"
              [value]="email()"
              (input)="email.set($any($event.target).value)"
              (keydown.enter)="submit()"
            />
          </div>
          <div>
            <label class="text-sm font-medium text-on-background block mb-2">Password</label>
            <input
              type="password"
              autocomplete="current-password"
              class="w-full px-4 py-2.5 border border-outline-variant rounded-md text-sm bg-surface-container-lowest focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/30"
              [value]="password()"
              (input)="password.set($any($event.target).value)"
              (keydown.enter)="submit()"
            />
          </div>
          @if (error()) {
            <div class="bg-error-container/50 rounded-lg p-3 text-sm text-on-error-container flex gap-2">
              <span class="material-symbols-outlined text-[18px] shrink-0">error</span>
              <span>{{ error() }}</span>
            </div>
          }
          <button
            class="w-full bg-primary-container text-on-primary py-3 rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            [disabled]="submitting()"
            (click)="submit()"
          >
            {{ submitting() ? 'Signing in…' : 'Sign In' }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class PlatformLoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly email = signal('');
  readonly password = signal('');
  readonly error = signal<string | null>(null);
  readonly submitting = signal(false);

  async submit(): Promise<void> {
    this.error.set(null);
    this.submitting.set(true);
    const result = await this.auth.platformLogin(this.email(), this.password());
    this.submitting.set(false);
    if (!result.success) {
      this.error.set(result.error ?? 'Something went wrong. Please try again.');
      return;
    }
    this.router.navigate([ROLE_HOME_ROUTE['platform_admin']]);
  }
}
