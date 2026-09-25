// Local development — the Spring Boot auth-service running on your machine.
export const environment = {
  production: false,
  apiBase: 'http://localhost:8081',
  /** Tenant slug used when the address has no sub-domain and no ?tenant= parameter. */
  defaultTenant: 'demo',
};
