require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs').promises;
const bcrypt = require('bcryptjs');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Secure admin credentials
const ADMIN_USERNAME = 'admin';
// Hash for 'admin123' (generated on 2025-08-30)
const ADMIN_PASSWORD_HASH = '$2a$10$QLc49PXHP8.oO..kA9wZMOPY4QhJd6r9vReGPOSoK1fMKzNIJ0nT2';
console.log('Admin password hash loaded');

// File storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'public/uploads');
        fs.mkdir(uploadDir, { recursive: true })
            .then(() => cb(null, uploadDir))
            .catch(err => cb(err, uploadDir));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${uuidv4()}${ext}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// Authentication middleware
const requireAuth = (req, res, next) => {
    if (req.session.isAuthenticated) {
        return next();
    }
    res.status(401).json({ error: 'Unauthorized' });
};

// API Routes

// Login endpoint
app.post('/api/login', async (req, res) => {
    try {
        const { username, password, rememberMe } = req.body;
        
        console.log('Login attempt:', { username, password: password ? '***' : 'empty' });
        console.log('Expected username:', ADMIN_USERNAME);
        console.log('Password hash comparison:', await bcrypt.compare(password, ADMIN_PASSWORD_HASH));
        
        // Verify credentials
        const isMatch = username === ADMIN_USERNAME && 
                       await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
        
        if (isMatch) {
            req.session.isAuthenticated = true;
            req.session.user = { username };
            
            // Set session expiration
            if (rememberMe) {
                req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
            }
            
            res.json({ success: true, user: { username } });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during authentication' });
    }
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ error: 'Error during logout' });
        }
        res.clearCookie('connect.sid');
        res.json({ success: true });
    });
});

// Check authentication status
app.get('/api/check-auth', (req, res) => {
    res.json({ 
        isAuthenticated: !!req.session.isAuthenticated,
        user: req.session.user || null
    });
});

// File upload endpoint
app.post('/api/upload', requireAuth, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const fileUrl = `/uploads/${path.basename(req.file.path)}`;
    res.json({ url: fileUrl });
});

// Menu API endpoints
const MENU_FILE = path.join(__dirname, 'data', 'menu.json');

// Create data directory if it doesn't exist
async function ensureDataDirectory() {
    const dataDir = path.join(__dirname, 'data');
    try {
        await fs.mkdir(dataDir, { recursive: true });
        // Initialize menu.json if it doesn't exist
        try {
            await fs.access(MENU_FILE);
        } catch (error) {
            await fs.writeFile(MENU_FILE, JSON.stringify({ categories: [], items: [] }, null, 2));
        }
    } catch (error) {
        console.error('Error setting up data directory:', error);
    }
}

// Get menu items
app.get('/api/menu', async (req, res) => {
    try {
        const data = await fs.readFile(MENU_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Error reading menu:', error);
        res.status(500).json({ error: 'Failed to load menu' });
    }
});

// Add/Update menu item
app.post('/api/menu', requireAuth, async (req, res) => {
    try {
        const { item } = req.body;
        if (!item) {
            return res.status(400).json({ error: 'Item data is required' });
        }
        
        const data = JSON.parse(await fs.readFile(MENU_FILE, 'utf8'));
        
        // If item has an ID, update existing, otherwise add new
        if (item.id) {
            const index = data.items.findIndex(i => i.id === item.id);
            if (index !== -1) {
                data.items[index] = { ...data.items[index], ...item };
            } else {
                data.items.push({ ...item, id: uuidv4() });
            }
        } else {
            data.items.push({ ...item, id: uuidv4() });
        }
        
        await fs.writeFile(MENU_FILE, JSON.stringify(data, null, 2));
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving menu item:', error);
        res.status(500).json({ error: 'Failed to save menu item' });
    }
});

// Delete menu item
app.delete('/api/menu/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const data = JSON.parse(await fs.readFile(MENU_FILE, 'utf8'));
        
        data.items = data.items.filter(item => item.id !== id);
        await fs.writeFile(MENU_FILE, JSON.stringify(data, null, 2));
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting menu item:', error);
        res.status(500).json({ error: 'Failed to delete menu item' });
    }
});

// Events API endpoints (similar to menu)
const EVENTS_FILE = path.join(__dirname, 'data', 'events.json');

// Get events
app.get('/api/events', async (req, res) => {
    try {
        const data = await fs.readFile(EVENTS_FILE, 'utf8').catch(() => '[]');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Error reading events:', error);
        res.status(500).json({ error: 'Failed to load events' });
    }
});

// Add/Update event
app.post('/api/events', requireAuth, async (req, res) => {
    try {
        const { event } = req.body;
        if (!event) {
            return res.status(400).json({ error: 'Event data is required' });
        }
        
        let events = [];
        try {
            const data = await fs.readFile(EVENTS_FILE, 'utf8');
            events = JSON.parse(data);
        } catch (error) {
            // File doesn't exist yet, will be created
        }
        
        if (event.id) {
            const index = events.findIndex(e => e.id === event.id);
            if (index !== -1) {
                events[index] = { ...events[index], ...event };
            } else {
                events.push({ ...event, id: uuidv4() });
            }
        } else {
            events.push({ ...event, id: uuidv4() });
        }
        
        await fs.writeFile(EVENTS_FILE, JSON.stringify(events, null, 2));
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving event:', error);
        res.status(500).json({ error: 'Failed to save event' });
    }
});

// Delete event
app.delete('/api/events/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        let events = [];
        
        try {
            const data = await fs.readFile(EVENTS_FILE, 'utf8');
            events = JSON.parse(data);
        } catch (error) {
            return res.status(404).json({ error: 'No events found' });
        }
        
        events = events.filter(event => event.id !== id);
        await fs.writeFile(EVENTS_FILE, JSON.stringify(events, null, 2));
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: 'Failed to delete event' });
    }
});

// Serve the admin panel
app.get('/admin*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'dashboard.html'));
});

// Handle 404
app.use((req, res) => {
    res.status(404).send('Not Found');
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Initialize data directory and start server
async function startServer() {
    await ensureDataDirectory();
    
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
        console.log(`Admin panel: http://localhost:${PORT}/admin`);
        console.log('\x1b[33m%s\x1b[0m', 'IMPORTANT: Change the default admin credentials in the .env file!');
    });
}

startServer().catch(console.error);
