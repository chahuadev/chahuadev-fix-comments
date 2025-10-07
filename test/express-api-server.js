const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

const app = express();

const config = {
    port: process.env.PORT || 3000,
    jwtSecret: process.env.JWT_SECRET || 'super-secret-key-change-in-production',
    saltRounds: 12,
    uploadPath: './uploads',
    maxFileSize: 10 * 1024 * 1024,
    allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain']
};

const database = {
    users: [
        {
            id: 1,
            username: 'admin',
            email: 'admin@example.com',
            password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewwA8SoMG0qT5tA2',
            role: 'admin',
            isActive: true,
            createdAt: new Date('2024-01-01'),
            lastLogin: new Date(),
            profile: {
                firstName: 'Admin',
                lastName: 'User',
                avatar: null,
                bio: 'System administrator'
            }
        },
        {
            id: 2,
            username: 'user1',
            email: 'user1@example.com',
            password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewwA8SoMG0qT5tA2',
            role: 'user',
            isActive: true,
            createdAt: new Date('2024-01-15'),
            lastLogin: new Date(),
            profile: {
                firstName: 'John',
                lastName: 'Doe',
                avatar: null,
                bio: 'Regular user'
            }
        }
    ],
    posts: [
        {
            id: 1,
            title: 'Welcome to our API',
            content: 'This is a sample post to demonstrate the API functionality.',
            authorId: 1,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
            published: true,
            tags: ['welcome', 'api', 'demo'],
            likes: 5,
            views: 100
        }
    ],
    comments: [
        {
            id: 1,
            postId: 1,
            authorId: 2,
            content: 'Great post! Thanks for sharing.',
            createdAt: new Date('2024-01-02'),
            parentId: null,
            likes: 2
        }
    ],
    sessions: []
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, config.uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: config.maxFileSize
    },
    fileFilter: (req, file, cb) => {
        if (config.allowedFileTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'), false);
        }
    }
});

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        error: 'Too many requests from this IP, please try again later.'
    }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        error: 'Too many authentication attempts, please try again later.'
    }
});

app.use(helmet());
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'],
    credentials: true
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(config.uploadPath));
app.use(limiter);

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, config.jwtSecret, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        next();
    };
};

const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: 'Validation failed',
                details: error.details.map(detail => detail.message)
            });
        }
        next();
    };
};

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

const generateId = () => {
    return Math.max(...database.users.map(u => u.id), ...database.posts.map(p => p.id), ...database.comments.map(c => c.id)) + 1;
};

const findUserById = (id) => {
    return database.users.find(user => user.id === parseInt(id));
};

const findUserByUsername = (username) => {
    return database.users.find(user => user.username === username);
};

const findUserByEmail = (email) => {
    return database.users.find(user => user.email === email);
};

const findPostById = (id) => {
    return database.posts.find(post => post.id === parseInt(id));
};

app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: '1.0.0'
    });
});

app.post('/api/auth/register', authLimiter, asyncHandler(async (req, res) => {
    const { username, email, password, firstName, lastName } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    if (findUserByUsername(username)) {
        return res.status(409).json({ error: 'Username already exists' });
    }

    if (findUserByEmail(email)) {
        return res.status(409).json({ error: 'Email already exists' });
    }

    if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    const hashedPassword = await bcrypt.hash(password, config.saltRounds);

    const newUser = {
        id: generateId(),
        username,
        email,
        password: hashedPassword,
        role: 'user',
        isActive: true,
        createdAt: new Date(),
        lastLogin: null,
        profile: {
            firstName: firstName || '',
            lastName: lastName || '',
            avatar: null,
            bio: ''
        }
    };

    database.users.push(newUser);

    const token = jwt.sign(
        { userId: newUser.id, username: newUser.username, role: newUser.role },
        config.jwtSecret,
        { expiresIn: '24h' }
    );

    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
        message: 'User registered successfully',
        user: userWithoutPassword,
        token
    });
}));

