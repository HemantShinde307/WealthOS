import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Employee } from '../setup-data.mock';
import { SetupService } from '../setup.service';
import { ExportButtonComponent } from '../../../../shared/components/export-button/export-button.component';
import { confirmDelete } from '../../../../shared/utils/confirm';

type EmployeeDraft = Partial<Employee>;

const EMPTY_DRAFT: EmployeeDraft = { empCode: '', name: '', designation: '', branchId: '', email: '', phone: '', dateOfJoining: '', status: 'Active' };

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, ExportButtonComponent],
  templateUrl: './employees.component.html',
})
export class EmployeesComponent {
  readonly setup = inject(SetupService);

  readonly exportHeaders = ['Code', 'Name', 'Designation', 'Branch', 'Email', 'Phone', 'Date of Joining', 'Status'];
  readonly exportRows = computed(() =>
    this.filtered().map((e) => [e.empCode, e.name, e.designation, this.setup.branchName(e.branchId), e.email, e.phone, e.dateOfJoining, e.status]),
  );

  readonly searchTerm = signal('');
  readonly formMode = signal<'closed' | 'add' | 'edit'>('closed');
  readonly editingId = signal<string | null>(null);
  readonly draft = signal<EmployeeDraft>({ ...EMPTY_DRAFT });

  readonly filtered = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.setup.employees();
    return this.setup.employees().filter((e) => `${e.name} ${e.empCode} ${e.designation}`.toLowerCase().includes(term));
  });

  openAdd(): void {
    this.draft.set({ ...EMPTY_DRAFT, branchId: this.setup.branches()[0]?.id ?? '', dateOfJoining: new Date().toISOString().slice(0, 10) });
    this.editingId.set(null);
    this.formMode.set('add');
  }

  openEdit(e: Employee): void {
    this.draft.set({ ...e });
    this.editingId.set(e.id);
    this.formMode.set('edit');
  }

  cancel(): void {
    this.formMode.set('closed');
    this.editingId.set(null);
  }

  setField<K extends keyof Employee>(key: K, value: Employee[K]): void {
    this.draft.update((d) => ({ ...d, [key]: value }));
  }

  save(): void {
    const d = this.draft();
    if (!d.name?.trim() || !d.empCode?.trim()) return;
    if (this.formMode() === 'edit' && this.editingId()) {
      this.setup.updateEmployee(this.editingId()!, d);
    } else {
      this.setup.addEmployee(d as Omit<Employee, 'id'>);
    }
    this.cancel();
  }

  remove(id: string): void {
    const item = this.setup.employees().find((x) => x.id === id);
    if (!confirmDelete(`${item?.name ?? 'this employee'}`)) return;
    this.setup.deleteEmployee(id);
    if (this.editingId() === id) this.cancel();
  }
}
