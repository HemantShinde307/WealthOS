import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Holding } from '../models/domain.models';

/** Baseline (statement / purchase) values only — live NAV overlay and P/L are derived in the browser. */
export interface HoldingDto {
  schemeId: string;
  schemeName: string;
  isin: string | null;
  category: string;
  units: number;
  avgCost: number;
  currentNav: number;
  currentValue: number;
  investedValue: number;
}

const URL = `${environment.apiBase}/api/portfolio/holdings`;

export function holdingToDto(h: Holding): HoldingDto {
  return {
    schemeId: h.schemeId,
    schemeName: h.schemeName,
    isin: h.isin ?? null,
    category: h.category,
    units: h.units,
    avgCost: h.avgCost,
    currentNav: h.currentNav,
    currentValue: h.currentValue,
    investedValue: h.investedValue,
  };
}

/** Derives unrealizedPl / unrealizedPlPct exactly like PortfolioService.importHoldings. */
export function dtoToHolding(d: HoldingDto): Holding {
  const unrealizedPl = d.currentValue - d.investedValue;
  const unrealizedPlPct = d.investedValue > 0 ? Number(((unrealizedPl / d.investedValue) * 100).toFixed(2)) : 0;
  const { isin, ...rest } = d;
  return { ...rest, ...(isin ? { isin } : {}), unrealizedPl, unrealizedPlPct };
}

@Injectable({ providedIn: 'root' })
export class HoldingsApiService {
  private readonly http = inject(HttpClient);

  load(): Promise<HoldingDto[]> {
    return firstValueFrom(this.http.get<HoldingDto[]>(URL));
  }

  save(holdings: Holding[]): Promise<HoldingDto[]> {
    return firstValueFrom(this.http.put<HoldingDto[]>(URL, { holdings: holdings.map(holdingToDto) }));
  }

  clear(): Promise<void> {
    return firstValueFrom(this.http.delete<void>(URL));
  }
}
