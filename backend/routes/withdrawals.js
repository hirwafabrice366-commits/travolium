const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Create withdrawal
router.post('/', auth, async (req, res) => {
    res.json({ message: 'Withdrawal request sent' });
});

// Get user withdrawals
router.get('/', auth, async (req, res) => {
    res.json({ withdrawals: [] });
});

module.exports = router;