# Announcements API (`route.ts`)

**Filepath**:  
`c:\Dev\the-samaritan-inn\samaritan_inn\src\app\api\announcements\route.ts`

## Purpose
This file defines the backend API routes for managing announcements. It handles fetching all announcements and creating new ones.

---

## Features
1. **Fetch Announcements**:
   - The `GET` method retrieves all announcements from the database, sorted by creation date (newest first).

2. **Create Announcements**:
   - The `POST` method allows staff (admins) to create new announcements. It validates the user's role and saves the announcement to the database.

3. **Role-Based Authorization**:
   - Only users with the `isAdmin` flag set to `true` can create announcements.

---

## Key Functions
- **`GET`**:
  - Fetches all announcements from the database using Prisma.
  - Returns the announcements as a JSON response.

- **`POST`**:
  - Validates the request body to ensure the user is an admin and the required fields (`title`, `content`, `author`) are provided.
  - Creates a new announcement in the database using Prisma.
  - Returns the newly created announcement as a JSON response.

---

## Code Breakdown
- **Database Interaction**:
  - Uses Prisma to interact with the `announcement` table in the database.
  - `findMany`: Retrieves all announcements.
  - `create`: Adds a new announcement to the database.

- **Error Handling**:
  - Logs errors to the console and returns appropriate HTTP status codes (e.g., `500` for server errors, `403` for unauthorized access).

---

## Example API Requests
1. **Fetch Announcements**:
   - **Method**: `GET`
   - **Endpoint**: `/api/announcements`
   - **Response**:
     ```json
     [
       {
         "id": "1",
         "title": "Welcome Event",
         "content": "Join us for the welcome event this Friday!",
         "author": "Admin",
         "createdAt": "2025-05-13T10:00:00Z"
       }
     ]
     ```

2. **Create Announcement**:
   - **Method**: `POST`
   - **Endpoint**: `/api/announcements`
   - **Request Body**:
     ```json
     {
       "title": "New Policy Update",
       "content": "Please review the updated policies in your email.",
       "author": "Admin",
       "isAdmin": true
     }
     ```
   - **Response**:
     ```json
     {
       "id": "2",
       "title": "New Policy Update",
       "content": "Please review the updated policies in your email.",
       "author": "Admin",
       "createdAt": "2025-05-13T12:00:00Z"
     }
     ```

---

## Error Scenarios
- **Unauthorized Access**:
  - If a non-admin user attempts to create an announcement, the API returns:
    ```json
    { "error": "Unauthorized" }
    ```
    **Status Code**: `403`

- **Server Error**:
  - If there is an issue with the database or server, the API returns:
    ```json
    { "error": "Failed to fetch announcements" }
    ```
    **Status Code**: `500`

---
