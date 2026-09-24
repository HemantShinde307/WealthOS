import { Component, input, output, signal } from '@angular/core';
import { BackOfficeCustomer } from '../back-office-data.mock';

/** Inline edit form for a back-office customer. ID and PAN are read-only. */
@Component({
  selector: 'app-customer-edit-form',
  standalone: true,
  template: `
    <div class="bg-surface-container-lowest border border-outline-variant rounded-lg p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
      @if (error()) {
        <div class="md:col-span-3 bg-error/10 border border-error/40 rounded-lg p-3 text-error text-sm">{{ error() }}</div>
      }
      <div class="flex flex-col gap-1">
        <label class="text-label-md text-on-surface-variant">Customer ID</label>
        <input class="bg-surface-container-low border border-outline-variant rounded-md px-3 py-2 text-sm text-on-surface-variant font-mono" [value]="customer().id" disabled />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-label-md text-on-surface-variant">PAN</label>
        <input class="bg-surface-container-low border border-outline-variant rounded-md px-3 py-2 text-sm text-on-surface-variant font-mono" [value]="customer().pan" disabled />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-label-md text-on-surface-variant">Name</label>
        <input class="bg-surface-container-lowest border border-outline-variant rounded-md px-3 py-2 text-sm text-on-background" [value]="name()" (input)="name.set($any($event.target).value)" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-label-md text-on-surface-variant">Email</label>
        <input class="bg-surface-container-lowest border border-outline-variant rounded-md px-3 py-2 text-sm text-on-background" [value]="email()" (input)="email.set($any($event.target).value)" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-label-md text-on-surface-variant">Phone</label>
        <input class="bg-surface-container-lowest border border-outline-variant rounded-md px-3 py-2 text-sm text-on-background" [value]="phone()" (input)="phone.set($any($event.target).value)" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-label-md text-on-surface-variant">Segment</label>
        <select class="bg-surface-container-lowest border border-outline-variant rounded-md px-3 py-2 text-sm text-on-background" [value]="segment()" (change)="segment.set($any($event.target).value)">
          @for (s of segments; track s) { <option [value]="s" [selected]="s === segment()">{{ s }}</option> }
        </select>
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-label-md text-on-surface-variant">Risk Profile</label>
        <select class="bg-surface-container-lowest border border-outline-variant rounded-md px-3 py-2 text-sm text-on-background" [value]="riskProfile()" (change)="riskProfile.set($any($event.target).value)">
          @for (r of risks; track r) { <option [value]="r" [selected]="r === riskProfile()">{{ r }}</option> }
        </select>
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-label-md text-on-surface-variant">KYC Status</label>
        <select class="bg-surface-container-lowest border border-outline-variant rounded-md px-3 py-2 text-sm text-on-background" [value]="kycStatus()" (change)="kycStatus.set($any($event.target).value)">
          @for (k of kycs; track k) { <option [value]="k" [selected]="k === kycStatus()">{{ k }}</option> }
        </select>
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-label-md text-on-surface-variant">Status</label>
        <select class="bg-surface-container-lowest border border-outline-variant rounded-md px-3 py-2 text-sm text-on-background" [value]="status()" (change)="status.set($any($event.target).value)">
          @for (s of statuses; track s) { <option [value]="s" [selected]="s === status()">{{ s }}</option> }
        </select>
      </div>
      <div class="md:col-span-3 flex justify-end gap-2">
        <button class="px-4 py-2 border border-outline-variant rounded-md text-sm font-medium hover:bg-surface-container-low" (click)="cancelled.emit()">Cancel</button>
        <button class="bg-primary-container text-on-primary px-5 py-2 rounded-md hover:opacity-90 transition-opacity text-sm font-medium" (click)="save()">Save Changes</button>
      </div>
    </div>
  `,
})
export class CustomerEditFormComponent {
  readonly customer = input.required<BackOfficeCustomer>();
  readonly saved = output<Partial<BackOfficeCustomer>>();
  readonly cancelled = output<void>();

  readonly segments: BackOfficeCustomer['segment'][] = ['Retail', 'HNI', 'Corporate', 'NRI', 'Family Office'];
  readonly risks: BackOfficeCustomer['riskProfile'][] = ['Conservative', 'Moderate', 'Aggressive'];
  readonly kycs: BackOfficeCustomer['kycStatus'][] = ['Verified', 'Pending', 'Rejected', 'Not Started'];
  readonly statuses: BackOfficeCustomer['status'][] = ['Active', 'Inactive'];

  // Parent re-creates this component per edit (via @if), so seed once from the input.
  readonly name = signal('');
  readonly email = signal('');
  readonly phone = signal('');
  readonly segment = signal<BackOfficeCustomer['segment']>('Retail');
  readonly riskProfile = signal<BackOfficeCustomer['riskProfile']>('Moderate');
  readonly kycStatus = signal<BackOfficeCustomer['kycStatus']>('Not Started');
  readonly status = signal<BackOfficeCustomer['status']>('Active');
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    const c = this.customer();
    this.name.set(c.name);
    this.email.set(c.email);
    this.phone.set(c.phone);
    this.segment.set(c.segment);
    this.riskProfile.set(c.riskProfile);
    this.kycStatus.set(c.kycStatus);
    this.status.set(c.status);
  }

  save(): void {
    if (!this.name().trim() || !this.email().trim()) {
      this.error.set('Name and email are required.');
      return;
    }
    const patch: Partial<BackOfficeCustomer> = {
      name: this.name().trim(),
      email: this.email().trim(),
      phone: this.phone().trim(),
      segment: this.segment(),
      kycStatus: this.kycStatus(),
      status: this.status(),
    };
    // Changing the risk profile by hand is a manual override, mirroring the service's manual-override bookkeeping.
    if (this.riskProfile() !== this.customer().riskProfile) {
      patch.riskProfile = this.riskProfile();
      patch.riskProfileMethod = 'Manual';
      patch.riskProfileScore = undefined;
      patch.riskProfileAssessedOn = new Date().toISOString().slice(0, 10);
    }
    this.saved.emit(patch);
  }
}
