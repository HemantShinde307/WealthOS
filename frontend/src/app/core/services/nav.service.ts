import { DestroyRef, Injectable, effect, inject, signal, untracked } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface NavDto {
  schemeCode: number;
  isin: string | null;
  isinReinvestment: string | null;
  schemeName: string;
  nav: number;
  navDate: string; // YYYY-MM-DD
}

export interface NavStatusDto {
  schemeCount: number;
  latestNavDate: string | null;
  lastRefreshedAt: string | null;
  lastRefreshOk: boolean | null;
  lastRefreshMessage: string | null;
}

export interface LiveNav {
  nav: number;
  navDate: string;
}

const CHUNK = 200;
const REFRESH_MS = 60 * 60 * 1000; // NAVs change once a day — hourly is plenty
const STALE_MS = 30 * 60 * 1000;

/**
 * Fetches the latest AMFI NAVs from our backend (never AMFI directly). Every failure is swallowed:
 * the last known values stay and nothing is surfaced to the user.
 */
@Injectable({ providedIn: 'root' })
export class NavService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  private readonly _navs = signal<Record<string, LiveNav>>({});
  private readonly _latestNavDate = signal<string | null>(null);
  private readonly _lastFetchedAt = signal<number | null>(null);
  private readonly _loading = signal(false);
  private readonly _wanted = signal<Record<string, string[]>>({});

  readonly navsByIsin = this._navs.asReadonly();
  readonly latestNavDate = this._latestNavDate.asReadonly();
  readonly lastFetchedAt = this._lastFetchedAt.asReadonly();
  readonly loading = this._loading.asReadonly();

  private readonly attempted = new Set<string>();
  private timer: ReturnType<typeof setInterval> | null = null;
  private inFlight = false;

  constructor() {
    // Start/stop polling with the login state.
    effect(() => {
      const active = this.auth.isAuthenticated() && !!this.auth.currentUser().token;
      untracked(() => (active ? this.start() : this.stop()));
    });

    // Fetch any newly requested ISIN that has not been tried yet.
    effect(() => {
      const wanted = this.wantedIsins();
      untracked(() => {
        if (!this.isActive()) return;
        const fresh = wanted.filter((i) => !this.attempted.has(i));
        if (fresh.length) void this.fetchIsins(fresh);
      });
    });

    if (typeof document !== 'undefined') {
      const onVisible = () => {
        if (document.visibilityState !== 'visible' || !this.isActive()) return;
        const last = this._lastFetchedAt();
        if (last === null || Date.now() - last > STALE_MS) void this.refresh();
      };
      document.addEventListener('visibilitychange', onVisible);
      inject(DestroyRef).onDestroy(() => document.removeEventListener('visibilitychange', onVisible));
    }
  }

  /** Registers the ISINs a consumer cares about (replaces that source's previous list). */
  watch(source: string, isins: Array<string | undefined | null>): void {
    const clean = Array.from(new Set(isins.filter((i): i is string => !!i && /^[A-Z0-9]{12}$/.test(i))));
    const current = this._wanted()[source];
    if (current && current.length === clean.length && current.every((v, i) => v === clean[i])) return;
    this._wanted.update((w) => ({ ...w, [source]: clean }));
  }

  /** Re-fetches everything that is being watched, plus the status. */
  async refresh(): Promise<void> {
    if (!this.isActive()) return;
    await Promise.all([this.fetchIsins(this.wantedIsins()), this.fetchStatus()]);
    this._lastFetchedAt.set(Date.now());
  }

  private wantedIsins(): string[] {
    return Array.from(new Set(Object.values(this._wanted()).flat()));
  }

  private isActive(): boolean {
    return this.auth.isAuthenticated() && !!this.auth.currentUser().token;
  }

  private start(): void {
    if (this.timer) return;
    void this.refresh();
    this.timer = setInterval(() => void this.refresh(), REFRESH_MS);
  }

  private stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  private async fetchStatus(): Promise<void> {
    try {
      const status = await firstValueFrom(this.http.get<NavStatusDto>(`${environment.apiBase}/api/nav/status`));
      if (status?.latestNavDate) this._latestNavDate.set(status.latestNavDate);
    } catch {
      /* keep last value */
    }
  }

  private async fetchIsins(isins: string[]): Promise<void> {
    const unique = Array.from(new Set(isins));
    if (!unique.length) return;
    this._loading.set(true);
    try {
      for (let i = 0; i < unique.length; i += CHUNK) {
        const chunk = unique.slice(i, i + CHUNK);
        chunk.forEach((c) => this.attempted.add(c));
        try {
          const rows = await firstValueFrom(
            this.http.get<NavDto[]>(`${environment.apiBase}/api/nav/latest`, { params: { isins: chunk.join(',') } }),
          );
          this.merge(chunk, rows ?? []);
        } catch {
          /* swallow: keep last values, retry on next refresh */
        }
      }
    } finally {
      this._loading.set(false);
    }
  }

  private merge(requested: string[], rows: NavDto[]): void {
    if (!rows.length) return;
    const wanted = new Set(requested);
    const next = { ...this._navs() };
    let newest = this._latestNavDate();
    for (const r of rows) {
      if (typeof r.nav !== 'number' || !(r.nav > 0) || !r.navDate) continue;
      for (const isin of [r.isin, r.isinReinvestment]) {
        if (isin && wanted.has(isin)) next[isin] = { nav: r.nav, navDate: r.navDate };
      }
      if (!newest || r.navDate > newest) newest = r.navDate;
    }
    this._navs.set(next);
    this._latestNavDate.set(newest);
  }
}
