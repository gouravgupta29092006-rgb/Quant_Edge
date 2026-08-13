# QuantEdge - Security Policy

> Last reviewed: 2026-08-13

---

## Reporting a Vulnerability

If you discover a security vulnerability in QuantEdge, please report it responsibly:

1. **Do NOT** open a public GitHub issue for security vulnerabilities
2. Email: security@quantedge.app (or open a private GitHub Security Advisory)
3. Include: description, reproduction steps, impact assessment
4. We aim to acknowledge within 48 hours and resolve within 14 days

---

## Security Architecture

### Authentication

| Mechanism | Details |
|-----------|---------|
| Algorithm | JWT signed with HS512 (HMAC-SHA-512) |
| Access token lifetime | 15 minutes |
| Refresh token lifetime | 30 days |
| Access token storage | **In-memory only** (module-scoped variable, not localStorage) |
| Refresh token storage | localStorage (survives page reload, used to re-issue access tokens) |
| Password hashing | BCrypt with cost factor 12 |
| Brute force protection | Account lock after 5 failed logins (15-minute lockout) |

### Access Token Security (XSS Mitigation)

The access token (JWT) is stored **only in memory** (a module-level variable in `api.ts`).
It is NOT stored in `localStorage` or `sessionStorage`, which are accessible to any JavaScript
running on the page (including XSS payloads).

On page refresh, the refresh token (in localStorage) is used to silently re-issue a new access token.

**Why not httpOnly cookies?**
The backend is on a different origin (:8080) from the frontend (:3000) in local dev.
In production behind a reverse proxy on the same origin, httpOnly cookies are preferred.

### Authorization

| Layer | Mechanism |
|-------|-----------|
| Route level | Spring Security `authorizeHttpRequests()` rules |
| Method level | `@PreAuthorize("hasRole('ADMIN')")` via `@EnableMethodSecurity` |
| Resource ownership | Service layer verifies `userId` matches token subject |

### Input Validation

- All request bodies validated via Jakarta Validation (`@NotBlank`, `@Email`, `@Size`, `@Pattern`)
- Parameterized queries only - no string-concatenated SQL (Spring Data JPA)
- `fail-on-unknown-properties: false` prevents mass-assignment attacks
- Request body size limited to prevent DoS

### CORS

| Setting | Value |
|---------|-------|
| Allowed origins | Configurable via `CORS_ALLOWED_ORIGINS` env var (default: `http://localhost:3000`) |
| Allowed methods | GET, POST, PUT, PATCH, DELETE, OPTIONS |
| Credentials | `true` (required for cookie-based refresh in production) |
| Max age | 86400s (24h preflight cache) |

### Actuator Endpoints

| Endpoint | Access |
|----------|--------|
| `/actuator/health` | Public (no data exposed) |
| `/actuator/**` (all others) | ADMIN role required |

### Error Handling

- Generic error messages returned to clients (no stack traces, no internal details)
- Full details logged server-side only
- 401 vs 403 distinguished correctly (not revealing "user exists" info)

---

## Known Security Trade-offs

### 1. Refresh Token in localStorage

**Risk:** XSS attacker could steal the refresh token from localStorage.

**Mitigation:**
- Access token is in memory (15min TTL) - not accessible via XSS
- Refresh token rotation: each refresh issues a new refresh token and invalidates the old one
- In production, move to httpOnly SameSite=Strict cookies on same-origin deployment

**Status:** Accepted risk for portfolio project. Documented for production remediation.

### 2. Swagger UI Publicly Accessible

**Risk:** API schema is visible to anyone (authentication endpoints, request formats).

**Mitigation:**
- Swagger exposes schema only - not data. No auth bypass is possible from reading docs.
- All endpoints still require valid JWT to return data.
- Can be disabled in production via Spring profile configuration.

**Status:** Accepted for portfolio showcase purposes.

### 3. No Rate Limiting on Registration

**Risk:** Account creation spam.

**Mitigation:**
- Database unique constraint on email prevents duplicate accounts
- BCrypt hashing makes bulk creation CPU-expensive
- Email verification required before full account access

**Status:** Planned improvement - add rate limiting middleware.

---

## Security Checklist

### Backend
- [x] JWT HS512 with configurable secret (no hardcoded keys in source)
- [x] BCrypt rounds = 12
- [x] Brute force protection (5 attempts, 15-min lock)
- [x] All endpoints require authentication except whitelist
- [x] Actuator metrics/info require ADMIN role
- [x] CORS restricted to configured origins
- [x] Stateless sessions (no server-side session state)
- [x] CSRF disabled (correct for stateless JWT APIs)
- [x] Parameterized queries (Spring Data JPA / Hibernate)
- [x] Input validation on all request DTOs
- [x] Generic error messages (no information leakage)
- [x] Resource ownership verification in service layer
- [ ] Rate limiting on auth endpoints (planned)
- [ ] httpOnly cookie refresh tokens (planned for production)
- [ ] Security headers middleware (X-Frame-Options, HSTS, CSP)

### Frontend
- [x] Access token stored in memory only (not localStorage)
- [x] Automatic token refresh on 401 responses
- [x] All API calls go through authenticated Axios instance
- [x] No secrets or API keys in frontend bundle
- [x] NEXT_PUBLIC_ vars contain only non-sensitive URLs
- [ ] Content Security Policy headers (planned)
- [ ] Subresource Integrity for CDN assets (planned)

### Infrastructure
- [x] Database credentials in environment variables only
- [x] .env excluded from git via .gitignore
- [x] .env.example committed (no real credentials)
- [x] start.bat excluded from git
- [x] SSL/TLS for database connection (sslmode=require)
- [ ] HTTPS enforced in production (handled by reverse proxy)
- [ ] Secrets management via environment/vault (not hardcoded)

---

## Security Fixes Log

| Date | Issue | Severity | Fix |
|------|-------|----------|-----|
| 2026-08-13 | Access token stored in localStorage | Medium | Moved to in-memory module variable |
| 2026-08-13 | Registration form field mismatch | High | Aligned frontend fields with backend DTO (firstName/lastName) |
| 2026-08-13 | Actuator metrics exposed publicly | Medium | Restricted to ADMIN role only |
| 2026-08-13 | start.bat had hardcoded DB password | High | Removed credentials, load from .env |
| 2026-08-13 | start.bat not in .gitignore | Medium | Added to .gitignore |
| 2026-08-06 | Strategy JSON fields caused ClassCastException | Medium | Fixed Map type + HashMap init |
| 2026-08-06 | Lazy-loaded entities serialized in API response | Low | Added @JsonIgnore on all back-references |

---

## Dependencies & CVE Monitoring

This project uses:
- **Spring Boot 3.3** - Spring Security 6.x (actively maintained)
- **Next.js 14** - Patched regularly by Vercel
- **Neon.tech PostgreSQL 18** - Managed cloud service

To check for known CVEs:
```bash
# Backend
mvn org.owasp:dependency-check-maven:check

# Frontend
npm audit
npm audit fix
```