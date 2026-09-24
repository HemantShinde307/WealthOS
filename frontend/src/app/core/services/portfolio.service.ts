import { Injectable, inject, signal, computed, effect, untracked } from '@angular/core';
import { HoldingsApiService, holdingToDto, dtoToHolding } from './holdings-api.service';
import { Holding, NavPoint } from '../models/domain.models';
import { CasParsedRow } from './cas-parser.service';
import { AuthService } from './auth.service';
import { NavService } from './nav.service';
import { SchemeService } from './scheme.service';

const CATEGORY_KEYWORDS: Array<[RegExp, string]> = [
  [/small cap/i, 'Small Cap'],
  [/mid ?cap/i, 'Mid Cap'],
  [/large *&? *mid ?cap/i, 'Large & Mid Cap'],
  [/large cap/i, 'Large Cap'],
  [/flexi ?cap/i, 'Flexi Cap'],
  [/multi ?cap/i, 'Multi Cap'],
  [/multi ?asset/i, 'Multi Asset Allocation'],
  [/dividend yield/i, 'Dividend Yield'],
  [/elss|tax saver/i, 'ELSS'],
  [/liquid/i, 'Liquid'],
  [/debt|bond|income/i, 'Debt'],
  [/balanced|hybrid|advantage/i, 'Hybrid'],
];

function guessCategory(schemeName: string): string {
  const match = CATEGORY_KEYWORDS.find(([re]) => re.test(schemeName));
  return match ? match[1] : 'Thematic / Sectoral';
}

function assetClassForCategory(category: string): 'Equity' | 'Debt' | 'Hybrid' {
  if (/debt|liquid/i.test(category)) return 'Debt';
  if (/hybrid|multi asset/i.test(category)) return 'Hybrid';
  return 'Equity';
}

function slugify(text: string): string {
  return text
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 24);
}

function buildGrowthSeries(): NavPoint[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const portfolio = [37.5, 38.2, 39.1, 40.6, 41.0, 42.3, 43.8, 44.2, 45.1, 46.0, 46.8, 47.5];
  const benchmark = [35.0, 35.6, 36.2, 37.0, 37.4, 38.5, 39.6, 40.1, 40.8, 41.5, 42.0, 42.6];
  return months.map((date, i) => ({ date, value: portfolio[i], benchmark: benchmark[i] }));
}

const ALLOCATION_COLORS: Record<'Equity' | 'Debt' | 'Hybrid', string> = {
  Equity: '--color-primary-container',
  Debt: '--color-secondary',
  Hybrid: '--color-tertiary-fixed-dim',
};

