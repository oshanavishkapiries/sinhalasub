const { MOCK_USERS, generateToken, generateRefreshToken } = require('../data');

module.exports = [
  // Login endpoint
  {
    id: 'login',
    url: '/api/auth/login',
    method: 'POST',
    variants: [
      {
        id: 'success',
        type: 'middleware',
        options: {
          middleware: (req, res) => {
            const { email, password } = req.body;

            // Find user by email and password
            const user = MOCK_USERS.find(
              (u) => u.email === email && u.password === password
            );

            if (!user) {
              return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
                error: 'INVALID_CREDENTIALS',
              });
            }

            // Generate tokens
            const token = generateToken(user.id, user.email, user.role);
            const refreshToken = generateRefreshToken(user.id);

            // Remove password from response
            const userResponse = {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              avatar: user.avatar,
              isActive: user.isActive,
              createdAt: user.createdAt,
              updatedAt: user.updatedAt,
            };

            res.status(200).json({
              success: true,
              message: 'Login successful',
              data: {
                user: userResponse,
                token,
                refreshToken,
              },
            });
          },
        },
      },
      {
        id: 'invalid-email',
        type: 'json',
        options: {
          status: 401,
          body: {
            success: false,
            message: 'Invalid email or password',
            error: 'INVALID_CREDENTIALS',
          },
        },
      },
      {
        id: 'server-error',
        type: 'json',
        options: {
          status: 500,
          body: {
            success: false,
            message: 'Internal server error',
            error: 'SERVER_ERROR',
          },
        },
      },
    ],
  },

  // Signup endpoint
  {
    id: 'signup',
    url: '/api/auth/signup',
    method: 'POST',
    variants: [
      {
        id: 'success',
        type: 'middleware',
        options: {
          middleware: (req, res) => {
            const { email, password, name } = req.body;

            // Check if user already exists
            const existingUser = MOCK_USERS.find((u) => u.email === email);
            if (existingUser) {
              return res.status(409).json({
                success: false,
                message: 'Email already registered',
                error: 'EMAIL_EXISTS',
              });
            }

            // Create new user
            const newUser = {
              id: String(MOCK_USERS.length + 1),
              email,
              password, // In production, this should be hashed
              name,
              role: 'user',
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            // Add to mock users (in production, save to database)
            MOCK_USERS.push(newUser);

            // Generate tokens
            const token = generateToken(newUser.id, newUser.email, newUser.role);
            const refreshToken = generateRefreshToken(newUser.id);

            const userResponse = {
              id: newUser.id,
              email: newUser.email,
              name: newUser.name,
              role: newUser.role,
              avatar: newUser.avatar,
              isActive: newUser.isActive,
              createdAt: newUser.createdAt,
              updatedAt: newUser.updatedAt,
            };

            res.status(201).json({
              success: true,
              message: 'Account created successfully',
              data: {
                user: userResponse,
                token,
                refreshToken,
              },
            });
          },
        },
      },
      {
        id: 'email-exists',
        type: 'json',
        options: {
          status: 409,
          body: {
            success: false,
            message: 'Email already registered',
            error: 'EMAIL_EXISTS',
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
            message: 'Validation failed',
            error: 'VALIDATION_ERROR',
          },
        },
      },
    ],
  },

  // Get current user endpoint
  {
    id: 'get-current-user',
    url: '/api/auth/me',
    method: 'GET',
    variants: [
      {
        id: 'success',
        type: 'middleware',
        options: {
          middleware: (req, res) => {
            // In production, verify token from Authorization header
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
              return res.status(401).json({
                success: false,
                message: 'Unauthorized',
                error: 'NO_TOKEN',
              });
            }

            // Mock verification - in production, verify JWT
            const token = authHeader.slice(7);

            try {
              // Decode the mock token
              const payload = JSON.parse(Buffer.from(token, 'base64').toString());
              const user = MOCK_USERS.find((u) => u.id === payload.userId);

              if (!user) {
                return res.status(404).json({
                  success: false,
                  message: 'User not found',
                  error: 'USER_NOT_FOUND',
                });
              }

              const userResponse = {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                avatar: user.avatar,
                isActive: user.isActive,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
              };

              res.status(200).json({
                success: true,
                message: 'User fetched successfully',
                data: {
                  user: userResponse,
                },
              });
            } catch (error) {
              res.status(401).json({
                success: false,
                message: 'Invalid token',
                error: 'INVALID_TOKEN',
              });
            }
          },
        },
      },
      {
        id: 'unauthorized',
        type: 'json',
        options: {
          status: 401,
          body: {
            success: false,
            message: 'Unauthorized',
            error: 'NO_TOKEN',
          },
        },
      },
      {
        id: 'invalid-token',
        type: 'json',
        options: {
          status: 401,
          body: {
            success: false,
            message: 'Invalid token',
            error: 'INVALID_TOKEN',
          },
        },
      },
    ],
  },

  // Refresh token endpoint
  {
    id: 'refresh-token',
    url: '/api/auth/refresh',
    method: 'POST',
    variants: [
      {
        id: 'success',
        type: 'middleware',
        options: {
          middleware: (req, res) => {
            const { refreshToken } = req.body;

            if (!refreshToken) {
              return res.status(400).json({
                success: false,
                message: 'Refresh token required',
                error: 'NO_REFRESH_TOKEN',
              });
            }

            try {
              // Decode the mock refresh token
              const payload = JSON.parse(
                Buffer.from(refreshToken, 'base64').toString()
              );

              if (payload.type !== 'refresh') {
                throw new Error('Invalid token type');
              }

              const user = MOCK_USERS.find((u) => u.id === payload.userId);
              if (!user) {
                throw new Error('User not found');
              }

              // Generate new tokens
              const token = generateToken(user.id, user.email, user.role);
              const newRefreshToken = generateRefreshToken(user.id);

              res.status(200).json({
                success: true,
                message: 'Token refreshed successfully',
                data: {
                  token,
                  refreshToken: newRefreshToken,
                },
              });
            } catch (error) {
              res.status(401).json({
                success: false,
                message: 'Invalid refresh token',
                error: 'INVALID_REFRESH_TOKEN',
              });
            }
          },
        },
      },
      {
        id: 'invalid-token',
        type: 'json',
        options: {
          status: 401,
          body: {
            success: false,
            message: 'Invalid refresh token',
            error: 'INVALID_REFRESH_TOKEN',
          },
        },
      },
    ],
  },

  // Logout endpoint
  {
    id: 'logout',
    url: '/api/auth/logout',
    method: 'POST',
    variants: [
      {
        id: 'success',
        type: 'json',
        options: {
          status: 200,
          body: {
            success: true,
            message: 'Logout successful',
          },
        },
      },
    ],
  },
];
