const express = require('express');
const router = express.Router();

// POST: Validate access code
router.post('/validate-code', async (req, res) => {
    try {
        const { accessCode } = req.body;
        
        const validCode = process.env.ACCESS_CODE || '1228601';
        
        if (accessCode === validCode) {
            res.status(200).json({ 
                success: true, 
                message: 'Access code validated successfully' 
            });
        } else {
            res.status(401).json({ 
                success: false, 
                message: 'Invalid access code' 
            });
        }
    } catch (error) {
        console.error('Error validating code:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// POST: Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Ibi ukorera demo, uramutse ufite database ukoresha pool
        if (email === 'admin@travolium.com' && password === 'admin123') {
            res.status(200).json({
                success: true,
                message: 'Login successful',
                user: { email, role: 'admin' }
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

module.exports = router;
