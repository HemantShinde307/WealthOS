import { Injectable, signal } from '@angular/core';
import { Scheme } from '../models/domain.models';
import { MOCK_SCHEMES } from '../mock-data';

@Injectable({ providedIn: 'root' })
export class SchemeService {
  private readonly _schemes = signal<Scheme[]>(MOCK_SCHEMES);
  readonly schemes = this._schemes.asReadonly();

  getById(id: string): Scheme | undefined {
    return this._schemes().find((s) => s.id === id);
  }

  byAssetClass(assetClass: Scheme['assetClass']): Scheme[] {
    return this._schemes().filter((s) => s.assetClass === assetClass);
  }
}
