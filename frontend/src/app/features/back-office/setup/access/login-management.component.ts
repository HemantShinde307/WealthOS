import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerLogin } from '../setup-data.mock';
import { SetupService } from '../setup.service';
import { ExportButtonComponent } from '../../../../shared/components/export-button/export-button.component';
import { confirmDelete } from '../../../../shared/utils/confirm';

type StatusFilter = 'All' | CustomerLogin['status'];

@Component({
  selector: 'app-login-management',
  standalone: true,
  imports: [CommonModule, ExportButtonComponent],
  templateUrl: './login-management.component.html',
})
export class LoginManagementComponent {
  readonly setup = inject(SetupService);

  readonly exportHeaders = ['Customer', 'Username', 'Email', 'Last Login', 'Failed Attempts', 'Status'];
  readonly exportRows = computed(() =>
    this.filtered().map((c) => [c.customerName, c.username, c.email, c.lastLogin ?? 'Never', c.failedAttempts, c.status]),
  );

  readonly searchTerm = signal('');
  readonly statusFilter = signal<StatusFilter>('All');
  readonly resetMessage = signal<{ id: string; password: string } | null>(null);

  readonly editingId = signal<string | null>(null);
  readonly customerName = signal('');
  readonly username = signal('');
  readonly email = signal('');
  readonly editStatus = signal<CustomerLogin['status']>('Active');
  readonly error = signal<string | null>(null);

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

  edit(c: CustomerLogin): void {
    this.editingId.set(c.id);
    this.customerName.set(c.customerName);
    this.username.set(c.username);
    this.email.set(c.email);
    this.editStatus.set(c.status);
    this.error.set(null);
    this.resetMessage.set(null);
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  saveEdit(): void {
    const id = this.editingId();
    if (!id) return;
    if (!this.customerName().trim() || !this.username().trim()) {
      this.error.set('Customer name and username are required.');
      return;
    }
    const status = this.editStatus();
    this.setup.updateCustomerLogin(id, {
      customerName: this.customerName().trim(),
      username: this.username().trim(),
      email: this.email().trim(),
      status,
      ...(status === 'Active' ? { failedAttempts: 0 } : {}),
    });
    this.editingId.set(null);
  }

  remove(c: CustomerLogin): void {
    if (!confirmDelete(`the login for ${c.customerName}`)) return;
    this.setup.deleteCustomerLogin(c.id);
    if (this.editingId() === c.id) this.editingId.set(null);
    if (this.resetMessage()?.id === c.id) this.resetMessage.set(null);
  }
}
