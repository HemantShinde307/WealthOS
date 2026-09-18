import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CasImportStateService } from './cas-import-state.service';

@Component({
  selector: 'app-cas-mapping-verification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mapping-verification.component.html',
})
export class MappingVerificationComponent {
  readonly state = inject(CasImportStateService);
  private readonly router = inject(Router);

  readonly selectedCount = computed(() => this.state.folios().filter((f) => f.selected).length);
  readonly selectedValue = computed(() => this.state.folios().filter((f) => f.selected).reduce((sum, f) => sum + f.currentValue, 0));

  confirm(): void {
    this.router.navigate(['/cas-import/success-summary']);
  }
}
