# Authentication System Documentation

## Overview

A complete authentication system has been implemented for the SinhalaSub application, supporting both user and admin authentication with role-based access control.

## Features

- ✅ User login and signup
- ✅ Admin authentication
- ✅ Token-based authentication (JWT-like)
- ✅ Session management with localStorage
- ✅ Role-based access control (RBAC)
- ✅ Protected routes and admin dashboard
- ✅ Automatic token refresh
- ✅ User context and custom hooks
- ✅ Mock API integration

## Architecture

### Files Structure

```
src/
├── types/
│   └── auth.ts                 # Authentication types & interfaces
├── services/
│   └── auth.ts                 # API service for auth endpoints
├── lib/
│   └── session-storage.ts      # Session & token management
├── contexts/
│   └── auth-context.tsx        # Auth context provider
├── hooks/
│   └── useAuth.ts              # Custom auth hooks
├── components/
│   ├── protected-route.tsx     # Route protection wrapper
│   └── user-nav.tsx            # User navigation component
├── app/
│   ├── login/page.tsx          # Login page
│   ├── signup/page.tsx         # Signup page
│   ├── admin/
│   │   ├── layout.tsx          # Admin layout with protection
│   │   └── page.tsx            # Admin dashboard
│   └── providers.tsx           # App providers (Auth + Query)
└── mocks/
    └── routes/
        └── auth.js             # Mock authentication endpoints
```

## Demo Credentials

### Admin Account
- **Email:** `admin@sinhalasub.lk`
- **Password:** `test@123`
- **Role:** admin

### Regular User Account
- **Email:** `user@sinhalasub.lk`
- **Password:** `test@123`
- **Role:** user

> These credentials are only available in the mock server. In production, users will register through the signup form.

## User Roles

```typescript
enum UserRole {
  USER = 'user',           // Regular user
  MODERATOR = 'moderator', // Content moderator
  ADMIN = 'admin',         // Administrator
  SUPER_ADMIN = 'super_admin' // Super administrator
}
```

## API Endpoints

All endpoints are available at `http://localhost:3100/api` (mock server)

### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@sinhalasub.lk",
  "password": "test@123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "...",
    "refreshToken": "..."
  }
}
```

### Signup
```
POST /api/auth/signup
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password",
  "name": "New User"
}

