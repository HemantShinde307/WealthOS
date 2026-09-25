// Production build (GitHub Pages) — points at the deployed Railway backend.
// REPLACE this URL once Railway gives you the live backend's public URL after first deploy
// (Railway → your service → Settings → Networking → Generate Domain).
export const environment = {
  production: true,
  apiBase: 'https://REPLACE-WITH-YOUR-RAILWAY-BACKEND-URL',
  /** Tenant slug used when the address has no sub-domain and no ?tenant= parameter. */
  defaultTenant: 'demo',
};
