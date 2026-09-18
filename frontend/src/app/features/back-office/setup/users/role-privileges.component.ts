import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SetupService } from '../setup.service';

@Component({
  selector: 'app-role-privileges',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './role-privileges.component.html',
})
export class RolePrivilegesComponent {
  readonly setup = inject(SetupService);

  toggle(roleId: string, permissionId: string): void {
    this.setup.togglePrivilege(roleId, permissionId);
  }
}
