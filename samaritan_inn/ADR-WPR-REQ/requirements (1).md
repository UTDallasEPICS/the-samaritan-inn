# Requirements

These are the baseline requirements satisfied by this template. A team adopting the
template inherits everything below as **Verified**, then appends their own project
requirements as new rows.

## 1. Requirement Matrix

Use the matrix below to track requirements throughout the project lifecycle.

- **Category:** Functional (REQ-F), Non-Functional (REQ-NF)
- **Status:** Backlog, In-progress, Verified, Deferred, Deprecated
- **Mapping:** baseline requirements map to the source that implements them; project
  requirements you add should map to a GitHub issue.

| ID | Description | Status | Target Semester | Mapping (source / issue) |
| --- | --- | --- | --- | --- |
| REQ-F-01 | Appointments will be scheduled by admins, caseworkers and residents. | Verified | 2026F | `samaritan_inn/src/app/appointments/calendar-form/page.tsx` |
| REQ-F-02 | Residents will see their assigned caseworkers on the Appointments page. That information will come from an outside data source (SalesForce/Bookings) | In Progress | 2026F | `samaritan_inn/src/app/appointments/my-events/page.tsx` |
| REQ-F-03 | Admins will be able to add, edit and delete caseworkers (including each caseworker's Microsoft Bookings link) and assign residents to them. Non-admins will be blocked | Verified | 2026F | `src/app/admin-caseworkers/page.tsx`, `src/app/api/admin/caseworkers/`, `src/app/api/admin/caseworker-assignments/`, `prisma/schema.prisma` |
| REQ-F-04 | View and cancel upcoming appointments. Residents will be able to see their upcoming appointments, soonest first, and cancel them. | In Progress | 2026F | `src/components/appointments/UpcomingAppointmentRow.tsx`, `src/app/api/my-events/route.ts`, `src/app/api/my-events/[id]/route.ts`, `src/lib/scheduled-events.ts` |
| REQ-F-05 | Staff will be able to manage caseworker information without code changes. | In Progress | 2026F | `samaritan_inn/src/app/api/users/caseworkers` |
| REQ-F-06 | UI updated to include a profile icon in the navbar rather than “Profile” text. | Verified | 2026F | `samaritan_inn/src/components/Navigation.tsx` |
| REQ-F-07 | UI updated to include a calendar on the homepage to display upcoming events to residents. | In Progress | 2026F | `samaritan_inn/src/app/page.tsx` |
| REQ-F-08 | The inventory (Inflow) button will be easily accessible to admins and users. | In Progress | 2026F | `samaritan_inn/src/components/Navigation.tsx` |
| REQ-F-09 | Inflow Page should accurately track stock and orders using the API. | Deprecated | 2026F | `samaritan_inn/src/app/inventory/page.tsx` |
| REQ-F-10 | Caseworkers should have dedicated permissions. | Verified | 2026F | `permissions.ts`, lines 82–96: `CASEWORKER_PERMISSIONS` mapped in `ROLE_PERMISSIONS`. |
| REQ-F-11 | Create a lead caseworker role (life-coach lead) that can see all pass forms. | Backlog | 2026F | `samaritan_inn/src/app/api/users` |
| REQ-F-12 | Admins create resident accounts; the server generates a temporary password that is shown once, along with the login URL, for the admin to give to the resident. | Verified | 2026F | `samaritan_inn/src/app/api/admin-users/create/route.ts`, `samaritan_inn/src/app/admin-users/create/page.tsx` |
| REQ-F-13 | Developers can obtain an admin account: seed script for local/stage, `create-admin` script for prod. | Verified | 2026F | `samaritan_inn/prisma/seed.js`, `samaritan_inn/prisma/create-admin.js` |
| REQ-NF-01 | Residents can no longer sign themselves up. Admins create resident accounts and hand off credentials. | Verified | 2026F | `samaritan_inn/src/app/api/admin-users/create/route.ts`, `samaritan_inn/src/app/admin-users/layout.tsx`, `samaritan_inn/src/app/admin-users/create/page.tsx` |
| REQ-NF-02 | Only admins (MANAGE_USERS permission) can view the user-management pages or call the account-creation API; non-admins are redirected or receive 403. | Verified | 2026F | `samaritan_inn/src/lib/permissions.ts`, `samaritan_inn/src/app/admin-users/layout.tsx` |
| REQ-NF-03 | Appointment page hardcoded data is replaced to be filled dynamically. | In Progress | 2026F | `samaritan_inn/src/app/appointments`, `https://github.com/UTDallasEPICS/the-samaritan-inn/issues/119` |
| REQ-NF-04 | Required resident fields (name, email) are defined once and validated on both the form and the server. | Verified | 2026F | `samaritan_inn/src/lib/residentValidation.ts` |
| REQ-F-14 | Users who forget their password can request an emailed reset link from the login page and choose a new password. Links are single-use, expire after 1 hour, and the request page never reveals whether an email has an account. | Verified | 2026F | `samaritan_inn/src/lib/passwordReset.ts`, `samaritan_inn/src/app/api/forgot-password/route.ts`, `samaritan_inn/src/app/api/reset-password/route.ts`, `samaritan_inn/src/app/auth/forgot-password/page.tsx`, `samaritan_inn/src/app/auth/reset-password/page.tsx`, `samaritan_inn/tests/auth.e2e.mjs` |
| REQ-F-15 | New residents are emailed a 72-hour link to create their own password. Setting a password from an emailed link marks the email as confirmed; admins can see who has confirmed and resend the link to those who haven't. | Verified | 2026F | `samaritan_inn/src/lib/mailer.ts`, `samaritan_inn/src/app/api/admin-users/[id]/setup-email/route.ts`, `samaritan_inn/src/app/admin-users/page.tsx`, `samaritan_inn/tests/auth.e2e.mjs` |
| REQ-F-16 | Real email delivery on stage and prod: SMTP settings added to the NPTS runtime env files, sending account provided by The Samaritan Inn. | Backlog | 2026F | `samaritan_inn/DEVELOPMENT.md` (Password reset and account-setup emails) |
| REQ-NF-05 | An admin cannot change their own role on Manage Users, so the site always keeps at least one admin. | Verified | 2026F | `samaritan_inn/src/app/admin-users/page.tsx` |
| REQ-NF-06 | My pages, components and API routes follow main's flat layout and are named after the pages that use them; unused endpoints are hidden (404) rather than deleted. | Verified | 2026F | `samaritan_inn/src/app/admin-users/`, `samaritan_inn/src/app/auth/`, `samaritan_inn/src/app/api/admin-users/`, `samaritan_inn/src/app/api/forgot-password/`, `samaritan_inn/src/app/api/reset-password/`, `samaritan_inn/src/components/AddResidentForm.tsx` |

## 2. Change Log

Track major changes, additions, or deprecations to the project scope.

| Date       | Requirement ID | Change Description                                                                   | Author      | Approved By |
| ---------- | -------------- | ------------------------------------------------------------------------------------ | ----------- | ----------- |
| 2026-10-21 | REQ-NF-01 | Removed public sign-up (signup page and `/api/register`); sign-up links removed from nav, login and profile pages | Sanjana | — |
| 2026-10-21 | REQ-F-12 | Added admin-only resident creation API and form with server-generated temporary password | Sanjana | — |
| 2026-10-21 | REQ-NF-02 | Added server-side admin guard on `/admin-users` and 401/403 checks on the creation API | Sanjana | — |
| 2026-10-21 | REQ-NF-04 | Added shared resident field validation used by form and API | Sanjana | — |
| 2026-10-21 | REQ-F-13 | Added `create-admin` script for bootstrapping an admin on prod | Sanjana | — |
| 2026-11-18 | REQ-F-13 | Added the missing `create-admin` and `seed` entries to `package.json` | Sanjana | — |
| 2026-11-18 | REQ-F-14 | Added forgot-password / reset-password flow with hashed single-use tokens | Sanjana | — |
| 2026-11-18 | REQ-F-15 | Added account-setup email, email-confirmed status and resend button on Manage Users | Sanjana | — |
| 2026-11-18 | REQ-F-16 | Added: real email delivery on stage/prod (needs SMTP settings from infra) | Sanjana | — |
| 2026-11-18 | REQ-NF-05 | Admins can no longer change their own role on Manage Users | Sanjana | — |
| 2026-11-18 | REQ-NF-06 | Matched main's structure; renamed my API routes and form after their pages; hid unused `/api/login` and `/api/get-calendar` (404, code kept) | Sanjana | — |
| 2026-11-18 | REQ-F-12, REQ-F-13, REQ-NF-01, REQ-NF-02, REQ-NF-04 | Marked Verified: covered by `tests/auth.e2e.mjs` (48 checks passing) | Sanjana | — |
