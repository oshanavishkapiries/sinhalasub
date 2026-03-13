# Authentication API Refactor — Implementation Plan

## 1) Scope and Goals

Refactor authentication APIs to support:

- Cookie-based auth flow (HTTP-only, Secure cookies for access/refresh tokens)
- Account verification on signup via email code
- Password reset with verification code
- Role-aware users (`admin`, `moderator`, `platform-user`)
- Reliable PostgreSQL schema + seed data for initial admin user

## 2) Current-State Findings (from codebase)

- Existing endpoints in `internal/handler/auth.go`:
  - `POST /api/auth/signup`
  - `POST /api/auth/login`
  - `POST /api/auth/refresh`
  - `POST /api/auth/logout`
  - `GET /api/auth/me`
- Tokens are currently JSON response fields, not cookie-first.
- `GET /api/auth/me` still depends on `Authorization: Bearer` pattern.
- No handlers yet for:
  - `POST /api/auth/verify`
  - `POST /api/auth/foreget-password` (typo should be normalized to `/forgot-password`)
- `docs/database/schema.sql` is currently empty.
- Role defaults in service are not aligned with requested roles (`platform-user`).

## 3) Target API Behavior (Refactor Contract)

### `POST /api/auth/signup`

Input: `username`, `email`, `password`  
Behavior:
- Create user with role `platform-user`
- Create email verification code
- Send verification code to user email
- Return success message (no auto-login until verified)

### `POST /api/auth/verify`

Input: `email`, `verification_code`  
Behavior:
- Validate code (not expired, not already used)
- Mark user as verified/active
- Optionally issue login cookies immediately (team decision)

### `POST /api/auth/login`

Input: `email`, `password`  
Behavior:
- Authenticate only verified + active users
- Issue `access_token` and `refresh_token` as secure HTTP-only cookies
- Return user profile payload (without tokens in response body)

### `POST /api/auth/refresh`

Input: none (read refresh token cookie)  
Behavior:
- Validate refresh token/session
- Rotate refresh token (recommended)
- Re-issue access token cookie (+ refresh cookie if rotated)

### `POST /api/auth/logout`

Input: none  
Behavior:
- Invalidate server-side refresh session/token
- Clear both auth cookies from backend response (`Set-Cookie` with expiry in past)

### `GET /api/auth/me`

Input: none (read access token cookie)  
Behavior:
- Validate access token from cookie
- Return current authenticated user

### `POST /api/auth/forgot-password`

Input: `email`, `new_password`, `verification_code`  
Behavior:
- Validate reset code and expiry
- Update password hash
- Invalidate active refresh sessions

## 4) Database Design Plan (PostgreSQL)

Implement schema in `docs/database/schema.sql` with the following objects.

### 4.1 Enums

- `user_role`: `admin`, `moderator`, `platform-user`
- `verification_type`: `signup`, `password_reset`

### 4.2 Tables

1. `users`
   - `id` UUID PK
   - `username` VARCHAR UNIQUE NOT NULL
   - `email` CITEXT UNIQUE NOT NULL
   - `password_hash` TEXT NOT NULL
   - `role` user_role NOT NULL DEFAULT `platform-user`
   - `is_verified` BOOLEAN NOT NULL DEFAULT FALSE
   - `is_active` BOOLEAN NOT NULL DEFAULT TRUE
   - `last_login_at` TIMESTAMPTZ NULL
   - `created_at`, `updated_at`, `deleted_at`

2. `verification_codes`
   - `id` UUID PK
   - `user_id` FK -> users(id)
   - `type` verification_type NOT NULL
   - `code_hash` TEXT NOT NULL
   - `expires_at` TIMESTAMPTZ NOT NULL
   - `used_at` TIMESTAMPTZ NULL
   - `created_at`
   - Indexes: `(user_id, type)`, `(expires_at)`, partial unique for active unused code per type

