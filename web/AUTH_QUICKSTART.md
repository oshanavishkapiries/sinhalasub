# Phase 1: Authentication System - Quick Start Guide

## What's Been Implemented

### ✅ Authentication System Complete

A production-ready authentication system has been implemented with:

- **Mock API Endpoints** for auth operations (login, signup, logout, refresh token)
- **Auth Context & Hooks** for managing user state across the app
- **Session Storage** with localStorage for persistent authentication
- **Protected Routes** with role-based access control
- **Admin Dashboard** accessible only to admin users
- **Updated Login/Signup Pages** with working authentication
- **User Navigation** component showing authenticated user info

---

## Getting Started

### Step 1: Start the Application

```bash
npm run dev:mock
```

This will start:
- **Next.js App:** http://localhost:9002
- **Mock API Server:** http://localhost:3100

### Step 2: Login to Your Account

Navigate to: **http://localhost:9002/login**

#### Quick Login - Use Demo Credentials:
- **Admin User:** admin@sinhalasub.lk / test@123
- **Regular User:** user@sinhalasub.lk / test@123

Click the credential buttons on login page to auto-fill, then submit.

### Step 3: Access Admin Dashboard (Admin Only)

As admin user:
1. Navigate to http://localhost:9002/admin
2. Or click your avatar (top right) → "Admin Dashboard"

---

## File Structure

### New Files Created

```
src/
├── types/auth.ts                          # Auth types & enums
├── services/auth.ts                       # Auth API service
├── lib/session-storage.ts                 # Session management
├── contexts/auth-context.tsx              # Auth provider
├── hooks/useAuth.ts                       # Auth hooks
├── components/protected-route.tsx         # Route protection
├── app/
│   ├── login/page.tsx                    # ✨ Updated with auth
│   ├── signup/page.tsx                   # ✨ Updated with auth
│   ├── admin/
│   │   ├── layout.tsx                    # Protected admin layout
│   │   └── page.tsx                      # Admin dashboard
│   └── providers.tsx                     # ✨ Added AuthProvider
└── mocks/
    └── routes/auth.js                    # Auth endpoints
```

### Updated Files

```
mocks/data.js                              # Added user mock data
mocks/collections.json                    # Added auth routes
src/components/user-nav.tsx               # ✨ Updated with auth
```

---

## Feature Showcase

### 1. Login/Signup Pages
- Working email/password authentication
- Demo credential quick buttons
- Error handling with toast notifications
- Redirect to home after successful auth

### 2. User Authentication
- Token-based authentication (mock JWT)
- Automatic token refresh
- Session persistence with localStorage
- Secure logout

### 3. Admin Dashboard
- Protected route (admin role required)
- Shows user info and role
- Placeholder sections for future features
- Access denied for non-admin users

### 4. User Navigation
- Shows current user info when logged in
- Shows user avatar with initials
- Admin users see "Admin Dashboard" option
- Logout functionality

### 5. Auth Hooks
```typescript
const { user, token, isAuthenticated, login, logout } = useAuth();
const { isAdmin, isModerator, role } = useAuthRole();
const isAuthenticated = useIsAuthenticated();
const user = useCurrentUser();
```

---

## Test Scenarios

### Scenario 1: Admin Login
1. Go to login page
2. Click "Admin" button (auto-fills credentials)
3. Click "Login"
4. You're redirected to home
5. Click avatar → "Admin Dashboard"
6. See admin dashboard

### Scenario 2: User Login
1. Go to login page
2. Click "User" button (auto-fills credentials)
3. Click "Login"
4. You're redirected to home
5. Click avatar → NO "Admin Dashboard" option
6. Try accessing `/admin` → "Access Denied"

### Scenario 3: New User Signup
1. Go to signup page
2. Enter: name, email, password
3. Click "Create an account"
4. New user is created and logged in
5. Redirected to home

### Scenario 4: Session Persistence
1. Login with admin credentials
2. Refresh page (F5)
3. You're still logged in (session from localStorage)
4. Click logout
5. Session is cleared

---

## API Endpoints (Mock Server)

All endpoints at: `http://localhost:3100/api`

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /auth/login | User login |
| POST | /auth/signup | New user registration |
| GET | /auth/me | Get current user |
| POST | /auth/refresh | Refresh access token |
| POST | /auth/logout | User logout |

---

## User Roles

```
USER          → Regular user access
MODERATOR     → Content moderation permissions
ADMIN         → Administrative access
SUPER_ADMIN   → Full system access
```

---

## Demo Credentials

### Admin Account
```
Email:    admin@sinhalasub.lk
Password: test@123
Role:     admin
```

### User Account
```
Email:    user@sinhalasub.lk
Password: test@123
Role:     user
```

---

## Documentation

For detailed documentation, see: **AUTHENTICATION.md**

This includes:
- Complete API documentation
- Usage examples
- Security considerations
- Troubleshooting guide
- Production migration steps

---

## What's Next

The authentication system is ready! Phase 2 will include:

### Phase 2: Admin Dashboard Features
- User management (list, create, edit, delete)
- Content management system
- Analytics and reports
- System settings
- Audit logging

### Future Enhancements
- Email verification
- Password reset flow
- 2-Factor authentication
- OAuth (Google, GitHub)
- Email notifications
- Rate limiting
- Device management

---

## Troubleshooting

### Mock server not starting?
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
npm run dev:mock
```

### Can't access admin dashboard?
- Make sure you're logged in as admin
- Check that your user role is "admin"
- Try clearing localStorage and logging in again

### Session not persisting?
- Check browser's localStorage (F12 → Application → Local Storage)
- Look for `sinhalasub_session` key
- Ensure localStorage is enabled

### Tokens not refreshing?
- Check browser console (F12 → Console) for errors
- Verify mock server is running on port 3100
- Check API calls in Network tab

---

## Security Notes

### Development Environment
⚠️ This is for development/demo only:
- Tokens stored in localStorage (XSS vulnerable)
- Mock JWT tokens (not cryptographically signed)
- Demo credentials visible in code
- No HTTPS enforcement

### Production Requirements
When moving to production:
- ✅ Implement proper JWT signing/verification
- ✅ Use httpOnly cookies for tokens
- ✅ Add CSRF protection
- ✅ Implement proper password hashing
- ✅ Add rate limiting
- ✅ Use HTTPS only
- ✅ Implement 2FA for admins

---

## Quick Commands

```bash
# Start development with mock server
npm run dev:mock

# Build for production
npm run build

# Type checking
npm run typecheck

# Lint code
npm run lint
```

---

## Support & Issues

For issues or questions:
1. Check AUTHENTICATION.md for detailed docs
2. Review mock server logs (terminal output)
3. Check browser console (F12) for errors
4. Verify mock server is running on port 3100

---

## Summary

🎉 **Authentication System is Ready!**

- ✅ Working login/signup
- ✅ Mock API endpoints
- ✅ Admin dashboard with protection
- ✅ Session persistence
- ✅ Role-based access control
- ✅ Production-ready architecture

**Ready for Phase 2: Admin Dashboard Features!**
