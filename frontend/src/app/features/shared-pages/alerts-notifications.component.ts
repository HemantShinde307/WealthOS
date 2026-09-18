import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-alerts-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-background p-6 max-w-2xl mx-auto">
      <div class="flex items-center gap-3 mb-6">
        <button class="p-2 -ml-2 rounded-full text-on-surface-variant hover:bg-surface-container-low" (click)="location.back()">
          <span class="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 class="text-headline-lg-mobile text-on-background flex-1">Notifications</h1>
        @if (notificationService.unreadCount() > 0) {
          <button class="text-secondary text-sm font-medium hover:underline" (click)="notificationService.markAllRead()">Mark all read</button>
        }
      </div>

      <div class="space-y-2">
        @for (n of notificationService.notifications(); track n.id) {
          <button
            class="w-full text-left bg-surface-container-lowest border border-outline-variant rounded-lg p-4 flex gap-3 items-start hover:bg-surface-container-low/50 transition-colors"
            [class.opacity-60]="n.read"
            (click)="notificationService.markRead(n.id)"
          >
            <span
              class="material-symbols-outlined shrink-0"
              [class]="{
                success: 'text-on-tertiary-container',
                warning: 'text-warning',
                error: 'text-error',
                info: 'text-secondary'
              }[n.type]"
            >
              {{ { success: 'check_circle', warning: 'warning', error: 'error', info: 'info' }[n.type] }}
            </span>
            <div class="min-w-0 flex-1">
              <div class="flex justify-between items-baseline gap-2">
                <p class="font-medium text-on-background truncate">{{ n.title }}</p>
                @if (!n.read) {
                  <span class="w-2 h-2 bg-error rounded-full shrink-0"></span>
                }
              </div>
              <p class="text-sm text-on-surface-variant mt-0.5">{{ n.message }}</p>
              <p class="text-xs text-on-surface-variant mt-1">{{ n.timestamp | date: 'medium' }}</p>
            </div>
          </button>
        }
      </div>
    </div>
  `,
})
export class AlertsNotificationsComponent {
  readonly notificationService = inject(NotificationService);
  readonly location = inject(Location);
}
