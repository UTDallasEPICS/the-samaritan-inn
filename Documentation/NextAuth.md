# NextAuth Implementation Documentation

## Overview

Authentication uses NextAuth.js with the credentials provider and bcrypt password hashing. Public self-signup is disabled. Admins create all user accounts from inside the web app, and users continue to log in with email and password.

## Core Files

### `src/app/api/auth/[...nextauth]/route.ts`

- Hosts the NextAuth handler.
- Uses the credentials provider.
- Stores `id` and `role` in the JWT/session callbacks.

### `src/lib/auth.ts`

- Provides server-side helpers such as `getCurrentUser`, `requireAuth`, and `requireAdmin`.

### `src/app/login/page.tsx`

- Displays the standard login form.
- Tells users that admins create accounts for them.

### `src/app/signup/page.tsx`

- No longer renders a public registration form.
- Redirects unauthenticated users to `/login`.
- Redirects admins to `/admin-forms`.
- Redirects authenticated non-admins to `/unauthorized`.

### `src/app/api/admin/users/route.ts`

- Admin-only user creation endpoint.
- Returns `401` for unauthenticated requests.
- Returns `403` for authenticated non-admin requests.
- Validates required fields, role, email format, password length, and duplicate emails.
- Hashes passwords with bcrypt before writing to the database.

### `src/lib/user-config.ts`

- Shared user-creation field definitions.
- Allowed roles list.
- Validation and normalization helpers.

### `src/lib/user-management.ts`

- Shared server-side user creation logic.
- Reused by the admin API route and the seed script.

## Authentication Flow

1. An admin creates a user account from the admin page.
2. The password is hashed with bcrypt.
3. The admin shares the credentials manually with the user.
4. The user logs in through `/login`.
5. NextAuth verifies the credentials and issues the session.

## Seeded Admin Account

The seed script creates this local test account:

- `email: admin@test.com`
- `password: TestAdmin123!`

## Notes

- Existing login behavior remains email/password based.
- No third-party verification is required.
- The `User` model now stores `firstName`, `lastName`, `caseWorkerName`, and `salesforceAccountId` in addition to the existing `name`, `email`, `password`, and `role` fields.
