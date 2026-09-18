import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NriDataService } from '../nri-data.service';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { InrCompactPipe } from '../../../shared/pipes/inr-compact.pipe';

@Component({
  selector: 'app-nri-hub',
  standalone: true,
  imports: [CommonModule, RouterLink, StatCardComponent, InrCompactPipe],
  templateUrl: './nri-hub.component.html',
})
export class NriHubComponent {
  readonly nri = inject(NriDataService);
}