@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private readonly auth = inject(AuthService);

  // Holdings are kept per customerId so each logged-in customer only ever sees their own
  // portfolio — no seed data here either; a real account starts empty and only populates
  // via CAS import (see CasImportStateService / importHoldings) or an actual purchase
  // (recordPurchase).
  //
  // `_byCustomer` is the BASELINE (statement / purchase values, never touched by live NAVs).
  // `holdings` derives from it, overlaying live AMFI NAVs for holdings with a known ISIN, so
  // updates never compound and everything downstream picks changes up automatically.
  private readonly navService = inject(NavService);
  private readonly schemeService = inject(SchemeService);
  private readonly _byCustomer = signal<Record<string, Holding[]>>({});
  private readonly customerId = computed(() => this.auth.currentUser().customerId ?? 'GUEST');
  private readonly baselineHoldings = computed(() => this._byCustomer()[this.customerId()] ?? []);
  private readonly isinByName = computed(() => {
    const map = new Map<string, string>();
    for (const s of this.schemeService.schemes()) if (s.isin) map.set(s.name, s.isin);
    return map;
  });

  readonly holdings = computed<Holding[]>(() => {
    const navs = this.navService.navsByIsin();
    const byName = this.isinByName();
    return this.baselineHoldings().map((h) => {
      const isin = h.isin ?? byName.get(h.schemeName);
      const live = isin ? navs[isin] : undefined;
      if (!live) return isin && !h.isin ? { ...h, isin } : h;
      const currentValue = Math.round(h.units * live.nav);
      const unrealizedPl = currentValue - h.investedValue;
      const unrealizedPlPct = h.investedValue > 0 ? Number(((unrealizedPl / h.investedValue) * 100).toFixed(2)) : 0;
      return { ...h, isin, currentNav: live.nav, currentValue, unrealizedPl, unrealizedPlPct };
    });
  });
  readonly growthSeries = buildGrowthSeries();

  // ---- Server persistence (investor only) ----
  private readonly holdingsApi = inject(HoldingsApiService);
  /** customerId of a signed-in investor with a token; null otherwise (API is never touched then). */
  private readonly sessionId = computed(() => {
    const u = this.auth.currentUser();
    return this.auth.isAuthenticated() && u.role === 'investor' && !!u.token && u.customerId ? u.customerId : null;
  });
  private readonly loadedIds = signal<Record<string, boolean>>({});
  /** True while a signed-in investor's stored holdings have not finished their first load. */
  readonly loading = computed(() => {
    const id = this.sessionId();
    return !!id && !this.loadedIds()[id];
  });
  private readonly loadingIds = new Set<string>();
  private readonly dirtyBeforeLoad = new Set<string>();
  private readonly lastSaved = new Map<string, string>();
  private readonly saveTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private saveChain: Promise<void> = Promise.resolve();
  private activeId: string | null = null;

  constructor() {
    effect(() => this.navService.watch('holdings', this.holdings().map((h) => h.isin)), { allowSignalWrites: true });

    // Load once per login / customer change; reset everything when the session ends or switches.
    effect(
      () => {
        const id = this.sessionId();
        untracked(() => {
          if (this.activeId && this.activeId !== id) this.endSession(this.activeId);
          this.activeId = id;
          if (id && !this.loadedIds()[id] && !this.loadingIds.has(id)) void this.loadFor(id);
        });
      },
      { allowSignalWrites: true },
    );

    // Debounced full-set save after every baseline change, once loaded.
    effect(() => {
      const id = this.sessionId();
      const list = this.baselineHoldings();
      const loaded = id ? this.loadedIds()[id] : false;
      if (!id || !loaded) return;
      untracked(() => this.scheduleSave(id, list));
    });
  }

  private endSession(id: string): void {
    clearTimeout(this.saveTimers.get(id));
    this.saveTimers.delete(id);
    this.dirtyBeforeLoad.delete(id);
    this.lastSaved.delete(id);
    this.loadingIds.delete(id);
    this._byCustomer.update((map) => {
      const { [id]: _drop, ...rest } = map;
      return rest;
    });
    this.loadedIds.update((m) => {
      const { [id]: _drop, ...rest } = m;
      return rest;
    });
  }

  private async loadFor(id: string): Promise<void> {
    this.loadingIds.add(id);
    try {
      const dtos = await this.holdingsApi.load();
      if (this.sessionId() !== id || !this.loadingIds.has(id)) return; // session changed meanwhile
      if (this.dirtyBeforeLoad.has(id)) {
        // Changed before the load returned: the user's version wins and gets saved.
        this.dirtyBeforeLoad.delete(id);
      } else {
        const loaded = dtos.map(dtoToHolding);
        this._byCustomer.update((map) => ({ ...map, [id]: loaded }));
        this.lastSaved.set(id, JSON.stringify(loaded.map(holdingToDto)));
      }
      this.loadedIds.update((m) => ({ ...m, [id]: true }));
    } catch {
      // Silent; the next baseline change retries the load (see markChanged).
    } finally {
      this.loadingIds.delete(id);
    }
  }

  /** Called by every baseline writer with the customerId captured at the time of the change. */
  private markChanged(id: string): void {
    if (this.sessionId() !== id || this.loadedIds()[id]) return;
    this.dirtyBeforeLoad.add(id);
    if (!this.loadingIds.has(id)) void this.loadFor(id); // previous load failed: retry
  }

  private scheduleSave(id: string, list: Holding[]): void {
    clearTimeout(this.saveTimers.get(id));
    this.saveTimers.delete(id);
    const snapshot = JSON.stringify(list.map(holdingToDto));
    if (this.lastSaved.get(id) === snapshot) return;
    this.saveTimers.set(
      id,
      setTimeout(() => {
        this.saveTimers.delete(id);
        if (this.sessionId() !== id) return; // never save under another user's session
        this.saveChain = this.saveChain.then(async () => {
          if (this.sessionId() !== id) return;
          try {
            await this.holdingsApi.save(list);
            this.lastSaved.set(id, snapshot);
          } catch {
            // Silent; lastSaved unchanged so the next change retries.
          }
        });
      }, 800),
    );
  }

  readonly currentValue = computed(() => this.holdings().reduce((sum, h) => sum + h.currentValue, 0));
  readonly investedValue = computed(() => this.holdings().reduce((sum, h) => sum + h.investedValue, 0));
  readonly unrealizedPl = computed(() => this.currentValue() - this.investedValue());
  readonly absoluteReturnPct = computed(() => {
    const invested = this.investedValue();
    return invested > 0 ? Number(((this.unrealizedPl() / invested) * 100).toFixed(2)) : 0;
  });

  /** Derived from actual holdings, not a fixed guess — empty when there are no holdings yet. */
  readonly assetAllocation = computed(() => {
    const holdings = this.holdings();
    const total = this.currentValue();
    if (total <= 0) return [];
    const buckets: Record<'Equity' | 'Debt' | 'Hybrid', number> = { Equity: 0, Debt: 0, Hybrid: 0 };
    for (const h of holdings) {
      buckets[assetClassForCategory(h.category)] += h.currentValue;
    }
    return (Object.keys(buckets) as Array<'Equity' | 'Debt' | 'Hybrid'>)
      .filter((k) => buckets[k] > 0)
      .map((k) => ({ label: k, pct: Math.round((buckets[k] / total) * 100), colorVar: ALLOCATION_COLORS[k] }));
  });

  // Approximate — a precise XIRR requires every historical cash-flow date/amount, which isn't
  // fully modeled for arbitrary user-entered purchases/imports in this prototype.
  readonly xirr = 11.8;

  private updateHoldings(updater: (list: Holding[]) => Holding[]): void {
    const id = this.customerId();
    this._byCustomer.update((map) => ({ ...map, [id]: updater(map[id] ?? []) }));
    this.markChanged(id);
  }

  /**
   * Replaces the portfolio with holdings imported from a CAS statement, aggregating
   * folio-level rows into one holding per scheme (matching how the rest of the app —
   * and most portfolio trackers — present consolidated holdings across folios).
   */
  importHoldings(rows: CasParsedRow[]): void {
    const bySchemeName = new Map<string, { schemeName: string; isin?: string; units: number; investedValue: number; currentValue: number }>();
    for (const row of rows) {
      const existing = bySchemeName.get(row.schemeName);
      if (existing) {
        existing.isin ??= row.isin;
        existing.units += row.units;
        existing.investedValue += row.investedValue;
        existing.currentValue += row.currentValue;
      } else {
        bySchemeName.set(row.schemeName, { schemeName: row.schemeName, isin: row.isin, units: row.units, investedValue: row.investedValue, currentValue: row.currentValue });
      }
    }

    const holdings: Holding[] = Array.from(bySchemeName.values()).map((agg) => {
      const currentNav = agg.units > 0 ? agg.currentValue / agg.units : 0;
      const avgCost = agg.units > 0 ? agg.investedValue / agg.units : 0;
      const currentValue = Math.round(agg.currentValue);
      const investedValue = Math.round(agg.investedValue);
      const unrealizedPl = currentValue - investedValue;
      const unrealizedPlPct = investedValue > 0 ? Number(((unrealizedPl / investedValue) * 100).toFixed(2)) : 0;
      return {
        schemeId: slugify(agg.schemeName),
        isin: agg.isin,
        schemeName: agg.schemeName,
        category: guessCategory(agg.schemeName),
        units: Number(agg.units.toFixed(3)),
        avgCost: Number(avgCost.toFixed(4)),
        currentNav: Number(currentNav.toFixed(4)),
        currentValue,
        investedValue,
        unrealizedPl,
        unrealizedPlPct,
      };
    });

    const id = this.customerId();
    this._byCustomer.update((map) => ({ ...map, [id]: holdings }));
    this.markChanged(id);
  }

  /** Adds to an existing holding (by scheme name) or creates a new one, from a real purchase/SIP. */
  recordPurchase(schemeName: string, category: string, units: number, amount: number, nav: number): void {
    this.updateHoldings((list) => {
      const idx = list.findIndex((h) => h.schemeName === schemeName);
      if (idx === -1) {
        const investedValue = Math.round(amount);
        const currentValue = Math.round(units * nav);
        return [
          ...list,
          {
            schemeId: slugify(schemeName),
            schemeName,
            category,
            units: Number(units.toFixed(3)),
            avgCost: nav,
            currentNav: nav,
            currentValue,
            investedValue,
            unrealizedPl: currentValue - investedValue,
            unrealizedPlPct: investedValue > 0 ? Number((((currentValue - investedValue) / investedValue) * 100).toFixed(2)) : 0,
          },
        ];
      }
      const existing = list[idx];
      const newUnits = existing.units + units;
      const newInvested = existing.investedValue + Math.round(amount);
      const newCurrentValue = Math.round(newUnits * nav);
      const updated: Holding = {
        ...existing,
        units: Number(newUnits.toFixed(3)),
        avgCost: Number((newInvested / newUnits).toFixed(4)),
        currentNav: nav,
        currentValue: newCurrentValue,
        investedValue: newInvested,
        unrealizedPl: newCurrentValue - newInvested,
        unrealizedPlPct: newInvested > 0 ? Number((((newCurrentValue - newInvested) / newInvested) * 100).toFixed(2)) : 0,
      };
      return list.map((h, i) => (i === idx ? updated : h));
    });
  }

  /** Reduces (or removes) a holding by scheme name following a redemption. */
  recordRedemption(schemeName: string, unitsRedeemed: number, amountReceived: number): void {
    this.updateHoldings((list) =>
      list
        .map((h) => {
          if (h.schemeName !== schemeName) return h;
          const remainingUnits = Math.max(h.units - unitsRedeemed, 0);
          const redeemedFraction = h.units > 0 ? Math.min(unitsRedeemed / h.units, 1) : 0;
          const remainingInvested = Math.round(h.investedValue * (1 - redeemedFraction));
          const remainingCurrentValue = Math.max(Math.round(h.currentValue - amountReceived), 0);
          return {
            ...h,
            units: Number(remainingUnits.toFixed(3)),
            investedValue: remainingInvested,
            currentValue: remainingCurrentValue,
            unrealizedPl: remainingCurrentValue - remainingInvested,
            unrealizedPlPct: remainingInvested > 0 ? Number((((remainingCurrentValue - remainingInvested) / remainingInvested) * 100).toFixed(2)) : 0,
          };
        })
        .filter((h) => h.units > 0.001),
    );
  }
}
