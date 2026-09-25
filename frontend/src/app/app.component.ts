import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TenantService } from './core/services/tenant.service';
import { PortalUnavailableComponent } from './features/shared-pages/portal-unavailable.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PortalUnavailableComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'wealthos-app';
  readonly tenant = inject(TenantService);
}