3. `refresh_sessions`
   - `id` UUID PK
   - `user_id` FK -> users(id)
   - `token_hash` TEXT NOT NULL UNIQUE
   - `user_agent`, `ip_address`
   - `expires_at` TIMESTAMPTZ NOT NULL
   - `revoked_at` TIMESTAMPTZ NULL
   - `created_at`, `updated_at`
   - Indexes: `(user_id)`, `(expires_at)`, `(revoked_at)`

## 5) Seed Plan

Create seed SQL file (recommended: `docs/database/seed.sql`) to always create the bootstrap admin on DB init:

- Email: `admin@sinhalasub.lk`
- Password: `admin@1234` (store as bcrypt hash only)
- Role: `admin`
- Verified: `true`
- Active: `true`

Implementation notes:
- Use idempotent insert (`INSERT ... ON CONFLICT (email) DO UPDATE/NOTHING`)
- Do not store plain passwords anywhere in repository
- Prefer deterministic admin username, e.g. `system-admin`

## 6) Backend Refactor Plan (Code Areas)

1. **Model updates**
   - Update `internal/domain/models/models.go` for `Username`, `IsVerified`, role constraints.

2. **Repository updates**
   - Extend `internal/repository/postgres_user.go` queries for new columns.
   - Add repository methods for verification codes and refresh sessions.

3. **Service layer updates**
   - Refactor `internal/service/auth.go`:
     - signup -> create user + verification code + send email
     - verify -> consume code + activate/verify
     - login -> create cookie tokens + persist refresh session
     - refresh -> validate + rotate session
     - logout -> revoke session + clear cookies
     - forgot-password -> validate reset code + update password

4. **Handler updates**
   - Update `internal/handler/auth.go` for cookie-based auth and new endpoints.
   - Replace token-in-body flows with cookie setting/clearing.
   - Normalize route naming to `/forgot-password`.

5. **Middleware updates**
   - Update JWT middleware to support cookie token extraction (fallback to header optional).

6. **Routing + docs**
   - Add `verify` and `forgot-password` routes in `internal/app/routes.go`.
   - Update Swagger docs accordingly.

## 7) Security and Validation Rules

- Hash all passwords and verification codes with strong one-way hashing.
- Enforce short TTL for verification/reset codes (e.g., 10–15 mins).
- Rate-limit login, verify, and forgot-password endpoints.
- Uniform auth error messages to avoid account enumeration.
- Mark cookies with `HttpOnly`, `Secure`, `SameSite`, explicit `Path`, and expiry.
- Revoke all refresh sessions after password reset.

## 8) Delivery Phases

### Phase 1: DB Foundation
- Implement `schema.sql` tables/enums/indexes
- Add `seed.sql` with idempotent admin bootstrap

### Phase 2: Auth Core Refactor
- Update repository + service + handler for cookie/session architecture
- Add verify/forgot-password APIs

### Phase 3: Hardening & Docs
- Add validation + rate limit coverage
- Update Swagger and manual test checklist

## 9) Acceptance Criteria

- All required auth endpoints exist and match requested behavior.
- `logout` removes both auth cookies from backend response.
- `me` works using cookie auth.
- Signup creates `platform-user` and sends verification code.
- Verify endpoint activates account using valid code.
- Forgot-password updates password via valid code.
- `schema.sql` and seed file initialize DB with admin user idempotently.

## 10) Open Items / Clarifications

1. Cookie names to standardize (`access_token` / `refresh_token` assumed).
2. Exact verification code format (6-digit numeric assumed) and expiry minutes.
3. Email provider integration to use for sending verification/reset codes.
4. Confirm route spelling: keep backward compatibility for `/foreget-password` or migrate fully to `/forgot-password`.

## 11) Environment Note

Attempted PostgreSQL MCP inspection for `sinhalasub-dev`, but current MCP connection failed with password authentication for user `_root`.  
Plan proceeds from repository analysis; DB credential alignment is needed before direct DB introspection.
