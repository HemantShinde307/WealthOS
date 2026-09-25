import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom, timeout } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BrandingDto } from '../models/tenant.models';
import { isHexColor, onColor, readableAccent } from '../utils/color';

export const DEFAULT_BRAND_NAME = 'WealthOS';
export const DEFAULT_LOGO = '/branding/logo-icon.png';

const SLUG_RE = /^[a-z][a-z0-9-]{1,29}$/;
const LOGO_RE = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/;
const RESERVED_SUBDOMAINS = ['www', 'app', 'api'];
// Shared hosting domains where the first label is the hosting account, not a tenant.
const SHARED_HOST_SUFFIXES = ['github.io', 'railway.app', 'vercel.app', 'netlify.app', 'onrender.com'];
const SESSION_KEY = 'wealthos.tenant';

/** Which tenant this browser is on: sub-domain, then ?tenant= (remembered for the tab), then the default. */
export function resolveTenantSlug(): string {
  const host = location.hostname.toLowerCase();
  const isIp = /^[\d.]+$/.test(host) || host.includes(':');
  if (!isIp && !SHARED_HOST_SUFFIXES.some((s) => host.endsWith('.' + s))) {
    const parts = host.split('.');
    const hasSub = parts[parts.length - 1] === 'localhost' ? parts.length >= 2 : parts.length >= 3;
    if (hasSub && !RESERVED_SUBDOMAINS.includes(parts[0]) && SLUG_RE.test(parts[0])) return parts[0];
  }
  try {
    const q = new URLSearchParams(location.search).get('tenant')?.toLowerCase() ?? '';
    if (SLUG_RE.test(q)) {
      sessionStorage.setItem(SESSION_KEY, q);
      return q;
    }
    const remembered = sessionStorage.getItem(SESSION_KEY);
    if (remembered && SLUG_RE.test(remembered)) return remembered;
  } catch {
    // storage unavailable — fall through to the default
  }
  return environment.defaultTenant;
}

@Injectable({ providedIn: 'root' })
export class TenantService {
  private readonly http = inject(HttpClient);

  readonly slug = signal(resolveTenantSlug());
  readonly branding = signal<BrandingDto | null>(null);
  /** True when the backend refuses this tenant's portal (suspended / expired trial). */
  readonly unavailable = signal(false);

  readonly brandName = computed(() => this.branding()?.name || DEFAULT_BRAND_NAME);
  readonly logoSrc = computed(() => {
    const url = this.branding()?.logoUrl;
    return url && LOGO_RE.test(url) ? url : DEFAULT_LOGO;
  });

  /** Runs before the app renders (see app.config). Never throws — a failure just means default branding. */
  async load(): Promise<void> {
    // The platform console is tenant-less and must stay reachable even if a tenant is suspended.
    if (location.pathname.startsWith('/platform')) return;
    try {
      const dto = await firstValueFrom(
        this.http.get<BrandingDto>(`${environment.apiBase}/api/tenant/branding`, { params: { slug: this.slug() } }).pipe(timeout(4000)),
      );
      this.applyBranding(dto);
    } catch (err) {
      if (err instanceof HttpErrorResponse && err.status === 403) this.unavailable.set(true);
    }
  }

  /** Applies a (validated) branding payload to the document: colours, title and favicon. */
  applyBranding(dto: BrandingDto): void {
    this.branding.set(dto);
    const root = document.documentElement.style;
    if (isHexColor(dto.primaryColor)) {
      const c = dto.primaryColor;
      const on = onColor(c);
      root.setProperty('--color-primary', c);
      root.setProperty('--color-primary-container', c);
      root.setProperty('--color-on-primary', on);
      root.setProperty('--color-on-primary-container', on);
    }
    if (isHexColor(dto.secondaryColor)) {
      const c = readableAccent(dto.secondaryColor);
      const on = onColor(c);
      root.setProperty('--color-secondary', c);
      root.setProperty('--color-secondary-container', c);
      root.setProperty('--color-on-secondary', on);
      root.setProperty('--color-on-secondary-container', on);
    }
    if (dto.name) document.title = dto.name;
    const icon = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
    if (icon && this.logoSrc() !== DEFAULT_LOGO) {
      icon.type = '';
      icon.href = this.logoSrc();
    }
  }
}
