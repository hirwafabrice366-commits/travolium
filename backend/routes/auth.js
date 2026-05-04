const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    console.log('Register request:', req.body);
    const { first_name, last_name, email, password, phone } = req.body;
    
    if (!first_name || !last_name || !email || !password || !phone) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    
    try {
        // Check if user exists
        const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
            `INSERT INTO users (first_name, last_name, email, password, phone, bonus_locked, balance) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [first_name, last_name, email, hashedPassword, phone, 21000, 0]
        );
        
        const [newUser] = await pool.query(
            'SELECT id, email, first_name, last_name, bonus_locked, balance FROM users WHERE id = ?',
            [result.insertId]
        );
        
        console.log('User created:', newUser[0]);
        res.status(201).json({ 
            message: 'User created successfully', 
            user: newUser[0] 
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    console.log('Login request:', req.body);
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password required' });
    }
    
    try {
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        const token = jwt.sign(
            { id: user.id, email: user.email, is_admin: user.is_admin || false },
            process.env.JWT_SECRET || 'travolium_secret_key_2026',
            { expiresIn: '7d' }
        );
        
        res.json({
            token,
            user: {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                balance: user.balance || 0,
                bonus_locked: user.bonus_locked || 21000,
                deposit_status: user.deposit_status || false
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
});

// Get current user
router.get('/me', async (req, res) => {
    const token = req.header('x-auth-token');
    if (!token) {
        return res.status(401).json({ message: 'No token' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'travolium_secret_key_2026');
        const [users] = await pool.query(
            'SELECT id, first_name, last_name, email, balance, bonus_locked, deposit_status FROM users WHERE id = ?',
            [decoded.id]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json({ user: users[0] });
    } catch (err) {
        console.error('Auth error:', err);
        res.status(401).json({ message: 'Invalid token' });
    }
});

module.exports = router;