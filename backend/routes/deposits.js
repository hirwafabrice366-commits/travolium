const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Create deposit
router.post('/', auth, async (req, res) => {
    res.json({ message: 'Deposit request sent' });
});

// Get user deposits
router.get('/', auth, async (req, res) => {
    res.json({ deposits: [] });
});

module.exports = router;