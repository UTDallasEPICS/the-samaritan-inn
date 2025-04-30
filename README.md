# Samaritan Inn Scheduling App

Samaritan Inn Scheduling App is a web application serving the residents and staff of Samaritan Inn, a nonprofit homeless shelter dedicated to community support. Staff members can create, schedule, edit, and remove announcements to keep everyone informed and organized. Residents can register for life skills classes, book appointments, request curfew extensions, and manage personal schedules through an integrated calendar. The platform leverages Next.js, Prisma, and SQLite to deliver a secure, scalable, and user-friendly experience.

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

### Announcements Management

- Staff can create, edit, and delete announcements.
- Announcements include timestamps and author details.

### Curfew Extension Requests

- Residents can request curfew extensions through the platform.

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
   git clone https://github.com/your-username/samaritan-inn.git
   cd samaritan-inn
   ```
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

```plaintext
.
├── prisma
│   ├── schema.prisma
│   └── seed.ts
├── public
├── src
│   ├── pages
│   ├── components
│   ├── styles
│   └── lib
├── .env
├── next.config.js
├── package.json
└── README.md
```

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

