# Samaritan Inn — Class Scheduling App

Web app for The Samaritan Inn (nonprofit homeless shelter) to digitize resident-staff communication: announcements, scheduling, and form submissions (pass requests, curfew extensions, work schedules).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15, App Router, React 19, TypeScript 5 |
| Database | SQLite via Prisma ORM 6 |
| Auth | NextAuth.js v4, JWT sessions, bcryptjs password hashing |
| UI | Tailwind CSS (custom tokens) + Material UI v7 |
| Path alias | `@/*` → `src/*` |

---

## Local Setup

```bash
cd samaritan_inn
pnpm install
cp .env.example .env        # fill in values below
pnpm exec prisma migrate dev
pnpm dev                     # http://localhost:3000
```

Required `.env` variables:
```
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="<random string>"
NEXTAUTH_URL="http://localhost:3000"
```

Never commit `.env` or `prisma/dev.db` (both are gitignored).

---

## Project Structure

Pages and components are organized by user view. Folders in parentheses are Next.js
route groups: they group files but are NOT part of the URL (`app/(admin)/admin-forms`
is served at `/admin-forms`).

```
samaritan_inn/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Home (/), shared by every role
│   │   ├── layout.tsx            # Root layout (font, SessionProvider)
│   │   ├── (resident)/           # Resident view: pages every role can use
│   │   │   ├── announcements/  classes/  resources/  profile/
│   │   │   ├── appointments/     # calendar-form/, my-events/
│   │   │   └── user-pass-form/   # submit pass / curfew / work-schedule forms
│   │   ├── (admin)/              # Admin view: staff-only pages
│   │   │   ├── admin-forms/      # review submitted forms (admin + caseworker)
│   │   │   └── admin-users/      # manage accounts (admin only; layout.tsx guards it)
│   │   ├── (auth)/auth/          # login, forgot-password, reset-password, unauthorized
│   │   └── api/                  # API routes, grouped by the page that uses them (URLs unchanged)
│   │       ├── (announcements)/  # announcements/, events/
│   │       ├── (appointments)/   # my-events/, submit-event/, get-available-slots/
│   │       ├── (user-pass-form)/ # pass/ (also used by admin-forms for review)
│   │       ├── (admin-users)/    # admin/residents/, users/ (users/caseworkers + residents also feed the forms)
│   │       ├── (auth)/           # auth/[...nextauth]/, password/
│   │       └── health/           # deployment health check
│   ├── components/
│   │   ├── resident/             # Form components residents fill out
│   │   │   ├── ExtendedCurfewForm.tsx  PassRequestForm.tsx  WorkScheduleForm.tsx
│   │   │   └── CaseworkerSelect.tsx  ResidentSearch.tsx   # used by those forms
│   │   ├── admin/                # Staff tools: review modals, DecisionPanel, Fetchforms, SignupForm
│   │   ├── shared/               # Used by every view: Navigation, StatusBadge, SidebarCalendar
│   │   └── providers/SessionProvider.tsx
│   ├── lib/
│   │   ├── auth.ts               # requireAuth(), requireAdmin(), getCurrentUser()
│   │   └── prisma.ts             # Prisma singleton
│   └── types/next-auth.d.ts      # Extended session types (role field)
├── prisma/
│   ├── schema.prisma             # Source of truth for DB
│   └── migrations/
└── ...config files
```

---

## Auth & Roles

Three roles stored on `User.role`: `"resident"`, `"staff"`, `"admin"`.

```ts
// Server components / API routes
import { requireAuth, requireAdmin, getCurrentUser } from "@/lib/auth";

const user = await requireAuth();   // redirects to /login if unauthenticated
const user = await requireAdmin();  // redirects to /unauthorized if not admin

// Client components
import { useSession } from "next-auth/react";
const { data: session } = useSession();
const role = session?.user?.role;
```

Note: the current pass form API routes (`src/app/api/(user-pass-form)/pass/*/route.ts`) use `userId` from the request body rather than `requireAuth()`. Future routes should enforce auth via `requireAuth()` at the top of the handler.

### Accounts and admin tools

- `pnpm seed`: demo accounts for local/stage (`admin@example.com` / `admin123`, `caseworker1@example.com` / `caseworker123`, `resident1@example.com` / `resident123`). Never run it on prod; the passwords are public.
- `ADMIN_EMAIL=... ADMIN_PASSWORD='12+ chars' pnpm create-admin`: create or reset an admin on any environment (the only way to get the first admin on prod).
- An admin cannot remove their own admin role, so the site always keeps at least one admin.
- Roles are re-read from the database on every API request, so a role change takes effect on the server immediately; the changed user's menus update after they log in again.

### Testing login, sign-up and password reset

```bash
pnpm seed            # once, so the demo accounts exist
pnpm dev             # in one terminal
pnpm test:auth       # in another; BASE_URL defaults to http://localhost:3000
```

`tests/auth.e2e.mjs` covers access control, admin account creation, temporary-password login, the setup and reset links (expired, reused, wrong account, concurrent use), email confirmation, resending, and role changes. It creates throwaway `auth-test-*@example.com` users and deletes them afterwards. Run it against local or stage only, never prod.

---

## Database / Prisma Workflow

