import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ShellConfig } from '../layout.models';
import { NotificationService } from '../../services/notification.service';
import { ChatService } from '../../services/chat.service';
import { AuthService, ROLE_HOME_ROUTE } from '../../services/auth.service';

@Component({
  selector: 'app-desktop-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './desktop-shell.component.html',
})
export class DesktopShellComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);
  readonly auth = inject(AuthService);
  readonly chat = inject(ChatService);

  readonly config = computed<ShellConfig>(() => this.route.snapshot.data['shellConfig']);
  readonly unreadCount = this.notificationService.unreadCount;
  // Computed rather than a static field on ShellConfig — Back Office is shared by both Admin
  // and Advisor roles, so "back" has to resolve to whichever role is actually signed in.
  readonly backRoute = computed(() => ROLE_HOME_ROUTE[this.auth.currentUser().role]);

  constructor() {
    // Lazy: only connects for logged-in advisor/investor users with a token.
    this.chat.connect();
  }

  sidebarOpen = false;
  readonly profileMenuOpen = signal(false);

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  toggleProfileMenu(): void {
    this.profileMenuOpen.update((v) => !v);
  }

  logout(): void {
    this.profileMenuOpen.set(false);
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
