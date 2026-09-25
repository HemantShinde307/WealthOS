import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Injector, inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

// Calls that must work without a token: branding lookup, login, signup and platform login.
function isPublicCall(method: string, url: string): boolean {
  const path = url.slice(environment.apiBase.length).split('?')[0];
  if (method === 'GET' && path === '/api/tenant/branding') return true;
  if (method !== 'POST') return false;
  return path === '/api/platform/login' || path === '/api/auth/signup' || /^\/api\/auth\/([a-z-]+\/)?login$/.test(path);
}

/**
 * Adds the bearer token to backend requests only (never to third-party URLs), and signs the user out
 * when the chat API rejects the token (missing / invalid / expired).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiBase) || isPublicCall(req.method, req.url)) return next(req);

  // Resolved lazily: AuthService itself depends on HttpClient-based services.
  const injector = inject(Injector);
  const auth = injector.get(AuthService);
  const token = auth.currentUser().token;
  const outgoing = token && auth.isAuthenticated() ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(outgoing).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && err.status === 401 && req.url.startsWith(`${environment.apiBase}/api/chat`)) {
        auth.logout();
        void injector.get(Router).navigate(['/login']);
      }
      return throwError(() => err);
    }),
  );
};