Response:
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": { ... },
    "token": "...",
    "refreshToken": "..."
  }
}
```

### Get Current User
```
GET /api/auth/me
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "User fetched successfully",
  "data": {
    "user": {
      "id": "1",
      "email": "admin@sinhalasub.lk",
      "name": "Admin User",
      "role": "admin",
      "avatar": "...",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

### Refresh Token
```
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "..."
}

Response:
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "token": "...",
    "refreshToken": "..."
  }
}
```

### Logout
```
POST /api/auth/logout

Response:
{
  "success": true,
  "message": "Logout successful"
}
```

## Usage Guide

### 1. Using the useAuth Hook

```typescript
'use client';

import { useAuth } from '@/hooks/useAuth';

export function MyComponent() {
  const { user, token, isAuthenticated, isLoading, login, logout } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.name}!</h1>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}
```

### 2. Checking User Role

```typescript
import { useAuthRole } from '@/hooks/useAuth';

export function AdminFeature() {
  const { isAdmin, isModerator, role } = useAuthRole();

  if (!isAdmin) {
    return <div>Admin access required</div>;
  }

  return <div>Admin-only content</div>;
}
```

### 3. Protected Routes

Wrap components with `ProtectedRoute` to require authentication:

```typescript
import { ProtectedRoute } from '@/components/protected-route';
import { UserRole } from '@/types/auth';

// Require authentication only
export function AuthenticatedPage() {
  return (
    <ProtectedRoute>
      <div>This is only visible to authenticated users</div>
    </ProtectedRoute>
  );
}

// Require admin role
export function AdminPage() {
  return (
    <ProtectedRoute requiredRole={UserRole.ADMIN}>
      <div>This is only visible to admins</div>
    </ProtectedRoute>
  );
}

// Require multiple roles
export function ModeratorOrAdminPage() {
  return (
    <ProtectedRoute requiredRole={[UserRole.ADMIN, UserRole.MODERATOR]}>
      <div>Admin or Moderator only</div>
    </ProtectedRoute>
  );
}
```

### 4. Session Management

```typescript
import {
  saveSession,
  getSession,
  getToken,
  clearSession,
  isSessionValid,
} from '@/lib/session-storage';

// Get current token
const token = getToken();

// Get entire session
const session = getSession();

// Check if session is valid
if (isSessionValid()) {
  // Session exists and not expired
}

// Clear session (logout)
clearSession();
```

### 5. Making API Requests with Auth

The auth service is pre-configured to handle login/signup:

```typescript
import { loginUser, signupUser, getCurrentUser } from '@/services/auth';

// Login
const response = await loginUser('admin@sinhalasub.lk', 'test@123');
if (response.success) {
  console.log('User:', response.data?.user);
  console.log('Token:', response.data?.token);
}

// Signup
const signupResponse = await signupUser(
  'newuser@example.com',
  'password123',
  'New User'
);

// Get current user
const userResponse = await getCurrentUser(token);
```

## Login/Signup Pages

### Login Page Location
- **URL:** `http://localhost:9002/login`
- **Demo Credentials:** Built-in quick login buttons
- **Features:** Email/password login, forgot password link, signup redirect

### Signup Page Location
- **URL:** `http://localhost:9002/signup`
- **Features:** Email, name, password fields, login redirect

## Admin Dashboard

### Access
- **URL:** `http://localhost:9002/admin`
- **Requirement:** Admin role
- **Features:** 
  - Admin overview
  - Placeholder sections for user management, content management, analytics, and settings
  - User info display
  - Role badge

## Testing the Authentication

### Step 1: Start the Mock Server
```bash
npm run dev:mock
```

This will start:
- Next.js dev server on `http://localhost:9002`
- Mock API server on `http://localhost:3100`

### Step 2: Login with Demo Credentials

Navigate to `http://localhost:9002/login` and:
- Use the demo credential buttons, OR
- Manually enter:
  - Email: `admin@sinhalasub.lk`
  - Password: `test@123`

### Step 3: Access Admin Dashboard

After login as admin:
- Click your avatar (top right)
- Click "Admin Dashboard"
- Or navigate to `http://localhost:9002/admin`

### Step 4: Test Regular User

- Logout
- Login with user credentials:
  - Email: `user@sinhalasub.lk`
  - Password: `test@123`
- You won't see admin dashboard option
- Try accessing `/admin` - you'll get access denied

## Session Storage

Sessions are stored in browser localStorage with the following keys:

```
sinhalasub_session    # Full session data
sinhalasub_token      # Auth token
sinhalasub_refresh_token # Refresh token
sinhalasub_user       # User data
```

> Note: This is for development/demo. Production should use secure httpOnly cookies.

## Security Considerations

### Current (Development)
- ⚠️ Tokens stored in localStorage (XSS vulnerable)
- ⚠️ Demo credentials in mock server
- ℹ️ Mock JWT tokens (base64 encoded, not signed)

### For Production
- ✅ Use httpOnly cookies for tokens
- ✅ Implement real JWT signing/verification
- ✅ Add CSRF protection
- ✅ Implement rate limiting on auth endpoints
- ✅ Use HTTPS only
- ✅ Add 2FA for admin accounts
- ✅ Implement proper password hashing (bcrypt)
- ✅ Add refresh token rotation
- ✅ Implement device tracking

## Troubleshooting

### "useAuth must be used within an AuthProvider"
- Make sure you're using the hook in a client component ('use client')
- Ensure the component is wrapped within the app tree (AuthProvider is in root layout)

### "Token expired" errors
- The auth context automatically attempts to refresh tokens
- If refresh fails, user is logged out
- Sessions last 24 hours by default

### Mock server not running
- Ensure you run `npm run dev:mock` instead of just `npm run dev`
- Check that port 3100 is not in use

### CORS errors
- The mock server should handle CORS automatically
- If issues persist, check the mock server configuration

## Next Steps

To build on this authentication system:

1. **Database Integration:** Replace mock data with real database
2. **Email Verification:** Add email confirmation for signups
3. **Password Reset:** Implement password recovery flow
4. **2FA:** Add two-factor authentication for admins
5. **OAuth:** Integrate Google/GitHub login
6. **Audit Logging:** Track admin actions
7. **Rate Limiting:** Prevent brute force attacks
8. **User Management:** Full admin UI for user management

## Related Files

- Mock API: `mocks/routes/auth.js`
- Mock Data: `mocks/data.js`
- Auth Types: `src/types/auth.ts`
- Auth Service: `src/services/auth.ts`
- Auth Context: `src/contexts/auth-context.tsx`
- Auth Hooks: `src/hooks/useAuth.ts`
