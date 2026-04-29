# Samaritan Inn Scheduling App

Samaritan Inn Scheduling App is a Next.js application for Samaritan Inn residents and staff. Staff can manage announcements and admin workflows, while residents can log in to use the existing scheduling and request features.

## Features

- Email/password authentication with NextAuth.js
- Admin-created user accounts only
- Role-based access for admins, staff, case workers, and residents
- Announcement and pass-form workflows
- Prisma + SQLite persistence

## Tech Stack

- Next.js
- React
- NextAuth.js
- Prisma
- SQLite
- Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

1. Clone the repository.
2. Change into `samaritan_inn/`.
3. Install dependencies with `npm install`.
4. Create `.env` with:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-for-jwt-encryption"
```

5. Run `npx prisma migrate dev`.
6. Run `npx prisma generate`.
7. Run `npx prisma db seed`.
8. Start the app with `npm run dev`.

## Scripts

- `npm run dev` starts the development server.
- `npm test` runs the user-creation tests.
- `npm run typecheck` runs TypeScript checks.
- `npm run lint` runs the configured linter.
- `npm run build` builds the app for production.
- `npm run db:seed` seeds the local database.

## Authentication

Public self-signup is disabled. Every user account must be created and verified by an admin inside the web app.

Users still log in with email and password through `/login`.

### Seeded Admin Account

After seeding, use these credentials for local testing:

- `email: admin@test.com`
- `password: TestAdmin123!`

### Admin-Created User Flow

1. Log in as the seeded admin.
2. Open the `Admin` page in the web app.
3. Use the `Create User` form to enter:
   - first name
   - last name
   - case worker name
   - Salesforce account ID
   - role
   - email
   - password
4. Share the created credentials directly with the new user.

## Database Management

- `npx prisma studio` opens Prisma Studio.
- `npx prisma migrate dev --name <migration_name>` creates and applies a migration.
- `npx prisma db seed` seeds the local database.

## Deployment

1. Run `npm run build`.
2. Run `npm start`.
