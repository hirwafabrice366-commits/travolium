const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: ['https://travolium-frontend.onrender.com', 'http://localhost:3000', 'http://localhost:5500'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Serve static frontend files (kugira ngo frontend iboneke)
app.use(express.static(path.join(__dirname, '../frontend')));

// ==================== AUTH ROUTES ====================

// Validate access code
app.post('/api/auth/validate-code', (req, res) => {
    const { accessCode } = req.body;
    const validCode = process.env.ACCESS_CODE || '1228601';
    
    if (accessCode === validCode) {
        res.json({ success: true, message: 'Access code validated successfully' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid access code' });
    }
});

// Login endpoint (KORA NEZA)
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    console.log(`Login attempt: ${email}`);
    
    // Demo credentials - BYA NYIRIZINA
    const validEmail = 'admin@travolium.com';
    const validPassword = 'admin123';
    
    if (email === validEmail && password === validPassword) {
        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: 1,
                email: email,
                name: 'Admin User',
                role: 'admin'
            }
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'Invalid email or password'
        });
    }
});

// Register endpoint
app.post('/api/auth/register', (req, res) => {
    const { name, email, password } = req.body;
    
    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: { name, email }
    });
});

// ==================== OTHER ROUTES (OPTIONAL) ====================

// Mock routes for tasks, deposits, etc. (ibyo nta module zihari)
app.use('/api/tasks', (req, res) => {
    res.json({ message: 'Tasks endpoint - coming soon' });
});

app.use('/api/deposits', (req, res) => {
    res.json({ message: 'Deposits endpoint - coming soon' });
});

app.use('/api/withdrawals', (req, res) => {
    res.json({ message: 'Withdrawals endpoint - coming soon' });
});

app.use('/api/admin', (req, res) => {
    res.json({ message: 'Admin endpoint - coming soon' });
});

app.use('/api/sms', (req, res) => {
    res.json({ message: 'SMS endpoint - coming soon' });
});

app.use('/api/video-approval', (req, res) => {
    res.json({ message: 'Video approval endpoint - coming soon' });
});

app.use('/api/videos', (req, res) => {
    res.json({ message: 'Videos endpoint - coming soon' });
});

app.use('/api/password-reset', (req, res) => {
    res.json({ message: 'Password reset endpoint - coming soon' });
});

// ==================== TEST ROUTES ====================

// Health check (kugira ngo Render ibone niba app ikora)
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Root route
app.get('/', (req, res) => {
    res.json({ 
        message: 'Travolium API is running', 
        version: '1.0.0',
        status: 'online',
        endpoints: {
            health: '/health',
            login: '/api/auth/login',
            validate: '/api/auth/validate-code'
        }
    });
});

// Test DB route (idafite database, igaruka mock)
app.get('/test-db', (req, res) => {
    res.json({ 
        message: 'Database not configured',
        mode: 'mock mode',
        success: true 
    });
});

// ==================== ERROR HANDLERS ====================

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        success: false,
        message: `Route ${req.url} not found` 
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ 
        success: false,
        message: 'Something went wrong!', 
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message 
    });
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📍 API URL: http://localhost:${PORT}`);
    console.log(`🩺 Health check: http://localhost:${PORT}/health`);
    console.log(`🔐 Login endpoint: POST http://localhost:${PORT}/api/auth/login`);
    console.log(`🌐 Frontend served from: ${path.join(__dirname, '../frontend')}`);
});
