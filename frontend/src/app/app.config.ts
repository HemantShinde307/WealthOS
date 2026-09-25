import { APP_INITIALIZER, ApplicationConfig, inject, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { authInterceptor } from './core/interceptors/auth.interceptor';
import { routes } from './app.routes';
import { TenantService } from './core/services/tenant.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    // Loads the tenant's branding before the first render so there is no flash of the default theme.
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => {
        const tenant = inject(TenantService);
        return () => tenant.load();
      },
    },
  ],
};
