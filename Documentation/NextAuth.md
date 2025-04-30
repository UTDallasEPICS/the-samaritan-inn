# NextAuth Implementation Documentation

## Overview

This document outlines the implementation of authentication in The Samaritan Inn application using NextAuth.js with password hashing. The implementation provides secure user authentication, protected routes, and role-based access control.

## Files Created/Modified

### Core Authentication Configuration

#### `src/app/api/auth/[...nextauth]/route.ts`

The central NextAuth configuration file that handles authentication requests.

**Key Features:**
- Credential-based authentication provider
- Password hashing with bcrypt
- JWT session strategy
- Custom callback functions for token and session management

```typescript
// Configuration for NextAuth with credential provider and JWT session
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// Handler for NextAuth endpoints
const handler = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  providers: [CredentialsProvider({...})],
  session: { strategy: "jwt" },
  callbacks: {...},
  pages: { signIn: "/login" },
});

export { handler as GET, handler as POST };
```

#### `src/types/next-auth.d.ts`

TypeScript definitions to extend NextAuth's default types with custom properties.


### Authentication Utilities

#### `src/lib/auth.ts`

Utility functions for server-side authentication checks and user access.

**Key Features:**
- Session retrieval from server components
- Helper functions for protected routes
- Role-based authorization checks

```typescript
// Server-side authentication utilities
export async function getSession() {...}
export async function getCurrentUser() {...}
export async function requireAuth() {...}
export async function requireAdmin() {...}
```

### API Routes

#### `src/app/api/register/route.ts`

API endpoint for user registration with password hashing.

**Key Features:**
- User registration with form validation
- Password hashing using bcrypt
- Duplicate email checking
- Secure user creation in database

```typescript
// API endpoint for user registration
export async function POST(req: Request) {
  // Extract user data
  // Hash password with bcrypt
  // Create user in database
  // Return success response
}
```

### Components

#### `src/components/providers/SessionProvider.tsx`

Client-side provider for NextAuth session management.

**Key Features:**
- Wraps application with session context
- Enables auth state across components

```typescript
// Provider component for NextAuth session
export default function AuthProvider({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

#### `src/components/Navigation.tsx`

Navigation bar with dynamic content based on authentication status.

**Key Features:**
- Responsive design for mobile and desktop
- Conditional rendering based on auth state
- Sign-out functionality
- User information display

```typescript
// Navigation component with authentication awareness
export default function Navigation() {
  const { data: session, status } = useSession();
  // Render different navigation based on authentication status
}
```

### Pages

#### `src/app/layout.tsx` (Modified)

Root layout updated to include the SessionProvider.

**Key Features:**
- Wraps all pages with auth context
- Ensures consistent session access

```typescript
// Root layout with SessionProvider integration
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
```

#### `src/app/auth-status/page.tsx`

Page displaying user authentication status and details.

**Key Features:**
- Shows authentication state (logged in/out)
- Displays user details when authenticated
- Provides login/signup links when not authenticated

```typescript
// Page to display authentication status
export default function AuthStatus() {
  const { data: session, status } = useSession();
  // Render different content based on authentication status
}
```

#### `src/app/dashboard/page.tsx`

Protected route that requires authentication to access.

**Key Features:**
- Server-side authentication check
- Redirects to login if not authenticated
- Displays user-specific content
- Shows admin controls for admin users

```typescript
// Protected dashboard page
export default async function Dashboard() {
  const user = await requireAuth();
  // Render dashboard with user-specific information
}
```

#### `src/app/login/page.tsx` and `src/app/signup/page.tsx`

Pages for user authentication and registration.

**Key Features:**
- Form validation
- Error handling
- Integration with NextAuth
- Password confirmation

```typescript
// Login/signup pages with form handling
export default function Login/Signup() {
  // Form state management
  // Form submission handling
  // Error messaging
}
```

#### `src/app/unauthorized/page.tsx`

Error page for unauthorized access attempts.

**Key Features:**
- Clear error messaging
- Navigation links to authorized pages

```typescript
// Unauthorized access page
export default function Unauthorized() {
  // Display unauthorized message with navigation options
}
```

## Database Schema Changes

The Prisma schema was updated to include the necessary tables for NextAuth:

- `Account` - For Auth account linking
- `Session` - For session storage
- `VerificationToken` - For email verification
- `User` - Updated with NextAuth fields

## Environment Variables

Added NextAuth-specific environment variables:

```
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secure-random-string"
```

## Implementation Details

### Authentication Flow

1. User registers via `/signup` page
2. Password is hashed using bcrypt
3. User logs in via `/login` page
4. Credentials are verified against database
5. Session is created and JWT token issued
6. Protected routes check session before allowing access

### Password Hashing

Bcrypt is used for secure password hashing with a cost factor of 10:

```typescript
const hashedPassword = await bcrypt.hash(password, 10);
```

### Role-Based Access

The application supports role-based access control:

- Regular users can access their dashboard
- Admins can access additional admin features
- The `requireAdmin()` function enforces admin-only routes

## Testing and Debugging

The authentication implementation can be tested by:

1. Creating user accounts
2. Logging in with different credentials
3. Accessing protected routes
4. Checking authentication status
5. Attempting to access unauthorized pages

## Maintenance Considerations

- NextAuth configuration may need updates with package upgrades
- Environment variables must be set in production environments
- Database migrations should be applied when updating schema