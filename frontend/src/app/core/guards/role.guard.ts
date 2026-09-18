import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, UserRole } from '../services/auth.service';

/**
 * Restricts a route to specific roles. Requires authentication first (same as authGuard), then
 * checks the logged-in user's role against the allow-list — anyone else is sent to a clear
 * "Access Denied" page instead of silently landing on a broken or empty screen.
 */
export function roleGuard(allowedRoles: UserRole[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (!auth.isAuthenticated()) return router.createUrlTree(['/login']);
    if (allowedRoles.includes(auth.currentUser().role)) return true;
    return router.createUrlTree(['/access-denied']);
  };
}
