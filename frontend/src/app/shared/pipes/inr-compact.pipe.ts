import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'inrCompact', standalone: true })
export class InrCompactPipe implements PipeTransform {
  transform(value: number | null | undefined, decimals = 2): string {
    if (value === null || value === undefined || isNaN(value)) return '-';
    const abs = Math.abs(value);
    const sign = value < 0 ? '-' : '';
    if (abs >= 1_00_00_000) return `${sign}₹${(abs / 1_00_00_000).toFixed(decimals)} Cr`;
    if (abs >= 1_00_000) return `${sign}₹${(abs / 1_00_000).toFixed(decimals)} L`;
    if (abs >= 1_000) return `${sign}₹${(abs / 1_000).toFixed(decimals)} K`;
    return `${sign}₹${abs.toFixed(decimals)}`;
  }
}
