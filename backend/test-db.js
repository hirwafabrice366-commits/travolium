const pool = require('./config/database');

async function testConnection() {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS result');
        console.log('✅ Database test successful:', rows);
    } catch (error) {
        console.error('❌ Database test failed:', error.message);
    }
}

testConnection();