import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FamilyOfficeService } from '../family-office.service';
import { EntityType, MemberRelationship } from '../family-office.models';

@Component({
  selector: 'app-member-setup',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './member-setup.component.html',
})
export class MemberSetupComponent {
  private readonly familyOffice = inject(FamilyOfficeService);
  private readonly router = inject(Router);

  readonly entityTypes: EntityType[] = ['Individual', 'Minor', 'HUF', 'Trust'];
  readonly relationships: MemberRelationship[] = ['Family Head', 'Spouse', 'Child', 'Minor Child', 'Family Trust', 'HUF'];

  readonly fullName = signal('');
  readonly entityType = signal<EntityType | ''>('');
  readonly relationship = signal<MemberRelationship | ''>('');
  readonly pan = signal('');
  readonly panValidated = signal(false);
  readonly saved = signal(false);

  get isValid(): boolean {
    return this.fullName().trim().length > 2 && !!this.entityType() && !!this.relationship();
  }

  validatePan(): void {
    if (this.pan().trim().length === 10) {
      this.panValidated.set(true);
    }
  }

  saveProfile(): void {
    if (!this.isValid) return;
    const initials = this.fullName()
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 3)
      .toUpperCase();

    this.familyOffice.addMember({
      name: this.fullName().trim(),
      relationship: this.relationship() as MemberRelationship,
      entityType: this.entityType() as EntityType,
      initials,
      panMasked: this.pan().trim() ? `${this.pan().trim().slice(0, 5)}****${this.pan().trim().slice(-1)}` : 'Pending KYC',
      status: 'Active',
      aum: 0,
      ytdReturnPct: null,
      dashboardAccess: 'Restricted',
      vaultPermission: 'Read Only',
      linkedAccounts: 0,
      lastSyncLabel: 'Never synced',
      casStatus: 'Not Started',
      joinedOn: new Date().toISOString().slice(0, 10),
    });

    this.saved.set(true);
    this.router.navigate(['/family-office/members']);
  }
}
