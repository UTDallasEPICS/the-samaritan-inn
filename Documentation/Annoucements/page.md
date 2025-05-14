# Announcements Page (`page.tsx`)

**Filepath**:  
`c:\Dev\the-samaritan-inn\samaritan_inn\src\app\announcements\page.tsx`

## Purpose
This file defines the **Announcements Page**, which allows staff to post announcements and residents to view them. It includes both the UI and client-side logic for managing announcements.

---

## Features

1. **Admin Announcement Posting**:
   - Staff members (admins) can create and post announcements using a form with a title and content field.
   - The `handlePost` function sends a `POST` request to the `/api/announcements` endpoint to save the announcement in the database.

2. **Resident Announcement Viewing**:
   - Residents can view a list of announcements posted by staff.
   - Each announcement displays the title, content, author, and the date it was posted.

3. **Role-Based Access**:
   - The `isAdmin` state determines whether the user is an admin. Only admins can see the form to post announcements.

4. **Dynamic Data Fetching**:
   - The `useEffect` hook fetches announcements from the `/api/announcements` endpoint when the page loads.

---

## Key Functions

- **`fetchAnnouncements`**:
  - Fetches all announcements from the backend API (`/api/announcements`) and updates the `announcements` state.

- **`handlePost`**:
  - Validates the input fields (title and content).
  - Sends a `POST` request to the backend API to create a new announcement.
  - Updates the announcements list with the newly created announcement.

---

## Code Breakdown

- **State Management**:
  - `announcements`: Stores the list of announcements fetched from the backend.
  - `newAnnouncement`: Stores the title and content of the announcement being created.
  - `isAdmin`: Determines if the user is an admin (hardcoded as `true` for now).

- **UI Components**:
  - **Form**: Allows admins to input the title and content of an announcement.
  - **Announcements List**: Displays all announcements with their details.

---

## Example Usage

- **Admin View**:
  - Admins can see the form to post announcements and the list of existing announcements.

- **Resident View**:
  - Residents can only see the list of announcements.
