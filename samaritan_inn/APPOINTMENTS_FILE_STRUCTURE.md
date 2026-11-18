# Appointments File Structure: `main` vs this branch

Only the **appointments-related** files were reorganized. Everything else keeps the layout from `main`. No URLs changed (46 routes, identical to before), and no logic changed in the move.

## Rules used

1. Appointment-specific code lives under an `appointments` folder.
2. Used by **one page** → in that page's `_components/` (a folder starting with `_` is never a route).
3. Used by **several appointment pages** → `components/appointments/`.
4. Generic/shared code (auth, Salesforce client, Navigation, permissions, Prisma) stays where `main` has it.
5. API routes for appointments go in the route group `api/(appointments)/`. Folders in parentheses are labels only; they do **not** change the URL.

## 1. `main`'s layout (the relevant parts)

```
src/
├── app/
│   ├── appointments/
│   │   ├── calendar-form/page.tsx
│   │   └── my-events/page.tsx
│   ├── profile/page.tsx
│   └── api/
│       ├── get-available-slots/route.ts
│       ├── my-events/route.ts
│       ├── submit-event/route.ts
│       └── users/...
├── components/                 # flat: Navigation, StatusBadge, forms, ...
└── lib/                        # flat: auth, booking, permissions, prisma, salesforce, scheduled-events, ...
```

`main` has no `components/appointments/`, no coach pages and no caseworker directory. Those are the new work on this branch.

## 2. This branch (appointments work, organized)

```
src/
├── app/
│   ├── appointments/
│   │   ├── page.tsx                       # NEW: appointments page
│   │   ├── calendar-form/page.tsx         # modified
│   │   ├── my-events/page.tsx
│   │   └── _components/                   # only used by appointments/page.tsx
│   │       ├── CaseworkerProfileCard.tsx
│   │       └── UpcomingAppointmentRow.tsx
│   ├── empowerment-coaches/               # NEW: coach list (nav "Appointments")
│   │   ├── page.tsx
│   │   └── _components/CaseworkerCard.tsx
│   ├── admin-empowerment-coaches/page.tsx # NEW: admin manages coaches
│   └── api/
│       └── (appointments)/                # URLs unchanged
│           ├── get-available-slots/route.ts
│           ├── submit-event/route.ts
│           ├── my-events/                 # route.ts, [id]/route.ts
│           ├── caseworkers/               # NEW: route.ts, me/route.ts
│           └── admin/caseworkers/         # NEW: route.ts, [id]/route.ts
├── components/
│   └── appointments/                      # shared by several appointment pages
│       ├── PersonRow.tsx
│       ├── SectionCard.tsx
│       ├── EditableProfileField.tsx
│       └── BookingLinkSection.tsx         # used by profile page
└── lib/
    └── appointments/
        ├── appointments-data.ts
        ├── booking.ts
        ├── scheduled-events.ts
        ├── caseworkers.ts
        ├── caseworker-directory.ts
        └── caseworker-fields.ts
```

## 3. What moved (relative to `src/`)

| Before | After |
|---|---|
| `lib/appointments-data`, `booking`, `scheduled-events`, `caseworkers`, `caseworker-directory`, `caseworker-fields` | `lib/appointments/` |
| `components/profile/BookingLinkSection` | `components/appointments/BookingLinkSection` |
| `components/appointments/UpcomingAppointmentRow`, `CaseworkerProfileCard` | `app/appointments/_components/` |
| `components/appointments/CaseworkerCard` | `app/empowerment-coaches/_components/` |
| `api/get-available-slots`, `submit-event`, `my-events/*`, `caseworkers/*` | `api/(appointments)/<same>` |
| `api/admin/caseworkers/*` | `api/(appointments)/admin/caseworkers/*` |
| `api/get-calendar/route.ts` (unused, no callers) | `api/get-calendar/old-route.ts` (renamed; no longer served) |

Import paths were updated to match (`@/lib/appointments/...`, `@/components/appointments/...`).

## Old (retired) appointments files, prefixed `old-`

Appointments are now booked through each coach's **Outlook / Microsoft Bookings** link (`CASEWORKER_SOURCE="local"`). The earlier in-app booking flow (pick a time, save it in our database and Salesforce) is retired. Its files are kept but renamed with an `old-` prefix. Next.js only serves files named exactly `page.tsx` / `route.ts`, so the renamed pages and routes are no longer served (404).

| Renamed file | What it was |
|---|---|
| `app/appointments/calendar-form/old-page.tsx` | in-app booking form (coach, date, time, length) |
| `app/appointments/my-events/old-page.tsx` | earlier appointments page |
| `app/api/(appointments)/get-available-slots/old-route.ts` | open time slots for the booking form |
| `app/api/(appointments)/submit-event/old-route.ts` | saved a booking |
| `app/api/(appointments)/my-events/old-route.ts`, `[id]/old-route.ts` | listed and cancelled a resident's bookings |
| `app/api/get-calendar/old-route.ts` | early Salesforce calendar fetch (it also logged the Salesforce token) |
| `app/appointments/_components/old-UpcomingAppointmentRow.tsx` | row in the old "Upcoming Appointments" list |
| `lib/appointments/old-scheduled-events.ts` | mirrored bookings into our database (only used by the old routes) |

Small changes made with the retirement:
- The landing page's Appointments card now links to `/appointments` (it linked to the old `my-events` page).
- The resident "Upcoming Appointments" section was removed from `/appointments`.
- The Book button on `/empowerment-coaches` now only shows the coach's Outlook Bookings link, or a "not set up yet" message. The Salesforce time-picker branch was removed.

Still live and deliberately kept: `lib/appointments/booking.ts`, `caseworkers.ts` and `lib/salesforce.ts` (the coaches API can still read coaches from Salesforce when `CASEWORKER_SOURCE` is not `"local"`). `getUpcomingAppointments` / `cancelAppointment` in `appointments-data.ts` are now unused and can be deleted later.

## 4. Deliberately not moved (not appointment-specific)

- `lib/salesforce.ts` (generic Salesforce client), `lib/permissions.ts`, `lib/prisma.ts`, `lib/auth.ts`, session helpers
- `components/Navigation.tsx`, `StatusBadge`, `providers/`, `classes/CalendlyLinkSetting.tsx`, `BackgroundBubbles.tsx`
- Calendly (`lib/calendly-url.ts`, `lib/app-settings.ts`, `api/classes/calendly`) and the landing-page bubbles: separate features from appointments
- Pages `empowerment-coaches/` and `admin-empowerment-coaches/` keep their URL-based locations, with no route group, to match `main`.

## 5. Other changes on this branch (logic, not file moves)

Bubbles fix, Calendly link setting, "Appointments" nav label, caseworker directory, Prisma schema/migrations, permission changes, and the `Resources` → `resources` folder rename (to match the nav links).
