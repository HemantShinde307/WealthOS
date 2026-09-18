import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerLogin } from '../setup-data.mock';
import { SetupService } from '../setup.service';

type StatusFilter = 'All' | CustomerLogin['status'];

@Component({
  selector: 'app-login-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login-management.component.html',
})
export class LoginManagementComponent {
  readonly setup = inject(SetupService);

  readonly searchTerm = signal('');
  readonly statusFilter = signal<StatusFilter>('All');
  readonly resetMessage = signal<{ id: string; password: string } | null>(null);

  readonly filtered = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const status = this.statusFilter();
    return this.setup.customerLogins().filter((c) => {
      const matchesTerm = !term || `${c.customerName} ${c.username} ${c.email}`.toLowerCase().includes(term);
      const matchesStatus = status === 'All' || c.status === status;
      return matchesTerm && matchesStatus;
    });
  });

  readonly activeCount = computed(() => this.setup.customerLogins().filter((c) => c.status === 'Active').length);
  readonly lockedCount = computed(() => this.setup.customerLogins().filter((c) => c.status === 'Locked').length);
  readonly disabledCount = computed(() => this.setup.customerLogins().filter((c) => c.status === 'Disabled').length);

  setStatus(id: string, status: CustomerLogin['status']): void {
    this.setup.setLoginStatus(id, status);
    this.resetMessage.set(null);
  }

  reset(id: string): void {
    const password = this.setup.resetPassword(id);
    this.resetMessage.set({ id, password });
  }

  dismissReset(): void {
    this.resetMessage.set(null);
  }
}
