import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MutualFundService } from './mutual-fund.service';

@Component({
  selector: 'app-mf-folio-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './folio-detail.component.html',
})
export class FolioDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly mfService = inject(MutualFundService);

  readonly folioId = this.route.snapshot.paramMap.get('id')!;
  readonly folio = computed(() => this.mfService.getFolio(this.folioId));
  readonly transactions = computed(() => this.mfService.folioTransactions(this.folioId));
  readonly mandates = computed(() => this.mfService.folioMandates(this.folioId));
  readonly currentValue = computed(() => {
    const f = this.folio();
    return f ? f.units * f.currentNav : 0;
  });
  readonly gainLoss = computed(() => {
    const f = this.folio();
    return f ? (f.currentNav - f.avgNav) * f.units : 0;
  });

  goBack(): void {
    this.router.navigate(['/back-office/customer-investments/mutual-fund/folio']);
  }
}