```bash
# After editing prisma/schema.prisma:
pnpm exec prisma migrate dev --name <short-description>

# Browse data:
pnpm exec prisma studio

# Regenerate client (usually automatic after migrate):
pnpm exec prisma generate
```

Never edit migration files in `prisma/migrations/` manually.

### Key Models

| Model | Purpose |
|---|---|
| `User` | Accounts; `role` field drives access control |
| `Announcement` | Staff-created notices |
| `Event` | Calendar events with start/end datetime |
| `Class` + `ClassSignup` | Life skills classes + enrollment |
| `Appointment` | Personal user appointments |
| `ExtendedCurfewRequest` | Curfew extension form (resident fills, admin approves) |
| `PassRequest` | Pass request form |
| `WorkSchedule` + `WorkScheduleDay` | Weekly work schedule submission |

Enums: `FormStatus` (PENDING / APPROVED / DENIED), `EmploymentStatus`, `Transportation`.

---

## Code Patterns

### API Routes
- Named exports: `GET`, `POST`, `PUT`, `DELETE`
- Import Prisma from `@/lib/prisma`
- Always validate inputs and return `NextResponse.json()`

```ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  const user = await requireAdmin();
  const items = await prisma.someModel.findMany();
  return NextResponse.json(items);
}
```

### Components
- `.tsx` files in `src/components/`
- Use Tailwind for layout/spacing; MUI for complex widgets (modals, tables, selects)
- Custom Tailwind color tokens: `text-primary`, `bg-secondary`, `text-light`
  - primary: `#00167c` (dark blue nav/buttons)
  - secondary: `#0caebb` (cyan accents)
  - light: `#c7c8ca`
- Font: Montserrat (applied via `font-sans` in Tailwind config)

---

## What's Already Built

| Feature | Status | Notes |
|---|---|---|
| Login / Signup | Done | bcrypt hashing, JWT sessions |
| Role-based access | Done | `requireAuth`, `requireAdmin` in `src/lib/auth.ts` |
| Announcements | Done | Staff creates, all users view |
| Events | Done | Create/view events |
| Schedule/Calendar | Done | Personal appointments |
| Navigation | Done | Role-aware nav in `src/components/shared/Navigation.tsx` |
| Extended Curfew Form | In progress | UI component + DB + API done; admin review UI pending |
| Pass Request Form | In progress | UI component + DB + API done; admin review UI pending |
| Work Schedule Form | In progress | UI component + DB + API done; admin review UI pending |
| Pass/Docs home page | Not started | FR-01 |
| Admin form review UI | Not started | FR-02 |
| Calendly / Salesforce scheduling | Not started | FR-03 |

---

## This Semester's Goals

### FR-01 — Resident Documentation (User View)
- Pass/Docs home page accessible from nav
- Four sub-pages: Work Schedule, Extended Curfew, Pass Request, History of Past Submitted Forms
- Submission confirmation popup after each form

### FR-02 — Resident Documentation (Admin View)
- Admin-only view of all submitted forms
- Search, filter, sort by date or name
- Popup to approve/deny with comments; decisions logged with timestamps
- View history of past forms
- Export form data to Excel spreadsheet

### FR-03 — Appointment Scheduling
- Embed Calendly in the Classes page
- Residents select a case worker and schedule a meeting
- Sync appointments with case worker's Salesforce calendar (Salesforce API — major new work)

**Non-functional targets:** pages load < 3s, RBAC enforced everywhere, mobile responsive.

---

## AI Assistant Notes

- Read existing components and API routes before generating new ones — patterns are established.
- Never modify `prisma/schema.prisma` without also running `pnpm exec prisma migrate dev`.
- Use `@/lib/prisma` for the Prisma client, never instantiate a new `PrismaClient` directly.
- Use Tailwind color tokens (`primary`, `secondary`, `light`) — do not hardcode hex values.
- Keep API route handlers thin; put reusable logic in `src/lib/`.
- The `requireAdmin()` function uses `user.role !== "admin"` — `staff` role does NOT have admin access unless explicitly elevated.

### Password reset and account-setup emails

"Forgot password?" on the login page (`/auth/forgot-password`) emails a one-hour link to `/auth/reset-password`. When an admin creates a resident, the same mechanism emails a 72-hour "set your password" link, alongside the temporary password shown on screen. Tokens are random, stored hashed in NextAuth's `VerificationToken` table, single-use (redeemed atomically), and one live link per account. The forgot endpoint gives the same response whether or not the email exists, sends mail without awaiting it (so timing doesn't reveal accounts either), and ignores repeat requests for the same email within 60 seconds (in-memory, per server process). The password change goes through `POST /api/password/reset`; logging in afterwards is the normal NextAuth credentials login.

Mail is sent with nodemailer over SMTP. Add to `.env` (and to the stage/prod environment):
```
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_SECURE="false"       # "true" for port 465
SMTP_USER="..."
SMTP_PASSWORD="..."
MAIL_FROM="The Samaritan Inn <no-reply@example.com>"
```
`NEXTAUTH_URL` must be the public site URL, since it is used to build the links. If `SMTP_HOST` is unset, nothing is sent. In local development the email (with its link) is printed to the terminal instead, which is how to test without an email account. On a deployed server (`NODE_ENV=production`) only "not sent" is logged, never the link, because anyone with log access could use it.
