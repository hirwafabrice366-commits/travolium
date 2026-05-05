// Validate access code before registration
router.post('/validate-code', async (req, res) => {
    const { code } = req.body;
    
    try {
        const result = await pool.query(
            'SELECT * FROM access_codes WHERE code = $1 AND is_active = TRUE',
            [code]
        );
        
        if (result.rows.length > 0) {
            res.json({ valid: true, message: 'Code is valid' });
        } else {
            res.status(400).json({ valid: false, message: 'Invalid access code' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});