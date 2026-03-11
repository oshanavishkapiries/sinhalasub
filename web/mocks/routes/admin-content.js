const { ADMIN_MOCK_CONTENT } = require('../data');

module.exports = [
  // Get all content with pagination, search, filter
  {
    id: 'get-admin-content',
    url: '/api/admin/content',
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
            const type = req.query.type || '';
            const status = req.query.status || '';
            const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
            const endDate = req.query.endDate ? new Date(req.query.endDate) : null;
            const sortBy = req.query.sortBy || 'createdAt';
            const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

            // Filter content
            let filtered = ADMIN_MOCK_CONTENT.filter((item) => {
              const matchesSearch = !search || 
                item.title.toLowerCase().includes(search.toLowerCase());
              
              const matchesType = !type || item.type === type;
              const matchesStatus = !status || item.status === status;
              
              const itemDate = new Date(item.createdAt);
              const matchesDateRange = (!startDate || itemDate >= startDate) &&
                (!endDate || itemDate <= endDate);

              return matchesSearch && matchesType && matchesStatus && matchesDateRange;
            });

            // Sort content
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
            const content = filtered.slice(start, start + limit);

            res.status(200).json({
              success: true,
              data: {
                content,
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
              content: [],
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
            error: 'Failed to fetch content',
          },
        },
      },
    ],
  },

  // Get single content
  {
    id: 'get-admin-content-by-id',
    url: '/api/admin/content/:id',
    method: 'GET',
    variants: [
      {
        id: 'success',
        type: 'middleware',
        options: {
          middleware: (req, res) => {
            const content = ADMIN_MOCK_CONTENT.find((c) => c.id === req.params.id);

            if (!content) {
              return res.status(404).json({
                success: false,
                error: 'Content not found',
              });
            }

            res.status(200).json({
              success: true,
              data: { content },
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
            error: 'Content not found',
          },
        },
      },
    ],
  },

  // Create new content
  {
    id: 'create-admin-content',
    url: '/api/admin/content',
    method: 'POST',
    variants: [
      {
        id: 'success',
        type: 'middleware',
        options: {
          middleware: (req, res) => {
            const { title, type, overview, posterPath, backdropPath, releaseDate, genres, rating } = req.body;

            // Validation
            if (!title || !type || !releaseDate) {
              return res.status(400).json({
                success: false,
                error: 'Missing required fields',
              });
            }

            // Create new content
            const newContent = {
              id: String(Math.max(...ADMIN_MOCK_CONTENT.map((c) => parseInt(c.id)), 0) + 1),
              title,
              type,
              overview: overview || '',
              posterPath: posterPath || '/placeholder.jpg',
              backdropPath: backdropPath || '/placeholder-bg.jpg',
              releaseDate,
              genres: genres || [],
              rating: rating || 0,
              views: 0,
              status: 'unpublished',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            ADMIN_MOCK_CONTENT.push(newContent);

            res.status(201).json({
              success: true,
              data: { content: newContent },
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

  // Update content
  {
    id: 'update-admin-content',
    url: '/api/admin/content/:id',
    method: 'PUT',
    variants: [
      {
        id: 'success',
        type: 'middleware',
        options: {
          middleware: (req, res) => {
            const content = ADMIN_MOCK_CONTENT.find((c) => c.id === req.params.id);

            if (!content) {
              return res.status(404).json({
                success: false,
                error: 'Content not found',
              });
            }

            // Update allowed fields
            if (req.body.title) content.title = req.body.title;
            if (req.body.overview) content.overview = req.body.overview;
            if (req.body.genres) content.genres = req.body.genres;
            if (req.body.releaseDate) content.releaseDate = req.body.releaseDate;
            if (req.body.posterPath) content.posterPath = req.body.posterPath;
            if (req.body.backdropPath) content.backdropPath = req.body.backdropPath;
            if (typeof req.body.rating === 'number') content.rating = req.body.rating;

            content.updatedAt = new Date().toISOString();

            res.status(200).json({
              success: true,
              data: { content },
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
            error: 'Content not found',
          },
        },
      },
    ],
  },

  // Delete content
  {
    id: 'delete-admin-content',
    url: '/api/admin/content/:id',
    method: 'DELETE',
    variants: [
      {
        id: 'success',
        type: 'middleware',
        options: {
          middleware: (req, res) => {
            const index = ADMIN_MOCK_CONTENT.findIndex((c) => c.id === req.params.id);

            if (index === -1) {
              return res.status(404).json({
                success: false,
                error: 'Content not found',
              });
            }

            ADMIN_MOCK_CONTENT.splice(index, 1);

            res.status(200).json({
              success: true,
              message: 'Content deleted successfully',
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
            error: 'Content not found',
          },
        },
      },
    ],
  },

  // Publish/Unpublish content
  {
    id: 'update-admin-content-status',
    url: '/api/admin/content/:id/publish',
    method: 'PATCH',
    variants: [
      {
        id: 'success',
        type: 'middleware',
        options: {
          middleware: (req, res) => {
            const content = ADMIN_MOCK_CONTENT.find((c) => c.id === req.params.id);

            if (!content) {
              return res.status(404).json({
                success: false,
                error: 'Content not found',
              });
            }

            const { status } = req.body;
            if (!['published', 'unpublished'].includes(status)) {
              return res.status(400).json({
                success: false,
                error: 'Invalid status',
              });
            }

            content.status = status;
            content.updatedAt = new Date().toISOString();

            res.status(200).json({
              success: true,
              data: { content },
            });
          },
        },
      },
    ],
  },

  // Bulk delete content
  {
    id: 'bulk-delete-admin-content',
    url: '/api/admin/content/bulk-delete',
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

            // Delete content
            let deletedCount = 0;
            for (const id of ids) {
              const index = ADMIN_MOCK_CONTENT.findIndex((c) => c.id === id);
              if (index !== -1) {
                ADMIN_MOCK_CONTENT.splice(index, 1);
                deletedCount++;
              }
            }

            res.status(200).json({
              success: true,
              message: `${deletedCount} content items deleted`,
              data: {
                deletedCount,
              },
            });
          },
        },
      },
    ],
  },
];
