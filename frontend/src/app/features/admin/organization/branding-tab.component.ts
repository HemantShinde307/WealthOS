import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { BrandingDto, UpdateBrandingRequest } from '../../../core/models/tenant.models';
import { TenantAdminService } from '../../../core/services/tenant-admin.service';
import { TenantService, DEFAULT_LOGO } from '../../../core/services/tenant.service';
import { apiError } from '../../../core/services/platform.service';
import { isHexColor, onColor, readableAccent } from '../../../core/utils/color';

const MAX_LOGO_BYTES = 300 * 1024;
const LOGO_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const INPUT = 'w-full px-3 py-2 border border-outline-variant rounded-md text-sm bg-surface-container-lowest focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/30';

@Component({
  selector: 'app-branding-tab',
  standalone: true,
  templateUrl: './branding-tab.component.html',
})
export class BrandingTabComponent implements OnInit {
  private readonly api = inject(TenantAdminService);
  private readonly tenant = inject(TenantService);

  readonly branding = input.required<BrandingDto>();
  readonly inputClass = INPUT;

  readonly name = signal('');
  readonly tagline = signal('');
  readonly primary = signal('#131b2e');
  readonly secondary = signal('#0051d5');
  readonly supportEmail = signal('');
  readonly supportPhone = signal('');
  readonly arn = signal('');
  /** Existing logo (validated data URL from the server), a newly picked one, or nothing. */
  readonly logo = signal<string | null>(null);
  private newLogo: string | null = null;
  private clearLogo = false;

  readonly error = signal<string | null>(null);
  readonly saved = signal(false);
  readonly saving = signal(false);

  readonly logoPreview = computed(() => this.logo() ?? DEFAULT_LOGO);
  // Live preview styling — derived with the same contrast rules the app applies at runtime.
  readonly primaryOn = computed(() => (isHexColor(this.primary()) ? onColor(this.primary()) : '#ffffff'));
  readonly accent = computed(() => (isHexColor(this.secondary()) ? readableAccent(this.secondary()) : '#0051d5'));
  readonly accentOn = computed(() => onColor(this.accent()));

  ngOnInit(): void {
    const b = this.branding();
    this.name.set(b.name);
    this.tagline.set(b.tagline ?? '');
    this.primary.set(isHexColor(b.primaryColor) ? b.primaryColor : '#131b2e');
    this.secondary.set(isHexColor(b.secondaryColor) ? b.secondaryColor : '#0051d5');
    this.supportEmail.set(b.supportEmail ?? '');
    this.supportPhone.set(b.supportPhone ?? '');
    this.arn.set(b.arn ?? '');
    this.logo.set(b.logoUrl && this.tenant.logoSrc() !== DEFAULT_LOGO ? this.tenant.logoSrc() : null);
  }

  onLogoPicked(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (!LOGO_TYPES.includes(file.type)) return this.error.set('Logo must be a PNG, JPEG or WebP image.');
    if (file.size > MAX_LOGO_BYTES) return this.error.set('Logo must be 300 KB or smaller.');
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result);
      if (!/^data:image\/(png|jpeg|webp);base64,/.test(url)) return this.error.set('Could not read that image.');
      this.error.set(null);
      this.newLogo = url;
      this.clearLogo = false;
      this.logo.set(url);
    };
    reader.readAsDataURL(file);
  }

  removeLogo(): void {
    this.newLogo = null;
    this.clearLogo = true;
    this.logo.set(null);
  }

  async save(): Promise<void> {
    this.saved.set(false);
    if (this.name().trim().length < 2 || this.name().trim().length > 80) return this.error.set('Name must be 2 to 80 characters.');
    if (this.tagline().length > 140) return this.error.set('Tagline can be at most 140 characters.');
    if (!isHexColor(this.primary()) || !isHexColor(this.secondary())) return this.error.set('Pick valid colours.');

    const body: UpdateBrandingRequest = {
      name: this.name().trim(),
      tagline: this.tagline().trim(),
      primaryColor: this.primary(),
      secondaryColor: this.secondary(),
      supportEmail: this.supportEmail().trim(),
      supportPhone: this.supportPhone().trim(),
      arn: this.arn().trim(),
    };
    if (this.newLogo) body.logoDataUrl = this.newLogo;
    else if (this.clearLogo) body.clearLogo = true;

    this.error.set(null);
    this.saving.set(true);
    try {
      const dto = await firstValueFrom(this.api.updateBranding(body));
      this.tenant.applyBranding(dto);
      this.newLogo = null;
      this.clearLogo = false;
      this.saved.set(true);
    } catch (err) {
      this.error.set(apiError(err));
    } finally {
      this.saving.set(false);
    }
  }
}