app.post('/api/auth/login', authLimiter, asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = findUserByUsername(username) || findUserByEmail(username);

    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
        return res.status(401).json({ error: 'Account is deactivated' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    user.lastLogin = new Date();

    const token = jwt.sign(
        { userId: user.id, username: user.username, role: user.role },
        config.jwtSecret,
        { expiresIn: '24h' }
    );

    const sessionId = crypto.randomUUID();
    database.sessions.push({
        id: sessionId,
        userId: user.id,
        token,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    const { password: _, ...userWithoutPassword } = user;

    res.json({
        message: 'Login successful',
        user: userWithoutPassword,
        token,
        sessionId
    });
}));

app.post('/api/auth/logout', authenticateToken, (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    database.sessions = database.sessions.filter(session => session.token !== token);

    res.json({ message: 'Logout successful' });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
    const user = findUserById(req.user.userId);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
});

app.get('/api/users', authenticateToken, requireRole(['admin']), (req, res) => {
    const { page = 1, limit = 10, search = '', role = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let filteredUsers = database.users.filter(user => {
        const matchesSearch = !search ||
            user.username.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase()) ||
            user.profile.firstName.toLowerCase().includes(search.toLowerCase()) ||
            user.profile.lastName.toLowerCase().includes(search.toLowerCase());

        const matchesRole = !role || user.role === role;

        return matchesSearch && matchesRole;
    });

    const total = filteredUsers.length;
    const users = filteredUsers
        .slice(offset, offset + parseInt(limit))
        .map(({ password, ...user }) => user);

    res.json({
        users,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
        }
    });
});

app.get('/api/users/:id', authenticateToken, (req, res) => {
    const userId = parseInt(req.params.id);
    const user = findUserById(userId);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    if (req.user.userId !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
});

app.put('/api/users/:id', authenticateToken, upload.single('avatar'), asyncHandler(async (req, res) => {
    const userId = parseInt(req.params.id);
    const user = findUserById(userId);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    if (req.user.userId !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
    }

    const { firstName, lastName, bio, email } = req.body;

    if (email && email !== user.email) {
        const existingUser = findUserByEmail(email);
        if (existingUser && existingUser.id !== userId) {
            return res.status(409).json({ error: 'Email already exists' });
        }
        user.email = email;
    }

    if (firstName !== undefined) user.profile.firstName = firstName;
    if (lastName !== undefined) user.profile.lastName = lastName;
    if (bio !== undefined) user.profile.bio = bio;

    if (req.file) {
        if (user.profile.avatar) {
            try {
                await fs.unlink(path.join(config.uploadPath, path.basename(user.profile.avatar)));
            } catch (error) {
                console.error('Failed to delete old avatar:', error);
            }
        }
        user.profile.avatar = `/uploads/${req.file.filename}`;
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({
        message: 'User updated successfully',
        user: userWithoutPassword
    });
}));

app.delete('/api/users/:id', authenticateToken, requireRole(['admin']), (req, res) => {
    const userId = parseInt(req.params.id);
    const userIndex = database.users.findIndex(user => user.id === userId);

    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }

    if (userId === req.user.userId) {
        return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    database.users.splice(userIndex, 1);
    database.sessions = database.sessions.filter(session => session.userId !== userId);

    res.json({ message: 'User deleted successfully' });
});

app.get('/api/posts', (req, res) => {
    const { page = 1, limit = 10, search = '', tag = '', authorId = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let filteredPosts = database.posts.filter(post => {
        if (!post.published && (!req.user || req.user.userId !== post.authorId)) {
            return false;
        }

        const matchesSearch = !search ||
            post.title.toLowerCase().includes(search.toLowerCase()) ||
            post.content.toLowerCase().includes(search.toLowerCase());

        const matchesTag = !tag || post.tags.includes(tag);
        const matchesAuthor = !authorId || post.authorId === parseInt(authorId);

        return matchesSearch && matchesTag && matchesAuthor;
    });

    const total = filteredPosts.length;
    const posts = filteredPosts
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(offset, offset + parseInt(limit))
        .map(post => {
            const author = findUserById(post.authorId);
            return {
                ...post,
                author: author ? {
                    id: author.id,
                    username: author.username,
                    profile: author.profile
                } : null
            };
        });

    res.json({
        posts,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
        }
    });
});

app.get('/api/posts/:id', (req, res) => {
    const postId = parseInt(req.params.id);
    const post = findPostById(postId);

    if (!post) {
        return res.status(404).json({ error: 'Post not found' });
    }

    if (!post.published && (!req.user || req.user.userId !== post.authorId)) {
        return res.status(404).json({ error: 'Post not found' });
    }

    post.views += 1;

    const author = findUserById(post.authorId);
    const comments = database.comments
        .filter(comment => comment.postId === postId)
        .map(comment => {
            const commentAuthor = findUserById(comment.authorId);
            return {
                ...comment,
                author: commentAuthor ? {
                    id: commentAuthor.id,
                    username: commentAuthor.username,
                    profile: commentAuthor.profile
                } : null
            };
        });

    res.json({
        ...post,
        author: author ? {
            id: author.id,
            username: author.username,
            profile: author.profile
        } : null,
        comments
    });
});

app.post('/api/posts', authenticateToken, (req, res) => {
    const { title, content, tags = [], published = false } = req.body;

    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
    }

    const newPost = {
        id: generateId(),
        title,
        content,
        authorId: req.user.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        published,
        tags: Array.isArray(tags) ? tags : [],
        likes: 0,
        views: 0
    };

    database.posts.push(newPost);

    const author = findUserById(newPost.authorId);
    res.status(201).json({
        message: 'Post created successfully',
        post: {
            ...newPost,
            author: author ? {
                id: author.id,
                username: author.username,
                profile: author.profile
            } : null
        }
    });
});

app.put('/api/posts/:id', authenticateToken, (req, res) => {
    const postId = parseInt(req.params.id);
    const post = findPostById(postId);

    if (!post) {
        return res.status(404).json({ error: 'Post not found' });
    }

    if (post.authorId !== req.user.userId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
    }

    const { title, content, tags, published } = req.body;

    if (title !== undefined) post.title = title;
    if (content !== undefined) post.content = content;
    if (tags !== undefined) post.tags = Array.isArray(tags) ? tags : [];
    if (published !== undefined) post.published = published;

    post.updatedAt = new Date();

    const author = findUserById(post.authorId);
    res.json({
        message: 'Post updated successfully',
        post: {
            ...post,
            author: author ? {
                id: author.id,
                username: author.username,
                profile: author.profile
            } : null
        }
    });
});

app.delete('/api/posts/:id', authenticateToken, (req, res) => {
    const postId = parseInt(req.params.id);
    const postIndex = database.posts.findIndex(post => post.id === postId);

    if (postIndex === -1) {
        return res.status(404).json({ error: 'Post not found' });
    }

    const post = database.posts[postIndex];

    if (post.authorId !== req.user.userId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
    }

    database.posts.splice(postIndex, 1);
    database.comments = database.comments.filter(comment => comment.postId !== postId);

    res.json({ message: 'Post deleted successfully' });
});

app.post('/api/posts/:id/like', authenticateToken, (req, res) => {
    const postId = parseInt(req.params.id);
    const post = findPostById(postId);

    if (!post) {
        return res.status(404).json({ error: 'Post not found' });
    }

    post.likes += 1;

    res.json({
        message: 'Post liked successfully',
        likes: post.likes
    });
});

app.post('/api/posts/:id/comments', authenticateToken, (req, res) => {
    const postId = parseInt(req.params.id);
    const post = findPostById(postId);

    if (!post) {
        return res.status(404).json({ error: 'Post not found' });
    }

    const { content, parentId = null } = req.body;

    if (!content) {
        return res.status(400).json({ error: 'Comment content is required' });
    }

    if (parentId) {
        const parentComment = database.comments.find(c => c.id === parseInt(parentId) && c.postId === postId);
        if (!parentComment) {
            return res.status(404).json({ error: 'Parent comment not found' });
        }
    }

    const newComment = {
        id: generateId(),
        postId,
        authorId: req.user.userId,
        content,
        createdAt: new Date(),
        parentId: parentId ? parseInt(parentId) : null,
        likes: 0
    };

    database.comments.push(newComment);

    const author = findUserById(newComment.authorId);
    res.status(201).json({
        message: 'Comment created successfully',
        comment: {
            ...newComment,
            author: author ? {
                id: author.id,
                username: author.username,
                profile: author.profile
            } : null
        }
    });
});

app.get('/api/analytics', authenticateToken, requireRole(['admin']), (req, res) => {
    const totalUsers = database.users.length;
    const activeUsers = database.users.filter(user => user.isActive).length;
    const totalPosts = database.posts.length;
    const publishedPosts = database.posts.filter(post => post.published).length;
    const totalComments = database.comments.length;
    const activeSessions = database.sessions.filter(session => session.expiresAt > new Date()).length;

    const usersByRole = database.users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
    }, {});

    const postsLast30Days = database.posts.filter(post => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return post.createdAt >= thirtyDaysAgo;
    }).length;

    res.json({
        users: {
            total: totalUsers,
            active: activeUsers,
            byRole: usersByRole
        },
        posts: {
            total: totalPosts,
            published: publishedPosts,
            last30Days: postsLast30Days
        },
        comments: {
            total: totalComments
        },
        sessions: {
            active: activeSessions
        }
    });
});

