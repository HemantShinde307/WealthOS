# WealthOS

A fintech wealth-management platform.

- **`frontend/`** — Angular 18 app (investor, advisor, admin, institutional and family-office portals + back office). Runs locally on port 4300. Deployed automatically to GitHub Pages on every push to `main` (see `.github/workflows/deploy-pages.yml`) — but only the marketing pages work there, since GitHub Pages can't host the backend below.
- **`backend/`** — Spring Boot 4 + MySQL auth service (`wealthos_auth` database). Runs locally on port 8081. For a fully working deployment, this needs a real host with a database (e.g. Railway) — see `backend/Dockerfile`.

## Local development

```bash
cd backend && ./mvnw spring-boot:run   # needs a local MySQL with database "wealthos_auth"
cd frontend && npm install && npm start
```
