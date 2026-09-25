import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ShellConfig } from '../layout.models';
import { NotificationService } from '../../services/notification.service';
import { TenantService } from '../../services/tenant.service';

@Component({
  selector: 'app-mobile-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './mobile-shell.component.html',
})
export class MobileShellComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly notificationService = inject(NotificationService);

  readonly config = computed<ShellConfig>(() => this.route.snapshot.data['shellConfig']);
  readonly tenant = inject(TenantService);
  readonly unreadCount = this.notificationService.unreadCount;
}
