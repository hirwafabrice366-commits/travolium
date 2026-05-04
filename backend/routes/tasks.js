const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const router = express.Router();

const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Watch video task
router.post('/video', auth, async (req, res) => {
    const userId = req.userId;
    try {
        await pool.query('UPDATE users SET balance = balance + 1000 WHERE id = ?', [userId]);
        await pool.query('INSERT INTO tasks (user_id, task_type, reward) VALUES (?, ?, ?)',
            [userId, 'video_watch', 1000]);
        
        const [result] = await pool.query('SELECT balance, bonus_locked FROM users WHERE id = ?', [userId]);
        res.json({ success: true, balance: result[0].balance, bonus_locked: result[0].bonus_locked });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Edit task
router.post('/edit', auth, async (req, res) => {
    const userId = req.userId;
    const { content } = req.body;
    try {
        await pool.query('UPDATE users SET balance = balance + 1000 WHERE id = ?', [userId]);
        await pool.query('INSERT INTO tasks (user_id, task_type, reward, content) VALUES (?, ?, ?, ?)',
            [userId, 'edit_sms', 1000, content || '']);
        
        const [result] = await pool.query('SELECT balance, bonus_locked FROM users WHERE id = ?', [userId]);
        res.json({ success: true, balance: result[0].balance, bonus_locked: result[0].bonus_locked });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;