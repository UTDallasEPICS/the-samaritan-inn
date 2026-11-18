# Appointments File Structure

Only the **appointments-related** code was reorganized; everything else keeps the layout from `main`. No page URLs changed except that the retired booking flow (the `old-` files below) is no longer served.

**How appointments work now:** a resident opens **Appointments** in the menu, which lists every Empowerment Coach on `/empowerment-coaches`, and books through the coach's **Outlook / Microsoft Bookings** link (turned on with `CASEWORKER_SOURCE="local"`). Admins manage the coaches, and coaches edit their own details and Bookings link. In code an Empowerment Coach is still called a "caseworker".

## Rules used

1. Appointment-specific code lives under an `appointments` folder.
2. Used by **one page** → in that page's `_components/` (a folder starting with `_` is never a route).
3. Used by **several appointment pages** → `components/appointments/`.
4. Generic code (auth, Prisma, Navigation, permissions, Salesforce client) stays where `main` has it.
5. API routes for appointments go in the route group `api/(appointments)/`. A folder in parentheses is just a label; it does not change the URL.
6. Retired code is kept with an `old-` prefix. Next.js only serves files named exactly `page.tsx` or `route.ts`, so `old-page.tsx` / `old-route.ts` are no longer served (404).

## Folders

| Folder | What it holds |
|---|---|
| `src/app/appointments/` | The resident's "My Appointments" page and the coach's "My Information" page, at `/appointments`. |
| `src/app/appointments/_components/` | Pieces used only by the appointments page (the coach's profile card), plus the retired upcoming-appointment row. |
| `src/app/empowerment-coaches/` | The coach directory page at `/empowerment-coaches`, where residents find a coach and book through their Outlook link. |
| `src/app/empowerment-coaches/_components/` | The coach card used only by the directory page. |
| `src/app/admin-empowerment-coaches/` | The admin-only page for adding, editing and deleting coaches. |
| `src/app/appointments/calendar-form/`, `my-events/` | Only retired `old-page.tsx` files from the earlier in-app booking flow. |
| `src/app/api/(appointments)/` | The server routes behind the coach pages, grouped as one label without changing the `/api/...` URLs. |
| `src/app/api/(appointments)/caseworkers/` | Routes that list coaches for everyone and let a coach read and update their own profile. |
| `src/app/api/(appointments)/admin/caseworkers/` | Admin-only routes that create, update and delete coaches. |
| `src/app/api/(appointments)/get-available-slots/`, `submit-event/`, `my-events/` | Only retired `old-route.ts` files from the earlier in-app booking flow. |
| `src/components/appointments/` | Small building blocks shared by several appointment pages and the profile page. |
| `src/lib/appointments/` | Appointment and coach logic with no screen of its own (data fetching, coach directory, validation, booking rules). |

## Files

### Pages (`src/app/`)

| File | What it does |
|---|---|
| `appointments/page.tsx` | Shows residents a "Find an Empowerment Coach" button and shows coaches their own editable profile ("My Information"). |
| `empowerment-coaches/page.tsx` | Lists every Empowerment Coach with contact details and a Book button that opens their Outlook Bookings page. |
| `admin-empowerment-coaches/page.tsx` | Lets admins manage the coach directory and each coach's Bookings link. |
| `profile/page.tsx` | The user's profile page, which shows the Bookings link section to coaches (existing page, uses `BookingLinkSection`). |

### Page components

| File | What it does |
|---|---|
| `appointments/_components/CaseworkerProfileCard.tsx` | The coach's own profile card on `/appointments`, with admin-set fields locked and their own fields editable. |
| `empowerment-coaches/_components/CaseworkerCard.tsx` | One coach's card in the directory (name, title, contact details, availability and the Book action). |

### Shared components (`src/components/appointments/`)

| File | What it does |
|---|---|
| `PersonRow.tsx` | A generic person icon with a name and job title, used on coach cards. |
| `SectionCard.tsx` | The white rounded card that every section of the appointment pages sits in. |
| `EditableProfileField.tsx` | One text field that a coach can edit and save, with validation and a "Saved" message. |
| `BookingLinkSection.tsx` | The box on the Profile page where a coach enters and saves their Outlook / Bookings link. |

### API routes (`src/app/api/(appointments)/`)

| File | What it does |
|---|---|
| `caseworkers/route.ts` | `GET` returns the list of coaches for any logged-in user. |
| `caseworkers/me/route.ts` | `GET` returns, and `PATCH` updates, the logged-in coach's own profile. |
| `admin/caseworkers/route.ts` | `GET` lists and `POST` creates coaches (admin only). |
| `admin/caseworkers/[id]/route.ts` | `PUT` edits and `DELETE` removes one coach (admin only). |

### Logic (`src/lib/appointments/`)

| File | What it does |
|---|---|
| `appointments-data.ts` | The browser-side helpers the coach pages use to call the coach APIs (`getUpcomingAppointments` and `cancelAppointment` in it are now unused). |
| `caseworker-directory.ts` | Server-side coach directory logic: reading and saving coaches, linking a user account, and choosing the data source. |
| `caseworker-fields.ts` | Shared rules that check a coach's fields before saving, including that Bookings links must be Microsoft Bookings hosts. |
| `caseworkers.ts` | Reads coaches from Salesforce, used only when `CASEWORKER_SOURCE` is not `"local"`. |
| `booking.ts` | Booking-hours and time-slot rules; the coach list still uses it to show the booking hours. |

### Retired files (kept with an `old-` prefix)

These belonged to the earlier in-app booking flow (pick a time, save it in our database and Salesforce), which Outlook Bookings replaced.

| File | What it was |
|---|---|
| `app/appointments/calendar-form/old-page.tsx` | The in-app booking form where a resident chose a coach, date, time and length. |
| `app/appointments/my-events/old-page.tsx` | The earlier appointments page where a resident picked a case worker's calendar, booked a slot and saw their upcoming bookings. |
| `app/appointments/_components/old-UpcomingAppointmentRow.tsx` | One row in the resident's old "Upcoming Appointments" list, with a cancel button. |
| `app/api/(appointments)/get-available-slots/old-route.ts` | Returned the open time slots shown in the old booking form. |
| `app/api/(appointments)/submit-event/old-route.ts` | Saved a new booking to our database and Salesforce. |
| `app/api/(appointments)/my-events/old-route.ts` | Listed a resident's bookings. |
| `app/api/(appointments)/my-events/[id]/old-route.ts` | Cancelled one booking. |
| `app/api/get-calendar/old-route.ts` | An early Salesforce calendar fetch (it also logged the Salesforce token). |
| `lib/appointments/old-scheduled-events.ts` | Mirrored bookings into our database; only the old routes used it. |

## What stayed where `main` has it

| Location | Why it didn't move |
|---|---|
| `lib/salesforce.ts` | The generic Salesforce client; appointments are just one user of it. |
| `lib/permissions.ts`, `lib/prisma.ts`, `lib/auth.ts`, session helpers | Shared by the whole app. |
| `components/Navigation.tsx` | The shared menu; its "Appointments" item links to `/empowerment-coaches`. |
| `prisma/schema.prisma`, `prisma/migrations/` | The `Caseworker` tables and migrations for the coach directory (database, not appointments-only code). |
| Calendly (`lib/calendly-url.ts`, `lib/app-settings.ts`, `api/classes/calendly`, `components/classes/`) and `components/BackgroundBubbles.tsx` | Separate features from appointments. |

## Notes

- Landing page: the Appointments card links to `/appointments`.
- Deployed environments need `CASEWORKER_SOURCE="local"`; otherwise coaches without a Bookings link show "online booking isn't set up yet".
- `booking.ts`, `caseworkers.ts` and `salesforce.ts` are kept because the coach list can still read from Salesforce when the setting isn't `"local"`.
