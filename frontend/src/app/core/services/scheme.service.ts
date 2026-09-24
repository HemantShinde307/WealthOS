import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Scheme } from '../models/domain.models';
import { MOCK_SCHEMES } from '../mock-data';
import { NavService } from './nav.service';

@Injectable({ providedIn: 'root' })
export class SchemeService {
  private readonly navService = inject(NavService);
  private readonly _base = signal<Scheme[]>(MOCK_SCHEMES);

  /** Catalogue with live AMFI NAV/date overlaid on schemes that have an ISIN (mock value is the fallback). */
  readonly schemes = computed<Scheme[]>(() => {
    const navs = this.navService.navsByIsin();
    return this._base().map((s) => {
      const live = s.isin ? navs[s.isin] : undefined;
      return live ? { ...s, nav: live.nav, navDate: live.navDate } : s;
    });
  });

  constructor() {
    effect(() => this.navService.watch('schemes', this._base().map((s) => s.isin)), { allowSignalWrites: true });
  }

  getById(id: string): Scheme | undefined {
    return this.schemes().find((s) => s.id === id);
  }

  byAssetClass(assetClass: Scheme['assetClass']): Scheme[] {
    return this.schemes().filter((s) => s.assetClass === assetClass);
  }
}
