import { Component, inject } from '@angular/core';
import { TenantService } from '../../core/services/tenant.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-career-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './career-page.component.html',
})
export class CareerPageComponent {
  readonly tenant = inject(TenantService);

  readonly openRoles = [
    { title: 'Senior Frontend Engineer', team: 'Product Engineering', location: 'Remote / Mumbai' },
    { title: 'Backend Engineer — Spring Boot', team: 'Platform Engineering', location: 'Remote / Bengaluru' },
    { title: 'Compliance Analyst', team: 'Risk & Compliance', location: 'Mumbai' },
    { title: 'Client Success Manager', team: 'Advisory', location: 'Remote' },
  ];
}
