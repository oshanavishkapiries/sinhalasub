# Phase 2 - Admin Dashboard Implementation Plan

## Project Requirements Summary

Based on your answers, here's what we'll build:

### ✅ Features to Implement

#### 1. **User Management**
- List all users with search/sort/filter
- Create new users
- Edit user details
- Delete users
- Role assignment (USER, MODERATOR, ADMIN, SUPER_ADMIN)
- Account status control (Active/Inactive, Ban/Unban)
- Bulk operations

#### 2. **Content Management**
- List all content (movies/TV shows)
- Add new content
- Edit content details
- Delete content
- Publish/Unpublish toggle
- Bulk operations

#### 3. **UI/UX Design**
- Sidebar navigation (collapsible, modern)
- Data tables with: search, sort, filter, pagination
- Bulk action checkboxes
- Inline editing for quick updates
- Edit modals for detailed editing
- Drawer panels for create/edit forms

#### 4. **API Structure**
- New admin-specific endpoints
- Separate from user-facing APIs
- RESTful design
- Mock server implementation

---

## API Endpoints to Create

### User Management APIs

```
GET    /api/admin/users                    - List all users (paginated, filtered)
GET    /api/admin/users/:id               - Get single user
POST   /api/admin/users                    - Create new user
PUT    /api/admin/users/:id               - Update user
DELETE /api/admin/users/:id               - Delete user
PATCH  /api/admin/users/:id/status        - Change account status (active/inactive)
PATCH  /api/admin/users/:id/ban           - Ban/unban user
POST   /api/admin/users/bulk-delete       - Bulk delete users
```

### Content Management APIs

```
GET    /api/admin/content                  - List all content (paginated, filtered)
GET    /api/admin/content/:id             - Get single content
POST   /api/admin/content                  - Create new content
PUT    /api/admin/content/:id             - Update content
DELETE /api/admin/content/:id             - Delete content
PATCH  /api/admin/content/:id/publish     - Publish/unpublish
POST   /api/admin/content/bulk-delete     - Bulk delete content
```

---

## Frontend Components to Build

### Navigation & Layout
- `/src/app/admin/layout.tsx` - Admin sidebar layout
- `/src/components/admin/sidebar.tsx` - Collapsible sidebar
- `/src/components/admin/header.tsx` - Admin header/topbar

### User Management Pages
- `/src/app/admin/users/page.tsx` - Users list page
- `/src/components/admin/users/users-table.tsx` - Users data table
- `/src/components/admin/users/user-form.tsx` - Create/edit user drawer
- `/src/components/admin/users/user-actions.tsx` - Bulk actions menu

### Content Management Pages
- `/src/app/admin/content/page.tsx` - Content list page
- `/src/components/admin/content/content-table.tsx` - Content data table
- `/src/components/admin/content/content-form.tsx` - Create/edit content drawer
- `/src/components/admin/content/content-actions.tsx` - Bulk actions menu

### Shared Components
- `/src/components/admin/data-table.tsx` - Reusable data table component
- `/src/components/admin/drawer-form.tsx` - Reusable drawer component
- `/src/components/admin/action-menu.tsx` - Action menu component
- `/src/components/admin/bulk-actions.tsx` - Bulk actions component

---

## Mock API Routes to Create

```
mocks/routes/admin-users.js      - User management endpoints
mocks/routes/admin-content.js    - Content management endpoints
```

---

## File Structure Overview

```
src/
├── app/admin/
│   ├── layout.tsx                    (Enhanced)
│   ├── page.tsx                      (Existing dashboard)
│   ├── users/
│   │   └── page.tsx                  (New)
│   └── content/
│       └── page.tsx                  (New)
├── components/admin/
│   ├── sidebar.tsx                   (New)
│   ├── header.tsx                    (New)
│   ├── data-table.tsx               (New)
│   ├── drawer-form.tsx              (New)
│   ├── users/
│   │   ├── users-table.tsx          (New)
│   │   ├── user-form.tsx            (New)
│   │   ├── user-actions.tsx         (New)
│   │   └── user-columns.tsx         (New)
│   └── content/
│       ├── content-table.tsx        (New)
│       ├── content-form.tsx         (New)
│       ├── content-actions.tsx      (New)
│       └── content-columns.tsx      (New)
├── services/
│   ├── admin-users.ts              (New)
│   └── admin-content.ts            (New)
└── types/
    ├── admin.ts                     (New)
    └── admin-users.ts              (New)

mocks/
└── routes/
    ├── admin-users.js              (New)
    └── admin-content.js            (New)
```

---

## Implementation Phases

### Phase 2.1 - Setup & Infrastructure
- [ ] Create admin API routes (mock server)
- [ ] Create admin mock data
- [ ] Create admin types
- [ ] Create admin services

### Phase 2.2 - Admin Layout & Navigation
- [ ] Create admin sidebar component
- [ ] Create admin header component
- [ ] Create reusable data table component
- [ ] Create reusable drawer component

### Phase 2.3 - User Management
- [ ] Create users list page
- [ ] Create users table component
- [ ] Create user form (create/edit)
- [ ] Implement user CRUD operations
- [ ] Add bulk operations

### Phase 2.4 - Content Management
- [ ] Create content list page
- [ ] Create content table component
- [ ] Create content form (create/edit)
- [ ] Implement content CRUD operations
- [ ] Add bulk operations

### Phase 2.5 - Polish & Testing
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add confirmation dialogs
- [ ] Add success notifications
- [ ] Test all functionality

---

## Questions for You (Before Implementation)

1. **Users Table Display Fields:**
   - Should we show: ID, Name, Email, Role, Status, CreatedAt, Actions?
   - Any other fields needed?

2. **Content Table Display Fields:**
   - Should we show: ID, Title, Type (movie/TV), Status, CreatedAt, Actions?
   - Should we include ratings, views, or other metrics?

3. **Permissions:**
   - Should ADMIN users be able to create other ADMIN users?
   - Can ADMIN delete other ADMIN accounts?
   - Any restrictions you want to enforce?

4. **Pagination:**
   - How many items per page? (10, 25, 50?)
   - Any preference?

5. **Search & Filter:**
   - For users: search by name/email?
   - For content: search by title?
   - Filter by status? By role (users)?

6. **Notifications:**
   - After successful actions (create, update, delete)?
   - Toast notifications or banner alerts?

---

## Next Steps

Once you answer the clarifying questions above, I'll:

1. Create the mock API endpoints (admin-users.js, admin-content.js)
2. Add mock data for testing
3. Build the admin layout with sidebar
4. Implement user management features
5. Implement content management features
6. Add bulk operations
7. Test everything end-to-end

Are you ready to proceed? Should I start implementation now, or do you want to answer the clarifying questions first?