app.use((err, req, res, next) => {
    console.error('Error:', err);

    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File size too large' });
        }
        return res.status(400).json({ error: 'File upload error' });
    }

    if (err.message === 'Invalid file type') {
        return res.status(400).json({ error: 'Invalid file type' });
    }

    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        availableEndpoints: {
            auth: [
                'POST /api/auth/register',
                'POST /api/auth/login',
                'POST /api/auth/logout',
                'GET /api/auth/me'
            ],
            users: [
                'GET /api/users',
                'GET /api/users/:id',
                'PUT /api/users/:id',
                'DELETE /api/users/:id'
            ],
            posts: [
                'GET /api/posts',
                'GET /api/posts/:id',
                'POST /api/posts',
                'PUT /api/posts/:id',
                'DELETE /api/posts/:id',
                'POST /api/posts/:id/like',
                'POST /api/posts/:id/comments'
            ],
            other: [
                'GET /api/health',
                'GET /api/analytics'
            ]
        }
    });
});

const startServer = async () => {
    try {
        await fs.access(config.uploadPath);
    } catch {
        await fs.mkdir(config.uploadPath, { recursive: true });
        console.log(`Created upload directory: ${config.uploadPath}`);
    }

    app.listen(config.port, () => {
        console.log(`Server running on port ${config.port}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`Upload path: ${config.uploadPath}`);
        console.log(`Max file size: ${config.maxFileSize / 1024 / 1024}MB`);
    });
};

if (require.main === module) {
    startServer();
}

module.exports = app;