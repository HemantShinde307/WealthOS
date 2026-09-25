import { Component, inject, input, OnInit, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { TeamMemberDto } from '../../../core/models/tenant.models';
import { TenantAdminService } from '../../../core/services/tenant-admin.service';
import { apiError } from '../../../core/services/platform.service';
import { AuthService } from '../../../core/services/auth.service';

const INPUT = 'w-full px-3 py-2 border border-outline-variant rounded-md text-sm bg-surface-container-lowest focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/30';

@Component({
  selector: 'app-team-tab',
  standalone: true,
  template: `
    <div class="space-y-4">
      <div class="flex justify-between items-center">
        <p class="text-sm text-on-surface-variant">{{ members().length }} of {{ maxUsers() }} team members</p>
        <button class="px-4 py-2 bg-primary-container text-on-primary rounded font-medium text-sm hover:opacity-90" (click)="showForm.set(!showForm())">
          {{ showForm() ? 'Close' : 'Add member' }}
        </button>
      </div>

      @if (error()) {
        <div class="bg-error-container/50 rounded-lg p-3 text-sm text-on-error-container">{{ error() }}</div>
      }

      @if (showForm()) {
        <div class="bg-surface-container-lowest border border-outline-variant rounded-lg p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-on-background block mb-1">Role</label>
            <select [class]="inputClass" (change)="set('role', $any($event.target).value)">
              <option value="advisor" [selected]="form().role === 'advisor'">Advisor / Distributor staff</option>
              <option value="admin" [selected]="form().role === 'admin'">Admin</option>
            </select>
          </div>
          @for (f of fields; track f.key) {
            <div>
              <label class="text-sm font-medium text-on-background block mb-1">{{ f.label }}</label>
              <input [type]="f.type" [class]="inputClass" [value]="form()[f.key]" (input)="set(f.key, $any($event.target).value)" />
            </div>
          }
          <div class="md:col-span-2">
            <button class="px-4 py-2 bg-primary-container text-on-primary rounded font-medium text-sm hover:opacity-90 disabled:opacity-50" [disabled]="saving()" (click)="add()">
              {{ saving() ? 'Adding…' : 'Add member' }}
            </button>
          </div>
        </div>
      }

      <div class="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="bg-surface-container-low text-on-surface-variant text-xs uppercase tracking-wider">
            <tr>
              <th class="px-4 py-3">Name</th>
              <th class="px-4 py-3">Role</th>
              <th class="px-4 py-3">Code</th>
              <th class="px-4 py-3">Status</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-outline-variant">
            @for (m of members(); track m.role + m.id) {
              <tr>
                <td class="px-4 py-3">
                  <p class="font-medium text-on-background">{{ m.name }}</p>
                  <p class="text-xs text-on-surface-variant">{{ m.email }}</p>
                </td>
                <td class="px-4 py-3 capitalize">{{ m.role }}</td>
                <td class="px-4 py-3 font-mono text-xs">{{ m.accountCode }}</td>
                <td class="px-4 py-3">
                  <span class="px-2 py-0.5 rounded-full text-xs font-medium" [class]="m.active ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-surface-container-high text-on-surface-variant'">
                    {{ m.active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right">
                  <button
                    class="text-sm font-medium hover:underline disabled:opacity-50"
                    [class]="m.active ? 'text-error' : 'text-secondary'"
                    [disabled]="isSelf(m)"
                    (click)="toggle(m)"
                  >
                    {{ m.active ? 'Deactivate' : 'Activate' }}
                  </button>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="5" class="px-4 py-8 text-center text-on-surface-variant">No team members yet.</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class TeamTabComponent implements OnInit {
  private readonly api = inject(TenantAdminService);
  private readonly auth = inject(AuthService);

  readonly maxUsers = input.required<number>();

  readonly inputClass = INPUT;
  readonly fields: { key: 'name' | 'email' | 'phone' | 'password'; label: string; type: string }[] = [
    { key: 'name', label: 'Full name', type: 'text' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'phone', label: 'Phone (optional)', type: 'tel' },
    { key: 'password', label: 'Temporary password (min 8)', type: 'password' },
  ];

  readonly members = signal<TeamMemberDto[]>([]);
  readonly showForm = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly form = signal({ role: 'advisor', name: '', email: '', phone: '', password: '' });

  async ngOnInit(): Promise<void> {
    try {
      this.members.set(await firstValueFrom(this.api.users()));
    } catch (err) {
      this.error.set(apiError(err, 'Could not load the team.'));
    }
  }

  set(key: string, value: string): void {
    this.form.update((f) => ({ ...f, [key]: value }));
  }

  isSelf(m: TeamMemberDto): boolean {
    return m.accountCode === this.auth.currentUser().accountCode;
  }

  async add(): Promise<void> {
    const f = this.form();
    if (f.name.trim().length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) return this.error.set('Enter a name and a valid email.');
    if (f.password.length < 8) return this.error.set('Password must be at least 8 characters.');
    this.error.set(null);
    this.saving.set(true);
    try {
      const created = await firstValueFrom(
        this.api.addUser({ role: f.role as 'admin' | 'advisor', name: f.name.trim(), email: f.email.trim(), phone: f.phone.trim() || undefined, password: f.password }),
      );
      this.members.update((l) => [...l, created]);
      this.form.set({ role: 'advisor', name: '', email: '', phone: '', password: '' });
      this.showForm.set(false);
    } catch (err) {
      this.error.set(apiError(err));
    } finally {
      this.saving.set(false);
    }
  }

  async toggle(m: TeamMemberDto): Promise<void> {
    if (m.active && !window.confirm(`Deactivate ${m.name}? They will no longer be able to sign in.`)) return;
    this.error.set(null);
    try {
      const updated = await firstValueFrom(this.api.patchUser(m.role, m.id, { active: !m.active }));
      this.members.update((l) => l.map((x) => (x.role === m.role && x.id === m.id ? updated : x)));
    } catch (err) {
      this.error.set(apiError(err));
    }
  }
}
