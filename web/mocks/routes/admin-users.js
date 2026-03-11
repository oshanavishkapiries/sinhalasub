const { ADMIN_MOCK_USERS } = require('../data');

module.exports = [
  // Get all users with pagination, search, filter
  {
    id: 'get-admin-users',
    url: '/api/admin/users',
    method: 'GET',
    variants: [
      {
        id: 'success',
        type: 'middleware',
        options: {
          middleware: (req, res) => {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 25;
            const search = req.query.search || '';
            const role = req.query.role || '';
            const status = req.query.status || '';
            const sortBy = req.query.sortBy || 'createdAt';
            const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

            // Filter users
            let filtered = ADMIN_MOCK_USERS.filter((user) => {
              const matchesSearch = !search || 
                user.name.toLowerCase().includes(search.toLowerCase()) ||
                user.email.toLowerCase().includes(search.toLowerCase());
              
              const matchesRole = !role || user.role === role;
              const matchesStatus = !status || user.status === status;

              return matchesSearch && matchesRole && matchesStatus;
            });

            // Sort users
            filtered.sort((a, b) => {
              let aVal = a[sortBy];
              let bVal = b[sortBy];

              if (typeof aVal === 'string') {
                return aVal.localeCompare(bVal) * sortOrder;
              }
              return (aVal - bVal) * sortOrder;
            });

            // Paginate
            const total = filtered.length;
            const totalPages = Math.ceil(total / limit);
            const start = (page - 1) * limit;
            const users = filtered.slice(start, start + limit);

            res.status(200).json({
              success: true,
              data: {
                users,
                total,
                page,
                limit,
                totalPages,
              },
            });
          },
        },
      },
      {
        id: 'empty',
        type: 'json',
        options: {
          status: 200,
          body: {
            success: true,
            data: {
              users: [],
              total: 0,
              page: 1,
              limit: 25,
              totalPages: 0,
            },
          },
        },
      },
      {
        id: 'error',
        type: 'json',
        options: {
          status: 500,
          body: {
            success: false,
            error: 'Failed to fetch users',
          },
        },
      },
    ],
  },

  // Get single user
  {
    id: 'get-admin-user-by-id',
    url: '/api/admin/users/:id',
    method: 'GET',
    variants: [
      {
        id: 'success',
        type: 'middleware',
        options: {
          middleware: (req, res) => {
            const user = ADMIN_MOCK_USERS.find((u) => u.id === req.params.id);

            if (!user) {
              return res.status(404).json({
                success: false,
                error: 'User not found',
              });
            }

            res.status(200).json({
              success: true,
              data: { user },
            });
          },
        },
      },
      {
        id: 'not-found',
        type: 'json',
        options: {
          status: 404,
          body: {
            success: false,
            error: 'User not found',
          },
        },
      },
    ],
  },

  // Create new user
  {
    id: 'create-admin-user',
    url: '/api/admin/users',
    method: 'POST',
    variants: [
      {
        id: 'success',
        type: 'middleware',
        options: {
          middleware: (req, res) => {
            const { email, name, role, password } = req.body;

            // Validation
            if (!email || !name || !role || !password) {
              return res.status(400).json({
                success: false,
                error: 'Missing required fields',
              });
            }

            // Check if email exists
            if (ADMIN_MOCK_USERS.find((u) => u.email === email)) {
              return res.status(409).json({
                success: false,
                error: 'Email already exists',
              });
            }

            // Create new user
            const newUser = {
              id: String(Math.max(...ADMIN_MOCK_USERS.map((u) => parseInt(u.id))) + 1),
              email,
              name,
              role,
              status: 'active',
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              lastActivity: new Date().toISOString(),
            };

            ADMIN_MOCK_USERS.push(newUser);

            res.status(201).json({
              success: true,
              data: { user: newUser },
            });
          },
        },
      },
      {
        id: 'validation-error',
        type: 'json',
        options: {
          status: 400,
          body: {
            success: false,
            error: 'Validation failed',
          },
        },
      },
    ],
  },

  // Update user
  {
    id: 'update-admin-user',
    url: '/api/admin/users/:id',
    method: 'PUT',
    variants: [
      {
        id: 'success',
        type: 'middleware',
        options: {
          middleware: (req, res) => {
            const user = ADMIN_MOCK_USERS.find((u) => u.id === req.params.id);

            if (!user) {
              return res.status(404).json({
                success: false,
                error: 'User not found',
              });
            }

            // Update allowed fields
            if (req.body.name) user.name = req.body.name;
            if (req.body.email) user.email = req.body.email;
            if (req.body.role) user.role = req.body.role;

            user.updatedAt = new Date().toISOString();

            res.status(200).json({
              success: true,
              data: { user },
            });
          },
        },
      },
      {
        id: 'not-found',
        type: 'json',
        options: {
          status: 404,
          body: {
            success: false,
            error: 'User not found',
          },
        },
      },
    ],
  },

  // Delete user
  {
    id: 'delete-admin-user',
    url: '/api/admin/users/:id',
    method: 'DELETE',
    variants: [
      {
        id: 'success',
        type: 'middleware',
        options: {
          middleware: (req, res) => {
            const index = ADMIN_MOCK_USERS.findIndex((u) => u.id === req.params.id);

            if (index === -1) {
              return res.status(404).json({
                success: false,
                error: 'User not found',
              });
            }

            // Prevent deleting ADMIN users (safer)
            if (ADMIN_MOCK_USERS[index].role === 'admin') {
              return res.status(403).json({
                success: false,
                error: 'Cannot delete admin users',
              });
            }

            ADMIN_MOCK_USERS.splice(index, 1);

            res.status(200).json({
              success: true,
              message: 'User deleted successfully',
            });
          },
        },
      },
      {
        id: 'not-found',
        type: 'json',
        options: {
          status: 404,
          body: {
            success: false,
            error: 'User not found',
          },
        },
      },
    ],
  },

  // Update user status
  {
    id: 'update-admin-user-status',
    url: '/api/admin/users/:id/status',
    method: 'PATCH',
    variants: [
      {
        id: 'success',
        type: 'middleware',
        options: {
          middleware: (req, res) => {
            const user = ADMIN_MOCK_USERS.find((u) => u.id === req.params.id);

            if (!user) {
              return res.status(404).json({
                success: false,
                error: 'User not found',
              });
            }

            const { status } = req.body;
            if (!['active', 'inactive', 'banned'].includes(status)) {
              return res.status(400).json({
                success: false,
                error: 'Invalid status',
              });
            }

            user.status = status;
            user.updatedAt = new Date().toISOString();

            res.status(200).json({
              success: true,
              data: { user },
            });
          },
        },
      },
    ],
  },

  // Bulk delete users
  {
    id: 'bulk-delete-admin-users',
    url: '/api/admin/users/bulk-delete',
    method: 'POST',
    variants: [
      {
        id: 'success',
        type: 'middleware',
        options: {
          middleware: (req, res) => {
            const { ids } = req.body;

            if (!Array.isArray(ids) || ids.length === 0) {
              return res.status(400).json({
                success: false,
                error: 'No IDs provided',
              });
            }

            // Filter out admin users
            const idsToDelete = ids.filter((id) => {
              const user = ADMIN_MOCK_USERS.find((u) => u.id === id);
              return user && user.role !== 'admin';
            });

            // Delete users
            for (const id of idsToDelete) {
              const index = ADMIN_MOCK_USERS.findIndex((u) => u.id === id);
              if (index !== -1) {
                ADMIN_MOCK_USERS.splice(index, 1);
              }
            }

            res.status(200).json({
              success: true,
              message: `${idsToDelete.length} users deleted`,
              data: {
                deletedCount: idsToDelete.length,
                skippedCount: ids.length - idsToDelete.length,
              },
            });
          },
        },
      },
    ],
  },
];
