# Samaritan Inn Scheduling App

Samaritan Inn Scheduling App is a web application serving the residents and staff of Samaritan Inn, a nonprofit homeless shelter dedicated to community support. Staff members can create, schedule, edit, and remove announcements to keep everyone informed and organized. Residents can register for life skills classes, book appointments, request curfew extensions, and manage personal schedules through an integrated calendar. In addition, residents can submit pass forms to request extended curfew or time away from the shelter. Residents can see if their requests have been approved or denied by staff. Staff can approve or deny residents' requests and see past forms. The platform leverages Next.js, Prisma, and SQLite to deliver a secure, scalable, and user-friendly experience.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Project Structure](#project-structure)
- [Database Management](#database-management)
- [Authentication](#authentication)
- [Salesforce Integration and APIs](#salesforce-integration-and-apis)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### Role-Based Access Control

- **Residents**
  - View announcements posted by staff.
  - Schedule life skills classes to enhance their personal development.
  - Request curfew extensions.
  - Manage their schedules using a personal calendar to organize appointments and busy times.
- **Staff**
  - Create, post, and schedule announcements for residents.
  - Manage life skills classes, including scheduling and capacity limits.
  - Deny or approve resident passes.

### Announcements Management

- Staff can create, edit, and delete announcements.
- Announcements include timestamps and author details.

### Curfew Extension Requests

- **Residents**
  - Residents can request curfew extensions through the platform.
  - Residents can see if their requests have been approved or denied by staff.
- **Staff**
  - Staff can approve or deny residents' requests
  - Staff can see past forms

### Authentication

- Secure login and signup using NextAuth.js.
- Role-based access for staff and residents.

### Responsive Design

- Optimized for both desktop and mobile devices.

---

## Tech Stack

- **Frontend:** Next.js (React Framework)
- **Backend:** Node.js with Next.js API routes
- **Database:** SQLite with Prisma ORM
- **Authentication:** NextAuth.js
- **Styling:** Tailwind CSS

---

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or Yarn
- SQLite (comes pre-installed with Prisma)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/UTDallasEPICS/the-samaritan-inn.git
   cd the-samaritan-inn/samaritan_inn
   ```
   All remaining commands run from `samaritan_inn/`, where `package.json` and `prisma/` live.
2. Install dependencies:
   - `npm install`
   - (create `.env` file and add the required information)
   - `npx prisma migrate dev`
   - `npx prisma generate`
3. Configure environment variables:
   Create a `.env` file in the root directory with:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-for-jwt-encryption"
   ```
4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```
5. Open your browser and navigate to `http://localhost:3000`.

---

## Project Structure

The Next.js application lives in `samaritan_inn/`. All `npm` commands below are run from that directory, not the repository root.

```text
the-samaritan-inn/
├── README.md
├── end_of_sem_samaritan_inn.md
├── Documentation/                     # Feature write-ups
│   ├── NextAuth.md
│   └── Annoucements/
│       ├── page.md
│       └── route.md
└── samaritan_inn/                     # The Next.js app
    ├── .env
    ├── CLAUDE.md
    ├── eslint.config.mjs
    ├── next.config.ts
    ├── package.json
    ├── postcss.config.mjs
    ├── tailwind.config.ts
    ├── tsconfig.json
    ├── ADR-WPR-REQ/                   # Architecture decision records, weekly progress, requirements
    ├── prisma/
    │   ├── schema.prisma
    │   ├── dev.db
    │   ├── migrations/
    │   ├── add-mock-caseworkers.js
    │   └── add-mock-residents.js
    ├── public/                        # logo.png and svg assets
    └── src/
        ├── app/
        │   ├── favicon.ico
        │   ├── globals.css
        │   ├── layout.tsx
        │   ├── page.tsx               # "/" resident home (redirects to /auth/unauthorized when signed out)
        │   ├── admin-forms/           # Staff form review queue
        │   │   ├── page.tsx
        │   │   └── sorted-forms/
        │   │       ├── pending-forms/
        │   │       └── past-forms/
        │   ├── announcements/
        │   ├── appointments/          # Salesforce-backed scheduling
        │   │   ├── calendar-form/
        │   │   └── my-events/
        │   ├── auth/                  # Auth-related pages
        │   │   ├── login/
        │   │   ├── signup/
        │   │   └── unauthorized/
        │   ├── classes/               # Life skills classes (Calendly embed)
        │   ├── profile/
        │   ├── resources/
        │   ├── user-pass-form/        # Resident pass / curfew / work schedule submissions
        │   └── api/
        │       ├── announcements/     # + [id]
        │       ├── auth/[...nextauth]/
        │       ├── debug-session/
        │       ├── events/            # + [id]
        │       ├── get-available-slots/
        │       ├── get-calendar/
        │       ├── login/
        │       ├── my-events/         # + [id]
        │       ├── pass/
        │       │   ├── extended-curfew/   # + [id]
        │       │   ├── pass-request/      # + [id]
        │       │   └── work-schedule/     # + [id]
        │       ├── register/
        │       ├── submit-event/
        │       └── users/
        │           ├── caseworkers/
        │           └── residents/
        ├── components/
        │   ├── CaseworkerSelect.tsx
        │   ├── ExtendedCurfewForm.tsx
        │   ├── Fetchforms.tsx
        │   ├── Navigation.tsx
        │   ├── PassRequestForm.tsx
        │   ├── ResidentSearch.tsx
        │   ├── SidebarCalendar.jsx     # + SidebarCalendar.d.ts
        │   ├── StatusBadge.tsx
        │   ├── WorkScheduleForm.tsx
        │   ├── admin/
        │   │   ├── DecisionPanel.tsx
        │   │   ├── ExtendedCurfewDetailModal.tsx
        │   │   ├── PassRequestDetailModal.tsx
        │   │   └── WorkScheduleDetailModal.tsx
        │   └── providers/
        │       └── SessionProvider.tsx
        ├── lib/
        │   ├── auth.ts
        │   ├── authOptions.ts
        │   ├── booking.ts              # Booking validation and business rules
        │   ├── getServerSessionInfo.ts
        │   ├── getServerUserId.ts
        │   ├── prisma.ts
        │   ├── salesforce.ts           # Shared Salesforce OAuth + REST client
        │   └── scheduled-events.ts     # Local ScheduledEvent mirror helpers
        └── types/
            └── next-auth.d.ts
```

### Routes at a Glance

| Route | Who | Purpose |
| --- | --- | --- |
| `/` | Resident | Home page and entry point |
| `/announcements` | All | View announcements; staff can create and manage them |
| `/classes` | Resident | Life skills class signup (Calendly embed) |
| `/resources` | Resident | Shelter resources |
| `/user-pass-form` | Resident | Submit work schedule, extended curfew, and pass requests, plus submission history |
| `/appointments/my-events` | Resident | Book and view caseworker appointments |
| `/appointments/calendar-form` | Resident | Alternate booking UI for the same Salesforce flow |
| `/admin-forms` | Staff | Review queue for resident forms |
| `/admin-forms/sorted-forms/pending-forms` | Staff | Forms awaiting a decision |
| `/admin-forms/sorted-forms/past-forms` | Staff | Previously decided forms |
| `/profile` | All | Account details and sign out |
| `/auth/login`, `/auth/signup`, `/auth/unauthorized` | Public | Authentication pages |

### Scripts

- `npm run dev` – Start the development server  
- `npm run build` – Build for production  
- `npm start` – Start the production server  
- `npm run lint` – Run linter  

---

## Database Management

- **Prisma Studio:**  
  ```bash
  npx prisma studio
  ```
- **Migrations:**  
  ```bash
  npx prisma migrate dev --name <migration_name>
  ```

---

## Authentication

This project uses NextAuth.js for authentication with two roles:

- **Staff (Admin):** Can post and manage announcements.  
- **Resident:** Can view announcements and request curfew extensions.

---

## Salesforce Integration and APIs

The resident appointment flow is integrated with Salesforce so that scheduled appointments are created as Salesforce `Event` records and also mirrored in the local SQLite database for app-specific rules and UI rendering. In the current codebase, this Salesforce-backed flow is used by `/appointments/my-events` and `/appointments/calendar-form`. The separate `/classes` page still embeds a Calendly widget for life skills classes and is not part of the Salesforce event flow.

### Overview

- Frontend pages expose a fixed list of selectable calendars backed by `NEXT_PUBLIC_SF_OWNER_1`, `NEXT_PUBLIC_SF_OWNER_2`, and `NEXT_PUBLIC_SF_OWNER_3`.
- The app checks Salesforce for existing `Event` records before offering time slots.
- When a resident books an appointment, the app first reserves a local `Appointment`, then creates a Salesforce `Event`, then stores the returned Salesforce id in `Appointment.salesforceEventId`.
- The app also maintains a local `ScheduledEvent` mirror so the resident-facing event list can show a caseworker label and render quickly from Prisma.
- Salesforce authentication is server-to-server OAuth using the client credentials grant. It is not tied to the logged-in resident's Salesforce identity.

### Architecture and Data Flow

1. A signed-in user opens `/appointments/my-events` or `/appointments/calendar-form` and selects a caseworker calendar owner id from the frontend environment-configured list.
2. The page calls `GET /api/get-available-slots?date=YYYY-MM-DD&ownerId=<salesforce-owner-id>`.
3. The route validates the date and owner id, queries Salesforce `Event` records for overlapping time on that owner's calendar, and returns available 30-minute slots inside business hours.
4. The user submits `POST /api/submit-event` with `title`, `startDate`, `endDate`, and `ownerId`.
5. The route revalidates the interval, rechecks Salesforce for conflicts, creates a local `Appointment` reservation, creates the Salesforce `Event`, writes the returned Salesforce event id back to the appointment, and syncs the `ScheduledEvent` mirror.
6. The resident event list calls `GET /api/my-events`, which returns appointments from the local database and refreshes any existing `ScheduledEvent` mirror rows.
7. Deleting an event calls `DELETE /api/my-events/[id]`, which attempts to delete the Salesforce `Event`, then deletes the local mirror and local appointment row.

### Salesforce Authentication

The shared Salesforce client in `samaritan_inn/src/lib/salesforce.ts` uses:

- `POST {SF_LOGIN_URL}/services/oauth2/token`
- `grant_type=client_credentials`
- `client_id={SF_CLIENT_ID}`
- `client_secret={SF_CLIENT_SECRET}`

The returned bearer token is then used for REST calls against `SF_INSTANCE_URL`. Missing Salesforce environment variables throw server-side errors. Salesforce API failures are normalized into `SalesforceError` and, for the main scheduling routes, are returned to the client as `502` responses with a generic scheduling-service error message.

### API Endpoints

| Endpoint | Method | Auth required | What it does | Response |
| --- | --- | --- | --- | --- |
| `/api/get-available-slots` | `GET` | No resident auth required for basic lookup; extra per-user limits only apply when a user session is present | Queries Salesforce `Event` records for one owner and date, then returns open 30-minute slots | `[{ start, end, label }]` or `{ error }` |
| `/api/submit-event` | `POST` | Yes | Validates a booking, reserves a local appointment, creates a Salesforce `Event`, and stores the Salesforce id locally | `{ success: true, id }` or `{ error }` |
| `/api/my-events` | `GET` | Yes | Returns the signed-in user's locally stored appointments and refreshes local mirror rows | `[{ id, title, startTime, endTime, caseWorker, salesforceId, createdAt }]` or `{ error }` |
| `/api/my-events/[id]` | `DELETE` | Yes | Deletes the user's local appointment and attempts to delete the linked Salesforce `Event` | `{ success: true }` or `{ error }` |
| `/api/get-calendar` | `GET` | No | Queries Salesforce `Event` records between `startDate` and `endDate` and maps them into a simplified array | `[{ id, title, start, end, description, location }]` |

#### `GET /api/get-available-slots`

Query parameters:

| Name | Required | Notes |
| --- | --- | --- |
| `date` | Yes | Must be `YYYY-MM-DD` and within the current booking window. |
| `ownerId` | Yes | Must resolve to a valid 15-18 character Salesforce id. If omitted, server code falls back to `SF_OWNER_ID`. |

Behavior:

- Calls Salesforce with a SOQL query against `Event`:
  - `SELECT Id, Subject, StartDateTime, EndDateTime, Description, Location FROM Event WHERE StartDateTime <= <day-end> AND EndDateTime >= <day-start> AND OwnerId = '<ownerId>'`
- Uses only overlapping event intervals to compute availability.
- Returns 30-minute slots between `9:00 AM` and `5:00 PM` Central Time.
- If a user session exists, the route also checks local appointment caps before returning slots.

Common errors:

- `400` when `date` is missing, malformed, outside the one-month window, or `ownerId` is invalid.
- `409` when the signed-in user already has an active appointment on that Central Time date.
- `429` when the signed-in user already has 7 active appointments.
- `502` when Salesforce authentication or querying fails.

#### `POST /api/submit-event`

Request body:

| Field | Required | Notes |
| --- | --- | --- |
| `title` | Yes | Trimmed server-side before use. |
| `startDate` | Yes | Parsed with `new Date(...)`; must be a valid appointment start instant. |
| `endDate` | Yes | Parsed with `new Date(...)`; must be after `startDate`. |
| `ownerId` | Yes | Must resolve to a valid Salesforce id or the request fails. |
| `description` | No | Supported by the API and forwarded to Salesforce if present. Current first-party forms do not send it. |
| `location` | No | Supported by the API and forwarded to Salesforce if present. Current first-party forms do not send it. |

Response shape:

```json
{ "success": true, "id": "<salesforce-event-id>" }
```

Behavior:

- Requires an authenticated application user via NextAuth JWT.
- Rechecks Salesforce availability immediately before creating the event to reduce race conditions.
- Creates a local `Appointment` first, then creates the Salesforce `Event`, then updates the local appointment with `salesforceEventId`.
- Syncs a local `ScheduledEvent` mirror row with the human-readable caseworker label.
- On failure after the local reservation is created, the route cleans up by deleting the local reservation, deleting the mirror row, and deleting the Salesforce event if one was already created.

Common errors:

- `400` for missing required JSON fields, invalid JSON, invalid owner id, invalid date format, out-of-window bookings, invalid duration, off-boundary start times, cross-day events, same-day bookings made with less than 5 hours lead time, or events outside `9:00 AM` to `5:00 PM` Central Time.
- `409` when the chosen interval overlaps a Salesforce `Event` or the user already has an active booking on that day.
- `429` when the user already has 7 active appointments.
- `502` when Salesforce token exchange, event creation, or cleanup fails.
- `500` for unexpected server errors.

#### `GET /api/my-events`

Response items:

| Field | Notes |
| --- | --- |
| `id` | Local Prisma `Appointment.id`, not the Salesforce id. |
| `title` | Local appointment title. |
| `startTime` / `endTime` | Stored locally as `DateTime`. |
| `caseWorker` | Derived from the selected owner id using frontend environment-backed labels. |
| `salesforceId` | Copied from `Appointment.salesforceEventId`. |
| `createdAt` | Local creation timestamp. |

Notes:

- The route reads from Prisma, not directly from Salesforce.
- Before returning results, it refreshes the local `ScheduledEvent` mirror for appointments that already have a Salesforce id.
- If an owner id no longer matches one of the configured `NEXT_PUBLIC_SF_OWNER_*` values, the fallback label returned is the raw owner id string.

#### `DELETE /api/my-events/[id]`

Behavior:

- Requires an authenticated application user.
- Verifies that the appointment belongs to the requesting user.
- Attempts to delete the Salesforce `Event` if `salesforceEventId` exists.
- Deletes the local `ScheduledEvent` mirror and local `Appointment` even if the Salesforce delete call fails.

Common errors:

- `401` when the user is not signed in.
- `404` when the appointment does not exist or does not belong to the user.

#### `GET /api/get-calendar`

Current code indicates this is a separate, older Salesforce route:

- It performs its own token exchange instead of reusing `src/lib/salesforce.ts`.
- It accepts `startDate` and `endDate` query parameters.
- It queries Salesforce `Event` records in that date range and returns a simplified array.
- It does not filter by `OwnerId`.
- No current UI references to this route were found in the repository.
- It logs the token response and Salesforce response to the server console and does not have explicit route-level error handling.

### Salesforce Objects and Field Mapping

The current implementation only reads and writes Salesforce `Event` records.

| Salesforce field | Source in app |
| --- | --- |
| `Subject` | `Appointment.title` / request `title` |
| `StartDateTime` | Request `startDate` |
| `EndDateTime` | Request `endDate` |
| `Description` | Request `description` when present |
| `Location` | Request `location` when present |
| `OwnerId` | Selected calendar owner id |
| `WhatId` | Hardcoded to `001gK00000hBCOaQAO` during event creation |

Notes:

- Current code indicates `WhatId` is fixed for every created event; the repository does not explain what Salesforce record that id belongs to.
- The app stores the returned Salesforce event id locally as `Appointment.salesforceEventId` and mirrors it again as `ScheduledEvent.salesforceId`.
- Caseworker labels are not fetched from Salesforce. They are derived from locally configured owner ids and hardcoded labels such as `Case Worker 1`.

### Local Models Used by the Integration

| Local model | Purpose |
| --- | --- |
| `Appointment` | Source of truth inside the app for resident bookings, user ownership, booking caps, owner id, and the linked `salesforceEventId` |
| `ScheduledEvent` | Local display mirror keyed by `appointmentId`, with a resolved caseworker label and optional `salesforceId` |

The current schema also includes `Appointment.canceledAt`, but the Salesforce scheduling flow shown in this repository does not currently use that field.

### Validation and Business Rules

- Booking time zone is fixed to `America/Chicago`.
- Only 30-minute and 60-minute appointments are allowed.
- Appointments must start on the hour or half hour.
- Appointments must start and end on the same Central Time calendar day.
- Appointments must stay within `9:00 AM` to `5:00 PM` Central Time.
- Same-day appointments must start at least 5 hours in the future.
- The booking window is from today through one month ahead.
- A user may have at most 7 active appointments.
- A user may have only 1 active appointment per Central Time date.
- One-hour bookings depend on two consecutive 30-minute slots being available.
- There is no dedicated schema-validation library in this flow; validation is implemented manually in route handlers and helper functions.

### Environment Variables

| Variable | Required | Used for |
| --- | --- | --- |
| `SF_LOGIN_URL` | Yes | OAuth token endpoint base URL |
| `SF_CLIENT_ID` | Yes | Salesforce client credentials grant |
| `SF_CLIENT_SECRET` | Yes | Salesforce client credentials grant |
| `SF_INSTANCE_URL` | Yes | Base URL for Salesforce REST API calls after token exchange |
| `SF_OWNER_ID` | Optional fallback | Default owner id if an API caller omits `ownerId` |
| `NEXT_PUBLIC_SF_OWNER_1` | Yes for current UI | Frontend-selectable calendar owner id and label mapping |
| `NEXT_PUBLIC_SF_OWNER_2` | Yes for current UI | Frontend-selectable calendar owner id and label mapping |
| `NEXT_PUBLIC_SF_OWNER_3` | Yes for current UI | Frontend-selectable calendar owner id and label mapping |
| `NEXTAUTH_SECRET` | Yes | Required to authenticate application users before booking or deleting events |

The root README setup example already includes `DATABASE_URL`, `NEXTAUTH_URL`, and `NEXTAUTH_SECRET`. For Salesforce-backed scheduling to work locally, the Salesforce variables above must also be present.

### Local Development, Testing, and Current Limitations

- Local development requires valid Salesforce credentials and reachable Salesforce org URLs; otherwise Salesforce-backed routes fail.
- The repository includes mock user scripts at `samaritan_inn/prisma/add-mock-caseworkers.js` and `samaritan_inn/prisma/add-mock-residents.js`, but these only seed local Prisma users. They do not seed Salesforce calendars, owners, or events.
- No automated tests, fixtures, or seed data specific to Salesforce event creation were found in the current repository.
- `/appointments/my-events` and `/appointments/calendar-form` both implement the same Salesforce-backed scheduling UI flow.
- `/classes` still uses a Calendly embed for life skills classes, so the app currently contains both a Salesforce-backed appointment flow and a separate legacy Calendly flow.
- `/api/get-calendar` appears to be older or auxiliary code and is not clearly integrated into the current UI.

## Deployment

1. Build the application:
   ```bash
   npm run build
   ```
2. Start the production server:
   ```bash
   npm start
   ```

---
## Future requirements:

1. Allow admin to add attachements to announcements and events
2. Change curfew to more of a form and then sends admin response to user in form of email or notification
3. Retire the legacy Calendly scheduling page (`/classes`) in favor of the Salesforce-backed scheduling flow already used by `/appointments/my-events` and `/appointments/calendar-form`
4. User request form to fulfill order in inflow. 
---
