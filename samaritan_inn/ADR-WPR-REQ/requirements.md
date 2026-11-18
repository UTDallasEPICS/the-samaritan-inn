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
| REQ-F-01 | Appointments will be scheduled by admins, caseworkers and residents. | Verified | 2026F | `samaritan_inn\src\app\appointments\calendar-form\page.tsx` |
| REQ-F-02 | Residents will see their assigned caseworkers on the Appointments page. That information will come from an outside data source (SalesForce/Bookings) | In Progress | 2026F | `samaritan_inn/src/app/appointments/my-events/page.tsx` |
| REQ-F-03 | Admins will be able to add, edit and delete caseworkers (including each caseworker's Microsoft Bookings link) and assign residents to them. Non-admins will be blocked | Verified | 2026F | `src/app/admin-caseworkers/page.tsx`, `src/app/api/admin/caseworkers/`, `src/app/api/admin/caseworker-assignments/`, `prisma/schema.prisma` |
| REQ-F-04 | View and cancel upcoming appointments. Residents will be able to see their upcoming appointments, soonest first, and cancel them. | In Progress | 2026F | `src/components/appointments/UpcomingAppointmentRow.tsx`, `src/app/api/my-events/route.ts`, `src/app/api/my-events/[id]/route.ts`, `src/lib/scheduled-events.ts` |
| REQ-F-05 | Staff will be able to manage caseworker information without code changes. | In Progress | 2026F | `samaritan_inn/src/app/api/users/caseworkers` |
| REQ-F-06 | UI updated to include a profile icon in the navbar rather than “Profile” text. | Verified | 2026F | `samaritan_inn/src/components/Navigation.tsx` |
| REQ-F-07 | UI updated to include a calendar on the homepage to display upcoming events to residents. | In Progress | 2026F | `samaritan_inn/src/app/page.tsx` |
| REQ-F-08 | The inventory (Inflow) button will be easily accessible to admins and users. | In Progress | 2026F | `the-samaritan-inn\samaritan_inn\src\components\Navigation.tsx` |
| REQ-F-09 | Inflow Page should accurately track stock and orders using the API. | Deprecated | 2026F | `samaritan_inn/src/app/inventory/page.tsx` |
| REQ-F-10 | Caseworkers should have dedicated permissions. | Verified | 2026F | `permissions.ts`, lines 82–96: `CASEWORKER_PERMISSIONS` mapped in `ROLE_PERMISSIONS`. |
| REQ-F-11 | Create a lead caseworker role (life-coach lead) that can see all pass forms. | Backlog | 2026F | `samaritan_inn/src/app/api/users` |
| REQ-NF-01 | Residents can no longer sign themselves up. Admins create resident accounts and hand off credentials. | In Progress | 2026F | `the-samaritan-inn\samaritan_inn\src\app\admin-users\page.tsx` |
| REQ-NF-02 | Residents can no longer sign themselves up. Admins create resident accounts and hand off credentials. | In Progress | 2026F | `samaritan_inn/src/lib/permissions.ts` |
| REQ-NF-03 | Appointment page hardcoded data is replaced to be filled dynamically. | In Progress | 2026F | `samaritan_inn/src/app/appointments`, `https://github.com/UTDallasEPICS/the-samaritan-inn/issues/119` |

## 2. Change Log

Track major changes, additions, or deprecations to the project scope.

| Date       | Requirement ID | Change Description                                                                   | Author      | Approved By |
| ---------- | -------------- | ------------------------------------------------------------------------------------ | ----------- | ----------- |
| 2026-XX-XX | REQ-F/NF-\*    | placeholder change                                                                   | @author     | —           |
| 2026-XX-XX | REQ-F/NF-\*    | placeholder change                                                                   | @author     | —           |
| 2026-XX-XX | REQ-F/NF-\*    | placeholder change                                                                   | @author     | —           |
