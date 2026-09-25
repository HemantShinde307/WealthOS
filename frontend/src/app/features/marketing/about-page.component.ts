import { Component, inject } from '@angular/core';
import { TenantService } from '../../core/services/tenant.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './about-page.component.html',
})
export class AboutPageComponent {
  readonly tenant = inject(TenantService);
}
