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
| REQ-F-01 | Appointments will be scheduled by caseworkers and admins. | Verified | 2026F | `samaritan_inn\src\app\appointments\calendar-form\page.tsx` |
| REQ-F-02 | Residents will see their assigned caseworkers on the Appointments page. That information will come from an outside data source (SalesForce/Bookings) | In Progress | 2026F | `samaritan_inn/src/app/appointments/my-events/page.tsx` |
| REQ-F-03 | Admins will be able to add, edit and delete caseworkers (including each caseworker's Microsoft Bookings link) and assign residents to them. Non-admins will be blocked | Verified | 2026F | `src/app/admin-caseworkers/page.tsx`, `src/app/api/admin/caseworkers/`, `src/app/api/admin/caseworker-assignments/`, `prisma/schema.prisma` |
| REQ-F-04 | View and cancel upcoming appointments. Residents will be able to see their upcoming appointments, soonest first, and cancel them. | In Progress | 2026F | `src/components/appointments/UpcomingAppointmentRow.tsx`, `src/app/api/my-events/route.ts`, `src/app/api/my-events/[id]/route.ts`, `src/lib/scheduled-events.ts` |
| REQ-F-05 | Appointments can be cancelled through the Appointments page. | In Progress | 2026F | `samaritan_inn/src/app/appointments/my-events/page.tsx` |
| REQ-F-06 | Staff will be able to manage caseworker information without code changes. | In Progress | 2026F | `samaritan_inn/src/app/api/users/caseworkers` |
| REQ-F-07 | UI updated to include a profile icon in the navbar rather than “Profile” text. | Verified | 2026F | `samaritan_inn/src/components/Navigation.tsx` |
| REQ-F-08 | UI updated to include a calendar on the homepage to display upcoming events to residents. | In Progress | 2026F | `samaritan_inn/src/app/page.tsx` |
| REQ-F-09 | The inventory (Inflow) button will be easily accessible to admins. | In Progress | 2026F | `the-samaritan-inn\samaritan_inn\src\components\Navigation.tsx` |
| REQ-F-10 | Inflow Page should accurately track stock and orders. | Deprecated | 2026F | `samaritan_inn/src/app/inventory/page.tsx` |
| REQ-F-11 | Caseworkers should have dedicated permissions. | Verified | 2026F | `permissions.ts`, lines 82–96: `CASEWORKER_PERMISSIONS` mapped in `ROLE_PERMISSIONS`. |
| REQ-F-12 | Create a lead caseworker role (life-coach lead) that can see all pass forms. | Backlog | 2026F | `samaritan_inn/src/app/api/users` |
| REQ-NF-01 | Residents can no longer sign themselves up. Admins create resident accounts and hand off credentials. | In Progress | 2026F | `the-samaritan-inn\samaritan_inn\src\app\admin-users\page.tsx` |
| REQ-NF-02 | Email/text notifications after booking an appointment are sent in less than 30 seconds. | In Progress | 2026F | `samaritan_inn/src/app/appointments/my-events/page.tsx` |
| REQ-NF-03 | Updates to appointments are displayed in less than 30 seconds. | In Progress | 2026F | `samaritan_inn/src/app/appointments/my-events/page.tsx` |
| REQ-NF-04 | Database backups should take no longer than 5 minutes. | In Progress | 2026F | `samaritan_inn/prisma/prisma/dev.db` |
| REQ-NF-05 | Appointment data should sync to Salesforce in less than 15 seconds. | In Progress | 2026F | `samaritan_inn/src/app/appointments/my-events/page.tsx` |

## 2. Change Log

Track major changes, additions, or deprecations to the project scope.

| Date       | Requirement ID | Change Description                                                                   | Author      | Approved By |
| ---------- | -------------- | ------------------------------------------------------------------------------------ | ----------- | ----------- |
| 2026-08-23 | REQ-F/NF-\*    | Established the initial requirements register from the template baseline             | @TusharW4ni | —           |
| 2026-08-23 | REQ-NF-07      | Pinned `better-auth@1.6.23` and `better-sqlite3@12.11.1` to keep the deploy build and migration Lambda working | @TusharW4ni | —           |
| 2026-08-23 | REQ-NF-05      | Added `python3`/`make`/`g++` to the Docker builder so native modules compile         | @TusharW4ni | —           |
