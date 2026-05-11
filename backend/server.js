const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Logger
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Database connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'travolium_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Make pool available to routes
app.locals.db = pool;

// Import routes (with error handling for missing files)
try {
    app.use('/api/auth', require('./routes/auth'));
    console.log('✅ Auth routes loaded');
} catch (err) {
    console.error('❌ Failed to load auth routes:', err.message);
}

try {
    app.use('/api/tasks', require('./routes/tasks'));
    console.log('✅ Tasks routes loaded');
} catch (err) {
    console.log('⚠️ Tasks routes not found (optional)');
}

try {
    app.use('/api/deposits', require('./routes/deposits'));
    console.log('✅ Deposits routes loaded');
} catch (err) {
    console.log('⚠️ Deposits routes not found (optional)');
}

try {
    app.use('/api/withdrawals', require('./routes/withdrawals'));
    console.log('✅ Withdrawals routes loaded');
} catch (err) {
    console.log('⚠️ Withdrawals routes not found (optional)');
}

try {
    app.use('/api/admin', require('./routes/admin'));
    console.log('✅ Admin routes loaded');
} catch (err) {
    console.log('⚠️ Admin routes not found (optional)');
}

try {
    app.use('/api/sms', require('./routes/sms'));
    console.log('✅ SMS routes loaded');
} catch (err) {
    console.log('⚠️ SMS routes not found (optional)');
}

try {
    app.use('/api/video-approval', require('./routes/video-approval'));
    console.log('✅ Video approval routes loaded');
} catch (err) {
    console.log('⚠️ Video approval routes not found (optional)');
}

try {
    app.use('/api/videos', require('./routes/admin-videos'));
    console.log('✅ Admin videos routes loaded');
} catch (err) {
    console.log('⚠️ Admin videos routes not found (optional)');
}

try {
    app.use('/api/password-reset', require('./routes/password-reset'));
    console.log('✅ Password reset routes loaded');
} catch (err) {
    console.log('⚠️ Password reset routes not found (optional)');
}

// Serve static frontend files (if exists)
const path = require('path');
const fs = require('fs');
const frontendPath = path.join(__dirname, '../frontend');
if (fs.existsSync(frontendPath)) {
    app.use(express.static(frontendPath));
    console.log('✅ Frontend static files enabled');
}

// Test route
app.get('/', (req, res) => {
    res.json({ 
        message: 'Travolium API is running', 
        version: '1.0.0',
        status: 'online'
    });
});

// Health check for Render
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

app.get('/test-db', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT NOW() as time, DATABASE() as db_name');
        res.json({ success: true, time: rows[0].time, database: rows[0].db_name });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Error handlers
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);
    res.status(500).json({ 
        message: 'Something went wrong!', 
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message 
    });
});

app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.url} not found` });
});

// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📍 API URL: http://localhost:${PORT}`);
    console.log(`🩺 Health check: /health`);
});
