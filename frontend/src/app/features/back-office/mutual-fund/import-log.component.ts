import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MutualFundService } from './mutual-fund.service';

@Component({
  selector: 'app-mf-import-log',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './import-log.component.html',
})
export class ImportLogComponent {
  readonly mfService = inject(MutualFundService);
}
