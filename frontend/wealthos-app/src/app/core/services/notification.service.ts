import { Injectable, signal, computed } from '@angular/core';
import { Notification } from '../models/domain.models';
import { MOCK_NOTIFICATIONS } from '../mock-data';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly _notifications = signal<Notification[]>(MOCK_NOTIFICATIONS);
  readonly notifications = this._notifications.asReadonly();
  readonly unreadCount = computed(() => this._notifications().filter((n) => !n.read).length);

  markRead(id: string): void {
    this._notifications.update((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  markAllRead(): void {
    this._notifications.update((list) => list.map((n) => ({ ...n, read: true })));
  }
}
